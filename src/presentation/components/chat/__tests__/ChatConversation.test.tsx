// @vitest-environment jsdom
/**
 * Unit tests for ChatConversation component
 *
 * @epic CHAT-REMAKE
 * @story CHAT-001 - Fix Chat Panel Layout and Responsiveness
 * @story CHAT-002 - Fix Multi-line Input Textarea
 * @story CHAT-003 - Fix 8-bit Design System Violations
 * @description
 * Tests for CHAT-001 layout fixes covering:
 * - AC-1: Message area has minimum height of 200px
 * - AC-2: Input area never covers messages during resize (min-h-0 pattern)
 * - AC-3: No horizontal overflow at minimum width (280px)
 * - AC-4: Empty state respects same layout constraints
 *
 * Tests for CHAT-002 textarea fixes covering:
 * - AC-1: Auto-expand from 1 to 6 lines (min-h-[40px] max-h-[150px])
 * - AC-2: Show scroll indicator at max height (overflow-y-auto)
 * - AC-3: Prevent iOS zoom on focus (text-base/16px font)
 * - AC-4: Maintain responsive layout
 *
 * Tests for CHAT-003 8-bit design fixes covering:
 * - AC-1: Use rounded-none instead of rounded-sm
 * - AC-2: Use solid colors instead of opacity modifiers
 * - AC-3: Use shadow-pixel instead of shadow-md
 * - AC-4: Use semantic colors instead of opacity-50
 *
 * TDD Approach: Tests verify flex-safe container pattern, textarea auto-expand,
 * and 8-bit design system compliance using CSS field-sizing: content with proper
 * height constraints and pixel-art styling.
 */

import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatConversation } from '../ChatConversation';

