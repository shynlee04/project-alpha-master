/**
 * @fileoverview Unified Workspace Context - Complete Integration
 * @module infrastructure/persistence/stores/workspace/unified-workspace-context
 * @governance ARCH-01.3 - Workspace Context Unification
 * @story ARCH-01.3 - Consolidate all workspace providers into one
 *
 * This context unifies THREE previously separate providers:
 * 1. WorkspaceProvider (infrastructure) - 5 cornerstone stores
 * 2. WorkspaceProvider (lib/workspace) - IDE sync + file operations
 * 3. ProjectProvider (lib/workspace) - Workspace switching + project metadata
 *
 * @example
 * ```tsx
 * import { WorkspaceProvider, useWorkspace, useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace'
 *
 * // At app root (__root.tsx)
 * <WorkspaceProvider>
 *   <App />
 * </WorkspaceProvider>
 *
 * // In components
 * function MyComponent() {
 *   const { projectId, workspaceType } = useWorkspace()
 *   const { syncNow, syncStatus } = useWorkspaceSync()
 *   const { activeAgent } = useWorkspaceAgent()
 * }
 * ```
 */

import { createContext, useContext, type RefObject } from 'react';
import type { WorkspaceType } from '@/domain/entities/workspace';

// Import types from canonical sources for internal use
import type { SyncStatus, SyncProgress } from '@/infrastructure/sync/types';
import type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';
import type { ProjectMetadata } from '@/infrastructure/persistence/stores/project';

// Import file system infrastructure types for refs
import type { LocalFSAdapter } from '@/infrastructure/filesystem';
import type { SyncManager } from '@/infrastructure/sync';

// Import canonical event bus type
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

// Re-export the event bus type for consumers
export type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

// Re-export types from their canonical sources
export type { SyncStatus, SyncProgress } from '@/infrastructure/sync/types';
export type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';
export type { ProjectMetadata } from '@/infrastructure/persistence/stores/project';

/**
 * Workspace state (from OLD WorkspaceProvider)
 */
export interface WorkspaceFileSystemState {
    /** Project metadata from IndexedDB */
    projectMetadata: ProjectMetadata | null;
    /** FSA directory handle for local folder */
    directoryHandle: FileSystemDirectoryHandle | null;
    /** Current permission state */
    permissionState: FsaPermissionState;
    /** Current sync status */
    syncStatus: SyncStatus;
    /** Progress during sync */
    syncProgress: SyncProgress | null;
    /** Timestamp of last successful sync */
    lastSyncTime: Date | null;
    /** Error from last sync */
    syncError: string | null;
    /** Auto-sync enabled */
    autoSync: boolean;
    /** Whether folder is being opened */
    isOpeningFolder: boolean;
    /** Exclusion patterns */
    exclusionPatterns: string[];
    /** WebContainer boot status */
    isWebContainerBooted: boolean;
    /** Initial sync complete */
    initialSyncCompleted: boolean;
}

/**
 * Workspace file system actions (from OLD WorkspaceProvider)
 */
export interface WorkspaceFileSystemActions {
    /** Open folder via picker */
    openFolder(): Promise<void>;
    /** Switch to different folder */
    switchFolder(): Promise<void>;
    /** Trigger manual sync */
    syncNow(): Promise<void>;
    /** Set auto-sync enabled */
    setAutoSync(enabled: boolean): Promise<void>;
    /** Update exclusion patterns */
    setExclusionPatterns(patterns: string[]): Promise<void>;
    /** Close project and navigate to dashboard */
    closeProject(): void;
    /** Restore access for 'prompt' state handles */
    restoreAccess(): Promise<void>;
    /** Set WebContainer boot status */
    setIsWebContainerBooted(booted: boolean): void;
}

/**
 * Refs to file system infrastructure
 */
export interface WorkspaceRefs {
    /** LocalFSAdapter instance */
    localAdapterRef: RefObject<LocalFSAdapter | null>;
    /** SyncManager instance */
    syncManagerRef: RefObject<SyncManager | null>;
    /** Workspace event bus */
    eventBus: WorkspaceEventEmitter;
}

/**
 * Provider state slice (from useAppStore)
 */
