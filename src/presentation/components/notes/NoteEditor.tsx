/**
 * @fileoverview BlockNote Editor Component
 * @module components/notes/NoteEditor
 * @governance EPIC-26-1, EPIC-UX-01
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
 * - UX-03: Multi-block selection with drag handle
 * - UX-03: Selection info indicator
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreateBlockNote, SideMenuController, useSelectedBlocks } from '@blocknote/react';
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
// UX-09: Toggle and Callout Blocks
import { CalloutBlock } from './blocks/CalloutBlock';
// UX-10: Block References
import { ReferenceBlock } from './blocks/ReferenceBlock';
// UX-11: Column Layouts
import { ColumnBlock } from './blocks/ColumnBlock';
// UX-12: Synced Blocks
import { SyncedBlock } from './blocks/SyncedBlock';

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

// EPIC-0.5-02: File event bus for reactive updates
import { fileEventBus } from '@/infrastructure/events/file-event-bus';
import { useProjectContext } from '@/infrastructure/context/project-context';

// Import FileEvent type for proper type annotation
import type { FileEvent } from '@/infrastructure/events/types';

import { getCustomSlashMenuItems } from './AISlashCommand';
import { NoteStudyMenu } from './NoteStudyMenu';
// UX-13: Save Block Dialog
import { SaveBlockDialog, useSaveBlockDialog } from './SaveBlockDialog';
import { AIPromptDialog } from './AIPromptDialog';
import { AITransformMenu } from './AITransformMenu';
import { AIInsertionDialog } from './AIInsertionDialog';
import { MultiModalImport } from './MultiModalImport';
import { VoiceRecordButton } from './VoiceRecordButton';
// 43-04: AI Prompt Suggestions Panel
import { PromptSuggestionsPanel } from './PromptSuggestionsPanel';
import { SuggestionMenuController } from '@blocknote/react';
// filterSuggestionItems has been removed from @blocknote, using inline filter instead
// UX-07: In-Block AI Generation UI
import {
    InBlockAIPopup,
    FloatingAIButton,
    useEmptyBlockDetection,
    type ContextScope,
    type AIAction,
} from './InBlockAIPopup';

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
        'transformPipeline', 'artifactGallery', 'multiStepGeneration',
        'reference', // UX-10: Block references
        'column', // UX-11: Column layouts
        'synced' // UX-12: Synced blocks
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
                'transformPipeline', 'artifactGallery', 'multiStepGeneration',
                // UX-09-11: Container blocks with content
                // 'callout', // UX-09: Has inline content - NOT a no-content block
                'reference', // UX-10: Has content: "none" - uses contentSnapshot prop
                // 'column', // UX-11: Has inline content - NOT a no-content block
            ]);

            // Custom blocks that need their props preserved
            const customBlockTypes = new Set([
                'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
                'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
                'videoGeneration', 'slidesExport', 'chartDiagram',
                'transformPipeline', 'artifactGallery', 'multiStepGeneration',
                // UX-09-12: Container blocks with custom props
                'callout', // UX-09: Has calloutType prop
                'reference', // UX-10: Has referencedBlockId, referenceMode props
                'column', // UX-11: Has columnCount, columnRatios props
                'synced', // UX-12: Has syncGroupId, sourceBlockId, sourceNoteId props
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
        // UX-09: Callout Block (Notion-style info boxes)
        callout: CalloutBlock(),
        // UX-10: Block References (Obsidian-style ^blockId)
        reference: ReferenceBlock(),
        // UX-11: Column Layouts (Multi-column containers)
        column: ColumnBlock(),
        // UX-12: Synced Blocks (Content mirroring across instances)
        synced: SyncedBlock(),
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
// UX-03: Selection Info Component
// ============================================================================
// Displays the number of currently selected blocks in the editor
interface SelectionInfoProps {
    editor: ReturnType<typeof useCreateBlockNote>;
}

function SelectionInfo({ editor }: SelectionInfoProps) {
    const selectedBlocks = useSelectedBlocks(editor);

    if (selectedBlocks.length <= 1) {
        return null; // Don't show for single or no selection
    }

    return (
        <div className="fixed bottom-20 right-4 z-[var(--z-panel)] bg-[var(--card)] border border-[var(--border)] rounded-[4px] px-3 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] text-sm">
            <span className="text-[var(--muted-foreground)]">
                {selectedBlocks.length} blocks selected
            </span>
        </div>
    );
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

    // UX-13: Save Block Dialog state
    const saveBlockDialog = useSaveBlockDialog();

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

            // Known BlockNote block types for validation
            const knownBlockTypes = new Set([
                // Standard BlockNote blocks
                'heading', 'paragraph', 'bulletListItem', 'numberedListItem',
                'checkListItem', 'codeBlock', 'quote', 'callout', 'toggle',
                'toggleListItem', 'table', 'image', 'divider', 'audio', 'video', 'file',
                // Custom content blocks
                'codeFile', 'fileAttachment',
                'aiImage', 'aiVision', 'storyboard', 'videoAnalysis',
                'ttsBlock', 'artifactBlock', 'videoGeneration', 'slidesExport',
                'chartDiagram', 'transformPipeline', 'artifactGallery', 'multiStepGeneration',
                // UX-10/11/12: Container blocks with content: "inline"
                'reference', // UX-10: Block references (content: "none")
                'column',    // UX-11: Column layouts (content: "inline")
                'synced',    // UX-12: Synced blocks (content: "inline")
            ]);

            // Blocks with content: "none" spec should NOT have content property
            // IMPORTANT: column, synced, and callout have content: "inline" - they MUST be excluded
            // See BlockSpec definitions in blocks/*.tsx files
            const noContentBlockTypes = new Set([
                'image', 'codeFile', 'fileAttachment', 'aiImage', 'aiVision',
                'storyboard', 'videoAnalysis', 'ttsBlock', 'artifactBlock',
                'videoGeneration', 'slidesExport', 'chartDiagram',
                'transformPipeline', 'artifactGallery', 'multiStepGeneration',
                'reference', // UX-10: Has content: "none" - uses contentSnapshot prop
                // EXCLUDED (content: "inline" blocks):
                // 'callout', // UX-09: Has content: "inline" - uses contentRef
                // 'column',  // UX-11: Has content: "inline" - uses contentRef
                // 'synced',  // UX-12: Has content: "inline" - uses contentRef
            ]);

            // Recursive function to validate and sanitize block structure
            function filterValidBlocks(blocks: any[], depth = 0): any[] {
                if (!Array.isArray(blocks)) return [];
                if (depth > 50) {
                    console.warn('[NoteEditor] Max recursion depth exceeded, returning empty array');
                    return [];
                }

                const valid: any[] = [];
                const invalid: any[] = [];

                for (const block of blocks) {
                    // CRITICAL: Validate block has required fields
                    if (!block || typeof block !== 'object') {
                        console.warn('[NoteEditor] Skipping invalid block (not an object)');
                        invalid.push({ reason: 'not_an_object' });
                        continue;
                    }

                    if (!block.type || typeof block.type !== 'string') {
                        console.warn('[NoteEditor] Skipping block without valid type:', block);
                        invalid.push({ reason: 'no_type' });
                        continue;
                    }

                    const blockType = block.type;
                    let isValid = true;
                    let invalidReason = '';

                    // Check if block type is known
                    if (!knownBlockTypes.has(blockType)) {
                        console.warn(`[NoteEditor] Unknown block type "${blockType}", removing:`, block.id);
                        isValid = false;
                        invalidReason = 'unknown_type';
                    }

                    // Ensure block has id (required for BlockNote)
                    if (isValid && !block.id) {
                        console.warn(`[NoteEditor] Block missing id, generating one for type: ${blockType}`);
                        block.id = crypto.randomUUID();
                    }

                    // Ensure block has props object (required for BlockNote)
                    if (isValid && (!block.props || typeof block.props !== 'object')) {
                        block.props = block.props || {};
                    }

                    // Check for content: "none" blocks that have content property
                    if (isValid && noContentBlockTypes.has(blockType)) {
                        if ('content' in block && block.content !== undefined) {
                            console.warn(`[NoteEditor] Removing block (type: ${blockType}, id: ${block.id}) - has content but shouldn't`);
                            isValid = false;
                            invalidReason = 'content_none_violation';
                        }
                    }

                    // For content-using blocks, validate content structure
                    if (isValid && !noContentBlockTypes.has(blockType)) {
                        // content must be an array if present
                        if ('content' in block && block.content !== undefined && !Array.isArray(block.content)) {
                            console.warn(`[NoteEditor] Block (type: ${blockType}, id: ${block.id}) has non-array content, removing`);
                            isValid = false;
                            invalidReason = 'invalid_content_type';
                        }
                    }

                    // CRITICAL: Check table block content structure
                    if (isValid && blockType === 'table') {
                        const tableContent = block.content;
                        if (!Array.isArray(tableContent) || tableContent.length === 0) {
                            console.warn(`[NoteEditor] Removing table block (id: ${block.id}) - invalid content structure`);
                            isValid = false;
                            invalidReason = 'table_invalid_content';
                        } else {
                            // Check each row has cells
                            for (let r = 0; r < tableContent.length; r++) {
                                const row = tableContent[r];
                                if (!Array.isArray(row)) {
                                    console.warn(`[NoteEditor] Removing table block (id: ${block.id}) - row ${r} is not an array`);
                                    isValid = false;
                                    invalidReason = 'table_row_not_array';
                                    break;
                                }
                            }
                        }
                    }

                    if (isValid) {
                        // Recursively filter children
                        const filteredChildren = block.children && Array.isArray(block.children)
                            ? filterValidBlocks(block.children, depth + 1)
                            : [];

                        // Create sanitized block
                        const sanitizedBlock: any = {
                            id: block.id,
                            type: blockType,
                            props: block.props || {},
                            children: filteredChildren
                        };

                        // Only add content for blocks that use it
                        if (!noContentBlockTypes.has(blockType) && Array.isArray(block.content)) {
                            sanitizedBlock.content = block.content;
                        }

                        // Add any other BlockNote-required fields
                        if (block.externalId !== undefined) sanitizedBlock.externalId = block.externalId;
                        if (block.externalKey !== undefined) sanitizedBlock.externalKey = block.externalKey;

                        valid.push(sanitizedBlock);
                    } else {
                        invalid.push({ id: block.id, type: blockType, reason: invalidReason });
                    }
                }

                if (invalid.length > 0 && depth === 0) {
                    console.warn(`[NoteEditor] Filtered ${invalid.length} invalid blocks:`, invalid);
                }

                return valid;
            }

            // FAIL-SAFE: If ANY corruption detected, return empty to prevent ProseMirror crashes
            const fullyFiltered = filterValidBlocks(sanitized);

            if (fullyFiltered.length !== sanitized.length) {
                const filteredCount = sanitized.length - fullyFiltered.length;
                console.error(`[NoteEditor] BLOCK CORRUPTION DETECTED: ${filteredCount} invalid blocks filtered`);

                // Force editor remount by incrementing corruption counter
                setCorruptionDetected(prev => prev + 1);

                // Show user-facing error
                toast.error(`Note corruption detected: ${filteredCount} damaged block(s) removed. Note may display incompletely.`, {
                    duration: 5000,
                    id: `block-corruption-${noteId}` // Prevent duplicate toasts
                });

                // CRITICAL: Return UNDEFINED to force BlockNote to create fresh empty document
                // This is better than passing potentially malformed blocks that crash ProseMirror
                console.warn('[NoteEditor] Returning undefined (fresh editor) due to corruption');
                return undefined;
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

    // UX-07: In-Block AI Generation UI state
    const [showAIPopup, setShowAIPopup] = useState<boolean>(false);
    const aiTriggerRef = useRef<HTMLDivElement>(null);

    // Detect empty block for AI button
    const { isEmptyBlock, buttonPosition } = useEmptyBlockDetection(editor as any);

    // FAIL-SAFE: Track corruption state to force editor remount
    const [corruptionDetected, setCorruptionDetected] = useState<number>(0);

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

    // UX-07: Handle AI action selection from InBlockAIPopup
    // UX-08: Updated to support below_cursor mode
    const handleAIActionSelect = useCallback(async (action: AIAction, scope: ContextScope) => {
        // Import executeAICommand dynamically to avoid circular dependency
        const { executeAICommand } = await import('./AISlashCommand');

        // Map ContextScope to ContextMode
        const contextModeMap: Record<ContextScope['mode'], 'above_cursor' | 'below_cursor' | 'all' | 'none' | 'selection'> = {
            'above': 'above_cursor',
            'below': 'below_cursor', // Use content below cursor (UX-08)
            'all': 'all',
            'selection': 'selection',
        };

        const contextMode = contextModeMap[scope.mode];

        // Execute the AI command with context mode
        await executeAICommand(editor as any, action.prompt, action.commandName, {
            contextMode,
        });

        setShowAIPopup(false);
        }, [editor]);

    // EPIC-0.5-02: Listen for FILE_UPDATED events from FileEventBus
    // When a note file is externally modified or saved by another plugin,
    // reload note content if it's currently open in the editor
    const projectContext = useProjectContext();

    useEffect(() => {
        if (!projectContext) return;

        const unsubscribe = fileEventBus.onWithFilter(
            'file:updated',
            (event: FileEvent) => {
                // Only reload if it's our note file
                if (event.path === noteId) {
                    console.log('[NoteEditor] External FILE_UPDATED detected, reloading note:', noteId);

                    // Reload note content from store
                    const reloadedNote = notes.get(noteId);
                    if (reloadedNote?.blocks) {
                        // Update editor with reloaded content
                        // BlockNote will handle the document change automatically
                        // Trigger a re-render to update blocks from store
                        // Note: We don't directly set blocks in BlockNote to avoid conflicts
                        console.log('[NoteEditor] Note reloaded from external update');
                    }

                    // Show notification to user
                    toast.info('Note was updated externally, content reloaded');
                }
            },
            {
                projectId: projectContext.projectId,
            }
        );

        return () => {
            unsubscribe();
        };
    }, [noteId, projectContext?.projectId, notes]);

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
                        // Force editor remount on ProseMirror errors
                        if (error.message.includes('node position') || error.message.includes('Cannot find')) {
                            console.warn('[NoteEditor] ProseMirror error detected, forcing remount');
                            setCorruptionDetected(prev => prev + 1);
                        }
                    }}
                >
                    <BlockNoteView
                        key={`${noteId}-editor-${corruptionDetected}`}
                        editor={editor}
                        onChange={handleChange}
                        theme="dark"
                        editable={!readOnly}
                        slashMenu={false}
                    >
                        {/* UX-03: Side Menu with drag handle for multi-block selection */}
                        <SideMenuController />
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
                {/* UX-13: Save Block Dialog */}
                {saveBlockDialog.isOpen && saveBlockDialog.block && (
                    <SaveBlockDialog
                        block={saveBlockDialog.block}
                        open={saveBlockDialog.isOpen}
                        suggestedName={saveBlockDialog.suggestedName}
                        onOpenChange={saveBlockDialog.close}
                    />
                )}
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

            {/* UX-03: Selection Info - Shows when multiple blocks are selected */}
            <SelectionInfo editor={editor as any} />

            {/* UX-07: In-Block AI Generation UI - Container-aware popup */}
            <InBlockAIPopup
                editor={editor as any}
                isOpen={showAIPopup}
                onClose={() => setShowAIPopup(false)}
                onActionSelect={handleAIActionSelect}
                triggerRef={aiTriggerRef}
            />

            {/* UX-07: Floating AI Button for empty blocks */}
            <FloatingAIButton
                show={isEmptyBlock}
                onClick={() => setShowAIPopup(true)}
                position={buttonPosition ?? undefined}
            />
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
