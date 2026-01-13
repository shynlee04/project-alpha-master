/**
 * @fileoverview In-Block AI Generation Popup
 * @module components/notes/InBlockAIPopup
 * @story UX-07 - In-Block AI Generation UI
 *
 * Container-aware popup for AI generation options that appears on empty blocks.
 * Renders through OverlayRoot portal to avoid clipping and UI distortion.
 *
 * Features:
 * - Appears for empty paragraphs when user activates AI
 * - Container-aware positioning (respects viewport bounds)
 * - Renders through OverlayRoot for consistent z-index
 * - Quick access to common AI actions
 * - Context scope selection (above/below/all)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayRoot } from '@/presentation/components/ui/OverlayRoot';
import { cn } from '@/lib/utils';
import {
    Sparkles, Plus, Wand2, ChevronDown, X, ArrowUp, ArrowDown,
    Lightbulb, Languages, ListChecks, FileQuestion, ScrollText,
    AlignLeft, ImagePlus, Eye, Video, Volume2,
} from 'lucide-react';
import type { BlockNoteEditor } from '@blocknote/core';

// ============================================================================
// Types
// ============================================================================

export interface ContextScope {
    mode: 'above' | 'below' | 'all' | 'selection';
    label: string;
    icon: typeof ArrowUp;
}

export interface AIAction {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    prompt: string;
    commandName: string;
    contextMode?: 'above_cursor' | 'all' | 'none' | 'selection';
}

export interface InBlockAIPopupProps {
    /** BlockNote editor instance */
    editor?: BlockNoteEditor;
    /** Whether popup is visible */
    isOpen: boolean;
    /** Called when popup should close */
    onClose: () => void;
    /** Called when an action is selected */
    onActionSelect: (action: AIAction, scope: ContextScope) => void;
    /** Reference element for positioning */
    triggerRef?: React.RefObject<HTMLElement | null>;
}

// ============================================================================
// Context Scopes
// ============================================================================

const CONTEXT_SCOPES: ContextScope[] = [
    { mode: 'above', label: 'Above', icon: ArrowUp },
    { mode: 'below', label: 'Below', icon: ArrowDown },
    { mode: 'all', label: 'All Content', icon: ScrollText },
];

// ============================================================================
// Quick AI Actions
// ============================================================================

const QUICK_AI_ACTIONS: Omit<AIAction, 'prompt'>[] = [
    {
        id: 'magic',
        label: 'AI Magic',
        description: 'Open custom AI prompt dialog',
        icon: Sparkles,
        commandName: 'AI Magic',
        contextMode: 'above_cursor',
    },
    {
        id: 'continue',
        label: 'Continue Writing',
        description: 'Continue from where you left off',
        icon: AlignLeft,
        commandName: 'Continue',
        contextMode: 'above_cursor',
    },
    {
        id: 'summary',
        label: 'Summarize',
        description: 'Generate a summary',
        icon: ScrollText,
        commandName: 'Summary',
        contextMode: 'all',
    },
    {
        id: 'explain',
        label: 'Explain',
        description: 'Explain in simple terms',
        icon: Lightbulb,
        commandName: 'Explain',
        contextMode: 'all',
    },
    {
        id: 'translate',
        label: 'Translate',
        description: 'Translate EN ↔ VI',
        icon: Languages,
        commandName: 'Translate',
        contextMode: 'all',
    },
    {
        id: 'questions',
        label: 'Questions',
        description: 'Generate study questions',
        icon: FileQuestion,
        commandName: 'Questions',
        contextMode: 'all',
    },
    {
        id: 'flashcards',
        label: 'Flashcards',
        description: 'Create study flashcards',
        icon: ListChecks,
        commandName: 'Flashcards',
        contextMode: 'all',
    },
    {
        id: 'image',
        label: 'AI Image',
        description: 'Generate an image',
        icon: ImagePlus,
        commandName: 'AI Image',
        contextMode: 'none',
    },
    {
        id: 'vision',
        label: 'AI Vision',
        description: 'Analyze an image',
        icon: Eye,
        commandName: 'AI Vision',
        contextMode: 'none',
    },
    {
        id: 'video-analysis',
        label: 'Video Analysis',
        description: 'Analyze video content',
        icon: Video,
        commandName: 'Video Analysis',
        contextMode: 'none',
    },
    {
        id: 'tts',
        label: 'Text to Speech',
        description: 'Read text aloud',
        icon: Volume2,
        commandName: 'TTS',
        contextMode: 'all',
    },
];

// ============================================================================
// Component
// ============================================================================

