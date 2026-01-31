/**
 * @fileoverview Project Workspace Route (Legacy - Redirect to Unified Route)
 * @module routes/workspace/$projectId
 * @deprecated Redirects to /$projectId (unified project route)
 * @governance Story HOOKS-FIX-01: Migrate to Unified ProjectContext
 * @updated 2026-01-25 - Changed to redirect to unified route
 *
 * Legacy workspace route for backward compatibility.
 * Now redirects to unified project route /$projectId.
 *
 * Route Pattern: /workspace/$projectId → /$projectId
 * - Maintains backward compatibility
 * - Redirects to new unified route
 * - Passes projectId parameter
 */

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/workspace/$projectId')({
    ssr: false,

    beforeLoad: ({ params }) => {
        console.warn('[WorkspaceRoute] Deprecated route /workspace/$projectId - redirecting to /$projectId');

        // Redirect to unified project route
        throw redirect({
            to: '/$projectId',
            params: { projectId: params.projectId },
            replace: true,
        });
    },
});
