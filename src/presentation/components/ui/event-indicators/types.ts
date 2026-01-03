/**
 * @fileoverview Event Indicator Types
 * @module presentation/components/ui/event-indicators/types
 * @governance Ralph Loop Cycle 17, Phase 4
 *
 * Shared types for event indicator components.
 * Extracted to break circular dependencies.
 */

/**
 * Event status types
 */
export type EventStatus = 'idle' | 'loading' | 'success' | 'error' | 'warning'

/**
 * Activity types
 */
export type ActivityType = 'general' | 'indexing' | 'streaming' | 'sync' | 'quiz-generation' | 'workspace-transition'

/**
 * Event indicator props
 */
export interface EventIndicatorProps {
    /** Current status */
    status: EventStatus
    /** Type of activity */
    activity?: ActivityType
    /** Status message (e.g., "Indexing documents...") */
    message: string
    /** Optional progress percentage (0-100) */
    progress?: number
    /** Optional error/warning message */
    errorDetail?: string
    /** Optional CSS class name */
    className?: string
    /** Show compact version (for inline display) */
    compact?: boolean
}

// ============================================================================
// Indexing Progress Types
// ============================================================================

/**
 * Indexing operation phase
 */
export type IndexingPhase = 'pending' | 'chunking' | 'embedding' | 'storing' | 'complete' | 'error'

/**
 * Indexing step
 */
export interface IndexingStep {
    phase: IndexingPhase
    label: string
    status: 'pending' | 'in-progress' | 'complete' | 'error'
    error?: string
}

/**
 * Indexing state
 */
export interface IndexingState {
    isIndexing: boolean
    currentPhase: IndexingPhase
    steps: IndexingStep[]
    progress: number
    error?: string
}

/**
 * Indexing progress indicator props
 */
export interface IndexingProgressIndicatorProps {
    /** Current indexing state */
    indexing?: IndexingState
    /** Optional CSS class name */
    className?: string
}

// ============================================================================
// Quiz Generation Types
// ============================================================================

/**
 * Quiz generation phase
 */
export type QuizGenerationPhase = 'pending' | 'analyzing' | 'generating' | 'validating' | 'storing' | 'complete' | 'error'

/**
 * Quiz generation step
 */
export interface QuizGenerationStep {
    phase: QuizGenerationPhase
    label: string
    status: 'pending' | 'in-progress' | 'complete' | 'error'
    error?: string
}

/**
 * Quiz generation state
 */
export interface QuizGenerationState {
    isGenerating: boolean
    currentPhase: QuizGenerationPhase
    steps: QuizGenerationStep[]
    progress: number
    error?: string
}

/**
 * Quiz generation indicator props
 */
export interface QuizGenerationIndicatorProps {
    /** Current quiz generation state */
    generation?: QuizGenerationState
    /** Optional CSS class name */
    className?: string
}

// ============================================================================
// Workspace Transition Types
// ============================================================================

/**
 * Workspace transition phase
 */
export type WorkspaceTransitionPhase = 'pending' | 'persisting' | 'cleanup' | 'loading' | 'restoring' | 'complete' | 'error'

/**
 * Workspace transition step
 */
export interface WorkspaceTransitionStep {
    phase: WorkspaceTransitionPhase
    message: string
    timestamp: number
}

/**
 * Workspace transition state
 */
export interface WorkspaceTransitionState {
    isTransitioning: boolean
    currentPhase: WorkspaceTransitionPhase
    fromWorkspace: string
    toWorkspace: string
    steps: WorkspaceTransitionStep[]
    startTime: number | null
    error?: string
}

/**
 * Workspace transition indicator props
 */
export interface WorkspaceTransitionIndicatorProps {
    /** Workspace transition state from workspace store */
    transition?: WorkspaceTransitionState
    /** Optional CSS class name */
    className?: string
    /** Show compact version */
    compact?: boolean
}

// ============================================================================
// Note Indexing Types
// ============================================================================

/**
 * Note indexing phase
 */
export type NoteIndexingPhase = 'pending' | 'parsing' | 'embedding' | 'storing' | 'complete' | 'error'

/**
 * Note indexing state
 */
export interface NoteIndexingState {
    isIndexing: boolean
    currentPhase: NoteIndexingPhase
    progress: number
    error?: string
}

/**
 * Note indexing indicator props
 */
export interface NoteIndexingIndicatorProps {
    /** Current note indexing state */
    indexing?: NoteIndexingState
    /** Optional CSS class name */
    className?: string
}