export function InBlockAIPopup({
    editor,
    isOpen,
    onClose,
    onActionSelect,
    triggerRef,
}: InBlockAIPopupProps) {
    const { containerRef } = useOverlayRoot();
    const popupRef = useRef<HTMLDivElement>(null);
    const [selectedScope, setSelectedScope] = useState<ContextScope>(CONTEXT_SCOPES[0]);
    const [actionFilter, setActionFilter] = useState('');

    // Calculate position based on trigger or manual position
    const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Update position when opened or trigger changes
    useEffect(() => {
        if (!isOpen) return;

        if (triggerRef?.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPopupPosition({
                x: rect.left,
                y: rect.bottom + 8, // 8px gap below trigger
            });
        } else {
            // Fallback: position near cursor
            setPopupPosition({ x: window.innerWidth / 2 - 200, y: 200 });
        }
    }, [isOpen, triggerRef]);

    // Close on escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(e.target as Node) &&
                triggerRef?.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, triggerRef]);

    // Adjust position if popup would overflow viewport
    useEffect(() => {
        if (!isOpen || !popupRef.current) return;

        const popup = popupRef.current;
        const rect = popup.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = popupPosition.x;
        let adjustedY = popupPosition.y;

        // Prevent horizontal overflow
        if (adjustedX + rect.width > viewportWidth - 16) {
            adjustedX = viewportWidth - rect.width - 16;
        }
        if (adjustedX < 16) {
            adjustedX = 16;
        }

        // Prevent vertical overflow - show above if below would overflow
        if (adjustedY + rect.height > viewportHeight - 16) {
            if (triggerRef?.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                adjustedY = triggerRect.top - rect.height - 8;
            } else {
                adjustedY = viewportHeight - rect.height - 16;
            }
        }

        if (adjustedY !== popupPosition.x || adjustedY !== popupPosition.y) {
            setPopupPosition({ x: adjustedX, y: adjustedY });
        }
    }, [isOpen, popupPosition, triggerRef]);

    const handleActionClick = useCallback((action: AIAction) => {
        onActionSelect(action, selectedScope);
        onClose();
    }, [onActionSelect, selectedScope, onClose]);

    const filteredActions = QUICK_AI_ACTIONS.filter(action =>
        action.label.toLowerCase().includes(actionFilter.toLowerCase()) ||
        action.description.toLowerCase().includes(actionFilter.toLowerCase())
    );

    if (!isOpen) return null;

    // Render through portal to OverlayRoot for consistent z-index
    const portalContent = (
        <div
            ref={popupRef}
            className={cn(
                'fixed z-[var(--z-popover)] w-80 bg-[var(--card)] border-2 border-[var(--border)]',
                'rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,0.15)] overflow-hidden',
                'animate-in fade-in zoom-in-95 duration-150'
            )}
            style={{
                left: `${popupPosition.x}px`,
                top: `${popupPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--muted)]/30">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-sm font-medium">AI Actions</span>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 hover:bg-[var(--accent)] rounded-sm transition-colors"
                    aria-label="Close"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* Context Scope Selector */}
            <div className="p-2 border-b border-[var(--border)]">
                <label className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1 block">
                    Context Scope
                </label>
                <div className="flex gap-1">
                    {CONTEXT_SCOPES.map((scope) => {
                        const Icon = scope.icon;
                        const isSelected = selectedScope.mode === scope.mode;
                        return (
                            <button
                                key={scope.mode}
                                type="button"
                                onClick={() => setSelectedScope(scope)}
                                className={cn(
                                    'flex items-center gap-1 px-2 py-1.5 text-xs rounded-none border-2 transition-colors',
                                    'flex-1 justify-center',
                                    isSelected
                                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                                        : 'bg-[var(--background)] border-[var(--border)] hover:bg-[var(--accent)] text-[var(--foreground)]'
                                )}
                            >
                                <Icon className="w-3 h-3" />
                                <span>{scope.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Search Filter */}
            <div className="p-2 border-b border-[var(--border)]">
                <input
                    type="text"
                    placeholder="Filter actions..."
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    autoFocus
                />
            </div>

            {/* Actions List */}
            <div className="max-h-64 overflow-y-auto p-1">
                {filteredActions.length === 0 ? (
                    <div className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                        No matching actions
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-1">
                        {filteredActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    type="button"
                                    onClick={() => handleActionClick(action as AIAction)}
                                    className={cn(
                                        'flex flex-col items-center gap-1 p-2 text-left rounded-none transition-colors',
                                        'hover:bg-[var(--accent)] border border-transparent hover:border-[var(--border)]',
                                        'text-start'
                                    )}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center bg-[var(--muted)] rounded-sm">
                                        <Icon className="w-4 h-4 text-[var(--primary)]" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-medium truncate">{action.label}</div>
                                        <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                                            {action.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer - More Options */}
            <div className="p-2 border-t border-[var(--border)] bg-[var(--muted)]/20">
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] rounded-none transition-colors"
                    onClick={() => {
                        // Open the full AI prompt dialog
                        const event = new CustomEvent('open-aiprompt-dialog', {
                            detail: { editor },
                        });
                        window.dispatchEvent(event);
                        onClose();
                    }}
                >
                    <Wand2 className="w-4 h-4 text-[var(--primary)]" />
                    <span>Custom Prompt...</span>
                    <ChevronDown className="w-3 h-3 ml-auto" />
                </button>
            </div>
        </div>
    );

    return containerRef.current
        ? createPortal(portalContent, containerRef.current)
        : portalContent;
}

// ============================================================================
// Floating AI Action Button Component
// ============================================================================

export interface FloatingAIButtonProps {
    /** Whether to show the button */
    show?: boolean;
    /** Called when button is clicked */
    onClick?: () => void;
    /** Position for the button */
    position?: { x: number; y: number };
}

/**
 * Floating AI button that appears near empty blocks
 * Shows a "+" icon with AI sparkles to indicate AI generation availability
 */
export function FloatingAIButton({ show = true, onClick, position }: FloatingAIButtonProps) {
    const { containerRef } = useOverlayRoot();
    const buttonRef = useRef<HTMLButtonElement>(null);

    if (!show) return null;

    const buttonContent = (
        <button
            ref={buttonRef}
            type="button"
            onClick={onClick}
            className={cn(
                'fixed z-[var(--z-popover)] flex items-center gap-1.5 px-2 py-1.5',
                'bg-[var(--primary)] text-[var(--primary-foreground)]',
                'border-2 border-[var(--primary)] rounded-none',
                'shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]',
                'hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5',
                'active:shadow-[1px_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-0',
                'transition-all duration-150',
                'animate-in fade-in zoom-in-95 duration-150'
            )}
            style={{
                left: position?.x ? `${position.x}px` : undefined,
                top: position?.y ? `${position.y}px` : undefined,
            }}
            title="Generate with AI"
        >
            <Sparkles className="w-3.5 h-3.5" />
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">AI</span>
        </button>
    );

    return containerRef.current
        ? createPortal(buttonContent, containerRef.current)
        : buttonContent;
}

// ============================================================================
// Hook: Detect Empty Block for AI Button
// ============================================================================

export interface UseEmptyBlockDetectionResult {
    /** Whether cursor is in an empty block */
    isEmptyBlock: boolean;
    /** Position for showing the AI button */
    buttonPosition: { x: number; y: number } | null;
}

/**
 * Hook to detect when cursor is in an empty paragraph block
 * Returns position info for showing floating AI button
 */
export function useEmptyBlockDetection(editor: BlockNoteEditor | null): UseEmptyBlockDetectionResult {
    const [state, setState] = useState<{
        isEmptyBlock: boolean;
        buttonPosition: { x: number; y: number } | null;
    }>({
        isEmptyBlock: false,
        buttonPosition: null,
    });

    useEffect(() => {
        if (!editor) {
            setState({ isEmptyBlock: false, buttonPosition: null });
            return;
        }

        const checkEmptyBlock = () => {
            try {
                const cursor = editor.getTextCursorPosition();
                if (!cursor?.block) {
                    setState({ isEmptyBlock: false, buttonPosition: null });
                    return;
                }

                const block = cursor.block;
                const isParagraph = block.type === 'paragraph';
                // BlockNote content is a TableContent type, need to check safely
                // Use try-catch to access content since it may be undefined or have special structure
                let isEmpty = false;
                try {
                    const contentArray: unknown = block.content;
                    if (!contentArray) {
                        isEmpty = true;
                    } else if (Array.isArray(contentArray)) {
                        // Check if array is empty or contains only empty text
                        if (contentArray.length === 0) {
                            isEmpty = true;
                        } else if (contentArray.length === 1) {
                            const firstItem = contentArray[0] as { type?: string; text?: string } | undefined;
                            if (firstItem?.type === 'text' && !firstItem?.text) {
                                isEmpty = true;
                            }
                        }
                    }
                } catch {
                    // If we can't read content, assume it's not empty to avoid breaking UX
                    isEmpty = false;
                }

                // Get cursor position for button
                const selection = window.getSelection();
                let position: { x: number; y: number } | null = null;

                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const rects = range.getClientRects();
                    if (rects.length > 0) {
                        position = {
                            x: rects[0].right + 8,
                            y: rects[0].bottom,
                        };
                    }
                }

                setState({
                    isEmptyBlock: isParagraph && isEmpty,
                    buttonPosition: position,
                });
            } catch (error) {
                console.warn('[useEmptyBlockDetection] Error detecting empty block:', error);
                setState({ isEmptyBlock: false, buttonPosition: null });
            }
        };

        // Check initially
        checkEmptyBlock();

        // Listen to selection changes
        document.addEventListener('selectionchange', checkEmptyBlock);
        // Also listen to cursor position changes in editor
        editor.onChange?.(checkEmptyBlock);

        return () => {
            document.removeEventListener('selectionchange', checkEmptyBlock);
        };
    }, [editor]);

    return state;
}

export default InBlockAIPopup;
