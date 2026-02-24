/**
 * @fileoverview Responsive Layout Types - Type definitions for responsive layout system
 * @module presentation/components/layout/responsive-types
 *
 * EPIC-UXUI-04: Responsive Layout Implementation
 * - Breakpoint definitions for 4 device categories
 * - Layout configuration for each breakpoint
 * - Responsive layout state management
 *
 * @story UXUI-04-07
 * @created 2026-01-30
 */

import type { ReactNode } from 'react';
import type { PluginId } from '@/domain/types/plugin-types';

// Re-export PluginId for convenience
export type { PluginId };

// ============================================================================
// Breakpoint Types
// ============================================================================

/**
 * Responsive breakpoint categories
 */
export type ResponsiveBreakpoint =
  | 'mobile'
  | 'tabletPortrait'
  | 'tabletLandscape'
  | 'desktop';

/**
 * Layout mode based on screen size
 */
export type ResponsiveLayoutMode =
  | 'single-panel'
  | 'multi-panel'
  | 'full-desktop';

/**
 * Navigation mode for different breakpoints
 */
export type NavigationMode = 'bottom-nav' | 'sidebar' | 'hidden';

// ============================================================================
// Layout Configuration Types
// ============================================================================

/**
 * Grid ratio configuration for desktop layout
 * Format: [globalSidebar:activityBarLeft:panelLeft:mainPanel:panelRight:activityBarRight]
 */
export type DesktopGridRatio = [number, number, number, number, number, number];

/**
 * Layout configuration for a specific breakpoint
 */
export interface BreakpointLayoutConfig {
  /** Breakpoint name */
  breakpoint: ResponsiveBreakpoint;

  /** Minimum width in pixels */
  minWidth: number;

  /** Maximum width in pixels (Infinity for desktop) */
  maxWidth: number;

  /** Layout mode for this breakpoint */
  layoutMode: ResponsiveLayoutMode;

  /** Navigation mode for this breakpoint */
  navigationMode: NavigationMode;

  /** Whether to show activity bars */
  showActivityBars: boolean;

  /** Whether to show global sidebar */
  showGlobalSidebar: boolean;

  /** Whether to show bottom navigation */
  showBottomNav: boolean;

  /** Maximum number of visible plugins */
  maxVisiblePlugins: number;

  /** Grid ratio for desktop layout (only used in desktop mode) */
  gridRatio?: DesktopGridRatio;

  /** Whether drag-drop is enabled */
  dragDropEnabled: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for ResponsiveLayout component
 */
export interface ResponsiveLayoutProps {
  /** Child components to render within the layout */
  children?: ReactNode;

  /** Additional CSS class names */
  className?: string;

  /** Callback when breakpoint changes */
  onBreakpointChange?: (breakpoint: ResponsiveBreakpoint) => void;

  /** Callback when layout mode changes */
  onLayoutModeChange?: (mode: ResponsiveLayoutMode) => void;
}

/**
 * Props for BottomNavigation component
 */
export interface BottomNavigationProps {
  /** Additional CSS class names */
  className?: string;

  /** Currently active plugin ID */
  activePluginId: PluginId | null;

  /** Array of plugin IDs to display in bottom nav */
  plugins: PluginId[];

  /** Callback when a plugin is selected */
  onPluginSelect: (pluginId: PluginId) => void;

  /** Whether the nav is visible */
  isVisible: boolean;
}

/**
 * Props for individual bottom navigation items
 */
export interface BottomNavItemProps {
  /** Plugin ID */
  pluginId: PluginId;

  /** Whether this item is active */
  isActive: boolean;

  /** Callback when item is clicked */
  onClick: () => void;
}

// ============================================================================
// State Types
// ============================================================================

/**
 * Responsive layout state
 */
export interface ResponsiveLayoutState {
  /** Current breakpoint */
  breakpoint: ResponsiveBreakpoint;

  /** Current layout mode */
  layoutMode: ResponsiveLayoutMode;

  /** Current viewport width */
  viewportWidth: number;

  /** Current viewport height */
  viewportHeight: number;

  /** Whether layout is transitioning between breakpoints */
  isTransitioning: boolean;

  /** Previous breakpoint (for transition tracking) */
  previousBreakpoint: ResponsiveBreakpoint | null;
}

/**
 * Hook return type for useResponsiveLayout
 */
export interface UseResponsiveLayoutReturn extends ResponsiveLayoutState {
  /** Check if current breakpoint is mobile */
  isMobile: boolean;

