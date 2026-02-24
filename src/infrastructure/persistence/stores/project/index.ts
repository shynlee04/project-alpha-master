/**
 * Project Store Barrel Export
 *
 * Exports all project-related types and stores.
 * ARC-E01: Integrated facade functions from lib/workspace/project-store.ts
 */

// Main store
export { useProjectStore } from './useProjectStore';
export {
  useActiveProject,
  useAllProjects,
  useRecentProjects,
  useProjectStats,
  useProjectStoreHydration,
  resetProjectStore,
  getProjectStoreState,
} from './useProjectStore';

// CRUD utilities
export { generateProjectId, fromRecord, toRecord } from './project-crud-slice';

// Types
export type {
  Project,
  WorkspaceBindings,
  WorkspaceType,
  CreateProjectInput,
  UpdateProjectInput,
  ValidationResult,
  ProjectStats,
  LayoutConfig,
} from './project-types';

export type {
  ProjectState,
  ProjectMethods,
  ProjectBindingMethods,
  ProjectUtilsMethods,
} from './project-types';

// ============================================================================
// ARC-E01: Backward Compatibility Facade (Async wrappers for legacy API)
// ============================================================================
// Migrated from lib/workspace/project-store.ts
// These provide the async API that some parts of the codebase still use
// ============================================================================

import { useProjectStore, resetProjectStore } from './useProjectStore';
import type { Project } from './project-types';
import type { FsaPermissionState } from '@/infrastructure/filesystem';

/**
 * Project with permission state for dashboard display.
 */
export interface ProjectWithPermission extends Project {
  permissionState: FsaPermissionState;
}

/**
 * Facade: Save or update project metadata
 *
 * @deprecated Use useProjectStore.getState().createProject() or updateProject() instead
 */
export async function saveProject(project: Project): Promise<boolean> {
  try {
    const state = useProjectStore.getState();
    const existing = state.getProject(project.id);

    if (existing) {
      state.updateProject(project.id, {
        name: project.name,
        folderPath: project.folderPath,
        storageType: project.storageType,
        storageMetadata: project.storageMetadata,
        autoSync: project.autoSync,
        plugins: project.plugins,  // 00-06: Changed from workspaceBindings to plugins
        description: project.description,
        tags: project.tags,
      });
    } else {
      console.warn('[ProjectStore Facade] saveProject called for non-existing project.');
      state.createProject({
        name: project.name,
        folderPath: project.folderPath,
        storageType: project.storageType,
        storageMetadata: project.storageMetadata,
        autoSync: project.autoSync,
        plugins: project.plugins,  // 00-06: Changed from workspaceBindings to plugins
        description: project.description,
        tags: project.tags,
      });
    }
    return true;
  } catch (error) {
    console.error('[ProjectStore Facade] saveProject failed:', error);
    return false;
  }
}

/**
 * Facade: Get project by ID
 *
 * @deprecated Use useProjectStore.getState().getProject() instead
 */
export async function getProject(id: string): Promise<Project | null> {
  const state = useProjectStore.getState();
  return state.getProject(id) ?? null;
}

/**
 * Facade: List all projects
 *
 * @deprecated Use useProjectStore.getState().getAllProjects() instead
 */
export async function listProjects(): Promise<Project[]> {
  const state = useProjectStore.getState();
  return state.getAllProjects();
}

/**
 * Facade: List active projects (non-deleted)
 *
 * @deprecated Use useProjectStore.getState().getAllProjects() with filter
 */
export async function listActiveProjects(): Promise<Project[]> {
  const state = useProjectStore.getState();
  return state.getAllProjects().filter((p) => !p.deleted);
}

/**
 * Facade: List projects with permission state
 *
 * FSA-010 REMEDIATION: Permission state now sourced from FSAHandleRecord.
 * Uses handlePersistenceService.getPermissionStatus() for each project.
 *
 * @deprecated Use useProjectStore with permission checking
 */
export async function listProjectsWithPermission(): Promise<ProjectWithPermission[]> {
  const state = useProjectStore.getState();
  const projects = state.getAllProjects();

  // Get permission state from FSAHandleRecord for each project
  const results = await Promise.all(
    projects.map(async (project) => {
      let permissionState: FsaPermissionState = 'unknown';

      if (project.storageType === 'indexeddb') {
        permissionState = 'granted';
      } else {
        permissionState = (await state.getProjectPermission(project.id)) ?? 'unknown';
      }

      return {
        ...project,
        permissionState,
      } as ProjectWithPermission;
    })
  );

  return results;
}

/**
 * Facade: Delete project
 *
 * @deprecated Use useProjectStore.getState().deleteProject() instead
 */
export async function deleteProject(id: string, softDelete = true): Promise<boolean> {
  try {
    const state = useProjectStore.getState();

    if (softDelete) {
      state.updateProject(id, { deleted: true, deletedAt: new Date() });
    } else {
      state.deleteProject(id);
    }
    return true;
  } catch (error) {
    console.error('[ProjectStore Facade] deleteProject failed:', error);
    return false;
  }
}

/**
 * Facade: Update lastOpened timestamp
 *
 * @deprecated Use useProjectStore.getState().updateLastOpened() instead
 */
export async function updateProjectLastOpened(id: string): Promise<boolean> {
  try {
    await useProjectStore.getState().updateLastOpened(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Facade: Update project plugins (replaces updateProjectBindings)
 *
 * @deprecated Use useProjectStore.getState().updateProject() instead
 */
export async function updateProjectBindings(
  id: string,
  plugins: import('@/domain/entities/project').ProjectPlugins
): Promise<boolean> {
  try {
    // 00-06: Changed from updateProjectBindings to updateProject with plugins
    useProjectStore.getState().updateProject(id, { plugins });
    return true;
  } catch {
    return false;
  }
}

/**
 * Facade: Update project metadata
 *
 * @deprecated Use useProjectStore.getState().updateProject() instead
 */
export async function updateProjectMetadata(
  id: string,
  metadata: Partial<{
    name: string;
    autoSync: boolean;
    exclusionPatterns: string[];
    plugins: import('@/domain/entities/project').ProjectPlugins;  // 00-06: Changed from workspaceBindings
  }>
): Promise<boolean> {
  try {
    useProjectStore.getState().updateProject(id, {
      name: metadata.name,
      autoSync: metadata.autoSync,
      exclusionPatterns: metadata.exclusionPatterns,
      plugins: metadata.plugins,  // 00-06: Changed from bindings
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Facade: Check project permission
 *
 * @deprecated Use useProjectStore.getState().checkProjectPermission() instead
 */
export async function checkProjectPermission(id: string): Promise<FsaPermissionState> {
  return useProjectStore.getState().checkProjectPermission(id);
}

/**
 * Facade: Clear all projects
 *
 * @deprecated Use resetProjectStore() instead
 */
export async function clearAllProjects(): Promise<boolean> {
  try {
    const state = useProjectStore.getState();
    const projects = state.getAllProjects();
    for (const project of projects) {
      state.deleteProject(project.id);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Facade: Get project count
 *
 * @deprecated Use useProjectStore.getState().getAllProjects().length
 */
export async function getProjectCount(): Promise<number> {
  return useProjectStore.getState().getAllProjects().length;
}

/**
 * Facade: Reset database (for testing)
 *
 * @deprecated Use resetProjectStore() from infrastructure
 */
export async function _resetDBForTesting(): Promise<void> {
  resetProjectStore();
}

// Legacy type alias for backward compatibility
export type { Project as ProjectMetadata };
