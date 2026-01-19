/**
 * @fileoverview Deep Think Synthesis Parsers
 * @module lib/agent/deep-think/deep-think-parsers
 * @governance EPIC-7-6
 *
 * Parser functions for extracting structured data from synthesis.
 */

import type { DeepThinkResult } from './deep-think-types';

export interface Source {
  id: string;
  title: string;
  content: string;
}

/**
 * Parse synthesis into structured result
 *
 * @param synthesis - Raw synthesis text
 * @param sources - Source references
 * @returns Structured deep think result
 */
export function parseSynthesis(synthesis: string, sources: Source[]): DeepThinkResult {
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
 *
 * @param synthesis - Raw synthesis text
 * @returns Array of reasoning steps
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
 *
 * @param synthesis - Raw synthesis text
 * @param sources - Source references
 * @returns Confidence scores (overall and per-source)
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
 *
 * @param synthesis - Raw synthesis text
 * @param sources - Source references
 * @returns Array of citations with relevant text
 */
function extractCitations(
  synthesis: string,
  sources: Source[]
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
