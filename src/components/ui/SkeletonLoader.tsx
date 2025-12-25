/**
 * Skeleton Loader Component
 * @module components/ui/SkeletonLoader
 *
 * Skeleton loading patterns for content placeholders with 8-bit design system.
 * Provides visual feedback while content is loading.
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Skeleton variant type
 */
export type SkeletonVariant = 'text' | 'title' | 'paragraph' | 'avatar' | 'card' | 'list'

/**
 * Props for SkeletonLoader component
 */
export interface SkeletonLoaderProps {
    /** Skeleton variant for different content types */
    variant?: SkeletonVariant
    /** Number of lines (for text/paragraph variants) */
    lines?: number
    /** Width of skeleton */
    width?: string | number
    /** Height of skeleton */
    height?: string | number
    /** Whether skeleton is animating */
    animate?: boolean
    /** Additional CSS classes */
    className?: string
}

/**
 * CVA variants for skeleton loader
 */
const skeletonVariants = cva(
    'animate-pulse rounded-md',
    {
        variants: {
            variant: {
                text: 'h-4 bg-muted',
                title: 'h-6 bg-muted',
                paragraph: 'h-4 bg-muted',
                avatar: 'h-12 w-12 rounded-full bg-muted',
                card: 'h-32 bg-muted',
                list: 'h-12 bg-muted',
            },
        },
    }
)

/**
 * Skeleton Loader Component
 *
 * Displays skeleton placeholders for various content types.
 * Supports multiple variants for different UI patterns.
 *
 * @example
 * <SkeletonLoader variant="text" lines={3} />
 * <SkeletonLoader variant="avatar" />
 * <SkeletonLoader variant="card" />
 */
export function SkeletonLoader({
    variant = 'text',
    lines = 1,
    width,
    height,
    animate = true,
    className,
}: SkeletonLoaderProps) {
    const baseClassName = cn(
        skeletonVariants({ variant }),
        !animate && 'animate-none',
        className
    )

    const style: React.CSSProperties = {}
    if (width) style.width = typeof width === 'number' ? `${width}px` : width
    if (height) style.height = typeof height === 'number' ? `${height}px` : height

    // For text and paragraph variants with multiple lines
    if ((variant === 'text' || variant === 'paragraph') && lines > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className={baseClassName}
                        style={style}
                        role="presentation"
                        aria-label="Loading content"
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className={baseClassName}
            style={style}
            role="presentation"
            aria-label="Loading content"
        />
    )
}

/**
 * Skeleton Card Component
 * A pre-configured skeleton for card content
 */
export interface SkeletonCardProps {
    /** Whether to show avatar */
    showAvatar?: boolean
    /** Number of text lines */
    lines?: number
    /** Additional CSS classes */
    className?: string
}

export function SkeletonCard({
    showAvatar = false,
    lines = 3,
    className,
}: SkeletonCardProps) {
    return (
        <div className={cn('p-4 border rounded-md', className)}>
            {showAvatar && (
                <SkeletonLoader variant="avatar" className="mb-3" />
            )}
            <SkeletonLoader variant="title" className="mb-2" />
            <SkeletonLoader variant="paragraph" lines={lines} />
        </div>
    )
}

/**
 * Skeleton List Component
 * A pre-configured skeleton for list items
 */
export interface SkeletonListProps {
    /** Number of items */
    items?: number
    /** Whether to show avatar for each item */
    showAvatar?: boolean
    /** Number of text lines per item */
    lines?: number
    /** Additional CSS classes */
    className?: string
}

export function SkeletonList({
    items = 5,
    showAvatar = false,
    lines = 2,
    className,
}: SkeletonListProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                    {showAvatar && (
                        <SkeletonLoader variant="avatar" />
                    )}
                    <div className="flex-1 space-y-2">
                        <SkeletonLoader variant="title" />
                        <SkeletonLoader variant="paragraph" lines={lines} />
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton Table Component
 * A pre-configured skeleton for table rows
 */
export interface SkeletonTableProps {
    /** Number of rows */
    rows?: number
    /** Number of columns */
    columns?: number
    /** Additional CSS classes */
    className?: string
}

export function SkeletonTable({
    rows = 5,
    columns = 4,
    className,
}: SkeletonTableProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <SkeletonLoader
                            key={`${rowIndex}-${colIndex}`}
                            variant="text"
                            className="flex-1"
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export default SkeletonLoader
