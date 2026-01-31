/**
 * Error Components Barrel Export
 * @module components/error
 *
 * Centralized exports for all error handling components.
 */

export { ErrorBoundary, WithErrorBoundary } from './ErrorBoundary'
export type { ErrorBoundaryProps, WithErrorBoundaryProps } from './ErrorBoundary'

export { ErrorFallback } from './ErrorFallback'
export type { ErrorFallbackProps } from './ErrorFallback'

export { ErrorMessage, ErrorWithRetry } from './ErrorMessage'
export type { ErrorMessageProps, ErrorWithRetryProps, RecoveryAction, ErrorSeverity } from './ErrorMessage'
