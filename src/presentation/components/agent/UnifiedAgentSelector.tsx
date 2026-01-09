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

import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select-react19-compatible';
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
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import { useStoreEvent, STORE_EVENTS } from '@/lib/events/store-events';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { AgentData } from '@/infrastructure/persistence/stores/agents/types';

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
  onSelectAgent?: (agent: AgentData) => void;
}

/**
 * Get status color for agent
 */
function getStatusColor(status: AgentData['status']): string {
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

  // Listen to cross-workspace agent selection events
  useEffect(() => {
    // eventBus is a singleton, always available

    console.log('[UnifiedAgentSelector] Setting up event bus listeners for workspace:', currentWorkspace);

    /**
     * Handle agent selected event from another workspace
     * Updates local state if the event is for the current workspace
     */
    const handleAgentSelected = (event: any) => {
      const { workspaceType, agentId } = event.payload;
      console.log('[UnifiedAgentSelector] AGENT_SELECTED event received:', { workspaceType, agentId, currentWorkspace });

      // Only update if this event is for the current workspace
      if (workspaceType === currentWorkspace && agentId !== activeAgent?.id) {
        console.log('[UnifiedAgentSelector] Updating agent selection to:', agentId);
        setActiveAgent(agentId, currentWorkspace);
      }
    };

    /**
     * Handle default agent changed event
     * Updates local state if the event is for the current workspace
     */
    const handleDefaultAgentChanged = (event: any) => {
      const { workspaceType, agentId } = event.payload;
      console.log('[UnifiedAgentSelector] DEFAULT_AGENT_CHANGED event received:', { workspaceType, agentId, currentWorkspace });

      // Only update if this event is for the current workspace
      if (workspaceType === currentWorkspace) {
        console.log('[UnifiedAgentSelector] Default agent changed to:', agentId);
        // Default agent changes don't necessarily update the active selection
        // They just update the default agent ID in the store
      }
    };

    // Register listeners
    const unsubscribeAgentSelected = eventBus.on(DomainEventType.AGENT_SELECTED, handleAgentSelected as any);
    const unsubscribeDefaultAgentChanged = eventBus.on(DomainEventType.DEFAULT_AGENT_CHANGED, handleDefaultAgentChanged as any);

    console.log('[UnifiedAgentSelector] Event bus listeners registered');

    // Cleanup: remove listeners on unmount
    return () => {
      console.log('[UnifiedAgentSelector] Cleaning up event bus listeners');
      unsubscribeAgentSelected();
      unsubscribeDefaultAgentChanged();
    };
  }, [eventBus, currentWorkspace, activeAgent?.id, setActiveAgent]);

  // Listen to AGENT_CONFIG_CHANGED store events for cross-workspace sync
  useStoreEvent<{ agentId: string; workspaceType: WorkspaceType; configType: string; timestamp: number }>(
    STORE_EVENTS.AGENT_CONFIG_CHANGED,
    ({ agentId, workspaceType, configType }) => {
      console.log('[UnifiedAgentSelector] AGENT_CONFIG_CHANGED event received:', { agentId, workspaceType, configType, currentWorkspace });

      // React to agent config changes for the current workspace
      if (workspaceType === currentWorkspace) {
        // Force re-render by triggering a re-check of the active agent
        // The useMemo will pick up the change through the store
        if (configType === 'selection' || configType === 'default') {
          console.log('[UnifiedAgentSelector] Agent config changed, triggering update');
        }
      }
    },
    [currentWorkspace]
  );

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
        <DropdownMenuTrigger>
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
                'h-2 w-2 rounded-none',
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
                'h-2 w-2 rounded-none',
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
          <SelectValue placeholder="Agent">
            {activeAgent ? (
              <>
                <div className={cn(
                  'h-2 w-2 rounded-none',
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
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-56 font-mono">
          {availableAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'h-2 w-2 rounded-none',
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
          'border-2 border-border',
          'bg-card hover:bg-secondary',
          'shadow-pixel hover:shadow-pixel-sm',
          'hover:translate-x-[2px] hover:translate-y-[2px]',
          'transition-all duration-100',
          className
        )}
      >
        <SelectValue placeholder={t('chat.selectAgent', 'Select Agent')}>
          <div className="flex items-center gap-2 flex-1">
            {activeAgent ? (
              <>
                <div className={cn(
                  'h-2.5 w-2.5 rounded-none',
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
        </SelectValue>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectTrigger>

      <SelectContent
        className={cn(
          'w-64 p-1 font-mono',
          'border-2 border-border',
          'bg-popover',
          'shadow-pixel'
        )}
      >
        {availableAgents.map((agent) => (
          <SelectItem
            key={agent.id}
            value={agent.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 cursor-pointer',
              'hover:bg-secondary focus:bg-secondary'
            )}
          >
            <div className={cn(
              'w-2.5 h-2.5 rounded-none',
              getStatusColor(agent.status)
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100 truncate">
                  {agent.name}
                </span>
                {agent.status === 'online' && (
                  <Badge variant="outline" className="text-xs bg-success/20 text-success">
                    ONLINE
                  </Badge>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {agent.modelId?.split('/').pop() || agent.modelId}
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
