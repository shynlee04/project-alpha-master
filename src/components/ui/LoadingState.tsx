/**
 * Loading State Component
 * @module components/ui/LoadingState
 *
 * Generic loading indicator component with progress support.
 * Follows 8-bit design system with CVA variants.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/**
 * Loading state variant
 */
export type LoadingVariant = 'default' | 'full-screen' | 'inline' | 'card'

/**
 * Props for LoadingState component
 */
export interface LoadingStateProps {
    /** Loading message (optional) */
    message?: string
    /** Loading variant for styling */
    variant?: LoadingVariant
    /** Show progress bar */
    showProgress?: boolean
    /** Progress percentage (0-100) */
    progress?: number
    /** Additional CSS classes */
    className?: string
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg'
}

/**
 * CVA variants for loading state
 */
const loadingStateVariants = cva(
    // Base styles
    'flex flex-col items-center justify-center gap-4',
    {
        variants: {
            variant: {
                default: 'p-4',
                'full-screen': 'fixed inset-0 z-50 bg-neutral-950/95 p-8',
                inline: 'flex-row gap-2 p-0',
                card: 'p-6 rounded-lg border border-neutral-700 bg-neutral-900/50',
            },
        },
    }
)

/**
 * Loading State Component
 *
 * Displays loading indicators with optional progress bar.
 * Supports multiple variants for different loading contexts.
 *
 * @example
 * <LoadingState
 *   message="Loading files..."
 *   variant="full-screen"
 *   showProgress
 *   progress={50}
 * />
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
    
    const loadingMessage = message || t('loading.message', 'Loading...')
    const progressPercentage = Math.min(100, Math.max(0, progress))
    
    // Size classes for spinner
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    }
    
    return (
        <div className={cn(loadingStateVariants({ variant }), className)}>
            {/* Spinner */}
            <div className={cn('animate-spin', sizeClasses[size], 'text-primary-500')}>
                <Loader2 className="w-full h-full" />
            </div>
            
            {/* Message */}
            {loadingMessage && (
                <p className="text-sm text-neutral-300">{loadingMessage}</p>
            )}
            
            {/* Progress bar */}
            {showProgress && (
                <div className="w-full max-w-xs">
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>{t('loading.progress', 'Progress')}</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-none overflow-hidden">
                        <div
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export type LoadingStateVariants = VariantProps<typeof loadingStateVariants>
