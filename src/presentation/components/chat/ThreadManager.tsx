/**
 * @fileoverview Thread Manager Component
 * @module presentation/components/chat/ThreadManager
 * @governance Architectural Specification v3.0
 *
 * Thread management UI with CRUD operations.
 * Addresses gap in ARC Module: Thread management incomplete.
 */

import { useState } from 'react';
import { Plus, Folder, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';

/**
 * Thread data structure
 */
export interface Thread {
  id: string;
  title: string;
  agentId: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
  workspaceType: string;
}

/**
 * Props for ThreadManager
 */
export interface ThreadManagerProps {
  workspaceType: string;
  threads: Thread[];
  activeThreadId: string | null;
  onCreateThread: (title: string) => void;
  onSelectThread: (threadId: string) => void;
  onUpdateThread: (threadId: string, updates: Partial<Thread>) => void;
  onDeleteThread: (threadId: string) => void;
  onArchiveThread: (threadId: string) => void;
}

/**
 * Thread Manager Component
 *
 * Provides UI for:
 * - Creating new threads
 * - Listing threads by workspace
 * - Selecting active thread
 * - Renaming threads
 * - Deleting threads
 * - Archiving threads
 *
 * @example
 * ```tsx
 * <ThreadManager
 *   workspaceType="ide"
 *   threads={threads}
 *   activeThreadId={activeThreadId}
 *   onCreateThread={(title) => createThread(title)}
 *   onSelectThread={(id) => setActiveThread(id)}
 *   onUpdateThread={(id, updates) => updateThread(id, updates)}
 *   onDeleteThread={(id) => deleteThread(id)}
 *   onArchiveThread={(id) => archiveThread(id)}
 * />
 * ```
 */
export function ThreadManager({
  workspaceType,
  threads,
  activeThreadId,
  onCreateThread,
  onSelectThread,
  onUpdateThread,
  onDeleteThread,
  onArchiveThread,
}: ThreadManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Filter threads by workspace
  const workspaceThreads = threads.filter(t => t.workspaceType === workspaceType && !t.isArchived);

  /**
   * Handle create thread
   */
  const handleCreateThread = () => {
    if (!newThreadTitle.trim()) return;

    onCreateThread(newThreadTitle);
    setNewThreadTitle('');
    setIsCreating(false);
  };

  /**
   * Handle start editing
   */
  const handleStartEdit = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  /**
   * Handle save edit
   */
  const handleSaveEdit = () => {
    if (!editingThreadId) return;

    onUpdateThread(editingThreadId, { title: editingTitle });
    setEditingThreadId(null);
    setEditingTitle('');
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditingThreadId(null);
    setEditingTitle('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Threads</h3>
          <span className="text-sm text-muted-foreground">({workspaceThreads.length})</span>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-none hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </button>
      </div>

      {/* Create Thread Input */}
      {isCreating && (
        <div className="p-4 border-b bg-muted/30">
          <input
            type="text"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateThread();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewThreadTitle('');
              }
            }}
            placeholder="Thread title..."
            className="w-full px-3 py-2 border rounded-none focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateThread}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-none"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewThreadTitle('');
              }}
              className="px-3 py-1.5 text-sm border rounded-none hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {workspaceThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <p>No threads yet</p>
            <p className="text-sm">Create a thread to start chatting</p>
          </div>
        ) : (
          <div className="divide-y">
            {workspaceThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              const isEditing = editingThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    isActive ? 'bg-muted border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => !isEditing && onSelectThread(thread.id)}
                >
                  {/* Thread Icon */}
                  <MessageSquare className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />

                  {/* Thread Info */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-2 py-1 border rounded-none focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{thread.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {thread.messageCount} messages · Updated {new Date(thread.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Thread Actions */}
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit();
                          }}
                          className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 rounded-none"
                          title="Save"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-none"
                          title="Cancel"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(thread);
                          }}
                          className="p-1.5 hover:bg-muted rounded-none"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveThread(thread.id);
                          }}
                          className="p-1.5 hover:bg-muted rounded-none"
                          title="Archive"
                        >
                          <Folder className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this thread?')) {
                              onDeleteThread(thread.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-none"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Threads */}
      {threads.filter(t => t.workspaceType === workspaceType && t.isArchived).length > 0 && (
        <details className="border-t">
          <summary className="px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50">
            Archived Threads ({threads.filter(t => t.workspaceType === workspaceType && t.isArchived).length})
          </summary>
          <div className="divide-y">
            {threads
              .filter(t => t.workspaceType === workspaceType && t.isArchived)
              .map((thread) => (
                <div
                  key={thread.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer opacity-60"
                  onClick={() => onSelectThread(thread.id)}
                >
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{thread.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {thread.messageCount} messages · Archived
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateThread(thread.id, { isArchived: false });
                    }}
                    className="p-1.5 hover:bg-muted rounded-none"
                    title="Unarchive"
                  >
                    <Folder className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}
