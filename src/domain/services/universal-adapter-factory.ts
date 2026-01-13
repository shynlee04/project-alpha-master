/**
 * @fileoverview Universal Adapter Factory
 * @module domain/services/universal-adapter-factory
 *
 * Creates adapters for OpenAI-compatible providers with per-modality endpoints.
 * Executes requests to providers and returns standardized responses.
 *
 * @ epic EPIC-PRV
 * @ story PRV-03 - Universal Adapter Factory
 */

import type {
  UniversalProviderConfig,
  ProviderRequestContext,
  ProviderResponse,
  ModalityType,
} from '@/domain/types/llm/provider-types.js';
import { universalProviderRegistry } from './universal-provider-registry.js';

// ============================================================================
// REQUEST BUILDER
// ============================================================================

/**
 * Request payload types for each modality
 */
export type TextRequestPayload = {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
};

export type ImageRequestPayload = {
  model: string;
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
};

export type TTSRequestPayload = {
  text: string;
  speed?: number;
  voice?: string;
};

export type STTRequestPayload = {
  audio_b64: string;
  language?: string | null;
};

export type RequestPayload = TextRequestPayload | ImageRequestPayload | TTSRequestPayload | STTRequestPayload;

/**
 * Build request payload based on modality
 *
 * @param modality - The modality type
 * @param input - User input string
 * @returns Built request payload
 */
export function buildRequestPayload(modality: ModalityType, input: string): RequestPayload {
  switch (modality) {
    case 'text':
      return {
        model: '',
        messages: [{ role: 'user', content: input }],
        stream: false,
      };

    case 'image':
      return {
        model: '',
        prompt: input,
        width: 1024,
        height: 1024,
      };

    case 'tts':
      return {
        text: input,
        speed: 1.0,
      };

    case 'stt':
      return {
        audio_b64: input,
        language: null,
      };
    
    case 'audio':
      // Audio modality uses same format as STT for processing
      return {
        audio_b64: input,
        language: null,
      };

    case 'video':
      // Video modality - placeholder for future video processing
      return {
        model: '',
        prompt: input,
      };
  }
}

// ============================================================================
// REQUEST EXECUTOR
// ============================================================================

/**
 * Execute a provider request
 *
 * @param context - The request context
 * @returns Provider response with latency and data
 */
