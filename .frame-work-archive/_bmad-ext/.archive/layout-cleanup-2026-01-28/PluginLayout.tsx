/**
 * @fileoverview PluginLayout - Simplified Plugin Layout System
 * @module presentation/layouts/PluginLayout
 *
 * **SIMPLIFIED PLUGIN LAYOUT SYSTEM**
 *
 * This is a temporary simplified layout following the archival of the Bento Grid system.
 * It provides basic plugin rendering without the bento grid features.
 *
 * @epic EPIC-CC-AR02AR03
 * @story UXUI-02-08
 * @team Team A
 * @created 2026-01-27
 * @archived Bento Grid: 2026-01-28
 */

import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { LayoutGrid } from 'lucide-react';

// Plugin system
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';
import type { PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// EPIC-0.6-10: Device fallback
import { isPluginSupportedOnDevice, getPluginFallbackReason, getDeviceType } from '@/infrastructure/utils/device-detection';
import { PluginFallback } from '@/presentation/components/common/PluginFallback';
import type { PluginId } from '@/domain/types/plugin-types';

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
 */
interface PluginLayoutProps {}

// ============================================================================
// PluginLayout Component
// ============================================================================

/**
 * PluginLayout Component - Simplified Plugin Layout
 *
 * @returns Plugin layout JSX element
 *
 * @remarks
 * This is a simplified version following Bento Grid archival.
 * Uses PluginLayoutStore for plugin state management.
 *
 * 8-Bit Design:
 * - Sharp corners (border-radius: 0)
 * - Solid borders (border-zinc-700)
 * - No glassmorphism
 */
export function PluginLayout({}: PluginLayoutProps) {
  const { t } = useTranslation();

  // ========================================================================
  // Layout Store for Plugin State and Breakpoint Detection
  // ========================================================================

  const { breakpoint, switchPlugin, activePlugins, currentPlugin } = usePluginLayoutStore(
    useShallow((state) => ({
      breakpoint: state.breakpoint,
      switchPlugin: state.switchPlugin,
      activePlugins: state.activePlugins,
      currentPlugin: state.currentPlugin,
    }))
  );

  // ========================================================================
  // Apply Responsive Layout Rules
  // ========================================================================

  const layoutRules = LAYOUT_RULES[breakpoint];
  const isMobile = breakpoint === 'mobile' || breakpoint === 'mobileLg';

  // For mobile: show limited plugins
  const visiblePlugins = isMobile
    ? activePlugins.slice(0, layoutRules.maxPlugins)
    : activePlugins;

  // Current plugin for mobile single-view
  const currentPluginForMobile = currentPlugin || visiblePlugins[0] || null;

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
        <PluginRenderer pluginId={currentPluginId} />
      </div>
    );
  };

  // ========================================================================
  // Render Simple Grid Layout (Desktop/Tablet)
  // ========================================================================

  const renderSimpleGrid = () => {
    if (visiblePlugins.length === 0) {
      return renderEmptyState();
    }

    // Simple grid layout - equal columns
    const gridCols = visiblePlugins.length === 1 ? '1fr' :
                     visiblePlugins.length === 2 ? '1fr 1fr' :
                     visiblePlugins.length === 3 ? '1fr 1fr 1fr' :
                     '1fr 1fr 1fr 1fr';

    return (
      <div
        className="h-full w-full grid gap-0"
        style={{
          gridTemplateColumns: gridCols,
          gridTemplateRows: '1fr',
        }}
        data-plugin-count={visiblePlugins.length}
      >
        {visiblePlugins.map((pluginId) => (
          <div
            key={pluginId}
            className="relative h-full overflow-hidden border-r border-b border-border"
            style={{ gridArea: 'auto' }}
            data-plugin={pluginId}
          >
            <PluginRenderer pluginId={pluginId} />
          </div>
        ))}
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
        {isMobile ? renderMobileSingleView() : renderSimpleGrid()}
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
 * - Shows fallback for unsupported plugins
 * - Shows error state if plugin not found
 */
function PluginRenderer({ pluginId }: PluginRendererProps) {
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
      <div className="h-full w-full flex items-center justify-center p-4 text-muted-foreground bg-background/50">
        <p className="text-sm font-mono">
          {t('plugin.notFound', 'Plugin not found')}: {pluginId}
        </p>
      </div>
    );
  }

  // Create plugin props
  const pluginProps: PluginMainProps = {
    width: 0, // CSS Grid handles sizing
    height: 0,
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
