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

import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { useProjectContext } from '@/infrastructure/context/project-context';

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
 * Displays chat threads for the current project.
 * For now, shows placeholder since chat service is not yet implemented.
 *
 * @remarks
 * Full implementation will be in ARCH-02-08.
 * Will integrate with chatService from ProjectContext.
 */
export function ChatThreadList({ currentProjectId }: ChatThreadListProps) {
  const { chatService } = useProjectContext();

  // Placeholder: No chat threads yet
  // When ARCH-02-08 is complete, this will:
  // 1. Fetch threads from chatService
  // 2. Display thread list with timestamps
  // 3. Handle thread selection
  // 4. Open thread in Chat plugin

  const handleNewThread = () => {
    console.warn('[ChatThreadList] New thread clicked - not implemented yet');
    // TODO: Will create new thread and open Chat plugin
    // navigate({ to: '/$projectId?plugin=chat', params: { projectId: currentProjectId } });
  };

  const handleThreadClick = (threadId: string) => {
    console.warn('[ChatThreadList] Thread clicked - not implemented yet');
    // TODO: Will open specific thread in Chat plugin
  };

  return (
    <div className="chat-threads">
      {/* Header with New Thread button */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-gray-700" />
          <span className="text-xs font-bold uppercase text-gray-800">Chat</span>
        </div>
        <button
          type="button"
          onClick={handleNewThread}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
          title="New chat thread"
        >
          <Plus size={12} />
          <span>New</span>
        </button>
      </div>

      {/* Thread List - Placeholder */}
      <div className="max-h-96 overflow-y-auto">
        <div className="px-3 py-8 text-center text-sm text-gray-500">
          <MessageSquare size={32} className="mx-auto mb-2 text-gray-400" />
          <p>Chat functionality coming soon</p>
          <p className="text-xs text-gray-400 mt-1">
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
            className={`thread-item w-full text-left px-3 py-2 text-sm border-b border-gray-200 cursor-pointer ${
              thread.id === activeThreadId ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            <div className="truncate">{thread.title}</div>
            <div className="text-xs text-gray-500">{formatTime(thread.updatedAt)}</div>
          </button>
        ))}
      </div>
      */}
    </div>
  );
}
