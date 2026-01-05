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
export type { Attachment, FileAttachment, URLAttachment } from './FileAttachmentInput';

// Agent Approvals
export { ApprovalOverlay } from './ApprovalOverlay';
export { BatchApprovalBar } from './BatchApprovalBar';
export { AutoApproveSettings } from './AutoApproveSettings';
export { UnifiedChatPanel } from './UnifiedChatPanel';
