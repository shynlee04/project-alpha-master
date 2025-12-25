n/**
 * Security Headers Middleware
 * 
 * Injects COOP/COEP headers required for WebContainers on all SSR responses.
 * This middleware complements the routeRules in app.config.ts to ensure
 * headers are set regardless of deployment platform.
 * 
 * @see https://webcontainers.io/guides/configuring-headers
 */
import { defineEventHandler } from 'vinxi/http'

export default defineEventHandler((event) => {
    // Cross-Origin Isolation (required for WebContainers/SharedArrayBuffer)
    event.node.res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    event.node.res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
    event.node.res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

    // Security Headers
    event.node.res.setHeader('X-Frame-Options', 'DENY')
    event.node.res.setHeader('X-Content-Type-Options', 'nosniff')
    event.node.res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    event.node.res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // HSTS
    event.node.res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
})
