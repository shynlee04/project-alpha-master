/**
 * @fileoverview ActivityBarLeft - Vertical Activity Bar for Left Panel
 * @module presentation/components/layout/ActivityBarLeft
 *
 * EPIC-UXUI-04: Three Activity Bar System
 * - Width: 48px (0.5 grid unit)
 * - Orientation: Vertical
 * - Position: Left side, next to GlobalSidebar
 * - Max 3 plugin icons
 * - Click/tap toggles plugin in PluginPanelLeft
 *
 * @story UXUI-04-03
 * @created 2026-01-30
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useActivityBarLeft } from '@/presentation/hooks/useActivityBar';
import type { ActivityBarLeftProps } from './activity-bar-types';
import { ACTIVITY_BAR_WIDTH, ACTIVITY_BAR_ICON_SIZE } from './activity-bar-types';
import './ActivityBarLeft.css';

// ============================================================================
// Default Plugin Configurations
// ============================================================================

import {
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';
import type { PluginId } from '@/domain/types/plugin-types';

interface PluginConfig {
  id: PluginId;
  name: string;
  icon: LucideIcon;
  shortcut?: string;
}

const DEFAULT_PLUGINS: Record<PluginId, PluginConfig> = {
  filetree: { id: 'filetree', name: 'File Explorer', icon: FolderOpen, shortcut: 'Ctrl+Shift+E' },
  monaco: { id: 'monaco', name: 'Code Editor', icon: FolderOpen, shortcut: 'Ctrl+1' },
  notes: { id: 'notes', name: 'Notes', icon: FolderOpen, shortcut: 'Ctrl+2' },
  terminal: { id: 'terminal', name: 'Terminal', icon: FolderOpen, shortcut: 'Ctrl+`' },
  chat: { id: 'chat', name: 'Chat', icon: FolderOpen, shortcut: 'Ctrl+Shift+C' },
  agents: { id: 'agents', name: 'Agents', icon: FolderOpen, shortcut: 'Ctrl+Shift+A' },
  preview: { id: 'preview', name: 'Preview', icon: FolderOpen, shortcut: 'Ctrl+Shift+V' },
};

// ============================================================================
// ActivityBarLeft Component
// ============================================================================

/**
 * ActivityBarLeft Component
 *
 * Vertical activity bar (48px width) for the left plugin panel.
 * Displays up to 3 plugin icons with toggle behavior.
 *
 * @param props - ActivityBarLeftProps
 * @returns React component
 */
export const ActivityBarLeft: React.FC<ActivityBarLeftProps> = ({
  className,
  onPluginClick,
}) => {
  const { t } = useTranslation();
  const { plugins, activePluginId, togglePlugin } = useActivityBarLeft();

  /**
   * Handle plugin icon click
   */
  const handlePluginClick = useCallback(
    (pluginId: PluginId) => {
      togglePlugin(pluginId);
      onPluginClick?.(pluginId);
    },
    [togglePlugin, onPluginClick]
  );

  /**
   * Get plugin configuration
   */
  const getPluginConfig = useCallback((pluginId: PluginId): PluginConfig => {
    return DEFAULT_PLUGINS[pluginId] || {
      id: pluginId,
      name: pluginId,
      icon: FolderOpen,
    };
  }, []);

  return (
    <div
      className={cn('activity-bar-left', className)}
      style={{ width: ACTIVITY_BAR_WIDTH }}
      role="toolbar"
      aria-label={t('layout.activityBar.left.label', 'Left panel plugins')}
    >
      <div className="activity-bar-left__content">
        {plugins.map((pluginId, index) => {
          const config = getPluginConfig(pluginId);
          const Icon = config.icon;
          const isActive = activePluginId === pluginId;

          return (
            <button
              key={pluginId}
              type="button"
              className={cn(
                'activity-bar-left__item',
                isActive && 'activity-bar-left__item--active'
              )}
              onClick={() => handlePluginClick(pluginId)}
              aria-pressed={isActive}
              aria-label={config.name}
              title={`${config.name}${config.shortcut ? ` (${config.shortcut})` : ''}`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Icon
                size={ACTIVITY_BAR_ICON_SIZE}
                className="activity-bar-left__icon"
                aria-hidden="true"
              />
              {isActive && (
                <span className="activity-bar-left__indicator" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer to push content to top */}
      <div className="activity-bar-left__spacer" />
    </div>
  );
};

export default ActivityBarLeft;
