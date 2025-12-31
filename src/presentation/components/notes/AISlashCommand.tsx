/**
 * @fileoverview AI Slash Commands for BlockNote Editor
 * @module components/notes/AISlashCommand
 * @story NR-05 - Implement Command Palette AI Actions
 * @updated 2025-12-31 - Added more AI commands
 */

import type { BlockNoteEditor, Block } from '@blocknote/core';
import { getDefaultReactSlashMenuItems, type DefaultReactSuggestionItem } from '@blocknote/react';

import {
    Sparkles,
    BookOpen,
    ListChecks,
    FileQuestion,
    Languages,
    Lightbulb,
    ScrollText,
    AlignLeft
} from 'lucide-react';
import { useAIPromptStore } from '@/lib/notes/ai-prompt-store';
import { generateNoteContent } from '@/lib/notes/note-ai-service';
import { toast } from 'sonner';

// ============================================================================
// AI Magic - Open Prompt Dialog
// ============================================================================

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

// ============================================================================
// Helper: Execute AI Command
// ============================================================================

async function executeAICommand(
    editor: BlockNoteEditor,
    prompt: string,
    successMessage: string = 'Content generated'
): Promise<void> {
    try {
        const result = await generateNoteContent(prompt);
        const blocks = await editor.tryParseMarkdownToBlocks(result);
        editor.insertBlocks(blocks, editor.getTextCursorPosition().block, 'after');
        toast.success(successMessage);
    } catch (error) {
        console.error('AI command failed:', error);
        toast.error('AI generation failed. Please try again.');
    }
}

// ============================================================================
// AI Commands
// ============================================================================

export const summarizeNoteItem = (editor: BlockNoteEditor) => ({
    title: "Summarize Note",
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error('No content to summarize');
            return;
        }
        await executeAICommand(
            editor,
            `Summarize the following note content in a clear, concise summary:\n\n${content}`,
            'Summary generated'
        );
    },
    aliases: ["summary", "summarize", "tldr"],
    group: "AI",
    icon: <ScrollText size={18} />,
    subtext: "Generate a summary of the entire note",
});

export const generateOutlineItem = (editor: BlockNoteEditor) => ({
    title: "Generate Outline",
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error('No content to outline');
            return;
        }
        await executeAICommand(
            editor,
            `Create a structured outline from the following content. Use bullet points and headings:\n\n${content}`,
            'Outline generated'
        );
    },
    aliases: ["outline", "structure", "toc"],
    group: "AI",
    icon: <ListChecks size={18} />,
    subtext: "Create an outline from the note",
});

export const explainConceptItem = (editor: BlockNoteEditor) => ({
    title: "Explain Like I'm 5",
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error('No content to explain');
            return;
        }
        await executeAICommand(
            editor,
            `Explain the following content in very simple terms that a child could understand. Use analogies and examples:\n\n${content}`,
            'Explanation generated'
        );
    },
    aliases: ["eli5", "explain", "simplify"],
    group: "AI",
    icon: <Lightbulb size={18} />,
    subtext: "Explain the note in simple terms",
});

export const generateQuestionsItem = (editor: BlockNoteEditor) => ({
    title: "Generate Questions",
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error('No content for questions');
            return;
        }
        await executeAICommand(
            editor,
            `Generate 5 thoughtful questions based on the following content. These should help test understanding of the material:\n\n${content}`,
            'Questions generated'
        );
    },
    aliases: ["questions", "quiz", "test"],
    group: "AI",
    icon: <FileQuestion size={18} />,
    subtext: "Create study questions from the note",
});

export const translateNoteItem = (editor: BlockNoteEditor) => ({
    title: "Translate Note",
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error('No content to translate');
            return;
        }
        await executeAICommand(
            editor,
            `Translate the following content. If it's in English, translate to Vietnamese. If it's in Vietnamese, translate to English. Preserve formatting:\n\n${content}`,
            'Translation generated'
        );
    },
    aliases: ["translate", "dich", "language"],
    group: "AI",
    icon: <Languages size={18} />,
    subtext: "Translate between English and Vietnamese",
});

export const continueWritingItem = (editor: BlockNoteEditor) => ({
    title: "Continue Writing",
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            await executeAICommand(
                editor,
                `Start writing an engaging introduction for a new topic. Be creative and informative.`,
                'Content generated'
            );
            return;
        }
        await executeAICommand(
            editor,
            `Continue writing from where this text leaves off. Match the style and tone:\n\n${content}`,
            'Content continued'
        );
    },
    aliases: ["continue", "write", "more"],
    group: "AI",
    icon: <AlignLeft size={18} />,
    subtext: "Continue writing from current content",
});

export const generateFlashcardsItem = (editor: BlockNoteEditor) => ({
    title: "Generate Flashcards",
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error('No content for flashcards');
            return;
        }
        await executeAICommand(
            editor,
            `Create 5 flashcards from the following content. Format each as:\n\n**Q:** [Question]\n**A:** [Answer]\n\nContent:\n${content}`,
            'Flashcards generated'
        );
    },
    aliases: ["flashcards", "cards", "study"],
    group: "AI",
    icon: <BookOpen size={18} />,
    subtext: "Create study flashcards from the note",
});

// ============================================================================
// Get Custom Slash Menu Items
// ============================================================================

export const getCustomSlashMenuItems = (
    editor: BlockNoteEditor
): DefaultReactSuggestionItem[] => {
    return [
        // AI Commands at the top
        insertAIItem(editor),
        continueWritingItem(editor),
        summarizeNoteItem(editor),
        generateOutlineItem(editor),
        explainConceptItem(editor),
        generateQuestionsItem(editor),
        translateNoteItem(editor),
        generateFlashcardsItem(editor),
        // Separator would be nice, but BlockNote doesn't support it natively
        // Default items
        ...getDefaultReactSlashMenuItems(editor),
    ];
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract all text content from the editor
 */
function getAllNoteText(editor: BlockNoteEditor): string {
    const blocks = editor.document;
    return blocks
        .map(block => extractBlockText(block))
        .filter(Boolean)
        .join('\n\n');
}

/**
 * Extract text from a single block
 */
function extractBlockText(block: Block): string {
    if (!block.content) return '';

    if (Array.isArray(block.content)) {
        return block.content
            .map(item => {
                if (typeof item === 'object' && item !== null && 'text' in item) {
                    return (item as { text: string }).text;
                }
                return '';
            })
            .join('');
    }

    return '';
}
