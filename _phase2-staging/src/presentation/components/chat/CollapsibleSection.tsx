/**
 * @fileoverview Collapsible Section Component
 * @module presentation/components/chat/CollapsibleSection
 * @governance CHAT-007
 *
 * Unified collapsible section for long content in chat messages.
 * CHAT-007: Provides consistent collapse behavior across:
 * - Mermaid diagrams
 * - Long text sections
 * - Multi-part responses
 * - Tool execution groups
 *
 * Features:
 * - Configurable collapse threshold
 * - Smooth height transitions
 * - Keyboard accessible (Enter/Space to toggle)
 * - 8-bit pixel aesthetic
 * - Optional "Collapse All" at message level
 */

import { memo, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Minus, Maximize2 } from 'lucide-react'

/**
 * Collapse behavior configuration
 */
export type CollapseThreshold = 'always' | 'never' | 'auto' | number

/**
 * Props for CollapsibleSection component
 */
export interface CollapsibleSectionProps {
  /** Content to display */
  children: React.ReactNode
  /** Section title/label (shown in header) */
  title?: string
  /** Icon to display in header */
  icon?: React.ReactNode
  /** When to collapse: 'always' | 'never' | 'auto' | pixel height threshold */
  collapseThreshold?: CollapseThreshold
  /** Initial collapsed state (overrides threshold) */
  defaultCollapsed?: boolean
  /** Optional controlled collapsed state */
  collapsed?: boolean
  /** Called when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Additional CSS classes */
  className?: string
  /** Show frame/border around section */
  framed?: boolean
  /** Variant: 'default' | 'compact' | 'minimal' */
  variant?: 'default' | 'compact' | 'minimal'
  /** Enable keyboard toggle (Enter/Space) */
  keyboardToggle?: boolean
}

/**
 * Measure content height to determine if auto-collapse should apply
 */
function useContentHeight(
  contentRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean
): number {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!enabled || !contentRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height)
      }
    })

    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [enabled, contentRef])

  return height
}

/**
 * CollapsibleSection - Unified collapsible container
 *
 * @example
 * ```tsx
 * // Auto-collapse for tall content
 * <CollapsibleSection title="Diagram" collapseThreshold={300}>
 *   <MermaidDiagram code={diagramCode} />
 * </CollapsibleSection>
 *
 * // Always collapsed initially
 * <CollapsibleSection title="Details" collapseThreshold="always">
 *   {longContent}
 * </CollapsibleSection>
 * ```
 */
