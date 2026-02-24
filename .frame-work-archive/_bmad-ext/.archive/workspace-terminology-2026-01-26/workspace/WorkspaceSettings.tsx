/**
 * Workspace Settings Component
 *
 * Allows users to configure workspace-specific preferences including
 * the preferred AI provider for each workspace.
 *
 * @story PRV-04 - Workspace-scoped Provider Preferences
 * @epic EPIC-PRV-UI - Provider Frontend Integration
 */

import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import {
  useWorkspaceProviderStore,
  useWorkspaceProviderPreference,
} from '@/infrastructure/persistence/stores/workspace/workspace-provider-slice';
import { useProviderStore } from '@/infrastructure/persistence/stores/use-app-store';
import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types';
import { WORKSPACES } from '@/infrastructure/persistence/stores/workspace/workspace-types';

/**
 * Workspace Settings Props
 */
interface WorkspaceSettingsProps {
  /** Currently active workspace (optional, defaults to all workspaces) */
  activeWorkspace?: WorkspaceType;
}

/**
 * Workspace Settings Component
 *
 * Displays provider preferences for each workspace. Users can:
 * - Select a preferred provider for each workspace
 * - Clear workspace preference to use global default
 * - Enable strict mode (no fallback if preferred lacks key)
 */
export function WorkspaceSettings({ activeWorkspace }: WorkspaceSettingsProps) {
  const { t } = useTranslation();
  const { providers } = useProviderStore();

  const { workspaceProviders, resetAll } = useWorkspaceProviderStore(
    useShallow((state) => ({
      workspaceProviders: state.workspaceProviders,
      resetAll: state.resetAllWorkspaceProviders,
    }))
  );

  // Filter to show only active workspace or all workspaces
  const workspacesToShow = activeWorkspace
    ? [activeWorkspace]
    : (Object.keys(WORKSPACES) as WorkspaceType[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t('workspace.provider.title', 'Workspace Provider Settings')}
        </h2>
        {!activeWorkspace && (
          <button
            onClick={resetAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('workspace.provider.resetAll', 'Reset All')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {workspacesToShow.map((workspace) => (
          <WorkspaceProviderRow
            key={workspace}
            workspace={workspace}
            providers={providers}
            preference={workspaceProviders[workspace]}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual workspace provider row
 */
interface WorkspaceProviderRowProps {
  workspace: WorkspaceType;
  providers: Array<{ id: string; name: string; hasApiKey: boolean }>;
  preference: {
    preferredProviderId: string | null;
    strictMode: boolean;
  };
}

function WorkspaceProviderRow({
  workspace,
  providers,
  preference,
}: WorkspaceProviderRowProps) {
  const { t } = useTranslation();
  const { setProviderId, setStrictMode, clearPreference } =
    useWorkspaceProviderPreference(workspace);

  const workspaceMeta = WORKSPACES[workspace];
  const selectedProvider = preference.preferredProviderId;

  return (
    <div className="border border-border rounded-none p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{workspaceMeta.icon}</span>
        <div className="flex-1">
          <h3 className="font-medium">{workspaceMeta.label}</h3>
          <p className="text-xs text-muted-foreground">{workspaceMeta.description}</p>
        </div>
      </div>

      {/* Provider Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t('workspace.provider.preferred', 'Preferred Provider')}
        </label>
        <select
          value={selectedProvider ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            setProviderId(value || null);
          }}
          className="w-full border border-border rounded-none bg-background px-3 py-2 text-sm"
        >
          <option value="">
            {t('workspace.provider.useGlobal', 'Use Global Default')}
          </option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
              {!provider.hasApiKey && ` (${t('workspace.provider.noKey', 'No key')})`}
            </option>
          ))}
        </select>
      </div>

      {/* Strict Mode Toggle */}
      {selectedProvider && (
        <div className="flex items-center justify-between">
          <label className="text-sm" htmlFor={`strict-${workspace}`}>
            {t('workspace.provider.strictMode', 'Strict Mode')}
            <span className="text-xs text-muted-foreground block">
              {t('workspace.provider.strictModeDesc', 'Only use this provider, no fallback')}
            </span>
          </label>
          <input
            id={`strict-${workspace}`}
            type="checkbox"
            checked={preference.strictMode}
            onChange={(e) => setStrictMode(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
      )}

      {/* Clear Button */}
      {selectedProvider && (
        <button
          onClick={() => clearPreference()}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          {t('workspace.provider.clear', 'Clear Preference')}
        </button>
      )}
    </div>
  );
}
