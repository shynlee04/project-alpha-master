/**
 * @fileoverview Model Loading Spinner Component
 * @module components/ui/ModelLoadingSpinner
 *
 * Loading feedback for expensive model fetching operations from LLM providers.
 * Provides clear visual feedback during async fetchModels() calls.
 *
 * @epic P0-3 - UI/UX Gap Analysis
 * @story Missing loading feedback during model fetching
 * @constitution P0 - User Feedback & Accessibility
 *
 * January 2026 Patterns:
 * - Single responsibility (loading state display only)
 * - Accessible status updates (ARIA live regions)
 * - 8-bit gaming aesthetic (pixel art animation)
 * - Clear error states with retry actions
 */

import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for ModelLoadingSpinner component
 */
export interface ModelLoadingSpinnerProps {
  /** Provider name for display (e.g., "OpenAI", "Anthropic") */
  providerName: string;

  /** Loading state */
  isLoading: boolean;

  /** Error message if fetch failed */
  error?: string;

  /** Retry callback (shown in error state) */
  onRetry?: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Model Loading Spinner Component
 *
 * Displays an 8-bit styled loading animation during model fetching.
 * Shows error state with retry button if fetch fails.
 *
 * @example
 * ```tsx
 * <ModelLoadingSpinner
 *   providerName="OpenAI"
 *   isLoading={isFetching}
 *   error={fetchError}
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function ModelLoadingSpinner({
  providerName,
  isLoading,
  error,
  onRetry,
  className,
}: ModelLoadingSpinnerProps) {
  const { t } = useTranslation();

  // Don't render if not loading and no error
  if (!isLoading && !error) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={
        error
          ? t('providers.modelLoadError', { provider: providerName })
          : t('providers.modelLoading', { provider: providerName })
      }
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-8 px-4',
        'bg-muted/30 border border-border rounded-none',
        className
      )}
    >
      {/* Loading State */}
      {isLoading && !error && (
        <>
          {/* 8-bit styled spinner */}
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            {/* Pixel art blocks overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
                <div className="w-2 h-2 bg-primary/80 animate-pulse" />
                <div className="w-2 h-2 bg-primary/60 animate-pulse delay-75" />
                <div className="w-2 h-2 bg-primary/60 animate-pulse delay-75" />
                <div className="w-2 h-2 bg-primary/80 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">
              {t('providers.modelLoading', { provider: providerName })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('providers.modelLoadingSubtitle')}
            </p>
          </div>
        </>
      )}

      {/* Error State */}
      {error && (
        <>
          {/* Error icon */}
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>

          {/* Error message */}
          <div className="text-center space-y-2 max-w-md">
            <p className="text-sm font-medium text-destructive">
              {t('providers.modelLoadError', { provider: providerName })}
            </p>
            <p className="text-xs text-muted-foreground">{error}</p>

            {/* Retry button */}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('providers.retry')}
              </Button>
            )}
          </div>
        </>
      )}

      {/* Screen reader-only status text */}
      <p className="sr-only">
        {error
          ? t('providers.modelLoadError', { provider: providerName })
          : t('providers.modelLoading', { provider: providerName })}
      </p>
    </div>
  );
}

/**
 * Inline version of ModelLoadingSpinner (for tighter spaces)
 */
export interface ModelLoadingSpinnerInlineProps {
  /** Provider name for display */
  providerName: string;

  /** Loading state */
  isLoading: boolean;

  /** Error message if fetch failed */
  error?: string;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Inline variant for use within forms (smaller footprint)
 */
export function ModelLoadingSpinnerInline({
  providerName,
  isLoading,
  error,
  className,
}: ModelLoadingSpinnerInlineProps) {
  const { t } = useTranslation();

  if (!isLoading && !error) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 text-xs py-2 px-3 rounded',
        'bg-muted/30 border border-border',
        error && 'border-destructive/30 bg-destructive/5',
        className
      )}
    >
      {isLoading && !error && (
        <>
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-muted-foreground">
            {t('providers.modelLoading', { provider: providerName })}
          </span>
        </>
      )}

      {error && (
        <>
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-destructive">{error}</span>
        </>
      )}

      <p className="sr-only">
        {error
          ? t('providers.modelLoadError', { provider: providerName })
          : t('providers.modelLoading', { provider: providerName })}
      </p>
    </div>
  );
}
