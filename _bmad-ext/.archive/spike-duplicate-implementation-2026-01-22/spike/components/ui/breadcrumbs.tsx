/**
 * Breadcrumbs Component
 *
 * @epic Epic-28 Story 28-20
 * @description
 * Navigation breadcrumbs showing current path with clickable segments.
 * Supports truncation, hover for full path, keyboard navigation.
 * Follows 8-bit design system with pixel aesthetic.
 */

import * as React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (path: string, index: number) => void;
}

/**
 * Breadcrumbs Component
 * 
 * Displays navigation path as clickable segments with truncation for long paths.
 * Shows full path on hover. Supports keyboard navigation (Cmd+Left).
 */
export function Breadcrumbs({ items, className, onNavigate }: BreadcrumbsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigate?.(items[index].path || "", index);
    }
  };

  return (
    <nav
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm",
        "bg-card border-b border-border",
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight
              className="w-4 h-4 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
          )}
          
          {index === 0 && (
            <Home className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          
          <button
            onClick={() => onNavigate?.(item.path || "", index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-none",
              "hover:bg-accent transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              item.active
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={item.active ? "page" : undefined}
            title={item.label}
          >
            <span className="truncate max-w-[200px]">
              {item.label}
            </span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

Breadcrumbs.displayName = "Breadcrumbs";
