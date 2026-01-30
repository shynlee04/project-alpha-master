/**
 * @fileoverview PluginPanelContainer - Shared container for all plugin panels
 * @module presentation/components/layout/PluginPanelContainer
 *
 * EPIC-UXUI-04: Plugin Panel System
 * EPIC-UXUI-04-08: Plugin Coordination Integration
 * - Manages plugin rendering and state preservation
 * - Handles transitions between plugins
 * - Provides empty state when no plugin is active
 * - Integrates with PluginCoordinationContext for write locks
 *
 * @story UXUI-04-05, UXUI-04-08
 * @created 2026-01-30
 */

import React, { useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { PluginId } from '@/domain/types/plugin-types';
import type {
  PluginPanelPosition,
  PluginPanelContainerProps,
} from './plugin-panel-types';
import { PANEL_WIDTHS, DEFAULT_EMPTY_STATES } from './plugin-panel-types';
import { usePluginPanel } from '@/presentation/hooks/usePluginPanel';
import { usePluginCoordination } from '@/presentation/hooks/usePluginCoordination';
import { WriteLockIndicator } from './WriteLockIndicator';
import { PLUGIN_COMPONENTS } from './plugin-placeholders';
import './PluginPanelContainer.css';

// ============================================================================
// Empty State Component
// ============================================================================

/**
 * EmptyState Component
 *
 * Displays when no plugin is active in the panel.
 */
interface EmptyStateProps {
  position: PluginPanelPosition;
}

const EmptyState: React.FC<EmptyStateProps> = ({ position }) => {
  const { t } = useTranslation();
  const config = DEFAULT_EMPTY_STATES[position];

  return (
    <div className="plugin-panel-empty" role="status" aria-live="polite">
      <span className="plugin-panel-empty__icon" aria-hidden="true">
        {config.icon}
      </span>
      <span className="plugin-panel-empty__message">
        {t(`layout.pluginPanel.${position}.empty`, config.message)}
      </span>
      <span className="plugin-panel-empty__hint">
        {t(`layout.pluginPanel.${position}.hint`, config.hint)}
      </span>
    </div>
  );
};

// ============================================================================
// Plugin Instance Component
// ============================================================================

/**
 * PluginInstance Component
 *
 * Renders a single plugin instance with visibility control.
 * Uses CSS to show/hide instead of unmounting to preserve state.
 */
interface PluginInstanceProps {
  pluginId: PluginId;
  isActive: boolean;
}

const PluginInstance: React.FC<PluginInstanceProps> = ({ pluginId, isActive }) => {
  const Component = useMemo(() => {
    return PLUGIN_COMPONENTS[pluginId] || (() => null);
  }, [pluginId]);

  return (
    <div
      className={cn('plugin-panel__instance', isActive && 'plugin-panel__instance--active')}
      aria-hidden={!isActive}
      role="tabpanel"
      aria-expanded={isActive}
    >
      <Component />
    </div>
  );
};

// ============================================================================
// Main Container Component
// ============================================================================

/**
 * PluginPanelContainer Component
 *
 * Shared container for all plugin panels (left, main, right).
 * Manages plugin rendering, state preservation, and transitions.
 *
 * @example
 * ```tsx
 * // Left panel (2 grid units)
 * <PluginPanelContainer position="left" />
 *
 * // Main panel (4 grid units)
 * <PluginPanelContainer position="main" />
 *
 * // Right panel (2.5 grid units)
 * <PluginPanelContainer position="right" />
 * ```
 */
export const PluginPanelContainer: React.FC<PluginPanelContainerProps> = ({
  position,
  className,
  children,
}) => {
  const { t } = useTranslation();
  const { activePluginId, plugins, hasPlugins, isActive } = usePluginPanel(position);

  // EPIC-UXUI-04-08: Plugin Coordination Integration
  const {
    activeDocument,
    writeLockHolder,
    registerPlugin,
    unregisterPlugin,
  } = usePluginCoordination();

  // Register active plugin with coordination layer
  useEffect(() => {
    if (activePluginId) {
      registerPlugin(activePluginId);

      return () => {
        unregisterPlugin(activePluginId);
      };
    }
  }, [activePluginId, registerPlugin, unregisterPlugin]);

  // Get panel width for CSS grid
  const panelWidth = PANEL_WIDTHS[position];

  // Generate panel class name based on position
  const panelClassName = cn(
    'plugin-panel',
    `plugin-panel--${position}`,
    isActive && 'plugin-panel--has-active',
    !hasPlugins && 'plugin-panel--empty',
    className
  );

  // Check if active document is locked by current plugin
  const isOwnLock = activePluginId && writeLockHolder === activePluginId;
  const isLockedByOther = activePluginId && writeLockHolder && writeLockHolder !== activePluginId;

  return (
    <div
      className={panelClassName}
      style={{ flex: panelWidth }}
      role="region"
      aria-label={t(`layout.pluginPanel.${position}.label`, `${position} panel`)}
    >
      {/* EPIC-UXUI-04-08: Write Lock Indicator */}
      {activeDocument && (isOwnLock || isLockedByOther) && (
        <div className="plugin-panel__lock-indicator">
          <WriteLockIndicator
            fileId={activeDocument.path}
            lockedBy={writeLockHolder}
            isOwnLock={!!isOwnLock}
            size="small"
          />
        </div>
      )}

      {/* Plugin instances - all rendered but only active one is visible */}
      <div className="plugin-panel__content">
        {hasPlugins ? (
          plugins.map((pluginId) => (
            <PluginInstance
              key={pluginId}
              pluginId={pluginId}
              isActive={activePluginId === pluginId}
            />
          ))
        ) : (
          <EmptyState position={position} />
        )}

        {/* If has plugins but none active, show empty state */}
        {hasPlugins && !isActive && <EmptyState position={position} />}
      </div>

      {/* Additional children (if any) */}
      {children}
    </div>
  );
};

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * PluginPanelLeft Component
 *
 * Pre-configured left panel (2 grid units)
 */
export const PluginPanelLeft: React.FC<Omit<PluginPanelContainerProps, 'position'>> = (props) => (
  <PluginPanelContainer {...props} position="left" />
);

/**
 * PluginPanelMain Component
 *
 * Pre-configured main panel (4 grid units)
 */
export const PluginPanelMain: React.FC<Omit<PluginPanelContainerProps, 'position'>> = (props) => (
  <PluginPanelContainer {...props} position="main" />
);

/**
 * PluginPanelRight Component
 *
 * Pre-configured right panel (2.5 grid units)
 */
export const PluginPanelRight: React.FC<Omit<PluginPanelContainerProps, 'position'>> = (props) => (
  <PluginPanelContainer {...props} position="right" />
);

export default PluginPanelContainer;
