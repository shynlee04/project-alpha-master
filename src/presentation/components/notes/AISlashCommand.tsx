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
    AlignLeft,
    ImagePlus,
    Eye,
    Images,
    Video,
} from 'lucide-react';
import { useAIPromptStore } from '@/lib/notes/ai-prompt-store';
import { generateNoteContent, NoteAIError } from '@/lib/notes/note-ai-service';
import { useAILoadingStore } from '@/lib/notes/ai-loading-store';
import { useAIInsertionStore, generatePendingContentId } from '@/lib/notes/ai-insertion-store';
// 43-06: Prompt History Tracking
import { startPromptTracking, completePromptTracking } from '@/lib/notes/prompt-history-store';
import { toast } from 'sonner';

// ============================================================================
// Translation Helper
// ============================================================================

import i18next from 'i18next';

/**
 * Translation helper for use outside React components
 * Uses the global i18next instance directly instead of require()
 */
function t(key: string, defaultValue?: string): string {
    try {
        const result = i18next.t(key, { defaultValue });
        return typeof result === 'string' ? result : defaultValue || key;
    } catch {
        return defaultValue || key;
    }
}

// ============================================================================
// AI Magic - Open Prompt Dialog
// ============================================================================

export const insertAIItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.magic', 'AI Magic'),
    onItemClick: () => {
        // Open the AI Prompt Dialog
        useAIPromptStore.getState().openPrompt(editor);
    },
    aliases: ["ai", "magic", "generate"],
    group: "AI",
    icon: <Sparkles size={18} />,
    subtext: t('notes.ai.magic.description', 'Generate content with AI'),
});

// ============================================================================
// Helper: Execute AI Command with Loading Toast
// ============================================================================

/**
 * Extended options for AI command execution
 * @story EPIC-42-01 - Block-above-cursor context extraction
 */
interface ExecuteAICommandOptions {
    /** Context mode - defaults to 'above_cursor' for smart context */
    contextMode?: ContextMode;
    /** @deprecated Use contextMode instead */
    includeContext?: boolean;
    /** Replace selection instead of inserting after */
    replaceSelection?: boolean;
}

