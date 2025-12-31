/**
 * @fileoverview Suggestion Engine
 * @module lib/agent/suggestions/suggestion-engine
 * @governance EPIC-31-3
 *
 * Generates proactive suggestions based on conversation context and user actions.
 *
 * Story 31.3: Proactive Suggestions & Follow-Up Actions
 */

import type { CoreMessage } from '@tanstack/ai';

export interface Suggestion {
  /**
   * Unique suggestion ID
   */
  id: string;

  /**
   * Suggestion type
   */
  type: 'generate-quiz' | 'add-to-canvas' | 'create-note' | 'search-kb' | 'generate-flashcards' | 'share-result';

  /**
   * Display title
   */
  title: string;

  /**
   * Description (optional)
   */
  description?: string;

  /**
   * Action to execute when clicked
   */
  action: () => Promise<void>;

  /**
   * Confidence score (0-1)
   */
  confidence: number;

  /**
   * Context data for action execution
   */
  context?: Record<string, unknown>;
}

export interface SuggestionContext {
  /**
   * Recent conversation messages
   */
  messages?: CoreMessage[];

  /**
   * Last completed action
   */
  lastAction?: string;

  /**
   * Available features
   */
  availableFeatures?: string[];

  /**
   * User's platform (desktop/mobile)
   */
  platform?: 'desktop' | 'mobile';
}

/**
 * Generate contextual suggestions
 *
 * @param context - Suggestion context
 * @returns Array of suggestions (max 3)
 */
