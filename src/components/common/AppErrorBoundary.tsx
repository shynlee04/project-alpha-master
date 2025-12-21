/**
 * Application Error Boundary Component
 * @module components/common/AppErrorBoundary
 *
 * Provides a user-friendly fallback UI when React errors occur.
 * Integrates with Sentry for error reporting.
 */

import { Sentry } from '../../lib/monitoring/sentry'
import { useTranslation } from 'react-i18next'

/**
 * Props for the FallbackComponent
 */
interface FallbackProps {
    error: Error
    componentStack: string | null
    resetError: () => void
}

/**
 * Custom fallback UI shown when an error occurs
 */
function ErrorFallback({ error, resetError }: FallbackProps) {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 text-center">
                {/* Error icon */}
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-destructive"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Error message */}
                <h2 className="text-xl font-semibold text-foreground mb-2">
                    {t('error.something_went_wrong', 'Something went wrong')}
                </h2>
                <p className="text-muted-foreground mb-4">
                    {t('error.unexpected_error_description', "We're sorry, but an unexpected error has occurred.")}
                </p>

                {/* Error details (development only) */}
                {import.meta.env.DEV && (
                    <details className="mb-4 text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            {t('error.technical_details', 'Technical Details')}
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                            {error.message}
                        </pre>
                    </details>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={resetError}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        {t('error.try_again', 'Try Again')}
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                    >
                        {t('error.reload_page', 'Reload Page')}
                    </button>
                </div>
            </div>
        </div>
    )
}

/**
 * Convert unknown error to Error object
 */
function toError(error: unknown): Error {
    if (error instanceof Error) return error
    if (typeof error === 'string') return new Error(error)
    return new Error('An unknown error occurred')
}

/**
 * Application Error Boundary wrapper
 * 
 * Wraps children with Sentry's ErrorBoundary to catch and report errors.
 * Shows a user-friendly fallback UI when errors occur.
 * 
 * @example
 * <AppErrorBoundary>
 *   <App />
 * </AppErrorBoundary>
 */
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <Sentry.ErrorBoundary
            fallback={({ error, resetError }) => (
                <ErrorFallback error={toError(error)} componentStack={null} resetError={resetError} />
            )}
            showDialog={import.meta.env.PROD}
            onError={(error, componentStack) => {
                console.error('[AppErrorBoundary] Caught error:', error)
                if (componentStack) {
                    console.error('[AppErrorBoundary] Component stack:', componentStack)
                }
            }}
        >
            {children}
        </Sentry.ErrorBoundary>
    )
}

export default AppErrorBoundary

