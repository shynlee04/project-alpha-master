import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BlockNoteEditor } from '@blocknote/core';

/**
 * Context mode for AI prompt generation
 * @story EPIC-42-02 - Context toggle in AI prompt dialog
 * @story UX-08 - Context Scope Selection (added below_cursor mode)
 */
export type ContextMode = 'above_cursor' | 'below_cursor' | 'all' | 'none' | 'selection';

/**
 * Labels for context mode options (for UI display)
 */
export const CONTEXT_MODE_LABELS: Record<ContextMode, { en: string; vi: string; description: { en: string; vi: string } }> = {
    above_cursor: {
        en: 'Content above cursor',
        vi: 'Nội dung phía trên con trỏ',
        description: {
            en: 'Only include blocks above your cursor position',
            vi: 'Chỉ bao gồm các khối phía trên vị trí con trỏ',
        },
    },
    below_cursor: {
        en: 'Content below cursor',
        vi: 'Nội dung phía dưới con trỏ',
        description: {
            en: 'Only include blocks below your cursor position',
            vi: 'Chỉ bao gồm các khối phía dưới vị trí con trỏ',
        },
    },
    all: {
        en: 'Entire note',
        vi: 'Toàn bộ ghi chú',
        description: {
            en: 'Include all content in the note',
            vi: 'Bao gồm tất cả nội dung trong ghi chú',
        },
    },
    none: {
        en: 'No context',
        vi: 'Không có ngữ cảnh',
        description: {
            en: 'Generate content without any note context',
            vi: 'Tạo nội dung mà không có ngữ cảnh ghi chú',
        },
    },
    selection: {
        en: 'Selected text',
        vi: 'Văn bản đã chọn',
        description: {
            en: 'Only include currently selected text',
            vi: 'Chỉ bao gồm văn bản đang được chọn',
        },
    },
};

interface AIPromptState {
    isOpen: boolean;
    editor: BlockNoteEditor | null;
    /** Context mode for AI generation - defaults to 'above_cursor' */
    contextMode: ContextMode;
    /** Whether there's an active text selection (for enabling selection mode) */
    hasSelection: boolean;
    openPrompt: (editor: BlockNoteEditor) => void;
    closePrompt: () => void;
    setContextMode: (mode: ContextMode) => void;
    setHasSelection: (has: boolean) => void;
}

export const useAIPromptStore = create<AIPromptState>()(
    persist(
        (set) => ({
            isOpen: false,
            editor: null,
            contextMode: 'above_cursor', // Default to smart context (EPIC-42-01)
            hasSelection: false,
            openPrompt: (editor) => {
                // Check if there's a selection when opening
                const selectedText = editor.getSelectedText?.() || '';
                const hasSelection = selectedText.trim().length > 0;
                set({
                    isOpen: true,
                    editor,
                    hasSelection,
                    // If there's a selection, default to selection mode (unless persisted mode was set)
                    // contextMode: hasSelection ? 'selection' : 'above_cursor',
                    // Note: Don't override persisted contextMode on openPrompt unless explicitly needed
                });
            },
            closePrompt: () => set({ isOpen: false, editor: null, hasSelection: false }),
            setContextMode: (mode) => set({ contextMode: mode }),
            setHasSelection: (has) => set({ hasSelection: has }),
        }),
        {
            name: 'via-gent-ai-prompt-context-mode', // Persist context mode preference (EPIC-42-02)
            partialize: (state) => ({ contextMode: state.contextMode }), // Only persist contextMode
        }
    )
);
