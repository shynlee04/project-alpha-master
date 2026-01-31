/**
 * Agent Chat Approvals Component
 *
 * Orchestrates tool approval UI with batch and individual modes.
 *
 * @layer Presentation
 * @component AgentChatApprovals
 */

import { ApprovalOverlay, BatchApprovalBar } from '../../chat';
import type { PendingApprovalInfo } from '@/lib/agent/hooks/use-agent-chat-with-tools';
import { useAgentChatApprovals } from './useAgentChatApprovals';

interface AgentChatApprovalsProps {
    pendingApprovals: PendingApprovalInfo[];
    onApprove: (approval: PendingApprovalInfo) => void;
    onReject: (approval: PendingApprovalInfo) => void;
    className?: string;
}

/**
 * Agent Chat Approvals Component
 */
export function AgentChatApprovals({
    pendingApprovals,
    onApprove,
    onReject,
    className
}: AgentChatApprovalsProps) {
    const {
        approvalMode,
        currentApprovalIndex,
        currentApproval,
        handleApproveAll,
        handleRejectAll,
        handleReviewEach,
        handleApproveInReview,
        handleRejectInReview
    } = useAgentChatApprovals({
        pendingApprovals,
        onApprove,
        onReject
    });

    if (!currentApproval) {
        return null;
    }

    return (
        <>
            {/* Batch Approval Bar - shown when multiple approvals pending */}
            {pendingApprovals.length > 1 && (
                <BatchApprovalBar
                    pendingApprovals={pendingApprovals}
                    onApproveAll={handleApproveAll}
                    onRejectAll={handleRejectAll}
                    onReviewEach={handleReviewEach}
                    mode={approvalMode}
                    currentIndex={currentApprovalIndex}
                    className={className}
                />
            )}

            {/* Approval Overlay - triggered by real pending approvals */}
            {currentApproval && (approvalMode === 'individual' || pendingApprovals.length === 1) && (
                <ApprovalOverlay
                    isOpen={true}
                    onApprove={() => approvalMode === 'individual'
                        ? handleApproveInReview(currentApproval)
                        : onApprove(currentApproval)
                    }
                    onReject={() => approvalMode === 'individual'
                        ? handleRejectInReview(currentApproval)
                        : onReject(currentApproval)
                    }
                    toolName={currentApproval.toolName}
                    description={currentApproval.description}
                    code={currentApproval.proposedContent}
                    mode="inline"
                    riskLevel={currentApproval.riskLevel}
                />
            )}
        </>
    );
}
