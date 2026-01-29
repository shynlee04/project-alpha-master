/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/presentation/components/ide/AgentsPanel.tsx
 * 
 * This component is disabled during Phase 1A. Agents panel functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

import type { ReactNode } from 'react';

console.log('[Phase 2] AgentsPanel disabled during Phase 1A');

interface AgentData {
    id: string;
    name: string;
    description: string;
    modelId: string;
    status: 'active' | 'inactive' | 'error';
}

interface AgentsPanelProps {
    onSelectAgent?: (agent: AgentData) => void;
}

export function AgentsPanel(_props: AgentsPanelProps): ReactNode {
    console.log('[Phase 2] AgentsPanel feature disabled during Phase 1A');
    return null;
}

export type { AgentData };
export default AgentsPanel;
