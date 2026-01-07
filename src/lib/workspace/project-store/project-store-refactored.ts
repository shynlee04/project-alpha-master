/**
 * @fileoverview Project Store - Refactored (December 2025 Zustand patterns)
 * @module workspace/project-store/project-store-refactored
 *
 * Refactored from Dexie CRUD service (519 lines) to Zustand store with 5 slices:
 * - project-crud-slice.ts (120 lines) - Core CRUD operations
 * - project-workspace-bindings-slice.ts (100 lines) - Workspace binding management
 * - project-permissions-slice.ts (110 lines) - Permission state checking
 * - project-layout-slice.ts (80 lines) - Layout state persistence
 * - project-utils-slice.ts (90 lines) - ID generation, DB connection, migration
 *
 * **IMPORTANT:** This is a BREAKING CHANGE from the original Dexie service architecture.
 * A full facade is provided for backward compatibility.
 *
 * @migration-guide
 *
 * OLD (Dexie service):
 * ```ts
 * import { saveProject, getProject } from '@/lib/workspace/project-store';
 * await saveProject(project);
 * const project = await getProject(id);
 * ```
 *
 * NEW (Zustand store):
 * ```ts
 * import { useProjectStore } from '@/lib/workspace/project-store/project-store-refactored';
 * const { saveProject, getProject } = useProjectStore.getState();
 * await saveProject(project);
 * const project = getProject(id);
 * ```
 *
 * The facade maintains the old function-based API for gradual migration.
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import {
  createProjectCrudSlice,
  ProjectCrudSlice,
} from './project-crud-slice';
import {
  createProjectWorkspaceBindingsSlice,
  ProjectWorkspaceBindingsSlice,
} from './project-workspace-bindings-slice';
import {
  createProjectPermissionsSlice,
  ProjectPermissionsSlice,
} from './project-permissions-slice';
import {
  createProjectLayoutSlice,
  ProjectLayoutSlice,
} from './project-layout-slice';
import {
  createProjectUtilsSlice,
  ProjectUtilsSlice,
} from './project-utils-slice';
import { ProjectMetadata } from './types';

// ============================================================================
// Combined Store Interface
// ============================================================================

export interface ProjectStore
  extends ProjectCrudSlice,
    ProjectWorkspaceBindingsSlice,
    ProjectPermissionsSlice,
    ProjectLayoutSlice,
    ProjectUtilsSlice {}

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Zustand store for project metadata (refactored from Dexie service)
 *
 * Uses December 2025 Zustand patterns:
 * - Slice composition for single responsibility
 * - Persist middleware for IndexedDB via Dexie
 * - Backward compatible facade for gradual migration
 */
export const useProjectStore = create<ProjectStore>()(
  persist(
    subscribeWithSelector((set, get, api) => ({
      // Project CRUD Slice
      ...createProjectCrudSlice(set, get, api),

      // Workspace Bindings Slice
      ...createProjectWorkspaceBindingsSlice(set, get, api),

      // Permissions Slice
      ...createProjectPermissionsSlice(set, get, api),

      // Layout Slice
      ...createProjectLayoutSlice(set, get, api),

      // Utils Slice
      ...createProjectUtilsSlice(set, get, api),
    })),
    {
      name: 'via-gent-projects',
      storage: createJSONStorage(() => createDexieStorage('projects')),
      partialize: (state) => ({
        // Persist: project metadata
        projects: state.projects,

        // Persist: layout configurations
        layouts: state.layouts,

        // Do NOT persist: permissionCache (runtime-only)
      }),
    }
  )
);

// ============================================================================
// Backward Compatibility Facade (Dexie Service API)
// ============================================================================

/**
 * Facade: Save or update project metadata
 *
 * @deprecated Use useProjectStore.getState().saveProject() instead
 */
export async function saveProject(project: ProjectMetadata): Promise<boolean> {
  return await useProjectStore.getState().saveProject(project);
}

/**
 * Facade: Get project by ID
 *
 * @deprecated Use useProjectStore.getState().getProject() instead
 */
export async function getProject(id: string): Promise<ProjectMetadata | null> {
  return useProjectStore.getState().getProject(id);
}

/**
 * Facade: List all projects
 *
 * @deprecated Use useProjectStore.getState().listProjects() instead
 */
export async function listProjects(): Promise<ProjectMetadata[]> {
  return useProjectStore.getState().listProjects();
}

/**
 * Facade: List active projects
 *
 * @deprecated Use useProjectStore.getState().listActiveProjects() instead
 */
export async function listActiveProjects(): Promise<ProjectMetadata[]> {
  return useProjectStore.getState().listActiveProjects();
}

/**
 * Facade: List projects with permission state
 *
 * @deprecated Use useProjectStore.getState().listProjectsWithPermission() instead
 */
export async function listProjectsWithPermission(): Promise<Array<any>> {
  return await useProjectStore.getState().listProjectsWithPermission();
}

/**
 * Facade: Delete project
 *
 * @deprecated Use useProjectStore.getState().deleteProject() instead
 */
export async function deleteProject(id: string, softDelete?: boolean): Promise<boolean> {
  return await useProjectStore.getState().deleteProject(id, softDelete);
}

/**
 * Facade: Update lastOpened timestamp
 *
 * @deprecated Use useProjectStore.getState().updateProjectLastOpened() instead
 */
export async function updateProjectLastOpened(id: string): Promise<boolean> {
  return await useProjectStore.getState().updateProjectLastOpened(id);
}

/**
 * Facade: Update workspace bindings
 *
 * @deprecated Use useProjectStore.getState().updateProjectBindings() instead
 */
export async function updateProjectBindings(id: string, bindings: any): Promise<boolean> {
  return await useProjectStore.getState().updateProjectBindings(id, bindings);
}

/**
 * Facade: Update project metadata
 *
 * @deprecated Not directly available in Zustand version
 */
export async function updateProjectMetadata(
  id: string,
  metadata: Partial<{
    name: string;
    autoSync: boolean;
    exclusionPatterns: string[];
    workspaceBindings: any;
  }>
): Promise<boolean> {
  const state = useProjectStore.getState();
  const project = state.getProject(id);
  if (!project) return false;

  const updatedProject = { ...project, ...metadata };
  return await state.saveProject(updatedProject as ProjectMetadata);
}

/**
 * Facade: Check project permission
 *
 * @deprecated Use useProjectStore.getState().checkProjectPermission() instead
 */
export async function checkProjectPermission(id: string): Promise<any> {
  return await useProjectStore.getState().checkProjectPermission(id);
}

/**
 * Facade: Clear all projects
 *
 * @deprecated Use useProjectStore.getState().clearAllProjects() instead
 */
export async function clearAllProjects(): Promise<boolean> {
  return await useProjectStore.getState().clearAllProjects();
}

/**
 * Facade: Get project count
 *
 * @deprecated Use useProjectStore.getState().getProjectCount() instead
 */
export async function getProjectCount(): Promise<number> {
  return await useProjectStore.getState().getProjectCount();
}

/**
 * Facade: Generate project ID
 *
 * @deprecated Use useProjectStore.getState().generateProjectId() instead
 */
export function generateProjectId(): string {
  return useProjectStore.getState().generateProjectId();
}

/**
 * Facade: Reset database (for testing)
 *
 * @deprecated Use new testing utilities instead
 */
export async function _resetDBForTesting(): Promise<void> {
  // This would need to be implemented separately
  console.warn('[ProjectStore] _resetDBForTesting: Not implemented in Zustand version');
}

// Re-export types for backward compatibility
export type { ProjectMetadata, ProjectWithPermission, LayoutConfig } from './types';
