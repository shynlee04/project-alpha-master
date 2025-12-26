/**
 * Error State Component
 * @module components/ui/ErrorState
 *
 * Generic error display component with recovery actions.
 * Follows 8-bit design system with CVA variants.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw, X, Home } from 'lucide-react'

/**
 * Error state variant
 */
export type ErrorVariant = 'default' | 'critical' | 'warning'

/**
 * Error action type
 */
export type ErrorAction = 'retry' | 'reload' | 'dismiss' | 'home'

/**
 * Props for ErrorState component
 */
export interface ErrorStateProps {
    /** Error message to display */
    error: string
    /** Error title (optional, defaults to generic title) */
    title?: string
    /** Error variant for styling */
    variant?: ErrorVariant
    /** Action to provide for recovery */
    action?: ErrorAction
    /** Callback when action is clicked */
    onAction?: () => void
    /** Show technical details (development only) */
    showDetails?: boolean
    /** Additional CSS classes */
    className?: string
    /** Custom icon */
    icon?: React.ReactNode
}

/**
 * CVA variants for error state
 */
const errorStateVariants = cva(
    // Base styles
    'flex flex-col items-center justify-center p-6 rounded-lg border transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'bg-error-500/10 border-error-500/30 text-error-100',
                critical: 'bg-destructive/10 border-destructive/30 text-destructive-100',
                warning: 'bg-warning-500/10 border-warning-500/30 text-warning-100',
            },
        },
    }
)

/**
 * Error State Component
 *
 * Displays error messages with recovery actions.
 * Supports multiple variants and actions for different error scenarios.
 *
 * @example
 * <ErrorState
 *   error="Failed to load file"
 *   variant="critical"
 *   action="retry"
 *   onAction={() => retry()}
 * />
 */
export function ErrorState({
    error,
    title,
    variant = 'default',
    action,
    onAction,
    showDetails = false,
    className,
    icon,
}: ErrorStateProps) {
    const { t } = useTranslation()
    
    const errorTitle = title || t('error.title', 'Something went wrong')
    const isDev = import.meta.env.DEV
    
    // Get action icon based on action type
    const getActionIcon = () => {
        switch (action) {
            case 'retry':
                return <RefreshCw className="w-5 h-5" />
            case 'reload':
                return <RefreshCw className="w-5 h-5" />
            case 'dismiss':
                return <X className="w-5 h-5" />
            case 'home':
                return <Home className="w-5 h-5" />
            default:
                return null
        }
    }
    
    // Get action label based on action type
    const getActionLabel = () => {
        switch (action) {
            case 'retry':
                return t('error.action.retry', 'Retry')
            case 'reload':
                return t('error.action.reload', 'Reload')
            case 'dismiss':
                return t('error.action.dismiss', 'Dismiss')
            case 'home':
                return t('error.action.home', 'Go Home')
            default:
                return ''
        }
    }
    
    return (
        <div className={cn(errorStateVariants({ variant }), className)}>
            {/* Icon */}
            {icon || (
                <div className="mb-4 rounded-full bg-current/10 p-4">
                    <AlertCircle className="w-12 h-12" />
                </div>
            )}
            
            {/* Title */}
            <h3 className="text-xl font-bold mb-2">{errorTitle}</h3>
            
            {/* Error message */}
            <p className="text-sm opacity-90 mb-4">{error}</p>
            
            {/* Action button */}
            {action && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500 text-neutral-950 rounded-none font-medium hover:bg-primary-600 active:bg-primary-700 transition-all hover:scale-105 active:scale-95"
                >
                    {getActionIcon()}
                    <span>{getActionLabel()}</span>
                </button>
            )}
            
            {/* Technical details (development only) */}
            {isDev && showDetails && (
                <details className="mt-4 text-xs opacity-70">
                    <summary className="cursor-pointer hover:opacity-100 transition-opacity">
                        {t('error.showDetails', 'Show technical details')}
                    </summary>
                    <pre className="mt-2 overflow-auto rounded bg-black/20 p-2">
                        {error}
                    </pre>
                </details>
            )}
        </div>
    )
}

export type ErrorStateVariants = VariantProps<typeof errorStateVariants>
