import { IconProps, Icon } from './icon'

/**
 * MinusIcon - 8-bit minus/minimize icon
 * 
 * Used for:
 * - Minimize buttons
 * - Remove actions
 * - Collapse controls
 * 
 * Design: 8-bit pixel-perfect horizontal line
 */
export function MinusIcon({ size = 'md', className = '', variant = 'default' }: IconProps) {
    return (
        <Icon size={size} className={className} variant={variant} viewBox="0 0 24 24">
            {/* 8-bit minus icon - horizontal line with squared ends */}
            <rect
                x="4"
                y="11"
                width="16"
                height="2"
                fill="currentColor"
                shapeRendering="crispEdges"
            />
        </Icon>
    )
}
