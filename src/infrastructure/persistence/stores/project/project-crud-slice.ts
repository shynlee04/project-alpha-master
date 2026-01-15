/**
 * @fileoverview Project CRUD Slice
 * @module infrastructure/persistence/stores/project/project-crud-slice
 * @governance EPIC-CP-1.1
 *
 * Project lifecycle management operations with Dexie persistence.
 *
 * @story PS-04 - Handle Persistence Architecture
 * - Uses handle-persistence.ts instead of fsaHandleManager
 * - Stores storageMetadata instead of fsaHandle
 *
 * **ARC-D01**: ProjectId template literal type - Uses domain types for compile-time safety
 */

import { StateCreator } from 'zustand';
import { db } from '@/infrastructure/persistence/dexie-db';
// CC-V2-B03: Removed storeFSAHandle import - handle storage is now done in fsa-persistence.ts
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectState,
  ProjectMethods,
} from './project-types';
import type { HandleRestoreResult } from '@/infrastructure/filesystem/handle-types';
import {
  ProjectId,
  WorkspaceType,
  isValidProjectId,
  extractWorkspaceType as domainExtractWorkspaceType,
} from '@/domain/types/project-ids';

/**
 * Generate unique project ID with workspace namespace
 * **ARC-D01**: Returns typed ProjectId for compile-time safety
 * Format: {workspace}:proj_{timestamp}_{random}
 * Example: ide:proj_1704787200000_abc123xyz
 *
 * @param workspaceType - Workspace type for namespace
 * @returns Validated ProjectId string
 */
function generateProjectId(workspaceType: WorkspaceType = 'ide'): ProjectId {
  const randomPart = Math.random().toString(36).substring(2, 11);
  const id = `${workspaceType}:proj_${Date.now()}_${randomPart}` as ProjectId;
  
  // Runtime validation (should never fail if code is correct)
  if (!isValidProjectId(id)) {
    throw new Error(`Generated invalid ProjectId: ${id}`);
  }
  
  return id;
}

/**
 * Re-export domain extractWorkspaceType for convenience
 * **ARC-D01**: Uses domain-level function for ProjectId parsing
 */
export { extractWorkspaceType } from '@/domain/types/project-ids';

/**
 * Convert Zustand Project to Dexie ProjectRecord for persistence
 * PERSIST-S002: Added workspaceId for cross-workspace isolation
 */
export function toRecord(project: Project, workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide') {
  return {
    id: project.id,
    name: project.name,
    path: project.folderPath,
    workspaceId, // PERSIST-S002: Track which workspace this project record belongs to
    folderPath: project.folderPath,
    lastOpened: project.lastOpened,
    createdAt: project.createdAt,
    workspaceBindings: project.workspaceBindings, // ARC-D03: Renamed from bindings
    fileSnapshotEnabled: project.fileSnapshotEnabled,
  };
}

/**
 * Convert Dexie ProjectRecord to Zustand Project
 * PS-04: Now uses storageMetadata instead of fsaHandle
 */
export function fromRecord(record: any): Project {
  return {
    id: record.id,
    name: record.name,
    folderPath: record.folderPath || record.path,
    storageType: record.storageType || 'fsa',  // Default to 'fsa' for legacy records
    storageMetadata: null,  // Not stored in Dexie (requires user permission, store in fsaHandles table)
    lastOpened: new Date(record.lastOpened),
    createdAt: new Date(record.createdAt),
    autoSync: true,  // Default value
    workspaceBindings: record.workspaceBindings || record.bindings || {}, // ARC-D03: fallback for legacy
    fileSnapshotEnabled: record.fileSnapshotEnabled,
    tags: [],  // Default empty array
  };
}

export const createProjectCrudSlice: StateCreator<
  ProjectState,
  [],
  [],
  ProjectMethods
