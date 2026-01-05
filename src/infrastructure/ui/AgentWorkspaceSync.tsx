import { useEffect } from 'react';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { crossWorkspaceEventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import type { WorkspaceChangeEvent } from '@/lib/events';

/**
 * AgentWorkspaceSync Component
 *
 * S-009: Fix Agent Selection Persistence
 *
 * This component listens for workspace changes and ensures the correct agent
 * is selected for the target workspace. It acts as a bridge between the
 * routing/workspace layer and the agent selection store.
 */
export function AgentWorkspaceSync() {
    const selectAgentForWorkspace = useAgentSelectionStore(state => state.selectAgentForWorkspace);
    const _hasHydrated = useAgentSelectionStore(state => state._hasHydrated);

    useEffect(() => {
        // Handler for workspace change events
        const handleWorkspaceChange = (event: WorkspaceChangeEvent) => {
            console.log('[AgentWorkspaceSync] Workspace changed:', event.from, '->', event.to);

            // Select the agent associated with the new workspace
            // This will use the persisted 'lastSelectedAgentId' for that workspace
            if (_hasHydrated) {
                selectAgentForWorkspace(event.to);
            }
        };

        // Subscribe to workspace changes
        // Using the cross-workspace event bus which handles both local and cross-tab events
        const unsubscribe = crossWorkspaceEventBus.on(
            DomainEventType.WORKSPACE_CHANGED,
            (event: unknown) => handleWorkspaceChange(event as WorkspaceChangeEvent)
        );

        return () => {
            unsubscribe();
        };
    }, [selectAgentForWorkspace, _hasHydrated]);

    return null; // Headless component
}
