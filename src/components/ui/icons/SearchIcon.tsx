import { IconProps, Icon } from './icon'

/**
 * SearchIcon - 8-bit search icon
 * 
 * Used for:
 * - Search inputs
 * - Command palette
 * - File search
 * 
 * Design: 8-bit magnifying glass with squared edges
 */
export function SearchIcon({ size = 'md', className = '', variant = 'default' }: IconProps) {
    return (
        <Icon size={size} className={className} variant={variant} viewBox="0 0 24 24">
            {/* 8-bit search icon - magnifying glass with pixelated lens */}
            <circle
                cx="11"
                cy="11"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
                shapeRendering="crispEdges"
            />
            <rect
                x="14"
                y="14"
                width="6"
                height="2"
                fill="currentColor"
                shapeRendering="crispEdges"
            />
        </Icon>
    )
}
