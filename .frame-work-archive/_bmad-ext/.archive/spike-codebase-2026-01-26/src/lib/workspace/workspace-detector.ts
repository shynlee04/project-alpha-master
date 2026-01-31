/**
 * @fileoverview Workspace Detection Utility
 * @module lib/workspace/workspace-detector
 * @governance Ralph Loop Cycle 4
 *
 * Dynamically detects the current workspace based on URL path.
 * Replaces hardcoded 'ide' workspace references throughout the codebase.
 *
 * @example
 * ```ts
 * import { detectWorkspace } from '@/lib/workspace/workspace-detector'
 *
 * const currentWorkspace = detectWorkspace()
 * console.log('Current workspace:', currentWorkspace) // 'ide' | 'knowledge' | 'study' | 'notes'
 * ```
 */

import type { WorkspaceId } from '@/lib/events/cross-workspace-event-bus';

/**
 * Detect the current workspace based on URL path
 *
 * Checks window.location.pathname to determine which workspace the user is currently in.
 * Defaults to 'ide' if no specific workspace path is detected.
 *
 * @returns The detected workspace ID
 */
export function detectWorkspace(): WorkspaceId {
    // SSR safety check
    if (typeof window === 'undefined') {
        return 'ide';
    }

    const path = window.location.pathname;

    // Check for workspace-specific paths
    if (path.includes('/knowledge')) {
        return 'knowledge';
    }

    if (path.includes('/study')) {
        return 'study';
    }

    if (path.includes('/notes')) {
        return 'notes';
    }

    // Default to IDE workspace
    return 'ide';
}

/**
 * Check if currently in a specific workspace
 *
 * @param workspaceId - The workspace ID to check
 * @returns True if currently in the specified workspace
 */
export function isInWorkspace(workspaceId: WorkspaceId): boolean {
    return detectWorkspace() === workspaceId;
}

/**
 * Get workspace path prefix for a workspace
 *
 * @param workspaceId - The workspace ID
 * @returns The path prefix (e.g., '/knowledge' for 'knowledge' workspace)
 */
export function getWorkspacePath(workspaceId: WorkspaceId): string {
    switch (workspaceId) {
        case 'ide':
            return '/';
        case 'knowledge':
            return '/knowledge';
        case 'study':
            return '/study';
        case 'notes':
            return '/notes';
        default:
            return '/';
    }
}
