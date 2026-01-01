/**
 * @fileoverview Workspace Permission Editor
 * @module presentation/components/agent/WorkspacePermissionEditor
 *
 * UI component for editing tool permissions per workspace type.
 * Provides tabbed interface with one tab per workspace type.
 *
 * @epic WB-8.3 - Cross-Workspace Event System
 * @story WB-8.3.2 - Workspace-Scoped Permissions
 * @constitution P0 - Accessibility & User Feedback
 *
 * December 2025 Patterns:
 * - Single responsibility (permission editing only)
 * - Accessible tabs and selects (ARIA labels)
 * - Clear visual hierarchy (grouped by workspace)
 * - Optimized re-renders (Zustand selectors)
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Label } from '@/presentation/components/ui/label';
import { cn } from '@/lib/utils';
import { useToolPermissionStore, type ToolTrustLevel } from '@/lib/state/tool-permission-store';
import type { WorkspaceType } from '@/lib/state/workspace-types';

/**
 * Props for WorkspacePermissionEditor component
 */
export interface WorkspacePermissionEditorProps {
  /** CSS class name */
  className?: string;

  /** Display mode */
  variant?: 'full' | 'compact';

  /** Show tool descriptions */
  showDescriptions?: boolean;

  /** On change callback */
  onChange?: (workspace: WorkspaceType, toolId: string, level: ToolTrustLevel) => void;
}

/**
 * Tool definition for display
 */
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'terminal' | 'knowledge';
  defaultLevel: ToolTrustLevel;
}

/**
 * All tools that can be configured
 */
const ALL_TOOLS: ToolDefinition[] = [
  {
    id: 'read_file',
    name: 'Read File',
    description: 'Read file contents from the file system',
    category: 'file',
    defaultLevel: 'auto',
  },
  {
    id: 'list_files',
    name: 'List Files',
    description: 'List files in a directory',
    category: 'file',
    defaultLevel: 'auto',
  },
  {
    id: 'read_directory',
    name: 'Read Directory',
    description: 'Read directory structure',
    category: 'file',
    defaultLevel: 'auto',
  },
  {
    id: 'write_file',
    name: 'Write File',
    description: 'Write or modify files',
    category: 'file',
    defaultLevel: 'prompt',
  },
  {
    id: 'create_directory',
    name: 'Create Directory',
    description: 'Create new directories',
    category: 'file',
    defaultLevel: 'prompt',
  },
  {
    id: 'delete_file',
    name: 'Delete File',
    description: 'Delete files from file system',
    category: 'file',
    defaultLevel: 'block',
  },
  {
    id: 'execute_command',
    name: 'Execute Command',
    description: 'Execute shell commands',
    category: 'terminal',
    defaultLevel: 'prompt',
  },
];

/**
 * Workspace types (for Phase 2 - currently placeholder)
 */
const WORKSPACE_TYPES: WorkspaceType[] = ['ide', 'knowledge', 'study', 'notes'];

/**
 * Trust level options for select dropdown
 */
