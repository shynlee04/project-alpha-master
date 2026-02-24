/**
 * @fileoverview useResponsiveLayout Hook - Layout state management for responsive design
 * @module presentation/hooks/useResponsiveLayout
 *
 * EPIC-UXUI-04: Responsive Layout Implementation
 * - Manages layout state across breakpoint changes
 * - Preserves plugin assignments when switching layouts
 * - Handles layout transitions smoothly
 *
 * @story UXUI-04-07
 * @created 2026-01-30
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { useBreakpoint } from './useBreakpoint';
import type {
  ResponsiveBreakpoint,
  ResponsiveLayoutMode,
  BreakpointLayoutConfig,
  UseResponsiveLayoutReturn,
  ResponsiveLayoutState,
} from '@/presentation/components/layout/responsive-types';
import {
  BREAKPOINT_CONFIGS,
  LAYOUT_TRANSITION_DURATION,
} from '@/presentation/components/layout/responsive-types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get layout mode from breakpoint
 *
 * @param breakpoint - Current breakpoint
 * @returns Layout mode for the breakpoint
 */
function getLayoutModeFromBreakpoint(
  breakpoint: ResponsiveBreakpoint
): ResponsiveLayoutMode {
  const config = BREAKPOINT_CONFIGS[breakpoint];
  return config.layoutMode;
}

/**
 * Get layout configuration for breakpoint
 *
 * @param breakpoint - Current breakpoint
 * @returns Layout configuration
 */
function getLayoutConfig(
  breakpoint: ResponsiveBreakpoint
): BreakpointLayoutConfig {
  return BREAKPOINT_CONFIGS[breakpoint];
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useResponsiveLayout Hook
 *
 * Manages responsive layout state including breakpoint detection,
 * layout mode transitions, and plugin visibility constraints.
 * Integrates with PluginLayoutStore for plugin state management.
 *
 * @returns UseResponsiveLayoutReturn with layout state and helpers
 *
 * @example
 * ```tsx
 * function LayoutComponent() {
 *   const {
 *     breakpoint,
 *     layoutMode,
 *     isMobile,
 *     layoutConfig,
 *     recalculateBreakpoint
 *   } = useResponsiveLayout();
 *
 *   return (
 *     <div className={`layout-${layoutMode}`}>
 *       {layoutConfig.showBottomNav && <BottomNavigation />}
 *       {layoutConfig.showActivityBars && <ActivityBars />}
 *       <MainContent />
 *     </div>
 *   );
 * }
 * ```
 */
export function useResponsiveLayout(): UseResponsiveLayoutReturn {
  // Get breakpoint from useBreakpoint hook
  const {
    breakpoint,
    width: viewportWidth,
    height: viewportHeight,
    isMobile,
    isTablet,
    isDesktop,
  } = useBreakpoint();

  // Get plugin layout state from store
  const { activePlugins, setBreakpoint: setStoreBreakpoint } =
    usePluginLayoutStore(
      useShallow((state) => ({
        activePlugins: state.activePlugins,
        setBreakpoint: state.setBreakpoint,
      }))
    );

  // Local state for layout transitions
  const [state, setState] = useState<ResponsiveLayoutState>({
    breakpoint,
    layoutMode: getLayoutModeFromBreakpoint(breakpoint),
    viewportWidth,
    viewportHeight,
    isTransitioning: false,
    previousBreakpoint: null,
  });

  // Track previous breakpoint for transition detection
  const [previousBreakpoint, setPreviousBreakpoint] =
    useState<ResponsiveBreakpoint | null>(null);

  /**
   * Handle breakpoint changes with transition state
   */
  useEffect(() => {
    if (breakpoint !== state.breakpoint) {
      // Start transition
      setState((prev) => ({
        ...prev,
        isTransitioning: true,
        previousBreakpoint: prev.breakpoint,
      }));

      // Update state after a brief delay to allow CSS transitions
      const timeoutId = setTimeout(() => {
        setState({
          breakpoint,
          layoutMode: getLayoutModeFromBreakpoint(breakpoint),
          viewportWidth,
          viewportHeight,
          isTransitioning: false,
          previousBreakpoint: state.breakpoint,
        });
        setPreviousBreakpoint(state.breakpoint);
      }, LAYOUT_TRANSITION_DURATION);

      return () => clearTimeout(timeoutId);
    }
  }, [breakpoint, state.breakpoint, viewportWidth, viewportHeight]);

  /**
   * Sync breakpoint with PluginLayoutStore
   */
  useEffect(() => {
    // Map our 4-tier breakpoint to store's 5-tier breakpoint
    const storeBreakpoint =
      breakpoint === 'mobile'
        ? 'mobile'
        : breakpoint === 'tabletPortrait'
          ? 'tablet'
          : breakpoint === 'tabletLandscape'
            ? 'tablet'
            : 'desktop';

    setStoreBreakpoint(storeBreakpoint);
  }, [breakpoint, setStoreBreakpoint]);

  /**
   * Recalculate breakpoint manually (useful after orientation change)
   */
  const recalculateBreakpoint = useCallback(() => {
    // Force a re-render by updating viewport dimensions
    setState((prev) => ({
      ...prev,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }));
  }, []);

  // Memoize layout configuration
  const layoutConfig = useMemo(
    () => getLayoutConfig(breakpoint),
    [breakpoint]
  );

  // Memoize visible plugins based on maxVisiblePlugins constraint
  const visiblePlugins = useMemo(() => {
    return activePlugins.slice(0, layoutConfig.maxVisiblePlugins);
  }, [activePlugins, layoutConfig.maxVisiblePlugins]);

  return {
    // State
    breakpoint: state.breakpoint,
    layoutMode: state.layoutMode,
    viewportWidth: state.viewportWidth,
    viewportHeight: state.viewportHeight,
    isTransitioning: state.isTransitioning,
    previousBreakpoint,

    // Helpers
    isMobile,
    isTablet,
    isDesktop,
    layoutConfig,
    visiblePlugins,

    // Actions
    recalculateBreakpoint,
  };
}

/**
 * useResponsiveLayout Hook (default export)
 */
export default useResponsiveLayout;
