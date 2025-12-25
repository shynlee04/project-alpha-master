import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

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
      tailwindcss({
        content: [
          './index.html',
          './src/**/*.{js,ts,jsx,tsx}',
        ],
        theme: {
          extend: {
            // Design tokens from src/styles/design-tokens.css
            colors: {
              primary: 'var(--color-primary-500)',
              'primary-dark': 'var(--color-primary-600)',
              secondary: 'var(--color-secondary-500)',
              'secondary-dark': 'var(--color-secondary-600)',
              neutral: {
                50: 'var(--color-neutral-50)',
                100: 'var(--color-neutral-100)',
                200: 'var(--color-neutral-200)',
                300: 'var(--color-neutral-300)',
                400: 'var(--color-neutral-400)',
                500: 'var(--color-neutral-500)',
                600: 'var(--color-neutral-600)',
                700: 'var(--color-neutral-700)',
                800: 'var(--color-neutral-800)',
                900: 'var(--color-neutral-900)',
                950: 'var(--color-neutral-950)',
              },
              semantic: {
                success: 'var(--color-success-500)',
                warning: 'var(--color-warning-500)',
                error: 'var(--color-error-500)',
                info: 'var(--color-info-500)',
              },
              '8-bit': {
                retro: {
                  cyan: 'var(--color-8bit-retro-cyan)',
                  magenta: 'var(--color-8bit-retro-magenta)',
                  yellow: 'var(--color-8bit-retro-yellow)',
                  green: 'var(--color-8bit-retro-green)',
                  'red': 'var(--color-8bit-retro-red)',
                  blue: 'var(--color-8bit-retro-blue)',
                  orange: 'var(--color-8bit-retro-orange)',
                  purple: 'var(--color-8bit-retro-purple)',
                },
                pixel: {
                  black: 'var(--color-8bit-pixel-black)',
                  white: 'var(--color-8bit-pixel-white)',
                  gray: 'var(--color-8bit-pixel-gray)',
                },
              },
            },
            spacing: {
              '0': 'var(--spacing-0)',
              '1': 'var(--spacing-1)',
              '2': 'var(--spacing-2)',
              '3': 'var(--spacing-3)',
              '4': 'var(--spacing-4)',
              '5': 'var(--spacing-5)',
              '6': 'var(--spacing-6)',
              '7': 'var(--spacing-7)',
              '8': 'var(--spacing-8)',
              '9': 'var(--spacing-9)',
              '10': 'var(--spacing-10)',
              '11': 'var(--spacing-11)',
              '12': 'var(--spacing-12)',
              '13': 'var(--spacing-13)',
              '14': 'var(--spacing-14)',
              '15': 'var(--spacing-15)',
              '16': 'var(--spacing-16)',
              '17': 'var(--spacing-17)',
              '18': 'var(--spacing-18)',
              '19': 'var(--spacing-19)',
              '20': 'var(--spacing-20)',
              '21': 'var(--spacing-21)',
              '22': 'var(--spacing-22)',
              '23': 'var(--spacing-23)',
              '24': 'var(--spacing-24)',
              'panel': 'var(--spacing-panel)',
              'component': 'var(--spacing-component)',
            },
            borderRadius: {
              'none': 'var(--radius-none)',
              'sm': 'var(--radius-sm)',
              'base': 'var(--radius-base)',
              'md': 'var(--radius-md)',
              'lg': 'var(--radius-lg)',
              'xl': 'var(--radius-xl)',
              '2xl': 'var(--radius-2xl)',
              'full': 'var(--radius-full)',
            },
            boxShadow: {
              'none': 'var(--shadow-none)',
              'sm': 'var(--shadow-sm)',
              'md': 'var(--shadow-md)',
              'lg': 'var(--shadow-lg)',
              'xl': 'var(--shadow-xl)',
              '2xl': 'var(--shadow-2xl)',
              'colored': {
                'primary': 'var(--shadow-colored-primary)',
                'success': 'var(--shadow-colored-success)',
                'warning': 'var(--shadow-colored-warning)',
                'error': 'var(--shadow-colored-error)',
              },
            },
            transitionDuration: {
              'fast': 'var(--duration-fast)',
              'normal': 'var(--duration-normal)',
              'slow': 'var(--duration-slow)',
            },
            transitionTiming: {
              'ease-in': 'var(--ease-in-out)',
              'ease-out': 'var(--ease-out-in)',
              'ease-in-out': 'var(--ease-in-out)',
              'bounce': 'var(--ease-bounce)',
            },
            fontSize: {
              'xs': 'var(--text-xs)',
              'sm': 'var(--text-sm)',
              'base': 'var(--text-base)',
              'lg': 'var(--text-lg)',
              'xl': 'var(--text-xl)',
              '2xl': 'var(--text-2xl)',
              '3xl': 'var(--text-3xl)',
              '4xl': 'var(--text-4xl)',
              '5xl': 'var(--text-5xl)',
            },
            lineHeight: {
              'tight': 'var(--leading-tight)',
              'normal': 'var(--leading-normal)',
              'relaxed': 'var(--leading-relaxed)',
            },
            letterSpacing: {
              'tighter': 'var(--tracking-tighter)',
              'tight': 'var(--tracking-tight)',
              'normal': 'var(--tracking-normal)',
              'wide': 'var(--tracking-wide)',
              'wider': 'var(--tracking-wider)',
            },
            fontFamily: {
              sans: 'var(--font-sans)',
              mono: 'var(--font-mono)',
              pixel: 'var(--font-pixel)',
            },
            zIndex: {
              'dropdown': 'var(--z-index-dropdown)',
              'modal': 'var(--z-index-modal)',
              'tooltip': 'var(--z-index-tooltip)',
              'toast': 'var(--z-index-toast)',
            },
          },
        },
      }),
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
