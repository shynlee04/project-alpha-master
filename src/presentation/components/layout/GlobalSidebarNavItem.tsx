/**
 * @fileoverview Global Sidebar Navigation Item Component
 * @module components/layout/GlobalSidebarNavItem
 * @updated 2026-01-30
 *
 * Individual navigation item for GlobalSidebar
 */

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { SidebarNavItem } from '@/presentation/components/layout/types';
import { Tooltip } from './GlobalSidebarTooltip';

/**
 * Navigation item variants - 8-bit compliant
 * Active state: orange left border, pixel shadow
 */
const navItemVariants = cva(
  'flex items-center gap-3 mx-1 rounded-none cursor-pointer transition-all duration-150 font-mono text-sm group relative select-none',
  {
    variants: {
      active: {
        true: 'border-l-2 border-primary bg-sidebar-accent text-sidebar-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
        false: 'border-l-2 border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
      },
      collapsed: {
        true: 'justify-center px-1 py-3',
        false: 'px-3 py-2.5',
      },
    },
    defaultVariants: {
      active: false,
      collapsed: false,
    },
  }
);

interface NavItemProps {
  item: SidebarNavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ item, isActive, isCollapsed, onClick }) => {
  const Icon = item.icon;

  const content = (
    <div
      onClick={onClick}
      className={cn(navItemVariants({ active: isActive, collapsed: isCollapsed }))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        size={isCollapsed ? 20 : 18}
        className={cn(
          'shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
        )}
        aria-hidden="true"
      />
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}
    </div>
  );

  if (isCollapsed) {
    return <Tooltip content={item.label}>{content}</Tooltip>;
  }

  return content;
};
