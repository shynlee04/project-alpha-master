/**
 * @fileoverview Provider API Key Validation Endpoint
 * @module routes/api/provider-test
 *
 * POST /api/provider/test - Validates API keys before saving to vault
 *
 * @epic EPIC-1 - API Key Flow Crisis (P0-BLOCKER)
 * @story P0-LLM-003 - Add API Key Validation Endpoint
 *
 * Request Body:
 * {
 *   providerId: string;
 *   apiKey: string;
 *   baseURL?: string; // For openai-compatible
 *   headers?: Record<string, string>; // For openai-compatible
 * }
 *
 * Response:
 * {
 *   valid: boolean;
 *   error?: string;
 *   latencyMs?: number;
 *   providerName?: string;
 * }
 *
 * ARCHITECTURE NOTE:
 * This is a server-side route. IndexedDB (credentialVault) is NOT available here.
 * The client MUST pass the API key in the request body.
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import { PROVIDERS } from '@/lib/agent/providers/types';

/**
 * Provider test request body
 */
interface ProviderTestRequest {
  providerId: string;
  apiKey: string;
  baseURL?: string;
  headers?: Record<string, string>;
}

/**
 * Provider test response
 */
interface ProviderTestResponse {
  valid: boolean;
  error?: string;
  latencyMs?: number;
  providerName?: string;
}

/**
 * Get provider base URL
 */
function getProviderBaseURL(providerId: string, customBaseURL?: string): string {
  if (customBaseURL) {
    return customBaseURL;
  }
  return PROVIDERS[providerId]?.baseURL || 'https://api.openai.com/v1';
}

/**
 * Build headers for provider test request
 */
function buildTestHeaders(
  providerId: string,
  apiKey: string,
  customHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
  };

  // OpenRouter requires HTTP-Referer
  if (providerId === 'openrouter') {
    headers['HTTP-Referer'] = 'https://via-gent.dev';
    headers['X-Title'] = 'Via-Gent';
  }

  // Custom headers for openai-compatible providers
  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  return headers;
}

/**
 * Test OpenAI-compatible provider via /models endpoint
 */
async function testOpenAICompatibleProvider(
  baseURL: string,
  headers: Record<string, string>
): Promise<{ valid: boolean; error?: string; latencyMs: number }> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${baseURL}/models`, {
      method: 'GET',
      headers,
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return { valid: true, latencyMs };
    }

    const errorText = await response.text().catch(() => 'Unknown error');
    return {
      valid: false,
      error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Network error',
      latencyMs,
    };
  }
}

/**
 * Test Anthropic provider via minimal API call
 */
async function testAnthropicProvider(
  apiKey: string,
  baseURL?: string
): Promise<{ valid: boolean; error?: string; latencyMs: number }> {
  const startTime = Date.now();
  const apiBase = baseURL || 'https://api.anthropic.com/v1';

  try {
    // Anthropic doesn't have a /models endpoint, so we make a minimal messages request
    const response = await fetch(`${apiBase}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return { valid: true, latencyMs };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || response.statusText;

    return {
      valid: false,
      error: `HTTP ${response.status}: ${errorMessage}`,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Network error',
      latencyMs,
    };
  }
}

/**
 * POST handler for /api/provider/test
 */
async function postProviderTest({ request }: { request: Request }) {
  try {
    // Parse request body
    const body = (await request.json()) as ProviderTestRequest;

    // Validate required fields
    if (!body.providerId) {
      return json<ProviderTestResponse>(
        { valid: false, error: 'providerId is required' },
        { status: 400 }
      );
    }

    if (!body.apiKey) {
      return json<ProviderTestResponse>(
        { valid: false, error: 'apiKey is required' },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = PROVIDERS[body.providerId];
    if (!provider && body.providerId !== 'openai-compatible') {
      return json<ProviderTestResponse>(
        { valid: false, error: `Unknown provider: ${body.providerId}` },
        { status: 400 }
      );
    }

    const providerName = provider?.name || 'Custom Provider';
    const baseURL = getProviderBaseURL(body.providerId, body.baseURL);
    const headers = buildTestHeaders(body.providerId, body.apiKey, body.headers);

    let result: { valid: boolean; error?: string; latencyMs: number };

    // Route to appropriate test method based on provider type
    if (provider?.type === 'anthropic' || body.providerId === 'anthropic') {
      result = await testAnthropicProvider(body.apiKey, baseURL);
    } else {
      // Default to OpenAI-compatible test
      result = await testOpenAICompatibleProvider(baseURL, headers);
    }

    return json<ProviderTestResponse>({
      valid: result.valid,
      error: result.error,
      latencyMs: result.latencyMs,
      providerName,
    });
  } catch (error) {
    console.error('[/api/provider/test] Error:', error);
    return json<ProviderTestResponse>(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * TanStack Start Server Route
 *
 * Uses server.handlers pattern for proper route registration.
 */
export const Route = createFileRoute('/api/provider-test')({
  // @ts-expect-error TanStack Start server.handlers types not fully exported in @tanstack/react-router 1.147.0
  server: {
    handlers: {
      POST: postProviderTest,
    },
  },
});
