/**
 * @fileoverview Project CRUD Slice
 * @module infrastructure/persistence/stores/project/project-crud-slice
 * @governance EPIC-CP-1.1
 *
 * Project lifecycle management operations.
 */

import { StateCreator } from 'zustand';
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

    set((state) => ({
      projects: { ...state.projects, [projectId]: project },
      activeProjectId: projectId,
    }));

    // Persist to Dexie
    // TODO: Add Dexie persistence in Phase 0.1 finalization

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

    set((state) => ({
      projects: { ...state.projects, [projectId]: updated },
    }));

    // Persist to Dexie
    // TODO: Add Dexie persistence
  },

  // Delete project
  deleteProject: (projectId: string) => {
    console.log('[ProjectStore] Deleting project:', projectId);

    set((state) => {
      const { [projectId]: deleted, ...remaining } = state.projects;
      return {
        projects: remaining,
        activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
      };
    });

    // Delete from Dexie
    // TODO: Add Dexie persistence
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
