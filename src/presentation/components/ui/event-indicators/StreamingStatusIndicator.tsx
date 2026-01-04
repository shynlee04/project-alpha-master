/**
 * Streaming Status Indicator - Real-time LLM Response Status
 *
 * Displays streaming status for AI chat responses with token count and speed.
 * Shows "streaming" state with pulsing animation and character/token progress.
 *
 * @module presentation/components/ui/event-indicators
 * @governance Ralph Loop Cycle 17, Phase 4
 * @gap G-002 - ChatConversation streaming status
 *
 * December 2025 Patterns:
 * - Custom hook for event subscription
 * - Shallow comparison for performance
 * - ARIA live region for accessibility
 */

import { useEffect, useState } from 'react'
import { EventIndicator } from './EventIndicator'
import { type EventStatus } from './types'

/**
 * Streaming state
 */
export interface StreamingState {
    isStreaming: boolean
    tokensReceived: number
    charsReceived: number
    startTime: number | null
}

/**
 * Streaming status indicator props
 */
export interface StreamingStatusIndicatorProps {
    /** Streaming state from chat store */
    streaming?: StreamingState
    /** Optional CSS class name */
    className?: string
    /** Show compact version */
    compact?: boolean
}

/**
 * Get status from streaming state
 */
function getStreamingStatus(streaming?: StreamingState): EventStatus {
    if (!streaming || !streaming.isStreaming) return 'idle'
    if (streaming.tokensReceived > 0) return 'loading'
    return 'loading'
}

/**
 * Get streaming message
 */
function getStreamingMessage(streaming?: StreamingState): string {
    if (!streaming || !streaming.isStreaming) return ''

    const tokensPerSec = streaming.startTime
        ? Math.round(streaming.tokensReceived / ((Date.now() - streaming.startTime) / 1000))
        : 0

    if (tokensPerSec > 0) {
        return `Receiving response... ${streaming.tokensReceived} tokens (${tokensPerSec} tok/s)`
    }

    return 'Receiving response...'
}

/**
 * Streaming Status Indicator Component
 *
 * Displays real-time streaming status for LLM responses.
 * Shows pulse animation when streaming is active.
 */
export function StreamingStatusIndicator({
    streaming,
    className,
    compact = false,
}: StreamingStatusIndicatorProps) {
    const [status, setStatus] = useState<EventStatus>('idle')
    const [message, setMessage] = useState('')

    // Update status when streaming state changes
    useEffect(() => {
        setStatus(getStreamingStatus(streaming))
        setMessage(getStreamingMessage(streaming))
    }, [streaming])

    return (
        <EventIndicator
            status={status}
            activity="streaming"
            message={message}
            className={className}
            compact={compact}
        />
    )
}
