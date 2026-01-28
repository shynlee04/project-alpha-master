/**
 * @fileoverview Mobile Bottom Navigation Component
 * @module components/layout/MobileBottomNav
 * @created 2026-01-26
 * @updated 2026-01-28
 * @epic EPIC-UXUI-03
 * @story UXUI-03-12
 *
 * Bottom navigation bar for mobile devices with BottomSheet integration.
 * Shows primary tabs for Files, Notes, Chat, and More actions.
 *
 * Design: 8-bit compliant with tungsten color palette
 * - Fixed at 56px height
 * - 4 primary tabs
 * - Active state indicator
 * - BottomSheet for "More" menu
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from '@tanstack/react-router';
import {
  Folder,
  NotebookPen,
  MessageSquare,
  MoreHorizontal,
  Home,
  Settings,
  Code2,
  Terminal,
  Monitor,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import type { PluginId } from '@/domain/types/plugin-types';
import { BottomSheet } from './BottomSheet';

// CSS import for 8-bit styling
import './BottomNav.css';

// ============================================================================
// Types
// ============================================================================

export interface BottomNavItem {
  pluginId: PluginId;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

interface NavItem {
  id: string;
  pluginId?: PluginId;
  icon: LucideIcon;
  label: string;
  labelKey?: string;
  isMore?: boolean;
  badge?: number;
}

export interface MobileBottomNavProps {
  /** Callback when "More" menu is opened */
  onMoreClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Callback when any item is clicked */
  onItemClick?: (pluginId: PluginId) => void;
}

// ============================================================================
// Constants
// ============================================================================

/** Primary navigation items for mobile bottom bar */
const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    id: 'files',
    pluginId: 'filetree',
    icon: Folder,
    label: 'Files',
    labelKey: 'mobile.nav.files',
  },
  {
    id: 'notes',
    pluginId: 'notes',
    icon: NotebookPen,
    label: 'Notes',
    labelKey: 'mobile.nav.notes',
  },
  {
    id: 'chat',
    pluginId: 'chat',
    icon: MessageSquare,
    label: 'Chat',
    labelKey: 'mobile.nav.chat',
  },
  {
    id: 'more',
    icon: MoreHorizontal,
    label: 'More',
    labelKey: 'mobile.nav.more',
    isMore: true,
  },
];

/** Secondary items available in the "More" bottom sheet */
const MORE_NAV_ITEMS: NavItem[] = [
  {
    id: 'monaco',
    pluginId: 'monaco',
    icon: Code2,
    label: 'Editor',
    labelKey: 'mobile.nav.editor',
  },
  {
    id: 'preview',
    pluginId: 'preview',
    icon: Monitor,
    label: 'Preview',
    labelKey: 'mobile.nav.preview',
  },
  {
    id: 'terminal',
    pluginId: 'terminal',
    icon: Terminal,
    label: 'Terminal',
    labelKey: 'mobile.nav.terminal',
  },
  {
    id: 'agents',
    pluginId: 'agents',
    icon: Settings,
    label: 'Agents',
    labelKey: 'mobile.nav.agents',
  },
];

// ============================================================================
// Component
// ============================================================================

/**
 * Mobile bottom navigation bar.
 *
 * Features:
 * - Fixed position at bottom (56px height)
 * - 4 primary tabs (Files, Notes, Chat, More)
 * - Active state indicator (8-bit square dot)
 * - Touch-optimized (48px min touch targets)
 * - Safe area inset handling for notched devices
 * - BottomSheet for "More" actions
 *
 * @example
 * ```tsx
 * <MobileBottomNav onMoreClick={() => setMoreOpen(true)} />
 * ```
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onMoreClick,
  className,
  onItemClick,
}) => {
  const { t } = useTranslation();
  const params = useParams({ strict: false });
  const projectId = (params as { projectId?: string }).projectId;

  // Bottom sheet state
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Plugin layout store
  const currentPlugin = usePluginLayoutStore((s) => s.currentPlugin);
  const switchPlugin = usePluginLayoutStore((s) => s.switchPlugin);
  const addPlugin = usePluginLayoutStore((s) => s.addPlugin);
  const activePlugins = usePluginLayoutStore((s) => s.activePlugins);

  // Handle primary tab click
  const handleTabClick = useCallback(
    (item: NavItem) => {
      if (item.isMore) {
        setIsMoreOpen(true);
        onMoreClick?.();
        return;
      }

      if (item.pluginId) {
        // Ensure plugin is active
        if (!activePlugins.includes(item.pluginId)) {
          addPlugin(item.pluginId);
        }
        // Switch to this plugin
        switchPlugin(item.pluginId);
        onItemClick?.(item.pluginId);
      }
    },
    [activePlugins, addPlugin, switchPlugin, onMoreClick, onItemClick]
  );

  // Handle "More" menu item click
  const handleMoreItemClick = useCallback(
    (item: NavItem) => {
      if (item.pluginId) {
        // Ensure plugin is active
        if (!activePlugins.includes(item.pluginId)) {
          addPlugin(item.pluginId);
        }
        // Switch to this plugin
        switchPlugin(item.pluginId);
        onItemClick?.(item.pluginId);
      }
      // Close the bottom sheet
      setIsMoreOpen(false);
    },
    [activePlugins, addPlugin, switchPlugin, onItemClick]
  );

  // Check if tab is active
  const isActive = (item: NavItem): boolean => {
    if (item.isMore) return isMoreOpen;
    return currentPlugin === item.pluginId;
  };

  // ========================================================================
  // Hub mode (no project selected)
  // ========================================================================

  if (!projectId) {
    return (
      <nav
        className={cn('bottom-nav bottom-nav--hub', className)}
        role="navigation"
        aria-label={t('mobile.bottomNav', 'Bottom navigation')}
      >
        <button
          className="bottom-nav__item bottom-nav__item--active"
          aria-current="page"
        >
          <div className="bottom-nav__icon-wrapper">
            <Home size={24} className="bottom-nav__icon" />
          </div>
          <span className="bottom-nav__label">Home</span>
        </button>
      </nav>
    );
  }

  // ========================================================================
  // Project mode - Full navigation
  // ========================================================================

  return (
    <>
      <nav
        className={cn('bottom-nav', className)}
        role="navigation"
        aria-label={t('mobile.bottomNav', 'Bottom navigation')}
      >
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const label = item.labelKey ? t(item.labelKey, item.label) : item.label;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={cn(
                'bottom-nav__item',
                active && 'bottom-nav__item--active'
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
            >
              {/* Icon with active indicator and optional badge */}
              <div className="bottom-nav__icon-wrapper">
                <Icon size={22} className="bottom-nav__icon" />

                {/* Active indicator dot */}
                {active && !item.isMore && (
                  <div className="bottom-nav__active-indicator" aria-hidden="true" />
                )}

                {/* Badge for notifications */}
                {item.badge && item.badge > 0 && (
                  <span className="bottom-nav__badge" aria-label={`${item.badge} notifications`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="bottom-nav__label">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* More actions bottom sheet */}
      <BottomSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title={t('mobile.nav.moreActions', 'More Actions')}
      >
        <ul className="bottom-sheet__menu">
          {MORE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPlugin === item.pluginId;
            const label = item.labelKey ? t(item.labelKey, item.label) : item.label;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMoreItemClick(item)}
                  className={cn(
                    'bottom-sheet__menu-item',
                    active && 'bottom-sheet__menu-item--active'
                  )}
                >
                  <Icon size={20} className="bottom-sheet__menu-item-icon" />
                  <span className="bottom-sheet__menu-item-label">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
};

export default MobileBottomNav;
