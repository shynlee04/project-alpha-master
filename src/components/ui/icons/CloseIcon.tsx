import React from 'react';
import { IconProps } from './icon';

/**
 * CloseIcon - 8-bit styled X close icon
 * Used for closing panels, dialogs, tabs
 */
export const CloseIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  'aria-label': ariaLabel = 'Close',
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
      {/* Top-left to bottom-right - 8-bit squared corners */}
      <rect x="5" y="5" width="14" height="2" fill={color} transform="rotate(45 12 12)" />
      {/* Top-right to bottom-left - 8-bit squared corners */}
      <rect x="5" y="17" width="14" height="2" fill={color} transform="rotate(-45 12 12)" />
    </svg>
  );
};
