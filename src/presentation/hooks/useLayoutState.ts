/**
 * @fileoverview useLayoutState Hook
 * @module presentation/hooks/useLayoutState
 *
 * EPIC-UXUI-04: Persistence & State Management (Story 9)
 * Combined hook for managing all layout state with persistence
 *
 * @story UXUI-04-09
 * @created 2026-01-30
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useActivityBarStore } from '@/infrastructure/persistence/stores/activity-bar';
import { useSidebarStore } from '@/infrastructure/persistence/stores/layout';
import type { ActivityBarPosition } from '@/presentation/components/layout/activity-bar-types';
import type { PluginId } from '@/domain/types/plugin-types';
import {
  loadLayoutState,
  saveLayoutState,
  validateLayoutState,
  clearLayoutState,
  DEFAULT_LAYOUT_STATE,
  LAYOUT_STATE_VERSION,
} from '@/infrastructure/persistence/stores/layout/layout-persistence';
import type { PersistedLayoutState } from '@/infrastructure/persistence/stores/layout/layout-persistence';

// ============================================================================
// Types
// ============================================================================

/**
 * Return type for useLayoutState hook
 */
export interface UseLayoutStateReturn {
  // Activity bar state
  leftBarPlugins: PluginId[];
  mainTopBarPlugins: PluginId[];
  rightBarPlugins: PluginId[];
  leftBarActivePlugin: PluginId | null;
  mainTopBarActivePlugin: PluginId | null;
  rightBarActivePlugin: PluginId | null;

  // Sidebar state
  isSidebarExpanded: boolean;

  // Actions
  setBarPlugins: (position: ActivityBarPosition, plugins: PluginId[]) => void;
  setActivePlugin: (position: ActivityBarPosition, pluginId: PluginId | null) => void;
  togglePlugin: (position: ActivityBarPosition, pluginId: PluginId) => void;
  movePlugin: (pluginId: PluginId, from: ActivityBarPosition, to: ActivityBarPosition) => void;
  addPluginToBar: (position: ActivityBarPosition, pluginId: PluginId) => boolean;
  removePluginFromBar: (position: ActivityBarPosition, pluginId: PluginId) => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  // Persistence actions
  saveCurrentLayout: () => void;
  loadLayout: (projectId?: string) => void;
  resetLayout: () => void;
  clearLayout: (projectId?: string) => void;

  // State info
  isHydrated: boolean;
  currentProjectId: string | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current project ID from project store
 * @returns Project ID or null
 */
function getCurrentProjectId(): string | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const projectData = localStorage.getItem('project-storage');
    if (!projectData) return null;

