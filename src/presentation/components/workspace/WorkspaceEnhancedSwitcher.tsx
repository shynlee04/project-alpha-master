/**
 * @fileoverview Workspace-Enhanced Switcher Component
 * @module components/workspace/WorkspaceEnhancedSwitcher
 *
 * Enhanced workspace switcher that shows tool availability per workspace.
 * Provides users with visibility into what tools they'll have access to
 * before switching workspaces.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Accessibility & User Feedback
 *
 * December 2025 Patterns:
 * - Single responsibility (workspace switching with preview)
 * - Accessible navigation (proper labels and keyboard support)
 * - Clear visual feedback (tool counts, availability indicators)
 * - Performance optimized (memoized calculations)
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Laptop,
  BookOpen,
  GraduationCap,
  FileText,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Tooltip,
} from '@/presentation/components/ui/tooltip-react19-compatible';
import { cn } from '@/lib/utils';
import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types';

/**
 * Workspace metadata
 */
const WORKSPACE_METADATA: Record<
  WorkspaceType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    color: string;
  }
> = {
  ide: {
    label: 'IDE',
    icon: Laptop,
    description: 'Full development environment',
    color: 'bg-blue-500',
  },
  knowledge: {
    label: 'Knowledge',
    icon: BookOpen,
    description: 'Research and synthesis',
    color: 'bg-purple-500',
  },
  study: {
    label: 'Study',
    icon: GraduationCap,
    description: 'Focused study mode',
    color: 'bg-green-500',
  },
  notes: {
    label: 'Notes',
    icon: FileText,
    description: 'Quick note-taking',
    color: 'bg-yellow-500',
  },
};

/**
 * Props for WorkspaceEnhancedSwitcher component
 */
export interface WorkspaceEnhancedSwitcherProps {
  /** Current workspace type */
  currentWorkspace: WorkspaceType;

  /** Currently active agent */
  activeAgent: Agent | null;

  /** Callback when workspace is selected */
  onSelectWorkspace: (workspace: WorkspaceType) => void;

  /** Show tool counts (default: true) */
  showToolCounts?: boolean;

  /** Show agent availability (default: true) */
  showAgentAvailability?: boolean;

  /** Compact display mode (default: false) */
  compact?: boolean;

  /** CSS class name */
  className?: string;
}

/**
 * Calculate tool availability for workspace
 */
function calculateWorkspaceToolAvailability(
  agent: Agent | null,
  workspace: WorkspaceType
): {
  available: number;
  total: number;
  isAvailable: boolean;
} {
  if (!agent) {
    return { available: 0, total: 0, isAvailable: false };
  }

  // Check if agent is available in workspace
  const workspaceBinding = agent.workspaceBindings.find(
    (b) => b.workspaceType === workspace
  );
  const agentAvailable = workspaceBinding?.isAvailable ?? false;

  if (!agentAvailable) {
    return { available: 0, total: agent.tools.length, isAvailable: false };
  }

  // Count available tools
  let available = 0;
  for (const tool of agent.tools) {
    if (tool.isEnabled && tool.workspacePermissions[workspace]) {
      available++;
    }
  }

  return {
    available,
    total: agent.tools.length,
    isAvailable: agentAvailable,
  };
}

/**
 * Workspace-Enhanced Switcher Component
 *
 * Shows available workspaces with tool availability preview.
 * Helps users understand what tools they'll have access to before switching.
 *
 * @example
 * ```tsx
 * <WorkspaceEnhancedSwitcher
 *   currentWorkspace="ide"
 *   activeAgent={activeAgent}
 *   onSelectWorkspace={(workspace) => console.log('Switch to:', workspace)}
 * />
 * ```
 */
