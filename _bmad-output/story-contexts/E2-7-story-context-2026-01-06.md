# Story Context: E2-7 - Image Processing
# Document ID: e2-7-story-context-2026-01-06
# Created: 2026-01-06T00:30:00Z
# Status: IN_PROGRESS

## Story Overview

**Epic**: E2 - Multimodal Input System
**Story ID**: E2-7
**Title**: Image Processing
**Points**: 6
**Owner**: @bmad-bmm-dev
**Priority**: P1

## Description

Enhance image attachment functionality with client-side image compression, EXIF data stripping for privacy, and full-size preview dialog. Images over 2MB should be compressed automatically. EXIF data (location, camera info) should be stripped for privacy. Full-size preview dialog allows users to inspect images before sending.

## User Story

As a user sharing images in chat, I want:
- Large images to be compressed automatically (to save bandwidth)
- Privacy-sensitive metadata removed from images
- A full-size preview to verify the image before sending
- Support for common image formats (JPEG, PNG, WebP, GIF)

## Acceptance Criteria

1. **Image Compression**
   - Images > 2MB compressed using Canvas API
   - Target quality: 0.8 (80% JPEG quality)
   - Maximum dimension: 1920px (scale down if larger)
   - Preserve aspect ratio
   - Show compressed size in preview

2. **EXIF Stripping**
   - Remove EXIF data via Canvas re-encoding
   - Strip location metadata (GPS coordinates)
   - Strip camera metadata (device, settings)
   - Strip timestamp metadata
   - Preserve image content (visual data)

3. **Full-Size Preview Dialog**
   - Click attachment thumbnail to open full-size preview
   - Dialog shows image at full resolution
   - Close button (X) in corner
   - Click outside to close
   - Escape key to close
   - Mobile-optimized (full-screen on small screens)

4. **Format Support**
   - JPEG/JPG (compressed, EXIF stripped)
   - PNG (compressed, metadata stripped)
   - WebP (compressed, metadata stripped)
   - GIF (preserved as-is for animation)
   - Reject unsupported formats (SVG, HEIC, etc.)

5. **Alt Text Input** (Optional Enhancement)
   - Input field for image description
   - Helps accessibility
   - Used as alt text for preview

6. **TypeScript & Quality**
   - TypeScript compiles without errors
   - i18n strings externalized (EN + VI)
   - Mobile touch targets ≥44x44px
   - Memory cleanup (revoke object URLs)

## Technical Implementation

### Image Compression Utility

```typescript
// src/lib/media/image-processor.ts

export interface ImageProcessOptions {
  maxWidth?: number // Default: 1920
  maxHeight?: number // Default: 1920
  quality?: number // Default: 0.8 (JPEG/WebP quality)
  stripExif?: boolean // Default: true
}

export interface ImageProcessResult {
  blob: Blob
  url: string
  originalSize: number
  compressedSize: number
  width: number
  height: number
  format: 'jpeg' | 'png' | 'webp' | 'gif'
}

export async function processImage(
  file: File,
  options: ImageProcessOptions = {}
): Promise<ImageProcessResult> {
  // 1. Check if GIF (preserve animation, skip processing)
  // 2. Load image into HTMLImageElement
  // 3. Calculate dimensions (respect max, preserve aspect ratio)
  // 4. Draw to Canvas (strips EXIF)
  // 5. Convert to blob (toDataURL for quality control)
  // 6. Return result with sizes
}
```

### Image Preview Dialog

```typescript
// src/presentation/components/chat/ImagePreviewDialog.tsx

interface ImagePreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fileName: string
  fileSize: string
  altText?: string
  onAltTextChange?: (text: string) => void
}

export function ImagePreviewDialog({
  isOpen,
  onClose,
  imageUrl,
  fileName,
  fileSize,
  altText,
  onAltTextChange
}: ImagePreviewDialogProps) {
  // Dialog with full-size image
  // Alt text input at bottom
  // File info display (name, size)
  // Close button
}
```

### FileAttachmentInput Updates

