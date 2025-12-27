/**
 * Generic Error Boundary Component
 * @module components/common/ErrorBoundary
 *
 * Provides a reusable error boundary for wrapping critical components.
 * Shows fallback UI when React errors occur in child components.
 */

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/ui/ErrorState'

/**
 * Props for ErrorBoundary
 */
export interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    showDetails?: boolean
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
 * Generic Error Boundary Component
 * 
 * Catches JavaScript errors in child components and displays a fallback UI.
 * Can be used to wrap any component that needs error handling.
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
        this.setState({
            error,
            errorInfo
        })

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo)

        // Log error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo)
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

            // Use default ErrorState fallback
            return (
                <ErrorState
                    error={this.state.error?.message || 'Unknown error'}
                    variant="default"
                    action="retry"
                    onAction={this.handleReset}
                    showDetails={this.props.showDetails}
                />
            )
        }

        return this.props.children
    }
}

/**
 * Functional wrapper for using ErrorBoundary
 * 
 * Example usage:
 * ```tsx
 * <WithErrorBoundary>
 *   <YourComponent />
 * </WithErrorBoundary>
 * ```
 */
export interface WithErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    showDetails?: boolean
}

export function WithErrorBoundary({
    children,
    fallback,
    onError,
    showDetails
}: WithErrorBoundaryProps): ReactNode {
    return (
        <ErrorBoundary
            fallback={fallback}
            onError={onError}
            showDetails={showDetails}
        >
            {children}
        </ErrorBoundary>
    )
}
