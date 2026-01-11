/**
 * ProviderService (Application Layer)
 * Orchestrates provider configuration operations
 *
 * Responsibilities:
 * - Provider CRUD operations
 * - API key management
 * - Model fetching and caching
 * - Cross-workspace provider synchronization
 * - Unified content generation (EPIC-41-02)
 * - OpenAI-compatible endpoint support (EPIC-41-03)
 * 
 * @story EPIC-41-02 - Create unified provider service layer
 * @story EPIC-41-03 - Add OpenAI-compatible endpoint support
 * @updated 2026-01-12 - Added generateContent() for unified AI generation
 * @updated 2026-01-13 - Added OpenAI-compatible presets and custom endpoint support
 */

import { emitStoreEvent } from '@/lib/events/store-events';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { providerAdapterFactory } from '@/lib/agent/providers/provider-adapter';
import { GeminiAdapter } from '@/lib/agent/providers/gemini-adapter';
import { AnthropicAdapter } from '@/lib/agent/providers/anthropic-adapter';
import type { ProviderModel } from '@/core/entities/Provider';
import { STORE_EVENTS } from '@/lib/events/store-events';

/**
 * Message format for content generation
 */
export interface GenerationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Options for content generation
 * @story EPIC-41-03 - Extended with baseURL for custom endpoints
 */
export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Custom base URL for OpenAI-compatible endpoints */
  baseURL?: string;
  /** Custom headers for the request */
  headers?: Record<string, string>;
}

/**
 * Provider capability flags
 */
export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
  supportsAudio: boolean;
  supportsVideo: boolean;
  supportsImageGeneration: boolean;
}

/**
 * Preset OpenAI-compatible provider configurations
 * @story EPIC-41-03 - Popular provider presets
 */
export const OPENAI_COMPATIBLE_PRESETS: Record<string, {
  name: string;
  baseURL: string;
  defaultModel: string;
  requiresApiKey: boolean;
  description: string;
}> = {
  'ollama': {
    name: 'Ollama (Local)',
    baseURL: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2',
    requiresApiKey: false,
    description: 'Local Ollama server for open-source models',
  },
  'lmstudio': {
    name: 'LM Studio (Local)',
    baseURL: 'http://localhost:1234/v1',
    defaultModel: 'local-model',
    requiresApiKey: false,
    description: 'Local LM Studio server',
  },
  'together': {
    name: 'Together AI',
    baseURL: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    requiresApiKey: true,
    description: 'Together AI cloud inference',
  },
  'groq': {
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    requiresApiKey: true,
    description: 'Groq ultra-fast inference',
  },
  'fireworks': {
    name: 'Fireworks AI',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    requiresApiKey: true,
    description: 'Fireworks AI inference platform',
  },
  'deepinfra': {
    name: 'DeepInfra',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
    requiresApiKey: true,
    description: 'DeepInfra serverless inference',
  },
  'perplexity': {
    name: 'Perplexity',
    baseURL: 'https://api.perplexity.ai',
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    requiresApiKey: true,
    description: 'Perplexity AI with web search',
  },
};

/**
 * Normalize provider ID to canonical form
 * Maps legacy/variant IDs to standard IDs
 */
export function normalizeProviderId(providerId: string): string {
  const normalizations: Record<string, string> = {
    'google': 'gemini',      // Legacy name → standard
    'claude': 'anthropic',   // Legacy name → standard
    'gpt': 'openai',         // Shorthand → standard
  };
  return normalizations[providerId.toLowerCase()] || providerId;
}

/**
 * Check if a provider ID is an OpenAI-compatible preset
 */
export function isOpenAICompatiblePreset(providerId: string): boolean {
  return providerId in OPENAI_COMPATIBLE_PRESETS;
}

/**
 * Get preset configuration for an OpenAI-compatible provider
 */
export function getOpenAICompatiblePreset(providerId: string) {
  return OPENAI_COMPATIBLE_PRESETS[providerId];
}

/**
 * Get capabilities for a provider
 */
