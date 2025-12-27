// @vitest-environment jsdom
/**
 * Unit tests for ApprovalOverlay component
 *
 * @epic Epic-28 Story 28-22
 * @description
 * Tests for the ApprovalOverlay component covering:
 * - Modal rendering with approval dialog
 * - Fullscreen vs inline mode support
 * - Risk level visualization
 * - Approve/reject button interactions
 * - Integration with CodeBlock and DiffPreview components
 * - i18n key rendering
 * - Keyboard shortcuts (Enter to approve, Escape to reject)
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor, configure } from '@testing-library/react';
import { ApprovalOverlay } from '../ApprovalOverlay';
import { CodeBlock } from '../CodeBlock';
import { DiffPreview } from '../DiffPreview';

// Mock ResizeObserver for Radix UI
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

// Mock the dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => {
            const translations: Record<string, string> = {
                'chat.approvalOverlay.title': 'Approve Changes',
                'chat.approvalOverlay.close': 'Close',
                'chat.approvalOverlay.description': 'Description',
                'chat.approvalOverlay.codePreview': 'Code Preview',
                'chat.approvalOverlay.changesPreview': 'Changes Preview',
                'chat.approvalOverlay.warning.title': 'Warning',
                'chat.approvalOverlay.warning.message': 'This action cannot be undone',
                'chat.approvalOverlay.reject': 'Reject',
                'chat.approvalOverlay.approve': 'Approve',
                'chat.approvalOverlay.processing': 'Processing...',
                'chat.approvalOverlay.risk.high': 'High Risk',
                'chat.approvalOverlay.risk.medium': 'Medium Risk',
                'chat.approvalOverlay.risk.low': 'Low Risk',
            };
            return translations[key] || fallback || key;
        },
    }),
}));

vi.mock('../CodeBlock', () => ({
    CodeBlock: ({ code, language }: { code: string; language?: string }) => (
        <div data-testid="mock-code-block">
            <pre>{code}</pre>
            {language && <span className="language">{language}</span>}
        </div>
    ),
}));

vi.mock('../DiffPreview', () => ({
    DiffPreview: ({ oldCode, newCode }: { oldCode: string; newCode: string }) => (
        <div data-testid="mock-diff-preview">
            <div className="original">{oldCode}</div>
            <div className="modified">{newCode}</div>
        </div>
    ),
}));

vi.mock('lucide-react', () => ({
    X: () => <div data-testid="icon-x" />,
    CheckCircle: () => <div data-testid="icon-check" />,
    XCircle: () => <div data-testid="icon-x-circle" />,
    AlertTriangle: () => <div data-testid="icon-alert" />,
    Wand2: () => <div data-testid="icon-wand" />
}));

describe('ApprovalOverlay', () => {
    const mockOnApprove = vi.fn();
    const mockOnReject = vi.fn();

    const defaultProps = {
        isOpen: true,
        onApprove: mockOnApprove,
        onReject: mockOnReject,
        toolName: 'write_file',
        description: 'This will create a new file',
        mode: 'fullscreen' as const,
        riskLevel: 'medium' as const,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Rendering', () => {
        it('should render with basic props in fullscreen mode', async () => {
            render(<ApprovalOverlay {...defaultProps} />);

            // Debug the DOM to see what is rendering
            screen.debug();

            expect(await screen.findByRole('heading', { name: /Approve Changes/i, hidden: true }, { timeout: 3000 })).toBeInTheDocument();
            expect(screen.getByText((content, element) => content.includes('write_file'), { ignore: false })).toBeInTheDocument();
            expect(screen.getByText((content, element) => content.includes('Medium Risk'), { ignore: false })).toBeInTheDocument();
            expect(screen.getByText('This will create a new file', { ignore: false })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Approve/i, hidden: true })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Reject/i, hidden: true })).toBeInTheDocument();
        });

        it('should render in inline mode', () => {
            render(<ApprovalOverlay {...defaultProps} mode="inline" />);

            expect(screen.getByText('Approve Changes')).toBeInTheDocument();
        });

        it('should not render when isOpen is false in inline mode', () => {
            render(<ApprovalOverlay {...defaultProps} isOpen={false} mode="inline" />);

            expect(screen.queryByText('Approve Changes')).not.toBeInTheDocument();
        });

        it('should render with code preview', () => {
            const testCode = 'const test = "hello world";';
            render(
                <ApprovalOverlay
                    {...defaultProps}
                    code={testCode}
                />
            );

            expect(screen.getByText('Code Preview')).toBeInTheDocument();
            expect(screen.getByTestId('mock-code-block')).toBeInTheDocument();
            expect(screen.getByTestId('mock-code-block')).toHaveTextContent(testCode);
        });

        it('should render with diff preview', () => {
            const oldCode = 'const x = 1;';
            const newCode = 'const x = 2;';
            render(
                <ApprovalOverlay
                    {...defaultProps}
                    oldCode={oldCode}
                    newCode={newCode}
                />
            );

            expect(screen.getByText('Changes Preview')).toBeInTheDocument();
            expect(screen.getByTestId('mock-diff-preview')).toBeInTheDocument();
        });

        it('should display correct risk level colors', () => {
            const { rerender } = render(<ApprovalOverlay {...defaultProps} riskLevel="low" />);
            expect(screen.getByText((content, element) => content.includes('Low Risk'), { ignore: false })).toBeInTheDocument();

            rerender(<ApprovalOverlay {...defaultProps} riskLevel="high" />);
            expect(screen.getByText('High Risk', { ignore: false, exact: false })).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call onApprove when approve button is clicked', () => {
            render(<ApprovalOverlay {...defaultProps} />);

            const approveButton = screen.getByRole('button', { name: /Approve/i, hidden: true });
            fireEvent.click(approveButton);

            expect(mockOnApprove).toHaveBeenCalledTimes(1);
        });

        it('should call onReject when reject button is clicked', () => {
            render(<ApprovalOverlay {...defaultProps} />);

            const rejectButton = screen.getByRole('button', { name: /Reject/i, hidden: true });
            fireEvent.click(rejectButton);

            expect(mockOnReject).toHaveBeenCalledTimes(1);
        });

        it('should handle keyboard shortcuts', () => {
            render(<ApprovalOverlay {...defaultProps} />);

            // Test Enter key for approval
            fireEvent.keyDown(document, { key: 'Enter' });
            expect(mockOnApprove).toHaveBeenCalledTimes(1);

            // Test Escape key for rejection
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnReject).toHaveBeenCalledTimes(1);
        });
    });

    describe('Mode Switching', () => {
        it('should render in fullscreen mode by default', () => {
            render(<ApprovalOverlay {...defaultProps} />);

            const dialog = screen.getByRole('dialog', { hidden: true });
            expect(dialog).toBeInTheDocument();
        });

        it('should render in inline mode when specified', () => {
            render(<ApprovalOverlay {...defaultProps} mode="inline" />);

            // In inline mode, should still render but without dialog role
            expect(screen.getByText('Approve Changes')).toBeInTheDocument();
        });
    });

    describe('Integration', () => {
        it('should properly integrate with CodeBlock component', () => {
            const code = 'function test() { return "hello"; }';
            render(<ApprovalOverlay {...defaultProps} code={code} />);

            const codeBlock = screen.getByTestId('mock-code-block');
            expect(codeBlock).toHaveTextContent(code);
        });

        it('should properly integrate with DiffPreview component', () => {
            const oldCode = 'const a = 1;';
            const newCode = 'const a = 2;';
            render(
                <ApprovalOverlay
                    {...defaultProps}
                    oldCode={oldCode}
                    newCode={newCode}
                />
            );

            const diffPreview = screen.getByTestId('mock-diff-preview');
            expect(diffPreview).toHaveTextContent(`${oldCode}${newCode}`);
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(<ApprovalOverlay {...defaultProps} />);

            const dialog = screen.getByRole('dialog', { hidden: true });
            expect(dialog).toHaveAttribute('aria-labelledby');
            expect(dialog).toHaveAttribute('aria-describedby');
        });

        it('should have close button with aria-label', () => {
            render(<ApprovalOverlay {...defaultProps} />);

            const closeButton = screen.getByLabelText('Close', { selector: 'button' });
            expect(closeButton).toBeInTheDocument();
        });
    });
});