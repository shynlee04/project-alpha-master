import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHubStore } from '@/lib/state/hub-store';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Home,
  Code2,
  Bot,
  BrainCircuit,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const sidebarVariants = cva(
  'flex flex-col h-screen border-r border-border-200 bg-surface-200 transition-all duration-200 ease-in-out',
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
  'flex items-center gap-3 px-3 py-2 mx-2 rounded-none cursor-pointer transition-colors duration-200 font-mono text-sm group relative',
  {
    variants: {
      active: {
        true: 'bg-accent-500/10 text-accent-500 border-l-2 border-accent-500 pl-[10px]', // Compensate padding for border
        false: 'text-text-200 hover:bg-surface-300 hover:text-text-100 border-l-2 border-transparent',
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

interface HubSidebarProps {
  className?: string;
}

export const HubSidebar: React.FC<HubSidebarProps> = ({ className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useHubStore();

  const navItems = [
    {
      id: 'home',
      label: t('hub.sections.home'),
      icon: Home,
      path: '/hub'
    },
    {
      id: 'ide',
      label: t('hub.sections.ide'),
      icon: Code2,
      path: '/workspace' // Or whatever the IDE route is 
    },
    {
      id: 'agents',
      label: t('hub.sections.agents'),
      icon: Bot,
      path: '/agents'
    },
    {
      id: 'knowledge',
      label: t('hub.sections.knowledge'),
      icon: BrainCircuit,
      path: '/knowledge'
    },
    {
      id: 'settings',
      label: t('hub.sections.settings'),
      icon: Settings,
      path: '/settings'
    },
  ];

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  return (
    <aside className={cn(sidebarVariants({ collapsed: sidebarCollapsed }), className)}>
      {/* Header / Logo Area */}
      <div className={cn("flex items-center h-14 border-b border-border-200", sidebarCollapsed ? "justify-center" : "px-4")}>
        <div className="w-8 h-8 bg-accent-500 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
        {!sidebarCollapsed && (
          <span className="ml-3 font-bold font-pixel text-lg tracking-tight">
            Via-gent
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => handleNavigation(item.path)}
                  className={cn(navItemVariants({ active: isActive, collapsed: sidebarCollapsed }))}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-accent-500" : "text-text-300")} />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}

                  {/* Active Indicator Dot (Collapsed Mode) */}
                  {sidebarCollapsed && isActive && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent-500 rounded-none" />
                  )}
                </div>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right" className="font-mono text-xs rounded-none border-border-200 bg-surface-100">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer / Collapse Toggle */}
      <div className="p-2 border-t border-border-200">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "flex items-center justify-center w-full h-8 rounded-none hover:bg-surface-300 text-text-300 transition-colors",
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
  );
};
