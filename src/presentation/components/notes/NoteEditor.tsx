/**
 * @fileoverview BlockNote Editor Component
 * @module components/notes/NoteEditor
 * @governance EPIC-26-1
 *
 * Notion-like block editor with auto-save persistence.
 * Uses BlockNote library with 8-bit styling overrides.
 *
 * Features:
 * - Block-based editing (headings, lists, code, quotes)
 * - Slash commands menu
 * - Auto-save with debounce (500ms)
 * - Dark theme integration
 * - Mobile responsive
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';
import { ErrorBoundary } from '@/presentation/components/error/ErrorBoundary';

// Custom Blocks for rich content rendering
import { ImageBlock } from './blocks/ImageBlock';
import { CodeFileBlock } from './blocks/CodeFileBlock';
import { FileAttachmentBlock } from './blocks/FileAttachmentBlock';
// 44-01: AI Image Generation Block
import { AIImageBlock } from './blocks/AIImageBlock';
// 44-02: AI Vision/Understanding Block
import { AIVisionBlock } from './blocks/AIVisionBlock';
// 44-03: Sequential Multi-Image Storyboard Block
import { StoryboardBlock } from './blocks/StoryboardBlock';
// 44-04: Video Understanding Block
import { VideoBlock } from './blocks/VideoBlock';
// 44-05: Text-to-Speech Block
import { TTSBlock } from './blocks/TTSBlock';
// 44-06: Interactive HTML Artifact Block
import { ArtifactBlock } from './blocks/ArtifactBlock';
// 44-07: Video Generation Block (Experimental)
import { VideoGenerationBlock } from './blocks/VideoGenerationBlock';
// 44-08: PowerPoint/Slides Export Block
import { SlidesExportBlock } from './blocks/SlidesExportBlock';
// 44-09: Chart/Diagram Generation Block
import { ChartDiagramBlock } from './blocks/ChartDiagramBlock';
// 44-10: Sequential Transformation Pipeline Block
import { TransformPipelineBlock } from './blocks/TransformPipelineBlock';
// 44-11: Artifact Gallery and Management Block
import { ArtifactGalleryBlock } from './blocks/ArtifactGalleryBlock';
// 44-12: Multi-Step Generation with Blur Animation Block
import { MultiStepGenerationBlock } from './blocks/MultiStepGenerationBlock';

// P1.5-03: Block type alias for compatibility with custom schema
// Using 'any' because the custom schema creates complex generic types
type BlockNoteBlock = any;

import { useNoteStore, useNoteSaveStatus, useIsNoteIndexing } from '@/lib/notes';
import { useNoteNavigationStore } from '@/lib/notes/note-navigation-store';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils'; // Keep existing imports
import { Save, Sparkles } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { toast } from 'sonner';

import { getCustomSlashMenuItems } from './AISlashCommand';
import { NoteStudyMenu } from './NoteStudyMenu';
import { AIPromptDialog } from './AIPromptDialog';
import { AITransformMenu } from './AITransformMenu';
import { AIInsertionDialog } from './AIInsertionDialog';
import { MultiModalImport } from './MultiModalImport';
import { VoiceRecordButton } from './VoiceRecordButton';
// 43-04: AI Prompt Suggestions Panel
import { PromptSuggestionsPanel } from './PromptSuggestionsPanel';
import { SuggestionMenuController } from '@blocknote/react';
// filterSuggestionItems has been removed from @blocknote, using inline filter instead

import './NoteEditor.css';

// ============================================================================
// Helper: Extract text from blocks
// ============================================================================
function extractTextFromBlocks(blocks: BlockNoteBlock[]): string {
    if (!blocks || !Array.isArray(blocks)) return '';

    return blocks.map((block) => {
        if (!block?.content) return '';
        if (Array.isArray(block.content)) {
            return block.content
                .map((item: any) => {
                    if (typeof item === 'object' && item !== null && 'text' in item) {
                        return item.text;
                    }
                    return '';
                })
                .join('');
        }
        return '';
    }).filter(Boolean).join('\n\n');
}

/**
 * Sanitize a single content item for BlockNote
 * Content items must be objects with type, text, and optional styles
 *
 * BlockNote content item structure:
 * - Text content: { type: 'text', text: string, styles: {} }
 * - Other types (mentions, links): similar structure with type-specific props
 */
