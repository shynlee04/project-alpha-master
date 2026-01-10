import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'

// Header is deprecated - navigation now handled by MainLayout/MainSidebar
// import Header from '../components/Header'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { AppErrorBoundary } from '@/presentation/components/common/AppErrorBoundary'
import { AppInitializer } from '@/presentation/components/common/AppInitializer'
import { DatabaseRecoveryDialog } from '@/presentation/components/common/DatabaseRecoveryDialog'
import { initSentry } from '../lib/monitoring/sentry'
import { initGlobalErrorHandlers } from '@/lib/errorHandling/globalErrorHandlers'
import { ThemeProvider } from '@/presentation/components/ui/ThemeProvider'
import { TooltipProvider } from '@/presentation/components/ui/tooltip-react19-compatible'
import { ToastProvider, ToastContainer } from '@/presentation/components/ui/Toast'
import { MigrationStatus } from '@/presentation/components/agent/MigrationStatus'
import { UnifiedWorkspaceProvider } from '@/infrastructure/persistence/stores/workspace'
import { NotificationPermissionRequester } from '@/presentation/components/notifications/NotificationPermissionRequester'
import { CommandPalette } from '@/presentation/components/command-palette/CommandPalette'
import { useCommandPalette } from '@/hooks/useCommandPalette'

import appCss from '../styles.css?url'

// Initialize monitoring and error handlers before React renders (client-only)
if (typeof window !== 'undefined') {
  initSentry()
  initGlobalErrorHandlers()
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
      // VIA-GENT Main Stylesheet (includes design-tokens and animations)
      {
        rel: 'stylesheet',
        href: appCss,
      },
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
    ],
  }),
  component: () => {
    const commandPalette = useCommandPalette();

    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        {/* BUG-FIX-2026-01-11: Add suppressHydrationWarning to body to prevent locale mismatch warnings
           Server renders in English (fallbackLng), client may render in saved locale (vi/en) */}
        <body suppressHydrationWarning>
          <ThemeProvider>
            <LocaleProvider>
              <TooltipProvider>
                <ToastProvider>
                  <AppInitializer>
                    <UnifiedWorkspaceProvider initialWorkspace={"hub" as any}>
                      <AppErrorBoundary>
                        {/* Offline Indicator - TEMPORARILY DISABLED - investigating infinite loop */}
                        {/* <OfflineIndicator /> */}
                        {/* Notification Permission Requester */}
                        <NotificationPermissionRequester />
                        <Outlet />
                      </AppErrorBoundary>
                    </UnifiedWorkspaceProvider>
                  </AppInitializer>
                  {/* Toast Container - renders toast notifications */}
                  <ToastContainer />
                </ToastProvider>
              </TooltipProvider>
            </LocaleProvider>
          </ThemeProvider>
          {/* Migration Status Overlay */}
          <MigrationStatus />
          {/* Database Recovery Dialog - CRITICAL-FIX-2026-01-07 */}
          <DatabaseRecoveryDialog />
          {/* Command Palette */}
          <CommandPalette
            open={commandPalette.isOpen}
            onOpenChange={commandPalette.setIsOpen}
          />
          <Scripts />
        </body>
      </html>
    );
  },
  notFoundComponent: () => <div>404 - Page Not Found</div>,
})
