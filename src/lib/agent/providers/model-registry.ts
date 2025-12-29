/**
 * @fileoverview Model Registry - Dynamic Model Discovery
 * @module lib/agent/providers/model-registry
 * 
 * Fetches available models from provider APIs with caching.
 * Falls back to hardcoded defaults when API unavailable.
 * 
 * CC-2025-12-29: Added Gemini API support and enhanced OpenRouter parsing
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

// ============================================================================
// OpenRouter API Types
// ============================================================================

interface OpenRouterModel {
    id: string;
    name: string;
    created?: number;
    context_length?: number;
    pricing?: {
        prompt: string;
        completion: string;
        request?: string;
        image?: string;
    };
    architecture?: {
        modality?: string;
        input_modalities?: string[];
        output_modalities?: string[];
        tokenizer?: string;
        instruct_type?: string;
    };
    top_provider?: {
        is_moderated?: boolean;
        context_length?: number;
        max_completion_tokens?: number;
    };
    supported_parameters?: string[];
}

// ============================================================================
// Gemini API Types
// ============================================================================

interface GeminiModel {
    name: string;
    version?: string;
    displayName: string;
    description?: string;
    inputTokenLimit?: number;
    outputTokenLimit?: number;
    supportedGenerationMethods?: string[];
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTemperature?: number;
}

// ============================================================================
// Model Registry
// ============================================================================

/**
 * ModelRegistry - Fetches and caches available models from providers
 * CC-2025-12-29: Enhanced with multi-provider support and rich metadata
 */
export class ModelRegistry {
    private cache = new Map<string, CacheEntry>();

    /**
     * Get available models for a provider
     * @param providerId - Provider ID
     * @param apiKey - API key for authentication
     * @returns Array of available models with full metadata
     */
    async getModels(providerId: string, apiKey?: string): Promise<ModelInfo[]> {
        // Check cache first
        const cached = this.cache.get(providerId);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            console.log(`[ModelRegistry] Using cached models for ${providerId}`);
            return cached.models;
        }

        // If no API key, return defaults
        if (!apiKey) {
            console.log(`[ModelRegistry] No API key for ${providerId}, using defaults`);
            return this.getDefaultModels(providerId);
        }

