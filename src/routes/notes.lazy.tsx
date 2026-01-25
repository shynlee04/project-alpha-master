/**
 * @fileoverview Notes Route - REDIRECT ONLY
 * @module routes/notes
 * @updated 2026-01-26
 *
 * FIX-2026-01-26: Route architecture cleanup per ADR-033.
 * 
 * ARCHITECTURE DECISION:
 * - `/notes` as a standalone route SHOULD NOT EXIST
 * - Users access Notes via `/$projectId` which uses layout-presets
 * - This route exists only to redirect legacy links to /hub
 * 
 * Flow:
 * - /notes → redirect to /hub with action=select-project
 * - /notes/$projectId → handled by notes.$projectId.tsx route
 */

import { createLazyFileRoute, redirect } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/notes')({
  component: () => {
    // Immediate redirect via effect (lazy routes can't use beforeLoad)
    if (typeof window !== 'undefined') {
      console.log('[notes.lazy.tsx] Legacy route accessed, redirecting to /hub');
      window.location.href = '/hub?action=select-project&workspace=notes';
    }
    return null;
  },
});
