/**
 * @fileoverview Tool Execution Slice
 * @module infrastructure/persistence/stores/chat/slices
 * @governance EPIC-40 MM-01 | ADR-031
 *
 * Tool call tracking and approval management for unified chat store.
 * NEW: This slice adds the missing tool execution persistence from System B.
 *
 * @story MM-01: Create Unified Chat Store
 * @created 2026-01-10
 */

import { StateCreator } from 'zustand';
import type { ToolCall, ToolApproval } from '@/domain/entities/chat';
import type { CombinedUnifiedChatState, ToolCallWithId } from '../unified-chat-types';

// Slice state (subset of CombinedUnifiedChatState)
type ToolExecutionSliceState = Pick<CombinedUnifiedChatState,
  'toolCalls' | 'pendingApprovals' | 'approvalHistory'
>;

// Slice methods
type ToolExecutionSliceMethods = {
  createToolCall: (messageId: string, toolCall: Omit<ToolCall, 'id' | 'messageId' | 'createdAt'>) => string;
  updateToolCall: (toolCallId: string, updates: Partial<ToolCall>) => void;
  getToolCallsByMessage: (messageId: string) => ToolCallWithId[];
  getPendingToolCalls: () => ToolCallWithId[];
  addPendingApproval: (approval: Omit<ToolApproval, 'id' | 'createdAt'>) => string;
  approveToolCall: (approvalId: string) => void;
  denyToolCall: (approvalId: string, reason?: string) => void;
  autoApproveToolCall: (approvalId: string) => void;
  getPendingApprovals: () => ToolApproval[];
  clearPendingApprovals: () => void;
};

const generateToolCallId = () => `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateApprovalId = () => `appr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createToolExecutionSlice: StateCreator<
  CombinedUnifiedChatState,
  [],
  [],
  ToolExecutionSliceState & ToolExecutionSliceMethods
> = (set, get) => ({
  toolCalls: {},
  pendingApprovals: [],
  approvalHistory: {},

  createToolCall: (messageId, toolCall) => {
    const toolCallId = generateToolCallId();
    const now = Date.now();

    const newToolCall: ToolCallWithId = {
      id: toolCallId,
      messageId,
      ...toolCall,
      createdAt: now,
    };

    console.log('[ToolExecutionSlice] Creating tool call:', toolCallId, {
      name: toolCall.name,
      status: toolCall.status,
    });

    set((state) => ({
      toolCalls: { ...state.toolCalls, [toolCallId]: newToolCall },
    }));

    get().persistConversation();
    return toolCallId;
  },

  updateToolCall: (toolCallId, updates) => {
    const existing = get().toolCalls[toolCallId];
    if (!existing) { console.warn('[ToolExecutionSlice] Tool call not found:', toolCallId); return; }

    console.log('[ToolExecutionSlice] Updating tool call:', toolCallId, updates);
    set((state) => ({
      toolCalls: {
        ...state.toolCalls,
        [toolCallId]: {
          ...existing,
          ...updates,
          ...(updates.status === 'success' || updates.status === 'error' || updates.status === 'cancelled'
            ? { completedAt: Date.now() }
            : {}),
        },
      },
    }));
    get().persistConversation();
  },

  getToolCallsByMessage: (messageId) =>
    Object.values(get().toolCalls).filter((tc) => tc.messageId === messageId),

  getPendingToolCalls: () =>
    Object.values(get().toolCalls).filter((tc) => tc.status === 'pending'),

  addPendingApproval: (approval) => {
    const approvalId = generateApprovalId();
    const now = Date.now();

    const newApproval: ToolApproval = {
      id: approvalId,
      ...approval,
      createdAt: now,
    };

    console.log('[ToolExecutionSlice] Adding pending approval:', approvalId, {
      toolName: approval.toolName,
    });

    set((state) => ({
      pendingApprovals: [...state.pendingApprovals, newApproval],
      approvalHistory: { ...state.approvalHistory, [approvalId]: newApproval },
    }));

    return approvalId;
  },

  approveToolCall: (approvalId) => {
    const approval = get().pendingApprovals.find((a) => a.id === approvalId);
    if (!approval) { console.warn('[ToolExecutionSlice] Approval not found:', approvalId); return; }

    console.log('[ToolExecutionSlice] Approving tool call:', approvalId);
    set((state) => ({
      pendingApprovals: state.pendingApprovals.map((a) =>
        a.id === approvalId ? { ...a, status: 'approved', resolvedAt: Date.now() } : a
      ),
      approvalHistory: {
        ...state.approvalHistory,
        [approvalId]: {
          ...get().approvalHistory[approvalId],
          status: 'approved',
          resolvedAt: Date.now(),
        } as ToolApproval,
      },
    }));

    // Update associated tool call status
    get().updateToolCall(approval.toolCallId, { status: 'running' });
  },

  denyToolCall: (approvalId, reason) => {
    const approval = get().pendingApprovals.find((a) => a.id === approvalId);
    if (!approval) { console.warn('[ToolExecutionSlice] Approval not found:', approvalId); return; }

    console.log('[ToolExecutionSlice] Denying tool call:', approvalId, { reason });
    set((state) => ({
      pendingApprovals: state.pendingApprovals.map((a) =>
        a.id === approvalId ? { ...a, status: 'denied', resolvedAt: Date.now() } : a
      ),
      approvalHistory: {
        ...state.approvalHistory,
        [approvalId]: {
          ...get().approvalHistory[approvalId],
          status: 'denied',
          resolvedAt: Date.now(),
        } as ToolApproval,
      },
    }));

    // Update associated tool call status
    get().updateToolCall(approval.toolCallId, {
      status: 'error',
      error: reason || 'User denied',
    });
  },

  autoApproveToolCall: (approvalId) => {
    console.log('[ToolExecutionSlice] Auto-approving tool call:', approvalId);
    set((state) => ({
      pendingApprovals: state.pendingApprovals.map((a) =>
        a.id === approvalId ? { ...a, status: 'auto_approved', resolvedAt: Date.now() } : a
      ),
      approvalHistory: {
        ...state.approvalHistory,
        [approvalId]: {
          ...get().approvalHistory[approvalId],
          status: 'auto_approved',
          resolvedAt: Date.now(),
        } as ToolApproval,
      },
    }));

    const approval = get().approvalHistory[approvalId];
    if (approval) {
      get().updateToolCall(approval.toolCallId, { status: 'running' });
    }
  },

  getPendingApprovals: () => get().pendingApprovals,

  clearPendingApprovals: () => {
    console.log('[ToolExecutionSlice] Clearing all pending approvals');
    set({ pendingApprovals: [] });
  },
});
