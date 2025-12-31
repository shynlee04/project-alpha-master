/**
 * @fileoverview Preference Tracker
 * @module lib/agent/preferences/preference-tracker
 * @governance EPIC-31-2
 *
 * Automatic preference learning from user interactions.
 *
 * Story 31.2: User Preference Learning & Personalization
 */

import type { CoreMessage } from '../memory/insight-extractor';
import {
  setPreference,
  getPreference,
  markAsManualOverride,
} from './user-profile';

export interface PreferenceTrackingOptions {
  /**
   * User ID
   */
  userId?: string;

  /**
   * Minimum confirmation count before learning (default: 3)
   */
  minConfirmations?: number;

  /**
   * Whether learning is enabled (default: true)
   */
  learningEnabled?: boolean;
}

export interface InteractionPattern {
  /**
   * Pattern type
   */
  type: 'language' | 'detailLevel' | 'citationStyle' | 'responseStyle';

  /**
   * Detected value
   */
  value: string;

  /**
   * Confidence score (0-1)
   */
  confidence: number;
}

/**
 * Track language preference from messages
 *
 * @param messages - Conversation messages
 * @param options - Tracking options
 * @returns Detected language preference
 */
export async function trackLanguagePreference(
  messages: CoreMessage[],
  options: PreferenceTrackingOptions = {}
): Promise<string | null> {
  const { userId = 'default-user', minConfirmations = 3, learningEnabled = true } = options;

  if (!learningEnabled) {
    return null;
  }

  // Check if manually overridden
  const manualOverrides = await getPreference<string[]>('manualOverrides', [], userId);
  if (manualOverrides.includes('language')) {
    return null; // Don't learn if manually set
  }

  // Count Vietnamese vs English messages
  let vietnameseCount = 0;
  let englishCount = 0;

  for (const message of messages) {
    if (message.role === 'user') {
      const content = typeof message.content === 'string'
        ? message.content
        : JSON.stringify(message.content);

      // Simple Vietnamese detection
      const vietnameseChars = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
      const hasVietnamese = vietnameseChars.test(content);

      if (hasVietnamese) {
        vietnameseCount++;
      } else {
        englishCount++;
      }
    }
  }

  // Determine preference with confidence
  const totalMessages = vietnameseCount + englishCount;
  if (totalMessages < minConfirmations) {
    return null;
  }

  const vietnameseRatio = vietnameseCount / totalMessages;

  // If 70%+ Vietnamese, learn Vietnamese preference
  if (vietnameseRatio >= 0.7) {
    const current = await getPreference<'en' | 'vi' | 'auto'>('language', 'auto', userId);

    if (current !== 'vi') {
      await setPreference('language', 'vi', true, userId);
      return 'vi';
    }
  } else if (vietnameseRatio <= 0.3) {
    // If 70%+ English, learn English preference
    const current = await getPreference<'en' | 'vi' | 'auto'>('language', 'auto', userId);

    if (current !== 'en') {
      await setPreference('language', 'en', true, userId);
      return 'en';
    }
  }

  return null;
}

/**
 * Track detail level preference from user requests
 *
 * @param messages - Conversation messages
 * @param options - Tracking options
 * @returns Detected detail level
 */
export async function trackDetailLevelPreference(
  messages: CoreMessage[],
  options: PreferenceTrackingOptions = {}
): Promise<string | null> {
  const { userId = 'default-user', minConfirmations = 3, learningEnabled = true } = options;

  if (!learningEnabled) {
    return null;
  }

  // Check if manually overridden
  const manualOverrides = await getPreference<string[]>('manualOverrides', [], userId);
  if (manualOverrides.includes('detailLevel')) {
    return null;
  }

  let conciseCount = 0;
  let detailedCount = 0;

  // Keywords for detail preferences
  const conciseKeywords = [
    'shorter', 'briefer', 'concise', 'brief', 'summary', 'quick',
    'ngắn gọn', 'tóm tắt', 'ngắn', 'nhanh',
  ];

  const detailedKeywords = [
    'detailed', 'more detail', 'elaborate', 'explain more', 'comprehensive',
    'chi tiết', 'giải thích thêm', 'đầy đủ', 'mở rộng',
  ];

  for (const message of messages) {
    if (message.role === 'user') {
      const content = typeof message.content === 'string'
        ? message.content
        : JSON.stringify(message.content);

      const lower = content.toLowerCase();

      // Check for concise keywords
      for (const keyword of conciseKeywords) {
        if (lower.includes(keyword)) {
          conciseCount++;
          break;
        }
      }

      // Check for detailed keywords
      for (const keyword of detailedKeywords) {
        if (lower.includes(keyword) && !lower.includes('less detail')) {
          detailedCount++;
          break;
        }
      }
    }
  }

  // Need at least minConfirmations to learn
  if (conciseCount >= minConfirmations && conciseCount > detailedCount * 2) {
    const current = await getPreference<'concise' | 'normal' | 'detailed'>(
      'detailLevel',
      'normal',
      userId
    );

    if (current !== 'concise') {
      await setPreference('detailLevel', 'concise', true, userId);
      return 'concise';
    }
  } else if (detailedCount >= minConfirmations && detailedCount > conciseCount * 2) {
    const current = await getPreference<'concise' | 'normal' | 'detailed'>(
      'detailLevel',
      'normal',
      userId
    );

    if (current !== 'detailed') {
      await setPreference('detailLevel', 'detailed', true, userId);
      return 'detailed';
    }
  }

  return null;
}

