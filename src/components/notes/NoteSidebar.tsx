/**
 * @fileoverview Note Sidebar Component
 * @module components/notes/NoteSidebar
 * @governance EPIC-26-5
 *
 * Sidebar with search, favorites toggle, and note tree.
 *
 * Story 26.5: Note Hierarchy & Sidebar Navigation
 * AC-02: Agent Selector Unification - Added agent selector support
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Plus, Notebook } from 'lucide-react';
import { useNoteNavigationStore } from '@/lib/notes/note-navigation-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NoteTree } from './NoteTree';
import type { NoteRecord } from '@/lib/state/dexie-db';

interface NoteSidebarProps {
    notes: NoteRecord[];
    activeNoteId: string | null;
    onNoteSelect: (noteId: string) => void;
    onCreateNote: () => void;
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
 * - Note tree display
 * - Agent selector slot (AC-02)
 */
export function NoteSidebar({ notes, activeNoteId, onNoteSelect, onCreateNote, agentSelectorSlot }: NoteSidebarProps) {
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