// Mock ResizeObserver for resizable containers
beforeAll(() => {
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
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

vi.mock('react-window', () => ({
    List: ({ children, height }: { children: any; height: number }) => (
        <div style={{ height }} data-testid="virtual-list">
            {children instanceof Function ? children({ index: 0, style: {}, data: [] }) : children}
        </div>
    ),
}));

vi.mock('../StreamdownRenderer', () => ({
    StreamdownRenderer: ({ content }: { content: string }) => (
        <div data-testid="streamdown">{content}</div>
    ),
}));

vi.mock('../agent/UnifiedAgentSelector', () => ({
    UnifiedAgentSelector: () => <div data-testid="agent-selector" />,
}));

vi.mock('@/presentation/components/ui/truncated-text', () => ({
    TruncatedText: ({ text }: { text: string }) => (
        <span data-testid="truncated-text">{text}</span>
    ),
}));

vi.mock('@/infrastructure/persistence/stores', () => ({
    useActiveAgent: () => ({ id: 'agent-1', name: 'Test Agent' }),
    useAgentsStore: () => ({ agents: [] }),
}));

describe('ChatConversation - CHAT-001 Layout Fixes', () => {
    const mockThread = {
        id: 'thread-1',
        title: 'Test Conversation',
        messages: [],
    };

    const defaultProps = {
        thread: mockThread,
        selectedAgent: { id: 'agent-1', name: 'Test Agent' },
        onBack: vi.fn(),
        onSelectAgent: vi.fn(),
        onSendMessage: vi.fn(),
        isStreaming: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('AC-1: Message Area Has Minimum Height', () => {
        it('should apply min-h-[200px] to messages area div', () => {
            const threadWithMessages = {
                ...mockThread,
                messages: [
                    { id: 'msg-1', role: 'user', content: 'Hello' },
                    { id: 'msg-2', role: 'assistant', content: 'Hi there' },
                ],
            };

            const { container } = render(
                <ChatConversation {...defaultProps} thread={threadWithMessages} />
            );

            // Find messages area div - check for min-h-[200px] class
            const allDivs = container.querySelectorAll('div');
            let foundMinH200 = false;
            allDivs.forEach(div => {
                div.classList.forEach(cls => {
                    if (cls === 'min-h-[200px]') {
                        foundMinH200 = true;
                    }
                });
            });
            expect(foundMinH200).toBe(true);
        });

        it('should maintain minimum height constraint during resize', () => {
            const threadWithMessages = {
                ...mockThread,
                messages: [{ id: 'msg-1', role: 'user', content: 'Test' }],
            };

            const { container } = render(
                <ChatConversation {...defaultProps} thread={threadWithMessages} />
            );

            // Verify the class list contains the minimum height
            const allDivs = container.querySelectorAll('div');
            let hasMinHeight = false;
            allDivs.forEach(div => {
                div.classList.forEach(cls => {
                    if (cls.includes('min-h') && cls.includes('200')) {
                        hasMinHeight = true;
                    }
                });
            });
            expect(hasMinHeight).toBe(true);
        });
    });

    describe('AC-2: Input Area Never Covers Messages', () => {
        it('should apply min-h-0 to message wrapper to allow flex child shrinking', () => {
            const threadWithMessages = {
                ...mockThread,
                messages: [{ id: 'msg-1', role: 'user', content: 'Test' }],
            };

            const { container } = render(
                <ChatConversation {...defaultProps} thread={threadWithMessages} />
            );

            // Find flex-1 min-h-0 wrapper (key pattern for resizable safety)
            const flexWrapper = container.querySelector('.flex-1.min-h-0');
            expect(flexWrapper).toBeInTheDocument();
        });

        it('should have flex-1 and overflow-hidden on messages wrapper', () => {
            const threadWithMessages = {
                ...mockThread,
                messages: [{ id: 'msg-1', role: 'user', content: 'Test' }],
            };

            const { container } = render(
                <ChatConversation {...defaultProps} thread={threadWithMessages} />
            );

            const messagesWrapper = container.querySelector('.flex-1.min-h-0.overflow-hidden');
            expect(messagesWrapper).toBeInTheDocument();
        });

        it('should keep input area at bottom with flex-shrink-0 behavior', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Find the input form (should have flex-shrink behavior)
            const inputForm = container.querySelector('form');
            expect(inputForm).toBeInTheDocument();

            // Verify it has border-t indicating it stays at bottom
            expect(inputForm?.classList.contains('border-t-2')).toBe(true);
        });
    });

    describe('AC-3: No Horizontal Overflow at Minimum Width', () => {
        it('should not have overflow-x on container', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const mainContainer = container.querySelector('.flex.flex-col.h-full');
            expect(mainContainer).toBeInTheDocument();

            // Should NOT have overflow-x (which would cause horizontal scroll)
            expect(mainContainer?.classList.contains('overflow-x-auto')).toBe(false);
            expect(mainContainer?.classList.contains('overflow-x-scroll')).toBe(false);
        });

        it('should use min-w-0 for proper text truncation in tight spaces', () => {
            const threadWithMessages = {
                ...mockThread,
                messages: [{ id: 'msg-1', role: 'user', content: 'Test' }],
            };

            const { container } = render(
                <ChatConversation {...defaultProps} thread={threadWithMessages} />
            );

            // Thread title should have min-w-0 for truncation
            const allDivs = container.querySelectorAll('div');
            let hasMinW0 = false;
            allDivs.forEach(div => {
                if (div.classList.contains('min-w-0')) {
                    hasMinW0 = true;
                }
            });
            expect(hasMinW0).toBe(true);
        });
    });

    describe('AC-4: Empty State Also Respects Constraints', () => {
        it('should apply min-h-0 pattern to empty state messages area', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Empty state should have flex-safe pattern
            const emptyStateWrapper = container.querySelector(
                '.flex-1.min-h-0.overflow-y-auto'
            );
            expect(emptyStateWrapper).toBeInTheDocument();
        });

        it('should apply min-h-[200px] to empty state content', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Check for empty state with min-h-[200px] and other classes
            const allDivs = container.querySelectorAll('div');
            let foundEmptyState = false;
            allDivs.forEach(div => {
                const classes = Array.from(div.classList);
                if (classes.includes('min-h-[200px]') &&
                    classes.includes('items-center') &&
                    classes.includes('justify-center')) {
                    foundEmptyState = true;
                }
            });
            expect(foundEmptyState).toBe(true);
        });

        it('should apply minHeight style to empty state container', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const mainContainer = container.querySelector('.flex.flex-col.h-full');
            expect(mainContainer).toBeInTheDocument();

            // Check for inline minHeight style (400px minimum)
            const style = (mainContainer as HTMLElement).style.minHeight;
            expect(style).toBe('400px');
        });

        it('should render empty state message correctly', () => {
            render(<ChatConversation {...defaultProps} />);

            expect(screen.getByText(/Start chatting/i)).toBeInTheDocument();
        });
    });

    describe('Flex-Safe Container Pattern Integration', () => {
        it('should apply minHeight: 400px to main container in both states', () => {
            const { container: emptyContainer } = render(
                <ChatConversation {...defaultProps} />
            );

            const threadWithMessages = {
                ...mockThread,
                messages: [{ id: 'msg-1', role: 'user', content: 'Test' }],
            };
            const { container: messagesContainer } = render(
                <ChatConversation {...defaultProps} thread={threadWithMessages} />
            );

            // Both states should have minHeight style
            const emptyMain = emptyContainer.querySelector('.flex.flex-col.h-full');
            const messagesMain = messagesContainer.querySelector('.flex.flex-col.h-full');

            expect((emptyMain as HTMLElement)?.style.minHeight).toBe('400px');
            expect((messagesMain as HTMLElement)?.style.minHeight).toBe('400px');
        });

        it('should maintain proper flex structure throughout resize', () => {
            const threadWithMessages = {
                ...mockThread,
                messages: [
                    { id: 'msg-1', role: 'user', content: 'Test message' },
                    { id: 'msg-2', role: 'assistant', content: 'Response' },
                ],
            };

            const { container } = render(
                <ChatConversation {...defaultProps} thread={threadWithMessages} />
            );

            // Verify complete flex-safe structure
            const mainContainer = container.querySelector('.flex.flex-col.h-full');
            const flexWrapper = container.querySelector('.flex-1.min-h-0');

            expect(mainContainer).toBeInTheDocument();
            expect(flexWrapper).toBeInTheDocument();

            // Verify main container has minHeight style
            expect((mainContainer as HTMLElement)?.style.minHeight).toBe('400px');

            // Verify flex wrapper has min-h-0
            expect(flexWrapper?.classList.contains('min-h-0')).toBe(true);

            // Verify there's a div with min-h-[200px] somewhere
            const allDivs = container.querySelectorAll('div');
            let hasMinHeight200 = false;
            allDivs.forEach(div => {
                div.classList.forEach(cls => {
                    if (cls === 'min-h-[200px]') {
                        hasMinHeight200 = true;
                    }
                });
            });
            expect(hasMinHeight200).toBe(true);
        });
    });

    describe('Input Area Behavior', () => {
        it('should render input textarea with proper constraints', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();

            // Should have resize-none and proper styling
            expect(textarea?.classList.contains('resize-none')).toBe(true);
        });

        it('should disable submit button when no input', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const submitButton = container.querySelector('button[type="submit"]');
            expect(submitButton).toBeDisabled();
        });
    });
});