> = (set, get) => ({
  // State initialization
  projects: {},
  activeProjectId: null,

  // Create new project
  // FS-03: Workspace-aware project creation with namespaced IDs
  createProject: (input: CreateProjectInput) => {
    const workspaceType = input.workspaceType ?? 'ide';  // Default to 'ide' for backward compatibility
    const projectId = generateProjectId(workspaceType);
    const now = new Date();
    const storageType = input.storageType ?? 'fsa';  // Default to 'fsa' for backward compatibility

    const project: Project = {
      id: projectId,
      name: input.name,
      folderPath: input.folderPath,
      storageType,
      storageMetadata: input.storageMetadata ?? null,
      lastOpened: now,
      createdAt: now,
      autoSync: input.autoSync ?? true,
      workspaceBindings: input.workspaceBindings ?? input.bindings ?? { // ARC-D03
        ide: true,
        knowledge: true,
        notes: true,
        study: true,
      },
      description: input.description,
      tags: input.tags ?? [],
    };

    console.log('[ProjectStore] Creating project:', projectId, 'workspace:', workspaceType, 'storageType:', storageType);

    // Update Zustand store
    set((state) => ({
      projects: { ...state.projects, [projectId]: project },
      activeProjectId: projectId,
    }));

    // Persist to Dexie (async, non-blocking)
    // FS-03: Pass workspaceType for proper isolation
    db.projects.put(toRecord(project, workspaceType)).catch((error: unknown) => {
      const err = error as Error;
      console.error('[ProjectStore] Failed to persist project to Dexie:', err.message);
    });

    // CC-V2-B03 FIX: REMOVED mock handle storage
    // The actual FSA handle is persisted by fsa-persistence.ts via handlePersistenceService.persistHandle()
    // which correctly uses structuredClone for Chrome 129+ to store the real FileSystemDirectoryHandle.
    // Previous code was storing a mock object { kind: 'directory', name: '...' } which could not be restored.
    // 
    // Handle persistence flow:
    // 1. createProjectFromFolder() in fsa-persistence.ts calls this createProject() method
    // 2. This method creates project metadata in Zustand + Dexie
    // 3. fsa-persistence.ts then calls handlePersistenceService.persistHandle(projectId, handle, 'ide')
    // 4. handlePersistenceService stores actual handle with structuredClone (Chrome 129+)
    //
    // DO NOT add handle storage here - it will race with the real handle and overwrite it!

    return projectId;
  },

  // Update project
  updateProject: (projectId: string, updates: UpdateProjectInput) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    console.log('[ProjectStore] Updating project:', projectId);

    const updated: Project = {
      ...existing,
      ...updates,
      // Preserve id and creation timestamp
      id: existing.id,
      createdAt: existing.createdAt,
    };

    // Update Zustand store
    set((state) => ({
      projects: { ...state.projects, [projectId]: updated },
    }));

    // Persist to Dexie (async, non-blocking)
    // FS-03: Extract workspace type from project ID for proper isolation
    const workspaceType = domainExtractWorkspaceType(projectId);
    db.projects.put(toRecord(updated, workspaceType)).catch((error: unknown) => {
      const err = error as Error;
      console.error('[ProjectStore] Failed to update project in Dexie:', err.message);
    });
  },

  // Delete project
  deleteProject: (projectId: string) => {
    console.log('[ProjectStore] Deleting project:', projectId);

    // Update Zustand store
    set((state) => {
      const { [projectId]: deleted, ...remaining } = state.projects;
      return {
        projects: remaining,
        activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
      };
    });

    // Delete from Dexie (async, non-blocking)
    db.projects.delete(projectId).catch((error: unknown) => {
      const err = error as Error;
      console.error('[ProjectStore] Failed to delete project from Dexie:', err.message);
    });

    // Also delete stored handle metadata
    handlePersistenceService.deleteHandle(projectId).catch((error: unknown) => {
      const err = error as Error;
      console.error('[ProjectStore] Failed to delete handle metadata:', err.message);
    });
  },

  // Set active project
  setActiveProject: (projectId: string | null) => {
    const project = projectId ? get().projects[projectId] : null;
    if (projectId && !project) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    console.log('[ProjectStore] Setting active project:', projectId);

    set({ activeProjectId: projectId });

    // Update lastOpened timestamp (cross-slice call to utils slice)
    if (project && projectId) {
      (get() as any).updateLastOpened(projectId);
    }
  },

  // Get project by ID
  getProject: (projectId: string) => {
    return get().projects[projectId];
  },

  // Get all projects
  getAllProjects: () => {
    return Object.values(get().projects);
  },

  // Get active project
  getActiveProject: () => {
    const { activeProjectId, projects } = get();
    if (!activeProjectId) return null;
    return projects[activeProjectId] || null;
  },

  // Restore FSA handle for a project (called when accessing project after reload)
  // PS-04: Now returns HandleRestoreResult instead of just the handle
  restoreProjectHandle: async (projectId: string): Promise<HandleRestoreResult> => {
    const project = get().projects[projectId];
    if (!project) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return {
        success: false,
        handle: null,
        error: 'Project not found',
        requiresUserInteraction: true,
      };
    }

    // If storage metadata exists, attempt restoration
    console.log('[ProjectStore] Attempting to restore FSA handle for project:', projectId);
    const result = await handlePersistenceService.restoreHandle(projectId);

    if (result.success && result.handle) {
      // Update the project with the restored metadata
      set((state) => ({
        projects: {
          ...state.projects,
          [projectId]: {
            ...state.projects[projectId],
            storageMetadata: result.restoredFromMetadata,
          },
        },
      }));
      console.log('[ProjectStore] FSA handle restored successfully for project:', projectId);
    } else if (!result.requiresUserInteraction) {
      console.warn('[ProjectStore] Failed to restore FSA handle for project:', projectId, result.error);
    }

    return result;
  },
});
