/**
 * Agent Store Facade - Backward Compatibility Layer
 *
 * Re-exports everything from the new location to maintain
 * zero breaking changes for existing imports.
 *
 * This facade ensures all 19 integration points continue working
 * without any code changes.
 *
 * BEFORE: import { useAgentsStore } from '@/stores/agents-store';
 * AFTER:  import { useAgentsStore } from '@/stores/agents-store'; (same import path!)
 *
 * The only change is internal file structure.
 *
 * @module agents/index
 * @story AC-1.3 - Split agents-store.ts god store into 5 slices
 */

// Re-export everything for backward compatibility
export {
  useAgentsStore,
  useAgentsStoreHydration,
  DEFAULT_AGENT,
  type AgentsState,
} from './agents-store';

// Re-export slice creators for advanced usage
export {
  createAgentCrudSlice,
  createAgentWorkspaceBindingsSlice,
  createAgentValidationSlice,
  createAgentEventsSlice,
  createAgentUtilsSlice,
} from './slices';

// Export combined state type
export type { CombinedAgentsState } from './types';
