/**
 * Tooltip Component
 *
 * @epic Epic-28 Story 28-19
 * @description
 * ShadcnUI-style Tooltip component using Radix UI primitives.
 * Provides accessible tooltips with pixel aesthetic styling.
 */

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
    React.ComponentRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={cn(
                // Base styles with 8-bit aesthetic
                "z-50 overflow-hidden px-3 py-1.5 text-xs",
                // Pixel aesthetic - squared corners, 2px border
                "rounded-none border-2 border-border",
                "bg-popover text-popover-foreground",
                // 8-bit pixel shadow
                "shadow-[var(--shadow-pixel-sm)]",
                // 8-bit step animation (animate-pixel-fade-in or instant)
                "animate-pixel-fade-in",
                "data-[state=closed]:opacity-0",
                "data-[side=bottom]:slide-in-from-top-2",
                "data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2",
                "data-[side=top]:slide-in-from-bottom-2",
                className
            )}
            {...props}
        />
    </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
