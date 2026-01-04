/**
 * @fileoverview Unified Workspace Provider - Complete Integration
 * @module infrastructure/persistence/stores/workspace/unified-workspace-provider
 * @governance ARCH-01.3 - Workspace Context Unification
 * @story ARCH-01.3 - Consolidate all workspace providers into one
 *
 * This provider unifies THREE previously separate providers:
 * 1. WorkspaceProvider (infrastructure) - 5 cornerstone stores
 * 2. WorkspaceProvider (lib/workspace) - IDE sync + file operations
 * 3. ProjectProvider (lib/workspace) - Workspace switching + project metadata
 *
 * REFACTORED (P0-2): Logic extracted into focused hooks:
 * - useCornerstoneStores.ts: Aggregates 5 Zustand stores
 * - useWorkspaceFileSystem.ts: File system operations and state
 * - useWorkspaceSwitching.ts: Workspace switching logic
 *
 * @example
 * ```tsx
 * import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace'
 *
 * // At app root (__root.tsx)
 * <WorkspaceProvider initialWorkspace="hub">
 *   <App />
 * </WorkspaceProvider>
 * ```
 */

import { useEffect, useMemo, ReactNode } from 'react';
import { UnifiedWorkspaceContext, type UnifiedWorkspaceContextValue } from './unified-workspace-context';
import { useWorkspaceStore } from './workspace-store';
import { useCornerstoneStores } from './useCornerstoneStores';
import { useWorkspaceFileSystem } from './useWorkspaceFileSystem';
import { useWorkspaceSwitching } from './useWorkspaceSwitching';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Extended workspace type including 'hub' landing page
 */
type ExtendedWorkspaceType = WorkspaceType | 'hub';

export interface UnifiedWorkspaceProviderProps {
  children: ReactNode;
  initialWorkspace?: ExtendedWorkspaceType;
  initialProjectId?: string | null;
}

/**
 * Unified Workspace Provider
 *
 * Refactored to use extracted hooks for:
 * - Cornerstone stores (providers, agents, conversations, RAG, project)
 * - File system operations (sync, openFolder, permissions)
 * - Workspace switching (switchWorkspace, navigateToWorkspace)
 */
export function UnifiedWorkspaceProvider({
  children,
  initialWorkspace,
  initialProjectId,
}: UnifiedWorkspaceProviderProps) {
  // Get workspace store setters
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  // Initialize workspace from props (only set valid WorkspaceType, not 'hub')
  useEffect(() => {
    if (initialWorkspace && initialWorkspace !== 'hub' && currentWorkspace !== initialWorkspace) {
      setCurrentWorkspace(initialWorkspace as WorkspaceType);
    }
  }, [initialWorkspace, currentWorkspace, setCurrentWorkspace]);

  // Use extracted hooks
  const fileSystem = useWorkspaceFileSystem({
    initialProjectId,
    setCurrentProject: useWorkspaceStore((s) => s.setCurrentProject),
  });

  const cornerstoneData = useCornerstoneStores();
  const workspaceSwitching = useWorkspaceSwitching(
    fileSystem.projectMetadata?.id ?? null,
    currentWorkspace
  );

  // Construct context value (combining all extracted data)
  const contextValue = useMemo<UnifiedWorkspaceContextValue>(
    () => ({
      // From cornerstone stores
      ...cornerstoneData.cornerstoneData,

      // From workspace switching
      workspaceProject: {
        project: fileSystem.projectMetadata,
        currentWorkspace: cornerstoneData.currentWorkspace,
        enabledWorkspaces: workspaceSwitching.enabledWorkspaces,
        switchWorkspace: workspaceSwitching.switchWorkspace,
      },

      // From file system
      fileSystem: {
        // State
        projectMetadata: fileSystem.projectMetadata,
        directoryHandle: fileSystem.directoryHandle,
        permissionState: fileSystem.permissionState,
        syncStatus: fileSystem.syncStatus,
        syncProgress: fileSystem.syncProgress,
        lastSyncTime: fileSystem.lastSyncTime,
        syncError: fileSystem.syncError,
        autoSync: fileSystem.autoSync,
        isOpeningFolder: fileSystem.isOpeningFolder,
        exclusionPatterns: fileSystem.exclusionPatterns,
        isWebContainerBooted: fileSystem.isWebContainerBooted,
        initialSyncCompleted: fileSystem.initialSyncCompleted,
        // Actions
        openFolder: fileSystem.openFolder,
        switchFolder: fileSystem.switchFolder,
        syncNow: fileSystem.syncNow,
        setAutoSync: fileSystem.setAutoSync,
        setExclusionPatterns: fileSystem.setExclusionPatterns,
        closeProject: fileSystem.closeProject,
        restoreAccess: fileSystem.restoreAccess,
        setIsWebContainerBooted: fileSystem.setIsWebContainerBooted,
      },

      // Infrastructure refs
      refs: {
        localAdapterRef: fileSystem.localAdapterRef,
        syncManagerRef: fileSystem.syncManagerRef,
        eventBus: fileSystem.eventBus,
      },
    }),
    [cornerstoneData, fileSystem, workspaceSwitching]
  );

  return (
    <UnifiedWorkspaceContext.Provider value={contextValue}>
      {children}
    </UnifiedWorkspaceContext.Provider>
  );
}