    const parsed = JSON.parse(projectData);
    return parsed.state?.activeProjectId || null;
  } catch {
    return null;
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Combined layout state hook
 * Manages activity bars, sidebar, and persistence
 *
 * @returns Layout state and actions
 */
export function useLayoutState(): UseLayoutStateReturn {
  // Get current project ID
  const currentProjectId = useMemo(() => getCurrentProjectId(), []);

  // Activity bar store selectors
  const activityBarState = useActivityBarStore(
    useShallow((state) => ({
      left: state.left,
      mainTop: state.mainTop,
      right: state.right,
      _hasHydrated: state._hasHydrated,
      setBarPlugins: state.setBarPlugins,
      setActivePlugin: state.setActivePlugin,
      togglePlugin: state.togglePlugin,
      movePlugin: state.movePlugin,
      addPluginToBar: state.addPluginToBar,
      removePluginFromBar: state.removePluginFromBar,
    }))
  );

  // Sidebar store selectors
  const sidebarState = useSidebarStore(
    useShallow((state) => ({
      isExpanded: state.isExpanded,
      toggleSidebar: state.toggleSidebar,
      setExpanded: state.setExpanded,
    }))
  );

  // ============================================================================
  // Persistence Actions
  // ============================================================================

  /**
   * Save current layout state to localStorage
   */
  const saveCurrentLayout = useCallback(() => {
    const projectId = getCurrentProjectId() || undefined;

    const stateToSave: PersistedLayoutState = {
      version: LAYOUT_STATE_VERSION,
      projectId: projectId || '',
      activityBars: {
        left: {
          plugins: activityBarState.left.plugins,
          activePluginId: activityBarState.left.activePluginId,
        },
        mainTop: {
          plugins: activityBarState.mainTop.plugins,
          activePluginId: activityBarState.mainTop.activePluginId,
        },
        right: {
          plugins: activityBarState.right.plugins,
          activePluginId: activityBarState.right.activePluginId,
        },
      },
      sidebar: {
        isExpanded: sidebarState.isExpanded,
      },
    };

    saveLayoutState(stateToSave, projectId || undefined);
  }, [
    activityBarState.left,
    activityBarState.mainTop,
    activityBarState.right,
    sidebarState.isExpanded,
  ]);

  /**
   * Load layout state from localStorage
   * @param projectId - Optional project ID to load
   */
  const loadLayout = useCallback((projectId?: string) => {
    const targetProjectId = projectId || getCurrentProjectId() || undefined;
    const loadedState = loadLayoutState(targetProjectId);

    if (!loadedState) {
      console.log('[useLayoutState] No saved layout found, using defaults');
      return;
    }

    // Validate loaded state
    const validation = validateLayoutState(loadedState);
    if (!validation.valid) {
      console.warn('[useLayoutState] Loaded state had errors:', validation.errors);
    }

    const state = validation.sanitizedState || loadedState;

    // Apply to activity bar store
    useActivityBarStore.setState({
      left: state.activityBars.left,
      mainTop: state.activityBars.mainTop,
      right: state.activityBars.right,
    });

    // Apply to sidebar store
    useSidebarStore.setState({
      isExpanded: state.sidebar.isExpanded,
    });

    console.log('[useLayoutState] Layout loaded for project:', state.projectId || 'default');
  }, []);

  /**
   * Reset layout to default state
   */
  const resetLayout = useCallback(() => {
    // Reset activity bars
    useActivityBarStore.setState({
      left: DEFAULT_LAYOUT_STATE.activityBars.left,
      mainTop: DEFAULT_LAYOUT_STATE.activityBars.mainTop,
      right: DEFAULT_LAYOUT_STATE.activityBars.right,
    });

    // Reset sidebar
    useSidebarStore.setState({
      isExpanded: DEFAULT_LAYOUT_STATE.sidebar.isExpanded,
    });

    // Save reset state
    saveCurrentLayout();

    console.log('[useLayoutState] Layout reset to defaults');
  }, [saveCurrentLayout]);

  /**
   * Clear layout state from localStorage
   * @param projectId - Optional specific project to clear
   */
  const clearLayout = useCallback((projectId?: string) => {
    clearLayoutState(projectId);
    console.log('[useLayoutState] Layout cleared for project:', projectId || 'all');
  }, []);

  // ============================================================================
  // Auto-save on state changes
  // ============================================================================

  useEffect(() => {
    // Only save after hydration is complete
    if (!activityBarState._hasHydrated) return;

    // Debounced save
    const timeoutId = setTimeout(() => {
      saveCurrentLayout();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    activityBarState._hasHydrated,
    activityBarState.left,
    activityBarState.mainTop,
    activityBarState.right,
    sidebarState.isExpanded,
    saveCurrentLayout,
  ]);

  // ============================================================================
  // Load on mount
  // ============================================================================

  useEffect(() => {
    // Load layout when component mounts
    loadLayout();
  }, [loadLayout]);

  // ============================================================================
  // Return Value
  // ============================================================================

  return {
    // Activity bar state
    leftBarPlugins: activityBarState.left.plugins,
    mainTopBarPlugins: activityBarState.mainTop.plugins,
    rightBarPlugins: activityBarState.right.plugins,
    leftBarActivePlugin: activityBarState.left.activePluginId,
    mainTopBarActivePlugin: activityBarState.mainTop.activePluginId,
    rightBarActivePlugin: activityBarState.right.activePluginId,

    // Sidebar state
    isSidebarExpanded: sidebarState.isExpanded,

    // Actions
    setBarPlugins: activityBarState.setBarPlugins,
    setActivePlugin: activityBarState.setActivePlugin,
    togglePlugin: activityBarState.togglePlugin,
    movePlugin: activityBarState.movePlugin,
    addPluginToBar: activityBarState.addPluginToBar,
    removePluginFromBar: activityBarState.removePluginFromBar,
    toggleSidebar: sidebarState.toggleSidebar,
    setSidebarExpanded: sidebarState.setExpanded,

    // Persistence actions
    saveCurrentLayout,
    loadLayout,
    resetLayout,
    clearLayout,

    // State info
    isHydrated: activityBarState._hasHydrated,
    currentProjectId,
  };
}

// ============================================================================
// Export
// ============================================================================

export default useLayoutState;
