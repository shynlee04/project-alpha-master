/**
 * @fileoverview Provider Playground Types (Debug Only)
 * @module routes/__debug__/provider-playground/lib/types
 *
 * ISOLATED DEBUG TYPES - Not for production use.
 * These types support the provider test playground without
 * affecting production domain types.
 */

/**
 * Supported modality types for multi-modal providers
 */
export type ModalityType = 'text' | 'image' | 'tts' | 'stt';

/**
 * Universal Provider Configuration (Debug)
 *
 * Represents an OpenAI-compatible provider with per-modality endpoints.
 * This is a debug-only type for testing providers with different endpoints
 * for different modalities.
 */
export interface UniversalProviderConfig {
  /** Unique provider identifier */
  id: string;

  /** Display name for UI */
  name: string;

  /** Provider description */
  description?: string;

  /**
   * Per-modality endpoints
   * Each modality can have its own base URL
   */
  endpoints: Partial<Record<ModalityType, string>>;

  /**
   * Default API key (stored in localStorage for debug only)
   * WARNING: This is debug-only, NOT for production
   */
  defaultApiKey?: string;

  /** Whether provider requires API key */
  requiresApiKey?: boolean;

  /** Default headers for requests */
  defaultHeaders?: Record<string, string>;

  /** Available models for this provider */
  models: UniversalModelConfig[];

  /** Default model ID */
  defaultModel?: string;

  /** Documentation URL */
  docsUrl?: string;

  /** When this config was created */
  createdAt: string;

  /** When this config was last updated */
  updatedAt: string;
}

/**
 * Universal Model Configuration
 *
 * Represents a model available from a universal provider.
 */
export interface UniversalModelConfig {
  /** Unique model identifier */
  id: string;

  /** Display name for UI */
  name: string;

  /**
   * Supported modalities for this model
   * A model may support text, image generation, TTS, STT, etc.
   */
  modalities: ModalityType[];

  /** Maximum context window (tokens) */
  contextLength?: number;

  /** Whether model supports streaming responses */
  supportsStreaming?: boolean;

  /** Whether this is a free model */
  isFree?: boolean;

  /** Model description */
  description?: string;
}

/**
 * Provider Request Context
 *
 * Context for executing a provider request.
 */
export interface ProviderRequestContext {
  /** Provider identifier */
  providerId: string;

  /** Model identifier */
  model: string;

  /** Request modality */
  modality: ModalityType;

  /** Request payload (built by request builder) */
  payload: unknown;

  /** API key override (optional) */
  apiKeyOverride?: string;

  /** Generation parameters */
  parameters?: {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  };
}

/**
 * Provider Response
 *
 * Standardized response from any provider.
 */
export interface ProviderResponse {
  /** Whether request succeeded */
  success: boolean;

  /** Request latency in milliseconds */
  latencyMs: number;

  /** Response data (varies by modality) */
  data?: unknown;

  /** HTTP status code */
  statusCode?: number;

  /** Response headers */
  headers?: Record<string, string>;

  /** Error message if failed */
  error?: string;
}
