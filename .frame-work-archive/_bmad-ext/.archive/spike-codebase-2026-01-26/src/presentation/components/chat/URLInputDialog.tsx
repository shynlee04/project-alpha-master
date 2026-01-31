import { useState, useCallback } from 'react'
import { Link2, X, Globe } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { fetchURLMetadata, isValidURL, type URLMetadata } from '@/lib/metadata/fetch-url-metadata'

/**
 * @fileoverview URL input dialog for chat attachments
 * @module presentation/components/chat/URLInputDialog
 *
 * E2-6: URL Fetching and Preview
 * - URL input and validation
 * - Metadata fetching with Open Graph parsing
 * - Preview card with title, description, image
 * - Error handling for CORS and timeouts
 */

export interface URLAttachment {
  id: string
  type: 'url'
  metadata: URLMetadata
}

export interface URLInputDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (attachment: URLAttachment) => void
}

/**
 * URLPreviewCard - Display preview of attached URL
 */
interface URLPreviewCardProps {
  metadata: URLMetadata
  onRemove: () => void
}

function URLPreviewCard({ metadata, onRemove }: URLPreviewCardProps) {
  const { t } = useTranslation()

  const handleClick = () => {
    window.open(metadata.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex gap-3 bg-secondary/50 rounded-none border border-border p-3 max-w-[350px] w-full text-left hover:bg-secondary/70 transition-colors"
    >
      {metadata.image ? (
        <img
          src={metadata.image}
          alt=""
          className="w-16 h-16 rounded-sm object-cover shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-sm bg-muted flex items-center justify-center shrink-0">
          <Globe className="w-6 h-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{metadata.domain}</p>
        <p className="text-sm font-medium truncate" title={metadata.title}>
          {metadata.title || metadata.url}
        </p>
        {metadata.description && (
          <p
            className="text-xs text-muted-foreground line-clamp-2"
            title={metadata.description}
          >
            {metadata.description}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={t('attachment.remove', 'Remove')}
      >
        <X className="w-3 h-3" />
      </Button>
    </button>
  )
}

/**
 * URLInputDialog - Dialog for adding URL attachments
 */
export function URLInputDialog({ isOpen, onClose, onAdd }: URLInputDialogProps) {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [metadata, setMetadata] = useState<URLMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setUrl('')
    setIsLoading(false)
    setMetadata(null)
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return

    if (!isValidURL(url)) {
      setError(t('url.invalid', 'Invalid URL'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchURLMetadata(url)
      setMetadata(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (message.includes('abort') || message.includes('timeout')) {
        setError(t('url.timeout', 'Request timed out'))
      } else {
        setError(t('url.fetchError', 'Could not fetch link info'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [url, t])

  const handleAdd = () => {
    if (!metadata) return

    onAdd({
      id: crypto.randomUUID(),
      type: 'url',
      metadata,
    })

    reset()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault()
      if (metadata) {
        handleAdd()
      } else {
        handleFetch()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {t('url.add', 'Add link')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('url.pasteUrl', 'Paste URL...')}
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleFetch}
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? t('url.fetching', 'Fetching...') : t('common.fetch', 'Fetch')}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Preview */}
          {metadata && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('url.preview', 'Preview')}:</p>
              <URLPreviewCard
                metadata={metadata}
                onRemove={() => setMetadata(null)}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!metadata}
          >
            {t('common.add', 'Add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
