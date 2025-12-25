/**
 * ChatConversation - Active conversation view with rich rendering
 * 
 * Displays the active conversation with:
 * - Message history with agent attribution
 * - Streamdown rendering for AI responses (markdown + mermaid)
 * - Input field for new messages
 * - Back button to return to threads list
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StreamdownRenderer } from './StreamdownRenderer';
import { AgentSelector } from './AgentSelector';
import type { ConversationThread, ThreadMessage } from '@/stores/conversation-threads-store';
import type { Agent } from '@/mocks/agents';
import { useTranslation } from 'react-i18next';

interface ChatConversationProps {
    thread: ConversationThread;
    agents: Agent[];
    selectedAgent: Agent | null;
    onSelectAgent: (agent: Agent) => void;
    onSendMessage: (content: string) => void;
    onBack: () => void;
    isStreaming?: boolean;
    streamingContent?: string;
    error?: string | null;
    className?: string;
}

/**
 * Format message timestamp
 */
function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Message Bubble Component
 */
function MessageBubble({
    message,
    isStreaming = false,
}: {
    message: ThreadMessage;
    isStreaming?: boolean;
}) {
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
                    'shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
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
}

/**
 * Typing Indicator
 */
function TypingIndicator() {
    return (
        <div className="flex gap-3 px-4 py-3">
            <div className={cn(
                'w-8 h-8 rounded-sm flex items-center justify-center',
                'border-2 bg-purple-600 border-purple-400'
            )}>
                <Bot className="h-4 w-4 text-white" />
            </div>
            <div className={cn(
                'flex items-center gap-1 px-4 py-2 rounded-sm',
                'bg-slate-800/80 border-2 border-slate-600',
                'shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
            )}>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

/**
 * ChatConversation Component
 */
export function ChatConversation({
    thread,
    agents,
    selectedAgent,
    onSelectAgent,
    onSendMessage,
    onBack,
    isStreaming = false,
    streamingContent,
    error,
    className,
}: ChatConversationProps) {
    const { t } = useTranslation();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread.messages, streamingContent]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, [thread.id]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;
        onSendMessage(input.trim());
        setInput('');
    }, [input, isStreaming, onSendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className={cn(
                'flex items-center gap-3 px-4 py-3',
                'border-b-2 border-slate-700 dark:border-slate-600',
                'bg-slate-800/80'
            )}>
                {/* Back button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className={cn(
                        'h-8 w-8',
                        'border border-slate-600 hover:border-slate-500',
                        'hover:bg-slate-700'
                    )}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                {/* Thread title */}
                <h2 className={cn(
                    'flex-1 font-mono font-bold text-sm truncate',
                    'text-slate-100'
                )}>
                    {thread.title}
                </h2>

                {/* Agent selector */}
                <AgentSelector
                    agents={agents}
                    selectedAgent={selectedAgent}
                    onSelectAgent={onSelectAgent}
                    disabled={isStreaming}
                />
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto bg-slate-900/50">
                {thread.messages.length === 0 ? (
                    // Empty conversation
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Bot className="h-12 w-12 mb-4 opacity-50" />
                        <p className="font-mono text-sm">
                            {t('chat.startChatting', 'Start chatting with the AI agent')}
                        </p>
                    </div>
                ) : (
                    <div className="py-4">
                        {thread.messages.map((message, index) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isStreaming={
                                    isStreaming &&
                                    index === thread.messages.length - 1 &&
                                    message.role === 'assistant'
                                }
                            />
                        ))}

                        {/* Streaming indicator or typing */}
                        {isStreaming && streamingContent && (
                            <MessageBubble
                                message={{
                                    id: 'streaming',
                                    role: 'assistant',
                                    content: streamingContent,
                                    timestamp: Date.now(),
                                    agentName: selectedAgent?.name,
                                    agentModel: selectedAgent?.model,
                                }}
                                isStreaming
                            />
                        )}

                        {isStreaming && !streamingContent && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Error display */}
            {error && (
                <div className={cn(
                    'flex items-center gap-2 px-4 py-2',
                    'bg-red-900/30 border-t border-red-600',
                    'text-red-300 text-sm font-mono'
                )}>
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Input area */}
            <form
                onSubmit={handleSubmit}
                className={cn(
                    'flex gap-2 p-4',
                    'border-t-2 border-slate-700 dark:border-slate-600',
                    'bg-slate-800/80'
                )}
            >
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('chat.typeMessage', 'Type a message...')}
                    disabled={isStreaming || !selectedAgent}
                    rows={1}
                    className={cn(
                        'flex-1 px-3 py-2 font-mono text-sm',
                        'bg-slate-900/80 border-2 border-slate-600',
                        'text-slate-100 placeholder:text-slate-500',
                        'focus:border-blue-500 focus:outline-none',
                        'resize-none rounded-sm',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                />
                <Button
                    type="submit"
                    disabled={!input.trim() || isStreaming || !selectedAgent}
                    className={cn(
                        'px-4 font-mono',
                        'bg-blue-600 hover:bg-blue-500',
                        'border-2 border-blue-400',
                        'shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]',
                        'hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.4)]',
                        'hover:translate-x-[2px] hover:translate-y-[2px]',
                        'transition-all duration-100',
                        'disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0'
                    )}
                >
                    {isStreaming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}

export default ChatConversation;
