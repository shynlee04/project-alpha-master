/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/routes/api/provider-test.ts
 * 
 * This API route is disabled during Phase 1A. Provider testing functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';

console.log('[Phase 2] API route /api/provider-test disabled during Phase 1A');

interface ProviderTestResponse {
  valid: boolean;
  error?: string;
  latencyMs?: number;
  providerName?: string;
}

async function postProviderTest() {
  return json<ProviderTestResponse>(
    { 
      valid: false, 
      error: 'Provider testing is disabled during Phase 1A' 
    },
    { status: 503 }
  );
}

export const Route = createFileRoute('/api/provider-test')({
  server: {
    handlers: {
      POST: postProviderTest,
    },
  },
});
