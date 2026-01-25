/**
 * @fileoverview PluginToolbar - Toggle toolbar for plugin selection
 * @module presentation/components/layout/PluginToolbar
 *
 * **CC-AR-04**: Toggle-Based Layout System
 *
 * Provides icon-based toggle buttons for activating/deactivating plugins.
 * Replaces problematic drag-drop UI with simple toggle controls.
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-04
 * @team Team A
 * @created 2026-01-26
 */

import { useTranslation } from 'react-i18next';
import { Layers, Grid2x2, Grid3x3, LayoutPanelTop, Columns } from 'lucide-react';

import type { PluginId } from '@/domain/types/plugin-types';
import type { LayoutMode } from '@/presentation/layouts/PluginLayoutStore';
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';

// ============================================================================
// Props Interfaces
// ============================================================================

/**
 * PluginToolbar Props
 *
 * @remarks
 * Props for the main toolbar component:
 * - activePlugins: Currently active plugin IDs
 * - availablePlugins: List of plugins that can be toggled
 * - layoutMode: Current layout mode
 * - onTogglePlugin: Handler for toggling plugins on/off
 * - onSetLayoutMode: Handler for changing layout mode
 */
interface PluginToolbarProps {
  /** Currently active plugin IDs */
  activePlugins: PluginId[];

  /** Available plugins for toggling */
  availablePlugins: { id: PluginId; name: string; icon: React.ReactNode }[];

  /** Current layout mode */
  layoutMode: LayoutMode;

  /** Handler for plugin toggle */
  onTogglePlugin: (pluginId: PluginId) => void;

  /** Handler for layout mode change */
  onSetLayoutMode: (mode: LayoutMode) => void;
}

// ============================================================================
// PluginToggleButton Component
// ============================================================================

/**
 * Plugin Toggle Button Component
 *
 * @remarks
 * Individual toggle button for a plugin:
 * - Blue background when active
 * - Muted background when inactive
 * - 8-bit design: sharp corners, no rounded edges
 */
function PluginToggleButton({
  pluginId,
  isActive,
  onToggle,
}: {
  pluginId: PluginId;
  isActive: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const plugin = getPlugin(pluginId);

  if (!plugin) return null;

  return (
    <button
      onClick={onToggle}
      className={`
        px-2 py-1 text-xs flex items-center gap-1 transition-colors
        border border-border
        ${isActive
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-background text-muted-foreground hover:bg-muted'
        }
      `}
      style={{ borderRadius: 0 }}
      title={isActive ? t('plugin.clickToRemove') : t('plugin.clickToAdd')}
      aria-pressed={isActive}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {plugin.icon}
      </span>
      <span className="hidden sm:inline">{plugin.name}</span>
    </button>
  );
}

// ============================================================================
// LayoutModeButton Component
// ============================================================================

/**
 * Layout Mode Button Component
 *
 * @remarks
 * Individual button for selecting layout mode:
 * - Blue background when active
 * - Muted background when inactive
 * - 8-bit design: sharp corners, no rounded edges
 */
function LayoutModeButton({
  mode,
  currentMode,
  icon,
  label,
  onClick,
}: {
  mode: LayoutMode;
  currentMode: LayoutMode;
  icon: React.ReactNode;
  label: string;
  onClick: (mode: LayoutMode) => void;
}) {
  const isActive = currentMode === mode;

  return (
    <button
      onClick={() => onClick(mode)}
      className={`
        p-1.5 transition-colors border border-border
        ${isActive
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-background text-muted-foreground hover:bg-muted'
        }
      `}
      style={{ borderRadius: 0 }}
      title={label}
      aria-pressed={isActive}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// PluginToolbar Component
// ============================================================================

/**
 * PluginToolbar Component
 *
 * @remarks
 * Desktop-only toolbar with:
 * - Plugin toggle buttons (left side)
 * - Layout mode selector (right side)
 * - 8-bit design: sharp corners, no rounded edges
 *
 * Layout modes:
 * - 1-column: Single panel (Columns icon)
 * - 2-column: Two panels side-by-side (Grid2x2 icon)
 * - 3-column: Three panels side-by-side (Grid3x3 icon)
 * - 2+1: Two panels on top, one full-width below (LayoutPanelTop icon)
 *
 * @example
 * ```tsx
 * <PluginToolbar
 *   activePlugins={['filetree', 'monaco']}
 *   availablePlugins={allPlugins}
 *   layoutMode="2-column"
 *   onTogglePlugin={handleToggle}
 *   onSetLayoutMode={handleLayoutChange}
 * />
 * ```
 */
export function PluginToolbar({
  activePlugins,
  availablePlugins,
  layoutMode,
  onTogglePlugin,
  onSetLayoutMode,
}: PluginToolbarProps) {
  const { t } = useTranslation();

  return (
    <div
      className="h-10 px-3 flex items-center justify-between border-b border-border bg-card shrink-0"
      role="toolbar"
      aria-label={t('plugin.toolbar')}
    >
      {/* Left: Plugin Toggle Buttons */}
      <div className="flex items-center gap-1">
        <Layers size={16} className="text-muted-foreground mr-2" />
        {availablePlugins.map((plugin) => (
          <PluginToggleButton
            key={plugin.id}
            pluginId={plugin.id}
            isActive={activePlugins.includes(plugin.id)}
            onToggle={() => onTogglePlugin(plugin.id)}
          />
        ))}
      </div>

      {/* Right: Layout Mode Selector */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-2 hidden md:inline">
          {t('plugin.layoutMode')}:
        </span>
        <LayoutModeButton
          mode="1-column"
          currentMode={layoutMode}
          icon={<Columns size={16} />}
          label={t('plugin.layout1Column')}
          onClick={onSetLayoutMode}
        />
        <LayoutModeButton
          mode="2-column"
          currentMode={layoutMode}
          icon={<Grid2x2 size={16} />}
          label={t('plugin.layout2Column')}
          onClick={onSetLayoutMode}
        />
        <LayoutModeButton
          mode="3-column"
          currentMode={layoutMode}
          icon={<Grid3x3 size={16} />}
          label={t('plugin.layout3Column')}
          onClick={onSetLayoutMode}
        />
        <LayoutModeButton
          mode="2+1"
          currentMode={layoutMode}
          icon={<LayoutPanelTop size={16} />}
          label={t('plugin.layout2Plus1')}
          onClick={onSetLayoutMode}
        />
      </div>
    </div>
  );
}

// ============================================================================
// No additional exports - component exported above
// ============================================================================
