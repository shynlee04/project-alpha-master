/**
 * @fileoverview Main Sidebar Component
 * @module components/layout/MainSidebar
 * 
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-9 Dashboard Responsive
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Home,
  Folder,
  Brain,
  BookOpen,
  Bot,
  Settings,
  Notebook,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/presentation/components/ui/tooltip';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';
import { useLayoutStore } from '@/lib/state/layout-store';
import { useTheme } from 'next-themes';
import { useLocalePreference } from '@/i18n/LocaleProvider';

const sidebarVariants = cva(
  'flex flex-col h-screen border-r-2 border-border bg-sidebar transition-all duration-300 ease-in-out',
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

// MRT-9: Enhanced nav item with mobile-first touch targets
const navItemVariants = cva(
  'flex items-center gap-3 mx-2 rounded-none cursor-pointer border-2 border-transparent transition-all duration-200 font-pixel tracking-wide text-lg group relative touch-manipulation',
  {
    variants: {
      active: {
        true: 'bg-accent text-accent-foreground border-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]',
        false: 'text-muted-foreground hover:bg-accent hover:text-foreground hover:border-muted-foreground/30 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-[1px]',
      },
      collapsed: {
        true: 'justify-center px-1 py-3',
        false: 'px-3 py-3',
      },
      mobile: {
        true: 'min-h-[48px] py-3 text-xl',
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

const mobileSidebarVariants = cva(
  'fixed inset-y-0 left-0 z-50 h-screen w-[320px] bg-sidebar border-r-2 border-border transition-transform duration-300 ease-in-out shadow-2xl',
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

const backdropVariants = cva(
  'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
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

  const navItems = [
    { id: 'home', label: t('sidebar.home'), icon: Home, path: '/' },
    { id: 'projects', label: t('sidebar.projects'), icon: Folder, path: '/workspace' },
    { id: 'knowledge', label: t('sidebar.knowledge', 'Knowledge'), icon: Brain, path: '/knowledge' },
    { id: 'notes', label: t('sidebar.notes', 'Notes'), icon: Notebook, path: '/notes' },
    { id: 'study', label: t('sidebar.study', 'Study'), icon: BookOpen, path: '/study' },
    { id: 'agents', label: t('sidebar.agents'), icon: Bot, path: '/agents' },
    { id: 'settings', label: t('sidebar.settings'), icon: Settings, path: '/settings' },
  ];

  const handleNavigation = (path: string, itemId: string) => {
    navigate({ to: path });
    setActiveNavItem(itemId as any);
    if (sidebarMobileOpen) setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div className={backdropVariants({ open: sidebarMobileOpen })} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile Sidebar */}
      <aside className={cn(mobileSidebarVariants({ open: sidebarMobileOpen }), 'md:hidden flex flex-col', className)}>
        <div className="flex items-center justify-between h-16 border-b-2 border-border px-4 bg-sidebar">
          <div className="flex items-center gap-3">
            <img src="/via-gent-logo.svg" alt="Via-gent" className="w-10 h-10" />
            <span className="font-bold font-pixel text-xl tracking-wide text-primary shadow-sm">
              Via-gent
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-10 h-10 border-2 border-transparent hover:border-border active:bg-accent transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleNavigation(item.path, item.id)}
                className={cn(navItemVariants({ active: isActive, collapsed: false, mobile: true }))}
              >
                <Icon className={cn("h-6 w-6 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <TruncatedText text={item.label} />
              </div>
            );
          })}
        </nav>

        {mounted && (
          <div className="p-4 border-t-2 border-border bg-sidebar/50">
            <div className="flex gap-4">
              <button
                onClick={handleToggleTheme}
                className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-border hover:border-primary hover:bg-accent transition-all font-pixel text-lg"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={handleToggleLocale}
                className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-border hover:border-primary hover:bg-accent transition-all font-pixel text-lg"
              >
                <Languages className="h-5 w-5" />
                {locale.toUpperCase()}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(sidebarVariants({ collapsed: sidebarCollapsed }), 'hidden md:flex flex-col', className)}>
        <div className={cn("flex items-center h-16 border-b-2 border-border transition-all duration-300", sidebarCollapsed ? "justify-center px-0" : "px-4")}>
          <img src="/via-gent-logo.svg" alt="Via-gent" className={cn("transition-all duration-300", sidebarCollapsed ? "w-8 h-8" : "w-8 h-8")} />
          {!sidebarCollapsed && (
            <span className="ml-3 font-bold font-pixel text-xl tracking-tight text-foreground truncate">
              Via-gent
            </span>
          )}
        </div>

        <nav className="flex-1 py-6 space-y-2 px-2 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => handleNavigation(item.path, item.id)}
                    className={cn(navItemVariants({ active: isActive, collapsed: sidebarCollapsed }))}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Active Indicator Pulse */}
                    {isActive && (
                      <div className="absolute right-2 w-1.5 h-1.5 bg-primary animate-pulse" />
                    )}
                  </div>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="font-pixel text-sm border-2 border-border bg-popover text-popover-foreground shadow-xl rounded-none py-2 px-3 ml-2">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        <div className="p-2 border-t-2 border-border space-y-2 bg-sidebar">
          {mounted && (
            <div className={cn("flex items-center gap-2 transition-all", sidebarCollapsed ? "flex-col" : "grid grid-cols-2")}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button onClick={handleToggleTheme} className="flex items-center justify-center h-10 border-2 border-transparent hover:border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                </TooltipTrigger>
                {sidebarCollapsed && <TooltipContent side="right" className="font-pixel text-xs border-2 border-border rounded-none">{isDark ? 'Light' : 'Dark'}</TooltipContent>}
              </Tooltip>

              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button onClick={handleToggleLocale} className="flex items-center justify-center h-10 border-2 border-transparent hover:border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
                    <span className="font-pixel text-sm font-bold">{locale.toUpperCase()}</span>
                  </button>
                </TooltipTrigger>
                {sidebarCollapsed && <TooltipContent side="right" className="font-pixel text-xs border-2 border-border rounded-none">{locale === 'en' ? 'Tiếng Việt' : 'English'}</TooltipContent>}
              </Tooltip>
            </div>
          )}

          <button
            onClick={() => toggleSidebar()}
            className={cn(
              "flex items-center justify-center w-full h-8 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
              sidebarCollapsed ? "" : "border-t border-border/50 pt-2 mt-2"
            )}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
