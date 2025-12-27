import React from 'react';
import { IconProps } from './icon';

/**
 * AIIcon - 8-bit styled AI agent icon
 * Used for AI agent features and chat interface
 */
export const AIIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  'aria-label': ariaLabel = 'AI Agent',
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
      {/* Brain/AI head - 8-bit squared corners */}
      <path
        d="M12 2 C7 2 3 6 3 9 V15 C3 18 7 18 12 18 C17 18 21 15 21 9 V15 C21 6 17 2 12 2 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Circuit patterns - 8-bit style */}
      <rect x="7" y="8" width="2" height="2" fill={color} />
      <rect x="15" y="8" width="2" height="2" fill={color} />
      <rect x="9" y="12" width="2" height="2" fill={color} />
      <rect x="13" y="12" width="2" height="2" fill={color} />
    </svg>
  );
};