describe('ChatConversation - CHAT-002 Multi-line Input Fixes', () => {
    const mockThread = {
        id: 'thread-1',
        title: 'Test Conversation',
        messages: [],
    };

    const defaultProps = {
        thread: mockThread,
        selectedAgent: { id: 'agent-1', name: 'Test Agent' },
        onBack: vi.fn(),
        onSelectAgent: vi.fn(),
        onSendMessage: vi.fn(),
        isStreaming: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('AC-1: Auto-Expand from 1 to 6 Lines', () => {
        it('should apply min-h-[40px] to textarea for minimum 1 line height', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();

            // Check for min-h-[40px] class
            const hasMinHeight = Array.from(textarea!.classList).some(
                cls => cls === 'min-h-[40px]'
            );
            expect(hasMinHeight).toBe(true);
        });

        it('should apply max-h-[150px] to textarea for maximum 6 lines', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();

            // Check for max-h-[150px] class
            const hasMaxHeight = Array.from(textarea!.classList).some(
                cls => cls === 'max-h-[150px]'
            );
            expect(hasMaxHeight).toBe(true);
        });

        it('should include field-sizing-content class for auto-grow behavior', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();

            // Check for field-sizing-content class
            const hasFieldSizing = Array.from(textarea!.classList).some(
                cls => cls === 'field-sizing-content'
            );
            expect(hasFieldSizing).toBe(true);
        });
    });

    describe('AC-2: Show Scroll Indicator at Maximum Height', () => {
        it('should apply overflow-y-auto to textarea for scroll indicator', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();

            // Check for overflow-y-auto class
            expect(textarea?.classList.contains('overflow-y-auto')).toBe(true);
        });

        it('should apply resize-none to prevent manual resize', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea?.classList.contains('resize-none')).toBe(true);
        });
    });

    describe('AC-3: Prevent iOS Zoom on Focus', () => {
        it('should use text-base class to prevent iOS zoom (16px minimum)', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();

            // Check for text-base class (16px font on mobile)
            const hasTextBase = Array.from(textarea!.classList).some(
                cls => cls === 'text-base'
            );
            expect(hasTextBase).toBe(true);
        });

        it('should use md:text-sm for responsive desktop sizing', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();

            // Check for md:text-sm class (smaller on desktop)
            const hasMdTextSm = Array.from(textarea!.classList).some(
                cls => cls === 'md:text-sm'
            );
            expect(hasMdTextSm).toBe(true);
        });
    });

    describe('AC-4: Maintain Responsive Layout', () => {
        it('should use rounded-none for 8-bit design compliance', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea');
            expect(textarea).toBeInTheDocument();

            // Should use rounded-none not rounded-sm
            expect(textarea?.classList.contains('rounded-none')).toBe(true);
            expect(textarea?.classList.contains('rounded-sm')).toBe(false);
        });

        it('should apply consistent styling across both empty and populated states', () => {
            // Empty state
            const { container: emptyContainer } = render(
                <ChatConversation {...defaultProps} />
            );

            // Populated state
            const threadWithMessages = {
                ...mockThread,
                messages: [
                    { id: 'msg-1', role: 'user', content: 'Hello' },
                    { id: 'msg-2', role: 'assistant', content: 'Hi there' },
                ],
            };
            const { container: populatedContainer } = render(
                <ChatConversation {...defaultProps} thread={threadWithMessages} />
            );

            const emptyTextarea = emptyContainer.querySelector('textarea');
            const populatedTextarea = populatedContainer.querySelector('textarea');

            // Both should have the same key classes
            const keyClasses = [
                'min-h-[40px]',
                'max-h-[150px]',
                'field-sizing-content',
                'text-base',
                'rounded-none',
                'overflow-y-auto',
            ];

            keyClasses.forEach(cls => {
                const emptyHas = Array.from(emptyTextarea!.classList).some(c => c === cls);
                const populatedHas = Array.from(populatedTextarea!.classList).some(c => c === cls);
                expect(emptyHas).toBe(true);
                expect(populatedHas).toBe(true);
            });
        });
    });

    describe('Textarea Input Behavior', () => {
        it('should allow typing into the textarea', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
            expect(textarea).toBeInTheDocument();

            fireEvent.change(textarea, { target: { value: 'Hello world' } });
            expect(textarea.value).toBe('Hello world');
        });

        it('should handle multiline input', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

            const multilineText = 'Line 1\nLine 2\nLine 3';
            fireEvent.change(textarea, { target: { value: multilineText } });

            expect(textarea.value).toBe(multilineText);
        });
    });
});

