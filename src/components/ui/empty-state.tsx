/**
 * Empty State Component
 *
 * @epic Epic-28 Story 28-21
 * @description
 * Empty state guidance when no content exists (no projects, no files, no agents, etc.).
 * Provides clear next steps with primary CTA button.
 * Follows 8-bit design system with pixel aesthetic.
 */

import * as React from "react";
import { Plus, FolderOpen, MessageSquare, Bot, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface EmptyStateProps {
  /**
   * Icon to display in empty state
   * Options: "folder" (default), "plus", "message-square", "bot", "search"
   */
  icon?: "folder" | "plus" | "message-square" | "bot" | "search";
  
  /**
   * Main heading text
   */
  title: string;
  
  /**
   * Descriptive subtitle text
   */
  description: string;
  
  /**
   * Primary action button text
   */
  actionText: string;
  
  /**
   * Optional secondary action text
   */
  secondaryActionText?: string;
  
  /**
   * Handler for primary action
   */
  onAction: () => void;
  
  /**
   * Handler for secondary action (optional)
   */
  onSecondaryAction?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Empty State Component
 * 
 * Displays guidance when no content exists with clear next steps.
 * Includes icon, title, description, and primary CTA button.
 * Follows 8-bit design system with pixel aesthetic.
 */
export function EmptyState({
  icon = "folder",
  title,
  description,
  actionText,
  secondaryActionText,
  onAction,
  onSecondaryAction,
  className
}: EmptyStateProps) {
  const { t } = useTranslation();
  
  const getIcon = () => {
    switch (icon) {
      case "folder":
        return <FolderOpen className="w-16 h-16 text-muted-foreground" />;
      case "plus":
        return <Plus className="w-16 h-16 text-muted-foreground" />;
      case "message-square":
        return <MessageSquare className="w-16 h-16 text-muted-foreground" />;
      case "bot":
        return <Bot className="w-16 h-16 text-muted-foreground" />;
      case "search":
        return <Search className="w-16 h-16 text-muted-foreground" />;
      default:
        return <FolderOpen className="w-16 h-16 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 rounded-none border-2 border-dashed border-border",
        "bg-card",
        className
      )}
    >
      {/* Icon */}
      <div className="mb-6">
        {getIcon()}
      </div>
      
      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
        {title}
      </h2>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
        {description}
      </p>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <button
          onClick={onAction}
          className={cn(
            "px-6 py-3 rounded-none font-bold",
            "bg-primary text-primary-foreground",
            "hover:scale-105 transition-transform",
            "shadow-[2px_2px_0px_rgba(0,0,0,0.2)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          {actionText}
        </button>
        
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className={cn(
              "px-6 py-3 rounded-none font-medium",
              "bg-transparent border-2 border-border text-foreground",
              "hover:bg-accent transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
}

EmptyState.displayName = "Empty State";
