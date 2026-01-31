/**
 * Event Status Store - Centralized Event Activity Tracking
 *
 * Tracks real-time status of all event activity indicators across workspaces.
 * Connects to cross-workspace event bus for status propagation.
 *
 * @module infrastructure/persistence/stores/events
 * @governance Ralph Loop Cycle 17, Phase 4B
 * @pattern December 2025 Zustand (slice pattern, persist middleware)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus'

/**
 * Streaming status state
 */
export interface StreamingStatus {
    isStreaming: boolean
    tokensReceived: number
    charsReceived: number
    startTime: number | null
}

/**
 * Tool execution state
 */
export interface ToolExecutionState {
    toolName: string
    isExecuting: boolean
    currentStep: number
    totalSteps: number
    steps: Array<{
        step: string
        status: 'pending' | 'running' | 'success' | 'error'
        message: string
        duration?: number
    }>
    startTime: number | null
    result?: 'success' | 'error'
}

/**
 * Indexing state
 */
export interface IndexingState {
    isIndexing: boolean
    currentPhase: 'pending' | 'chunking' | 'embedding' | 'storing' | 'complete' | 'error'
    totalDocuments: number
    processedDocuments: number
    totalChunks: number
    processedChunks: number
    steps: Array<{
        phase: string
        message: string
        progress: number
        timestamp: number
    }>
    startTime: number | null
    error?: string
}

/**
 * Note indexing state
 */
export interface NoteIndexingState {
    isIndexing: boolean
    currentPhase: 'pending' | 'parsing' | 'embedding' | 'storing' | 'complete' | 'error'
    noteId: string
    noteTitle: string
    totalBlocks: number
    processedBlocks: number
    startTime: number | null
    error?: string
}

/**
 * Quiz generation state
 */
export interface QuizGenerationState {
    isGenerating: boolean
    currentPhase: 'pending' | 'analyzing' | 'generating' | 'validating' | 'storing' | 'complete' | 'error'
    sourceId: string
    sourceTitle: string
    totalQuestions: number
    generatedQuestions: number
    steps: Array<{
        phase: string
        message: string
        timestamp: number
    }>
    startTime: number | null
    error?: string
}

/**
 * Workspace transition state
 */
export interface WorkspaceTransitionState {
    isTransitioning: boolean
    currentPhase: 'pending' | 'persisting' | 'cleanup' | 'loading' | 'restoring' | 'complete' | 'error'
    fromWorkspace: string
    toWorkspace: string
    steps: Array<{
        phase: string
        message: string
        timestamp: number
    }>
    startTime: number | null
    error?: string
}

/**
 * Event status store state
 */
export interface EventStatusState {
    // Event states
    streaming: StreamingStatus | null
    toolExecution: ToolExecutionState | null
    indexing: IndexingState | null
    noteIndexing: NoteIndexingState | null
    quizGeneration: QuizGenerationState | null
    workspaceTransition: WorkspaceTransitionState | null

    // Actions
    updateStreaming: (status: Partial<StreamingStatus>) => void
    updateToolExecution: (status: Partial<ToolExecutionState>) => void
    updateIndexing: (status: Partial<IndexingState>) => void
    updateNoteIndexing: (status: Partial<NoteIndexingState>) => void
    updateQuizGeneration: (status: Partial<QuizGenerationState>) => void
    updateWorkspaceTransition: (status: Partial<WorkspaceTransitionState>) => void

    // Clear actions
    clearStreaming: () => void
    clearToolExecution: () => void
    clearIndexing: () => void
    clearNoteIndexing: () => void
    clearQuizGeneration: () => void
    clearWorkspaceTransition: () => void
}

/**
 * Create event status store
 */
export const useEventStatusStore = create<EventStatusState>()(
    persist(
        (set, _get) => ({
            // Initial states
            streaming: null,
            toolExecution: null,
            indexing: null,
            noteIndexing: null,
            quizGeneration: null,
            workspaceTransition: null,

            // Streaming actions
            updateStreaming: (status) =>
                set((state) => ({
                    streaming: { ...state.streaming, ...status } as StreamingStatus,
                })),

            // Tool execution actions
            updateToolExecution: (status) =>
                set((state) => ({
                    toolExecution: { ...state.toolExecution, ...status } as ToolExecutionState,
                })),

            // Indexing actions
            updateIndexing: (status) =>
                set((state) => ({
                    indexing: { ...state.indexing, ...status } as IndexingState,
                })),

            // Note indexing actions
            updateNoteIndexing: (status) =>
                set((state) => ({
                    noteIndexing: { ...state.noteIndexing, ...status } as NoteIndexingState,
                })),

            // Quiz generation actions
            updateQuizGeneration: (status) =>
                set((state) => ({
                    quizGeneration: { ...state.quizGeneration, ...status } as QuizGenerationState,
                })),

            // Workspace transition actions
            updateWorkspaceTransition: (status) =>
                set((state) => ({
                    workspaceTransition: { ...state.workspaceTransition, ...status } as WorkspaceTransitionState,
                })),

            // Clear actions
            clearStreaming: () => set({ streaming: null }),
            clearToolExecution: () => set({ toolExecution: null }),
            clearIndexing: () => set({ indexing: null }),
            clearNoteIndexing: () => set({ noteIndexing: null }),
            clearQuizGeneration: () => set({ quizGeneration: null }),
            clearWorkspaceTransition: () => set({ workspaceTransition: null }),
        }),
        {
            name: 'event-status-store',
            partialize: (state) => ({
                // Only persist active states, clear completed ones on reload
                streaming: state.streaming?.isStreaming ? state.streaming : null,
                toolExecution: state.toolExecution?.isExecuting ? state.toolExecution : null,
                indexing: state.indexing?.isIndexing ? state.indexing : null,
                noteIndexing: state.noteIndexing?.isIndexing ? state.noteIndexing : null,
                quizGeneration: state.quizGeneration?.isGenerating ? state.quizGeneration : null,
                workspaceTransition: state.workspaceTransition?.isTransitioning ? state.workspaceTransition : null,
            }),
        }
    )
)

/**
 * Initialize event bus listeners for cross-workspace event propagation
 */
export function initializeEventStatusListeners() {
    const store = useEventStatusStore.getState()

    // Subscribe to workspace transition events
    eventBus.on<{ fromWorkspace: string; toWorkspace: string }>(
        DomainEventType.WORKSPACE_TRANSITION_STARTED,
        (event) => {
            store.updateWorkspaceTransition({
                isTransitioning: true,
                currentPhase: 'pending',
                fromWorkspace: event.payload.fromWorkspace,
                toWorkspace: event.payload.toWorkspace,
                steps: [],
                startTime: Date.now(),
            })
        }
    )

    eventBus.on(DomainEventType.WORKSPACE_TRANSITION_COMPLETED, (_event) => {
        store.updateWorkspaceTransition({
            isTransitioning: false,
            currentPhase: 'complete',
        })
        // Clear after 2 seconds
        setTimeout(() => store.clearWorkspaceTransition(), 2000)
    })

    eventBus.on<{ error?: string }>(
        DomainEventType.WORKSPACE_TRANSITION_FAILED,
        (event) => {
            store.updateWorkspaceTransition({
                isTransitioning: false,
                currentPhase: 'error',
                error: event.payload.error || 'Transition failed',
            })
        }
    )
}
