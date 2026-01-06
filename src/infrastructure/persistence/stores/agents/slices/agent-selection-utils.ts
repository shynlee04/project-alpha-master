/**
 * @fileoverview Agent Selection Utility Actions
 * @module infrastructure/persistence/stores/agents/slices/agent-selection-utils
 * @governance Architectural Specification v3.0
 *
 * Utility actions for hydration and state management.
 */

import { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { AgentSelectionState } from './agent-selection-state';

/**
 * Create agent selection utility actions slice
 */
export function createAgentSelectionUtils() {
  return {
    /**
     * Set hydration flag
     */
    setHasHydrated: (hasHydrated: boolean) => {
      const get = () => useAgentSelectionStore.getState();
      get().set({ _hasHydrated: hasHydrated });
    },

    /**
     * Reset agent selection state to defaults
     */
    reset: () => {
      const get = () => useAgentSelectionStore.getState();
      get().set({
        activeAgentId: null,
        defaultAgentIds: { ide: null, knowledge: null, study: null, notes: null },
        lastSelectedAgentIds: { ide: null, knowledge: null, study: null, notes: null },
        _hasHydrated: false,
      });
    },
  };
}

// Import store for circular dependency resolution
import { useAgentSelectionStore } from '../agent-selection-store';
