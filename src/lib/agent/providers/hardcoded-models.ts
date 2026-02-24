/**
 * Hardcoded Model Lists for Providers
 *
 * Provides predefined model options for Groq, Mistral, and Chutes providers.
 * Replaces dynamic API fetching with curated model lists.
 *
 * @module lib/agent/providers/hardcoded-models
 */

export interface HardcodedModel {
  /** Model ID (used for API calls) */
  id: string;
  /** Display name in English */
  nameEn: string;
  /** Display name in Vietnamese */
  nameVi: string;
  /** Context window size (tokens) */
  contextLength?: number;
  /** Whether model is free to use */
  isFree?: boolean;
  /** Model capabilities */
  capabilities?: {
    streaming?: boolean;
    images?: boolean;
    tools?: boolean;
  };
}

/**
 * Hardcoded models for Groq provider
 * Source: https://console.groq.com/docs/models
 */
export const GROQ_MODELS: HardcodedModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    nameEn: 'Llama 3.3 70B Versatile',
    nameVi: 'Llama 3.3 70B Đa năng',
    contextLength: 128000,
    isFree: true,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'llama-3.1-70b-versatile',
    nameEn: 'Llama 3.1 70B Versatile',
    nameVi: 'Llama 3.1 70B Đa năng',
    contextLength: 128000,
    isFree: true,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'llama-3.1-8b-instant',
    nameEn: 'Llama 3.1 8B Instant',
    nameVi: 'Llama 3.1 8B Tốc độ cao',
    contextLength: 131072,
    isFree: true,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'mixtral-8x7b-32768',
    nameEn: 'Mixtral 8x7B',
    nameVi: 'Mixtral 8x7B',
    contextLength: 32768,
    isFree: true,
    capabilities: { streaming: true, tools: false },
  },
  {
    id: 'gemma2-9b-it',
    nameEn: 'Gemma 2 9B',
    nameVi: 'Gemma 2 9B',
    contextLength: 8192,
    isFree: true,
    capabilities: { streaming: true, tools: false },
  },
];

/**
 * Hardcoded models for Mistral AI provider
 * Source: https://docs.mistral.ai/getting-started/models/
 */
export const MISTRAL_MODELS: HardcodedModel[] = [
  {
    id: 'mistral-large-latest',
    nameEn: 'Mistral Large (Latest)',
    nameVi: 'Mistral Large (Mới nhất)',
    contextLength: 128000,
    capabilities: { streaming: true, tools: true, images: false },
  },
  {
    id: 'mistral-medium-latest',
    nameEn: 'Mistral Medium (Latest)',
    nameVi: 'Mistral Medium (Mới nhất)',
    contextLength: 128000,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'mistral-small-latest',
    nameEn: 'Mistral Small (Latest)',
    nameVi: 'Mistral Small (Mới nhất)',
    contextLength: 32000,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'pixtral-12b-2409',
    nameEn: 'Pixtral 12B (Vision)',
    nameVi: 'Pixtral 12B (Thị giác)',
    contextLength: 128000,
    capabilities: { streaming: true, tools: true, images: true },
  },
  {
    id: 'codestral-latest',
    nameEn: 'Codestral (Code)',
    nameVi: 'Codestral (Mã)',
    contextLength: 32000,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'ministral-3b-latest',
    nameEn: 'Ministral 3B',
    nameVi: 'Ministral 3B',
    contextLength: 128000,
    capabilities: { streaming: true, tools: false },
  },
];

/**
 * Hardcoded models for Chutes.ai provider
 * Source: https://llm.chutes.ai/docs
 */
export const CHUTES_MODELS: HardcodedModel[] = [
  {
    id: 'zai-org/GLM-4.7-TEE',
    nameEn: 'GLM-4.7 TEE (Secure)',
    nameVi: 'GLM-4.7 TEE (Bảo mật)',
    contextLength: 128000,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'glm-4-plus',
    nameEn: 'GLM-4 Plus',
    nameVi: 'GLM-4 Plus',
    contextLength: 128000,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'glm-4-flash',
    nameEn: 'GLM-4 Flash',
    nameVi: 'GLM-4 Flash (Nhanh)',
    contextLength: 128000,
    capabilities: { streaming: true, tools: true },
  },
  {
    id: 'qwen-image',
    nameEn: 'Qwen Image (Vision)',
    nameVi: 'Qwen Image (Thị giác)',
    contextLength: 8192,
    capabilities: { streaming: true, images: true },
  },
  {
    id: 'qwen-plus',
    nameEn: 'Qwen Plus',
    nameVi: 'Qwen Plus',
    contextLength: 32768,
    capabilities: { streaming: true, tools: true },
  },
];

/**
 * Special value for custom model input
 */
export const CUSTOM_MODEL_VALUE = '__custom__';

/**
 * Get hardcoded models for a provider
 * Returns undefined if provider not in hardcoded list
 */
export function getHardcodedModels(providerId: string): HardcodedModel[] | undefined {
  switch (providerId) {
    case 'groq':
      return GROQ_MODELS;
    case 'mistral':
      return MISTRAL_MODELS;
    case 'chutes':
      return CHUTES_MODELS;
    default:
      return undefined;
  }
}

/**
 * Check if provider has hardcoded models
 */
export function hasHardcodedModels(providerId: string): boolean {
  return getHardcodedModels(providerId) !== undefined;
}
