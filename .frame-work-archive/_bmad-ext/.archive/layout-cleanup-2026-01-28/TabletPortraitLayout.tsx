/**
 * @fileoverview Tablet Portrait Layout Component
 * @module components/layout/TabletPortraitLayout
 * @created 2026-01-28
 * @updated 2026-01-28
 * @epic EPIC-UXUI-03
 * @story UXUI-03-13
 *
 * Layout for tablet portrait mode (600-767px):
 * - Header: 48px with project name, hamburger menu, actions
 * - Main: Active plugin renders full-screen
 * - Bottom nav: 56px with 4-5 plugin icons
 * - No sidebars, no activity bars, no split views
 *
 * Design: 8-bit compliant with tungsten color palette
 */

import React, { useState, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MoreHorizontal, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PluginId } from '@/domain/types/plugin-types';
import { MobileBottomNav } from './MobileBottomNav';
import { BottomSheet } from './BottomSheet';

// CSS import for 8-bit styling
import './TabletPortraitLayout.css';

// ============================================================================
// Types
// ============================================================================

export interface TabletPortraitLayoutProps {
  /** Header content (project name + menu) - or use default */
  header?: ReactNode;
  /** Active plugin component to render full-screen */
  activePlugin: ReactNode;
  /** Bottom navigation component - or use default MobileBottomNav */
  bottomNav?: ReactNode;
  /** Callback when plugin is changed via bottom nav */
  onPluginChange?: (pluginId: PluginId) => void;
  /** Optional status bar */
  statusBar?: ReactNode;
  /** Optional class name */
  className?: string;
  /** Project name for header */
  projectName?: string;
  /** Sidebar content for drawer */
  sidebarContent?: ReactNode;
  /** Callback when menu is toggled */
  onMenuToggle?: () => void;
  /** Whether the menu drawer is open */
  isMenuOpen?: boolean;
  /** Callback when menu drawer closes */
  onMenuClose?: () => void;
}

export interface TabletPortraitHeaderProps {
  /** Project name to display */
  projectName?: string;
  /** Callback when hamburger menu is clicked */
  onMenuClick?: () => void;
  /** Callback when more actions is clicked */
  onMoreClick?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Header Component
// ============================================================================

/**
 * TabletPortraitHeader - Top bar for tablet portrait mode
 *
 * Features:
 * - Hamburger menu (opens sidebar drawer)
 * - Project name (centered)
 * - More actions menu
 * - 48px height per UX spec
 * - 8-bit design compliant
 */
export const TabletPortraitHeader: React.FC<TabletPortraitHeaderProps> = ({
  projectName = 'Project',
  onMenuClick,
  onMoreClick,
  onSettingsClick,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <header
      className={cn('tablet-portrait-header', className)}
      role="banner"
      aria-label={t('tablet.header.label', 'Project header')}
    >
      {/* Left: Hamburger menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="tablet-portrait-header__menu-btn"
        aria-label={t('tablet.header.openMenu', 'Open menu')}
      >
        <Menu size={24} aria-hidden="true" />
      </button>

      {/* Center: Project name */}
      <h1 className="tablet-portrait-header__title">
        {projectName}
      </h1>

      {/* Right: Actions */}
      <div className="tablet-portrait-header__actions">
        <button
          type="button"
          onClick={onMoreClick}
          className="tablet-portrait-header__action-btn"
          aria-label={t('tablet.header.moreActions', 'More actions')}
        >
          <MoreHorizontal size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onSettingsClick}
          className="tablet-portrait-header__action-btn"
          aria-label={t('navigation.settings', 'Settings')}
        >
          <Settings size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

TabletPortraitHeader.displayName = 'TabletPortraitHeader';

// ============================================================================
// Sidebar Drawer Component
// ============================================================================

export interface SidebarDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Drawer content */
  children?: ReactNode;
  /** Title for the drawer */
  title?: string;
}

/**
 * SidebarDrawer - Slide-in drawer for tablet portrait sidebar
 *
 * Features:
 * - Slides in from left
 * - Overlay backdrop
 * - 8-bit design compliant
 * - Touch-friendly close
 */
export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  children,
  title = 'Menu',
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="sidebar-drawer__overlay" onClick={onClose}>
      <aside
        className="sidebar-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Drawer header */}
        <div className="sidebar-drawer__header">
          <h2 className="sidebar-drawer__title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="sidebar-drawer__close-btn"
            aria-label={t('common.close', 'Close')}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Drawer content */}
        <div className="sidebar-drawer__content">
          {children}
        </div>
      </aside>
    </div>
  );
};

