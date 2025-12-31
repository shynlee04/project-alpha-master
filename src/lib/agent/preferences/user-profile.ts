/**
 * @fileoverview User Profile Storage
 * @module lib/agent/preferences/user-profile
 * @governance EPIC-31-2
 *
 * IndexedDB storage for user preferences and learned behaviors.
 *
 * Story 31.2: User Preference Learning & Personalization
 */

import Dexie, { Table } from 'dexie';

export interface UserPreference {
  /**
   * Preference key
   */
  key: string;

  /**
   * Preference value (JSON stringified)
   */
  value: string;

  /**
   * Whether this was automatically learned
   */
  learned: boolean;

  /**
   * Timestamp of last update
   */
  updatedAt: number;

  /**
   * Number of times this preference was confirmed
   */
  confirmationCount: number;
}

export interface UserProfile {
  userId: string;

  /**
   * Language preference
   */
  language: 'en' | 'vi' | 'auto';

  /**
   * Detail level for responses
   */
  detailLevel: 'concise' | 'normal' | 'detailed';

  /**
   * Citation style
   */
  citationStyle: 'inline' | 'footnote' | 'none';

  /**
   * Response tone
   */
  responseStyle: 'formal' | 'casual' | 'technical';

  /**
   * Whether ML-based learning is active
   */
  learned: boolean;

  /**
   * Manually overridden preference keys
   */
  manualOverrides: string[];

  /**
   * Last profile update timestamp
   */
  updatedAt: number;
}

/**
 * User Preferences Database
 */
class UserPreferencesDatabase extends Dexie {
  preferences!: Table<UserPreference, string>;

  constructor() {
    super('UserPreferencesDB');

    // Define schema
    this.version(1).stores({
      preferences: 'key, learned, updatedAt',
    });
  }
}

const db = new UserPreferencesDatabase();

/**
 * Get user profile
 *
 * @param userId - User ID (default: 'default-user')
 * @returns User profile or defaults
 */
export async function getUserProfile(
  userId = 'default-user'
): Promise<UserProfile> {
  const preferences = await db.preferences
    .where('key')
    .startsWith(`${userId}.`)
    .toArray();

  const profile: UserProfile = {
    userId,
    language: 'auto',
    detailLevel: 'normal',
    citationStyle: 'inline',
    responseStyle: 'casual',
    learned: false,
    manualOverrides: [],
    updatedAt: Date.now(),
  };

  let hasLearning = false;

  for (const pref of preferences) {
    const key = pref.key.replace(`${userId}.`, '');
    const value = JSON.parse(pref.value);

    // Apply preference
    switch (key) {
      case 'language':
        profile.language = value;
        break;
      case 'detailLevel':
        profile.detailLevel = value;
        break;
      case 'citationStyle':
        profile.citationStyle = value;
        break;
      case 'responseStyle':
        profile.responseStyle = value;
        break;
      case 'manualOverrides':
        profile.manualOverrides = value;
        break;
    }

    if (pref.learned) {
      hasLearning = true;
    }

    // Track most recent update
    if (pref.updatedAt > profile.updatedAt) {
      profile.updatedAt = pref.updatedAt;
    }
  }

  profile.learned = hasLearning;

  return profile;
}

/**
 * Set user preference
 *
 * @param key - Preference key (without userId prefix)
 * @param value - Preference value
 * @param learned - Whether this was auto-learned (default: false)
 * @param userId - User ID (default: 'default-user')
 */
export async function setPreference<T>(
  key: string,
  value: T,
  learned = false,
  userId = 'default-user'
): Promise<void> {
  const fullKey = `${userId}.${key}`;

  const existing = await db.preferences.get(fullKey);

  const pref: UserPreference = {
    key: fullKey,
    value: JSON.stringify(value),
    learned,
    updatedAt: Date.now(),
    confirmationCount: existing ? existing.confirmationCount + 1 : 1,
  };

  await db.preferences.put(pref);
}

/**
 * Get single preference
 *
 * @param key - Preference key
 * @param defaultValue - Default value if not found
 * @param userId - User ID
 * @returns Preference value or default
 */
export async function getPreference<T>(
  key: string,
  defaultValue: T,
  userId = 'default-user'
): Promise<T> {
  const fullKey = `${userId}.${key}`;
  const pref = await db.preferences.get(fullKey);

  if (!pref) {
    return defaultValue;
  }

  return JSON.parse(pref.value) as T;
}

