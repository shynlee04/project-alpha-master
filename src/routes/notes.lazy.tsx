/**
 * @fileoverview Notes Workspace Route - FULL UI TEST VERSION
 * @module routes/notes
 * 
 * TEMPORARY: Full UI layout with mock data, NO database/filesystem dependencies
 * Tests if the complete Notes interface renders without the data layer.
 */

import { useState, lazy, Suspense } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/presentation/components/ui/resizable';
import { Plus, Notebook, MessageSquare, FileText, Star, Search } from 'lucide-react';

/**
 * Route definition - full UI with mock data
 */
export const Route = createLazyFileRoute('/notes')({
  component: FullNotesWorkspace,
});

// Mock notes data (no database)
const MOCK_NOTES = [
  { id: '1', title: 'Welcome Note', emoji: '👋', isFavorite: true, updatedAt: new Date() },
  { id: '2', title: 'Project Ideas', emoji: '💡', isFavorite: false, updatedAt: new Date() },
  { id: '3', title: 'Meeting Notes', emoji: '📅', isFavorite: false, updatedAt: new Date() },
  { id: '4', title: 'Research', emoji: '🔬', isFavorite: true, updatedAt: new Date() },
];

/**
 * Full Notes workspace UI - NO database, NO filesystem, just UI components
 */
function FullNotesWorkspace() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>('1');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  const activeNote = MOCK_NOTES.find(n => n.id === activeNoteId);

  return (
    <MainLayout>
      <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
        {/* Left Panel: Note Sidebar - 20% */}
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
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-muted/50 border border-border rounded-md"
                  />
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {MOCK_NOTES.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 transition-colors ${activeNoteId === note.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/50'
                      }`}
                  >
                    <span>{note.emoji}</span>
                    <span className="flex-1 truncate">{note.title}</span>
                    {note.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                  </button>
                ))}
              </div>

              {/* Sidebar Footer */}
              <div className="p-2 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  {MOCK_NOTES.length} notes (mock data)
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel: Editor - 50% */}
        <ResizablePanel id="notes-editor" defaultSize={50} minSize={30}>
          <div className="h-full bg-background flex flex-col">
            {activeNote ? (
              <>
                {/* Editor Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <span className="text-2xl">{activeNote.emoji}</span>
                  <h1 className="text-xl font-bold">{activeNote.title}</h1>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    {activeNote.isFavorite ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-3xl mx-auto">
                    <p className="text-muted-foreground mb-4">
                      This is a mock editor area. The actual BlockNote editor would render here.
                    </p>
                    <div className="p-4 border border-dashed border-border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground font-mono">
                        ✅ ResizablePanelGroup working<br />
                        ✅ Note sidebar rendered<br />
                        ✅ Editor panel rendered<br />
                        ✅ Note selection working<br />
                        ✅ No database calls<br />
                        ✅ No filesystem calls
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                <FileText size={48} className="opacity-20" />
                <p>Select or create a note to start writing</p>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Create New Note
                </Button>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Chat - 30% */}
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
            <div className="h-full border-l border-border flex flex-col bg-background">
              {/* Chat Header */}
              <div className="p-3 border-b border-border">
                <span className="font-mono font-bold text-sm">💬 AI Chat</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      Hello! I'm your AI assistant. How can I help you with your notes today?
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-primary/10 text-primary rounded-lg p-3">
                      <p className="text-sm">This is a mock chat interface</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask AI about this note..."
                    className="flex-1 px-3 py-2 text-sm bg-muted/50 border border-border rounded-md"
                  />
                  <Button size="sm">Send</Button>
                </div>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </MainLayout>
  );
}

/**
 * Notes workspace with project context
 * This component is used by /notes/$projectId route
 */
export function NotesProjectWorkspace() {
  return <FullNotesWorkspace />;
}
