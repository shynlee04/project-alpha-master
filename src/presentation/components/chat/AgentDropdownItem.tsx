/**
 * AgentDropdownItem Component
 * Individual agent item in dropdown menu
 * Max 120 lines
 */

import { Circle, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TruncatedText } from '@/components/ui/truncated-text';
import type { Agent } from '@/mocks/agents';
import { getStatusColor, getStatusText, getStatusBadgeClasses } from './AgentSelectorUtils';

interface AgentDropdownItemProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}

export function AgentDropdownItem({
  agent,
  isSelected,
  onSelect
}: AgentDropdownItemProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 px-3 py-2 cursor-pointer',
        'hover:bg-slate-700 focus:bg-slate-700',
        'rounded-sm',
        // Highlight selected
        isSelected && 'bg-blue-900/30 border border-blue-500/30'
      )}
    >
      {/* Status dot */}
      <div className={cn(
        'w-2.5 h-2.5 rounded-full flex-shrink-0',
        getStatusColor(agent.status)
      )} />

      {/* Agent details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-100 truncate">
            {agent.name}
          </span>
          <span className={getStatusBadgeClasses(agent.status)}>
            {getStatusText(agent.status)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Cpu className="h-3 w-3" />
          <TruncatedText text={agent.modelId} />
        </div>
      </div>
    </div>
  );
}
