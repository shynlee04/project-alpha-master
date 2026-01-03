/**
 * Quiz Generation Indicator - Study Session Quiz Generation Status
 *
 * Displays real-time progress of quiz generation operations.
 * Shows question generation, validation, and storage progress.
 *
 * @module presentation/components/ui/event-indicators
 * @governance Ralph Loop Cycle 17, Phase 4
 * @gap G-006 - StudySession quiz generation progress
 */

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react'
import { EventIndicator, type EventStatus } from './EventIndicator'
import { QuizGenerationStepItem } from './QuizGenerationStepItem'
import { getQuizGenerationStatus, getQuizGenerationMessage, getQuizGenerationProgress } from './quiz-generation-utils'

/**
 * Quiz generation phase
 */
export type QuizGenerationPhase = 'pending' | 'analyzing' | 'generating' | 'validating' | 'storing' | 'complete' | 'error'

/**
 * Quiz generation step
 */
export interface QuizGenerationStep {
    phase: QuizGenerationPhase
    message: string
    timestamp: number
}

/**
 * Quiz generation state
 */
export interface QuizGenerationState {
    isGenerating: boolean
    currentPhase: QuizGenerationPhase
    sourceId: string
    sourceTitle: string
    totalQuestions: number
    generatedQuestions: number
    steps: QuizGenerationStep[]
    startTime: number | null
    error?: string
}

/**
 * Quiz generation indicator props
 */
export interface QuizGenerationIndicatorProps {
    /** Quiz generation state from study store */
    generation?: QuizGenerationState
    /** Optional CSS class name */
    className?: string
    /** Show compact version */
    compact?: boolean
}

/**
 * Quiz Generation Indicator Component
 *
 * Displays multi-phase quiz generation progress with current step highlight.
 */
export function QuizGenerationIndicator({
    generation,
    className,
    compact = false,
}: QuizGenerationIndicatorProps) {
    const [status, setStatus] = useState<EventStatus>('idle')
    const [message, setMessage] = useState('')
    const [progress, setProgress] = useState(0)

    // Update status when generation state changes
    useEffect(() => {
        setStatus(getQuizGenerationStatus(generation))
        setMessage(getQuizGenerationMessage(generation))
        setProgress(getQuizGenerationProgress(generation))
    }, [generation])

    if (!generation || compact) {
        return (
            <EventIndicator
                status={status}
                activity="general"
                message={message}
                progress={progress > 0 ? progress : undefined}
                errorDetail={generation?.error}
                className={className}
                compact={compact}
            />
        )
    }

    // Full version with step breakdown
    return (
        <div className={cn('space-y-2', className)}>
            {/* Overall Progress */}
            <EventIndicator
                status={status}
                activity="general"
                message={message}
                progress={progress > 0 ? progress : undefined}
                errorDetail={generation.error}
            />

            {/* Step Breakdown */}
            <div className="space-y-1 text-sm">
                {generation.steps.slice(-4).map((step, index) => (
                    <QuizGenerationStepItem
                        key={index}
                        step={step}
                        isCurrent={step.phase === generation.currentPhase}
                    />
                ))}
            </div>
        </div>
    )
}
