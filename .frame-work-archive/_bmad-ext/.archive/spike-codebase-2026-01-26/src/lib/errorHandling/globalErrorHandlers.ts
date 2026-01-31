/**
 * Global Error Handlers
 * @module lib/errorHandling/globalErrorHandlers
 *
 * Sets up global error handlers for unhandled errors and promise rejections.
 * Integrates with Sentry for error tracking.
 */

import { captureException } from '@/lib/monitoring/sentry'

/**
 * Initialize global error handlers
 *
 * Sets up handlers for:
 * - Unhandled promise rejections
 * - Uncaught errors (outside React)
 * - Uncaught errors in event handlers
 *
 * Call this once at app startup (before React renders).
 *
 * @example
 * import { initGlobalErrorHandlers } from './lib/errorHandling/globalErrorHandlers'
 * initGlobalErrorHandlers()
 */
export function initGlobalErrorHandlers(): void {
    // Skip on server
    if (typeof window === 'undefined') {
        return
    }

    // Handle unhandled promise rejections
    setupUnhandledRejectionHandler()

    // Handle uncaught errors
    setupUncaughtErrorHandler()
}

/**
 * Setup handler for unhandled promise rejections
 */
function setupUnhandledRejectionHandler(): void {
    const handler = (event: PromiseRejectionEvent) => {
        // Prevent default browser error logging
        event.preventDefault()

        // Extract error from rejection
        let error: Error
        if (event.reason instanceof Error) {
            error = event.reason
        } else if (typeof event.reason === 'string') {
            error = new Error(event.reason)
        } else {
            error = new Error('Unhandled promise rejection')
        }

        // Log to console
        console.error('[GlobalErrorHandlers] Unhandled promise rejection:', error)
        console.error('[GlobalErrorHandlers] Promise:', event.promise)

        // Send to Sentry
        try {
            captureException(error, {
                unhandledRejection: true,
                promise: String(event.promise)
            })
        } catch (sentryError) {
            console.warn('[GlobalErrorHandlers] Failed to send error to Sentry:', sentryError)
        }

        // Optional: Show user-friendly error notification
        // You could integrate with a toast system here
        showErrorNotification(error)
    }

    window.addEventListener('unhandledrejection', handler)

    // Cleanup function (for testing)
    if (import.meta.env.DEV) {
        ;(window as any).__cleanupUnhandledRejection = () => {
            window.removeEventListener('unhandledrejection', handler)
        }
    }
}

/**
 * Setup handler for uncaught errors
 */
function setupUncaughtErrorHandler(): void {
    const handler = (event: ErrorEvent) => {
        // Prevent default browser error logging
        event.preventDefault()

        // Extract error
        let error: Error
        if (event.error instanceof Error) {
            error = event.error
        } else {
            error = new Error(event.message || 'Uncaught error')
        }

        // Log to console
        console.error('[GlobalErrorHandlers] Uncaught error:', error)
        if (event.filename) {
            console.error('[GlobalErrorHandlers] File:', event.filename, 'Line:', event.lineno, 'Column:', event.colno)
        }

        // Send to Sentry
        try {
            captureException(error, {
                uncaughtError: true,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            })
        } catch (sentryError) {
            console.warn('[GlobalErrorHandlers] Failed to send error to Sentry:', sentryError)
        }

        // Show user-friendly error notification
        showErrorNotification(error)
    }

    window.addEventListener('error', handler)

    // Cleanup function (for testing)
    if (import.meta.env.DEV) {
        ;(window as any).__cleanupUncaughtError = () => {
            window.removeEventListener('error', handler)
        }
    }
}

/**
 * Show error notification to user
 *
 * In production, this could show a toast notification.
 * For now, just log to console in development.
 */
function showErrorNotification(error: Error): void {
    // In production, you could integrate with toast system
    // Example: toast.error('An unexpected error occurred')

    if (import.meta.env.DEV) {
        console.warn('[GlobalErrorHandlers] Consider showing error notification to user:', error.message)
    }
}

/**
 * Cleanup global error handlers
 *
 * Useful for testing or hot module reloading.
 */
export function cleanupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') {
        return
    }

    if (import.meta.env.DEV) {
        if (typeof (window as any).__cleanupUnhandledRejection === 'function') {
            ;(window as any).__cleanupUnhandledRejection()
        }
        if (typeof (window as any).__cleanupUncaughtError === 'function') {
            ;(window as any).__cleanupUncaughtError()
        }
    }
}
