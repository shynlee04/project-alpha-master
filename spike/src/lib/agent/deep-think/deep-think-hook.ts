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
import type { DeepThinkOptions, UseDeepThinkResult, DeepThinkResult } from './deep-think-types';
import { buildDeepThinkSystemPrompt, buildDeepThinkUserPrompt } from './deep-think-prompts';
import { parseSynthesis } from './deep-think-parsers';

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
    // longPressDuration = 1000,
    // model = 'gemini-3.0-pro',
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
      // let reasoningText = '';
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
