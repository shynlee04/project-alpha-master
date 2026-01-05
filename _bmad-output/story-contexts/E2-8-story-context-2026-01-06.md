# Story Context: E2-8 - Gemini Multimodal Integration
# Document ID: e2-8-story-context-2026-01-06
# Created: 2026-01-06T01:15:00Z
# Status: IN_PROGRESS

## Story Overview

**Epic**: E2 - Multimodal Input System
**Story ID**: E2-8
**Title**: Gemini Multimodal Integration
**Points**: 5
**Owner**: @bmad-bmm-dev
**Priority**: P1

## Description

Integrate image attachments with the Gemini AI API for multimodal chat. When users attach images to chat messages, the images should be converted to base64 and sent to the AI for analysis. The AI response should include image analysis and insights.

## User Story

As a user sharing images in chat, I want:
- Images I attach to be sent to the AI for analysis
- The AI to understand and describe my images
- Support for multiple images in a single message
- Visual confirmation that images were sent with the message

## Acceptance Criteria

1. **Image to Base64 Conversion**
   - File attachments converted to base64 before sending
   - MIME type preserved (image/jpeg, image/png, image/webp)
   - Base64 extraction handles both data URL and raw base64

2. **Multimodal Message Building**
   - Use existing `buildMultimodalMessage` from message-builder.ts
   - Text + images combined in single message
   - CoreMessage format with content array (text + image parts)

3. **Chat Integration**
   - Modify message submission to include attachments
   - Pass attachments through onSendMessage callback
   - Update useAgentChatWithTools to handle multimodal messages

4. **Image Display in Chat**
   - Sent images display in message history
   - Thumbnail preview in user message bubble
   - Full-size preview on click

5. **TypeScript & Quality**
   - TypeScript compiles without errors
   - i18n strings externalized (EN + VI)
   - Memory cleanup (revoke object URLs after sending)

## Technical Implementation

### Image to Base64 Conversion

```typescript
// src/lib/media/image-attachments.ts

export interface ImageAttachmentData {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  filename: string;
}

/**
 * Convert File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get raw base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert FileAttachment to ImageAttachmentData
 */
export async function attachmentToImageData(
  attachment: FileAttachment
): Promise<ImageAttachmentData> {
  const base64 = await fileToBase64(attachment.file);

  // Determine MIME type from file
  let mimeType: ImageAttachmentData['mimeType'] = 'image/jpeg';
  if (attachment.file.type === 'image/png') mimeType = 'image/png';
  else if (attachment.file.type === 'image/webp') mimeType = 'image/webp';
  else if (attachment.file.type === 'image/gif') mimeType = 'image/gif';

  return {
    base64,
    mimeType,
    filename: attachment.file.name
  };
}
```

### Message Submission with Attachments

```typescript
// src/presentation/components/ide/EnhancedChatInterface.tsx

// Update handleSubmit to include attachments
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  if (input.trim() || attachments.length > 0) {
    // Convert image attachments to base64
    const imageData = attachments
      .filter(a => a.type === 'image')
      .map(a => attachmentToImageData(a as FileAttachment));

    onSendMessage(input.trim(), imageData)
    setInput('')

    // Clear attachments
    attachments.forEach(a => {
      if ('preview' in a && a.preview) {
        URL.revokeObjectURL(a.preview)
      }
    })
    setAttachments([])
  }
}
```

### Multimodal Message Types

```typescript
// src/lib/agent/hooks/use-agent-chat-with-tools.ts

import { buildMultimodalMessage, type ImageContent } from '../multimodal/message-builder';

export interface UseAgentChatWithToolsOptions {
  // ... existing options
  /** Support multimodal messages (images) */
  enableMultimodal?: boolean;
}

export interface UseAgentChatWithToolsReturn {
  // ... existing returns
  /** Send message with optional images */
  sendMessage: (content: string, images?: ImageContent[]) => void;
}
```

## Dependencies

- **E2-4**: File Attachment UI (must be complete)
- **E2-7**: Image Processing (must be complete)

## Files to Create

1. `src/lib/media/image-attachments.ts` (~100 lines)
   - fileToBase64 conversion
   - attachmentToImageData converter
   - ImageAttachmentData type

## Files to Modify

1. `src/presentation/components/ide/EnhancedChatInterface.tsx`
   - Include attachments in message submission
   - Convert images to base64 before sending

2. `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
   - Add images parameter to sendMessage
   - Use buildMultimodalMessage for image content

3. `src/i18n/en/chat.json`
   - Add multimodal.* namespace (~5 keys)

4. `src/i18n/vi/chat.json`
   - Add multimodal.* namespace (~5 keys)

## Test Strategy

### Manual Tests

1. **Image Conversion Test**
   - Attach image and send message
   - Verify image converted to base64
   - Verify MIME type preserved

2. **Multimodal Message Test**
   - Send text + image
   - Verify AI receives image
   - Verify AI response includes image analysis

3. **Multiple Images Test**
   - Attach multiple images
   - Verify all images sent to AI
   - Verify response covers all images

4. **Display Test**
   - Verify sent images display in chat history
   - Verify thumbnail preview
   - Verify full-size preview works

## Validation Checklist

- [ ] TypeScript compiles without errors
- [ ] Images convert to base64 correctly
- [ ] Multimodal messages build correctly
- [ ] AI receives images in messages
- [ ] i18n complete (EN + VI, 5 multimodal.* keys)
- [ ] Memory cleanup (URL.revokeObjectURL)

## Success Metrics

- Image conversion: 100% success rate for supported formats
- Multimodal messages: Text + images sent together
- AI image analysis: Responses include image description
- Message history: Images display in sent messages
