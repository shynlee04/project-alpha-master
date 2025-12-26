import React from 'react';
import { IconProps } from './icon';

/**
 * RefreshIcon - 8-bit refresh/sync icon
 * 
 * Design: 8-bit circular arrow with squared corners
 * Usage: Sync now button, refresh controls
 */
export function RefreshIcon({ size = 24, color = 'currentColor', className = '', ...props }: IconProps): React.JSX.Element {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            className={className}
            {...props}
        >
            {/* Circular path - 8-bit squared corners */}
            <path d="M4 12a8 8 0 0 1 1 8 8v0a8 8 0 0 1 -1 8 8" />
            
            {/* Arrow head - 8-bit squared */}
            <path d="M16 4h4v4" />
            <path d="M20 4l-4 4" />
        </svg>
    );
}
