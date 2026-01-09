/**
 * ChatConversation - Optimized chat interface with virtual scrolling
 * 
 * Performance optimizations:
 * - Virtual scrolling using react-window for 100+ messages
 * - React.memo for message bubble memoization
 * - useCallback for event handlers
 * - Debounced message input
 * - Loading states for perceived performance
 * 
 * @epic P0.6 - Improve Chat Interface Performance
 * @story P0.6
 * 
 * @see _bmad-output/design-system-8bit-2025-12-25.md
 */

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { ArrowLeft, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/presentation/components/ui/button'
import { StreamdownRenderer } from './StreamdownRenderer'
import { UnifiedAgentSelector } from '../agent/UnifiedAgentSelector'
import type { ConversationThread, ThreadMessage } from '@/infrastructure/persistence/stores/conversation/useConversationStore'
import type { AgentData } from '@/infrastructure/persistence/stores/agents/types'
import { useTranslation } from 'react-i18next'
import { List } from 'react-window'
import { TruncatedText } from '@/presentation/components/ui/truncated-text'
import { useActiveAgent, useAgentsStore } from '@/infrastructure/persistence/stores'

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
 * Message Bubble Component - Memoized for performance
 */
const MessageBubble = memo(function MessageBubble({
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
                        ? 'bg-primary/20 border-primary text-primary-foreground'
                        : 'bg-card border-border text-foreground',
                    'shadow-pixel'
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

MessageBubble.displayName = 'MessageBubble';

/**
 * Typing Indicator - UX-02: Upgraded 8-bit styling
 */
function TypingIndicator() {
    return (
        <div className="flex gap-3 px-4 py-3">
            <div className={cn(
                'w-8 h-8 rounded-none flex items-center justify-center',
                'border-2 bg-purple-600 border-purple-400'
            )}>
                <Bot className="h-4 w-4 text-white" />
            </div>
            <div className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-none',
                'bg-card border-2 border-border',
                'shadow-[var(--shadow-pixel-sm)]'
            )}>
                <div className="w-2 h-2 bg-primary rounded-none animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-none animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-none animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

/**
 * Chat Conversation Props
 */
interface ChatConversationProps {
    thread: ConversationThread;
    agents: AgentData[];
    selectedAgent: AgentData | null;
    onSelectAgent: (agent: AgentData) => void;
    onSendMessage: (content: string) => void;
    onBack: () => void;
    isStreaming?: boolean;
    streamingContent?: string;
    error?: string | null;
    className?: string;
}

/**
 * Virtual scrolling row renderer
 */
interface RowProps {
    ariaAttributes?: {
        'aria-posinset': number;
        'aria-setsize': number;
        role: 'listitem';
    };
    index: number;
    style: React.CSSProperties;
}

/**
 * ChatConversation Component - Optimized with virtual scrolling
 */
export function ChatConversation({
    thread,
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
    const listRef = useRef<ReturnType<typeof List> | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const agents = useAgentsStore((state) => state.agents);
    const activeAgent = useActiveAgent(agents);
    // Allow selectedAgent alias for backward compatibility with existing code in this file
    const selectedAgent = activeAgent;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread.messages.length, streamingContent]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, [thread.id]);

    // Debounced input handler
    const [debouncedInput, setDebouncedInput] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedInput(input);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [input]);

    // Memoized submit handler
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!debouncedInput.trim() || isStreaming) return;
        onSendMessage(debouncedInput.trim());
        setInput('');
        setDebouncedInput('');
    }, [debouncedInput, isStreaming, onSendMessage]);

    // Memoized keydown handler
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    // Row renderer for virtual list
    function Row({ index, style }: RowProps) {
        const message = thread.messages[index];
        const isStreamingMessage =
            isStreaming &&
            index === thread.messages.length - 1 &&
            message.role === 'assistant';

        return (
            <div style={style}>
                <MessageBubble
                    message={message}
                    isStreaming={isStreamingMessage}
                />
            </div>
        );
    }

    // Calculate row height for virtual list
    const getItemSize = useCallback(() => {
        // Approximate height: avatar (32px) + content (variable) + timestamp (20px) + padding (24px)
        // Base height ~80px for typical messages
        return 80;
    }, []);

    // Render empty state
    if (thread.messages.length === 0) {
        return (
            <div className={cn('flex flex-col h-full', className)}>
                {/* Header */}
                <div className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    'border-b-2 border-border',
                    'bg-secondary'
                )}>
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        iconOnly
                        onClick={onBack}
                        className={cn(
                            'h-8 w-8',
                            'border border-border hover:bg-secondary/80'
                        )}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    {/* Thread title */}
                    <div className="flex-1 min-w-0">
                        <TruncatedText
                            text={thread.title}
                            className={cn(
                                'font-mono font-bold text-sm',
                                'text-slate-100'
                            )}
                        />
                    </div>

                    {/* Agent selector */}
                    <UnifiedAgentSelector
                        onSelectAgent={onSelectAgent}
                        disabled={isStreaming}
                        variant="full"
                    />
                </div>

                {/* Empty conversation - UX-02: Fixed transparency */}
                <div className="flex-1 overflow-y-auto bg-background">
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Bot className="h-12 w-12 mb-4 opacity-50" />
                        <p className="font-mono text-sm">
                            {t('chat.startChatting', 'Start chatting with AI agent')}
                        </p>
                    </div>
                </div>

                {/* Error display */}
                {error && (
                    <div className={cn(
                        'flex items-center gap-2 px-4 py-2',
                        'bg-destructive/90 border-t-2 border-destructive',
                        'text-destructive-foreground text-sm font-mono'
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
                        'border-t-2 border-border',
                        'bg-secondary'
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
                            'bg-popover border-2 border-input',
                            'text-foreground placeholder:text-muted-foreground',
                            'focus:border-primary focus:outline-none',
                            'resize-none rounded-sm',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={!debouncedInput.trim() || isStreaming || !selectedAgent}
                        className={cn(
                            'px-4 font-mono',
                            'bg-primary hover:bg-primary/90',
                            'border-2 border-primary-foreground',
                            'shadow-md',
                            'hover:shadow-sm',
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

    // Render virtual list for messages
    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header - UX-02: Fixed transparency */}
            <div className={cn(
                'flex items-center gap-3 px-4 py-3',
                'border-b-2 border-border',
                'bg-card'
            )}>
                {/* Back button */}
                <Button
                    variant="ghost"
                    iconOnly
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
                <div className="flex-1 min-w-0">
                    <TruncatedText
                        text={thread.title}
                        className={cn(
                            'font-mono font-bold text-sm',
                            'text-slate-100'
                        )}
                    />
                </div>

                {/* Agent selector */}
                <UnifiedAgentSelector
                    onSelectAgent={onSelectAgent}
                    disabled={isStreaming}
                    variant="full"
                />
            </div>

            {/* Messages area with virtual scrolling */}
            <div className="flex-1 overflow-hidden bg-background">
                <div className="py-4">
                    <List
                        ref={listRef}
                        height={600} // Fixed height for virtual list
                        rowCount={thread.messages.length}
                        rowHeight={getItemSize()}
                        width="100%"
                        overscanCount={5} // Render 5 extra rows for smooth scrolling
                        {...({ rowComponent: Row } as any)}
                    />
                </div>

                {/* Streaming indicator or typing */}
                {isStreaming && streamingContent && (
                    <div className="mt-2">
                        <MessageBubble
                            message={{
                                id: 'streaming',
                                role: 'assistant',
                                content: streamingContent,
                                timestamp: Date.now(),
                                agentName: selectedAgent?.name,
                                agentModel: selectedAgent?.modelId,
                            }}
                            isStreaming
                        />
                    </div>
                )}

                {isStreaming && !streamingContent && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            {/* Error display - UX-02: Fixed transparency */}
            {error && (
                <div className={cn(
                    'flex items-center gap-2 px-4 py-2',
                    'bg-destructive/90 border-t-2 border-destructive',
                    'text-destructive-foreground text-sm font-mono'
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
                    'border-t-2 border-border',
                    'bg-secondary'
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
                        'bg-popover border-2 border-input',
                        'text-foreground placeholder:text-muted-foreground',
                        'focus:border-primary focus:outline-none',
                        'resize-none rounded-sm',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                />
                <Button
                    type="submit"
                    disabled={!debouncedInput.trim() || isStreaming || !selectedAgent}
                    className={cn(
                        'px-4 font-mono',
                        'bg-primary hover:bg-primary/90',
                        'border-2 border-primary-foreground',
                        'shadow-pixel',
                        'hover:shadow-pixel-sm',
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
