import type { BlockNoteEditor } from '@blocknote/core';
import { getDefaultReactSlashMenuItems, type DefaultReactSuggestionItem } from '@blocknote/react';

import { Sparkles } from 'lucide-react';
import { useAIPromptStore } from '@/lib/notes/ai-prompt-store';

// We need to access the store outside of a component for the onItemClick handler
// Typically, we can import the store hook, but Zustand stores can also be used directly via .getState()
// if we want to avoid hook rules inside the callback, though the callback runs on event.

export const insertAIItem = (editor: BlockNoteEditor) => ({
    title: "AI Magic",
    onItemClick: () => {
        // Open the AI Prompt Dialog
        useAIPromptStore.getState().openPrompt(editor);
    },
    aliases: ["ai", "magic", "generate"],
    group: "AI",
    icon: <Sparkles size={18} />,
    subtext: "Generate content with AI",
});

export const getCustomSlashMenuItems = (
    editor: BlockNoteEditor
): DefaultReactSuggestionItem[] => {
    return [
        // Add our custom item at the top or grouped
        insertAIItem(editor),
        ...getDefaultReactSlashMenuItems(editor),
    ];
};
