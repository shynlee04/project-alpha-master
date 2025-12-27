/**
 * Unit tests for StreamingMessage component
 * @epic Epic-28 Story 28-23
 */

import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StreamingMessage } from '../StreamingMessage';

// Mock CodeBlock since we're testing StreamingMessage logic
vi.mock('../../chat/CodeBlock', () => ({
    CodeBlock: ({ code, language }: { code: string; language: string }) => (
        <div data-testid="code-block" data-language={language}>
            {code}
        </div>
    ),
}));

describe('StreamingMessage Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Basic Rendering', () => {
        it('should render initial empty state with data-testid', () => {
            render(<StreamingMessage content="" />);
            expect(screen.getByTestId('streaming-content')).toBeInTheDocument();
        });

        it('should render content immediately when instant=true', () => {
            render(<StreamingMessage content="Hello World" instant />);
            expect(screen.getByTestId('streaming-content')).toHaveTextContent('Hello World');
        });
    });

    describe('Streaming Behavior', () => {
        it('should stream text content character by character', async () => {
            const content = 'Hi';
            render(<StreamingMessage content={content} typingSpeed={10} />);

            const container = screen.getByTestId('streaming-content');

            // Initially empty (0 characters displayed)
            expect(container.textContent).toBe('');

            // After first timer tick
            await act(async () => {
                vi.advanceTimersByTime(10);
            });
            expect(container).toHaveTextContent('H');

            // After second timer tick
            await act(async () => {
                vi.advanceTimersByTime(10);
            });
            expect(container).toHaveTextContent('Hi');
        });

        it('should call onComplete when streaming finishes', async () => {
            const onComplete = vi.fn();
            render(<StreamingMessage content="AB" typingSpeed={10} onComplete={onComplete} />);

            // Stream all characters
            await act(async () => {
                vi.advanceTimersByTime(10); // A
            });
            await act(async () => {
                vi.advanceTimersByTime(10); // B
            });
            await act(async () => {
                vi.advanceTimersByTime(10); // Complete check
            });

            expect(onComplete).toHaveBeenCalledTimes(1);
        });

        it('should show blinking cursor while streaming', () => {
            render(<StreamingMessage content="Hello" typingSpeed={10} />);

            // Cursor should be present while streaming
            const cursor = screen.getByTestId('streaming-content').querySelector('.animate-pulse');
            expect(cursor).toBeInTheDocument();
        });
    });

    describe('Markdown Rendering', () => {
        it('should render bold text correctly', async () => {
            render(<StreamingMessage content="**Bold**" instant />);

            expect(screen.getByText('Bold')).toBeInTheDocument();
            expect(screen.getByText('Bold').tagName).toBe('STRONG');
        });

        it('should render italic text correctly', async () => {
            render(<StreamingMessage content="*Italic*" instant />);

            expect(screen.getByText('Italic')).toBeInTheDocument();
            expect(screen.getByText('Italic').tagName).toBe('EM');
        });

        it('should render inline code correctly', async () => {
            render(<StreamingMessage content="`code`" instant />);

            expect(screen.getByText('code')).toBeInTheDocument();
            expect(screen.getByText('code').tagName).toBe('CODE');
        });
    });

    describe('Code Block Integration', () => {
        it('should render code blocks using CodeBlock component', async () => {
            const content = 'Text before\n```typescript\nconst x = 1;\n```\nText after';
            render(<StreamingMessage content={content} instant />);

            expect(screen.getByText('Text before')).toBeInTheDocument();
            expect(screen.getByTestId('code-block')).toBeInTheDocument();
            expect(screen.getByTestId('code-block')).toHaveAttribute('data-language', 'typescript');
            expect(screen.getByText('const x = 1;')).toBeInTheDocument();
            expect(screen.getByText('Text after')).toBeInTheDocument();
        });

        it('should handle multiple code blocks', async () => {
            const content = '```js\na\n```\ntext\n```py\nb\n```';
            render(<StreamingMessage content={content} instant />);

            const codeBlocks = screen.getAllByTestId('code-block');
            expect(codeBlocks).toHaveLength(2);
            expect(codeBlocks[0]).toHaveAttribute('data-language', 'js');
            expect(codeBlocks[1]).toHaveAttribute('data-language', 'py');
        });
    });

    describe('Content Updates', () => {
        it('should handle content appending (streaming from backend)', async () => {
            const { rerender } = render(<StreamingMessage content="A" instant />);
            expect(screen.getByTestId('streaming-content')).toHaveTextContent('A');

            rerender(<StreamingMessage content="AB" instant />);
            expect(screen.getByTestId('streaming-content')).toHaveTextContent('AB');
        });

        it('should reset on new message (shorter content)', async () => {
            const { rerender } = render(<StreamingMessage content="Hello World" instant />);
            expect(screen.getByTestId('streaming-content')).toHaveTextContent('Hello World');

            rerender(<StreamingMessage content="New" instant />);
            expect(screen.getByTestId('streaming-content')).toHaveTextContent('New');
        });
    });
});
