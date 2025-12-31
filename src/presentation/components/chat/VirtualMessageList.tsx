/**
 * VirtualMessageList Component
 * Virtual scrolling list for chat messages using react-window
 * Max 120 lines
 */

import { useRef, useCallback, useEffect, memo } from 'react';
import { List, type ListChildComponentProps } from 'react-window';
import type { ThreadMessage } from '@/stores/conversation-threads-store';

interface MessageBubbleProps {
  message: ThreadMessage;
  isStreaming?: boolean;
}

interface VirtualMessageListProps {
  messages: ThreadMessage[];
  isStreaming?: boolean;
  streamingMessageIndex?: number;
  className?: string;
  MessageBubble: React.ComponentType<MessageBubbleProps>;
}

// Row renderer for virtual list
const Row = memo(function Row({
  index,
  style,
  data
}: ListChildComponentProps<{
  messages: ThreadMessage[];
  isStreaming: boolean;
  streamingMessageIndex: number;
  MessageBubble: React.ComponentType<MessageBubbleProps>;
}>) {
  const { messages, isStreaming, streamingMessageIndex, MessageBubble } = data;
  const message = messages[index];
  const isStreamingMessage = isStreaming && index === streamingMessageIndex;

  return (
    <div style={style}>
      <MessageBubble
        message={message}
        isStreaming={isStreamingMessage}
      />
    </div>
  );
});

Row.displayName = 'Row';

export function VirtualMessageList({
  messages,
  isStreaming = false,
  streamingMessageIndex,
  className,
  MessageBubble
}: VirtualMessageListProps) {
  const listRef = useRef<ReturnType<typeof List> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate streaming message index (last assistant message)
  const calculatedStreamingIndex = streamingMessageIndex ?? (
    isStreaming
      ? messages.findLastIndex(m => m.role === 'assistant')
      : -1
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  // Calculate row height for virtual list
  const getItemSize = useCallback(() => {
    // Approximate height: avatar (32px) + content (variable) + timestamp (20px) + padding (24px)
    // Base height ~80px for typical messages
    return 80;
  }, []);

  // Item data for row renderer
  const itemData = {
    messages,
    isStreaming,
    streamingMessageIndex: calculatedStreamingIndex,
    MessageBubble
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <List
        ref={listRef}
        height={600} // Default height, should be passed as prop
        itemCount={messages.length}
        itemSize={getItemSize}
        itemData={itemData}
        width="100%"
      >
        {Row}
      </List>
      <div ref={messagesEndRef} />
    </div>
  );
}
