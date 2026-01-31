/**
 * Provider Types - Facade for Backward Compatibility
 *
 * ⚠️ DEPRECATED: This file now re-exports from canonical domain types.
 * Import from '@/domain/types/llm' instead.
 *
 * @epic EPIC-GU
 * @story GU-A-01 - Unify Provider Type Definitions
 * @migrated 2026-01-09
 */

// ============================================================================
// CANONICAL TYPES - Imported for use, then re-exported
// ============================================================================

import type {
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

// Re-export for backward compatibility
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
};

// ============================================================================
// PROVIDER STATE - Keep state interface here (store-specific)
// ============================================================================

/**
 * Provider State
 *
 * Complete state interface for provider configuration.
 * Includes both provider-store and models-loader-store functionality.
 * Updated for BYOK Vault Integration (Story A-4).
 *
 * NOTE: This is a STORE-SPECIFIC interface and remains here.
 * The canonical type definitions are now in @/domain/types/llm.
 */
export interface ProviderState {
  /** List of configured providers */
  providers: ProviderConfig[];

  /** Currently active provider ID */
  activeProviderId: string | null;

  /** Model settings by provider ID */
  modelSettings: Record<string, ModelSettings>;

  /** Available models by provider ID (fetched from API) */
  availableModels: Record<string, ModelInfo[]>;

  /** Global loading state */
  isLoading: boolean;

  /** Loading state by provider ID (for model fetching) */
  isLoadingModels: Record<string, boolean>;

  /** Selected model ID (merged from models-loader-store) */
  selectedModelId: string | null;

  /** Model cache by provider ID (merged from models-loader-store) */
  modelCache: Record<string, ModelStateEntry>;

  /** Key metadata by provider ID (A-4: BYOK Vault Integration) */
  keyMetadata: Record<string, ProviderKeyMetadata>;

  // ========================================================================
  // ACTIONS (8 from provider-store + 3 from models-loader-store + 5 credentials)
  // ========================================================================

  /** Add a new provider configuration */
  addProvider: (config: ProviderConfig) => void;

  /** Update an existing provider configuration */
  updateProvider: (id: string, config: Partial<ProviderConfig>) => void;

  /** Remove a provider (validates no dependent agents) */
  removeProvider: (id: string, agents?: any[]) => Promise<void>;

  /** Set the active provider */
  setActiveProvider: (id: string) => void;

  /** Update model settings for a provider */
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;

  /** Fetch models from API for a provider */
  fetchModels: (providerId: string) => Promise<void>;

  /** Get available models for a provider */
  getAvailableModels: (providerId: string) => ModelInfo[];

  /** Reset to initial providers */
  reset: () => void;

  /** Set selected model (merged from models-loader-store) */
  setSelectedModel: (modelId: string) => void;

  /** Load models with caching (merged from models-loader-store) */
  loadModelsForProvider: (providerId: string) => Promise<void>;

  /** Clear models cache for a provider (merged from models-loader-store) */
  clearModelsCache: (providerId: string) => void;

  // ========================================================================
  // CREDENTIAL VAULT ACTIONS (A-4: BYOK Vault Integration)
  // ========================================================================

  /** Store API key in encrypted credential vault */
  storeProviderKey: (providerId: string, apiKey: string) => Promise<void>;

  /** Retrieve API key from credential vault */
  retrieveProviderKey: (providerId: string) => Promise<string | null>;

  /** Check if provider has a stored API key */
  hasProviderKey: (providerId: string) => Promise<boolean>;

  /** Delete API key from credential vault */
  deleteProviderKey: (providerId: string) => Promise<void>;

  /** Validate API key by attempting to use it */
  validateProviderKey: (providerId: string) => Promise<KeyValidationResult>;

  /** Sync hasApiKey flags with actual vault state */
  syncKeyFlags: () => Promise<void>;
}

// ============================================================================
// DEPRECATION NOTICE
// ============================================================================

/**
 * @deprecated Use from '@/domain/types/llm' instead
 * This file is a facade for backward compatibility during migration.
 */
export const TYPES_DEPRECATED = false;
