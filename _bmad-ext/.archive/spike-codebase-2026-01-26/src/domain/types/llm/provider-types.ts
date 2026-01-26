/**
 * @fileoverview Provider Type Definitions
 * @module domain/types/llm/provider-types
 *
 * Canonical type definitions for AI provider configuration.
 * Single source of truth for provider-related types.
 *
 * @ epic EPIC-GU
 * @ story GU-A-01 - Unify Provider Type Definitions
 * @ epic EPIC-PRV
 * @ story PRV-01 - Universal Provider Types
 * @created 2026-01-09
 * @updated 2026-01-11
 */

// Import ModelInfo first since it's used in ProviderConfig
import type { ModelInfo } from './model-types.js';

// ============================================================================
// MODALITY TYPES (EPIC-PRV)
// ============================================================================

/**
 * Supported modality types for multi-modal providers
 *
 * Updated 2026-01-11: Added 'audio' for Gemini 2.5 support
 * Updated 2026-01-14: Added 'video' for Gemini 3.0 support
 *
 * @ epic EPIC-PRV
 * @ story PRV-01
 */
export type ModalityType = 'text' | 'image' | 'audio' | 'video' | 'tts' | 'stt';

/**
 * Provider type - determines which adapter to use
 */
export type ProviderType =
  | 'openai'
  | 'openai-compatible'
  | 'anthropic'
  | 'gemini'
  | 'universal'; // EPIC-PRV: Multi-endpoint provider

/**
 * Provider Configuration
 *
 * Represents an LLM provider (OpenRouter, Anthropic, OpenAI, Gemini, etc.)
 * with base URL, authentication flags, and metadata.
 *
 * SECURITY: API keys are stored in encrypted credential vault.
 * This interface only contains a FLAG indicating whether a key exists.
 */
export interface ProviderConfig {
  /** Unique provider identifier (e.g., 'openrouter', 'anthropic') */
  id: string;

  /** Display name for UI */
  name: string;

  /** Provider type for adapter selection */
  type: ProviderType;

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
   * Vault key identifier (BYOK Vault Integration)
   * Unique identifier for the key in the credential vault
   */
  keyId?: string;

  /**
   * Key storage timestamp (BYOK Vault Integration)
   * Unix timestamp when the API key was stored in vault
   */
  keyStoredAt?: number;

  /**
   * Key validation timestamp (BYOK Vault Integration)
   * Unix timestamp when the API key was last validated
   */
  lastKeyValidatedAt?: number;

  /**
   * Key expiration timestamp (BYOK Vault Integration)
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
 * OpenAI Compatible Provider Configuration
 * User-configurable settings for custom endpoints
 */
export interface OpenAICompatibleConfig {
  /** Unique identifier for this custom provider config */
  id: string;

  /** Display name for this provider */
  name: string;

  /** Base URL for the API (e.g., http://localhost:1234/v1) */
  baseURL: string;

  /**
   * API Key existence flag (true if key stored in credential vault)
   * @security Actual API key stored in encrypted credential-vault.ts
   */
  hasApiKey: boolean;

  /** Custom headers to send with requests */
  headers?: Record<string, string>;

  /** Default model ID */
  defaultModel?: string;

  /** Whether this provider supports native tool calling */
  supportsNativeTools?: boolean;

  /** Whether the API key is required (false for local providers) */
  requiresApiKey?: boolean;

  /** When this config was created */
  createdAt: string;

  /** Last connection test result */
  lastTestResult?: {
    success: boolean;
    latencyMs?: number;
    error?: string;
    testedAt: string;
  };
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  /** Whether connection succeeded */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Response time in ms */
  latencyMs?: number;
}

/**
 * Provider Key Metadata
 *
 * Tracks API key storage and validation timestamps.
 * Part of BYOK Vault Integration.
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
 * Part of BYOK Vault Integration.
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
// UNIVERSAL PROVIDER TYPES (EPIC-PRV)
// ============================================================================

/**
 * Universal Model Configuration
 *
 * Represents a model available from a universal provider.
 * Models are manually configured, not auto-discovered.
 *
 * @ epic EPIC-PRV
 * @ story PRV-01
 */
export interface UniversalModelConfig {
  /** Unique model identifier (e.g., 'zai-org/GLM-4.7-TEE') */
  id: string;

  /** Display name for UI */
  name: string;

  /**
   * Supported modalities for this model
   * A model may support text, image generation, TTS, STT, etc.
   */
  modalities: ModalityType[];

  /** Maximum context window in tokens (if known) */
  contextLength?: number;

  /** Whether model supports streaming responses */
  supportsStreaming?: boolean;

  /** Whether this is a free model */
  isFree?: boolean;

  /** Model description */
  description?: string;

  /** Model version/identifier for provider API */
  version?: string;
}

/**
 * Universal Provider Configuration
 *
 * Represents an OpenAI-compatible provider with per-modality endpoints.
 * This enables providers like Chutes.ai that have different URLs for different modalities.
 *
 * @ epic EPIC-PRV
 * @ story PRV-01
 */
export interface UniversalProviderConfig {
  /** Unique provider identifier (e.g., 'chutes', 'openrouter') */
  id: string;

  /** Display name for UI */
  name: string;

  /** Provider description */
  description?: string;

  /**
   * Per-modality endpoints
   * Each modality can have its own base URL
   *
   * @example
   * endpoints: {
   *   text: 'https://llm.chutes.ai/v1',
   *   image: 'https://image.chutes.ai',
   *   tts: 'https://chutes-kokoro.chutes.ai',
   *   stt: 'https://chutes-whisper-large-v3.chutes.ai',
   * }
   */
  endpoints: Partial<Record<ModalityType, string>>;

  /**
   * Default API key (stored in credential vault)
   * @security Actual API key stored in encrypted credential-vault.ts
   * This is just a reference flag
   */
  hasApiKey: boolean;

  /** Vault key identifier (BYOK Vault Integration) */
  keyId?: string;

  /** Whether provider requires API key (false for localhost) */
  requiresApiKey?: boolean;

  /** Default headers for requests */
  defaultHeaders?: Record<string, string>;

  /** Available models for this provider (manually configured) */
  models: UniversalModelConfig[];

  /** Default model ID */
  defaultModel?: string;

  /** Documentation URL */
  docsUrl?: string;

  /** Provider website URL */
  websiteUrl?: string;

  /** Whether provider is currently active */
  enabled?: boolean;

  /** Custom provider flag (user-added vs built-in) */
  isCustom?: boolean;

  /** When this config was created (ISO 8601) */
  createdAt: string;

  /** When this config was last updated (ISO 8601) */
  updatedAt: string;
}

/**
 * Provider Request Context
 *
 * Context for executing a provider request.
 *
 * @ epic EPIC-PRV
 * @ story PRV-01
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
    topP?: number;
    stream?: boolean;
  };
}

/**
 * Provider Response
 *
 * Standardized response from any provider.
 *
 * @ epic EPIC-PRV
 * @ story PRV-01
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

  /** Usage statistics (if provided by provider) */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Provider Registry Entry
 *
 * Internal registry entry with metadata.
 *
 * @ epic EPIC-PRV
 * @ story PRV-02
 */
export interface ProviderRegistryEntry {
  /** Provider configuration */
  config: UniversalProviderConfig;

  /** When entry was registered */
  registeredAt: string;

  /** When entry was last accessed */
  lastAccessedAt?: string;

  /** Request count for this provider */
  requestCount?: number;

  /** Success rate (0-1) */
  successRate?: number;
}

