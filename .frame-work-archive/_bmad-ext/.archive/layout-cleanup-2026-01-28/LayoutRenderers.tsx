/**
 * @fileoverview LayoutRenderers - Layout rendering components for PluginLayout
 * @module presentation/layouts/LayoutRenderers
 *
 * **CC-AR-08**: Extracted from PluginLayout.tsx (god component split)
 *
 * Contains layout rendering components for different column configurations:
 * - 1-column: Single panel
 * - 2-column: Two panels side-by-side
 * - 3-column: Three panels side-by-side
 * - 2+1: Two panels top, one full-width bottom
 * - Mobile single view: One plugin fullscreen
 * - Empty state: No plugins selected
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-08
 * @team Team B
 * @created 2026-01-26
 */

import { Plus, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PluginId } from '@/domain/types/plugin-types';
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';
import { PluginPanel } from './PluginPanel.tsx';

// ============================================================================
// Types
// ============================================================================

/**
 * Common props for layout renderers
 */
export interface LayoutRendererProps {
  /** Active plugin IDs */
  activePlugins: PluginId[];
  /** Visible plugins (may be subset on mobile) */
  visiblePlugins: PluginId[];
  /** Panel sizes by plugin ID */
  panelSizes: Record<PluginId, number>;
  /** Current plugin for mobile single view */
  currentPluginForLayout: PluginId | null;
  /** Handler for removing a plugin */
  onRemovePlugin: (pluginId: PluginId, index: number) => void;
  /** Handler for opening add plugin dialog */
  onShowAddDialog: () => void;
}

// ============================================================================
// 1-Column Layout Component
// ============================================================================

/**
 * OneColumnLayout - Single panel layout
 */
