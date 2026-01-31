/**
 * @fileoverview Truncated Text Component
 *
 * @description
 * Component for text that should truncate with an ellipsis.
 * Supports single-line (truncate) and multi-line (line-clamp) truncation.
 * Uses native HTML title attribute for tooltip.
 *
 * @fix 2026-01-08 - Removed Radix Tooltip to fix "Maximum update depth exceeded"
 * error caused by React 19 + Radix compose-refs incompatibility.
 * @enhance 2026-01-12 - Added multi-line truncation support with `lines` prop
 */

import { cn } from "@/lib/utils";

interface TruncatedTextProps {
    /** The text content to display */
    text: string;
    /** Optional class name for the text container */
    className?: string;
    /** Optional: if true, skip the native title tooltip */
    noTooltip?: boolean;
    /** Number of lines to show before truncating (1 = single line, 2+ = multi-line) */
    lines?: 1 | 2 | 3;
}

/**
 * Truncated text with native browser tooltip
 * - Single line: uses `truncate` class
 * - Multi line: uses `line-clamp-N` class
 * - No Radix UI - avoids React 19 ref composition loops
 */
export function TruncatedText({
    text,
    className,
    noTooltip = false,
    lines = 1,
}: TruncatedTextProps) {
    if (!text) return null;

    // Single line uses truncate, multi-line uses line-clamp
    const truncateClass = lines === 1 ? "truncate" : `line-clamp-${lines}`;

    return (
        <span
            className={cn(truncateClass, "block max-w-full", className)}
            title={noTooltip ? undefined : text}
        >
            {text}
        </span>
    );
}
