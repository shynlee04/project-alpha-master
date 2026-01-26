/**
 * Model Fetch Progress - Provider Model Loading Feedback
 *
 * Displays loading state and error handling when fetching available models
 * from LLM providers. Provides clear feedback during model discovery.
 *
 * User Journey:
 * 1. User clicks "Fetch Models" button → Shows spinner "Loading models from OpenAI..."
 * 2. API call succeeds → Shows "✅ Loaded 150 models from OpenAI"
 * 3. API call fails → Shows error with retry button: "Failed: Invalid API key"
 *
 * @module presentation/components/agent/ModelFetchProgress
 * @priority P0 - Event Activity Indicator
 * @story P0-2 - Model Fetch Failure Recovery UI
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Fetch state
 */
type FetchState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Model fetch result
 * @export
 */
export interface ModelFetchResult {
  providerId: string;
  providerName: string;
  state: FetchState;
  modelCount: number;
  error?: string;
}

/**
 * Model Fetch Progress Props
 */
interface ModelFetchProgressProps {
  providerId: string;
  providerName: string;
  onFetch: (providerId: string) => Promise<number>;
  onRetry?: (providerId: string) => void;
}

/**
 * Model Fetch Progress Component
 */
export function ModelFetchProgress({ providerId, providerName, onFetch, onRetry }: ModelFetchProgressProps) {
  const { t } = useTranslation();
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [modelCount, setModelCount] = useState(0);
  const [error, setError] = useState<string>();

  /**
   * Handle fetch models
   */
  const handleFetch = async () => {
    setFetchState('loading');
    setError(undefined);

    try {
      const count = await onFetch(providerId);
      setModelCount(count);
      setFetchState('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('modelFetch.unknownError');
      setError(errorMessage);
      setFetchState('error');
    }
  };

  /**
   * Handle retry
   */
  const handleRetryClick = () => {
    if (onRetry) {
      onRetry(providerId);
    } else {
      handleFetch();
    }
  };

  /**
   * Render based on state
   */
  const renderContent = () => {
    switch (fetchState) {
      case 'idle':
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('modelFetch.idle')}</span>
            <Button variant="outline" size="sm" onClick={handleFetch} className="h-8">
              {t('modelFetch.fetch')}
            </Button>
          </div>
        );

      case 'loading':
        return (
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 text-info animate-spin" />
            <span className="text-sm">{t('modelFetch.loading', { provider: providerName })}</span>
          </div>
        );

      case 'success':
        return (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('modelFetch.success')}</span>
              <Badge variant="outline" className="border-success text-success">
                {modelCount} {t('modelFetch.models')}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFetch}
              className="h-7 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {t('modelFetch.refresh')}
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{t('modelFetch.error')}</p>
                {error && (
                  <p className="text-xs text-destructive mt-1">{error}</p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetryClick} className="w-full">
              <RefreshCw className="h-3 w-3 mr-1" />
              {t('modelFetch.retry')}
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="model-fetch-progress p-3 bg-muted/30 rounded-lg border">
      {renderContent()}
    </div>
  );
}

/**
 * i18n Translation Keys (add to en.json and vi.json)
 *
 * {
 *   "modelFetch": {
 *     "idle": "Ready to fetch models",
 *     "fetch": "Fetch Models",
 *     "loading": "Loading models from {{provider}}...",
 *     "success": "Models loaded successfully",
 *     "models": "models",
 *     "refresh": "Refresh",
 *     "error": "Failed to fetch models",
 *     "retry": "Retry",
 *     "unknownError": "Unknown error occurred"
 *   }
 * }
 */
