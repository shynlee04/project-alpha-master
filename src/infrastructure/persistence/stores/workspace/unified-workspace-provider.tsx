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

import { useState, useCallback, useMemo, useRef, useEffect, ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { UnifiedWorkspaceContext, type UnifiedWorkspaceContextValue } from './unified-workspace-context';
import { useWorkspaceStore } from './workspace-store';
import { useAppStore } from '../use-app-store';
import { useConversationStore } from '../conversation';
import { useRAGStore } from '../rag';
import { useAgentSelectionStore } from '../agents/agent-selection-store';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type {
    ProjectMetadata,
    SyncStatus,
    SyncProgress,
    FsaPermissionState,
} from './unified-workspace-context';

// ============================================================================
// Imports for IDE file system operations (from OLD provider hooks)
// ============================================================================

import { LocalFSAdapter, SyncManager, type SyncResult } from '@/lib/filesystem';
import {
    getProject,
    saveProject,
    generateProjectId,
} from '@/lib/workspace/project-store';
import {
    getPermissionState,
    ensureReadWritePermission,
    saveDirectoryHandleReference,
    restorePermission,
} from '@/lib/filesystem/permission-lifecycle';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { showMobileWorkspaceError } from '@/lib/utils/mobile-error-handling';

// ============================================================================
// Types
// ============================================================================

export interface UnifiedWorkspaceProviderProps {
    children: ReactNode;
    initialWorkspace?: WorkspaceType;
    initialProjectId?: string | null;
}

// ============================================================================
// Constants
// ============================================================================

const LAST_WORKSPACE_KEY = (projectId: string) => `project_${projectId}_last_workspace`;
const DEFAULT_WORKSPACE: WorkspaceType = 'hub' as WorkspaceType;

// ============================================================================
// Helper Functions
// ============================================================================

function loadLastWorkspace(projectId: string): WorkspaceType {
    if (typeof window === 'undefined') return DEFAULT_WORKSPACE;
    try {
        const stored = localStorage.getItem(LAST_WORKSPACE_KEY(projectId));
        if (stored) {
            return stored as WorkspaceType;
        }
    } catch (error) {
        console.warn('[WorkspaceProvider] Failed to load last workspace:', error);
    }
    return DEFAULT_WORKSPACE;
}

function persistLastWorkspace(projectId: string, workspace: WorkspaceType): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LAST_WORKSPACE_KEY(projectId), workspace);
    } catch (error) {
        console.warn('[WorkspaceProvider] Failed to persist last workspace:', error);
    }
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Unified Workspace Provider
 *
 * Integrates:
 * - 5 cornerstone stores (providers, agents, conversations, RAG, project)
 * - IDE file system operations (sync, openFolder, etc.)
 * - Workspace switching (switchWorkspace, navigateToWorkspace)
 */
