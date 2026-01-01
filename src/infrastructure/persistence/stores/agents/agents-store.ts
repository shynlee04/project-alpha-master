/**
 * Agents Store - Combined Store with 5 Slices
 *
 * Composed from 5 specialized slices:
 * 1. agent-crud-slice - Pure CRUD operations
 * 2. agent-workspace-bindings-slice - Workspace filtering
 * 3. agent-validation-slice - Provider/model validation
 * 4. agent-events-slice - Cross-workspace event emission
 * 5. agent-utils-slice - Selectors and hydration
 *
 * Uses December 2025 Zustand patterns:
 * - Slice pattern with StateCreator
 * - Persist middleware on combined store (not slices)
 * - Devtools integration
 * - Dexie persistence via createJSONStorage
 *
 * @module agents/agents-store
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';
import type { Agent } from '@/core/entities/Agent';
import type { CombinedAgentsState } from './types';
import {
  createAgentCrudSlice,
  createAgentWorkspaceBindingsSlice,
  createAgentValidationSlice,
  createAgentEventsSlice,
  createAgentUtilsSlice,
  DEFAULT_AGENT,
} from './slices';

/**
 * Combined Agents Store
 *
 * Composed from 5 slices with persist middleware.
 * Persist is applied to the COMBINED store (not individual slices).
 *
 * @example
 * ```tsx
 * const { agents, addAgentValidated, getAgentsForWorkspace } = useAgentsStore();
 * ```
 */
export const useAgentsStore = create<CombinedAgentsState>()(
  persist(
    (...a) => ({
      // Combine all 5 slices with spread operator
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),
    }),
    {
      name: 'agent-configs',

      // Use Dexie storage adapter for IndexedDB persistence
      storage: createJSONStorage(() => createDexieStorage('agentConfigs')),

      // Only persist essential fields (not hydration state or validation errors)
      partialize: (state) => ({
        agents: state.agents,
        activeAgentId: state.activeAgentId,
      }),

      // Hydration handler - restore defaults if empty
      onRehydrateStorage: () => (state) => {
        console.log('[AgentsStore] Rehydrated from IndexedDB:', state?.agents?.length, 'agents');

        if (state) {
          // Ensure at least one agent exists
          if (!state.agents || state.agents.length === 0) {
            state.agents = [DEFAULT_AGENT];
            state.activeAgentId = DEFAULT_AGENT.id;
          }

          // Ensure activeAgentId points to valid agent
          if (state.activeAgentId && !state.agents.find(a => a.id === state.activeAgentId)) {
            state.activeAgentId = state.agents[0]?.id || null;
          }

          state.setHasHydrated(true);
        }
      },
    }
  )
);

/**
 * Hook to wait for hydration from IndexedDB
 *
 * Use this to ensure the store has been hydrated before rendering.
 *
 * @example
 * ```tsx
 * const hasHydrated = useAgentsStoreHydration();
 * if (!hasHydrated) return <Loading />;
 * ```
 */
export function useAgentsStoreHydration() {
  return useAgentsStore((state) => state._hasHydrated);
}

/**
 * Export default agent for reference
 */
export { DEFAULT_AGENT };

/**
 * Export type for external use
 */
export type { CombinedAgentsState as AgentsState };
