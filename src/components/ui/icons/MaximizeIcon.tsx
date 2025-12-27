/**
 * @fileoverview Maximize Icon - 8-bit styled maximize window icon
 * @module components/ui/icons
 * 
 * Squared maximize icon for panel expansion.
 */

import { Icon } from './icon';

export function MaximizeIcon({ className, size = 'md', color = 'default' }: IconProps) {
    return (
        <svg
            className={className}
            width={size === 'sm' ? 16 : size === 'lg' ? 32 : 24}
            height={size === 'sm' ? 16 : size === 'lg' ? 32 : 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="square"
            strokeLinejoin="miter"
            shapeRendering="crispEdges"
        >
            {/* 8-bit maximize icon - two outward arrows */}
            <path d="M2 8h20" />
            <path d="M8 2v20" />
            <path d="M16 6l4-4" />
            <path d="M6 6l4 4" />
        </svg>
    );
}
