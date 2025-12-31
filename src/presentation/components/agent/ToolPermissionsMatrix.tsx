/**
 * ToolPermissionsMatrix Component
 * Workspace-specific tool permissions configuration
 * Max 120 lines
 */

import { Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { AgentToolBinding } from '@/core/entities/Agent';

interface ToolPermissionsMatrixProps {
  tools: AgentToolBinding[];
  onToolToggle: (toolId: string, workspace: 'ide' | 'knowledge' | 'study' | 'notes') => void;
  onEnabledToggle: (toolId: string) => void;
  disabled?: boolean;
}

const WORKSPACES: { key: 'ide' | 'knowledge' | 'study' | 'notes'; label: string }[] = [
  { key: 'ide', label: 'IDE' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'study', label: 'Study' },
  { key: 'notes', label: 'Notes' }
];

export function ToolPermissionsMatrix({
  tools,
  onToolToggle,
  onEnabledToggle,
  disabled = false
}: ToolPermissionsMatrixProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Tool Permissions</h3>

      <div className="border rounded-none">
        {/* Header Row */}
        <div className="grid grid-cols-[2fr_1fr_repeat(4,1fr)] gap-2 p-3 border-b bg-muted/50">
          <div className="text-sm font-medium">Tool</div>
          <div className="text-sm font-medium text-center">Enabled</div>
          {WORKSPACES.map((ws) => (
            <div key={ws.key} className="text-sm font-medium text-center">
              {ws.label}
            </div>
          ))}
        </div>

        {/* Tool Rows */}
        {tools.map((tool) => (
          <div
            key={tool.toolId}
            className="grid grid-cols-[2fr_1fr_repeat(4,1fr)] gap-2 p-3 border-b last:border-b-0 items-center"
          >
            {/* Tool Name */}
            <div className="text-sm">{tool.toolName}</div>

            {/* Enabled Toggle */}
            <div className="flex justify-center">
              <Switch
                checked={tool.isEnabled}
                onCheckedChange={() => onEnabledToggle(tool.toolId)}
                disabled={disabled}
              />
            </div>

            {/* Workspace Toggles */}
            {WORKSPACES.map((ws) => (
              <div key={ws.key} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => onToolToggle(tool.toolId, ws.key)}
                  disabled={disabled || !tool.isEnabled}
                  className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Toggle ${tool.toolName} in ${ws.label}`}
                >
                  {tool.workspacePermissions[ws.key] ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Toggle workspace permissions to control where each tool can be used
      </p>
    </div>
  );
}
