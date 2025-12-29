/**
 * @fileoverview AgentChatPanel Component Tests
 * @module components/ide/__tests__/AgentChatPanel.test
 *
 * Tests for AgentChatPanel with real useAgentChatWithTools hook integration.
 *
 * @story 25-R1 - Integrate useAgentChatWithTools to AgentChatPanel
 */

import { render, screen, fireEvent, waitFor, act, configure } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

// Mock ResizeObserver and other globals
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

beforeAll(() => {
    configure({ defaultHidden: true });
});

// Mock HTMLElement methods
if (typeof HTMLElement !== 'undefined') {
    HTMLElement.prototype.scrollIntoView = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn();
}
window.PointerEvent = class PointerEvent extends Event { } as any;

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
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

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaults?: any) => {
            if (key === 'agent.title') return 'Agent';
            if (key === 'agent.welcome_message') return `Welcome to ${defaults?.projectName || 'Project'}`;
            if (key === 'agent.clear') return 'Clear';
            if (key === 'agent.placeholder') return 'Type a message...';
            if (key === 'agent.tools_ready') return 'TOOLS READY';
            if (key === 'agent.error_generic') return 'An error occurred';
            return key;
        },
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
}));

// Mock workspace module
vi.mock('../../lib/workspace', () => ({
    getConversation: vi.fn().mockResolvedValue({ messages: [] }),
    appendConversationMessage: vi.fn().mockResolvedValue(undefined),
    clearConversation: vi.fn().mockResolvedValue(undefined),
}));

// Mock EnhancedChatInterface
vi.mock('../EnhancedChatInterface', () => ({
    EnhancedChatInterface: ({ messages, onSendMessage, isTyping }: any) => (
        <div data-testid="enhanced-chat">
            <div data-testid="messages">
                {messages.map((m: any, i: number) => (
                    <div key={m.id || i} data-testid={`message-${m.role}`}>{m.content}</div>
                ))}
            </div>
            {isTyping && <div data-testid="typing-indicator">Typing...</div>}
            <button onClick={() => onSendMessage('test message')}>Send Test</button>
        </div>
    ),
    ChatMessage: {},
    ToolExecution: {},
}));

// Mock ApprovalOverlay
vi.mock('../../chat/ApprovalOverlay', () => ({
    ApprovalOverlay: ({ isOpen, onApprove, onReject, toolName, description }: any) => (
        isOpen ? (
            <div data-testid="approval-overlay">
                <div data-testid="tool-name">{toolName}</div>
                <div data-testid="description">{description}</div>
                <button onClick={onApprove} data-testid="approve-btn">Approve</button>
                <button onClick={onReject} data-testid="reject-btn">Reject</button>
            </div>
        ) : null
    ),
}));

// Create mock functions that persist across tests
const mockSendMessage = vi.fn();
const mockApproveToolCall = vi.fn();
const mockRejectToolCall = vi.fn();

// Mock hook with factory function that can be configured per test
const mockUseAgentChatWithTools = vi.fn();

vi.mock('../../lib/agent/hooks/use-agent-chat-with-tools', () => ({
    useAgentChatWithTools: (...args: any[]) => mockUseAgentChatWithTools(...args),
}));

// Import component AFTER mocks are set up
import { AgentChatPanel } from '../AgentChatPanel';
import { WorkspaceProvider } from '../../lib/workspace';