const TRUST_LEVELS: { value: ToolTrustLevel; label: string; color: string }[] = [
  { value: 'auto', label: 'Auto-approve', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
  { value: 'prompt', label: 'Ask First', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  { value: 'block', label: 'Blocked', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
];

/**
 * Workspace Permission Editor Component
 *
 * Provides tabbed interface to edit tool permissions per workspace.
 * Currently uses global permissions (Phase 1), prepared for workspace scoping (Phase 2).
 *
 * @example
 * ```tsx
 * function AgentSettings() {
 *   return (
 *     <WorkspacePermissionEditor
 *       variant="full"
 *       showDescriptions={true}
 *       onChange={(workspace, toolId, level) => {
 *         console.log(`Set ${toolId} to ${level} in ${workspace}`);
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function WorkspacePermissionEditor({
  className,
  variant = 'full',
  showDescriptions = true,
  onChange,
}: WorkspacePermissionEditorProps) {
  const { t } = useTranslation();
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('ide');

  // Get current trust levels from Zustand store
  const trustLevels = useToolPermissionStore((state) => state.trustLevels);
  const setTrustLevel = useToolPermissionStore((state) => state.setTrustLevel);

  /**
   * Group tools by category
   */
  const toolsByCategory = useMemo(() => {
    const groups: Record<string, ToolDefinition[]> = {
      file: [],
      terminal: [],
      knowledge: [],
    };

    for (const tool of ALL_TOOLS) {
      groups[tool.category].push(tool);
    }

    return groups;
  }, []);

  /**
   * Handle trust level change
   */
  const handleLevelChange = (toolId: string, newLevel: ToolTrustLevel) => {
    setTrustLevel(toolId, newLevel);
    onChange?.(activeWorkspace, toolId, newLevel);
  };

  /**
   * Get workspace display name
   */
  const getWorkspaceName = (workspace: WorkspaceType): string => {
    const names: Record<WorkspaceType, string> = {
      ide: 'IDE',
      knowledge: 'Knowledge',
      study: 'Study',
      notes: 'Notes',
    };
    return names[workspace];
  };

  /**
   * Render tool row
   */
  const renderToolRow = (tool: ToolDefinition) => {
    const currentLevel = trustLevels[tool.id] ?? tool.defaultLevel;
    const levelConfig = TRUST_LEVELS.find((level) => level.value === currentLevel);

    return (
      <div
        key={tool.id}
        className={cn(
          'flex items-center justify-between py-3 px-4 border-b',
          'last:border-b-0 hover:bg-muted/50 transition-colors',
          variant === 'compact' && 'py-2 px-2'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{tool.name}</span>
            <Badge
              variant="outline"
              className={cn('text-xs', levelConfig?.color)}
            >
              {currentLevel}
            </Badge>
          </div>
          {showDescriptions && variant === 'full' && (
            <p className="text-xs text-muted-foreground mt-1">
              {tool.description}
            </p>
          )}
        </div>

        <Select
          value={currentLevel}
          onValueChange={(value) => handleLevelChange(tool.id, value as ToolTrustLevel)}
        >
          <SelectTrigger className="w-[140px] h-8" aria-label={`Set ${tool.name} permission`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRUST_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', level.color.replace(/text-\w+-\d+/, 'bg-current'))} />
                  <span>{level.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  /**
   * Render workspace tab content
   */
  const renderWorkspaceTab = (workspace: WorkspaceType) => {
    return (
      <div key={workspace} className="space-y-1">
        {Object.entries(toolsByCategory).map(([category, tools]) => (
          <div key={category} className={variant === 'full' ? 'space-y-1' : 'space-y-0'}>
            {variant === 'full' && (
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {category}
              </div>
            )}
            {tools.map(renderToolRow)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tool Permissions</h3>
          <Badge variant="outline" className="text-xs">
            {ALL_TOOLS.length} tools configured
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure which tools can execute automatically, require approval, or are blocked.
          Permissions are currently global (all workspaces).
        </p>
      </div>

      {/* Workspace Tabs */}
      <Tabs value={activeWorkspace} onValueChange={(value) => setActiveWorkspace(value as WorkspaceType)}>
        <TabsList className="grid w-full grid-cols-4">
          {WORKSPACE_TYPES.map((workspace) => (
            <TabsTrigger key={workspace} value={workspace} className="text-sm">
              {getWorkspaceName(workspace)}
            </TabsTrigger>
          ))}
        </TabsList>

        {WORKSPACE_TYPES.map((workspace) => (
          <TabsContent key={workspace} value={workspace} className="mt-4">
            <div className="border rounded-lg divide-y">
              {renderWorkspaceTab(workspace)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Legend */}
      {variant === 'full' && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground px-2">
          <span>Legend:</span>
          {TRUST_LEVELS.map((level) => (
            <div key={level.value} className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', level.color.replace(/text-\w+-\d+/, 'bg-current'))} />
              <span>{level.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact badge version for quick permission overview
 */
export interface PermissionOverviewBadgeProps {
  className?: string;
}

export function PermissionOverviewBadge({ className }: PermissionOverviewBadgeProps) {
  const trustLevels = useToolPermissionStore((state) => state.trustLevels);

  const counts = useMemo(() => {
    let auto = 0;
    let prompt = 0;
    let block = 0;

    for (const level of Object.values(trustLevels)) {
      if (level === 'auto') auto++;
      else if (level === 'prompt') prompt++;
      else if (level === 'block') block++;
    }

    return { auto, prompt, block };
  }, [trustLevels]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1 text-xs">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-muted-foreground">{counts.auto} Auto</span>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <div className="w-2 h-2 rounded-full bg-yellow-500" />
        <span className="text-muted-foreground">{counts.prompt} Prompt</span>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-muted-foreground">{counts.block} Blocked</span>
      </div>
    </div>
  );
}