/**
 * Reset learned preferences
 *
 * @param userId - User ID
 * @returns Number of preferences reset
 */
export async function resetLearnedPreferences(
  userId = 'default-user'
): Promise<number> {
  // Query all preferences and filter by learned status and key prefix
  const allPrefs = await db.preferences.toArray();

  // Filter by learned status and user key prefix
  const userPrefs = allPrefs.filter((p) =>
    p.learned && p.key.startsWith(`${userId}.`)
  );

  const keys = userPrefs.map((p) => p.key);

  if (keys.length > 0) {
    await db.preferences.bulkDelete(keys);
  }

  return keys.length;
}

/**
 * Reset all preferences (including manual)
 *
 * @param userId - User ID
 * @returns Number of preferences reset
 */
export async function resetAllPreferences(
  userId = 'default-user'
): Promise<number> {
  const allPrefs = await db.preferences
    .where('key')
    .startsWith(`${userId}.`)
    .toArray();

  const keys = allPrefs.map((p) => p.key);

  if (keys.length > 0) {
    await db.preferences.bulkDelete(keys);
  }

  return keys.length;
}

/**
 * Mark preference as manually overridden
 *
 * @param key - Preference key
 * @param userId - User ID
 */
export async function markAsManualOverride(
  key: string,
  userId = 'default-user'
): Promise<void> {
  const profile = await getUserProfile(userId);

  if (!profile.manualOverrides.includes(key)) {
    profile.manualOverrides.push(key);
    await setPreference('manualOverrides', profile.manualOverrides, false, userId);
  }

  // Also mark the preference itself as not learned
  const fullKey = `${userId}.${key}`;
  const pref = await db.preferences.get(fullKey);

  if (pref) {
    pref.learned = false;
    await db.preferences.put(pref);
  }
}

/**
 * Get all preferences with metadata
 *
 * @param userId - User ID
 * @returns Array of all preferences
 */
export async function getAllPreferences(
  userId = 'default-user'
): Promise<UserPreference[]> {
  return await db.preferences
    .where('key')
    .startsWith(`${userId}.`)
    .toArray();
}

/**
 * Get preference statistics
 *
 * @param userId - User ID
 * @returns Statistics about learned preferences
 */
export async function getPreferenceStats(
  userId = 'default-user'
): Promise<{
  totalPreferences: number;
  learnedPreferences: number;
  manualPreferences: number;
  mostConfirmedPreference?: string;
}> {
  const allPrefs = await db.preferences
    .where('key')
    .startsWith(`${userId}.`)
    .toArray();

  const learned = allPrefs.filter((p) => p.learned);
  const manual = allPrefs.filter((p) => !p.learned);

  let mostConfirmed: UserPreference | undefined;
  let maxCount = 0;

  for (const pref of allPrefs) {
    if (pref.confirmationCount > maxCount) {
      maxCount = pref.confirmationCount;
      mostConfirmed = pref;
    }
  }

  return {
    totalPreferences: allPrefs.length,
    learnedPreferences: learned.length,
    manualPreferences: manual.length,
    mostConfirmedPreference: mostConfirmed?.key.replace(`${userId}.`, ''),
  };
}

/**
 * Export preferences as JSON
 *
 * @param userId - User ID
 * @returns JSON string of preferences
 */
export async function exportPreferences(
  userId = 'default-user'
): Promise<string> {
  const profile = await getUserProfile(userId);
  return JSON.stringify(profile, null, 2);
}

/**
 * Import preferences from JSON
 *
 * @param json - JSON string of preferences
 * @param userId - User ID
 * @returns Success status
 */
export async function importPreferences(
  json: string,
  userId = 'default-user'
): Promise<boolean> {
  try {
    const profile = JSON.parse(json) as UserProfile;

    await setPreference('language', profile.language, false, userId);
    await setPreference('detailLevel', profile.detailLevel, false, userId);
    await setPreference('citationStyle', profile.citationStyle, false, userId);
    await setPreference('responseStyle', profile.responseStyle, false, userId);
    await setPreference('manualOverrides', profile.manualOverrides, false, userId);

    return true;
  } catch (error) {
    console.error('Failed to import preferences:', error);
    return false;
  }
}