describe('AgentChatPanel', () => {
    const mockProjectId = 'proj-123';

    // Wrapper component to provide workspace context
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <WorkspaceProvider projectId={mockProjectId}>
            {children}
        </WorkspaceProvider>
    );

    // Default return value for hook
    const getDefaultHookReturn = () => ({
        messages: [],
        rawMessages: [],
        sendMessage: mockSendMessage,
        isLoading: false,
        error: null,
        toolCalls: [],
        toolsAvailable: false,
        pendingApprovals: [],
        approveToolCall: mockApproveToolCall,
        rejectToolCall: mockRejectToolCall,
        modelId: 'meta-llama/llama-3.1-8b-instruct:free',
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Set default return value
        mockUseAgentChatWithTools.mockReturnValue(getDefaultHookReturn());
    });

    it('renders correctly with title', () => {
        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);
        expect(screen.getByText('Agent')).toBeInTheDocument();
    });

    it('renders the enhanced chat interface', () => {
        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);
        expect(screen.getByTestId('enhanced-chat')).toBeInTheDocument();
    });

    it('renders welcome message when no hook messages', () => {
        render(<Wrapper><AgentChatPanel projectId={mockProjectId} projectName="TestProject" /></Wrapper>);
        expect(screen.getByTestId('message-assistant')).toBeInTheDocument();
    });

    it('sends messages via the hook', () => {
        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);

        const sendButton = screen.getByText('Send Test');
        fireEvent.click(sendButton);

        expect(mockSendMessage).toHaveBeenCalledWith('test message');
    });

    it('shows model ID in header', () => {
        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);
        expect(screen.getByText(/llama-3.1-8b-instruct/)).toBeInTheDocument();
    });

    it('shows clear button', () => {
        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);
        expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('shows error when hook returns error', () => {
        mockUseAgentChatWithTools.mockReturnValue({
            ...getDefaultHookReturn(),
            error: new Error('API key not configured'),
        });

        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);

        expect(screen.getByText('API key not configured')).toBeInTheDocument();
    });

    it('shows approval overlay when pendingApprovals has items', () => {
        mockUseAgentChatWithTools.mockReturnValue({
            ...getDefaultHookReturn(),
            toolsAvailable: true,
            pendingApprovals: [{
                approvalId: 'approval-1',
                toolCallId: 'tool-1',
                toolName: 'write_file',
                toolArgs: { path: 'test.txt', content: 'hello' },
                riskLevel: 'medium',
                description: 'Write to file: test.txt',
                proposedContent: 'hello',
            }],
        });

        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);

        expect(screen.getByTestId('approval-overlay')).toBeInTheDocument();
        expect(screen.getByTestId('tool-name')).toHaveTextContent('write_file');
        expect(screen.getByTestId('description')).toHaveTextContent('Write to file: test.txt');
    });

    it('calls approveToolCall when approve button is clicked', () => {
        mockUseAgentChatWithTools.mockReturnValue({
            ...getDefaultHookReturn(),
            toolsAvailable: true,
            pendingApprovals: [{
                approvalId: 'approval-1',
                toolCallId: 'tool-1',
                toolName: 'write_file',
                toolArgs: {},
                riskLevel: 'medium',
                description: 'Write file',
            }],
        });

        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);

        const approveBtn = screen.getByTestId('approve-btn');
        fireEvent.click(approveBtn);

        expect(mockApproveToolCall).toHaveBeenCalledWith('tool-1');
    });

    it('calls rejectToolCall when reject button is clicked', () => {
        mockUseAgentChatWithTools.mockReturnValue({
            ...getDefaultHookReturn(),
            toolsAvailable: true,
            pendingApprovals: [{
                approvalId: 'approval-1',
                toolCallId: 'tool-1',
                toolName: 'execute_command',
                toolArgs: {},
                riskLevel: 'high',
                description: 'Run command',
            }],
        });

        render(<Wrapper><AgentChatPanel projectId={mockProjectId} /></Wrapper>);

        const rejectBtn = screen.getByTestId('reject-btn');
        fireEvent.click(rejectBtn);

        expect(mockRejectToolCall).toHaveBeenCalledWith('tool-1', 'User rejected');
    });

    it('shows typing indicator when isLoading is true', () => {
        mockUseAgentChatWithTools.mockReturnValue({
            ...getDefaultHookReturn(),
            isLoading: true,
        });

        render(<AgentChatPanel projectId={mockProjectId} />);

        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });
});
