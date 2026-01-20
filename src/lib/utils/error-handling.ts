/**
 * Error Handling Utilities
 * @module lib/utils/error-handling
 *
 * Utilities for error recovery and toast notifications.
 *
 * IMPORTANT: This module follows the "translation outside hooks" pattern.
 * The showErrorToast() function does NOT call useTranslation() directly.
 * Instead, it accepts either:
 * - A pre-translated message string
 * - A translation key (messageKey) that components can translate
 *
 * For React components, use useErrorToast() hook which handles translation.
 */

import { toast } from 'sonner'
import { router } from '@/router'


/**
 * Error recovery action type
 */
export type ErrorRecoveryAction = 'retry' | 'reload' | 'dismiss' | 'home' | 'custom'

/**
 * Extended error toast options with translation support
 */
export interface ErrorToastOptions {
    /** Action to take */
    action?: ErrorRecoveryAction
    /** Custom action label (pre-translated) */
    actionLabel?: string
    /** Translation key for action label (e.g., 'error.retry') */
    actionLabelKey?: string
    /** Custom action handler */
    onAction?: () => void | Promise<void>
    /** Error ID for deduplication */
    id?: string
    /** Toast duration in milliseconds */
    duration?: number
    /** Whether to show error details */
    showDetails?: boolean
    /** Pre-translated error message (use this OR messageKey) */
    message?: string
    /** Translation key for error message (e.g., 'error.file.tooLarge') */
    messageKey?: string
}

/**
 * Show error toast notification
 *
 * NOTE: This function does NOT call useTranslation() to comply with React's Rules of Hooks.
 * It can be called from any context (components, event handlers, API routes, etc.).
 *
 * @param error - Error object or message string
 * @param options - Toast options (use message for pre-translated text, messageKey for translation key)
 */
export function showErrorToast(error: Error | string, options?: ErrorToastOptions): void {
    // Get error message from error object or string
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorDetails = typeof error === 'object' ? error.stack : undefined

    // Determine the display message (priority: message > messageKey > error message)
    let displayMessage = options?.message ?? options?.messageKey ?? errorMessage

    const {
        action = 'dismiss',
        actionLabel,
        actionLabelKey,
        onAction,
        id,
        duration = 5000,
        showDetails = false,
    } = options || {}

    // Get action label (priority: actionLabel > actionLabelKey > default)
    let actionText = actionLabel ?? actionLabelKey
    if (!actionText) {
        // Use default action labels (non-translated - caller should provide if needed)
        switch (action) {
            case 'retry':
                actionText = 'Retry'
                break
            case 'reload':
                actionText = 'Reload'
                break
            case 'dismiss':
                actionText = 'Dismiss'
                break
            case 'home':
                actionText = 'Go Home'
                break
            case 'custom':
                actionText = 'Action'
                break
        }
    }

    // Show toast with action
    toast.error(displayMessage, {
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
                            if (typeof window !== 'undefined') {
                                window.location.reload()
                            }
                            break
                        case 'home':
                            if (typeof window !== 'undefined') {
                                // ARCH-01-01: Use TanStack Router navigation instead of window.location.href
                                router.navigate({ to: '/' })
                            }
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
    _error: Error,
    _errorInfo?: React.ErrorInfo
): ErrorRecoveryAction {
    /*
    const componentName = errorInfo?.componentStack
        ?.split('\n')
        .filter(line => line.trim())
        .pop() || 'Unknown Component'
    */

    return 'reload' as ErrorRecoveryAction;
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

    // Check if we're in a mobile context (safely without hooks)
    if (typeof window !== 'undefined') {
        const isMobile = window.matchMedia('(max-width: 767px)').matches
        const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches

        if (isMobile || isTablet) {
            return 'This feature requires a desktop browser. Please use Chrome, Edge, or Safari on your computer.'
        }
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
 * @returns Error handler object with onError and onSuccess methods
 */
export function createAsyncErrorHandler<T>(
    operationName: string
) {
    return {
        onError: (error: unknown, options?: ErrorToastOptions) => {
            logError(error, { operation: operationName })
            showErrorToast(error instanceof Error ? error : String(error), {
                action: 'retry',
                id: `${operationName}-error`,
                ...options,
            })
        },
        onSuccess: (result: T) => {
            showSuccessToast(`${operationName} completed successfully`)
            return result
        },
    }
}

/**
 * React hook for error toast notifications
 *
 * This hook provides a convenient way to show error toasts in React components
 * with automatic translation support.
 *
 * @example
 * ```typescript
 * const showError = useErrorToast()
 *
 * showError(new Error('File not found'), { action: 'retry' })
 * // OR with translation key
 * showError('error.file.notFound', { messageKey: 'error.file.notFound' })
 * ```
 */
export function useErrorToast() {
    // NOTE: This is a React hook - it can only be called in React components
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation()

    return useCallback(
        (error: Error | string, options?: ErrorToastOptions) => {
            // Determine message - priority: message > messageKey > error
            let displayMessage: string
            if (options?.message) {
                displayMessage = options.message
            } else if (options?.messageKey) {
                displayMessage = t(options.messageKey)
            } else {
                displayMessage = typeof error === 'string' ? error : error.message
            }

            // Get action label with translation
            let actionText: string | undefined
            if (options?.actionLabel) {
                actionText = options.actionLabel
            } else if (options?.actionLabelKey) {
                actionText = t(options.actionLabelKey)
            }

            showErrorToast(displayMessage, {
                ...options,
                message: displayMessage,
                actionLabel: actionText,
            })
        },
        [t]
    )
}

// Import useTranslation and useCallback at the end to avoid circular dependencies
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
