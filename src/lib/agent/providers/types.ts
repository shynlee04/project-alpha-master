/**
 * @fileoverview Provider Types and Configuration
 * @module lib/agent/providers/types
 * 
 * Type definitions for AI provider adapters, credentials, and models.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-0 - Create ProviderAdapterFactory with OpenRouter
 */

/**
 * Provider type - determines which adapter to use
 */
export type ProviderType = 'openai' | 'openai-compatible' | 'anthropic' | 'gemini';

/**
 * Provider configuration
 */
export interface ProviderConfig {
    /** Unique provider identifier */
    id: string;
    /** Display name */
    name: string;
    /** Provider type for adapter selection */
    type: ProviderType;
    /** Base URL for OpenAI-compatible providers */
    baseURL?: string;
    /** Default model ID */
    defaultModel?: string;
    /** Whether provider is enabled */
    enabled: boolean;
}

/**
 * Adapter configuration for creating instances
 */
export interface AdapterConfig {
    /** API key (decrypted) */
    apiKey: string;
    /** Optional model ID override */
    model?: string;
    /** Optional base URL override */
    baseURL?: string;
}

/**
 * Model information from provider API
 */
export interface ModelInfo {
    /** Model ID (e.g., 'gpt-4o', 'meta-llama/llama-3.1-8b-instruct:free') */
    id: string;
    /** Display name */
    name: string;
    /** Whether this is a free model */
    isFree?: boolean;
    /** Context window size */
    contextLength?: number;
    /** Provider ID */
    providerId: string;
}

/**
 * Stored credentials (encrypted)
 */
export interface StoredCredential {
    /** Provider ID */
    providerId: string;
    /** Encrypted API key (base64) */
    encrypted: string;
    /** Initialization vector (base64) */
    iv: string;
    /** When credential was stored */
    createdAt: Date;
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
    /** Whether connection succeeded */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Response time in ms */
    latencyMs?: number;
}

/**
 * Built-in provider configurations
 */
export const PROVIDERS: Record<string, ProviderConfig> = {
    openai: {
        id: 'openai',
        name: 'OpenAI',
        type: 'openai',
        defaultModel: 'gpt-4o',
        enabled: true,
    },
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        type: 'openai-compatible',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
        enabled: true,
    },
    anthropic: {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'anthropic',
        defaultModel: 'claude-3-5-sonnet-20241022',
        enabled: false, // Not implemented yet
    },
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        type: 'gemini',
        defaultModel: 'gemini-2.0-flash',
        enabled: false, // Use existing @tanstack/ai-gemini
    },
};

/**
 * Free models available on OpenRouter (December 2025)
 */
export const FREE_MODELS: ModelInfo[] = [
    {
        id: 'meta-llama/llama-3.1-8b-instruct:free',
        name: 'Llama 3.1 8B Instruct',
        isFree: true,
        contextLength: 131072,
        providerId: 'openrouter',
    },
    {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash (Experimental)',
        isFree: true,
        contextLength: 1048576,
        providerId: 'openrouter',
    },
    {
        id: 'deepseek/deepseek-r1:free',
        name: 'DeepSeek R1',
        isFree: true,
        contextLength: 163840,
        providerId: 'openrouter',
    },
    {
        id: 'deepseek/deepseek-v3:free',
        name: 'DeepSeek V3',
        isFree: true,
        contextLength: 131072,
        providerId: 'openrouter',
    },
];
