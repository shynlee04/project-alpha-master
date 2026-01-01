/**
 * @fileoverview Workspace Tool Permissions Configuration
 * @module components/agent/WorkspaceToolPermissionsConfig
 *
 * Grid UI for configuring workspace-specific tool permissions.
 * Allows users to enable/disable tools per workspace for each agent.
 *
 * @epic WB-8 - Cross-Workspace Event System
 * @story WB-8.3 - Agent Configuration Sync
 * @constitution P0 - Security & Workspace Boundaries
 *
 * December 2025 Patterns:
 * - Single responsibility (permission configuration only)
 * - Accessible form controls (proper labels and ARIA)
 * - Clear visual feedback (color-coded permission states)
 * - Graceful degradation (handles missing configuration)
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Shield } from 'lucide-react';
import { Switch } from '@/presentation/components/ui/switch';
import { Label } from '@/presentation/components/ui/label';
import { PixelBadge } from '@/presentation/components/ui/pixel-badge';
import { cn } from '@/lib/utils';
import type { Agent } from '@/core/entities/Agent';
import type { WorkspaceType } from '@/lib/state/workspace-types';

/**
 * Workspace metadata for display
 */
const WORKSPACE_LABELS: Record<WorkspaceType, string> = {
  ide: 'IDE',
  knowledge: 'Knowledge',
  study: 'Study',
  notes: 'Notes',
};

const WORKSPACE_DESCRIPTIONS: Record<WorkspaceType, string> = {
  ide: 'Full development environment with file and terminal access',
  knowledge: 'Knowledge synthesis and research tools',
  study: 'Focused study mode with limited tools',
  notes: 'Minimal note-taking interface',
};

/**
 * Props for WorkspaceToolPermissionsConfig component
 */
export interface WorkspaceToolPermissionsConfigProps {
  /** Agent to configure permissions for */
  agent: Agent;

  /** Callback when permissions change */
  onPermissionsChange: (
    toolId: string,
    workspaceType: WorkspaceType,
    isEnabled: boolean
  ) => void;

  /** CSS class name */
  className?: string;
}

/**
 * Workspace Tool Permissions Configuration Component
 *
 * Displays a grid of tools (rows) × workspaces (columns) with switches
 * to enable/disable tool access in each workspace.
 *
 * @example
 * ```tsx
 * <WorkspaceToolPermissionsConfig
 *   agent={agent}
 *   onPermissionsChange={(toolId, workspace, isEnabled) => {
 *     console.log(`${toolId} in ${workspace}: ${isEnabled}`);
 *   }}
 * />
 * ```
 */
