/**
 * Agent Chat Approvals Hook
 *
 * Manages approval state for batch and individual approval modes.
 *
 * @layer Presentation
 * @hook useAgentChatApprovals
 */

import { useState, useEffect, useCallback } from 'react';
import type { PendingApprovalInfo } from '@/lib/agent/hooks/use-agent-chat-with-tools';

interface UseAgentChatApprovalsProps {
    pendingApprovals: PendingApprovalInfo[];
    onApprove: (approval: PendingApprovalInfo) => void;
    onReject: (approval: PendingApprovalInfo) => void;
}

interface ApprovalStateResult {
    approvalMode: 'batch' | 'individual';
    currentApprovalIndex: number;
    currentApproval: PendingApprovalInfo | null;
    handleApproveAll: () => void;
    handleRejectAll: () => void;
    handleReviewEach: () => void;
    handleApproveInReview: (approval: PendingApprovalInfo) => void;
    handleRejectInReview: (approval: PendingApprovalInfo) => void;
}

/**
 * Hook to manage approval state and handlers
 */
export function useAgentChatApprovals({
    pendingApprovals,
    onApprove,
    onReject
}: UseAgentChatApprovalsProps): ApprovalStateResult {
    const [approvalMode, setApprovalMode] = useState<'batch' | 'individual'>('batch');
    const [currentApprovalIndex, setCurrentApprovalIndex] = useState(0);

    // Get the current approval for the overlay
    const currentApproval = pendingApprovals.length > 0
        ? pendingApprovals[approvalMode === 'batch' ? 0 : currentApprovalIndex]
        : null;

    // Handle batch approval actions
    const handleApproveAll = useCallback(() => {
        for (const approval of pendingApprovals) {
            onApprove(approval);
        }
        setApprovalMode('batch');
        setCurrentApprovalIndex(0);
    }, [pendingApprovals, onApprove]);

    const handleRejectAll = useCallback(() => {
        for (const approval of pendingApprovals) {
            onReject(approval);
        }
        setApprovalMode('batch');
        setCurrentApprovalIndex(0);
    }, [pendingApprovals, onReject]);

    const handleReviewEach = useCallback(() => {
        setApprovalMode('individual');
        setCurrentApprovalIndex(0);
    }, []);

    // Handle individual approval in review-each mode
    const handleApproveInReview = useCallback((approval: PendingApprovalInfo) => {
        onApprove(approval);
        // Move to next or reset to batch mode if done
        if (currentApprovalIndex >= pendingApprovals.length - 1) {
            setApprovalMode('batch');
            setCurrentApprovalIndex(0);
        } else {
            setCurrentApprovalIndex(prev => prev + 1);
        }
    }, [onApprove, currentApprovalIndex, pendingApprovals.length]);

    const handleRejectInReview = useCallback((approval: PendingApprovalInfo) => {
        onReject(approval);
        // Move to next or reset to batch mode if done
        if (currentApprovalIndex >= pendingApprovals.length - 1) {
            setApprovalMode('batch');
            setCurrentApprovalIndex(0);
        } else {
            setCurrentApprovalIndex(prev => prev + 1);
        }
    }, [onReject, currentApprovalIndex, pendingApprovals.length]);

    // Reset approval mode when pending approvals change
    useEffect(() => {
        if (pendingApprovals.length === 0) {
            setApprovalMode('batch');
            setCurrentApprovalIndex(0);
        }
    }, [pendingApprovals.length]);

    return {
        approvalMode,
        currentApprovalIndex,
        currentApproval,
        handleApproveAll,
        handleRejectAll,
        handleReviewEach,
        handleApproveInReview,
        handleRejectInReview
    };
}
