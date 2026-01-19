/**
 * Loading Spinner Component (8-bit Pixel Art Style)
 * @module components/ui/LoadingSpinner
 *
 * 8-bit gaming aesthetic loading spinner with pixel art animation.
 * Provides retro-style loading feedback with accessibility support.
 *
 * @epic S-020 - Loading States and Progress Indicators
 * @constitution P0 - User Feedback & Accessibility
 */

import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Spinner size variants
 */
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Props for LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: SpinnerSize
  /** Custom message to display */
  message?: string
  /** Full screen overlay mode */
  fullScreen?: boolean
  /** Show pixel art animation */
  pixelArt?: boolean
  /** Additional CSS classes */
  className?: string
  /** ARIA label for accessibility */
  ariaLabel?: string
}

/**
 * CVA variants for loading spinner
 */
const spinnerVariants = cva(
  // Base styles
  'flex flex-col items-center justify-center gap-4',
  {
    variants: {
      size: {
        sm: 'gap-2',
        md: 'gap-3',
        lg: 'gap-4',
        xl: 'gap-6',
      },
    },
  }
)

/**
 * Size classes for spinner container
 */
const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

/**
 * Pixel block size classes
 */
const pixelSizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
}

/**
 * Text size classes
 */
const textSizeClasses: Record<SpinnerSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

/**
 * 8-bit Pixel Art Loading Spinner Component
 *
 * Displays a retro pixel art loading animation with optional message.
 * Fully accessible with ARIA labels and screen reader support.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" message="Loading workspace..." />
 *
 * <LoadingSpinner
 *   size="md"
 *   fullScreen
 *   message="Processing files..."
 *   pixelArt
 * />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false,
  pixelArt = true,
  className,
  ariaLabel,
}: LoadingSpinnerProps) {
  const { t } = useTranslation()

  const defaultAriaLabel = ariaLabel || message || t('loading.message', 'Loading')
  const displayMessage = message || t('loading.message', 'Loading...')

  // Pixel art grid with animated blocks
  const PixelSpinner = () => (
    <div className={cn('relative', sizeClasses[size])} aria-hidden="true">
      {/* Outer pixel frame */}
      <div className="absolute inset-0 grid grid-cols-3 gap-px opacity-30">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-primary-500',
              pixelSizeClasses[size]
            )}
          />
        ))}
      </div>

      {/* Animated center pixels - rotating pattern */}
      <div className="absolute inset-1 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Top-left pixel */}
          <div
            className={cn(
              'absolute top-0 left-0 bg-primary-400 animate-pulse',
              pixelSizeClasses[size]
            )}
            style={{ animationDelay: '0ms' }}
          />
          {/* Top-right pixel */}
          <div
            className={cn(
              'absolute top-0 right-0 bg-primary-500 animate-pulse',
              pixelSizeClasses[size]
            )}
            style={{ animationDelay: '150ms' }}
          />
          {/* Bottom-left pixel */}
          <div
            className={cn(
              'absolute bottom-0 left-0 bg-primary-500 animate-pulse',
              pixelSizeClasses[size]
            )}
            style={{ animationDelay: '300ms' }}
          />
          {/* Bottom-right pixel */}
          <div
            className={cn(
              'absolute bottom-0 right-0 bg-primary-400 animate-pulse',
              pixelSizeClasses[size]
            )}
            style={{ animationDelay: '450ms' }}
          />
          {/* Center pixel */}
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-300 animate-pulse',
              pixelSizeClasses[size]
            )}
            style={{ animationDelay: '225ms' }}
          />
        </div>
      </div>
    </div>
  )

  // Classic circular spinner (fallback)
  const ClassicSpinner = () => (
    <div
      className={cn(
        'relative',
        sizeClasses[size],
        'border-4 border-neutral-700 border-t-primary-500 rounded-none animate-spin'
      )}
      aria-hidden="true"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 70%, 70% 100%, 0 100%)'
      }}
    />
  )

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={defaultAriaLabel}
      className={cn(
        spinnerVariants({ size }),
        fullScreen && 'fixed inset-0 z-50 bg-neutral-950 border-b border-border',
        className
      )}
    >
      {/* Spinner */}
      {pixelArt ? <PixelSpinner /> : <ClassicSpinner />}

      {/* Message */}
      {displayMessage && (
        <p className={cn('text-neutral-300 font-medium', textSizeClasses[size])}>
          {displayMessage}
        </p>
      )}

      {/* Screen reader only text */}
      <p className="sr-only">{defaultAriaLabel}</p>
    </div>
  )

  return content
}

/**
 * Inline Loading Spinner variant
 * For use in tight spaces like buttons, inline text, etc.
 */
export interface LoadingSpinnerInlineProps {
  /** Spinner size */
  size?: Extract<SpinnerSize, 'sm' | 'md'>
  /** ARIA label */
  ariaLabel?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Inline loading spinner without message
 */
export function LoadingSpinnerInline({
  size = 'sm',
  ariaLabel,
  className,
}: LoadingSpinnerInlineProps) {
  const { t } = useTranslation()
  const defaultAriaLabel = ariaLabel || t('loading.message', 'Loading')

  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={defaultAriaLabel}
      className={cn('inline-flex items-center', className)}
    >
      {/* Simplified pixel spinner */}
      <span
        className={cn(
          'relative inline-block animate-spin',
          sizeClasses[size]
        )}
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(45deg, transparent 25%, rgb(168 85 247) 25%, rgb(168 85 247) 50%, transparent 50%),
            linear-gradient(-45deg, transparent 25%, rgb(168 85 247) 25%, rgb(168 85 247) 50%, transparent 50%)
          `,
          backgroundSize: '4px 4px',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        }}
      />
      <span className="sr-only">{defaultAriaLabel}</span>
    </span>
  )
}

export type LoadingSpinnerVariants = VariantProps<typeof spinnerVariants>
