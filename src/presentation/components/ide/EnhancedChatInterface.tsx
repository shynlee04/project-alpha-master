import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Bot, User, Send, ChevronDown, ChevronUp, Code, Mic, MicOff, BookOpen } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useDeviceType } from '@/hooks/useMediaQuery'
import { toast } from 'sonner'

import { ToolCallBadge } from '@/presentation/components/chat/ToolCallBadge'
import { StreamdownRenderer } from '@/presentation/components/chat/StreamdownRenderer'
import { FileAttachmentInput, type Attachment, type FileAttachment } from '@/presentation/components/chat/FileAttachmentInput'
import { NoteReferencePicker, useNoteReferencePicker } from '@/presentation/components/chat/NoteReferencePicker'
import { useTranslation } from 'react-i18next'
import { useVoiceRecording } from '@/lib/voice/use-voice-recording'
import { convertImageAttachments } from '@/lib/media/image-attachments'
import type { ImageContent } from '@/lib/agent/multimodal/message-builder'

/**
 * @fileoverview Enhanced Chat Interface with Mobile Optimization
 * @module presentation/components/ide/EnhancedChatInterface
 *
 * E1-10: Mobile-optimized chat layout
 * - Visual viewport API for keyboard avoidance (iOS Safari fix)
 * - Smooth scrolling with -webkit-overflow-scrolling: touch
 * - Touch targets ≥44x44px on mobile
 * - Attachment and voice input button placeholders
 *
 * E3-5: Note Reference Support
 * - /note slash command detection
 * - Note reference picker dialog
 * - Insert note reference format into chat input
 */

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
    status: 'pending' | 'running' | 'success' | 'error'
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
    /**
     * E2-8: Send message callback (supports optional images)
     * When images are provided, builds multimodal message for AI
     */
    onSendMessage: (content: string, images?: ImageContent[]) => void
    className?: string
    onPreviewArtifact?: (code: string) => void
    onSaveArtifact?: (code: string, language: string) => void
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
    setScrollRef?: React.RefObject<HTMLDivElement | null>
    /** E1-8: Auto-scroll to bottom on new messages */
    autoScroll?: boolean
}

