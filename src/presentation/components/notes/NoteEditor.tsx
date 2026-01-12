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

// P1.5-03: Block type alias for compatibility with custom schema
type BlockNoteBlock = any;

import { useNoteStore, useNoteSaveStatus, useIsNoteIndexing } from '@/lib/notes';
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

    // Get initial content from note
    // Fixed: Include noteId in dependencies to ensure proper reactivity on note switch
    const initialContent = useMemo(() => {
        if (!note?.blocks || note.blocks.length === 0) {
            return undefined; // BlockNote will use default empty paragraph
        }
        return note.blocks as BlockNoteBlock[];
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
            <div className="note-editor__content">
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
