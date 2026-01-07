/**
 * NotesPage.tsx
 *
 * Main notes page with import/export functionality and chat panel.
 * Part of NR-06, NR-08: FileSync Binding and Markdown Import/Export UI
 * Part of E1-1: UnifiedChatPanel integration
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNoteStore, useActiveNote } from '@/lib/notes/note-store';
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/presentation/components/ui/resizable';
import { Plus, Notebook, ArrowLeft, MessageSquare } from 'lucide-react';
import { NoteSidebar } from './NoteSidebar';
import { MarkdownImportDialog } from './MarkdownImportDialog';
import { MarkdownExportDialog } from './MarkdownExportDialog';
import { NotesFilePicker } from './NotesFilePicker';
import { SyncStatusPanel } from '@/presentation/components/ui/activity-indicators';
// E1-1: UnifiedChatPanel integration
import { UnifiedChatPanel } from '@/presentation/components/chat/UnifiedChatPanel';
// NOTE: createNoteFileSyncService import removed - requires FileSyncService dependency
// import { createNoteFileSyncService } from '@/lib/notes';

// Lazy load NoteEditor to reduce bundle size
const NoteEditor = lazy(() => import('./NoteEditor'));
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useResponsive } from '@/hooks/useResponsive';
// AC-02: Agent Selector Unification - Use unified selector for cross-workspace sync
import { AgentManager } from '@/presentation/components/agent';
// P0-3: File Sync Service Initialization
import { useFileSyncService } from '@/lib/filesync/hooks';

// P2-7: Import Knowledge → Notes event types
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import type { SynthesisExportData } from '@/infrastructure/events/event-bus';
import type { NotesRAGIndexData } from '@/infrastructure/events/event-bus';
import { toast } from 'sonner';
// Use ProjectContext for projectId instead of IDE store
import { useProjectContext } from '@/lib/workspace/ProjectContext';
// UJ-004: Cross-workspace reactivity - subscribe to FILE_SAVED events
import { useStoreEvent, STORE_EVENTS } from '@/lib/events/store-events';
import type { FileSavedPayload } from '@/lib/events/store-events';
// WB-8.3: Cross-workspace event subscriptions for state synchronization
import { useAllCrossWorkspaceEvents, useWorkspaceChangedEvents } from '@/lib/events/use-cross-workspace-events';

export function NotesPage() {
    const { t } = useTranslation();
    const { isMobile } = useResponsive();
    // Get projectId from ProjectContext (set by route)
    const { project } = useProjectContext();
    const projectId = project?.id || 'default';
    const {
        notesArray,
        currentProjectId,
        loadNotes,
        createNote,
        setActiveNote,
        activeNoteId,
        toggleFavorite
    } = useNoteStore();

    const activeNote = useActiveNote();
    const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

    // P2-4: Panel collapse state (persisted in IDE store)
    const noteSidebarCollapsed = useIDEStore((s) => s.panelCollapsed['notes-sidebar'] ?? false);
    const setPanelCollapsed = useIDEStore((s) => s.setPanelCollapsed);

    // E1-1: Chat panel collapse state (persisted in IDE store)
    const notesChatCollapsed = useIDEStore((s) => s.panelCollapsed['notes-chat'] ?? false);
    const notesChatVisible = useIDEStore((s) => s.chatVisible ?? true);

    // WB-8.3: Cross-workspace event subscriptions for state synchronization
    // Ensures Notes workspace reacts to changes from IDE, Knowledge, Study workspaces
    useAllCrossWorkspaceEvents();
    // Also subscribe to workspace changed events for agent filtering
    useWorkspaceChangedEvents();

    // P2-3: Keyboard shortcut for panel collapse/expand (Cmd/Ctrl + [)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Cmd/Ctrl + [ (left bracket)
            if ((event.metaKey || event.ctrlKey) && event.key === '[') {
                event.preventDefault();
                setPanelCollapsed('notes-sidebar', !noteSidebarCollapsed);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [noteSidebarCollapsed, setPanelCollapsed]);

    // Import/Export dialog state (NR-06, NR-08)
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

    // File sync state (CW-1.4)
    const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);

    // P0-3: Initialize file sync service with storage type selection
    const {
        service: notesSyncService,
        isInitializing: isNotesSyncInitializing,
        error: notesSyncError,
        initializeService: initializeNotesSync,
        isReady: isNotesSyncReady,
        isSupported: isNotesSyncSupported,
    } = useFileSyncService({
        projectId,
        workspaceType: 'notes',
        storageType: project?.storageType ?? 'indexeddb',
        noteStore: {
            notes: useNoteStore.getState().notes,
            notesArray: notesArray,
            updateNote: useNoteStore.getState().updateNote,
            createNote: useNoteStore.getState().createNote,
            loadNotes: useNoteStore.getState().loadNotes,
        },
    });

    // S-007: File loading state for auto-import
    const [isImportingFiles, setIsImportingFiles] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, currentFile: '' });

    useEffect(() => {
        if (projectId && currentProjectId !== projectId) {
            loadNotes(projectId);
        }
    }, [projectId, currentProjectId, loadNotes]);

    // S-007: Auto-import project files when file sync service becomes ready
    useEffect(() => {
        if (isNotesSyncReady && notesSyncService && !isImportingFiles) {
            const autoImportFiles = async () => {
                setIsImportingFiles(true);
                setImportProgress({ current: 0, total: 0, currentFile: '' });

                try {
                    console.log('[NotesPage] Auto-importing project files...');

                    // Trigger import via the folder bridge
                    // NotesFileSyncService now exposes importDirectory as public method
                    const result = await notesSyncService.importDirectory(
                        '', // Root directory
                        (current: number, total: number, currentFile: string) => {
                            setImportProgress({ current, total, currentFile });
                        }
                    );

                    console.log('[NotesPage] Auto-import complete:', result);

                    // Reload notes after import
                    if (projectId) {
                        await loadNotes(projectId);
                    }
                } catch (error) {
                    console.error('[NotesPage] Auto-import failed:', error);
                } finally {
                    setIsImportingFiles(false);
                }
            };

            autoImportFiles();
        }
    }, [isNotesSyncReady, notesSyncService, projectId, loadNotes]);

    // Sync mobile view with active note
    useEffect(() => {
        if (isMobile) {
            setMobileView(activeNote ? 'editor' : 'list');
        }
    }, [activeNote, isMobile]);

    // P2-7: Listen to Knowledge synthesis export events
    useEffect(() => {
        console.log('[NotesPage] Setting up Knowledge export event listener');

        /**
         * Handle Synthesis Export Requested event from Knowledge workspace
         * Creates a new Note in Notes workspace from synthesis content
         */
        const handleSynthesisExport = (event: any) => {
            const exportData: SynthesisExportData = event;
            console.log('[NotesPage] KNOWLEDGE_SYNTHESIS_EXPORT_REQUESTED event received:', exportData);

            // Transform synthesis data to Note format
            const noteTitle = exportData.data.title || 'Untitled Synthesis';

            // Create a simple blocks array from Markdown content
            // TODO: Phase 4 - Use proper Markdown to BlockNote parser
            // For now, create note without content blocks (Phase 4 will implement proper parser)
            const blocks = undefined; // Block[] type requires BlockNote library structure

            // Create note with synthesis data
            createNote({
                title: noteTitle,
                emoji: '📝', // Knowledge-sourced note
                blocks,
            }).then((noteId) => {
                // Set as active note
                setActiveNote(noteId);

                // Show toast notification
                toast.success('Note created from Knowledge workspace', {
                    description: noteTitle,
                    action: {
                        label: 'View',
                        onClick: () => {
                            // Note is already set as active
                            console.log('[NotesPage] Viewing note:', noteId);
                        },
                    },
                });

                console.log('[NotesPage] Note created from synthesis:', noteId);
            }).catch((error) => {
                console.error('[NotesPage] Failed to create note from synthesis:', error);
                toast.error('Failed to create note', {
                    description: error instanceof Error ? error.message : 'Unknown error',
                });
            });
        };

        // Register Knowledge export event listener
        const unsubscribe = eventBus.on(
            DomainEventType.KNOWLEDGE_SYNTHESIS_EXPORT_REQUESTED,
            handleSynthesisExport as any
        );

        console.log('[NotesPage] Knowledge export event listener registered');

        // Cleanup: remove listener on unmount
        return () => {
            console.log('[NotesPage] Cleaning up Knowledge export event listener');
            unsubscribe();
        };
    }, [eventBus, createNote, setActiveNote]);

    // UJ-004: Listen to FILE_SAVED events for cross-workspace reactivity
    // When IDE files are saved, refresh notes if they're markdown files
    useStoreEvent<FileSavedPayload>(
        STORE_EVENTS.FILE_SAVED,
        (payload) => {
            // Only react to IDE file saves, not notes saves (avoid infinite loop)
            if (payload.workspaceType === 'ide') {
                console.log('[NotesPage] FILE_SAVED event received from IDE:', payload);

                // Check if the saved file is a markdown file that might be a note
                if (payload.filePath.endsWith('.md') || payload.filePath.endsWith('.markdown')) {
                    console.log('[NotesPage] Markdown file saved in IDE, refreshing notes list');
                    // Refresh notes list to pick up changes from IDE
                    if (projectId) {
                        loadNotes(projectId);
                    }
                }
            }
        },
        [projectId, loadNotes]
    );

    const handleCreateNote = async () => {
        try {
            await createNote({
                title: 'Untitled Note',
                blocks: []
            });
            // Switch to editor view on mobile after creating
            if (isMobile) {
                setMobileView('editor');
            }
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const handleNoteSelect = (noteId: string) => {
        setActiveNote(noteId);
    };

    const handleBackToList = () => {
        setMobileView('list');
        setActiveNote(null);
    };

    const handleFavoriteToggle = async (noteId: string) => {
        try {
            await toggleFavorite(noteId);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const handleImportComplete = (_noteIds: string[]) => {
        // Refresh notes list
        if (projectId) {
            loadNotes(projectId);
        }
    };

    // P2-8: Index notes for RAG in Knowledge workspace
    const handleIndexForRAG = async (noteIds?: string[]) => {
        const notesToIndex = noteIds || notesArray.map(n => n.id);

        if (notesToIndex.length === 0) {
            toast.error('No notes to index');
            return;
        }

        // Publish event to cross-workspace event bus
        const indexData: NotesRAGIndexData = {
            workspaceType: 'notes',
            noteIds: notesToIndex,
            timestamp: new Date(),
            projectId,
            mode: noteIds ? 'incremental' : 'batch',
        };

        eventBus.emit(DomainEventType.NOTES_RAG_INDEX_REQUESTED, indexData);

        toast.success('Indexing notes for RAG', {
            description: `Indexing ${notesToIndex.length} note${notesToIndex.length > 1 ? 's' : ''}...`,
        });

        console.log('[NotesPage] RAG index requested:', indexData);
    };

    const handleExport = () => {
        setIsExportDialogOpen(true);
    };

    const handleImport = () => {
        setIsImportDialogOpen(true);
    };

    // Mobile Layout: Stacked list and editor views
    if (isMobile) {
        return (
            <MainLayout>
                {/* S-007: Import Progress Overlay */}
                {isImportingFiles && (
                    <div className="fixed inset-0 bg-card border-b border-border z-50 flex items-center justify-center">
                        <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                                <h3 className="font-semibold">Importing Notes</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Loading project files...
                            </p>
                            {importProgress.total > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{importProgress.current} / {importProgress.total}</span>
                                        <span>{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-primary h-full transition-all duration-300"
                                            style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {importProgress.currentFile}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* S-007: Mobile fallback for file sync */}
                {!isNotesSyncSupported && (
                    <div className="bg-muted/50 border-b border-border p-3">
                        <div className="flex items-start gap-2">
                            <div className="text-yellow-600 dark:text-yellow-500 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Desktop-only feature</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    File sync requires a desktop browser (Chrome, Edge, Opera). You can create notes manually on mobile.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col h-full overflow-y-auto">
                    {mobileView === 'list' ? (
                        <NoteSidebar
                            notes={notesArray as any}
                            activeNoteId={activeNoteId}
                            onNoteSelect={handleNoteSelect}
                            onCreateNote={handleCreateNote}
                            onImport={handleImport}
                            onExport={handleExport}
                            onIndexForRAG={handleIndexForRAG}
                            onFileSync={() => setIsFilePickerOpen(true)}
                            agentSelectorSlot={
                                <AgentManager
                                    variant="compact"
                                    workspaceType="notes"
                                />
                            }
                            projectId={projectId}
                            projectName={project?.name || projectId}
                        />
                    ) : (
                        <>
                            {/* Editor Header with Back Button */}
                            <div className="p-3 border-b border-border sticky top-0 bg-background z-10 flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleBackToList}
                                    className="px-2"
                                >
                                    <ArrowLeft size={18} />
                                </Button>
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono text-sm font-bold truncate">
                                        {activeNote?.emoji} {activeNote?.title || 'Untitled'}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => activeNote && handleFavoriteToggle(activeNote.id)}
                                    className="px-2"
                                >
                                    {activeNote?.isFavorite ? (
                                        <span className="text-yellow-500">⭐</span>
                                    ) : (
                                        <span className="text-muted-foreground">☆</span>
                                    )}
                                </Button>
                            </div>

                            {/* Editor */}
                            <div className="flex-1 bg-background">
                                <Suspense fallback={
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                                    </div>
                                }>
                                    <NoteEditor
                                        noteId={activeNote?.id || ''}
                                        className="h-full"
                                    />
                                </Suspense>
                            </div>
                        </>
                    )}
                </div>

                {/* Import Dialog */}
                <MarkdownImportDialog
                    open={isImportDialogOpen}
                    onOpenChange={setIsImportDialogOpen}
                    onImportComplete={handleImportComplete}
                />

                {/* Export Dialog */}
                <MarkdownExportDialog
                    open={isExportDialogOpen}
                    onOpenChange={setIsExportDialogOpen}
                    notes={notesArray as any}
                    syncService={notesSyncService}
                    onInitialize={initializeNotesSync}
                    isInitializing={isNotesSyncInitializing}
                    error={notesSyncError}
                    isReady={isNotesSyncReady}
                    isSupported={isNotesSyncSupported}
                />

                {/* Sync Status Panel (P1-2: Event Bus Integration) */}
                <div className="fixed bottom-4 right-4 z-50 w-96">
                    <SyncStatusPanel />
                </div>
            </MainLayout>
        );
    }

    // Desktop Layout: 3-Column Resizable (NoteSidebar + Editor + Chat)
    // E1-1: Added chat panel (30% default, collapsible)
    return (
        <MainLayout>
            {/* S-007: Import Progress Overlay */}
            {isImportingFiles && (
                <div className="fixed inset-0 bg-card border-b border-border z-50 flex items-center justify-center">
                    <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                            <h3 className="font-semibold">Importing Notes</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Loading project files into Notes workspace...
                        </p>
                        {importProgress.total > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{importProgress.current} / {importProgress.total} files</span>
                                    <span>{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-300"
                                        style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {importProgress.currentFile}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                {/* Note Sidebar - 20% (min 15%, max 30%) - P2-2: Collapsible */}
                <ResizablePanel
                    id="notes-sidebar"
                    defaultSize={20}
                    minSize={15}
                    maxSize={30}
                    collapsible={true}
                    collapsedSize={3}
                    onCollapse={(collapsed) => setPanelCollapsed('notes-sidebar', collapsed)}
                >
                    {noteSidebarCollapsed ? (
                        <div className="h-full flex items-center justify-center border-r border-border bg-muted/30">
                            <div className="text-center">
                                <Notebook className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">
                                    {t('notes.notes', 'Notes')}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <NoteSidebar
                            notes={notesArray as any}
                            activeNoteId={activeNoteId}
                            onNoteSelect={handleNoteSelect}
                            onCreateNote={handleCreateNote}
                            onImport={handleImport}
                            onExport={handleExport}
                            onIndexForRAG={handleIndexForRAG}
                            onFileSync={() => setIsFilePickerOpen(true)}
                            agentSelectorSlot={
                                <AgentManager
                                    variant="compact"
                                    workspaceType="notes"
                                />
                            }
                            projectId={projectId}
                            projectName={project?.name || projectId}
                        />
                    )}
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Main Editor Area - 50% (E1-1: Reduced from 80% to accommodate chat) */}
                <ResizablePanel
                    id="notes-editor"
                    defaultSize={50}
                    minSize={30}
                >
                    <div className="h-full bg-background flex flex-col">
                        {activeNote ? (
                            <Suspense fallback={
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                                </div>
                            }>
                                <NoteEditor
                                    noteId={activeNote.id}
                                    className="h-full"
                                />
                            </Suspense>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                                <Notebook size={48} className="opacity-20" />
                                <p>{t('notes.select_or_create', 'Select or create a note to start writing')}</p>
                                <Button onClick={handleCreateNote}>
                                    <Plus size={16} className="mr-2" />
                                    {t('notes.create_new', 'Create New Note')}
                                </Button>
                            </div>
                        )}
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* E1-1: Chat Panel - 30% (min 20%, max 40%, collapsible) */}
                {notesChatVisible && (
                    <ResizablePanel
                        id="notes-chat"
                        defaultSize={30}
                        minSize={20}
                        maxSize={40}
                        collapsible={true}
                        collapsedSize={3}
                        onCollapse={(collapsed) => setPanelCollapsed('notes-chat', collapsed)}
                    >
                        {notesChatCollapsed ? (
                            <div className="h-full flex items-center justify-center border-l border-border bg-muted/30">
                                <div className="text-center">
                                    <MessageSquare className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                                    <span className="text-xs text-muted-foreground">
                                        {t('chat.chat', 'Chat')}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <UnifiedChatPanel
                                mode="agent"
                                projectId={projectId}
                                projectName={project?.name || projectId}
                                workspaceType="notes"
                                className="h-full"
                            />
                        )}
                    </ResizablePanel>
                )}
            </ResizablePanelGroup>

            {/* Import Dialog */}
            <MarkdownImportDialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
                onImportComplete={handleImportComplete}
            />

            {/* Export Dialog */}
            <MarkdownExportDialog
                open={isExportDialogOpen}
                onOpenChange={setIsExportDialogOpen}
                notes={notesArray as any}
                syncService={notesSyncService}
                onInitialize={initializeNotesSync}
                isInitializing={isNotesSyncInitializing}
                error={notesSyncError}
                isReady={isNotesSyncReady}
                isSupported={isNotesSyncSupported}
            />

            {/* File Picker Dialog (CW-1.4) */}
            <NotesFilePicker
                open={isFilePickerOpen}
                onOpenChange={setIsFilePickerOpen}
                fileSyncService={notesSyncService}
                onInitialize={initializeNotesSync}
                isInitializing={isNotesSyncInitializing}
                error={notesSyncError}
                isReady={isNotesSyncReady}
                isSupported={isNotesSyncSupported}
            />

            {/* Sync Status Panel (P1-2: Event Bus Integration) */}
            <div className="fixed bottom-4 right-4 z-50 w-96">
                <SyncStatusPanel />
            </div>
        </MainLayout>
    );
}