export async function executeAICommand(
    editor: BlockNoteEditor,
    prompt: string,
    commandName: string = 'AI',
    options?: ExecuteAICommandOptions
): Promise<void> {
    // Get current block ID for loading state tracking
    const cursorPosition = editor.getTextCursorPosition();
    const currentBlockId = cursorPosition?.block?.id || 'unknown';
    
    // Get loading store actions
    const { startBlockLoading, stopBlockLoading, updateLoadingMessage } = useAILoadingStore.getState();
    
    // Start block loading state (EPIC-42-03)
    startBlockLoading(currentBlockId, commandName, 'Preparing...');
    
    // Show loading toast (keep for backward compatibility)
    const toastId = toast.loading(t('notes.ai.generating', `${commandName} generating...`));

    // 43-06: Start prompt history tracking
    const { historyId, startTime } = startPromptTracking(commandName, prompt, {
        contextLength: 0, // Will be updated below
    });

    try {
        // Determine context mode
        // Default to 'above_cursor' for smart context (EPIC-42-01)
        // If legacy includeContext is explicitly false, use 'none'
        let contextMode: ContextMode = 'above_cursor';
        if (options?.contextMode) {
            contextMode = options.contextMode;
        } else if (options?.includeContext === false) {
            contextMode = 'none';
        }
        
        // Update loading message
        updateLoadingMessage(currentBlockId, 'Getting context...');
        
        // Get context based on mode
        const context = getContextByMode(editor, contextMode);
        
        // Build the full prompt with context
        let fullPrompt = prompt;
        if (context.text && context.text.trim().length > 0) {
            fullPrompt = `${prompt}\n\n---\nContext from note:\n${context.text}`;
        }

        // Update loading message
        updateLoadingMessage(currentBlockId, 'Generating content...');

        const result = await generateNoteContent(fullPrompt, { 
            contextBlocks: context.blocks 
        });

        if (!result || result.trim().length === 0) {
            toast.error(t('notes.ai.error.empty', 'AI returned empty content'), { id: toastId });
            return;
        }

        // Update loading message
        updateLoadingMessage(currentBlockId, 'Inserting content...');

// Parse markdown to blocks
        const blocks = await editor.tryParseMarkdownToBlocks(result);

        if (blocks.length === 0) {
            toast.error(t('notes.ai.error.parse', 'Failed to parse AI response'), { id: toastId });
            return;
        }

        // Update loading message
        updateLoadingMessage(currentBlockId, 'Inserting content...');

        // Get cursor position for insertion (EPIC-42-04: Smart content insertion)
        const cursorPosition = editor.getTextCursorPosition();
        const targetBlockId = cursorPosition?.block?.id || 'unknown';

        // Set pending content in insertion store (EPIC-42-04)
        // This will trigger the AIInsertionDialog based on autoInsert setting
        useAIInsertionStore.getState().setPendingContent({
            id: generatePendingContentId(),
            rawContent: result,
            blocks: blocks,
            targetBlockId,
            commandName: commandName || 'AI',
            generatedAt: Date.now(),
            editor: editor,
        });

        // Stop block loading but keep toast for feedback
        toast.success(t('notes.ai.success', `${commandName} complete!`), { id: toastId });
        
        // 43-06: Complete prompt history tracking with success
        completePromptTracking(historyId, startTime, 'success', {
            outputLength: result.length,
        });
    } catch (error) {
        console.error('AI command failed:', error);
        
        // 43-06: Complete prompt history tracking with error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        completePromptTracking(historyId, startTime, 'error', {
            errorMessage,
        });

        if (error instanceof NoteAIError) {
            switch (error.code) {
                case 'NO_AGENT':
                    toast.error(t('notes.ai.error.noAgent', 'Please select an AI agent first'), { id: toastId });
                    break;
                case 'NO_API_KEY':
                    toast.error(t('notes.ai.error.noApiKey', 'No API key configured'), { id: toastId });
                    break;
                default:
                    toast.error(t('notes.ai.error.failed', `${commandName} failed: ${error.message}`), { id: toastId });
            }
        } else {
            toast.error(t('notes.ai.error.retry', 'AI generation failed. Please try again.'), { id: toastId });
        }
    } finally {
        // Always stop block loading (EPIC-42-03)
        stopBlockLoading(currentBlockId);
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

/**
 * Get text only from blocks ABOVE the current cursor position
 * @story EPIC-42-01 - Block-above-cursor context extraction
 */
function getTextAboveCursor(editor: BlockNoteEditor): string {
    try {
        const cursorPosition = editor.getTextCursorPosition();
        if (!cursorPosition?.block?.id) {
            // Fallback to empty if no cursor
            return '';
        }
        
        const currentBlockId = cursorPosition.block.id;
        const allBlocks = editor.document;
        
        // Find index of current block
        const currentIndex = allBlocks.findIndex(b => b.id === currentBlockId);
        
        if (currentIndex <= 0) {
            // No blocks above or cursor at first block
            return '';
        }
        
        // Get blocks 0 to currentIndex-1 (above cursor, not including current)
        const blocksAbove = allBlocks.slice(0, currentIndex);
        
        return blocksAbove
            .map(block => extractBlockText(block))
            .filter(Boolean)
            .join('\n\n');
    } catch (error) {
        console.warn('[AISlashCommand] Failed to get text above cursor:', error);
        return '';
    }
}

/**
 * Get blocks ABOVE the current cursor position
 * @story EPIC-42-01 - Block-above-cursor context extraction
 */
function getBlocksAboveCursor(editor: BlockNoteEditor): Block[] {
    try {
        const cursorPosition = editor.getTextCursorPosition();
        if (!cursorPosition?.block?.id) {
            return [];
        }
        
        const currentBlockId = cursorPosition.block.id;
        const allBlocks = editor.document;
        
        const currentIndex = allBlocks.findIndex(b => b.id === currentBlockId);
        
        if (currentIndex <= 0) {
            return [];
        }
        
        return allBlocks.slice(0, currentIndex);
    } catch (error) {
        console.warn('[AISlashCommand] Failed to get blocks above cursor:', error);
        return [];
    }
}

/**
 * Context mode options for AI commands
 * @story EPIC-42-01 - Block-above-cursor context extraction
 */
export type ContextMode = 'above_cursor' | 'all' | 'none' | 'selection';

/**
 * Get context based on mode
 * @story EPIC-42-01 - Block-above-cursor context extraction
 */
function getContextByMode(editor: BlockNoteEditor, mode: ContextMode): {
    text: string;
    blocks: Block[] | undefined;
} {
    switch (mode) {
        case 'above_cursor':
            return {
                text: getTextAboveCursor(editor),
                blocks: getBlocksAboveCursor(editor),
            };
        case 'all':
            return {
                text: getAllNoteText(editor),
                blocks: editor.document,
            };
        case 'none':
            return {
                text: '',
                blocks: undefined,
            };
        case 'selection':
            // Try to get selected text
            const selectedText = editor.getSelectedText?.() || '';
            return {
                text: selectedText,
                blocks: undefined,
            };
        default:
            return {
                text: getTextAboveCursor(editor),
                blocks: getBlocksAboveCursor(editor),
            };
    }
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
    title: t('notes.ai.summary', 'Summarize Note'),
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error(t('notes.ai.error.noContent', 'No content to summarize'));
            return;
        }
        await executeAICommand(
            editor,
            `Create a clear, concise summary of the following note. Format the summary with bullet points for key takeaways:\n\n${content}`,
            t('notes.ai.summary', 'Summary')
        );
    },
    aliases: ["summary", "summarize", "tldr"],
    group: "AI",
    icon: <ScrollText size={18} />,
    subtext: t('notes.ai.summary.description', 'Generate a summary of the entire note'),
});

