/**
 * Agent Workspace Binding Configuration UI
 *
 * Allows users to configure which workspaces an agent is available in.
 * Provides checkboxes for each workspace type with visual indicators.
 *
 * Features:
 * - Checkbox group for workspace selection
 * - Visual indicators for workspace types
 * - Accessibility: ARIA labels and keyboard navigation
 * - Reactive updates via Zustand store
 *
 * @module agent/AgentWorkspaceBindingConfig
 * @story P0-3 - Workspace Binding Configuration UI
 * @epic UX/UI Modernization
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Monitor, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Label } from '@/presentation/components/ui/label';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';
import type { Agent } from '@/core/entities/Agent';
import { useAgentsStore } from '@/infrastructure/persistence/stores';

/**
 * Workspace type configuration
 */
export interface WorkspaceConfig {
  type: 'ide' | 'knowledge' | 'study' | 'notes';
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

/**
 * Workspace configurations
 */
export const WORKSPACE_CONFIGS: WorkspaceConfig[] = [
  {
    type: 'ide',
    label: 'IDE',
    icon: Monitor,
    description: 'Code execution, file operations, debugging',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    type: 'knowledge',
    label: 'Knowledge',
    icon: BookOpen,
    description: 'RAG operations, embedding, chunking',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    type: 'study',
    label: 'Study',
    icon: GraduationCap,
    description: 'Review, memorization, assessment',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  {
    type: 'notes',
    label: 'Notes',
    icon: FileText,
    description: 'Text editing, formatting, linking',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
];

/**
 * Props for workspace binding configuration
 */
export interface AgentWorkspaceBindingConfigProps {
  /** Agent to configure */
  agent: Agent;

  /** Callback when binding changes */
  onBindingChange?: (agentId: string, workspaceType: string, isAvailable: boolean) => void;

  /** Whether configuration is disabled */
  disabled?: boolean;

  /** Whether changes are being saved */
  isSaving?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Compact mode (for smaller spaces) */
  compact?: boolean;
}

/**
 * Agent Workspace Binding Configuration Component
 *
 * Displays a checkbox group for configuring agent availability across workspaces.
 *
 * @example
 * ```tsx
 * <AgentWorkspaceBindingConfig
 *   agent={agent}
 *   onBindingChange={(agentId, workspaceType, isAvailable) => {
 *     console.log(`${agentId} ${isAvailable ? 'enabled' : 'disabled'} in ${workspaceType}`);
 *   }}
 * />
 * ```
 */
export function AgentWorkspaceBindingConfig({
  agent,
  onBindingChange,
  disabled = false,
  isSaving = false,
  className,
  compact = false,
}: AgentWorkspaceBindingConfigProps) {
  const { t } = useTranslation();
  const { updateWorkspaceBinding, updateAgentWorkspaceBinding } = useAgentsStore();

  // Local state for bindings (optimistic updates)
  const [localBindings, setLocalBindings] = useState<Record<string, boolean>>(() => {
    const bindings: Record<string, boolean> = {};
    agent.workspaceBindings.forEach(binding => {
      bindings[binding.workspaceType] = binding.isAvailable;
    });
    return bindings;
  });

  // Sync with agent changes
  useEffect(() => {
    const bindings: Record<string, boolean> = {};
    agent.workspaceBindings.forEach(binding => {
      bindings[binding.workspaceType] = binding.isAvailable;
    });
    setLocalBindings(bindings);
  }, [agent.id, agent.workspaceBindings]);

  const handleBindingChange = async (workspaceType: string, checked: boolean) => {
    // Optimistic update
    setLocalBindings(prev => ({ ...prev, [workspaceType]: checked }));

    try {
      // Update store
      if (onBindingChange) {
        await onBindingChange(agent.id, workspaceType, checked);
      } else {
        // Use default store action
        updateWorkspaceBinding(agent.id, workspaceType as any, checked);
      }
    } catch (error) {
      // Revert on error
      console.error('[AgentWorkspaceBindingConfig] Update failed:', error);
      setLocalBindings(prev => ({ ...prev, [workspaceType]: !checked }));
    }
  };

  const getWorkspaceIcon = (workspaceType: string) => {
    return WORKSPACE_CONFIGS.find(w => w.type === workspaceType)?.icon || Monitor;
  };

  const enabledCount = Object.values(localBindings).filter(Boolean).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Workspace Availability</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Select where {agent.name} should be available
          </p>
        </div>
        {!compact && (
          <Badge variant="secondary" className="text-xs">
            {enabledCount} of {WORKSPACE_CONFIGS.length} enabled
          </Badge>
        )}
      </div>

      {/* Workspace Checkboxes */}
      <div
        className={cn(
          'space-y-2',
          compact && 'space-y-1'
        )}
        role="group"
        aria-label={`Configure ${agent.name} workspace availability`}
      >
        {WORKSPACE_CONFIGS.map((workspace) => {
          const Icon = workspace.icon;
          const isChecked = localBindings[workspace.type] || false;
          const isDefault = agent.workspaceBindings.find(
            b => b.workspaceType === workspace.type
          )?.isDefault;

          return (
            <div
              key={workspace.type}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                'hover:bg-muted/50',
                isChecked && 'bg-muted/30',
                workspace.color
              )}
            >
              {/* Checkbox */}
              <div className="flex items-center pt-0.5">
                <Checkbox
                  id={`workspace-${agent.id}-${workspace.type}`}
                  checked={isChecked}
                  disabled={disabled || isSaving}
                  onCheckedChange={(checked) => handleBindingChange(workspace.type, checked)}
                  aria-label={`Make ${agent.name} available in ${workspace.label} workspace`}
                />
              </div>

              {/* Label & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`workspace-${agent.id}-${workspace.type}`}
                    className={cn(
                      'text-sm font-medium cursor-pointer',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span>{workspace.label}</span>
                      {isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </Label>
                </div>
                {!compact && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {workspace.description}
                  </p>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1">
                {isChecked ? (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    {!compact && <span>Active</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-full border-2 border-current" />
                    {!compact && <span>Disabled</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Mode Info */}
      {compact && (
        <p className="text-xs text-muted-foreground">
          {enabledCount} workspace(s) enabled
        </p>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Saving workspace preferences...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Workspace Type Badge Component
 *
 * Displays a badge for a specific workspace type.
 */
export interface WorkspaceTypeBadgeProps {
  workspaceType: string;
  isAvailable: boolean;
  showLabel?: boolean;
  className?: string;
}

export function WorkspaceTypeBadge({
  workspaceType,
  isAvailable,
  showLabel = true,
  className,
}: WorkspaceTypeBadgeProps) {
  const config = WORKSPACE_CONFIGS.find(w => w.type === workspaceType);
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant={isAvailable ? 'default' : 'outline'}
      className={cn(
        'gap-1.5',
        isAvailable ? config.color : 'opacity-50',
        className
      )}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}

/**
 * Workspace Availability Summary Component
 *
 * Displays a compact summary of agent workspace availability.
 */
export interface WorkspaceAvailabilitySummaryProps {
  agent: Agent;
  className?: string;
}

export function WorkspaceAvailabilitySummary({
  agent,
  className,
}: WorkspaceAvailabilitySummaryProps) {
  const availableWorkspaces = agent.workspaceBindings.filter(b => b.isAvailable);
  const totalWorkspaces = WORKSPACE_CONFIGS.length;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex -space-x-1">
        {availableWorkspaces.map((binding) => {
          const config = WORKSPACE_CONFIGS.find(w => w.type === binding.workspaceType);
          if (!config) return null;
          const Icon = config.icon;
          return (
            <div
              key={binding.workspaceType}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center border',
                config.color
              )}
              title={`${agent.name} in ${config.label} workspace`}
            >
              <Icon className="w-3 h-3" aria-hidden="true" />
            </div>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        {availableWorkspaces.length} of {totalWorkspaces}
      </span>
    </div>
  );
}
