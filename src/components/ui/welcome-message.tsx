/**
 * Welcome Message Component
 *
 * @epic Epic-28 Story 28-21
 * @description
 * Welcome message for first-time users with clear next steps.
 * Shows when no project is open and guides users to get started.
 * Follows 8-bit design system with pixel aesthetic.
 */

import * as React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface WelcomeMessageProps {
  /**
   * Title text
   */
  title?: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Primary action text
   */
  actionText?: string;
  
  /**
   * Handler for primary action
   */
  onAction?: () => void;
  
  /**
   * Secondary action text (optional)
   */
  secondaryActionText?: string;
  
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
 * Welcome Message Component
 * 
 * Displays welcome message for first-time users with clear next steps.
 * Includes title, description, and action buttons.
 * Follows 8-bit design system with pixel aesthetic.
 */
export function WelcomeMessage({
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className
}: WelcomeMessageProps) {
  const { t } = useTranslation();
  
  const defaultTitle = title || t("emptyState.welcome.title");
  const defaultDescription = description || t("emptyState.welcome.description");
  const defaultActionText = actionText || t("emptyState.welcome.action");
  
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
        <div className="w-20 h-20 rounded-none bg-primary/10 flex items-center justify-center shadow-sm">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
      </div>
      
      {/* Title */}
      <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
        {defaultTitle}
      </h2>
      
      {/* Description */}
      <p className="text-base text-muted-foreground text-center max-w-2xl mb-8">
        {defaultDescription}
      </p>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button
          onClick={onAction}
          className={cn(
            "px-8 py-4 rounded-none font-bold text-lg",
            "bg-primary text-primary-foreground",
            "hover:scale-105 transition-transform",
            "shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          {defaultActionText}
          <ArrowRight className="inline-block ml-2 w-5 h-5" />
        </button>
        
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className={cn(
              "px-8 py-4 rounded-none font-medium text-lg",
              "bg-transparent border-2 border-border text-foreground",
              "hover:bg-accent transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            {secondaryActionText}
          </button>
        )}
      </div>
      
      {/* Quick Start Guide */}
      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground text-center mb-4">
          Quick Start Guide
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold">1</span>
            </div>
            <span className="text-muted-foreground">Open a project folder</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold">2</span>
            </div>
            <span className="text-muted-foreground">Configure AI agent</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold">3</span>
            </div>
            <span className="text-muted-foreground">Start coding with AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

WelcomeMessage.displayName = "Welcome Message";
