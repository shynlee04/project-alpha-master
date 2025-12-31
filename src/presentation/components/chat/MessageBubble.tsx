/**
 * MessageBubble Component
 * Individual message bubble with avatar and timestamp
 * Max 120 lines
 */

import { memo } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamdownRenderer } from './StreamdownRenderer';
import type { ThreadMessage } from '@/stores/conversation-threads-store';

interface MessageBubbleProps {
  message: ThreadMessage;
  isStreaming?: boolean;
}

// Format message timestamp
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex gap-3 px-4 py-3',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center',
        'border-2',
        isUser
          ? 'bg-blue-600 border-blue-400 text-white'
          : 'bg-purple-600 border-purple-400 text-white'
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 max-w-[80%]',
        isUser && 'text-right'
      )}>
        {/* Agent attribution for assistant messages */}
        {!isUser && message.agentName && (
          <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
            <span className="font-mono font-bold">{message.agentName}</span>
            {message.agentModel && (
              <span className="text-slate-500">
                ({message.agentModel.split('/').pop()})
              </span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          'inline-block text-left rounded-sm p-3',
          'border-2',
          isUser
            ? 'bg-blue-900/50 border-blue-600 text-blue-50'
            : 'bg-slate-800/80 border-slate-600 text-slate-100',
          // 8-bit shadow
          'shadow-md'
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap font-mono text-sm">
              {message.content}
            </p>
          ) : (
            <StreamdownRenderer
              content={message.content}
              isStreaming={isStreaming}
            />
          )}
        </div>

        {/* Timestamp */}
        <div className={cn(
          'text-[10px] text-slate-500 mt-1 font-mono',
          isUser && 'text-right'
        )}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
});
