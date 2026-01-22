/**
 * @fileoverview useBreakpoint - Platform-aware breakpoint detection hook
 * @module presentation/layouts/useBreakpoint
 *
 * **ARCH-03-02**: Mobile-Responsive Plugin Layouts
 *
 * Platform-aware breakpoint detection hook that:
 * - Integrates with platform-contract.ts (canonical platform detection)
 * - Detects mobile, tablet, desktop viewports
 * - Enforces responsive layout rules per ADR-034
 * - Provides 8-bit design compliant breakpoint values
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-02
 * @team Team B
 * @created 2026-01-22
 */

import { useEffect, useState } from 'react';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

// ============================================================================
// Types
// ============================================================================

/**
 * Breakpoint type for responsive layout
 *
 * @remarks
 * Defines viewport breakpoints for different device categories:
 * - mobile: Small phones (< 414px)
 * - mobileLg: Large phones (414-768px)
 * - tablet: Tablets (768-1024px)
 * - desktop: Desktops (1024-1440px)
 * - wide: Large desktops (> 1440px)
 */
export type Breakpoint = 'mobile' | 'mobileLg' | 'tablet' | 'desktop' | 'wide';

/**
 * Breakpoint pixel values
 *
 * @remarks
 * Standard viewport breakpoints based on common device sizes:
 * - 375px: iPhone SE (small mobile)
 * - 414px: iPhone Pro Max (large mobile)
 * - 768px: iPad portrait (tablet)
 * - 1024px: iPad landscape / small laptop (desktop)
 * - 1440px: Desktop large (wide)
 */
export const BREAKPOINTS = {
  mobile: 375,    // iPhone SE
  mobileLg: 414,  // iPhone Pro Max
  tablet: 768,    // iPad portrait
  desktop: 1024,  // iPad landscape / small laptop
  wide: 1440,     // Desktop
} as const;

/**
 * Layout rules per breakpoint
 *
 * @remarks
 * Defines responsive behavior per viewport:
 * - maxPlugins: Maximum number of plugins to display
 * - layoutMode: Default layout mode for this breakpoint
 * - sidebarMode: How sidebar behaves (overlay/collapsible/persistent)
 * - showBottomNav: Whether to show bottom navigation (mobile only)
 *
 * Mobile: Single plugin fullscreen, bottom nav, overlay sidebar
 * Tablet: 2-column max, collapsible sidebar
 * Desktop: Full layout options, persistent sidebar
 */
export const LAYOUT_RULES: Record<Breakpoint, {
  maxPlugins: number;
  layoutMode: '1-column' | '2-column' | 'user-selected';
  sidebarMode: 'overlay' | 'collapsible' | 'persistent';
  showBottomNav: boolean;
}> = {
  mobile: {
    maxPlugins: 1,
    layoutMode: '1-column',
    sidebarMode: 'overlay',
    showBottomNav: true,
  },
  mobileLg: {
    maxPlugins: 1,
    layoutMode: '1-column',
    sidebarMode: 'overlay',
    showBottomNav: true,
  },
  tablet: {
    maxPlugins: 2,
    layoutMode: '2-column',
    sidebarMode: 'collapsible',
    showBottomNav: false,
  },
  desktop: {
    maxPlugins: 5,
    layoutMode: 'user-selected',
    sidebarMode: 'persistent',
    showBottomNav: false,
  },
  wide: {
    maxPlugins: 5,
    layoutMode: 'user-selected',
    sidebarMode: 'persistent',
    showBottomNav: false,
  },
} as const;

// ============================================================================
// useBreakpoint Hook
// ============================================================================

/**
 * useBreakpoint Hook
 *
 * @returns Current breakpoint
 *
 * @remarks
 * Platform-aware breakpoint detection:
 * 1. Checks platform contract for device type (mobile/tablet/desktop)
 * 2. Sets initial breakpoint based on platform
 * 3. Listens for window resize events to update breakpoint
 * 4. Returns cached breakpoint to avoid unnecessary re-renders
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const breakpoint = useBreakpoint();
 *   const rules = LAYOUT_RULES[breakpoint];
 *
 *   return (
 *     <div className={`breakpoint-${breakpoint}`}>
 *       Max plugins: {rules.maxPlugins}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    /**
     * Get platform contract (canonical source of platform info)
     *
     * @remarks
     * - Imported from @/infrastructure/filesystem/platform-contract.ts
     * - NOT from @/infrastructure/filesystem/platform-detection.ts
     * - Per ADR-034 Amendment 001
     */
    const platform = getPlatformContract();

    /**
     * Handle resize event
     *
     * @remarks
     * Detects breakpoint based on window width:
     * - < 414px: mobile (iPhone SE)
     * - 414-768px: mobileLg (iPhone Pro Max)
     * - 768-1024px: tablet (iPad)
     * - 1024-1440px: desktop
     * - > 1440px: wide
     */
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < BREAKPOINTS.mobileLg) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('mobileLg');
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint('tablet');
      } else if (width < BREAKPOINTS.wide) {
        setBreakpoint('desktop');
      } else {
        setBreakpoint('wide');
      }
    };

    /**
     * Set initial breakpoint based on platform
     *
     * @remarks
     * - Mobile devices start at 'mobile' breakpoint
     * - Tablet devices start at 'tablet' breakpoint
     * - Desktop devices start at 'desktop' breakpoint
     * - This ensures correct initial state even on resize
     */
    if (platform.deviceType === 'mobile') {
      setBreakpoint('mobile');
    } else if (platform.deviceType === 'tablet') {
      setBreakpoint('tablet');
    }

    // For desktop, use actual viewport size
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty deps - only run on mount

  return breakpoint;
}

// ============================================================================
// No additional exports - hook and constants exported above
// ============================================================================
