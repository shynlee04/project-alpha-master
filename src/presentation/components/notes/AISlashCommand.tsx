/**
 * @fileoverview AI Slash Commands for BlockNote Editor
 * @module components/notes/AISlashCommand
 * @story NR-05 - Implement Command Palette AI Actions
 * @updated 2026-01-01 - Fixed async command execution with loading states
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
import { generateNoteContent, NoteAIError } from '@/lib/notes/note-ai-service';
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
// Helper: Execute AI Command with Loading Toast
// ============================================================================

async function executeAICommand(
    editor: BlockNoteEditor,
    prompt: string,
    commandName: string = 'AI'
): Promise<void> {
    // Show loading toast
    const toastId = toast.loading(`${commandName} generating...`);

    try {
        const result = await generateNoteContent(prompt);

        if (!result || result.trim().length === 0) {
            toast.error('AI returned empty content', { id: toastId });
            return;
        }

        // Parse markdown to blocks
        const blocks = await editor.tryParseMarkdownToBlocks(result);

        if (blocks.length === 0) {
            toast.error('Failed to parse AI response', { id: toastId });
            return;
        }

        // Get current cursor position
        const cursorPosition = editor.getTextCursorPosition();

        // Insert blocks after current position
        editor.insertBlocks(blocks, cursorPosition.block, 'after');

        // Move cursor to end of inserted content
        const lastInsertedBlock = blocks[blocks.length - 1];
        if (lastInsertedBlock?.id) {
            editor.setTextCursorPosition(lastInsertedBlock.id, 'end');
        }

        toast.success(`${commandName} complete!`, { id: toastId });
    } catch (error) {
        console.error('AI command failed:', error);

        if (error instanceof NoteAIError) {
            switch (error.code) {
                case 'NO_AGENT':
                    toast.error('Please select an AI agent first', { id: toastId });
                    break;
                case 'NO_API_KEY':
                    toast.error('No API key configured', { id: toastId });
                    break;
                default:
                    toast.error(`${commandName} failed: ${error.message}`, { id: toastId });
            }
        } else {
            toast.error('AI generation failed. Please try again.', { id: toastId });
        }
    }
}

// ============================================================================
// Helper: Get All Note Text
// ============================================================================

function getAllNoteText(editor: BlockNoteEditor): string {
    const blocks = editor.document;
    return blocks
        .map(block => extractBlockText(block))
        .filter(Boolean)
        .join('\n\n');
}

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
            `Create a clear, concise summary of the following note. Format the summary with bullet points for key takeaways:\n\n${content}`,
            'Summary'
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
            `Create a structured outline from the following content. Use markdown headings (## and ###) and bullet points:\n\n${content}`,
            'Outline'
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
            `Explain the following content in very simple terms that a child could understand. Use analogies, examples, and simple language:\n\n${content}`,
            'Explanation'
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
            `Generate 5 thoughtful study questions based on the following content. Format each question with a number and make them help test understanding of the material:\n\n${content}`,
            'Questions'
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
            `Translate the following content. If it's in English, translate to Vietnamese. If it's in Vietnamese, translate to English. Preserve all formatting including headings, lists, and paragraphs:\n\n${content}`,
            'Translation'
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
                `Start writing an engaging introduction for a new topic. Be creative, informative, and set up the reader for what's to come.`,
                'Content'
            );
            return;
        }
        await executeAICommand(
            editor,
            `Continue writing from where this text leaves off. Match the style, tone, and formatting of the existing content. Add 2-3 more paragraphs:\n\n${content}`,
            'Continuation'
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
            `Create 5 flashcards from the following content. Format each flashcard as:

**Q:** [Question]
**A:** [Answer]

---

Content to create flashcards from:
${content}`,
            'Flashcards'
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
        // Default BlockNote items
        ...getDefaultReactSlashMenuItems(editor),
    ];
};
