/**
 * Streaming Indicator Component (8-bit Style)
 * @module components/ui/StreamingIndicator
 *
 * Real-time streaming feedback for AI response generation.
 * Shows animated dots with token count and elapsed time.
 *
 * @epic S-020 - Loading States and Progress Indicators
 * @constitution P0 - User Feedback & Accessibility
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/spike/lib/utils'

/**
 * Streaming indicator size variants
 */
export type StreamingSize = 'sm' | 'md' | 'lg'

/**
 * Props for StreamingIndicator component
 */
export interface StreamingIndicatorProps {
  /** Current token count */
  tokenCount?: number
  /** Streaming start timestamp */
  startTime?: number
  /** Size variant */
  size?: StreamingSize
  /** Show token count */
  showTokenCount?: boolean
  /** Show elapsed time */
  showElapsedTime?: boolean
  /** Custom message */
  message?: string
  /** Additional CSS classes */
  className?: string
  /** ARIA label */
  ariaLabel?: string
}

/**
 * CVA variants for streaming indicator
 */
const streamingVariants = cva(
  // Base styles
  'flex items-center gap-2',
  {
    variants: {
      size: {
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-3',
      },
    },
  }
)

/**
 * Format milliseconds as human-readable time
 */
function formatElapsedTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

/**
 * Streaming Indicator Component
 *
 * Displays animated pixel dots to show active AI streaming.
 * Optionally shows token count and elapsed time.
 *
 * @example
 * ```tsx
 * <StreamingIndicator
 *   tokenCount={150}
 *   startTime={Date.now()}
 *   showTokenCount
 *   showElapsedTime
 * />
 *
 * <StreamingIndicator
 *   size="sm"
 *   message="Thinking..."
 * />
 * ```
 */
export function StreamingIndicator({
  tokenCount = 0,
  startTime,
  size = 'md',
  showTokenCount = true,
  showElapsedTime = true,
  message,
  className,
  ariaLabel,
}: StreamingIndicatorProps) {
  const { t } = useTranslation()
  const [elapsed, setElapsed] = useState(0)

  // Update elapsed time every 100ms
  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 100)

    return () => clearInterval(interval)
  }, [startTime])

  const defaultAriaLabel = ariaLabel || message || t('loading.streaming', 'AI is streaming response')

  // Size classes for dots
  const dotSizeClasses: Record<StreamingSize, string> = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }

  // Text size classes
  const textSizeClasses: Record<StreamingSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={defaultAriaLabel}
      className={cn(streamingVariants({ size }), className)}
    >
      {/* 8-bit animated dots */}
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-primary-500 rounded-none animate-bounce',
              dotSizeClasses[size]
            )}
            style={{
              animationDuration: '600ms',
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </span>

      {/* Message */}
      {message && (
        <span className={cn('text-neutral-300', textSizeClasses[size])}>
          {message}
        </span>
      )}

      {/* Token count */}
      {showTokenCount && tokenCount > 0 && (
        <span
          className={cn(
            'text-neutral-400 tabular-nums',
            textSizeClasses[size]
          )}
          aria-label={t('loading.tokens', '{count} tokens', { count: tokenCount })}
        >
          {tokenCount} {t('loading.tokens', 'tokens')}
        </span>
      )}

      {/* Elapsed time */}
      {showElapsedTime && startTime && elapsed > 0 && (
        <span
          className={cn(
            'text-neutral-500 tabular-nums',
            textSizeClasses[size]
          )}
          aria-label={t('loading.elapsedTime', 'Elapsed time: {time}', {
            time: formatElapsedTime(elapsed)
          })}
        >
          {formatElapsedTime(elapsed)}
        </span>
      )}

      {/* Screen reader only text */}
      <p className="sr-only">
        {defaultAriaLabel}
        {showTokenCount && tokenCount > 0 && ` - ${tokenCount} ${t('loading.tokens', 'tokens')}`}
        {showElapsedTime && startTime && ` - ${t('loading.elapsedTime', 'Time')}: ${formatElapsedTime(elapsed)}`}
      </p>
    </div>
  )
}

/**
 * Inline Streaming Indicator variant
 * For use in tight spaces like chat bubbles, inline text, etc.
 */
export interface StreamingIndicatorInlineProps {
  /** Additional CSS classes */
  className?: string
  /** ARIA label */
  ariaLabel?: string
}

/**
 * Inline streaming indicator without text
 */
export function StreamingIndicatorInline({
  className,
  ariaLabel,
}: StreamingIndicatorInlineProps) {
  const { t } = useTranslation()
  const defaultAriaLabel = ariaLabel || t('loading.streaming', 'Streaming')

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={defaultAriaLabel}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {/* Animated dots */}
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 bg-primary-500 rounded-sm animate-pulse"
            style={{
              animationDuration: '800ms',
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </span>

      <span className="sr-only">{defaultAriaLabel}</span>
    </span>
  )
}

/**
 * Token Counter Component
 * Displays real-time token count during streaming
 */
export interface TokenCounterProps {
  /** Current token count */
  tokenCount: number
  /** Size variant */
  size?: StreamingSize
  /** Show label */
  showLabel?: boolean
  /** Additional CSS classes */
  className?: string
}

export function TokenCounter({
  tokenCount,
  size = 'md',
  showLabel = true,
  className,
}: TokenCounterProps) {
  const { t } = useTranslation()

  const textSizeClasses: Record<StreamingSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-neutral-400',
        textSizeClasses[size],
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Pixel icon */}
      <svg
        className={cn(size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="3" height="3" />
        <rect x="5" y="1" width="3" height="3" />
        <rect x="9" y="1" width="3" height="3" />
        <rect x="13" y="1" width="3" height="3" />
        <rect x="1" y="5" width="3" height="3" />
        <rect x="5" y="5" width="3" height="3" opacity="0.5" />
        <rect x="9" y="5" width="3" height="3" opacity="0.3" />
        <rect x="13" y="5" width="3" height="3" opacity="0.2" />
      </svg>

      {/* Token count */}
      <span className="tabular-nums font-medium text-primary-400">{tokenCount}</span>

      {/* Label */}
      {showLabel && (
        <span className="text-neutral-500">
          {t('loading.tokens', 'tokens')}
        </span>
      )}
    </div>
  )
}

export type StreamingIndicatorVariants = VariantProps<typeof streamingVariants>
