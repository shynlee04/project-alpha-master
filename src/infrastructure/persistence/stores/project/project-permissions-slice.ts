/**
 * @fileoverview Project Permissions Slice
 * @module infrastructure/persistence/stores/project/project-permissions-slice
 * @governance EPIC-CP-1.3
 *
 * FSA permission state management for projects.
 * Provides cached permission checking for faster dashboard loads.
 *
 * PS-04: Uses handlePersistenceService instead of direct fsaHandle access.
 */

import { StateCreator } from 'zustand';
import type {
  ProjectState,
  ProjectPermissionsMethods,
} from './project-types';
import type { FsaPermissionState } from '@/infrastructure/filesystem';
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';

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
  // PS-04: Uses handlePersistenceService to restore handle
  checkProjectPermission: async (projectId: string): Promise<FsaPermissionState> => {
    const project = get().projects[projectId];
    if (!project) {
      return 'unknown';
    }

    // IndexedDB projects have auto-granted permission (no FSA handle needed)
    if (project.storageType === 'indexeddb') {
      const state: FsaPermissionState = 'granted';
      // Update cache
      (get() as any).updateProjectPermission(projectId, state);
      return state;
    }

    // FSA projects: try to restore handle via handlePersistenceService
    const result = await handlePersistenceService.restoreHandle(projectId);

    if (!result.success) {
      // Handle restoration failed - determine state based on failure reason
      if (result.requiresUserInteraction) {
        // User needs to re-select the folder
        const state: FsaPermissionState = 'prompt';
        (get() as any).updateProjectPermission(projectId, state);
        return state;
      }
      // Silent failure - permission denied
      const state: FsaPermissionState = 'denied';
      (get() as any).updateProjectPermission(projectId, state);
      return state;
    }

    // Handle restored successfully - check actual permission
    if (result.handle) {
      try {
        // Get actual permission state from the handle
        // PS-04: We can't easily check permission on restored handle without user interaction
        // For now, assume 'granted' if restoration succeeded
        const state: FsaPermissionState = 'granted';
        (get() as any).updateProjectPermission(projectId, state);
        return state;
      } catch (error) {
        console.error('[ProjectStore] Failed to check permission:', error);
        const state: FsaPermissionState = 'denied';
        (get() as any).updateProjectPermission(projectId, state);
        return state;
      }
    }

    // No handle returned
    const finalState: FsaPermissionState = 'denied';
    (get() as any).updateProjectPermission(projectId, finalState);
    return finalState;
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
