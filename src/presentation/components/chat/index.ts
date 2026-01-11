/**
 * @fileoverview Chat Components Barrel Export
 * @module presentation/components/chat
 * 
 * ARCHITECTURE CHANGE 2026-01-11:
 * - ThreadManager now integrated with UnifiedChatStore (Dexie)
 * - Legacy ThreadCard/ThreadsList archived to _bmad-output/.archive/legacy-thread-components-2026-01-11/
 * - All thread management now uses UnifiedChatStore for RAG, indexing, cross-workspace
 */

// Main chat interface
export { EnhancedChatInterface } from '../ide/EnhancedChatInterface';
export type { ChatMessage, ToolExecution, EnhancedChatProps } from '../ide/EnhancedChatInterface';

// Note reference components (E3-5)
export { NoteReferencePicker, useNoteReferencePicker } from './NoteReferencePicker';
export { NoteReference, parseNoteReferences, renderTextWithNoteReferences } from './NoteReference';
export type { NoteReferenceProps } from './NoteReference';

// Thread Management (CHAT-006) - INTEGRATED with UnifiedChatStore (Dexie)
// ✅ CORRECT ARCHITECTURE for RAG, vector indexing, cross-workspace
export { ThreadManager } from './ThreadManager';
export type { ThreadManagerProps } from './ThreadManager';

// Tool execution display
export { ToolCallBadge } from './ToolCallBadge';

// Stream rendering
export { StreamdownRenderer } from './StreamdownRenderer';

// File attachments
export { FileAttachmentInput } from './FileAttachmentInput';
export type { Attachment, FileAttachment } from './FileAttachmentInput';

// Input controls (CHAT-004: Grouped by use case)
export { ChatInputControls } from './ChatInputControls';

// Collapsible Sections (CHAT-007)
export {
  CollapsibleSection,
  MessageCollapseControls,
} from './CollapsibleSection';
export type {
  CollapsibleSectionProps,
  MessageCollapseControlsProps,
} from './CollapsibleSection';

// Artifact Preview (CHAT-009)
export { ArtifactPreviewModal } from './ArtifactPreviewModal';
export type { ArtifactPreviewModalProps } from './ArtifactPreviewModal';

// Agent Approvals
export { ApprovalOverlay } from './ApprovalOverlay';
export { BatchApprovalBar } from './BatchApprovalBar';
export { AutoApproveSettings } from './AutoApproveSettings';
export { UnifiedChatPanel } from './UnifiedChatPanel';

// Sequential Expansion (E4-2)
export {
    SequentialExpansionOptions,
    SequentialExpansionLoading,
} from './SequentialExpansionOptions';
export type {
    SequentialExpansionOptionsProps,
    SequentialExpansionLoadingProps,
} from './SequentialExpansionOptions';

// Content-Based Routing (E4-3)
export {
    RoutingDecisionDisplay,
    RoutingLoading,
} from './RoutingDecision';
export type {
    RoutingDecisionProps,
    RoutingLoadingProps,
} from './RoutingDecision';

// Multi-Agent Debating (E4-4)
export {
    DebateTimeline,
    DebateLoading,
} from './DebateTimeline';
export type {
    DebateTimelineProps,
    DebateTimelineLoadingProps,
} from './DebateTimeline';

// Workflow Builder (E4-5)
export {
    WorkflowBuilder,
    WorkflowBuilderModal,
} from './WorkflowBuilder';
export type {
    WorkflowBuilderProps,
    WorkflowBuilderModalProps,
} from './WorkflowBuilder';

// Workflow Visualization (E4-6)
export {
    WorkflowVisualizer,
    WorkflowViewer,
} from './WorkflowVisualizer';
export type {
    WorkflowVisualizerProps,
    WorkflowViewerProps,
} from './WorkflowVisualizer';
