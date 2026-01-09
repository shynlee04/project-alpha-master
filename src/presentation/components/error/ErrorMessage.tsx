/**
 * Error Message Component
 * @module components/error/ErrorMessage
 *
 * Compact error display with inline recovery actions.
 * For use within components where errors need to be shown inline.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/presentation/components/ui/button'

/**
 * Error severity level
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

/**
 * Recovery action type
 */
export type RecoveryAction = {
    /** Action label */
    label: string
    /** Action callback */
    onClick: () => void
    /** Optional icon */
    icon?: React.ReactNode
}

/**
 * Props for ErrorMessage component
 */
export interface ErrorMessageProps {
    /** Error message to display */
    message: string
    /** Error severity for styling */
    severity?: ErrorSeverity
    /** Optional title */
    title?: string
    /** Recovery actions */
    actions?: RecoveryAction[]
    /** Dismiss callback */
    onDismiss?: () => void
    /** Additional CSS classes */
    className?: string
    /** Show technical details (development only) */
    showDetails?: boolean
    /** Technical details (stack trace, etc.) */
    details?: string
}

/**
 * Get severity styles
 */
function getSeverityStyles(severity: ErrorSeverity) {
    const styles = {
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
        warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-100',
        error: 'bg-error-500/10 border-error-500/30 text-error-100',
        critical: 'bg-destructive/10 border-destructive/30 text-destructive-100',
    }
    return styles[severity]
}

/**
 * Error Message Component
 *
 * Compact inline error display with recovery actions.
 * Suitable for showing errors within components, pages, or modals.
 *
 * @example
 * <ErrorMessage
 *   message="Failed to load file"
 *   severity="error"
 *   actions={[
 *     { label: 'Retry', onClick: () => retry() },
 *     { label: 'Cancel', onClick: () => cancel() }
 *   ]}
 *   onDismiss={() => dismiss()}
 * />
 */
export function ErrorMessage({
    message,
    severity = 'error',
    title,
    actions = [],
    onDismiss,
    className,
    showDetails = false,
    details
}: ErrorMessageProps) {
    const { t } = useTranslation()
    const isDev = import.meta.env.DEV

    return (
        <div className={cn(
            "flex flex-col gap-3 p-4 rounded-none border transition-all duration-200",
            getSeverityStyles(severity),
            className
        )}>
            {/* Header */}
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    {title && (
                        <h4 className="font-semibold text-sm mb-1">
                            {title}
                        </h4>
                    )}

                    {/* Message */}
                    <p className="text-sm opacity-90">
                        {message}
                    </p>

                    {/* Technical Details (Development Only) */}
                    {isDev && showDetails && details && (
                        <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-semibold opacity-70 hover:opacity-100 transition-opacity">
                                {t('errors.actions.showDetails', 'Show Details')}
                            </summary>
                            <pre className="mt-1 text-xs bg-[var(--muted)] p-2 rounded overflow-auto max-h-32">
                                {details}
                            </pre>
                        </details>
                    )}
                </div>

                {/* Dismiss Button */}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 p-1 rounded hover:bg-[var(--muted)] transition-colors touch-target"
                        aria-label={t('errors.actions.dismiss', 'Dismiss')}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Recovery Actions */}
            {actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={action.onClick}
                            className="inline-flex items-center gap-2 min-h-[36px]"
                        >
                            {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                            <span>{action.label}</span>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * Error Message with Retry Action
 * Convenience component for common retry scenario
 */
export interface ErrorWithRetryProps extends Omit<ErrorMessageProps, 'actions'> {
    onRetry: () => void
    retryLabel?: string
}

export function ErrorWithRetry({
    onRetry,
    retryLabel,
    ...props
}: ErrorWithRetryProps) {
    const { t } = useTranslation()

    return (
        <ErrorMessage
            {...props}
            actions={[
                {
                    label: retryLabel || t('errors.actions.retry', 'Try Again'),
                    onClick: onRetry,
                    icon: <RefreshCw className="w-4 h-4" />
                }
            ]}
        />
    )
}

export default ErrorMessage
