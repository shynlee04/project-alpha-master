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
import { Trash2, Bot, User, MessageSquare } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { StreamdownRenderer } from '@/presentation/components/chat/StreamdownRenderer';
import { ArtifactPreviewModal } from '@/presentation/components/chat/ArtifactPreviewModal';
import { ChatInputControls } from '@/presentation/components/chat/ChatInputControls';
import { useArtifactPreview } from '@/presentation/hooks/useArtifactPreview';
import type { ChatMessage, Citation } from '@/lib/rag/types';
import type { Attachment } from '@/presentation/components/chat/FileAttachmentInput';
import type { UseVoiceRecordingState } from '@/lib/voice/use-voice-recording';

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

  // CHAT-009: Artifact preview state and handlers
  const { artifactPreview, openArtifact, closeArtifact } = useArtifactPreview();

  // CHAT-004: Attachments state (empty - RAGChatPanel doesn't support file attachments)
  const [attachments] = useState<Attachment[]>([]);

  // CHAT-004: Voice recording state (not supported - minimal mode)
  const voiceRecording: UseVoiceRecordingState = {
    isRecording: false,
    isProcessing: false,
    volumeLevel: 0,
    error: null,
    isSupported: false,
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // CHAT-004: Handle form submit from ChatInputControls
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, loading, onSendMessage]);

  const handleClearChat = useCallback(() => {
    if (messages.length > 0) {
      onClearChat();
    }
  }, [messages.length, onClearChat]);

  // CHAT-004: No-op attachment handlers (not supported in RAGChatPanel)
  const handleAddAttachment = useCallback(() => {
    // File attachments not supported in Knowledge workspace chat
    console.warn('[RAGChatPanel] File attachments not supported');
  }, []);

  const handleRemoveAttachment = useCallback(() => {
    // File attachments not supported in Knowledge workspace chat
  }, []);

  const handleVoiceClick = useCallback(() => {
    // Voice input not supported in Knowledge workspace chat
    console.warn('[RAGChatPanel] Voice input not supported');
  }, []);

  /**
   * CHAT-009: Render message content with markdown and citation support
   *
   * Splits content by citation markers and renders:
   * - Non-citation parts with StreamdownRenderer (markdown + code blocks)
   * - Citation markers as interactive CitationMarker components
   *
   * This preserves citation functionality while enabling rich markdown rendering.
   */
  const renderMessageContent = useCallback(
    (message: ChatMessage) => {
      // Split content by citation markers [1], [2], etc.
      const parts = message.content.split(/(\[\d+\])/g);

      return (
        <>
          {parts.map((part, index) => {
            const citationMatch = part.match(/^\[(\d+)\]$/);
            if (citationMatch) {
              // This is a citation marker
              const citationId = parseInt(citationMatch[1], 10);
              const citation = message.citations?.find((c) => c.id === citationId);
              if (citation) {
                return (
                  <CitationMarker
                    key={`citation-${index}`}
                    citation={citation}
                    onClick={() => onCitationClick(citation)}
                  />
                );
              }
              // Fallback for orphaned citation markers
              return <span key={`citation-${index}`}>{part}</span>;
            }
            // This is content - render with markdown support
            return (
              <StreamdownRenderer
                key={`content-${index}`}
                content={part}
                isStreaming={message.streaming}
                onPreviewArtifact={(code) => openArtifact(code, 'text', 'artifact.txt')}
                onSaveArtifact={(code, language) => {
                  // CHAT-009: Save artifact handler
                  // For now, trigger download via browser - could be enhanced with localAdapterRef
                  const blob = new Blob([code], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `artifact.${language || 'txt'}`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              />
            );
          })}
        </>
      );
    },
    [onCitationClick, openArtifact]
  );

  const isEmpty = messages.length === 0;

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

      {/* CHAT-004: Input using ChatInputControls with minimal mode */}
      <ChatInputControls
        input={inputValue}
        setInput={setInputValue}
        attachments={attachments}
        onAddAttachment={handleAddAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        voiceRecording={voiceRecording}
        onVoiceClick={handleVoiceClick}
        isTyping={loading}
        onSubmit={handleSubmit}
        showAttachments={false}
        showVoice={false}
      />

      {/* CHAT-009: Artifact Preview Modal */}
      <ArtifactPreviewModal
        open={artifactPreview.open}
        onClose={closeArtifact}
        code={artifactPreview.code}
        language={artifactPreview.language}
        fileName={artifactPreview.fileName}
      />
    </div>
  );
});

export default RAGChatPanel;
