/**
 * @fileoverview Provider Adapter Factory
 * @module lib/agent/providers/provider-adapter
 * 
 * Factory for creating TanStack AI adapters for different providers.
 * Supports OpenAI, OpenRouter, and other OpenAI-compatible APIs.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 */

import { createOpenaiChat, type OpenAITextConfig } from '@tanstack/ai-openai';
import type { ProviderConfig, AdapterConfig, ConnectionTestResult } from './types';
import { PROVIDERS } from './types';

// TanStack AI adapter type
type OpenAIAdapter = ReturnType<typeof createOpenaiChat>;

/**
 * ProviderAdapterFactory - Creates TanStack AI adapters for various providers
 */
export class ProviderAdapterFactory {
    private adapters = new Map<string, OpenAIAdapter>();

    /**
     * Create an adapter for a provider
     * @param providerId - Provider ID from PROVIDERS config
     * @param config - Adapter configuration with API key
     * @returns TanStack AI adapter instance
     */
    createAdapter(providerId: string, config: AdapterConfig): OpenAIAdapter {
        const providerConfig = PROVIDERS[providerId];
        if (!providerConfig) {
            throw new Error(`Unknown provider: ${providerId}`);
        }

        if (!providerConfig.enabled) {
            throw new Error(`Provider not enabled: ${providerId}`);
        }

        // Create adapter based on provider type
        const adapter = this.createOpenAICompatibleAdapter(providerConfig, config);

        // Cache adapter
        this.adapters.set(providerId, adapter);

        return adapter;
    }

    /**
     * Create an OpenAI-compatible adapter (works for OpenAI and OpenRouter)
     * Note: TanStack AI v0.2.0 signature is createOpenaiChat(model, apiKey, config)
     */
    private createOpenAICompatibleAdapter(
        provider: ProviderConfig,
        config: AdapterConfig
    ): OpenAIAdapter {
        const options: Partial<Omit<OpenAITextConfig, 'apiKey'>> = {};

        // Apply baseURL for OpenRouter or custom override
        if (config.baseURL || provider.baseURL) {
            options.baseURL = config.baseURL || provider.baseURL;
        }

        // Add OpenRouter-specific headers if needed
        if (provider.id === 'openrouter') {
            options.defaultHeaders = {
                'HTTP-Referer': 'https://via-gent.dev', // For OpenRouter rankings
                'X-Title': 'Via-Gent IDE',
            };
        }

        // Use default model if not provided in config
        const modelId = config.model || provider.defaultModel || 'gpt-4o';

        // Cast modelId as 'any' to allow arbitrary OpenRouter model strings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return createOpenaiChat(modelId as any, config.apiKey, options);
    }

    /**
     * Get a cached adapter
     * @param providerId - Provider ID
     * @returns Cached adapter or undefined
     */
    getAdapter(providerId: string): OpenAIAdapter | undefined {
        return this.adapters.get(providerId);
    }

    /**
     * Test connection to a provider
     * @param providerId - Provider ID
     * @param apiKey - API key to test
     * @returns Connection test result
     */
    async testConnection(
        providerId: string,
        apiKey: string
    ): Promise<ConnectionTestResult> {
        const startTime = Date.now();

        try {
            const config: AdapterConfig = { apiKey };
            const adapter = this.createAdapter(providerId, config);

            // Make a minimal API call to test the connection
            // Using models endpoint which is lightweight
            const provider = PROVIDERS[providerId];
            const baseURL = provider.baseURL || 'https://api.openai.com/v1';

            const response = await fetch(`${baseURL}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    ...(provider.id === 'openrouter' && {
                        'HTTP-Referer': 'https://via-gent.dev',
                    }),
                },
            });

            const latencyMs = Date.now() - startTime;

            if (response.ok) {
                return { success: true, latencyMs };
            } else {
                const error = await response.text();
                return { success: false, error, latencyMs };
            }
        } catch (error) {
            const latencyMs = Date.now() - startTime;
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: message, latencyMs };
        }
    }

    /**
     * Get provider configuration
     */
    getProviderConfig(providerId: string): ProviderConfig | undefined {
        return PROVIDERS[providerId];
    }

    /**
     * Get all enabled providers
     */
    getEnabledProviders(): ProviderConfig[] {
        return Object.values(PROVIDERS).filter((p) => p.enabled);
    }

    /**
     * Clear cached adapter for provider
     */
    clearAdapter(providerId: string): void {
        this.adapters.delete(providerId);
    }

    /**
     * Clear all cached adapters
     */
    clearAll(): void {
        this.adapters.clear();
    }
}

/**
 * Default singleton instance
 */
export const providerAdapterFactory = new ProviderAdapterFactory();

/**
 * Factory function for convenience
 */
export function createProviderAdapter(
    providerId: string,
    config: AdapterConfig
): OpenAIAdapter {
    return providerAdapterFactory.createAdapter(providerId, config);
}
