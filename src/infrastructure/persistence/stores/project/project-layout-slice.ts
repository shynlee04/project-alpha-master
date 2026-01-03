/**
 * @fileoverview Project Layout Slice
 * @module infrastructure/persistence/stores/project/project-layout-slice
 * @governance EPIC-CP-1.4
 *
 * IDE layout state management for projects.
 * Handles panel sizes, open files, and active file per project.
 */

import { StateCreator } from 'zustand';
import type {
  LayoutConfig,
  ProjectState,
  ProjectLayoutMethods,
} from './project-types';

export const createProjectLayoutSlice: StateCreator<
  ProjectState,
  [],
  [],
  ProjectLayoutMethods
> = (set, get) => ({
  // Save layout state for project
  saveProjectLayout: (projectId: string, layout: LayoutConfig) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    console.log('[ProjectStore] Saving layout for project:', projectId, layout);

    set((state) => ({
      projects: {
        ...state.projects,
        [projectId]: {
          ...existing,
          layoutState: layout,
        },
      },
    }));

    // Persist to Dexie
    // TODO: Add Dexie persistence
  },

  // Get layout state for project
  getProjectLayout: (projectId: string) => {
    const project = get().projects[projectId];
    return project?.layoutState;
  },

  // Clear layout state for project
  clearProjectLayout: (projectId: string) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    console.log('[ProjectStore] Clearing layout for project:', projectId);

    set((state) => ({
      projects: {
        ...state.projects,
        [projectId]: {
          ...existing,
          layoutState: undefined,
        },
      },
    }));

    // Persist to Dexie
    // TODO: Add Dexie persistence
  },
});
