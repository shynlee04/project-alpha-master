/**
 * @fileoverview ChatThreadList - Chat threads list for current project
 * @module presentation/components/sidebar/ChatThreadList
 *
 * **ARCH-03-01**: Create ProjectSidebar Component
 *
 * Displays list of chat threads for the current project.
 * Clicking a thread opens it in the Chat plugin.
 *
 * @remarks
 * Placeholder implementation - full chat functionality will be in ARCH-02-08.
 * For now, shows empty state with hint.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-01
 * @team Team A
 * @created 2026-01-22
 */

import { MessageSquare, Plus } from 'lucide-react';

// ============================================================================
// Props
// ============================================================================

export interface ChatThreadListProps {
  /** Current project ID (from context) */
  currentProjectId?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ChatThreadList Component
 *
 * Displays chat threads for current project.
 * For now, shows placeholder since chat service is not yet implemented.
 *
 * @remarks
 * Full implementation will be in ARCH-02-08.
 * Will integrate with chatService from ProjectContext.
 */
export function ChatThreadList({ currentProjectId: _currentProjectId }: ChatThreadListProps) {
  // Placeholder: No chat threads yet
  // When ARCH-02-08 is complete, this will:
  // 1. Fetch threads from chatService
  // 2. Display thread list with timestamps
  // 3. Handle thread selection
  // 4. Open thread in Chat plugin

  const handleNewThread = () => {
    console.warn('[ChatThreadList] New thread clicked - not implemented yet');
    // TODO: Will create new thread and open Chat plugin
    // navigate({ to: '/$projectId?plugin=chat', params: { projectId: _currentProjectId } });
  };

  return (
    <div className="chat-threads">
      {/* Header with New Thread button */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-foreground" />
          <span className="text-xs font-bold uppercase text-foreground">Chat</span>
        </div>
        <button
          type="button"
          onClick={handleNewThread}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-card border-2 border-border hover:bg-accent transition-colors"
          title="New chat thread"
        >
          <Plus size={12} />
          <span>New</span>
        </button>
      </div>

      {/* Thread List - Placeholder */}
      <div className="max-h-96 overflow-y-auto">
        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
          <MessageSquare size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p>Chat functionality coming soon</p>
          <p className="text-xs text-muted-foreground mt-1">
            (ARCH-02-08 will implement Chat plugin)
          </p>
        </div>
      </div>

      {/* Example structure for when chat is implemented:
      <div className="thread-items">
        {threads.map(thread => (
          <button
            key={thread.id}
            onClick={() => handleThreadClick(thread.id)}
            className={`thread-item w-full text-left px-3 py-2 text-sm border-b border-border cursor-pointer ${
              thread.id === activeThreadId ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-accent'
            }`}
          >
            <div className="truncate">{thread.title}</div>
            <div className="text-xs text-muted-foreground">{formatTime(thread.updatedAt)}</div>
          </button>
        ))}
      </div>
      */}
    </div>
  );
}
