"use client"

/**
 * OverlayRoot Component (UX-02)
 *
 * Purpose: Provides a unified portal root for all modals, popovers, and overlays.
 * Ensures consistent z-index stacking and prevents clipping issues.
 *
 * Usage:
 * 1. Wrap your app with <OverlayRoot>
 * 2. Use useOverlayRoot() hook to get portal container ref
 * 3. Pass containerRef to Radix Portal components via containerRef prop
 *
 * Z-Index Scale (from UX-01):
 * - --z-dropdown: 10  (Dropdowns, tooltips)
 * - --z-sticky: 20    (Sticky headers)
 * - --z-sidebar: 30    (Fixed sidebars)
 * - --z-panel: 40      (Fixed panels, status overlays)
 * - --z-modal: 50      (Modals, dialogs)
 * - --z-toast: 60      (Toast notifications)
 * - --z-popover: 70    (Priority popovers)
 * - --z-overlay: 80    (Full-screen overlays)
 * - --z-alert: 90      (Critical alerts)
 * - --z-debug: 100     (Debug overlays)
 */

import * as React from "react"

const OverlayRootContext = React.createContext<{
  containerRef: React.RefObject<HTMLDivElement | null>
} | null>(null)

export interface OverlayRootProps {
  children: React.ReactNode
  className?: string
}

/**
 * OverlayRoot - Provider component for unified overlay rendering
 *
 * Place this at the root of your app to provide a consistent portal container
 * for all modals, popovers, and overlays.
 */
export function OverlayRoot({ children, className }: OverlayRootProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  return (
    <OverlayRootContext.Provider value={{ containerRef }}>
      {children}
      {/* Unified portal container for all overlays */}
      <div
        ref={containerRef}
        className={className}
        style={{
          // Ensure this doesn't create its own stacking context
          position: 'static',
          // Use z-index token for consistency
          zIndex: 'var(--z-base)',
        }}
        data-overlay-root
        aria-hidden="true"
      />
    </OverlayRootContext.Provider>
  )
}

/**
 * Hook to access the overlay root container
 *
 * Usage in components that need to render via portal:
 * ```tsx
 * const { containerRef } = useOverlayRoot()
 * return (
 *   <DialogPrimitive.Portal containerRef={containerRef}>
 *     ...
 *   </DialogPrimitive.Portal>
 * )
 * ```
 */
export function useOverlayRoot() {
  const context = React.useContext(OverlayRootContext)

  if (!context) {
    throw new Error(
      'useOverlayRoot must be used within an OverlayRoot provider. ' +
      'Wrap your app with <OverlayRoot> at the root level.'
    )
  }

  return context
}

/**
 * HOC to configure a Radix UI Portal component to use OverlayRoot
 *
 * Usage:
 * ```tsx
 * const DialogPortalWithOverlayRoot = withOverlayRoot(DialogPrimitive.Portal)
 * ```
 */
export function withOverlayRoot<P extends { containerRef?: React.RefObject<HTMLElement> }>(
  PortalComponent: React.ComponentType<P>
) {
  return function OverlayRootPortal(props: Omit<P, 'containerRef'>) {
    const { containerRef } = useOverlayRoot()
    return <PortalComponent {...(props as P)} containerRef={containerRef} />
  }
}
