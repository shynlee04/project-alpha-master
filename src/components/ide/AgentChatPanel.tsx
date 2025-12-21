import { useEffect, useRef, useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { appendConversationMessage, clearConversation, getConversation } from '../../lib/workspace';

type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
};

interface AgentChatPanelProps {
    projectId: string | null;
    projectName?: string;
}

export function AgentChatPanel({ projectId, projectName = 'Project' }: AgentChatPanelProps) {
    const { t } = useTranslation();
    const createWelcomeMessage = (): Message => ({
        id: 'welcome',
        role: 'assistant',
        content: t('agent.welcome_message', { projectName }),
        timestamp: Date.now(),
    });

    const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            try {
                if (!projectId) {
                    setMessages([createWelcomeMessage()]);
                    return;
                }

                const convo = await getConversation(projectId);
                if (isCancelled) return;

                if (convo && convo.messages.length > 0) {
                    setMessages(convo.messages as Message[]);
                } else {
                    setMessages([createWelcomeMessage()]);
                }
            } catch {
                if (isCancelled) return;
                setMessages([createWelcomeMessage()]);
            }
        };

        load();

        return () => {
            isCancelled = true;
        };
    }, [projectId, projectName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleFocus = () => {
            inputRef.current?.focus();
        };

        window.addEventListener('ide.chat.focus', handleFocus);
        return () => window.removeEventListener('ide.chat.focus', handleFocus);
    }, []);

    const send = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        if (projectId) {
            appendConversationMessage(projectId, userMessage).catch((err) => {
                console.warn('[AgentChatPanel] Failed to persist user message:', err);
            });
        }
        setInput('');

        const assistantMessage: Message = {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: t('agent.demo_response'),
            timestamp: Date.now(),
        };

        window.setTimeout(() => {
            setMessages((prev) => [...prev, assistantMessage]);
            if (projectId) {
                appendConversationMessage(projectId, assistantMessage).catch((err) => {
                    console.warn('[AgentChatPanel] Failed to persist assistant message:', err);
                });
            }
        }, 300);
    };

    const handleClear = async () => {
        if (projectId) {
            await clearConversation(projectId);
        }
        setMessages([createWelcomeMessage()]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        send();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="flex flex-col h-full bg-card/30">
            <div className="h-9 px-4 flex items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                        {t('agent.title')}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleClear}
                    title={t('agent.clear')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    {t('agent.clear')}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${message.role === 'assistant'
                                ? 'bg-gradient-to-br from-primary to-purple-500'
                                : 'bg-accent'
                                }`}
                        >
                            {message.role === 'assistant' ? (
                                <Bot className="w-4 h-4 text-white" />
                            ) : (
                                <User className="w-4 h-4 text-foreground" />
                            )}
                        </div>
                        <div
                            className={`flex-1 max-w-[85%] px-3 py-2 rounded-lg text-sm ${message.role === 'assistant'
                                ? 'bg-muted text-foreground'
                                : 'bg-primary/10 text-foreground'
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
                <div className="relative">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('agent.placeholder')}
                        rows={1}
                        className="w-full px-3 py-2 pr-12 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none min-h-[44px] max-h-[120px]"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        aria-label="Send message"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80 disabled:text-muted-foreground/50 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
