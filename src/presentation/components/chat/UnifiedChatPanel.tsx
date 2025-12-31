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
import { ChatPanel as ThreadedChatPanel } from './ChatPanel';
import { RAGChatPanel } from '@/presentation/components/rag/RAGChatPanel';
import { AgentChatPanel } from '@/presentation/components/ide/AgentChatPanel';

/**
 * Chat mode variants
 */
export type ChatMode = 'threaded' | 'simple' | 'agent';

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
 * Props for threaded mode (ChatPanel)
 */
interface ThreadedModeProps extends BaseProps {
  mode: 'threaded';
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
}

/**
 * Union type for all mode props
 */
export type UnifiedChatPanelProps = ThreadedModeProps | SimpleModeProps | AgentModeProps;

/**
 * UnifiedChatPanel - Single entry point for all chat interfaces
 *
 * Routes to appropriate implementation based on mode prop:
 * - 'threaded': Uses ChatPanel (threaded conversations)
 * - 'simple': Uses RAGChatPanel (citations, simple message list)
 * - 'agent': Uses AgentChatPanel (tool execution, approvals)
 *
 * @example
 * ```tsx
 * // Threaded mode (IDE workspace)
 * <UnifiedChatPanel mode="threaded" projectId={projectId} />
 *
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
 * ```
 */
export const UnifiedChatPanel = memo(function UnifiedChatPanel(
  props: UnifiedChatPanelProps
) {
  const { mode, projectId, className } = props;

  switch (mode) {
    case 'threaded':
      // Threaded conversations - uses ChatPanel
      return <ThreadedChatPanel projectId={projectId} className={className} />;

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
        />
      );

    default:
      // Fallback to threaded mode
      const _exhaustive: never = mode;
      console.warn(`Unknown chat mode: ${_exhaustive}, falling back to threaded`);
      return <ThreadedChatPanel projectId={projectId} className={className} />;
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

/**
 * Type guard to check if props are for threaded mode
 */
export function isThreadedModeProps(
  props: UnifiedChatPanelProps
): props is ThreadedModeProps {
  return props.mode === 'threaded';
}

export default UnifiedChatPanel;
