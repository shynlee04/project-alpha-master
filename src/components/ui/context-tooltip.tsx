/**
 * Context-Aware Tooltip Component
 *
 * @epic Epic-23 Story P1.3
 * @description
 * Context-aware tooltip that provides helpful information about UI elements.
 * Uses Radix UI Tooltip with 8-bit design system styling.
 * Supports i18n for internationalization.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import "@/styles/design-tokens.css";

/**
 * Tooltip variants using CVA for 8-bit design system
 */
const tooltipVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-none border-2",
    "bg-popover text-popover-foreground",
    "px-3 py-1.5 text-xs font-pixel",
    "data-[state=closed]:hidden",
    "data-[state=delayed-open]:data-[state=closed]:animate-in",
    "data-[state=open]:animate-in",
    "data-[state=instant-open]:animate-in",
    "z-50",
  ],
  {
    variants: {
      variant: {
        default: "border-border",
        primary: "border-primary bg-primary/90 text-primary-foreground",
        accent: "border-accent bg-accent/90 text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ContextTooltipProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  variant?: VariantProps<typeof tooltipVariants>["variant"];
  delayDuration?: number;
  skipDelayDuration?: number;
}

/**
 * ContextTooltip - Context-aware tooltip with 8-bit styling
 *
 * Provides helpful information about UI elements on hover/focus.
 * Supports keyboard navigation and screen readers.
 */
export function ContextTooltip({
  children,
  content,
  side = "top",
  align = "center",
  variant = "default",
  delayDuration = 400,
  skipDelayDuration = 300,
  ...props
}: ContextTooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      <TooltipPrimitive.Root {...props}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={tooltipVariants({ variant })}
            sideOffset={8}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-border" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

ContextTooltip.displayName = "ContextTooltip";
