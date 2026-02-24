/**
 * @fileoverview ActivityBarRight - Vertical Activity Bar for Right Panel
 * @module presentation/components/layout/ActivityBarRight
 *
 * EPIC-UXUI-04: Three Activity Bar System
 * - Width: 48px (0.5 grid unit)
 * - Orientation: Vertical
 * - Position: Right side
 * - Max 3 plugin icons
 * - Click/tap toggles plugin in PluginPanelRight
 *
 * @story UXUI-04-03
 * @created 2026-01-30
 */

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useActivityBarRight } from '@/presentation/hooks/useActivityBar';
import { usePluginCoordination } from '@/presentation/hooks/usePluginCoordination';
import type { ActivityBarRightProps } from './activity-bar-types';
import { ACTIVITY_BAR_WIDTH, ACTIVITY_BAR_ICON_SIZE } from './activity-bar-types';
import './ActivityBarRight.css';

// ============================================================================
// Default Plugin Configurations
// ============================================================================

import {
  MessageSquare,
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
  filetree: { id: 'filetree', name: 'File Explorer', icon: MessageSquare, shortcut: 'Ctrl+Shift+E' },
  monaco: { id: 'monaco', name: 'Code Editor', icon: MessageSquare, shortcut: 'Ctrl+1' },
  notes: { id: 'notes', name: 'Notes', icon: MessageSquare, shortcut: 'Ctrl+2' },
  terminal: { id: 'terminal', name: 'Terminal', icon: MessageSquare, shortcut: 'Ctrl+`' },
  chat: { id: 'chat', name: 'Chat', icon: MessageSquare, shortcut: 'Ctrl+Shift+C' },
  agents: { id: 'agents', name: 'Agents', icon: MessageSquare, shortcut: 'Ctrl+Shift+A' },
  preview: { id: 'preview', name: 'Preview', icon: MessageSquare, shortcut: 'Ctrl+Shift+V' },
};

// ============================================================================
// ActivityBarRight Component
// ============================================================================

/**
 * ActivityBarRight Component
 *
 * Vertical activity bar (48px width) for the right plugin panel.
 * Displays up to 3 plugin icons with toggle behavior.
 *
 * @param props - ActivityBarRightProps
 * @returns React component
 */
export const ActivityBarRight: React.FC<ActivityBarRightProps> = ({
  className,
  onPluginClick,
}) => {
  const { t } = useTranslation();
  const { plugins, activePluginId, togglePlugin } = useActivityBarRight();

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
      icon: MessageSquare,
    };
  }, []);

  return (
    <div
      className={cn('activity-bar-right', className)}
      style={{ width: ACTIVITY_BAR_WIDTH }}
      role="toolbar"
      aria-label={t('layout.activityBar.right.label', 'Right panel plugins')}
    >
      <div className="activity-bar-right__content">
        {plugins.map((pluginId, index) => {
          const config = getPluginConfig(pluginId);
          const Icon = config.icon;
          const isActive = activePluginId === pluginId;

          return (
            <button
              key={pluginId}
              type="button"
              className={cn(
                'activity-bar-right__item',
                isActive && 'activity-bar-right__item--active'
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
                className="activity-bar-right__icon"
                aria-hidden="true"
              />
              {isActive && (
                <span className="activity-bar-right__indicator" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer to push content to top */}
      <div className="activity-bar-right__spacer" />
    </div>
  );
};

export default ActivityBarRight;
