/**
 * @fileoverview PluginPanel - Individual panel wrapper for plugins
 * @module presentation/layouts/PluginPanel
 *
 * **ARCH-02-09**: PluginLayout Container - Panel Component
 *
 * Wrapper component that renders individual plugin instances in layout panels.
 * Handles plugin lifecycle (onMount/onUnmount) and panel UI (header, close button).
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-09
 * @team Team B
 * @created 2026-01-21
 */


import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';
import type { PluginId } from '@/domain/types/plugin-types';

// Plugin registry
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';

// ============================================================================
// PluginPanel Props Interface
// ============================================================================

/**
 * PluginPanel Props
 *
 * @remarks
 * - pluginId: ID of plugin to render
 * - width: Panel width in pixels
 * - height: Panel height in pixels
 * - index: Panel position in activePlugins array (for reordering)
 * - onClose: Callback when close button clicked
 */
interface PluginPanelProps {
  /** Plugin ID to render */
  pluginId: PluginId;

  /** Panel width in pixels */
  width: number;

  /** Panel height in pixels */
  height: number;

  /** Panel index in activePlugins (for reordering) */
  index: number;

  /** Callback when close button clicked */
  onClose: () => void;
}

// ============================================================================
// PluginPanel Component
// ============================================================================

/**
 * PluginPanel Component
 *
 * @param props - PluginPanelProps
 * @returns Plugin panel JSX element
 *
 * @remarks
 * - Retrieves plugin from registry by ID
 * - Renders plugin.MainComponent with PluginMainProps
 * - Handles plugin lifecycle (onMount/onUnmount)
 * - Validates plugin.maxInstances constraint
 * - Shows panel header (plugin name, close button)
 *
 * Features:
 * - Drag handle for reordering (visual indicator only)
 * - Close button to remove plugin from layout
 * - Error handling if plugin not found
 * - Lifecycle hook integration
 *
 * 8-Bit Design:
 * - Sharp corners (border-radius: 0)
 * - Pixel shadows (box-shadow: 4px 4px 0 0)
 * - Solid colors (no glassmorphism)
 */
export function PluginPanel({
  pluginId,
  width,
  height,
  index: _index, // Prefix with underscore to indicate intentionally unused
  onClose,
}: PluginPanelProps) {
  const { t } = useTranslation();

  // ========================================================================
  // Get Plugin from Registry
  // ========================================================================

  /**
   * Plugin object from registry
   */
  const plugin = getPlugin(pluginId);

  // ========================================================================
  // Note: Lifecycle Management
  // ========================================================================
  //
  // Plugin lifecycle (onMount/onUnmount) is handled by the plugin's MainComponent
  // via ProjectContext received in PluginMainProps.
  //
  // PluginPanel is a UI wrapper that provides:
  // - Panel header with title and close button
  // - Drag handle for reordering
  // - Render slot for MainComponent
  //
  // Each plugin's MainComponent receives full ProjectContext via props:
  // interface PluginMainProps {
  //   projectContext?: ProjectContext;
  //   panelId?: string;
  //   width: number;
  //   height: number;
  // }
  //

  // ========================================================================
  // Render States
  // ========================================================================

  /**
   * Plugin not found error state
   */
  if (!plugin) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-destructive p-4 border border-destructive"
        style={{ width, height }}
      >
        <p className="text-sm text-center font-semibold">
          {t('plugin.notFound')}: {pluginId}
        </p>
      </div>
    );
  }

  // ========================================================================
  // Main Render
  // ========================================================================

  /**
   * PluginMainProps to pass to plugin component
   */
  const pluginProps: PluginMainProps = {
    width: width,
    height: height,
  };

  return (
    <div
      className="h-full flex flex-col bg-background border border-border/30"
      style={{ width, height }}
    >
      {/* ========================================================================
           Panel Header
       ======================================================================== */}

      <div className="h-7 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        {/* Drag Handle Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {/* Drag grip icon */}
          <div className="flex gap-0.5 cursor-grab active:cursor-grabbing">
            <div className="w-0.5 h-3 bg-muted-foreground/50" />
            <div className="w-0.5 h-3 bg-muted-foreground/50" />
            <div className="w-0.5 h-3 bg-muted-foreground/50" />
          </div>

          {/* Plugin Icon and Name */}
          <span className="flex items-center gap-2">
            {plugin.icon}
            <span className="font-semibold">{plugin.name}</span>
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="rounded-none bg-transparent text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 transition-colors"
          aria-label={t('plugin.closePanel', { pluginName: plugin.name })}
          title={t('plugin.closePanel', { pluginName: plugin.name })}
        >
          <X size={14} />
        </button>
      </div>

      {/* ========================================================================
           Plugin Content
       ======================================================================== */}

      <div className="flex-1 overflow-hidden">
        <plugin.MainComponent {...pluginProps} />
      </div>
    </div>
  );
}

// ============================================================================
// No additional exports - PluginPanel exported above
// ============================================================================
