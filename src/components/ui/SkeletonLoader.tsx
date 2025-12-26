/**
 * Skeleton Loader Component
 * @module components/ui/SkeletonLoader
 *
 * Skeleton loading patterns for content placeholders.
 * Follows 8-bit design system with CVA variants.
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Skeleton variant
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
    /** Custom width */
    width?: string | number
    /** Custom height */
    height?: string | number
    /** Enable/disable animation */
    animate?: boolean
    /** Additional CSS classes */
    className?: string
}

/**
 * CVA variants for skeleton loader
 */
const skeletonVariants = cva(
    // Base styles
    'rounded bg-neutral-800 animate-pulse',
    {
        variants: {
            variant: {
                text: 'h-4 w-full max-w-xs',
                title: 'h-6 w-48 max-w-xs',
                paragraph: 'space-y-2 w-full max-w-md',
                avatar: 'h-12 w-12 rounded-full max-w-xs',
                card: 'h-32 w-full rounded-lg',
                list: 'space-y-3 w-full',
            },
        },
    }
)

/**
 * Skeleton Loader Component
 *
 * Displays skeleton loading patterns for different content types.
 * Supports multiple variants for different loading contexts.
 *
 * @example
 * <SkeletonLoader variant="paragraph" lines={3} />
 */
export function SkeletonLoader({
    variant = 'text',
    lines = 1,
    width,
    height,
    animate = true,
    className,
}: SkeletonLoaderProps) {
    const baseClasses = cn(skeletonVariants({ variant }), className)
    
    // Render different skeleton patterns based on variant
    if (variant === 'text') {
        return (
            <div className={baseClasses} style={{ width, height }}>
                <div className="h-full w-2/3 bg-neutral-700 rounded-sm" />
            </div>
        )
    }
    
    if (variant === 'title') {
        return (
            <div className={baseClasses} style={{ width, height }}>
                <div className="h-full w-3/4 bg-neutral-700 rounded-sm" />
            </div>
        )
    }
    
    if (variant === 'paragraph') {
        return (
            <div className={cn(baseClasses, 'flex flex-col gap-2')}>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className="h-4 w-full bg-neutral-800 rounded-sm"
                        style={{ width: typeof width === 'number' ? `${width}%` : width }}
                    />
                ))}
            </div>
        )
    }
    
    if (variant === 'avatar') {
        return (
            <div className={baseClasses} style={{ width, height }}>
                <div className="h-full w-full bg-neutral-700 rounded-full" />
            </div>
        )
    }
    
    if (variant === 'card') {
        return (
            <div className={baseClasses} style={{ width, height }}>
                <div className="space-y-3">
                    {/* Card header */}
                    <div className="h-6 w-3/4 bg-neutral-700 rounded-sm mb-3" />
                    {/* Card body */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-neutral-800 rounded-sm" />
                        <div className="h-4 w-full bg-neutral-800 rounded-sm" />
                        <div className="h-4 w-2/3 bg-neutral-800 rounded-sm" />
                    </div>
                    {/* Card footer */}
                    <div className="h-4 w-1/2 bg-neutral-800 rounded-sm" />
                </div>
            </div>
        )
    }
    
    if (variant === 'list') {
        return (
            <div className={cn(baseClasses, 'space-y-3')}>
                {Array.from({ length: lines || 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-neutral-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 bg-neutral-800 rounded-sm" />
                            <div className="h-3 w-full bg-neutral-800 rounded-sm" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    
    return null
}

export type SkeletonLoaderVariants = VariantProps<typeof skeletonVariants>

/**
 * Skeleton Card Component
 * Pre-configured card skeleton with header and body.
 */
export interface SkeletonCardProps {
    /** Enable/disable animation */
    animate?: boolean
    /** Additional CSS classes */
    className?: string
}

export function SkeletonCard({ animate = true, className }: SkeletonCardProps) {
    return (
        <div className={cn('rounded-lg border border-neutral-700 bg-neutral-900/50 p-4', animate && 'animate-pulse', className)}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-neutral-700 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-neutral-800 rounded-sm" />
                    <div className="h-3 w-48 bg-neutral-800 rounded-sm" />
                </div>
            </div>
            
            {/* Body */}
            <div className="space-y-3">
                <div className="h-4 w-full bg-neutral-800 rounded-sm" />
                <div className="h-4 w-full bg-neutral-800 rounded-sm" />
                <div className="h-4 w-2/3 bg-neutral-800 rounded-sm" />
                <div className="h-4 w-full bg-neutral-800 rounded-sm" />
            </div>
        </div>
    )
}

/**
 * Skeleton List Component
 * Pre-configured list skeleton with avatar and text.
 */
export interface SkeletonListProps {
    /** Number of items */
    items?: number
    /** Enable/disable animation */
    animate?: boolean
    /** Additional CSS classes */
    className?: string
}

export function SkeletonList({ items = 3, animate = true, className }: SkeletonListProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                    <div className={cn('h-12 w-12 bg-neutral-700 rounded-full', animate && 'animate-pulse')} />
                    <div className="flex-1 space-y-2">
                        <div className={cn('h-3 w-32 bg-neutral-800 rounded-sm', animate && 'animate-pulse')} />
                        <div className={cn('h-3 w-full bg-neutral-800 rounded-sm', animate && 'animate-pulse')} />
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Skeleton Table Component
 * Pre-configured table skeleton with header and rows.
 */
export interface SkeletonTableProps {
    /** Number of rows */
    rows?: number
    /** Number of columns */
    columns?: number
    /** Enable/disable animation */
    animate?: boolean
    /** Additional CSS classes */
    className?: string
}

export function SkeletonTable({ rows = 3, columns = 4, animate = true, className }: SkeletonTableProps) {
    return (
        <div className={cn('w-full overflow-hidden', className)}>
            {/* Table header */}
            <div className="flex gap-2 mb-2">
                {Array.from({ length: columns }).map((_, index) => (
                    <div
                        key={`header-${index}`}
                        className={cn('h-8 w-full bg-neutral-800 rounded-sm', animate && 'animate-pulse')}
                    />
                ))}
            </div>
            
            {/* Table rows */}
            <div className="space-y-2">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex gap-2">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div
                                key={`row-${rowIndex}-col-${colIndex}`}
                                className={cn('h-4 w-full bg-neutral-800/50 rounded-sm', animate && 'animate-pulse')}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
