/**
 * @fileoverview ActivityBarMainTop - Horizontal Activity Bar for Main Content
 * @module presentation/components/layout/ActivityBarMainTop
 *
 * EPIC-UXUI-04: Three Activity Bar System
 * - Width: Full main area width (4 grid units)
 * - Orientation: Horizontal
 * - Position: Above main content area
 * - Max 3 plugin icons
 * - Click/tap toggles plugin in PluginPanelMain
 * - Default plugin: Notes
 *
 * @story UXUI-04-03
 * @created 2026-01-30
 */

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useActivityBarMainTop } from '@/presentation/hooks/useActivityBar';
import { usePluginCoordination } from '@/presentation/hooks/usePluginCoordination';
import type { ActivityBarMainTopProps } from './activity-bar-types';
import { ACTIVITY_BAR_HEIGHT, ACTIVITY_BAR_ICON_SIZE } from './activity-bar-types';
import './ActivityBarMainTop.css';

// ============================================================================
// Default Plugin Configurations
// ============================================================================

import {
  FileText,
  Code,
  Eye,
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
  filetree: { id: 'filetree', name: 'File Explorer', icon: FileText, shortcut: 'Ctrl+Shift+E' },
  monaco: { id: 'monaco', name: 'Code Editor', icon: Code, shortcut: 'Ctrl+1' },
  notes: { id: 'notes', name: 'Notes', icon: FileText, shortcut: 'Ctrl+2' },
  terminal: { id: 'terminal', name: 'Terminal', icon: Code, shortcut: 'Ctrl+`' },
  chat: { id: 'chat', name: 'Chat', icon: FileText, shortcut: 'Ctrl+Shift+C' },
  agents: { id: 'agents', name: 'Agents', icon: Code, shortcut: 'Ctrl+Shift+A' },
  preview: { id: 'preview', name: 'Preview', icon: Eye, shortcut: 'Ctrl+Shift+V' },
};

// ============================================================================
// ActivityBarMainTop Component
// ============================================================================

/**
 * ActivityBarMainTop Component
 *
 * Horizontal activity bar (48px height) above the main content area.
 * Displays up to 3 plugin icons with toggle behavior.
 *
 * @param props - ActivityBarMainTopProps
 * @returns React component
 */
export const ActivityBarMainTop: React.FC<ActivityBarMainTopProps> = ({
  className,
  onPluginClick,
}) => {
  const { t } = useTranslation();
  const { plugins, activePluginId, togglePlugin } = useActivityBarMainTop();

  // EPIC-UXUI-04-08: Plugin Coordination Integration
  const { registerPlugin, unregisterPlugin } = usePluginCoordination();

  // Notify coordination layer when active plugin changes
  useEffect(() => {
    if (activePluginId) {
      registerPlugin(activePluginId);

      return () => {
        unregisterPlugin(activePluginId);
      };
    }
  }, [activePluginId, registerPlugin, unregisterPlugin]);

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
      icon: FileText,
    };
  }, []);

  return (
    <div
      className={cn('activity-bar-main-top', className)}
      style={{ height: ACTIVITY_BAR_HEIGHT }}
      role="toolbar"
      aria-label={t('layout.activityBar.mainTop.label', 'Main content plugins')}
    >
      <div className="activity-bar-main-top__content">
        {plugins.map((pluginId, index) => {
          const config = getPluginConfig(pluginId);
          const Icon = config.icon;
          const isActive = activePluginId === pluginId;

          return (
            <button
              key={pluginId}
              type="button"
              className={cn(
                'activity-bar-main-top__item',
                isActive && 'activity-bar-main-top__item--active'
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
                className="activity-bar-main-top__icon"
                aria-hidden="true"
              />
              <span className="activity-bar-main-top__label">
                {config.name}
              </span>
              {isActive && (
                <span className="activity-bar-main-top__indicator" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityBarMainTop;
