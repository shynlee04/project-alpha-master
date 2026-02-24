/**
 * @fileoverview useBreakpoint Enhanced Hook
 * @module presentation/hooks/useBreakpoint
 * @created 2026-01-28
 * @epic EPIC-UXUI-03
 * @story UXUI-03-12
 *
 * Enhanced 6-tier breakpoint hook per UX spec 04-responsive-grid.md:
 * - Phone Portrait (0-479px)
 * - Phone Landscape (480-599px)
 * - Tablet Portrait (600-767px)
 * - Tablet Landscape (768-1023px)
 * - Laptop (1024-1279px)
 * - Desktop (1280px+)
 *
 * Features:
 * - Orientation detection
 * - Max plugins calculation
 * - Layout mode determination
 * - Device type helpers (isMobile, isTablet, isDesktop)
 */

import { useEffect, useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * 6-tier breakpoint names per UX spec 04-responsive-grid.md
 */
export type EnhancedBreakpoint =
  | 'phone-portrait'
  | 'phone-landscape'
  | 'tablet-portrait'
  | 'tablet-landscape'
  | 'laptop'
  | 'desktop';

/**
 * Orientation type
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Layout mode based on screen size
 */
export type LayoutMode = 'full-screen' | 'single-panel' | 'multi-panel';

/**
 * Enhanced breakpoint state with all derived values
 */
export interface BreakpointState {
  /** Current 6-tier breakpoint name */
  breakpoint: EnhancedBreakpoint;
  /** Current orientation */
  orientation: Orientation;
  /** Maximum plugins that can be displayed */
  maxPlugins: 1 | 2 | 3 | 4;
  /** Current layout mode */
  layoutMode: LayoutMode;
  /** Whether current breakpoint is mobile (phone) */
  isMobile: boolean;
  /** Whether current breakpoint is tablet */
  isTablet: boolean;
  /** Whether current breakpoint is desktop/laptop */
  isDesktop: boolean;
  /** Current viewport width */
  width: number;
  /** Current viewport height */
  height: number;
  /** Whether bottom nav should be shown */
  showBottomNav: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Breakpoint pixel thresholds per UX spec 04-responsive-grid.md
 */
export const ENHANCED_BREAKPOINTS = {
  'phone-portrait': { min: 0, max: 479 },
  'phone-landscape': { min: 480, max: 599 },
  'tablet-portrait': { min: 600, max: 767 },
  'tablet-landscape': { min: 768, max: 1023 },
  'laptop': { min: 1024, max: 1279 },
  'desktop': { min: 1280, max: Infinity },
} as const;

/**
 * Layout rules per breakpoint
 */
export const BREAKPOINT_RULES: Record<
  EnhancedBreakpoint,
  {
    maxPlugins: 1 | 2 | 3 | 4;
    layoutMode: LayoutMode;
    showBottomNav: boolean;
  }
> = {
  'phone-portrait': {
    maxPlugins: 1,
    layoutMode: 'full-screen',
    showBottomNav: true,
  },
  'phone-landscape': {
    maxPlugins: 1,
    layoutMode: 'full-screen',
    showBottomNav: true,
  },
  'tablet-portrait': {
    maxPlugins: 2,
    layoutMode: 'single-panel',
    showBottomNav: true,
  },
  'tablet-landscape': {
    maxPlugins: 2,
    layoutMode: 'multi-panel',
    showBottomNav: false,
  },
  'laptop': {
    maxPlugins: 3,
    layoutMode: 'multi-panel',
    showBottomNav: false,
  },
  'desktop': {
    maxPlugins: 4,
    layoutMode: 'multi-panel',
    showBottomNav: false,
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get breakpoint from width
 */
function getBreakpointFromWidth(width: number): EnhancedBreakpoint {
  if (width <= ENHANCED_BREAKPOINTS['phone-portrait'].max) {
    return 'phone-portrait';
  }
  if (width <= ENHANCED_BREAKPOINTS['phone-landscape'].max) {
    return 'phone-landscape';
  }
  if (width <= ENHANCED_BREAKPOINTS['tablet-portrait'].max) {
    return 'tablet-portrait';
  }
  if (width <= ENHANCED_BREAKPOINTS['tablet-landscape'].max) {
    return 'tablet-landscape';
  }
  if (width <= ENHANCED_BREAKPOINTS['laptop'].max) {
    return 'laptop';
  }
  return 'desktop';
}

/**
 * Get orientation from dimensions
 */
function getOrientation(width: number, height: number): Orientation {
  return width >= height ? 'landscape' : 'portrait';
}

/**
 * Build full breakpoint state from dimensions
 */
function buildBreakpointState(width: number, height: number): BreakpointState {
  const breakpoint = getBreakpointFromWidth(width);
  const orientation = getOrientation(width, height);
  const rules = BREAKPOINT_RULES[breakpoint];

  return {
    breakpoint,
    orientation,
    maxPlugins: rules.maxPlugins,
    layoutMode: rules.layoutMode,
    showBottomNav: rules.showBottomNav,
    isMobile: breakpoint === 'phone-portrait' || breakpoint === 'phone-landscape',
    isTablet: breakpoint === 'tablet-portrait' || breakpoint === 'tablet-landscape',
    isDesktop: breakpoint === 'laptop' || breakpoint === 'desktop',
    width,
    height,
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Enhanced useBreakpoint hook with 6-tier system
 *
 * @returns BreakpointState with all derived values
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { breakpoint, isMobile, maxPlugins, showBottomNav } = useBreakpointEnhanced();
 *
 *   if (isMobile) {
 *     return <MobileLayout />;
 *   }
 *
 *   return <DesktopLayout maxPlugins={maxPlugins} />;
 * }
 * ```
 */
export function useBreakpointEnhanced(): BreakpointState {
  // Initialize with SSR-safe defaults
  const [state, setState] = useState<BreakpointState>(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      return buildBreakpointState(window.innerWidth, window.innerHeight);
    }
    // SSR fallback: Assume desktop
    return buildBreakpointState(1440, 900);
  });

  // Memoized resize handler
  const handleResize = useCallback(() => {
    const newState = buildBreakpointState(window.innerWidth, window.innerHeight);

    // Only update if breakpoint actually changed (avoid unnecessary re-renders)
    setState((prevState) => {
      if (
        prevState.breakpoint === newState.breakpoint &&
        prevState.orientation === newState.orientation &&
        prevState.width === newState.width &&
        prevState.height === newState.height
      ) {
        return prevState;
      }
      return newState;
    });
  }, []);

  // Orientation change handler (mobile browsers)
  const handleOrientationChange = useCallback(() => {
    // Small delay to allow browser to update dimensions
    setTimeout(handleResize, 100);
  }, [handleResize]);

  useEffect(() => {
    // Initial calculation
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    // Listen for orientation changes (mobile)
    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [handleResize, handleOrientationChange]);

  return state;
}

// ============================================================================
// Exports
// ============================================================================

export default useBreakpointEnhanced;
