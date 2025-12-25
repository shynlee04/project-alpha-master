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
    [
        'base',
        'variant',
    ],
    {
        base: [
            'flex flex-col items-center justify-center p-6 rounded-lg border',
            'transition-all duration-200',
        ],
        variants: {
            variant: {
                default: 'bg-error-500/10 border-error-500/30 text-error-100',
                critical: 'bg-destructive/10 border-destructive/30 text-destructive',
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
                return <RefreshCw className="w-4 h-4" />
            case 'reload':
                return <RefreshCw className="w-4 h-4" />
            case 'dismiss':
                return <X className="w-4 h-4" />
            case 'home':
                return <Home className="w-4 h-4" />
            default:
                return null
        }
    }

    const getActionText = () => {
        switch (action) {
            case 'retry':
                return t('error.retry', 'Retry')
            case 'reload':
                return t('error.reload', 'Reload Page')
            case 'dismiss':
                return t('error.dismiss', 'Dismiss')
            case 'home':
                return t('error.goHome', 'Go Home')
            default:
                return null
        }
    }

    const handleAction = () => {
        if (onAction) {
            onAction()
        }
    }

    return (
        <div className={cn(errorStateVariants({ variant }), className)}>
            {/* Error Icon */}
            <div className="mb-4">
                {icon || (
                    <div className="w-16 h-16 rounded-full bg-error-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-error-500" />
                    </div>
                )}
            </div>

            {/* Error Title */}
            <h2 className="text-xl font-semibold mb-2">
                {errorTitle}
            </h2>

            {/* Error Message */}
            <p className="text-sm mb-4 text-center max-w-md">
                {error}
            </p>

            {/* Technical Details (Development Only) */}
            {isDev && showDetails && (
                <details className="mb-4 w-full max-w-md">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {t('error.technicalDetails', 'Technical Details')}
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32 text-left">
                        {error}
                    </pre>
                </details>
            )}

            {/* Action Button */}
            {action && onAction && (
                <button
                    onClick={handleAction}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-md',
                        'bg-primary text-primary-foreground',
                        'hover:bg-primary/90 transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    type="button"
                >
                    {getActionIcon()}
                    <span>{getActionText()}</span>
                </button>
            )}
        </div>
    )
}

export default ErrorState