export function UnifiedWorkspaceProvider({
    children,
    initialWorkspace,
    initialProjectId,
}: UnifiedWorkspaceProviderProps) {
    const navigate = useNavigate();
    const deviceType = useDeviceType();

    // ========================================================================
    // Store Hooks (5 Cornerstones)
    // ========================================================================

    const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
    const currentProjectId = useWorkspaceStore((state) => state.currentProjectId);
    const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
    const setCurrentProject = useWorkspaceStore((state) => state.setCurrentProject);
    const isTransitioning = useWorkspaceStore((state) => state.isTransitioning);

    const appStore = useAppStore();
    const agentSelectionStore = useAgentSelectionStore();
    const conversationStore = useConversationStore();
    const ragStore = useRAGStore();

    // ========================================================================
    // File System State (from OLD WorkspaceProvider)
    // ========================================================================

    const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata | null>(null);
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [permissionState, setPermissionState] = useState<FsaPermissionState>('prompt');
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [autoSync, setAutoSyncState] = useState(true);
    const [isOpeningFolder, setIsOpeningFolder] = useState(false);
    const [exclusionPatterns, setExclusionPatterns] = useState<string[]>([]);
    const [isWebContainerBooted, setIsWebContainerBooted] = useState(false);
    const [initialSyncCompleted, setInitialSyncCompleted] = useState(false);

    // ========================================================================
    // Refs
    // ========================================================================

    const localAdapterRef = useRef<LocalFSAdapter | null>(null);
    const syncManagerRef = useRef<SyncManager | null>(null);
    const eventBusRef = useRef<any>(null); // WorkspaceEventEmitter

    // ========================================================================
    // Initialization Effects
    // ========================================================================

    // Initialize workspace from props
    useEffect(() => {
        if (initialWorkspace && currentWorkspace !== initialWorkspace) {
            setCurrentWorkspace(initialWorkspace);
        }
    }, [initialWorkspace, currentWorkspace, setCurrentWorkspace]);

    // Initialize project if provided
    useEffect(() => {
        if (!initialProjectId || (projectMetadata && projectMetadata.id === initialProjectId)) {
            return;
        }

        let active = true;
        const load = async () => {
            try {
                const project = await getProject(initialProjectId);
                if (!active) return;

                if (project) {
                    console.log('[WorkspaceProvider] Hydrated project:', project.name);
                    setProjectMetadata(project as ProjectMetadata);
                    setDirectoryHandle(project.fsaHandle);
                    setPermissionState('prompt');
                    if (project.autoSync !== undefined) {
                        setAutoSyncState(project.autoSync);
                    }
                    if (project.exclusionPatterns) {
                        setExclusionPatterns(project.exclusionPatterns);
                    }
                } else {
                    console.warn('[WorkspaceProvider] Project not found:', initialProjectId);
                }
            } catch (err) {
                console.error('[WorkspaceProvider] Failed to load project:', err);
            }
        };
        load();
        return () => { active = false; };
    }, [initialProjectId, projectMetadata?.id]);

    // ========================================================================
    // Sync Operations (from useSyncOperations)
    // ========================================================================

    const performSync = useCallback(
        async (handle: FileSystemDirectoryHandle, options?: { fullSync?: boolean }): Promise<boolean> => {
            const fullSync = options?.fullSync ?? true;

            try {
                let adapter = localAdapterRef.current;
                let syncManager = syncManagerRef.current;

                if (!adapter || !syncManager) {
                    adapter = new LocalFSAdapter();
                    adapter.setDirectoryHandle(handle);

                    syncManager = new SyncManager(
                        adapter,
                        {
                            onProgress: (progress: SyncProgress) => {
                                setSyncProgress(progress);
                            },
                            onError: (error: Error) => {
                                if (deviceType.isMobile || deviceType.isTablet) {
                                    showMobileWorkspaceError('openFailed');
                                    return;
                                }
                                console.warn('[Workspace] Sync error:', error.message);
                            },
                            onComplete: (result: SyncResult) => {
                                console.log('[Workspace] Sync complete:', result);
                                if (result.failedFiles.length > 0) {
                                    setSyncError(`Synced with ${result.failedFiles.length} failed files`);
                                }
                            },
                        },
                        eventBusRef.current
                    );

                    localAdapterRef.current = adapter;
                    syncManagerRef.current = syncManager;
                } else {
                    adapter.setDirectoryHandle(handle);
                }

                if (!fullSync) {
                    return true;
                }

                setSyncStatus('syncing');
                setSyncError(null);

                await syncManager.syncToWebContainer();

                setLastSyncTime(new Date());
                setSyncStatus('idle');
                setSyncProgress(null);
                return true;
            } catch (error) {
                if (deviceType.isMobile || deviceType.isTablet) {
                    showMobileWorkspaceError('openFailed');
                    setSyncError('Sync failed on mobile device');
                    setSyncStatus('error');
                    setSyncProgress(null);
                    return false;
                }
                console.error('[Workspace] Sync failed:', error);
                setSyncError(error instanceof Error ? error.message : 'Sync failed');
                setSyncStatus('error');
                setSyncProgress(null);
                return false;
            }
        },
        [deviceType]
    );

    const syncNow = useCallback(
        async (handle: FileSystemDirectoryHandle | null = directoryHandle): Promise<void> => {
            if (!handle) {
                console.warn('[Workspace] No directory handle, cannot sync');
                return;
            }

            if (syncStatus === 'syncing') {
                console.warn('[Workspace] Sync already in progress');
                return;
            }

            await performSync(handle);
        },
        [directoryHandle, syncStatus, performSync]
    );

    // ========================================================================
    // Workspace Actions (from useWorkspaceActions)
    // ========================================================================

    const openFolder = useCallback(async (): Promise<void> => {
        if (!LocalFSAdapter.isSupported()) {
            const { isMobile, isTablet } = deviceType;
            if (isMobile || isTablet) {
                showMobileWorkspaceError('openFailed');
                return;
            }
            console.warn('[Workspace] File System Access API not supported');
            return;
        }

        // If we have an existing handle, try to restore permission first
        if (directoryHandle) {
            const state = await getPermissionState(directoryHandle, 'readwrite');
            if (state === 'granted') {
                await performSync(directoryHandle, { fullSync: autoSync });
                return;
            }

            const granted = await ensureReadWritePermission(directoryHandle);
            if (granted) {
                setPermissionState('granted');
                await performSync(directoryHandle, { fullSync: autoSync });
                return;
            }
        }

        // Show directory picker
        setIsOpeningFolder(true);
        try {
            const handle = await window.showDirectoryPicker({
                mode: 'readwrite',
            });

            setDirectoryHandle(handle);
            setPermissionState('granted');

            const projectId = currentProjectId || generateProjectId();

            // Save to legacy permission-lifecycle store
            await saveDirectoryHandleReference(handle, projectId, handle.name);

            // Save to ProjectStore
            const project: ProjectMetadata = {
                id: projectId,
                name: handle.name,
                folderPath: handle.name,
                fsaHandle: handle,
                lastOpened: new Date(),
                autoSync,
            };
            await saveProject(project);
            setProjectMetadata(project);
            setCurrentProject(projectId);

            // Perform initial sync
            await performSync(handle, { fullSync: autoSync });
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                const { isMobile, isTablet } = deviceType;
                if (isMobile || isTablet) {
                    showMobileWorkspaceError('openFailed');
                    return;
                }
                console.error('[Workspace] Failed to open folder:', error);
            }
        } finally {
            setIsOpeningFolder(false);
        }
    }, [directoryHandle, performSync, currentProjectId, autoSync, deviceType, setCurrentProject]);

    const switchFolder = useCallback(async (): Promise<void> => {
        if (!LocalFSAdapter.isSupported()) {
            const { isMobile, isTablet } = deviceType;
            if (isMobile || isTablet) {
                showMobileWorkspaceError('openFailed');
                return;
            }
            console.warn('[Workspace] File System Access API not supported');
            return;
        }

        setIsOpeningFolder(true);
        try {
            const handle = await window.showDirectoryPicker({
                mode: 'readwrite',
            });

            // Clear old adapter refs
            localAdapterRef.current = null;
            syncManagerRef.current = null;

            setDirectoryHandle(handle);
            setPermissionState('granted');

            const newProjectId = generateProjectId();
            setAutoSyncState(true);

            // Save to legacy permission-lifecycle store
            await saveDirectoryHandleReference(handle, newProjectId, handle.name);

            // Save to ProjectStore
            const project: ProjectMetadata = {
                id: newProjectId,
                name: handle.name,
                folderPath: handle.name,
                fsaHandle: handle,
                lastOpened: new Date(),
                autoSync: true,
            };
            await saveProject(project);
            setProjectMetadata(project);
            setCurrentProject(newProjectId);

            // Perform sync with new folder
            await performSync(handle, { fullSync: true });

            // Navigate to new project
            navigate({ to: '/workspace/$projectId', params: { projectId: newProjectId } });
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                const { isMobile, isTablet } = deviceType;
                if (isMobile || isTablet) {
                    showMobileWorkspaceError('openFailed');
                    return;
                }
                console.error('[Workspace] Failed to switch folder:', error);
            }
        } finally {
            setIsOpeningFolder(false);
        }
    }, [navigate, performSync, setCurrentProject, deviceType]);

    const setAutoSync = useCallback(
        async (enabled: boolean): Promise<void> => {
            setAutoSyncState(enabled);

            if (!projectMetadata) return;

            const updatedProject: ProjectMetadata = {
                ...projectMetadata,
                autoSync: enabled,
            };

            const saved = await saveProject(updatedProject);
            if (saved) {
                setProjectMetadata(updatedProject);
            }
        },
        [projectMetadata]
    );

    const setExclusionPatternsFn = useCallback(
        async (patterns: string[]): Promise<void> => {
            setExclusionPatterns(patterns);

            if (syncManagerRef.current) {
                syncManagerRef.current.setExcludePatterns(patterns);
            }

            if (!projectMetadata) return;

            const updatedProject: ProjectMetadata = {
                ...projectMetadata,
                exclusionPatterns: patterns,
            };

            const saved = await saveProject(updatedProject);
            if (saved) {
                setProjectMetadata(updatedProject);
            }
        },
        [projectMetadata]
    );

    const closeProject = useCallback((): void => {
        localAdapterRef.current = null;
        syncManagerRef.current = null;
        navigate({ to: '/' });
    }, [navigate]);

    const restoreAccess = useCallback(async (): Promise<void> => {
        if (!directoryHandle) {
            console.warn('[Workspace] No directory handle to restore');
            return;
        }

        const result = await restorePermission(directoryHandle);
        setPermissionState(result);

        if (projectMetadata) {
            const updatedProject: ProjectMetadata = {
                ...projectMetadata,
                lastKnownPermissionState: result,
            };
            await saveProject(updatedProject);
            setProjectMetadata(updatedProject);
        }

        if (result === 'granted') {
            await performSync(directoryHandle, { fullSync: autoSync });
        }
    }, [directoryHandle, projectMetadata, autoSync, performSync]);

    // ========================================================================
    // Workspace Switching (from ProjectProvider)
    // ========================================================================

    const enabledWorkspaces = useMemo(() => {
        // For now, all workspaces are enabled
        // In future, this would be derived from project.bindings
        return ['hub', 'ide', 'notes', 'knowledge', 'study'] as WorkspaceType[];
    }, []);

    const switchWorkspace = useCallback(
        (newWorkspace: WorkspaceType) => {
            if (!projectMetadata?.id) {
                console.warn('[WorkspaceProvider] Cannot switch workspace: no project loaded');
                return;
            }

            if (!enabledWorkspaces.includes(newWorkspace)) {
                console.warn(
                    `[WorkspaceProvider] Cannot switch to ${newWorkspace}: workspace not enabled`
                );
                return;
            }

            console.log(`[WorkspaceProvider] Switching workspace: ${currentWorkspace} → ${newWorkspace}`);
            persistLastWorkspace(projectMetadata.id, newWorkspace);

            navigate({
                to: `/${
                    newWorkspace === 'hub' ? '' : `${newWorkspace}/`
                }$projectId`,
                params: { projectId: projectMetadata.id },
            }).catch((err) => {
                console.error('[WorkspaceProvider] Failed to switch workspace:', err);
            });
        },
        [projectMetadata, currentWorkspace, enabledWorkspaces, navigate]
    );

    // ========================================================================
    // Cornerstone Actions
    // ========================================================================

    const handleSetActiveWorkspace = useCallback((workspace: WorkspaceType) => {
        setCurrentWorkspace(workspace);
    }, [setCurrentWorkspace]);

    const handleSetActiveProjectId = useCallback((id: string | null) => {
        setCurrentProject(id);
    }, [setCurrentProject]);

    const handleSetActiveAgent = useCallback((agentId: string) => {
        if (!currentWorkspace) {
            console.warn('[WorkspaceProvider] Cannot set active agent: no current workspace');
            return;
        }
        agentSelectionStore.setActiveAgent(agentId, currentWorkspace);
    }, [currentWorkspace, agentSelectionStore]);

    // ========================================================================
    // Construct Context Value
    // ========================================================================

    const contextValue = useMemo<UnifiedWorkspaceContextValue>(
        () => ({
            // Workspace identity
            activeWorkspace: currentWorkspace,
            setActiveWorkspace: handleSetActiveWorkspace,
            activeProjectId: currentProjectId,
            setActiveProjectId: handleSetActiveProjectId,

            // Cornerstone 1: LLM Providers
            providers: {
                activeProviderId: appStore.activeProviderId,
                providers: appStore.providers,
                models: appStore.availableModels,
                addProvider: appStore.addProvider,
                removeProvider: appStore.removeProvider,
                setActiveProvider: appStore.setActiveProvider,
            },

            // Cornerstone 2: Agent Configuration
            agents: {
                activeAgentId: agentSelectionStore.activeAgentId,
                agents: appStore.agents,
                addAgent: appStore.addAgent,
                updateAgent: appStore.updateAgent,
                removeAgent: appStore.removeAgent,
                setActiveAgent: handleSetActiveAgent,
                getActiveAgent: () => agentSelectionStore.getActiveAgent(),
                getAgentForWorkspace: (workspaceType: WorkspaceType) =>
                    agentSelectionStore.getAgentForWorkspace(workspaceType),
            },

            // Cornerstone 3: Conversation/Chat
            conversations: {
                activeConversationId: conversationStore.activeConversationId,
                conversations: conversationStore.conversations,
                createConversation: conversationStore.createConversation,
                setActiveConversation: (id: string | null) => {
                    if (id !== null) {
                        conversationStore.setActiveConversation(id);
                    }
                },
            },

            // Cornerstone 4: Project/Filesystem (from workspace-store)
            project: {
                currentWorkspace,
                currentProjectId,
                isTransitioning,
            },

            // Cornerstone 5: RAG Pipeline
            rag: {
                indexStatus: ragStore.indexStatus,
                indexMetadata: ragStore.indexMetadata,
                searchQuery: ragStore.searchQuery,
                searchResults: ragStore.searchResults,
            },

            // Project State (from ProjectProvider)
            workspaceProject: {
                project: projectMetadata,
                currentWorkspace,
                enabledWorkspaces,
                switchWorkspace,
            },

            // IDE File System Operations (from OLD WorkspaceProvider)
            fileSystem: {
                // State
                projectMetadata,
                directoryHandle,
                permissionState,
                syncStatus,
                syncProgress,
                lastSyncTime,
                syncError,
                autoSync,
                isOpeningFolder,
                exclusionPatterns,
                isWebContainerBooted,
                initialSyncCompleted,
                // Actions
                openFolder,
                switchFolder,
                syncNow,
                setAutoSync,
                setExclusionPatterns: setExclusionPatternsFn,
                closeProject,
                restoreAccess,
                setIsWebContainerBooted,
            },

            // Infrastructure Refs
            refs: {
                localAdapterRef,
                syncManagerRef,
                eventBus: eventBusRef.current,
            },
        }),
        [
            currentWorkspace,
            currentProjectId,
            isTransitioning,
            handleSetActiveWorkspace,
            handleSetActiveProjectId,
            handleSetActiveAgent,
            appStore,
            agentSelectionStore,
            conversationStore,
            ragStore,
            projectMetadata,
            enabledWorkspaces,
            switchWorkspace,
            directoryHandle,
            permissionState,
            syncStatus,
            syncProgress,
            lastSyncTime,
            syncError,
            autoSync,
            isOpeningFolder,
            exclusionPatterns,
            isWebContainerBooted,
            initialSyncCompleted,
            openFolder,
            switchFolder,
            syncNow,
            setAutoSync,
            setExclusionPatternsFn,
            closeProject,
            restoreAccess,
        ]
    );

    return (
        <UnifiedWorkspaceContext.Provider value={contextValue}>
            {children}
        </UnifiedWorkspaceContext.Provider>
    );
}
