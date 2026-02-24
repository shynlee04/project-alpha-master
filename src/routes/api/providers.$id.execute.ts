/**
 * @fileoverview Provider Execute Route
 * @module routes/api/providers.$id.execute
 *
 * REST API for executing requests through providers.
 *
 * Routes:
 * - POST /api/providers/:id/execute - Execute request to provider
 *
 * @epic EPIC-PRV
 * @story PRV-04 - Backend API Endpoints
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import type {
  ProviderRequestContext,
  ModalityType,
} from '@/domain/types/llm/provider-types';
import {
  universalProviderRegistry,
  executeProviderRequest,
  buildRequestPayload,
} from '@/domain/services';

// ============================================================================
// TYPES
// ============================================================================

interface ExecuteRequestBody {
  model: string;
  modality: ModalityType;
  input: string;
  parameters?: {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  };
  apiKeyOverride?: string;
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * POST /api/providers/:id/execute - Execute request to provider
 */
async function postProviderExecute({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    const body = (await request.json()) as ExecuteRequestBody;

    // Validate required fields
    if (!body.model || !body.modality || !body.input) {
      return json({
        success: false,
        error: 'Missing required fields: model, modality, input',
      }, { status: 400 });
    }

    const provider = universalProviderRegistry.getConfig(params.id);
    if (!provider) {
      return json({
        success: false,
        error: `Provider not found: ${params.id}`,
      }, { status: 404 });
    }

    // Build request context
    const context: ProviderRequestContext = {
      providerId: params.id,
      model: body.model,
      modality: body.modality,
      payload: buildRequestPayload(body.modality, body.input),
      apiKeyOverride: body.apiKeyOverride,
      parameters: body.parameters,
    };

    // Execute request
    const result = await executeProviderRequest(context);

    return json({
      success: result.success,
      data: result.data,
      error: result.error,
      latencyMs: result.latencyMs,
    });
  } catch (error) {
    console.error('[POST /api/providers/:id/execute] Error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

// ============================================================================
// ROUTE DEFINITION
// ============================================================================

export const Route = createFileRoute('/api/providers/$id/execute')({
  server: {
    handlers: {
      POST: postProviderExecute,
    },
  },
});
