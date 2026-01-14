/**
 * @fileoverview Project Bindings Slice
 * @module infrastructure/persistence/stores/project/project-bindings-slice
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
  // Update project workspace bindings
  updateProjectBindings: async (projectId: string, bindings: WorkspaceBindings) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    console.log('[ProjectStore] Updating bindings for project:', projectId, bindings);

    // Validate bindings (cross-slice call)
    const validation = (get() as any).validateBindings(bindings);
    if (!validation.isValid) {
      console.error('[ProjectStore] Invalid bindings:', validation.errors);
      throw new Error(validation.errors.join(', '));
    }

    // Merge bindings with existing project
    const updated = {
      ...existing,
      bindings: {
        ...existing.bindings,
        ...bindings,
      },
    };

    set((state) => ({
      projects: { ...state.projects, [projectId]: updated },
    }));

    // Persist to Dexie (async, non-blocking)
    // ARC-C06: Added Dexie persistence for bindings updates
    db.projects.update(projectId, { bindings: updated.bindings }).catch((error: unknown) => {
      const err = error as Error;
      console.error('[ProjectStore] Failed to persist bindings to Dexie:', err.message);
    });
  },

  // Get project bindings
  getProjectBindings: (projectId: string) => {
    const project = get().projects[projectId];
    return project?.bindings || null;
  },

  // Validate bindings configuration
  validateBindings: (bindings: WorkspaceBindings): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Rule: At least one workspace must be enabled
    const enabledCount = Object.values(bindings).filter(Boolean).length;
    if (enabledCount === 0) {
      errors.push('At least one workspace must be enabled');
    }

    // Rule: Warn if fewer than 2 workspaces enabled
    if (enabledCount < 2) {
      warnings.push('Only one workspace enabled - consider enabling more for better integration');
    }

    // Rule: Validate workspace keys
    const validWorkspaces = ['ide', 'knowledge', 'notes', 'study'];
    const invalidKeys = Object.keys(bindings).filter(
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
    const bindings = (get() as any).getProjectBindings(projectId);
    if (!bindings) return [];

    return Object.entries(bindings)
      .filter(([_, enabled]) => enabled === true)
      .map(([workspace]) => workspace as keyof WorkspaceBindings);
  },

  // Get default workspace for project
  getDefaultWorkspace: (projectId: string) => {
    const bindings = (get() as any).getProjectBindings(projectId);
    if (!bindings) return 'ide';

    // Priority: IDE > Knowledge > Notes > Study
    const priority: (keyof WorkspaceBindings)[] = ['ide', 'knowledge', 'notes', 'study'];

    for (const workspace of priority) {
      if (bindings[workspace]) {
        return workspace;
      }
    }

    // Fallback to first enabled workspace
    const firstEnabled = Object.entries(bindings).find(([_, enabled]) => enabled);
    return (firstEnabled?.[0] || 'ide') as keyof WorkspaceBindings;
  },
});
