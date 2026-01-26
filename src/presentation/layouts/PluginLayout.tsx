/**
 * @fileoverview PluginLayout - CSS Grid Layout with Fixed-Ratio Presets
 * @module presentation/layouts/PluginLayout
 *
 * **Phase 1**: Replace Resizable with Fixed-Ratio CSS Grid Presets
 *
 * Main layout container using CSS Grid with FIXED ratios per preset.
 * No user resizing - ratios determined by workflow preset.
 *
 * Key Changes:
 * - Removed react-resizable-panels
 * - Removed drag-drop reordering
 * - CSS Grid with gridTemplateColumns from preset
 * - Panels determined by preset.panels array
 *
 * @created 2026-01-27
 * @team Team A
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';

// Plugin system
import type { PluginId } from '@/domain/types/plugin-types';
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';

// Store
import { usePluginLayoutStore } from './PluginLayoutStore';

// Workflow presets
import { WORKFLOW_PRESETS, type WorkflowPreset } from './workflow-presets';

// Local components
import { PluginPanel } from './PluginPanel.tsx';

// Responsive layout rules
import { LAYOUT_RULES } from './useBreakpoint';
import { MobilePluginNav } from './MobilePluginNav.tsx';

// Layout Onboarding
import { LayoutOnboarding } from '@/presentation/components/onboarding/LayoutOnboarding';

// ============================================================================
// PluginLayout Props Interface
// ============================================================================

/**
 * PluginLayout Props
 *
 * @remarks
 * No props required - reads preset from layout store.
 */
interface PluginLayoutProps {}

// ============================================================================
// PluginLayout Component
// ============================================================================

/**
 * PluginLayout Component - Fixed-Ratio CSS Grid Layout
 *
 * @returns Plugin layout JSX element
 *
 * @remarks
 * Phase 1 Implementation:
 * - CSS Grid layout with fixed ratios from preset
 * - NO resizable panels - all sizing via CSS Grid
 * - Panels determined by preset.panels array
 * - Mobile: Bottom navigation with single plugin view
 *
 * 8-Bit Design:
 * - Sharp corners (border-radius: 0)
 * - Solid borders
 * - No glassmorphism
 */
export function PluginLayout({}: PluginLayoutProps) {
  const { t } = useTranslation();

  // ========================================================================
  // Layout Store (useShallow for optimal re-rendering)
  // ========================================================================

  const {
    currentPreset,
    breakpoint,
    switchPlugin,
  } = usePluginLayoutStore(
    useShallow((state) => ({
      currentPreset: state.currentPreset,
      breakpoint: state.breakpoint,
      switchPlugin: state.switchPlugin,
    }))
  );

  // ========================================================================
  // Get Preset Configuration
  // ========================================================================

  const preset = useMemo(() => {
    return WORKFLOW_PRESETS[currentPreset] ?? WORKFLOW_PRESETS.default;
  }, [currentPreset]);

  // ========================================================================
  // Apply Responsive Layout Rules
  // ========================================================================

  const layoutRules = LAYOUT_RULES[breakpoint];
  const isMobile = breakpoint === 'mobile' || breakpoint === 'mobileLg';

  // For mobile: show limited plugins
  const visiblePanels = isMobile
    ? preset.panels.slice(0, layoutRules.maxPlugins)
    : preset.panels;

  // Current plugin for mobile single-view
  const currentPluginForMobile = usePluginLayoutStore((s) => s.currentPlugin) || visiblePanels[0] || null;

  // ========================================================================
  // Render Mobile Single-View Layout
  // ========================================================================

  const renderMobileSingleView = () => {
    if (visiblePanels.length === 0) {
      return renderEmptyState();
    }

    const currentPlugin = currentPluginForMobile || visiblePanels[0];
    const plugin = getPlugin(currentPlugin);

    if (!plugin) {
      return renderEmptyState();
    }

    return (
      <div className="flex-1 h-full w-full">
        <PluginPanel
          pluginId={currentPlugin}
          width={0}
          height={0}
          index={0}
          onClose={() => {}} // Mobile: don't allow closing
        />
      </div>
    );
  };

  // ========================================================================
  // Render CSS Grid Layout (Desktop/Tablet)
  // ========================================================================

  const renderGridLayout = () => {
    if (visiblePanels.length === 0) {
      return renderEmptyState();
    }

    return (
      <div
        className="h-full w-full grid gap-0"
        style={{ gridTemplateColumns: preset.gridTemplate }}
      >
        {visiblePanels.map((panelId, index) => {
          const plugin = getPlugin(panelId);
          if (!plugin) return null;

          const isLastPanel = index === visiblePanels.length - 1;

          return (
            <div
              key={panelId}
              className={`h-full overflow-hidden ${
                !isLastPanel ? 'border-r-2 border-border' : ''
              }`}
            >
              <PluginPanel
                pluginId={panelId}
                width={0}
                height={0}
                index={index}
                onClose={() => {}} // Fixed layout: don't allow closing individual panels
              />
            </div>
          );
        })}
      </div>
    );
  };

  // ========================================================================
  // Empty State
  // ========================================================================

  const renderEmptyState = () => {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <LayoutGrid size={64} className="mb-4 text-muted-foreground/70" />
        <h2 className="text-lg font-semibold mb-2">
          {t('plugin.noPluginsTitle', 'No plugins loaded')}
        </h2>
        <p className="text-sm text-center mb-6 max-w-md">
          {t('plugin.noPluginsDescription', 'Select a layout preset to load plugins.')}
        </p>
      </div>
    );
  };

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <div
      className={`h-full w-full flex flex-col breakpoint-${breakpoint}`}
    >
      {/* ================================================================
          Main Layout Content
         ================================================================ */}

      <div className="flex-1 min-h-0">
        {isMobile ? renderMobileSingleView() : renderGridLayout()}
      </div>

      {/* ================================================================
          Mobile Bottom Navigation
         ================================================================ */}

      {layoutRules.showBottomNav && (
        <MobilePluginNav
          activePlugins={visiblePanels}
          currentPlugin={currentPluginForMobile || visiblePanels[0] || 'notes'}
          onSwitchPlugin={switchPlugin}
        />
      )}

      {/* ================================================================
          Layout Onboarding (ARCH-03-05)
         ================================================================ */}
      <LayoutOnboarding />
    </div>
  );
}

// ============================================================================
// No additional exports - PluginLayout exported above
// ============================================================================
