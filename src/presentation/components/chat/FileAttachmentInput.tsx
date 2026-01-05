import { useRef, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { Paperclip, X, Image, FileAudio, FileText, Link2 } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { URLInputDialog, type URLAttachment } from '@/presentation/components/chat/URLInputDialog'

/**
 * @fileoverview File attachment input for chat messages
 * @module presentation/components/chat/FileAttachmentInput
 *
 * E2-4: File Attachment UI
 * - File picker with type detection
 * - Image thumbnail previews
 * - File size validation (25MB default)
 * - Mobile touch targets ≥44x44px
 */

export interface FileAttachment {
  id: string
  file: File
  type: 'image' | 'audio' | 'pdf' | 'other'
  preview?: string
  size: string
}

export type Attachment = FileAttachment | URLAttachment

export interface FileAttachmentInputProps {
  attachments: Attachment[]
  onAdd: (attachment: Attachment) => void
  onRemove: (id: string) => void
  maxFileSize?: number // Default: 25MB
  disabled?: boolean
  className?: string
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Detect file type from MIME type
 */
function getFileType(file: File): FileAttachment['type'] {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type === 'application/pdf') return 'pdf'
  return 'other'
}

/**
 * Get icon component for file type
 */
function getFileIcon(type: FileAttachment['type'], className?: string) {
  switch (type) {
    case 'image':
      return <Image className={className} />
    case 'audio':
      return <FileAudio className={className} />
    case 'pdf':
      return <FileText className={className} />
    default:
      return <FileText className={className} />
  }
}

/**
 * FileAttachmentInput - File picker with preview functionality
 */
export function FileAttachmentInput({
  attachments,
  onAdd,
  onRemove,
  maxFileSize = 25 * 1024 * 1024,
  disabled = false,
  className,
}: FileAttachmentInputProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isURLDialogOpen, setIsURLDialogOpen] = useState(false)

  // Open file picker dialog
  const handleFilePickerClick = useCallback(() => {
    if (disabled) return
    fileInputRef.current?.click()
  }, [disabled])

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Size validation
    if (file.size > maxFileSize) {
      toast.error(t('attachment.tooLarge', 'File too large (max 25MB)'))
      // Reset input so same file can be selected again
      e.target.value = ''
      return
    }

    // Type detection
    const type = getFileType(file)

    // Generate preview for images
    let preview: string | undefined
    if (type === 'image') {
      try {
        preview = URL.createObjectURL(file)
      } catch {
        // Fallback if object URL creation fails
        preview = undefined
      }
    }

    // Create attachment object
    const attachment: FileAttachment = {
      id: crypto.randomUUID(),
      file,
      type,
      preview,
      size: formatFileSize(file.size),
    }

    onAdd(attachment)

    // Reset input for next selection
    e.target.value = ''
  }, [maxFileSize, onAdd, t])

  // Remove attachment
  const handleRemove = useCallback((id: string) => {
    // Revoke object URL to free memory
    const attachment = attachments.find(a => a.id === id)
    if (attachment && 'preview' in attachment && attachment.preview) {
      URL.revokeObjectURL(attachment.preview)
    }
    onRemove(id)
  }, [attachments, onRemove])

  // Handle URL attachment add
  const handleAddURL = useCallback((urlAttachment: URLAttachment) => {
    onAdd(urlAttachment)
  }, [onAdd])

  return (
    <div className={cn("flex gap-2 flex-wrap items-center", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,.pdf"
        className="hidden"
        onChange={handleFileSelect}
        aria-label={t('attachment.add', 'Attach file')}
      />

      {/* File attachment button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleFilePickerClick}
        disabled={disabled}
        className={cn(
          "shrink-0",
          // Mobile: Touch targets ≥44x44px
          "h-9 w-9 min-h-[36px] min-w-[36px] md:h-9 md:w-9",
          // Larger on mobile
          "sm:h-11 sm:w-11 sm:min-h-[44px] sm:min-w-[44px]"
        )}
        aria-label={t('attachment.add', 'Attach file')}
        title={t('attachment.add', 'Attach file')}
      >
        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {/* URL attachment button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsURLDialogOpen(true)}
        disabled={disabled}
        className={cn(
          "shrink-0",
          // Mobile: Touch targets ≥44x44px
          "h-9 w-9 min-h-[36px] min-w-[36px] md:h-9 md:w-9",
          // Larger on mobile
          "sm:h-11 sm:w-11 sm:min-h-[44px] sm:min-w-[44px]"
        )}
        aria-label={t('url.add', 'Add link')}
        title={t('url.add', 'Add link')}
      >
        <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {/* Attachment previews */}
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.id}
          attachment={attachment}
          onRemove={() => handleRemove(attachment.id)}
        />
      ))}

      {/* URL Input Dialog */}
      <URLInputDialog
        isOpen={isURLDialogOpen}
        onClose={() => setIsURLDialogOpen(false)}
        onAdd={handleAddURL}
      />
    </div>
  )
}

/**
 * AttachmentPreview - Individual attachment preview with remove button
 */
interface AttachmentPreviewProps {
  attachment: Attachment
  onRemove: () => void
}

function AttachmentPreview({ attachment, onRemove }: AttachmentPreviewProps) {
  const { t } = useTranslation()

  // Handle URL attachments
  if (attachment.type === 'url') {
    const { metadata } = attachment
    return (
      <button
        type="button"
        onClick={() => window.open(metadata.url, '_blank', 'noopener,noreferrer')}
        className="flex gap-2 bg-secondary/50 rounded-none border border-border p-2 max-w-[300px] hover:bg-secondary/70 transition-colors"
      >
        {metadata.image ? (
          <img
            src={metadata.image}
            alt=""
            className="w-12 h-12 rounded-sm object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs text-muted-foreground">{metadata.domain}</p>
          <p className="text-sm font-medium truncate" title={metadata.title}>
            {metadata.title || metadata.url}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="shrink-0 h-6 w-6"
          aria-label={t('attachment.remove', 'Remove attachment')}
        >
          <X className="w-3 h-3" />
        </Button>
      </button>
    )
  }

  // Handle file attachments
  return (
    <div className="flex items-center gap-2 bg-secondary/50 rounded-none border border-border px-2 py-1 max-w-[200px]">
      {/* Preview thumbnail or icon */}
      <div className="shrink-0 w-8 h-8 bg-background rounded-sm flex items-center justify-center overflow-hidden">
        {attachment.type === 'image' && attachment.preview ? (
          <img
            src={attachment.preview}
            alt={attachment.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground">
            {getFileIcon(attachment.type, "w-4 h-4")}
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" title={attachment.file.name}>
          {attachment.file.name}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {attachment.size}
        </p>
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className={cn(
          "shrink-0 h-6 w-6",
          // Mobile touch targets
          "sm:h-7 sm:w-7 min-h-[28px] min-w-[28px]"
        )}
        aria-label={t('attachment.remove', 'Remove attachment')}
      >
        <X className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
    </div>
  )
}
