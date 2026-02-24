/**
 * PHASE 2 STUB: Provider Types
 * Original code archived to: _phase2-archive/infrastructure/persistence/stores/providers/types.ts
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

// Re-export from domain types for backward compatibility
export type {
  ProviderType,
  ProviderConfig,
  ModelInfo,
  ModelSettings,
  ModelStateEntry,
  ProviderKeyMetadata,
  KeyValidationResult,
  StoredCredential,
  OpenAICompatibleConfig,
  ConnectionTestResult,
  AdapterConfig,
} from '@/domain/types/llm';

// Provider state interface (store-specific)
export interface ProviderState {
  providers: any[];
  activeProviderId: string | null;
  modelSettings: Record<string, any>;
  availableModels: Record<string, any[]>;
  isLoading: boolean;
  isLoadingModels: Record<string, boolean>;
  selectedModelId: string | null;
  modelCache: Record<string, any>;
  keyMetadata: Record<string, any>;
}
