/**
 * @fileoverview Request Executor (Debug)
 * @module routes/__debug__/provider-playground/lib/request-executor
 *
 * Executes requests to OpenAI-compatible providers.
 * Handles different modalities with appropriate URL paths and response parsing.
 */

import type {
  UniversalProviderConfig,
  ProviderRequestContext,
  ProviderResponse,
  ModalityType,
} from './types.js';

/**
 * Execute a provider request
 *
 * @param provider - The provider configuration
 * @param context - The request context
 * @returns Provider response with latency and data
 */
export async function executeRequest(
  provider: UniversalProviderConfig,
  context: ProviderRequestContext
): Promise<ProviderResponse> {
  const startTime = performance.now();

  try {
    const endpoint = provider.endpoints[context.modality];
    if (!endpoint) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - startTime),
        error: `No endpoint configured for modality: ${context.modality}`,
      };
    }

    // Build full URL based on modality
    const url = buildUrl(endpoint, context.modality);

    // Build request body
    const body = buildBody(context, provider);

    // Build headers
    const headers = buildHeaders(provider, context);

    // Execute fetch
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const latencyMs = Math.round(performance.now() - startTime);

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
  const payload = context.payload as Record<string, unknown>;

  switch (context.modality) {
    case 'text':
      return {
        model: context.model,
        messages: payload.messages,
        stream: context.parameters?.stream ?? false,
        max_tokens: context.parameters?.maxTokens ?? 1024,
        temperature: context.parameters?.temperature ?? 0.7,
      };

    case 'image':
      return {
        model: context.model,
        prompt: payload.prompt,
      };

    case 'tts':
      return {
        text: payload.text,
        speed: payload.speed ?? 1.0,
      };

    case 'stt':
      return {
        audio_b64: payload.audio_b64,
        language: payload.language ?? null,
      };
  }
}

/**
 * Build headers with auth
 */
function buildHeaders(
  provider: UniversalProviderConfig,
  context: ProviderRequestContext
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...provider.defaultHeaders,
  };

  const apiKey = context.apiKeyOverride ?? provider.defaultApiKey;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * Parse response based on modality
 *
 * Returns base64 for binary responses (image/audio),
 * JSON for text responses
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
  return response.json();
}
