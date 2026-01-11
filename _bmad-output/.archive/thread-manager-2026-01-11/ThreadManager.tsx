/**
 * @fileoverview Thread Manager Component
 * @module presentation/components/chat/ThreadManager
 * @governance CHAT-005 | CHAT-006
 *
 * Thread management UI with CRUD operations.
 * CHAT-005: Integrated with unified chat store via useThreadManager hook
 * CHAT-006: CRUD UI with proper workspace association
 */

import { useState } from 'react';
import { Plus, Folder, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { useThreadManager } from '@/presentation/hooks/useThreadManager';
import type { WorkspaceType } from '@/domain/entities/chat';

/**
 * Props for ThreadManager
 */
export interface ThreadManagerProps {
  /** Workspace type for filtering threads */
  workspaceType: WorkspaceType;
  /** Optional conversation ID for further filtering */
  conversationId?: string;
  /** Optional callback when thread is selected */
  onThreadSelect?: (threadId: string) => void;
}

/**
 * Thread Manager Component
 *
 * CHAT-006: Store-integrated thread CRUD UI
 *
 * Provides UI for:
 * - Creating new threads
 * - Listing threads by workspace
 * - Selecting active thread
 * - Renaming threads (UI only - store update pending)
 * - Deleting threads
 * - Viewing archived threads
 *
 * @example
 * ```tsx
 * <ThreadManager
 *   workspaceType="ide"
 *   onThreadSelect={(id) => console.log('Selected:', id)}
 * />
 * ```
 */
export function ThreadManager({
  workspaceType,
  conversationId,
  onThreadSelect,
}: ThreadManagerProps) {
  // CHAT-005: Use the store-integrated hook
  const {
    activeThreads,
    archivedThreads,
    activeThreadId,
    createThread,
    deleteThread,
    setActiveThread,
  } = useThreadManager({ workspaceType, conversationId });

  // Local UI state
  const [isCreating, setIsCreating] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  /**
   * Handle create thread
   */
  const handleCreateThread = () => {
    const title = newThreadTitle.trim() || 'New Thread';
    try {
      const threadId = createThread(title);
      setNewThreadTitle('');
      setIsCreating(false);
      // Auto-select the newly created thread
      setActiveThread(threadId);
      onThreadSelect?.(threadId);
    } catch (err) {
      console.error('[ThreadManager] Failed to create thread:', err);
    }
  };

  /**
   * Handle thread selection
   */
  const handleSelectThread = (threadId: string) => {
    setActiveThread(threadId);
    onThreadSelect?.(threadId);
  };

  /**
   * Handle delete thread
   */
  const handleDeleteThread = (threadId: string) => {
    if (confirm('Delete this thread? This action cannot be undone.')) {
      deleteThread(threadId);
      if (activeThreadId === threadId) {
        // Clear active thread if we deleted the active one
        // setActiveThread(null); // TODO: implement clearActiveThread
      }
    }
  };

  /**
   * Handle start editing (UI only - store update pending CHAT-007)
   */
  const handleStartEdit = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  /**
   * Handle save edit (UI only - store update pending CHAT-007)
   */
  const handleSaveEdit = () => {
    if (!editingThreadId) return;

    // TODO: Implement thread title update in store
    console.warn('[ThreadManager] Thread title update not yet supported by store:', {
      threadId: editingThreadId,
      newTitle: editingTitle,
    });

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
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Threads</h3>
          <span className="text-sm text-muted-foreground">({activeThreads.length})</span>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-none hover:bg-primary/90 shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </button>
      </div>

      {/* Create Thread Input */}
      {isCreating && (
        <div className="p-4 border-b border-border bg-muted/30">
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
            className="w-full px-3 py-2 bg-background border border-border rounded-none focus:outline-none focus:border-primary"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateThread}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewThreadTitle('');
              }}
              className="px-3 py-1.5 text-sm border border-border rounded-none hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {activeThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <p>No threads yet</p>
            <p className="text-sm">Create a thread to start chatting</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {activeThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              const isEditing = editingThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    isActive ? 'bg-muted border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => !isEditing && handleSelectThread(thread.id)}
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
                      className="flex-1 px-2 py-1 bg-background border border-border rounded-none focus:outline-none focus:border-primary"
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
                            handleStartEdit(thread.id, thread.title);
                          }}
                          className="p-1.5 hover:bg-muted rounded-none"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(thread.id);
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
      {archivedThreads.length > 0 && (
        <details className="border-t border-border">
          <summary className="px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50">
            Archived Threads ({archivedThreads.length})
          </summary>
          <div className="divide-y divide-border/50">
            {archivedThreads.map((thread) => (
              <div
                key={thread.id}
                className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer opacity-60"
                onClick={() => handleSelectThread(thread.id)}
              >
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{thread.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {thread.messageCount} messages · Archived
                  </p>
                </div>
                {/* Unarchive button - TODO: implement store method */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.warn('[ThreadManager] Unarchive not yet supported by store');
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
