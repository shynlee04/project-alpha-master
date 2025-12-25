/**
 * Loading State Component
 * @module components/ui/LoadingState
 *
 * Generic loading indicator component with 8-bit design system.
 * Supports different loading patterns and animations.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/**
 * Loading variant type
 */
export type LoadingVariant = 'default' | 'full-screen' | 'inline' | 'card'

/**
 * Props for LoadingState component
 */
export interface LoadingStateProps {
    /** Loading message to display */
    message?: string
    /** Loading variant for styling */
    variant?: LoadingVariant
    /** Show progress bar */
    showProgress?: boolean
    /** Progress value (0-100) */
    progress?: number
    /** Custom CSS classes */
    className?: string
    /** Custom size for spinner */
    size?: 'sm' | 'md' | 'lg'
}

/**
 * CVA variants for loading state
 */
const loadingStateVariants = cva(
    [
        'base',
        'variant',
    ],
    {
        base: [
            'flex flex-col items-center justify-center',
            'transition-all duration-200',
        ],
        variants: {
            variant: {
                default: 'py-6',
                'full-screen': 'fixed inset-0 z-50 bg-background/90 backdrop-blur-sm',
                'inline': 'flex-row gap-2 py-0',
                'card': 'p-8 rounded-lg border border-border',
            },
        },
    }
)

/**
 * Loading State Component
 *
 * Displays loading indicators with optional progress bar.
 * Supports multiple variants for different contexts.
 *
 * @example
 * <LoadingState message="Loading files..." />
 * <LoadingState variant="full-screen" message="Initializing..." />
 * <LoadingState showProgress progress={50} message="Syncing..." />
 */
export function LoadingState({
    message,
    variant = 'default',
    showProgress = false,
    progress = 0,
    className,
    size = 'md',
}: LoadingStateProps) {
    const { t } = useTranslation()

    const loadingMessage = message || t('loading.default', 'Loading...')

    // Size classes for spinner
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    }

    return (
        <div className={cn(loadingStateVariants({ variant }), className)}>
            {/* Spinner */}
            <div className={cn('flex items-center justify-center', variant === 'inline' && 'mb-0')}>
                <Loader2
                    className={cn(
                        sizeClasses[size],
                        'text-primary animate-spin'
                    )}
                />
            </div>

            {/* Loading Message */}
            {loadingMessage && (
                <p className={cn(
                    'text-sm text-muted-foreground',
                    variant === 'inline' && 'ml-2 mb-0',
                    variant === 'full-screen' && 'text-lg font-medium',
                    variant === 'default' && 'mt-4'
                )}>
                    {loadingMessage}
                </p>
            )}

            {/* Progress Bar */}
            {showProgress && (
                <div className={cn(
                    'w-full max-w-md mt-4',
                    variant === 'inline' && 'w-48 mt-0 ml-4'
                )}>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {/* Progress percentage */}
                    <p className="text-xs text-muted-foreground text-center mt-1">
                        {progress}%
                    </p>
                </div>
            )}
        </div>
    )
}

export default LoadingState
