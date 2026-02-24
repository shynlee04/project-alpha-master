/**
 * @fileoverview IDE Project Route - Redirect to Unified Project Route
 * @module routes/ide.$projectId
 *
 * **VAL-002 FIX**: Redirects old /ide/:projectId routes to new unified /:projectId route.
 * Per ADR-034: Single Project Route architecture.
 * The IDE (Monaco) plugin is now rendered inside the unified project route based on platform defaults.
 *
 * @epic EPIC-ARCH-03
 * @story VAL-002
 * @created 2026-01-30
 */

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/ide/$projectId')({
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[IDERoute] Redirecting to unified project route:', projectId);
    
    // Redirect to unified project route
    // The IDE (Monaco) plugin will be activated by platform defaults or user preference
    throw redirect({
      to: '/$projectId',
      params: { projectId },
    });
  },
  component: () => null, // Never renders, always redirects
});
