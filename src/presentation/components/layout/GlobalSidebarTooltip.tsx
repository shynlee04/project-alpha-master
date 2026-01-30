/**
 * @fileoverview Global Sidebar Tooltip Component
 * @module components/layout/GlobalSidebarTooltip
 * @updated 2026-01-30
 *
 * Tooltip for collapsed sidebar items with viewport boundary detection
 */

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Calculate optimal tooltip position based on viewport boundaries
 * Flips tooltip if it would overflow viewport edges
 */
function calculateOptimalPosition(
  triggerRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  preferredSide: 'left' | 'right' | 'top' | 'bottom'
): { side: 'left' | 'right' | 'top' | 'bottom'; style: React.CSSProperties } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 8; // Minimum padding from viewport edges

  // Calculate positions for each side
  const positions = {
    left: {
      left: triggerRect.left - tooltipWidth - 8,
      top: triggerRect.top + (triggerRect.height - tooltipHeight) / 2,
    },
    right: {
      left: triggerRect.right + 8,
      top: triggerRect.top + (triggerRect.height - tooltipHeight) / 2,
    },
    top: {
      left: triggerRect.left + (triggerRect.width - tooltipWidth) / 2,
      top: triggerRect.top - tooltipHeight - 8,
    },
    bottom: {
      left: triggerRect.left + (triggerRect.width - tooltipWidth) / 2,
      top: triggerRect.bottom + 8,
    },
  };

  // Check if preferred side would overflow
  const preferred = positions[preferredSide];
  const wouldOverflow =
    preferred.left < padding ||
    preferred.left + tooltipWidth > viewportWidth - padding ||
    preferred.top < padding ||
    preferred.top + tooltipHeight > viewportHeight - padding;

  if (!wouldOverflow) {
    return { side: preferredSide, style: positions[preferredSide] };
  }

  // Find first non-overflowing position
  const fallbackOrder: Array<'left' | 'right' | 'top' | 'bottom'> =
    preferredSide === 'right' ? ['left', 'bottom', 'top', 'right'] :
    preferredSide === 'left' ? ['right', 'bottom', 'top', 'left'] :
    preferredSide === 'top' ? ['bottom', 'right', 'left', 'top'] :
    ['top', 'right', 'left', 'bottom'];

  for (const fallbackSide of fallbackOrder) {
    const pos = positions[fallbackSide];
    const overflows =
      pos.left < padding ||
      pos.left + tooltipWidth > viewportWidth - padding ||
      pos.top < padding ||
      pos.top + tooltipHeight > viewportHeight - padding;

    if (!overflows) {
      return { side: fallbackSide, style: pos };
    }
  }
  // If all overflow, use preferred but clamp to viewport
  return {
    side: preferredSide,
    style: {
      left: Math.max(padding, Math.min(positions[preferredSide].left, viewportWidth - tooltipWidth - padding)),
      top: Math.max(padding, Math.min(positions[preferredSide].top, viewportHeight - tooltipHeight - padding)),
    },
  };
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [optimalSide, setOptimalSide] = useState(side);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    left: 'right-full mr-2',
    right: 'left-full ml-2',
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const { side: newSide, style } = calculateOptimalPosition(
      triggerRect,
      tooltipRect.width,
      tooltipRect.height,
      side
    );

    setOptimalSide(newSide);
    setTooltipStyle(style);
  }, [side]);

  const handleShow = useCallback(() => {
    setIsVisible(true);
    // Use requestAnimationFrame to ensure tooltip is rendered before calculating position
    requestAnimationFrame(() => {
      updatePosition();
    });
  }, [updatePosition]);

  const handleHide = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Update position on resize
  React.useEffect(() => {
    if (!isVisible) return;

    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible, updatePosition]);

  return (
    <div
      ref={triggerRef}
      className="relative flex items-center justify-center"
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
      onTouchStart={handleShow}
      onTouchEnd={handleHide}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-50 px-2 py-1 bg-popover text-popover-foreground text-xs font-mono rounded-none border-2 border-border whitespace-nowrap pointer-events-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
            positionClasses[optimalSide]
          )}
          style={tooltipStyle}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};
