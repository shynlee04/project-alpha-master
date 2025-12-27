import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Home,
  Folder,
  Bot,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLayoutStore } from '@/lib/state/layout-store';

const sidebarVariants = cva(
  'flex flex-col h-screen border-r border-gray-800 bg-gray-900 transition-all duration-300 ease-in-out',
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

const navItemVariants = cva(
  'flex items-center gap-3 px-3 py-2 mx-2 rounded-none cursor-pointer transition-colors duration-300 font-mono text-sm group relative',
  {
    variants: {
      active: {
        true: 'bg-gray-800 text-white border-l-2 border-gray-600 pl-[10px]',
        false: 'text-gray-300 hover:bg-gray-800 hover:text-gray-100 border-l-2 border-transparent',
      },
      collapsed: {
        true: 'justify-center px-2',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      collapsed: false,
    },
  }
);

const mobileSidebarVariants = cva(
  'fixed inset-y-0 left-0 z-50 h-screen w-[280px] bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out',
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
  'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
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
    activeNavItem,
    toggleSidebar,
    setMobileMenuOpen,
    setActiveNavItem,
  } = useLayoutStore();

  const navItems = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
      path: '/',
    },
    {
      id: 'projects' as const,
      label: 'Projects',
      icon: Folder,
      path: '/workspace',
    },
    {
      id: 'agents' as const,
      label: 'Agents',
      icon: Bot,
      path: '/agents',
    },
    {
      id: 'quality' as const,
      label: 'Quality',
      icon: ShieldCheck,
      path: '/quality',
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ];

  const handleNavigation = (path: string, itemId: string) => {
    navigate({ to: path });
    setActiveNavItem(itemId as any);
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div className={backdropVariants({ open: sidebarMobileOpen })} onClick={handleCloseMobileMenu} />

      {/* Mobile Sidebar */}
      <aside className={cn(mobileSidebarVariants({ open: sidebarMobileOpen }), 'md:hidden', className)}>
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between h-14 border-b border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
            <span className="font-bold font-pixel text-lg tracking-tight text-gray-100">
              Via-gent
            </span>
          </div>
          <button
            onClick={handleCloseMobileMenu}
            className="flex items-center justify-center h-8 w-8 rounded-none hover:bg-gray-800 text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Navigation Items */}
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.id}
                onClick={() => handleNavigation(item.path, item.id)}
                className={cn(navItemVariants({ active: isActive, collapsed: false }))}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-gray-300")} />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(sidebarVariants({ collapsed: sidebarCollapsed }), 'hidden md:flex', className)}>
        {/* Desktop Header / Logo Area */}
        <div className={cn("flex items-center h-14 border-b border-gray-800", sidebarCollapsed ? "justify-center" : "px-4")}>
          <div className="w-8 h-8 bg-gray-600 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
          {!sidebarCollapsed && (
            <span className="ml-3 font-bold font-pixel text-lg tracking-tight text-gray-100">
              Via-gent
            </span>
          )}
        </div>

        {/* Desktop Navigation Items */}
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => handleNavigation(item.path, item.id)}
                    className={cn(navItemVariants({ active: isActive, collapsed: sidebarCollapsed }))}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-gray-300")} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Active Indicator Dot (Collapsed Mode) */}
                    {sidebarCollapsed && isActive && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-600 rounded-none" />
                    )}
                  </div>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="font-mono text-xs rounded-none border-gray-800 bg-gray-900">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Desktop Footer / Collapse Toggle */}
        <div className="p-2 border-t border-gray-800">
          <button
            onClick={handleToggleSidebar}
            className={cn(
              "flex items-center justify-center w-full h-8 rounded-none hover:bg-gray-800 text-gray-300 transition-colors",
              sidebarCollapsed ? "" : "px-2"
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : (
              <div className="flex items-center w-full">
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2 text-xs font-mono ml-auto opacity-70">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
