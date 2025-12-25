/**
 * Collapsible Section Component
 *
 * @epic Epic-23 Story P1.3
 * @description
 * Progressive disclosure component for managing information density.
 * Uses CVA patterns from P1.2 with 8-bit design system styling.
 * Supports i18n for internationalization.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/design-tokens.css";

/**
 * Collapsible section variants using CVA
 */
const collapsibleVariants = cva(
  [
    "flex flex-col border-b border-border",
    "transition-all duration-200 ease-in-out",
  ],
  {
    variants: {
      variant: {
        default: "bg-background",
        secondary: "bg-secondary/30",
        accent: "bg-accent/20",
      },
      size: {
        default: "py-3",
        compact: "py-2",
        spacious: "py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  variant?: VariantProps<typeof collapsibleVariants>["variant"];
  size?: VariantProps<typeof collapsibleVariants>["size"];
  onToggle?: (expanded: boolean) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

/**
 * CollapsibleSection - Progressive disclosure for managing information density
 *
 * Provides expand/collapse functionality for complex UI sections.
 * Maintains 8-bit aesthetic with smooth animations.
 */
export function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  variant = "default",
  size = "default",
  onToggle,
  className,
  headerClassName,
  contentClassName,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <div className={cn(collapsibleVariants({ variant, size }), className)}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between w-full text-left",
          "hover:bg-accent/50 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "px-4 py-2",
          headerClassName
        )}
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-semibold text-foreground">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
          contentClassName
        )}
        role="region"
        aria-hidden={!isExpanded}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

CollapsibleSection.displayName = "CollapsibleSection";
