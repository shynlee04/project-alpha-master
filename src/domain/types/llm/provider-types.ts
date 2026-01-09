/**
 * @fileoverview Provider Type Definitions
 * @module domain/types/llm/provider-types
 *
 * Canonical type definitions for AI provider configuration.
 * Single source of truth for provider-related types.
 *
 * @ epic EPIC-GU
 * @ story GU-A-01 - Unify Provider Type Definitions
 * @created 2026-01-09
 */

// Import ModelInfo first since it's used in ProviderConfig
import type { ModelInfo } from './model-types.js';

/**
 * Provider type - determines which adapter to use
 */
export type ProviderType =
  | 'openai'
  | 'openai-compatible'
  | 'anthropic'
  | 'gemini';

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