export interface ProviderContextSlice {
    activeProviderId: string | null;
    providers: any[];
    models: Record<string, any[]>;
    addProvider: (provider: any) => void;
    removeProvider: (id: string) => void;
    setActiveProvider: (id: string) => void;
}

/**
 * Agent state slice (from useAppStore + agentSelectionStore)
 */
export interface AgentContextSlice {
    activeAgentId: string | null;
    agents: any[];
    addAgent: (agent: any) => void;
    updateAgent: (id: string, updates: any) => void;
    removeAgent: (id: string) => void;
    setActiveAgent: (id: string) => void;
    getActiveAgent: () => any | null;
    getAgentForWorkspace: (workspaceType: WorkspaceType) => any | null;
}

/**
 * Conversation state slice (from useConversationStore)
 */
export interface ConversationContextSlice {
    activeConversationId: string | null;
    conversations: Record<string, any>;
    createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
    setActiveConversation: (id: string | null) => void;
}

/**
 * RAG state slice (from useRAGStore)
 */
export interface RAGContextSlice {
    indexStatus: any;
    indexMetadata: any;
    searchQuery: string;
    searchResults: any[];
}

/**
 * Project state slice (from ProjectProvider)
 */
export interface ProjectContextSlice {
    project: ProjectMetadata | null;
    currentWorkspace: WorkspaceType;
    enabledWorkspaces: WorkspaceType[];
    switchWorkspace: (workspace: WorkspaceType) => void;
}

/**
 * Unified workspace context value
 *
 * Combines:
 * - 5 cornerstone stores (providers, agents, conversations, RAG, project)
 * - IDE file system operations (sync, openFolder, etc.)
 * - Workspace switching (switchWorkspace, navigateToWorkspace)
 */
export interface UnifiedWorkspaceContextValue {
    // ========== Workspace Identity ==========
    activeWorkspace: WorkspaceType;
    setActiveWorkspace: (workspace: WorkspaceType) => void;
    activeProjectId: string | null;
    setActiveProjectId: (id: string | null) => void;

    // ========== Cornerstone 1: LLM Providers ==========
    providers: ProviderContextSlice;

    // ========== Cornerstone 2: Agent Configuration ==========
    agents: AgentContextSlice;

    // ========== Cornerstone 3: Conversation/Chat ==========
    conversations: ConversationContextSlice;

    // ========== Cornerstone 4: RAG Pipeline ==========
    rag: RAGContextSlice;

    // ========== Cornerstone 5: Project/Filesystem (from workspace-store) ==========
    project: {
        currentWorkspace: WorkspaceType;
        currentProjectId: string | null;
        isTransitioning: boolean;
    };

    // ========== Project State (from ProjectProvider) ==========
    workspaceProject: {
        project: ProjectMetadata | null;
        currentWorkspace: WorkspaceType;
        enabledWorkspaces: WorkspaceType[];
        switchWorkspace: (workspace: WorkspaceType) => void;
    };

    // ========== IDE File System Operations (from OLD WorkspaceProvider) ==========
    fileSystem: {
        // State
        projectMetadata: ProjectMetadata | null;
        directoryHandle: FileSystemDirectoryHandle | null;
        permissionState: FsaPermissionState;
        syncStatus: SyncStatus;
        syncProgress: SyncProgress | null;
        lastSyncTime: Date | null;
        syncError: string | null;
        autoSync: boolean;
        isOpeningFolder: boolean;
        exclusionPatterns: string[];
        isWebContainerBooted: boolean;
        initialSyncCompleted: boolean;
        // Actions
        openFolder: () => Promise<void>;
        switchFolder: () => Promise<void>;
        syncNow: () => Promise<void>;
        setAutoSync: (enabled: boolean) => Promise<void>;
        setExclusionPatterns: (patterns: string[]) => Promise<void>;
        closeProject: () => void;
        restoreAccess: () => Promise<void>;
        setIsWebContainerBooted: (booted: boolean) => void;
    };

    // ========== Infrastructure Refs ==========
    refs: WorkspaceRefs;
}

/**
 * Unified workspace context
 */
const UnifiedWorkspaceContext = createContext<UnifiedWorkspaceContextValue | null>(null);

