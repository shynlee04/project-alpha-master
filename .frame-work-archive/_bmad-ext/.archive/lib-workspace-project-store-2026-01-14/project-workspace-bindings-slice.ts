/**
 * @fileoverview Workspace Bindings Slice - Workspace binding management
 * @module workspace/project-store/project-workspace-bindings-slice
 */

import { StateCreator } from 'zustand';
import type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';

const DEFAULT_WORKSPACE_BINDINGS: WorkspaceBindings = {
  ide: true,
  notes: false,
  knowledge: false,
  study: false,
};

export interface ProjectWorkspaceBindingsSliceState {
  /** Workspace bindings per project (derived from projects in CRUD slice) */
  // Note: This is computed from project metadata, not stored separately
}

export interface ProjectWorkspaceBindingsSliceActions {
  /** Update workspace bindings for a project */
  updateProjectBindings: (id: string, bindings: WorkspaceBindings) => Promise<boolean>;

  /** Get workspace bindings for a project */
  getProjectBindings: (id: string) => WorkspaceBindings | null;

  /** Check if project is available in workspace */
  isProjectAvailableInWorkspace: (id: string, workspace: keyof WorkspaceBindings) => boolean;
}

export type ProjectWorkspaceBindingsSlice = ProjectWorkspaceBindingsSliceState & ProjectWorkspaceBindingsSliceActions;

export const createProjectWorkspaceBindingsSlice: StateCreator<
  ProjectWorkspaceBindingsSlice,
  [],
  [],
  ProjectWorkspaceBindingsSlice
> = (_set, get) => ({
  updateProjectBindings: async (id, bindings) => {
    // This will delegate to CRUD slice's update method
    const state = get() as any;
    if (state.updateProjectMetadata) {
      return await state.updateProjectMetadata(id, { workspaceBindings: bindings });
    }
    return false;
  },

  getProjectBindings: (id) => {
    const state = get() as any;
    const project = state.getProject?.(id);
    if (!project) return null;

    return project.workspaceBindings || DEFAULT_WORKSPACE_BINDINGS;
  },

  isProjectAvailableInWorkspace: (id, workspace) => {
    const bindings = get().getProjectBindings(id);
    if (!bindings) return false;

    return bindings[workspace] === true;
  },
});