function sanitizeContentItem(item: any): any {
    // Handle null/undefined
    if (item == null) {
        return null; // Will be filtered out
    }

    // Handle strings - convert to text content
    if (typeof item === 'string') {
        return item.trim() ? {
            type: 'text',
            text: item,
            styles: {},
        } : null;
    }

    // Handle non-object items
    if (typeof item !== 'object') {
        return null;
    }

    // Handle arrays (shouldn't happen in content array, but sanitize anyway)
    if (Array.isArray(item)) {
        return null;
    }

    // Text content type - ensure required fields
    if (item.type === 'text' || !item.type) {
        const text = String(item.text ?? '');
        if (!text.trim()) {
            return null; // Skip empty text items
        }
        return {
            type: 'text',
            text: text,
            styles: typeof item.styles === 'object' && item.styles !== null ? item.styles : {},
        };
    }

    // For other content types (mentions, links, etc.)
    // Only preserve known safe properties to avoid passing unknown data
    const knownProps = ['type', 'text', 'styles', 'href', 'title', 'target'];
    const sanitized: any = {};
    for (const prop of knownProps) {
        if (prop in item && item[prop] !== undefined) {
            sanitized[prop] = item[prop];
        }
    }
    if (!sanitized.type) {
        sanitized.type = 'text';
    }
    if (!sanitized.styles) {
        sanitized.styles = {};
    }

    return sanitized;
}

/**
 * Sanitize block data to prevent ProseMirror "Cannot find node position" errors
 * Filters out malformed or corrupted blocks before loading into editor
 * NOTE: Returns new objects to avoid mutating source blocks (React immutability)
 */
