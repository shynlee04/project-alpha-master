/**
 * Chat Components Export
 *
 * @epic Epic-28 Story 28-19, 28-20, 28-21, 28-22
 * @description
 * Barrel export for chat-related components.
 * These components are used in the agent chat interface.
 */

export { ToolCallBadge, ToolCallBadgeGroup } from './ToolCallBadge';
export type { ToolCallBadgeProps, ToolCallBadgeGroupProps } from './ToolCallBadge';

export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps } from './CodeBlock';

export { DiffPreview } from './DiffPreview';
export type { DiffPreviewProps } from './DiffPreview';

export { ApprovalOverlay } from './ApprovalOverlay';
export type { ApprovalOverlayProps } from './ApprovalOverlay';

// MVP-2: Chat Platform Components (not wired yet - keep for future use)
// export { ChatPanel } from './ChatPanel';
// export { ChatConversation } from './ChatConversation';
// export { ThreadsList } from './ThreadsList';
// export { ThreadCard } from './ThreadCard';
// export { AgentSelector } from './AgentSelector';
// export { StreamdownRenderer } from './StreamdownRenderer';
