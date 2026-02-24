/**
 * @fileoverview Deep Think UI Component
 * @module components/agent/DeepThinkUI
 * @governance EPIC-7-6
 *
 * Deep Think synthesis UI with progress indicator and expandable reasoning steps.
 * Desktop-only feature with long-press trigger.
 *
 * Story 7.6: Deep Think Synthesis Block (Desktop Only)
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import type { DeepThinkResult } from '@/lib/agent/deep-think/deep-think-types';

export interface DeepThinkUIProps {
  /**
   * Whether deep think is currently active
   */
  isDeepThinking: boolean;

  /**
   * Current reasoning progress (0-100)
   */
  reasoningProgress: number;

  /**
   * Deep think result (if complete)
   */
  result: DeepThinkResult | null;

  /**
   * Error message (if failed)
   */
  error: string | null;

  /**
   * Cancel handler
   */
  onCancel: () => void;

  /**
   * Reset handler
   */
  onReset: () => void;
}

/**
 * Deep Think UI component
 *
 * @example
 * ```tsx
 * function DeepThinkFeature() {
 *   const {
 *     isDeepThinking,
 *     reasoningProgress,
 *     result,
 *     error,
 *     cancelDeepThink,
 *     reset,
 *   } = useDeepThink({ prompt, sources });
 *
 *   return (
 *     <DeepThinkUI
 *       isDeepThinking={isDeepThinking}
 *       reasoningProgress={reasoningProgress}
 *       result={result}
 *       error={error}
 *       onCancel={cancelDeepThink}
 *       onReset={reset}
 *     />
 *   );
 * }
 * ```
 */
export function DeepThinkUI({
  isDeepThinking,
  reasoningProgress,
  result,
  error,
  onCancel,
  onReset,
}: DeepThinkUIProps) {
  const { t } = useTranslation();
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true);

  // Deep thinking state
  if (isDeepThinking) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Animated brain icon */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-info rounded-full animate-ping opacity-75" />
                <div className="relative w-12 h-12 bg-info rounded-full flex items-center justify-center text-info-foreground font-bold">
                  🧠
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('deepThink.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('deepThink.description')}</p>
              </div>
            </div>

            {/* Cancel button */}
            <Button variant="outline" size="sm" onClick={onCancel}>
              {t('deepThink.cancel')}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('deepThink.reasoning')}</span>
              <span>{reasoningProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-none h-2 overflow-hidden">
              <div
                className="bg-info h-full transition-all duration-300 ease-out"
                style={{ width: `${reasoningProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t('deepThink.estimatedTime')}
            </p>
          </div>

          {/* Animated steps */}
          <div className="space-y-2">
            {reasoningProgress >= 20 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">✓</span>
                <span>{t('deepThink.step.analyzing')}</span>
              </div>
            )}
            {reasoningProgress >= 50 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">✓</span>
                <span>{t('deepThink.step.comparing')}</span>
              </div>
            )}
            {reasoningProgress >= 80 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">✓</span>
                <span>{t('deepThink.step.synthesizing')}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive text-xl">
              ⚠️
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-destructive">
                {t('deepThink.error.title')}
              </h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onReset}>
              {t('deepThink.retry')}
            </Button>
            <Button variant="ghost" onClick={onReset}>
              {t('deepThink.close')}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Result state
  if (result) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success text-xl">
                ✅
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('deepThink.complete')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('deepThink.confidence')}: {Math.round(result.confidenceScores.overall * 100)}%
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onReset}>
                {t('deepThink.newAnalysis')}
              </Button>
              <Button variant="ghost" size="sm" onClick={onReset}>
                {t('deepThink.close')}
              </Button>
            </div>
          </div>

          {/* Synthesis */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(result.synthesis),
              }}
            />
          </div>

          {/* Reasoning steps (expandable) */}
          {result.reasoningSteps.length > 0 && (
            <details
              open={isReasoningExpanded}
              onToggle={(e) => setIsReasoningExpanded((e.target as HTMLDetailsElement).open)}
              className="border rounded-lg"
            >
              <summary className="px-4 py-2 cursor-pointer hover:bg-muted flex items-center justify-between">
                <span className="font-semibold">{t('deepThink.reasoningSteps')}</span>
                <span className="text-sm text-muted-foreground">
                  {isReasoningExpanded ? '▼' : '▶'}
                </span>
              </summary>
              <div className="px-4 py-2 space-y-2 border-t">
                {result.reasoningSteps.map((step) => (
                  <div key={step.step} className="pl-4 border-l-2 border-info">
                    <p className="text-sm font-semibold">{step.description}</p>
                    <p className="text-sm text-muted-foreground">{step.thought}</p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Citations */}
          {result.citations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t('deepThink.citations')}</h4>
              <div className="space-y-1">
                {result.citations.map((citation, index) => (
                  <div key={index} className="text-xs bg-muted p-2 rounded">
                    <span className="font-semibold">{citation.title}</span>
                    <p className="text-muted-foreground line-clamp-2">{citation.relevantText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence scores by source */}
          {result.confidenceScores.sources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t('deepThink.sourceConfidence')}</h4>
              <div className="space-y-1">
                {result.confidenceScores.sources.map((source) => (
                  <div key={source.sourceId} className="flex items-center justify-between text-sm">
                    <span>{source.sourceId}</span>
                    <span className="font-mono">{Math.round(source.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return null;
}

/**
 * Simple markdown renderer (basic implementation)
 * In production, use a proper markdown library like react-markdown
 */
function renderMarkdown(markdown: string): string {
  // Basic markdown rendering
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Tables (basic)
    .replace(/\|(.+)\|/gim, (match) => {
      const cells = match.split('|').filter((c) => c.trim());
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
    })
    // Line breaks
    .replace(/\n/gim, '<br>');
}
