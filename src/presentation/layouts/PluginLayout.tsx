/**
 * @fileoverview PluginLayout - Bento Grid Layout System
 * @module presentation/layouts/PluginLayout
 *
 * **BENTO GRID LAYOUT SYSTEM**
 *
 * Main layout container using CSS Grid with asymmetric bento-style layouts.
 * Each plugin count (2-5) has a predefined optimal arrangement.
 *
 * Key Features:
 * - Asymmetric cell sizes (not equal columns)
 * - Toggle plugins ON/OFF → grid shape changes
 * - Drag to SWAP positions only (no resize)
 * - 2 always-loaded (Chat, FileTree) + 1-3 toggleable
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-04
 * @team Team A
 * @created 2026-01-27
 */

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';

// Plugin system
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';
import type { PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// EPIC-0.6-10: Device fallback
import { isPluginSupportedOnDevice, getPluginFallbackReason, getDeviceType } from '@/infrastructure/utils/device-detection';
import { PluginFallback } from '@/presentation/components/common/PluginFallback';
import type { PluginId } from '@/domain/types/plugin-types';

// Bento grid system
import { useBentoGridStore } from './BentoGridStore';
import { getBentoLayout, type CellSizeVariant } from './bento-layouts';
import { DraggableBentoCell } from './DraggableBentoCell';

// Store for breakpoint detection
import { usePluginLayoutStore } from './PluginLayoutStore';

// Responsive layout rules
import { LAYOUT_RULES } from './useBreakpoint';
import { MobilePluginNav } from './MobilePluginNav';

// Layout Onboarding
import { LayoutOnboarding } from '@/presentation/components/onboarding/LayoutOnboarding';

// ============================================================================
// PluginLayout Props Interface
// ============================================================================

/**
 * PluginLayout Props
 *
 * @remarks
 * No props required - reads state from bento grid store.
 */
interface PluginLayoutProps {}

// ============================================================================
// PluginLayout Component
// ============================================================================

/**
 * PluginLayout Component - Bento Grid Layout System
 *
 * @returns Plugin layout JSX element
 *
 * @remarks
 * Implementation Features:
 * - CSS Grid layout with asymmetric bento arrangements
 * - 4 predefined layouts for 2, 3, 4, 5 plugins
 * - Plugin toggle changes grid shape
 * - Mobile: Single plugin view with bottom navigation
 *
 * 8-Bit Design:
 * - Sharp corners (border-radius: 0)
 * - Solid borders (border-zinc-700)
 * - No glassmorphism
 */
export function PluginLayout({}: PluginLayoutProps) {
  const { t } = useTranslation();

  // ========================================================================
  // Bento Grid Store (useShallow for optimal re-rendering)
  // ========================================================================

  const { activePlugins, pluginOrder, getActiveCount } = useBentoGridStore(
    useShallow((s) => ({
      activePlugins: s.activePlugins,
      pluginOrder: s.pluginOrder,
      getActiveCount: s.getActiveCount,
    }))
  );

  // ========================================================================
  // Layout Store for Breakpoint Detection
  // ========================================================================

  const { breakpoint, switchPlugin } = usePluginLayoutStore(
    useShallow((state) => ({
      breakpoint: state.breakpoint,
      switchPlugin: state.switchPlugin,
    }))
  );

  // ========================================================================
  // Get Bento Layout Configuration
  // ========================================================================

  const layout = useMemo(() => {
    return getBentoLayout(getActiveCount());
  }, [getActiveCount]);

  // ========================================================================
  // Apply Responsive Layout Rules
  // ========================================================================

  const layoutRules = LAYOUT_RULES[breakpoint];
  const isMobile = breakpoint === 'mobile' || breakpoint === 'mobileLg';

  // For mobile: show limited plugins
  const visiblePlugins = isMobile
    ? pluginOrder.filter((id) => activePlugins.includes(id)).slice(0, layoutRules.maxPlugins)
    : pluginOrder.filter((id) => activePlugins.includes(id));

  // Current plugin for mobile single-view
  const currentPluginForMobile = usePluginLayoutStore((s) => s.currentPlugin) || visiblePlugins[0] || null;

  // ========================================================================
  // Render Mobile Single-View Layout
  // ========================================================================

  const renderMobileSingleView = () => {
    if (visiblePlugins.length === 0) {
      return renderEmptyState();
    }

    const currentPluginId = currentPluginForMobile || visiblePlugins[0];
    if (!currentPluginId) {
      return renderEmptyState();
    }

    return (
      <div className="flex-1 h-full w-full">
        <PluginRenderer pluginId={currentPluginId} sizeVariant="large" />
      </div>
    );
  };

  // ========================================================================
  // Render Bento Grid Layout (Desktop/Tablet)
  // ========================================================================

  const renderBentoGrid = () => {
    if (visiblePlugins.length === 0) {
      return renderEmptyState();
    }

    return (
      <div
        className="h-full w-full grid gap-0"
        style={{
          gridTemplateColumns: layout.gridTemplate.columns,
          gridTemplateRows: layout.gridTemplate.rows,
          gridTemplateAreas: layout.gridTemplate.areas,
        }}
        data-bento-plugins={layout.count}
        data-bento-layout={layout.name}
      >
        {visiblePlugins.map((pluginId, index) => {
          const cell = layout.cells[index];
          if (!cell) return null;

          return (
            <DraggableBentoCell
              key={pluginId}
              pluginId={pluginId}
              gridArea={cell.gridArea}
              sizeVariant={cell.sizeVariant}
              cellId={cell.id}
              isLast={index === visiblePlugins.length - 1}
            >
              <PluginRenderer pluginId={pluginId} sizeVariant={cell.sizeVariant} />
            </DraggableBentoCell>
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
          {t('plugin.noPluginsDescription', 'Toggle plugins using the header buttons.')}
        </p>
      </div>
    );
  };

  // ========================================================================
  // Main Render
  // ========================================================================

  return (
    <div className={`h-full w-full flex flex-col breakpoint-${breakpoint}`}>
      {/* ================================================================
          Main Layout Content
         ================================================================ */}

      <div className="flex-1 min-h-0">
        {isMobile ? renderMobileSingleView() : renderBentoGrid()}
      </div>

      {/* ================================================================
          Mobile Bottom Navigation
         ================================================================ */}

      {layoutRules.showBottomNav && (
        <MobilePluginNav
          activePlugins={visiblePlugins}
          currentPlugin={currentPluginForMobile || visiblePlugins[0] || 'notes'}
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
// PluginRenderer Component - Renders Plugin MainComponent
// ============================================================================

interface PluginRendererProps {
  pluginId: string;
  sizeVariant: CellSizeVariant;
}

/**
 * PluginRenderer Component - Renders the appropriate plugin component
 *
 * @param props - PluginRendererProps
 * @returns Plugin component or error state
 *
 * @remarks
 * - Retrieves plugin from registry
 * - Checks device support (EPIC-0.6-10)
 * - Passes size variant to plugin
 * - Shows fallback for unsupported plugins
 * - Shows error state if plugin not found
 */
function PluginRenderer({ pluginId, sizeVariant }: PluginRendererProps) {
  const { t } = useTranslation();
  const plugin = getPlugin(pluginId as Parameters<typeof getPlugin>[0]);

  // EPIC-0.6-10: Check device support before rendering
  const deviceType = getDeviceType();
  const isSupported = isPluginSupportedOnDevice(pluginId as PluginId, deviceType);
  const fallbackReason = getPluginFallbackReason(pluginId as PluginId, deviceType);

  // Show fallback UI if plugin is not supported on this device
  if (!isSupported && fallbackReason) {
    return (
      <PluginFallback
        pluginId={pluginId as PluginId}
        reason={fallbackReason}
        suggestedAction={t('plugin.fallback.openOnDesktop', 'Open on desktop to use this feature')}
      />
    );
  }

  if (!plugin) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4 text-zinc-500 bg-zinc-900/50">
        <p className="text-sm font-mono">
          {t('plugin.notFound', 'Plugin not found')}: {pluginId}
        </p>
      </div>
    );
  }

  // Create plugin props with size variant
  const pluginProps: PluginMainProps & { sizeVariant?: CellSizeVariant } = {
    width: 0, // CSS Grid handles sizing
    height: 0,
    sizeVariant,
  };

  return (
    <div className="h-full w-full">
      <plugin.MainComponent {...pluginProps} />
    </div>
  );
}

// ============================================================================
// No additional exports - PluginLayout exported above
// ============================================================================
