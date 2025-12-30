
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNoteStore, useActiveNote } from '@/lib/notes/note-store';
import { MainLayout } from '@/components/layout/MainLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Plus, Notebook } from 'lucide-react';
import { lazy, Suspense } from 'react';
const NoteEditor = lazy(() => import('./NoteEditor'));
import { TruncatedText } from '@/components/ui/truncated-text';
import { useIDEStore } from '@/lib/state/ide-store';

export function NotesPage() {
    const { t } = useTranslation();
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

    useEffect(() => {
        if (projectId && currentProjectId !== projectId) {
            loadNotes(projectId);
        }
    }, [projectId, currentProjectId, loadNotes]);

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
