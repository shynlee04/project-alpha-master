/**
 * @fileoverview Note Sidebar Component
 * @module components/notes/NoteSidebar
 * @governance EPIC-26-5, NR-06, NR-08, EPIC-UX-02
 *
 * Sidebar with search, favorites toggle, note tree, and import/export buttons.
 * UX-02: Removed duplicate chat panel - chat only exists in main panel.
 *
 * Story 26.5: Note Hierarchy & Sidebar Navigation
 * NR-06: Import/Export buttons in sidebar header
 * NR-08: Markdown Import/Export UI integration
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Plus, Notebook, FileUp, FileDown, FolderOpen, Folder, Sparkles, Bolt } from 'lucide-react';
import { useNoteNavigationStore } from '@/lib/notes/note-navigation-store';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { NoteTree } from './NoteTree';
import { NotesIndexingButton } from './NotesIndexingButton';
import { ProjectFilesPanel } from './ProjectFilesPanel';
import { NotesRAGSearch } from './NotesRAGSearch';
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
    /** 43-01: Slash commands manager callback */
    onSlashCommands?: () => void;
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
 * NS-2026-01-10: Removed 'chat' - chat now only exists in main panel
 * NS-2026-01-07: Added 'rag' for AI-powered semantic search
 */
type SidebarView = 'notes' | 'files' | 'rag';

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
    onSlashCommands,
    agentSelectorSlot,
    projectSelectorSlot,
    projectId,
    projectName: _projectName // UX-02: No longer used after chat removal
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
        <div className="flex flex-col h-full bg-background border-r-2 border-border">
            {/* Header - UX-02: Redesigned with visual sections */}
            <div className="p-3 border-b-2 border-border space-y-3">

                {/* Section 1: Project Selector */}
                {projectSelectorSlot && (
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            {t('notes.project', 'Project')}
                        </label>
                        {projectSelectorSlot}
                    </div>
                )}

                {/* Section 2: View Mode Tabs */}
                <div className="space-y-1">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        {t('notes.view.mode', 'View')}
                    </label>
                    <div className="flex items-center gap-1">
                        {/* Notes View Button */}
                        <button
                            onClick={() => setSidebarView('notes')}
                            className={`
                                flex-1 flex items-center justify-center gap-1.5 px-2 py-2 
                                rounded-none border-2 border-border text-xs font-mono font-bold
                                min-h-[44px] touch-action-manipulation
                                ${sidebarView === 'notes'
                                    ? 'bg-primary text-primary-foreground shadow-[var(--shadow-pixel-sm)]'
                                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }
                            `}
                            aria-pressed={sidebarView === 'notes'}
                            aria-label={t('notes.view.notes', 'Notes view')}
                        >
                            <Notebook size={14} />
                            <span className="hidden sm:inline">{t('notes.title', 'Notes')}</span>
                        </button>

                        {/* Files View Button */}
                        <button
                            onClick={() => setSidebarView('files')}
                            className={`
                                flex-1 flex items-center justify-center gap-1.5 px-2 py-2 
                                rounded-none border-2 border-border text-xs font-mono font-bold
                                min-h-[44px] touch-action-manipulation
                                ${sidebarView === 'files'
                                    ? 'bg-primary text-primary-foreground shadow-[var(--shadow-pixel-sm)]'
                                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }
                            `}
                            aria-pressed={sidebarView === 'files'}
                            aria-label={t('notes.view.files', 'Files view')}
                        >
                            <Folder size={14} />
                            <span className="hidden sm:inline">{t('notes.title_files', 'Files')}</span>
                        </button>

                        {/* AI Search View Button */}
                        <button
                            onClick={() => setSidebarView('rag')}
                            className={`
                                flex-1 flex items-center justify-center gap-1.5 px-2 py-2 
                                rounded-none border-2 border-border text-xs font-mono font-bold
                                min-h-[44px] touch-action-manipulation
                                ${sidebarView === 'rag'
                                    ? 'bg-primary text-primary-foreground shadow-[var(--shadow-pixel-sm)]'
                                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }
                            `}
                            aria-pressed={sidebarView === 'rag'}
                            aria-label={t('notes.view.rag', 'AI Search view')}
                        >
                            <Sparkles size={14} />
                            <span className="hidden sm:inline">{t('notes.view.rag_title', 'AI')}</span>
                        </button>
                    </div>
                </div>

                {/* Search Input - only show in notes view */}
                {sidebarView === 'notes' && (
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t('notes.search_placeholder', 'Search notes...')}
                            value={localSearchQuery}
                            onChange={handleSearchChange}
                            className="pl-9 h-10 text-sm font-mono rounded-none border-2 border-border"
                            aria-label={t('notes.search_notes', 'Search notes')}
                        />
                        {localSearchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 min-w-[24px] min-h-[24px] text-muted-foreground hover:text-foreground text-sm"
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
                            mt-2 w-full flex items-center gap-2 px-3 py-2.5 text-sm font-mono
                            rounded-none border-2 border-border min-h-[44px]
                            ${showFavoritesOnly
                                ? 'bg-accent text-accent-foreground shadow-[var(--shadow-pixel-sm)]'
                                : 'bg-muted text-muted-foreground hover:bg-accent/50'
                            }
                        `}
                        aria-pressed={showFavoritesOnly}
                    >
                        <Star size={16} className={showFavoritesOnly ? 'text-yellow-500 fill-yellow-500' : ''} />
                        {t('notes.favorites', 'Favorites')}
                    </button>
                )}
            </div>

            {/* Content Area - Conditionally render notes list, files, or RAG search */}
            {sidebarView === 'files' ? (
                /* S-007: Project Files Panel */
                <div className="flex-1 overflow-hidden">
                    <ProjectFilesPanel />
                </div>
            ) : sidebarView === 'rag' ? (
                /* NS-2026-01-07: RAG-powered AI Search Panel */
                <div className="flex-1 overflow-y-auto">
                    <NotesRAGSearch
                        projectId={projectId || 'default'}
                        onNoteSelect={onNoteSelect}
                    />
                </div>
            ) : (
                /* Notes List */
                <div className="flex-1 overflow-y-auto">
                    <NoteTree notes={notes} activeNoteId={activeNoteId} onNoteSelect={onNoteSelect} />
                </div>
            )}

            {/* UX-02: Bottom Action Bar - Moved from header for better layout */}
            <div className="p-3 border-t-2 border-border bg-muted space-y-2">
                {/* Agent Selector Row */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider shrink-0">
                        {t('notes.agent', 'Agent')}
                    </label>
                    <div className="flex-1 min-w-0">
                        {agentSelectorSlot}
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-1 flex-wrap">
                    {/* Import */}
                    {onImport && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onImport}
                            className="h-9 px-2 rounded-none border border-border flex items-center gap-1"
                            aria-label={t('notes.import.fromMarkdown', 'Import from Markdown')}
                        >
                            <FileUp size={14} />
                            <span className="text-xs hidden sm:inline">{t('notes.import.short', 'Import')}</span>
                        </Button>
                    )}

                    {/* Slash Commands - 43-01 */}
                    {onSlashCommands && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onSlashCommands}
                            className="h-9 px-2 rounded-none border border-border flex items-center gap-1"
                            aria-label={t('notes.slashCommands.manage', 'Manage Slash Commands')}
                        >
                            <Bolt size={14} />
                            <span className="text-xs hidden sm:inline">{t('notes.slashCommands.short', 'Commands')}</span>
                        </Button>
                    )}

                    {/* Export */}
                    {onExport && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onExport}
                            className="h-9 px-2 rounded-none border border-border flex items-center gap-1"
                            aria-label={t('notes.export.toMarkdown', 'Export to Markdown')}
                        >
                            <FileDown size={14} />
                            <span className="text-xs hidden sm:inline">{t('notes.export.short', 'Export')}</span>
                        </Button>
                    )}

                    {/* File Sync */}
                    {onFileSync && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onFileSync}
                            className="h-9 px-2 rounded-none border border-border flex items-center gap-1"
                            aria-label={t('notes.fileSync.settings', 'File Sync Settings')}
                        >
                            <FolderOpen size={14} />
                            <span className="text-xs hidden sm:inline">{t('notes.sync.short', 'Sync')}</span>
                        </Button>
                    )}

                    {/* Index for RAG */}
                    <NotesIndexingButton className="h-9 px-2 text-xs rounded-none" />

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Create Note - Primary action */}
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={onCreateNote}
                        className="h-9 px-3 rounded-none border-2 border-border shadow-[var(--shadow-pixel-sm)] flex items-center gap-1"
                        aria-label={t('notes.create_new', 'Create new note')}
                    >
                        <Plus size={14} />
                        <span className="text-xs font-bold">{t('notes.create.short', 'New')}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
