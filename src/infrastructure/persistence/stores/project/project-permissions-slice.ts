/**
 * @fileoverview Project Permissions Slice
 * @module infrastructure/persistence/stores/project/project-permissions-slice
 * @governance EPIC-CP-1.3
 *
 * FSA permission state management for projects.
 * Provides cached permission checking for faster dashboard loads.
 */

import { StateCreator } from 'zustand';
import type {
  ProjectState,
  ProjectPermissionsMethods,
} from './project-types';
import type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';
import { getPermissionState } from '@/lib/filesystem/permission-lifecycle';

export const createProjectPermissionsSlice: StateCreator<
  ProjectState,
  [],
  [],
  ProjectPermissionsMethods
> = (set, get) => ({
  // Update project's cached permission state
  updateProjectPermission: (projectId: string, permissionState: FsaPermissionState) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    set((state) => ({
      projects: {
        ...state.projects,
        [projectId]: {
          ...existing,
          lastKnownPermissionState: permissionState,
        },
      },
    }));
  },

  // Get cached permission state for project
  getProjectPermission: (projectId: string) => {
    const project = get().projects[projectId];
    return project?.lastKnownPermissionState;
  },

  // Filter projects by permission state
  getProjectsWithPermission: (permissionState: FsaPermissionState) => {
    const projects = Object.values(get().projects);
    return projects.filter(
      (p) => p.lastKnownPermissionState === permissionState
    );
  },

  // Check actual permission state from FSA handle and update cache
  checkProjectPermission: async (projectId: string): Promise<FsaPermissionState> => {
    const project = get().projects[projectId];
    if (!project) {
      return 'unknown';
    }

    try {
      const state = await getPermissionState(project.fsaHandle, 'readwrite');

      // Update cache
      (get() as any).updateProjectPermission(projectId, state);

      return state;
    } catch (error) {
      console.error('[ProjectStore] Failed to check permission:', error);
      return 'denied';
    }
  },

  // Clear cached permission state
  invalidateProjectPermission: (projectId: string) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    set((state) => ({
      projects: {
        ...state.projects,
        [projectId]: {
          ...existing,
          lastKnownPermissionState: undefined,
        },
      },
    }));
  },
});
