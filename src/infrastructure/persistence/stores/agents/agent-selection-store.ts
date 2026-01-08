/**
 * @fileoverview Agent Selection Store - Refactored with Slices
 * @module infrastructure/persistence/stores/agents/agent-selection-store
 * @governance Architectural Specification v3.0
 * @ai-observable true
 *
 * Single source of truth for active agent selection.
 * Implements workspace-aware agent switching with hot-reload support.
 *
 * Refactored from 303 lines to use focused slices for better maintainability.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { AgentData } from './types';

// Import slices
import type { AgentSelectionState } from './slices/agent-selection-state';
import { createAgentSelectionActions } from './slices/agent-selection-actions';

// Re-export the state interface for external use
export type { AgentSelectionState };
import { createAgentSelectionQueries } from './slices/agent-selection-queries';
import { createAgentSelectionEvents } from './slices/agent-selection-events';
import { createAgentSelectionUtils } from './slices/agent-selection-utils';

/**
 * Create Dexie storage for agent selection
 */
function createAgentSelectionDexieStorage() {
  return createJSONStorage(() => createDexieStorage('agentConfigs'));
}

/**
 * Agent Selection Store - Composed from focused slices
 */
export const useAgentSelectionStore = create<AgentSelectionState>()(
  persist(
    (set, get) => ({
      // ========== INITIAL STATE ==========
      activeAgentId: null,
      defaultAgentIds: {
        ide: null,
        knowledge: null,
        study: null,
        notes: null,
      },
      lastSelectedAgentIds: {
        ide: null,
        knowledge: null,
        study: null,
        notes: null,
      },
      _hasHydrated: false,

      // ========== SLICE ACTIONS ==========
      // Create all slices by passing get/set
      ...createAgentSelectionActions(get, set),
      ...createAgentSelectionQueries(get, set),
      ...createAgentSelectionEvents(),
      ...createAgentSelectionUtils(get, set),
    }),
    {
      name: 'agent-selection-store',
      storage: createAgentSelectionDexieStorage(),
      partialize: (state) => ({
        activeAgentId: state.activeAgentId,
        defaultAgentIds: state.defaultAgentIds,
        lastSelectedAgentIds: state.lastSelectedAgentIds,
      } as unknown as AgentSelectionState),
      onRehydrateStorage: () => (state) => {
        if (!state) return state;

        // Validate agent IDs still exist
        const agents = useAppStore.getState().agents;
        const validAgentIds = new Set(agents.map(a => a.id));

        // Validate active agent
        if (state.activeAgentId && !validAgentIds.has(state.activeAgentId)) {
          state.activeAgentId = null;
        }

        // Validate default agents
        for (const workspaceType of Object.keys(state.defaultAgentIds)) {
          const key = workspaceType as WorkspaceType;
          if (state.defaultAgentIds[key] && !validAgentIds.has(state.defaultAgentIds[key]!)) {
            state.defaultAgentIds[key] = null;
          }
        }

        // Validate last selected agents
        for (const workspaceType of Object.keys(state.lastSelectedAgentIds)) {
          const key = workspaceType as WorkspaceType;
          if (state.lastSelectedAgentIds[key] && !validAgentIds.has(state.lastSelectedAgentIds[key]!)) {
            state.lastSelectedAgentIds[key] = null;
          }
        }

        return state;
      },
    }
  )
);

// Initialize hydration flag on mount
if (typeof window !== 'undefined') {
  useAgentSelectionStore.getState().setHasHydrated(true);
}

// Export helper functions - these return AgentData (plain objects from store)
export function getActiveAgent(): AgentData | null {
  return useAgentSelectionStore.getState().getActiveAgent();
}

export function getAgentForWorkspace(workspaceType: WorkspaceType): AgentData | null {
  return useAgentSelectionStore.getState().getAgentForWorkspace(workspaceType);
}

export function selectAgentForWorkspace(workspaceType: WorkspaceType): void {
  useAgentSelectionStore.getState().selectAgentForWorkspace(workspaceType);
}

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

/**
 * @deprecated Use useAgentSelectionStore instead
 * Alias for backward compatibility
 */
export const useAgentSelection = useAgentSelectionStore;

/**
 * @deprecated Use useAppStore instead
 * Helper hook for getting active agent from agents list
 */
export function useActiveAgent(agents: AgentData[]) {
  const { activeAgentId } = useAgentSelectionStore();
  return agents.find(agent => agent.id === activeAgentId) || null;
}
