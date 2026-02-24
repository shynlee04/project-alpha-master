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
    Volume2,
    Clapperboard,
    FileDown,
    BarChart3,
    Workflow,
    FolderOpen,
    Layers,
    Info,
    ChevronRight,
    Link,
    Link2,
    Columns,
    Copy, // UX-14: Templates icon
} from 'lucide-react';
import { useAIPromptStore } from '@/lib/notes/ai-prompt-store';
import { generateNoteContent, NoteAIError } from '@/lib/notes/note-ai-service';
import { useAILoadingStore } from '@/lib/notes/ai-loading-store';
import { useAIInsertionStore, generatePendingContentId } from '@/lib/notes/ai-insertion-store';
// 43-06: Prompt History Tracking
import { startPromptTracking, completePromptTracking } from '@/lib/notes/prompt-history-store';
// UX-13: Saved Blocks
import {
    useSavedBlocksStore,
    getBlockTypeIcon,
} from '@/lib/notes/saved-blocks-store';
import type { SavedBlockRecord } from '@/infrastructure/persistence/dexie-db';
import { openSaveBlockDialog } from './SaveBlockDialog';
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
 * Get text BELOW the current cursor position
 * @story UX-08 - Context Scope Selection (below_cursor mode)
 */
function getTextBelowCursor(editor: BlockNoteEditor): string {
    try {
        const cursorPosition = editor.getTextCursorPosition();
        if (!cursorPosition?.block?.id) {
            return '';
        }

        const currentBlockId = cursorPosition.block.id;
        const allBlocks = editor.document;

        // Find index of current block
        const currentIndex = allBlocks.findIndex(b => b.id === currentBlockId);

        if (currentIndex < 0 || currentIndex >= allBlocks.length - 1) {
            // No blocks below cursor
            return '';
        }

        // Get blocks from currentIndex+1 to end (content below cursor)
        const blocksBelow = allBlocks.slice(currentIndex + 1);

        return blocksBelow
            .map(block => extractBlockText(block))
            .filter(Boolean)
            .join('\n\n');
    } catch (error) {
        console.warn('[AISlashCommand] Failed to get text below cursor:', error);
        return '';
    }
}

/**
 * Get blocks BELOW the current cursor position
 * @story UX-08 - Context Scope Selection (below_cursor mode)
 */
function getBlocksBelowCursor(editor: BlockNoteEditor): Block[] {
    try {
        const cursorPosition = editor.getTextCursorPosition();
        if (!cursorPosition?.block?.id) {
            return [];
        }

        const currentBlockId = cursorPosition.block.id;
        const allBlocks = editor.document;

        const currentIndex = allBlocks.findIndex(b => b.id === currentBlockId);

        if (currentIndex < 0 || currentIndex >= allBlocks.length - 1) {
            return [];
        }

        return allBlocks.slice(currentIndex + 1);
    } catch (error) {
        console.warn('[AISlashCommand] Failed to get blocks below cursor:', error);
        return [];
    }
}

/**
 * Context mode options for AI commands
 * @story EPIC-42-01 - Block-above-cursor context extraction
 * @story UX-08 - Context Scope Selection (added below_cursor mode)
 */
export type ContextMode = 'above_cursor' | 'below_cursor' | 'all' | 'none' | 'selection';

/**
 * Get context based on mode
 * @story EPIC-42-01 - Block-above-cursor context extraction
 * @story UX-08 - Context Scope Selection (added below_cursor mode)
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
        case 'below_cursor':
            return {
                text: getTextBelowCursor(editor),
                blocks: getBlocksBelowCursor(editor),
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
// Text-to-Speech Block (Story 44-05)
// ============================================================================

/**
 * Insert Text-to-Speech Block
 * @story 44-05: Text-to-speech output block
 */
