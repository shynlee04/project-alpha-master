/**
 * @fileoverview useAgentChatApproval Hook
 * @module components/ide/hooks/useAgentChatApproval
 * @governance EPIC-31
 * @ai-observable true
 *
 * Custom hook for managing tool approvals in AgentChatPanel.
 * Handles batch approval, individual review, and auto-approve logic.
 */

import { useState, useEffect, useCallback } from 'react';
import type { PendingApprovalInfo } from '@/lib/agent/hooks/use-agent-chat-with-tools';
import { useAutoApproveStore } from '@/infrastructure/persistence/stores/auto-approve-store';

export type ApprovalMode = 'batch' | 'individual';

export interface UseAgentChatApprovalReturn {
    /** Current approval mode */
    approvalMode: ApprovalMode;
    /** Current approval index (for individual mode) */
    currentApprovalIndex: number;
    /** The current approval to display */
    currentApproval: PendingApprovalInfo | null;
    /** Approve a single tool call */
    handleApprove: (approval: PendingApprovalInfo) => void;
    /** Reject a single tool call */
    handleReject: (approval: PendingApprovalInfo) => void;
    /** Approve all pending approvals */
    handleApproveAll: () => void;
    /** Reject all pending approvals */
    handleRejectAll: () => void;
    /** Switch to review-each mode */
    handleReviewEach: () => void;
}

/**
 * Hook for managing tool approvals in AgentChatPanel
 *
 * @param pendingApprovals - List of pending tool approvals
 * @param approveToolCall - Function to approve a tool call
 * @param rejectToolCall - Function to reject a tool call
 * @returns Approval state and handlers
 */
export function useAgentChatApproval(
    pendingApprovals: PendingApprovalInfo[],
    approveToolCall: (approvalId: string, toolCallId: string) => void,
    rejectToolCall: (approvalId: string, reason: string, toolCallId: string) => void
): UseAgentChatApprovalReturn {
    const [approvalMode, setApprovalMode] = useState<ApprovalMode>('batch');
    const [currentApprovalIndex, setCurrentApprovalIndex] = useState(0);
    const { shouldAutoApprove } = useAutoApproveStore();

    // Get the current approval for the overlay
    const currentApproval = pendingApprovals.length > 0
        ? pendingApprovals[approvalMode === 'batch' ? 0 : currentApprovalIndex]
        : null;

    // Handle single approval
    const handleApprove = useCallback((approval: PendingApprovalInfo) => {
        console.log('[useAgentChatApproval] Approving tool call:', approval.toolName, 'approvalId:', approval.approvalId);
        approveToolCall(approval.approvalId, approval.toolCallId);
    }, [approveToolCall]);

    // Handle single rejection
    const handleReject = useCallback((approval: PendingApprovalInfo) => {
        console.log('[useAgentChatApproval] Rejecting tool call:', approval.toolName, 'approvalId:', approval.approvalId);
        rejectToolCall(approval.approvalId, 'User rejected', approval.toolCallId);
    }, [rejectToolCall]);

    // Handle approve all
    const handleApproveAll = useCallback(() => {
        for (const approval of pendingApprovals) {
            approveToolCall(approval.approvalId, approval.toolCallId);
        }
        setApprovalMode('batch');
        setCurrentApprovalIndex(0);
    }, [pendingApprovals, approveToolCall]);

    // Handle reject all
    const handleRejectAll = useCallback(() => {
        for (const approval of pendingApprovals) {
            rejectToolCall(approval.approvalId, 'Batch rejected by user', approval.toolCallId);
        }
        setApprovalMode('batch');
        setCurrentApprovalIndex(0);
    }, [pendingApprovals, rejectToolCall]);

    // Switch to review-each mode
    const handleReviewEach = useCallback(() => {
        setApprovalMode('individual');
        setCurrentApprovalIndex(0);
    }, []);

    // Handle individual approval in review-each mode
    useEffect(() => {
        if (approvalMode !== 'individual') return;

        const approval = pendingApprovals[currentApprovalIndex];
        if (!approval) return;

        // Auto-approve if enabled
        if (shouldAutoApprove(approval.toolName)) {
            console.log('[useAgentChatApproval] Auto-approving tool call:', approval.toolName);
            approveToolCall(approval.approvalId, approval.toolCallId);

            // Move to next or reset to batch mode if done
            if (currentApprovalIndex >= pendingApprovals.length - 1) {
                setApprovalMode('batch');
                setCurrentApprovalIndex(0);
            } else {
                setCurrentApprovalIndex(prev => prev + 1);
            }
        }
    }, [approvalMode, currentApprovalIndex, pendingApprovals, shouldAutoApprove, approveToolCall]);

    // Auto-approve effect for batch mode
    useEffect(() => {
        if (approvalMode !== 'batch') return;
        if (pendingApprovals.length === 0) return;

        for (const approval of pendingApprovals) {
            if (shouldAutoApprove(approval.toolName)) {
                console.log('[useAgentChatApproval] Auto-approving tool call:', approval.toolName);
                approveToolCall(approval.approvalId, approval.toolCallId);
            }
        }
    }, [pendingApprovals, approvalMode, shouldAutoApprove, approveToolCall]);

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
        handleApprove,
        handleReject,
        handleApproveAll,
        handleRejectAll,
        handleReviewEach,
    };
}
