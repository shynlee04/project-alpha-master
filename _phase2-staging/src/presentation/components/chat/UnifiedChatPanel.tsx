/**
 * @fileoverview Unified Chat Panel Component
 * @module presentation/components/chat/UnifiedChatPanel
 *
 * Unified chat interface supporting multiple modes:
 * - 'threaded': Thread-based conversations (ChatPanel)
 * - 'simple': Simple message list with citations (RAGChatPanel)
 * - 'agent': Tool-enabled agent chat (AgentChatPanel)
 *
 * @epic CW-03 - Unified ChatPanel Implementation
 */

import { memo } from 'react';
import type { ChatMessage, Citation } from '@/lib/rag/types';
import { RAGChatPanel } from '@/presentation/components/rag/RAGChatPanel';
import { AgentChatPanel } from '@/presentation/components/ide/AgentChatPanel';

/**
 * Chat mode variants
 * Note: 'threaded' mode was removed in CHAT-020 (ChatConversation.tsx unused)
 */
export type ChatMode = 'simple' | 'agent';

/**
 * Base props for all modes
 */
interface BaseProps {
  /** Project ID for conversation storage */
  projectId: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for simple mode (RAGChatPanel)
 */
interface SimpleModeProps extends BaseProps {
  mode: 'simple';
  /** Chat messages */
  messages: ChatMessage[];
  /** Currently active citation */
  activeCitation: Citation | null;
  /** Send message handler */
  onSendMessage: (message: string) => void;
  /** Clear chat handler */
  onClearChat: () => void;
  /** Citation click handler */
  onCitationClick: (citation: Citation) => void;
  /** Close citation sidebar handler */
  onCloseCitation: () => void;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Props for agent mode (AgentChatPanel)
 */
interface AgentModeProps extends BaseProps {
  mode: 'agent';
  /** Project name for system prompt */
  projectName?: string;
  /** Workspace type for context-aware chat */
  workspaceType?: 'ide' | 'notes' | 'knowledge' | 'study';
}

/**
 * Union type for all mode props
 */
export type UnifiedChatPanelProps = SimpleModeProps | AgentModeProps;

/**
 * UnifiedChatPanel - Single entry point for all chat interfaces
 *
 * Routes to appropriate implementation based on mode prop:
 * - 'simple': Uses RAGChatPanel (citations, simple message list)
 * - 'agent': Uses AgentChatPanel (tool execution, approvals)
 *
 * CHAT-020: Removed 'threaded' mode (ChatConversation.tsx was unused)
 *
 * @example
 * ```tsx
 * // Simple mode (Knowledge workspace)
 * <UnifiedChatPanel
 *   mode="simple"
 *   projectId={projectId}
 *   messages={messages}
 *   onSendMessage={handleSend}
 *   onClearChat={handleClear}
 *   activeCitation={activeCitation}
 *   onCitationClick={handleCitationClick}
 *   onCloseCitation={handleCloseCitation}
 *   loading={loading}
 *   error={error}
 * />
 *
 * // Agent mode (IDE workspace with tools)
 * <UnifiedChatPanel
 *   mode="agent"
 *   projectId={projectId}
 *   projectName="MyProject"
 * />
 *
 * // Agent mode (Notes workspace - limited tools)
 * <UnifiedChatPanel
 *   mode="agent"
 *   projectId={projectId}
 *   projectName="MyNotes"
 *   workspaceType="notes"
 * />
 * ```
 */
export const UnifiedChatPanel = memo(function UnifiedChatPanel(
  props: UnifiedChatPanelProps
) {
  const { mode, projectId } = props;

  switch (mode) {
    case 'simple':
      // Simple chat with citations - uses RAGChatPanel
      return (
        <RAGChatPanel
          messages={props.messages}
          activeCitation={props.activeCitation}
          onSendMessage={props.onSendMessage}
          onClearChat={props.onClearChat}
          onCitationClick={props.onCitationClick}
          onCloseCitation={props.onCloseCitation}
          loading={props.loading}
          error={props.error}
        />
      );

    case 'agent':
      // Tool-enabled agent chat - uses AgentChatPanel
      return (
        <AgentChatPanel
          projectId={projectId}
          projectName={props.projectName}
          workspaceType={props.workspaceType}
        />
      );

    default:
      // Fallback to agent mode (safe default)
      const _exhaustive: never = mode;
      console.warn(`Unknown chat mode: ${String(_exhaustive)}, falling back to agent`);
      return (
        <AgentChatPanel
          projectId={projectId}
        />
      );
  }
});

/**
 * Type guard to check if props are for simple mode
 */
export function isSimpleModeProps(
  props: UnifiedChatPanelProps
): props is SimpleModeProps {
  return props.mode === 'simple';
}

/**
 * Type guard to check if props are for agent mode
 */
export function isAgentModeProps(
  props: UnifiedChatPanelProps
): props is AgentModeProps {
  return props.mode === 'agent';
}

export default UnifiedChatPanel;
