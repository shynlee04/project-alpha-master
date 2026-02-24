/**
 * @fileoverview Providers API Routes - List & Create
 * @module routes/api/providers
 *
 * REST API for listing and registering providers.
 *
 * Routes:
 * - GET    /api/providers         - List all providers
 * - POST   /api/providers         - Register new provider
 *
 * @epic EPIC-PRV
 * @story PRV-04 - Backend API Endpoints
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import type {
  UniversalProviderConfig,
  ModalityType,
} from '@/domain/types/llm/provider-types';
import { universalProviderRegistry } from '@/domain/services';

// ============================================================================
// TYPES
// ============================================================================

interface ListProvidersQuery {
  modality?: ModalityType;
  enabled?: boolean;
  custom?: boolean;
}

interface RegisterProviderBody {
  id: string;
  name: string;
  description?: string;
  endpoints: Partial<Record<ModalityType, string>>;
  requiresApiKey?: boolean;
  defaultHeaders?: Record<string, string>;
  models: Array<{
    id: string;
    name: string;
    modalities: ModalityType[];
    contextLength?: number;
    supportsStreaming?: boolean;
    isFree?: boolean;
    description?: string;
  }>;
  defaultModel?: string;
  docsUrl?: string;
  websiteUrl?: string;
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * GET /api/providers - List all providers
 */
async function getProviders({ request }: { request: Request }) {
  const url = new URL(request.url);
  const query: ListProvidersQuery = {
    modality: url.searchParams.get('modality') as ModalityType | undefined,
    enabled: url.searchParams.get('enabled') === 'true' ? true : url.searchParams.get('enabled') === 'false' ? false : undefined,
    custom: url.searchParams.get('custom') === 'true' ? true : url.searchParams.get('custom') === 'false' ? false : undefined,
  };

  const providers = universalProviderRegistry.list(query);

  return json({
    success: true,
    data: providers,
    meta: {
      count: providers.length,
      stats: universalProviderRegistry.getStats(),
    },
  });
}

/**
 * POST /api/providers - Register new provider
 */
async function postProvider({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as RegisterProviderBody;

    // Validate required fields
    if (!body.id || !body.name || !body.endpoints) {
      return json({
        success: false,
        error: 'Missing required fields: id, name, endpoints',
      }, { status: 400 });
    }

    // Check if provider already exists
    const existing = universalProviderRegistry.getConfig(body.id);
    if (existing && !existing.isCustom) {
      return json({
        success: false,
        error: 'Cannot modify built-in provider',
      }, { status: 403 });
    }

    // Create provider config
    const config: UniversalProviderConfig = {
      ...body,
      hasApiKey: false, // Will be set separately
      isCustom: true,
      enabled: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Register provider
    const entry = universalProviderRegistry.register(config);

    return json({
      success: true,
      data: entry.config,
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/providers] Error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

// ============================================================================
// ROUTE DEFINITION
// ============================================================================

export const Route = createFileRoute('/api/providers')({
  server: {
    handlers: {
      GET: getProviders,
      POST: postProvider,
    },
  },
});
