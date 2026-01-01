/**
 * Provider Store Facade - Legacy Location
 *
 * Re-exports from the unified app store for backward compatibility.
 * This file exists at the old location to support existing imports.
 *
 * @module stores/provider-store
 * @story AC-1.8 - Create facade re-exports
 */

// Re-export everything from the new location
export {
  useProviderStore,
  useAppStore,
  useAppStoreHydration,
  useAgents,
  useActiveAgent,
  useAgentsForWorkspace,
  useProviders,
  useActiveProvider,
  useAvailableModels,
  useValidationErrors,
} from '@/infrastructure/persistence/stores/use-app-store';

// Re-export types
export type {
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderState,
  AppState,
} from '@/infrastructure/persistence/stores/providers/types';

// Re-export agent types
export type { Agent } from '@/core/entities/Agent';
