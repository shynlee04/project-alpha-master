/**
 * AgentSelectorTrigger Component
 * Dropdown trigger button showing current agent
 * Max 120 lines
 */

import { ChevronDown, Bot } from 'lucide-react';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TruncatedText } from '@/components/ui/truncated-text';
import type { Agent } from '@/mocks/agents';
import { getStatusColor } from './AgentSelectorUtils';

interface AgentSelectorTriggerProps {
  selectedAgent?: Agent | null;
  disabled?: boolean;
  isOpen?: boolean;
  className?: string;
  selectText?: string;
}

export function AgentSelectorTrigger({
  selectedAgent,
  disabled = false,
  isOpen = false,
  className,
  selectText = 'Select Agent'
}: AgentSelectorTriggerProps) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      className={cn(
        'h-10 px-3 gap-2 font-mono',
        // 8-bit styling
        'border-2 border-slate-600 dark:border-slate-500',
        'bg-slate-800/60 hover:bg-slate-700/80',
        'shadow-md',
        'hover:shadow-sm',
        'hover:translate-x-[2px] hover:translate-y-[2px]',
        'transition-all duration-100',
        className
      )}
    >
      {selectedAgent ? (
        <>
          {/* Status indicator */}
          <Circle className={cn(
            'h-2.5 w-2.5 fill-current',
            getStatusColor(selectedAgent.status)
          )} />

          {/* Agent info */}
          <div className="flex flex-col items-start min-w-0 max-w-[120px]">
            <TruncatedText
              text={selectedAgent.name}
              className="text-xs font-bold text-slate-100 w-full"
            />
            <TruncatedText
              text={selectedAgent.model.split('/').pop() || ''}
              className="text-[10px] text-slate-400 w-full"
            />
          </div>
        </>
      ) : (
        <>
          <Bot className="h-4 w-4" />
          <span className="text-sm">
            {selectText}
          </span>
        </>
      )}
      <ChevronDown className={cn(
        'h-4 w-4 transition-transform',
        isOpen && 'rotate-180'
      )} />
    </Button>
  );
}
