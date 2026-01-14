/**
 * @fileoverview Project Layout Slice
 * @module infrastructure/persistence/stores/project/project-layout-slice
 * @governance EPIC-CP-1.4
 *
 * IDE layout state management for projects.
 * Handles panel sizes, open files, and active file per project.
 *
 * ARCHITECTURE NOTE (ARC-C06):
 * layoutState is stored in-memory on the Project object for quick access.
 * Persistence is handled by the IDE store's IDEStateRecord in Dexie, NOT ProjectRecord.
 * This slice is for in-memory coordination only - the IDE store persists panelLayouts.
 * @see infrastructure/persistence/stores/ide/useIDEStore.ts
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
  // Save layout state for project (in-memory only)
  // ARC-C06: Layout is persisted by IDE store in IDEStateRecord, not ProjectRecord
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

    // NOTE: Dexie persistence is handled by IDE store (IDEStateRecord.panelLayouts)
    // ProjectRecord does not have layoutState field - see dexie-db-core-types.ts
  },

  // Get layout state for project
  getProjectLayout: (projectId: string) => {
    const project = get().projects[projectId];
    return project?.layoutState;
  },

  // Clear layout state for project (in-memory only)
  // ARC-C06: Layout clearing is persisted by IDE store
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

    // NOTE: Dexie persistence is handled by IDE store (IDEStateRecord.panelLayouts)
    // ProjectRecord does not have layoutState field - see dexie-db-core-types.ts
  },
});