export function generateSuggestions(context: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Analyze context to generate relevant suggestions
  const { messages, lastAction, availableFeatures = [], platform = 'desktop' } = context;

  // Suggestion 1: Based on last completed action
  if (lastAction === 'flashcards-generated') {
    suggestions.push({
      id: 'sug-quiz-from-flashcards',
      type: 'generate-quiz',
      title: 'Generate Quiz',
      description: 'Create a quiz from your flashcards',
      action: async () => {
        console.log('Action: Generate quiz from flashcards');
      },
      confidence: 0.9,
      context: { source: 'flashcards' },
    });
  }

  if (lastAction === 'source-ingested') {
    suggestions.push({
      id: 'sug-generate-flashcards',
      type: 'generate-flashcards',
      title: 'Generate Flashcards',
      description: 'Create flashcards from this source',
      action: async () => {
        console.log('Action: Generate flashcards from source');
      },
      confidence: 0.85,
      context: { source: 'ingestion' },
    });
  }

  // Suggestion 2: Based on conversation content
  if (messages && messages.length > 0) {
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .pop();

    if (lastUserMessage) {
      const content = typeof lastUserMessage.content === 'string'
        ? lastUserMessage.content
        : JSON.stringify(lastUserMessage.content);

      // Check if user asked about a topic (noun-heavy query)
      const hasTopicNouns = /\b(study|learn|understand|explain|what is|how to)\b/i.test(content);

      if (hasTopicNouns) {
        suggestions.push({
          id: 'sug-create-note',
          type: 'create-note',
          title: 'Create Note',
          description: 'Save this topic as a note',
          action: async () => {
            console.log('Action: Create note from topic');
          },
          confidence: 0.75,
          context: { topic: content.substring(0, 100) },
        });
      }

      // Check if user is studying
      const isStudying = /\b(study|learn|practice|review)\b/i.test(content);

      if (isStudying) {
        suggestions.push({
          id: 'sug-add-to-canvas',
          type: 'add-to-canvas',
          title: 'Add to Canvas',
          description: 'Add to your knowledge canvas',
          action: async () => {
            console.log('Action: Add to canvas');
          },
          confidence: 0.7,
          context: { studyContext: content.substring(0, 100) },
        });
      }
    }
  }

  // Suggestion 3: Knowledge base search
  if (messages && messages.length > 2) {
    suggestions.push({
      id: 'sug-search-kb',
      type: 'search-kb',
      title: 'Search Knowledge Base',
      description: 'Find related information in your knowledge base',
      action: async () => {
        console.log('Action: Search knowledge base');
      },
      confidence: 0.65,
      context: {},
    });
  }

  // Suggestion 4: Share result (if meaningful output)
  if (lastAction === 'quiz-generated' || lastAction === 'flashcards-generated') {
    suggestions.push({
      id: 'sug-share-result',
      type: 'share-result',
      title: 'Share Result',
      description: 'Export or share this result',
      action: async () => {
        console.log('Action: Share result');
      },
      confidence: 0.6,
      context: { resultType: lastAction },
    });
  }

  // Filter by available features
  const availableSuggestions = suggestions.filter((s) => {
    // Check if feature is available
    if (s.type === 'add-to-canvas' && !availableFeatures.includes('canvas')) {
      return false;
    }
    if (s.type === 'search-kb' && !availableFeatures.includes('knowledge-base')) {
      return false;
    }
    // Desktop-only features
    if (platform === 'mobile' && (s.type === 'add-to-canvas')) {
      return false;
    }
    return true;
  });

  // Sort by confidence and return top 3
  return availableSuggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

/**
 * Generate suggestions for empty state (no active conversation)
 *
 * @returns Array of starter suggestions
 */
export function generateStarterSuggestions(): Suggestion[] {
  return [
    {
      id: 'sug-starter-ingest',
      type: 'add-to-canvas',
      title: 'Add a Source',
      description: 'Upload a PDF or paste a URL to get started',
      action: async () => {
        console.log('Action: Open source ingestion');
      },
      confidence: 0.9,
    },
    {
      id: 'sug-starter-chat',
      type: 'create-note',
      title: 'Start Chatting',
      description: 'Ask a question to begin learning',
      action: async () => {
        console.log('Action: Start chat');
      },
      confidence: 0.8,
    },
  ];
}

/**
 * Improve suggestions based on user patterns
 *
 * @param baseSuggestions - Base suggestions from engine
 * @param userPatterns - User interaction patterns
 * @returns Improved suggestions
 */
export function improveSuggestionsWithPatterns(
  baseSuggestions: Suggestion[],
  userPatterns: {
    preferredTypes?: string[];
    dismissedTypes?: string[];
    acceptedTypes?: string[];
  }
): Suggestion[] {
  let improved = [...baseSuggestions];

  // Boost preferred suggestion types
  if (userPatterns.preferredTypes) {
    improved = improved.map((s) => {
      if (userPatterns.preferredTypes!.includes(s.type)) {
        return {
          ...s,
          confidence: Math.min(1.0, s.confidence + 0.15),
        };
      }
      return s;
    });
  }

  // Demote dismissed suggestion types
  if (userPatterns.dismissedTypes) {
    improved = improved.map((s) => {
      if (userPatterns.dismissedTypes!.includes(s.type)) {
        return {
          ...s,
          confidence: Math.max(0.0, s.confidence - 0.3),
        };
      }
      return s;
    });
  }

  // Re-sort after adjustments
  return improved
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

/**
 * Execute suggestion action
 *
 * @param suggestion - Suggestion to execute
 * @returns Promise resolving when action completes
 */
export async function executeSuggestion(suggestion: Suggestion): Promise<void> {
  try {
    await suggestion.action();
  } catch (error) {
    console.error(`Failed to execute suggestion "${suggestion.title}":`, error);
    throw error;
  }
}

/**
 * Format suggestion for display
 *
 * @param suggestion - Suggestion to format
 * @returns Formatted suggestion with localized strings
 */
export function formatSuggestion(suggestion: Suggestion): {
  id: string;
  title: string;
  description?: string;
  icon: string;
  confidence: number;
} {
  // Map suggestion types to icons
  const iconMap: Record<string, string> = {
    'generate-quiz': '📝',
    'add-to-canvas': '🎨',
    'create-note': '📝',
    'search-kb': '🔍',
    'generate-flashcards': '🎴',
    'share-result': '📤',
  };

  return {
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    icon: iconMap[suggestion.type] || '💡',
    confidence: suggestion.confidence,
  };
}
