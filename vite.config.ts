import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// Conditional import for deployment platform
// Use DEPLOY_TARGET env var: 'cloudflare' | 'netlify' | 'node'
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || 'cloudflare'

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
 * Production headers are handled by server/middleware/security-headers.ts
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

      next()
    })
  },
}

// Dynamic plugin loading based on deployment target
async function getDeploymentPlugin() {
  if (DEPLOY_TARGET === 'cloudflare') {
    const { cloudflare } = await import('@cloudflare/vite-plugin')
    return cloudflare({ viteEnvironment: { name: 'ssr' } })
  } else if (DEPLOY_TARGET === 'netlify') {
    const netlify = (await import('@netlify/vite-plugin-tanstack-start')).default
    return netlify()
  }
  // For 'node' or other targets, no additional plugin needed
  return null
}

const config = defineConfig(async () => {
  const deployPlugin = await getDeploymentPlugin()

  return {
    plugins: [
      securityHeadersPlugin,
      devtools({ eventBusConfig: { port: devtoolsEventBusPort } }),
      ...(deployPlugin ? [deployPlugin] : []),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
    // SSR Configuration
    // Cloudflare plugin handles externals/bundling automatically
    ssr: DEPLOY_TARGET === 'cloudflare'
      ? { noExternal: true } // Bundle everything for Cloudflare
      : {
        external: [
          '@xterm/xterm',
          '@xterm/addon-fit',
          '@monaco-editor/react',
          'monaco-editor',
          '@webcontainer/api',
        ],
        noExternal: [],
      },
  }
})

export default config
