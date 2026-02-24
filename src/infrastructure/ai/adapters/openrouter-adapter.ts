/**
 * OpenRouter Adapter for AI Gateway
 *
 * Uses TanStack AI's createOpenaiChat with OpenRouter's OpenAI-compatible endpoint.
 *
 * IMPORTANT: Use createOpenaiChat (NOT openaiText) for explicit API key handling.
 * openaiText auto-detects from env and does NOT accept apiKey as 2nd argument.
 *
 * @module infrastructure/ai/adapters
 */

import { createOpenaiChat } from '@tanstack/ai-openai';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface OpenRouterAdapterConfig {
  apiKey: string;
  model: string;
  siteUrl?: string;
  siteName?: string;
}

/**
 * Create a TanStack AI adapter for OpenRouter
 *
 * @param config - Adapter configuration including API key and model
 * @returns TanStack AI chat adapter
 */
export function createOpenRouterAdapter(config: OpenRouterAdapterConfig) {
  const { apiKey, model, siteUrl, siteName } = config;

  // Cast model to any - OpenRouter accepts any model string via their API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createOpenaiChat(model as any, apiKey, {
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      'HTTP-Referer': siteUrl ?? 'https://project-alpha.local',
      'X-Title': siteName ?? 'Project Alpha',
    },
  });
}

/** Default models for OpenRouter */
export const OPENROUTER_DEFAULT_MODELS = {
  chat: 'anthropic/claude-3.5-sonnet',
  fast: 'anthropic/claude-3-haiku',
  code: 'anthropic/claude-3.5-sonnet',
} as const;
