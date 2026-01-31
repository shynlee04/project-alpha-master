/**
 * @fileoverview Cornerstone Stores Hook
 * @module infrastructure/persistence/stores/workspace/useCornerstoneStores
 *
 * Aggregates the 5 cornerstone Zustand stores and provides
 * unified actions for workspace and agent management.
 *
 * Part of P0-2 refactoring: Extracted from unified-workspace-provider.tsx
 */

import { useMemo, useCallback } from 'react';
import { useWorkspaceStore } from './workspace-store';
import { useAppStore } from '../use-app-store';
import { useConversationStore } from '../conversation';
import { useRAGStore } from '../rag';
import { useAgentSelectionStore } from '../agents/agent-selection-store';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Cornerstone stores aggregation hook
 *
 * Provides access to all 5 cornerstone stores:
 * - Workspace Store (current workspace, project, transitions)
 * - App Store (LLM providers, models, agents)
 * - Agent Selection Store (active agent per workspace)
 * - Conversation Store (chat conversations)
 * - RAG Store (indexing, search)
 */
export function useCornerstoneStores() {
  // Workspace store state
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentProjectId = useWorkspaceStore((s) => s.currentProjectId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const setCurrentProject = useWorkspaceStore((s) => s.setCurrentProject);
  const isTransitioning = useWorkspaceStore((s) => s.isTransitioning);

  // Cornerstone stores
  const appStore = useAppStore();
  const agentSelectionStore = useAgentSelectionStore();
  const conversationStore = useConversationStore();
  const ragStore = useRAGStore();

  // Actions
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

  // Memoized cornerstone data for context
  const cornerstoneData = useMemo(
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

      // Cornerstone 4: Project/Filesystem
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
    ]
  );

  return {
    // State
    currentWorkspace,
    currentProjectId,
    isTransitioning,
    // Stores (for advanced use cases)
    appStore,
    agentSelectionStore,
    conversationStore,
    ragStore,
    workspaceStore: useWorkspaceStore.getState(),
    // Actions
    setActiveWorkspace: handleSetActiveWorkspace,
    setActiveProject: handleSetActiveProjectId,
    setActiveAgent: handleSetActiveAgent,
    // Aggregated data
    cornerstoneData,
  };
}
