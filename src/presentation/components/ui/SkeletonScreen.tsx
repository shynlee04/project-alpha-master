/**
 * Skeleton Screen Component (8-bit Style)
 * @module components/ui/SkeletonScreen
 *
 * Content placeholder screens with 8-bit gaming aesthetic.
 * Provides visual structure during async content loading.
 *
 * @epic S-020 - Loading States and Progress Indicators
 * @constitution P0 - User Feedback & Accessibility
 */

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Skeleton screen variants
 */
export type SkeletonVariant =
  | 'text'
  | 'title'
  | 'paragraph'
  | 'avatar'
  | 'card'
  | 'list'
  | 'chat'
  | 'file'
  | 'table'

/**
 * Props for SkeletonScreen component
 */
export interface SkeletonScreenProps {
  /** Skeleton variant for different content types */
  variant?: SkeletonVariant
  /** Number of items to repeat (for list, chat, table) */
  count?: number
  /** Custom width */
  width?: string | number
  /** Custom height */
  height?: string | number
  /** Enable/disable animation */
  animate?: boolean
  /** Additional CSS classes */
  className?: string
  /** ARIA label for accessibility */
  ariaLabel?: string
}

/**
 * CVA variants for skeleton base
 */
const skeletonVariants = cva(
  // Base styles - 8-bit pixel aesthetic
  'bg-neutral-800 border border-neutral-700',
  {
    variants: {
      animate: {
        true: 'animate-pulse',
        false: '',
      },
    },
  }
)

/**
 * 8-bit pixel pattern overlay
 */
const pixelPattern = (
  <div
    className="absolute inset-0 opacity-10 pointer-events-none"
    style={{
      backgroundImage: `
        linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.3) 50%),
        linear-gradient(transparent 50%, rgba(0,0,0,0.3) 50%)
      `,
      backgroundSize: '4px 4px',
    }}
    aria-hidden="true"
  />
)

/**
 * Text Skeleton Component
 */
function TextSkeleton({ width, className }: { width?: string | number; className?: string }) {
  return (
    <div
      className={cn(skeletonVariants({ animate: true }), 'h-4 rounded-sm', className)}
      style={{ width: typeof width === 'number' ? `${width}%` : width }}
      role="presentation"
      aria-hidden="true"
    >
      {pixelPattern}
    </div>
  )
}

/**
 * Title Skeleton Component
 */
function TitleSkeleton({ width, className }: { width?: string | number; className?: string }) {
  return (
    <div
      className={cn(skeletonVariants({ animate: true }), 'h-7 rounded-sm', className)}
      style={{ width: typeof width === 'number' ? `${width}%` : width }}
      role="presentation"
      aria-hidden="true"
    >
      {pixelPattern}
    </div>
  )
}

/**
 * Avatar Skeleton Component
 */
function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div
      className={cn(
        skeletonVariants({ animate: true }),
        'rounded-sm',
        sizeClasses[size]
      )}
      role="presentation"
      aria-hidden="true"
    >
      {pixelPattern}
    </div>
  )
}

/**
 * Chat Message Skeleton Component
 */
function ChatMessageSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <div className="flex gap-3 mb-4" role="presentation" aria-hidden="true">
      {/* Avatar */}
      <AvatarSkeleton size="sm" />

      {/* Message content */}
      <div className="flex-1 space-y-2">
        <div className={cn(skeletonVariants({ animate }), 'h-4 w-24 rounded-sm')} />
        <div className={cn(skeletonVariants({ animate }), 'h-4 w-full rounded-sm')} />
        <div className={cn(skeletonVariants({ animate }), 'h-4 w-3/4 rounded-sm')} />
      </div>
    </div>
  )
}

/**
 * File Item Skeleton Component
 */
function FileItemSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 border border-neutral-700 rounded-sm',
        'bg-neutral-900/50'
      )}
      role="presentation"
      aria-hidden="true"
    >
      {/* File icon */}
      <div className={cn(skeletonVariants({ animate }), 'w-10 h-10 rounded-sm')} />

      {/* File info */}
      <div className="flex-1 space-y-2">
        <div className={cn(skeletonVariants({ animate }), 'h-4 w-48 rounded-sm')} />
        <div className={cn(skeletonVariants({ animate }), 'h-3 w-32 rounded-sm')} />
      </div>

      {/* Action */}
      <div className={cn(skeletonVariants({ animate }), 'w-8 h-8 rounded-sm')} />
    </div>
  )
}

/**
 * Skeleton Screen Component
 *
 * Displays 8-bit styled skeleton placeholders for different content types.
 * Fully accessible with ARIA labels and screen reader support.
 *
 * @example
 * ```tsx
 * <SkeletonScreen variant="card" count={3} />
 *
 * <SkeletonScreen
 *   variant="chat"
 *   count={5}
 *   ariaLabel="Loading conversation history"
 * />
 * ```
 */
