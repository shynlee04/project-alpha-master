import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'


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

// Note: TS type error is expected - Vite 7's defineConfig types don't fully support async + environments.
// The config runs correctly at runtime. This is a known Vite 7 type definition limitation.
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
      // Tailwind CSS 4 - configuration is done in CSS using @theme directives
      // Content detection is automatic in v4
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
    // Explicit path alias for Vite 7 compatibility
    // vite-tsconfig-paths may not fully resolve in all SSR/edge contexts
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Dependency optimization config - exclude native modules from pre-bundling
    // These packages contain .node native modules that esbuild cannot process
    optimizeDeps: {
      exclude: [
        'sharp',
        'onnxruntime-node',
        '@xenova/transformers',
      ],
    },
    // Vite 7 environment-specific config for SSR optimization
    environments: {
      ssr: {
        optimizeDeps: {
          exclude: [
            'sharp',
            'onnxruntime-node',
            '@xenova/transformers',
          ],
        },
      },
    },
    // SSR Configuration
    // Cloudflare plugin handles externals/bundling automatically when using viteEnvironment: { name: 'ssr' }
    // Therefore, we do NOT set 'external' array for Cloudflare (would conflict with plugin)
    // We only specify 'noExternal' to bundle specific client-side libraries
    ssr: DEPLOY_TARGET === 'cloudflare'
      ? {
        // Bundle everything for Cloudflare EXCEPT large client-side-only libraries and native modules
        // These are accessed via dynamic import (React.lazy) and guarded by client checks
        // Cloudflare plugin handles Node.js externals automatically - DO NOT add 'external' here
        noExternal: /^(?!(@monaco-editor|monaco-editor|@xterm|@xenova|pdfjs-dist|@blocknote|sharp|onnxruntime-node|onnxruntime-web)).*$/,
      }
      : {
        external: [
          '@xterm/xterm',
          '@xterm/addon-fit',
          '@monaco-editor/react',
          'monaco-editor',
          '@webcontainer/api',
          'sharp',
          'onnxruntime-node',
          '@xenova/transformers',
        ],
        noExternal: [],
      },
  }
})

export default config