function sanitizeBlocks(blocks: any[]): any[] {
    if (!blocks || !Array.isArray(blocks)) return [];

    const validBlockTypes = new Set([
        'paragraph', 'heading', 'bulletListItem', 'numberedListItem',
        'todoItem', 'toggle', 'text', 'quote', 'callout', 'image',
        'codeFile', 'fileAttachment', 'aiImage', 'aiVision', 'storyboard',
        'videoAnalysis', 'ttsBlock', 'artifactBlock', 'videoGeneration',
        'codeBlock', 'table', 'divider', 'slidesExport', 'chartDiagram',
        'transformPipeline', 'artifactGallery', 'multiStepGeneration'
    ]);

    // Default props required by BlockNote
    const defaultProps = {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
    };

    return blocks
        .filter((block) => {
            // Must be an object with type
            if (!block || typeof block !== 'object') return false;

            // Must have a valid type (or be a valid default block)
            if (block.type && !validBlockTypes.has(block.type)) {
                console.warn('[NoteEditor] Skipping block with unknown type:', block.type);
                return false;
            }

            return true;
        })
        .map((block, index) => {
            const blockType = block.type || 'paragraph';
            const sanitized: any = {};

            // CRITICAL: Ensure id exists (BlockNote requires this)
            sanitized.id = block.id || `block-${Date.now()}-${index}`;

            // Ensure type exists
            sanitized.type = blockType;

            // Ensure props exists with required defaults
            // Custom blocks need their custom props preserved, standard blocks use whitelist
            // Blocks with content: "none" spec should NOT have content property
            // These custom blocks manage their own rendering and don't use text content
            const noContentBlockTypes = new Set([
                'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
                'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
                'videoGeneration', 'slidesExport', 'chartDiagram',
                'transformPipeline', 'artifactGallery', 'multiStepGeneration'
            ]);

            // Custom blocks that need their props preserved
            const customBlockTypes = new Set([
                'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
                'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
                'videoGeneration', 'slidesExport', 'chartDiagram',
                'transformPipeline', 'artifactGallery', 'multiStepGeneration'
            ]);

            if (customBlockTypes.has(blockType)) {
                // CRITICAL: For custom blocks, ALWAYS preserve props (even if empty object)
                // Custom blocks define their own prop schemas with defaults
                sanitized.props = {
                    ...defaultProps, // Base BlockNote defaults
                    ...(block.props && typeof block.props === 'object' ? block.props : {}),
                };
            } else {
                // For standard blocks, only allow known safe props
                sanitized.props = {
                    ...defaultProps,
                };

                if (block.props && typeof block.props === 'object') {
                    // Standard block props whitelist
                    const allowedProps = ['textColor', 'backgroundColor', 'textAlignment', 'level', 'checked'];
                    for (const prop of allowedProps) {
                        if (prop in block.props) {
                            sanitized.props[prop] = block.props[prop];
                        }
                    }
                }
            }

            // CRITICAL: Handle content based on block type
            // Blocks with content: "none" spec must NOT have a content property at all
            // These custom blocks manage their own rendering and don't use text content
            if (noContentBlockTypes.has(blockType)) {
                // CRITICAL: Explicitly delete content if it exists on source block
                // This handles blocks that were stored with content before the fix
                delete (sanitized as any).content;
            } else {
                // For content-using blocks, sanitize and set content
                if (Array.isArray(block.content) && block.content.length > 0) {
                    sanitized.content = block.content
                        .map(sanitizeContentItem)
                        .filter(Boolean); // Remove null/undefined items
                }

                // Always provide an empty array if no content (for content-using blocks)
                if (!sanitized.content) {
                    sanitized.content = [];
                }
            }

            // CRITICAL: Ensure children array exists (BlockNote requires this)
            if (Array.isArray(block.children)) {
                sanitized.children = sanitizeBlocks(block.children);
            } else {
                sanitized.children = [];
            }

            return sanitized;
        });
}

// ============================================================================
// Custom BlockNote Schema
// ============================================================================
// P1.5-03: Custom schema with default blocks + file rendering blocks
const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        image: ImageBlock(),
        codeFile: CodeFileBlock(),
        fileAttachment: FileAttachmentBlock(),
        // 44-01: AI Image Generation Block
        aiImage: AIImageBlock(),
        // 44-02: AI Vision/Understanding Block
        aiVision: AIVisionBlock(),
        // 44-03: Sequential Multi-Image Storyboard Block
        storyboard: StoryboardBlock(),
        // 44-04: Video Understanding Block
        videoAnalysis: VideoBlock(),
        // 44-05: Text-to-Speech Block
        ttsBlock: TTSBlock(),
        // 44-06: Interactive HTML Artifact Block
        artifactBlock: ArtifactBlock(),
        // 44-07: Video Generation Block (Experimental)
        videoGeneration: VideoGenerationBlock(),
        // 44-08: PowerPoint/Slides Export Block
        slidesExport: SlidesExportBlock(),
        // 44-09: Chart/Diagram Generation Block
        chartDiagram: ChartDiagramBlock(),
        // 44-10: Sequential Transformation Pipeline Block
        transformPipeline: TransformPipelineBlock(),
        // 44-11: Artifact Gallery and Management Block
        artifactGallery: ArtifactGalleryBlock(),
        // 44-12: Multi-Step Generation with Blur Animation Block
        multiStepGeneration: MultiStepGenerationBlock(),
    },
});

// ============================================================================
// Types
// ============================================================================

interface NoteEditorProps {
    /** Note ID to edit */
    noteId: string;
    /** Optional CSS class */
    className?: string;
    /** Whether editor is read-only */
    readOnly?: boolean;
}

