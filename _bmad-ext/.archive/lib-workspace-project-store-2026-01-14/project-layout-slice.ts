/**
 * @fileoverview Project Layout Slice - Layout state persistence
 * @module workspace/project-store/project-layout-slice
 */

import { StateCreator } from 'zustand';
import type { LayoutConfig } from './types';

export interface ProjectLayoutSliceState {
  /** Layout configurations per project (optional feature) */
  layouts: Record<string, LayoutConfig>;
}

export interface ProjectLayoutSliceActions {
  /** Get layout configuration for a project */
  getProjectLayout: (id: string) => LayoutConfig | null;

  /** Save layout configuration for a project */
  saveProjectLayout: (id: string, layout: LayoutConfig) => Promise<boolean>;

  /** Clear layout for a project */
  clearProjectLayout: (id: string) => void;
}

export type ProjectLayoutSlice = ProjectLayoutSliceState & ProjectLayoutSliceActions;

export const createProjectLayoutSlice: StateCreator<
  ProjectLayoutSlice,
  [],
  [],
  ProjectLayoutSlice
> = (set, get) => ({
  layouts: {},

  getProjectLayout: (id) => {
    const state = get();
    return state.layouts[id] || null;
  },

  saveProjectLayout: async (id, layout) => {
    set((state) => ({
      layouts: {
        ...state.layouts,
        [id]: layout,
      },
    }));
    return true;
  },

  clearProjectLayout: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.layouts;
      return { layouts: rest };
    });
  },
});
