/**
 * Gemini Adapter for AI Gateway
 *
 * Uses TanStack AI's geminiText with config object for explicit API key.
 *
 * @module infrastructure/ai/adapters
 */

import { geminiText } from '@tanstack/ai-gemini';

export interface GeminiAdapterConfig {
  apiKey: string;
  model: string;
}

/**
 * Create a TanStack AI adapter for Gemini
 *
 * @param config - Adapter configuration including API key and model
 * @returns TanStack AI chat adapter
 */
export function createGeminiAdapter(config: GeminiAdapterConfig) {
  const { apiKey, model } = config;
  // Cast model to any - Gemini accepts various model strings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return geminiText(model as any, { apiKey });
}

/** Default models for Gemini */
export const GEMINI_DEFAULT_MODELS = {
  chat: 'gemini-2.0-flash',
  vision: 'gemini-2.0-flash',
  embedding: 'text-embedding-004',
} as const;
