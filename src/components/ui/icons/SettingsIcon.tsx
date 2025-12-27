import React from 'react';
import { IconProps } from './icon';

/**
 * SettingsIcon - 8-bit styled settings/gear icon
 * Used for configuration and settings panels
 */
export const SettingsIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  'aria-label': ariaLabel = 'Settings',
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
      {/* Gear outer ring - 8-bit style */}
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="2" fill="none" />
      {/* Gear teeth - 8-bit squares */}
      <rect x="11" y="3" width="2" height="2" fill={color} />
      <rect x="17" y="7" width="2" height="2" fill={color} />
      <rect x="17" y="15" width="2" height="2" fill={color} />
      <rect x="11" y="19" width="2" height="2" fill={color} />
      <rect x="5" y="15" width="2" height="2" fill={color} />
      <rect x="5" y="7" width="2" height="2" fill={color} />
      {/* Center hub */}
      <rect x="10" y="10" width="4" height="4" fill={color} />
    </svg>
  );
};
