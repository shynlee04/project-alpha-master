/**
 * @fileoverview Provider API Routes - Get, Update, Delete
 * @module routes/api/providers.$id
 *
 * REST API for individual provider operations.
 *
 * Routes:
 * - GET    /api/providers/:id    - Get provider by ID
 * - PUT    /api/providers/:id    - Update provider
 * - DELETE /api/providers/:id    - Remove provider
 *
 * @epic EPIC-PRV
 * @story PRV-04 - Backend API Endpoints
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import type { UniversalProviderConfig } from '@/domain/types/llm/provider-types';
import { universalProviderRegistry } from '@/domain/services';

// ============================================================================
// TYPES
// ============================================================================

interface UpdateProviderBody {
  name?: string;
  description?: string;
  endpoints?: Partial<Record<string, string>>;
  defaultHeaders?: Record<string, string>;
  models?: UniversalProviderConfig['models'];
  defaultModel?: string;
  enabled?: boolean;
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * GET /api/providers/:id - Get provider by ID
 */
async function getProviderById({ params }: { params: { id: string } }) {
  const provider = universalProviderRegistry.getConfig(params.id);

  if (!provider) {
    return json({
      success: false,
      error: `Provider not found: ${params.id}`,
    }, { status: 404 });
  }

  return json({
    success: true,
    data: provider,
  });
}

/**
 * PUT /api/providers/:id - Update provider
 */
async function putProviderById({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    const body = (await request.json()) as UpdateProviderBody;

    const existing = universalProviderRegistry.getConfig(params.id);
    if (!existing) {
      return json({
        success: false,
        error: `Provider not found: ${params.id}`,
      }, { status: 404 });
    }

    // Prevent modifying built-in providers
    if (!existing.isCustom) {
      return json({
        success: false,
        error: 'Cannot modify built-in provider',
      }, { status: 403 });
    }

    // Update provider
    const updated = universalProviderRegistry.update(params.id, body);

    if (!updated) {
      return json({
        success: false,
        error: 'Failed to update provider',
      }, { status: 500 });
    }

    return json({
      success: true,
      data: updated.config,
    });
  } catch (error) {
    console.error('[PUT /api/providers/:id] Error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/providers/:id - Remove provider
 */
async function deleteProviderById({ params }: { params: { id: string } }) {
  const existing = universalProviderRegistry.getConfig(params.id);

  if (!existing) {
    return json({
      success: false,
      error: `Provider not found: ${params.id}`,
    }, { status: 404 });
  }

  // Prevent removing built-in providers
  if (!existing.isCustom) {
    return json({
      success: false,
      error: 'Cannot remove built-in provider',
    }, { status: 403 });
  }

  const removed = universalProviderRegistry.remove(params.id);

  if (!removed) {
    return json({
      success: false,
      error: 'Failed to remove provider',
    }, { status: 500 });
  }

  return json({
    success: true,
    message: 'Provider removed successfully',
  });
}

// ============================================================================
// ROUTE DEFINITION
// ============================================================================

export const Route = createFileRoute('/api/providers/$id')({
  server: {
    handlers: {
      GET: getProviderById,
      PUT: putProviderById,
      DELETE: deleteProviderById,
    },
  },
});
