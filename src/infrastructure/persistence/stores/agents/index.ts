/**
 * PHASE 2 STUB: Agent Store Barrel
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/agents/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import { useAppStore, useAppStoreHydration } from '../use-app-store';

// Re-export from unified app store as stubs
export const useAgentsStore = useAppStore;
export const useAgentsStoreHydration = useAppStoreHydration;
export const useAgents = () => useAppStore(s => s.agents);
export const useAgentsForWorkspace = () => [];
export const useProviders = () => useAppStore(s => s.providers);
export const useActiveProvider = () => null;
export const useAvailableModels = () => [];
export const useValidationErrors = () => ({});

// Re-export from agent-selection-store
export { useActiveAgent, useAgentSelectionStore, useAgentSelection } from './agent-selection-store';

// Re-export slice creators (stubs)
export { createAgentCrudSlice, createAgentWorkspaceBindingsSlice, createAgentValidationSlice, createAgentEventsSlice, createAgentUtilsSlice, DEFAULT_AGENT } from './slices';

// Re-export provider slice creators (stubs)
export { createProviderCrudSlice, createProviderModelsSlice, createProviderUtilsSlice } from '../providers';

// Re-export types
export type { CombinedAgentsState, AgentsState, AgentData } from './types';
export type { AppState, ProviderState } from '../types';
