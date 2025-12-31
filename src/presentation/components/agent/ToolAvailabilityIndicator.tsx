/**
 * @fileoverview Tool Availability Indicator
 * @module components/agent/ToolAvailabilityIndicator
 *
 * Visual indicator showing which tools are available in the current workspace.
 * Provides users with immediate feedback on tool access control.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Accessibility & User Feedback
 *
 * December 2025 Patterns:
 * - Single responsibility (display tool availability only)
 * - Accessible indicators (proper labels and ARIA)
 * - Clear visual hierarchy (grouped by category)
 * - Performance optimized (memoized calculations)
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/lib/state/workspace-types';

/**
 * Tool availability status
 */
type ToolAvailabilityStatus = 'available' | 'blocked' | 'unknown';

/**
 * Tool availability info
 */
interface ToolAvailabilityInfo {
  toolId: string;
  toolName: string;
  status: ToolAvailabilityStatus;
  reason?: string;
}

/**
 * Props for ToolAvailabilityIndicator component
 */
export interface ToolAvailabilityIndicatorProps {
  /** Current agent */
  agent: Agent | null;

  /** Current workspace type */
  currentWorkspace: WorkspaceType;

  /** Compact display mode (default: false) */
  compact?: boolean;

  /** Show tool names (default: true) */
  showToolNames?: boolean;

  /** CSS class name */
  className?: string;
}

/**
 * Tool Availability Indicator Component
 *
 * Shows which tools are available in the current workspace for the active agent.
 * Helps users understand what actions the agent can perform.
 *
 * @example
 * ```tsx
 * <ToolAvailabilityIndicator
 *   agent={activeAgent}
 *   currentWorkspace="ide"
 *   compact={false}
 * />
 * ```
 */
export function ToolAvailabilityIndicator({
  agent,
  currentWorkspace,
  compact = false,
  showToolNames = true,
  className,
}: ToolAvailabilityIndicatorProps) {
  const { t } = useTranslation();

  /**
   * Calculate tool availability for current workspace
   */
  const toolAvailability = useMemo((): {
    available: ToolAvailabilityInfo[];
    blocked: ToolAvailabilityInfo[];
    summary: {
      total: number;
      available: number;
      blocked: number;
      percentage: number;
    };
  } => {
    if (!agent) {
      return {
        available: [],
        blocked: [],
        summary: { total: 0, available: 0, blocked: 0, percentage: 0 },
      };
    }

    const available: ToolAvailabilityInfo[] = [];
    const blocked: ToolAvailabilityInfo[] = [];

    for (const tool of agent.tools) {
      // Check if agent is available in workspace
      const workspaceBinding = agent.workspaceBindings.find(
        (b) => b.workspaceType === currentWorkspace
      );

      const agentAvailable = workspaceBinding?.isAvailable ?? false;

      // Check if tool is enabled in workspace
      const toolEnabled = tool.isEnabled && (tool.workspacePermissions[currentWorkspace] ?? false);

      const status: ToolAvailabilityStatus = agentAvailable && toolEnabled ? 'available' : 'blocked';
      const reason = !agentAvailable
        ? `Agent not available in ${currentWorkspace} workspace`
        : !tool.isEnabled
        ? 'Tool globally disabled'
        : `Tool disabled in ${currentWorkspace} workspace`;

      const info: ToolAvailabilityInfo = {
        toolId: tool.toolId,
        toolName: tool.toolName,
        status,
        reason,
      };

      if (status === 'available') {
        available.push(info);
      } else {
        blocked.push(info);
      }
    }

    const total = available.length + blocked.length;
    const percentage = total > 0 ? Math.round((available.length / total) * 100) : 0;

    return {
      available,
      blocked,
      summary: { total, available: available.length, blocked: blocked.length, percentage },
    };
  }, [agent, currentWorkspace]);

  /**
   * Get status icon
   */
  const getStatusIcon = (status: ToolAvailabilityStatus) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'unknown':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status: ToolAvailabilityStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30';
      case 'blocked':
        return 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30';
      case 'unknown':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30';
    }
  };

  // No agent - show empty state
  if (!agent) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span>No agent selected</span>
        </div>
      </div>
    );
  }

  // Compact mode - show summary badge only
  if (compact) {
    const { summary } = toolAvailability;
    const badgeColor =
      summary.percentage === 100
        ? 'bg-green-500/20 text-green-500 border-green-500/30'
        : summary.percentage >= 50
        ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
        : 'bg-red-500/20 text-red-500 border-red-500/30';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn('cursor-help', badgeColor, className)}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {summary.available}/{summary.total} tools available
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">
                {summary.available} of {summary.total} tools available in {currentWorkspace} workspace
              </p>
              {summary.blocked > 0 && (
                <p className="text-xs text-muted-foreground">
                  {summary.blocked} tools are blocked due to workspace permissions
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full mode - show detailed tool list
  const { available, blocked, summary } = toolAvailability;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Tool Availability</h4>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            summary.percentage === 100
              ? 'bg-green-500/20 text-green-500 border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
          )}
        >
          {summary.available}/{summary.total} ({summary.percentage}%)
        </Badge>
      </div>

      {/* Available Tools */}
      {available.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-green-500 uppercase tracking-wide">
            Available ({available.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {available.map((tool) => (
              <TooltipProvider key={tool.toolId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        'cursor-help',
                        'bg-green-500/20 text-green-500 border-green-500/30',
                        'hover:bg-green-500/30'
                      )}
                    >
                      {getStatusIcon(tool.status)}
                      {showToolNames && <span className="ml-1">{tool.toolName}</span>}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{tool.toolName} is available in {currentWorkspace} workspace</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {/* Blocked Tools */}
      {blocked.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-red-500 uppercase tracking-wide">
            Blocked ({blocked.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {blocked.map((tool) => (
              <TooltipProvider key={tool.toolId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        'cursor-help',
                        'bg-red-500/20 text-red-500 border-red-500/30',
                        'hover:bg-red-500/30'
                      )}
                    >
                      {getStatusIcon(tool.status)}
                      {showToolNames && <span className="ml-1">{tool.toolName}</span>}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">{tool.toolName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tool.reason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {available.length === 0 && blocked.length === 0 && (
        <div className="text-sm text-muted-foreground italic">
          No tools configured for this agent
        </div>
      )}
    </div>
  );
}

/**
 * Compact badge showing tool availability count
 */
export interface ToolAvailabilityBadgeProps {
  agent: Agent | null;
  currentWorkspace: WorkspaceType;
  className?: string;
}

export function ToolAvailabilityBadge({
  agent,
  currentWorkspace,
  className,
}: ToolAvailabilityBadgeProps) {
  return (
    <ToolAvailabilityIndicator
      agent={agent}
      currentWorkspace={currentWorkspace}
      compact={true}
      showToolNames={false}
      className={className}
    />
  );
}
