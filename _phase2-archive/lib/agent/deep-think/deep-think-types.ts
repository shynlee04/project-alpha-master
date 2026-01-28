/**
 * @fileoverview Deep Think Types
 * @module lib/agent/deep-think/deep-think-types
 * @governance EPIC-7-6
 *
 * Type definitions for deep think synthesis using Gemini 3.0 Pro.
 */

export interface DeepThinkOptions {
  /**
   * Prompt to analyze
   */
  prompt: string;

  /**
   * Sources to compare (optional)
   */
  sources?: Array<{
    id: string;
    title: string;
    content: string;
  }>;

  /**
   * Long-press duration in milliseconds (default: 1000ms)
   */
  longPressDuration?: number;

  /**
   * Model to use for deep thinking (default: gemini-3.0-pro)
   */
  model?: 'gemini-3.0-pro' | 'gemini-3.0-flash';

  /**
   * Progress callback
   */
  onProgress?: (stage: 'reasoning' | 'synthesis', progress: number) => void;

  /**
   * Chat function (injected for testability)
   */
  chatFn?: (messages: any[]) => AsyncIterable<unknown>;
}

export interface DeepThinkResult {
  /**
   * Structured synthesis in Markdown
   */
  synthesis: string;

  /**
   * Reasoning steps (expandable)
   */
  reasoningSteps: Array<{
    step: number;
    description: string;
    thought: string;
  }>;

  /**
   * Confidence scores (0-1)
   */
  confidenceScores: {
    overall: number;
    sources: Array<{
      sourceId: string;
      confidence: number;
    }>;
  };

  /**
   * Citations for synthesis
   */
  citations: Array<{
    sourceId: string;
    title: string;
    relevantText: string;
  }>;

  /**
   * Generation timestamp
   */
  generatedAt: number;
}

export interface UseDeepThinkResult {
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
   * Whether current platform supports deep think
   */
  isSupported: boolean;

  /**
   * Platform error message (if not supported)
   */
  platformError: string | null;

  /**
   * Start deep think (long-press handler)
   */
  startDeepThink: () => Promise<DeepThinkResult>;

  /**
   * Cancel deep think
   */
  cancelDeepThink: () => void;

  /**
   * Reset state
   */
  reset: () => void;
}
