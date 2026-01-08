/**
 * @fileoverview Notes Workspace Route - STABLE VERSION WITH EDITOR
 * @module routes/notes
 * @updated 2026-01-08T11:30:00+07:00
 *
 * FIXED: Bypasses problematic useWorkspaceAccess to prevent infinite loops
 * Uses direct note store access + BlockNote editor + AI commands.
 */

import { useState, useEffect, Suspense, lazy } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/presentation/components/ui/resizable';
import { Plus, Notebook, MessageSquare, FileText, Star, Search } from 'lucide-react';
import { ErrorBoundary } from '@/presentation/components/error';

// Note store - uses Dexie but not useLiveQuery from workspace-access-helper
import { useNoteStore, useActiveNote } from '@/lib/notes/note-store';

// Chat panel
import { UnifiedChatPanel } from '@/presentation/components/chat/UnifiedChatPanel';

// Lazy load BlockNote editor to prevent SSR issues
const NoteEditor = lazy(() => import('@/presentation/components/notes/NoteEditor'));

/**
 * Route definition with ErrorBoundary
 */
export const Route = createLazyFileRoute('/notes')({
  component: () => (
    <ErrorBoundary>
      <StableNotesWorkspace />
    </ErrorBoundary>
  ),
});

/**
 * Loading spinner for lazy components
 */
function EditorSkeleton() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  );
}

/**
 * Stable Notes workspace - bypasses problematic useWorkspaceAccess
 * Uses direct note store access instead of workspace-access-helper
 */
function StableNotesWorkspace() {
  // Direct note store access
  const {
    notesArray,
    loadNotes,
    createNote,
    setActiveNote,
    activeNoteId,
    toggleFavorite
  } = useNoteStore();

  const activeNote = useActiveNote();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use a stable projectId
  const projectId = 'default-notes';

  // Load notes on mount
  useEffect(() => {
    loadNotes(projectId);
  }, [projectId, loadNotes]);

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

  // Filter notes by search query
  const filteredNotes = searchQuery
    ? notesArray.filter(note =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : notesArray;

  return (
    <MainLayout>
      <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
        {/* Left Panel: Note Sidebar */}
        <ResizablePanel
          id="notes-sidebar"
          defaultSize={20}
          minSize={15}
          maxSize={30}
          collapsible={true}
          collapsedSize={3}
          onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
        >
          {sidebarCollapsed ? (
            <div className="h-full flex items-center justify-center border-r border-border bg-muted/30">
              <div className="text-center">
                <Notebook className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Notes</span>
              </div>
            </div>
          ) : (
            <div className="h-full border-r border-border flex flex-col bg-background">
              {/* Sidebar Header */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm">📝 Notes</span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleCreateNote}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-muted/50 border border-border rounded-md"
                  />
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">{searchQuery ? 'No matching notes' : 'No notes yet'}</p>
                    {!searchQuery && (
                      <Button size="sm" variant="outline" className="mt-2" onClick={handleCreateNote}>
                        <Plus className="h-3 w-3 mr-1" /> Create Note
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => handleNoteSelect(note.id)}
                      className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 transition-colors ${activeNoteId === note.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                        }`}
                    >
                      <span>{note.emoji || '📄'}</span>
                      <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                      {note.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                    </button>
                  ))
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-2 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  {notesArray.length} notes
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel: BlockNote Editor */}
        <ResizablePanel id="notes-editor" defaultSize={50} minSize={30}>
          <div className="h-full bg-background flex flex-col">
            {activeNote ? (
              <>
                {/* Editor Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <span className="text-2xl">{activeNote.emoji || '📄'}</span>
                  <h1 className="text-xl font-bold flex-1">{activeNote.title || 'Untitled'}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(activeNote.id)}
                  >
                    {activeNote.isFavorite ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* BlockNote Editor */}
                <div className="flex-1 overflow-hidden">
                  <Suspense fallback={<EditorSkeleton />}>
                    <NoteEditor noteId={activeNote.id} />
                  </Suspense>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                <FileText size={48} className="opacity-20" />
                <p>Select or create a note to start writing</p>
                <Button onClick={handleCreateNote}>
                  <Plus size={16} className="mr-2" />
                  Create New Note
                </Button>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: AI Chat */}
        <ResizablePanel
          id="notes-chat"
          defaultSize={30}
          minSize={20}
          maxSize={40}
          collapsible={true}
          collapsedSize={3}
          onCollapse={(collapsed) => setChatCollapsed(collapsed)}
        >
          {chatCollapsed ? (
            <div className="h-full flex items-center justify-center border-l border-border bg-muted/30">
              <div className="text-center">
                <MessageSquare className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Chat</span>
              </div>
            </div>
          ) : (
            <div className="h-full border-l border-border">
              <UnifiedChatPanel
                mode="agent"
                projectId={projectId}
                projectName="Notes"
                workspaceType="notes"
              />
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </MainLayout>
  );
}

/**
 * Notes workspace with project context (for /notes/$projectId route)
 */
export function NotesProjectWorkspace() {
  return <StableNotesWorkspace />;
}
