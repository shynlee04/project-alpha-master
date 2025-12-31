/**
 * ChatHeader Component
 * Header for chat conversation with back button, title, and agent selector
 * Max 120 lines
 */

import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TruncatedText } from '@/components/ui/truncated-text';
import { AgentSelector } from './AgentSelector';
import type { Agent } from '@/mocks/agents';
import type { ConversationThread } from '@/stores/conversation-threads-store';

interface ChatHeaderProps {
  thread: ConversationThread;
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onBack: () => void;
  isStreaming?: boolean;
}

export function ChatHeader({
  thread,
  agents,
  selectedAgent,
  onSelectAgent,
  onBack,
  isStreaming = false
}: ChatHeaderProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3',
      'border-b-2 border-slate-700 dark:border-slate-600',
      'bg-slate-800/80'
    )}>
      {/* Back button */}
      <Button
        variant="ghost"
        iconOnly
        onClick={onBack}
        className={cn(
          'h-8 w-8',
          'border border-slate-600 hover:border-slate-500',
          'hover:bg-slate-700'
        )}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Thread title */}
      <div className="flex-1 min-w-0">
        <TruncatedText
          text={thread.title}
          className={cn(
            'font-mono font-bold text-sm',
            'text-slate-100'
          )}
        />
      </div>

      {/* Agent selector */}
      <AgentSelector
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={onSelectAgent}
        disabled={isStreaming}
      />
    </div>
  );
}
