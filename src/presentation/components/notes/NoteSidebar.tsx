/**
 * @fileoverview Note Sidebar Component
 * @module components/notes/NoteSidebar
 * @governance EPIC-26-5, NR-06, NR-08, E1-9
 *
 * Sidebar with search, favorites toggle, note tree, and import/export buttons.
 * E1-9: Added compact chat panel for quick AI access within sidebar.
 *
 * Story 26.5: Note Hierarchy & Sidebar Navigation
 * NR-06: Import/Export buttons in sidebar header
 * NR-08: Markdown Import/Export UI integration
 * E1-9: Add chat to Notes sidebar
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Plus, Notebook, FileUp, FileDown, FolderOpen, Bot, Folder } from 'lucide-react';
import { useNoteNavigationStore } from '@/lib/notes/note-navigation-store';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { NoteTree } from './NoteTree';
import { NotesIndexingButton } from './NotesIndexingButton';
import { NoteSidebarChat } from './NoteSidebarChat';
import { ProjectFilesPanel } from './ProjectFilesPanel';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';

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
    /** STORAGE-3-2: Optional slot for project selector */
    projectSelectorSlot?: React.ReactNode;
    /** E1-9: Project ID for chat context */
    projectId?: string;
    /** E1-9: Project name for chat context */
    projectName?: string;
}

/**
 * Sidebar view type
 */
type SidebarView = 'notes' | 'chat' | 'files';

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
 * - E1-9: Compact chat panel with view toggle
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
    agentSelectorSlot,
    projectSelectorSlot,
    projectId,
    projectName
}: NoteSidebarProps) {
    const { t } = useTranslation();
    const { searchQuery, setSearchQuery, showFavoritesOnly, toggleFavoritesFilter } = useNoteNavigationStore();
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // E1-9: View toggle state (notes list vs chat panel)
    const [sidebarView, setSidebarView] = useState<SidebarView>('notes');

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
                {/* STORAGE-3-2: Project Selector */}
                {projectSelectorSlot && (
                    <div className="mb-3">
                        {projectSelectorSlot}
                    </div>
                )}

                <div className="flex items-center justify-between mb-2">
                    {/* Title with View Toggle (E1-9) */}
                    <div className="flex items-center gap-2">
                        {/* Notes View Toggle Button */}
                        <button
                            onClick={() => setSidebarView('notes')}
                            className={`
                                flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-bold
                                ${sidebarView === 'notes'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                                }
                            `}
                            aria-pressed={sidebarView === 'notes'}
                            aria-label={t('notes.view.notes', 'Notes view')}
                        >
                            <Notebook size={14} />
                            {t('notes.title', 'Notes')}
                        </button>

                        {/* Chat View Toggle Button (E1-9) */}
                        <button
                            onClick={() => setSidebarView('chat')}
                            className={`
                                flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-bold
                                ${sidebarView === 'chat'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                                }
                            `}
                            aria-pressed={sidebarView === 'chat'}
                            aria-label={t('notes.view.chat', 'Chat view')}
                        >
                            <Bot size={14} />
                            {t('chat.title', 'Chat')}
                        </button>

                        {/* Files View Toggle Button (S-007) */}
                        <button
                            onClick={() => setSidebarView('files')}
                            className={`
                                flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-bold
                                ${sidebarView === 'files'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                                }
                            `}
                            aria-pressed={sidebarView === 'files'}
                            aria-label={t('notes.view.files', 'Files view')}
                        >
                            <Folder size={14} />
                            {t('notes.title_files', 'Files')}
                        </button>
                    </div>
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

                {/* Search Input - only show in notes view */}
                {sidebarView === 'notes' && (
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
                )}

                {/* Favorites Filter - only show in notes view */}
                {sidebarView === 'notes' && (
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
                )}
            </div>

            {/* Content Area - Conditionally render notes list or chat */}
            {sidebarView === 'chat' ? (
                /* E1-9: Chat Panel */
                <div className="flex-1 overflow-hidden">
                    <NoteSidebarChat
                        projectId={projectId || 'default'}
                        projectName={projectName || t('notes.title', 'Notes')}
                    />
                </div>
            ) : sidebarView === 'files' ? (
                /* S-007: Project Files Panel */
                <div className="flex-1 overflow-hidden">
                    <ProjectFilesPanel />
                </div>
            ) : (
                /* Notes List */
                <div className="flex-1 overflow-y-auto">
                    <NoteTree notes={notes} activeNoteId={activeNoteId} onNoteSelect={onNoteSelect} />
                </div>
            )}
        </div>
    );
}