SidebarDrawer.displayName = 'SidebarDrawer';

// ============================================================================
// Main Layout Component
// ============================================================================

/**
 * TabletPortraitLayout - Full-screen plugin layout for tablet portrait
 *
 * Features:
 * - 3-row grid: Header (48px) + Content (1fr) + BottomNav (56px)
 * - Active plugin fills entire content area
 * - Bottom navigation for plugin switching
 * - Sidebar drawer for menu content
 * - 8-bit design compliant
 *
 * @example
 * ```tsx
 * <TabletPortraitLayout
 *   projectName="My Project"
 *   activePlugin={<NotesPlugin />}
 *   onPluginChange={handlePluginChange}
 * />
 * ```
 */
export const TabletPortraitLayout: React.FC<TabletPortraitLayoutProps> = ({
  header,
  activePlugin,
  bottomNav,
  onPluginChange,
  statusBar,
  className,
  projectName = 'Project',
  sidebarContent,
  onMenuToggle,
  isMenuOpen: controlledMenuOpen,
  onMenuClose,
}) => {
  const { t } = useTranslation();

  // Internal menu state (can be controlled or uncontrolled)
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const isMenuOpen = controlledMenuOpen ?? internalMenuOpen;

  // More actions state
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Handle menu toggle
  const handleMenuClick = useCallback(() => {
    if (onMenuToggle) {
      onMenuToggle();
    } else {
      setInternalMenuOpen(true);
    }
  }, [onMenuToggle]);

  // Handle menu close
  const handleMenuClose = useCallback(() => {
    if (onMenuClose) {
      onMenuClose();
    } else {
      setInternalMenuOpen(false);
    }
  }, [onMenuClose]);

  // Handle more actions click
  const handleMoreClick = useCallback(() => {
    setIsMoreOpen(true);
  }, []);

  // Handle settings click
  const handleSettingsClick = useCallback(() => {
    // Navigate to settings or open settings modal
    console.log('[TabletPortraitLayout] Settings clicked');
  }, []);

  // Handle plugin change from bottom nav
  const handlePluginClick = useCallback(
    (pluginId: PluginId) => {
      onPluginChange?.(pluginId);
    },
    [onPluginChange]
  );

  return (
    <div className={cn('tablet-portrait-layout', className)}>
      {/* Header */}
      {header || (
        <TabletPortraitHeader
          projectName={projectName}
          onMenuClick={handleMenuClick}
          onMoreClick={handleMoreClick}
          onSettingsClick={handleSettingsClick}
        />
      )}

      {/* Main content area - full-screen plugin */}
      <main
        className="tablet-portrait-layout__content"
        role="main"
        aria-label={t('tablet.content.label', 'Plugin content')}
      >
        {activePlugin}
      </main>

      {/* Status bar (optional) */}
      {statusBar && (
        <div className="tablet-portrait-layout__status-bar">
          {statusBar}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="tablet-portrait-layout__nav">
        {bottomNav || (
          <MobileBottomNav
            onItemClick={handlePluginClick}
            onMoreClick={handleMoreClick}
          />
        )}
      </div>

      {/* Sidebar drawer */}
      <SidebarDrawer
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        title={t('tablet.menu.title', 'Menu')}
      >
        {sidebarContent}
      </SidebarDrawer>

      {/* More actions bottom sheet */}
      <BottomSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title={t('tablet.moreActions', 'More Actions')}
      >
        <div className="tablet-portrait-layout__more-menu">
          <p className="text-sm text-muted-foreground">
            {t('tablet.moreActions.placeholder', 'Additional actions coming soon')}
          </p>
        </div>
      </BottomSheet>
    </div>
  );
};

TabletPortraitLayout.displayName = 'TabletPortraitLayout';

export default TabletPortraitLayout;
