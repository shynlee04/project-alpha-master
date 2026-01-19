/**
 * @fileoverview useWorkspaceContext Hook
 * @module hooks/useWorkspaceContext
 * @governance Ralph Loop Cycle 5
 *
 * React hook for accessing current workspace context in components.
 * Combines workspace detector with Zustand store for seamless workspace detection.
 *
 * @example
 * ```tsx
 * import { useWorkspaceContext } from '@/hooks/useWorkspaceContext'
 *
 * function AgentStatus() {
 *     const { currentWorkspace, isInWorkspace } = useWorkspaceContext()
 *
 *     return (
 *         <div>
 *             Current workspace: {currentWorkspace}
 *             {isInWorkspace('knowledge') && <KnowledgePanel />}
 *         </div>
 *     )
 * }
 * ```
 */

import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';
import { detectWorkspace, isInWorkspace, getWorkspacePath } from '@/lib/workspace/workspace-detector';
import type { WorkspaceId } from '@/lib/events/cross-workspace-event-bus';

/**
 * Workspace context hook return value
 */
export interface WorkspaceContext {
    /** Current workspace from Zustand store */
    currentWorkspace: WorkspaceId;
    /** Check if currently in specific workspace */
    isInWorkspace: (workspaceId: WorkspaceId) => boolean;
    /** Get path prefix for workspace */
    getWorkspacePath: (workspaceId: WorkspaceId) => string;
    /** Workspace from URL detection (fallback) */
    detectedWorkspace: WorkspaceId;
}

/**
 * Hook to access current workspace context
 *
 * Uses Zustand store as primary source, with URL-based detection as fallback.
 * This ensures workspace context is available in both SSR and client-side contexts.
 *
 * @returns Workspace context object
 */
export function useWorkspaceContext(): WorkspaceContext {
    // Get workspace from Zustand store (primary source)
    const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

    // Get workspace from URL detection (fallback for non-React contexts)
    const detectedWorkspace = detectWorkspace();

    return {
        currentWorkspace: currentWorkspace || detectedWorkspace,
        isInWorkspace: (workspaceId: WorkspaceId) =>
            isInWorkspace(workspaceId) || (currentWorkspace || detectedWorkspace) === workspaceId,
        getWorkspacePath,
        detectedWorkspace,
    };
}

/**
 * Hook to get current workspace ID (convenience shorthand)
 *
 * @returns Current workspace ID
 */
export function useCurrentWorkspace(): WorkspaceId {
    const { currentWorkspace } = useWorkspaceContext();
    return currentWorkspace;
}

/**
 * Hook to check if in specific workspace (convenience shorthand)
 *
 * @param workspaceId - Workspace ID to check
 * @returns True if currently in specified workspace
 */
export function useIsInWorkspace(workspaceId: WorkspaceId): boolean {
    const { isInWorkspace } = useWorkspaceContext();
    return isInWorkspace(workspaceId);
}
