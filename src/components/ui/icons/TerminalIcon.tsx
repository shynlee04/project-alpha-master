import React from 'react';
import { IconProps } from './icon';

/**
 * TerminalIcon - 8-bit styled terminal icon
 * Used for terminal panel and command execution
 */
export const TerminalIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  'aria-label': ariaLabel = 'Terminal',
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
      {/* Terminal window frame - 8-bit squared corners */}
      <rect x="2" y="4" width="20" height="16" stroke={color} strokeWidth="2" fill="none" />
      {/* Terminal title bar - 8-bit style */}
      <rect x="4" y="6" width="16" height="2" fill={color} />
      {/* Command prompt cursor - 8-bit blinking style */}
      <rect x="6" y="12" width="2" height="2" fill={color} />
      <rect x="10" y="12" width="2" height="2" fill={color} />
    </svg>
  );
};
