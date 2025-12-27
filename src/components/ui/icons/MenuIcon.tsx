import React from 'react';
import { IconProps } from './icon';

/**
 * MenuIcon - 8-bit styled hamburger menu icon
 * Used for mobile navigation and panel toggles
 */
export const MenuIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  'aria-label': ariaLabel = 'Menu',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      role="img"
    >
      {/* Top bar - 8-bit squared corners */}
      <rect x="2" y="5" width="20" height="2" fill={color} />
      {/* Middle bar - 8-bit squared corners */}
      <rect x="2" y="11" width="20" height="2" fill={color} />
      {/* Bottom bar - 8-bit squared corners */}
      <rect x="2" y="17" width="20" height="2" fill={color} />
    </svg>
  );
};