export const generateOutlineItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.outline', 'Generate Outline'),
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error(t('notes.ai.error.noContentOutline', 'No content to outline'));
            return;
        }
        await executeAICommand(
            editor,
            `Create a structured outline from the following content. Use markdown headings (## and ###) and bullet points:\n\n${content}`,
            t('notes.ai.outline', 'Outline')
        );
    },
    aliases: ["outline", "structure", "toc"],
    group: "AI",
    icon: <ListChecks size={18} />,
    subtext: t('notes.ai.outline.description', 'Create an outline from the note'),
});

export const explainConceptItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.explain', "Explain Like I'm 5"),
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error(t('notes.ai.error.noContentExplain', 'No content to explain'));
            return;
        }
        await executeAICommand(
            editor,
            `Explain the following content in very simple terms that a child could understand. Use analogies, examples, and simple language:\n\n${content}`,
            t('notes.ai.explain', 'Explanation')
        );
    },
    aliases: ["eli5", "explain", "simplify"],
    group: "AI",
    icon: <Lightbulb size={18} />,
    subtext: t('notes.ai.explain.description', 'Explain the note in simple terms'),
});

export const generateQuestionsItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.questions', 'Generate Questions'),
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error(t('notes.ai.error.noContentQuestions', 'No content for questions'));
            return;
        }
        await executeAICommand(
            editor,
            `Generate 5 thoughtful study questions based on the following content. Format each question with a number and make them help test understanding of the material:\n\n${content}`,
            t('notes.ai.questions', 'Questions')
        );
    },
    aliases: ["questions", "quiz", "test"],
    group: "AI",
    icon: <FileQuestion size={18} />,
    subtext: t('notes.ai.questions.description', 'Create study questions from the note'),
});

export const translateNoteItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.translate', 'Translate Note'),
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error(t('notes.ai.error.noContentTranslate', 'No content to translate'));
            return;
        }
        await executeAICommand(
            editor,
            `Translate the following content. If it's in English, translate to Vietnamese. If it's in Vietnamese, translate to English. Preserve all formatting including headings, lists, and paragraphs:\n\n${content}`,
            t('notes.ai.translate', 'Translation')
        );
    },
    aliases: ["translate", "dich", "language"],
    group: "AI",
    icon: <Languages size={18} />,
    subtext: t('notes.ai.translate.description', 'Translate between English and Vietnamese'),
});

