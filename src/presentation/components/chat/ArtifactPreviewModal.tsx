/**
 * @fileoverview Artifact Preview Modal
 * @module presentation/components/chat/ArtifactPreviewModal
 * @governance CHAT-009
 *
 * Improved artifact rendering system for chat messages.
 * CHAT-009: Better UX for code/artifact preview and save.
 *
 * Features:
 * - Modal preview instead of new tab (preserves context)
 * - Syntax-highlighted code display
 * - HTML/SVG live preview in iframe
 * - One-click download (no prompt dialog)
 * - Artifact metadata display (type, size, lines)
 * - Keyboard shortcuts (Esc to close, Ctrl+S to save)
 * - 8-bit pixel aesthetic
 */

import { memo, useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  FileCode,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

/**
 * Artifact types supported for preview
 */
export type ArtifactType = 'html' | 'svg' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown' | 'text'

/**
 * Props for ArtifactPreviewModal component
 */
export interface ArtifactPreviewModalProps {
  /** Whether modal is open */
  open: boolean
  /** Called to close modal */
  onClose: () => void
  /** Artifact code/content */
  code: string
  /** Language/type of artifact */
  language: string
  /** Optional: file name suggestion */
  fileName?: string
  /** Optional: save callback (if not provided, uses download) */
  onSave?: (code: string, language: string) => void
}

/**
 * Get artifact type from language string
 */
function getArtifactType(language: string): ArtifactType {
  const normalized = language.toLowerCase()
  const typeMap: Record<string, ArtifactType> = {
    html: 'html',
    svg: 'svg',
    css: 'css',
    javascript: 'javascript',
    js: 'javascript',
    typescript: 'typescript',
    ts: 'typescript',
    tsx: 'typescript',
    jsx: 'javascript',
    json: 'json',
    markdown: 'markdown',
    md: 'markdown',
  }
  return typeMap[normalized] || 'text'
}

/**
 * Get file extension for language
 */
function getFileExtension(language: string): string {
  const extMap: Record<string, string> = {
    html: '.html',
    svg: '.svg',
    css: '.css',
    javascript: '.js',
    typescript: '.ts',
    json: '.json',
    markdown: '.md',
  }
  return extMap[language.toLowerCase()] || '.txt'
}

/**
 * Calculate artifact metrics
 */
function calculateArtifactMetrics(code: string) {
  const lines = code.split('\n').length
  const chars = code.length
  const sizeKB = (new Blob([code]).size / 1024).toFixed(1)
  return { lines, chars, sizeKB }
}

/**
 * Simple line tokenizer for preview (same as CodeBlock)
 */
function tokenizeLine(line: string): React.ReactNode {
  const keywords = [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'import', 'export', 'from', 'default', 'async', 'await', 'class', 'extends',
    'interface', 'type', 'enum', 'public', 'private', 'protected', 'static',
    'new', 'this', 'super', 'try', 'catch', 'finally', 'throw',
  ]

  const parts: React.ReactNode[] = []
  let remaining = line
  let index = 0

  while (remaining.length > 0) {
    const stringMatch = remaining.match(/^(['"`])(?:(?!\1)[^\\]|\\.)*\1/)
    if (stringMatch) {
      parts.push(<span key={index++} className="text-green-400">{stringMatch[0]}</span>)
      remaining = remaining.slice(stringMatch[0].length)
      continue
    }

    const commentMatch = remaining.match(/^\/\/.*$/) || remaining.match(/^\/\*[\s\S]*?\*\//)
    if (commentMatch) {
      parts.push(<span key={index++} className="text-gray-500 italic">{commentMatch[0]}</span>)
      remaining = remaining.slice(commentMatch[0].length)
      continue
    }

    const numberMatch = remaining.match(/^\b\d+(\.\d+)?\b/)
    if (numberMatch) {
      parts.push(<span key={index++} className="text-orange-400">{numberMatch[0]}</span>)
      remaining = remaining.slice(numberMatch[0].length)
      continue
    }

    const wordMatch = remaining.match(/^\b[a-zA-Z_][a-zA-Z0-9_]*\b/)
    if (wordMatch) {
      const word = wordMatch[0]
      if (keywords.includes(word)) {
        parts.push(<span key={index++} className="text-purple-400 font-semibold">{word}</span>)
      } else if (word[0] === word[0].toUpperCase() && /^[A-Z]/.test(word)) {
        parts.push(<span key={index++} className="text-yellow-400">{word}</span>)
      } else {
        parts.push(<span key={index++}>{word}</span>)
      }
      remaining = remaining.slice(word.length)
      continue
    }

    const opMatch = remaining.match(/^[=<>!+\-*/%&|^~?:;,.()\[\]{}]+/)
    if (opMatch) {
      parts.push(<span key={index++} className="text-gray-400">{opMatch[0]}</span>)
      remaining = remaining.slice(opMatch[0].length)
      continue
    }

    const wsMatch = remaining.match(/^\s+/)
    if (wsMatch) {
      parts.push(<span key={index++}>{wsMatch[0]}</span>)
      remaining = remaining.slice(wsMatch[0].length)
      continue
    }

    parts.push(<span key={index++}>{remaining[0]}</span>)
    remaining = remaining.slice(1)
  }

  return <>{parts}</>
}

/**
 * ArtifactPreviewModal - Modal for previewing and saving code artifacts
 *
 * @example
 * ```tsx
 * <ArtifactPreviewModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   code={artifactCode}
 *   language="html"
 *   fileName="index.html"
 *   onSave={handleSave}
 * />
 * ```
 */
export const ArtifactPreviewModal = memo(function ArtifactPreviewModal({
  open,
  onClose,
  code,
  language,
  fileName,
  onSave,
}: ArtifactPreviewModalProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const metrics = calculateArtifactMetrics(code)
  const artifactType = getArtifactType(language)

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleDownload()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Reset iframe when code changes
  useEffect(() => {
    if (open && iframeRef.current && (artifactType === 'html' || artifactType === 'svg')) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(code)
        doc.close()
      }
    }
  }, [open, code, artifactType])

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success(t('chat.codeBlock.copied', 'Copied!'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('chat.codeBlock.copyFailed', 'Failed to copy'))
    }
  }, [code, t])

  // Handle download/save
  const handleDownload = useCallback(() => {
    const extension = getFileExtension(language)
    const defaultFileName = fileName || `artifact-${Date.now()}${extension}`
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = defaultFileName
    link.click()

    URL.revokeObjectURL(url)
    onSave?.(code, language)
    toast.success(t('chat.artifact.downloaded', 'Artifact downloaded'))
  }, [code, language, fileName, onSave, t])

  // Handle open in new tab (for live preview)
  const handleOpenInTab = useCallback(() => {
    const blob = new Blob([code], { type: artifactType === 'html' ? 'text/html' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    toast.info(t('chat.artifact.openedInTab', 'Opened in new tab'))
  }, [code, artifactType, t])

  if (!open) return null

  const canPreviewLive = artifactType === 'html' || artifactType === 'svg'

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/70', // 8-bit: solid background, no blur
        'p-4'
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'relative bg-background border-2 border-border rounded-none',
          'shadow-[8px_8px_0_0_rgba(0,0,0,0.3)]',
          'flex flex-col max-h-[90vh] w-full max-w-4xl',
          'transition-all duration-200',
          isFullscreen ? 'h-full max-h-full max-w-full' : 'h-[80vh]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b-2 border-border">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-mono font-semibold text-sm">
                {fileName || `artifact${getFileExtension(language)}`}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                <span className="uppercase">{language}</span>
                <span>•</span>
                <span>{metrics.lines} lines</span>
                <span>•</span>
                <span>{metrics.sizeKB} KB</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'p-2 rounded-none transition-all',
                'hover:bg-primary/20 active:translate-y-[1px]',
                copied ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'
              )}
              title={t('chat.codeBlock.copy', 'Copy')}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              className={cn(
                'p-2 rounded-none transition-all',
                'hover:bg-primary/20 active:translate-y-[1px]',
                'text-muted-foreground hover:text-foreground'
              )}
              title={`${t('chat.artifact.save', 'Save')} (Ctrl+S)`}
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Open in new tab (for HTML/SVG) */}
            {canPreviewLive && (
              <button
                type="button"
                onClick={handleOpenInTab}
                className={cn(
                  'p-2 rounded-none transition-all',
                  'hover:bg-primary/20 active:translate-y-[1px]',
                  'text-muted-foreground hover:text-foreground'
                )}
                title={t('chat.artifact.openInTab', 'Open in new tab')}
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={cn(
                'p-2 rounded-none transition-all',
                'hover:bg-primary/20 active:translate-y-[1px]',
                'text-muted-foreground hover:text-foreground'
              )}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'p-2 rounded-none transition-all',
                'hover:bg-red-500/20 active:translate-y-[1px]',
                'text-muted-foreground hover:text-red-500'
              )}
              title={`${t('common.close', 'Close')} (Esc)`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {canPreviewLive ? (
            <div className="flex h-full">
              {/* Code view */}
              <div className="flex-1 border-r border-border">
                <div className="px-3 py-1.5 bg-muted/30 border-b border-border text-[10px] font-mono text-muted-foreground uppercase">
                  Source Code
                </div>
                <pre className="p-4 text-sm font-mono leading-relaxed overflow-auto h-full bg-background">
                  <code className="block">
                    {code.split('\n').map((line, idx) => (
                      <div key={idx} className="flex">
                        <span className="select-none text-muted-foreground/40 w-10 text-right pr-4 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="flex-1">{tokenizeLine(line)}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>

              {/* Live preview */}
              <div className="flex-1 flex flex-col">
                <div className="px-3 py-1.5 bg-muted/30 border-b border-border text-[10px] font-mono text-muted-foreground uppercase">
                  Live Preview
                </div>
                <div className="flex-1 bg-white">
                  <iframe
                    ref={iframeRef}
                    title="Artifact Preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Code-only view */
            <pre className="p-4 text-sm font-mono leading-relaxed overflow-auto h-full bg-background">
              <code className="block">
                {code.split('\n').map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="select-none text-muted-foreground/40 w-10 text-right pr-4 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{tokenizeLine(line)}</span>
                  </div>
                ))}
              </code>
            </pre>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 bg-muted/30 border-t border-border text-[10px] text-muted-foreground font-mono">
          Press <kbd className="px-1 bg-background border border-border rounded">Esc</kbd> to close •
          <kbd className="px-1 bg-background border border-border rounded ml-1">Ctrl+S</kbd> to download
        </div>
      </div>
    </div>
  )
})

export default ArtifactPreviewModal
