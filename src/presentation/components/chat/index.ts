/**
 * Chat Components Export
 *
 * @epic Epic-28 Story 28-19, 28-20, 28-21, 28-22
 * @description
 * Barrel export for chat-related components.
 * These components are used in the agent chat interface.
 */

export { ToolCallBadge, ToolCallBadgeGroup } from './ToolCallBadge';
export type { ToolCallBadgeGroupProps } from './ToolCallBadge';

export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps } from './CodeBlock';

export { DiffPreview } from './DiffPreview';
export type { DiffPreviewProps } from './DiffPreview';

export { ApprovalOverlay } from './ApprovalOverlay';
export type { ApprovalOverlayProps } from './ApprovalOverlay';

export { BatchApprovalBar } from './BatchApprovalBar';
export type { BatchApprovalBarProps } from './BatchApprovalBar';

// AC-02: Agent Selector Unification - Now exported for cross-workspace use
// Unified Agent Selector is now used instead of legacy component

// CW-03: Unified Chat Panel - Single entry point for all chat interfaces
export { UnifiedChatPanel } from './UnifiedChatPanel';
export type {
  ChatMode,
  UnifiedChatPanelProps,
} from './UnifiedChatPanel';
export type {
  isThreadedModeProps as ThreadedModeProps,
  isSimpleModeProps as SimpleModeProps,
  isAgentModeProps as AgentModeProps
} from './UnifiedChatPanel';

// E1-3: Perplexity-style Expandable Panel
export { ExpandableChatPanel } from './ExpandableChatPanel';
export type { ExpandableChatPanelProps } from './ExpandableChatPanel';

// E1-4: Notion-style Chat Bubble (mobile)
export { ChatBubble } from './ChatBubble';
export type { ChatBubbleProps } from './ChatBubble';

export { ChatBubbleOverlay } from './ChatBubbleOverlay';
export type { ChatBubbleOverlayProps } from './ChatBubbleOverlay';

// Ralph Loop Cycle 5: Cascade Flow Components
export { ThreadFolderTree } from './ThreadFolderTree';
export type { ThreadFolderTreeProps } from './ThreadFolderTree';

// Ralph Loop Cycle 5: Real-Time Tool Streaming
export { ToolProgressIndicator, useToolProgress } from './ToolProgressIndicator';
export type { ToolProgressIndicatorProps } from './ToolProgressIndicator';

// ARCH-01.4: Tool Execution Indicator - Inline status in chat stream
export { ToolExecutionIndicator, CompactToolExecutionIndicator, ToolExecutionIndicatorGroup } from './ToolExecutionIndicator';
export type { ToolExecutionIndicatorProps, ToolExecutionIndicatorGroupProps } from './ToolExecutionIndicator';

// E2-4: File Attachment Input for chat messages
export { FileAttachmentInput } from './FileAttachmentInput';
export type { FileAttachment, FileAttachmentInputProps, Attachment } from './FileAttachmentInput';

// E2-6: URL Fetching and Preview
export { URLInputDialog } from './URLInputDialog';
export type { URLAttachment } from './URLInputDialog';

// MVP-2: Chat Platform Components (not wired yet - keep for future use)
// export { ChatPanel } from './ChatPanel';
// export { ChatConversation } from './ChatConversation';
// export { ThreadsList } from './ThreadsList';
// export { ThreadCard } from './ThreadCard';
// export { StreamdownRenderer } from './StreamdownRenderer';

