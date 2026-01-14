/**
 * @fileoverview Project Store - Backward Compatibility Facade
 * @module lib/workspace/project-store
 * @story ARC-C01: Consolidate Project Store to Infrastructure
 *
 * ⚠️ DEPRECATED: This is a backward compatibility facade.
 * New code should import directly from:
 * - `@/infrastructure/persistence/stores/project` (store and types)
 * - `@/infrastructure/persistence/stores/project/useProjectStore` (store)
 *
 * This facade provides the old async API that wraps the new sync Zustand store.
 *
 * Migration Guide:
 *
 * OLD (this facade):
 * ```ts
 * import { saveProject, getProject } from '@/lib/workspace/project-store';
 * await saveProject(project);
 * const project = await getProject(id);
 * ```
 *
 * NEW (canonical):
 * ```ts
 * import { useProjectStore } from '@/infrastructure/persistence/stores/project';
 * const project = useProjectStore.getState().getProject(id);
 * useProjectStore.getState().createProject(input);
 * ```
 */

// ============================================================================
// Types - Re-export from canonical location
// ============================================================================

export type {
  Project as ProjectMetadata,
  LayoutConfig,
  WorkspaceBindings,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/infrastructure/persistence/stores/project/project-types';

// Also export ProjectWithPermission for backward compatibility
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import type { FsaPermissionState } from '@/infrastructure/filesystem';

/**
 * Project with permission state for dashboard display.
 * @deprecated Use types from @/infrastructure/persistence/stores/project
 */
export interface ProjectWithPermission extends Project {
  permissionState: FsaPermissionState;
}

// ============================================================================
// Store - Re-export from canonical location
// ============================================================================

export { useProjectStore } from '@/infrastructure/persistence/stores/project';

// ============================================================================
// Backward Compatibility Facade (Async wrappers for old API)
// ============================================================================

import { useProjectStore } from '@/infrastructure/persistence/stores/project';

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
      // Update existing project
      state.updateProject(project.id, {
        name: project.name,
        folderPath: project.folderPath,
        storageType: project.storageType,
        storageMetadata: project.storageMetadata,
        autoSync: project.autoSync,
        bindings: project.bindings,
        description: project.description,
        tags: project.tags,
      });
    } else {
      // Create new project with the existing ID
      // Note: createProject generates a new ID, so we need to use updateProject pattern
      // This is a limitation - the old API allowed setting custom IDs
      console.warn('[ProjectStore Facade] saveProject called for non-existing project. Creating new project.');
      state.createProject({
        name: project.name,
        folderPath: project.folderPath,
        storageType: project.storageType,
        storageMetadata: project.storageMetadata,
        autoSync: project.autoSync,
        bindings: project.bindings,
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
 * @deprecated Use useProjectStore with permission checking
 */
export async function listProjectsWithPermission(): Promise<ProjectWithPermission[]> {
  const state = useProjectStore.getState();
  const projects = state.getAllProjects();

  return projects.map((project) => ({
    ...project,
    permissionState: project.lastKnownPermissionState ?? 'unknown',
  })) as ProjectWithPermission[];
}

/**
 * Facade: Delete project
 *
 * @deprecated Use useProjectStore.getState().deleteProject() instead
 * Note: The new API does hard delete, not soft delete
 */
export async function deleteProject(id: string, softDelete = true): Promise<boolean> {
  try {
    const state = useProjectStore.getState();

    if (softDelete) {
      // Soft delete - mark as deleted
      state.updateProject(id, { deleted: true, deletedAt: new Date() });
    } else {
      // Hard delete
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
 * Facade: Update workspace bindings
 *
 * @deprecated Use useProjectStore.getState().updateProjectBindings() instead
 */
export async function updateProjectBindings(
  id: string,
  bindings: import('@/domain/entities/project').WorkspaceBindings
): Promise<boolean> {
  try {
    await useProjectStore.getState().updateProjectBindings(id, bindings);
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
    workspaceBindings: import('@/domain/entities/project').WorkspaceBindings;
  }>
): Promise<boolean> {
  try {
    useProjectStore.getState().updateProject(id, {
      name: metadata.name,
      autoSync: metadata.autoSync,
      exclusionPatterns: metadata.exclusionPatterns,
      bindings: metadata.workspaceBindings,
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
 * @deprecated Use resetProjectStore() from infrastructure
 */
export async function clearAllProjects(): Promise<boolean> {
  try {
    // Get all projects and delete them
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
 * Facade: Generate project ID
 *
 * Note: The new store generates IDs internally in createProject.
 * This function provides a standalone ID generator for backward compatibility.
 *
 * @deprecated Use useProjectStore.getState().createProject() which generates ID internally
 */
export function generateProjectId(): string {
  // Match the format used by infrastructure store
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `ide:proj_${Date.now()}_${randomPart}`;
}

/**
 * Facade: Reset database (for testing)
 *
 * @deprecated Use resetProjectStore() from infrastructure
 */
export async function _resetDBForTesting(): Promise<void> {
  const { resetProjectStore } = await import('@/infrastructure/persistence/stores/project');
  resetProjectStore();
}
