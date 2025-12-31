/**
 * @fileoverview Truncated Text Component
 * 
 * @description
 * Standardization component for text that should truncate with an ellipsis
 * and show a tooltip on hover.
 */

import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/presentation/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
    /** The text content to display and put in tooltip */
    text: string;
    /** Optional class name for the text container */
    className?: string;
    /** Optional delay before showing tooltip (ms), defaults to 300 */
    delayDuration?: number;
    /** Optional side for the tooltip */
    side?: "top" | "right" | "bottom" | "left";
    /** Optional extra content for the tooltip, distinct from the text itself */
    tooltipContent?: React.ReactNode;
    /** If true, forces tooltip to alwaysrender (or conditionally based on external logic) */
    forceTooltip?: boolean;
}

export function TruncatedText({
    text,
    className,
    delayDuration = 300,
    side = "top",
    tooltipContent,
}: TruncatedTextProps) {
    // If no text, just return null to be safe
    if (!text) return null;

    return (
        <TooltipProvider delayDuration={delayDuration}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        className={cn("truncate block max-w-full", className)}
                        suppressHydrationWarning
                    >
                        {text}
                    </span>
                </TooltipTrigger>
                <TooltipContent side={side} className="font-mono text-xs max-w-xs break-words">
                    {tooltipContent || text}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
