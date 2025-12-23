/**
 * @fileoverview Model Registry - Dynamic Model Discovery
 * @module lib/agent/providers/model-registry
 * 
 * Fetches available models from provider APIs with caching.
 * Falls back to hardcoded defaults when API unavailable.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 */

import type { ModelInfo } from './types';
import { PROVIDERS, FREE_MODELS } from './types';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
    models: ModelInfo[];
    fetchedAt: number;
}

/**
 * ModelRegistry - Fetches and caches available models from providers
 */
export class ModelRegistry {
    private cache = new Map<string, CacheEntry>();

    /**
     * Get available models for a provider
     * @param providerId - Provider ID
     * @param apiKey - API key for authentication
     * @returns Array of available models
     */
    async getModels(providerId: string, apiKey?: string): Promise<ModelInfo[]> {
        // Check cache first
        const cached = this.cache.get(providerId);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            return cached.models;
        }

        // If no API key, return defaults
        if (!apiKey) {
            return this.getDefaultModels(providerId);
        }

        // Fetch from API
        try {
            const models = await this.fetchModelsFromAPI(providerId, apiKey);
            this.cache.set(providerId, { models, fetchedAt: Date.now() });
            return models;
        } catch (error) {
            console.warn(`Failed to fetch models from ${providerId}:`, error);
            return this.getDefaultModels(providerId);
        }
    }

    /**
     * Fetch models from provider API
     */
    private async fetchModelsFromAPI(
        providerId: string,
        apiKey: string
    ): Promise<ModelInfo[]> {
        const provider = PROVIDERS[providerId];
        if (!provider) {
            throw new Error(`Unknown provider: ${providerId}`);
        }

        const baseURL = provider.baseURL || 'https://api.openai.com/v1';
        const response = await fetch(`${baseURL}/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...(providerId === 'openrouter' && {
                    'HTTP-Referer': 'https://via-gent.dev',
                }),
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return this.parseModelsResponse(providerId, data);
    }

    /**
     * Parse models API response (OpenAI/OpenRouter format)
     */
    private parseModelsResponse(
        providerId: string,
        data: { data?: Array<{ id: string; name?: string }> }
    ): ModelInfo[] {
        const models = data.data || [];
        return models.map((m) => ({
            id: m.id,
            name: m.name || m.id,
            isFree: m.id.endsWith(':free'),
            providerId,
        }));
    }

    /**
     * Get default/fallback models for a provider
     */
    getDefaultModels(providerId: string): ModelInfo[] {
        if (providerId === 'openrouter') {
            return FREE_MODELS.filter((m) => m.providerId === 'openrouter');
        }

        const provider = PROVIDERS[providerId];
        if (provider?.defaultModel) {
            return [
                {
                    id: provider.defaultModel,
                    name: provider.defaultModel,
                    providerId,
                },
            ];
        }

        return [];
    }

    /**
     * Get free models (no API key required to list)
     */
    getFreeModels(): ModelInfo[] {
        return FREE_MODELS;
    }

    /**
     * Clear cache for a provider
     */
    clearCache(providerId?: string): void {
        if (providerId) {
            this.cache.delete(providerId);
        } else {
            this.cache.clear();
        }
    }
}

/**
 * Default singleton instance
 */
export const modelRegistry = new ModelRegistry();