export function WorkspaceEnhancedSwitcher({
  currentWorkspace,
  activeAgent,
  onSelectWorkspace,
  showToolCounts = true,
  showAgentAvailability: _showAgentAvailability = true,
  compact = false,
  className,
}: WorkspaceEnhancedSwitcherProps) {
  const { t } = useTranslation();

  /**
   * Calculate workspace availability metrics
   */
  const workspaceMetrics = useMemo(() => {
    const workspaces: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes'];

    return workspaces.map((workspace) => {
      const metrics = calculateWorkspaceToolAvailability(activeAgent, workspace);
      const metadata = WORKSPACE_METADATA[workspace];
      const isActive = workspace === currentWorkspace;

      return {
        workspace,
        metrics,
        metadata,
        isActive,
      };
    });
  }, [activeAgent, currentWorkspace]);

  /**
   * Render workspace button
   */
  const renderWorkspaceButton = (
    workspace: WorkspaceType,
    metadata: (typeof WORKSPACE_METADATA)[WorkspaceType],
    metrics: ReturnType<typeof calculateWorkspaceToolAvailability>,
    isActive: boolean
  ) => {
    const Icon = metadata.icon;
    const isAvailable = metrics.isAvailable;
      metrics.total > 0 ? Math.round((metrics.available / metrics.total) * 100) : 0;

    return (
      <Tooltip
        key={workspace}
        content={
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="font-medium">{t(`${metadata.label.toLowerCase()}.workspace`, { workspace: metadata.label })}</span>
            </div>

            {!isAvailable && (
              <p className="text-xs text-red-500">
                {t('workspace.switcher.agentNotAvailable')}
              </p>
            )}

            {isAvailable && showToolCounts && (
              <div className="space-y-1">
                <p className="text-xs">
                  {t('workspace.switcher.toolsAvailableCount', { available: metrics.available, total: metrics.total })}
                </p>
                {metrics.available < metrics.total && (
                  <p className="text-xs text-muted-foreground">
                    {t('workspace.switcher.toolsDisabledCount', { count: metrics.total - metrics.available })}
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{metadata.description}</p>
          </div>
        }
        side="right"
      >
        <Button
          variant={isActive ? 'secondary' : 'outline'}
          size={compact ? 'sm' : 'md'}
          onClick={() => onSelectWorkspace(workspace)}
          disabled={!isAvailable}
          className={cn(
            'justify-start gap-3 h-auto py-3 px-4',
            isActive && metadata.color,
            !isActive && !isAvailable && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {/* Workspace Icon */}
          <div
            className={cn(
              'p-2 rounded-none',
              isActive ? 'bg-background/20' : 'bg-muted'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          {/* Workspace Info */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium">{metadata.label}</span>
              {isActive && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {!isAvailable && (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {metadata.description}
              </p>
            )}
          </div>

          {/* Tool Count Badge */}
          {showToolCounts && isAvailable && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                isActive
                  ? 'bg-background/20 border-background/40'
                  : 'bg-muted'
              )}
            >
              {metrics.available}/{metrics.total}
              {!compact && ` (${Math.round((metrics.available / metrics.total) * 100)}%)`}
            </Badge>
          )}

          {/* Chevron */}
          {!compact && <ChevronRight className="w-4 h-4 opacity-50" />}
        </Button>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      {!compact && (
        <div className="px-2">
          <h3 className="text-sm font-medium">{t('workspace.switcher.switchWorkspace')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {showToolCounts
              ? t('workspace.switcher.toolAvailabilityHint')
              : t('workspace.switcher.selectWorkspaceHint')}
          </p>
        </div>
      )}

      {/* Workspace List */}
      <div className={compact ? 'flex flex-wrap gap-2' : 'space-y-1'}>
        {workspaceMetrics.map(({ workspace, metadata, metrics, isActive }) =>
          renderWorkspaceButton(workspace, metadata, metrics, isActive)
        )}
      </div>

      {/* Legend */}
      {!compact && showToolCounts && (
        <div className="px-2 pt-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>{t('workspace.switcher.legend.available')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span>{t('workspace.switcher.legend.unavailable')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                3/4
              </Badge>
              <span>{t('workspace.switcher.legend.toolCount')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact badge version of workspace switcher
 */
export interface WorkspaceBadgeProps {
  workspace: WorkspaceType;
  agent: Agent | null;
  className?: string;
}

export function WorkspaceBadge({ workspace, agent, className }: WorkspaceBadgeProps) {
  const metadata = WORKSPACE_METADATA[workspace];
  const Icon = metadata.icon;
  const metrics = calculateWorkspaceToolAvailability(agent, workspace);

  const isAvailable = metrics.isAvailable;
    metrics.total > 0 ? Math.round((metrics.available / metrics.total) * 100) : 0;

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
      <Icon className="w-3 h-3" />
      <span className="font-medium">{metadata.label}</span>
      {agent && showToolCounts && (
        <span className="text-xs opacity-70">
          ({metrics.available}/{metrics.total})
        </span>
      )}
    </Badge>
  );
}

// Default export for showToolCounts prop
const showToolCounts = true;
