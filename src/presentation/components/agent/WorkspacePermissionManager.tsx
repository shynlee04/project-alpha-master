/**
 * @fileoverview Workspace Permission Manager Component
 * @module presentation/components/agent/WorkspacePermissionManager
 * @governance Architectural Specification v3.0
 *
 * UI component for configuring agent workspace bindings and tool permissions.
 * Addresses gaps G-002 (workspacePermissions) and G-003 (workspaceBindings).
 */

import { useState, useEffect } from 'react';
import { Check, X, Globe, BookOpen, GraduationCap, Layout } from 'lucide-react';
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import { WorkspaceTypeUtils } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';
import type { AgentToolBindingProps } from '@/domain/value-objects/tool-permission';

/**
 * Workspace icon mapping
 */
const WORKSPACE_ICONS: Record<WorkspaceType, React.ReactNode> = {
  ide: <Globe className="w-4 h-4" />,
  knowledge: <BookOpen className="w-4 h-4" />,
  study: <GraduationCap className="w-4 h-4" />,
  notes: <Layout className="w-4 h-4" />,
};

/**
 * Workspace display names
 */
const WORKSPACE_NAMES: Record<WorkspaceType, string> = {
  ide: 'IDE Workspace',
  knowledge: 'Knowledge Workspace',
  study: 'Study Workspace',
  notes: 'Notes Workspace',
};

/**
 * Props for WorkspacePermissionManager
 */
export interface WorkspacePermissionManagerProps {
  agentId: string | null;
}

/**
 * Workspace Permission Manager Component
 *
 * Provides UI for:
 * - Configuring workspace availability (workspace bindings)
 * - Setting workspace-specific tool permissions
 * - Managing default agent per workspace
 *
 * @example
 * ```tsx
 * <WorkspacePermissionManager agentId="agent-123" />
 * ```
 */
