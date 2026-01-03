/**
 * @fileoverview Unified Project Store
 * @module infrastructure/persistence/stores/project/useProjectStore
 * @governance EPIC-CP-1
 *
 * January 2026 Zustand Pattern:
 * - Single store composed from 5 focused slices
 * - Each slice is <120 lines (single responsibility principle)
 * - Dexie IndexedDB persistence
 * - Cross-slice communication via get()
 *
 * Slices:
 * - project-crud-slice.ts: Project lifecycle operations
 * - project-bindings-slice.ts: Workspace bindings
 * - project-permissions-slice.ts: FSA permission state management
 * - project-layout-slice.ts: IDE layout state (panel sizes, open files)
 * - project-utils-slice.ts: Utility functions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ProjectState,
  ProjectMethods,
  ProjectBindingMethods,
  ProjectPermissionsMethods,
  ProjectLayoutMethods,
  ProjectUtilsMethods,
} from './project-types';
import { createProjectCrudSlice } from './project-crud-slice';
import { createProjectBindingsSlice } from './project-bindings-slice';
import { createProjectPermissionsSlice } from './project-permissions-slice';
import { createProjectLayoutSlice } from './project-layout-slice';
import { createProjectUtilsSlice } from './project-utils-slice';

// Combined state interface
type CombinedProjectState = ProjectState &
  ProjectMethods &
  ProjectBindingMethods &
  ProjectPermissionsMethods &
  ProjectLayoutMethods &
  ProjectUtilsMethods;

/**
 * Unified Project Store
 *
 * Composed from 5 focused slices following January 2026 Zustand pattern.
 * Persists to Dexie IndexedDB with selective partialize.
 */
export const useProjectStore = create<CombinedProjectState>()(
  persist(
    (set, get, api) => ({
      // State initialization
      projects: {},
      activeProjectId: null,

      // Compose all slices
      ...createProjectCrudSlice(set, get, api),
      ...createProjectBindingsSlice(set, get, api),
      ...createProjectPermissionsSlice(set, get, api),
      ...createProjectLayoutSlice(set, get, api),
      ...createProjectUtilsSlice(set, get, api),
    }),
    {
      name: 'project-state',

      // TODO: Add Dexie storage adapter
      // For now using localStorage as temporary storage
      // storage: createDexieStorage('projectState'),

      // Selective persistence (only critical data)
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        // NOT persisted:
        // - Validation results (computed)
        // - Stats (computed)
      }),

      // Hydration handler
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        console.log('[ProjectStore] Rehydrated from storage', {
          projectsCount: Object.keys(state.projects || {}).length,
          activeProjectId: state.activeProjectId,
        });
      },
    }
  )
);

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get active project
 */
export function useActiveProject() {
  return useProjectStore((state) => {
    if (!state.activeProjectId || !state.projects) return null;
    return state.projects[state.activeProjectId] || null;
  });
}

/**
 * Hook to get all projects
 */
export function useAllProjects() {
  return useProjectStore((state) => state.projects ? Object.values(state.projects) : []);
}

/**
 * Hook to get recent projects
 */
export function useRecentProjects(limit = 5) {
  return useProjectStore((state) => state.getRecentProjects(limit));
}

/**
 * Hook to get project statistics
 */
export function useProjectStats() {
  return useProjectStore((state) => state.getProjectStats());
}

/**
 * Hook for hydration status
 */
export function useProjectStoreHydration() {
  return useProjectStore((state) => state._hasHydrated);
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Reset the project store to empty state
 * Useful for testing or logout
 */
export function resetProjectStore() {
  useProjectStore.setState({
    projects: {},
    activeProjectId: null,
  });
}

/**
 * Get current store state (outside of React)
 * Useful for debugging, testing, or non-React contexts
 */
export function getProjectStoreState() {
  return useProjectStore.getState();
}
