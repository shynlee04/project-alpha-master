import React from 'react';
import { IconProps } from './icon';

/**
 * ChatIcon - 8-bit chat/message icon
 * 
 * Design: 8-bit speech bubble with squared corners
 * Usage: Chat panel toggle, messaging interface
 */
export function ChatIcon({ size = 24, color = 'currentColor', className = '', ...props }: IconProps): React.JSX.Element {
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
            {/* Speech bubble body - 8-bit squared corners */}
            <path d="M4 4h16v12h-6v4h-4v-4h-6v-12z" />
            
            {/* Message lines */}
            <path d="M6 8h12" />
            <path d="M6 12h8" />
        </svg>
    );
}
