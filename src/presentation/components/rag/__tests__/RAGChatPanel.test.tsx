/**
 * @fileoverview RAGChatPanel Tests
 * @module components/rag/__tests__/RAGChatPanel
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/test-i18n';
import { RAGChatPanel } from '../RAGChatPanel';
import type { ChatMessage, Citation } from '@/lib/rag/types';

// Mock the rag-store
vi.mock('@/infrastructure/persistence/stores/rag/rag-store', () => ({
  useRAGStore: vi.fn((selector) => {
    const state = {
      chatMessages: mockMessages,
      citations: mockCitations,
      activeCitation: mockCitations['cit-1'],
      loading: false,
      error: null,
      sendMessage: vi.fn(),
      clearChat: vi.fn(),
      selectCitation: vi.fn(),
      setActiveCitation: vi.fn(),
    };
    return selector(state);
  }),
}));

const mockMessages: ChatMessage[] = [
  {
    role: 'user',
    content: 'What is machine learning?',
    timestamp: Date.now() - 60000,
  },
  {
    role: 'assistant',
    content: 'Machine learning is a subset of artificial intelligence [1] that enables systems to learn from data.',
    citations: [mockCitations['cit-1']],
    timestamp: Date.now() - 30000,
    streaming: false,
  },
];

const mockCitations: Record<string, Citation> = {
  'cit-1': {
    id: 1,
    sourceId: 'source-1',
    title: 'Introduction to ML',
    passage: 'Machine learning is a method of data analysis that automates analytical model building.',
    position: 1,
    score: 0.95,
  },
};

const renderComponent = (props: Partial<React.ComponentProps<typeof RAGChatPanel>> = {}) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <RAGChatPanel
        messages={mockMessages}
        activeCitation={mockCitations['cit-1']}
        onSendMessage={vi.fn()}
        onClearChat={vi.fn()}
        onCitationClick={vi.fn()}
        onCloseCitation={vi.fn()}
        loading={false}
        error={null}
      />
    </I18nextProvider>
  );
};

describe('RAGChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat messages', () => {
    renderComponent();
    expect(screen.getByText('What is machine learning?')).toBeInTheDocument();
    expect(screen.getByText('Machine learning is a subset')).toBeInTheDocument();
  });

  it('displays user message with correct styling', () => {
    renderComponent();
    const userMessage = screen.getByText('What is machine learning?').closest('div');
    expect(userMessage).toHaveClass('bg-primary/10');
  });

  it('displays assistant message with correct styling', () => {
    renderComponent();
    const assistantMessage = screen.getByText('Machine learning is a subset').closest('div');
    expect(assistantMessage).toHaveClass('bg-surface');
  });

  it('shows citation markers in assistant messages', () => {
    renderComponent();
    expect(screen.getByText('[1]')).toBeInTheDocument();
  });

  it('renders input field', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('rag.chat.input.placeholder')).toBeInTheDocument();
  });

  it('calls onSendMessage when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    renderComponent({ onSendMessage });
    const input = screen.getByPlaceholderText('rag.chat.input.placeholder');
    await user.type(input, 'New question{Enter}');
    expect(onSendMessage).toHaveBeenCalledWith('New question');
  });

  it('shows clear chat button when messages exist', () => {
    renderComponent();
    expect(screen.getByLabelText('rag.chat.clear', 'Clear Chat')).toBeInTheDocument();
  });

  it('displays loading state during streaming', () => {
    renderComponent({ loading: true });
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    renderComponent({ messages: [] });
    expect(screen.getByText('rag.chat.empty.title')).toBeInTheDocument();
  });

  it('displays error message', () => {
    renderComponent({ error: 'Chat failed' });
    expect(screen.getByText('Chat failed')).toBeInTheDocument();
  });

  it('handles citation click', async () => {
    const user = userEvent.setup();
    const onCitationClick = vi.fn();
    renderComponent({ onCitationClick });
    const citation = screen.getByText('[1]');
    await user.click(citation);
    expect(onCitationClick).toHaveBeenCalledWith(mockCitations['cit-1']);
  });

  it('renders with 8-bit styling (rounded-none)', () => {
    const { container } = renderComponent();
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain('rounded-none');
  });

  it('has proper border styling', () => {
    const { container } = renderComponent();
    expect(container.querySelector('.border-2')).toBeInTheDocument();
  });

  it('shows timestamp on messages', () => {
    renderComponent();
    // Messages should have some time indicator
    expect(screen.getByText(/^\d+:\d+$/)).toBeInTheDocument();
  });

  it('scrolls to bottom when new message arrives', () => {
    renderComponent();
    // The message list should auto-scroll to bottom
    const messageList = screen.getByRole('log') || screen.getByLabelText('Chat Messages');
    expect(messageList).toHaveAttribute('aria-live', 'polite');
  });
});
