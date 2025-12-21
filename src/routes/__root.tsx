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
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LocaleProvider>
            <AppErrorBoundary>
              <Header />
              {children}
            </AppErrorBoundary>
            {process.env.NODE_ENV === 'development' && (
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
            )}
          </LocaleProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}