```typescript
// Changes to src/presentation/components/chat/FileAttachmentInput.tsx

// 1. Add image processing to handleFileSelect
const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Check if image
  if (file.type.startsWith('image/')) {
    // Process image (compress, strip EXIF)
    const processed = await processImage(file, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
      stripExif: true
    })

    // Create attachment with processed blob
    const attachment: FileAttachment = {
      id: crypto.randomUUID(),
      file: new File([processed.blob], file.name, {
        type: `image/${processed.format}`
      }),
      type: 'image',
      preview: processed.url,
      size: formatFileSize(processed.compressedSize)
    }

    onAdd(attachment)
    return
  }

  // Handle other file types (existing code)
  // ...
}

// 2. Add click handler for thumbnail preview
const handlePreviewClick = (attachment: Attachment) => {
  if (attachment.type === 'image' && attachment.preview) {
    setImagePreview(attachment)
  }
}
```

### i18n Keys

```json
// src/i18n/en/chat.json
{
  "image": {
    "preview": "Preview",
    "processing": "Processing...",
    "compressing": "Compressing image...",
    "originalSize": "Original: {{size}}",
    "compressedSize": "Compressed: {{size}}",
    "altText": "Description (optional)",
    "altTextPlaceholder": "Describe this image...",
    "closePreview": "Close preview",
    "unsupportedFormat": "Unsupported image format",
    "gifPreserved": "Animated GIF preserved"
  }
}
```

## Dependencies

- **E2-4**: File Attachment UI (must be complete)
- **None**: No other dependencies

## Files to Create

1. `src/lib/media/image-processor.ts` (~200 lines)
   - Image compression utility
   - EXIF stripping via Canvas
   - Format detection
   - Size formatting

2. `src/presentation/components/chat/ImagePreviewDialog.tsx` (~150 lines)
   - Full-size image preview dialog
   - Alt text input
   - File info display
   - Mobile full-screen support

## Files to Modify

1. `src/presentation/components/chat/FileAttachmentInput.tsx`
   - Import image processor
   - Process images on selection
   - Add preview click handler
   - Show compression status

2. `src/presentation/components/chat/index.ts`
   - Export ImagePreviewDialog

3. `src/i18n/en/chat.json`
   - Add image.* namespace (~10 keys)

4. `src/i18n/vi/chat.json`
   - Add image.* namespace (~10 keys)

## Test Strategy

### Manual Tests

1. **Compression Test**
   - Attach 3MB+ JPEG image
   - Verify compression indicator shows
   - Verify processed image < 2MB
   - Verify visual quality acceptable

2. **EXIF Stripping Test**
   - Attach photo with GPS data
   - Open preview, verify image shows
   - Check browser debugger for stripped EXIF

3. **GIF Preservation Test**
   - Attach animated GIF
   - Verify animation preserved
   - Verify no compression applied

4. **Preview Dialog Test**
   - Click thumbnail, verify dialog opens
   - Verify full-size image displays
   - Test close button
   - Test click-outside to close
   - Test Escape key
   - Test mobile full-screen

5. **Format Support Test**
   - Test JPEG (compressed)
   - Test PNG (compressed)
   - Test WebP (compressed)
   - Test GIF (preserved)
   - Test SVG (reject with error)

## Validation Checklist

- [ ] TypeScript compiles without errors
- [ ] Images > 2MB compressed automatically
- [ ] EXIF data stripped (Canvas re-encoding)
- [ ] Preview dialog opens on thumbnail click
- [ ] Alt text input functional (if implemented)
- [ ] GIF animations preserved
- [ ] Unsupported formats rejected with error
- [ ] i18n complete (EN + VI, 10 image.* keys)
- [ ] Mobile touch targets ≥44x44px
- [ ] Memory cleanup (URL.revokeObjectURL)

## Success Metrics

- Image compression: > 50% size reduction for 5MB+ photos
- EXIF stripping: 100% of GPS/camera metadata removed
- Preview dialog: < 100ms open time
- Format support: JPEG, PNG, WebP, GIF all working
- Mobile: Full-screen preview on devices < 640px

## Notes

- Canvas API re-encoding automatically strips EXIF
- For GIF preservation, check `file.type === 'image/gif'` before processing
- Quality 0.8 provides good balance (visually lossless, ~50% size reduction)
- Maximum dimension 1920px covers most displays (Retina: 2x 960px = 1920px)
- Consider progressive JPEG for future enhancement (better perceived load time)
