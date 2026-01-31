/**
 * @fileoverview Agent Selection Utility Actions
 * @module infrastructure/persistence/stores/agents/slices/agent-selection-utils
 * @governance Architectural Specification v3.0
 *
 * Utility actions for hydration and state management.
 */

import type { AgentSelectionState } from './agent-selection-state';

/**
 * Create agent selection utility actions slice
 * @param get - Zustand getState function (unused but kept for consistency)
 * @param set - Zustand setState function
 */
export function createAgentSelectionUtils(
  _get: () => AgentSelectionState,
  set: (partial: Partial<AgentSelectionState>) => void
) {
  return {
    /**
     * Set hydration flag
     */
    setHasHydrated: (hasHydrated: boolean) => {
      set({ _hasHydrated: hasHydrated });
    },

    /**
     * Reset agent selection state to defaults
     */
    reset: () => {
      set({
        activeAgentId: null,
        defaultAgentIds: { ide: null, knowledge: null, study: null, notes: null },
        lastSelectedAgentIds: { ide: null, knowledge: null, study: null, notes: null },
        _hasHydrated: false,
      });
    },
  };
}
