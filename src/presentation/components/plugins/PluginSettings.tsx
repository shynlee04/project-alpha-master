/**
 * Plugin Settings Component
 *
 * Configure plugin permissions, settings, and clear data.
 *
 * @module components/plugins/PluginSettings
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Switch } from '@/presentation/components/ui/switch';
import { usePluginOperations } from '@/hooks/usePlugins';
import type { PluginMetadata, PluginPermission } from '@/lib/plugins/types';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface PluginSettingsProps {
  plugin: PluginMetadata;
}

export function PluginSettings({ plugin }: PluginSettingsProps) {
  const { t } = useTranslation();
  const { isMobile } = useMediaQuery();

  const { grantPermission, revokePermission, clearPluginData } = usePluginOperations();
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(null);

  const handleTogglePermission = async (permission: PluginPermission) => {
    setUpdatingPermission(permission);

    try {
      const permDetail = plugin.permissions.find(p => p.permission === permission);

      if (permDetail?.granted) {
        await revokePermission(plugin.id, permission);
      } else {
        await grantPermission(plugin.id, permission);
      }
    } catch (error) {
      console.error('Failed to toggle permission:', error);
    } finally {
      setUpdatingPermission(null);
    }
  };

  const handleClearData = async () => {
    if (!confirm(t('plugins.settings.confirmClearData', 'Are you sure you want to clear all plugin data?'))) {
      return;
    }

    try {
      await clearPluginData(plugin.id);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  const getPermissionLabel = (permission: PluginPermission): string => {
    return t(`plugins.permissions.${permission}`, permission);
  };

  const getPermissionDescription = (permission: PluginPermission): string => {
    return t(`plugins.permissions.${permission}.description`, '');
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="border-2 border-border rounded-none p-4 bg-secondary">
        <h3 className="font-bold font-mono text-foreground mb-2">{plugin.manifest.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{plugin.manifest.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>v{plugin.manifest.version}</span>
          <span>•</span>
          <span>{plugin.manifest.author}</span>
          <span>•</span>
          <span className="capitalize">{plugin.state}</span>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <h4 className="font-semibold font-mono text-foreground mb-3">
          {t('plugins.settings.permissions', 'Permissions')}
        </h4>
        <div className="space-y-2">
          {plugin.manifest.permissions.map((permission) => {
            const permDetail = plugin.permissions.find(p => p.permission === permission);
            const isGranted = permDetail?.granted || false;

            return (
              <div
                key={permission}
                className="flex items-center justify-between p-3 border-2 border-border rounded-none bg-secondary"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{getPermissionLabel(permission)}</div>
                  <div className="text-sm text-muted-foreground">
                    {getPermissionDescription(permission)}
                  </div>
                </div>
                <Button
                  variant={isGranted ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleTogglePermission(permission)}
                  disabled={updatingPermission === permission}
                  className={cn(
                    'rounded-none gap-2',
                    isMobile && 'min-h-[44px]'
                  )}
                >
                  {isGranted ? (
                    <>
                      <Check />
                      <span>{t('plugins.settings.granted', 'Granted')}</span>
                    </>
                  ) : (
                    <>
                      <X />
                      <span>{t('plugins.settings.denied', 'Denied')}</span>
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div>
        <h4 className="font-semibold font-mono text-foreground mb-3">
          {t('plugins.settings.dataManagement', 'Data Management')}
        </h4>
        <div className="border-2 border-border rounded-none p-4 bg-secondary">
          <p className="text-sm text-muted-foreground mb-4">
            {t('plugins.settings.clearDataDescription', 'Clear all data stored by this plugin. This action cannot be undone.')}
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearData}
            className={cn(
              'rounded-none gap-2',
              isMobile && 'min-h-[44px]'
            )}
          >
            <Trash2 />
            <span>{t('plugins.settings.clearData', 'Clear Data')}</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h4 className="font-semibold font-mono text-foreground mb-3">
          {t('plugins.settings.statistics', 'Statistics')}
        </h4>
        <div className="border-2 border-border rounded-none p-4 bg-secondary">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t('plugins.settings.timesActivated', 'Times Activated')}
              </dt>
              <dd className="font-medium text-foreground">{plugin.stats.timesActivated}</dd>
            </div>
            {plugin.stats.lastActivated && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t('plugins.settings.lastActivated', 'Last Activated')}
                </dt>
                <dd className="font-medium text-foreground">
                  {new Date(plugin.stats.lastActivated).toLocaleString()}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t('plugins.settings.installedAt', 'Installed At')}
              </dt>
              <dd className="font-medium text-foreground">
                {new Date(plugin.installedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Error State */}
      {plugin.state === 'error' && plugin.stats.lastError && (
        <div>
          <h4 className="font-semibold font-mono text-foreground mb-3">
            {t('plugins.settings.lastError', 'Last Error')}
          </h4>
          <div className="border-2 border-destructive rounded-none p-4 bg-destructive/10">
            <p className="text-sm text-destructive">{plugin.stats.lastError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