export const continueWritingItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.continue', 'Continue Writing'),
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            await executeAICommand(
                editor,
                `Start writing an engaging introduction for a new topic. Be creative, informative, and set up the reader for what's to come.`,
                t('notes.ai.content', 'Content')
            );
            return;
        }
        await executeAICommand(
            editor,
            `Continue writing from where this text leaves off. Match the style, tone, and formatting of the existing content. Add 2-3 more paragraphs:\n\n${content}`,
            t('notes.ai.continuation', 'Continuation')
        );
    },
    aliases: ["continue", "write", "more"],
    group: "AI",
    icon: <AlignLeft size={18} />,
    subtext: t('notes.ai.continue.description', 'Continue writing from current content'),
});

export const generateFlashcardsItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.flashcards', 'Generate Flashcards'),
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error(t('notes.ai.error.noContentFlashcards', 'No content for flashcards'));
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
            t('notes.ai.flashcards', 'Flashcards')
        );
    },
    aliases: ["flashcards", "cards", "study"],
    group: "AI",
    icon: <BookOpen size={18} />,
    subtext: t('notes.ai.flashcards.description', 'Create study flashcards from the note'),
});

// ============================================================================
// AI Image Generation Block (Story 44-01)
// ============================================================================

/**
 * Insert AI Image Generation Block
 * @story 44-01: Image generation block type
 */