        // Fetch from appropriate API
        try {
            let models: ModelInfo[];

            if (providerId === 'gemini' || providerId === 'google') {
                models = await this.fetchGeminiModels(apiKey);
            } else if (providerId === 'openrouter') {
                models = await this.fetchOpenRouterModels(apiKey);
            } else {
                models = await this.fetchOpenAICompatibleModels(providerId, apiKey);
            }

            console.log(`[ModelRegistry] Fetched ${models.length} models from ${providerId}`);
            this.cache.set(providerId, { models, fetchedAt: Date.now() });
            return models;
        } catch (error) {
            console.warn(`[ModelRegistry] Failed to fetch models from ${providerId}:`, error);
            // If explicit API key failed, propagate error to UI instead of silent fallback
            if (apiKey) throw error;
            return this.getDefaultModels(providerId);
        }
    }

    /**
     * Fetch models from OpenRouter API
     * Endpoint: GET https://openrouter.ai/api/v1/models
     */
    private async fetchOpenRouterModels(apiKey: string): Promise<ModelInfo[]> {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://via-gent.dev',
                'X-Title': 'VIA-GENT',
            },
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data: { data: OpenRouterModel[] } = await response.json();

        return data.data.map((m): ModelInfo => ({
            id: m.id,
            name: m.name || m.id,
            isFree: m.id.endsWith(':free'),
            providerId: 'openrouter',
            contextLength: m.context_length || m.top_provider?.context_length,
            maxOutputTokens: m.top_provider?.max_completion_tokens,
            inputModalities: m.architecture?.input_modalities || ['text'],
            outputModalities: m.architecture?.output_modalities || ['text'],
            supportsTools: m.supported_parameters?.includes('tools') ||
                m.supported_parameters?.includes('tool_choice'),
            pricing: m.pricing ? {
                prompt: parseFloat(m.pricing.prompt) * 1000000,
                completion: parseFloat(m.pricing.completion) * 1000000,
            } : undefined,
        }));
    }

    /**
     * Fetch models from Google Gemini API
     * Endpoint: GET https://generativelanguage.googleapis.com/v1beta/models
     */
    private async fetchGeminiModels(apiKey: string): Promise<ModelInfo[]> {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { method: 'GET' }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data: { models: GeminiModel[] } = await response.json();

        // Filter to only include generateContent-capable models
        const generativeModels = data.models.filter(m =>
            m.supportedGenerationMethods?.includes('generateContent')
        );

        return generativeModels.map((m): ModelInfo => ({
            // Extract model ID from "models/gemini-1.5-flash" format
            id: m.name.replace('models/', ''),
            name: m.displayName || m.name.replace('models/', ''),
            providerId: 'gemini',
            contextLength: m.inputTokenLimit,
            maxOutputTokens: m.outputTokenLimit,
            temperature: m.temperature,
            maxTemperature: m.maxTemperature,
            topP: m.topP,
            topK: m.topK,
            supportedMethods: m.supportedGenerationMethods,
            supportsTools: m.supportedGenerationMethods?.includes('generateContent'),
            inputModalities: ['text'], // Gemini Pro Vision handles images
            outputModalities: ['text'],
        }));
    }

    /**
     * Fetch models from OpenAI-compatible API
     * Generic fallback for other providers
     */
    private async fetchOpenAICompatibleModels(
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
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data: { data: Array<{ id: string; created?: number }> } = await response.json();

        return data.data.map((m): ModelInfo => ({
            id: m.id,
            name: m.id,
            providerId,
        }));
    }

    /**
     * Get available models from a custom OpenAI-compatible endpoint
     * @param baseURL - Custom API base URL
     * @param apiKey - API key (optional for local providers)
     * @param headers - Custom headers to include
     * @returns Array of available models
     */
    async getModelsFromCustomEndpoint(
        baseURL: string,
        apiKey?: string,
        headers?: Record<string, string>
    ): Promise<ModelInfo[]> {
        try {
            const requestHeaders: Record<string, string> = {
                ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
                ...headers,
            };

            const response = await fetch(`${baseURL}/models`, {
                method: 'GET',
                headers: requestHeaders,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data: { data: Array<{ id: string; name?: string }> } = await response.json();

            return data.data.map((m): ModelInfo => ({
                id: m.id,
                name: m.name || m.id,
                providerId: 'openai-compatible',
            }));
        } catch (error) {
            console.warn(`Failed to fetch models from custom endpoint ${baseURL}:`, error);
            return [];
        }
    }

    /**
     * Get default/fallback models for a provider
     */
    getDefaultModels(providerId: string): ModelInfo[] {
        if (providerId === 'openrouter') {
            return FREE_MODELS.filter((m) => m.providerId === 'openrouter');
        }

        if (providerId === 'gemini' || providerId === 'google') {
            return [
                {
                    id: 'gemini-2.0-flash',
                    name: 'Gemini 2.0 Flash',
                    providerId: 'gemini',
                    contextLength: 1048576,
                    maxOutputTokens: 8192,
                    temperature: 1,
                    topP: 0.95,
                    topK: 40,
                },
                {
                    id: 'gemini-1.5-pro',
                    name: 'Gemini 1.5 Pro',
                    providerId: 'gemini',
                    contextLength: 2097152,
                    maxOutputTokens: 8192,
                    temperature: 1,
                    topP: 0.95,
                },
            ];
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

    /**
     * Test API connection by attempting to list models
     */
    async testConnection(
        providerId: string,
        apiKey: string
    ): Promise<{ success: boolean; error?: string; modelCount?: number }> {
        try {
            const models = await this.getModels(providerId, apiKey);
            // Clear cache after test to force fresh fetch next time
            this.clearCache(providerId);
            return { success: true, modelCount: models.length };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Connection failed'
            };
        }
    }
}

/**
 * Default singleton instance
 */
export const modelRegistry = new ModelRegistry();
