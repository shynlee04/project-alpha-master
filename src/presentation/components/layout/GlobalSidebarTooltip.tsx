/**
 * @fileoverview Global Sidebar Tooltip Component
 * @module components/layout/GlobalSidebarTooltip
 * @updated 2026-01-30
 *
 * Tooltip for collapsed sidebar items
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    left: 'right-full mr-2',
    right: 'left-full ml-2',
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 bg-popover text-popover-foreground text-xs font-mono rounded-none border-2 border-border whitespace-nowrap pointer-events-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
            positionClasses[side]
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};
