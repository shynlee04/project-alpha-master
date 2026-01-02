/**
 * @fileoverview Unified Workspace Context
 * @module infrastructure/persistence/stores/workspace/workspace-context
 * @governance Epic 51 - Platform Unification
 * @story 51-4 - Workspace State Binding
 *
 * Unified React context that integrates all 5 cornerstones across workspaces:
 * 1. LLM Providers (Provider Store from useAppStore)
 * 2. Agent Configuration (Agents Store from useAppStore)
 * 3. Conversation/Chat (useConversationStore)
 * 4. Project/Filesystem (workspace-store)
 * 5. RAG Pipeline (useRAGStore)
 *
 * @example
 * ```tsx
 * import { WorkspaceProvider, useWorkspaceContext } from '@/infrastructure/persistence/stores/workspace'
 *
 * function App() {
 *     return (
 *         <WorkspaceProvider>
 *             <IDEWorkspace />
 *         </WorkspaceProvider>
 *     )
 * }
 *
 * function ChatPanel() {
 *     const { providers, agents, conversations } = useWorkspaceContext()
 *     const activeProvider = providers.activeProviderId
 *     const activeAgent = agents.activeAgentId
 *     // ... use all cornerstones seamlessly
 * }
 * ```
 */

import { createContext, useContext } from 'react';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Provider state slice (from useAppStore)
 */
interface ProviderContextSlice {
    activeProviderId: string | null;
    providers: any[];
    models: Record<string, any[]>;
    addProvider: (provider: any) => void;
    removeProvider: (id: string) => void;
    setActiveProvider: (id: string) => void;
}

/**
 * Agent state slice (from useAppStore)
 */
interface AgentContextSlice {
    activeAgentId: string | null;
    agents: any[];
    addAgent: (agent: any) => void;
    updateAgent: (id: string, updates: any) => void;
    removeAgent: (id: string) => void;
    setActiveAgent: (id: string) => void;
}

/**
 * Conversation state slice (from useConversationStore)
 */
interface ConversationContextSlice {
    activeConversationId: string | null;
    conversations: Record<string, any>;
    createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
    setActiveConversation: (id: string | null) => void;
}

/**
 * RAG state slice (from useRAGStore)
 */
interface RAGContextSlice {
    indexStatus: any;
    indexMetadata: any;
    searchQuery: string;
    searchResults: any[];
    // Note: RAG store uses different properties than initially assumed
    // This will be refined as we integrate RAG functionality
}

/**
 * Workspace context value interface
 *
 * Provides access to all 5 cornerstones + workspace state
 */
export interface WorkspaceContextValue {
    // Workspace identity
    activeWorkspace: WorkspaceType;
    setActiveWorkspace: (workspace: WorkspaceType) => void;

    // Project context
    activeProjectId: string | null;
    setActiveProjectId: (id: string | null) => void;

    // Cornerstone 1: LLM Providers (from useAppStore)
    providers: ProviderContextSlice;

    // Cornerstone 2: Agent Configuration (from useAppStore)
    agents: AgentContextSlice;

    // Cornerstone 3: Conversation/Chat (from useConversationStore)
    conversations: ConversationContextSlice;

    // Cornerstone 4: Project/Filesystem (from workspace-store)
    project: {
        currentWorkspace: WorkspaceType;
        currentProjectId: string | null;
        isTransitioning: boolean;
    };

    // Cornerstone 5: RAG Pipeline (from useRAGStore)
    rag: RAGContextSlice;
}

/**
 * Workspace context
 */
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/**
 * Hook to access workspace context
 *
 * Must be used within WorkspaceProvider.
 *
 * @throws {Error} If used outside WorkspaceProvider
 * @returns Workspace context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *     const { providers, agents } = useWorkspaceContext()
 *
 *     const currentProvider = providers.activeProviderId
 *     const currentAgent = agents.activeAgentId
 *
 *     return <div>Provider: {currentProvider}, Agent: {currentAgent}</div>
 * }
 * ```
 */
export function useWorkspaceContext(): WorkspaceContextValue {
    const context = useContext(WorkspaceContext);
    if (context === null) {
        throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
    }
    return context;
}

/**
 * Export the context for Provider consumption
 */
export { WorkspaceContext };
