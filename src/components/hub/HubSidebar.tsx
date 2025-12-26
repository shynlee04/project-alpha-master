/**
 * Hub Sidebar Component
 * 
 * Collapsible main sidebar with icon-only navigation.
 * Provides navigation between hub sections (home, ide, agents, knowledge, settings).
 * 
 * @file HubSidebar.tsx
 * @created 2025-12-26T12:50:00Z
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHubStore, HubSection } from '@/lib/state/hub-store';
import { 
  Home, 
  Code2, 
  Bot, 
  BrainCircuit, 
  Settings 
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens from 8-bit design system
const SIDEBAR_WIDTH_COLLAPSED = 'var(--sidebar-width-collapsed, 64px)';
const SIDEBAR_WIDTH_EXPANDED = 'var(--sidebar-width-expanded, 256px)';
const TRANSITION_DURATION = 'var(--transition-duration-base, 200ms)';

const sidebarVariants = cva(
  'flex flex-col border-r transition-all ease-in-out',
  {
    variants: {
      collapsed: {
        true: 'w-[64px]',
        false: 'w-[256px]',
      },
    },
  }
);

const navItemVariants = cva(
  'flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200',
  {
    variants: {
      active: {
        true: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
        false: 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
      },
      collapsed: {
        true: 'justify-center px-0',
        false: 'justify-start px-4',
      },
    },
    compoundVariants: [
      {
        active: true,
        collapsed: true,
        className: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
      },
    ],
    defaultVariants: {
      active: false,
      collapsed: false,
    },
  }
);

interface HubSidebarProps {
  className?: ClassValue;
}

export const HubSidebar: React.FC<HubSidebarProps> = ({ className }) => {
  const { t } = useTranslation('hub');
  const { activeSection, sidebarCollapsed, toggleSidebar, setActiveSection } = useHubStore();

  const navItems: { id: HubSection; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <Home size={20} />, label: t('home') },
    { id: 'ide', icon: <Code2 size={20} />, label: t('ide') },
    { id: 'agents', icon: <Bot size={20} />, label: t('agents') },
    { id: 'knowledge', icon: <BrainCircuit size={20} />, label: t('knowledge') },
    { id: 'settings', icon: <Settings size={20} />, label: t('settings') },
  ];

  const handleNavClick = (section: HubSection) => {
    setActiveSection(section);
  };

  const handleToggleClick = () => {
    toggleSidebar();
  };

  const handleKeyDown = (event: React.KeyboardEvent, section: HubSection) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveSection(section);
    }
  };

  return (
    <aside
      className={twMerge(
        sidebarVariants({ collapsed: sidebarCollapsed }),
        'bg-[var(--color-background)] border-[var(--color-border)]',
      )}
      style={{
        transitionDuration: TRANSITION_DURATION,
      }}
      role="navigation"
      aria-label={t('sidebar.toggle')}
    >
      {/* Logo area */}
      <div className="flex items-center justify-center py-4 border-b border-[var(--color-border)]">
        <div className="text-[var(--color-primary)] font-bold text-xl">
          VG
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4" role="menu">
        <ul className="flex flex-col gap-2" role="none">
          {navItems.map((item) => (
            <li key={item.id} role="none">
              <button
                className={twMerge(
                  navItemVariants({ 
                    active: activeSection === item.id,
                    collapsed: sidebarCollapsed 
                  })
                )}
                onClick={() => handleNavClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                role="menuitem"
                aria-current={activeSection === item.id ? 'true' : undefined}
                aria-label={item.label}
                tabIndex={0}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle button */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <button
          onClick={handleToggleClick}
          className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] transition-all duration-200"
          aria-label={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          aria-expanded={!sidebarCollapsed}
          tabIndex={0}
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}
          >
            {sidebarCollapsed ? (
              <polyline points="9 18 15 12 21 12" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>
    </aside>
  );
};
