/**
 * @fileoverview Project Bindings Slice
 * @module infrastructure/persistence/stores/project/project-workspaceBindings-slice
 * @governance EPIC-CP-1.2
 *
 * Workspace binding management for projects.
 * WorkspaceBindings is a Record<string, boolean> - each workspace is either enabled (true) or disabled (false).
 */

import { StateCreator } from 'zustand';
import { db } from '@/infrastructure/persistence/dexie-db';
import type {
  WorkspaceBindings,
  ValidationResult,
  ProjectState,
  ProjectBindingMethods,
} from './project-types';

export const createProjectBindingsSlice: StateCreator<
  ProjectState,
  [],
  [],
  ProjectBindingMethods
> = (set, get) => ({
  // Update project workspace workspaceBindings
  updateProjectBindings: async (projectId: string, workspaceBindings: WorkspaceBindings) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    console.log('[ProjectStore] Updating workspaceBindings for project:', projectId, workspaceBindings);

    // Validate workspaceBindings (cross-slice call)
    const validation = (get() as any).validateBindings(workspaceBindings);
    if (!validation.isValid) {
      console.error('[ProjectStore] Invalid workspaceBindings:', validation.errors);
      throw new Error(validation.errors.join(', '));
    }

    // Merge workspaceBindings with existing project
    const updated = {
      ...existing,
      workspaceBindings: {
        ...existing.workspaceBindings,
        ...workspaceBindings,
      },
    };

    set((state) => ({
      projects: { ...state.projects, [projectId]: updated },
    }));

    // Persist to Dexie (async, non-blocking)
    // ARC-C06: Added Dexie persistence for workspaceBindings updates
    db.projects.update(projectId, { workspaceBindings: updated.workspaceBindings }).catch((error: unknown) => {
      const err = error as Error;
      console.error('[ProjectStore] Failed to persist workspaceBindings to Dexie:', err.message);
    });
  },

  // Get project workspaceBindings
  getProjectBindings: (projectId: string) => {
    const project = get().projects[projectId];
    return project?.workspaceBindings || null;
  },

  // Validate workspaceBindings configuration
  validateBindings: (workspaceBindings: WorkspaceBindings): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Rule: At least one workspace must be enabled
    const enabledCount = Object.values(workspaceBindings).filter(Boolean).length;
    if (enabledCount === 0) {
      errors.push('At least one workspace must be enabled');
    }

    // Rule: Warn if fewer than 2 workspaces enabled
    if (enabledCount < 2) {
      warnings.push('Only one workspace enabled - consider enabling more for better integration');
    }

    // Rule: Validate workspace keys
    const validWorkspaces = ['ide', 'knowledge', 'notes', 'study'];
    const invalidKeys = Object.keys(workspaceBindings).filter(
      key => !validWorkspaces.includes(key)
    );
    if (invalidKeys.length > 0) {
      warnings.push(`Unknown workspace keys: ${invalidKeys.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  // Get enabled workspaces for project
  getEnabledWorkspaces: (projectId: string) => {
    const workspaceBindings = (get() as any).getProjectBindings(projectId);
    if (!workspaceBindings) return [];

    return Object.entries(workspaceBindings)
      .filter(([_, enabled]) => enabled === true)
      .map(([workspace]) => workspace as keyof WorkspaceBindings);
  },

  // Get default workspace for project
  getDefaultWorkspace: (projectId: string) => {
    const workspaceBindings = (get() as any).getProjectBindings(projectId);
    if (!workspaceBindings) return 'ide';

    // Priority: IDE > Knowledge > Notes > Study
    const priority: (keyof WorkspaceBindings)[] = ['ide', 'knowledge', 'notes', 'study'];

    for (const workspace of priority) {
      if (workspaceBindings[workspace]) {
        return workspace;
      }
    }

    // Fallback to first enabled workspace
    const firstEnabled = Object.entries(workspaceBindings).find(([_, enabled]) => enabled);
    return (firstEnabled?.[0] || 'ide') as keyof WorkspaceBindings;
  },
});
