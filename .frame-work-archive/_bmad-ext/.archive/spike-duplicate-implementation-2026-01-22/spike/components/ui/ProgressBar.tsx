/**
 * Progress Bar Component (8-bit Style with Cancel)
 * @module components/ui/ProgressBar
 *
 * Enhanced progress bar with percentage display, cancel button, and 8-bit aesthetic.
 * Provides detailed progress feedback for long-running operations.
 *
 * @epic S-020 - Loading States and Progress Indicators
 * @constitution P0 - User Feedback & Accessibility
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { X, Clock } from 'lucide-react'
import { cn } from '@/spike/lib/utils'
import { Button } from './button'

/**
 * Progress bar size variants
 */
export type ProgressSize = 'sm' | 'md' | 'lg'

/**
 * Props for ProgressBar component
 */
export interface ProgressBarProps {
  /** Current progress percentage (0-100) */
  value: number
  /** Total progress percentage (for determinate progress) */
  max?: number
  /** Size variant */
  size?: ProgressSize
  /** Show percentage text */
  showPercentage?: boolean
  /** Show estimated time remaining */
  showEstimatedTime?: boolean
  /** Estimated seconds remaining */
  estimatedSeconds?: number
  /** Show cancel button */
  showCancel?: boolean
  /** Callback when cancel is clicked */
  onCancel?: () => void
  /** Status message */
  message?: string
  /** Additional CSS classes */
  className?: string
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** Indeterminate mode (show animated loading bar) */
  indeterminate?: boolean
}

/**
 * CVA variants for progress bar container
 */
const progressContainerVariants = cva(
  // Base styles
  'flex flex-col gap-2',
  {
    variants: {
      size: {
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
      },
    },
  }
)

/**
 * Height classes for progress bar track
 */
const heightClasses: Record<ProgressSize, string> = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

/**
 * Text size classes
 */
const textSizeClasses: Record<ProgressSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

/**
 * Format time remaining as human-readable string
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

/**
 * Progress Bar Component
 *
 * Displays an 8-bit styled progress bar with optional cancel button,
 * percentage display, and estimated time remaining.
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   value={65}
 *   message="Uploading files..."
 *   showPercentage
 *   showCancel
 *   onCancel={handleCancel}
 * />
 *
 * <ProgressBar
 *   value={30}
 *   size="lg"
 *   showPercentage
 *   showEstimatedTime
 *   estimatedSeconds={45}
 *   message="Processing workspace..."
 * />
 * ```
 */