/**
 * Hook to access unified workspace context
 *
 * Provides access to all 5 cornerstones + IDE file system operations + workspace switching.
 *
 * @throws {Error} If used outside WorkspaceProvider
 * @returns Unified workspace context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *     const ctx = useUnifiedWorkspaceContext()
 *
 *     // Workspace identity
 *     const { activeWorkspace, activeProjectId } = ctx
 *
 *     // Cornerstone stores
 *     const { providers, agents, conversations } = ctx
 *
 *     // IDE file system
 *     const { syncNow, openFolder, syncStatus } = ctx.fileSystem
 *
 *     // Workspace switching
 *     const { switchWorkspace } = ctx.workspaceProject
 * }
 * ```
 */
export function useUnifiedWorkspaceContext(): UnifiedWorkspaceContextValue {
    const context = useContext(UnifiedWorkspaceContext);
    if (context === null) {
        throw new Error('useUnifiedWorkspaceContext must be used within WorkspaceProvider');
    }
    return context;
}

/**
 * Export the context for Provider consumption
 */
export { UnifiedWorkspaceContext };

/**
 * Convenience hooks for specific contexts
 */

/**
 * Hook for workspace identity and project info
 */
export function useWorkspace() {
    const ctx = useUnifiedWorkspaceContext();
    return {
        activeWorkspace: ctx.activeWorkspace,
        activeProjectId: ctx.activeProjectId,
        setActiveWorkspace: ctx.setActiveWorkspace,
        setActiveProjectId: ctx.setActiveProjectId,
        projectMetadata: ctx.fileSystem.projectMetadata,
        directoryHandle: ctx.fileSystem.directoryHandle,
    };
}

/**
 * Hook for sync operations and status
 */
export function useWorkspaceSync() {
    const ctx = useUnifiedWorkspaceContext();
    return {
        // State
        syncStatus: ctx.fileSystem.syncStatus,
        syncProgress: ctx.fileSystem.syncProgress,
        lastSyncTime: ctx.fileSystem.lastSyncTime,
        syncError: ctx.fileSystem.syncError,
        autoSync: ctx.fileSystem.autoSync,
        isOpeningFolder: ctx.fileSystem.isOpeningFolder,
        projectMetadata: ctx.fileSystem.projectMetadata,
        directoryHandle: ctx.fileSystem.directoryHandle,
        permissionState: ctx.fileSystem.permissionState,
        exclusionPatterns: ctx.fileSystem.exclusionPatterns,
        isWebContainerBooted: ctx.fileSystem.isWebContainerBooted,
        initialSyncCompleted: ctx.fileSystem.initialSyncCompleted,
        // Actions
        syncNow: ctx.fileSystem.syncNow,
        setAutoSync: ctx.fileSystem.setAutoSync,
        openFolder: ctx.fileSystem.openFolder,
        switchFolder: ctx.fileSystem.switchFolder,
        closeProject: ctx.fileSystem.closeProject,
        restoreAccess: ctx.fileSystem.restoreAccess,
        setExclusionPatterns: ctx.fileSystem.setExclusionPatterns,
        setIsWebContainerBooted: ctx.fileSystem.setIsWebContainerBooted,
        // Refs
        localAdapterRef: ctx.refs.localAdapterRef,
        syncManagerRef: ctx.refs.syncManagerRef,
        eventBus: ctx.refs.eventBus,
    };
}

/**
 * Hook for agent selection and configuration
 */
export function useWorkspaceAgent() {
    const ctx = useUnifiedWorkspaceContext();
    return {
        activeAgentId: ctx.agents.activeAgentId,
        agents: ctx.agents.agents,
        setActiveAgent: ctx.agents.setActiveAgent,
        getActiveAgent: ctx.agents.getActiveAgent,
        getAgentForWorkspace: ctx.agents.getAgentForWorkspace,
    };
}

/**
 * Hook for workspace switching
 */
export function useWorkspaceSwitcher() {
    const ctx = useUnifiedWorkspaceContext();
    return {
        currentWorkspace: ctx.workspaceProject.currentWorkspace,
        enabledWorkspaces: ctx.workspaceProject.enabledWorkspaces,
        switchWorkspace: ctx.workspaceProject.switchWorkspace,
    };
}
