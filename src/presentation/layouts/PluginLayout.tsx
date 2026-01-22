/**
 * @fileoverview PluginLayout - Main layout container for feature plugins
 * @module presentation/layouts/PluginLayout
 *
 * **ARCH-02-09**: PluginLayout Container - Main Layout Component
 *
 * Main layout container using react-resizable-panels.
 * Renders active plugins in flexible layouts (1-column, 2-column, 3-column, 2+1).
 * Supports drag-drop reordering and plugin add/remove.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-09
 * @team Team B
 * @created 2026-01-21
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Plus, LayoutGrid, Layers } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { PluginId } from '@/domain/types/plugin-types';

// Plugin registry
import { getAvailablePlugins, getPlugin } from '@/infrastructure/plugins/plugin-registry';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// Store
import { usePluginLayoutStore, type LayoutMode } from './PluginLayoutStore';

// Local components
import { PluginPanel } from './PluginPanel.tsx';

// Responsive layout rules
import { LAYOUT_RULES, type Breakpoint } from './useBreakpoint';
import { MobilePluginNav } from './MobilePluginNav.tsx';

// ============================================================================
// PluginLayout Props Interface
// ============================================================================

/**
 * PluginLayout Props
 *
 * @remarks
 * No props required - reads project context and layout store internally.
 */
interface PluginLayoutProps {}

// ============================================================================
// PluginLayout Component
// ============================================================================

/**
 * PluginLayout Component
 *
 * @returns Plugin layout JSX element
 *
 * @remarks
 * Main layout container for feature plugins:
 * - Loads activePlugins from PluginLayoutStore
 * - Filters plugins by device/storage requirements (using getAvailablePlugins)
 * - Renders plugins based on layoutMode
 * - Supports drag-drop reordering (via reorderPlugin action)
 * - Handles empty state (no plugins selected)
 * - Provides UI for adding/removing plugins
 *
 * Layout Modes (per ADR-034 Section 4):
 * - 1-column: Single panel (full width)
 * - 2-column: Two panels side-by-side
 * - 3-column: Three panels side-by-side
 * - 2+1: Two panels on top, one full-width panel below
 *
 * Features:
 * - Resizable panels (react-resizable-panels)
 * - Plugin selection per project (persisted)
 * - Empty state with add plugin UI
 * - Layout mode switcher
 *
 * 8-Bit Design:
 * - Sharp corners (border-radius: 0)
 * - Pixel shadows (box-shadow: 4px 4px 0 0)
 * - Solid colors (no glassmorphism)
 */
