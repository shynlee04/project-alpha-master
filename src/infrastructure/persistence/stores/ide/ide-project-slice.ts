/**
 * @fileoverview IDE Project Slice
 * @module infrastructure/persistence/stores/ide/ide-project-slice
 * @governance EPIC-CP-1
 *
 * Manages project scoping for IDE state:
 * - projectId: Current project ID (scopes all IDE state)
 * - setProjectId: Set current project
 * - reset: Reset all state (for project change)
 *
 * Multi-project support:
 * - Each project has its own IDE state
 * - Reset clears all slices via cross-slice communication
 * - Future: Load project-specific state from Dexie
 */

import { StateCreator } from 'zustand';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import type { IDEProjectState } from './ide-types';

export const createIDEProjectSlice: StateCreator<
  IDEProjectState,
  [],
  [],
  IDEProjectState
> = (set, _get, _api) => ({
  // =========================================================================
  // State Initialization
  // =========================================================================

  projectId: null,
  _hasHydrated: false,

  // =========================================================================
  // Actions
  // =========================================================================

  /**
   * Set the current project ID
   * Scopes all IDE state to this project
   *
   * 45-03: Emits WORKSPACE_CHANGED event to notify other workspaces
   *
   * @param projectId - Project ID to set (null for no project)
   *
   * @example
   * setProjectId('project-123') // Scope to project
   * setProjectId(null)          // Clear project scope
   */
  setProjectId: (projectId: string | null) => {
    set({ projectId });

    // 45-03: Emit event for cross-workspace project synchronization
    eventBus.emit(DomainEventType.WORKSPACE_CHANGED, {
      workspaceType: 'ide',
      projectId,
      timestamp: new Date(),
    });

    console.log('[IDESlice] Project ID set to:', projectId);
  },

  /**
   * Reset all IDE state
   * Called when switching projects or clearing workspace
   *
   * NOTE: This only clears project ID.
   * Other slices must be cleared via cross-slice communication.
   *
   * @example
   * reset() // Clear project ID
   */
  reset: () => {
    set({ projectId: null });

    // TODO: Signal other slices to reset via event bus
    console.log('[IDESlice] Project state reset');
  },

  /**
   * Set hydration completion status
   * Called by persist middleware after rehydration
   *
   * @param hydrated - Whether store has finished hydrating
   */
  setHasHydrated: (hydrated: boolean) => {
    set({ _hasHydrated: hydrated } as Partial<IDEProjectState>);
  },
});
