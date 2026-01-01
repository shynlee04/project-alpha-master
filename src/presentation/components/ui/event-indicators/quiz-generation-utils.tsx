/**
 * Quiz Generation Indicator Utilities
 *
 * Helper functions for QuizGenerationIndicator component.
 * Extracted to maintain <120 line component limit.
 *
 * @module presentation/components/ui/event-indicators
 */

import type { EventStatus } from './EventIndicator'
import type { QuizGenerationState } from './QuizGenerationIndicator'

/**
 * Get status from quiz generation state
 */
export function getQuizGenerationStatus(generation?: QuizGenerationState): EventStatus {
    if (!generation || !generation.isGenerating) return 'idle'
    if (generation.error) return 'error'
    if (generation.currentPhase === 'complete') return 'success'
    return 'loading'
}

/**
 * Get quiz generation message
 */
export function getQuizGenerationMessage(generation?: QuizGenerationState): string {
    if (!generation || !generation.isGenerating) return ''

    const phase = generation.currentPhase
    const progress = generation.totalQuestions > 0
        ? Math.round((generation.generatedQuestions / generation.totalQuestions) * 100)
        : 0

    switch (phase) {
        case 'analyzing':
            return `Analyzing "${generation.sourceTitle}" for quiz topics...`
        case 'generating':
            return `Generating quiz questions... ${generation.generatedQuestions}/${generation.totalQuestions} (${progress}%)`
        case 'validating':
            return `Validating quiz questions...`
        case 'storing':
            return `Saving quiz to study set...`
        case 'complete':
            return `Quiz complete! ${generation.totalQuestions} questions generated from "${generation.sourceTitle}"`
        case 'error':
            return `Failed to generate quiz from "${generation.sourceTitle}"`
        default:
            return 'Preparing to generate quiz...'
    }
}

/**
 * Get overall progress percentage
 */
export function getQuizGenerationProgress(generation?: QuizGenerationState): number {
    if (!generation || !generation.isGenerating) return 0

    const phaseWeights = {
        analyzing: 0.2,
        generating: 0.6,
        validating: 0.15,
        storing: 0.05,
    }

    const questionProgress = generation.totalQuestions > 0
        ? generation.generatedQuestions / generation.totalQuestions
        : 0

    switch (generation.currentPhase) {
        case 'analyzing':
            return 50 // Analyzing doesn't have granular progress
        case 'generating':
            return phaseWeights.analyzing * 100 + (questionProgress * phaseWeights.generating * 100)
        case 'validating':
            return (phaseWeights.analyzing + phaseWeights.generating) * 100 + 50
        case 'storing':
            return (phaseWeights.analyzing + phaseWeights.generating + phaseWeights.validating) * 100 + 50
        case 'complete':
            return 100
        default:
            return 0
    }
}
