/**
 * @fileoverview Plugin Toggles Component for Bento Grid
 * @module presentation/components/layout/PluginToggles
 *
 * **BENTO GRID PLUGIN TOGGLES**
 *
 * Toggle buttons for adding/removing plugins from the bento grid.
 * Shows toggle state for each toggleable plugin with 8-bit design.
 *
 * Features:
 * - Toggle buttons with icons for each toggleable plugin
 * - Visual active/inactive state
 * - Disabled state when at min/max plugins
 * - Plugin count indicator
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-04
 * @team Team A
 * @created 2026-01-27
 */

import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { FileText, Code, Terminal, Eye, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PluginId } from '@/domain/types/plugin-types';
import { useBentoGridStore } from '@/presentation/layouts/BentoGridStore';
import { MAX_PLUGINS, MIN_PLUGINS, ALWAYS_LOADED_PLUGINS } from '@/presentation/layouts/bento-layouts';

// ============================================================================
// Types
// ============================================================================

interface ToggleablePlugin {
  id: PluginId;
  icon: typeof FileText;
  labelKey: string;
  label: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Toggleable plugins configuration
 *
 * @remarks
 * Chat and FileTree are always loaded (not toggleable).
 * These 4 plugins can be toggled on/off.
 */
const TOGGLEABLE_PLUGINS: ToggleablePlugin[] = [
  { id: 'notes', icon: FileText, labelKey: 'plugins.notes', label: 'Notes' },
  { id: 'monaco', icon: Code, labelKey: 'plugins.monaco', label: 'Code' },
  { id: 'terminal', icon: Terminal, labelKey: 'plugins.terminal', label: 'Terminal' },
  { id: 'preview', icon: Eye, labelKey: 'plugins.preview', label: 'Preview' },
];

// ============================================================================
// Component Props
// ============================================================================

export interface PluginTogglesProps {
  /** Additional CSS classes */
  className?: string;
  /** Compact mode (icons only) */
  compact?: boolean;
}

// ============================================================================
// PluginToggles Component
// ============================================================================

/**
 * PluginToggles Component - Toggle buttons for bento grid plugins
 *
 * @param props - PluginTogglesProps
 * @returns Toggle buttons JSX element
 *
 * @remarks
 * - Shows toggle button for each toggleable plugin
 * - Orange border when active, zinc border when inactive
 * - Disabled when at max (cannot add) or min (cannot remove)
 * - Shows plugin count as X/5
 *
 * 8-Bit Design:
 * - Sharp corners (rounded-none)
 * - Solid borders (border-2)
 * - No glassmorphism
 *
 * @example
 * ```tsx
 * <PluginToggles />
 * <PluginToggles compact />
 * ```
 */
export function PluginToggles({ className, compact = false }: PluginTogglesProps) {
  const { t } = useTranslation();

  // ========================================================================
  // Bento Grid Store (useShallow for optimal re-rendering)
  // ========================================================================

  const { activePlugins, togglePlugin, isPluginActive, canToggle } = useBentoGridStore(
    useShallow((s) => ({
      activePlugins: s.activePlugins,
      togglePlugin: s.togglePlugin,
      isPluginActive: s.isPluginActive,
      canToggle: s.canToggle,
    }))
  );

  // ========================================================================
  // Computed Values
  // ========================================================================

  const canAdd = activePlugins.length < MAX_PLUGINS;
  const canRemove = activePlugins.length > MIN_PLUGINS;
  const pluginCount = activePlugins.length;

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className={cn('flex items-center gap-1', className)} role="toolbar" aria-label={t('plugins.toggleBar', 'Plugin toggles')}>
      {/* Always-loaded indicator (Chat, FileTree) */}
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5',
          'text-xs font-mono text-zinc-500',
          'border-2 border-zinc-800 rounded-none',
          'bg-zinc-900/50'
        )}
        title={t('plugins.alwaysLoaded', 'Chat and FileTree are always loaded')}
      >
        <Lock className="w-3 h-3" />
        <span className="hidden lg:inline">{ALWAYS_LOADED_PLUGINS.length} core</span>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-zinc-700 mx-1" />

      {/* Toggleable Plugin Buttons */}
      {TOGGLEABLE_PLUGINS.map(({ id, icon: Icon, labelKey, label }) => {
        const isActive = isPluginActive(id);
        const canToggleThis = canToggle(id);
        const disabled = isActive ? !canRemove : !canAdd;

        return (
          <button
            key={id}
            type="button"
            onClick={() => togglePlugin(id)}
            disabled={disabled}
            title={`${t(labelKey, label)}${disabled ? (isActive ? ' - Cannot remove (minimum reached)' : ' - Cannot add (maximum reached)') : ''}`}
            className={cn(
              'flex items-center gap-1.5',
              compact ? 'p-2' : 'px-2.5 py-1.5',
              'rounded-none border-2',
              'transition-colors duration-150',
              'font-mono text-xs',
              // Active state
              isActive
                ? 'bg-orange-500/10 text-orange-500 border-orange-500'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300',
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed',
              // Focus state
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900'
            )}
            aria-pressed={isActive}
            aria-label={`${t(labelKey, label)} ${isActive ? 'active' : 'inactive'}`}
          >
            <Icon className="w-4 h-4" />
            {!compact && <span className="hidden sm:inline">{t(labelKey, label)}</span>}
          </button>
        );
      })}

      {/* Plugin Count */}
      <div className="ml-2 flex items-center gap-1 text-xs font-mono text-zinc-500">
        <span
          className={cn(
            pluginCount >= MAX_PLUGINS && 'text-orange-500',
            pluginCount <= MIN_PLUGINS && 'text-zinc-600'
          )}
        >
          {pluginCount}
        </span>
        <span>/</span>
        <span>{MAX_PLUGINS}</span>
      </div>
    </div>
  );
}

// Display name for React DevTools
PluginToggles.displayName = 'PluginToggles';

export default PluginToggles;
