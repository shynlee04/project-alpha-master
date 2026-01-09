/**
 * Agent Validation Feedback UI
 *
 * Provides visual feedback when agent validation passes or fails.
 * Shows success toasts, error banners, and validation details.
 *
 * Features:
 * - Success toast with agent details
 * - Error banner with validation failures
 * - Accessibility: ARIA live regions
 * - Auto-dismiss after timeout
 *
 * @module ui/AgentValidationFeedback
 * @story P0-2 - Agent Validation Success/Error Feedback
 * @epic UX/UI Modernization
 */

import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'success' | 'warning' | 'error' | 'info';

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: ValidationSeverity;
}

/**
 * Props for agent validation feedback
 */
export interface AgentValidationFeedbackProps {
  /** Agent name being validated */
  agentName: string;

  /** Validation result */
  isValid: boolean;

  /** Validation errors (if any) */
  errors?: ValidationError[];

  /** Warning messages (if any) */
  warnings?: ValidationError[];

  /** Whether validation is in progress */
  isValidating?: boolean;

  /** Auto-dismiss timeout (ms) */
  autoDismiss?: number;

  /** Callback to retry validation */
  onRetry?: () => void;

  /** Callback to fix validation issues */
  onFix?: () => void;
}

/**
 * Show validation feedback as toast
 *
 * @example
 * ```tsx
 * showValidationToast({
 *   agentName: 'Code Assistant',
 *   isValid: true,
 *   errors: [],
 * });
 * ```
 */
export function showValidationToast(props: AgentValidationFeedbackProps) {
  const { agentName, isValid, errors = [], warnings = [] } = props;

  if (isValid) {
    // Success toast
    if (warnings.length > 0) {
      // Success with warnings
      toast.success(
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{agentName} validated successfully</p>
            <p className="text-sm text-muted-foreground mt-1">
              {warnings.length} warning(s) - see details
            </p>
          </div>
        </div>,
        {
          duration: 5000,
          description: (
            <div className="mt-2 space-y-1">
              {warnings.map((warning, i) => (
                <div key={i} className="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-2">
                  <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>{warning.field}:</strong> {warning.message}
                  </span>
                </div>
              ))}
            </div>
          ),
        }
      );
    } else {
      // Pure success
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="font-medium">{agentName} is valid and ready to use</span>
        </div>,
        { duration: 3000 }
      );
    }
  } else {
    // Error toast
    toast.error(
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{agentName} validation failed</p>
          <p className="text-sm text-muted-foreground mt-1">
            {errors.length} error(s) must be fixed
          </p>
        </div>
      </div>,
      {
        duration: 8000,
        description: (
          <div className="mt-2 space-y-1">
            {errors.map((error, i) => (
              <div key={i} className="text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>{error.field}:</strong> {error.message}
                </span>
              </div>
            ))}
          </div>
        ),
      }
    );
  }
}

/**
 * Agent Validation Feedback Banner Component
 *
 * Displays validation feedback as an in-page banner (persistent, not auto-dismissing).
 *
 * @example
 * ```tsx
 * <AgentValidationFeedbackBanner
 *   agentName="Code Assistant"
 *   isValid={false}
 *   errors={[{ field: 'model', message: 'Model not found', severity: 'error' }]}
 *   onRetry={handleRetry}
 *   onFix={handleFix}
 * />
 * ```
 */
export function AgentValidationFeedbackBanner({
  agentName,
  isValid,
  errors = [],
  warnings = [],
  isValidating = false,
  onRetry,
  onFix,
}: AgentValidationFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide on success after timeout
  useEffect(() => {
    if (isValid && warnings.length === 0) {
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isValid, warnings]);

  if (!isVisible) return null;

  // Success state
  if (isValid && warnings.length === 0) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={cn(
            'flex items-center justify-between gap-4 px-4 py-3 rounded-none',
            'bg-green-500/10 border border-green-500/20'
        )}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {agentName} is valid and ready to use
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-8 px-2"
        >
          Dismiss
        </Button>
      </div>
    );
  }

  // Success with warnings
  if (isValid && warnings.length > 0) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={cn(
            'flex flex-col gap-3 px-4 py-3 rounded-none',
            'bg-yellow-500/10 border border-yellow-500/20'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {agentName} validated with warnings
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Agent is functional but review these warnings
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-8 px-2"
          >
            Dismiss
          </Button>
        </div>

        <div className="space-y-1">
          {warnings.map((warning, i) => (
            <div
              key={i}
              className="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-2 pl-8"
            >
              <Info className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>{warning.field}:</strong> {warning.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (!isValid) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
            'flex flex-col gap-3 px-4 py-3 rounded-none',
            'bg-destructive/10 border border-destructive/20'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {isValidating ? `Validating ${agentName}...` : `${agentName} validation failed`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {!isValidating && `${errors.length} error(s) must be fixed`}
              </p>
            </div>
          </div>

          {!isValidating && (
            <div className="flex items-center gap-2">
              {onFix && (
                <Button variant="outline" size="sm" onClick={onFix} className="h-8">
                  Fix Issues
                </Button>
              )}
              {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry} className="h-8">
                  Retry
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-8 px-2"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>

        {!isValidating && errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((error, i) => (
              <div
                key={i}
                className="text-xs text-destructive flex items-start gap-2 pl-8"
              >
                <Badge
                  variant={error.severity === 'error' ? 'destructive' : 'outline'}
                  className="flex-shrink-0 mt-0.5"
                >
                  {error.severity}
                </Badge>
                <span>
                  <strong>{error.field}:</strong> {error.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Validating state
  if (isValidating) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-none',
            'bg-muted/30 border border-border'
        )}
      >
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Validating {agentName}...</p>
      </div>
    );
  }

  return null;
}
