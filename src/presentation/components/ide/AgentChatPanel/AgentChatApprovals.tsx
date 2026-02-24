/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/presentation/components/ide/AgentChatPanel/AgentChatApprovals.tsx
 * 
 * This component is disabled during Phase 1A. Agent approval functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

import type { ReactNode } from 'react';

console.log('[Phase 2] AgentChatApprovals disabled during Phase 1A');

interface PendingApprovalInfo {
    approvalId: string;
    toolCallId: string;
    toolName: string;
    description: string;
    proposedContent?: string;
    riskLevel?: 'low' | 'medium' | 'high';
}

interface AgentChatApprovalsProps {
    pendingApprovals: PendingApprovalInfo[];
    onApprove: (approval: PendingApprovalInfo) => void;
    onReject: (approval: PendingApprovalInfo) => void;
    className?: string;
}

export function AgentChatApprovals(_props: AgentChatApprovalsProps): ReactNode {
    console.log('[Phase 2] AgentChatApprovals feature disabled during Phase 1A');
    return null;
}

export default AgentChatApprovals;
