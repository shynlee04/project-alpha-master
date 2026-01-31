/**
 * @fileoverview Workspace Checkbox Item
 * @module spike/components/hub/WorkspaceCheckboxItem
 * @created 2026-01-02T22:40:00+07:00
 *
 * Reusable checkbox item for workspace selection.
 * Displays workspace icon, label, and checkbox with hover effects.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { cn } from '@/spike/lib/utils';
import type { WorkspaceCheckboxItemProps } from './WorkspaceBindingDialog.types';

/**
 * Checkbox item for workspace selection.
 *
 * Features:
 * - Workspace icon and localized label
 * - Hover effects with primary color
 * - ARIA labels for accessibility
 * - Disabled state support
 *
 * @example
 * ```tsx
 * <WorkspaceCheckboxItem
 *   workspace={{ id: 'ide', icon: '💻', labelKey: 'hub.workspaceBinding.workspaces.ide' }}
 *   checked={true}
 *   onCheckedChange={(checked) => handleToggle('ide', checked)}
 * />
 * ```
 */
export const WorkspaceCheckboxItem: React.FC<WorkspaceCheckboxItemProps> = ({
  workspace,
  checked,
  onCheckedChange,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <Checkbox.Root
        id={`workspace-${workspace.id}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "h-5 w-5 shrink-0 rounded-sm border-2 border-primary/20",
          "hover:border-primary/40 transition-colors",
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <Checkbox.Indicator className="flex items-center justify-center">
          <Check className="h-3.5 w-3.5" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label
        htmlFor={`workspace-${workspace.id}`}
        className={cn(
          "flex items-center gap-2 text-sm font-mono cursor-pointer",
          "group-hover:text-primary transition-colors",
          checked ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="text-base">{workspace.icon}</span>
        <span>{t(workspace.labelKey, workspace.id.toUpperCase())}</span>
      </label>
    </div>
  );
};