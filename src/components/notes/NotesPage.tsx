
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNoteStore, useActiveNote } from '@/lib/notes/note-store';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, Notebook, ArrowLeft } from 'lucide-react';
import { lazy, Suspense } from 'react';
const NoteEditor = lazy(() => {
    if (import.meta.env.SSR) {
        return Promise.resolve({ default: (_props: any) => <></> });
    }
    return import('./NoteEditor');
});
import { NoteSidebar } from './NoteSidebar';
import { TruncatedText } from '@/components/ui/truncated-text';
import { useIDEStore } from '@/lib/state/ide-store';
import { useResponsive } from '@/hooks/useResponsive';

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
            </MainLayout>
        );
    }

    // Desktop Layout: 2-Column Flex (NoteSidebar + Editor)
    return (
        <MainLayout>
            <div className="flex flex-1 h-full">
                {/* Note Sidebar - 20% (300px max) */}
                <div className="w-1/5 max-w-[300px] min-w-[200px]">
                    <NoteSidebar
                        notes={notesArray}
                        activeNoteId={activeNoteId}
                        onNoteSelect={handleNoteSelect}
                        onCreateNote={handleCreateNote}
                    />
                </div>

                {/* Main Editor Area - flex-1 */}
                <div className="flex-1 bg-background">
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
            </div>
        </MainLayout>
    );
}