export const insertTTSItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.tts', 'Text-to-Speech'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new TTS block
        const ttsBlock = {
            type: "ttsBlock",
            props: {
                text: "",
                voiceName: "",
                speed: 1,
                volume: 1,
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([ttsBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([ttsBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.tts.inserted', 'Text-to-Speech block inserted'));
    },
    aliases: ["tts", "speak", "read-aloud", "voice", "speech"],
    group: "AI",
    icon: <Volume2 size={18} />,
    subtext: t('notes.ai.tts.description', 'Read text aloud with text-to-speech'),
});

// ============================================================================
// Interactive HTML Artifact Block (Story 44-06)
// ============================================================================

/**
 * Insert Interactive HTML Artifact Block
 * @story 44-06: Interactive HTML artifact block
 */
export const insertArtifactItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.artifact', 'HTML Artifact'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Artifact block
        const artifactBlock = {
            type: "artifactBlock",
            props: {
                html: "",
                css: "",
                js: "",
                title: "Interactive Artifact",
                source: "user-created",
                height: 300,
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([artifactBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([artifactBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.artifact.inserted', 'HTML Artifact block inserted'));
    },
    aliases: ["artifact", "html", "embed", "interactive", "widget", "code"],
    group: "AI",
    icon: <Code size={18} />,
    subtext: t('notes.ai.artifact.description', 'Embed interactive HTML/CSS/JS content'),
});

// ============================================================================
// Video Generation Block (Story 44-07 - Experimental)
// ============================================================================

/**
 * Insert Video Generation Block
 * @story 44-07: Video generation block (experimental - requires Veo API access)
 */
export const insertVideoGenItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.videogen', 'Generate Video'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Video Generation block
        const videoGenBlock = {
            type: "videoGeneration",
            props: {
                prompt: "",
                stylePreset: "cinematic",
                videoData: "",
                status: "idle",
                progressMessage: "",
                errorMessage: "",
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([videoGenBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([videoGenBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.videogen.inserted', 'Video Generation block inserted'));
    },
    aliases: ["video-gen", "generate-video", "veo", "ai-video", "create-video"],
    group: "AI",
    icon: <Clapperboard size={18} />,
    subtext: t('notes.ai.videogen.description', 'Generate videos with AI (Experimental - requires Veo access)'),
});

// ============================================================================
// Slides Export Block (Story 44-08)
// ============================================================================

/**
 * Insert Slides Export Block
 * @story 44-08: PowerPoint/Slides Export
 */
export const insertSlidesItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.slides.title', 'PowerPoint Export'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Slides Export block
        const slidesBlock = {
            type: "slidesExport",
            props: {
                title: t('notes.ai.slides.titlePlaceholder', 'My Presentation'),
                author: 'Project Alpha',
                filename: 'presentation.pptx',
                slides: [],
                status: 'idle',
                errorMessage: '',
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([slidesBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([slidesBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.slides.inserted', 'Slides Export block inserted'));
    },
    aliases: ["slides", "powerpoint", "pptx", "export-presentation", "create-deck"],
    group: "AI",
    icon: <FileDown size={18} />,
    subtext: t('notes.ai.slides.description', 'Export notes as PowerPoint presentation'),
});

/**
 * Insert Chart/Diagram Block
 * @story 44-09: Chart/Diagram Generation
 */
export const insertChartDiagramItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.chart.title', 'Chart & Diagram'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Chart/Diagram block
        const chartBlock = {
            type: "chartDiagram",
            props: {
                title: t('notes.ai.chart.titlePlaceholder', 'Data Visualization'),
                mode: 'chart',
                chartType: 'bar',
                diagramType: 'flowchart',
                dataJson: '[]',
                mermaidCode: '',
                status: 'idle',
                errorMessage: '',
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([chartBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([chartBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.chart.inserted', 'Chart/Diagram block inserted'));
    },
    aliases: ["chart", "diagram", "mermaid", "flowchart", "bar-chart", "pie-chart", "graph", "visualization"],
    group: "AI",
    icon: <BarChart3 size={18} />,
    subtext: t('notes.ai.chart.description', 'Create charts and diagrams with AI'),
});

/**
 * Insert Transformation Pipeline Block
 * @story 44-10: Sequential Transformation Pipeline
 */
export const insertTransformPipelineItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.pipeline.title', 'Transform Pipeline'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Transform Pipeline block
        const pipelineBlock = {
            type: "transformPipeline",
            props: {
                title: t('notes.ai.pipeline.titlePlaceholder', 'My Pipeline'),
                inputText: '',
                pipelineJson: '[]',
                status: 'idle',
                errorMessage: '',
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([pipelineBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([pipelineBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.pipeline.inserted', 'Transform Pipeline block inserted'));
    },
    aliases: ["pipeline", "transform", "chain", "workflow", "sequence", "multi-step"],
    group: "AI",
    icon: <Workflow size={18} />,
    subtext: t('notes.ai.pipeline.description', 'Chain multiple AI transformations'),
});

/**
 * Insert Artifact Gallery Block
 * @story 44-11: Artifact Gallery and Management
 */
export const insertArtifactGalleryItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.gallery.title', 'Artifact Gallery'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Artifact Gallery block
        const galleryBlock = {
            type: "artifactGallery",
            props: {
                viewMode: 'grid',
                showFilters: 'false',
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([galleryBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([galleryBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.gallery.inserted', 'Artifact Gallery block inserted'));
    },
    aliases: ["gallery", "artifacts", "browse", "manage", "collection", "ai-content"],
    group: "AI",
    icon: <FolderOpen size={18} />,
    subtext: t('notes.ai.gallery.description', 'Browse and manage AI-generated content'),
});

/**
 * Insert Multi-Step Generation Block
 * @story 44-12: Multi-step generation with blur animation (FINAL)
 */
export const insertMultiStepItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.multistep.title', 'Multi-Step Generation'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;
        
        // Create new Multi-Step Generation block
        const multistepBlock = {
            type: "multiStepGeneration",
            props: {
                stepsJson: '[]',
                configJson: '{"autoReveal":true,"revealDelay":300,"chainContext":true}',
                pipelineStatus: 'idle',
                isEditing: 'true',
            },
        } as any;
        
        if (currentBlockId) {
            (editor as any).insertBlocks([multistepBlock], currentBlockId, "after");
        } else {
            const doc = editor.document;
            if (doc.length > 0) {
                (editor as any).insertBlocks([multistepBlock], doc[doc.length - 1], "after");
            }
        }
        
        toast.info(t('notes.ai.multistep.inserted', 'Multi-Step Generation block inserted'));
    },
    aliases: ["multistep", "pipeline", "blur", "reveal", "chain", "orchestrate", "sequence"],
    group: "AI",
    icon: <Layers size={18} />,
    subtext: t('notes.ai.multistep.description', 'Generate content step-by-step with blur reveal'),
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
 * @story UX-13: Added usage tracking
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
            // UX-13: Record command usage
            useSlashCommandStore.getState().recordUsage(command.id);

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

/**
 * Create a recently used command item with usage count badge
 * @story UX-13: Recently used commands section
 */
function createRecentCommandItem(
    editor: BlockNoteEditor,
    command: CustomSlashCommand
): DefaultReactSuggestionItem {
    const locale = i18next.language || 'en';
    const localized = getLocalizedCommand(command, locale);
    const Icon = CUSTOM_ICON_MAP[command.icon] || Sparkles;

    return {
        title: localized.title,
        onItemClick: async () => {
            // Record usage again on re-execution
            useSlashCommandStore.getState().recordUsage(command.id);

            const needsRefinement = promptNeedsRefinement(command);

            if (needsRefinement) {
                const content = getAllNoteText(editor);
                usePromptRefinementStore.getState().openRefinement(
                    command,
                    editor,
                    content,
                    async (finalPrompt: string) => {
                        await executeAICommand(
                            editor,
                            finalPrompt,
                            localized.title,
                            { contextMode: 'none' }
                        );
                    }
                );
            } else {
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
        group: 'Recently Used',
        icon: <Icon size={18} />,
        subtext: `${localized.description} (${command.useCount || 0} uses)`,
    };
}

// ============================================================================
// UX-09: Toggle and Callout Blocks
// ============================================================================

/**
 * Insert a toggle list item (collapsible list)
 * Uses updateBlock to change the current block to a toggleListItem
 */
export const insertToggleListItem = (editor: BlockNoteEditor) => ({
    title: t('notes.blocks.toggle', 'Toggle List'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        if (!cursorPosition?.block) return;

        // Change the current block to a toggle list item
        editor.updateBlock(cursorPosition.block, {
            type: 'toggleListItem',
            props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
            },
        });
    },
    aliases: ['toggle', 'collapsible', 'accordion', 'togglelist'],
    group: 'Basic Blocks',
    icon: <ChevronRight size={18} />,
    subtext: t('notes.blocks.toggle.description', 'Collapsible list item'),
});

/**
 * Insert a callout block (info/warning/error/success/tip)
 * Uses updateBlock to change the current block to a callout
 */
export const insertCalloutBlock = (editor: BlockNoteEditor, calloutType: 'info' | 'warning' | 'error' | 'success' | 'tip' = 'info') => {
    const typeLabels: Record<string, string> = {
        info: t('notes.blocks.callout.info', 'Info Callout'),
        warning: t('notes.blocks.callout.warning', 'Warning Callout'),
        error: t('notes.blocks.callout.error', 'Error Callout'),
        success: t('notes.blocks.callout.success', 'Success Callout'),
        tip: t('notes.blocks.callout.tip', 'Tip Callout'),
    };

    return {
        title: typeLabels[calloutType],
        onItemClick: () => {
            const cursorPosition = editor.getTextCursorPosition();
            if (!cursorPosition?.block) return;

            // Change the current block to a callout
            // Use type assertion because BlockNoteEditor doesn't know about custom schema
            (editor.updateBlock as any)(cursorPosition.block, {
                type: 'callout',
                props: {
                    calloutType: calloutType,
                    textAlignment: 'left',
                },
            });
        },
        aliases: ['callout', 'info', 'alert', 'note', calloutType],
        group: 'Basic Blocks',
        icon: <Info size={18} />,
        subtext: t('notes.blocks.callout.description', 'Highlighted callout box'),
    };
};

// ============================================================================
// UX-10: Block References
// ============================================================================

/**
 * Insert a block reference (^blockId)
 * Creates a reference block that links to another block in the document
 */
export const insertBlockReference = (editor: BlockNoteEditor) => {
    return {
        title: t('notes.blocks.reference.title', 'Block Reference'),
        onItemClick: () => {
            const cursorPosition = editor.getTextCursorPosition();
            if (!cursorPosition?.block) return;

            // Change the current block to a reference block
            // The block will be in edit mode, prompting user to enter block ID
            (editor.updateBlock as any)(cursorPosition.block, {
                type: 'reference',
                props: {
                    referencedBlockId: '', // Empty = edit mode, user will enter ID
                    mode: 'inline',
                    textAlignment: 'left',
                },
            });
        },
        aliases: ['ref', 'reference', 'blockref', 'link', '^'],
        group: 'Basic Blocks',
        icon: <Link size={18} />,
        subtext: t('notes.blocks.reference.description', 'Link to another block (^blockId)'),
    };
};

// ============================================================================
// UX-11: Column Layouts
// ============================================================================

/**
 * Insert a column layout block
 * Creates a multi-column container for organizing content
 */
export const insertColumnBlock = (editor: BlockNoteEditor) => {
    return {
        title: t('notes.blocks.column.title', 'Column Layout'),
        onItemClick: () => {
            const cursorPosition = editor.getTextCursorPosition();
            if (!cursorPosition?.block) return;

            // Change the current block to a column block
            (editor.updateBlock as any)(cursorPosition.block, {
                type: 'column',
                props: {
                    columnCount: 2, // Default to 2 columns
                    columnRatios: JSON.stringify([6, 6]), // Equal 50/50 split
                    textAlignment: 'left',
                },
            });
        },
        aliases: ['column', 'columns', 'col', '2col', '3col'],
        group: 'Basic Blocks',
        icon: <Columns size={18} />,
        subtext: t('notes.blocks.column.description', 'Multi-column layout container'),
    };
};

/**
 * Insert a synced block
 * Creates a block that mirrors content across all instances in the sync group
 */
export const insertSyncedBlock = (editor: BlockNoteEditor) => {
    return {
        title: t('notes.blocks.synced.title', 'Synced Block'),
        onItemClick: () => {
            const cursorPosition = editor.getTextCursorPosition();
            if (!cursorPosition?.block) return;

            // Generate sync group ID
            const syncGroupId = crypto.randomUUID();
            const sourceBlockId = crypto.randomUUID();

            // Change the current block to a synced block
            (editor.updateBlock as any)(cursorPosition.block, {
                type: 'synced',
                props: {
                    syncGroupId,
                    sourceBlockId,
                    sourceNoteId: '', // Will be set when note is saved
                    textAlignment: 'left',
                },
            });
        },
        aliases: ['sync', 'synced', 'link', 'mirror'],
        group: 'Basic Blocks',
        icon: <Link2 size={18} />,
        subtext: t('notes.blocks.synced.description', 'Sync content across multiple instances'),
    };
};

// ============================================================================
// UX-13: Saved Blocks Menu Items
// ============================================================================

/**
 * Get saved blocks menu items for the slash command
 * Returns recent and favorite saved blocks as slash menu items
 * @story UX-13 - Database Backed Blocks
 */
function getSavedBlocksMenuItems(
    editor: BlockNoteEditor
): DefaultReactSuggestionItem[] {
    const store = useSavedBlocksStore.getState();

    // Get recent blocks (max 5) and favorite blocks
    const recentBlocks = store.getRecentBlocks(5);
    const favoriteBlocks = store.getFavoriteBlocks();

    // Combine and deduplicate, keeping favorites first
    const combinedBlocks: SavedBlockRecord[] = [
        ...favoriteBlocks.filter(b => !recentBlocks.some(r => r.id === b.id)),
        ...recentBlocks,
    ].slice(0, 8); // Limit to 8 items total

    if (combinedBlocks.length === 0) {
        return [];
    }

    return combinedBlocks.map((block) => {
        const iconName = getBlockTypeIcon(block.blockType) as keyof typeof IMPORTED_ICONS;
        const IconComponent = IMPORTED_ICONS[iconName] || FileText;

        return {
            title: block.name,
            onItemClick: async () => {
                await insertSavedBlock(editor, block);
            },
            aliases: ['saved', block.blockType, ...block.tags.slice(0, 2)],
            group: block.isFavorite ? 'Saved Blocks (⭐ Favorites)' : 'Saved Blocks',
            icon: <IconComponent size={18} />,
            subtext: block.description || `${block.blockType} block`,
        };
    });
}

/**
 * UX-14: Get templates menu items for the slash command
 * Returns all saved templates as slash menu items
 * Templates are separated from regular saved blocks
 */
function getTemplatesMenuItems(
    editor: BlockNoteEditor
): DefaultReactSuggestionItem[] {
    const store = useSavedBlocksStore.getState();
    const templates = store.getTemplates();

    if (templates.length === 0) {
        return [];
    }

    return templates.map((template) => {
        const iconName = getBlockTypeIcon(template.blockType) as keyof typeof IMPORTED_ICONS;
        const IconComponent = IMPORTED_ICONS[iconName] || Copy;

        return {
            title: template.name,
            onItemClick: async () => {
                await insertSavedBlock(editor, template);
            },
            aliases: ['template', template.blockType, ...template.tags.slice(0, 2)],
            group: 'Templates',
            icon: <IconComponent size={18} />,
            subtext: template.description || `${template.blockType} template`,
        };
    });
}

/**
 * Insert a saved block into the editor
 * @story UX-13 - Database Backed Blocks
 */
async function insertSavedBlock(
    editor: BlockNoteEditor,
    block: SavedBlockRecord
): Promise<void> {
    try {
        const cursorPosition = editor.getTextCursorPosition();
        const currentBlockId = cursorPosition?.block?.id;

        // Get the block data (BlockNote JSON structure)
        const blockData = block.blockData as unknown;

        if (!blockData) {
            toast.error(t('notes.blocks.saved.error.noData', 'Block data is empty'));
            return;
        }

        // If blockData is an array (multiple blocks), insert all
        if (Array.isArray(blockData)) {
            if (currentBlockId) {
                (editor as any).insertBlocks(blockData, currentBlockId, 'after');
            } else {
                // Append to end
                const doc = editor.document;
                if (doc.length > 0) {
                    (editor as any).insertBlocks(blockData, doc[doc.length - 1], 'after');
                }
            }
        } else if (typeof blockData === 'object' && blockData !== null) {
            // Single block
            if (currentBlockId) {
                (editor as any).insertBlocks([blockData], currentBlockId, 'after');
            } else {
                const doc = editor.document;
                if (doc.length > 0) {
                    (editor as any).insertBlocks([blockData], doc[doc.length - 1], 'after');
                }
            }
        } else {
            toast.error(t('notes.blocks.saved.error.invalid', 'Invalid block data format'));
            return;
        }

        // Record usage
        await useSavedBlocksStore.getState().recordUsage(block.id);

        toast.success(t('notes.blocks.saved.inserted', `Inserted "${block.name}"`));
    } catch (error) {
        console.error('[SavedBlocks] Failed to insert block:', error);
        toast.error(t('notes.blocks.saved.error.insert', 'Failed to insert saved block'));
    }
}

// Icon lookup map for saved blocks
const IMPORTED_ICONS = {
    FileText,
    Info,
    ChevronRight,
    Link,
    Columns,
    Link2,
    ImagePlus,
    Eye,
    BarChart3,
    Box: FileText, // Fallback
} as const;

// ============================================================================
// UX-13: Save Block to Library
// ============================================================================

/**
 * Save the current block to the library
 * @story UX-13 - Database Backed Blocks
 */
export const saveToLibraryItem = (editor: BlockNoteEditor) => ({
    title: t('notes.blocks.saveToLibrary.title', 'Save to Library'),
    onItemClick: () => {
        const cursorPosition = editor.getTextCursorPosition();
        if (!cursorPosition?.block) {
            toast.error(t('notes.blocks.save.error.noBlock', 'No block to save'));
            return;
        }

        // Get the current block
        const currentBlock = cursorPosition.block;

        // Generate a suggested name from block content
        let suggestedName = 'My Block';
        if (currentBlock.content && Array.isArray(currentBlock.content)) {
            const textContent = currentBlock.content
                .filter((item: any) => item?.text)
                .map((item: any) => item.text)
                .join(' ')
                .trim();
            if (textContent) {
                suggestedName = textContent.slice(0, 50);
            }
        }

        // Open the save block dialog
        openSaveBlockDialog(currentBlock, suggestedName);
    },
    aliases: ['save', 'library', 'save-block', 'favorite', 'bookmark'],
    group: 'Basic Blocks',
    icon: <Star size={18} />,
    subtext: t('notes.blocks.saveToLibrary.description', 'Save this block for reuse'),
});

export const getCustomSlashMenuItems = (
    editor: BlockNoteEditor
): DefaultReactSuggestionItem[] => {
    const store = useSlashCommandStore.getState();

    // UX-13: Get recently used commands (with usage history)
    const recentCommands = store.getRecentCommands(5)
        .filter(cmd => cmd.isEnabled)
        .map(cmd => createRecentCommandItem(editor, cmd));

    // Get enabled custom commands from store
    const customCommands = store.customCommands
        .filter(cmd => cmd.isEnabled)
        .map(cmd => createCustomCommandItem(editor, cmd));

    // UX-13: Get saved blocks menu items
    const savedBlocksItems = getSavedBlocksMenuItems(editor);

    // UX-14: Get templates menu items
    const templatesItems = getTemplatesMenuItems(editor);

    return [
        // AI Commands at the top
        insertAIItem(editor),
        insertAIImageItem(editor), // 44-01: AI Image Generation
        insertAIVisionItem(editor), // 44-02: AI Vision/Understanding
        insertStoryboardItem(editor), // 44-03: Sequential Storyboard
        insertVideoItem(editor), // 44-04: Video Understanding
        insertTTSItem(editor), // 44-05: Text-to-Speech
        insertArtifactItem(editor), // 44-06: HTML Artifact
        insertVideoGenItem(editor), // 44-07: Video Generation (Experimental)
        insertSlidesItem(editor), // 44-08: PowerPoint/Slides Export
        insertChartDiagramItem(editor), // 44-09: Chart/Diagram Generation
        insertTransformPipelineItem(editor), // 44-10: Sequential Transformation Pipeline
        insertArtifactGalleryItem(editor), // 44-11: Artifact Gallery and Management
        insertMultiStepItem(editor), // 44-12: Multi-Step Generation with Blur Animation
        continueWritingItem(editor),
        summarizeNoteItem(editor),
        generateOutlineItem(editor),
        explainConceptItem(editor),
        generateQuestionsItem(editor),
        translateNoteItem(editor),
        generateFlashcardsItem(editor),
        // UX-09: Toggle and Callout blocks
        insertToggleListItem(editor),
        insertCalloutBlock(editor, 'info'),
        insertCalloutBlock(editor, 'warning'),
        insertCalloutBlock(editor, 'error'),
        insertCalloutBlock(editor, 'success'),
        insertCalloutBlock(editor, 'tip'),
        // UX-10: Block References
        insertBlockReference(editor),
        // UX-11: Column Layouts
        insertColumnBlock(editor),
        // UX-12: Synced Blocks
        insertSyncedBlock(editor),
        // UX-13: Save to Library
        saveToLibraryItem(editor),
        // UX-13: Recently used commands section (if any)
        ...(recentCommands.length > 0 ? recentCommands : []),
        // UX-13: Saved Blocks section
        ...savedBlocksItems,
        // UX-14: Templates section
        ...templatesItems,
        // User-defined custom commands
        ...customCommands,
        // Default BlockNote items
        ...getDefaultReactSlashMenuItems(editor),
    ];
};
