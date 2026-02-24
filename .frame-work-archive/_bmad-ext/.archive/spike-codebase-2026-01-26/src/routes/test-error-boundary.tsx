/**
 * Test Error Boundary Route
 * @module routes/test-error-boundary
 *
 * Route for testing error boundary functionality.
 * Intentionally throws errors to validate error handling.
 */

import { createFileRoute } from '@tanstack/react-router'
import { ErrorBoundary } from '@/presentation/components/error'
import { useState } from 'react'

export const Route = createFileRoute('/test-error-boundary')({
  component: TestErrorBoundaryPage,
})

function TestErrorBoundaryPage() {
  const [shouldThrow, setShouldThrow] = useState(false)
  const [shouldReject, setShouldReject] = useState(false)

  if (shouldThrow) {
    throw new Error('Test error from test-error-boundary route')
  }

  if (shouldReject) {
    // Trigger unhandled promise rejection
    Promise.reject(new Error('Test promise rejection from test-error-boundary'))
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Error Boundary Test Page</h1>
        <p className="text-muted-foreground mb-8">
          This page allows you to test the error boundary implementation by triggering different types of errors.
        </p>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Test 1: Synchronous Error</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Clicking this button will cause a React error that should be caught by the error boundary.
            </p>
            <button
              onClick={() => setShouldThrow(true)}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Throw Error
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Test 2: Promise Rejection</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Clicking this button will trigger an unhandled promise rejection that should be caught by the global handler.
            </p>
            <button
              onClick={() => setShouldReject(true)}
              className="px-4 py-2 bg-warning text-warning-foreground rounded-md hover:bg-warning/90 transition-colors"
            >
              Reject Promise
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Test 3: Nested Error Boundary</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Test error boundaries with nested components. The inner error boundary should catch the error.
            </p>
            <ErrorBoundary
              onError={(error) => {
                console.log('[Test] Inner error boundary caught:', error)
              }}
            >
              <button
                onClick={() => {
                  throw new Error('Inner error boundary test')
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Throw in Nested Boundary
              </button>
            </ErrorBoundary>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Expected Behavior</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Error boundary should catch React errors</li>
              <li>User-friendly fallback UI should appear</li>
              <li>Retry button should reset the error state</li>
              <li>Go Home button should navigate to /</li>
              <li>Reload Page button should refresh the page</li>
              <li>In development, error details should be shown</li>
              <li>Errors should be logged to console</li>
              <li>Errors should be sent to Sentry (if configured)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
