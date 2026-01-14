/**
 * @fileoverview Notes Workspace Route Configuration (Non-Lazy)
 * @module routes/notes.$projectId
 * @governance ARC-A04: Mobile → Notes Redirect with Toast
 *
 * This file defines the route configuration for the Notes workspace.
 * The component is loaded lazily from notes.$projectId.lazy.tsx.
 *
 * Search Parameters:
 * - reason: Optional string indicating why user was redirected here
 *   - 'mobile-not-supported': User tried to access IDE on mobile/tablet
 *
 * @note createFileRoute supports validateSearch, beforeLoad, loader.
 *       The lazy file (notes.$projectId.lazy.tsx) provides the component.
 */

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

// Search schema for redirect reasons
const notesSearchSchema = z.object({
  reason: z.enum(['mobile-not-supported']).optional(),
});

export type NotesSearchParams = z.infer<typeof notesSearchSchema>;

export const Route = createFileRoute('/notes/$projectId')({
  // Notes accessible on ALL platforms per ADR-033 - no beforeLoad guard needed
  validateSearch: notesSearchSchema,
});