  /** Check if current breakpoint is tablet (any orientation) */
  isTablet: boolean;

  /** Check if current breakpoint is desktop */
  isDesktop: boolean;

  /** Get layout configuration for current breakpoint */
  layoutConfig: BreakpointLayoutConfig;

  /** Plugins visible in current layout (constrained by maxVisiblePlugins) */
  visiblePlugins: PluginId[];

  /** Manually trigger breakpoint recalculation */
  recalculateBreakpoint: () => void;
}

/**
 * Hook return type for useBreakpoint
 */
export interface UseBreakpointReturn {
  /** Current breakpoint */
  breakpoint: ResponsiveBreakpoint;

  /** Current viewport width */
  width: number;

  /** Current viewport height */
  height: number;

  /** Check if current breakpoint is mobile */
  isMobile: boolean;

  /** Check if current breakpoint is tablet */
  isTablet: boolean;

  /** Check if current breakpoint is desktop */
  isDesktop: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Breakpoint pixel thresholds
 */
export const BREAKPOINT_THRESHOLDS = {
  mobile: { min: 0, max: 599 },
  tabletPortrait: { min: 600, max: 767 },
  tabletLandscape: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity },
} as const;

/**
 * Default desktop grid ratio: [0.5:0.5:2:4:2.5:0.5]
 */
export const DEFAULT_DESKTOP_GRID_RATIO: DesktopGridRatio = [
  0.5, 0.5, 2, 4, 2.5, 0.5,
];

/**
 * Tablet landscape grid ratio: [0.5:0.5:3:4:2:0.5]
 */
export const TABLET_LANDSCAPE_GRID_RATIO: DesktopGridRatio = [
  0.5, 0.5, 3, 4, 2, 0.5,
];

/**
 * Layout configurations for each breakpoint
 */
export const BREAKPOINT_CONFIGS: Record<
  ResponsiveBreakpoint,
  BreakpointLayoutConfig
> = {
  mobile: {
    breakpoint: 'mobile',
    minWidth: 0,
    maxWidth: 599,
    layoutMode: 'single-panel',
    navigationMode: 'bottom-nav',
    showActivityBars: false,
    showGlobalSidebar: false,
    showBottomNav: true,
    maxVisiblePlugins: 1,
    dragDropEnabled: false,
  },
  tabletPortrait: {
    breakpoint: 'tabletPortrait',
    minWidth: 600,
    maxWidth: 767,
    layoutMode: 'single-panel',
    navigationMode: 'bottom-nav',
    showActivityBars: false,
    showGlobalSidebar: false,
    showBottomNav: true,
    maxVisiblePlugins: 1,
    dragDropEnabled: false,
  },
  tabletLandscape: {
    breakpoint: 'tabletLandscape',
    minWidth: 768,
    maxWidth: 1023,
    layoutMode: 'multi-panel',
    navigationMode: 'sidebar',
    showActivityBars: true,
    showGlobalSidebar: true,
    showBottomNav: false,
    maxVisiblePlugins: 2,
    gridRatio: TABLET_LANDSCAPE_GRID_RATIO,
    dragDropEnabled: true,
  },
  desktop: {
    breakpoint: 'desktop',
    minWidth: 1024,
    maxWidth: Infinity,
    layoutMode: 'full-desktop',
    navigationMode: 'sidebar',
    showActivityBars: true,
    showGlobalSidebar: true,
    showBottomNav: false,
    maxVisiblePlugins: 3,
    gridRatio: DEFAULT_DESKTOP_GRID_RATIO,
    dragDropEnabled: true,
  },
};

/**
 * CSS class prefix for responsive layout
 */
export const RESPONSIVE_CLASS_PREFIX = 'responsive-layout';

/**
 * Transition duration in milliseconds
 */
export const LAYOUT_TRANSITION_DURATION = 300;

/**
 * Debounce delay for resize events in milliseconds
 */
export const RESIZE_DEBOUNCE_MS = 100;

/**
 * Bottom navigation height in pixels
 */
export const BOTTOM_NAV_HEIGHT = 64;

/**
 * Minimum touch target size in pixels
 */
export const TOUCH_TARGET_SIZE = 44;
