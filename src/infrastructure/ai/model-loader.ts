/**
 * Model Loader - API-first with graceful degradation
 *
 * Load strategy (per MODEL-STRATEGY.md Section 1.3):
 * 1. Try API fetch from provider
 * 2. Fall back to cached models (localStorage)
 * 3. Fall back to hardcoded defaults
 *
 * @created 2026-02-02
 * @resolves ESC-001, GAP-A04-001
 */

import type { ModelInfo } from '@/domain/types/llm/model-types';

// Hardcoded defaults - ONLY used when API and cache fail
const HARDCODED_MODELS: Record<string, ModelInfo[]> = {
  gemini: [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash',
      providerId: 'gemini',
      contextLength: 1000000,
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      providerId: 'gemini',
      contextLength: 2000000,
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      providerId: 'gemini',
      contextLength: 1000000,
    },
  ],
  openrouter: [
    {
      id: 'meta-llama/llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B',
      providerId: 'openrouter',
    },
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      providerId: 'openrouter',
    },
    { id: 'openai/gpt-4o', name: 'GPT-4o', providerId: 'openrouter' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', providerId: 'openai' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', providerId: 'openai' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', providerId: 'openai' },
  ],
  anthropic: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      providerId: 'anthropic',
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      providerId: 'anthropic',
    },
  ],
};

export type ModelLoadSource = 'api' | 'cache' | 'hardcoded';

export interface ModelLoadResult {
  models: ModelInfo[];
  source: ModelLoadSource;
  error?: string;
}

/**
 * Load models for a provider with graceful degradation
 * Priority: API -> Cache -> Hardcoded
 */
export async function loadModels(
  providerId: string,
  apiKey: string,
  options?: { skipApi?: boolean; skipCache?: boolean }
): Promise<ModelLoadResult> {
  // Step 1: Try API (unless skipped)
  if (!options?.skipApi && apiKey) {
    try {
      const apiModels = await fetchModelsFromApi(providerId, apiKey);
      if (apiModels.length > 0) {
        // Cache for next time
        await cacheModels(providerId, apiModels);
        return { models: apiModels, source: 'api' };
      }
    } catch (error) {
      console.warn(
        `[ModelLoader] API fetch failed for ${providerId}:`,
        error
      );
      // Continue to fallback
    }
  }

  // Step 2: Try cache (unless skipped)
  if (!options?.skipCache) {
    try {
      const cachedModels = await getCachedModels(providerId);
      if (cachedModels && cachedModels.length > 0) {
        return { models: cachedModels, source: 'cache' };
      }
    } catch (error) {
      console.warn(
        `[ModelLoader] Cache read failed for ${providerId}:`,
        error
      );
      // Continue to fallback
    }
  }

  // Step 3: Hardcoded fallback
  const hardcoded = HARDCODED_MODELS[providerId] || [];
  return {
    models: hardcoded,
    source: 'hardcoded',
    error:
      hardcoded.length === 0
        ? `No models available for ${providerId}`
        : undefined,
  };
}

/**
 * Fetch models from provider API
 * Phase A: Simplified implementation
 * Phase B: Full provider adapters
 */
async function fetchModelsFromApi(
  providerId: string,
  apiKey: string
): Promise<ModelInfo[]> {
  // Provider-specific API endpoints
  const endpoints: Record<string, string> = {
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
    openrouter: 'https://openrouter.ai/api/v1/models',
    openai: 'https://api.openai.com/v1/models',
    anthropic: 'https://api.anthropic.com/v1/models',
  };

  const endpoint = endpoints[providerId];
  if (!endpoint) {
    console.log(
      `[ModelLoader] No API endpoint for ${providerId}, using fallback`
    );
    return [];
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Provider-specific auth headers
    if (providerId === 'gemini') {
      // Gemini uses query param, handled in URL
    } else if (providerId === 'openrouter') {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] =
        typeof window !== 'undefined' ? window.location.origin : '';
    } else if (providerId === 'openai') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (providerId === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const url =
      providerId === 'gemini' ? `${endpoint}?key=${apiKey}` : endpoint;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Parse provider-specific response format
    return parseModelsResponse(providerId, data);
  } catch (error) {
    console.warn(`[ModelLoader] API fetch error for ${providerId}:`, error);
    throw error;
  }
}

/**
 * Parse provider-specific model list response
 */
function parseModelsResponse(providerId: string, data: unknown): ModelInfo[] {
  try {
    if (providerId === 'gemini') {
      // Gemini: { models: [{ name: "models/gemini-1.5-pro", ... }] }
      const models = (
        data as { models?: Array<{ name: string; displayName?: string }> }
      ).models || [];
      return models
        .filter((m) => m.name.includes('gemini'))
        .map((m) => ({
          id: m.name.replace('models/', ''),
          name: m.displayName || m.name.replace('models/', ''),
          providerId,
        }));
    }

    if (providerId === 'openrouter') {
      // OpenRouter: { data: [{ id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", ... }] }
      const models = (
        data as { data?: Array<{ id: string; name: string }> }
      ).data || [];
      return models.slice(0, 50).map((m) => ({
        id: m.id,
        name: m.name,
        providerId,
      }));
    }

    if (providerId === 'openai') {
      // OpenAI: { data: [{ id: "gpt-4o", ... }] }
      const models = (data as { data?: Array<{ id: string }> }).data || [];
      return models
        .filter((m) => m.id.startsWith('gpt-'))
        .map((m) => ({
          id: m.id,
          name: m.id,
          providerId,
        }));
    }

    if (providerId === 'anthropic') {
      // Anthropic doesn't have a public models endpoint, use hardcoded
      return [];
    }

    return [];
  } catch (error) {
    console.warn(`[ModelLoader] Parse error for ${providerId}:`, error);
    return [];
  }
}

// Simple cache using localStorage (Phase B: migrate to Dexie)
const CACHE_KEY_PREFIX = 'model_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function cacheModels(
  providerId: string,
  models: ModelInfo[]
): Promise<void> {
  try {
    const cacheEntry = {
      models,
      cachedAt: Date.now(),
    };
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${providerId}`,
      JSON.stringify(cacheEntry)
    );
  } catch (error) {
    console.warn(`[ModelLoader] Cache write failed:`, error);
  }
}

async function getCachedModels(
  providerId: string
): Promise<ModelInfo[] | null> {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${providerId}`);
    if (!cached) return null;

    const { models, cachedAt } = JSON.parse(cached);

    // Check TTL
    if (Date.now() - cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${providerId}`);
      return null;
    }

    return models;
  } catch (error) {
    console.warn(`[ModelLoader] Cache read failed:`, error);
    return null;
  }
}

/**
 * Clear cached models for a provider
 */
export async function clearModelCache(providerId: string): Promise<void> {
  localStorage.removeItem(`${CACHE_KEY_PREFIX}${providerId}`);
}

/**
 * Check if we have any models (from any source) for a provider
 */
export function hasHardcodedModels(providerId: string): boolean {
  return (
    providerId in HARDCODED_MODELS && HARDCODED_MODELS[providerId].length > 0
  );
}

/**
 * Get hardcoded models directly (for offline/emergency use)
 */
export function getHardcodedModels(providerId: string): ModelInfo[] {
  return HARDCODED_MODELS[providerId] || [];
}
