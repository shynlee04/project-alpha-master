/**
 * Event Indicators Barrel Export
 *
 * Reusable event activity indicator components for real-time status display.
 *
 * @module presentation/components/ui/event-indicators
 * @governance Ralph Loop Cycle 17, Phase 4
 */

// Base Event Indicator
export { EventIndicator } from './EventIndicator'
export type { EventIndicatorProps, EventStatus, ActivityType } from './EventIndicator'
export { StatusIcon, getStatusStyles, getStatusIcon } from './event-indicator-utils'

// G-002: ChatConversation streaming status
export { StreamingStatusIndicator } from './StreamingStatusIndicator'
export type { StreamingStatusIndicatorProps, StreamingState } from './StreamingStatusIndicator'

// G-003: AgentChatPanel tool execution progress
export { ToolExecutionIndicator } from './ToolExecutionIndicator'
export type { ToolExecutionIndicatorProps, ToolExecutionState, ToolExecutionStep } from './ToolExecutionIndicator'
export { ToolExecutionStepItem } from './ToolExecutionStep'

// G-004: RAGSearchPanel vector search progress
export { IndexingProgressIndicator } from './IndexingProgressIndicator'
export type { IndexingProgressIndicatorProps, IndexingState, IndexingPhase, IndexingStep } from './IndexingProgressIndicator'
export { IndexingPhaseItem } from './IndexingPhaseItem'
export { getIndexingStatus, getIndexingMessage, getIndexingProgress } from './indexing-utils'

// G-005: NoteEditor note indexing status
export { NoteIndexingIndicator } from './NoteIndexingIndicator'
export type { NoteIndexingIndicatorProps, NoteIndexingState, NoteIndexingPhase } from './NoteIndexingIndicator'
export { getNoteIndexingStatus, getNoteIndexingMessage, getNoteIndexingProgress } from './note-indexing-utils'

// G-006: StudySession quiz generation progress
export { QuizGenerationIndicator } from './QuizGenerationIndicator'
export type { QuizGenerationIndicatorProps, QuizGenerationState, QuizGenerationPhase, QuizGenerationStep } from './QuizGenerationIndicator'
export { QuizGenerationStepItem } from './QuizGenerationStepItem'
export { getQuizGenerationStatus, getQuizGenerationMessage, getQuizGenerationProgress } from './quiz-generation-utils'

// G-007: WorkspaceSwitcher workspace transition loading
export { WorkspaceTransitionIndicator } from './WorkspaceTransitionIndicator'
export type { WorkspaceTransitionIndicatorProps, WorkspaceTransitionState, WorkspaceTransitionPhase, WorkspaceTransitionStep } from './WorkspaceTransitionIndicator'
export { WorkspaceTransitionStepItem } from './WorkspaceTransitionStepItem'
export { getWorkspaceTransitionStatus, getWorkspaceTransitionMessage } from './workspace-transition-utils'
