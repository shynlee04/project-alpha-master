/**
 * @fileoverview Global Header Component
 * @module components/layout/GlobalHeader
 * @governance UX-03
 * @ai-observable false
 *
 * Global header bar for the application with 8-bit design compliance.
 * Features hamburger menu, navigation links, search, and action buttons.
 *
 * @epic EPIC-UX-GLOBAL-UI
 * @story UX-03 Create Header Component
 *
 * 8-Bit Design Mandates (NON-NEGOTIABLE):
 * - border-radius: 0px (rounded-none)
 * - box-shadow: 4px 4px 0px #000 (shadow-pixel)
 * - border-width: 2px (border-2)
 * - NO glassmorphism, NO opacity < 1
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation, useParams } from '@tanstack/react-router';
import { Menu, Search, Settings, User, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { PresetSelector } from './PresetSelector';
import { PluginToggles } from './PluginToggles';
// ============================================================================
// Types
// ============================================================================

export interface GlobalHeaderProps {
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Navigation items for the header
 * 
 * FIX-2026-01-26: Removed /ide and /notes per ADR-033.
 * These are layout-presets within /$projectId, NOT standalone routes.
 * Users access workspaces by selecting a project from the Hub.
 */
const NAV_ITEMS = [
  { key: 'home', path: '/', labelKey: 'navigation.home' },
] as const;

// ============================================================================
// Component
// ============================================================================

/**
 * GlobalHeader - Top navigation bar for the application
 *
 * Features:
 * - Fixed at top, 48px height (h-12)
 * - Hamburger menu (mobile only)
 * - Logo/Brand with font-pixel
 * - Navigation links (desktop only)
 * - Search input with Cmd+K shortcut
 * - Settings and User action buttons
 *
 * @param props - Component props
 * @returns Header JSX element
 */
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const { setMobileMenuOpen } = useLayoutStore();
  const { open: openCommandPalette } = useCommandPalette();

  // Check if we're on a project route (show plugin toggles)
  const projectId = (params as { projectId?: string }).projectId;
  const isProjectRoute = Boolean(projectId);

  // Handlers
  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(true);
  }, [setMobileMenuOpen]);

  const handleSearchFocus = useCallback(() => {
    openCommandPalette();
  }, [openCommandPalette]);

  const handleSettingsClick = useCallback(() => {
    navigate({ to: '/settings' });
  }, [navigate]);

  const handleUserClick = useCallback(() => {
    // Placeholder - will navigate to user profile/settings
    console.log('User menu clicked');
  }, []);

  // Check if path is active (for nav item highlighting)
  const isActivePath = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={cn(
        // Layout: Fixed height, flex container
        'h-12 flex items-center justify-between shrink-0',
        // Colors: 8-bit compliant - solid bg-zinc-900, border-zinc-700
        'bg-zinc-900 border-b-2 border-zinc-700',
        // Spacing
        'px-3 md:px-4',
        // z-index for fixed positioning
        'z-40',
        className
      )}
      role="banner"
      aria-label={t('global.header.title')}
    >
      {/* Left Section: Hamburger + Logo + Nav */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Hamburger Menu - Mobile Only */}
        <button
          type="button"
          onClick={handleMobileMenuToggle}
          className={cn(
            // Visibility: Mobile only
            'md:hidden',
            // Size: Touch-friendly 44x44
            'min-w-[44px] min-h-[44px]',
            // Layout
            'flex items-center justify-center',
            // 8-bit: NO rounded corners
            'rounded-none',
            // Colors
            'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-950',
            // Transitions
            'transition-colors duration-150',
            // Touch
            'touch-manipulation'
          )}
          aria-label={t('global.header.toggleMenu')}
          aria-expanded="false"
          aria-controls="mobile-menu"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Logo/Brand */}
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2',
            'hover:opacity-90 transition-opacity',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
            'rounded-none'
          )}
          aria-label={t('global.header.title')}
        >
          <img
            src="/via-gent-logo.svg"
            alt=""
            className="w-7 h-7"
            aria-hidden="true"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-pixel text-base md:text-lg font-bold tracking-tight text-zinc-50">
            {t('global.header.title')}
          </span>
        </Link>

        {/* Navigation Links - Desktop Only */}
        <nav
          className="hidden md:flex items-center gap-1 ml-4"
          role="navigation"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                // Layout
                'px-3 py-1.5',
                // Typography
                'font-mono text-sm',
                // 8-bit: NO rounded corners
                'rounded-none',
                // Border for active state
                'border-2',
                // Colors based on active state
                isActivePath(item.path)
                  ? 'border-orange-500 text-orange-500 bg-zinc-950'
                  : 'border-transparent text-zinc-400 hover:text-zinc-50 hover:bg-zinc-950',
                // Transitions
                'transition-colors duration-150'
              )}
              aria-current={isActivePath(item.path) ? 'page' : undefined}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Workflow Preset Selector - Desktop Only */}
        <div className="hidden md:flex items-center">
          <PresetSelector />
        </div>

        {/* Plugin Toggles - Desktop Only, Project Route Only */}
        {isProjectRoute && (
          <div className="hidden lg:flex items-center ml-2">
            <PluginToggles compact />
          </div>
        )}
      </div>

      {/* Right Section: Search + Actions */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <button
          type="button"
          onClick={handleSearchFocus}
          className={cn(
            // Layout
            'flex items-center gap-2',
            // Size
            'h-8 px-3',
            // 8-bit: NO rounded corners, solid border
            'rounded-none border-2 border-zinc-700',
            // Colors
            'bg-black text-zinc-400',
            // Hover state
            'hover:border-zinc-600 hover:text-zinc-300',
            // Focus state
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            // Transitions
            'transition-colors duration-150',
            // Width
            'min-w-[120px] md:min-w-[200px]'
          )}
          aria-label={t('global.header.search')}
          title={`${t('global.header.searchPlaceholder')} (⌘K)`}
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline text-sm truncate">
            {t('global.header.search')}
          </span>
          {/* Keyboard shortcut indicator */}
          <kbd
            className={cn(
              'hidden md:inline-flex items-center gap-0.5',
              'px-1.5 py-0.5',
              'text-[10px] font-mono',
              'rounded-none border border-zinc-700',
              'bg-zinc-900 text-zinc-500',
              'ml-auto'
            )}
          >
            <Command className="h-3 w-3" aria-hidden="true" />
            <span>K</span>
          </kbd>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={handleSettingsClick}
          className={cn(
            // Size: Touch-friendly
            'min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px]',
            // Layout
            'flex items-center justify-center',
            // 8-bit: NO rounded corners
            'rounded-none',
            // Colors: Ghost style
            'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-950',
            // Focus state
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            // Transitions
            'transition-colors duration-150',
            // Touch
            'touch-manipulation'
          )}
          aria-label={t('navigation.settings')}
          title={t('navigation.settings')}
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* User Button */}
        <button
          type="button"
          onClick={handleUserClick}
          className={cn(
            // Size: Touch-friendly
            'min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px]',
            // Layout
            'flex items-center justify-center',
            // 8-bit: NO rounded corners
            'rounded-none',
            // Colors: Ghost style
            'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-950',
            // Focus state
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            // Transitions
            'transition-colors duration-150',
            // Touch
            'touch-manipulation'
          )}
          aria-label={t('global.header.userMenu')}
          title={t('global.header.userMenu')}
        >
          <User className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

// Display name for React DevTools
GlobalHeader.displayName = 'GlobalHeader';

export default GlobalHeader;
