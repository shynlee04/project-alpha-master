/**
 * @fileoverview Unified Agent Selector
 * @module components/agent/UnifiedAgentSelector
 *
 * SINGLE SOURCE OF TRUTH for agent selection across all workspaces.
 * Uses useAgentSelectionStore for per-workspace agent persistence.
 * Fixes fragmentation between IDE, Knowledge, Notes, and Study workspaces.
 *
 * @epic WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Cross-Workspace State Synchronization
 *
 * January 2026: Systematic fix for agent selector fragmentation
 * - Replaces useAgentsStore (global) with useAgentSelectionStore (per-workspace)
 * - Ensures agent selections persist and sync across all workspaces
 * - Provides variant prop for different UI contexts (full/compact/minimal)
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,

} from '@/presentation/components/ui/select';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { detectWorkspace } from '@/lib/workspace/workspace-detector';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { Agent } from '@/core/entities/Agent';

/**
 * Props for UnifiedAgentSelector
 */
export interface UnifiedAgentSelectorProps {
  /** Display variant */
  variant?: 'full' | 'compact' | 'minimal';

  /** Workspace type (auto-detected if not provided) */
  workspaceType?: WorkspaceType;

  /** Additional CSS classes */
  className?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Callback when agent is selected (optional) */
  onSelectAgent?: (agent: Agent) => void;
}

/**
 * Get status color for agent
 */
function getStatusColor(status: Agent['status']): string {
  switch (status) {
    case 'online':
      return 'bg-green-500 shadow-colored-success';
    case 'busy':
      return 'bg-yellow-500 shadow-colored-warning';
    case 'offline':
      return 'bg-slate-500';
    case 'error':
      return 'bg-red-500 shadow-colored-error';
    default:
      return 'bg-slate-500';
  }
}

/**
 * Unified Agent Selector Component
 *
 * Uses useAgentSelectionStore for per-workspace agent persistence.
 * Replaces the fragmented useAgentsStore-based selectors.
 *
 * @example
 * ```tsx
 * <UnifiedAgentSelector variant="compact" workspaceType="knowledge" />
 * ```
 */