export function WorkspacePermissionManager({ agentId }: WorkspacePermissionManagerProps) {
  const agent = useAgentsStore((state) =>
    agentId ? state.getAgent(agentId) : null
  );

  const [localBindings, setLocalBindings] = useState<WorkspaceBindingProps[]>([]);
  const [localTools, setLocalTools] = useState<AgentToolBindingProps[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with agent from store
  useEffect(() => {
    if (agent) {
      setLocalBindings(agent.workspaceBindings);
      setLocalTools(agent.tools);
      setHasChanges(false);
    }
  }, [agent]);

  /**
   * Update workspace availability
   */
  const updateWorkspaceAvailability = (
    workspaceType: WorkspaceType,
    isAvailable: boolean
  ) => {
    const updatedBindings = localBindings.map((binding) =>
      binding.workspaceType === workspaceType
        ? { ...binding, isAvailable }
        : binding
    );

    setLocalBindings(updatedBindings);
    setHasChanges(true);
  };

  /**
   * Update UI variant for workspace
   */
  const updateUIVariant = (
    workspaceType: WorkspaceType,
    uiVariant: 'full' | 'compact' | 'minimal'
  ) => {
    const updatedBindings = localBindings.map((binding) =>
      binding.workspaceType === workspaceType
        ? { ...binding, uiVariant }
        : binding
    );

    setLocalBindings(updatedBindings);
    setHasChanges(true);
  };

  /**
   * Toggle default agent for workspace
   */
  const toggleDefaultAgent = (workspaceType: WorkspaceType) => {
    const updatedBindings = localBindings.map((binding) => {
      // Unset default for all other workspaces
      if (binding.workspaceType === workspaceType) {
        return { ...binding, isDefault: !binding.isDefault };
      }
      // Ensure only one default agent per workspace
      if (binding.isDefault && binding.workspaceType !== workspaceType) {
        return { ...binding, isDefault: false };
      }
      return binding;
    });

    setLocalBindings(updatedBindings);
    setHasChanges(true);
  };

  /**
   * Toggle tool permission for workspace
   */
  const toggleToolPermission = (
    toolId: string,
    workspaceType: WorkspaceType,
    permitted: boolean
  ) => {
    const updatedTools = localTools.map((tool) =>
      tool.toolId === toolId
        ? {
            ...tool,
            workspacePermissions: {
              ...tool.workspacePermissions,
              [workspaceType]: permitted
            }
          }
        : tool
    );

    setLocalTools(updatedTools);
    setHasChanges(true);
  };

  /**
   * Save changes to store
   */
  const saveChanges = () => {
    if (!agent) return;

    useAgentsStore.getState().updateAgent(agent.id, {
      workspaceBindings: localBindings,
      tools: localTools,
    });

    setHasChanges(false);
  };

  /**
   * Reset changes to agent state
   */
  const resetChanges = () => {
    if (!agent) return;

    setLocalBindings(agent.workspaceBindings);
    setLocalTools(agent.tools);
    setHasChanges(false);
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No agent selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workspace Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Configure where {agent.name} is available and what tools it can use
          </p>
        </div>

        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={resetChanges}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted"
            >
              Reset
            </button>
            <button
              onClick={saveChanges}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Workspace Bindings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Workspace Availability</h4>

        <div className="grid gap-4">
          {WorkspaceTypeUtils.all().map((workspaceType) => {
            const binding = localBindings.find((b) => b.workspaceType === workspaceType);

            if (!binding) return null;

            return (
              <div
                key={workspaceType}
                className="flex items-center justify-between p-4 border rounded-none"
              >
                <div className="flex items-center gap-3">
                  {WORKSPACE_ICONS[workspaceType]}
                  <div>
                    <p className="font-medium">{WORKSPACE_NAMES[workspaceType]}</p>
                    <p className="text-sm text-muted-foreground">
                      {binding.isAvailable ? (
                        <span className="text-green-500">Available</span>
                      ) : (
                        <span className="text-red-500">Not Available</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* UI Variant Selector */}
                  {binding.isAvailable && (
                    <select
                      value={binding.uiVariant}
                      onChange={(e) =>
                        updateUIVariant(
                          workspaceType,
                          e.target.value as 'full' | 'compact' | 'minimal'
                        )
                      }
                      className="px-2 py-1 text-sm border rounded-none"
                    >
                      <option value="full">Full UI</option>
                      <option value="compact">Compact UI</option>
                      <option value="minimal">Minimal UI</option>
                    </select>
                  )}

                  {/* Default Toggle */}
                  <button
                    onClick={() => toggleDefaultAgent(workspaceType)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-none border ${
                      binding.isDefault
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {binding.isDefault ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Default
                  </button>

                  {/* Availability Toggle */}
                  <button
                    onClick={() =>
                      updateWorkspaceAvailability(workspaceType, !binding.isAvailable)
                    }
                    className={`px-3 py-1.5 text-sm rounded border ${
                      binding.isAvailable
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-red-500 text-white border-red-500'
                    }`}
                  >
                    {binding.isAvailable ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tool Permissions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Tool Permissions</h4>

        <div className="border rounded-none divide-y">
          {localTools.map((tool) => {
            if (!tool.isEnabled) return null;

            return (
              <div key={tool.toolId} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{tool.toolName}</p>
                    <p className="text-xs text-muted-foreground">{tool.toolId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {WorkspaceTypeUtils.all().map((workspaceType) => {
                    const binding = localBindings.find((b) => b.workspaceType === workspaceType);
                    const permitted = tool.workspacePermissions[workspaceType] ?? false;

                    return (
                      <button
                        key={workspaceType}
                        onClick={() => toggleToolPermission(tool.toolId, workspaceType, !permitted)}
                        disabled={!binding?.isAvailable}
                        className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-none border transition-colors ${
                          !binding?.isAvailable
                            ? 'opacity-50 cursor-not-allowed bg-muted'
                            : permitted
                            ? 'bg-green-500 text-white border-green-500'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {WORKSPACE_ICONS[workspaceType]}
                        {permitted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
