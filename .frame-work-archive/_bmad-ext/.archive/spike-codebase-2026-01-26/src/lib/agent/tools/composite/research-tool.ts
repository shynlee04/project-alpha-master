/**
 * @fileoverview Research Composite Tool
 * @module lib/agent/tools/composite/research-tool
 *
 * Composite agentic tool that orchestrates multi-step research workflow:
 * 1. Search/discover sources
 * 2. Fetch content from URLs
 * 3. Extract relevant information
 * 4. Ground and cross-reference with AI
 * 5. Synthesize final answer
 *
 * Implements the ReAct (Reasoning + Acting) pattern.
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-02 - Composite Tool Implementations
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import {
  ResearchDepthSchema,
  type ResearchResult,
  type SourceReference,
  type CompositeToolContext,
} from './types';

/**
 * Research tool input schema
 */
export const ResearchInputSchema = z.object({
  query: z.string().describe('The research query or question to answer'),
  sources: z.array(z.string()).optional()
    .describe('Specific URLs to include in research'),
  depth: ResearchDepthSchema.optional().default('standard')
    .describe('Research depth: quick (1-2 sources), standard (3-5), deep (5-10)'),
  groundWithAI: z.boolean().optional().default(true)
    .describe('Use AI to ground and verify facts across sources'),
  includeQuotes: z.boolean().optional().default(true)
    .describe('Include direct quotes from sources'),
  language: z.string().optional().default('en')
    .describe('Preferred language for results'),
});

export type ResearchInput = z.infer<typeof ResearchInputSchema>;

/**
 * Research tool definition
 */
export const researchDef = toolDefinition({
  name: 'research',
  description: `Research a topic using web sources with AI-powered grounding.
This composite tool orchestrates a multi-step research workflow:
1. Searches for relevant sources on the web
2. Fetches and parses content from URLs
3. Extracts key facts and information
4. Cross-references and grounds facts using AI
5. Synthesizes a comprehensive answer with citations

Use this when you need to:
- Answer questions requiring external knowledge
- Gather information from multiple sources
- Verify facts with citations
- Create grounded, factual responses`,
  inputSchema: ResearchInputSchema,
  needsApproval: false, // Research is read-only
});

/**
 * Create research composite tool client implementation
 *
 * @param getContext - Function to get composite tool context
 * @returns TanStack AI tool client implementation
 */
export function createResearchTool(getContext: () => CompositeToolContext) {
  return researchDef.client(async (input: unknown): Promise<ResearchResult> => {
    const args = input as ResearchInput;
    const context = getContext();

    try {
      // Determine number of sources based on depth
      const maxSources = {
        quick: 2,
        standard: 5,
        deep: 10,
      }[args.depth || 'standard'];

      // Step 1: Search for sources (if not provided)
      let sourceUrls = args.sources || [];
      
      if (sourceUrls.length === 0 && context.webSearch) {
        console.log('[ResearchTool] Step 1: Searching for sources...');
        const searchResults = await context.webSearch(args.query, {
          maxResults: maxSources,
        });
        sourceUrls = searchResults.map((r) => r.url);
      }

      if (sourceUrls.length === 0) {
        // No web search available, use AI directly
        console.log('[ResearchTool] No web search available, using AI directly');
        const directAnswer = await context.callAI(
          `Research and answer the following question with citations where possible:

Question: ${args.query}

Provide a comprehensive answer with relevant facts and context.`,
          {
            temperature: 0.3,
            systemPrompt: 'You are a research assistant. Provide accurate, factual information.',
          }
        );

        return {
          success: true,
          answer: directAnswer,
          summary: directAnswer.substring(0, 200) + '...',
          sources: [],
          confidence: 0.6,
        };
      }

      // Step 2: Fetch content from URLs
      console.log('[ResearchTool] Step 2: Fetching content from sources...');
      const fetchedContents: Array<{ url: string; content: string; error?: string }> = [];

      for (const url of sourceUrls.slice(0, maxSources)) {
        try {
          const content = await context.fetchUrl(url);
          fetchedContents.push({ url, content });
        } catch (error) {
          fetchedContents.push({
            url,
            content: '',
            error: error instanceof Error ? error.message : 'Failed to fetch',
          });
        }
      }

      const successfulFetches = fetchedContents.filter((f) => !f.error);

      if (successfulFetches.length === 0) {
        return {
          success: false,
          error: 'Failed to fetch any sources',
        };
      }

      // Step 3: Extract relevant information using AI
      console.log('[ResearchTool] Step 3: Extracting relevant information...');
      const extractedFacts: SourceReference[] = [];

      for (const { url, content } of successfulFetches) {
        // Truncate content for AI processing
        const truncatedContent = content.length > 10000 
          ? content.substring(0, 10000) + '...' 
          : content;

        const extractionPrompt = `Extract key facts relevant to this query from the following content:

Query: ${args.query}

Content from ${url}:
${truncatedContent}

Provide:
1. Title of the source (if detectable)
2. Most relevant snippet (1-3 sentences)
3. Key facts that help answer the query

Format as JSON: { "title": "...", "snippet": "...", "facts": ["..."] }`;

        try {
          const extracted = await context.callAI(extractionPrompt, {
            temperature: 0.1,
            maxTokens: 500,
          });

          // Parse extraction result
          const jsonMatch = extracted.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            extractedFacts.push({
              url,
              title: parsed.title || 'Unknown Source',
              snippet: parsed.snippet || '',
              relevanceScore: 0.7,
              retrievedAt: new Date().toISOString(),
            });
          }
        } catch {
          // Skip failed extractions
          extractedFacts.push({
            url,
            title: 'Source',
            snippet: content.substring(0, 200),
            relevanceScore: 0.3,
          });
        }
      }

      // Step 4: Ground and synthesize with AI
      console.log('[ResearchTool] Step 4: Grounding and synthesizing...');
      const sourceSummaries = extractedFacts
        .map((s, i) => `[${i + 1}] ${s.title}: ${s.snippet}`)
        .join('\n\n');

      const synthesisPrompt = `Based on the following sources, provide a comprehensive answer to the query:

Query: ${args.query}

Sources:
${sourceSummaries}

Instructions:
1. Synthesize information from all sources
2. Cite sources using [1], [2], etc.
3. Indicate confidence level (high/medium/low)
4. Note any conflicting information
5. Provide a clear, well-structured answer`;

      const answer = await context.callAI(synthesisPrompt, {
        temperature: 0.3,
        systemPrompt: 'You are a research assistant synthesizing information from multiple sources.',
      });

      // Generate summary
      const summaryPrompt = `Summarize this answer in 2-3 sentences:\n\n${answer}`;
      const summary = await context.callAI(summaryPrompt, {
        temperature: 0.1,
        maxTokens: 100,
      });

      return {
        success: true,
        answer,
        summary,
        sources: extractedFacts,
        confidence: extractedFacts.length >= 3 ? 0.85 : 0.65,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown research error';
      console.error('[ResearchTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}
