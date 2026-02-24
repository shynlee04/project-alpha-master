/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/presentation/components/ide/AgentChatPanel.tsx
 * 
 * This component is disabled during Phase 1A. Agent chat functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

import type { ReactNode } from 'react';

console.log('[Phase 2] AgentChatPanel disabled during Phase 1A');

export type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';

interface AgentChatPanelProps {
    projectId: string | null;
    projectName?: string;
    workspaceType?: WorkspaceType;
}

export function AgentChatPanel(_props: AgentChatPanelProps): ReactNode {
    console.log('[Phase 2] AgentChatPanel feature disabled during Phase 1A');
    return null;
}

export default AgentChatPanel;
