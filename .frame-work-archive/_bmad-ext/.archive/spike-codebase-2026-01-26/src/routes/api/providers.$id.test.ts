/**
 * @fileoverview Provider Test Route
 * @module routes/api/providers.$id.test
 *
 * REST API for testing provider connections.
 *
 * Routes:
 * - POST /api/providers/:id/test - Test provider connection
 *
 * @epic EPIC-PRV
 * @story PRV-04 - Backend API Endpoints
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import { universalProviderRegistry, createProviderAdapter } from '@/domain/services';

// ============================================================================
// TYPES
// ============================================================================

interface TestConnectionBody {
  apiKey?: string;
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * POST /api/providers/:id/test - Test provider connection
 */
async function postProviderTest({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    const body = (await request.json()) as TestConnectionBody;

    const provider = universalProviderRegistry.getConfig(params.id);
    if (!provider) {
      return json({
        success: false,
        error: `Provider not found: ${params.id}`,
      }, { status: 404 });
    }

    const adapter = createProviderAdapter(params.id);

    // If API key provided in request, use it for testing only
    if (body.apiKey) {
      // Test with provided API key
      const startTime = performance.now();

      try {
        const endpoint = provider.endpoints.text;
        if (!endpoint) {
          return json({
            success: false,
            error: 'No text endpoint configured',
          });
        }

        const url = new URL(endpoint);
        url.pathname = url.pathname.replace(/\/$/, '') + '/models';

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...provider.defaultHeaders,
          'Authorization': `Bearer ${body.apiKey}`,
        };

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
        });

        const latencyMs = Math.round(performance.now() - startTime);

        // Accept 401 as valid endpoint (just needs proper key)
        if (response.ok || response.status === 401) {
          return json({
            success: true,
            data: {
              success: true,
              latencyMs,
            },
          });
        }

        const errorText = await response.text();
        return json({
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        });

      } catch (error) {
        return json({
          success: false,
          error: error instanceof Error ? error.message : 'Connection failed',
        });
      }
    }

    // Test with stored API key
    const result = await adapter.testConnection();

    return json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[POST /api/providers/:id/test] Error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

// ============================================================================
// ROUTE DEFINITION
// ============================================================================

export const Route = createFileRoute('/api/providers/$id/test')({
  // @ts-expect-error TanStack Start server.handlers types not fully exported in @tanstack/react-router 1.147.0
  server: {
    handlers: {
      POST: postProviderTest,
    },
  },
});