export function EnhancedChatInterface({
    messages,
    isTyping = false,
    onSendMessage,
    className,
    onPreviewArtifact,
    onSaveArtifact,
    onScroll,
    setScrollRef,
    autoScroll = true, // E1-8: Default to true for backward compatibility
}: EnhancedChatProps) {
    const { t } = useTranslation()
    const { isMobile } = useDeviceType()
    const [input, setInput] = useState('')
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    // E2-4: File attachments state
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // E2-1: Voice recording hook for speech-to-text input
    const voiceRecording = useVoiceRecording({
        minDuration: 500,
        maxDuration: 30000,
        autoSendAfterSilence: 2000,
    })

    // E3-5: Note reference picker
    const notePicker = useNoteReferencePicker()

    // E3-5: Detect /note slash command and open picker
    useEffect(() => {
        const trimmedInput = input.trim()
        // Check if user typed /note or /note with trailing space
        if (trimmedInput === '/note' || trimmedInput === '/note ') {
            // Open the note picker
            notePicker.openPicker((noteId: string, noteTitle: string) => {
                // Insert note reference format into input
                const reference = `📌 [${noteTitle}]#${noteId} `
                setInput(reference)
                // Focus back on textarea after selection
                setTimeout(() => {
                    const textarea = document.querySelector('textarea:not([disabled])') as HTMLTextAreaElement
                    textarea?.focus()
                    // Move cursor to end of input
                    textarea?.setSelectionRange(reference.length, reference.length)
                }, 100)
            })
            // Clear the /note command from input
            setInput('')
        }
    }, [input, notePicker])

    // E1-10: Visual viewport API for keyboard avoidance (iOS Safari fix)
    // Prevents keyboard from hiding input on mobile devices
    useEffect(() => {
        if (!window.visualViewport) return

        const handleViewportResize = () => {
            const viewport = window.visualViewport
            if (viewport) {
                const windowHeight = window.innerHeight
                const viewportHeight = viewport.height
                // Keyboard is visible if viewport is smaller than window
                const newKeyboardHeight = Math.max(0, windowHeight - viewportHeight)
                setKeyboardHeight(newKeyboardHeight)
            }
        }

        window.visualViewport.addEventListener('resize', handleViewportResize)
        // Initial check
        handleViewportResize()

        return () => {
            window.visualViewport?.removeEventListener('resize', handleViewportResize)
        }
    }, [])

    // E1-10: Adjust form position when keyboard is visible
    useEffect(() => {
        if (keyboardHeight > 0 && formRef.current) {
            // Scroll form into view when keyboard appears
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
    }, [keyboardHeight])

    // E1-10: Auto-scroll to bottom on new messages (only if autoScroll is enabled)
    useEffect(() => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isTyping, autoScroll])

    // E2-1: Handle voice recording errors
    useEffect(() => {
        if (voiceRecording.error) {
            toast.error(voiceRecording.error)
            voiceRecording.clearError()
        }
    }, [voiceRecording.error, voiceRecording.clearError])

    // DEBUG: Log messages received
    useEffect(() => {
        console.log('[EnhancedChatInterface] Messages received:', {
            count: messages.length,
            messages: messages.map(m => ({ id: m.id, role: m.role, contentLength: m.content?.length }))
        });
    }, [messages]);

    /**
     * E2-8: Handle form submission with multimodal support
     * - Converts image attachments to base64 for AI transmission
     * - Allows sending with just text, just images, or both
     */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        // Check if we have content to send (text OR attachments)
        const hasContent = input.trim() || attachments.length > 0
        if (!hasContent) {
            return
        }

        // E2-8: Convert image attachments to base64 for multimodal message
        const imageData = await convertImageAttachments(
            attachments.filter((a): a is FileAttachment => a.type === 'image')
        )

        // Convert ImageAttachmentData to ImageContent format
        const images: ImageContent[] = imageData.map((data) => ({
            base64: data.base64,
            mimeType: data.mimeType,
        }))

        // Send message with optional images
        onSendMessage(input.trim(), images.length > 0 ? images : undefined)
        setInput('')

        // E2-4: Clear attachments after sending (type guard for preview property)
        attachments.forEach(a => {
            if ('preview' in a && a.preview) {
                URL.revokeObjectURL(a.preview)
            }
        })
        setAttachments([])
    }, [input, attachments, onSendMessage])

    // E2-4: Handle file/URL attachment addition (accepts union type)
    const handleAddAttachment = useCallback((attachment: Attachment) => {
        setAttachments(prev => [...prev, attachment])
    }, [])

    // E2-4: Handle file/URL attachment removal
    const handleRemoveAttachment = useCallback((id: string) => {
        setAttachments(prev => {
            const attachment = prev.find(a => a.id === id)
            // Revoke object URL to free memory (type guard for preview property)
            if (attachment && 'preview' in attachment && attachment.preview) {
                URL.revokeObjectURL(attachment.preview)
            }
            return prev.filter(a => a.id !== id)
        })
    }, [])

    // E2-1: Handle voice recording toggle
    const handleVoiceClick = useCallback(async () => {
        if (!voiceRecording.isSupported) {
            toast.error(t('voice.notSupported'))
            return
        }

        if (voiceRecording.isRecording) {
            // Stop recording and get transcript
            const transcript = await voiceRecording.stopRecording()
            if (transcript) {
                // Append transcript to input (preserving existing text)
                setInput(prev => prev ? `${prev} ${transcript}` : transcript)
            }
        } else {
            // Start recording
            await voiceRecording.startRecording()
        }
    }, [voiceRecording, t])

    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            {/* Messages area - E1-10: Smooth scrolling on mobile */}
            <div
                ref={setScrollRef}
                className={cn(
                    "flex-1 overflow-auto p-4 space-y-4 scrollbar-thin",
                    // E1-10: Native smooth scrolling on iOS
                    isMobile && "[-webkit-overflow-scrolling:touch]"
                )}
                onScroll={onScroll}
                style={{ paddingBottom: isMobile ? keyboardHeight : undefined }}
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Bot className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-pixel">
                            {t('chat.startConversation', 'Start a conversation')}
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <ChatMessageBubble
                            key={message.id}
                            message={message}
                            onPreviewArtifact={onPreviewArtifact}
                            onSaveArtifact={onSaveArtifact}
                        />
                    ))
                )}

                {/* Typing indicator */}
                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area - E1-10: Mobile-optimized with attachment/voice buttons */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className={cn(
                    "shrink-0 border-t border-border bg-secondary/30",
                    // E1-10: Add extra padding when keyboard is visible
                    isMobile && keyboardHeight > 0 && "pb-safe"
                )}
            >
                <div className={cn(
                    "flex gap-2 items-end p-3",
                    // E1-10: Stack buttons vertically on mobile for better touch targets
                    isMobile ? "flex-wrap" : ""
                )}>
                    {/* E2-4: File attachment input */}
                    <FileAttachmentInput
                        attachments={attachments}
                        onAdd={handleAddAttachment}
                        onRemove={handleRemoveAttachment}
                        disabled={isTyping}
                    />

                    {/* E2-1: Voice input button with recording state */}
                    <Button
                        type="button"
                        variant={voiceRecording.isRecording ? "destructive" : "ghost"}
                        onClick={handleVoiceClick}
                        className={cn(
                            "shrink-0 relative",
                            // E2-1: Pulsing animation when recording
                            voiceRecording.isRecording && "animate-pulse",
                            // E1-10: Touch targets ≥44x44px on mobile, prominent on mobile
                            isMobile ? "h-11 w-11 min-w-[44px] min-h-[44px]" : "h-9 w-9"
                        )}
                        aria-label={
                            voiceRecording.isRecording
                                ? t('voice.tapToStop', 'Tap to stop')
                                : t('voice.tapToRecord', 'Tap to record')
                        }
                        title={
                            voiceRecording.isRecording
                                ? t('voice.recording', 'Listening...')
                                : t('voice.record', 'Tap to speak')
                        }
                    >
                        {voiceRecording.isRecording ? (
                            <MicOff className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
                        ) : (
                            <Mic className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
                        )}
                        {/* E2-1: Volume level indicator */}
                        {voiceRecording.isRecording && voiceRecording.volumeLevel > 0.01 && (
                            <span
                                className="absolute inset-0 rounded-full bg-primary/20"
                                style={{
                                    transform: `scale(${0.8 + voiceRecording.volumeLevel * 0.4})`,
                                    transition: 'transform 100ms ease-out',
                                }}
                            />
                        )}
                    </Button>

                    {/* Text input */}
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                            // Auto-resize textarea
                            e.target.style.height = 'auto'
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
                        }}
                        onKeyDown={async (e) => {
                            // E2-8: Submit on Enter (without Shift) - supports attachments
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                const hasContent = input.trim() || attachments.length > 0
                                if (hasContent && !isTyping) {
                                    // Convert image attachments to base64
                                    const imageData = await convertImageAttachments(
                                        attachments.filter((a): a is FileAttachment => a.type === 'image')
                                    )
                                    const images: ImageContent[] = imageData.map((data) => ({
                                        base64: data.base64,
                                        mimeType: data.mimeType,
                                    }))
                                    // Send with optional images
                                    onSendMessage(input.trim(), images.length > 0 ? images : undefined)
                                    setInput('')
                                    // Clear attachments
                                    attachments.forEach(a => {
                                        if ('preview' in a && a.preview) {
                                            URL.revokeObjectURL(a.preview)
                                        }
                                    })
                                    setAttachments([])
                                    e.currentTarget.style.height = 'auto'
                                }
                            }
                        }}
                        placeholder={t('chat.placeholder', 'Type a message...')}
                        className={cn(
                            "flex-1 min-h-[40px] max-h-[150px] px-3 py-2 bg-background border border-border rounded-none placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none overflow-y-auto",
                            // E1-10: Larger text on mobile for readability
                            isMobile ? "text-base" : "text-base md:text-sm"
                        )}
                        disabled={isTyping}
                        rows={1}
                    />

                    {/* Send button - E1-10: Larger on mobile for touch targets */}
                    <Button
                        type="submit"
                        variant="primary"
                        iconOnly={true}
                        className={cn(
                            "shrink-0",
                            // E1-10: Touch targets ≥44x44px on mobile
                            isMobile ? "h-11 w-11 min-w-[44px] min-h-[44px]" : "h-10 w-10"
                        )}
                        // E2-8: Allow sending with just attachments
                        disabled={(!input.trim() && attachments.length === 0) || isTyping}
                        aria-label={t('chat.send', 'Send message')}
                    >
                        <Send className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
                    </Button>
                </div>
            </form>

            {/* E3-5: Note Reference Picker Dialog */}
            <NoteReferencePicker
                open={notePicker.open}
                onClose={notePicker.onClose}
                onSelectNote={notePicker.onSelectNote}
            />
        </div>
    )
}

