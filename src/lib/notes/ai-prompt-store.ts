import { create } from 'zustand';
import type { BlockNoteEditor } from '@blocknote/core';

interface AIPromptState {
    isOpen: boolean;
    editor: BlockNoteEditor | null;
    openPrompt: (editor: BlockNoteEditor) => void;
    closePrompt: () => void;
}

export const useAIPromptStore = create<AIPromptState>((set) => ({
    isOpen: false,
    editor: null,
    openPrompt: (editor) => set({ isOpen: true, editor }),
    closePrompt: () => set({ isOpen: false, editor: null }),
}));
