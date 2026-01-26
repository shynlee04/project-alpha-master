/**
 * @fileoverview Main Sidebar Component (8-bit Design)
 * @module components/layout/MainSidebar
 * 
 * @epic EPIC-UX-GLOBAL-UI
 * @story UX-02 Redesign Sidebar Component
 * 
 * Design: Tungsten & Fire color palette with strict 8-bit compliance
 * - rounded-none everywhere (NO EXCEPTIONS)
 * - shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] for pixel shadows
 * - Active: orange left border (border-l-2 border-orange-500)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Home,
  Folder,
  Code,
  NotebookPen,
  // DEFERRED per ADR-033: Knowledge and Study workspace icons
  // BookOpen,
  // GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';
import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';
import { useRecentProjects } from '@/infrastructure/persistence/stores/project';
import { useTheme } from 'next-themes';
import { useLocalePreference } from '@/i18n/LocaleProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutDefinitions } from '@/lib/keyboard/shortcuts';

// 8-bit compliant sidebar variants
const sidebarVariants = cva(
  'flex flex-col h-screen border-r-2 border-zinc-700 bg-zinc-900 transition-all duration-200 ease-in-out',
  {
    variants: {
      collapsed: {
        true: 'w-16',
        false: 'w-64',
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
);

// 8-bit compliant nav item with active orange left border
const navItemVariants = cva(
  'flex items-center gap-3 mx-2 rounded-none cursor-pointer transition-all duration-200 font-pixel tracking-wide text-base group relative touch-manipulation',
  {
    variants: {
      active: {
        true: 'border-l-2 border-orange-500 bg-zinc-900 text-zinc-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
        false: 'border-l-2 border-transparent text-zinc-400 hover:bg-zinc-950 hover:text-zinc-50',
      },
      collapsed: {
        true: 'justify-center px-1 py-3',
        false: 'px-3 py-3',
      },
      mobile: {
        true: 'min-h-[48px] py-3 text-lg',
        false: 'py-2',
      },
    },
    defaultVariants: {
      active: false,
      collapsed: false,
      mobile: false,
    },
  }
);

// 8-bit mobile sidebar (full screen overlay)
const mobileSidebarVariants = cva(
  'fixed inset-y-0 left-0 z-50 h-screen w-[320px] bg-zinc-900 border-r-2 border-zinc-700 transition-transform duration-200 ease-in-out shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
  {
    variants: {
      open: {
        true: 'translate-x-0',
        false: '-translate-x-full',
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

// Backdrop for mobile
const backdropVariants = cva(
  'fixed inset-0 bg-black/60 z-40 transition-opacity duration-200',
  {
    variants: {
      open: {
        true: 'opacity-100 pointer-events-auto',
        false: 'opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

interface MainSidebarProps {
  className?: string;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    toggleSidebar,
    setMobileMenuOpen,
    setActiveNavItem,
  } = useLayoutStore();

  const { resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale } = useLocalePreference();
  const [mounted, setMounted] = React.useState(false);

  // Get recent projects (limit 5)
  const recentProjects = useRecentProjects(5);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const handleToggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleToggleLocale = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLocale = locale === 'en' ? 'vi' : 'en';
    setLocale(newLocale);
  };

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    // Cmd/Ctrl+B: Toggle sidebar
    ShortcutDefinitions.toggleSidebar(() => {
      toggleSidebar();
    }),

    // Cmd/Ctrl+Shift+T: Toggle theme
    ShortcutDefinitions.toggleTheme(() => {
      const newTheme = isDark ? 'light' : 'dark';
      setTheme(newTheme);
    }),
  ]);

  // Navigation items using global.sidebar.* i18n keys
  // FIX-2026-01-26: Changed /ide and /notes to redirect to hub
  // Per ADR-033, these are layout-presets, not routes
  const navItems = [
    { id: 'home', label: t('global.sidebar.home'), icon: Home, path: '/' },
    { id: 'projects', label: t('global.sidebar.projects'), icon: Folder, path: '/projects' },
    // IDE and Notes removed - access via project selection in hub
    // { id: 'ide', label: t('global.sidebar.ide'), icon: Code, path: '/ide' },
    // { id: 'notes', label: t('global.sidebar.notes'), icon: NotebookPen, path: '/notes' },
    // DEFERRED per ADR-033: Knowledge and Study workspaces
    // { id: 'knowledge', label: t('global.sidebar.knowledge'), icon: BookOpen, path: '/knowledge' },
    // { id: 'study', label: t('global.sidebar.study'), icon: GraduationCap, path: '/study' },
  ];

  const handleNavigation = (path: string, itemId: string) => {
    navigate({ to: path });
    setActiveNavItem(itemId as any);
    if (sidebarMobileOpen) setMobileMenuOpen(false);
  };

  const handleProjectClick = (projectId: string) => {
    // FIXED: Navigate to /$projectId, not /workspace/$projectId
    navigate({ to: '/$projectId', params: { projectId } });
    if (sidebarMobileOpen) setMobileMenuOpen(false);
  };

  // Desktop nav item renderer
  const renderNavItem = (item: typeof navItems[0], isMobile: boolean = false) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const isCollapsed = !isMobile && sidebarCollapsed;

    return (
      <div
        key={item.id}
        onClick={() => handleNavigation(item.path, item.id)}
        className={cn(navItemVariants({ active: isActive, collapsed: isCollapsed, mobile: isMobile }))}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon
          size={isMobile ? 24 : 20}
          className={cn(
            'shrink-0 transition-colors',
            isActive ? 'text-orange-500' : 'text-zinc-400 group-hover:text-zinc-50'
          )}
        />
        {!isCollapsed && (
          <TruncatedText text={item.label} className="truncate" noTooltip />
        )}
      </div>
    );
  };

  // Recent projects section
  const renderRecentProjects = (isMobile: boolean = false) => {
    if (recentProjects.length === 0) return null;

    const isCollapsed = !isMobile && sidebarCollapsed;
    if (isCollapsed) return null;

    return (
      <div className="px-4 py-2">
        <h3 className="text-xs font-pixel uppercase tracking-wider text-zinc-500 mb-2">
          {t('global.sidebar.recentProjects')}
        </h3>
        <ul className="space-y-1">
          {recentProjects.map((project) => (
            <li
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-950 rounded-none cursor-pointer transition-colors"
            >
              <span className="text-zinc-600">•</span>
              <TruncatedText text={project.name} className="truncate" />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Bottom pinned section (Settings + Collapse toggle)
  const renderBottomSection = (isMobile: boolean = false) => {
    const isCollapsed = !isMobile && sidebarCollapsed;

    return (
      <div className="border-t-2 border-zinc-700 bg-zinc-900 p-2 space-y-2">
        {/* Settings */}
        <div
          onClick={() => handleNavigation('/settings', 'settings')}
          className={cn(navItemVariants({
            active: location.pathname === '/settings',
            collapsed: isCollapsed,
            mobile: isMobile
          }))}
          title={isCollapsed ? t('global.sidebar.settings') : undefined}
        >
          <Settings
            size={isMobile ? 24 : 20}
            className={cn(
              'shrink-0 transition-colors',
              location.pathname === '/settings' ? 'text-orange-500' : 'text-zinc-400 group-hover:text-zinc-50'
            )}
          />
          {!isCollapsed && (
            <span className="truncate">{t('global.sidebar.settings')}</span>
          )}
        </div>

        {/* Theme and Language toggles */}
        {mounted && (
          <div className={cn(
            'flex items-center gap-2 transition-all',
            isCollapsed ? 'flex-col' : 'grid grid-cols-2'
          )}>
            <button
              onClick={handleToggleTheme}
              className="flex items-center justify-center h-10 rounded-none border-2 border-transparent hover:border-zinc-700 hover:bg-zinc-950 text-zinc-400 hover:text-zinc-50 transition-all"
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={handleToggleLocale}
              className="flex items-center justify-center h-10 rounded-none border-2 border-transparent hover:border-zinc-700 hover:bg-zinc-950 text-zinc-400 hover:text-zinc-50 transition-all"
              title={locale === 'en' ? 'Tiếng Việt' : 'English'}
            >
              <span className="font-pixel text-sm font-bold">{locale.toUpperCase()}</span>
            </button>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => toggleSidebar()}
            className={cn(
              'flex items-center justify-center w-full h-8 rounded-none hover:bg-zinc-950 text-zinc-400 hover:text-zinc-50 transition-colors',
              !isCollapsed && 'border-t border-zinc-700/50 pt-2 mt-2'
            )}
            title={sidebarCollapsed ? t('global.sidebar.expand') : t('global.sidebar.collapse')}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={backdropVariants({ open: sidebarMobileOpen })}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside className={cn(
        mobileSidebarVariants({ open: sidebarMobileOpen }),
        'md:hidden flex flex-col',
        className
      )}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 border-b-2 border-zinc-700 px-4 bg-zinc-900">
          <div className="flex items-center gap-3">
            <img src="/via-gent-logo.svg" alt="Via-gent" className="w-10 h-10" />
            <span className="font-bold font-pixel text-xl tracking-wide text-zinc-50">
              Via-gent
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-none border-2 border-transparent hover:border-zinc-700 active:bg-zinc-950 transition-colors"
          >
            <X size={24} className="text-zinc-50" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item, true))}

          {/* Recent Projects (mobile) */}
          {renderRecentProjects(true)}
        </nav>

        {/* Mobile Bottom */}
        {renderBottomSection(true)}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        sidebarVariants({ collapsed: sidebarCollapsed }),
        'hidden md:flex flex-col',
        className
      )}>
        {/* Desktop Header */}
        <div className={cn(
          'flex items-center h-16 border-b-2 border-zinc-700 transition-all duration-200',
          sidebarCollapsed ? 'justify-center px-0' : 'px-4'
        )}>
          <img
            src="/via-gent-logo.svg"
            alt="Via-gent"
            className={cn(
              'transition-all duration-200',
              sidebarCollapsed ? 'w-8 h-8' : 'w-8 h-8'
            )}
          />
          {!sidebarCollapsed && (
            <span className="ml-3 font-bold font-pixel text-xl tracking-tight text-zinc-50 truncate">
              Via-gent
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => renderNavItem(item, false))}

          {/* Recent Projects section */}
          {renderRecentProjects(false)}
        </nav>

        {/* Desktop Bottom */}
        {renderBottomSection(false)}
      </aside>
    </>
  );
};
