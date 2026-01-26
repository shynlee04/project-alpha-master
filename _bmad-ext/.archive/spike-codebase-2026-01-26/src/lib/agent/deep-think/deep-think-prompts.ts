/**
 * @fileoverview Deep Think Prompt Builders
 * @module lib/agent/deep-think/deep-think-prompts
 * @governance EPIC-7-6
 *
 * Prompt builder functions for deep think synthesis.
 */

export interface Source {
  id: string;
  title: string;
  content: string;
}

/**
 * Build system prompt for deep thinking
 *
 * @param sources - Sources to analyze
 * @returns System prompt string
 */
export function buildDeepThinkSystemPrompt(sources: Source[]): string {
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
 *
 * @param prompt - User prompt
 * @param sources - Sources to reference
 * @returns User prompt string
 */
export function buildDeepThinkUserPrompt(prompt: string, sources: Array<{ id: string; title: string }>): string {
  const sourceReferences = sources.map((s, i) => `[Source ${i + 1}: ${s.title}]`).join(', ');

  return `${prompt}

${sources.length > 0 ? `\n\nConsider these sources: ${sourceReferences}` : ''}

Please provide:
- A detailed analysis
- Comparison table if applicable
- Reasoning for your conclusions
- Confidence in your assessment`;
}
