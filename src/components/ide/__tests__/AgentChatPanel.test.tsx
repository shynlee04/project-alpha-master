
import { render, screen, fireEvent, waitFor, act, configure } from '@testing-library/react';
import { AgentChatPanel } from '../AgentChatPanel';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import React from 'react';

// Mock ResizeObserver for Radix UI
beforeAll(() => {
    configure({ defaultHidden: true });
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
    window.PointerEvent = class PointerEvent extends Event { } as any;
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'agent.title') return 'Agent';
            if (key === 'agent.welcome_message') return 'Welcome to Project';
            if (key === 'agent.clear') return 'Clear';
            if (key === 'agent.placeholder') return 'Type a message...';
            if (key === 'agent.demo_response') return 'Demo response';
            return key;
        },
    }),
}));

vi.mock('../../lib/workspace', () => ({
    getConversation: vi.fn().mockResolvedValue({ messages: [] }),
    appendConversationMessage: vi.fn().mockResolvedValue(undefined),
    clearConversation: vi.fn().mockResolvedValue(undefined),
}));

// Mock EnhancedChatInterface to avoid complex rendering
vi.mock('../EnhancedChatInterface', () => ({
    EnhancedChatInterface: ({ messages, onSendMessage }: any) => (
        <div data-testid="enhanced-chat">
            {messages.map((m: any) => (
                <div key={m.id}>{m.content}</div>
            ))}
            <button onClick={() => onSendMessage('test message')}>Send Test</button>
        </div>
    ),
    ChatMessage: {},
}));

describe('AgentChatPanel', () => {
    const mockProjectId = 'proj-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly with welcome message', async () => {
        await act(async () => {
            render(<AgentChatPanel projectId={mockProjectId} />);
        });
        expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('triggers mock approval overlay when magic wand is clicked', async () => {
        await act(async () => {
            render(<AgentChatPanel projectId={mockProjectId} />);
        });

        // Find the dev-only mock trigger button (Wand2 icon)
        const wandButton = screen.getByTitle('[DEV] Trigger Mock Approval');
        expect(wandButton).toBeInTheDocument();

        // Click it
        await act(async () => {
            fireEvent.click(wandButton);
        });

        // Verify overlay appears (ApprovalOverlay title)
        // The component uses 'chat.approvalOverlay.title'
        // Verify overlay appears (ApprovalOverlay title)
        // The component uses 'chat.approvalOverlay.title'
        expect(await screen.findByText('chat.approvalOverlay.title', { ignore: false }, { timeout: 3000 })).toBeInTheDocument();

        // Check for the description set in `triggerMockApproval`
        expect(screen.getByText('Creating new component: src/components/TestComponent.tsx', { ignore: false })).toBeInTheDocument();
    });

    it('handles approval action correctly', async () => {
        await act(async () => {
            render(<AgentChatPanel projectId={mockProjectId} />);
        });

        // Open overlay
        const wandButton = screen.getByTitle('[DEV] Trigger Mock Approval');
        await act(async () => {
            fireEvent.click(wandButton);
        });

        // Find Approve button (key: chat.approvalOverlay.approve)
        const approveButton = screen.getByRole('button', { name: 'chat.approvalOverlay.approve', hidden: true });

        // Click Approve
        await act(async () => {
            fireEvent.click(approveButton);
        });

        // Overlay should disappear
        await waitFor(() => expect(screen.queryByText('chat.approvalOverlay.title', { ignore: false })).not.toBeInTheDocument());

        // Success message should appear in chat
        expect(screen.getByText('Tool execution approved. File created successfully.')).toBeInTheDocument();
    });

    it('handles reject action correctly', async () => {
        await act(async () => {
            render(<AgentChatPanel projectId={mockProjectId} />);
        });

        // Open overlay
        const wandButton = screen.getByTitle('[DEV] Trigger Mock Approval');
        await act(async () => {
            fireEvent.click(wandButton);
        });

        // Find Reject button (key: chat.approvalOverlay.reject)
        const rejectButton = screen.getByRole('button', { name: 'chat.approvalOverlay.reject', hidden: true });

        // Click Reject
        await act(async () => {
            fireEvent.click(rejectButton);
        });

        // Overlay should disappear
        await waitFor(() => expect(screen.queryByText('chat.approvalOverlay.title', { ignore: false })).not.toBeInTheDocument());

        // Error message should appear in chat
        expect(screen.getByText('Tool execution rejected by user.')).toBeInTheDocument();
    });
});
