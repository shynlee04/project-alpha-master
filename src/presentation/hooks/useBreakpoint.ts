/**
 * @fileoverview useBreakpoint Hook - Breakpoint detection for responsive layouts
 * @module presentation/hooks/useBreakpoint
 *
 * EPIC-UXUI-04: Responsive Layout Implementation
 * - 4-tier breakpoint system: mobile, tabletPortrait, tabletLandscape, desktop
 * - Real-time viewport detection with debounced resize handling
 * - Smooth transitions between breakpoints
 *
 * @story UXUI-04-07
 * @created 2026-01-30
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import type {
  ResponsiveBreakpoint,
  UseBreakpointReturn,
} from '@/presentation/components/layout/responsive-types';
import {
  BREAKPOINT_THRESHOLDS,
  RESIZE_DEBOUNCE_MS,
} from '@/presentation/components/layout/responsive-types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get breakpoint from viewport width
 *
 * @param width - Viewport width in pixels
 * @returns Current breakpoint category
 */
function getBreakpointFromWidth(width: number): ResponsiveBreakpoint {
  if (width >= BREAKPOINT_THRESHOLDS.desktop.min) {
    return 'desktop';
  }
  if (width >= BREAKPOINT_THRESHOLDS.tabletLandscape.min) {
    return 'tabletLandscape';
  }
  if (width >= BREAKPOINT_THRESHOLDS.tabletPortrait.min) {
    return 'tabletPortrait';
  }
  return 'mobile';
}

/**
 * Debounce function for resize events
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useBreakpoint Hook
 *
 * Detects current viewport breakpoint and provides responsive helpers.
 * Uses debounced resize handling to prevent excessive re-renders.
 *
 * @returns UseBreakpointReturn with breakpoint state and helpers
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { breakpoint, isMobile, isDesktop } = useBreakpoint();
 *
 *   if (isMobile) {
 *     return <MobileLayout />;
 *   }
 *
 *   return <DesktopLayout />;
 * }
 * ```
 */
export function useBreakpoint(): UseBreakpointReturn {
  // Initialize with SSR-safe defaults
  const [state, setState] = useState<{
    breakpoint: ResponsiveBreakpoint;
    width: number;
    height: number;
  }>(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      return {
        breakpoint: getBreakpointFromWidth(window.innerWidth),
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    // SSR fallback: Assume desktop
    return {
      breakpoint: 'desktop',
      width: 1440,
      height: 900,
    };
  });

  /**
   * Handle viewport resize
   */
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const newBreakpoint = getBreakpointFromWidth(width);

    setState((prevState) => {
      // Only update if something actually changed
      if (
        prevState.breakpoint === newBreakpoint &&
        prevState.width === width &&
        prevState.height === height
      ) {
        return prevState;
      }

      return {
        breakpoint: newBreakpoint,
        width,
        height,
      };
    });
  }, []);

  // Debounced resize handler
  const debouncedHandleResize = useMemo(
    () => debounce(handleResize, RESIZE_DEBOUNCE_MS),
    [handleResize]
  );

  /**
   * Handle orientation change (mobile browsers)
   */
  const handleOrientationChange = useCallback(() => {
    // Small delay to allow browser to update dimensions
    setTimeout(handleResize, 100);
  }, [handleResize]);

  useEffect(() => {
    // Initial calculation
    handleResize();

    // Listen for resize events (debounced)
    window.addEventListener('resize', debouncedHandleResize);

    // Listen for orientation changes (mobile)
    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [debouncedHandleResize, handleOrientationChange, handleResize]);

  // Memoize derived values
  const isMobile = state.breakpoint === 'mobile';
  const isTablet =
    state.breakpoint === 'tabletPortrait' ||
    state.breakpoint === 'tabletLandscape';
  const isDesktop = state.breakpoint === 'desktop';

  return {
    breakpoint: state.breakpoint,
    width: state.width,
    height: state.height,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * useBreakpoint Hook (default export)
 */
export default useBreakpoint;
