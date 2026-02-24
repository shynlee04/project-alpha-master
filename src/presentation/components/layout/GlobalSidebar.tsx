/**
 * @fileoverview Global Sidebar Component
 * @module components/layout/GlobalSidebar
 * @updated 2026-01-30
 *
 * EPIC-UXUI-04: Global Sidebar with auto-collapse functionality
 * - 200px expanded / 48px collapsed
 * - 8-bit design compliance (sharp corners, pixel shadows)
 * - Responsive auto-collapse on mobile/tablet
 * - localStorage persistence
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Home,
  Folder,
  Settings,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/infrastructure/persistence/stores/layout/sidebar-store';
import { useSidebarState } from '@/presentation/hooks/useSidebarState';
import { ErrorBoundary } from '@/presentation/components/error';
import type { GlobalSidebarProps, SidebarNavItem } from './types';
import { NavItem } from './GlobalSidebarNavItem';
import { Tooltip } from './GlobalSidebarTooltip';

// Re-export type for convenience
export type { GlobalSidebarProps } from './types';

// ============================================================================
// 8-Bit Design System Variants
// ============================================================================

const sidebarVariants = cva(
  'flex flex-col h-full bg-sidebar border-r-2 border-sidebar-border transition-all duration-200 ease-in-out overflow-hidden',
  {
    variants: {
      expanded: {
        true: 'w-[200px]',
        false: 'w-12',
      },
    },
    defaultVariants: { expanded: true },
  }
);

const toggleButtonVariants = cva(
  'flex items-center justify-center rounded-none border-2 border-transparent hover:border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all duration-150 w-8 h-8',
);

// ============================================================================
// Default Navigation Items
// ============================================================================

const DEFAULT_NAV_ITEMS: SidebarNavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'projects', label: 'Projects', icon: Folder, path: '/projects' },
];

const DEFAULT_BOTTOM_ITEMS: SidebarNavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

// ============================================================================
// Main Component
// ============================================================================

export const GlobalSidebar: React.FC<GlobalSidebarProps> = ({
  className,
  navItems = DEFAULT_NAV_ITEMS,
  bottomItems = DEFAULT_BOTTOM_ITEMS,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { isExpanded, isCollapsed, isAutoCollapsed, toggle, width } = useSidebarState();
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useSidebarStore((state) => state.setActiveWorkspace);

  const handleNavigation = useCallback((path: string, itemId: string) => {
    navigate({ to: path });
    setActiveWorkspace(itemId);
  }, [navigate, setActiveWorkspace]);

  const isPathActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  return (
    <ErrorBoundary
      fallback={
        <aside
          className="flex flex-col h-full w-12 bg-sidebar border-r-2 border-sidebar-border overflow-hidden"
          aria-label={t('layout.sidebar.navigation', 'Sidebar navigation')}
        >
          <div className="flex items-center justify-center h-12 border-b-2 border-sidebar-border">
            <PanelLeft size={18} className="text-sidebar-foreground/50" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-sidebar-foreground/50 font-mono rotate-180 [writing-mode:vertical-lr]">
              Error
            </span>
          </div>
        </aside>
      }
    >
      <aside
        className={cn(sidebarVariants({ expanded: isExpanded }), className)}
        style={{ width: `${width}px` }}
        aria-label={t('layout.sidebar.navigation', 'Sidebar navigation')}
        data-expanded={isExpanded}
        data-collapsed={isCollapsed}
        data-auto-collapsed={isAutoCollapsed}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-12 border-b-2 border-sidebar-border px-2 shrink-0">
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2 overflow-hidden">
                <PanelLeft size={18} className="text-sidebar-foreground shrink-0" />
                <span className="font-mono text-sm font-semibold text-sidebar-foreground truncate">
                  {t('layout.sidebar.title', 'Workspace')}
                </span>
              </div>
              <button
                onClick={toggle}
                className={cn(toggleButtonVariants())}
                title={t('layout.sidebar.collapse', 'Collapse sidebar')}
                aria-label={t('layout.sidebar.collapse', 'Collapse sidebar')}
                aria-expanded={isExpanded}
              >
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <Tooltip content={t('layout.sidebar.expand', 'Expand sidebar')} side="right">
              <button
                onClick={toggle}
                className={cn(toggleButtonVariants())}
                aria-label={t('layout.sidebar.expand', 'Expand sidebar')}
                aria-expanded={isExpanded}
              >
                <ChevronRight size={16} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Main navigation */}
        <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin" aria-label={t('layout.sidebar.mainNav', 'Main navigation')}>
          <ul className="space-y-1" role="menubar">
            {navItems.map((item) => (
              <li key={item.id} role="none">
                <NavItem
                  item={item}
                  isActive={isPathActive(item.path)}
                  isCollapsed={isCollapsed}
                  onClick={() => handleNavigation(item.path, item.id)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t-2 border-sidebar-border py-2 shrink-0">
          <ul className="space-y-1" role="menubar">
            {bottomItems.map((item) => (
              <li key={item.id} role="none">
                <NavItem
                  item={item}
                  isActive={isPathActive(item.path)}
                  isCollapsed={isCollapsed}
                  onClick={() => handleNavigation(item.path, item.id)}
                />
              </li>
            ))}
          </ul>

          {isExpanded && (
            <div className="mt-2 px-3 py-2 border-t border-sidebar-border">
              <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60 font-mono">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="truncate uppercase">{activeWorkspace}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </ErrorBoundary>
  );
};

export default GlobalSidebar;
