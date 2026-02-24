/**
 * @fileoverview Unified Project Store
 * @module infrastructure/persistence/stores/project/useProjectStore
 * @governance EPIC-CP-1
 *
 * January 2026 Zustand Pattern:
 * - Single store composed from 4 focused slices
 * - Each slice is <120 lines (single responsibility principle)
 * - Dexie IndexedDB persistence
 * - Cross-slice communication via get()
 *
 * Slices:
 * - project-crud-slice.ts: Project lifecycle operations
 * - project-permissions-slice.ts: FSA permission state management
 * - project-layout-slice.ts: IDE layout state (panel sizes, open files)
 * - project-utils-slice.ts: Utility functions
 *
 * Note: project-bindings-slice.ts was removed in 00-06.
 * Plugin configuration is now accessed via project.plugins field directly.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type {
  ProjectState,
  ProjectMethods,
  ProjectPermissionsMethods,
  ProjectLayoutMethods,
  ProjectUtilsMethods,
} from './project-types';
import { createProjectCrudSlice } from './project-crud-slice';
// 00-06: project-bindings-slice was removed - use plugins field on Project instead
import { createProjectPermissionsSlice } from './project-permissions-slice';
import { createProjectLayoutSlice } from './project-layout-slice';
import { createProjectUtilsSlice } from './project-utils-slice';

// Combined state interface
// 00-06: ProjectBindingMethods/ProjectPluginMethods removed - plugins are accessed via project.plugins directly
type CombinedProjectState = ProjectState &
  ProjectMethods &
  ProjectPermissionsMethods &
  ProjectLayoutMethods &
  ProjectUtilsMethods;

/**
 * Unified Project Store
 *
 * Composed from 5 focused slices following January 2026 Zustand pattern.
 * Persists to Dexie IndexedDB with selective partialize.
 */
// FIX-2026-01-06: REMOVED localStorage persist - causes dual storage chaos
// Dexie is the SINGLE SOURCE OF TRUTH for projects
// Hub reads from Dexie, all components should read from Dexie
// This store is now a transient in-memory cache, NOT persisted
export const useProjectStore = create<CombinedProjectState>()(
  (set, get, api) => ({
    // State initialization
    projects: {},
    activeProjectId: null,
    _hasHydrated: false,

    // Compose all slices
    ...createProjectCrudSlice(set, get, api),
    // 00-06: project-bindings-slice removed - plugins are now part of Project entity
    ...createProjectPermissionsSlice(set, get, api),
    ...createProjectLayoutSlice(set, get, api),
    ...createProjectUtilsSlice(set, get, api),
  })
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
 * 
 * ⚠️ CRITICAL FIX (2026-01-09): Uses useShallow to prevent infinite loops
 * Object.values() creates a new array reference every time, which triggers
 * re-renders with default reference equality. useShallow uses shallow comparison
 * to detect actual changes.
 */
export function useAllProjects() {
  return useProjectStore(useShallow((state) => state.projects ? Object.values(state.projects) : []));
}

/**
 * Hook to get recent projects
 * ⚠️ CRITICAL FIX (2026-01-09): useShallow prevents infinite loops
 */
export function useRecentProjects(limit = 5) {
  return useProjectStore(useShallow((state) => state.getRecentProjects(limit)));
}

/**
 * Hook to get project statistics
 * 
 * Returns aggregated stats including:
 * - Total/active/deleted project counts
 * - Projects by workspace binding
 * - Recently created and opened projects
 * 
 * @courseCorrection Story A-1 - Fix missing export causing WSOD
 * @added 2026-01-07
 */
export function useProjectStats() {
  return useProjectStore(useShallow((state) => state.getProjectStats()));
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
