/**
 * Agent Chat Tool Facades Hook
 *
 * Creates file and terminal tool facades when workspace is ready.
 *
 * @layer Presentation
 * @hook useAgentChatToolFacades
 */

import { useMemo } from 'react';
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools-impl';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools-impl';

interface WorkspaceRefs {
    localAdapterRef: React.RefObject<any>;
    syncManagerRef: React.RefObject<any>;
    eventBus: any;
    initialSyncCompleted: boolean;
}

interface ToolFacadesResult {
    fileTools: any;
    terminalTools: any;
}

/**
 * Hook to create tool facades when workspace is ready
 */
export function useAgentChatToolFacades({
    localAdapterRef,
    syncManagerRef,
    eventBus,
    initialSyncCompleted
}: WorkspaceRefs): ToolFacadesResult {
    // Create file tools facade when workspace is ready
    const fileTools = useMemo(() => {
        const localAdapter = localAdapterRef.current;
        const syncManager = syncManagerRef.current;
        if (localAdapter && syncManager && eventBus) {
            console.log('[AgentChatPanel] fileTools created - workspace ready');
            return createFileToolsFacade(localAdapter, syncManager, eventBus);
        }
        console.log('[AgentChatPanel] fileTools null - waiting for workspace', {
            hasLocalAdapter: !!localAdapter,
            hasSyncManager: !!syncManager,
            hasEventBus: !!eventBus
        });
        return null;
    }, [localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted]);

    // Create terminal tools facade
    const terminalTools = useMemo(() => {
        if (eventBus) {
            return createTerminalToolsFacade(eventBus);
        }
        return null;
    }, [eventBus]);

    return { fileTools, terminalTools };
}
