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
 * Matches infrastructure store type for consistency
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
    /** Whether this is a user-configurable custom provider */
    isCustom?: boolean;
    /** Whether the provider supports native tool calling */
    supportsNativeTools?: boolean;
    /**
     * API Key existence flag (true if key stored in credential vault)
     * @security Actual API key stored in encrypted credential-vault.ts
     */
    hasApiKey: boolean;
    /** Available models for this provider */
    models: ModelInfo[];
    /** Timestamp when models were last fetched (Unix timestamp) */
    lastModelFetchAt?: number;
}

/**
 * OpenAI Compatible Provider Configuration
 * User-configurable settings for custom endpoints
 */
export interface OpenAICompatibleConfig {
    /** Unique identifier for this custom provider config */
    id: string;
    /** Display name for this provider */
    name: string;
    /** Base URL for the API (e.g., http://localhost:1234/v1) */
    baseURL: string;
    /**
     * API Key existence flag (true if key stored in credential vault)
     * @security Actual API key stored in encrypted credential-vault.ts
     */
    hasApiKey: boolean;
    /** Custom headers to send with requests */
    headers?: Record<string, string>;
    /** Default model ID */
    defaultModel?: string;
    /** Whether this provider supports native tool calling */
    supportsNativeTools?: boolean;
    /** Whether the API key is required (false for local providers) */
    requiresApiKey?: boolean;
    /** When this config was created */
    createdAt: string;
    /** Last connection test result */
    lastTestResult?: {
        success: boolean;
        latencyMs?: number;
        error?: string;
        testedAt: string;
    };
}

/**
 * Adapter configuration for creating instances
 * @internal Used by ProviderAdapterFactory after fetching key from vault
 */
export interface AdapterConfig {
    /**
     * API key (decrypted)
     * @security Fetched from credential-vault.ts at runtime, NOT stored in provider state
     */
    apiKey: string;
    /** Optional model ID override */
    model?: string;
    /** Optional base URL override */
    baseURL?: string;
}

/**
 * Model information from provider API
 * CC-2025-12-29: Extended with LLM parameters and pricing
 */
export interface ModelInfo {
    /** Model ID (e.g., 'gpt-4o', 'meta-llama/llama-3.1-8b-instruct:free') */
    id: string;
    /** Display name */
    name: string;
    /** Whether this is a free model */
    isFree?: boolean;
    /** Context window size (input tokens) */
    contextLength?: number;
    /** Max output tokens */
    maxOutputTokens?: number;
    /** Provider ID */
    providerId: string;

    // LLM Parameter Defaults (from provider API)
    /** Default temperature */
    temperature?: number;
    /** Max temperature allowed */
    maxTemperature?: number;
    /** Default top_p */
    topP?: number;
    /** Default top_k (Gemini/local) */
    topK?: number;

    // Capabilities
    /** Supported generation methods */
    supportedMethods?: string[];
    /** Input modalities (text, image, audio) */
    inputModalities?: string[];
    /** Output modalities */
    outputModalities?: string[];
    /** Supports tool/function calling */
    supportsTools?: boolean;

    // Pricing (per 1M tokens)
    pricing?: {
        prompt: number;
        completion: number;
    };
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
        supportsNativeTools: true,
        hasApiKey: false,
        models: [],
        lastModelFetchAt: undefined,
    },
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        type: 'openai-compatible',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
        enabled: true,
        supportsNativeTools: true,
        hasApiKey: false,
        models: [],
        lastModelFetchAt: undefined,
    },
    'openai-compatible': {
        id: 'openai-compatible',
        name: 'OpenAI Compatible',
        type: 'openai-compatible',
        enabled: true,
        isCustom: true,
        supportsNativeTools: false, // User can override
        hasApiKey: false,
        models: [],
        lastModelFetchAt: undefined,
    },
    anthropic: {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'anthropic',
        defaultModel: 'claude-3-5-sonnet-20241022',
        enabled: true, // ENABLED - Anthropic adapter implemented
        supportsNativeTools: true, // Supports native tool use via beta tool runner
        hasApiKey: false,
        models: [],
        lastModelFetchAt: undefined,
    },
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        type: 'gemini',
        defaultModel: 'gemini-3.0-flash',
        enabled: true,
        supportsNativeTools: true,
        hasApiKey: false,
        models: [],
        lastModelFetchAt: undefined,
    },
};

/**
 * Gemini Model Hierarchy (December 2025)
 * - gemini-3.0-flash: Fast, cheap text/RAG chat
 * - gemini-3.0-pro: Deep synthesis, reasoning
 * - gemini-2.5-flash-native-audio-preview-12-2025: Live API WebSocket (audio in/out)
 * - gemini-embedding-001: Cloud embeddings (replaces deprecated text-embedding-004)
 */
export const GEMINI_MODELS = {
    flash: 'gemini-3.0-flash',
    pro: 'gemini-3.0-pro',
    live: 'gemini-2.5-flash-native-audio-preview-12-2025',
    embedding: 'gemini-embedding-001',
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
        id: 'google/gemini-3.0-flash:free',
        name: 'Gemini 3.0 Flash',
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
