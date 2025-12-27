/**
 * Custom Server Entry Point for Cloudflare Workers
 * 
 * This wraps TanStack Start's default handler to inject critical security headers:
 * - Cross-Origin-Opener-Policy: same-origin
 * - Cross-Origin-Embedder-Policy: require-corp
 * 
 * These headers are required for WebContainers to function (SharedArrayBuffer support).
 * 
 * @see https://webcontainers.io/guides/configuring-headers
 */
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

export default createServerEntry({
    async fetch(request) {
        // Get the response from TanStack Start's handler
        const response = await handler.fetch(request)

        // Clone headers and add COOP/COEP for WebContainer support
        const headers = new Headers(response.headers)

        // Cross-Origin Isolation (required for SharedArrayBuffer / WebContainers)
        headers.set('Cross-Origin-Opener-Policy', 'same-origin')
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

        // Additional security headers
        headers.set('X-Frame-Options', 'DENY')
        headers.set('X-Content-Type-Options', 'nosniff')
        headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

        // Return new response with modified headers
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        })
    },
})