export function WorkspaceToolPermissionsConfig({
  agent,
  onPermissionsChange,
  className,
}: WorkspaceToolPermissionsConfigProps) {
  const { t } = useTranslation();

  // Extract unique tools from agent configuration
  const tools = useMemo(() => {
    return agent.tools.map((tool) => ({
      toolId: tool.toolId,
      toolName: tool.toolName,
    }));
  }, [agent.tools]);

  // Get list of workspace types
  const workspaceTypes: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes'];

  /**
   * Check if tool is enabled in workspace
   */
  const isToolEnabledInWorkspace = (
    toolId: string,
    workspaceType: WorkspaceType
  ): boolean => {
    const tool = agent.tools.find((t) => t.toolId === toolId);
    if (!tool) return false;
    return tool.workspacePermissions[workspaceType] ?? false;
  };

  /**
   * Get permission state badge color
   */
  const getPermissionBadgeColor = (enabled: boolean): string => {
    return enabled
      ? 'bg-green-500/20 text-green-500 border-green-500/30'
      : 'bg-red-500/20 text-red-500 border-red-500/30';
  };

  /**
   * Handle permission toggle
   */
  const handlePermissionToggle = (
    toolId: string,
    workspaceType: WorkspaceType,
    enabled: boolean
  ) => {
    onPermissionsChange(toolId, workspaceType, enabled);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Workspace Tool Permissions</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure which tools are available in each workspace. Tools marked with{' '}
          <Check className="inline w-4 h-4 text-green-500 mx-1" /> are enabled,
          those marked with <X className="inline w-4 h-4 text-red-500 mx-1" /> are
          disabled.
        </p>
      </div>

      {/* Permission Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-5 gap-px bg-border">
          {/* Empty cell for corner */}
          <div className="bg-muted p-3 font-medium text-sm">
            Tool \ Workspace
          </div>

          {/* Workspace headers */}
          {workspaceTypes.map((workspace) => (
            <div
              key={workspace}
              className="bg-muted p-3 text-center"
            >
              <div className="font-medium text-sm mb-1">
                {WORKSPACE_LABELS[workspace]}
              </div>
              <div className="text-xs text-muted-foreground">
                {WORKSPACE_DESCRIPTIONS[workspace].split(' ').slice(0, 3).join(' ')}...
              </div>
            </div>
          ))}
        </div>

        {/* Tool Rows */}
        {tools.map((tool, toolIndex) => (
          <div
            key={tool.toolId}
            className={cn(
              'grid grid-cols-5 gap-px bg-border',
              toolIndex % 2 === 0 ? 'bg-background/50' : 'background'
            )}
          >
            {/* Tool Name */}
            <div className="bg-background p-3 flex items-center">
              <span className="font-medium text-sm">{tool.toolName}</span>
            </div>

            {/* Workspace Permission Switches */}
            {workspaceTypes.map((workspace) => {
              const isEnabled = isToolEnabledInWorkspace(tool.toolId, workspace);

              return (
                <div
                  key={`${tool.toolId}-${workspace}`}
                  className="bg-background p-3 flex items-center justify-center"
                >
                  <div className="flex items-center gap-3">
                    {/* Permission Status Badge */}
                    <PixelBadge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        getPermissionBadgeColor(isEnabled)
                      )}
                    >
                      {isEnabled ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Disabled
                        </>
                      )}
                    </PixelBadge>

                    {/* Permission Toggle Switch */}
                    <Switch
                      id={`${tool.toolId}-${workspace}`}
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        handlePermissionToggle(tool.toolId, workspace, checked)
                      }
                      aria-label={`Toggle ${tool.toolName} in ${WORKSPACE_LABELS[workspace]} workspace`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>Tool can execute in workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <X className="w-4 h-4 text-red-500" />
          <span>Tool blocked in workspace</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="font-medium text-sm">Security Notice</h4>
            <p className="text-xs text-muted-foreground">
              Disabling tools in specific workspaces enforces security boundaries.
              For example, you may want to disable file writing in the Knowledge
              workspace to prevent accidental modifications during research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Workspace permissions summary component
 *
 * Displays a compact summary of tool permissions across workspaces.
 */
export interface WorkspacePermissionsSummaryProps {
  agent: Agent;
  className?: string;
}

export function WorkspacePermissionsSummary({
  agent,
  className,
}: WorkspacePermissionsSummaryProps) {
  const workspaceTypes: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes'];

  const counts = useMemo(() => {
    const summary: Record<WorkspaceType, { enabled: number; total: number }> = {
      ide: { enabled: 0, total: 0 },
      knowledge: { enabled: 0, total: 0 },
      study: { enabled: 0, total: 0 },
      notes: { enabled: 0, total: 0 },
    };

    for (const tool of agent.tools) {
      for (const workspace of workspaceTypes) {
        summary[workspace].total++;
        if (tool.workspacePermissions[workspace]) {
          summary[workspace].enabled++;
        }
      }
    }

    return summary;
  }, [agent.tools, workspaceTypes]);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {workspaceTypes.map((workspace) => {
        const { enabled, total } = counts[workspace];
        const percentage = Math.round((enabled / total) * 100);

        return (
          <PixelBadge
            key={workspace}
            variant="outline"
            className="text-xs"
          >
            {WORKSPACE_LABELS[workspace]}: {enabled}/{total} ({percentage}%)
          </PixelBadge>
        );
      })}
    </div>
  );
}