export function UnifiedAgentSelector({
  variant = 'full',
  workspaceType: propWorkspaceType,
  className,
  disabled = false,
  onSelectAgent,
}: UnifiedAgentSelectorProps) {
  const { t } = useTranslation();

  // Auto-detect workspace if not provided
  const currentWorkspace = propWorkspaceType ?? (detectWorkspace() as WorkspaceType);

  // Get all agents from the main store
  const agents = useAppStore((state) => state.agents);

  // Get agent selection state from the PROPER store (per-workspace)
  const getAgentForWorkspace = useAgentSelectionStore((state) => state.getAgentForWorkspace);
  const setActiveAgent = useAgentSelectionStore((state) => state.setActiveAgent);
  // Subscribe to changes that affect selection
  const lastSelectedAgentIds = useAgentSelectionStore((state) => state.lastSelectedAgentIds);
  const defaultAgentIds = useAgentSelectionStore((state) => state.defaultAgentIds);

  // Get active agent for current workspace - REACTIVE to store changes
  // We include dependencies that affect the result of getAgentForWorkspace
  const activeAgent = useMemo(() => {
    return getAgentForWorkspace(currentWorkspace);
  }, [getAgentForWorkspace, currentWorkspace, lastSelectedAgentIds, defaultAgentIds, agents]);

  // Get agents available in current workspace
  const availableAgents = useMemo(() => {
    return agents.filter((agent) => {
      const binding = agent.workspaceBindings.find((b) => b.workspaceType === currentWorkspace);
      return binding?.isAvailable ?? false;
    });
  }, [agents, currentWorkspace]);

  /**
   * Handle agent selection
   */
  const handleSelectAgent = (agentId: string) => {
    setActiveAgent(agentId, currentWorkspace);

    const agent = agents.find((a) => a.id === agentId);
    if (agent && onSelectAgent) {
      onSelectAgent(agent);
    }
  };

  // No agents available
  if (availableAgents.length === 0) {
    if (variant === 'minimal') {
      return (
        <Button
          variant="ghost"
          size="sm"
          disabled
          className={cn('h-8 w-8 p-0', className)}
          title="No agents available"
        >
          <Bot className="h-4 w-4 text-muted-foreground" />
        </Button>
      );
    }

    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        No agents available
      </div>
    );
  }

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn('h-8 w-8 p-0 relative', className)}
            title={activeAgent?.name || 'Select Agent'}
          >
            <Bot className="h-4 w-4" />
            {activeAgent && (
              <div className={cn(
                'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full',
                getStatusColor(activeAgent.status)
              )} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 font-mono">
          {availableAgents.map((agent) => (
            <DropdownMenuItem
              key={agent.id}
              onClick={() => handleSelectAgent(agent.id)}
              className={cn(
                'flex items-center gap-2 text-xs cursor-pointer',
                activeAgent?.id === agent.id && 'bg-accent'
              )}
            >
              <div className={cn(
                'h-2 w-2 rounded-full',
                getStatusColor(agent.status)
              )} />
              <span className="truncate">{agent.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Render compact variant
  if (variant === 'compact') {
    return (
      <Select
        value={activeAgent?.id || undefined}
        onValueChange={handleSelectAgent}
        disabled={disabled}
      >
        <SelectTrigger className={cn('h-8 px-2 gap-1.5 font-mono text-xs', className)}>
          {activeAgent ? (
            <>
              <div className={cn(
                'h-2 w-2 rounded-full',
                getStatusColor(activeAgent.status)
              )} />
              <span className="max-w-[100px] truncate">{activeAgent.name}</span>
            </>
          ) : (
            <>
              <Bot className="h-3 w-3" />
              <span>Agent</span>
            </>
          )}
        </SelectTrigger>
        <SelectContent className="w-56 font-mono">
          {availableAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  getStatusColor(agent.status)
                )} />
                <span className="flex-1 truncate">{agent.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Full variant (default)
  return (
    <Select
      value={activeAgent?.id || undefined}
      onValueChange={handleSelectAgent}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          'h-10 px-3 gap-2 font-mono',
          'border-2 border-slate-600 dark:border-slate-500',
          'bg-slate-800/60 hover:bg-slate-700/80',
          'shadow-md hover:shadow-sm',
          'hover:translate-x-[2px] hover:translate-y-[2px]',
          'transition-all duration-100',
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1">
          {activeAgent ? (
            <>
              <div className={cn(
                'h-2.5 w-2.5 rounded-full',
                getStatusColor(activeAgent.status)
              )} />
              <span className="text-xs font-bold text-slate-100">
                {activeAgent.name}
              </span>
            </>
          ) : (
            <>
              <Bot className="h-4 w-4" />
              <span className="text-sm">{t('chat.selectAgent', 'Select Agent')}</span>
            </>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectTrigger>

      <SelectContent
        className={cn(
          'w-64 p-1 font-mono',
          'border-2 border-slate-600 dark:border-slate-500',
          'bg-slate-800 dark:bg-slate-900',
          'shadow-lg'
        )}
      >
        {availableAgents.map((agent) => (
          <SelectItem
            key={agent.id}
            value={agent.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 cursor-pointer',
              'hover:bg-slate-700 focus:bg-slate-700'
            )}
          >
            <div className={cn(
              'w-2.5 h-2.5 rounded-full',
              getStatusColor(agent.status)
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100 truncate">
                  {agent.name}
                </span>
                {agent.status === 'online' && (
                  <Badge variant="outline" className="text-xs bg-green-900/50 text-green-400">
                    ONLINE
                  </Badge>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {agent.modelId.split('/').pop()}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Default export for convenience
 */
export default UnifiedAgentSelector;
