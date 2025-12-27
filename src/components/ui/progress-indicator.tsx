/**
 * Progress Indicator Component
 *
 * @epic Epic-28 Story 28-21
 * @description
 * Visual progress indicator for multi-step workflows (e.g., file sync, agent operations).
 * Shows current step, loading state, and completion status.
 * Follows 8-bit design system with pixel aesthetic.
 */

import * as React from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface ProgressIndicatorProps {
  /**
   * Current step number (1-indexed)
   */
  current: number;
  
  /**
   * Total number of steps
   */
  total: number;
  
  /**
   * Loading state text (optional)
   */
  loadingText?: string;
  
  /**
   * Status type
   */
  status?: "loading" | "success" | "error" | "idle";
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Progress Indicator Component
 * 
 * Displays visual progress for multi-step workflows.
 * Shows step indicator (e.g., "Step 2 of 5") and status icon.
 */
export function ProgressIndicator({
  current,
  total,
  loadingText,
  status = "idle",
  className
}: ProgressIndicatorProps) {
  const { t } = useTranslation();
  
  const progressPercentage = Math.round((current / total) * 100);
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 bg-card border-b border-border",
        className
      )}
    >
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">
          {t("progress.step", { current, total })}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="flex-1 h-2 bg-muted rounded-none overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            status === "loading" && "bg-primary animate-pulse",
            status === "success" && "bg-green-500",
            status === "error" && "bg-red-500",
            status === "idle" && "bg-primary"
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Status Icon */}
      <div className="flex items-center gap-2">
        {status === "loading" && (
          <>
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            {loadingText && (
              <span className="text-sm text-muted-foreground">{loadingText}</span>
            )}
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500 font-medium">
              {t("progress.ready")}
            </span>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">
              Error
            </span>
          </>
        )}
      </div>
    </div>
  );
}

ProgressIndicator.displayName = "Progress Indicator";
