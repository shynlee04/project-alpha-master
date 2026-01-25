/**
 * @fileoverview IDE Route - REDIRECT ONLY
 * @module routes/ide
 * @updated 2026-01-26
 *
 * FIX-2026-01-26: Route architecture cleanup per ADR-033.
 * 
 * ARCHITECTURE DECISION:
 * - `/ide` as a standalone route SHOULD NOT EXIST
 * - Users access IDE via `/$projectId` which uses layout-presets
 * - This route exists only to redirect legacy links to /hub
 * 
 * Flow:
 * - /ide → redirect to /hub with action=select-project
 * - /ide/$projectId → handled by $projectId.tsx route (project-centric)
 */

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/ide')({
  ssr: false,
  beforeLoad: async () => {
    console.log('[ide.tsx] Legacy route accessed, redirecting to /hub');
    throw redirect({
      to: '/hub',
      search: { action: 'select-project', workspace: 'ide' },
    });
  },
  component: () => null, // Never rendered due to redirect
});