/**
 * Track citation style preference
 *
 * @param messages - Conversation messages
 * @param options - Tracking options
 * @returns Detected citation style
 */
export async function trackCitationStylePreference(
  messages: CoreMessage[],
  options: PreferenceTrackingOptions = {}
): Promise<string | null> {
  const { userId = 'default-user', minConfirmations = 3, learningEnabled = true } = options;

  if (!learningEnabled) {
    return null;
  }

  // Check if manually overridden
  const manualOverrides = await getPreference<string[]>('manualOverrides', [], userId);
  if (manualOverrides.includes('citationStyle')) {
    return null;
  }

  let inlineCount = 0;
  let footnoteCount = 0;
  let noneCount = 0;

  const inlineKeywords = ['inline citation', 'cite inline', 'trích dẫn trong văn'];
  const footnoteKeywords = ['footnote', 'endnote', 'chú thích cuối'];
  const noneKeywords = ['no citation', 'no reference', 'không trích dẫn'];

  for (const message of messages) {
    if (message.role === 'user') {
      const content = typeof message.content === 'string'
        ? message.content
        : JSON.stringify(message.content);

      const lower = content.toLowerCase();

      for (const keyword of inlineKeywords) {
        if (lower.includes(keyword)) {
          inlineCount++;
          break;
        }
      }

      for (const keyword of footnoteKeywords) {
        if (lower.includes(keyword)) {
          footnoteCount++;
          break;
        }
      }

      for (const keyword of noneKeywords) {
        if (lower.includes(keyword)) {
          noneCount++;
          break;
        }
      }
    }
  }

  // Learn preference with confidence
  if (inlineCount >= minConfirmations && inlineCount > Math.max(footnoteCount, noneCount)) {
    const current = await getPreference<'inline' | 'footnote' | 'none'>(
      'citationStyle',
      'inline',
      userId
    );

    if (current !== 'inline') {
      await setPreference('citationStyle', 'inline', true, userId);
      return 'inline';
    }
  } else if (footnoteCount >= minConfirmations && footnoteCount > Math.max(inlineCount, noneCount)) {
    const current = await getPreference<'inline' | 'footnote' | 'none'>(
      'citationStyle',
      'inline',
      userId
    );

    if (current !== 'footnote') {
      await setPreference('citationStyle', 'footnote', true, userId);
      return 'footnote';
    }
  } else if (noneCount >= minConfirmations && noneCount > Math.max(inlineCount, footnoteCount)) {
    const current = await getPreference<'inline' | 'footnote' | 'none'>(
      'citationStyle',
      'inline',
      userId
    );

    if (current !== 'none') {
      await setPreference('citationStyle', 'none', true, userId);
      return 'none';
    }
  }

  return null;
}

/**
 * Track response style preference
 *
 * @param messages - Conversation messages
 * @param options - Tracking options
 * @returns Detected response style
 */
