/**
 * Plugin Manager Component
 *
 * Display installed plugins with activation controls.
 *
 * @module components/plugins/PluginManager
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Power, Trash2, Package } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { usePluginOperations } from '@/hooks/usePlugins';
import type { PluginMetadata } from '@/lib/plugins/types';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { BREAKPOINTS } from '@/hooks/useMediaQuery';

export function PluginManager() {
  const { t } = useTranslation();
  // const isMobile = useMediaQuery(BREAKPOINTS.mobile); // TODO: For responsive layout

  const { plugins, isLoading, deactivatePlugin, activatePlugin, uninstallPlugin } = usePluginOperations();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleToggleActivation = async (plugin: PluginMetadata) => {
    setActionInProgress(plugin.id);

    try {
      if (plugin.state === 'activated') {
        await deactivatePlugin(plugin.id);
      } else {
        await activatePlugin(plugin.id);
      }
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    if (!confirm(t('plugins.manager.confirmUninstall', 'Are you sure you want to uninstall this plugin?'))) {
      return;
    }

    setActionInProgress(pluginId);

    try {
      await uninstallPlugin(pluginId);
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (plugins.length === 0) {
    return (
      <div className="text-center p-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          {t('plugins.manager.noPlugins', 'No plugins installed')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plugins.map((plugin) => (
        <PluginListItem
          key={plugin.id}
          plugin={plugin}
          isProcessing={actionInProgress === plugin.id}
          onToggleActivation={() => handleToggleActivation(plugin)}
          onUninstall={() => handleUninstall(plugin.id)}
        />
      ))}
    </div>
  );
}

interface PluginListItemProps {
  plugin: PluginMetadata;
  isProcessing: boolean;
  onToggleActivation: () => void;
  onUninstall: () => void;
}

function PluginListItem({ plugin, isProcessing, onToggleActivation, onUninstall }: PluginListItemProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);

  const isActivated = plugin.state === 'activated';
  const canActivate = plugin.state === 'installed' || plugin.state === 'loaded' || plugin.state === 'deactivated';

  return (
    <div className={cn(
      'border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] bg-secondary p-4',
      isActivated && 'border-primary'
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        {plugin.manifest.icon ? (
          <img src={plugin.manifest.icon} alt={plugin.manifest.name} className="w-12 h-12 rounded-none border-2 border-border flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl rounded-none flex-shrink-0">
            {plugin.manifest.name.charAt(0)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold font-mono text-foreground">{plugin.manifest.name}</h3>
            <span className="text-xs text-muted-foreground">v{plugin.manifest.version}</span>
            {plugin.source === 'builtin' && (
              <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground border border-primary">
                {t('plugins.manager.builtin', 'Built-in')}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {plugin.manifest.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{plugin.manifest.author}</span>
            <span>•</span>
            <span className={cn(
              'capitalize',
              isActivated ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {plugin.state}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className={cn(
          'flex flex-col gap-2',
          isMobile ? 'flex-row' : ''
        )}>
          <Button
            variant={isActivated ? 'secondary' : 'primary'}
            size="sm"
            onClick={onToggleActivation}
            disabled={!canActivate || isProcessing}
            className={cn(
              'rounded-none gap-2',
              isMobile && 'min-h-[44px]'
            )}
          >
            <Power />
            <span className={cn(isMobile && 'sr-only')}>
              {isActivated
                ? t('plugins.manager.deactivate', 'Deactivate')
                : t('plugins.manager.activate', 'Activate')}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUninstall}
            disabled={isProcessing || plugin.source === 'builtin'}
            className={cn(
              'rounded-none gap-2',
              isMobile && 'min-h-[44px]'
            )}
          >
            <Trash2 />
            <span className={cn(isMobile && 'sr-only')}>
              {t('plugins.manager.uninstall', 'Uninstall')}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
