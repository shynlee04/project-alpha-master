/**
 * WorkspaceContext - Centralized state management for IDE workspace.
 *
 * @deprecated IDE-ONLY CONTEXT - DO NOT USE FOR NEW COMPONENTS
 *
 * **⚠️ LEGACY CONTEXT - IDE-ONLY USAGE ⚠️**
 *
 * This legacy WorkspaceContext is maintained for IDE-only components.
 * For all new components and cross-workspace components, use:
 *
 * ```typescript
 * import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';
 *
 * // Individual selectors (Zustand v5 pattern):
 * const projectId = useWorkspaceStore(s => s.projectId);
 * const workspaceType = useWorkspaceStore(s => s.workspaceType);
 * ```
 *
 * **Migration Guide:**
 *
 * **BEFORE (OLD context - IDE-ONLY):**
 * ```typescript
 * import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
 *
 * function MyComponent() {
 *   const { projectId, workspaceType } = useWorkspace();
 * }
 * ```
 *
 * **AFTER (NEW store - Cross-Workspace):**
 * ```typescript
 * import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';
 *
 * function MyComponent() {
 *   const projectId = useWorkspaceStore(s => s.projectId);
 *   const workspaceType = useWorkspaceStore(s => s.workspaceType);
 * }
 * ```
 *
 * **Components marked @workspace ide-only** may continue using this context:
 * - MonacoEditor.tsx
 * - AgentChatPanel.tsx
 * - FileTree.tsx
 * - AgentStatusSegment.tsx
 * - IDEHeaderBar.tsx
 * - MobileIDELayout.tsx
 *
 * @migration_guide See: `.claude/ralph-loop.local.md` Section 2
 * @workspace ide-only
 * @story 3-8: Implement Workspace Context
 * @epic Epic 51: Platform Unification (Phase 4: Corrective Assessment)
 *
 * This context provides:
 * - Workspace state (project, handle, sync status, permissions)
 * - Workspace actions (openFolder, switchFolder, syncNow, closeProject)
 * - useWorkspace() hook for component access
 */

import { createContext, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { WorkspaceContextValue, WorkspaceProviderProps } from './workspace-types';
import { useWorkspaceState } from './hooks/useWorkspaceState';
import { useSyncOperations } from './hooks/useSyncOperations';
import { useEventBusEffects } from './hooks/useEventBusEffects';
import { useInitialSync } from './hooks/useInitialSync';
import { useWorkspaceActions } from './hooks/useWorkspaceActions';
import { getProject } from './project-store';

// Re-export types for consumers
export type { WorkspaceContextValue, WorkspaceProviderProps, WorkspaceState, SyncStatus, WorkspaceActions } from './workspace-types';

// ============================================================================
// Context
// ============================================================================

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access workspace state and actions.
 *
 * @deprecated IDE-ONLY - Use useWorkspaceStore for cross-workspace components
 *
 * **⚠️ LEGACY HOOK - IDE-ONLY USAGE ⚠️**
 *
 * This hook is maintained for IDE-only components marked with `@workspace ide-only`.
 *
 * For cross-workspace components, migrate to:
 * ```typescript
 * import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';
 * ```
 *
 * Must be used within WorkspaceProvider.
 */
export function useWorkspace(): WorkspaceContextValue {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}

// ============================================================================
// Provider Component
// ============================================================================

export function WorkspaceProvider({
    children,
    initialProject = null,
    projectId,
}: WorkspaceProviderProps) {
    const navigate = useNavigate();

    // 1. Initialize State and Refs
    const { state, setters, refs } = useWorkspaceState(initialProject);

    // 1b. Load Project if missing (Fix for broken persistence)
    // Story 13-5: Ensure handle restoration
    const { setProjectMetadata, setDirectoryHandle, setAutoSyncState, setExclusionPatterns, setPermissionState } = setters;

    // Using an effect to load the project if we have an ID but no metadata
    // This allows the route to just pass the ID and let the provider hydrate
    useEffect(() => {
        if (!projectId || state.projectMetadata?.id === projectId) return;

        let active = true;
        const load = async () => {
            try {
                const project = await getProject(projectId);
                if (!active) return;

                if (project) {
                    console.log('[WorkspaceProvider] Hydrated project:', project.name);
                    setProjectMetadata(project);
                    setDirectoryHandle(project.fsaHandle);
                    setPermissionState('prompt'); // Reset to prompt just in case, verify later

                    if (project.autoSync !== undefined) {
                        setAutoSyncState(project.autoSync);
                    }
                    if (project.exclusionPatterns) {
                        setExclusionPatterns(project.exclusionPatterns);
                    }
                } else {
                    console.warn('[WorkspaceProvider] Project not found:', projectId);
                }
            } catch (err) {
                console.error('[WorkspaceProvider] Failed to load project:', err);
            }
        };
        load();
        return () => { active = false; };
    }, [projectId, state.projectMetadata?.id, setProjectMetadata, setDirectoryHandle, setAutoSyncState, setExclusionPatterns, setPermissionState]);

    // 2. Initialize Sync Operations (performSync, syncNow)
    const syncOperations = useSyncOperations(setters, refs);

    // 3. Initialize Actions (openFolder, switchFolder, etc.)
    const actions = useWorkspaceActions(
        navigate,
        state,
        setters,
        refs,
        syncOperations,
        projectId || '' // Pass empty string if undefined to satisfy type
    );

    // 4. Register Effects
    useEventBusEffects(projectId, refs.eventBusRef, refs.failedFilesRef);
    useInitialSync(state, setters, refs, syncOperations);

    const wrappedSyncNow = useCallback(() => {
        return syncOperations.syncNow(state.directoryHandle, state.syncStatus);
    }, [syncOperations.syncNow, state.directoryHandle, state.syncStatus]);

    // 5. Construct Context Value
    const value: WorkspaceContextValue = {
        projectId,
        // State
        ...state,
        // Actions
        ...actions,
        syncNow: wrappedSyncNow,
        // Story 13-2: Expose setIsWebContainerBooted for IDELayout
        setIsWebContainerBooted: setters.setIsWebContainerBooted,
        // Refs
        localAdapterRef: refs.localAdapterRef,
        syncManagerRef: refs.syncManagerRef,
        eventBus: refs.eventBusRef.current,
    };

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
}