export async function trackResponseStylePreference(
  messages: CoreMessage[],
  options: PreferenceTrackingOptions = {}
): Promise<string | null> {
  const { userId = 'default-user', minConfirmations = 3, learningEnabled = true } = options;

  if (!learningEnabled) {
    return null;
  }

  // Check if manually overridden
  const manualOverrides = await getPreference<string[]>('manualOverrides', [], userId);
  if (manualOverrides.includes('responseStyle')) {
    return null;
  }

  let formalCount = 0;
  let casualCount = 0;
  let technicalCount = 0;

  const formalKeywords = [
    'formal', 'professional', 'academic', 'business', 'chính thức',
  ];
  const casualKeywords = [
    'casual', 'informal', 'friendly', 'simple', 'thân mật', 'đơn giản',
  ];
  const technicalKeywords = [
    'technical', 'detailed technical', 'engineering', 'dev', 'code', 'kỹ thuật',
  ];

  for (const message of messages) {
    if (message.role === 'user') {
      const content = typeof message.content === 'string'
        ? message.content
        : JSON.stringify(message.content);

      const lower = content.toLowerCase();

      for (const keyword of formalKeywords) {
        if (lower.includes(keyword)) {
          formalCount++;
          break;
        }
      }

      for (const keyword of casualKeywords) {
        if (lower.includes(keyword)) {
          casualCount++;
          break;
        }
      }

      for (const keyword of technicalKeywords) {
        if (lower.includes(keyword)) {
          technicalCount++;
          break;
        }
      }
    }
  }

  // Learn preference
  if (formalCount >= minConfirmations && formalCount > Math.max(casualCount, technicalCount)) {
    const current = await getPreference<'formal' | 'casual' | 'technical'>(
      'responseStyle',
      'casual',
      userId
    );

    if (current !== 'formal') {
      await setPreference('responseStyle', 'formal', true, userId);
      return 'formal';
    }
  } else if (casualCount >= minConfirmations && casualCount > Math.max(formalCount, technicalCount)) {
    const current = await getPreference<'formal' | 'casual' | 'technical'>(
      'responseStyle',
      'casual',
      userId
    );

    if (current !== 'casual') {
      await setPreference('responseStyle', 'casual', true, userId);
      return 'casual';
    }
  } else if (technicalCount >= minConfirmations && technicalCount > Math.max(formalCount, casualCount)) {
    const current = await getPreference<'formal' | 'casual' | 'technical'>(
      'responseStyle',
      'casual',
      userId
    );

    if (current !== 'technical') {
      await setPreference('responseStyle', 'technical', true, userId);
      return 'technical';
    }
  }

  return null;
}

/**
 * Track all preferences from conversation
 *
 * @param messages - Conversation messages
 * @param options - Tracking options
 * @returns Learned preferences
 */
export async function trackAllPreferences(
  messages: CoreMessage[],
  options: PreferenceTrackingOptions = {}
): Promise<{
  language?: string;
  detailLevel?: string;
  citationStyle?: string;
  responseStyle?: string;
}> {
  const results: Record<string, string> = {};

  // Track all preferences in parallel
  const [language, detailLevel, citationStyle, responseStyle] = await Promise.all([
    trackLanguagePreference(messages, options),
    trackDetailLevelPreference(messages, options),
    trackCitationStylePreference(messages, options),
    trackResponseStylePreference(messages, options),
  ]);

  if (language) results.language = language;
  if (detailLevel) results.detailLevel = detailLevel;
  if (citationStyle) results.citationStyle = citationStyle;
  if (responseStyle) results.responseStyle = responseStyle;

  return results;
}

/**
 * Check if preference should be applied
 *
 * @param key - Preference key
 * @param userId - User ID
 * @returns Whether preference is active
 */
export async function shouldApplyPreference(
  key: string,
  userId = 'default-user'
): Promise<boolean> {
  const manualOverrides = await getPreference<string[]>('manualOverrides', [], userId);
  return !manualOverrides.includes(key);
}

/**
 * Manually set preference (marks as manual override)
 *
 * @param key - Preference key
 * @param value - Preference value
 * @param userId - User ID
 */
export async function manuallySetPreference<T>(
  key: string,
  value: T,
  userId = 'default-user'
): Promise<void> {
  await setPreference(key, value, false, userId);
  await markAsManualOverride(key, userId);
}

/**
 * Toggle learning on/off
 *
 * @param enabled - Whether learning should be enabled
 * @param userId - User ID
 */
export async function toggleLearning(
  enabled: boolean,
  userId = 'default-user'
): Promise<void> {
  await setPreference('_learningEnabled', enabled, false, userId);
}

/**
 * Check if learning is enabled
 *
 * @param userId - User ID
 * @returns Whether learning is enabled
 */
export async function isLearningEnabled(
  userId = 'default-user'
): Promise<boolean> {
  return await getPreference('_learningEnabled', true, userId);
}
