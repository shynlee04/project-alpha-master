/**
 * @fileoverview Model Type Definitions
 * @module domain/types/llm/model-types
 *
 * Canonical type definitions for AI model information and settings.
 * Single source of truth for model-related types.
 *
 * @ epic EPIC-GU
 * @ story GU-A-01 - Unify Provider Type Definitions
 * @created 2026-01-09
 */

/**
 * Model Information
 *
 * Represents an AI model available from a provider.
 * Extended with LLM parameters, pricing, and capabilities (CC-2025-12-29).
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

  /** Max output tokens (alias for compatibility) */
  maxOutputTokens?: number;

  /** Whether this is a free model (e.g., OpenRouter free tier) */
  isFree?: boolean;

  /** Whether model supports streaming responses */
  supportsStreaming?: boolean;

  /** Whether model supports vision/multimodal input */
  supportsImages?: boolean;

  /** Whether model supports function calling/tools */
  supportsTools?: boolean;

  // LLM Parameter Defaults (from provider API)

  /** Default temperature */
  temperature?: number;

  /** Max temperature allowed */
  maxTemperature?: number;

  /** Default top_p */
  topP?: number;

  /** Default top_k (Gemini/local) */
  topK?: number;

  // Capabilities

  /** Supported generation methods */
  supportedMethods?: string[];

  /** Input modalities (text, image, audio) */
  inputModalities?: string[];

  /** Output modalities */
  outputModalities?: string[];

  // Pricing (per 1M tokens)

  /** Pricing information */
  pricing?: {
    prompt: number;
    completion: number;
  };
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
