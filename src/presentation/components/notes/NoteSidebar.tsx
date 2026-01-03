/**
 * @fileoverview Note Sidebar Component
 * @module components/notes/NoteSidebar
 * @governance EPIC-26-5, NR-06, NR-08
 *
 * Sidebar with search, favorites toggle, note tree, and import/export buttons.
 *
 * Story 26.5: Note Hierarchy & Sidebar Navigation
 * NR-06: Import/Export buttons in sidebar header
 * NR-08: Markdown Import/Export UI integration
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Plus, Notebook, FileUp, FileDown, FolderOpen } from 'lucide-react';
import { useNoteNavigationStore } from '@/lib/notes/note-navigation-store';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { NoteTree } from './NoteTree';
import { NotesIndexingButton } from './NotesIndexingButton';
import type { NoteRecord } from '@/lib/state/dexie-db';

interface NoteSidebarProps {
    notes: NoteRecord[];
    activeNoteId: string | null;
    onNoteSelect: (noteId: string) => void;
    onCreateNote: () => void;
    /** NR-06: Import callback for markdown files */
    onImport?: () => void;
    /** NR-06: Export callback for markdown files */
    onExport?: () => void;
    /** P2-8: Index for RAG callback - DEPRECATED: Now handled internally by NotesIndexingButton */
    onIndexForRAG?: () => void;
    /** CW-1.4: File sync settings callback */
    onFileSync?: () => void;
    /** AC-02: Optional slot for agent selector */
    agentSelectorSlot?: React.ReactNode;
}

/**
 * Note sidebar component
 *
 * Features:
 * - Search input with debouncing (150ms)
 * - Favorites filter toggle
 * - Create note button
 * - Import/Export buttons (NR-06)
 * - Note tree display
 * - Agent selector slot (AC-02)
 */
export function NoteSidebar({
    notes,
    activeNoteId,
    onNoteSelect,
    onCreateNote,
    onImport,
    onExport,
    onIndexForRAG: _onIndexForRAG, // P2-8: DEPRECATED - Now handled internally by NotesIndexingButton
    onFileSync,
    agentSelectorSlot
}: NoteSidebarProps) {
    const { t } = useTranslation();
    const { searchQuery, setSearchQuery, showFavoritesOnly, toggleFavoritesFilter } = useNoteNavigationStore();
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // Debounced search (150ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(localSearchQuery);
        }, 150);

        return () => clearTimeout(timer);
    }, [localSearchQuery, setSearchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchQuery(e.target.value);
    };

    const handleClearSearch = useCallback(() => {
        setLocalSearchQuery('');
        setSearchQuery('');
    }, [setSearchQuery]);

    return (
        <div className="flex flex-col h-full bg-background border-r border-border">
            {/* Header */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-mono font-bold text-sm flex items-center gap-2">
                        <Notebook size={16} className="text-primary" />
                        {t('notes.title', 'Notes')}
                    </h2>
                    <div className="flex items-center gap-1">
                        {/* AC-02: Agent Selector slot */}
                        {agentSelectorSlot}
                        
                        {/* NR-06: Import Button */}
                        {onImport && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onImport}
                                aria-label={t('notes.import.fromMarkdown', 'Import from Markdown')}
                                title={t('notes.import.fromMarkdown', 'Import from Markdown')}
                            >
                                <FileUp size={16} />
                            </Button>
                        )}
                        
                        {/* NR-06: Export Button */}
                        {onExport && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onExport}
                                aria-label={t('notes.export.toMarkdown', 'Export to Markdown')}
                                title={t('notes.export.toMarkdown', 'Export to Markdown')}
                            >
                                <FileDown size={16} />
                            </Button>
                        )}

                        {/* CW-1.4: File Sync Settings Button */}
                        {onFileSync && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onFileSync}
                                aria-label={t('notes.fileSync.settings', 'File Sync Settings')}
                                title={t('notes.fileSync.settings', 'File Sync Settings')}
                            >
                                <FolderOpen size={16} />
                            </Button>
                        )}

                        {/* P2-8: Index for RAG Button - uses NotesIndexingButton component */}
                        <NotesIndexingButton
                            className="h-7 px-2 text-xs"
                        />

                        <Button size="sm" variant="ghost" onClick={onCreateNote} aria-label={t('notes.create_new', 'Create new note')}>
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={t('notes.search_placeholder', 'Search notes...')}
                        value={localSearchQuery}
                        onChange={handleSearchChange}
                        className="pl-8 h-8 text-sm font-mono"
                        aria-label={t('notes.search_notes', 'Search notes')}
                    />
                    {localSearchQuery && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                            aria-label={t('notes.clear_search', 'Clear search')}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Favorites Filter */}
                <button
                    onClick={toggleFavoritesFilter}
                    className={`
                        mt-2 w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md
                        ${showFavoritesOnly ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
                    `}
                    aria-pressed={showFavoritesOnly}
                >
                    <Star size={14} className={showFavoritesOnly ? 'text-yellow-500 fill-yellow-500' : ''} />
                    {t('notes.favorites', 'Favorites')}
                </button>
            </div>

            {/* Note Tree */}
            <div className="flex-1 overflow-y-auto">
                <NoteTree notes={notes} activeNoteId={activeNoteId} onNoteSelect={onNoteSelect} />
            </div>
        </div>
    );
}