// ============================================================================
// Debounce Hook
// ============================================================================

function useDebouncedCallback<T extends (...args: BlockNoteBlock[][]) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref on each render
    callbackRef.current = callback;

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    ) as T;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

// ============================================================================
// Component
// ============================================================================

export function NoteEditor({ noteId, className, readOnly = false }: NoteEditorProps) {
    const { t } = useTranslation();
    const updateNote = useNoteStore((state) => state.updateNote);
    const notes = useNoteStore((state) => state.notes);
    const note = notes.get(noteId);
    const saveStatus = useNoteSaveStatus();
    const isIndexing = useIsNoteIndexing(noteId);
    const isNoteDirty = useNoteStore((state) => state.isNoteDirty(noteId));
    const saveNoteToFile = useNoteStore((state) => state.saveNoteToFile);

    // 45-05: Scroll position preservation
    const contentRef = useRef<HTMLDivElement>(null);
    const { setNoteScrollPosition, getNoteScrollPosition } = useNoteNavigationStore();
    const previousNoteIdRef = useRef<string | null>(null);

    // Get initial content from note
    // Fixed: Include noteId in dependencies to ensure proper reactivity on note switch
    const initialContent = useMemo(() => {
        // Always log for debugging
        console.log('[NoteEditor] Computing initialContent for note:', noteId, 'has note:', !!note);

        if (!note?.blocks || note.blocks.length === 0) {
            console.log('[NoteEditor] No blocks, returning undefined (empty editor)');
            return undefined; // BlockNote will use default empty paragraph
        }

        // Debug: Log original blocks
        console.log('[NoteEditor] Original blocks:', JSON.stringify(note.blocks, null, 2));

        try {
            // Sanitize blocks to prevent ProseMirror "Cannot find node position" errors
            const sanitized = sanitizeBlocks(note.blocks);

            // Debug: Log sanitized blocks
            console.log('[NoteEditor] Sanitized blocks:', JSON.stringify(sanitized, null, 2));

            // Validate first block structure before passing to BlockNote
            if (sanitized.length > 0) {
                const firstBlock = sanitized[0];
                console.log('[NoteEditor] First block structure:', {
                    hasId: !!firstBlock.id,
                    hasType: !!firstBlock.type,
                    hasProps: !!firstBlock.props,
                    hasContent: 'content' in firstBlock,
                    hasChildren: !!firstBlock.children,
                    contentType: firstBlock.content === undefined ? 'undefined' : Array.isArray(firstBlock.content) ? 'array' : typeof firstBlock.content,
                    childrenType: Array.isArray(firstBlock.children) ? 'array' : typeof firstBlock.children,
                    id: firstBlock.id,
                    type: firstBlock.type,
                });
            }

            // Deep validation: check each block for known BlockNote issues
            // Filter out invalid blocks instead of failing entirely
            const noContentBlockTypes = new Set([
                'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
                'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
                'videoGeneration', 'slidesExport', 'chartDiagram',
                'transformPipeline', 'artifactGallery', 'multiStepGeneration'
            ]);

            const validBlocks: any[] = [];
            const invalidBlocks: any[] = [];

            for (let i = 0; i < sanitized.length; i++) {
                const block = sanitized[i];
                const blockType = block.type;
                let isValid = true;

                // Check for content: "none" blocks that have content property
                if (noContentBlockTypes.has(blockType)) {
                    if ('content' in block && block.content !== undefined) {
                        console.warn(`[NoteEditor] Removing block ${i} (type: ${blockType}) - has content but shouldn't`, block.id);
                        isValid = false;
                    }
                }

                // CRITICAL: Check table block content structure
                // Tables require a specific 2D array structure for content
                if (blockType === 'table') {
                    const tableContent = block.content;
                    if (!Array.isArray(tableContent) || tableContent.length === 0) {
                        console.warn(`[NoteEditor] Removing table block ${i} (id: ${block.id}) - invalid content structure`, block);
                        isValid = false;
                    } else {
                        // Check each row has cells
                        for (let r = 0; r < tableContent.length; r++) {
                            const row = tableContent[r];
                            if (!Array.isArray(row)) {
                                console.warn(`[NoteEditor] Removing table block ${i} (id: ${block.id}) - row ${r} is not an array`, block);
                                isValid = false;
                                break;
                            }
                        }
                    }
                }

                if (isValid) {
                    validBlocks.push(block);
                } else {
                    invalidBlocks.push({ index: i, id: block.id, type: blockType });
                }
            }

            if (invalidBlocks.length > 0) {
                console.warn(`[NoteEditor] Filtered out ${invalidBlocks.length} invalid blocks:`, invalidBlocks);
                // Use valid blocks instead of crashing
                const result = validBlocks.length > 0 ? validBlocks as BlockNoteBlock[] : undefined;
                console.log('[NoteEditor] Returning initialContent:', result ? `${result.length} blocks (filtered)` : 'undefined');
                return result;
            }

            const result = sanitized.length > 0 ? sanitized as BlockNoteBlock[] : undefined;
            console.log('[NoteEditor] Returning initialContent:', result ? `${result.length} blocks` : 'undefined');
            return result;
        } catch (error) {
            console.error('[NoteEditor] Error sanitizing blocks:', error);
            console.error('[NoteEditor] Error stack:', (error as Error).stack);
            return undefined; // Return undefined to let BlockNote create empty editor
        }
    }, [noteId, note?.blocks]); // Recompute when noteId OR blocks change

    // Create BlockNote editor instance
    // P1.5-03: Pass custom schema with file rendering blocks
    const editor = useCreateBlockNote({
        schema,
        initialContent,
    });

    // 43-04: Track note content for AI suggestions
    const [noteContent, setNoteContent] = useState<string>('');
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    // Update note content when initial blocks change
    useEffect(() => {
        if (note?.blocks) {
            setNoteContent(extractTextFromBlocks(note.blocks as BlockNoteBlock[]));
        }
    }, [note?.blocks]);

    // 45-05: Restore scroll position when note changes
    useEffect(() => {
        if (noteId !== previousNoteIdRef.current) {
            // Save previous note's scroll position before switching
            if (previousNoteIdRef.current && contentRef.current) {
                const scrollTop = contentRef.current.scrollTop;
                setNoteScrollPosition(previousNoteIdRef.current, scrollTop);
            }

            // Restore scroll position for new note
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                if (contentRef.current) {
                    const savedScrollTop = getNoteScrollPosition(noteId);
                    // Clamp to valid range (handle case where content got shorter)
                    const maxScroll = contentRef.current.scrollHeight - contentRef.current.clientHeight;
                    const clampedScrollTop = Math.min(savedScrollTop, Math.max(0, maxScroll));
                    contentRef.current.scrollTop = clampedScrollTop;
                }
            });

            previousNoteIdRef.current = noteId;
        }
    }, [noteId, getNoteScrollPosition, setNoteScrollPosition]);

    // 45-05: Save scroll position on scroll (throttled)
    useEffect(() => {
        const contentElement = contentRef.current;
        if (!contentElement) return;

        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const handleScroll = () => {
            if (timeoutId) clearTimeout(timeoutId);
            // Throttle scroll position saving to 100ms
            timeoutId = setTimeout(() => {
                setNoteScrollPosition(noteId, contentElement.scrollTop);
            }, 100);
        };

        contentElement.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            contentElement.removeEventListener('scroll', handleScroll);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [noteId, setNoteScrollPosition]);

    // Debounced save handler (500ms)
    const debouncedSave = useDebouncedCallback(
        async (blocks: any[]) => {
            if (readOnly) return;

            await updateNote({
                id: noteId,
                blocks,
            });
        },
        500
    );

    // Handle editor changes
    const handleChange = useCallback(() => {
        if (readOnly) return;
        const blocks = editor.document;
        debouncedSave(blocks);
        // 43-04: Update note content for AI suggestions
        setNoteContent(extractTextFromBlocks(blocks));
    }, [editor, debouncedSave, readOnly]);

    // NS-2026-01-07: Handle inserting multi-modal content (PDF, images)
    const handleInsertContent = useCallback((content: string, title: string) => {
        if (readOnly) return;

        // Insert content at cursor position or append to document
        const currentBlocks = editor.document;
        const contentBlock = {
            type: 'paragraph',
            content: [{ type: 'text', text: content, styles: {} }],
        } as BlockNoteBlock;

        // Create heading for the import
        const headingBlock = {
            type: 'heading',
            content: [{ type: 'text', text: title, styles: {} }],
            props: { level: 2 },
        } as BlockNoteBlock;

        // Append to document
        updateNote({
            id: noteId,
            blocks: [...currentBlocks, headingBlock, contentBlock],
        });

        toast.success(t('notes.contentInserted', 'Content inserted'));
    }, [editor, noteId, readOnly, updateNote, t]);

    // NS-2026-01-07: Handle inserting voice transcript
    const handleInsertTranscript = useCallback((transcript: string) => {
        if (readOnly) return;

        // Insert transcript at cursor position or append to document
        const currentBlocks = editor.document;
        const transcriptBlock = {
            type: 'paragraph',
            content: [{ type: 'text', text: transcript, styles: {} }],
        } as BlockNoteBlock;

        // Append to document
        updateNote({
            id: noteId,
            blocks: [...currentBlocks, transcriptBlock],
        });

        toast.success(t('notes.transcriptInserted', 'Transcript inserted'));
    }, [editor, noteId, readOnly, updateNote, t]);

    // Handle manual save to file
    const handleManualSave = useCallback(async () => {
        try {
            await saveNoteToFile(noteId);
            toast.success(t('notes.savedToFile', 'Saved to file'));
        } catch (error) {
            console.error('[NoteEditor] Manual save failed:', error);
            toast.error(
                t('notes.saveToFileFailed', 'Failed to save to file'),
                {
                    description: error instanceof Error ? error.message : 'Unknown error',
                }
            );
        }
    }, [noteId, saveNoteToFile, t]);

    // Render save status indicator
    const renderSaveStatus = () => {
        // Show dirty indicator if note has unsaved changes
        if (isNoteDirty) {
            return (
                <span className="note-editor__status note-editor__status--dirty">
                    {t('notes.unsaved', 'Unsaved changes')}
                </span>
            );
        }

        switch (saveStatus) {
            case 'saving':
                return (
                    <span className="note-editor__status note-editor__status--saving">
                        {t('notes.saving', 'Saving...')}
                    </span>
                );
            case 'saved':
                if (isIndexing) {
                    return (
                        <span className="note-editor__status note-editor__status--saving">
                            {t('notes.indexing', 'Indexing...')}
                        </span>
                    );
                }
                if (note?.isIndexed) {
                    return (
                        <span className="note-editor__status note-editor__status--saved">
                            {t('notes.indexed', 'Indexed')}
                        </span>
                    );
                }
                return (
                    <span className="note-editor__status note-editor__status--saved">
                        {t('notes.saved', 'Saved')}
                    </span>
                );
            case 'error':
                return (
                    <span className="note-editor__status note-editor__status--error">
                        {t('notes.saveError', 'Save failed')}
                    </span>
                );
            default:
                return null;
        }
    };

    if (!note) {
        return (
            <div className={cn('note-editor note-editor--empty', className)}>
                <p className="note-editor__empty-text">
                    {t('notes.selectNote', 'Select a note to start editing')}
                </p>
            </div>
        );
    }

    return (
        <div className={cn('note-editor relative', className)}>
            {/* Status bar */}
            <div className="note-editor__status-bar">
                {note.emoji && <span className="note-editor__emoji">{note.emoji}</span>}
                <span className="note-editor__title">{note.title}</span>
                <div className="note-editor__status-spacer" />
                <div className="flex items-center gap-2">
                    <NoteStudyMenu noteId={noteId} />
                    {/* 43-04: Toggle AI Suggestions Panel */}
                    <Button
                        size="sm"
                        variant={showSuggestions ? 'secondary' : 'ghost'}
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="h-11 px-3"
                        title={t('notes.suggestions.toggle', 'Toggle AI Suggestions')}
                    >
                        <Sparkles size={16} className={showSuggestions ? 'text-primary' : ''} />
                    </Button>
                    {/* NS-2026-01-07: Multi-modal import (PDF, images) */}
                    <MultiModalImport
                        onContentReady={handleInsertContent}
                    />
                    {/* NS-2026-01-07: Voice recording with transcription */}
                    <VoiceRecordButton
                        onTranscriptReady={handleInsertTranscript}
                    />
                    {/* UJ-003: Manual save button with >=44px touch target */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleManualSave}
                        disabled={!isNoteDirty}
                        className="h-11 px-3" // 44px min height for mobile
                        title={t('notes.saveToFile', 'Save to file')}
                    >
                        <Save size={16} className="mr-1" />
                        <span className="hidden sm:inline">
                            {t('notes.save', 'Save')}
                        </span>
                    </Button>
                    {renderSaveStatus()}
                </div>
            </div>

            {/* BlockNote editor */}
            <div ref={contentRef} className="note-editor__content">
                <ErrorBoundary
                    onError={(error) => {
                        console.error('[NoteEditor] BlockNote render error:', error);
                        // Attempt recovery by forcing page reload on critical errors
                        if (error.message.includes('node position') || error.message.includes('Cannot find')) {
                            console.warn('[NoteEditor] Detected corrupted editor state, recommend reloading');
                        }
                    }}
                >
                    <BlockNoteView
                        editor={editor}
                        onChange={handleChange}
                        theme="dark"
                        editable={!readOnly}
                        slashMenu={false}
                    >
                        <SuggestionMenuController
                            triggerCharacter="/"
                            getItems={async (query) =>
                                // Gets all default slash menu items and our custom item.
                                getCustomSlashMenuItems(editor as any).filter((item) =>
                                    item.title.toLowerCase().includes(query.toLowerCase())
                                )
                            }
                        />
                    </BlockNoteView>
                </ErrorBoundary>
                <AIPromptDialog />
                <AIInsertionDialog />
                <AITransformMenu editor={editor as any} />
            </div>

            {/* 43-04: AI Suggestions Panel - Floating panel when showSuggestions is true */}
            {showSuggestions && (
                <div className="absolute right-4 top-16 z-10 w-80 max-h-[calc(100%-5rem)] overflow-y-auto shadow-lg">
                    <PromptSuggestionsPanel
                        editor={editor as any}
                        noteContent={noteContent}
                    />
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Empty State Component
// ============================================================================

export function NoteEditorEmpty() {
    const { t } = useTranslation();
    const createNote = useNoteStore((state) => state.createNote);

    const handleCreateNote = async () => {
        await createNote();
    };

    return (
        <div className="note-editor note-editor--empty">
            <div className="note-editor__empty-content">
                <h3 className="note-editor__empty-title">
                    {t('notes.noNoteSelected', 'No note selected')}
                </h3>
                <p className="note-editor__empty-text">
                    {t('notes.selectOrCreate', 'Select a note from the sidebar or create a new one')}
                </p>
                <button
                    className="note-editor__create-btn"
                    onClick={handleCreateNote}
                    type="button"
                >
                    {t('notes.createNote', 'Create Note')}
                </button>
            </div>
        </div>
    );
}

export default NoteEditor;
