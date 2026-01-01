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

  /** API key (empty string if not configured) */
  apiKey: string;

  /** Available models for this provider */
  models: ModelInfo[];

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

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * Provider State
 *
 * Complete state interface for provider configuration.
 * Includes both provider-store and models-loader-store functionality.
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

  // ========================================================================
  // ACTIONS (8 from provider-store + 3 from models-loader-store)
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
}
