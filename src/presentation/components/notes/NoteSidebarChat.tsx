/**
 * @fileoverview Note Sidebar Chat Panel
 * @module components/notes/NoteSidebarChat
 * @governance E1-9
 *
 * Compact chat panel for Notes sidebar.
 * Provides quick AI chat access without leaving the sidebar context.
 *
 * E1-9: Add chat to Notes sidebar
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useAgentChatWithTools } from '@/lib/agent/hooks/use-agent-chat-with-tools';
import { useAgentSelection } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { useAgents } from '@/hooks/useAgents';
import { getNotesAgentSystemPrompt } from '@/lib/agent/system-prompt';
import { useAgentChatToolFacades } from '../ide/AgentChatPanel/index';
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import { toast } from 'sonner';

interface NoteSidebarChatProps {
    projectId: string;
    projectName?: string;
    className?: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function NoteSidebarChat({
    projectId: _projectId, // Reserved for future context-based features
    projectName = 'Notes',
    className = '',
}: NoteSidebarChatProps) {
    const { t } = useTranslation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');

    // Get selected agent from Zustand store
    const { activeAgentId } = useAgentSelection();
    const { agents } = useAgents();
    const activeAgent = agents.find(a => a.id === activeAgentId);

    // API key management - providerId is sufficient for useAgentChatWithTools
    // The hook handles API key lookup internally via credential-vault
    const providerId = activeAgent?.providerId;

    // Get workspace context for tool facades (Notes workspace only gets file read tools)
    const { localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted } = useWorkspaceSync();

    // Create tool facades - Notes workspace only gets file read tools
    const { fileTools } = useAgentChatToolFacades({
        localAdapterRef,
        syncManagerRef,
        eventBus,
        initialSyncCompleted,
        workspaceType: 'notes'
    });

    // Notes-specific system prompt
    const systemPrompt = `Notebook: ${projectName}\n\n${getNotesAgentSystemPrompt(projectName)}`;

    // Use the real TanStack AI hook with tools (file read only for Notes)
    const {
        messages: hookMessages,
        sendMessage,
        isLoading,
    } = useAgentChatWithTools({
        fileTools,
        terminalTools: undefined, // Notes workspace doesn't get terminal tools
        eventBus: eventBus || null,
        systemMessage: systemPrompt,
        providerId,
        modelId: activeAgent?.modelId ?? undefined,
        apiKey: undefined, // Credential-vault handles API key lookup
        enableTools: true,
    });

    // Update local messages when hook messages change
    useEffect(() => {
        if (hookMessages.length > 0) {
            const newMessages: ChatMessage[] = hookMessages.map((msg, index) => ({
                id: `msg_${index}_${Date.now()}`,
                role: msg.role === 'tool' ? 'assistant' : (msg.role as 'user' | 'assistant'),
                content: msg.content,
                timestamp: new Date(),
            }));
            setMessages(newMessages);
        }
    }, [hookMessages]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        const messageToSend = input.trim();
        setInput('');

        // Send via AI hook
        try {
            sendMessage(messageToSend);
        } catch (err) {
            console.error('[NoteSidebarChat] Failed to send message:', err);
            toast.error('Failed to send message', {
                description: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Chat Header */}
            <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <h3 className="font-mono text-sm font-bold">
                        {t('chat.title', 'Chat')}
                    </h3>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Bot className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-xs">
                            {t('chat.startConversation', 'Start a conversation')}
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-none text-xs ${
                                message.role === 'user'
                                    ? 'bg-secondary'
                                    : 'bg-primary/20'
                            }`}>
                                {message.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div
                                className={`flex-1 min-w-0 text-xs rounded-md p-2 ${
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-foreground'
                                }`}
                            >
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-2">
                        <div className="shrink-0 w-6 h-6 flex items-center justify-center rounded-none text-xs bg-primary/20">
                            🤖
                        </div>
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-border">
                <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('chat.placeholder', 'Type a message...')}
                            className="w-full min-h-[60px] max-h-[120px] px-3 py-2 bg-background border border-border rounded-md text-xs resize-none focus:outline-none focus:border-primary"
                            disabled={isLoading}
                            rows={1}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        variant="primary"
                        iconOnly={true}
                        className="h-8 w-8 shrink-0"
                        disabled={!input.trim() || isLoading}
                        aria-label={t('chat.send', 'Send')}
                    >
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
