// @vitest-environment jsdom
/**
 * Unit tests for CodeBlock component
 *
 * @epic Epic-28 Story 28-20
 * @description
 * Tests for the CodeBlock component covering:
 * - Code rendering with syntax highlighting
 * - Copy button functionality
 * - Accept/Reject button callbacks
 * - Language badge display
 * - Pixel aesthetic styling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { CodeBlock } from '../CodeBlock';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallbackOrOptions?: string | object) => {
            const translations: Record<string, string> = {
                'chat.codeBlock.copy': 'Copy',
                'chat.codeBlock.copied': 'Copied!',
                'chat.codeBlock.accept': 'Accept',
                'chat.codeBlock.reject': 'Reject',
                'chat.codeBlock.accepted': 'Accepted',
                'chat.codeBlock.lines': '{{count}} lines',
            };
            if (typeof fallbackOrOptions === 'string') {
                return translations[key] || fallbackOrOptions;
            }
            return translations[key] || key;
        },
    }),
}));

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: mockWriteText,
    },
    writable: true,
});

describe('CodeBlock', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    describe('renders correctly', () => {
        it('should render code content', () => {
            render(<CodeBlock code="const x = 1;" language="typescript" />);

            expect(screen.getByText('const')).toBeTruthy();
            expect(screen.getByText('x')).toBeTruthy();
        });

        it('should display language badge', () => {
            render(<CodeBlock code="const x = 1;" language="typescript" />);

            expect(screen.getByText('TypeScript')).toBeTruthy();
        });

        it('should show line count', () => {
            const code = 'line1\nline2\nline3';
            render(<CodeBlock code={code} language="javascript" />);

            // The component shows line count in header
            expect(screen.getByText(/3 lines/i)).toBeTruthy();
        });

        it('should render with line numbers when enabled', () => {
            const code = 'line1\nline2';
            render(<CodeBlock code={code} showLineNumbers />);

            expect(screen.getByText('1')).toBeTruthy();
            expect(screen.getByText('2')).toBeTruthy();
        });

        it('should display file path when provided', () => {
            render(<CodeBlock code="code" filePath="src/App.tsx" />);

            expect(screen.getByText('src/App.tsx')).toBeTruthy();
        });
    });

    describe('copy functionality', () => {
        it('should have copy button', () => {
            render(<CodeBlock code="const x = 1;" />);

            const copyButton = screen.getByLabelText('Copy');
            expect(copyButton).toBeTruthy();
        });

        it('should copy code to clipboard when copy button clicked', async () => {
            const code = 'const x = 1;';
            render(<CodeBlock code={code} />);

            const copyButton = screen.getByLabelText('Copy');
            await fireEvent.click(copyButton);

            expect(mockWriteText).toHaveBeenCalledWith(code);
        });

        it('should call onCopy callback when provided', async () => {
            const onCopy = vi.fn();
            const code = 'const x = 1;';
            render(<CodeBlock code={code} onCopy={onCopy} />);

            const copyButton = screen.getByLabelText('Copy');
            await fireEvent.click(copyButton);

            expect(onCopy).toHaveBeenCalledWith(code);
        });
    });

    describe('accept/reject actions', () => {
        it('should show Accept button when onAccept provided', () => {
            render(<CodeBlock code="code" onAccept={() => { }} />);

            expect(screen.getByLabelText('Accept')).toBeTruthy();
        });

        it('should show Reject button when onReject provided', () => {
            render(<CodeBlock code="code" onReject={() => { }} />);

            expect(screen.getByLabelText('Reject')).toBeTruthy();
        });

        it('should not show action buttons when no callbacks provided', () => {
            render(<CodeBlock code="code" />);

            expect(screen.queryByLabelText('Accept')).toBeNull();
            expect(screen.queryByLabelText('Reject')).toBeNull();
        });

        it('should call onAccept with code when Accept clicked', () => {
            const onAccept = vi.fn();
            const code = 'const x = 1;';
            render(<CodeBlock code={code} onAccept={onAccept} />);

            fireEvent.click(screen.getByLabelText('Accept'));

            expect(onAccept).toHaveBeenCalledWith(code);
        });

        it('should call onReject when Reject clicked', () => {
            const onReject = vi.fn();
            render(<CodeBlock code="code" onReject={onReject} />);

            fireEvent.click(screen.getByLabelText('Reject'));

            expect(onReject).toHaveBeenCalled();
        });

        it('should hide component after reject', () => {
            const onReject = vi.fn();
            const { container } = render(<CodeBlock code="code" onReject={onReject} />);

            fireEvent.click(screen.getByLabelText('Reject'));

            // Component should be removed from DOM
            expect(container.firstChild).toBeNull();
        });

        it('should show accepted state after accept', () => {
            render(<CodeBlock code="code" onAccept={() => { }} />);

            fireEvent.click(screen.getByLabelText('Accept'));

            expect(screen.getByText('Accepted')).toBeTruthy();
        });
    });

    describe('syntax highlighting', () => {
        it('should highlight keywords', () => {
            render(<CodeBlock code="const let function" language="typescript" />);

            const constElement = screen.getByText('const');
            expect(constElement.className).toContain('text-purple');
        });

        it('should highlight strings', () => {
            render(<CodeBlock code='"hello world"' language="javascript" />);

            const stringElement = screen.getByText('"hello world"');
            expect(stringElement.className).toContain('text-green');
        });

        it('should highlight numbers', () => {
            render(<CodeBlock code="42" language="typescript" />);

            const numberElement = screen.getByText('42');
            expect(numberElement.className).toContain('text-orange');
        });
    });

    describe('pixel aesthetic', () => {
        it('should have squared corners (rounded-none)', () => {
            const { container } = render(<CodeBlock code="code" />);

            const codeBlock = container.firstChild as HTMLElement;
            expect(codeBlock.className).toContain('rounded-none');
        });

        it('should have pixel shadow', () => {
            const { container } = render(<CodeBlock code="code" />);

            const codeBlock = container.firstChild as HTMLElement;
            expect(codeBlock.className).toContain('shadow-');
        });
    });
});
