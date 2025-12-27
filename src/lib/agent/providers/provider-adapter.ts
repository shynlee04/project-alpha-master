/**
 * @fileoverview Provider Adapter Factory
 * @module lib/agent/providers/provider-adapter
 * 
 * Factory for creating TanStack AI adapters for different providers.
 * Supports OpenAI, OpenRouter, and other OpenAI-compatible APIs.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 * @feature OpenAI Compatible Providers
 */

import { createOpenaiChat } from '@tanstack/ai-openai';
import type { ProviderConfig, AdapterConfig, ConnectionTestResult, OpenAICompatibleConfig } from './types';
import { PROVIDERS } from './types';

// TanStack AI adapter type
type OpenAIAdapter = ReturnType<typeof createOpenaiChat>;

/**
 * Extended adapter config for custom providers
 */
export interface CustomAdapterConfig extends AdapterConfig {
    /** Custom headers to include in requests */
    headers?: Record<string, string>;
    /** Whether this is a custom user-configured provider */
    isCustom?: boolean;
}

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
    createAdapter(providerId: string, config: CustomAdapterConfig): OpenAIAdapter {
        const providerConfig = PROVIDERS[providerId];

        // For openai-compatible providers, baseURL is required in config
        if (providerId === 'openai-compatible') {
            if (!config.baseURL) {
                throw new Error('baseURL is required for OpenAI Compatible providers');
            }
            return this.createCustomAdapter(config);
        }

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
     * Create an adapter for a custom OpenAI-compatible provider
     * @param config - Custom adapter configuration with baseURL and optional headers
     * @returns TanStack AI adapter instance
     */
    createCustomAdapter(config: CustomAdapterConfig): OpenAIAdapter {
        const options: Record<string, unknown> = {};

        // Set custom base URL
        if (config.baseURL) {
            options.baseURL = config.baseURL;
        }

        // Merge custom headers
        if (config.headers && Object.keys(config.headers).length > 0) {
            options.defaultHeaders = { ...config.headers };
        }

        // Use provided model or a default
        const modelId = config.model || 'gpt-3.5-turbo';

        // API key may be empty for local providers (LM Studio, Ollama)
        const apiKey = config.apiKey || '';

        // Cast options as any to allow flexible config for TanStack AI
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return createOpenaiChat(modelId as any, apiKey, options as any);
    }

    /**
     * Create an OpenAI-compatible adapter (works for OpenAI and OpenRouter)
     * Note: TanStack AI v0.2.0 signature is createOpenaiChat(model, apiKey, config)
     */
    private createOpenAICompatibleAdapter(
        provider: ProviderConfig,
        config: AdapterConfig
    ): OpenAIAdapter {
        const options: Record<string, unknown> = {};

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
        return createOpenaiChat(modelId as any, config.apiKey, options as any);
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
     * @param customConfig - Optional custom config for openai-compatible providers
     * @returns Connection test result
     */
    async testConnection(
        providerId: string,
        apiKey: string,
        customConfig?: { baseURL?: string; headers?: Record<string, string> }
    ): Promise<ConnectionTestResult> {
        const startTime = Date.now();

        try {
            const provider = PROVIDERS[providerId];
            let baseURL: string;

            if (providerId === 'openai-compatible' && customConfig?.baseURL) {
                baseURL = customConfig.baseURL;
            } else if (provider?.baseURL) {
                baseURL = provider.baseURL;
            } else {
                baseURL = 'https://api.openai.com/v1';
            }

            const headers: Record<string, string> = {
                ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
                ...(provider?.id === 'openrouter' && {
                    'HTTP-Referer': 'https://via-gent.dev',
                }),
                ...(customConfig?.headers || {}),
            };

            const response = await fetch(`${baseURL}/models`, {
                method: 'GET',
                headers,
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
     * Test connection to a custom OpenAI-compatible endpoint
     * @param customConfig - Custom provider configuration
     * @returns Connection test result
     */
    async testCustomConnection(
        customConfig: OpenAICompatibleConfig
    ): Promise<ConnectionTestResult> {
        return this.testConnection(
            'openai-compatible',
            customConfig.apiKey || '',
            {
                baseURL: customConfig.baseURL,
                headers: customConfig.headers,
            }
        );
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
    config: CustomAdapterConfig
): OpenAIAdapter {
    return providerAdapterFactory.createAdapter(providerId, config);
}

