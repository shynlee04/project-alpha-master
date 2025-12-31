/**
 * @fileoverview RAG Chat Panel Component
 * @module components/rag/RAGChatPanel
 * @governance EPIC-7-WIRE
 *
 * Chat interface for RAG-powered conversations with citations.
 * Supports streaming responses and citation navigation.
 */

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Trash2, Bot, User, MessageSquare } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import type { ChatMessage, Citation } from '@/lib/rag/types';

interface RAGChatPanelProps {
  /** Chat messages */
  messages: ChatMessage[];
  /** Currently active citation for sidebar display */
  activeCitation: Citation | null;
  /** Called when user sends a message */
  onSendMessage: (message: string) => void;
  /** Called when user clears chat */
  onClearChat: () => void;
  /** Called when a citation is clicked */
  onCitationClick: (citation: Citation) => void;
  /** Called when citation sidebar should close */
  onCloseCitation: () => void;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Format citation marker with brackets
 */
function CitationMarker({
  citation,
  onClick,
}: {
  citation: Citation;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-none transition-colors"
      aria-label={`View citation ${citation.id}`}
    >
      [{citation.id}]
    </button>
  );
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * RAGChatPanel - Chat interface for knowledge base conversations
 */
export const RAGChatPanel = memo(function RAGChatPanel({
  messages,
  activeCitation: _activeCitation,
  onSendMessage,
  onClearChat,
  onCitationClick,
  onCloseCitation: _onCloseCitation,
  loading,
  error,
}: RAGChatPanelProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, loading, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleClearChat = useCallback(() => {
    if (messages.length > 0) {
      onClearChat();
    }
  }, [messages.length, onClearChat]);

  const renderMessageContent = (message: ChatMessage) => {
    // Split content by citation markers and render
    const parts = message.content.split(/(\[\d+\])/g);

    return (
      <>
        {parts.map((part, index) => {
          const citationMatch = part.match(/^\[(\d+)\]$/);
          if (citationMatch) {
            const citationId = parseInt(citationMatch[1], 10);
            const citation = message.citations?.find((c) => c.id === citationId);
            if (citation) {
              return (
                <CitationMarker
                  key={index}
                  citation={citation}
                  onClick={() => onCitationClick(citation)}
                />
              );
            }
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  const isEmpty = messages.length === 0;
  const canSend = inputValue.trim() && !loading;

  return (
    <div className="flex flex-col h-full bg-background border-2 border-border rounded-none">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-mono font-bold text-sm flex items-center gap-2">
          <MessageSquare size={14} className="text-secondary" />
          {t('rag.chat.title', 'Knowledge Chat')}
        </h3>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="h-6 w-6 p-0 border-2 border-transparent hover:border-destructive hover:bg-destructive/10 rounded-none"
            aria-label={t('rag.chat.clear', 'Clear Chat')}
          >
            <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-3 mt-3 p-2 border-2 border-destructive bg-destructive/10 rounded-none flex items-center gap-2">
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3"
        role="log"
        aria-label={t('rag.chat.messages.label', 'Chat messages')}
        aria-live="polite"
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot size={48} className="mb-4 opacity-50" />
            <p className="font-medium">{t('rag.chat.empty.title', 'Ask me about your sources')}</p>
            <p className="text-xs mt-1 text-center max-w-xs">
              {t('rag.chat.empty.hint', 'I can answer questions based on your indexed documents')}
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-none border-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-secondary'
                }`}
              >
                {message.role === 'user' ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] p-3 border-2 ${
                  message.role === 'user'
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-surface border-border'
                } rounded-none`}
              >
                <p className="text-sm whitespace-pre-wrap">{renderMessageContent(message)}</p>
                {message.timestamp && (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {formatTime(message.timestamp)}
                  </span>
                )}
                {message.streaming && (
                  <span className="text-xs text-primary mt-1 block animate-pulse">
                    {t('rag.chat.streaming', 'Thinking...')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-secondary text-secondary-foreground rounded-none border-2 border-secondary">
              <Bot size={16} />
            </div>
            <div className="bg-surface border-2 border-border p-3 rounded-none">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-none animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-none animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-none animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('rag.chat.input.placeholder', 'Ask a question...')}
            className="flex-1 border-2 border-input rounded-none"
            disabled={loading}
            aria-label={t('rag.chat.input.label', 'Chat input')}
          />
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="border-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
            aria-label={t('rag.chat.send', 'Send message')}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default RAGChatPanel;
