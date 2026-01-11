/**
 * @fileoverview Note Reference Picker for Chat
 * @module presentation/components/chat/NoteReferencePicker
 * @governance EPIC-31-5
 *
 * Dialog component for selecting notes to reference in chat.
 * Part of Note Reference Support feature.
 *
 * Story E3-5: Note Reference Support
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, Clock, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNoteStore } from '@/lib/notes/note-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';

// ============================================================================
// Types
// ============================================================================

export interface NoteReferencePickerProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Called when dialog closes */
    onClose: () => void;
    /** Called when a note is selected */
    onSelectNote: (noteId: string, noteTitle: string) => void;
    /** Optional query string to filter notes */
    query?: string;
}

interface NoteListItem {
    id: string;
    title: string;
    preview: string;
    updatedAt: Date;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Note Reference Picker Dialog
 *
 * Shows searchable list of recent notes for selection.
 * Inserts note reference into chat input when selected.
 */
export function NoteReferencePicker({
    open,
    onClose,
    onSelectNote,
    query = '',
}: NoteReferencePickerProps) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(query);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Get notes from store
    const notes = useNoteStore((state) => state.notesArray);

    // Convert notes to list items
    const noteList: NoteListItem[] = useMemo(() => {
        return notes
            .filter((note) => {
                // Filter by search query
                if (!search.trim()) return true;
                const searchLower = search.toLowerCase();
                return (
                    note.title.toLowerCase().includes(searchLower)
                );
            })
            .sort((a, b) => {
                // Sort by updated date (most recent first) - updatedAt is number timestamp
                return b.updatedAt - a.updatedAt;
            })
            .slice(0, 20) // Limit to 20 most recent
            .map((note) => ({
                id: note.id,
                title: note.title,
                preview: getNotePreview(note.blocks),
                updatedAt: new Date(note.updatedAt),
            }));
    }, [notes, search]);

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search, noteList.length]);

    // Handle keyboard selection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % noteList.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + noteList.length) % noteList.length);
            } else if (e.key === 'Enter' && noteList.length > 0) {
                e.preventDefault();
                handleSelectNote(noteList[selectedIndex]);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        if (open) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, noteList, selectedIndex, onClose]);

    const handleSelectNote = useCallback((note: NoteListItem) => {
        onSelectNote(note.id, note.title);
        onClose();
    }, [onSelectNote, onClose]);

    const formatTimeAgo = (date: Date): string => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return t('noteReference.justNow');
        if (seconds < 3600) return t('noteReference.minutesAgo', { count: Math.floor(seconds / 60) });
        if (seconds < 86400) return t('noteReference.hoursAgo', { count: Math.floor(seconds / 3600) });
        if (seconds < 604800) return t('noteReference.daysAgo', { count: Math.floor(seconds / 86400) });
        return date.toLocaleDateString();
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {t('noteReference.selectNote')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('noteReference.searchPlaceholder')}
                            className="w-full rounded-none border border-input bg-background pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            autoFocus
                        />
                    </div>

                    {/* Notes List */}
                    <div className="max-h-96 overflow-y-auto rounded-none border border-border">
                        {noteList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileText className="mb-2 h-8 w-8" />
                                <p className="text-sm">{search ? t('noteReference.noNotesFound') : t('noteReference.noNotes')}</p>
                            </div>
                        ) : (
                            <Command className="rounded-none border-0">
                                <Command.List className="max-h-80 overflow-y-auto">
                                    {noteList.map((note, index) => (
                                        <Command.Item
                                            key={note.id}
                                            value={note.id}
                                            onSelect={() => handleSelectNote(note)}
                                            className={`group relative flex cursor-pointer select-none items-center gap-3 px-3 py-3 text-sm outline-none ${
                                                index === selectedIndex
                                                    ? 'bg-accent'
                                                    : 'hover:bg-accent/50'
                                            }`}
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-secondary">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-1 flex-col min-w-0">
                                                <span className="font-medium truncate">{note.title}</span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {note.preview}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatTimeAgo(note.updatedAt)}</span>
                                            </div>
                                        </Command.Item>
                                    ))}
                                </Command.List>
                            </Command>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get a short preview of note content
 */
function getNotePreview(blocks: unknown[]): string {
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return '';
    }

    // Extract text from first few blocks
    let text = '';
    for (const block of blocks.slice(0, 3)) {
        if (typeof block === 'object' && block !== null && 'content' in block) {
            const content = (block as { content: unknown }).content;
            if (Array.isArray(content)) {
                for (const item of content) {
                    if (typeof item === 'object' && item !== null && 'text' in item) {
                        text += (item as { text: string }).text + ' ';
                        if (text.length > 100) break;
                    }
                }
            }
        }
        if (text.length > 100) break;
    }

    return text.slice(0, 100).trim() + (text.length >= 100 ? '...' : '');
}

/**
 * Hook to use note reference picker
 */
export function useNoteReferencePicker() {
    const [open, setOpen] = useState(false);
    const [onSelectCallback, setOnSelectCallback] = useState<((noteId: string, noteTitle: string) => void) | null>(null);

    const openPicker = useCallback((callback: (noteId: string, noteTitle: string) => void) => {
        setOnSelectCallback(() => callback);
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setOnSelectCallback(null);
    }, []);

    const handleSelect = useCallback((noteId: string, noteTitle: string) => {
        onSelectCallback?.(noteId, noteTitle);
        handleClose();
    }, [onSelectCallback, handleClose]);

    return {
        open,
        openPicker,
        onClose: handleClose,
        onSelectNote: handleSelect,
    };
}
