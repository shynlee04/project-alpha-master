/**
 * @fileoverview Google Gemini Model Discovery
 * @module infrastructure/persistence/stores/providers/google-model-fetcher
 *
 * Fetches available models from Google Gemini API.
 * Provides automatic model discovery and fallback to default models.
 *
 * @task GEM-2026-01-11 - Task 2.2: Implement Model Auto-Discovery
 */

import type { ModelInfo } from '@/domain/types/llm/model-types';

/**
 * Google API endpoint for listing models
 */
const GOOGLE_MODELS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Default Gemini models to use when API is unavailable
 */
export function getDefaultGoogleModels(): ModelInfo[] {
  return [
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      providerId: 'google',
      contextLength: 1048576,
      maxTokens: 65536,
      supportsStreaming: true,
      supportsImages: true,
      supportsTools: true,
      inputModalities: ['text', 'image', 'audio', 'video'],
      outputModalities: ['text', 'audio'],
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      providerId: 'google',
      contextLength: 1048576,
      maxTokens: 65536,
      supportsStreaming: true,
      supportsImages: true,
      supportsTools: true,
      inputModalities: ['text', 'image', 'audio', 'video'],
      outputModalities: ['text'],
    },
    {
      id: 'gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      providerId: 'google',
      contextLength: 1048576,
      maxTokens: 65535,
      supportsStreaming: true,
      supportsImages: true,
      supportsTools: true,
      inputModalities: ['text', 'image', 'audio', 'video'],
      outputModalities: ['text'],
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      providerId: 'google',
      contextLength: 1048576,
      maxTokens: 8192,
      supportsStreaming: true,
      supportsImages: true,
      supportsTools: true,
      inputModalities: ['text', 'image'],
      outputModalities: ['text'],
    },
  ];
}

/**
 * Fetch available models from Google Gemini API
 * 
 * @param apiKey - Google Gemini API key
 * @returns Promise<ModelInfo[]> - List of available models
 * 
 * @example
 * ```typescript
 * const models = await fetchGoogleModels('your-api-key');
 * console.log(models);
 * // [
 * //   { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', ... },
 * //   { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', ... }
 * // ]
 * ```
 */
export async function fetchGoogleModels(apiKey: string): Promise<ModelInfo[]> {
  if (!apiKey || !apiKey.trim()) {
    console.warn('[GoogleModelFetcher] No API key provided, returning defaults');
    return getDefaultGoogleModels();
  }

  try {
    const response = await fetch(
      `${GOOGLE_MODELS_ENDPOINT}?key=${apiKey.trim()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleModelFetcher] API error:', response.status, errorText);
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.models || !Array.isArray(data.models)) {
      console.warn('[GoogleModelFetcher] Unexpected response format');
      return getDefaultGoogleModels();
    }

    // Filter for content generation models (those that support generateContent)
    const contentModels = data.models.filter((model: any) =>
      model.supportedGenerationMethods?.includes('generateContent')
    );

    // Map to our ModelInfo format
    const models: ModelInfo[] = contentModels.map((model: any) => {
      const name = model.name.replace('models/', '');
      const displayName = model.displayName || name;

      // Determine supported modalities based on model capabilities
      const inputModalities: string[] = ['text'];
      if (model.supportedInputModalities) {
        inputModalities.push(...model.supportedInputModalities);
      }

      const outputModalities: string[] = ['text'];
      if (model.supportedOutputModalities) {
        outputModalities.push(...model.supportedOutputModalities);
      }

      return {
        id: name,
        name: displayName,
        providerId: 'google',
        contextLength: model.inputTokenLimit,
        maxTokens: model.outputTokenLimit || 65536,
        supportsStreaming: true,
        supportsImages: inputModalities.includes('image'),
        supportsTools: model.supportedGenerationMethods?.includes('functionCall') || 
                      model.supportedGenerationMethods?.includes('toolUse'),
        inputModalities,
        outputModalities,
      };
    });

    console.log(`[GoogleModelFetcher] Fetched ${models.length} models from Google API`);
    return models;

  } catch (error) {
    console.error('[GoogleModelFetcher] Failed to fetch models:', error);
    // Return default models on error
    return getDefaultGoogleModels();
  }
}

/**
 * Test if a Google API key is valid by making a lightweight request
 * 
 * @param apiKey - Google Gemini API key
 * @returns Promise<{ valid: boolean; error?: string }>
 */
export async function testGoogleApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: 'API key is required' };
  }

  try {
    // Use the models endpoint for validation - it's a lightweight GET request
    const response = await fetch(
      `${GOOGLE_MODELS_ENDPOINT}?key=${apiKey.trim()}&pageSize=1`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.ok) {
      return { valid: true };
    }

    const data = await response.json();
    const errorMessage = data.error?.message || `HTTP ${response.status}`;
    return { valid: false, error: errorMessage };

  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Get model capabilities for display purposes
 * 
 * @param modelId - Gemini model ID
 * @returns Object with capability flags
 */
export function getGoogleModelCapabilities(modelId: string): {
  supportsThinking: boolean;
  supportsGrounding: boolean;
  supportsAudioOutput: boolean;
  maxContextTokens: number;
  maxOutputTokens: number;
} {
  // Default capabilities based on known model characteristics
  const capabilities: Record<string, {
    supportsThinking: boolean;
    supportsGrounding: boolean;
    supportsAudioOutput: boolean;
    maxContextTokens: number;
    maxOutputTokens: number;
  }> = {
    'gemini-2.5-pro': {
      supportsThinking: true,
      supportsGrounding: true,
      supportsAudioOutput: true,
      maxContextTokens: 1048576,
      maxOutputTokens: 65536,
    },
    'gemini-2.5-flash': {
      supportsThinking: true,
      supportsGrounding: true,
      supportsAudioOutput: false,
      maxContextTokens: 1048576,
      maxOutputTokens: 65536,
    },
    'gemini-2.5-flash-lite': {
      supportsThinking: false,
      supportsGrounding: true,
      supportsAudioOutput: false,
      maxContextTokens: 1048576,
      maxOutputTokens: 65535,
    },
    'gemini-2.0-flash': {
      supportsThinking: false,
      supportsGrounding: true,
      supportsAudioOutput: false,
      maxContextTokens: 1048576,
      maxOutputTokens: 8192,
    },
  };

  return capabilities[modelId] || {
    supportsThinking: false,
    supportsGrounding: false,
    supportsAudioOutput: false,
    maxContextTokens: 1048576,
    maxOutputTokens: 8192,
  };
}
