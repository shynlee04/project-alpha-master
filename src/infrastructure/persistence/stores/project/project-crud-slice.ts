/**
 * @fileoverview Project CRUD Slice
 * @module infrastructure/persistence/stores/project/project-crud-slice
 * @governance EPIC-CP-1.1
 *
 * Project lifecycle management operations with Dexie persistence.
 */

import { StateCreator } from 'zustand';
import { db } from '@/infrastructure/persistence/dexie-db';
import { fsaHandleManager } from '@/lib/filesystem/fsa-handle-manager';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectState,
  ProjectMethods,
} from './project-types';

/**
 * Generate unique project ID
 */
function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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
    bindings: project.bindings,
    fileSnapshotEnabled: project.fileSnapshotEnabled,
  };
}

/**
 * Convert Dexie ProjectRecord to Zustand Project
 */
export function fromRecord(record: any): Project {
  return {
    id: record.id,
    name: record.name,
    folderPath: record.folderPath || record.path,
    storageType: record.storageType || 'fsa',  // Default to 'fsa' for legacy records
    fsaHandle: null,  // Not stored in Dexie (requires user permission)
    lastOpened: new Date(record.lastOpened),
    createdAt: new Date(record.createdAt),
    autoSync: true,  // Default value
    bindings: record.bindings || {},
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
  createProject: (input: CreateProjectInput) => {
    const projectId = generateProjectId();
    const now = new Date();
    const storageType = input.storageType ?? 'fsa';  // Default to 'fsa' for backward compatibility

    const project: Project = {
      id: projectId,
      name: input.name,
      folderPath: input.folderPath,
      storageType,
      fsaHandle: input.fsaHandle ?? null,
      lastOpened: now,
      createdAt: now,
      autoSync: input.autoSync ?? true,
      bindings: input.bindings ?? {
        ide: true,
        knowledge: true,
        notes: true,
        study: true,
      },
      description: input.description,
      tags: input.tags ?? [],
    };

    console.log('[ProjectStore] Creating project:', projectId, 'storageType:', storageType);

    // Update Zustand store
    set((state) => ({
      projects: { ...state.projects, [projectId]: project },
      activeProjectId: projectId,
    }));

    // Persist to Dexie (async, non-blocking)
    db.projects.put(toRecord(project)).catch((error) => {
      console.error('[ProjectStore] Failed to persist project to Dexie:', error);
    });

    // Persist FSA handle only for 'fsa' storage type (indexeddb projects don't need handles)
    if (storageType === 'fsa' && input.fsaHandle) {
      fsaHandleManager.persistHandle(input.fsaHandle, projectId, 'ide').catch((error) => {
        console.error('[ProjectStore] Failed to persist FSA handle:', error);
      });
    }

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
    db.projects.put(toRecord(updated)).catch((error) => {
      console.error('[ProjectStore] Failed to update project in Dexie:', error);
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
    db.projects.delete(projectId).catch((error) => {
      console.error('[ProjectStore] Failed to delete project from Dexie:', error);
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
  restoreProjectHandle: async (projectId: string) => {
    const project = get().projects[projectId];
    if (!project) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return null;
    }

    // If handle already exists, return it
    if (project.fsaHandle) {
      return project.fsaHandle;
    }

    // Attempt to restore handle from storage
    console.log('[ProjectStore] Attempting to restore FSA handle for project:', projectId);
    const handle = await fsaHandleManager.restoreHandle(projectId);

    if (handle) {
      // Update the project with the restored handle
      set((state) => ({
        projects: {
          ...state.projects,
          [projectId]: {
            ...state.projects[projectId],
            fsaHandle: handle,
          },
        },
      }));
      console.log('[ProjectStore] FSA handle restored successfully for project:', projectId);
    } else {
      console.warn('[ProjectStore] Failed to restore FSA handle for project:', projectId);
    }

    return handle;
  },
});
