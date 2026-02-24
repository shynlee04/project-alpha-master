/**
 * @fileoverview Suggestion Tracker
 * @module lib/agent/suggestions/suggestion-tracker
 * @governance EPIC-31-3
 *
 * Tracks suggestion dismissals and user patterns for 7-day cooldown.
 *
 * Story 31.3: Proactive Suggestions & Follow-Up Actions
 */

import Dexie, { Table } from 'dexie';

export interface SuggestionDismissal {
  /**
   * Dismissal ID (auto-generated)
   */
  id?: number;

  /**
   * Suggestion type dismissed
   */
  suggestionType: string;

  /**
   * Timestamp of dismissal
   */
  dismissedAt: number;

  /**
   * Cooldown end timestamp (dismissedAt + 7 days)
   */
  cooldownUntil: number;

  /**
   * Number of times this type has been dismissed
   */
  dismissalCount: number;

  /**
   * User ID
   */
  userId: string;
}

export interface SuggestionInteraction {
  /**
   * Interaction ID (auto-generated)
   */
  id?: number;

  /**
   * Suggestion type
   */
  suggestionType: string;

  /**
   * Interaction type
   */
  interactionType: 'accepted' | 'dismissed' | 'shown';

  /**
   * Timestamp of interaction
   */
  timestamp: number;

  /**
   * User ID
   */
  userId: string;

  /**
   * Suggestion ID (optional)
   */
  suggestionId?: string;
}

/**
 * Suggestion Tracker Database
 */
class SuggestionTrackerDatabase extends Dexie {
  dismissals!: Table<SuggestionDismissal, number>;
  interactions!: Table<SuggestionInteraction, number>;

  constructor() {
    super('SuggestionTrackerDB');

    // Define schema
    this.version(1).stores({
      dismissals: '++id, suggestionType, cooldownUntil, userId',
      interactions: '++id, suggestionType, interactionType, timestamp, userId',
    });
  }
}

const db = new SuggestionTrackerDatabase();

/**
 * Dismiss a suggestion type for 7 days
 *
 * @param suggestionType - Suggestion type to dismiss
 * @param userId - User ID (default: 'default-user')
 * @returns Promise resolving when recorded
 */
export async function dismissSuggestion(
  suggestionType: string,
  userId = 'default-user'
): Promise<void> {
  const now = Date.now();
  const cooldownDays = 7;
  const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;

  // Check if this type was already dismissed
  const existing = await db.dismissals
    .where('[suggestionType+userId]')
    .equals([suggestionType, userId])
    .first();

  if (existing) {
    // Update existing dismissal
    existing.dismissedAt = now;
    existing.cooldownUntil = now + cooldownMs;
    existing.dismissalCount += 1;

    await db.dismissals.put(existing);
  } else {
    // Create new dismissal record
    const dismissal: SuggestionDismissal = {
      suggestionType,
      dismissedAt: now,
      cooldownUntil: now + cooldownMs,
      dismissalCount: 1,
      userId,
    };

    await db.dismissals.add(dismissal);
  }

  // Record interaction
  await recordInteraction(suggestionType, 'dismissed', userId);
}

/**
 * Check if suggestion type is currently dismissed
 *
 * @param suggestionType - Suggestion type to check
 * @param userId - User ID
 * @returns Whether suggestion is in cooldown period
 */
export async function isSuggestionDismissed(
  suggestionType: string,
  userId = 'default-user'
): Promise<boolean> {
  const now = Date.now();

  const dismissal = await db.dismissals
    .where('[suggestionType+userId]')
    .equals([suggestionType, userId])
    .first();

  if (!dismissal) {
    return false;
  }

  // Check if cooldown has expired
  return dismissal.cooldownUntil > now;
}

/**
 * Get remaining cooldown time for a suggestion
 *
 * @param suggestionType - Suggestion type
 * @param userId - User ID
 * @returns Remaining cooldown milliseconds, or 0 if not dismissed
 */
export async function getSuggestionCooldown(
  suggestionType: string,
  userId = 'default-user'
): Promise<number> {
  const now = Date.now();

  const dismissal = await db.dismissals
    .where('[suggestionType+userId]')
    .equals([suggestionType, userId])
    .first();

  if (!dismissal) {
    return 0;
  }

  const remaining = dismissal.cooldownUntil - now;
  return Math.max(0, remaining);
}

/**
 * Record suggestion interaction (for learning)
 *
 * @param suggestionType - Suggestion type
 * @param interactionType - Type of interaction
 * @param userId - User ID
 * @param suggestionId - Specific suggestion ID (optional)
 */
export async function recordInteraction(
  suggestionType: string,
  interactionType: 'accepted' | 'dismissed' | 'shown',
  userId = 'default-user',
  suggestionId?: string
): Promise<void> {
  const interaction: SuggestionInteraction = {
    suggestionType,
    interactionType,
    timestamp: Date.now(),
    userId,
    suggestionId,
  };

  await db.interactions.add(interaction);
}

/**
 * Get user interaction patterns
 *
 * @param userId - User ID
 * @returns User pattern statistics
 */
