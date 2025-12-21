/**
 * Sentry Error Monitoring Configuration
 * @module lib/monitoring/sentry
 *
 * Client-side only initialization of Sentry for error tracking.
 * Designed for graceful degradation when DSN is not configured.
 */

import * as Sentry from '@sentry/react'

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined'

/**
 * Get Sentry configuration from environment variables
 */
function getSentryConfig() {
    if (!isBrowser) {
        return null
    }

    const dsn = import.meta.env.VITE_SENTRY_DSN
    const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development'
    const sampleRate = parseFloat(import.meta.env.VITE_SENTRY_SAMPLE_RATE || '1.0')

    if (!dsn) {
        console.warn('[Sentry] DSN not configured. Error monitoring disabled.')
        return null
    }

    return {
        dsn,
        environment,
        sampleRate,
    }
}

/**
 * Initialize Sentry error monitoring
 * 
 * @returns true if Sentry was initialized, false otherwise
 * 
 * @example
 * // Call once at app startup (before React renders)
 * import { initSentry } from './lib/monitoring/sentry'
 * initSentry()
 */
export function initSentry(): boolean {
    const config = getSentryConfig()

    if (!config) {
        return false
    }

    try {
        Sentry.init({
            dsn: config.dsn,
            environment: config.environment,

            // Sample rate for error events (0.0 to 1.0)
            sampleRate: config.sampleRate,

            // Only enable in production by default
            enabled: config.environment === 'production' || !!import.meta.env.VITE_SENTRY_FORCE_ENABLED,

            // Performance monitoring (optional, disabled by default for bundle size)
            // tracesSampleRate: 0.1,

            // Don't send PII by default
            sendDefaultPii: false,

            // Integrations
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration({
                    // Only capture replays on errors
                    maskAllText: true,
                    blockAllMedia: true,
                }),
            ],

            // Before send hook for filtering
            beforeSend(event) {
                // Filter out development errors if desired
                if (config.environment === 'development') {
                    console.debug('[Sentry] Would send event:', event)
                }
                return event
            },
        })

        console.info(`[Sentry] Initialized (${config.environment})`)
        return true
    } catch (error) {
        console.error('[Sentry] Failed to initialize:', error)
        return false
    }
}

/**
 * Check if Sentry is currently initialized
 */
export function isSentryEnabled(): boolean {
    return isBrowser && Sentry.getCurrentHub?.()?.getClient?.() !== undefined
}

/**
 * Set user context for error reports
 * 
 * @param user - User information to attach to error reports
 * 
 * @example
 * setSentryUser({ id: 'user-123', email: 'user@example.com' })
 */
export function setSentryUser(user: { id?: string; email?: string; username?: string } | null): void {
    if (!isBrowser) return
    Sentry.setUser(user)
}

/**
 * Add breadcrumb for debugging context
 */
export function addSentryBreadcrumb(
    category: string,
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
    if (!isBrowser) return
    Sentry.addBreadcrumb({
        category,
        message,
        level,
    })
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
    if (!isBrowser) return
    Sentry.captureException(error, {
        extra: context,
    })
}

// Re-export Sentry components for convenient access
export { Sentry }
