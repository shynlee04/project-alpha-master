/**
 * Agent Store Facade - Unified App Store Re-Export
 *
 * Re-exports from the unified app store (use-app-store.ts).
 * Maintains zero breaking changes for existing imports.
 *
 * @module agents/index
 * @story AC-1.8 - Update agents facade to use unified store
 * @migration Migrated from agents-store to use-app-store
 */

// Re-export from unified app store
export {
  useAppStore as useAgentsStore,
  useAppStoreHydration as useAgentsStoreHydration,
  useAgents,
  useAgentsForWorkspace,
  useProviders,
  useActiveProvider,
  useAvailableModels,
  useValidationErrors,
} from '@/infrastructure/persistence/stores/use-app-store';

// Re-export useActiveAgent from agent-selection-store (not use-app-store)
// NOTE: useActiveAgent(agents) requires agents array parameter
export { useActiveAgent } from './agent-selection-store';

// Re-export agent slice creators for advanced usage
export {
  createAgentCrudSlice,
  createAgentWorkspaceBindingsSlice,
  createAgentValidationSlice,
  createAgentEventsSlice,
  createAgentUtilsSlice,
  DEFAULT_AGENT,
} from './slices';

// Re-export provider slice creators (for cross-store access)
export {
  createProviderCrudSlice,
  createProviderModelsSlice,
  createProviderUtilsSlice,
} from '../providers';

// Re-export types
export type { CombinedAgentsState, CombinedAgentsState as AgentsState } from './types';
export type { AppState, ProviderState } from '../types';
export type { Agent } from '@/core/entities/Agent';
