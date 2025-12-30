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

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Block } from '@blocknote/core';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';

import { useNoteStore, useNoteSaveStatus, useIsNoteIndexing } from '@/lib/notes';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils'; // Keep existing imports

import { getCustomSlashMenuItems } from './AISlashCommand';
import { AIPromptDialog } from './AIPromptDialog';
import { SuggestionMenuController } from '@blocknote/react';
import { filterSuggestionItems } from '@blocknote/core/extensions';

import './NoteEditor.css';

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

function useDebouncedCallback<T extends (...args: Block[][]) => void>(
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

    // Get initial content from note
    const initialContent = useMemo(() => {
        if (!note?.blocks || note.blocks.length === 0) {
            return undefined; // BlockNote will use default empty paragraph
        }
        return note.blocks as Block[];
    }, [note?.id]); // Only recompute when note ID changes, not on every block update

    // Create BlockNote editor instance
    const editor = useCreateBlockNote({
        initialContent,
    });

    // Debounced save handler (500ms)
    const debouncedSave = useDebouncedCallback(
        async (blocks: Block[]) => {
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
    }, [editor, debouncedSave, readOnly]);

    // Render save status indicator
    const renderSaveStatus = () => {
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
        <div className={cn('note-editor', className)}>
            {/* Status bar */}
            <div className="note-editor__status-bar">
                {note.emoji && <span className="note-editor__emoji">{note.emoji}</span>}
                <span className="note-editor__title">{note.title}</span>
                <div className="note-editor__status-spacer" />
                {renderSaveStatus()}
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
                            filterSuggestionItems(
                                getCustomSlashMenuItems(editor),
                                query
                            )
                        }
                    />
                </BlockNoteView>
                <AIPromptDialog />
            </div>
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
