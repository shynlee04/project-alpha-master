/**
 * NotesPage.tsx
 * 
 * Main notes page with import/export functionality.
 * Part of NR-06, NR-08: FileSync Binding and Markdown Import/Export UI
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
import { Plus, Notebook, ArrowLeft } from 'lucide-react';
import { NoteSidebar } from './NoteSidebar';
import { MarkdownImportDialog } from './MarkdownImportDialog';
import { MarkdownExportDialog } from './MarkdownExportDialog';
import { NotesFilePicker } from './NotesFilePicker';
import { FolderOpen } from 'lucide-react';

// Lazy load NoteEditor to reduce bundle size
const NoteEditor = lazy(() => import('./NoteEditor'));
import { useIDEStore } from '@/lib/state/ide-store';
import { useResponsive } from '@/hooks/useResponsive';
// AC-02: Agent Selector Unification - Use unified selector for cross-workspace sync
import { AgentManager } from '@/presentation/components/agent';
import type { NoteRecord } from '@/lib/state/dexie-db';

export function NotesPage() {
    const { t } = useTranslation();
    const { isMobile } = useResponsive();
    const projectId = useIDEStore((state) => state.projectId) || 'default';
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

    // Import/Export dialog state (NR-06, NR-08)
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

    // File sync state (CW-1.4)
    const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);


    useEffect(() => {
        if (projectId && currentProjectId !== projectId) {
            loadNotes(projectId);
        }
    }, [projectId, currentProjectId, loadNotes]);

    // Sync mobile view with active note
    useEffect(() => {
        if (isMobile) {
            setMobileView(activeNote ? 'editor' : 'list');
        }
    }, [activeNote, isMobile]);

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

    const handleImportComplete = (_notes: NoteRecord[]) => {
        // Refresh notes list
        if (projectId) {
            loadNotes(projectId);
        }
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
                <div className="flex flex-col h-full overflow-y-auto">
                    {mobileView === 'list' ? (
                        <NoteSidebar
                            notes={notesArray}
                            activeNoteId={activeNoteId}
                            onNoteSelect={handleNoteSelect}
                            onCreateNote={handleCreateNote}
                            onImport={handleImport}
                            onExport={handleExport}
                            onFileSync={() => setIsFilePickerOpen(true)}
                            agentSelectorSlot={
                                <AgentManager
                                    variant="compact"
                                    workspaceType="notes"
                                />
                            }
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
                    notes={notesArray}
                />
            </MainLayout>
        );
    }

    // Desktop Layout: 2-Column Resizable (NoteSidebar + Editor)
    return (
        <MainLayout>
            <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
                {/* Note Sidebar - 20% (min 15%, max 30%) */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                    <NoteSidebar
                        notes={notesArray}
                        activeNoteId={activeNoteId}
                        onNoteSelect={handleNoteSelect}
                        onCreateNote={handleCreateNote}
                        onImport={handleImport}
                        onExport={handleExport}
                        onFileSync={() => setIsFilePickerOpen(true)}
                        agentSelectorSlot={
                            <AgentManager
                                variant="compact"
                                workspaceType="notes"
                            />
                        }
                    />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Main Editor Area - Remaining */}
                <ResizablePanel defaultSize={80}>
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
                notes={notesArray}
            />

            {/* File Picker Dialog (CW-1.4) */}
            <NotesFilePicker
                open={isFilePickerOpen}
                onOpenChange={setIsFilePickerOpen}
                fileSyncService={null} // TODO: Initialize with NotesFileSyncService
            />
        </MainLayout>
    );
}