export const CollapsibleSection = memo(function CollapsibleSection({
  children,
  title,
  icon,
  collapseThreshold = 'auto',
  defaultCollapsed,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  className,
  framed = true,
  variant = 'default',
  keyboardToggle = true,
}: CollapsibleSectionProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed ?? false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Determine if controlled or uncontrolled
  const isControlled = controlledCollapsed !== undefined
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed

  // Measure content for auto-collapse
  const contentHeight = useContentHeight(
    contentRef,
    collapseThreshold === 'auto'
  )

  // Auto-collapse threshold (default: 250px)
  const autoThreshold = typeof collapseThreshold === 'number'
    ? collapseThreshold
    : 250

  // Determine if should be collapsed based on threshold
  const shouldAutoCollapse = collapseThreshold === 'always' ||
    (collapseThreshold === 'auto' && contentHeight > autoThreshold)

  // Update internal state when auto-collapse triggers
  useEffect(() => {
    if (!isControlled && defaultCollapsed === undefined && shouldAutoCollapse) {
      setInternalCollapsed(true)
    }
  }, [shouldAutoCollapse, isControlled, defaultCollapsed])

  const handleToggle = () => {
    const newState = !isCollapsed
    if (!isControlled) {
      setInternalCollapsed(newState)
    }
    onCollapsedChange?.(newState)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!keyboardToggle) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  // Minimal variant - just content with inline toggle
  if (variant === 'minimal') {
    return (
      <div className={cn('relative', className)}>
        <div
          ref={contentRef}
          className={cn(
            'transition-all duration-200 overflow-hidden',
            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
          )}
        >
          {children}
        </div>
        {/* Inline toggle button */}
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex items-center gap-1 text-xs text-muted-foreground',
            'hover:text-foreground transition-colors',
            'mt-1 focus:outline-none focus:underline'
          )}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <>
              <ChevronDown className="w-3 h-3" />
              Show
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3" />
              Hide
            </>
          )}
        </button>
      </div>
    )
  }

  // Compact variant - header bar without frame
  if (variant === 'compact') {
    return (
      <div className={cn('w-full', className)}>
        {/* Header bar */}
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex items-center gap-2 w-full px-2 py-1',
            'text-xs font-mono text-muted-foreground',
            'hover:text-foreground hover:bg-muted/30',
            'transition-colors rounded-none',
            'focus:outline-none focus:ring-1 focus:ring-primary',
            keyboardToggle && 'cursor-pointer'
          )}
          aria-label={isCollapsed ? `Expand ${title || 'section'}` : `Collapse ${title || 'section'}`}
          aria-expanded={!isCollapsed}
          tabIndex={keyboardToggle ? 0 : -1}
        >
          {icon && <span className="shrink-0">{icon}</span>}
          {title && <span className="truncate">{title}</span>}
          <span className="ml-auto shrink-0">
            {isCollapsed ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </span>
        </button>

        {/* Collapsible content */}
        <div
          ref={contentRef}
          className={cn(
            'transition-all duration-200 overflow-hidden',
            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
          )}
          aria-hidden={isCollapsed}
        >
          {children}
        </div>
      </div>
    )
  }

  // Default variant - framed with full header
  return (
    <div
      className={cn(
        'rounded-none overflow-hidden',
        framed && 'border border-border bg-secondary/30',
        className
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2',
          'bg-muted/50 border-b border-border',
          'text-xs font-mono font-semibold text-muted-foreground',
          'hover:text-foreground hover:bg-muted/70',
          'transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary',
          keyboardToggle && 'cursor-pointer'
        )}
        aria-label={isCollapsed ? `Expand ${title || 'section'}` : `Collapse ${title || 'section'}`}
        aria-expanded={!isCollapsed}
        tabIndex={keyboardToggle ? 0 : -1}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {title && (
          <span className="uppercase tracking-wide truncate">{title}</span>
        )}
        <span className="ml-auto flex items-center gap-1 shrink-0">
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          'transition-all duration-200 overflow-hidden',
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
        )}
        aria-hidden={isCollapsed}
      >
        {children}
      </div>
    </div>
  )
})

/**
 * Message-level collapse controls
 *
 * Provides "Expand All" / "Collapse All" buttons for messages
 * with multiple collapsible sections.
 */
export interface MessageCollapseControlsProps {
  /** Number of collapsible sections in the message */
  sectionCount: number
  /** Callback to expand all sections */
  onExpandAll: () => void
  /** Callback to collapse all sections */
  onCollapseAll: () => void
  /** Currently expanded count (for display) */
  expandedCount?: number
  /** Additional CSS classes */
  className?: string
}

export function MessageCollapseControls({
  sectionCount,
  onExpandAll,
  onCollapseAll,
  expandedCount,
  className,
}: MessageCollapseControlsProps) {
  if (sectionCount <= 1) return null

  const allExpanded = expandedCount === sectionCount
  const allCollapsed = expandedCount === 0

  return (
    <div className={cn(
      'flex items-center gap-1 px-2 py-1',
      'bg-muted/30 border border-border rounded-none',
      'mb-2',
      className
    )}>
      <span className="text-[10px] font-mono text-muted-foreground mr-2">
        {expandedCount ?? '?'}/{sectionCount} sections
      </span>
      <button
        type="button"
        onClick={onCollapseAll}
        disabled={allCollapsed}
        className={cn(
          'flex items-center gap-1 px-2 py-1',
          'text-[10px] font-mono font-semibold',
          'bg-background border border-border',
          'hover:bg-muted disabled:opacity-50',
          'rounded-none transition-colors'
        )}
        title="Collapse all sections"
      >
        <Minus className="w-3 h-3" />
        Collapse
      </button>
      <button
        type="button"
        onClick={onExpandAll}
        disabled={allExpanded}
        className={cn(
          'flex items-center gap-1 px-2 py-1',
          'text-[10px] font-mono font-semibold',
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 disabled:opacity-50',
          'rounded-none transition-colors',
          'shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]'
        )}
        title="Expand all sections"
      >
        <Maximize2 className="w-3 h-3" />
        Expand
      </button>
    </div>
  )
}

export default CollapsibleSection
