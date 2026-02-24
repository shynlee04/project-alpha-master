/**
 * @fileoverview Chat Input Controls with Use-Case Grouping
 * @module presentation/components/chat/ChatInputControls
 *
 * CHAT-004: Group Chat Controls by Use Case
 *
 * Controls are organized into three semantic groups:
 * 1. INPUT ENHANCEMENTS: File attachment, voice input (left)
 * 2. PRIMARY INPUT: Message textarea (center, flex-1)
 * 3. SEND ACTION: Send button (right, clear CTA)
 *
 * This grouping follows UX best practices:
 * - Related actions are visually grouped
 * - Primary action (Send) is clearly separated
 * - Input enhancements are secondary, less prominent
 *
 * @example
 * ```tsx
 * <ChatInputControls
 *   input={input}
 *   setInput={setInput}
 *   attachments={attachments}
 *   onAddAttachment={handleAdd}
 *   onRemoveAttachment={handleRemove}
 *   voiceRecording={voiceRecording}
 *   onVoiceClick={handleVoice}
 *   isTyping={isTyping}
 *   onSubmit={handleSubmit}
 *   isMobile={isMobile}
 * />
 * ```
 */

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Send } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { FileAttachmentInput, type Attachment } from '@/presentation/components/chat/FileAttachmentInput'
import { useTranslation } from 'react-i18next'
import { useDeviceType } from '@/hooks/useMediaQuery'
import type { UseVoiceRecordingState } from '@/lib/voice/use-voice-recording'

interface ChatInputControlsProps {
    /** Current input text */
    input: string
    /** Set input text */
    setInput: (value: string) => void
    /** File attachments */
    attachments: Attachment[]
    /** Add attachment callback */
    onAddAttachment: (attachment: Attachment) => void
    /** Remove attachment callback */
    onRemoveAttachment: (id: string) => void
    /** Voice recording state */
    voiceRecording: UseVoiceRecordingState
    /** Voice button click handler */
    onVoiceClick: () => void
    /** Whether assistant is typing */
    isTyping: boolean
    /** Form submit handler */
    onSubmit: (e: React.FormEvent) => void
    /** Mobile optimization */
    isMobile?: boolean
    /** CHAT-004: Show file attachment input (default: true) */
    showAttachments?: boolean
    /** CHAT-004: Show voice input button (default: true) */
    showVoice?: boolean
}

/**
 * Voice input button with recording state indicator
 */
interface VoiceButtonProps {
    isRecording: boolean
    isSupported: boolean
    volumeLevel: number
    isMobile: boolean
    onClick: () => void
    disabled: boolean
    ariaLabel: string
    title: string
}

const VoiceButton = memo(function VoiceButton({
    isRecording,
    isSupported,
    volumeLevel,
    isMobile,
    onClick,
    disabled,
    ariaLabel,
    title,
}: VoiceButtonProps) {
    if (!isSupported) return null

    return (
        <Button
            type="button"
            variant={isRecording ? "destructive" : "ghost"}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "shrink-0 relative transition-colors",
                // Pulsing animation when recording
                isRecording && "animate-pulse",
                // Touch target sizing
                isMobile ? "h-11 w-11 min-w-[44px] min-h-[44px]" : "h-9 w-9"
            )}
            aria-label={ariaLabel}
            title={title}
        >
            {/* Recording indicator with volume visualization */}
            {isRecording && volumeLevel > 0.01 && (
                <span
                    className="absolute inset-0 rounded-sm bg-primary/20"
                    style={{
                        transform: `scale(${0.8 + volumeLevel * 0.4})`,
                        transition: 'transform 100ms ease-out',
                    }}
                />
            )}
            <span className="relative z-10">
                {isRecording ? (
                    <MicIcon isMobile={isMobile} />
                ) : (
                    <MicOffIcon isMobile={isMobile} />
                )}
            </span>
        </Button>
    )
})

// Voice icons (inline for performance)
function MicIcon({ isMobile }: { isMobile: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isMobile ? 20 : 16}
            height={isMobile ? 20 : 16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    )
}

function MicOffIcon({ isMobile }: { isMobile: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isMobile ? 20 : 16}
            height={isMobile ? 20 : 16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    )
}

/**
 * ChatInputControls - Organized input controls with use-case grouping
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────┐
 * │ [Input Enhancements] [──── Textarea ────] [Send Action]     │
 * │  📎 🎤               (flex-1, expands)           ➜          │
 * └──────────────────────────────────────────────────────────────┘
 *
 * On mobile, the layout adapts:
 * ┌────────────────────────────────┐
 * │ [📎🎤] [Textarea] [➜]         │
 * └────────────────────────────────┘
 */