function ChatMessageBubble({
    message,
    onPreviewArtifact,
    onSaveArtifact
}: {
    message: ChatMessage
    onPreviewArtifact?: (code: string) => void
    onSaveArtifact?: (code: string, language: string) => void
}) {
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
                "flex-1 min-w-0 max-w-[85%]",
                isUser && "flex flex-col items-end"
            )}>
                {/* Message Text with Code Block Support */}
                <div className={cn(
                    "rounded-none overflow-hidden",
                    isUser
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary text-foreground shadow-md"
                )}>
                    <MessageContent
                        content={message.content}
                        isUser={isUser}
                        onPreviewArtifact={onPreviewArtifact}
                        onSaveArtifact={onSaveArtifact}
                    />
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

function MessageContent({
    content,
    isUser,
    onPreviewArtifact,
    onSaveArtifact
}: {
    content: string
    isUser: boolean
    onPreviewArtifact?: (code: string) => void
    onSaveArtifact?: (code: string, language: string) => void
}) {
    // For user messages, keep simple rendering
    if (isUser) {
        return (
            <div className="text-sm p-3 whitespace-pre-wrap">
                {content}
            </div>
        )
    }

    // For assistant messages, use rich markdown rendering with mermaid support
    return (
        <div className="text-sm py-1 px-3">
            <StreamdownRenderer
                content={content}
                isStreaming={false}
                className="prose-sm"
                onPreviewArtifact={onPreviewArtifact}
                onSaveArtifact={onSaveArtifact}
            />
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
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-2"
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
                <div className="flex flex-wrap gap-2 pl-1">
                    {executions.map((exec) => (
                        <ToolCallBadge
                            key={exec.id}
                            name={exec.name}
                            status={exec.status}
                            arguments={exec.input ? JSON.parse(exec.input || '{}') : undefined}
                            duration={exec.duration}
                        />
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
