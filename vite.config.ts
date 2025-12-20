import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'


const devtoolsEventBusPort = Number(process.env.TANSTACK_DEVTOOLS_EVENT_BUS_PORT ?? 42071)

/**
 * Security Headers Plugin
 * Configures security headers for the dev server:
 * - Cross-Origin Isolation (required for WebContainers/SharedArrayBuffer)
 * - X-Frame-Options, X-Content-Type-Options
 * - Referrer-Policy, Permissions-Policy
 * 
 * Note: CSP is NOT set in dev server because it blocks:
 * - IndexedDB operations (idb persistence)
 * - File System Access API (local file sync)
 * - WebContainer internal operations
 * 
 * CSP is configured in public/_headers for production only.
 * 
 * @see https://webcontainers.io/guides/configuring-headers
 * @see https://owasp.org/www-project-secure-headers/
 */
const securityHeadersPlugin: Plugin = {
  name: 'configure-security-headers',
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      // Cross-Origin Isolation (required for WebContainers)
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

      // Security Headers (CSP omitted in dev - see note above)
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

      // Note: HSTS is only meaningful over HTTPS, skip in dev
      // CSP is only in production (public/_headers) - too restrictive for dev

      next()
    })
  },
}

const config = defineConfig({
  plugins: [
    securityHeadersPlugin, // Security headers (COOP/COEP + X-Frame-Options + etc.)
    devtools({ eventBusConfig: { port: devtoolsEventBusPort } }),
    netlify(), // Replaces nitro() for Netlify deployment with proper SSR header support
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config

