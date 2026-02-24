/**
 * @fileoverview Activity Bar Store - Zustand store for 3 Activity Bar system
 * @module infrastructure/persistence/stores/activity-bar
 *
 * EPIC-UXUI-04: Three Activity Bar System
 * Manages state for ActivityBarLeft, ActivityBarMainTop, ActivityBarRight
 *
 * @story UXUI-04-03
 * @created 2026-01-30
 */

import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';
import type { ActivityBarPosition } from '@/presentation/components/layout/activity-bar-types';
import type { PluginId } from '@/domain/types/plugin-types';
import { createStateSlice } from './slices/state-slice';
import { createActionsSlice } from './slices/actions-slice';
import type { ActivityBarStateSlice } from './slices/state-slice';
import type { ActivityBarActionsSlice } from './slices/actions-slice';

// ============================================================================
// Project-Specific Storage
// ============================================================================

function getCurrentProjectId(): string | undefined {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return undefined;
  }
  try {
    const projectData = localStorage.getItem('project-storage');
    if (!projectData) return undefined;
    const parsed = JSON.parse(projectData);
    return parsed.state?.activeProjectId || undefined;
  } catch {
    return undefined;
  }
}

const projectSpecificStorage = {
  getItem: (name: string): StorageValue<ActivityBarState> | null => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    const projectId = getCurrentProjectId();
    const key = projectId ? `activity-bar-${projectId}` : name;
    const item = localStorage.getItem(key);
    if (item === null) return null;
    try {
      return JSON.parse(item) as StorageValue<ActivityBarState>;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<ActivityBarState>): void => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const projectId = getCurrentProjectId();
    const key = projectId ? `activity-bar-${projectId}` : name;
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (name: string): void => {
    const projectId = getCurrentProjectId();
    const key = projectId ? `activity-bar-${projectId}` : name;
    localStorage.removeItem(key);
  },
};

// ============================================================================
// Store Type
// ============================================================================

type ActivityBarState = ActivityBarStateSlice & ActivityBarActionsSlice;

// ============================================================================
// Zustand Store
// ============================================================================

export const useActivityBarStore = create<ActivityBarState>()(
  persist(
    (...args) => ({
      ...createStateSlice(...args),
      ...createActionsSlice(...args),
    }),
    {
      name: 'activity-bar-storage',
      version: 1,
      storage: projectSpecificStorage,
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectLeftBar = (state: ActivityBarState) => state.left;
export const selectMainTopBar = (state: ActivityBarState) => state.mainTop;
export const selectRightBar = (state: ActivityBarState) => state.right;
export const selectHasHydrated = (state: ActivityBarState) => state._hasHydrated;

export const selectIsPluginActiveAnywhere = (
  state: ActivityBarState,
  pluginId: PluginId
): boolean => {
  return (
    state.left.activePluginId === pluginId ||
    state.mainTop.activePluginId === pluginId ||
    state.right.activePluginId === pluginId
  );
};

export const selectPluginBar = (
  state: ActivityBarState,
  pluginId: PluginId
): ActivityBarPosition | null => {
  if (state.left.plugins.includes(pluginId)) return 'left';
  if (state.mainTop.plugins.includes(pluginId)) return 'main-top';
  if (state.right.plugins.includes(pluginId)) return 'right';
  return null;
};

export const selectIsBarFull = (
  state: ActivityBarState,
  position: ActivityBarPosition
): boolean => {
  switch (position) {
    case 'left': return state.left.plugins.length >= 3;
    case 'main-top': return state.mainTop.plugins.length >= 3;
    case 'right': return state.right.plugins.length >= 3;
    default: return false;
  }
};
