/**
 * ToolFacadeProvider Component
 * Creates tool facades for agent chat interface
 * Max 120 lines
 */

import { useMemo } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools-impl';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools-impl';

interface ToolFacades {
  fileTools: ReturnType<typeof createFileToolsFacade> | null;
  terminalTools: ReturnType<typeof createTerminalToolsFacade> | null;
  isReady: boolean;
}

export function useToolFacades(): ToolFacades {
  // Get workspace context for tool facades
  const { localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted } = useWorkspace();

  // Create tool facades when workspace is ready
  // IMPORTANT: ref.current in deps doesn't trigger re-renders
  // Use initialSyncCompleted state which changes when sync completes and refs are populated
  const fileTools = useMemo(() => {
    const localAdapter = localAdapterRef.current;
    const syncManager = syncManagerRef.current;
    if (localAdapter && syncManager && eventBus) {
      console.log('[ToolFacadeProvider] fileTools created - workspace ready');
      return createFileToolsFacade(localAdapter, syncManager, eventBus);
    }
    console.log('[ToolFacadeProvider] fileTools null - waiting for workspace', {
      hasLocalAdapter: !!localAdapter,
      hasSyncManager: !!syncManager,
      hasEventBus: !!eventBus
    });
    return null;
  }, [localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted]);

  const terminalTools = useMemo(() => {
    if (eventBus) {
      return createTerminalToolsFacade(eventBus);
    }
    return null;
  }, [eventBus]);

  const isReady = fileTools !== null && terminalTools !== null;

  return {
    fileTools,
    terminalTools,
    isReady
  };
}
