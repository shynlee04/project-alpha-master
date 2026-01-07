/**
 * @fileoverview Workspace Switcher Component
 * @module presentation/components/common/WorkspaceSwitcher
 * @governance Story WB-6: Cross-Workspace Navigation
 *
 * Dropdown menu for switching between workspaces (IDE, Notes, Knowledge, Study).
 * Shows workspace icons and highlights current workspace.
 * Integrates with ProjectContext for cross-workspace navigation.
 *
 * @see Research: Radix UI Dropdown Menu, WorkspaceBadge patterns
 */

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';

import { useProjectContextSafe, type WorkspaceId } from '@/lib/workspace';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import { cn } from '@/lib/utils';
import { workspaceTransitionManager } from '@/lib/workspace/workspace-transition-manager';

// ============================================================================
// Workspace Configuration
// ============================================================================

const WORKSPACE_CONFIG: Record<
  WorkspaceId,
  { icon: string; labelKey: string; color: string }
> = {
  ide: {
    icon: '💻',
    labelKey: 'hub.workspaceBinding.workspaces.ide',
    color: 'text-blue-400',
  },
  notes: {
    icon: '📝',
    labelKey: 'hub.workspaceBinding.workspaces.notes',
    color: 'text-green-400',
  },
  knowledge: {
    icon: '📚',
    labelKey: 'hub.workspaceBinding.workspaces.knowledge',
    color: 'text-purple-400',
  },
  study: {
    icon: '🎓',
    labelKey: 'hub.workspaceBinding.workspaces.study',
    color: 'text-amber-400',
  },
};

// ============================================================================
// Component Props
// ============================================================================

export interface WorkspaceSwitcherProps {
  /** Additional className */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * WorkspaceSwitcher - Dropdown menu for workspace switching
 *
 * Features:
 * - Shows current workspace icon + label
 * - Dropdown menu with all enabled workspaces
 * - Checkmark indicator for current workspace
 * - 8-bit styling (bordered, pixel corners)
 * - Desktop only (hidden on mobile)
 * - Integrates with ProjectContext for navigation
 * - FIX-2026-01-05: Safe to render outside ProjectProvider (returns null)
 *
 * @example
 * ```tsx
 * import { WorkspaceSwitcher } from '@/presentation/components/common/WorkspaceSwitcher';
 *
 * function Header() {
 *   return (
 *     <header>
 *       <WorkspaceSwitcher />
 *     </header>
 *   );
 * }
 * ```
 */
export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  className,
}) => {
  const { t } = useTranslation();

  // FIX-2026-01-05: Use safe version that returns null outside ProjectProvider
  const projectContext = useProjectContextSafe();

  // Guard: Not inside ProjectProvider (Hub, About, etc.) - hide component
  if (!projectContext) {
    return null;
  }

  const { currentWorkspace, enabledWorkspaces, switchWorkspace } = projectContext;

  // ============================================================================
  // WB-8.3: Workspace Transition with State Orchestration
  // ============================================================================

  /**
   * Handle workspace switch using WorkspaceTransitionManager
   *
   * Coordinates state updates across all stores:
   * - Workspace store (current workspace)
   * - Agents store (filter by availability)
   * - Agent selection store (re-select if needed)
   * - Cross-workspace event bus (emit events)
   */
  const handleWorkspaceSwitch = async (workspace: WorkspaceType) => {
    console.log('[WorkspaceSwitcher] Switching to workspace:', workspace);

    try {
      // Use WorkspaceTransitionManager for coordinated state updates
      await workspaceTransitionManager.transitionTo(workspace as WorkspaceType);

      // Also call original switchWorkspace for ProjectContext compatibility
      // TODO: Eventually migrate ProjectContext to use WorkspaceTransitionManager
      switchWorkspace(workspace);
    } catch (error) {
      console.error('[WorkspaceSwitcher] Failed to switch workspace:', error);
      // Optionally show error toast to user
    }
  };

  // Guard: Hide if no workspaces enabled (shouldn't happen in practice)
  if (enabledWorkspaces.length === 0) {
    return null;
  }

  // Guard: Show as static text if only one workspace enabled
  if (enabledWorkspaces.length === 1) {
    const config = WORKSPACE_CONFIG[currentWorkspace];

    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-2 border-border/60 font-mono text-sm',
          className
        )}
      >
        <span className={cn('text-base', config.color)}>{config.icon}</span>
        <span className="text-foreground">
          {t(config.labelKey, currentWorkspace.toUpperCase())}
        </span>
      </div>
    );
  }

  const currentConfig = WORKSPACE_CONFIG[currentWorkspace];

  return (
    <DropdownMenu.Root>
      {/* Trigger Button */}
      <DropdownMenu.Trigger
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-2 border-border/60',
          'font-mono text-sm hover:bg-muted/50 hover:border-border transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          'data-[state=open]:bg-muted/50 data-[state=open]:border-border',
          className
        )}
      >
        <span className={cn('text-base', currentConfig.color)}>
          {currentConfig.icon}
        </span>
        <span className="text-foreground">
          {t(currentConfig.labelKey, currentWorkspace.toUpperCase())}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-1" />
      </DropdownMenu.Trigger>

      {/* Dropdown Content */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[200px] bg-background border-2 border-border shadow-pixel z-50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          side="bottom"
          align="start"
        >
          {/* Header: Project Name */}
          <div className="px-3 py-2 border-b-2 border-border/40">
            <p className="text-xs font-pixel text-muted-foreground uppercase tracking-widest">
              {t('workspaceSwitcher.selectWorkspace', 'SELECT_WORKSPACE')}
            </p>
          </div>

          {/* Workspace Items */}
          {enabledWorkspaces.map((workspace) => {
            const config = WORKSPACE_CONFIG[workspace];
            const isActive = workspace === currentWorkspace;

            return (
              <DropdownMenu.Item
                key={workspace}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 font-mono text-sm',
                  'hover:bg-primary/10 focus:bg-primary/10 focus:outline-none',
                  'cursor-pointer transition-colors',
                  isActive && 'bg-primary/10'
                )}
                onClick={() => handleWorkspaceSwitch(workspace)}
              >
                {/* Workspace Icon */}
                <span className={cn('text-base', config.color)}>
                  {config.icon}
                </span>

                {/* Workspace Label */}
                <span className={cn(
                  'flex-1',
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {t(config.labelKey, workspace.toUpperCase())}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <span className="text-xs text-primary">✓</span>
                )}
              </DropdownMenu.Item>
            );
          })}

          {/* Footer Hint */}
          <div className="px-3 py-2 border-t-2 border-border/40">
            <p className="text-[10px] font-mono text-muted-foreground">
              {t('workspaceSwitcher.lastWorkspacePersisted', 'PREFERENCE_SAVED')}
            </p>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
