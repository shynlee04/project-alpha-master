/**
 * @fileoverview Project Permissions Slice
 * @module infrastructure/persistence/stores/project/project-permissions-slice
 * @governance EPIC-CP-1.3
 *
 * FSA permission state management for projects.
 * FSA-010 REMEDIATION: Permission state is now sourced from FSAHandleRecord only.
 * No more lastKnownPermissionState in Project - use handlePersistenceService instead.
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
> = (_set, get) => ({
  // Update project's permission state via handlePersistenceService
  // FSA-010: Now updates FSAHandleRecord.permissionStatus, not Project.lastKnownPermissionState
  updateProjectPermission: async (projectId: string, permissionState: FsaPermissionState) => {
    // Update the FSAHandleRecord in Dexie (single source of truth)
    await handlePersistenceService.updatePermissionStatus(projectId, permissionState);
  },

  // Get permission state from FSAHandleRecord (single source of truth)
  // FSA-010: No longer reads from Project.lastKnownPermissionState
  getProjectPermission: async (projectId: string) => {
    return handlePersistenceService.getPermissionStatus(projectId);
  },

  // Filter projects by permission state (requires checking each project's handle)
  // FSA-010: Uses handlePersistenceService.getPermissionStatus() for each project
  getProjectsWithPermission: async (permissionState: FsaPermissionState) => {
    const projects = Object.values(get().projects);
    const result: typeof projects = [];

    for (const project of projects) {
      if (project.storageType === 'indexeddb') {
        // IndexedDB projects always have 'granted' permission
        if (permissionState === 'granted') {
          result.push(project);
        }
        continue;
      }

      // FSA projects: check FSAHandleRecord
      const status = await handlePersistenceService.getPermissionStatus(project.id);
      if (status === permissionState) {
        result.push(project);
      }
    }

    return result;
  },

  // Check actual permission state from FSA handle
  // PS-04: Uses handlePersistenceService to restore handle
  checkProjectPermission: async (projectId: string): Promise<FsaPermissionState> => {
    const project = get().projects[projectId];
    if (!project) {
      return 'unknown';
    }

    // IndexedDB projects have auto-granted permission (no FSA handle needed)
    if (project.storageType === 'indexeddb') {
      return 'granted';
    }

    // FSA projects: try to restore handle via handlePersistenceService
    const result = await handlePersistenceService.restoreHandle(projectId);

    if (!result.success) {
      // Handle restoration failed - determine state based on failure reason
      if (result.requiresUserInteraction) {
        // User needs to re-select the folder
        return 'prompt';
      }
      // Silent failure - permission denied
      return 'denied';
    }

    // Handle restored successfully
    if (result.handle) {
      return 'granted';
    }

    // No handle returned
    return 'denied';
  },

  // Clear cached permission state - no-op now that we use FSAHandleRecord as source
  // FSA-010: Permission state is in FSAHandleRecord, no local cache to clear
  invalidateProjectPermission: async (projectId: string) => {
    // Permission state is now in FSAHandleRecord, not in Project
    // Just update the Dexie record to 'prompt' to force re-verification
    await handlePersistenceService.updatePermissionStatus(projectId, 'prompt');
  },
});
