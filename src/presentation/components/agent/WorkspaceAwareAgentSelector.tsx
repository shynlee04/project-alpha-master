/**
 * @fileoverview Workspace-Aware Agent Selector
 * @module components/agent/WorkspaceAwareAgentSelector
 *
 * Agent selection component that filters agents by workspace availability.
 * Only shows agents that are available in the current workspace.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Accessibility & User Feedback
 *
 * December 2025 Patterns:
 * - Single responsibility (agent selection only)
 * - Accessible dropdown (proper labels and ARIA)
 * - Clear visual indicators (availability badges)
 * - Graceful degradation (handles missing agents)
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronDown, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Badge } from '@/presentation/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/lib/state/workspace-types';

/**
 * Props for WorkspaceAwareAgentSelector component
 */
export interface WorkspaceAwareAgentSelectorProps {
  /** All available agents */
  agents: Agent[];

  /** Currently active agent ID */
  activeAgentId: string | null;

  /** Current workspace type */
  currentWorkspace: WorkspaceType;

  /** Callback when agent is selected */
  onSelectAgent: (agentId: string) => void;

  /** Show agents unavailable in workspace (default: false) */
  showUnavailable?: boolean;

  /** Show agent descriptions (default: true) */
  showDescriptions?: boolean;

  /** CSS class name */
  className?: string;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * Check if agent is available in workspace
 */
function isAgentAvailableInWorkspace(agent: Agent, workspace: WorkspaceType): boolean {
  const binding = agent.workspaceBindings.find((b) => b.workspaceType === workspace);
  return binding?.isAvailable ?? false;
}

/**
 * Get agent UI variant for workspace
 */
function getAgentUIVariant(agent: Agent, workspace: WorkspaceType): 'full' | 'compact' | 'minimal' {
  const binding = agent.workspaceBindings.find((b) => b.workspaceType === workspace);
  return binding?.uiVariant ?? 'compact';
}

/**
 * Workspace-Aware Agent Selector Component
 *
 * Dropdown that filters agents by workspace availability.
 * Only shows agents that are available in the current workspace.
 *
 * @example
 * ```tsx
 * <WorkspaceAwareAgentSelector
 *   agents={agents}
 *   activeAgentId={activeAgentId}
 *   currentWorkspace="ide"
 *   onSelectAgent={(id) => console.log('Selected:', id)}
 * />
 * ```
 */
export function WorkspaceAwareAgentSelector({
  agents,
  activeAgentId,
  currentWorkspace,
  onSelectAgent,
  showUnavailable = false,
  showDescriptions = true,
  className,
  disabled = false,
}: WorkspaceAwareAgentSelectorProps) {
  const { t } = useTranslation();

  /**
   * Filter agents by workspace availability
   */
  const { availableAgents, unavailableAgents, activeAgent } = useMemo(() => {
    const available: Agent[] = [];
    const unavailable: Agent[] = [];
    let active: Agent | null = null;

    for (const agent of agents) {
      const isAvailable = isAgentAvailableInWorkspace(agent, currentWorkspace);

      if (agent.id === activeAgentId) {
        active = agent;
      }

      if (isAvailable) {
        available.push(agent);
      } else if (showUnavailable) {
        unavailable.push(agent);
      }
    }

    return { availableAgents: available, unavailableAgents: unavailable, activeAgent: active };
  }, [agents, activeAgentId, currentWorkspace, showUnavailable]);

  /**
   * Handle agent selection
   */
  const handleSelectAgent = (agentId: string) => {
    onSelectAgent(agentId);
  };

  /**
   * Get display text for selected agent
   */
  const getDisplayText = () => {
    if (!activeAgent) {
      return 'Select an agent...';
    }

    const isAvailable = isAgentAvailableInWorkspace(activeAgent, currentWorkspace);

    if (!isAvailable) {
      return `${activeAgent.name} (Unavailable in ${currentWorkspace})`;
    }

    const uiVariant = getAgentUIVariant(activeAgent, currentWorkspace);
    const variantLabel = uiVariant === 'full' ? '' : ` (${uiVariant})`;

    return `${activeAgent.name}${variantLabel}`;
  };

  // No agents available
  if (availableAgents.length === 0 && unavailableAgents.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <AlertCircle className="w-4 h-4" />
        <span>No agents configured</span>
      </div>
    );
  }

  // All agents unavailable in current workspace
  if (availableAgents.length === 0 && !showUnavailable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-2 text-sm text-yellow-600', className)}>
              <AlertCircle className="w-4 h-4" />
              <span>No agents available in {currentWorkspace} workspace</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Configure workspace bindings in agent settings to make agents available in this
              workspace.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Select
      value={activeAgentId || undefined}
      onValueChange={handleSelectAgent}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-full', className)} aria-label="Select agent">
        <div className="flex items-center gap-2 flex-1">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Select an agent...">
            {getDisplayText()}
          </SelectValue>
        </div>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </SelectTrigger>

      <SelectContent>
        {/* Available Agents Section */}
        {availableAgents.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Available in {currentWorkspace}
            </div>
            {availableAgents.map((agent) => {
              const uiVariant = getAgentUIVariant(agent, currentWorkspace);
              const isActive = agent.id === activeAgentId;

              return (
                <SelectItem key={agent.id} value={agent.id} className="cursor-pointer">
                  <div className="flex items-center gap-2 flex-1">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{agent.name}</span>
                        {uiVariant !== 'full' && (
                          <Badge variant="outline" className="text-xs">
                            {uiVariant}
                          </Badge>
                        )}
                      </div>
                      {showDescriptions && agent.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {agent.description}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 text-green-500 border-green-500/30 text-xs"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </>
        )}

        {/* Unavailable Agents Section (optional) */}
        {showUnavailable && unavailableAgents.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Unavailable in {currentWorkspace}
            </div>
            {unavailableAgents.map((agent) => {
              const isActive = agent.id === activeAgentId;

              return (
                <SelectItem
                  key={agent.id}
                  value={agent.id}
                  disabled
                  className="cursor-not-allowed opacity-60"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{agent.name}</span>
                        <Badge variant="outline" className="text-xs bg-red-500/20 text-red-500">
                          Unavailable
                        </Badge>
                      </div>
                      {showDescriptions && agent.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {agent.description}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </>
        )}
      </SelectContent>
    </Select>
  );
}

/**
 * Compact badge version of agent selector
 */
export interface AgentSelectorBadgeProps {
  agent: Agent | null;
  currentWorkspace: WorkspaceType;
  className?: string;
}

export function AgentSelectorBadge({
  agent,
  currentWorkspace,
  className,
}: AgentSelectorBadgeProps) {
  if (!agent) {
    return (
      <Badge variant="outline" className={cn('text-muted-foreground', className)}>
        No agent selected
      </Badge>
    );
  }

  const isAvailable = isAgentAvailableInWorkspace(agent, currentWorkspace);
  const uiVariant = getAgentUIVariant(agent, currentWorkspace);

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5',
        isAvailable
          ? 'bg-green-500/20 text-green-500 border-green-500/30'
          : 'bg-red-500/20 text-red-500 border-red-500/30',
        className
      )}
    >
      <Bot className="w-3 h-3" />
      <span className="font-medium">{agent.name}</span>
      {!isAvailable && <span className="text-xs">(Unavailable)</span>}
      {uiVariant !== 'full' && <span className="text-xs opacity-70">({uiVariant})</span>}
    </Badge>
  );
}