export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showPercentage = true,
  showEstimatedTime = false,
  estimatedSeconds,
  showCancel = false,
  onCancel,
  message,
  className,
  ariaLabel,
  indeterminate = false,
}: ProgressBarProps) {
  const { t } = useTranslation()
  const [isHovering, setIsHovering] = useState(false)

  // Clamp value between 0 and max
  const clampedValue = Math.max(0, Math.min(max, value))
  const percentage = Math.round((clampedValue / max) * 100)

  const defaultAriaLabel = ariaLabel || message || t('loading.progress', 'Progress')

  return (
    <div
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={defaultAriaLabel}
      aria-busy="true"
      className={cn(progressContainerVariants({ size }), className)}
    >
      {/* Header: Message and actions */}
      {(message || showCancel || showPercentage) && (
        <div className="flex items-center justify-between gap-2">
          {/* Message */}
          {message && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className={cn('text-neutral-300 font-medium truncate', textSizeClasses[size])}>
                {message}
              </p>
            </div>
          )}

          {/* Right side: Percentage, time, cancel */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Estimated time */}
            {showEstimatedTime && estimatedSeconds !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1.5 text-neutral-400',
                  textSizeClasses[size]
                )}
                aria-label={t('loading.timeRemaining', 'Time remaining')}
              >
                <Clock className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
                <span className="tabular-nums">{formatTimeRemaining(estimatedSeconds)}</span>
              </div>
            )}

            {/* Percentage */}
            {showPercentage && !indeterminate && (
              <span
                className={cn(
                  'text-primary-400 font-bold tabular-nums',
                  textSizeClasses[size]
                )}
                aria-label={`${percentage}% ${t('loading.complete', 'complete')}`}
              >
                {percentage}%
              </span>
            )}

            {/* Cancel button */}
            {showCancel && onCancel && (
              <Button
                variant="ghost"
                size={size === 'sm' ? 'sm' : 'md'}
                onClick={onCancel}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={cn(
                  'gap-1.5 text-neutral-400 hover:text-destructive hover:bg-destructive/10',
                  'rounded-none border-l-2 border-transparent',
                  isHovering && 'border-destructive/30'
                )}
                aria-label={t('loading.cancel', 'Cancel')}
              >
                <X className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
                <span className="hidden sm:inline">{t('loading.cancel', 'Cancel')}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress bar track */}
      <div
        className={cn(
          'relative w-full bg-neutral-800 overflow-hidden',
          'border border-neutral-700',
          heightClasses[size]
        )}
      >
        {/* 8-bit styled fill */}
        <div
          className={cn(
            'h-full bg-gradient-to-r from-primary-600 to-primary-500',
            'transition-all duration-300 ease-out',
            'border-r-2 border-primary-400',
            // Pixelated edge effect
            'shadow-[0_0_8px_rgba(168,85,247,0.5)]',
            indeterminate && 'animate-pulse w-1/3'
          )}
          style={
            indeterminate
              ? undefined
              : {
                  width: `${percentage}%`,
                  // 8-bit pixel edge using clip-path
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                }
          }
          aria-hidden="true"
        >
          {/* Pixelated overlay for 8-bit effect */}
          {!indeterminate && percentage > 0 && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.3) 50%),
                  linear-gradient(transparent 50%, rgba(0,0,0,0.3) 50%)
                `,
                backgroundSize: '4px 4px',
              }}
            />
          )}
        </div>
      </div>

      {/* Screen reader only text */}
      <p className="sr-only">
        {defaultAriaLabel}: {indeterminate ? t('loading.inProgress', 'In progress') : `${percentage}%`}
      </p>
    </div>
  )
}

/**
 * Compact inline progress bar variant
 * For use in tight spaces without cancel button
 */
export interface ProgressBarInlineProps {
  /** Current progress percentage (0-100) */
  value: number
  /** Maximum value */
  max?: number
  /** Size variant */
  size?: Extract<ProgressSize, 'sm' | 'md'>
  /** Show percentage */
  showPercentage?: boolean
  /** Additional CSS classes */
  className?: string
  /** ARIA label */
  ariaLabel?: string
}

/**
 * Inline progress bar without message or cancel
 */
export function ProgressBarInline({
  value,
  max = 100,
  size = 'sm',
  showPercentage = true,
  className,
  ariaLabel,
}: ProgressBarInlineProps) {
  const { t } = useTranslation()
  const clampedValue = Math.max(0, Math.min(max, value))
  const percentage = Math.round((clampedValue / max) * 100)

  const defaultAriaLabel = ariaLabel || t('loading.progress', 'Progress')

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={defaultAriaLabel}
      className={cn('flex items-center gap-2', className)}
    >
      {/* Compact bar */}
      <div className={cn('flex-1 bg-neutral-800 overflow-hidden', heightClasses[size])}>
        <div
          className={cn(
            'h-full bg-primary-500 transition-all duration-300',
            'border-r border-primary-400'
          )}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Percentage */}
      {showPercentage && (
        <span
          className={cn(
            'text-primary-400 font-bold tabular-nums text-xs flex-shrink-0'
          )}
        >
          {percentage}%
        </span>
      )}

      <p className="sr-only">{defaultAriaLabel}: {percentage}%</p>
    </div>
  )
}

export type ProgressBarVariants = VariantProps<typeof progressContainerVariants>
