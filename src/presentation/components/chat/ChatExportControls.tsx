/**
 * @fileoverview Chat Export Controls Component
 * @module presentation/components/chat/ChatExportControls
 *
 * CHAT-010: Save Chat to Project
 *
 * Provides buttons for exporting chat conversations:
 * - Export to Markdown (.md file download)
 * - Export to JSON (.json file download)
 * - Copy to clipboard
 *
 * Features:
 * - 8-bit pixel aesthetic
 * - Keyboard accessible
 * - Loading states
 * - Toast notifications
 */

import { memo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Download, FileText, Database, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Props for ChatExportControls component
 */
export interface ChatExportControlsProps {
  /** Number of messages available for export */
  messageCount: number
  /** Export to markdown callback */
  onExportMarkdown: () => void
  /** Export to JSON callback */
  onExportJSON: () => void
  /** Copy to clipboard callback */
  onCopy: () => void
  /** Whether an export operation is in progress */
  isExporting?: boolean
  /** Additional CSS classes */
  className?: string
  /** Variant: 'dropdown' | 'inline' */
  variant?: 'dropdown' | 'inline'
}

/**
 * Individual export button component
 */
interface ExportButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled: boolean
  ariaLabel: string
  variant?: 'ghost'
}

const ExportButton = memo(function ExportButton({
  icon,
  label,
  onClick,
  disabled,
  ariaLabel,
}: ExportButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    onClick()
    // Show "copied" state for clipboard button
    if (label === 'Copy') {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'rounded-none transition-all px-2 py-1',
        'hover:bg-primary/20 active:translate-y-[1px]',
        'focus:outline-none focus:ring-1 focus:ring-primary',
        'text-muted-foreground hover:text-foreground disabled:opacity-50',
        copied && 'text-green-500'
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="flex items-center gap-1.5">
        {copied ? <Check className="w-3.5 h-3.5" /> : icon}
        <span className="text-xs font-mono">{copied ? 'Copied!' : label}</span>
      </span>
    </button>
  )
})

/**
 * ChatExportControls - Export buttons for chat conversations
 *
 * Inline variant:
 * ┌─────────────────────────────────────────────────────┐
 * │ [📄 Markdown] [🗋 JSON] [📋 Copy]                 │
 * └─────────────────────────────────────────────────────┘
 *
 * Dropdown variant (for use in menus):
 * ┌─────────────────────────────────────────────────────┐
 * │ Export Chat                              ▼         │
 * └─────────────────────────────────────────────────────┘
 */
export const ChatExportControls = memo(function ChatExportControls({
  messageCount,
  onExportMarkdown,
  onExportJSON,
  onCopy,
  isExporting = false,
  className,
  variant = 'inline',
}: ChatExportControlsProps) {
  const { t } = useTranslation()

  // Disable all exports if no messages
  const disabled = messageCount === 0 || isExporting

  // Inline variant - show all buttons
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1',
          'bg-muted/30 border border-border rounded-none',
          className
        )}
      >
        <span className="text-[10px] font-mono text-muted-foreground mr-2">
          {messageCount} {messageCount === 1 ? 'message' : 'messages'}
        </span>

        <ExportButton
          icon={<FileText className="w-3.5 h-3.5" />}
          label="MD"
          onClick={onExportMarkdown}
          disabled={disabled}
          ariaLabel={t('chat.export.markdown', 'Export as Markdown')}
        />

        <ExportButton
          icon={<Database className="w-3.5 h-3.5" />}
          label="JSON"
          onClick={onExportJSON}
          disabled={disabled}
          ariaLabel={t('chat.export.json', 'Export as JSON')}
        />

        <ExportButton
          icon={<Copy className="w-3.5 h-3.5" />}
          label="Copy"
          onClick={onCopy}
          disabled={disabled}
          ariaLabel={t('chat.export.copy', 'Copy to clipboard')}
        />
      </div>
    )
  }

  // Dropdown variant - show as menu (not fully implemented)
  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'rounded-none transition-all px-2 py-1',
          'hover:bg-primary/20',
          'text-muted-foreground hover:text-foreground disabled:opacity-50',
          'text-xs font-mono'
        )}
        aria-label={t('chat.export.menu', 'Export chat')}
      >
        <Download className="w-3.5 h-3.5 mr-1" />
        {t('chat.export.title', 'Export')}
      </button>

      {/* Dropdown menu would go here - for now use inline */}
      {/* TODO: Add proper dropdown with Radix UI or similar */}
    </div>
  )
})

export default ChatExportControls
