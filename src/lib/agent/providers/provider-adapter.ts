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
import { AnthropicAdapter, createAnthropicAdapter } from './anthropic-adapter';
import type { AnthropicAdapterConfig } from './anthropic-adapter';
import type { ProviderModel } from '@/core/entities/Provider';
import { ModelRegistry } from './model-registry';

// TanStack AI adapter type
type OpenAIAdapter = ReturnType<typeof createOpenaiChat>;

/**
 * Custom adapter configuration with extended options
 * Extends AdapterConfig to support custom headers
 */
export interface CustomAdapterConfig extends AdapterConfig {
    /** Custom HTTP headers for requests */
    headers?: Record<string, string>;
}

/**
 * Extended Provider Adapter interface with getModels and testConnection methods
 * This wraps TanStack AI adapters to add provider-specific functionality
 */
export interface ExtendedProviderAdapter extends OpenAIAdapter {
    /** Get available models for this provider */
    getModels(): Promise<ProviderModel[]>;
    /** Test connection to provider API */
    testConnection(): Promise<{ success: boolean; latencyMs: number; error?: string }>;
}

// Union type for all supported adapters
type ProviderAdapter = OpenAIAdapter | AnthropicAdapter | ExtendedProviderAdapter;

/**
 * ProviderAdapterFactory - Creates TanStack AI adapters for various providers
 */
export class ProviderAdapterFactory {
    private adapters = new Map<string, ProviderAdapter>();
    private modelRegistry = new ModelRegistry();

    /**
     * Create an adapter for a provider
     * @param providerId - Provider ID from PROVIDERS config
     * @param config - Adapter configuration with API key
     * @returns Extended adapter with getModels and testConnection methods
     */
    createAdapter(providerId: string, config: CustomAdapterConfig): ExtendedProviderAdapter {
        const providerConfig = PROVIDERS[providerId];

        // Handle Anthropic provider
        if (providerConfig?.type === 'anthropic') {
            if (!providerConfig.enabled) {
                throw new Error(`Provider not enabled: ${providerId}`);
            }
            const baseAdapter = createAnthropicAdapter({
                apiKey: config.apiKey,
                baseURL: config.baseURL,
                headers: config.headers,
                dangerouslyAllowBrowser: true,
            } as AnthropicAdapterConfig);

            // Wrap with extended methods
            const extendedAdapter = this.extendAdapter(baseAdapter, providerId, config);
            this.adapters.set(providerId, extendedAdapter);
            return extendedAdapter;
        }

        // For openai-compatible providers, baseURL is required in config
        if (providerId === 'openai-compatible') {
            if (!config.baseURL) {
                throw new Error('baseURL is required for OpenAI Compatible providers');
            }
            const baseAdapter = this.createCustomAdapter(config);
            const extendedAdapter = this.extendAdapter(baseAdapter, providerId, config);
            this.adapters.set(providerId, extendedAdapter);
            return extendedAdapter;
        }

        if (!providerConfig) {
            throw new Error(`Unknown provider: ${providerId}`);
        }

        if (!providerConfig.enabled) {
            throw new Error(`Provider not enabled: ${providerId}`);
        }

        // Create adapter based on provider type
        const baseAdapter = this.createOpenAICompatibleAdapter(providerConfig, config);

        // Wrap with extended methods
        const extendedAdapter = this.extendAdapter(baseAdapter, providerId, config);

        // Cache adapter
        this.adapters.set(providerId, extendedAdapter);

        return extendedAdapter;
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
     * Extend base adapter with getModels and testConnection methods
     * @param baseAdapter - TanStack AI adapter to extend
     * @param providerId - Provider ID for model fetching
     * @param config - Adapter configuration with API key
     * @returns Extended adapter with additional methods
     */
    private extendAdapter(
        baseAdapter: OpenAIAdapter | AnthropicAdapter,
        providerId: string,
        config: CustomAdapterConfig
    ): ExtendedProviderAdapter {
        // Extend the base adapter with additional methods
        const extended = {
            ...baseAdapter,
            getModels: async (): Promise<ProviderModel[]> => {
                const modelInfos = await this.modelRegistry.getModels(providerId, config.apiKey);
                // Map ModelInfo to ProviderModel
                return modelInfos.map((info): ProviderModel => ({
                    id: info.id,
                    name: info.name,
                    providerId: info.providerId,
                    contextWindow: info.contextLength || 4096,
                    maxOutputTokens: info.maxOutputTokens || 4096,
                    inputModalities: (info.inputModalities || ['text']) as Array<'text' | 'image' | 'audio' | 'video' | 'code'>,
                    outputModalities: (info.outputModalities || ['text']) as Array<'text' | 'image' | 'audio' | 'video' | 'code'>,
                    isEnabled: true,
                    pricing: info.pricing ? {
                        promptPer1M: info.pricing.prompt,
                        completionPer1M: info.pricing.completion,
                    } : undefined,
                }));
            },
            testConnection: async (): Promise<{ success: boolean; latencyMs: number; error?: string }> => {
                const result = await this.testConnection(providerId, config.apiKey, {
                    baseURL: config.baseURL,
                    headers: config.headers,
                });
                return {
                    success: result.success,
                    latencyMs: result.latencyMs,
                    error: result.error,
                };
            },
        } as ExtendedProviderAdapter;

        return extended;
    }

    /**
     * Get a cached adapter
     * @param providerId - Provider ID
     * @returns Cached adapter or undefined
     */
    getAdapter(providerId: string): ProviderAdapter | undefined {
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

            // Handle Anthropic provider test
            if (provider?.type === 'anthropic') {
                const adapter = createAnthropicAdapter({
                    apiKey,
                    baseURL: customConfig?.baseURL || provider.baseURL,
                    headers: customConfig?.headers,
                    dangerouslyAllowBrowser: true,
                } as AnthropicAdapterConfig);
                return adapter.testConnection();
            }

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
     * @param apiKey - API key to test (fetched from credential vault or provided by user)
     * @returns Connection test result
     */
    async testCustomConnection(
        customConfig: OpenAICompatibleConfig,
        apiKey: string
    ): Promise<ConnectionTestResult> {
        return this.testConnection(
            'openai-compatible',
            apiKey,
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
): ProviderAdapter {
    return providerAdapterFactory.createAdapter(providerId, config);
}

