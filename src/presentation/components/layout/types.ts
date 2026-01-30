/**
 * @fileoverview Layout Component Types
 * @module components/layout/types
 * @updated 2026-01-30
 *
 * Type definitions for EPIC-UXUI-04 layout components
 */

import type { ReactNode } from 'react';

// ============================================================================
// Sidebar State Types
// ============================================================================

/**
 * Sidebar expansion state
 */
export interface SidebarState {
  /** Whether sidebar is expanded (200px) or collapsed (48px) */
  isExpanded: boolean;
  /** Currently active workspace identifier */
  activeWorkspace: string;
  /** Array of pinned plugin/workspace item IDs */
  pinnedItems: string[];
}

/**
 * Sidebar state persisted to localStorage
 */
export interface PersistedSidebarState {
  isExpanded: boolean;
  activeWorkspace: string;
  pinnedItems: string[];
  version: number;
}

// ============================================================================
// Global Sidebar Types
// ============================================================================

/**
 * Navigation item for sidebar
 */
export interface SidebarNavItem {
  /** Unique identifier */
  id: string;
  /** Display label (shown when expanded) */
  label: string;
  /** Icon component */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Navigation path */
  path: string;
  /** Optional badge count */
  badge?: number;
  /** Whether item is disabled */
  disabled?: boolean;
}

/**
 * Props for GlobalSidebar component
 */
export interface GlobalSidebarProps {
  /** Additional CSS classes */
  className?: string;
  /** Custom navigation items (defaults to standard items) */
  navItems?: SidebarNavItem[];
  /** Custom bottom items (defaults to settings) */
  bottomItems?: SidebarNavItem[];
  /** Whether to show workspace selector */
  showWorkspaceSelector?: boolean;
  /** Callback when workspace changes */
  onWorkspaceChange?: (workspaceId: string) => void;
}

// ============================================================================
// Tooltip Types
// ============================================================================

/**
 * Tooltip position options
 */
export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Props for sidebar tooltip
 */
export interface SidebarTooltipProps {
  /** Content to display in tooltip */
  content: string;
  /** Position relative to trigger */
  position?: TooltipPosition;
  /** Children (trigger element) */
  children: ReactNode;
  /** Whether tooltip is disabled */
  disabled?: boolean;
}

// ============================================================================
// Responsive Types
// ============================================================================

/**
 * Breakpoint definitions for sidebar behavior
 */
export interface SidebarBreakpoints {
  /** Mobile breakpoint (< 768px) - auto-collapse */
  mobile: number;
  /** Tablet breakpoint (< 1024px) - auto-collapse */
  tablet: number;
  /** Desktop breakpoint (>= 1024px) - respect user preference */
  desktop: number;
}

/**
 * Current viewport state
 */
export interface ViewportState {
  /** Current width in pixels */
  width: number;
  /** Current height in pixels */
  height: number;
  /** Whether viewport is mobile */
  isMobile: boolean;
  /** Whether viewport is tablet */
  isTablet: boolean;
  /** Whether viewport is desktop */
  isDesktop: boolean;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Actions for sidebar state management
 */
export interface SidebarActions {
  /** Toggle sidebar expanded/collapsed state */
  toggleSidebar: () => void;
  /** Set explicit expanded state */
  setExpanded: (expanded: boolean) => void;
  /** Set active workspace */
  setActiveWorkspace: (workspaceId: string) => void;
  /** Pin an item to sidebar */
  pinItem: (itemId: string) => void;
  /** Unpin an item from sidebar */
  unpinItem: (itemId: string) => void;
  /** Toggle pin state of an item */
  togglePin: (itemId: string) => void;
  /** Reset to default state */
  reset: () => void;
}

/**
 * Complete sidebar store (state + actions)
 */
export type SidebarStore = SidebarState & SidebarActions;

// ============================================================================
// Constants
// ============================================================================

/** localStorage key for sidebar state */
export const SIDEBAR_STORAGE_KEY = 'global-sidebar-state';

/** Current state version for migrations */
export const SIDEBAR_STATE_VERSION = 1;

/** Default sidebar state */
export const DEFAULT_SIDEBAR_STATE: SidebarState = {
  isExpanded: true,
  activeWorkspace: 'notes',
  pinnedItems: [],
};

/** Breakpoint values in pixels */
export const SIDEBAR_BREAKPOINTS: SidebarBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024,
};

/** Sidebar width in pixels */
export const SIDEBAR_WIDTH = {
  expanded: 200,
  collapsed: 48,
} as const;
