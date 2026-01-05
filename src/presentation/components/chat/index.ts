/**
 * @fileoverview Chat Components Barrel Export
 * @module presentation/components/chat
 */

// Main chat interface
// Main chat interface
export { EnhancedChatInterface } from '../ide/EnhancedChatInterface';
export type { ChatMessage, ToolExecution, EnhancedChatProps } from '../ide/EnhancedChatInterface';

// Note reference components (E3-5)
export { NoteReferencePicker, useNoteReferencePicker } from './NoteReferencePicker';
export { NoteReference, parseNoteReferences, renderTextWithNoteReferences } from './NoteReference';
export type { NoteReferenceProps } from './NoteReference';

// Chat message components
export { ChatPanel } from './ChatPanel';
export { ThreadManager } from './ThreadManager';

// Tool execution display
export { ToolCallBadge } from './ToolCallBadge';

// Stream rendering
export { StreamdownRenderer } from './StreamdownRenderer';

// File attachments
export { FileAttachmentInput } from './FileAttachmentInput';
export type { Attachment, FileAttachment } from './FileAttachmentInput';

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
