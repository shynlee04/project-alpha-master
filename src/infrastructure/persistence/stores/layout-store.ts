/**
 * @fileoverview Layout Store - FACADE
 * @module infrastructure/persistence/stores/layout-store
 * @governance LC-02 - Layout Consolidation
 *
 * FACADE: Re-exports from PluginLayoutStore for backward compatibility.
 *
 * This file previously contained standalone layout state. As of LC-02,
 * all layout state is consolidated into PluginLayoutStore.
 *
 * Navigation state (activeNavItem, previousPath) has been moved to
 * NavigationStore as it belongs there conceptually.
 *
 * @deprecated Import directly from '@/presentation/layouts/PluginLayoutStore'
 * @see presentation/layouts/PluginLayoutStore.ts
 *
 * @example
 * ```tsx
 * // Old usage (still works via facade)
 * import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';
 *
 * // New preferred usage
 * import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
 * ```
 */

import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { useNavigationStore } from './navigation-store';

// ============================================================================
// Types (preserved for backward compatibility)
// ============================================================================

export type NavItem = 'home' | 'projects' | 'agents' | 'quality' | 'settings';

/**
 * Layout State shape - DEPRECATED
 * @deprecated Use PluginLayoutStore directly
 */
export interface LayoutState {
  // From PluginLayoutStore
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;

  // From NavigationStore (facade combines both)
  activeNavItem: NavItem;
  previousPath: string | null;

  // Actions from PluginLayoutStore
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;

  // Actions from NavigationStore
  setActiveNavItem: (item: NavItem) => void;
  setPreviousPath: (path: string | null) => void;
}

// ============================================================================
// Facade Store Hook
// ============================================================================

/**
 * @deprecated Use usePluginLayoutStore for sidebar state and useNavigationStore for nav state
 *
 * This facade combines state from two stores for backward compatibility.
 * Consumers should migrate to using the canonical stores directly:
 * - Sidebar state: usePluginLayoutStore
 * - Navigation state: useNavigationStore
 */
export function useLayoutStore(): LayoutState;
export function useLayoutStore<T>(selector: (state: LayoutState) => T): T;
export function useLayoutStore<T>(selector?: (state: LayoutState) => T) {
  // Get sidebar state from PluginLayoutStore
  const pluginLayoutState = usePluginLayoutStore();

  // Get navigation state from NavigationStore
  const navigationState = useNavigationStore();

  // Compose the combined state
  const combinedState: LayoutState = {
    // Sidebar state from PluginLayoutStore
    sidebarCollapsed: pluginLayoutState.sidebarCollapsed,
    sidebarMobileOpen: pluginLayoutState.sidebarMobileOpen,
    toggleSidebar: pluginLayoutState.toggleSidebar,
    setSidebarCollapsed: pluginLayoutState.setSidebarCollapsed,
    setMobileMenuOpen: pluginLayoutState.setMobileMenuOpen,

    // Navigation state from NavigationStore
    // Map activePanel to NavItem for compatibility
    activeNavItem: (navigationState.activePanel as NavItem) || 'home',
    previousPath: null, // previousPath is no longer persisted, use null

    // Navigation actions (delegated to NavigationStore)
    setActiveNavItem: (item: NavItem) => navigationState.setActivePanel(item),
    setPreviousPath: (_path: string | null) => {
      // previousPath is deprecated, no-op
      console.warn('[LayoutStore] setPreviousPath is deprecated and has no effect');
    },
  };

  // Apply selector if provided
  if (selector) {
    return selector(combinedState);
  }

  return combinedState;
}
