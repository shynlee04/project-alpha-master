/**
 * @fileoverview Source Type Icons (PDF, URL, Text)
 * @module components/ui/icons/source-icons
 * @governance EPIC-6-2
 *
 * 8-bit styled icons for source types in knowledge management.
 */

import React from 'react';

/**
 * Props for source icons (uses numeric size for direct SVG sizing)
 */
interface SourceIconProps {
    pixelSize?: number;
    className?: string;
    color?: string;
    'aria-label'?: string;
}

/**
 * PDFIcon - 8-bit styled PDF document icon
 * Represents PDF source type in knowledge management
 */
export const PDFIcon: React.FC<SourceIconProps> = ({
    pixelSize = 24,
    className = '',
    color = 'currentColor',
    'aria-label': ariaLabel = 'PDF Document',
}) => {
    return (
        <svg
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label={ariaLabel}
            role="img"
        >
            {/* Document body */}
            <path
                d="M4 2 H14 L18 6 V22 H4 V2 Z"
                stroke={color}
                strokeWidth="2"
                fill="none"
            />
            {/* Folded corner */}
            <path
                d="M14 2 V6 H18"
                stroke={color}
                strokeWidth="2"
                fill="none"
            />
            {/* PDF text label */}
            <path
                d="M7 12 H9 M7 15 H11 M7 9 H13"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="square"
            />
        </svg>
    );
};

/**
 * URLIcon - 8-bit styled URL/link icon
 * Represents URL source type in knowledge management
 */
export const URLIcon: React.FC<SourceIconProps> = ({
    pixelSize = 24,
    className = '',
    color = 'currentColor',
    'aria-label': ariaLabel = 'URL Source',
}) => {
    return (
        <svg
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label={ariaLabel}
            role="img"
        >
            {/* Globe circle */}
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke={color}
                strokeWidth="2"
                fill="none"
            />
            {/* Horizontal lines */}
            <path
                d="M3 12 H21"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="square"
            />
            <path
                d="M3 7 H21"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="square"
            />
            <path
                d="M3 17 H21"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="square"
            />
        </svg>
    );
};

/**
 * TextIcon - 8-bit styled text file icon
 * Represents text source type in knowledge management
 */
export const TextIcon: React.FC<SourceIconProps> = ({
    pixelSize = 24,
    className = '',
    color = 'currentColor',
    'aria-label': ariaLabel = 'Text Source',
}) => {
    return (
        <svg
            width={pixelSize}
            height={pixelSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label={ariaLabel}
            role="img"
        >
            {/* Document body */}
            <path
                d="M4 2 H16 L20 6 V22 H4 V2 Z"
                stroke={color}
                strokeWidth="2"
                fill="none"
            />
            {/* Folded corner */}
            <path
                d="M16 2 V6 H20"
                stroke={color}
                strokeWidth="2"
                fill="none"
            />
            {/* Text lines */}
            <path
                d="M7 10 H17 M7 14 H13 M7 18 H11"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="square"
            />
        </svg>
    );
};