export const insertAIImageItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.image', 'AI Image'),
    onItemClick: () => {
        // Get cursor position for insertion
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new AI Image block
        // Cast to any since this is a custom block type not in the default schema
        const aiImageBlock = {
            type: "aiImage",
            props: {
                prompt: "",
                imageData: "",
                mimeType: "image/png",
                status: "idle",
                errorMessage: "",
                sizeId: "square",
            },
        } as any;
        
        // Insert block after current position
        if (currentBlockId) {
            (editor as any).insertBlocks([aiImageBlock], currentBlockId, "after");
        } else {
            // Append to end of document
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([aiImageBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.image.inserted', 'AI Image block inserted'));
    },
    aliases: ["image", "ai-image", "generate-image", "picture", "illustration"],
    group: "AI",
    icon: <ImagePlus size={18} />,
    subtext: t('notes.ai.image.description', 'Generate images with AI from text prompts'),
});

// ============================================================================
// AI Vision Understanding Block (Story 44-02)
// ============================================================================

/**
 * Insert AI Vision Understanding Block
 * @story 44-02: Image understanding (vision) in blocks
 */
export const insertAIVisionItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.vision', 'AI Vision'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new AI Vision block
        // Cast to any since this is a custom block type not in the default schema
        const aiVisionBlock = {
            type: "aiVision",
            props: {
                analysisMode: "describe",
                images: "[]",
                analysisResult: "",
                customQuestion: "",
                status: "idle",
                errorMessage: "",
                language: "en",
            },
        } as any;
        
        // Insert block after current position
        if (currentBlockId) {
            (editor as any).insertBlocks([aiVisionBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([aiVisionBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.vision.inserted', 'AI Vision block inserted'));
    },
    aliases: ["vision", "ai-vision", "analyze-image", "image-understanding"],
    group: "AI",
    icon: <Eye size={18} />,
    subtext: t('notes.ai.vision.description', 'Analyze images with AI (describe, extract text, understand)'),
});

// ============================================================================
// Sequential Storyboard Block (Story 44-03)
// ============================================================================

/**
 * Insert Sequential Storyboard Block
 * @story 44-03: Sequential multi-image storyboard
 */
export const insertStoryboardItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.storyboard', 'Storyboard'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Storyboard block
        const storyboardBlock = {
            type: "storyboard",
            props: {
                prompt: "",
                frameCount: 3,
                style: "digital-art",
                language: "en",
                frames: "[]",
                status: "idle",
                errorMessage: "",
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([storyboardBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([storyboardBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.storyboard.inserted', 'Storyboard block inserted'));
    },
    aliases: ["storyboard", "comic", "sequential", "frames", "multi-image"],
    group: "AI",
    icon: <Images size={18} />,
    subtext: t('notes.ai.storyboard.description', 'Create sequential visual storyboards with AI'),
});

// ============================================================================
// Video Understanding Block (Story 44-04)
// ============================================================================

/**
 * Insert Video Understanding Block
 * @story 44-04: Video input understanding
 */
export const insertVideoItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.video', 'Video Analysis'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Video Analysis block
        const videoBlock = {
            type: "videoAnalysis",
            props: {
                analysisMode: "describe",
                customQuestion: "",
                videoData: "",
                analysisResult: "",
                frameCount: 5,
                status: "idle",
                errorMessage: "",
                language: "en",
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([videoBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([videoBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.video.inserted', 'Video Analysis block inserted'));
    },
    aliases: ["video", "ai-video", "video-understanding", "analyze-video"],
    group: "AI",
    icon: <Video size={18} />,
    subtext: t('notes.ai.video.description', 'Analyze video content with AI'),
});

// ============================================================================
// Get Custom Slash Menu Items
// ============================================================================

import {
    useSlashCommandStore,
    getLocalizedCommand,
    type CustomSlashCommand,
    promptNeedsRefinement,
} from '@/lib/notes/slash-command-store';
import { usePromptRefinementStore } from './PromptRefinementDialog';
import {
    ListTodo, SpellCheck, Users,
    FileText, MessageSquare, Wand2, Zap,
    Brain, Code, FileCode, Globe, Heart,
    PenTool, Search, Star, Target, Rocket,
    Coffee, Palette, Music, Camera, Mic,
} from 'lucide-react';

// Icon map for custom commands (using already imported icons from top + new ones)
const CUSTOM_ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
    Sparkles, Lightbulb, ListTodo, SpellCheck, Users,
    BookOpen, FileText, MessageSquare, Wand2, Zap,
    Brain, Code, FileCode, Globe, Heart,
    PenTool, Search, Star, Target, Rocket,
    Coffee, Palette, Music, Camera, Mic,
};

/**
 * Create a slash menu item from a custom command
 * @story 43-03: Added support for prompt refinement workflow
 */
function createCustomCommandItem(
    editor: BlockNoteEditor,
    command: CustomSlashCommand
): DefaultReactSuggestionItem {
    const locale = i18next.language || 'en';
    const localized = getLocalizedCommand(command, locale);
    const Icon = CUSTOM_ICON_MAP[command.icon] || Sparkles;

    return {
        title: localized.title,
        onItemClick: async () => {
            // 43-03: Check if this command needs refinement
            const needsRefinement = promptNeedsRefinement(command);
            
            if (needsRefinement) {
                // Get note context for the refinement dialog
                const content = getAllNoteText(editor);
                
                // Open refinement dialog instead of executing directly
                usePromptRefinementStore.getState().openRefinement(
                    command,
                    editor,
                    content,
                    async (finalPrompt: string) => {
                        // Execute with the refined prompt
                        await executeAICommand(
                            editor,
                            finalPrompt,
                            localized.title,
                            { contextMode: 'none' } // Context already included in finalPrompt
                        );
                    }
                );
            } else {
                // Original behavior: execute directly
                const content = getAllNoteText(editor);
                const promptWithContext = content.trim()
                    ? `${command.prompt}\n\nNote content:\n${content}`
                    : command.prompt;

                await executeAICommand(
                    editor,
                    promptWithContext,
                    localized.title
                );
            }
        },
        aliases: command.aliases,
        group: 'AI Custom',
        icon: <Icon size={18} />,
        subtext: localized.description,
    };
}

export const getCustomSlashMenuItems = (
    editor: BlockNoteEditor
): DefaultReactSuggestionItem[] => {
    // Get enabled custom commands from store
    const customCommands = useSlashCommandStore.getState().customCommands
        .filter(cmd => cmd.isEnabled)
        .map(cmd => createCustomCommandItem(editor, cmd));

    return [
        // AI Commands at the top
        insertAIItem(editor),
        insertAIImageItem(editor), // 44-01: AI Image Generation
        insertAIVisionItem(editor), // 44-02: AI Vision/Understanding
        insertStoryboardItem(editor), // 44-03: Sequential Storyboard
        insertVideoItem(editor), // 44-04: Video Understanding
        continueWritingItem(editor),
        summarizeNoteItem(editor),
        generateOutlineItem(editor),
        explainConceptItem(editor),
        generateQuestionsItem(editor),
        translateNoteItem(editor),
        generateFlashcardsItem(editor),
        // User-defined custom commands
        ...customCommands,
        // Default BlockNote items
        ...getDefaultReactSlashMenuItems(editor),
    ];
};
