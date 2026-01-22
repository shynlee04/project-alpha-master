/**
 * @fileoverview MobilePluginNav - Bottom navigation for mobile plugins
 * @module presentation/layouts/MobilePluginNav
 */
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

// ============================================================================
// 8-Bit Design Styles (Inline CSS)
// ============================================================================

/**
 * MobilePluginNav Component Styles
 *
 * @remarks
 * 8-bit design system applied:
 * - Sharp corners (border-radius: 0)
 * - Pixel shadows (box-shadow: 4px 4px 0 0 rgba(0,0,0,0.3))
 * - Solid colors (no glassmorphism, no transparency)
 * - High contrast for active state (blue-600 on gray-700)
 * - Touch targets ≥ 44x44px (WCAG 2.5.5 compliant)
 */
const styles = `
  .mobile-plugin-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: #333333;
    border-top: 2px solid #000000;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -4px 0 0 rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }

  .plugin-tab {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    /* WCAG 2.5.5 touch target: minimum 44x44px */
    min-height: 44px;
    min-width: 44px;
    color: #9CA3AF; /* blue-500 */
    transition: color 0.2s ease;
  }

  .plugin-tab:hover:not(.active) {
    background: #444444; /* gray-700 */
  }

  .plugin-tab.active {
    background: #2563EB; /* blue-600 */
    color: #FFFFFF; /* white */
  }

  .plugin-icon {
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}
