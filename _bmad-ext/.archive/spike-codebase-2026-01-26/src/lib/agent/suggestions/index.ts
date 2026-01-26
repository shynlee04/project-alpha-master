/**
 * @fileoverview Agent Suggestions Module Barrel Export
 * @module lib/agent/suggestions
 * @governance EPIC-31-3
 *
 * Proactive suggestion system with 7-day dismissal cooldown.
 */

export {
  generateSuggestions,
  generateStarterSuggestions,
  improveSuggestionsWithPatterns,
  executeSuggestion,
  formatSuggestion,
  type Suggestion,
  type SuggestionContext,
} from './suggestion-engine';

export {
  dismissSuggestion,
  isSuggestionDismissed,
  getSuggestionCooldown,
  recordInteraction,
  getUserPatterns,
  clearDismissals,
  clearDismissalForType,
  getSuggestionStats,
  cleanupOldInteractions,
  exportSuggestionData,
  clearAllSuggestionData,
  type SuggestionDismissal,
  type SuggestionInteraction,
} from './suggestion-tracker';
