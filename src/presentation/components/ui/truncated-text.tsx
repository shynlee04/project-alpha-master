/**
 * @fileoverview Truncated Text Component
 * 
 * @description
 * Simple component for text that should truncate with an ellipsis.
 * Uses native HTML title attribute for tooltip.
 * 
 * @fix 2026-01-08 - Removed Radix Tooltip to fix "Maximum update depth exceeded" 
 * error caused by React 19 + Radix compose-refs incompatibility.
 */

import { cn } from "@/lib/utils";

interface TruncatedTextProps {
    /** The text content to display */
    text: string;
    /** Optional class name for the text container */
    className?: string;
    /** Optional: if true, skip the native title tooltip */
    noTooltip?: boolean;
}

/**
 * Simple truncated text with native browser tooltip
 * No Radix UI - avoids React 19 ref composition loops
 */
export function TruncatedText({
    text,
    className,
    noTooltip = false,
}: TruncatedTextProps) {
    if (!text) return null;

    return (
        <span
            className={cn("truncate block max-w-full", className)}
            title={noTooltip ? undefined : text}
        >
            {text}
        </span>
    );
}
