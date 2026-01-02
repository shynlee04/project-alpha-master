/**
 * @fileoverview Unified Workspace Provider
 * @module infrastructure/persistence/stores/workspace/workspace-provider
 * @governance Epic 51 - Platform Unification
 * @story 51-4 - Workspace State Binding
 *
 * Provider component that integrates all 5 cornerstone stores
 * and makes them available to all workspaces (IDE, Knowledge, Notes, Study).
 *
 * Replaces the fragmented IDE-only WorkspaceProvider with a unified
 * cross-workspace provider that ensures state consistency.
 *
 * @example
 * ```tsx
 * import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace'
 *
 * // Wrap the entire app or specific routes
 * <WorkspaceProvider initialWorkspace="ide">
 *     <IDEWorkspace />
 *     <KnowledgeWorkspace />
 *     <NotesWorkspace />
 *     <StudyWorkspace />
 * </WorkspaceProvider>
 * ```
 */

import { useState, useCallback, useMemo, ReactNode } from 'react';
import { WorkspaceContext, type WorkspaceContextValue } from './workspace-context';
import { useWorkspaceStore } from '@/lib/state/workspace-store';
import { useAppStore } from '../use-app-store';
import { useConversationStore } from '../conversation';
import { useRAGStore } from '../rag';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Provider props
 */
export interface WorkspaceProviderProps {
    children: ReactNode;
    initialWorkspace?: WorkspaceType;
    initialProjectId?: string | null;
}

/**
 * Workspace Provider Component
 *
 * Integrates all 5 cornerstone stores:
 * 1. LLM Providers (useAppStore)
 * 2. Agent Configuration (useAppStore)
 * 3. Conversation/Chat (useConversationStore)
 * 4. Project/Filesystem (workspace-store)
 * 5. RAG Pipeline (useRAGStore)
 *
 * @param props - Provider props
 * @returns JSX Element
 */
export function WorkspaceProvider({
    children,
    initialWorkspace,
    initialProjectId,
}: WorkspaceProviderProps) {
    // Get workspace state
    const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
    const currentProjectId = useWorkspaceStore((state) => state.currentProjectId);
    const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
    const setCurrentProject = useWorkspaceStore((state) => state.setCurrentProject);
    const isTransitioning = useWorkspaceStore((state) => state.isTransitioning);

    // Get cornerstone stores from useAppStore (providers + agents)
    const appStore = useAppStore();

    // Get conversation store
    const conversationStore = useConversationStore();

    // Get RAG store
    const ragStore = useRAGStore();

    // Initialize workspace if provided
    useState<WorkspaceType | null>(() => {
        if (initialWorkspace && currentWorkspace !== initialWorkspace) {
            setCurrentWorkspace(initialWorkspace);
        }
        if (initialProjectId && currentProjectId !== initialProjectId) {
            setCurrentProject(initialProjectId);
        }
        return null;
    });

    /**
     * Set active workspace
     */
    const handleSetActiveWorkspace = useCallback((workspace: WorkspaceType) => {
        setCurrentWorkspace(workspace);
    }, [setCurrentWorkspace]);

    /**
     * Set active project
     */
    const handleSetActiveProjectId = useCallback((id: string | null) => {
        setCurrentProject(id);
    }, [setCurrentProject]);

    /**
     * Construct context value (memoized to prevent unnecessary re-renders)
     */
    const contextValue = useMemo<WorkspaceContextValue>(
        () => ({
            // Workspace identity
            activeWorkspace: currentWorkspace,
            setActiveWorkspace: handleSetActiveWorkspace,

            // Project context
            activeProjectId: currentProjectId,
            setActiveProjectId: handleSetActiveProjectId,

            // Cornerstone 1: LLM Providers (from useAppStore)
            providers: {
                activeProviderId: appStore.activeProviderId,
                providers: appStore.providers,
                models: appStore.availableModels,
                addProvider: appStore.addProvider,
                removeProvider: appStore.removeProvider,
                setActiveProvider: appStore.setActiveProvider,
            },

            // Cornerstone 2: Agent Configuration (from useAppStore)
            agents: {
                activeAgentId: null, // TODO: Add activeAgentId to agents store
                agents: appStore.agents,
                addAgent: appStore.addAgent,
                updateAgent: appStore.updateAgent,
                removeAgent: appStore.removeAgent,
                setActiveAgent: (_id: string) => {
                    // TODO: Implement setActiveAgent
                    console.warn('[WorkspaceProvider] setActiveAgent not yet implemented');
                },
            },

            // Cornerstone 3: Conversation/Chat (from useConversationStore)
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

            // Cornerstone 5: RAG Pipeline (from useRAGStore)
            rag: {
                indexStatus: ragStore.indexStatus,
                indexMetadata: ragStore.indexMetadata,
                searchQuery: ragStore.searchQuery,
                searchResults: ragStore.searchResults,
            },
        }),
        [
            currentWorkspace,
            currentProjectId,
            isTransitioning,
            handleSetActiveWorkspace,
            handleSetActiveProjectId,
            appStore,
            conversationStore,
            ragStore,
        ]
    );

    return (
        <WorkspaceContext.Provider value={contextValue}>
            {children}
        </WorkspaceContext.Provider>
    );
}
