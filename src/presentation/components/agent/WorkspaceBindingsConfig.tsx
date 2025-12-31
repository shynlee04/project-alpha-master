/**
 * WorkspaceBindingsConfig Component
 * Workspace availability and UI variant configuration
 * Max 120 lines
 */

import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { WorkspaceBinding } from '@/core/entities/Agent';

interface WorkspaceBindingsConfigProps {
  bindings: WorkspaceBinding[];
  onBindingChange: (workspaceType: 'ide' | 'knowledge' | 'study' | 'notes', updates: Partial<WorkspaceBinding>) => void;
  disabled?: boolean;
}

const WORKSPACE_LABELS: Record<string, string> = {
  ide: 'IDE Workspace',
  knowledge: 'Knowledge Workspace',
  study: 'Study Workspace',
  notes: 'Notes Workspace'
};

const UI_VARIANTS: { value: 'full' | 'compact' | 'minimal'; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'compact', label: 'Compact' },
  { value: 'minimal', label: 'Minimal' }
];

export function WorkspaceBindingsConfig({
  bindings,
  onBindingChange,
  disabled = false
}: WorkspaceBindingsConfigProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Workspace Availability</h3>

      <div className="space-y-3">
        {bindings.map((binding) => (
          <div
            key={binding.workspaceType}
            className="flex items-start gap-4 p-3 border rounded-none"
          >
            {/* Workspace Name */}
            <div className="flex-1">
              <div className="text-sm font-medium">
                {WORKSPACE_LABELS[binding.workspaceType]}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {binding.isAvailable ? (
                  <span>Agent available in {binding.workspaceType}</span>
                ) : (
                  <span className="text-muted-foreground/50">Hidden</span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Available Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs">Visible</span>
                <Switch
                  checked={binding.isAvailable}
                  onCheckedChange={(checked) =>
                    onBindingChange(binding.workspaceType, { isAvailable: checked })
                  }
                  disabled={disabled}
                />
              </div>

              {/* Default Indicator */}
              {binding.isDefault && (
                <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-none">
                  Default
                </span>
              )}

              {/* UI Variant Selector */}
              {binding.isAvailable && (
                <Select
                  value={binding.uiVariant}
                  onValueChange={(value: 'full' | 'compact' | 'minimal') =>
                    onBindingChange(binding.workspaceType, { uiVariant: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="w-24 h-8 rounded-none text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {UI_VARIANTS.map((variant) => (
                      <SelectItem key={variant.value} value={variant.value} className="text-xs">
                        {variant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Configure where this agent appears and how it's displayed in each workspace
      </p>
    </div>
  );
}
