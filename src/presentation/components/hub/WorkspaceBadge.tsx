/**
 * @fileoverview Workspace Badge Component
 * @module presentation/components/hub/WorkspaceBadge
 * @governance Story WB-5: Hub Project Card Enhancement
 *
 * Displays workspace binding badges on project cards.
 * Shows which workspaces a project is bound to (IDE, Notes, Knowledge, Study).
 * Supports two variants: 'badge' (full label) and 'quick-open' (icon-only on hover).
 *
 * @see Research: 8-bit design system, Button component patterns
 */

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { WorkspaceId } from '@/lib/workspace';

// ============================================================================
// Types
// ============================================================================

export interface WorkspaceBadgeProps {
  /** Workspace identifier */
  workspace: WorkspaceId;
  /** Click handler (navigates to workspace) */
  onClick: (e: React.MouseEvent) => void;
  /** Visual variant */
  variant?: 'badge' | 'quick-open';
  /** Additional className */
  className?: string;
}

// ============================================================================
// Workspace Configuration
// ============================================================================

const WORKSPACE_CONFIG: Record<
  WorkspaceId,
  { icon: string; labelKey: string; color: string; isDeferred?: boolean }
> = {
  ide: {
    icon: '💻',
    labelKey: 'hub.workspaceBinding.workspaces.ide',
    color: 'text-info',
  },
  notes: {
    icon: '📝',
    labelKey: 'hub.workspaceBinding.workspaces.notes',
    color: 'text-success',
  },
  knowledge: {
    icon: '📚',
    labelKey: 'hub.workspaceBinding.workspaces.knowledge',
    color: 'text-purple-400',
    isDeferred: true, // DEFERRED (ADR-034)
  },
  study: {
    icon: '🎓',
    labelKey: 'hub.workspaceBinding.workspaces.study',
    color: 'text-warning',
    isDeferred: true, // DEFERRED (ADR-034)
  },
} as const;

// ============================================================================
// CVA Variants
// ============================================================================

const badgeVariants = cva(
  // Base styles
  'inline-flex items-center gap-1.5 rounded-none font-mono text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        badge: 'px-2.5 py-1 bg-muted/40 border border-border/60 hover:bg-muted/60 hover:border-border hover:scale-105 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
        'quick-open': 'w-8 h-8 justify-center bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 hover:scale-110 hover:transition-[150ms] active:scale-95 active:transition-[100ms]',
      },
    },
    defaultVariants: {
      variant: 'badge',
    },
  }
);

// ============================================================================
// Component
// ============================================================================

/**
 * WorkspaceBadge - Display workspace binding on project cards
 *
 * Features:
 * - Shows workspace icon + label (IDE, Notes, Knowledge, Study)
 * - Two variants: 'badge' (full) and 'quick-open' (icon-only)
 * - 8-bit styling with hover effects
 * - i18n integration for workspace labels
 * - Accessibility: ARIA labels, keyboard navigation
 *
 * @example
 * ```tsx
 * <WorkspaceBadge
 *   workspace="ide"
 *   onClick={(e) => {
 *     e.stopPropagation();
 *     navigate({ to: '/ide/$projectId', params: { projectId } });
 *   }}
 * />
 * ```
 */
export const WorkspaceBadge: React.FC<WorkspaceBadgeProps> = ({
  workspace,
  onClick,
  variant = 'badge',
  className,
}) => {
  const { t } = useTranslation();
  const config = WORKSPACE_CONFIG[workspace];

  // DEFERRED (ADR-034): Hide knowledge/study workspaces from UI
  if (config.isDeferred) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(badgeVariants({ variant }), className)}
      aria-label={`Open project in ${workspace} workspace`}
    >
      <span className={cn('text-sm', config.color)}>{config.icon}</span>
      {variant === 'badge' && (
        <span className="text-foreground">
          {t(config.labelKey, config.labelKey.toUpperCase())}
        </span>
      )}
    </button>
  );
};