export function SkeletonScreen({
  variant = 'text',
  count = 1,
  width,
  height,
  animate = true,
  className,
  ariaLabel,
}: SkeletonScreenProps) {
  const defaultAriaLabel = ariaLabel || 'Loading content'

  // Text variant
  if (variant === 'text') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={cn('space-y-2', className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <TextSkeleton
            key={i}
            width={i === count - 1 && count > 1 ? '75%' : width}
          />
        ))}
        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  // Title variant
  if (variant === 'title') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={className}
      >
        <TitleSkeleton width={width} />
        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  // Paragraph variant
  if (variant === 'paragraph') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={cn('space-y-2', className)}
      >
        {Array.from({ length: count || 3 }).map((_, i) => (
          <TextSkeleton
            key={i}
            width={i === 2 ? '60%' : undefined}
          />
        ))}
        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  // Avatar variant
  if (variant === 'avatar') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={className}
      >
        <AvatarSkeleton />
        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={cn('space-y-3', className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'p-4 border border-neutral-700 rounded-sm bg-neutral-900/50',
              'space-y-3'
            )}
          >
            {/* Card header */}
            <div className="flex items-center gap-3">
              <AvatarSkeleton size="sm" />
              <div className="flex-1 space-y-2">
                <div className={cn(skeletonVariants({ animate }), 'h-4 w-32 rounded-sm')} />
                <div className={cn(skeletonVariants({ animate }), 'h-3 w-48 rounded-sm')} />
              </div>
            </div>

            {/* Card body */}
            <div className="space-y-2">
              <TextSkeleton />
              <TextSkeleton width="80%" />
            </div>
          </div>
        ))}
        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  // List variant
  if (variant === 'list') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={cn('space-y-3', className)}
      >
        {Array.from({ length: count || 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <AvatarSkeleton size="sm" />
            <div className="flex-1 space-y-2">
              <div className={cn(skeletonVariants({ animate }), 'h-4 w-48 rounded-sm')} />
              <div className={cn(skeletonVariants({ animate }), 'h-3 w-full rounded-sm')} />
            </div>
          </div>
        ))}
        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  // Chat variant
  if (variant === 'chat') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={cn('p-4', className)}
      >
        {Array.from({ length: count || 3 }).map((_, i) => (
          <ChatMessageSkeleton key={i} animate={animate} />
        ))}
        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  // File variant
  if (variant === 'file') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={cn('space-y-2', className)}
      >
        {Array.from({ length: count || 3 }).map((_, i) => (
          <FileItemSkeleton key={i} animate={animate} />
        ))}
        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  // Table variant
  if (variant === 'table') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={defaultAriaLabel}
        className={cn('w-full overflow-hidden', className)}
      >
        {/* Table header */}
        <div className="flex gap-2 mb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`header-${i}`}
              className={cn(skeletonVariants({ animate }), 'h-8 flex-1 rounded-sm')}
            />
          ))}
        </div>

        {/* Table rows */}
        <div className="space-y-2">
          {Array.from({ length: count || 3 }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-2">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <div
                  key={`row-${rowIndex}-col-${colIndex}`}
                  className={cn(
                    skeletonVariants({ animate }),
                    'h-4 flex-1 rounded-sm bg-neutral-800/50'
                  )}
                />
              ))}
            </div>
          ))}
        </div>

        <p className="sr-only">{defaultAriaLabel}</p>
      </div>
    )
  }

  return null
}

/**
 * Pre-configured Card Skeleton with Header and Body
 */
export interface SkeletonCardProps {
  /** Enable/disable animation */
  animate?: boolean
  /** Additional CSS classes */
  className?: string
  /** ARIA label */
  ariaLabel?: string
}

export function SkeletonCard({ animate = true, className, ariaLabel }: SkeletonCardProps) {
  return (
    <SkeletonScreen
      variant="card"
      count={1}
      animate={animate}
      className={className}
      ariaLabel={ariaLabel}
    />
  )
}

/**
 * Pre-configured List Skeleton
 */
export interface SkeletonListProps {
  /** Number of items */
  items?: number
  /** Enable/disable animation */
  animate?: boolean
  /** Additional CSS classes */
  className?: string
  /** ARIA label */
  ariaLabel?: string
}

export function SkeletonList({ items = 3, animate = true, className, ariaLabel }: SkeletonListProps) {
  return (
    <SkeletonScreen
      variant="list"
      count={items}
      animate={animate}
      className={className}
      ariaLabel={ariaLabel}
    />
  )
}

/**
 * Pre-configured Chat Skeleton
 */
export interface SkeletonChatProps {
  /** Number of messages */
  messages?: number
  /** Enable/disable animation */
  animate?: boolean
  /** Additional CSS classes */
  className?: string
  /** ARIA label */
  ariaLabel?: string
}

export function SkeletonChat({ messages = 3, animate = true, className, ariaLabel }: SkeletonChatProps) {
  return (
    <SkeletonScreen
      variant="chat"
      count={messages}
      animate={animate}
      className={className}
      ariaLabel={ariaLabel}
    />
  )
}

export type SkeletonScreenVariants = VariantProps<typeof skeletonVariants>