export async function executeProviderRequest(
  context: ProviderRequestContext
): Promise<ProviderResponse> {
  const startTime = performance.now();

  try {
    // Get provider config
    const provider = universalProviderRegistry.getConfig(context.providerId);
    if (!provider) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - startTime),
        error: `Provider not found: ${context.providerId}`,
      };
    }

    // Check if provider supports the modality
    const endpoint = provider.endpoints[context.modality];
    if (!endpoint) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - startTime),
        error: `Provider does not support modality: ${context.modality}`,
      };
    }

    // Build full URL
    const url = buildUrl(endpoint, context.modality);

    // Build request body
    const body = buildBody(context, provider);

    // Build headers
    const headers = await buildHeaders(provider, context);

    // Execute fetch
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    // Update registry stats
    universalProviderRegistry.incrementRequestCount(context.providerId);
    universalProviderRegistry.updateSuccessRate(context.providerId, response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        latencyMs,
        error: `HTTP ${response.status}: ${errorText}`,
        statusCode: response.status,
      };
    }

    // Parse response based on modality
    const data = await parseResponse(response, context.modality);

    return {
      success: true,
      latencyMs,
      data,
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };

  } catch (error) {
    const latencyMs = Math.round(performance.now() - startTime);

    // Update registry stats
    universalProviderRegistry.incrementRequestCount(context.providerId);
    universalProviderRegistry.updateSuccessRate(context.providerId, false);

    return {
      success: false,
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build full URL for the request
 *
 * Appends the appropriate path based on modality:
 * - text: /chat/completions
 * - image: /generate
 * - tts: /speak
 * - stt: /transcribe
 */
function buildUrl(baseEndpoint: string, modality: ModalityType): string {
  try {
    const url = new URL(baseEndpoint);

    // Append path based on modality
    switch (modality) {
      case 'text':
        url.pathname = url.pathname.replace(/\/$/, '') + '/chat/completions';
        break;
      case 'image':
        url.pathname = url.pathname.replace(/\/$/, '') + '/generate';
        break;
      case 'tts':
        url.pathname = url.pathname.replace(/\/$/, '') + '/speak';
        break;
      case 'stt':
        url.pathname = url.pathname.replace(/\/$/, '') + '/transcribe';
        break;
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return as-is
    return baseEndpoint;
  }
}

/**
 * Build request body based on modality
 */
function buildBody(
  context: ProviderRequestContext,
  _provider: UniversalProviderConfig
): unknown {
  const payload = context.payload as RequestPayload;

  switch (context.modality) {
    case 'text':
      const textPayload = payload as TextRequestPayload;
      return {
        model: context.model,
        messages: textPayload.messages,
        stream: context.parameters?.stream ?? false,
        max_tokens: context.parameters?.maxTokens ?? 1024,
        temperature: context.parameters?.temperature ?? 0.7,
        top_p: context.parameters?.topP,
      };

    case 'image':
      const imagePayload = payload as ImageRequestPayload;
      return {
        model: context.model,
        prompt: imagePayload.prompt,
        negative_prompt: imagePayload.negative_prompt,
        width: imagePayload.width,
        height: imagePayload.height,
      };

    case 'tts':
      const ttsPayload = payload as TTSRequestPayload;
      return {
        text: ttsPayload.text,
        speed: ttsPayload.speed ?? 1.0,
        voice: ttsPayload.voice,
      };

    case 'stt':
      const sttPayload = payload as STTRequestPayload;
      return {
        audio_b64: sttPayload.audio_b64,
        language: sttPayload.language ?? null,
      };
  }
}

/**
 * Build headers with auth
 *
 * @param provider - Provider configuration
 * @param context - Request context
 * @returns Headers object
 */
async function buildHeaders(
  provider: UniversalProviderConfig,
  context: ProviderRequestContext
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...provider.defaultHeaders,
  };

  // Add API key if available
  if (context.apiKeyOverride) {
    headers['Authorization'] = `Bearer ${context.apiKeyOverride}`;
  } else if (provider.hasApiKey) {
    // Try to get API key from credential vault
    const apiKey = await getApiKeyFromVault(provider.id);
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  return headers;
}

/**
 * Get API key from credential vault
 *
 * @param providerId - Provider identifier
 * @returns API key or undefined
 */
async function getApiKeyFromVault(providerId: string): Promise<string | undefined> {
  // Try to get from CredentialVault
  try {
    const { CredentialVault } = await import('@/lib/agent/providers/credential-vault');
    const vault = new CredentialVault();
    const apiKey = await vault.getCredentials(providerId);
    return apiKey || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Parse response based on modality
 *
 * @param response - Fetch response
 * @param _modality - Request modality (reserved for future use)
 * @returns Parsed response data
 */
async function parseResponse(
  response: Response,
  _modality: ModalityType
): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  // Binary response (image/audio)
  if (contentType.startsWith('image/') || contentType.startsWith('audio/')) {
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64;
  }

  // JSON response
  const json = await response.json();

  // Extract usage info if available
  if (json.usage) {
    return {
      ...json,
      _usage: {
        promptTokens: json.usage.prompt_tokens,
        completionTokens: json.usage.completion_tokens,
        totalTokens: json.usage.total_tokens,
      },
    };
  }

  return json;
}

// ============================================================================
// ADAPTER INTERFACE
// ============================================================================

/**
 * Universal Provider Adapter
 *
 * Provides a consistent interface for interacting with any
 * OpenAI-compatible provider regardless of their endpoint configuration.
 */
export class UniversalProviderAdapter {
  constructor(private providerId: string) {}

  /**
   * Execute a text generation request
   *
   * @param model - Model identifier
   * @param messages - Chat messages
   * @param options - Generation options
   * @returns Provider response
   */
  async chat(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: {
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<ProviderResponse> {
    return executeProviderRequest({
      providerId: this.providerId,
      model,
      modality: 'text',
      payload: { model, messages },
      parameters: options,
    });
  }

  /**
   * Execute an image generation request
   *
   * @param model - Model identifier
   * @param prompt - Image prompt
   * @param options - Generation options
   * @returns Provider response
   */
  async generateImage(
    model: string,
    prompt: string,
    options?: {
      width?: number;
      height?: number;
      negativePrompt?: string;
    }
  ): Promise<ProviderResponse> {
    return executeProviderRequest({
      providerId: this.providerId,
      model,
      modality: 'image',
      payload: { model, prompt, ...options },
    });
  }

  /**
   * Execute a text-to-speech request
   *
   * @param model - Model identifier
   * @param text - Text to speak
   * @param options - TTS options
   * @returns Provider response
   */
  async speak(
    model: string,
    text: string,
    options?: {
      speed?: number;
      voice?: string;
    }
  ): Promise<ProviderResponse> {
    return executeProviderRequest({
      providerId: this.providerId,
      model,
      modality: 'tts',
      payload: { text, ...options },
    });
  }

  /**
   * Execute a speech-to-text request
   *
   * @param model - Model identifier
   * @param audioB64 - Base64-encoded audio
   * @param options - STT options
   * @returns Provider response
   */
  async transcribe(
    model: string,
    audioB64: string,
    options?: {
      language?: string;
    }
  ): Promise<ProviderResponse> {
    return executeProviderRequest({
      providerId: this.providerId,
      model,
      modality: 'stt',
      payload: { audio_b64: audioB64, language: options?.language ?? null },
    });
  }

  /**
   * Test connection to the provider
   *
   * @returns Connection test result
   */
  async testConnection(): Promise<{
    success: boolean;
    latencyMs: number;
    error?: string;
  }> {
    const startTime = performance.now();

    try {
      const provider = universalProviderRegistry.getConfig(this.providerId);
      if (!provider) {
        return {
          success: false,
          latencyMs: Math.round(performance.now() - startTime),
          error: 'Provider not found',
        };
      }

      const endpoint = provider.endpoints.text;
      if (!endpoint) {
        return {
          success: false,
          latencyMs: Math.round(performance.now() - startTime),
          error: 'No text endpoint configured',
        };
      }

      // Send minimal test request
      const url = new URL(endpoint);
      url.pathname = url.pathname.replace(/\/$/, '') + '/models';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...provider.defaultHeaders,
      };

      if (provider.hasApiKey) {
        const apiKey = await getApiKeyFromVault(this.providerId);
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      const latencyMs = Math.round(performance.now() - startTime);

      // Accept 401 as "connection successful" (valid endpoint, just needs API key)
      if (response.ok || response.status === 401) {
        return { success: true, latencyMs };
      }

      const errorText = await response.text();
      return {
        success: false,
        latencyMs,
        error: `HTTP ${response.status}: ${errorText}`,
      };

    } catch (error) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Create an adapter for a provider
 *
 * @param providerId - Provider identifier
 * @returns Provider adapter instance
 */
export function createProviderAdapter(providerId: string): UniversalProviderAdapter {
  return new UniversalProviderAdapter(providerId);
}

/**
 * Test connection to a provider
 *
 * @param providerId - Provider identifier
 * @returns Connection test result
 */
export async function testProviderConnection(providerId: string): Promise<{
  success: boolean;
  latencyMs: number;
  error?: string;
}> {
  const adapter = createProviderAdapter(providerId);
  return adapter.testConnection();
}
