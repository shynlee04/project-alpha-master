import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { AppErrorBoundary } from '../components/common/AppErrorBoundary'
import { initSentry } from '../lib/monitoring/sentry'
import { ThemeProvider } from '../components/ui/ThemeProvider'

import appCss from '../styles.css?url'

// Initialize Sentry before React renders (client-only)
if (typeof window !== 'undefined') {
  initSentry()
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Via-gent | Intelligent Local Dev',
      },
      {
        property: 'og:locale',
        content: 'en',
      },
    ],
    links: [
      // Google Fonts preconnect for performance
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      // VIA-GENT Typography: VT323 (pixel), Press Start 2P (heavy pixel), Inter (body), JetBrains Mono (code)
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Press+Start+2P&family=VT323&display=swap',
      },
    ],
    scripts: [
      // TanStack Router Devtools
      {
        src: 'https://cdn.jsdelivr.net/npm/@tanstack/router-devtools@latest/bundle/index.js',
        type: 'module',
      },
    ],
  }),
  component: () => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <AppErrorBoundary>
              <Header />
              <TanStackRouterDevtoolsPanel />
              <TanStackDevtools />
              <hr />
              <Outlet />
            </AppErrorBoundary>
          </LocaleProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  ),
  notFoundComponent: () => <div>404 - Page Not Found</div>,
})
