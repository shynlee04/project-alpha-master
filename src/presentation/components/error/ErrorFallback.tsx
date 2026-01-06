/**
 * Error Fallback Component
 * @module components/error/ErrorFallback
 *
 * User-friendly error display with recovery actions.
 * Mobile-optimized with 8-bit design system.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for ErrorFallback component
 */
export interface ErrorFallbackProps {
    /** Error object */
    error: Error
    /** Component stack trace (optional) */
    componentStack?: string | null
    /** Reset error callback */
    onReset: () => void
    /** Additional CSS classes */
    className?: string
}

/**
 * Convert unknown error to Error object
 */
function toError(error: unknown): Error {
    if (error instanceof Error) return error
    if (typeof error === 'string') return new Error(error)
    try {
        return new Error(JSON.stringify(error))
    } catch {
        return new Error('An unknown error occurred')
    }
}

/**
 * Error Fallback Component
 *
 * Displays user-friendly error messages with recovery actions.
 * Shows technical details only in development mode.
 *
 * @example
 * <ErrorFallback
 *   error={error}
 *   onReset={() => window.location.reload()}
 * />
 */
export function ErrorFallback({
    error: errorProp,
    componentStack,
    onReset,
    className
}: ErrorFallbackProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const error = toError(errorProp)
    const isDev = import.meta.env.DEV

    const handleRetry = () => {
        onReset()
    }

    const handleReload = () => {
        window.location.reload()
    }

    const handleGoHome = () => {
        navigate({ to: '/' })
    }

    return (
        <div className={cn(
            "min-h-screen flex items-center justify-center bg-background p-4",
            className
        )}>
            <div className="max-w-md w-full">
                {/* Error Card */}
                <div className="bg-card border-2 border-border rounded-lg shadow-lg p-6 text-center">
                    {/* Error Icon */}
                    <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-destructive" />
                    </div>

                    {/* Error Title */}
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        {t('errors.generic.unexpected.title', 'Unexpected Error')}
                    </h2>

                    {/* Error Message */}
                    <p className="text-muted-foreground mb-6">
                        {t('errors.generic.unexpected.description', 'We encountered an unexpected error. Our team has been notified.')}
                    </p>

                    {/* Error Details (Development Only) */}
                    {isDev && (
                        <details className="mb-6 text-left bg-muted rounded-lg p-4">
                            <summary className="cursor-pointer text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                                <Bug className="w-4 h-4" />
                                {t('errors.actions.showDetails', 'Show Details')}
                            </summary>
                            <div className="mt-3 space-y-2">
                                {error.message && (
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-1">Error Message:</div>
                                        <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-20">
                                            {error.message}
                                        </pre>
                                    </div>
                                )}
                                {componentStack && (
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-1">Component Stack:</div>
                                        <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-32">
                                            {componentStack}
                                        </pre>
                                    </div>
                                )}
                                {error.stack && (
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground mb-1">Stack Trace:</div>
                                        <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-32">
                                            {error.stack}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </details>
                    )}

                    {/* Recovery Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {/* Retry Button */}
                        <button
                            onClick={handleRetry}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium min-h-[44px] touch-target"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>{t('errors.actions.retry', 'Try Again')}</span>
                        </button>

                        {/* Reload Button */}
                        <button
                            onClick={handleReload}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium min-h-[44px] touch-target"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>{t('errors.actions.reload', 'Reload Page')}</span>
                        </button>

                        {/* Go Home Button */}
                        <button
                            onClick={handleGoHome}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium min-h-[44px] touch-target"
                        >
                            <Home className="w-4 h-4" />
                            <span>{t('errors.actions.home', 'Back to Home')}</span>
                        </button>
                    </div>
                </div>

                {/* Support Hint */}
                {isDev && (
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <p>Check the browser console for more details.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ErrorFallback
