import React from 'react';
import { IconProps } from './icon';

/**
 * PlusIcon - 8-bit plus/add icon
 * 
 * Design: 8-bit plus sign with squared corners
 * Usage: New file button, add controls
 */
export function PlusIcon({ size = 24, color = 'currentColor', className = '', ...props }: IconProps): React.JSX.Element {
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
            {/* Horizontal bar */}
            <path d="M4 12h16" />
            
            {/* Vertical bar */}
            <path d="M12 4v16" />
        </svg>
    );
}
