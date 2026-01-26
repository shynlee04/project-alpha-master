/**
 * @fileoverview Approval UI Tests
 * @module presentation/components/ide/__tests__
 * @governance Story 54-2 - AC8: Approval UI Usability
 *
 * Tests for permission approval UI component.
 * TDD Red Phase: All tests should fail initially.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApprovalOverlay } from '../ApprovalOverlay';

// Mock stores
vi.mock('@/infrastructure/persistence/stores/workspace/workspace-provider', () => ({
  useWorkspaceStore: vi.fn(() => ({
    workspaceType: 'ide',
  })),
}));

vi.mock('@/infrastructure/persistence/stores/agents/use-agent-selection-store', () => ({
  useAgentSelectionStore: vi.fn(() => ({
    selectedAgent: 'claude-opus',
  })),
}));

describe('Approval UI - AC8', () => {
  const mockPendingApproval = {
    id: 'approval-1',
    toolName: 'write_file',
    toolCallId: 'call-123',
    filePath: '/src/test.ts',
    operation: 'write',
    agentName: 'claude-opus',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Permission prompt shows required information', () => {
    it('should display tool name', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      expect(screen.getByText('write_file')).toBeInTheDocument();
    });

    it('should display file path', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      expect(screen.getByText('/src/test.ts')).toBeInTheDocument();
    });

    it('should display operation type', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      expect(screen.getByText(/write/i)).toBeInTheDocument();
    });

    it('should display agent name making request', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      expect(screen.getByText('claude-opus')).toBeInTheDocument();
    });

    it('should show all three required elements together', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      expect(screen.getByText('write_file')).toBeInTheDocument();
      expect(screen.getByText('/src/test.ts')).toBeInTheDocument();
      expect(screen.getByText(/write/i)).toBeInTheDocument();
    });
  });

  describe('Approve/Reject buttons clearly labeled', () => {
    it('should have Approve button', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      const approveButton = screen.getByRole('button', { name: /approve/i });
      expect(approveButton).toBeInTheDocument();
    });

    it('should have Reject button', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      expect(rejectButton).toBeInTheDocument();
    });

    it('should have clear button labels with icons', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      const approveButton = screen.getByRole('button', { name: /approve/i });
      const rejectButton = screen.getByRole('button', { name: /reject/i });

      // Should have clear visual indication (icons, colors, etc.)
      expect(approveButton).toBeVisible();
      expect(rejectButton).toBeVisible();
    });

    it('should prioritize Approve button (first in order)', () => {
      const { container } = render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      const buttons = container.querySelectorAll('button');
      expect(buttons[0]).toHaveTextContent(/approve/i);
      expect(buttons[1]).toHaveTextContent(/reject/i);
    });
  });

  describe('User can approve once or approve for session', () => {
    it('should have "Approve once" option', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      expect(screen.getByText(/Approve once/i)).toBeInTheDocument();
    });

    it('should have "Approve for session" option', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      expect(screen.getByText(/Approve for session/i)).toBeInTheDocument();
    });

    it('should call approveOnce callback when clicking Approve once', async () => {
      const onApprove = vi.fn();
      render(
        <ApprovalOverlay
          pendingApprovals={[mockPendingApproval]}
          onApprove={onApprove}
        />
      );

      const approveOnceButton = screen.getByRole('button', { name: /Approve once/i });
      fireEvent.click(approveOnceButton);

      await waitFor(() => {
        expect(onApprove).toHaveBeenCalledWith('approval-1', false);
      });
    });

    it('should call approveForSession callback when clicking Approve for session', async () => {
      const onApprove = vi.fn();
      render(
        <ApprovalOverlay
          pendingApprovals={[mockPendingApproval]}
          onApprove={onApprove}
        />
      );

      const approveSessionButton = screen.getByRole('button', { name: /Approve for session/i });
      fireEvent.click(approveSessionButton);

      await waitFor(() => {
        expect(onApprove).toHaveBeenCalledWith('approval-1', true);
      });
    });

    it('should remember session approval for same tool', async () => {
      const onApprove = vi.fn();
      const { rerender } = render(
        <ApprovalOverlay
          pendingApprovals={[mockPendingApproval]}
          onApprove={onApprove}
          sessionApprovedTools={[]}
        />
      );

      // Approve for session
      const approveSessionButton = screen.getByRole('button', { name: /Approve for session/i });
      fireEvent.click(approveSessionButton);

      await waitFor(() => {
        expect(onApprove).toHaveBeenCalled();
      });

      // Rerender with tool in session approved list
      rerender(
        <ApprovalOverlay
          pendingApprovals={[{ ...mockPendingApproval, id: 'approval-2' }]}
          onApprove={onApprove}
          sessionApprovedTools={['write_file']}
        />
      );

      // Should show auto-approved indicator
      expect(screen.getByText(/Auto-approved/i)).toBeInTheDocument();
    });
  });

  describe('Block list shows blocked operations', () => {
    const mockBlockedOperation = {
      toolName: 'delete_file',
      filePath: '/src/test.ts',
      reason: 'Destructive operation blocked',
      timestamp: Date.now(),
    };

    it('should display blocked operations list', () => {
      render(<ApprovalOverlay blockedOperations={[mockBlockedOperation]} />);

      expect(screen.getByText('delete_file')).toBeInTheDocument();
      expect(screen.getByText('blocked')).toBeInTheDocument();
    });

    it('should show reason for blocking', () => {
      render(<ApprovalOverlay blockedOperations={[mockBlockedOperation]} />);

      expect(screen.getByText(/Destructive operation blocked/i)).toBeInTheDocument();
    });

    it('should show file path for blocked operation', () => {
      render(<ApprovalOverlay blockedOperations={[mockBlockedOperation]} />);

      expect(screen.getByText('/src/test.ts')).toBeInTheDocument();
    });

    it('should have clear visual distinction between pending and blocked', () => {
      const { container } = render(
        <ApprovalOverlay
          pendingApprovals={[mockPendingApproval]}
          blockedOperations={[mockBlockedOperation]}
        />
      );

      const pendingSection = screen.getByText(/Pending/i).closest('section');
      const blockedSection = screen.getByText(/Blocked/i).closest('section');

      expect(pendingSection).toBeInTheDocument();
      expect(blockedSection).toBeInTheDocument();

      // Should be visually different (classes, styles)
      expect(pendingSection).not.toBe(blockedSection);
    });
  });

  describe('Pending approvals display in UI', () => {
    it('should show pending approvals count', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      expect(screen.getByText(/1 pending/i)).toBeInTheDocument();
    });

    it('should show multiple pending approvals count', () => {
      render(
        <ApprovalOverlay
          pendingApprovals={[
            mockPendingApproval,
            { ...mockPendingApproval, id: 'approval-2' },
            { ...mockPendingApproval, id: 'approval-3' },
          ]}
        />
      );

      expect(screen.getByText(/3 pending/i)).toBeInTheDocument();
    });

    it('should show each pending approval in list', () => {
      render(
        <ApprovalOverlay
          pendingApprovals={[
            mockPendingApproval,
            { ...mockPendingApproval, id: 'approval-2', filePath: '/src/App.tsx' },
          ]}
        />
      );

      expect(screen.getByText('/src/test.ts')).toBeInTheDocument();
      expect(screen.getByText('/src/App.tsx')).toBeInTheDocument();
    });
  });

  describe('Approved tool execution shows confirmation', () => {
    it('should show confirmation message after approval', async () => {
      const { rerender } = render(
        <ApprovalOverlay
          pendingApprovals={[]}
          recentlyApproved={[{ toolName: 'write_file', filePath: '/src/test.ts' }]}
        />
      );

      expect(screen.getByText(/write_file approved/i)).toBeInTheDocument();
      expect(screen.getByText(/\/src\/test.ts/i)).toBeInTheDocument();
    });

    it('should auto-hide confirmation after timeout', async () => {
      vi.useFakeTimers();

      render(
        <ApprovalOverlay
          pendingApprovals={[]}
          recentlyApproved={[{ toolName: 'write_file', filePath: '/src/test.ts' }]}
          confirmationTimeout={3000}
        />
      );

      expect(screen.getByText(/approved/i)).toBeInTheDocument();

      // Fast-forward past timeout
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/approved/i)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Rejected tool execution shows cancellation', () => {
    it('should show rejection message', async () => {
      const onReject = vi.fn();
      render(
        <ApprovalOverlay
          pendingApprovals={[mockPendingApproval]}
          onReject={onReject}
        />
      );

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(onReject).toHaveBeenCalledWith('approval-1');
        expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
      });
    });

    it('should show reason for rejection if provided', async () => {
      const onReject = vi.fn();

      render(
        <ApprovalOverlay
          pendingApprovals={[{ ...mockPendingApproval, reason: 'File too large' }]}
          onReject={onReject}
        />
      );

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByText(/File too large/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI responsiveness and accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(<ApprovalOverlay pendingApprovals={[mockPendingApproval]} />);

      // Tab to approve button
      await user.tab();

      const approveButton = screen.getByRole('button', { name: /approve/i });
      expect(approveButton).toHaveFocus();

      // Enter to approve
      await user.keyboard('{Enter}');

      await waitFor(() => {
        // Approval should be triggered
        expect(screen.getByText(/approved/i)).toBeInTheDocument();
      });
    });

    it('should close on Escape key', async () => {
      const onClose = vi.fn();
      render(
        <ApprovalOverlay
          pendingApprovals={[mockPendingApproval]}
          onClose={onClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
