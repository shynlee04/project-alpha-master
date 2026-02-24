/**
 * @fileoverview ChatPanel Component
 * @module plugins/chat/components/ChatPanel
 *
 * Chat UI with message input and message list.
 * Follows 8-bit design system (sharp corners, pixel shadows).
 *
 * Key features:
 * - Message list with user/assistant differentiation
 * - Message input with send button
 * - Thread list sidebar
 * - Loading states
 * - Message parts renderer (text, code)
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, MessageSquare } from 'lucide-react';
import type { ThreadMessage } from '@/domain/interfaces/thread-service.interface';
import { useProjectChat } from '../hooks/useChat';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ChatPanelProps {
  projectId: string | null;
  className?: string;
}

// ============================================================================
// ChatPanel Component
// ============================================================================

/**
 * ChatPanel - Main chat interface component
 *
 * Renders the complete chat UI with:
 * - Thread list (left sidebar)
 * - Message list (center)
 * - Message input (bottom)
 *
 * @example
 * ```tsx
 * <ChatPanel projectId="proj-123" className="h-full" />
 * ```
 */
export function ChatPanel({ projectId, className }: ChatPanelProps) {
  const {
    activeThread,
    threads,
    messages,
    isLoading,
    error,
    isResponding,
    sendMessage,
    createThread,
    switchThread,
    deleteThread,
  } = useProjectChat(projectId);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || isResponding) return;

    const content = inputValue.trim();
    setInputValue('');
    await sendMessage(content);
  };

  // Handle key press (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle create new thread
  const handleNewThread = async () => {
    await createThread('New Chat');
    inputRef.current?.focus();
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  if (!projectId) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-background text-muted-foreground font-mono', className)}>
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No project selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full bg-background font-mono', className)}>
      {/* Thread List Sidebar */}
      <div className="w-48 border-r border-border flex flex-col">
        {/* New Thread Button */}
        <button
          onClick={handleNewThread}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 p-2 m-2',
            'bg-primary text-primary-foreground',
            'border-2 border-primary-foreground/20',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // 8-bit design: sharp corners, pixel shadow
            'rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]',
            'text-xs font-bold uppercase tracking-wide'
          )}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={cn(
                'group flex items-center gap-2 p-2 mx-2 mb-1 cursor-pointer',
                'border-2 border-transparent',
                'hover:bg-accent hover:border-border',
                // 8-bit design
                'rounded-none transition-colors',
                activeThread?.id === thread.id && 'bg-accent border-primary'
              )}
              onClick={() => switchThread(thread.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
              <span className="flex-1 truncate text-xs">{thread.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded-none"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ))}

          {threads.length === 0 && !isLoading && (
            <div className="p-4 text-xs text-muted-foreground text-center">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start a conversation</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isResponding && (
            <div className="flex gap-2 items-center text-muted-foreground text-sm">
              <div className="animate-pulse">Thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mb-2 p-2 bg-destructive/10 border-2 border-destructive text-destructive text-xs rounded-none">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isResponding}
              rows={1}
              className={cn(
                'flex-1 resize-none p-3',
                'bg-background border-2 border-border',
                'focus:border-primary focus:outline-none',
                'text-sm font-mono',
                // 8-bit design
                'rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]',
                'placeholder:text-muted-foreground',
                'disabled:opacity-50'
              )}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isResponding}
              className={cn(
                'p-3',
                'bg-primary text-primary-foreground',
                'border-2 border-primary-foreground/20',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                // 8-bit design
                'rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MessageBubble Component
// ============================================================================

interface MessageBubbleProps {
  message: ThreadMessage;
}

/**
 * MessageBubble - Renders a single message
 *
 * Handles different message roles (user/assistant/system)
 * and renders message parts (text, code).
 */
function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] p-3',
          'border-2',
          // 8-bit design: sharp corners, pixel shadow
          'rounded-none',
          isUser
            ? 'bg-primary text-primary-foreground border-primary-foreground/20 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]'
            : isSystem
            ? 'bg-muted text-muted-foreground border-border shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]'
            : 'bg-card text-card-foreground border-border shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]'
        )}
      >
        {/* Agent Name (for assistant messages) */}
        {!isUser && message.agentName && (
          <div className="text-xs font-bold mb-1 opacity-70">
            {message.agentName}
          </div>
        )}

        {/* Message Content */}
        <MessageContent content={message.content} />

        {/* Timestamp */}
        <div className="text-xs opacity-50 mt-2">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MessageContent Component
// ============================================================================

interface MessageContentProps {
  content: string;
}

/**
 * MessageContent - Renders message content with parts
 *
 * Currently handles:
 * - Plain text
 * - Code blocks (```language\n...```)
 *
 * Expand in Phase 2 for more complex message parts.
 */
function MessageContent({ content }: MessageContentProps) {
  // Parse content for code blocks
  const parts = parseMessageParts(content);

  return (
    <div className="space-y-2 text-sm">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <pre
              key={index}
              className={cn(
                'p-2 overflow-x-auto',
                'bg-muted/50 border border-border',
                // 8-bit design
                'rounded-none',
                'text-xs font-mono'
              )}
            >
              <code>{part.content}</code>
            </pre>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap break-words">
            {part.content}
          </p>
        );
      })}
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

interface MessagePart {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

/**
 * Parse message content into parts (text and code blocks)
 */
function parseMessageParts(content: string): MessagePart[] {
  const parts: MessagePart[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    // Add code block
    parts.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || undefined,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim();
    if (textContent) {
      parts.push({ type: 'text', content: textContent });
    }
  }

  // If no parts were found, return the whole content as text
  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return parts;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================================================
// Default Export
// ============================================================================

export default ChatPanel;