export const ChatInputControls = memo(function ChatInputControls({
    input,
    setInput,
    attachments,
    onAddAttachment,
    onRemoveAttachment,
    voiceRecording,
    onVoiceClick,
    isTyping,
    onSubmit,
    isMobile: isMobileProp,
    showAttachments = true,
    showVoice = true,
}: ChatInputControlsProps) {
    const { t } = useTranslation()
    const { isMobile: detectedMobile } = useDeviceType()
    const isMobile = isMobileProp ?? detectedMobile

    const hasContent = input.trim() || attachments.length > 0

    // CHAT-004: Determine if any enhancement controls are visible
    const showEnhancements = showAttachments || showVoice

    return (
        <form
            onSubmit={onSubmit}
            className={cn(
                "shrink-0 border-t border-border bg-secondary/30",
                // Mobile keyboard padding
                isMobile && "pb-safe"
            )}
        >
            <div className={cn(
                // Flex container with grouped sections
                "flex items-end gap-0 p-3",
                // Mobile: wrap if needed
                isMobile && "flex-wrap"
            )}>
                {/* ═══════════════════════════════════════════════════════════
                    GROUP 1: INPUT ENHANCEMENTS (left, secondary)
                    ═══════════════════════════════════════════════════════════ */}
                {showEnhancements && (
                <div className={cn(
                    "flex items-center gap-2",
                    // Visual separator from main input (only when visible)
                    showEnhancements && "pr-2 border-r border-border/50"
                )}>
                    {/* File attachment input */}
                    {showAttachments && (
                    <FileAttachmentInput
                        attachments={attachments}
                        onAdd={onAddAttachment}
                        onRemove={onRemoveAttachment}
                        disabled={isTyping}
                    />
                    )}

                    {/* Voice input button */}
                    {showVoice && (
                    <VoiceButton
                        isRecording={voiceRecording.isRecording}
                        isSupported={voiceRecording.isSupported}
                        volumeLevel={voiceRecording.volumeLevel}
                        isMobile={isMobile}
                        onClick={onVoiceClick}
                        disabled={isTyping}
                        ariaLabel={
                            voiceRecording.isRecording
                                ? t('voice.tapToStop', 'Tap to stop')
                                : t('voice.tapToRecord', 'Tap to record')
                        }
                        title={
                            voiceRecording.isRecording
                                ? t('voice.recording', 'Listening...')
                                : t('voice.record', 'Tap to speak')
                        }
                    />
                    )}
                </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    GROUP 2: PRIMARY INPUT (center, flex-1, prominent)
                    ═══════════════════════════════════════════════════════════ */}
                <div className={cn(
                    "flex-1 min-w-0",
                    // Add padding when adjacent groups are hidden for visual balance
                    !showEnhancements && "px-3"
                )}>
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                            // Auto-resize handled by CSS fieldSizing (see style prop below)
                        }}
                        onKeyDown={(e) => {
                            // Submit on Enter (without Shift)
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                if (hasContent && !isTyping) {
                                    onSubmit(e)
                                }
                            }
                        }}
                        placeholder={t('chat.placeholder', 'Type a message...')}
                        className={cn(
                            "w-full min-h-0 min-h-[40px] max-h-[150px]",
                            "px-3 py-2",
                            "bg-background border border-border rounded-none",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none focus:border-primary",
                            "resize-none overflow-y-auto",
                            "field-sizing-content",
                            // Larger text on mobile for readability
                            isMobile ? "text-base" : "text-base md:text-sm"
                        )}
                        style={{ fieldSizing: 'content' }}
                        disabled={isTyping}
                        rows={1}
                        aria-label={t('chat.messageInput', 'Message input')}
                    />
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    GROUP 3: SEND ACTION (right, primary CTA)
                    ═══════════════════════════════════════════════════════════ */}
                <div className={cn(
                    // Add padding when enhancements are hidden
                    !showEnhancements && "px-3",
                    // Visual separator from main input (only when enhancements visible)
                    showEnhancements && "pl-2 border-l border-border/50"
                )}>
                    <Button
                        type="submit"
                        variant="primary"
                        iconOnly={true}
                        className={cn(
                            "shrink-0",
                            // Touch target sizing
                            isMobile ? "h-11 w-11 min-w-[44px] min-h-[44px]" : "h-10 w-10"
                        )}
                        disabled={!hasContent || isTyping}
                        aria-label={t('chat.send', 'Send message')}
                        title={t('chat.send', 'Send message')}
                    >
                        <Send className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
                    </Button>
                </div>
            </div>
        </form>
    )
})

export default ChatInputControls
