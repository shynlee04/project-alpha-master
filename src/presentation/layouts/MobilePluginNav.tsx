/**
 * @fileoverview MobilePluginNav - Bottom navigation for mobile plugins
 * @module presentation/layouts/MobilePluginNav
 *
 * **ARCH-03-02**: Mobile-Responsive Plugin Layouts
 *
 * Mobile bottom navigation component that:
 * - Shows icons for active plugins
 * - Allows switching between plugins on mobile
 * - Follows 8-bit design principles (sharp corners, pixel shadows)
 * - Ensures touch targets ≥ 44x44px (WCAG 2.5.5)
 * - Uses i18n for user-facing strings
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-02
 * @team Team B
 * @created 2026-01-22
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginId } from '@/domain/types/plugin-types';
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * MobilePluginNav Props
 *
 * @remarks
 * - activePlugins: List of active plugin IDs to show as tabs
 * - currentPlugin: Currently selected plugin (for highlighting active tab)
 * - onSwitchPlugin: Callback when user taps a plugin tab
 */
export interface MobilePluginNavProps {
  /** List of active plugin IDs to display */
  activePlugins: PluginId[];

  /** Currently active plugin ID (for styling) */
  currentPlugin: PluginId;

  /** Callback when plugin tab is tapped */
  onSwitchPlugin: (pluginId: PluginId) => void;
}

// ============================================================================
// MobilePluginNav Component
// ============================================================================

/**
 * MobilePluginNav Component
 *
 * @param props - MobilePluginNavProps
 * @returns Mobile navigation JSX element
 *
 * @remarks
 * Renders fixed bottom navigation bar with plugin icons:
 * - Positioned fixed at bottom of viewport
 * - Shows icons for all active plugins
 * - Active plugin highlighted with blue background
 * - Touch targets ≥ 44x44px (WCAG compliant)
 * - 8-bit design: sharp corners, pixel shadows, solid colors
 *
 * Features:
 * - Icon-based navigation (uses plugin.icon from registry)
 * - Visual feedback for active plugin
 * - Hover and tap states
 * - Responsive to number of plugins (width adjusts)
 *
 * 8-Bit Design:
 * - Sharp corners (border-radius: 0)
 * - Pixel shadows (box-shadow: 4px 4px 0 0 rgba(0,0,0,0.3))
 * - Solid colors (no glassmorphism, no opacity on background)
 * - High contrast for active state (blue-600 on gray-700)
 *
 * Accessibility:
 * - Touch targets ≥ 44x44px (WCAG 2.5.5)
 * - ARIA labels for each plugin tab
 * - Keyboard navigation support
 *
 * @example
 * ```tsx
 * <MobilePluginNav
 *   activePlugins={['notes', 'chat']}
 *   currentPlugin="notes"
 *   onSwitchPlugin={(pluginId) => store.switchPlugin(pluginId)}
 * />
 * ```
 */
export function MobilePluginNav({
  activePlugins,
  currentPlugin,
  onSwitchPlugin,
}: MobilePluginNavProps) {
  const { t } = useTranslation();

  /**
   * Early return if no plugins active
   *
   * @remarks
   * Prevents rendering empty nav bar
   */
  if (activePlugins.length === 0) {
    return null;
  }

  return (
    <nav
      className="mobile-plugin-nav"
      role="tablist"
      aria-label={t('mobilePluginNav.ariaLabel')}
    >
      {activePlugins.map((pluginId) => {
        /**
         * Get plugin from registry (for icon and name)
         */
        const plugin = getPlugin(pluginId);

        /**
         * Skip if plugin not found (shouldn't happen in production)
         */
        if (!plugin) {
          return null;
        }

        const isActive = pluginId === currentPlugin;

        return (
          <button
            key={pluginId}
            type="button"
            className={`plugin-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSwitchPlugin(pluginId)}
            aria-label={t('mobilePluginNav.switchToPlugin', { pluginName: plugin.name })}
            aria-selected={isActive}
            role="tab"
            tabIndex={isActive ? 0 : -1}
          >
            <span className="plugin-icon">
              {plugin.icon}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ============================================================================
// No additional exports - component exported above
// ============================================================================
