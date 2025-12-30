
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNoteStore, useActiveNote } from '@/lib/notes/note-store';
import { MainLayout } from '@/components/layout/MainLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Plus, Notebook, ArrowLeft } from 'lucide-react';
import { lazy, Suspense } from 'react';
const NoteEditor = lazy(() => {
    if (import.meta.env.SSR) {
        return Promise.resolve({ default: (_props: any) => <></> });
    }
    return import('./NoteEditor');
});
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
        activeNoteId
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

    // Mobile Layout: Stacked list and editor views
    if (isMobile) {
        return (
            <MainLayout>
                <div className="flex flex-col h-full overflow-y-auto">
                    {mobileView === 'list' ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-border sticky top-0 bg-background z-10">
                                <div className="flex items-center justify-between">
                                    <h1 className="font-mono font-bold text-lg flex items-center gap-2">
                                        <Notebook className="text-primary" size={20} />
                                        {t('notes.title', 'Notes')}
                                    </h1>
                                    <Button size="sm" onClick={handleCreateNote}>
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Notes List */}
                            <div className="flex-1 p-4 space-y-2">
                                {notesArray.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                                        <Notebook size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm mb-4">{t('notes.empty', 'No notes yet')}</p>
                                        <Button onClick={handleCreateNote}>
                                            <Plus size={16} className="mr-2" />
                                            {t('notes.create_new', 'Create New Note')}
                                        </Button>
                                    </div>
                                ) : (
                                    notesArray.map((note) => (
                                        <div
                                            key={note.id}
                                            onClick={() => handleNoteSelect(note.id)}
                                            className={`
                                                p-3 border-2 border-border rounded-none cursor-pointer text-sm flex items-center gap-3
                                                ${activeNoteId === note.id ? 'bg-accent text-accent-foreground border-primary' : 'hover:bg-accent/50'}
                                            `}
                                        >
                                            <span className="text-2xl">{note.emoji || '📄'}</span>
                                            <TruncatedText text={note.title || 'Untitled'} className="flex-1 font-mono" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
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

    // Desktop Layout: 2-Column Resizable Panels
    return (
        <MainLayout>
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                {/* Notes List Sidebar */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                    <div className="h-full flex flex-col border-r border-border bg-background">
                        <div className="p-3 border-b border-border flex items-center justify-between">
                            <h2 className="font-mono font-bold text-sm flex items-center gap-2">
                                <Notebook size={16} className="text-primary" />
                                {t('notes.title', 'Notes')}
                            </h2>
                            <Button size="sm" variant="ghost" onClick={handleCreateNote}>
                                <Plus size={16} />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {notesArray.length === 0 ? (
                                <div className="text-center text-muted-foreground text-xs py-4">
                                    {t('notes.empty', 'No notes yet')}
                                </div>
                            ) : (
                                notesArray.map((note) => (
                                    <div
                                        key={note.id}
                                        onClick={() => handleNoteSelect(note.id)}
                                        className={`
                                            p-2 rounded-md cursor-pointer text-sm flex items-center gap-2 group
                                            ${activeNoteId === note.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
                                        `}
                                    >
                                        <span className="text-lg">{note.emoji || '📄'}</span>
                                        <TruncatedText text={note.title || 'Untitled'} className="flex-1" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* Main Editor Area */}
                <ResizablePanel defaultSize={80}>
                    <div className="h-full w-full bg-background">
                        {activeNote ? (
                            <Suspense fallback={
                                <div className="flex-1 flex items-center justify-center">
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
        </MainLayout>
    );
}