export function OneColumnLayout({
  activePlugins,
  panelSizes,
  onRemovePlugin,
  onShowAddDialog,
}: LayoutRendererProps) {

  if (activePlugins.length === 0) {
    return <EmptyState onShowAddDialog={onShowAddDialog} />;
  }

  const pluginId = activePlugins[0];
  const plugin = getPlugin(pluginId);

  if (!plugin) {
    return <EmptyState onShowAddDialog={onShowAddDialog} />;
  }

  return (
    <div
      className="flex-1 h-full flex flex-row"
    >
      <div
        className="h-full"
        style={{ flex: panelSizes[pluginId] || 100 }}
      >
        <PluginPanel
          pluginId={pluginId}
          width={0}
          height={0}
          index={0}
          onClose={() => onRemovePlugin(pluginId, 0)}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 2-Column Layout Component
// ============================================================================

/**
 * TwoColumnLayout - Two panels side-by-side
 */
export function TwoColumnLayout({
  activePlugins,
  panelSizes,
  onRemovePlugin,
  onShowAddDialog,
}: LayoutRendererProps) {
  if (activePlugins.length === 0) {
    return <EmptyState onShowAddDialog={onShowAddDialog} />;
  }

  const plugin1Id = activePlugins[0];
  const plugin2Id = activePlugins[1];

  const plugin1 = getPlugin(plugin1Id);
  const plugin2 = getPlugin(plugin2Id);

  const size1 = panelSizes[plugin1Id] || 50;
  const size2 = panelSizes[plugin2Id] || 50;

  return (
    <div
      className="flex-1 h-full flex flex-row"
    >
      {/* Panel 1 */}
      {plugin1 && (
        <div
          className="h-full relative"
          style={{ flex: size1, minWidth: plugin1.requirements.minWidth }}
        >
          <PluginPanel
            pluginId={plugin1Id}
            width={0}
            height={0}
            index={0}
            onClose={() => onRemovePlugin(plugin1Id, 0)}
          />
        </div>
      )}

      {/* Resize Handle */}
      <div
        className="w-2 bg-border/50 hover:bg-primary transition-colors cursor-col-resize flex-shrink-0"
      />

      {/* Panel 2 */}
      {plugin2 && (
        <div
          className="h-full relative"
          style={{ flex: size2, minWidth: plugin2.requirements.minWidth }}
        >
          <PluginPanel
            pluginId={plugin2Id}
            width={0}
            height={0}
            index={1}
            onClose={() => onRemovePlugin(plugin2Id, 1)}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3-Column Layout Component
// ============================================================================

/**
 * ThreeColumnLayout - Three panels side-by-side
 */
export function ThreeColumnLayout({
  activePlugins,
  panelSizes,
  onRemovePlugin,
  onShowAddDialog,
}: LayoutRendererProps) {
  if (activePlugins.length === 0) {
    return <EmptyState onShowAddDialog={onShowAddDialog} />;
  }

  const plugin1Id = activePlugins[0];
  const plugin2Id = activePlugins[1];
  const plugin3Id = activePlugins[2];

  const plugin1 = getPlugin(plugin1Id);
  const plugin2 = getPlugin(plugin2Id);
  const plugin3 = getPlugin(plugin3Id);

  const size1 = panelSizes[plugin1Id] || 33.3;
  const size2 = panelSizes[plugin2Id] || 33.3;
  const size3 = panelSizes[plugin3Id] || 33.3;

  return (
    <div
      className="flex-1 h-full flex flex-row"
    >
      {/* Panel 1 */}
      {plugin1 && (
        <div
          className="h-full relative"
          style={{ flex: size1, minWidth: plugin1.requirements.minWidth }}
        >
          <PluginPanel
            pluginId={plugin1Id}
            width={0}
            height={0}
            index={0}
            onClose={() => onRemovePlugin(plugin1Id, 0)}
          />
        </div>
      )}

      {/* Resize Handle */}
      <div
        className="w-2 bg-border/50 hover:bg-primary transition-colors cursor-col-resize flex-shrink-0"
      />

      {/* Panel 2 */}
      {plugin2 && (
        <div
          className="h-full relative"
          style={{ flex: size2, minWidth: plugin2.requirements.minWidth }}
        >
          <PluginPanel
            pluginId={plugin2Id}
            width={0}
            height={0}
            index={1}
            onClose={() => onRemovePlugin(plugin2Id, 1)}
          />
        </div>
      )}

      {/* Resize Handle */}
      <div
        className="w-2 bg-border/50 hover:bg-primary transition-colors cursor-col-resize flex-shrink-0"
      />

      {/* Panel 3 */}
      {plugin3 && (
        <div
          className="h-full relative"
          style={{ flex: size3, minWidth: plugin3.requirements.minWidth }}
        >
          <PluginPanel
            pluginId={plugin3Id}
            width={0}
            height={0}
            index={2}
            onClose={() => onRemovePlugin(plugin3Id, 2)}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2+1 Layout Component
// ============================================================================

/**
 * TwoPlusOneLayout - Two panels top, one full-width bottom
 */
export function TwoPlusOneLayout({
  activePlugins,
  panelSizes,
  onRemovePlugin,
  onShowAddDialog,
}: LayoutRendererProps) {
  if (activePlugins.length === 0) {
    return <EmptyState onShowAddDialog={onShowAddDialog} />;
  }

  const plugin1Id = activePlugins[0];
  const plugin2Id = activePlugins[1];
  const plugin3Id = activePlugins[2];

  const plugin1 = getPlugin(plugin1Id);
  const plugin2 = getPlugin(plugin2Id);
  const plugin3 = getPlugin(plugin3Id);

  const size1 = panelSizes[plugin1Id] || 50;
  const size2 = panelSizes[plugin2Id] || 50;
  const size3 = panelSizes[plugin3Id] || 50;

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Top Row: 2 Panels */}
      <div
        className="flex-1 flex flex-row"
      >
        {/* Panel 1 (Top Left) */}
        {plugin1 && (
          <div
            className="h-full relative"
            style={{ flex: size1, minWidth: plugin1.requirements.minWidth }}
          >
            <PluginPanel
              pluginId={plugin1Id}
              width={0}
              height={0}
              index={0}
              onClose={() => onRemovePlugin(plugin1Id, 0)}
            />
          </div>
        )}

        {/* Resize Handle (Top Row) */}
        <div
          className="w-2 h-full bg-border/50 hover:bg-primary transition-colors cursor-col-resize flex-shrink-0"
        />

        {/* Panel 2 (Top Right) */}
        {plugin2 && (
          <div
            className="h-full relative"
            style={{ flex: size2, minWidth: plugin2.requirements.minWidth }}
          >
            <PluginPanel
              pluginId={plugin2Id}
              width={0}
              height={0}
              index={1}
              onClose={() => onRemovePlugin(plugin2Id, 1)}
            />
          </div>
        )}
      </div>

      {/* Vertical Resize Handle */}
      <div
        className="h-2 w-full bg-border/50 hover:bg-primary transition-colors cursor-row-resize flex-shrink-0"
      />

      {/* Bottom Row: Full-Width Panel */}
      {plugin3 && (
        <div
          className="h-full relative"
          style={{ flex: size3, minWidth: plugin3.requirements.minWidth }}
        >
          <PluginPanel
            pluginId={plugin3Id}
            width={0}
            height={0}
            index={2}
            onClose={() => onRemovePlugin(plugin3Id, 2)}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Mobile Single View Component
// ============================================================================

/**
 * MobileSingleViewLayout - One plugin fullscreen on mobile
 */
export function MobileSingleViewLayout({
  visiblePlugins,
  currentPluginForLayout,
  onRemovePlugin,
  onShowAddDialog,
}: LayoutRendererProps) {
  if (visiblePlugins.length === 0) {
    return <EmptyState onShowAddDialog={onShowAddDialog} />;
  }

  const currentPlugin = currentPluginForLayout || visiblePlugins[0];
  const plugin = getPlugin(currentPlugin);

  if (!plugin) {
    return <EmptyState onShowAddDialog={onShowAddDialog} />;
  }

  return (
    <div
      className="flex-1 h-full"
      style={{ width: '100%' }}
    >
      <PluginPanel
        pluginId={currentPlugin}
        width={0}
        height={0}
        index={0}
        onClose={() => {
          // On mobile, don't allow closing the last plugin
          if (visiblePlugins.length > 1) {
            onRemovePlugin(currentPlugin, 0);
          }
        }}
      />
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

/**
 * EmptyState - No plugins selected state
 */
export function EmptyState({
  onShowAddDialog,
}: {
  onShowAddDialog: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
      <LayoutGrid size={64} className="mb-4 text-muted-foreground/70" />
      <h2 className="text-lg font-semibold mb-2">
        {t('plugin.noPluginsTitle')}
      </h2>
      <p className="text-sm text-center mb-6 max-w-md">
        {t('plugin.noPluginsDescription')}
      </p>

      {/* Add Plugin Button */}
      <button
        onClick={onShowAddDialog}
        className="rounded-none bg-primary text-primary-foreground px-6 py-3 hover:brightness-110 transition-all duration-200 flex items-center gap-2 border-2 border-primary"
      >
        <Plus size={18} />
        <span>{t('plugin.addPlugin')}</span>
      </button>
    </div>
  );
}

// ============================================================================
// No additional exports - components exported above
// ============================================================================
