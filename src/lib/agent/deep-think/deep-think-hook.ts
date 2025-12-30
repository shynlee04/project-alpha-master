/**
 * @fileoverview Deep Think React Hook
 * @module lib/agent/deep-think/deep-think-hook
 * @governance EPIC-7-6
 *
 * Deep Think synthesis using Gemini 3.0 Pro reasoning capabilities.
 * Desktop-only feature with long-press trigger and progress UI.
 *
 * Story 7.6: Deep Think Synthesis Block (Desktop Only)
 */

import { useState, useCallback, useRef } from 'react';
import { isDesktopPlatform } from '@/lib/utils/platform-detection';

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

/**
 * React hook for deep think synthesis
 *
 * @param options - Deep think options
 * @returns Deep think result object
 *
 * @example
 * ```tsx
 * function DeepThinkButton({ prompt, sources }) {
 *   const {
 *     isDeepThinking,
 *     result,
 *     isSupported,
 *     startDeepThink,
 *     cancelDeepThink,
 *   } = useDeepThink({
 *     prompt,
 *     sources,
 *     longPressDuration: 1000,
 *     onProgress: (stage, progress) => console.log(`${stage}: ${progress}%`),
 *   });
 *
 *   const handleMouseDown = () => {
 *     setTimeout(() => {
 *       startDeepThink();
 *     }, 1000);
 *   };
 *
 *   if (!isSupported) {
 *     return <p>Deep think requires desktop</p>;
 *   }
 *
 *   return (
 *     <button
 *       onMouseDown={handleMouseDown}
 *       onMouseUp={cancelDeepThink}
 *     >
 *       {isDeepThinking ? 'Deep Thinking...' : 'Generate (Long-press)'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeepThink(options: DeepThinkOptions): UseDeepThinkResult {
  const {
    prompt,
    sources = [],
    longPressDuration = 1000,
    model = 'gemini-3.0-pro',
    onProgress,
    chatFn,
  } = options;

  // State
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [reasoningProgress, setReasoningProgress] = useState(0);
  const [result, setResult] = useState<DeepThinkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Platform detection
  const isSupported = isDesktopPlatform();
  const platformError = !isSupported ? 'Deep think requires desktop browser' : null;

  /**
   * Start deep think synthesis
   */
  const startDeepThink = useCallback(async () => {
    if (!isSupported) {
      setError('Deep think requires desktop browser');
      return Promise.reject(new Error('Platform not supported'));
    }

    if (!chatFn) {
      setError('Chat function not provided');
      return Promise.reject(new Error('Chat function not provided'));
    }

    // Reset state
    setIsDeepThinking(true);
    setReasoningProgress(0);
    setResult(null);
    setError(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Build system message with context
      const systemMessage = {
        role: 'system' as const,
        content: buildDeepThinkSystemPrompt(sources),
      };

      // Build user message
      const userMessage = {
        role: 'user' as const,
        content: buildDeepThinkUserPrompt(prompt, sources),
      };

      // Start progress
      onProgress?.('reasoning', 0);

      // Call chat function with model switch to gemini-3.0-pro
      const responseStream = chatFn([systemMessage, userMessage]);

      // Collect response
      let synthesis = '';
      let reasoningText = '';
      let progress = 0;

      for await (const chunk of responseStream) {
        // Check for abort
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Deep think cancelled');
        }

        // Parse chunk (TanStack AI format)
        if (typeof chunk === 'object' && chunk !== null) {
          const response = chunk as {
            content?: Array<{ type: string; text?: string }>;
            delta?: { content?: Array<{ type: string; text?: string }> };
          };

          const content = response.content || response.delta?.content || [];

          for (const item of content) {
            if (item.type === 'text' && item.text) {
              synthesis += item.text;
              progress = Math.min(progress + 5, 90);
              setReasoningProgress(progress);
              onProgress?.('reasoning', progress);
            }
          }
        }
      }

      // Parse synthesis into structured result
      const structuredResult = parseSynthesis(synthesis, sources);

      // Complete
      setReasoningProgress(100);
      onProgress?.('synthesis', 100);
      setResult(structuredResult);
      setIsDeepThinking(false);

      return structuredResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deep think failed';
      setError(errorMessage);
      setIsDeepThinking(false);
      throw err;
    } finally {
      abortControllerRef.current = null;
    }
  }, [prompt, sources, isSupported, chatFn, onProgress]);

  /**
   * Cancel deep think
   */
  const cancelDeepThink = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsDeepThinking(false);
    setReasoningProgress(0);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsDeepThinking(false);
    setReasoningProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return {
    isDeepThinking,
    reasoningProgress,
    result,
    error,
    isSupported,
    platformError,
    startDeepThink,
    cancelDeepThink,
    reset,
  };
}

/**
 * Build system prompt for deep thinking
 */
