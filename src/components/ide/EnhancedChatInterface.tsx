import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Bot, User, Send, Loader2, Code, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

/**
 * EnhancedChatInterface - Premium agent chat with tool execution logs
 * 
 * Features:
 * - Message bubbles with user/agent distinction
 * - Tool execution log expansion
 * - Typing indicator
 * - Auto-scroll to bottom
 * - Pixel aesthetic styling
 */

interface ToolExecution {
    id: string
    name: string
    status: 'running' | 'success' | 'error'
    input?: string
    output?: string
    duration?: number
}

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    toolExecutions?: ToolExecution[]
}

interface EnhancedChatProps {
    messages: ChatMessage[]
    isTyping?: boolean
    onSendMessage: (content: string) => void
    className?: string
}

export function EnhancedChatInterface({
    messages,
    isTyping = false,
    onSendMessage,
    className
}: EnhancedChatProps) {
    const { t } = useTranslation()
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim()) {
            onSendMessage(input.trim())
            setInput('')
        }
    }

    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            {/* Messages area */}
            <div className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Bot className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-pixel">
                            {t('chat.startConversation', 'Start a conversation')}
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <ChatMessageBubble key={message.id} message={message} />
                    ))
                )}

                {/* Typing indicator */}
                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
                onSubmit={handleSubmit}
                className="shrink-0 border-t border-border p-4 bg-secondary/30"
            >
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('chat.placeholder', 'Type a message...')}
                        className="flex-1 h-10 px-4 bg-background border border-border rounded-none text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                        disabled={isTyping}
                    />
                    <Button
                        type="submit"
                        variant="pixel-primary"
                        size="icon"
                        disabled={!input.trim() || isTyping}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    )
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user'

    return (
        <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
            {/* Avatar */}
            <div className={cn(
                "shrink-0 w-8 h-8 flex items-center justify-center rounded-none",
                isUser ? "bg-secondary" : "bg-primary/20"
            )}>
                {isUser ? (
                    <User className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <Bot className="w-4 h-4 text-primary" />
                )}
            </div>

            {/* Content */}
            <div className={cn(
                "flex-1 max-w-[80%]",
                isUser && "flex flex-col items-end"
            )}>
                <div className={cn(
                    "px-4 py-2 rounded-none",
                    isUser
                        ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(194,65,12,0.5)]"
                        : "bg-secondary text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Tool executions */}
                {message.toolExecutions && message.toolExecutions.length > 0 && (
                    <ToolExecutionLog executions={message.toolExecutions} />
                )}

                {/* Timestamp */}
                <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </div>
    )
}

function ToolExecutionLog({ executions }: { executions: ToolExecution[] }) {
    const [isExpanded, setExpanded] = useState(false)
    const { t } = useTranslation()

    return (
        <div className="mt-2 w-full">
            <button
                onClick={() => setExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
                <Code className="w-3 h-3" />
                {executions.length} {t('chat.toolsUsed', 'tools used')}
                {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                ) : (
                    <ChevronDown className="w-3 h-3" />
                )}
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-1 pl-5">
                    {executions.map((exec) => (
                        <div
                            key={exec.id}
                            className="flex items-center gap-2 text-xs py-1 px-2 bg-secondary/50 rounded-none"
                        >
                            {exec.status === 'running' && (
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            )}
                            {exec.status === 'success' && (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                            )}
                            {exec.status === 'error' && (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span className="text-muted-foreground font-mono">{exec.name}</span>
                            {exec.duration && (
                                <span className="text-muted-foreground/70">{exec.duration}ms</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function TypingIndicator() {
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-none">
                <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="px-4 py-2 bg-secondary rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    )
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export type { ChatMessage, ToolExecution, EnhancedChatProps }