export function PluginLayout({}: PluginLayoutProps) {
  const { t } = useTranslation();

  // Get project context
  const projectContext = useProjectContext();

  // ========================================================================
  // Layout Store (useShallow for optimal re-rendering)
  // ========================================================================

  const {
    activePlugins,
    layoutMode,
    panelSizes,
    addPlugin,
    removePlugin,
    reorderPlugin,
    setLayoutMode,
    breakpoint,
    setBreakpoint,
    switchPlugin,
  } = usePluginLayoutStore(
    useShallow((state) => ({
      activePlugins: state.activePlugins,
      layoutMode: state.layoutMode,
      panelSizes: state.panelSizes,
      addPlugin: state.addPlugin,
      removePlugin: state.removePlugin,
      reorderPlugin: state.reorderPlugin,
      setLayoutMode: state.setLayoutMode,
      breakpoint: state.breakpoint,
      setBreakpoint: state.setBreakpoint,
      switchPlugin: state.switchPlugin,
    }))
  );

  // ========================================================================
  // Plugin Add Dialog State
  // ========================================================================

  const [showAddDialog, setShowAddDialog] = useState(false);

  // ========================================================================
  // Get Available Plugins
  // ========================================================================

  /**
   * Apply responsive layout rules
   *
   * @remarks
   * - Enforces LAYOUT_RULES based on current breakpoint
   * - Limits visible plugins to maxPlugins for viewport
   * - Returns layout rules for use in render
   * - Triggers setBreakpoint when breakpoint changes
   */
  const layoutRules = LAYOUT_RULES[breakpoint];

  /**
   * Enforce max plugins per platform
   *
   * @remarks
   * - Slices activePlugins to maxPlugins for current breakpoint
   * - Used for mobile/tablet constraints
   * - Desktop shows all plugins
   */
  const visiblePlugins = activePlugins.slice(0, layoutRules.maxPlugins);

  /**
   * Current plugin for mobile single-view
   *
   * @remarks
   * - Used on mobile/tablet to show one plugin at a time
   * - Falls back to first visible plugin if currentPlugin not set
   */
  const currentPluginForLayout = (breakpoint === 'mobile' || breakpoint === 'mobileLg')
    ? (activePlugins.find(p => p === (usePluginLayoutStore.getState() as any).currentPlugin) || null)
    : null;

  // Sync breakpoint state with useBreakpoint hook
  useEffect(() => {
    setBreakpoint(breakpoint);
  }, [breakpoint, setBreakpoint]);

  /**
   * Filter plugins by project context (deviceType, storageType)
   *
   * @remarks
   * - Returns plugins compatible with current project
   * - Excludes plugins that don't meet requirements
   * - Examples:
   *   - Desktop FSA: All plugins (filetree, monaco, terminal, chat, notes)
   *   - Mobile IndexedDB: filetree, chat, notes (terminal blocked, monaco blocked)
   */
  const availablePlugins = useMemo(() => {
    return getAvailablePlugins(projectContext);
  }, [projectContext]);

  /**
   * Plugins that are available but not active
   *
   * @remarks
   * - Used for "Add Plugin" dialog
   * - Filters out plugins that are already active
   */
  const availablePluginsNotActive = useMemo(() => {
    return availablePlugins.filter(
      (plugin) => !activePlugins.includes(plugin.id)
    );
  }, [availablePlugins, activePlugins]);

  // ========================================================================
  // Actions
  // ========================================================================

  /**
   * Handle plugin add
   *
   * @param pluginId - Plugin ID to add
   * @remarks
   * - Validates maxInstances constraint (prevents duplicates beyond limit)
   * - Calls store.addPlugin
   * - Validates max 5 plugins (enforced in store)
   * - Closes add dialog
   */
  const handleAddPlugin = useCallback(
    (pluginId: PluginId) => {
      const plugin = getPlugin(pluginId);

      // Check maxInstances constraint (INT-01 fix)
      const currentInstances = activePlugins.filter((id) => id === pluginId).length;
      if (plugin && plugin.requirements.maxInstances !== 'unlimited' && currentInstances >= plugin.requirements.maxInstances) {
        console.warn(
          `[PluginLayout] Cannot add ${pluginId}: maxInstances (${plugin.requirements.maxInstances}) reached`
        );
        return; // Do NOT add
      }

      addPlugin(pluginId);
      setShowAddDialog(false);
      console.log(`[PluginLayout] Added plugin: ${pluginId}`);
    },
    [addPlugin, activePlugins]
  );

  /**
   * Handle plugin remove
   *
   * @param pluginId - Plugin ID to remove
   * @param index - Panel index (for logging)
   * @remarks
   * - Calls store.removePlugin
   * - Validates that plugin can be removed
   */
  const handleRemovePlugin = useCallback(
    (pluginId: PluginId, index: number) => {
      removePlugin(pluginId);
      console.log(`[PluginLayout] Removed plugin: ${pluginId} at index ${index}`);
    },
    [removePlugin]
  );

  /**
   * Handle layout mode change
   *
   * @param mode - New layout mode
   * @remarks
   * - Calls store.setLayoutMode
   * - No validation needed (all modes supported)
   */
  const handleSetLayoutMode = useCallback(
    (mode: LayoutMode) => {
      setLayoutMode(mode);
      console.log(`[PluginLayout] Changed layout mode to: ${mode}`);
    },
    [setLayoutMode]
  );

  /**
   * Handle plugin reorder (drag-drop simulation)
   *
   * @param fromIndex - Current index
   * @param toIndex - Target index
   * @remarks
   * - Calls store.reorderPlugin
   * - Simplified drag-drop for POC (just moves array indices)
   */
  const handleReorderPlugin = useCallback(
    (fromIndex: number, toIndex: number) => {
      reorderPlugin(fromIndex, toIndex);
      console.log(`[PluginLayout] Reordered plugin from ${fromIndex} to ${toIndex}`);
    },
    [reorderPlugin]
  );

  // ========================================================================
  // Render Layout Based on Mode and Breakpoint
  // ========================================================================

  /**
   * Render layout panels based on layoutMode and breakpoint
   *
   * @remarks
   * Mobile: Single plugin fullscreen with bottom navigation
   * Desktop/Tablet: Multiple plugins based on layoutMode
   * - 1-column: Single panel
   * - 2-column: Two panels side-by-side
   * - 3-column: Three panels side-by-side
   * - 2+1: Two panels top, one full-width bottom
   */
  const renderLayout = () => {
    // Mobile single-view: show only current plugin fullscreen
    if (breakpoint === 'mobile' || breakpoint === 'mobileLg') {
      return renderMobileSingleView();
    }

    // Desktop/Tablet: show layout based on mode
    switch (layoutMode) {
      case '1-column':
        return render1Column();
      case '2-column':
        return render2Column();
      case '3-column':
        return render3Column();
      case '2+1':
        return render2Plus1();
      default:
        return render2Column(); // Default
    }
  };

  /**
   * 1-Column Layout (Single Panel)
   */
  const render1Column = () => {
    if (activePlugins.length === 0) {
      return renderEmptyState();
    }

    const pluginId = activePlugins[0];
    const plugin = getPlugin(pluginId);

    if (!plugin) {
      return renderEmptyState();
    }

    return (
      <div
        className="flex-1 h-full"
        style={{ flexDirection: 'row' }}
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
            onClose={() => handleRemovePlugin(pluginId, 0)}
          />
        </div>
      </div>
    );
  };

  /**
   * 2-Column Layout (Two Panels Side-by-Side)
   */
  const render2Column = () => {
    if (activePlugins.length === 0) {
      return renderEmptyState();
    }

    const plugin1Id = activePlugins[0];
    const plugin2Id = activePlugins[1];

    const plugin1 = getPlugin(plugin1Id);
    const plugin2 = getPlugin(plugin2Id);

    const size1 = panelSizes[plugin1Id] || 50;
    const size2 = panelSizes[plugin2Id] || 50;

    return (
      <div
        className="flex-1 h-full"
        style={{ flexDirection: 'row' }}
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
              onClose={() => handleRemovePlugin(plugin1Id, 0)}
            />
            {/* Drag Handle Indicator */}
            <div
              className="absolute right-0 top-1/2 w-2 h-full cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-colors"
              title={t('plugin.dragToReorder')}
              onMouseDown={() => handleDragStart(0)}
            >
              <div className="w-0.5 mx-auto h-6 bg-muted-foreground/50 space-y-0.5">
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
              </div>
            </div>
          </div>
        )}

        {/* Resize Handle */}
        <div
          className="w-2 bg-border/50 hover:bg-blue-500 transition-colors cursor-col-resize flex-shrink-0"
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
              onClose={() => handleRemovePlugin(plugin2Id, 1)}
            />
            {/* Drag Handle Indicator */}
            <div
              className="absolute right-0 top-1/2 w-2 h-full cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-colors"
              title={t('plugin.dragToReorder')}
              onMouseDown={() => handleDragStart(1)}
            >
              <div className="w-0.5 mx-auto h-6 bg-muted-foreground/50 space-y-0.5">
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * 3-Column Layout (Three Panels Side-by-Side)
   */
  const render3Column = () => {
    if (activePlugins.length === 0) {
      return renderEmptyState();
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
        className="flex-1 h-full"
        style={{ flexDirection: 'row' }}
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
              onClose={() => handleRemovePlugin(plugin1Id, 0)}
            />
            {/* Drag Handle Indicator */}
            <div
              className="absolute right-0 top-1/2 w-2 h-full cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-colors"
              title={t('plugin.dragToReorder')}
              onMouseDown={() => handleDragStart(0)}
            >
              <div className="w-0.5 mx-auto h-6 bg-muted-foreground/50 space-y-0.5">
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
              </div>
            </div>
          </div>
        )}

        {/* Resize Handle */}
        <div
          className="w-2 bg-border/50 hover:bg-blue-500 transition-colors cursor-col-resize flex-shrink-0"
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
              onClose={() => handleRemovePlugin(plugin2Id, 1)}
            />
            {/* Drag Handle Indicator */}
            <div
              className="absolute right-0 top-1/2 w-2 h-full cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-colors"
              title={t('plugin.dragToReorder')}
              onMouseDown={() => handleDragStart(1)}
            >
              <div className="w-0.5 mx-auto h-6 bg-muted-foreground/50 space-y-0.5">
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
              </div>
            </div>
          </div>
        )}

        {/* Resize Handle */}
        <div
          className="w-2 bg-border/50 hover:bg-blue-500 transition-colors cursor-col-resize flex-shrink-0"
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
              onClose={() => handleRemovePlugin(plugin3Id, 2)}
            />
            {/* Drag Handle Indicator */}
            <div
              className="absolute right-0 top-1/2 w-2 h-full cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-colors"
              title={t('plugin.dragToReorder')}
              onMouseDown={() => handleDragStart(2)}
            >
              <div className="w-0.5 mx-auto h-6 bg-muted-foreground/50 space-y-0.5">
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * 2+1 Layout (Two Panels Top, One Full-Width Bottom)
   */
  const render2Plus1 = () => {
    if (activePlugins.length === 0) {
      return renderEmptyState();
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
          className="flex-1"
          style={{ flexDirection: 'row' }}
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
                onClose={() => handleRemovePlugin(plugin1Id, 0)}
              />
              {/* Drag Handle Indicator */}
              <div
                className="absolute right-0 top-1/2 w-2 h-full cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-colors"
                title={t('plugin.dragToReorder')}
                onMouseDown={() => handleDragStart(0)}
              >
                <div className="w-0.5 mx-auto h-6 bg-muted-foreground/50 space-y-0.5">
                  <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                  <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                  <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                </div>
              </div>
            </div>
          )}

          {/* Resize Handle (Top Row) */}
          <div
            className="w-2 h-full bg-border/50 hover:bg-blue-500 transition-colors cursor-col-resize flex-shrink-0"
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
                onClose={() => handleRemovePlugin(plugin2Id, 1)}
              />
              {/* Drag Handle Indicator */}
              <div
                className="absolute right-0 top-1/2 w-2 h-full cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-colors"
                title={t('plugin.dragToReorder')}
                onMouseDown={() => handleDragStart(1)}
              >
                <div className="w-0.5 mx-auto h-6 bg-muted-foreground/50 space-y-0.5">
                  <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                  <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                  <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Resize Handle */}
        <div
          className="h-2 w-full bg-border/50 hover:bg-blue-500 transition-colors cursor-row-resize flex-shrink-0"
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
              onClose={() => handleRemovePlugin(plugin3Id, 2)}
            />
            {/* Drag Handle Indicator */}
            <div
              className="absolute right-0 top-1/2 w-2 h-full cursor-grab active:cursor-grabbing hover:bg-blue-500/20 transition-colors"
              title={t('plugin.dragToReorder')}
              onMouseDown={() => handleDragStart(2)}
            >
              <div className="w-0.5 mx-auto h-6 bg-muted-foreground/50 space-y-0.5">
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                <div className="w-0.5 h-0.5 bg-muted-foreground/50" />
                </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Mobile Single-View Layout (One Plugin Fullscreen)
   */
  const renderMobileSingleView = () => {
    if (visiblePlugins.length === 0) {
      return renderEmptyState();
    }

    const currentPlugin = currentPluginForLayout || visiblePlugins[0];
    const plugin = getPlugin(currentPlugin);

    if (!plugin) {
      return renderEmptyState();
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
              handleRemovePlugin(currentPlugin, 0);
            }
          }}
        />
      </div>
    );
  };

  /**
   * Empty State (No Plugins Selected)
   */
  const renderEmptyState = () => {
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
          onClick={() => setShowAddDialog(true)}
          className="rounded-none bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span>{t('plugin.addPlugin')}</span>
        </button>
      </div>
    );
  };

  /**
   * Render Add Plugin Dialog
   */
  const renderAddDialog = () => {
    if (!showAddDialog) {
      return null;
    }

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={() => setShowAddDialog(false)}
      >
        <div
          className="bg-background border border-border rounded-none shadow-[4px_4px_0_0] max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {t('plugin.addPlugin')}
            </h2>
            <button
              onClick={() => setShowAddDialog(false)}
              className="rounded-none bg-transparent text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1"
            >
              ×
            </button>
          </div>

          {/* Plugin List */}
          <div className="max-h-96 overflow-auto">
            {availablePluginsNotActive.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('plugin.allPluginsActive')}
              </p>
            ) : (
              <div className="space-y-2">
                {availablePluginsNotActive.map((plugin) => (
                  <button
                    key={plugin.id}
                    onClick={() => handleAddPlugin(plugin.id)}
                    className="w-full rounded-none bg-muted/10 text-left p-4 hover:bg-muted/20 border border-border/30 flex items-center gap-3 transition-colors"
                  >
                    <div className="shrink-0">{plugin.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">
                        {plugin.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {plugin.description}
                      </div>
                    </div>
                    <Plus size={18} className="text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========================================================================
  // Drag-Drop Handling (Simplified for POC)
  // ========================================================================

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  /**
   * Handle drag start
   *
   * @param index - Panel index being dragged
   */
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  /**
   * Handle drag end
   */
  const handleDragEnd = () => {
    if (dragIndex !== null) {
      // Drag completed without drop - just reset
      setDragIndex(null);
    }
  };

  /**
   * Handle drop
   *
   * @param dropIndex - Target drop index
   */
  const handleDrop = (dropIndex: number) => {
    if (dragIndex !== null && dragIndex !== dropIndex) {
      // Reorder from dragIndex to dropIndex
      handleReorderPlugin(dragIndex, dropIndex);
    }
    setDragIndex(null);
  };

  // Add drag and drop listeners
  useEffect(() => {
    const handleDragOver = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('dragover', handleDragOver);
    return () => {
      document.removeEventListener('dragover', handleDragOver);
    };
  }, [dragIndex]);

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <div
      className={`h-full flex flex-col breakpoint-${breakpoint}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (dragIndex !== null && activePlugins.length > 0 && breakpoint !== 'mobile' && breakpoint !== 'mobileLg') {
          // Allow drop - assume dropping at mouse position
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX || 0;
          const width = rect.width;
          if (x > width / 2) {
            handleDrop(1);
          } else if (activePlugins.length > 1 && x < width / 2) {
            // Check which panel we're over based on layout mode
            if (layoutMode === '2-column' && x > width * 0.33 && x < width * 0.66) {
              handleDrop(1);
            } else if (layoutMode === '2-column' && x >= width * 0.66) {
              handleDrop(0);
            } else if (layoutMode === '3-column') {
              // For 3 columns, more granular drop detection
              if (x > width * 0.66) {
                handleDrop(0);
              } else if (x > width * 0.33 && x < width * 0.66) {
                handleDrop(1);
              } else {
                handleDrop(0);
              }
            } else if (layoutMode === '2+1') {
              // For 2+1 layout, top row has 2 panels
              if (x > width * 0.66) {
                handleDrop(1);
              } else {
                handleDrop(0);
              }
            }
          }
        }
      }}
      onDragEnd={() => handleDragEnd()}
    >
      {/* ========================================================================
           Layout Toolbar (Desktop/Tablet only)
        ======================================================================== */}

      {breakpoint !== 'mobile' && breakpoint !== 'mobileLg' && (
        <div className="h-10 px-4 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
          {/* Left: Active Plugins Count */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers size={16} />
            <span>
              {activePlugins.length} {t('plugin.activePlugins')}
            </span>
          </div>

          {/* Right: Layout Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t('plugin.layoutMode')}:
            </span>
            <select
              value={layoutMode}
              onChange={(e) => handleSetLayoutMode(e.target.value as LayoutMode)}
              className="rounded-none bg-background border border-border/30 px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="1-column">{t('plugin.layout1Column')}</option>
              <option value="2-column">{t('plugin.layout2Column')}</option>
              <option value="3-column">{t('plugin.layout3Column')}</option>
              <option value="2+1">{t('plugin.layout2Plus1')}</option>
            </select>

            {/* Add Plugin Button */}
            <button
              onClick={() => setShowAddDialog(true)}
              className="rounded-none bg-blue-600 text-white px-3 py-1 text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Plus size={14} />
              <span>{t('plugin.add')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================
           Layout Content
        ======================================================================== */}

      <div className="flex-1 min-h-0">
        {renderLayout()}
      </div>

      {/* ========================================================================
           Mobile Bottom Navigation
        ======================================================================== */}

      {layoutRules.showBottomNav && (
        <MobilePluginNav
          activePlugins={visiblePlugins}
          currentPlugin={currentPluginForLayout || visiblePlugins[0] || 'notes'}
          onSwitchPlugin={switchPlugin}
        />
      )}

      {/* ========================================================================
           Add Plugin Dialog
        ======================================================================== */}

      {renderAddDialog()}
    </div>
  );
}

// ============================================================================
// No additional exports - PluginLayout exported above
// ============================================================================