function buildDeepThinkSystemPrompt(sources: Array<{ id: string; title: string; content: string }>): string {
  const sourceList = sources.map((s, i) => `Source ${i + 1}: ${s.title}\n${s.content}`).join('\n\n');

  return `You are an expert research analyst. Your task is to synthesize information from multiple sources, identify contradictions, and provide a comprehensive analysis.

${sources.length > 0 ? `Sources to analyze:\n${sourceList}` : ''}

Output format:
1. Start with a high-level summary
2. Provide a comparison table (Markdown format)
3. List reasoning steps
4. Include confidence scores (0-1) for each conclusion
5. Cite sources using [Source N] format

Be thorough, objective, and analytical.`;
}

/**
 * Build user prompt for deep thinking
 */
function buildDeepThinkUserPrompt(prompt: string, sources: Array<{ id: string; title: string }>): string {
  const sourceReferences = sources.map((s, i) => `[Source ${i + 1}: ${s.title}]`).join(', ');

  return `${prompt}

${sources.length > 0 ? `\n\nConsider these sources: ${sourceReferences}` : ''}

Please provide:
- A detailed analysis
- Comparison table if applicable
- Reasoning for your conclusions
- Confidence in your assessment`;
}

/**
 * Parse synthesis into structured result
 */
function parseSynthesis(synthesis: string, sources: Array<{ id: string; title: string; content: string }>): DeepThinkResult {
  // Extract reasoning steps (look for numbered lists or step indicators)
  const reasoningSteps = extractReasoningSteps(synthesis);

  // Extract confidence scores (look for percentages or confidence statements)
  const confidenceScores = extractConfidenceScores(synthesis, sources);

  // Extract citations (look for [Source N] references)
  const citations = extractCitations(synthesis, sources);

  return {
    synthesis,
    reasoningSteps,
    confidenceScores,
    citations,
    generatedAt: Date.now(),
  };
}

/**
 * Extract reasoning steps from synthesis
 */
function extractReasoningSteps(synthesis: string): Array<{ step: number; description: string; thought: string }> {
  const steps: Array<{ step: number; description: string; thought: string }> = [];

  // Look for numbered lists or step indicators
  const stepPattern = /(?:Step\s+(\d+)|(\d+)\.\s*([^\n]+))[:\s]*([^\n]*)/gi;
  let match;

  while ((match = stepPattern.exec(synthesis)) !== null) {
    const stepNum = parseInt(match[1] || match[2], 10);
    const description = match[3] || `Step ${stepNum}`;
    const thought = match[4] || '';

    steps.push({
      step: stepNum,
      description,
      thought,
    });
  }

  return steps;
}

/**
 * Extract confidence scores from synthesis
 */
function extractConfidenceScores(
  synthesis: string,
  sources: Array<{ id: string; title: string }>
): {
  overall: number;
  sources: Array<{ sourceId: string; confidence: number }>;
} {
  // Look for confidence indicators (e.g., "high confidence", "90% confident")
  const confidencePattern = /(?:confidence|certain|sure).*?(\d+)%/gi;
  const matches = synthesis.match(confidencePattern);

  let overall = 0.7; // Default confidence
  if (matches) {
    const percentages = matches.map((m) => parseInt(m.replace(/\D/g, ''), 10));
    overall = percentages.reduce((sum, p) => sum + p, 0) / percentages.length / 100;
  }

  // Extract per-source confidence
  const sourceConfidence = sources.map((source) => {
    const sourcePattern = new RegExp(`(?:${source.title}|source\\s*${sources.indexOf(source) + 1}).*?(\\d+)%`, 'gi');
    const sourceMatch = synthesis.match(sourcePattern);
    const confidence = sourceMatch
      ? parseInt(sourceMatch[0].replace(/\D/g, ''), 10) / 100
      : overall;

    return {
      sourceId: source.id,
      confidence,
    };
  });

  return {
    overall,
    sources: sourceConfidence,
  };
}

/**
 * Extract citations from synthesis
 */
function extractCitations(
  synthesis: string,
  sources: Array<{ id: string; title: string; content: string }>
): Array<{ sourceId: string; title: string; relevantText: string }> {
  const citations: Array<{ sourceId: string; title: string; relevantText: string }> = [];

  // Look for [Source N] references
  const citationPattern = /\[Source\s*(\d+)\]/gi;
  let match;

  while ((match = citationPattern.exec(synthesis)) !== null) {
    const sourceIndex = parseInt(match[1], 10) - 1;
    if (sourceIndex >= 0 && sourceIndex < sources.length) {
      const source = sources[sourceIndex];

      // Extract relevant text around citation
      const start = Math.max(0, match.index - 100);
      const end = Math.min(synthesis.length, match.index + 100);
      const relevantText = synthesis.substring(start, end).trim();

      citations.push({
        sourceId: source.id,
        title: source.title,
        relevantText,
      });
    }
  }

  return citations;
}
