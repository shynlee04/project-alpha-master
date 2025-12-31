/**
 * @fileoverview Suggestion Chips Component
 * @module components/chat/SuggestionChips
 * @governance EPIC-31-3
 *
 * Displays proactive suggestion chips after agent responses.
 *
 * Story 31.3: Proactive Suggestions & Follow-Up Actions
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Lightbulb } from 'lucide-react';
import type { Suggestion } from '@/lib/agent/suggestions/suggestion-engine';
import { formatSuggestion, improveSuggestionsWithPatterns, type SuggestionContext } from '@/lib/agent/suggestions/suggestion-engine';
import {
  dismissSuggestion,
  isSuggestionDismissed,
  recordInteraction,
  getUserPatterns,
} from '@/lib/agent/suggestions/suggestion-tracker';

interface SuggestionChipsProps {
  /**
   * Suggestion context for generation
   */
  context: SuggestionContext;

  /**
   * User ID (default: 'default-user')
   */
  userId?: string;

  /**
   * Maximum suggestions to show (default: 3)
   */
  maxSuggestions?: number;

  /**
   * Callback when suggestion is executed
   */
  onSuggestionExecute?: (suggestion: Suggestion) => void;

  /**
   * Mobile mode (swipeable cards)
   */
  mobile?: boolean;
}

/**
 * Suggestion chips component
 *
 * Shows contextual suggestions after agent responses.
 * Users can tap to execute or dismiss for 7 days.
 */
export function SuggestionChips({
  context,
  userId = 'default-user',
  maxSuggestions = 3,
  onSuggestionExecute,
  mobile = false,
}: SuggestionChipsProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

  // Load and improve suggestions
  useEffect(() => {
    loadSuggestions();
  }, [context]);

  const loadSuggestions = async () => {
    setIsLoading(true);

    try {
      // Import here to avoid circular dependency
      const { generateSuggestions } = await import('@/lib/agent/suggestions/suggestion-engine');

      // Generate base suggestions
      let baseSuggestions = generateSuggestions(context);

      // Improve with user patterns
      const userPatterns = await getUserPatterns(userId);
      baseSuggestions = improveSuggestionsWithPatterns(baseSuggestions, userPatterns);

      // Filter out dismissed suggestions
      const activeSuggestions: Suggestion[] = [];

      for (const suggestion of baseSuggestions) {
        const isDismissed = await isSuggestionDismissed(suggestion.type, userId);

        if (!isDismissed) {
          activeSuggestions.push(suggestion);
        }
      }

      // Limit and sort
      const finalSuggestions = activeSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxSuggestions);

      setSuggestions(finalSuggestions);

      // Record that suggestions were shown
      for (const suggestion of finalSuggestions) {
        await recordInteraction(suggestion.type, 'shown', userId, suggestion.id);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async (suggestion: Suggestion) => {
    setExecutingId(suggestion.id);

    try {
      // Execute the suggestion action
      await suggestion.action();

      // Record interaction
      await recordInteraction(suggestion.type, 'accepted', userId, suggestion.id);

      // Notify parent
      onSuggestionExecute?.(suggestion);

      // Remove from display
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
    } finally {
      setExecutingId(null);
    }
  };

  const handleDismiss = async (suggestion: Suggestion, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Dismiss for 7 days
      await dismissSuggestion(suggestion.type, userId);

      // Remove from display
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 py-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-9 w-32 bg-muted rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Suggestions header */}
      <div className="flex items-center gap-2 px-1">
        <Lightbulb className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-secondary-foreground">
          {t('suggestions.title', 'Suggested actions')}
        </span>
      </div>

      {/* Suggestion chips/cards */}
      <div className={mobile ? 'space-y-2' : 'flex flex-wrap gap-2'}>
        {suggestions.map((suggestion) => {
          const formatted = formatSuggestion(suggestion);

          return (
            <div
              key={suggestion.id}
              className={`
                group relative
                ${mobile
                  ? 'bg-panel border border-border rounded-lg p-3'
                  : 'inline-flex items-center gap-2 bg-panel border border-border rounded-lg px-3 py-2 hover:border-border-hover cursor-pointer'}
              `}
              onClick={() => !executingId && handleExecute(suggestion)}
            >
              {/* Icon */}
              <span className="text-lg">{formatted.icon}</span>

              {/* Content */}
              <div className={mobile ? 'flex-1' : ''}>
                <div className={mobile ? 'text-sm font-medium text-primary' : 'text-sm font-medium text-primary'}>
                  {formatted.title}
                </div>

                {formatted.description && mobile && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatted.description}
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              <button
                onClick={(e) => handleDismiss(suggestion, e)}
                className={`
                  ${mobile
                    ? 'absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground'
                    : 'ml-1 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100'}
                  transition-opacity
                `}
                disabled={executingId === suggestion.id}
              >
                <X className="w-3 h-3" />
              </button>

              {/* Executing indicator */}
              {executingId === suggestion.id && (
                <div className={`
                  absolute inset-0 bg-panel/80 rounded-lg
                  flex items-center justify-center
                `}>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-accent" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dismiss all (mobile only) */}
      {mobile && suggestions.length > 1 && (
        <button
          onClick={() => {
            // Dismiss all current suggestions
            for (const suggestion of suggestions) {
              dismissSuggestion(suggestion.type, userId);
            }
            setSuggestions([]);
          }}
          className="w-full text-xs text-muted-foreground hover:text-foreground py-2"
        >
          {t('suggestions.dismissAll', 'Dismiss all')}
        </button>
      )}
    </div>
  );
}
