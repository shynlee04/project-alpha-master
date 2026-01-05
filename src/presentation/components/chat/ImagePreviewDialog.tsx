import { useState, useCallback, useEffect } from 'react'
import { X, Info } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Dialog, DialogContent } from '@/presentation/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/**
 * @fileoverview Image preview dialog for chat attachments
 * @module presentation/components/chat/ImagePreviewDialog
 *
 * E2-7: Image Processing
 * - Full-size image preview
 * - Alt text input for accessibility
 * - File info display (name, size, dimensions)
 * - Mobile full-screen support
 */

export interface ImagePreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fileName: string
  fileSize: string
  width?: number
  height?: number
  altText?: string
  onAltTextChange?: (text: string) => void
  readOnly?: boolean
}

/**
 * ImagePreviewDialog - Full-size image preview with alt text input
 */
export function ImagePreviewDialog({
  isOpen,
  onClose,
  imageUrl,
  fileName,
  fileSize,
  width,
  height,
  altText = '',
  onAltTextChange,
  readOnly = false
}: ImagePreviewDialogProps) {
  const { t } = useTranslation()
  const [localAltText, setLocalAltText] = useState(altText)

  // Sync local state with prop
  useEffect(() => {
    setLocalAltText(altText)
  }, [altText])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Handle alt text save
  const handleAltTextBlur = useCallback(() => {
    if (onAltTextChange && localAltText !== altText) {
      onAltTextChange(localAltText)
    }
  }, [localAltText, altText, onAltTextChange])

  // Format dimensions display
  const dimensionsDisplay = width && height
    ? `${width} × ${height} px`
    : undefined

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-4xl w-full p-0 gap-0",
          // Mobile: full-screen
          "sm:max-w-4xl sm:rounded-lg",
          // Remove default padding
          "!p-0"
        )}
        onClick={handleBackdropClick}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-2 right-2 z-10",
            "bg-black/50 hover:bg-black/70 text-white rounded-full",
            "p-1.5 transition-colors",
            // Mobile touch target
            "min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
          )}
          aria-label={t('image.closePreview', 'Close preview')}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Image container */}
        <div className="relative bg-black flex items-center justify-center min-h-[200px] max-h-[70vh] overflow-hidden">
          <img
            src={imageUrl}
            alt={localAltText || fileName}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Info bar */}
        <div className="p-4 bg-secondary/30 border-t border-border">
          <div className="flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" title={fileName}>
                {fileName}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                <span>{fileSize}</span>
                {dimensionsDisplay && <span>{dimensionsDisplay}</span>}
              </div>
            </div>
          </div>

          {/* Alt text input (if not read-only) */}
          {!readOnly && onAltTextChange && (
            <div className="mt-3">
              <label
                htmlFor="image-alt-text"
                className="block text-xs font-medium text-muted-foreground mb-1.5"
              >
                {t('image.altText', 'Description (optional)')}
              </label>
              <input
                id="image-alt-text"
                type="text"
                value={localAltText}
                onChange={(e) => setLocalAltText(e.target.value)}
                onBlur={handleAltTextBlur}
                placeholder={t('image.altTextPlaceholder', 'Describe this image...')}
                className={cn(
                  "w-full px-3 py-2 bg-background border border-border",
                  "rounded-none text-sm focus:outline-none focus:border-primary",
                  "placeholder:text-muted-foreground"
                )}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * ImagePreviewDialogWithState - Wrapper with internal state management
 *
 * Use this when you don't need parent-controlled alt text
 */
export interface ImagePreviewWithStateProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fileName: string
  fileSize: string
  width?: number
  height?: number
  initialAltText?: string
  onAltTextChange?: (text: string) => void
}

export function ImagePreviewDialogWithState({
  isOpen,
  onClose,
  imageUrl,
  fileName,
  fileSize,
  width,
  height,
  initialAltText = '',
  onAltTextChange
}: ImagePreviewWithStateProps) {
  const [altText, setAltText] = useState(initialAltText)

  const handleAltTextChange = useCallback((text: string) => {
    setAltText(text)
    onAltTextChange?.(text)
  }, [onAltTextChange])

  return (
    <ImagePreviewDialog
      isOpen={isOpen}
      onClose={onClose}
      imageUrl={imageUrl}
      fileName={fileName}
      fileSize={fileSize}
      width={width}
      height={height}
      altText={altText}
      onAltTextChange={handleAltTextChange}
    />
  )
}
