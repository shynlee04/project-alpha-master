/**
 * Agent Chat Tool Facades Hook
 *
 * Creates file and terminal tool facades when workspace is ready.
 * Filters tools based on workspace type (Notes workspace gets limited tools).
 *
 * @layer Presentation
 * @hook useAgentChatToolFacades
 * @story E1-2 - Workspace-specific tool filtering
 */

import { useMemo } from 'react';
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools-impl';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools-impl';

export type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';

interface WorkspaceRefs {
    localAdapterRef: React.RefObject<any>;
    syncManagerRef: React.RefObject<any>;
    eventBus: any;
    initialSyncCompleted: boolean;
    workspaceType?: WorkspaceType;
}

interface ToolFacadesResult {
    fileTools: any;
    terminalTools: any;
}

/**
 * Hook to create tool facades when workspace is ready
 *
 * Tool availability by workspace:
 * - IDE: Full tools (file read/write, terminal execute)
 * - Notes: Read-only file tools, no terminal
 * - Knowledge: No file tools, no terminal
 * - Study: No file tools, no terminal
 */
export function useAgentChatToolFacades({
    localAdapterRef,
    syncManagerRef,
    eventBus,
    initialSyncCompleted,
    workspaceType = 'ide'
}: WorkspaceRefs): ToolFacadesResult {
    // Determine if workspace should have file tools
    const hasFileTools = workspaceType === 'ide' || workspaceType === 'notes';
    const hasTerminalTools = workspaceType === 'ide';

    // Create file tools facade when workspace is ready
    const fileTools = useMemo(() => {
        if (!hasFileTools) {
            return null;
        }

        const localAdapter = localAdapterRef.current;
        const syncManager = syncManagerRef.current;
        if (localAdapter && syncManager && eventBus) {
            console.log(`[AgentChatPanel] fileTools created - workspace: ${workspaceType}`);
            // Notes workspace gets read-only facade
            if (workspaceType === 'notes') {
                // TODO: Create read-only file tools facade
                // For now, return full facade (system prompt handles restrictions)
                return createFileToolsFacade(localAdapter, syncManager, eventBus);
            }
            return createFileToolsFacade(localAdapter, syncManager, eventBus);
        }
        console.log('[AgentChatPanel] fileTools null - waiting for workspace', {
            hasLocalAdapter: !!localAdapter,
            hasSyncManager: !!syncManager,
            hasEventBus: !!eventBus
        });
        return null;
    }, [localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted, hasFileTools, workspaceType]);

    // Create terminal tools facade (IDE workspace only)
    const terminalTools = useMemo(() => {
        if (!hasTerminalTools) {
            return null;
        }
        if (eventBus) {
            return createTerminalToolsFacade(eventBus);
        }
        return null;
    }, [eventBus, hasTerminalTools]);

    return { fileTools, terminalTools };
}
