/**
 * Agents Store Facade - Backward Compatibility (Old Location)
 *
 * This file re-exports from the new location to maintain
 * zero breaking changes for existing imports.
 *
 * All imports using the OLD path continue to work:
 * import { useAgentsStore } from '@/stores/agents-store';
 *
 * @deprecated Import from '@/infrastructure/persistence/stores/agents' instead
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

// Re-export everything from the new location
export {
  useAgentsStore,
  useAgentsStoreHydration,
  DEFAULT_AGENT,
  type AgentsState,
} from '@/infrastructure/persistence/stores/agents';

// Re-export slice creators for advanced usage
export {
  createAgentCrudSlice,
  createAgentWorkspaceBindingsSlice,
  createAgentValidationSlice,
  createAgentEventsSlice,
  createAgentUtilsSlice,
} from '@/infrastructure/persistence/stores/agents/slices';

// Export combined state type
export type { CombinedAgentsState } from '@/infrastructure/persistence/stores/agents/types';
