/**
 * @fileoverview Agent Preferences Module Barrel Export
 * @module lib/agent/preferences
 * @governance EPIC-31-2
 *
 * User preference learning and personalization system.
 */

export {
  getUserProfile,
  setPreference,
  getPreference,
  resetLearnedPreferences,
  resetAllPreferences,
  markAsManualOverride,
  getAllPreferences,
  getPreferenceStats,
  exportPreferences,
  importPreferences,
  type UserPreference,
  type UserProfile,
} from './user-profile';

export {
  trackLanguagePreference,
  trackDetailLevelPreference,
  trackCitationStylePreference,
  trackResponseStylePreference,
  trackAllPreferences,
  shouldApplyPreference,
  manuallySetPreference,
  toggleLearning,
  isLearningEnabled,
  type PreferenceTrackingOptions,
  type InteractionPattern,
} from './preference-tracker';
