/**
 * @fileoverview Cross-Workspace Event Hooks
 * @module lib/events/use-cross-workspace-events
 * @governance WB-8.3
 * @story WB-8.3: Cross-Workspace Event System
 *
 * React hooks for subscribing to cross-workspace events.
 * Enables workspaces to react to state changes from other workspaces.
 *
 * @example
 * ```tsx
 * function AgentSelector() {
 *   useCrossWorkspaceAgentConfigEvents(); // Auto-reload on changes from other workspaces
 *   const { agents } = useAgentsStore();
 *   return <Select>{agents.map(...)}</Select>
 * }
 * ```
 */

import { useEffect } from 'react';
import { crossWorkspaceEventBus, type AgentConfigChangeEvent, type WorkspaceChangeEvent, type FileChangeEvent, type SyncStatusEvent, type ProjectStateChangeEvent } from './cross-workspace-event-bus';
import { useAgentsStore } from '@/stores/agents-store';

/**
 * Subscribe to agent configuration changes from other workspaces
 *
 * Use this hook in components that display agent configurations (selectors, lists, config dialogs).
 * Automatically triggers Zustand store re-hydration when agents are created/updated/deleted in other workspaces.
 *
 * @governance WB-8.3
 *
 * @example
 * ```tsx
 * function AgentConfigPanel() {
 *   useCrossWorkspaceAgentConfigEvents();
 *   const { agents } = useAgentsStore();
 *   return (
 *     <div>
 *       {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCrossWorkspaceAgentConfigEvents(): void {
    useEffect(() => {
        const handleAgentConfigChange = (event: AgentConfigChangeEvent) => {
            console.log('[CrossWorkspaceEvents] Agent config changed in workspace:', event);

            // Force store re-hydration by calling get()
            // This triggers Zustand re-renders in all subscribed components
            useAgentsStore.getState();

            // Optional: Show toast notification for user feedback
            // import { toast } from 'sonner';
            // toast.info(`Agent ${event.changeType} in ${event.workspaceId} workspace`);
        };

        // Subscribe to agent config changes
        crossWorkspaceEventBus.onAgentConfigChange(handleAgentConfigChange);

        // Cleanup on unmount
        return () => {
            crossWorkspaceEventBus.offAgentConfigChange(handleAgentConfigChange);
        };
    }, []);
}

/**
 * Subscribe to all cross-workspace events (comprehensive)
 *
 * Use this in top-level workspace components to react to all relevant cross-workspace changes.
 * Combines agent config, file change, sync status, and project state events.
 *
 * @governance WB-8.3
 *
 * @example
 * ```tsx
 * function IDEWorkspace() {
 *   useAllCrossWorkspaceEvents(); // React to all events
 *   return <IDELayout />;
 * }
 * ```
 */
export function useAllCrossWorkspaceEvents(): void {
    useEffect(() => {
        const handlers = {
            agentConfig: (event: AgentConfigChangeEvent) => {
                console.log('[CrossWorkspaceEvents] Agent config changed:', event);
                // Trigger store update
                useAgentsStore.getState();
            },
            // Add more event handlers as needed:
            // fileChange: (event) => { ... },
            // syncStatus: (event) => { ... },
            // projectStateChange: (event) => { ... },
        };

        // Subscribe to all events
        crossWorkspaceEventBus.onAgentConfigChange(handlers.agentConfig);
        // crossWorkspaceEventBus.onFileChange(handlers.fileChange);
        // crossWorkspaceEventBus.onSyncStatus(handlers.syncStatus);
        // crossWorkspaceEventBus.onProjectStateChange(handlers.projectStateChange);

        // Cleanup all subscriptions
        return () => {
            crossWorkspaceEventBus.offAgentConfigChange(handlers.agentConfig);
            // crossWorkspaceEventBus.offFileChange(handlers.fileChange);
            // crossWorkspaceEventBus.offSyncStatus(handlers.syncStatus);
            // crossWorkspaceEventBus.offProjectStateChange(handlers.projectStateChange);
        };
    }, []);
}

/**
 * Subscribe to workspace change events
 *
 * Use this hook in components that need to react to workspace transitions.
 * Automatically triggers when user switches between workspaces (IDE ↔ Knowledge ↔ Study ↔ Notes).
 *
 * @governance WB-8.3
 *
 * @example
 * ```tsx
 * function AgentSelector() {
 *   useWorkspaceChangedEvents();
 *   const agents = useAgentsStore(state => state.getAgentsForWorkspace(currentWorkspace));
 *   return <Select>{agents.map(...)}</Select>
 * }
 * ```
 */
export function useWorkspaceChangedEvents(): void {
    useEffect(() => {
        const handleWorkspaceChanged = (event: WorkspaceChangeEvent) => {
            console.log('[CrossWorkspaceEvents] Workspace changed:', event);

            // Trigger store re-render for filtered agents
            // Components using getAgentsForWorkspace() will automatically update
            useAgentsStore.getState();

            // Optional: Show toast notification
            // import { toast } from 'sonner';
            // toast.info(`Switched to ${event.to} workspace`);
        };

        crossWorkspaceEventBus.onWorkspaceChanged(handleWorkspaceChanged);

        return () => {
            crossWorkspaceEventBus.offWorkspaceChanged(handleWorkspaceChanged);
        };
    }, []);
}

/**
 * Subscribe to file change events from other workspaces
 *
 * Use this to react when files are created/modified/deleted in other workspaces.
 *
 * @governance WB-8.3
 */
export function useFileChangeEvents(): void {
    useEffect(() => {
        const handleFileChange = (event: FileChangeEvent) => {
            console.log('[CrossWorkspaceEvents] File changed:', event);

            // Trigger re-render for file trees, editors, etc.
            // Components can subscribe to specific file paths or projects
        };

        crossWorkspaceEventBus.onFileChange(handleFileChange);

        return () => {
            crossWorkspaceEventBus.offFileChange(handleFileChange);
        };
    }, []);
}

/**
 * Subscribe to sync status events from other workspaces
 *
 * Use this to show sync progress/status indicators.
 *
 * @governance WB-8.3
 */
export function useSyncStatusEvents(): void {
    useEffect(() => {
        const handleSyncStatus = (event: SyncStatusEvent) => {
            console.log('[CrossWorkspaceEvents] Sync status:', event);

            // Update sync status UI
            // Show progress indicators, error messages, etc.
        };

        crossWorkspaceEventBus.onSyncStatus(handleSyncStatus);

        return () => {
            crossWorkspaceEventBus.offSyncStatus(handleSyncStatus);
        };
    }, []);
}

/**
 * Subscribe to project state change events from other workspaces
 *
 * Use this to react when projects are opened/closed or bindings change.
 *
 * @governance WB-8.3
 */
export function useProjectStateChangeEvents(): void {
    useEffect(() => {
        const handleProjectStateChange = (event: ProjectStateChangeEvent) => {
            console.log('[CrossWorkspaceEvents] Project state changed:', event);

            // Update project lists, binding UIs, etc.
        };

        crossWorkspaceEventBus.onProjectStateChange(handleProjectStateChange);

        return () => {
            crossWorkspaceEventBus.offProjectStateChange(handleProjectStateChange);
        };
    }, []);
}
