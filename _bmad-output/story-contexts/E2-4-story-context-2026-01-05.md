# Story E2-4: File Attachment UI

**Document ID**: `cwac-story-e2-4-2026-01-05`
**Epic**: E2 (Multimodal Input System)
**Story**: E2-4
**Status**: `IN_PROGRESS`
**Points**: 8
**Created**: 2026-01-05T23:00:00Z

---

## Overview

Create file picker for chat attachments, supporting images, audio, PDF, and URLs with preview functionality.

---

## User Story

**As** a user interacting with the AI agent
**I want** to attach files to my messages
**So that** I can get help analyzing documents, images, and other media

---

## Acceptance Criteria

1. **File Picker Button**
   - Paperclip icon button in chat input area
   - Opens file picker dialog on click
   - Accessible (keyboard navigation, ARIA labels)
   - Touch targets ≥44x44px on mobile

2. **File Type Support**
   - Images: JPEG, PNG, WebP, GIF
   - Audio: MP3, WAV, OGG, M4A
   - Documents: PDF
   - URL input option

3. **File Preview**
   - Thumbnail preview for images
   - File icon + name for documents
   - Audio waveform visual for audio files
   - File size display

4. **Attachment Management**
   - Remove attachment button
   - Multiple files support
   - File size limit (25MB per file)

5. **TypeScript & Quality**
   - Zero TypeScript errors
   - i18n complete (EN + VI)
   - Component ≤300 lines

---

## Technical Implementation

### FileAttachmentInput Component

```typescript
interface FileAttachment {
  id: string;
  file: File;
  type: 'image' | 'audio' | 'pdf' | 'other';
  preview?: string;
  size: string;
}

interface FileAttachmentInputProps {
  attachments: FileAttachment[];
  onAdd: (file: FileAttachment) => void;
  onRemove: (id: string) => void;
  maxFileSize?: number; // Default: 25MB
  disabled?: boolean;
}

export function FileAttachmentInput({
  attachments,
  onAdd,
  onRemove,
  maxFileSize = 25 * 1024 * 1024,
  disabled = false,
}: FileAttachmentInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size validation
    if (file.size > maxFileSize) {
      toast.error(t('attachment.tooLarge', 'File too large'));
      return;
    }

    // Type detection
    const type = getFileType(file);
    const preview = type === 'image' ? URL.createObjectURL(file) : undefined;

    onAdd({
      id: crypto.randomUUID(),
      file,
      type,
      preview,
      size: formatFileSize(file.size),
    });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,.pdf"
        className="hidden"
        onChange={handleFileSelect}
      />
      {/* Attachment previews and add button */}
    </div>
  );
}
```

### File Type Detection

```typescript
function getFileType(file: File): FileAttachment['type'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'pdf';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

---

## Files to Create

1. **`src/presentation/components/chat/FileAttachmentInput.tsx`** (~200 lines)
   - File picker component
   - Attachment preview rendering
   - Size validation

---

## Files to Modify

1. **`src/presentation/components/ide/EnhancedChatInterface.tsx`**
   - Replace placeholder handleAttachmentClick
   - Integrate FileAttachmentInput component
   - Add attachment state management

2. **`src/i18n/en.json` & `src/i18n/vi.json`**
   - Add attachment.* namespace

---

## i18n Strings

```json
{
  "attachment": {
    "add": "Attach file",
    "remove": "Remove",
    "tooLarge": "File too large (max 25MB)",
    "unsupported": "Unsupported file type",
    "image": "Image",
    "audio": "Audio",
    "pdf": "PDF document",
    "file": "File"
  }
}
```

---

## Dependencies

- ✅ E2-1: Voice Input Foundation (DONE) - shares input area
- None: No blocking dependencies for file attachments

---

## Test Strategy

### Functional Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| FA-001 | Open file picker | Click attachment button | File dialog opens |
| FA-002 | Select image | Choose JPEG file | Thumbnail preview shown |
| FA-003 | Select PDF | Choose PDF file | File icon + name shown |
| FA-004 | Select audio | Choose MP3 file | Audio waveform preview |
| FA-005 | Size validation | Select file >25MB | Error toast shown |
| FA-006 | Remove attachment | Click remove button | Attachment removed |
| FA-007 | Mobile touch | Test on mobile | Touch target 44x44px |

---

## Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| File picker success rate | 100% | TBD |
| Supported file types | 4 (image, audio, pdf, url) | TBD |
| Mobile compatibility | 100% | TBD |

---

**Version**: 1.0.0
**Last Updated**: 2026-01-05T23:00:00Z
