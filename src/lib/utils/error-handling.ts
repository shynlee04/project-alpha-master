/**
 * Error Handling Utilities
 * @module lib/utils/error-handling
 *
 * Utilities for error recovery and toast notifications.
 */

import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

/**
 * Error recovery action type
 */
export type ErrorRecoveryAction = 'retry' | 'reload' | 'dismiss' | 'home' | 'custom'

/**
 * Error recovery options
 */
export interface ErrorRecoveryOptions {
    /** Action to take */
    action?: ErrorRecoveryAction
    /** Custom action label */
    actionLabel?: string
    /** Custom action handler */
    onAction?: () => void | Promise<void>
    /** Error ID for deduplication */
    id?: string
    /** Toast duration in milliseconds */
    duration?: number
    /** Whether to show error details */
    showDetails?: boolean
}

/**
 * Show error toast notification
 *
 * @param error - Error object or message
 * @param options - Recovery options
 */
export function showErrorToast(error: Error | string, options?: ErrorRecoveryOptions) {
    const { t } = useTranslation()
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorDetails = typeof error === 'object' ? error.stack : undefined

    const {
        action = 'dismiss',
        actionLabel,
        onAction,
        id,
        duration = 5000,
        showDetails = false,
    } = options || {}

    // Get action label
    let actionText = actionLabel
    if (!actionText) {
        switch (action) {
            case 'retry':
                actionText = t('error.retry', 'Retry')
                break
            case 'reload':
                actionText = t('error.reload', 'Reload')
                break
            case 'dismiss':
                actionText = t('error.dismiss', 'Dismiss')
                break
            case 'home':
                actionText = t('error.goHome', 'Go Home')
                break
            case 'custom':
                actionText = t('error.action', 'Action')
                break
        }
    }

    // Show toast with action
    toast.error(errorMessage, {
        id,
        duration,
        action: {
            label: actionText,
            onClick: async () => {
                if (onAction) {
                    await onAction()
                } else {
                    // Default action handlers
                    switch (action) {
                        case 'reload':
                            window.location.reload()
                            break
                        case 'home':
                            window.location.href = '/'
                            break
                        case 'dismiss':
                        case 'retry':
                        case 'custom':
                            // These are handled by the caller
                            break
                    }
                }
            },
        },
        description: showDetails && errorDetails ? errorDetails : undefined,
    })
}

/**
 * Show success toast notification
 *
 * @param message - Success message
 * @param id - Toast ID for deduplication
 */
export function showSuccessToast(message: string, id?: string) {
    toast.success(message, {
        id,
        duration: 3000,
    })
}

/**
 * Show info toast notification
 *
 * @param message - Info message
 * @param id - Toast ID for deduplication
 */
export function showInfoToast(message: string, id?: string) {
    toast(message, {
        id,
        duration: 3000,
    })
}

/**
 * Show warning toast notification
 *
 * @param message - Warning message
 * @param id - Toast ID for deduplication
 */
export function showWarningToast(message: string, id?: string) {
    toast.warning(message, {
        id,
        duration: 4000,
    })
}

/**
 * Show loading toast notification
 *
 * @param message - Loading message
 * @param id - Toast ID for deduplication
 * @returns Dismiss function
 */
export function showLoadingToast(message: string, id?: string) {
    return toast.loading(message, {
        id,
    })
}

/**
 * Dismiss toast by ID
 *
 * @param id - Toast ID to dismiss
 */
export function dismissToast(id: string) {
    toast.dismiss(id)
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
    toast.dismiss()
}

/**
 * Create retry handler with exponential backoff
 *
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @returns Function that executes with retry logic
 */
export function withRetry<T>(
    fn: () => Promise<T>,
    options?: {
        maxRetries?: number
        baseDelay?: number
        onRetry?: (attempt: number, error: Error) => void
    }
): () => Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, onRetry } = options || {}

    return async () => {
        let lastError: Error | undefined

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn()
            } catch (error) {
                lastError = error as Error

                if (attempt < maxRetries) {
                    // Notify about retry
                    if (onRetry) {
                        onRetry(attempt + 1, lastError)
                    }

                    // Wait with exponential backoff
                    const delay = baseDelay * Math.pow(2, attempt)
                    await new Promise(resolve => setTimeout(resolve, delay))
                } else {
                    // All retries exhausted
                    throw lastError
                }
            }
        }

        // Should never reach here, but TypeScript needs it
        throw lastError || new Error('Unknown error')
    }
}

/**
 * Create error boundary fallback handler
 *
 * @param error - Error object
 * @param errorInfo - Error boundary info
 * @returns Recovery options
 */
export function createErrorFallback(
    error: Error,
    errorInfo?: React.ErrorInfo
): ErrorRecoveryOptions {
    const componentName = errorInfo?.componentStack
        ?.split('\n')
        .filter(line => line.trim())
        .pop() || 'Unknown Component'

    return {
        action: 'reload',
        showDetails: import.meta.env.DEV,
        onAction: () => window.location.reload(),
    }
}

/**
 * Get user-friendly error message
 *
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error
    }

    if (error instanceof Error) {
        return error.message
    }

    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message)
    }

    return 'An unexpected error occurred'
}

/**
 * Check if error is network error
 *
 * @param error - Error object
 * @returns True if network error
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
        return (
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('ENOTFOUND')
        )
    }
    return false
}

/**
 * Check if error is timeout error
 *
 * @param error - Error object
 * @returns True if timeout error
 */
export function isTimeoutError(error: unknown): boolean {
    if (error instanceof Error) {
        return (
            error.message.includes('timeout') ||
            error.message.includes('ETIMEDOUT') ||
            error.name === 'TimeoutError'
        )
    }
    return false
}

/**
 * Check if error is permission error
 *
 * @param error - Error object
 * @returns True if permission error
 */
export function isPermissionError(error: unknown): boolean {
    if (error instanceof Error) {
        return (
            error.message.includes('Permission denied') ||
            error.message.includes('NotAllowedError') ||
            error.name === 'NotAllowedError'
        )
    }
    return false
}

/**
 * Log error to console with context
 *
 * @param error - Error object
 * @param context - Additional context
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
    const errorMessage = getErrorMessage(error)
    const timestamp = new Date().toISOString()

    console.group(`[Error] ${timestamp}`)
    console.error('Message:', errorMessage)
    console.error('Error:', error)
    if (context) {
        console.error('Context:', context)
    }
    console.groupEnd()
}

/**
 * Create error handler for async operations
 *
 * @param operationName - Name of the operation
 * @returns Error handler function
 */
export function createAsyncErrorHandler<T>(
    operationName: string
) {
    return {
        onError: (error: unknown) => {
            logError(error, { operation: operationName })
            showErrorToast(error, {
                action: 'retry',
                id: `${operationName}-error`,
            })
        },
        onSuccess: (result: T) => {
            showSuccessToast(`${operationName} completed successfully`)
            return result
        },
    }
}
