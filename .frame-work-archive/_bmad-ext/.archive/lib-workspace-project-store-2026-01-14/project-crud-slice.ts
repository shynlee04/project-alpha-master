/**
 * @fileoverview Project CRUD Slice - Core project CRUD operations
 * @module workspace/project-store/project-crud-slice
 */

import { StateCreator } from 'zustand';
import type { ProjectMetadata } from './types';

export interface ProjectCrudSliceState {
  /** Map of project ID to project metadata */
  projects: Record<string, ProjectMetadata>;
}

export interface ProjectCrudSliceActions {
  /** Create or update project metadata */
  saveProject: (project: ProjectMetadata) => Promise<boolean>;

  /** Get project by ID */
  getProject: (id: string) => ProjectMetadata | null;

  /** List all projects sorted by lastOpened descending */
  listProjects: () => ProjectMetadata[];

  /** List only active (non-deleted) projects */
  listActiveProjects: () => ProjectMetadata[];

  /** Delete project by ID with soft delete option */
  deleteProject: (id: string, softDelete?: boolean) => Promise<boolean>;

  /** Update lastOpened timestamp for a project */
  updateProjectLastOpened: (id: string) => Promise<boolean>;

  /** Clear all projects */
  clearAllProjects: () => Promise<boolean>;

  /** Get project count */
  getProjectCount: () => Promise<number>;
}

export type ProjectCrudSlice = ProjectCrudSliceState & ProjectCrudSliceActions;

export const createProjectCrudSlice: StateCreator<
  ProjectCrudSlice,
  [],
  [],
  ProjectCrudSlice
> = (set, get) => ({
  projects: {},

  saveProject: async (project) => {
    // This will be implemented by the persistence slice
    console.log('[ProjectCrudSlice] saveProject:', project.id);
    return true;
  },

  getProject: (id) => {
    const state = get();
    return state.projects[id] || null;
  },

  listProjects: () => {
    const state = get();
    return Object.values(state.projects).sort(
      (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
    );
  },

  listActiveProjects: () => {
    const state = get();
    return Object.values(state.projects)
      .filter(project => !project.deleted)
      .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime());
  },

  deleteProject: async (id, softDelete = true) => {
    // This will be implemented by the persistence slice
    console.log('[ProjectCrudSlice] deleteProject:', id, 'soft:', softDelete);
    return true;
  },

  updateProjectLastOpened: async (id) => {
    const state = get();
    const project = state.projects[id];
    if (!project) {
      console.warn('[ProjectCrudSlice] Project not found:', id);
      return false;
    }

    set((prevState) => ({
      projects: {
        ...prevState.projects,
        [id]: { ...project, lastOpened: new Date() },
      },
    }));
    return true;
  },

  clearAllProjects: async () => {
    set({ projects: {} });
    return true;
  },

  getProjectCount: async () => {
    const state = get();
    return Object.keys(state.projects).length;
  },
});
