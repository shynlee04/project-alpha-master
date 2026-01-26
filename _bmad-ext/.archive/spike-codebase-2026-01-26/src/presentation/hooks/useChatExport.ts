/**
 * @fileoverview Chat Export Hook
 * @module presentation/hooks/useChatExport
 *
 * CHAT-010: Save Chat to Project
 *
 * Provides functionality to export chat conversations in various formats:
 * - Markdown (.md)
 * - JSON (.json)
 * - Plain text (clipboard)
 *
 * Features:
 * - Configurable export formats
 * - Timestamp-based file naming
 * - Workspace-aware naming
 * - Clipboard support with fallback
 */

import { useCallback } from 'react'
import { toast } from 'sonner'

/**
 * Chat message structure matching EnhancedChatInterface.ChatMessage
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  toolExecutions?: ToolExecution[]
}

export interface ToolExecution {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  input?: string
  output?: string
  duration?: number
}

/**
 * Export format options
 */
export type ChatExportFormat = 'markdown' | 'json'

/**
 * Options for chat export
 */
export interface ChatExportOptions {
  /** Workspace name for file naming */
  workspaceName?: string
  /** Include tool execution details */
  includeToolExecutions?: boolean
  /** Custom filename (without extension) */
  filename?: string
}

/**
 * Format chat messages as Markdown
 */
function formatChatAsMarkdown(
  messages: ChatMessage[],
  options: ChatExportOptions
): string {
  const lines: string[] = []

  // Header
  lines.push(`# Chat Export`)
  if (options.workspaceName) {
    lines.push(`**Workspace:** ${options.workspaceName}`)
  }
  lines.push(`**Date:** ${new Date().toLocaleString()}`)
  lines.push(`**Messages:** ${messages.length}`)
  lines.push('')

  // Messages
  messages.forEach((msg) => {
    const roleLabel = msg.role === 'user' ? 'User' : 'Assistant'
    const timeStr = new Date(msg.timestamp).toLocaleTimeString()

    lines.push(`## ${roleLabel} (${timeStr})`)
    lines.push('')
    lines.push(msg.content)
    lines.push('')

    // Tool executions if present and enabled
    if (options.includeToolExecutions && msg.toolExecutions && msg.toolExecutions.length > 0) {
      lines.push('**Tools Used:**')
      msg.toolExecutions.forEach((tool) => {
        lines.push(`- \`${tool.name}\` (${tool.status})`)
        if (tool.input) {
          lines.push(`  - Input: \`${tool.input}\``)
        }
        if (tool.duration) {
          lines.push(`  - Duration: ${tool.duration}ms`)
        }
      })
      lines.push('')
    }
  })

  return lines.join('\n')
}

/**
 * Format chat messages as JSON
 */
function formatChatAsJSON(
  messages: ChatMessage[],
  options: ChatExportOptions
): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    workspace: options.workspaceName || 'unknown',
    messageCount: messages.length,
    messages: messages.map((msg) => {
      const base: any = {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      }

      if (options.includeToolExecutions && msg.toolExecutions) {
        base.toolExecutions = msg.toolExecutions
      }

      return base
    }),
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Format chat messages as plain text (for clipboard)
 */
function formatChatAsPlainText(
  messages: ChatMessage[],
  options: ChatExportOptions
): string {
  const lines: string[] = []

  if (options.workspaceName) {
    lines.push(`Chat Export - ${options.workspaceName}`)
    lines.push(`Date: ${new Date().toLocaleString()}`)
    lines.push('')
  }

  messages.forEach((msg) => {
    const roleLabel = msg.role === 'user' ? 'User' : 'Assistant'
    const timeStr = new Date(msg.timestamp).toLocaleTimeString()

    lines.push(`[${timeStr}] ${roleLabel}:`)
    lines.push(msg.content)
    lines.push('')
  })

  return lines.join('\n')
}

/**
 * Generate filename for export
 */
function generateFilename(
  format: ChatExportFormat,
  options: ChatExportOptions
): string {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19) // YYYY-MM-DDTHH-mm-ss

  const base = options.filename || options.workspaceName || 'chat'
  const ext = format === 'markdown' ? 'md' : 'json'

  return `${base}-${timestamp}.${ext}`
}

/**
 * Download content as file
 */
function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * useChatExport Hook
 *
 * @example
 * ```tsx
 * const { exportToMarkdown, exportToJSON, copyToClipboard } = useChatExport({
 *   messages,
 *   workspaceName: 'my-project'
 * })
 *
 * <button onClick={exportToMarkdown}>Export as Markdown</button>
 * <button onClick={exportToJSON}>Export as JSON</button>
 * <button onClick={copyToClipboard}>Copy All</button>
 * ```
 */
export interface UseChatExportOptions {
  /** Messages to export */
  messages: ChatMessage[]
  /** Workspace name for file naming */
  workspaceName?: string
  /** Callback when export completes */
  onExported?: (format: ChatExportFormat, filename: string) => void
  /** Callback when copy completes */
  onCopied?: () => void
}

export function useChatExport({
  messages,
  workspaceName,
  onExported,
  onCopied,
}: UseChatExportOptions) {
  /**
   * Export chat as Markdown file
   */
  const exportToMarkdown = useCallback(() => {
    if (messages.length === 0) {
      toast.error('No messages to export')
      return
    }

    try {
      const content = formatChatAsMarkdown(messages, {
        workspaceName,
        includeToolExecutions: true,
      })
      const filename = generateFilename('markdown', { workspaceName })

      downloadFile(content, filename)
      onExported?.('markdown', filename)
      toast.success(`Exported as ${filename}`)
    } catch (error) {
      toast.error('Failed to export markdown')
      console.error('Export error:', error)
    }
  }, [messages, workspaceName, onExported])

  /**
   * Export chat as JSON file
   */
  const exportToJSON = useCallback(() => {
    if (messages.length === 0) {
      toast.error('No messages to export')
      return
    }

    try {
      const content = formatChatAsJSON(messages, {
        workspaceName,
        includeToolExecutions: true,
      })
      const filename = generateFilename('json', { workspaceName })

      downloadFile(content, filename)
      onExported?.('json', filename)
      toast.success(`Exported as ${filename}`)
    } catch (error) {
      toast.error('Failed to export JSON')
      console.error('Export error:', error)
    }
  }, [messages, workspaceName, onExported])

  /**
   * Copy chat to clipboard
   */
  const copyToClipboard = useCallback(async () => {
    if (messages.length === 0) {
      toast.error('No messages to copy')
      return
    }

    const content = formatChatAsPlainText(messages, { workspaceName })

    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content)
        onCopied?.()
        toast.success('Chat copied to clipboard')
        return
      }

      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = content
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        if (successful) {
          onCopied?.()
          toast.success('Chat copied to clipboard')
        } else {
          throw new Error('execCommand failed')
        }
      } finally {
        document.body.removeChild(textArea)
      }
    } catch (error) {
      toast.error('Failed to copy to clipboard')
      console.error('Copy error:', error)
    }
  }, [messages, workspaceName, onCopied])

  /**
   * Export in specified format
   */
  const exportChat = useCallback(
    (format: ChatExportFormat) => {
      if (format === 'markdown') {
        return exportToMarkdown()
      }
      return exportToJSON()
    },
    [exportToMarkdown, exportToJSON]
  )

  return {
    exportToMarkdown,
    exportToJSON,
    exportChat,
    copyToClipboard,
    canExport: messages.length > 0,
  }
}

export default useChatExport
