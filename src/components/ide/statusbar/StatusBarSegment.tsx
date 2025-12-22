/**
 * @fileoverview StatusBar Segment Wrapper Component
 * @module components/ide/statusbar/StatusBarSegment
 * 
 * @epic Epic-28 Story 28-18
 * 
 * Generic wrapper for StatusBar segments with consistent styling and dividers.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface StatusBarSegmentProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Show divider on left side */
    dividerLeft?: boolean;
    /** Show divider on right side */
    dividerRight?: boolean;
    /** Clickable segment */
    clickable?: boolean;
    /** Segment region */
    region?: 'left' | 'right';
}

// ============================================================================
// Component
// ============================================================================

/**
 * StatusBarSegment - Wrapper for individual StatusBar items
 * 
 * Provides consistent spacing, dividers, and hover states for StatusBar segments.
 */
export function StatusBarSegment({
    children,
    className,
    dividerLeft = false,
    dividerRight = false,
    clickable = false,
    region = 'left',
    onClick,
    ...props
}: StatusBarSegmentProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-1.5 px-2 h-full',
                'text-[10px] font-mono text-white/90',
                dividerLeft && 'border-l border-white/20',
                dividerRight && 'border-r border-white/20',
                clickable && 'cursor-pointer hover:bg-white/10 transition-colors',
                className
            )}
            onClick={onClick}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    );
}
