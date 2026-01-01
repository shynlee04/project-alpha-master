/**
 * Agent Validation Errors Display - Real-time Validation Feedback
 *
 * Shows validation errors in real-time as user configures agent settings.
 * Highlights invalid fields and provides actionable error messages.
 *
 * User Journey:
 * 1. User creates agent without selecting provider → Shows error "Provider required"
 * 2. User selects provider without models → Shows error "Provider has no available models"
 * 3. User enters invalid name → Shows error "Name must be at least 2 characters"
 *
 * @module presentation/components/agent/AgentValidationErrors
 * @priority P0 - Event Activity Indicator
 * @story P0-3 - Agent Validation Error Display
 */

import { useTranslation } from 'react-i18next';
import { Badge } from '@/presentation/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Validation error type
 */
interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Agent Validation Errors Props
 */
interface AgentValidationErrorsProps {
  errors: ValidationError[];
  className?: string;
}

/**
 * Agent Validation Errors Component
 */
export function AgentValidationErrors({ errors, className = '' }: AgentValidationErrorsProps) {
  const { t } = useTranslation();

  if (errors.length === 0) {
    return (
      <div className={`agent-validation-errors p-3 bg-green-500/10 border border-green-500/20 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-400">
            {t('validation.valid')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`agent-validation-errors p-3 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">
          {t('validation.title', { count: errors.length })}
        </h4>
      </div>

      <ul className="space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="flex items-start gap-2 text-xs">
            <Badge
              variant={error.severity === 'error' ? 'destructive' : 'outline'}
              className="mt-0.5 shrink-0"
            >
              {error.field}
            </Badge>
            <span
              className={
                error.severity === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }
            >
              {error.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * i18n Translation Keys (add to en.json and vi.json)
 *
 * {
 *   "validation": {
 *     "title": "{{count}} Validation Errors",
 *     "valid": "Configuration Valid"
 *   }
 * }
 */
