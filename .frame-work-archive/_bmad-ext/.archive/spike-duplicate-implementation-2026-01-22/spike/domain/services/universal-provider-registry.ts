/**
 * @fileoverview Universal Provider Registry Service
 * @module domain/services/universal-provider-registry
 *
 * Dynamic registry for OpenAI-compatible providers with per-modality endpoints.
 * Enables runtime registration, listing, and removal of providers.
 *
 * @ epic EPIC-PRV
 * @ story PRV-02 - Provider Registry Service
 */

import type {
  UniversalProviderConfig,
  UniversalModelConfig,
  ModalityType,
  ProviderRegistryEntry,
} from '@/domain/types/llm/provider-types.js';

// ============================================================================
// BUILT-IN PROVIDERS
// ============================================================================

/**
 * Built-in provider configurations
 *
 * These are pre-configured providers that users can enable and configure.
 */
const BUILTIN_PROVIDERS: Omit<UniversalProviderConfig, 'hasApiKey' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'chutes',
    name: 'Chutes.ai',
    description: 'Multi-modality AI provider with text, image, TTS, and STT endpoints',
    endpoints: {
      text: 'https://llm.chutes.ai/v1',
      image: 'https://image.chutes.ai',
      tts: 'https://chutes-kokoro.chutes.ai',
      stt: 'https://chutes-whisper-large-v3.chutes.ai',
    },
    requiresApiKey: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'zai-org/GLM-4.7-TEE',
        name: 'GLM 4.7 TEE',
        modalities: ['text', 'tts', 'stt'],
        contextLength: 128000,
        supportsStreaming: true,
      },
      {
        id: 'qwen-image',
        name: 'Qwen Image',
        modalities: ['image'],
      },
    ],
    defaultModel: 'zai-org/GLM-4.7-TEE',
    docsUrl: 'https://chutes.ai/docs',
    websiteUrl: 'https://chutes.ai',
    enabled: false,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified interface for multiple LLM providers with free tier available',
    endpoints: {
      text: 'https://openrouter.ai/api/v1',
    },
    requiresApiKey: true,
    defaultHeaders: {
      'HTTP-Referer': 'https://via-gent.dev',
      'X-Title': 'Via-Gent',
    },
    models: [
      {
        id: 'meta-llama/llama-3.1-8b-instruct:free',
        name: 'Llama 3.1 8B Instruct (Free)',
        modalities: ['text'],
        contextLength: 131072,
        isFree: true,
      },
      {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash (Free)',
        modalities: ['text'],
        contextLength: 1048576,
        isFree: true,
      },
      {
        id: 'meta-llama/llama-3.1-70b-instruct:free',
        name: 'Llama 3.1 70B Instruct (Free)',
        modalities: ['text'],
        contextLength: 131072,
        isFree: true,
      },
    ],
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    docsUrl: 'https://openrouter.ai/docs',
    websiteUrl: 'https://openrouter.ai',
    enabled: false,
  },
  // ============================================================================
  // GOOGLE GEMINI PROVIDER (Updated 2026-01-14 with Gemini 3.0 models)
  // Source: https://ai.google.dev/gemini-api/docs
  // ============================================================================
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Google\'s Gemini 3.0 AI models with multimodal capabilities (text, image, audio, video)',
    endpoints: {
      text: 'https://generativelanguage.googleapis.com/v1beta/models',
      image: 'https://generativelanguage.googleapis.com/v1beta/models',
    },
    requiresApiKey: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      // Gemini 3.0 Series (Preview)
      {
        id: 'gemini-3-pro',
        name: 'Gemini 3 Pro',
        modalities: ['text', 'image', 'audio', 'video'],
        contextLength: 1048576,
        supportsStreaming: true,
        description: 'First in new 3-series, complex tasks with broad reasoning across modalities',
      },
      {
        id: 'gemini-3-flash',
        name: 'Gemini 3 Flash',
        modalities: ['text', 'image', 'audio', 'video'],
        contextLength: 1048576,
        supportsStreaming: true,
        description: 'Latest 3-series with Pro-level intelligence at Flash speed',
      },
      // Image Generation Models (Nano Banana)
      {
        id: 'gemini-3-pro-image-preview',
        name: 'Nano Banana Pro (Gemini 3 Pro Image)',
        modalities: ['image'],
        contextLength: 1048576,
        supportsStreaming: false,
        description: 'Highest quality image generation with 4K support, Google Search grounding',
      },
      {
        id: 'gemini-2.5-flash-image',
        name: 'Nano Banana (Gemini 2.5 Flash Image)',
        modalities: ['image'],
        contextLength: 1048576,
        supportsStreaming: false,
        description: 'Speed-optimized image generation for high-volume, low-latency tasks',
      },
      // Imagen 3.0 (OpenAI-compatible endpoint)
      {
        id: 'imagen-3.0-generate-002',
        name: 'Imagen 3.0',
        modalities: ['image'],
        contextLength: 1048576,
        supportsStreaming: false,
        description: 'Imagen 3.0 generation via OpenAI-compatible endpoint',
      },
      // Legacy Stable Models
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        modalities: ['text', 'image', 'audio'],
        contextLength: 1048576,
        supportsStreaming: true,
        description: 'Stable, production-ready model',
      },
    ],
    defaultModel: 'gemini-3-flash',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
    websiteUrl: 'https://gemini.google.com',
    enabled: false,
  },
  // ============================================================================
  // GROQ PROVIDER (Added 2026-01-14)
  // Source: https://console.groq.com/docs
  // ============================================================================
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast LLM inference with low latency, LLaVA vision models supported',
    endpoints: {
      text: 'https://api.groq.com/openai/v1',
    },
    requiresApiKey: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'llava-v1.5-7b',
        name: 'LLaVA v1.5 7B',
        modalities: ['text', 'image'],
        contextLength: 4096,
        supportsStreaming: true,
        description: 'Vision-language model for image understanding and VQA',
      },
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        modalities: ['text'],
        contextLength: 131072,
        supportsStreaming: true,
        description: 'Versatile model for general use',
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        modalities: ['text'],
        contextLength: 131072,
        supportsStreaming: true,
        description: 'Lightweight model for low-latency responses',
      },
    ],
    defaultModel: 'llava-v1.5-7b',
    docsUrl: 'https://console.groq.com/docs',
    websiteUrl: 'https://groq.com',
    enabled: false,
  },
  // ============================================================================
  // MISTRAL AI PROVIDER (Added 2026-01-14)
  // Source: https://docs.mistral.ai
  // ============================================================================
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Pixtral multimodal models with native vision support, OpenAI-compatible API',
    endpoints: {
      text: 'https://api.mistral.ai/v1',
    },
    requiresApiKey: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'pixtral-12b-2409',
        name: 'Pixtral 12B',
        modalities: ['text', 'image'],
        contextLength: 8192,
        supportsStreaming: true,
        description: '12B multimodal with 400M vision encoder, native image understanding',
      },
      {
        id: 'pixtral-large-2411',
        name: 'Pixtral Large',
        modalities: ['text', 'image'],
        contextLength: 131072,
        supportsStreaming: true,
        description: '124B frontier multimodal model built on Mistral Large 2',
      },
      {
        id: 'pixtral-large-latest',
        name: 'Pixtral Large (Latest)',
        modalities: ['text', 'image'],
        contextLength: 131072,
        supportsStreaming: true,
        description: 'Latest Pixtral Large model with all improvements',
      },
      {
        id: 'mistral-large-2411',
        name: 'Mistral Large 3',
        modalities: ['text'],
        contextLength: 131072,
        supportsStreaming: true,
        description: 'Flagship text model with advanced reasoning',
      },
    ],
    defaultModel: 'pixtral-12b-2409',
    docsUrl: 'https://docs.mistral.ai',
    websiteUrl: 'https://mistral.ai',
    enabled: false,
  },
];

