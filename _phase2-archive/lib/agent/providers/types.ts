/**
 * @fileoverview Provider Types - Facade for Backward Compatibility
 * @module lib/agent/providers/types
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
  OpenAICompatibleConfig,
  ConnectionTestResult,
  ProviderKeyMetadata,
  KeyValidationResult,
  ModelInfo,
  ModelSettings,
  StoredCredential,
  AdapterConfig,
  ModalityType,
} from '@/domain/types/llm';

// Re-export for backward compatibility
export type {
  ProviderType,
  ProviderConfig,
  OpenAICompatibleConfig,
  ConnectionTestResult,
  ProviderKeyMetadata,
  KeyValidationResult,
  ModelInfo,
  ModelSettings,
  StoredCredential,
  AdapterConfig,
  ModalityType,
};

// ============================================================================
// CONSTANTS - Kept here for now (will migrate to domain/constants later)
// ============================================================================

/**
 * Built-in provider configurations
 */
export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    enabled: true,
    supportsNativeTools: true,
    hasApiKey: false,
    models: [],
    lastModelFetchAt: undefined,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    enabled: true,
    supportsNativeTools: true,
    hasApiKey: false,
    models: [],
    lastModelFetchAt: undefined,
  },
  'openai-compatible': {
    id: 'openai-compatible',
    name: 'OpenAI Compatible',
    type: 'openai-compatible',
    baseURL: '',
    enabled: true,
    isCustom: true,
    supportsNativeTools: false,
    hasApiKey: false,
    models: [],
    lastModelFetchAt: undefined,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    baseURL: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022',
    enabled: true,
    supportsNativeTools: true,
    hasApiKey: false,
    models: [],
    lastModelFetchAt: undefined,
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-3-flash',
    enabled: true,
    supportsNativeTools: true,
    hasApiKey: false,
    models: [],
    lastModelFetchAt: undefined,
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    type: 'openai-compatible',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llava-v1.5-7b',
    enabled: true,
    supportsNativeTools: false,
    hasApiKey: false,
    models: [],
    lastModelFetchAt: undefined,
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'openai-compatible',
    baseURL: 'https://api.mistral.ai/v1',
    defaultModel: 'pixtral-12b-2409',
    enabled: true,
    supportsNativeTools: true,
    hasApiKey: false,
    models: [],
    lastModelFetchAt: undefined,
  },
  chutes: {
    id: 'chutes',
    name: 'Chutes.ai',
    type: 'openai-compatible',
    baseURL: 'https://llm.chutes.ai/v1',
    defaultModel: 'zai-org/GLM-4.7-TEE',
    enabled: true,
    supportsNativeTools: false,
    hasApiKey: false,
    models: [],
    lastModelFetchAt: undefined,
  },
};

/**
 * Gemini Model Hierarchy (Updated 2026-01-14)
 * Sources: Google Cloud Vertex AI, AI SDK documentation
 */
export const GEMINI_MODELS = {
  flash: 'gemini-3-flash',
  pro: 'gemini-3-pro',
  flash25: 'gemini-2.5-flash',
  pro25: 'gemini-2.5-pro',
  stable: 'gemini-2.5-flash-latest',
  stablePro: 'gemini-2.5-pro-latest',
  imagePro: 'gemini-3-pro-image-preview', // Nano Banana Pro
  imageFlash: 'gemini-2.5-flash-image', // Nano Banana
  lite: 'gemini-2.5-flash-lite',
  embedding: 'gemini-embedding-001',
} as const;

/**
 * Free models available on OpenRouter (December 2025)
 */
export const FREE_MODELS: ModelInfo[] = [
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 8B Instruct',
    isFree: true,
    contextLength: 131072,
    providerId: 'openrouter',
  },
  {
    id: 'google/gemini-3.0-flash:free',
    name: 'Gemini 3.0 Flash',
    isFree: true,
    contextLength: 1048576,
    providerId: 'openrouter',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    isFree: true,
    contextLength: 163840,
    providerId: 'openrouter',
  },
  {
    id: 'deepseek/deepseek-v3:free',
    name: 'DeepSeek V3',
    isFree: true,
    contextLength: 131072,
    providerId: 'openrouter',
  },
];

// ============================================================================
// DEPRECATION NOTICE
// ============================================================================

/**
 * @deprecated Use from '@/domain/types/llm' instead
 * This file is a facade for backward compatibility during migration.
 */
export const PROVIDERS_DEPRECATED = false;
