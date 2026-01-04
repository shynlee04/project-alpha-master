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
  } else if (DEPLOY_TARGET === 'vercel') {
    // Vercel deployment relies on standard Vite build + vercel.json configuration
    // or usage of Nitro if integrated. For basic TanStack Start, standard build is often sufficient
    // if vercel.json rewrites are set.
    // However, if using Nitro via 'noExternal' logic is insufficient, we might need explicit handling.
    // For now, returning null as standard build + vercel.json is the strategy.
    return null
  }
  // For 'node' or other targets, no additional plugin needed
  return null
}

// Note: TS type error is expected - Vite 7's defineConfig types don't fully support async + environments.
// The config runs correctly at runtime. This is a known Vite 7 type definition limitation.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite 7 async config not fully typed
const config = defineConfig(async () => {
  const deployPlugin = await getDeploymentPlugin()

  return {
    plugins: [

      {
        name: 'ssr-alias-resolve',
        enforce: 'pre',
        resolveId(source: string, _importer: any, options: any) {
          // Check for SSR build using options.ssr (Vite 6/classic) or environment name (Vite 7)
          const isSsr = options?.ssr === true || (this.environment as any)?.name === 'ssr'

          if (isSsr) {
            // Exact matches for heavy client-side libraries
            const heavyLibraries = [
              // Mermaid ecosystem (~500KB)
              'mermaid',
              'cytoscape',
              'cytoscape-dagre',
              'dagre-d3',
              'dagre-d3-es',
              'khroma',
              'stylis',
              // D3 ecosystem (~400KB total)
              'd3',
              'd3-array',
              'd3-color',
              'd3-format',
              'd3-interpolate',
              'd3-path',
              'd3-scale',
              'd3-selection',
              'd3-shape',
              'd3-time',
              'd3-time-format',
              'd3-transition',
              'd3-zoom',
              'd3-drag',
              'd3-ease',
              'd3-force',
              // BlockNote editor (~400KB)
              '@blocknote/react',
              '@blocknote/core',
              '@blocknote/mantine',
              // ML/AI transformers (~800KB)
              '@xenova/transformers',
              'onnxruntime-node',
              'onnxruntime-web',
              // PDF parsing
              'pdfjs-dist',
              // Resizable panels
              'react-resizable-panels',
              // Monaco Editor (~5MB)
              '@monaco-editor/react',
              'monaco-editor',
              // XTerm (~300KB)
              '@xterm/xterm',
              '@xterm/addon-fit',
              '@xterm/addon-web-links',
              '@xterm/addon-webgl',
              // React Flow (~200KB)
              '@xyflow/react',
              '@xyflow/system',
              // WebContainer - browser only
              '@webcontainer/api',
              // Image processing
              'sharp',
              // KaTeX - math rendering (~200KB)
              'katex',
            ]

            // Check exact match
            if (heavyLibraries.includes(source)) {
              return path.resolve(__dirname, './src/lib/mocks/empty.ts')
            }

            // Check prefix match (for sub-paths like 'd3/src/...')
            const heavyPrefixes = ['d3-', 'mermaid/', 'cytoscape', '@blocknote/', '@xyflow/', '@xterm/', 'monaco-editor/']
            for (const prefix of heavyPrefixes) {
              if (source.startsWith(prefix)) {
                return path.resolve(__dirname, './src/lib/mocks/empty.ts')
              }
            }
          }
        }
      },
      securityHeadersPlugin,
      tanstackStart(),
      devtools({ eventBusConfig: { port: devtoolsEventBusPort } }),
      ...(deployPlugin ? [deployPlugin] : []),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      // Tailwind CSS 4 - configuration is done in CSS using @theme directives
      // Content detection is automatic in v4
      tailwindcss(),
      viteReact(),
    ],
    // Explicit path alias for Vite 7 compatibility
    // vite-tsconfig-paths may not fully resolve in all SSR/edge contexts
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Build configuration
    build: {
      // Increase warning limit since we have large vendor chunks
      chunkSizeWarningLimit: 600,
      // Let Vite handle code splitting automatically - custom manualChunks was causing build issues
      // TODO: Re-enable manual chunking after fixing circular dependencies (Epic 53/STAB-25)
    },
    // Dependency optimization config - exclude native modules from pre-bundling
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
            // Client-only libraries that cause SSR issues
            '@blocknote/core',
            '@blocknote/react',
            '@blocknote/mantine',
            '@xyflow/react',
            'react-resizable-panels',
          ],
        },
      },
    },
    // SSR Configuration
    // NOTE: Cloudflare Vite plugin does NOT support ssr.external - it handles bundling itself
    // For Cloudflare, we rely on the ssr-alias-resolve plugin above to redirect heavy libs to empty.ts
    // For other targets (node, vercel), we use external to exclude heavy libs
    ssr: DEPLOY_TARGET === 'cloudflare'
      ? {
        // Cloudflare plugin handles everything - just set noExternal to bundle all
        // The alias plugin redirects heavy libs to empty.ts during SSR resolution
        noExternal: true as const,
      }
      : {
        // For node/vercel, explicitly externalize heavy client-only libraries
        external: [
          '@monaco-editor/react',
          'monaco-editor',
          '@xterm/xterm',
          '@xterm/addon-fit',
          '@xenova/transformers',
          'onnxruntime-node',
          'onnxruntime-web',
          'pdfjs-dist',
          '@blocknote/core',
          '@blocknote/react',
          '@blocknote/mantine',
          '@xyflow/react',
          'react-resizable-panels',
          'cytoscape',
          'mermaid',
          'khroma',
          'stylis',
          '@webcontainer/api',
          'sharp',
        ],
        noExternal: [],
      },
  }
})

export default config