// ============================================================================
// REGISTRY CLASS
// ============================================================================

/**
 * Universal Provider Registry
 *
 * Manages dynamic registration and lifecycle of universal providers.
 * Stores provider configurations and metadata in memory with optional persistence.
 */
class UniversalProviderRegistry {
  private providers: Map<string, ProviderRegistryEntry> = new Map();
  private persistenceKey = 'universal-providers';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize registry with built-in providers and load from storage
   * SSR GUARD: localStorage is not available during server-side rendering
   */
  private initialize(): void {
    // SSR GUARD - localStorage is not available during server-side rendering
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }

    // Register built-in providers if not already registered
    for (const provider of BUILTIN_PROVIDERS) {
      if (!this.providers.has(provider.id)) {
        this.registerBuiltIn(provider);
      }
    }
  }

  /**
   * Register a built-in provider (without overwriting user config)
   */
  private registerBuiltIn(provider: Omit<UniversalProviderConfig, 'hasApiKey' | 'createdAt' | 'updatedAt'>): void {
    const existing = this.providers.get(provider.id);
    if (existing) {
      // Preserve user configuration
      return;
    }

    const config: UniversalProviderConfig = {
      ...provider,
      hasApiKey: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.providers.set(provider.id, {
      config,
      registeredAt: new Date().toISOString(),
    });
  }

  /**
   * Register or update a provider
   *
   * @param config - Provider configuration to register
   * @returns The registered provider entry
   */
  register(config: UniversalProviderConfig): ProviderRegistryEntry {
    const now = new Date().toISOString();
    const existing = this.providers.get(config.id);

    if (existing) {
      // Update existing provider
      const updated: UniversalProviderConfig = {
        ...config,
        updatedAt: now,
      };

      this.providers.set(config.id, {
        config: updated,
        registeredAt: existing.registeredAt,
        lastAccessedAt: now,
      });
    } else {
      // Register new provider
      this.providers.set(config.id, {
        config,
        registeredAt: now,
        requestCount: 0,
      });
    }

    this.saveToStorage();
    return this.get(config.id)!;
  }

  /**
   * Get a provider by ID
   *
   * @param id - Provider identifier
   * @returns Provider entry or undefined if not found
   */
  get(id: string): ProviderRegistryEntry | undefined {
    const entry = this.providers.get(id);
    if (entry) {
      // Update last accessed time
      entry.lastAccessedAt = new Date().toISOString();
    }
    return entry;
  }

  /**
   * Get provider configuration by ID
   *
   * @param id - Provider identifier
   * @returns Provider config or undefined if not found
   */
  getConfig(id: string): UniversalProviderConfig | undefined {
    return this.providers.get(id)?.config;
  }

  /**
   * List all registered providers
   *
   * @param options - Filter options
   * @returns Array of provider configurations
   */
  list(options?: {
    modality?: ModalityType;
    enabled?: boolean;
    custom?: boolean;
  }): UniversalProviderConfig[] {
    let providers = Array.from(this.providers.values()).map((entry) => entry.config);

    if (options?.modality) {
      providers = providers.filter((p) =>
        p.endpoints[options.modality!] && p.models.some((m) => m.modalities.includes(options.modality!))
      );
    }

    if (options?.enabled !== undefined) {
      providers = providers.filter((p) => p.enabled === options.enabled);
    }

    if (options?.custom !== undefined) {
      providers = providers.filter((p) => p.isCustom === options.custom);
    }

    return providers.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * List providers that support a specific modality
   *
   * @param modality - The modality type
   * @returns Array of provider configurations supporting the modality
   */
  getByModality(modality: ModalityType): UniversalProviderConfig[] {
    return this.list({ modality });
  }

  /**
   * List models for a specific provider and modality
   *
   * @param providerId - Provider identifier
   * @param modality - The modality type
   * @returns Array of model configurations
   */
  getModels(providerId: string, modality: ModalityType): UniversalModelConfig[] {
    const provider = this.getConfig(providerId);
    if (!provider) return [];

    return provider.models.filter((m) => m.modalities.includes(modality));
  }

  /**
   * Remove a provider
   *
   * @param id - Provider identifier
   * @returns true if provider was removed, false if not found
   */
  remove(id: string): boolean {
    const result = this.providers.delete(id);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  /**
   * Update provider configuration
   *
   * @param id - Provider identifier
   * @param updates - Partial configuration updates
   * @returns Updated provider entry or undefined if not found
   */
  update(id: string, updates: Partial<UniversalProviderConfig>): ProviderRegistryEntry | undefined {
    const entry = this.providers.get(id);
    if (!entry) return undefined;

    const updated: UniversalProviderConfig = {
      ...entry.config,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString(),
    };

    this.providers.set(id, {
      ...entry,
      config: updated,
    });

    this.saveToStorage();
    return this.get(id);
  }

  /**
   * Update API key status for a provider
   *
   * @param id - Provider identifier
   * @param hasApiKey - Whether API key is present
   * @param keyId - Optional vault key identifier
   */
  setApiKeyStatus(id: string, hasApiKey: boolean, keyId?: string): void {
    this.update(id, { hasApiKey, keyId });
  }

  /**
   * Increment request count for a provider
   *
   * @param id - Provider identifier
   */
  incrementRequestCount(id: string): void {
    const entry = this.providers.get(id);
    if (entry) {
      entry.requestCount = (entry.requestCount || 0) + 1;
    }
  }

  /**
   * Update success rate for a provider
   *
   * @param id - Provider identifier
   * @param success - Whether the request succeeded
   */
  updateSuccessRate(id: string, success: boolean): void {
    const entry = this.providers.get(id);
    if (!entry) return;

    const currentSuccessRate = entry.successRate || 0;
    const requestCount = entry.requestCount || 1;

    // Running average: newRate = oldRate * (n-1)/n + value/n
    entry.successRate = currentSuccessRate * ((requestCount - 1) / requestCount) + (success ? 1 : 0) / requestCount;
  }

  /**
   * Enable or disable a provider
   *
   * @param id - Provider identifier
   * @param enabled - Whether to enable the provider
   */
  setEnabled(id: string, enabled: boolean): void {
    this.update(id, { enabled });
  }

  /**
   * Clear all custom providers (resets to built-ins only)
   */
  clearCustom(): void {
    localStorage.removeItem(this.persistenceKey);
    this.providers.clear();
    this.initialize();
  }

  /**
   * Save providers to localStorage
   *
   * NOTE: API keys are NOT stored here - only hasApiKey flag
   * Actual keys are in the encrypted credential vault
   *
   * SSR GUARD: Only saves in browser context
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    const customProviders = Array.from(this.providers.entries())
      .filter(([_, entry]) => entry.config.isCustom)
      .map(([_, entry]) => entry.config);

    localStorage.setItem(this.persistenceKey, JSON.stringify(customProviders));
  }

  /**
   * Load providers from localStorage
   *
   * SSR GUARD: Only loads in browser context
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(this.persistenceKey);
    if (!stored) return;

    try {
      const customProviders: UniversalProviderConfig[] = JSON.parse(stored);
      for (const config of customProviders) {
        this.providers.set(config.id, {
          config,
          registeredAt: config.createdAt,
        });
      }
    } catch {
      // Invalid storage, ignore
    }
  }

  /**
   * Export all providers (for backup/transfer)
   *
   * @returns JSON string of all providers
   */
  export(): string {
    const providers = Array.from(this.providers.values()).map((entry) => entry.config);
    return JSON.stringify(providers, null, 2);
  }

  /**
   * Import providers (from backup/transfer)
   *
   * @param json - JSON string of providers
   * @returns Number of providers imported
   */
  import(json: string): number {
    let count = 0;
    try {
      const providers: UniversalProviderConfig[] = JSON.parse(json);
      for (const config of providers) {
        this.register(config);
        count++;
      }
    } catch {
      // Invalid JSON
    }
    return count;
  }

  /**
   * Get registry statistics
   *
   * @returns Statistics about the registry
   */
  getStats(): {
    totalProviders: number;
    enabledProviders: number;
    customProviders: number;
    providersByModality: Record<ModalityType, number>;
    totalRequests: number;
    averageSuccessRate: number;
  } {
    const entries = Array.from(this.providers.values());

    const providersByModality: Record<ModalityType, number> = {
      text: 0,
      image: 0,
      audio: 0,
      video: 0,
      tts: 0,
      stt: 0,
    };

    let totalRequests = 0;
    let totalSuccessRate = 0;

    for (const entry of entries) {
      // Count modalities
      for (const modality of Object.keys(entry.config.endpoints)) {
        if (modality in providersByModality) {
          providersByModality[modality as ModalityType]++;
        }
      }

      // Aggregate stats
      totalRequests += entry.requestCount || 0;
      totalSuccessRate += entry.successRate || 0;
    }

    return {
      totalProviders: entries.length,
      enabledProviders: entries.filter((e) => e.config.enabled).length,
      customProviders: entries.filter((e) => e.config.isCustom).length,
      providersByModality,
      totalRequests,
      averageSuccessRate: entries.length > 0 ? totalSuccessRate / entries.length : 0,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Global provider registry instance
 */
export const universalProviderRegistry = new UniversalProviderRegistry();

/**
 * Convenience function to get a provider config
 */
export function getProvider(id: string): UniversalProviderConfig | undefined {
  return universalProviderRegistry.getConfig(id);
}

/**
 * Convenience function to list all providers
 */
export function listProviders(options?: {
  modality?: ModalityType;
  enabled?: boolean;
  custom?: boolean;
}): UniversalProviderConfig[] {
  return universalProviderRegistry.list(options);
}

/**
 * Convenience function to register a provider
 */
export function registerProvider(config: UniversalProviderConfig): ProviderRegistryEntry {
  return universalProviderRegistry.register(config);
}

/**
 * Convenience function to remove a provider
 */
export function removeProvider(id: string): boolean {
  return universalProviderRegistry.remove(id);
}

/**
 * Convenience function to update a provider
 */
export function updateProvider(
  id: string,
  updates: Partial<UniversalProviderConfig>
): ProviderRegistryEntry | undefined {
  return universalProviderRegistry.update(id, updates);
}
