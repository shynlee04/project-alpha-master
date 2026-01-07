/**
 * Provider Types - Provider Configuration State
 *
 * Defines the state interface for provider configuration.
 * Merges provider-store.ts + models-loader-store.ts into unified types.
 *
 * @module providers/types
 * @story AC-1.6 - Create unified provider slice
 */

// ============================================================================
// PROVIDER TYPES
// ============================================================================

/**
 * Provider Configuration
 *
 * Represents an LLM provider (OpenRouter, Anthropic, OpenAI, etc.)
 * with base URL, authentication, and metadata.
 *
 * SECURITY: API keys are stored in encrypted credential vault (credential-vault.ts)
 * This interface only contains a FLAG indicating whether a key exists.
 *
 * @story A-4 - BYOK Vault Integration - Added key metadata fields
 */
export interface ProviderConfig {
  /** Unique provider identifier (e.g., 'openrouter', 'anthropic') */
  id: string;

  /** Display name for UI */
  name: string;

  /** Provider type for adapter selection */
  type: import('@/lib/agent/providers/types').ProviderType;

  /** Base URL for API endpoints */
  baseURL: string;

  /** Default model ID for this provider */
  defaultModel?: string;

  /**
   * API Key existence flag (true if key stored in credential vault)
   * @security Actual API key stored in encrypted credential-vault.ts
   */
  hasApiKey: boolean;

  /**
   * Vault key identifier (A-4: BYOK Vault Integration)
   * Unique identifier for the key in the credential vault
   */
  keyId?: string;

  /**
   * Key storage timestamp (A-4: BYOK Vault Integration)
   * Unix timestamp when the API key was stored in vault
   */
  keyStoredAt?: number;

  /**
   * Key validation timestamp (A-4: BYOK Vault Integration)
   * Unix timestamp when the API key was last validated
   */
  lastKeyValidatedAt?: number;

  /**
   * Key expiration timestamp (A-4: BYOK Vault Integration)
   * Unix timestamp when the API key expires (if known)
   */
  keyExpiresAt?: number;

  /** Available models for this provider */
  models: ModelInfo[];

  /** Timestamp when models were last fetched (Unix timestamp) */
  lastModelFetchAt?: number;

  /** Whether provider is currently active */
  enabled: boolean;

  /** Legacy: Whether provider is currently active (deprecated, use enabled) */
  isActive?: boolean;

  /** Custom provider flag (user-added vs built-in) */
  isCustom?: boolean;

  /** Custom headers for OpenAI-compatible providers */
  headers?: Record<string, string>;

  /** Whether the provider supports native tool calling */
  supportsNativeTools?: boolean;
}

/**
 * Model Information
 *
 * Represents an AI model available from a provider.
 */
export interface ModelInfo {
  /** Unique model identifier (e.g., 'anthropic/claude-3-opus') */
  id: string;

  /** Display name for UI */
  name: string;

  /** Provider this model belongs to */
  providerId: string;

  /** Maximum context window (tokens) */
  contextLength?: number;

  /** Maximum output tokens */
  maxTokens?: number;

  /** Whether this is a free model (e.g., OpenRouter free tier) */
  isFree?: boolean;

  /** Whether model supports streaming responses */
  supportsStreaming?: boolean;

  /** Whether model supports vision/multimodal input */
  supportsImages?: boolean;

  /** Whether model supports function calling/tools */
  supportsTools?: boolean;
}

/**
 * Model Generation Settings
 *
 * Configurable parameters for model inference.
 */
export interface ModelSettings {
  /** Sampling temperature (0.0 - 2.0) */
  temperature: number;

  /** Maximum tokens to generate */
  maxTokens: number;

  /** Nucleus sampling threshold (0.0 - 1.0) */
  topP: number;

  /** Top-k sampling (for some models) */
  topK?: number;

  /** Frequency penalty (-2.0 - 2.0) */
  frequencyPenalty?: number;

  /** Presence penalty (-2.0 - 2.0) */
  presencePenalty?: number;
}

/**
 * Model Cache Entry
 *
 * Cached model data with metadata for freshness tracking.
 * Used by models-loader-store functionality (now merged).
 */
export interface ModelStateEntry {
  /** Cached models list */
  models: ModelInfo[];

  /** Whether models are currently being fetched */
  isLoadingModels: boolean;

  /** Timestamp of last fetch (null if never fetched) */
  lastFetchedAt: number | null;

  /** Error message if fetch failed */
  error: string | null;
}

/**
 * Provider Key Metadata
 *
 * Tracks API key storage and validation timestamps.
 * Part of BYOK Vault Integration (Story A-4).
 */
export interface ProviderKeyMetadata {
  /** Unique key identifier in vault */
  keyId: string;

  /** Timestamp when key was stored */
  storedAt: number;

  /** Timestamp when key was last validated */
  lastValidatedAt?: number;

  /** Timestamp when key expires (if known) */
  expiresAt?: number;

  /** Whether key validation passed */
  isValid: boolean;
}

/**
 * Key Validation Result
 *
 * Result of API key validation operation.
 * Part of BYOK Vault Integration (Story A-4).
 */
export interface KeyValidationResult {
  /** Whether key is valid */
  isValid: boolean;

  /** Validation status */
  status: 'valid' | 'invalid' | 'expired' | 'unknown';

  /** Provider-reported error if invalid */
  error?: string;

  /** When validation was performed */
  validatedAt: number;
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * Provider State
 *
 * Complete state interface for provider configuration.
 * Includes both provider-store and models-loader-store functionality.
 * Updated for BYOK Vault Integration (Story A-4).
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
