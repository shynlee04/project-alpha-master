/**
 * @fileoverview Project CRUD Slice
 * @module infrastructure/persistence/stores/project/project-crud-slice
 * @governance EPIC-CP-1.1
 *
 * Project lifecycle management operations with Dexie persistence.
 */

import { StateCreator } from 'zustand';
import { db } from '@/infrastructure/persistence/dexie-db';
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
 */
export function toRecord(project: Project) {
  return {
    id: project.id,
    name: project.name,
    path: project.folderPath,
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
    fsaHandle: null as any,  // Not stored in Dexie (requires user permission)
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

    const project: Project = {
      id: projectId,
      name: input.name,
      folderPath: input.folderPath,
      fsaHandle: input.fsaHandle,
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

    console.log('[ProjectStore] Creating project:', projectId);

    // Update Zustand store
    set((state) => ({
      projects: { ...state.projects, [projectId]: project },
      activeProjectId: projectId,
    }));

    // Persist to Dexie (async, non-blocking)
    db.projects.put(toRecord(project)).catch((error) => {
      console.error('[ProjectStore] Failed to persist project to Dexie:', error);
    });

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
});
