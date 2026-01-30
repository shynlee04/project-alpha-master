/**
 * @fileoverview useActivityBar Hook - React hook for Activity Bar state management
 * @module presentation/hooks/useActivityBar
 *
 * EPIC-UXUI-04: Three Activity Bar System
 * Provides convenient access to activity bar state and actions
 *
 * @story UXUI-04-03
 * @created 2026-01-30
 */

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  useActivityBarStore,
  selectLeftBar,
  selectMainTopBar,
  selectRightBar,
} from '@/infrastructure/persistence/stores/activity-bar';
import type {
  ActivityBarPosition,
  UseActivityBarReturn,
} from '@/presentation/components/layout/activity-bar-types';
import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Main Hook
// ============================================================================

/**
 * useActivityBar Hook
 *
 * Provides access to all three activity bars' state and actions.
 * Uses useShallow for optimal re-rendering performance.
 *
 * @example
 * ```tsx
 * const { state, togglePlugin, movePlugin } = useActivityBar();
 *
 * // Toggle plugin in left bar
 * togglePlugin('left', 'filetree');
 *
 * // Move plugin from left to right
 * movePlugin('filetree', 'left', 'right');
 * ```
 */
export function useActivityBar(): UseActivityBarReturn {
  // Get state from store using useShallow for performance
  const leftBar = useActivityBarStore(useShallow(selectLeftBar));
  const mainTopBar = useActivityBarStore(useShallow(selectMainTopBar));
  const rightBar = useActivityBarStore(useShallow(selectRightBar));

  // Get store actions
  const setBarPlugins = useActivityBarStore((state) => state.setBarPlugins);
  const setActivePlugin = useActivityBarStore((state) => state.setActivePlugin);
  const storeTogglePlugin = useActivityBarStore((state) => state.togglePlugin);
  const storeMovePlugin = useActivityBarStore((state) => state.movePlugin);

  // Compose state object
  const state = useMemo(
    () => ({
      left: leftBar,
      mainTop: mainTopBar,
      right: rightBar,
    }),
    [leftBar, mainTopBar, rightBar]
  );

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Toggle plugin visibility in a bar
   */
  const togglePlugin = useCallback(
    (position: ActivityBarPosition, pluginId: PluginId) => {
      storeTogglePlugin(position, pluginId);
    },
    [storeTogglePlugin]
  );

  /**
   * Move plugin between bars
   */
  const movePlugin = useCallback(
    (pluginId: PluginId, from: ActivityBarPosition, to: ActivityBarPosition) => {
      storeMovePlugin(pluginId, from, to);
    },
    [storeMovePlugin]
  );

  /**
   * Check if a plugin is active in any bar
   */
  const isPluginActive = useCallback(
    (pluginId: PluginId): boolean => {
      return (
        leftBar.activePluginId === pluginId ||
        mainTopBar.activePluginId === pluginId ||
        rightBar.activePluginId === pluginId
      );
    },
    [leftBar, mainTopBar, rightBar]
  );

  /**
   * Get which bar contains a plugin
   */
  const getPluginBar = useCallback(
    (pluginId: PluginId): ActivityBarPosition | null => {
      if (leftBar.plugins.includes(pluginId)) return 'left';
      if (mainTopBar.plugins.includes(pluginId)) return 'main-top';
      if (rightBar.plugins.includes(pluginId)) return 'right';
      return null;
    },
    [leftBar, mainTopBar, rightBar]
  );

  /**
   * Check if a bar has reached max capacity
   */
  const isBarFull = useCallback(
    (position: ActivityBarPosition): boolean => {
      switch (position) {
        case 'left':
          return leftBar.plugins.length >= 3;
        case 'main-top':
          return mainTopBar.plugins.length >= 3;
        case 'right':
          return rightBar.plugins.length >= 3;
        default:
          return false;
      }
    },
    [leftBar, mainTopBar, rightBar]
  );

  return {
    state,
    setBarPlugins,
    setActivePlugin,
    togglePlugin,
    movePlugin,
    isPluginActive,
    getPluginBar,
    isBarFull,
  };
}

// ============================================================================
// Individual Bar Hooks
// ============================================================================

/**
 * useActivityBarLeft Hook
 *
 * Convenient hook for accessing only the left activity bar
 */
export function useActivityBarLeft() {
  const bar = useActivityBarStore(useShallow(selectLeftBar));
  const setActivePlugin = useActivityBarStore((state) => state.setActivePlugin);
  const togglePlugin = useActivityBarStore((state) => state.togglePlugin);

  return {
    ...bar,
    setActivePlugin: (pluginId: PluginId | null) => setActivePlugin('left', pluginId),
    togglePlugin: (pluginId: PluginId) => togglePlugin('left', pluginId),
  };
}

/**
 * useActivityBarMainTop Hook
 *
 * Convenient hook for accessing only the main-top activity bar
 */
export function useActivityBarMainTop() {
  const bar = useActivityBarStore(useShallow(selectMainTopBar));
  const setActivePlugin = useActivityBarStore((state) => state.setActivePlugin);
  const togglePlugin = useActivityBarStore((state) => state.togglePlugin);

  return {
    ...bar,
    setActivePlugin: (pluginId: PluginId | null) => setActivePlugin('main-top', pluginId),
    togglePlugin: (pluginId: PluginId) => togglePlugin('main-top', pluginId),
  };
}

/**
 * useActivityBarRight Hook
 *
 * Convenient hook for accessing only the right activity bar
 */
export function useActivityBarRight() {
  const bar = useActivityBarStore(useShallow(selectRightBar));
  const setActivePlugin = useActivityBarStore((state) => state.setActivePlugin);
  const togglePlugin = useActivityBarStore((state) => state.togglePlugin);

  return {
    ...bar,
    setActivePlugin: (pluginId: PluginId | null) => setActivePlugin('right', pluginId),
    togglePlugin: (pluginId: PluginId) => togglePlugin('right', pluginId),
  };
}