export function getProviderCapabilities(providerId: string): ProviderCapabilities {
  const normalized = normalizeProviderId(providerId);
  
  const capabilities: Record<string, ProviderCapabilities> = {
    'gemini': {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsAudio: true,
      supportsVideo: true,
      supportsImageGeneration: true,
    },
    'openai': {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsAudio: true,
      supportsVideo: false,
      supportsImageGeneration: true,
    },
    'anthropic': {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsAudio: false,
      supportsVideo: false,
      supportsImageGeneration: false,
    },
    'openrouter': {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsAudio: false,
      supportsVideo: false,
      supportsImageGeneration: false,
    },
  };
  
  return capabilities[normalized] || {
    supportsStreaming: true,
    supportsTools: false,
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsImageGeneration: false,
  };
}

export class ProviderService {
  /**
   * Generate content using any supported provider
   * Unified API that routes to the correct adapter
   * 
   * @story EPIC-41-02 - Unified provider service layer
   * @story EPIC-41-03 - Supports custom OpenAI-compatible endpoints via options.baseURL
   */
  async generateContent(
    providerId: string,
    messages: GenerationMessage[],
    options: GenerationOptions = {}
  ): Promise<string> {
    const normalized = normalizeProviderId(providerId);
    
    // Check if this is an OpenAI-compatible preset
    const preset = getOpenAICompatiblePreset(normalized);
    if (preset || options.baseURL) {
      // Route to OpenAI-compatible handler with custom baseURL
      const baseURL = options.baseURL || preset?.baseURL;
      const apiKey = await credentialVault.getCredentials(normalized) || '';
      
      // For local providers (Ollama, LM Studio), API key is optional
      if (preset?.requiresApiKey && !apiKey) {
        throw new Error(`No API key found for provider: ${normalized}`);
      }
      
      return this.callOpenAICompatible(
        normalized,
        apiKey,
        messages,
        {
          ...options,
          baseURL,
          model: options.model || preset?.defaultModel,
        }
      );
    }
    
    // 1. Get API key for built-in providers
    const apiKey = await credentialVault.getCredentials(normalized);
    if (!apiKey) {
      throw new Error(`No API key found for provider: ${normalized}`);
    }
    
    // 2. Route to correct adapter based on provider type
    const providerConfig = providerAdapterFactory.getProviderConfig(normalized);
    
    if (providerConfig?.type === 'gemini' || normalized === 'gemini') {
      // Use Gemini adapter directly for better multimodal support
      const adapter = new GeminiAdapter({
        apiKey,
        model: options.model || 'gemini-2.5-flash',
      });
      
      const result = await adapter.chat(
        messages.map(m => ({ role: m.role, content: m.content })),
        {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        }
      );
      
      return result.content;
    }
    
    if (providerConfig?.type === 'anthropic' || normalized === 'anthropic') {
      // Use Anthropic adapter
      const adapter = new AnthropicAdapter({
        apiKey,
        model: options.model || 'claude-3-5-sonnet-20241022',
        dangerouslyAllowBrowser: true,
      });
      
      // Convert messages to Anthropic format
      const anthropicMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      
      const result = await adapter.chat(anthropicMessages as never, {
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens || 4096,
      });
      
      return result.content;
    }
    
    // 3. Default: Use OpenAI-compatible API call
    const response = await this.callOpenAICompatible(
      normalized,
      apiKey,
      messages,
      options
    );
    
    return response;
  }
  
  /**
   * Generate content using a custom OpenAI-compatible endpoint
   * Convenience method for custom providers
   * 
   * @story EPIC-41-03 - OpenAI-compatible endpoint support
   */
  async generateWithCustomEndpoint(
    baseURL: string,
    messages: GenerationMessage[],
    options: Omit<GenerationOptions, 'baseURL'> & { apiKey?: string } = {}
  ): Promise<string> {
    const apiKey = options.apiKey || '';
    
    return this.callOpenAICompatible(
      'openai-compatible',
      apiKey,
      messages,
      {
        ...options,
        baseURL,
      }
    );
  }
  
