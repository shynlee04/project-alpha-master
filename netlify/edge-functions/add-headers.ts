import type { Config, Context } from '@netlify/edge-functions'

/**
 * Netlify Edge Function Middleware for Cross-Origin Isolation Headers
 * 
 * This middleware adds COOP/COEP headers to ALL responses, including
 * SSR-rendered HTML which doesn't receive headers from _headers or netlify.toml.
 * 
 * Required for:
 * - WebContainers (SharedArrayBuffer)
 * - High-resolution timers
 * - Cross-origin isolated features
 * 
 * @see https://webcontainers.io/guides/configuring-headers
 * @see https://docs.netlify.com/edge-functions/overview/
 */
export default async function handler(
    request: Request,
    context: Context
): Promise<Response> {
    // Get the response from the origin (SSR or static)
    const response = await context.next()

    // Clone headers to make them mutable
    const headers = new Headers(response.headers)

    // =========================================================================
    // Cross-Origin Isolation Headers (REQUIRED for WebContainers)
    // =========================================================================
    headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

    // =========================================================================
    // Security Headers (Best Practice)
    // =========================================================================
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Return new response with added headers
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

// Apply to all paths
export const config: Config = {
    path: '/*',
}
