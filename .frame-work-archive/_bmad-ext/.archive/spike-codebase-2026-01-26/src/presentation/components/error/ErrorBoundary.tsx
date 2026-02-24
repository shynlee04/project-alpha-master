/**
 * React Error Boundary Component
 * @module components/error/ErrorBoundary
 *
 * Catches JavaScript errors in child components and displays fallback UI.
 * Enhanced with logging, recovery, and mobile-optimized error display.
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'
import { captureException } from '@/lib/monitoring/sentry'

/**
 * Props for ErrorBoundary component
 */
export interface ErrorBoundaryProps {
    /** Child components to wrap */
    children: ReactNode
    /** Custom fallback component */
    fallback?: ReactNode
    /** Custom error handler callback */
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    /** Show technical details in fallback (development only by default) */
    showDetails?: boolean
    /** Additional CSS classes for fallback */
    fallbackClassName?: string
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

/**
 * React Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs errors, and displays a fallback UI.
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * @example With custom error handler
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     console.error('Caught error:', error, errorInfo)
 *   }}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Update state with error info
        this.setState({
            error,
            errorInfo
        })

        // Log to console
        console.error('[ErrorBoundary] Caught error:', error)
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)

        // Send to Sentry if available
        try {
            captureException(error, {
                componentStack: errorInfo.componentStack,
                errorBoundary: true
            })
        } catch (sentryError) {
            console.warn('[ErrorBoundary] Failed to send error to Sentry:', sentryError)
        }

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo)
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Use default ErrorFallback
            return (
                <ErrorFallback
                    error={this.state.error || new Error('Unknown error')}
                    componentStack={this.state.errorInfo?.componentStack}
                    onReset={this.handleReset}
                    className={this.props.fallbackClassName}
                />
            )
        }

        return this.props.children
    }
}

/**
 * Functional wrapper for ErrorBoundary with hooks support
 *
 * @example
 * <WithErrorBoundary fallback={<CustomError />}>
 *   <YourComponent />
 * </WithErrorBoundary>
 */
export interface WithErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    showDetails?: boolean
    fallbackClassName?: string
}

export function WithErrorBoundary({
    children,
    fallback,
    onError,
    showDetails,
    fallbackClassName
}: WithErrorBoundaryProps): ReactNode {
    return (
        <ErrorBoundary
            fallback={fallback}
            onError={onError}
            showDetails={showDetails}
            fallbackClassName={fallbackClassName}
        >
            {children}
        </ErrorBoundary>
    )
}

export default ErrorBoundary