  /**
   * Call OpenAI-compatible API (OpenAI, OpenRouter, custom endpoints)
   * @story EPIC-41-03 - Enhanced with options.baseURL support
   */
  private async callOpenAICompatible(
    providerId: string,
    apiKey: string,
    messages: GenerationMessage[],
    options: GenerationOptions
  ): Promise<string> {
    // Determine baseURL: options > preset > providerConfig > default
    let baseURL = options.baseURL;
    
    if (!baseURL) {
      const preset = getOpenAICompatiblePreset(providerId);
      if (preset) {
        baseURL = preset.baseURL;
      } else {
        const providerConfig = providerAdapterFactory.getProviderConfig(providerId);
        baseURL = providerConfig?.baseURL || 'https://api.openai.com/v1';
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    
    // Add Authorization header only if API key is provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    // Add OpenRouter-specific headers
    if (providerId === 'openrouter') {
      headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://via-gent.dev';
      headers['X-Title'] = 'Via-gent';
    }
    
    // Determine default model
    let defaultModel = options.model;
    if (!defaultModel) {
      const preset = getOpenAICompatiblePreset(providerId);
      if (preset) {
        defaultModel = preset.defaultModel;
      } else {
        const providerConfig = providerAdapterFactory.getProviderConfig(providerId);
        defaultModel = providerConfig?.defaultModel || 'gpt-4o';
      }
    }
    
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: defaultModel,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText.slice(0, 200)}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Set API key for provider and trigger model loading
   */
  async setApiKey(providerId: string, apiKey: string): Promise<void> {
    const normalized = normalizeProviderId(providerId);
    
    // 1. Store key securely
    await credentialVault.storeCredentials(normalized, apiKey);

    // 2. Emit event for cross-workspace reactivity
    emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_SET, {
      providerId: normalized,
      timestamp: Date.now()
    });

    // 3. Auto-load models (skip for local providers that don't need API key)
    const preset = getOpenAICompatiblePreset(normalized);
    if (!preset || preset.requiresApiKey) {
      try {
        await this.fetchModels(normalized);
      } catch (e) {
        console.warn(`[ProviderService] Could not fetch models for ${normalized}:`, e);
      }
    }
  }

  /**
   * Fetch models for a provider
   */
  async fetchModels(providerId: string): Promise<ProviderModel[]> {
    const normalized = normalizeProviderId(providerId);
    
    // 1. Get API key
    const apiKey = await credentialVault.getCredentials(normalized);
    if (!apiKey) {
      throw new Error(`No API key found for provider: ${normalized}`);
    }

    // 2. Create adapter and fetch
    const adapter = providerAdapterFactory.createAdapter(normalized, { apiKey });
    const models = await adapter.getModels();

    // 3. Emit models loaded event
    emitStoreEvent(STORE_EVENTS.PROVIDER_MODELS_LOADED, {
      providerId: normalized,
      modelCount: models.length,
      timestamp: Date.now()
    });

    return models;
  }

  /**
   * Remove API key for provider
   */
  async removeApiKey(providerId: string): Promise<void> {
    const normalized = normalizeProviderId(providerId);
    await credentialVault.deleteCredentials(normalized);

    emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_REMOVED, {
      providerId: normalized,
      timestamp: Date.now()
    });
  }

  /**
   * Test provider connection
   */
  async testConnection(providerId: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const normalized = normalizeProviderId(providerId);
    const apiKey = await credentialVault.getCredentials(normalized);
    if (!apiKey) {
      return { success: false, latencyMs: 0, error: 'No API key' };
    }

    const adapter = providerAdapterFactory.createAdapter(normalized, { apiKey });
    return adapter.testConnection();
  }
  
  /**
   * Test connection to a custom OpenAI-compatible endpoint
   * @story EPIC-41-03 - Custom endpoint testing
   */
  async testCustomEndpoint(
    baseURL: string,
    apiKey?: string
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const response = await fetch(`${baseURL}/models`, {
        method: 'GET',
        headers,
      });
      
      const latencyMs = Date.now() - startTime;
      
      if (response.ok) {
        return { success: true, latencyMs };
      } else {
        const errorText = await response.text();
        return { success: false, latencyMs, error: `${response.status}: ${errorText.slice(0, 100)}` };
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return { 
        success: false, 
        latencyMs, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }
  
  /**
   * Get all available OpenAI-compatible presets
   * @story EPIC-41-03 - Preset discovery
   */
  getOpenAICompatiblePresets() {
    return OPENAI_COMPATIBLE_PRESETS;
  }
  
  /**
   * Get capabilities for a provider
   */
  getCapabilities(providerId: string): ProviderCapabilities {
    return getProviderCapabilities(providerId);
  }
}

// Singleton instance
export const providerService = new ProviderService();