describe('ChatConversation - CHAT-003 8-bit Design System Fixes', () => {
    const mockThread = {
        id: 'thread-1',
        title: 'Test Conversation',
        messages: [
            { id: 'msg-1', role: 'user', content: 'Hello' },
            { id: 'msg-2', role: 'assistant', content: 'Hi there' },
        ],
    };

    const defaultProps = {
        thread: mockThread,
        selectedAgent: { id: 'agent-1', name: 'Test Agent' },
        onBack: vi.fn(),
        onSelectAgent: vi.fn(),
        onSendMessage: vi.fn(),
        isStreaming: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('AC-1: Use rounded-none Instead of rounded-sm', () => {
        it('should use rounded-none for message bubbles', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Check for rounded-none in message bubbles (message area divs)
            const allDivs = container.querySelectorAll('div');
            let hasRoundedNone = false;
            let hasRoundedSm = false;

            allDivs.forEach(div => {
                div.classList.forEach(cls => {
                    if (cls === 'rounded-none') hasRoundedNone = true;
                    if (cls === 'rounded-sm') hasRoundedSm = true;
                });
            });

            expect(hasRoundedNone).toBe(true);
            expect(hasRoundedSm).toBe(false);
        });

        it('should not use rounded-sm anywhere in the component', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Search all elements for rounded-sm
            const allElements = container.querySelectorAll('*');
            let hasRoundedSm = false;

            allElements.forEach(el => {
                el.classList.forEach(cls => {
                    if (cls.includes('rounded-sm')) {
                        hasRoundedSm = true;
                    }
                });
            });

            expect(hasRoundedSm).toBe(false);
        });
    });

    describe('AC-2: Use Solid Colors Instead of Opacity Modifiers', () => {
        it('should not use opacity modifiers like bg-primary/20', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Check for opacity modifiers in class names
            const allElements = container.querySelectorAll('*');
            let hasOpacityModifier = false;

            allElements.forEach(el => {
                el.classList.forEach(cls => {
                    // Check for patterns like /20, /50, /80, /90
                    if (/\/(10|20|30|40|50|60|70|80|90)$/.test(cls)) {
                        hasOpacityModifier = true;
                    }
                });
            });

            expect(hasOpacityModifier).toBe(false);
        });

        it('should use solid color classes for backgrounds', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Check submit buttons for bg-primary (solid color, not bg-primary/90)
            const allButtons = container.querySelectorAll('button');
            let hasSolidPrimaryColor = false;
            let hasOpacityPrimaryColor = false;

            allButtons.forEach(btn => {
                btn.classList.forEach(cls => {
                    if (cls === 'bg-primary' || cls === 'bg-primary-600') {
                        hasSolidPrimaryColor = true;
                    }
                    if (/bg-primary\/\d+/.test(cls)) {
                        hasOpacityPrimaryColor = true;
                    }
                });
            });

            // Should have solid bg-primary or bg-primary-600
            expect(hasSolidPrimaryColor).toBe(true);
            // Should NOT have opacity modifiers like bg-primary/90
            expect(hasOpacityPrimaryColor).toBe(false);
        });
    });

    describe('AC-3: Use shadow-pixel Instead of shadow-md', () => {
        it('should use shadow-pixel class on submit buttons', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Check for shadow-pixel class on submit buttons
            const allButtons = container.querySelectorAll('button');
            let hasShadowPixel = false;

            allButtons.forEach(btn => {
                btn.classList.forEach(cls => {
                    if (cls.includes('shadow-pixel')) {
                        hasShadowPixel = true;
                    }
                });
            });

            expect(hasShadowPixel).toBe(true);
        });

        it('should use shadow-pixel-sm hover variant', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            // Check for shadow-pixel-sm hover class on submit buttons
            const allButtons = container.querySelectorAll('button');
            let hasShadowPixelSm = false;

            allButtons.forEach(btn => {
                btn.classList.forEach(cls => {
                    if (cls.includes('shadow-pixel-sm')) {
                        hasShadowPixelSm = true;
                    }
                });
            });

            expect(hasShadowPixelSm).toBe(true);
        });

        it('should not use shadow-md or shadow-lg on buttons', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const allButtons = container.querySelectorAll('button');
            let hasStandardShadow = false;

            allButtons.forEach(btn => {
                btn.classList.forEach(cls => {
                    if (cls === 'shadow-md' || cls === 'shadow-lg' || cls === 'shadow-sm') {
                        hasStandardShadow = true;
                    }
                });
            });

            expect(hasStandardShadow).toBe(false);
        });
    });

    describe('AC-4: Use Semantic Colors Instead of opacity-50', () => {
        it('should use text-muted-foreground instead of opacity-50 for empty state', () => {
            const emptyThread = { ...mockThread, messages: [] };
            const { container } = render(
                <ChatConversation {...defaultProps} thread={emptyThread} />
            );

            // Empty state should use text-muted-foreground
            const allDivs = container.querySelectorAll('div');
            let hasMutedForeground = false;

            allDivs.forEach(div => {
                div.classList.forEach(cls => {
                    if (cls === 'text-muted-foreground') {
                        hasMutedForeground = true;
                    }
                });
            });

            expect(hasMutedForeground).toBe(true);
        });

        it('should not use opacity-50 on icons', () => {
            const emptyThread = { ...mockThread, messages: [] };
            const { container } = render(
                <ChatConversation {...defaultProps} thread={emptyThread} />
            );

            // Check that Bot icon doesn't have opacity-50
            const allElements = container.querySelectorAll('*');
            let hasIconOpacity = false;

            allElements.forEach(el => {
                if (el.classList.contains('opacity-50')) {
                    // Make sure it's for disabled state (acceptable)
                    const parent = el.parentElement;
                    if (parent && !parent.classList.contains('disabled:opacity-50')) {
                        hasIconOpacity = true;
                    }
                }
            });

            // Note: disabled:opacity-50 is acceptable for disabled states
            // We're checking that we don't use opacity-50 for decorative purposes
            expect(hasIconOpacity).toBe(false);
        });
    });

    describe('8-bit Design Integration', () => {
        it('should maintain consistent 8-bit styling across buttons', () => {
            const { container } = render(<ChatConversation {...defaultProps} />);

            const allButtons = container.querySelectorAll('button');
            let hasRoundedNone = false;
            let hasShadowPixel = false;
            let hasBorder2 = false;

            allButtons.forEach(btn => {
                btn.classList.forEach(cls => {
                    if (cls === 'rounded-none') hasRoundedNone = true;
                    if (cls.includes('shadow-pixel')) hasShadowPixel = true;
                    if (cls === 'border-2') hasBorder2 = true;
                });
            });

            // All 8-bit design tokens should be present on buttons
            expect(hasRoundedNone).toBe(true);
            expect(hasShadowPixel).toBe(true);
            expect(hasBorder2).toBe(true);
        });
    });
});