export async function getUserPatterns(
  userId = 'default-user'
): Promise<{
  preferredTypes: string[];
  dismissedTypes: string[];
  acceptedTypes: string[];
}> {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const last30Days = now - (30 * dayMs);

  // Get recent interactions
  const recentInteractions = await db.interactions
    .where('timestamp')
    .above(last30Days)
    .filter((i) => i.userId === userId)
    .toArray();

  // Calculate acceptance rates by type
  const typeStats = new Map<string, { shown: number; accepted: number; dismissed: number }>();

  for (const interaction of recentInteractions) {
    let stats = typeStats.get(interaction.suggestionType);

    if (!stats) {
      stats = { shown: 0, accepted: 0, dismissed: 0 };
      typeStats.set(interaction.suggestionType, stats);
    }

    if (interaction.interactionType === 'shown') {
      stats.shown++;
    } else if (interaction.interactionType === 'accepted') {
      stats.accepted++;
    } else if (interaction.interactionType === 'dismissed') {
      stats.dismissed++;
    }
  }

  // Categorize types
  const preferredTypes: string[] = [];
  const dismissedTypes: string[] = [];
  const acceptedTypes: string[] = [];

  for (const [type, stats] of typeStats.entries()) {
    const acceptanceRate = stats.shown > 0 ? stats.accepted / stats.shown : 0;

    if (acceptanceRate >= 0.5) {
      preferredTypes.push(type);
    }

    if (stats.accepted > 0) {
      acceptedTypes.push(type);
    }

    if (stats.dismissed >= 3) {
      dismissedTypes.push(type);
    }
  }

  return {
    preferredTypes,
    dismissedTypes,
    acceptedTypes,
  };
}

/**
 * Clear all dismissals (reset cooldowns)
 *
 * @param userId - User ID
 * @returns Number of dismissals cleared
 */
export async function clearDismissals(
  userId = 'default-user'
): Promise<number> {
  const userDismissals = await db.dismissals
    .where('userId')
    .equals(userId)
    .toArray();

  if (userDismissals.length === 0) {
    return 0;
  }

  const ids = userDismissals.map((d) => d.id!);
  await db.dismissals.bulkDelete(ids);

  return ids.length;
}

/**
 * Clear dismissal for specific suggestion type
 *
 * @param suggestionType - Suggestion type to un-dismiss
 * @param userId - User ID
 * @returns Whether dismissal was cleared
 */
export async function clearDismissalForType(
  suggestionType: string,
  userId = 'default-user'
): Promise<boolean> {
  const dismissal = await db.dismissals
    .where('[suggestionType+userId]')
    .equals([suggestionType, userId])
    .first();

  if (!dismissal) {
    return false;
  }

  if (dismissal.id) {
    await db.dismissals.delete(dismissal.id);
    return true;
  }

  return false;
}

/**
 * Get suggestion statistics
 *
 * @param userId - User ID
 * @returns Statistics about suggestions
 */
export async function getSuggestionStats(
  userId = 'default-user'
): Promise<{
  totalInteractions: number;
  totalAccepted: number;
  totalDismissed: number;
  acceptanceRate: number;
  currentlyDismissedTypes: string[];
}> {
  const interactions = await db.interactions
    .where('userId')
    .equals(userId)
    .toArray();

  const accepted = interactions.filter((i) => i.interactionType === 'accepted');
  const dismissed = interactions.filter((i) => i.interactionType === 'dismissed');

  const acceptanceRate = interactions.length > 0
    ? accepted.length / interactions.length
    : 0;

  // Get currently dismissed types
  const now = Date.now();
  const activeDismissals = await db.dismissals
    .where('userId')
    .equals(userId)
    .filter((d) => d.cooldownUntil > now)
    .toArray();

  const currentlyDismissedTypes = activeDismissals.map((d) => d.suggestionType);

  return {
    totalInteractions: interactions.length,
    totalAccepted: accepted.length,
    totalDismissed: dismissed.length,
    acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    currentlyDismissedTypes,
  };
}

/**
 * Clean up old interaction records (older than 90 days)
 *
 * @param userId - User ID
 * @returns Number of records cleaned
 */
export async function cleanupOldInteractions(
  userId = 'default-user'
): Promise<number> {
  const now = Date.now();
  const days90 = 90 * 24 * 60 * 60 * 1000;
  const cutoffDate = now - days90;

  const oldInteractions = await db.interactions
    .where('userId')
    .equals(userId)
    .filter((i) => i.timestamp < cutoffDate)
    .toArray();

  if (oldInteractions.length === 0) {
    return 0;
  }

  const ids = oldInteractions.map((i) => i.id!);
  await db.interactions.bulkDelete(ids);

  return ids.length;
}

/**
 * Export suggestion data (for backup/analysis)
 *
 * @param userId - User ID
 * @returns JSON string of suggestion data
 */
export async function exportSuggestionData(
  userId = 'default-user'
): Promise<string> {
  const dismissals = await db.dismissals
    .where('userId')
    .equals(userId)
    .toArray();

  const interactions = await db.interactions
    .where('userId')
    .equals(userId)
    .toArray();

  return JSON.stringify({
    dismissals,
    interactions,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Clear all suggestion data (privacy reset)
 *
 * @param userId - User ID
 * @returns Number of records cleared
 */
export async function clearAllSuggestionData(
  userId = 'default-user'
): Promise<number> {
  let count = 0;

  // Clear dismissals
  const dismissals = await db.dismissals
    .where('userId')
    .equals(userId)
    .toArray();

  if (dismissals.length > 0) {
    const ids = dismissals.map((d) => d.id!);
    await db.dismissals.bulkDelete(ids);
    count += ids.length;
  }

  // Clear interactions
  const interactions = await db.interactions
    .where('userId')
    .equals(userId)
    .toArray();

  if (interactions.length > 0) {
    const ids = interactions.map((i) => i.id!);
    await db.interactions.bulkDelete(ids);
    count += ids.length;
  }

  return count;
}
