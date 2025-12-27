import React from 'react';
import { IconProps } from './icon';

/**
 * FileIcon - 8-bit styled file icon
 * Used for file operations and file tree
 */
export const FileIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  'aria-label': ariaLabel = 'File',
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
      {/* File body - 8-bit squared corners */}
      <path
        d="M4 2 H14 L18 8 V22 H4 V2 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Folded corner - 8-bit style */}
      <path
        d="M14 2 V8 H18"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};
