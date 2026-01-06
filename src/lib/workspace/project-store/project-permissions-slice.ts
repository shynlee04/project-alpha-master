/**
 * @fileoverview Project Permissions Slice - Permission state checking
 * @module workspace/project-store/project-permissions-slice
 */

import { StateCreator } from 'zustand';
import type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';

export interface ProjectPermissionsSliceState {
  /** Permission state cache (runtime-only, not persisted) */
  permissionCache: Record<string, FsaPermissionState>;
}

export interface ProjectPermissionsSliceActions {
  /** Check permission state for a project's handle */
  checkProjectPermission: (id: string) => Promise<FsaPermissionState>;

  /** Update cached permission state */
  setPermissionState: (id: string, state: FsaPermissionState) => void;

  /** Clear permission cache for a project */
  clearPermissionCache: (id: string) => void;

  /** List projects with permission state */
  listProjectsWithPermission: () => Promise<Array<any>>;
}

export type ProjectPermissionsSlice = ProjectPermissionsSliceState & ProjectPermissionsSliceActions;

export const createProjectPermissionsSlice: StateCreator<
  ProjectPermissionsSlice,
  [],
  [],
  ProjectPermissionsSlice
> = (set, get) => ({
  permissionCache: {},

  checkProjectPermission: async (id) => {
    // This will delegate to a permission checking service
    const state = get() as any;
    const project = state.getProject?.(id);
    if (!project || !project.fsaHandle) {
      return 'denied';
    }

    // Import dynamically to avoid circular dependency
    const { getPermissionState } = await import('@/lib/filesystem/permission-lifecycle');
    return await getPermissionState(project.fsaHandle, 'readwrite');
  },

  setPermissionState: (id, permissionState) => {
    set((state) => ({
      permissionCache: {
        ...state.permissionCache,
        [id]: permissionState,
      },
    }));
  },

  clearPermissionCache: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.permissionCache;
      return { permissionCache: rest };
    });
  },

  listProjectsWithPermission: async () => {
    const state = get() as any;
    const projects = state.listProjects?.() || [];

    const projectsWithPermission = await Promise.all(
      projects.map(async (project: any) => {
        try {
          const permissionState = await state.checkProjectPermission(project.id);
          return { ...project, permissionState };
        } catch {
          return { ...project, permissionState: 'denied' as FsaPermissionState };
        }
      })
    );

    return projectsWithPermission;
  },
});
