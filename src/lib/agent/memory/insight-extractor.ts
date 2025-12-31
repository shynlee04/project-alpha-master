/**
 * @fileoverview Insight Extractor for Conversation Memory
 * @module lib/agent/memory/insight-extractor
 * @governance EPIC-31-1
 *
 * Extracts key insights from conversations using AI.
 * Generates summaries and auto-tags for memory indexing.
 *
 * Story 31.1: Conversation Memory & Long-Term Context
 */

/**
 * Multimodal content types
 */
export type MultimodalContent =
  | { type: 'text'; text: string }
  | {
      type: 'image';
      source: { type: 'data'; value: string };
      metadata: { mimeType: 'image/jpeg' | 'image/png' | 'image/webp' };
    };

/**
 * Core message structure for AI conversations
 * Supports both simple string content and multimodal content arrays
 */
export interface CoreMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | MultimodalContent[];
}

export interface InsightExtractionOptions {
  /**
   * Conversation messages to analyze
   */
  messages: CoreMessage[];

  /**
   * Thread ID
   */
  threadId: string;

  /**
   * Maximum summary length
   */
  maxSummaryLength?: number;

  /**
   * Number of insights to extract
   */
  maxInsights?: number;
}

export interface ExtractedInsights {
  /**
   * AI-generated summary of conversation
   */
  summary: string;

  /**
   * Key insights extracted
   */
  insights: string[];

  /**
   * Auto-generated tags
   */
  tags: string[];
}

/**
 * Extract insights from conversation messages
 *
 * @param options - Extraction options
 * @param chatFn - TanStack AI chat function
 * @returns Extracted insights
 *
 * @example
 * ```typescript
 * const insights = await extractInsights({
 *   messages: conversationMessages,
 *   threadId: 'thread-123',
 *   maxSummaryLength: 500,
 *   maxInsights: 5,
 * }, chatFn);
 * ```
 */
export async function extractInsights(
  options: InsightExtractionOptions,
  chatFn?: (messages: CoreMessage[]) => AsyncIterable<unknown>
): Promise<ExtractedInsights> {
  const { messages, threadId, maxSummaryLength = 500, maxInsights = 5 } = options;

  if (!chatFn) {
    // Fallback to simple extraction without AI
    return extractInsightsSimple(messages, threadId);
  }

  // Build system prompt for insight extraction
  const systemMessage: CoreMessage = {
    role: 'system',
    content: `You are a conversation analyst. Your task is to:
1. Summarize the conversation in ${maxSummaryLength} characters or less
2. Extract ${maxInsights} key insights or learnings
3. Generate relevant tags for indexing

Output format (JSON):
{
  "summary": "Brief summary...",
  "insights": ["Insight 1", "Insight 2", ...],
  "tags": ["tag1", "tag2", ...]
}

Focus on actionable insights, user preferences, and important topics discussed.`,
  };

  // Build user message with conversation
  const userMessage: CoreMessage = {
    role: 'user',
    content: `Analyze this conversation and extract insights:\n\n${formatConversation(messages)}`,
  };

  try {
    // Call AI
    const responseStream = chatFn([systemMessage, userMessage]);

    // Collect response
    let responseText = '';

    for await (const chunk of responseStream) {
      if (typeof chunk === 'object' && chunk !== null) {
        const response = chunk as {
          content?: Array<{ type: string; text?: string }>;
          delta?: { content?: Array<{ type: string; text?: string }> };
        };

        const content = response.content || response.delta?.content || [];

        for (const item of content) {
          if (item.type === 'text' && item.text) {
            responseText += item.text;
          }
        }
      }
    }

    // Parse JSON response
    const parsed = JSON.parse(responseText);

    return {
      summary: parsed.summary || '',
      insights: parsed.insights || [],
      tags: parsed.tags || [],
    };
  } catch (error) {
    console.error('AI insight extraction failed, falling back to simple extraction:', error);
    return extractInsightsSimple(messages, threadId);
  }
}

/**
 * Extract insights without AI (simple fallback)
 */
function extractInsightsSimple(messages: CoreMessage[], _threadId: string): ExtractedInsights {
  // Extract all user messages
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)));

  // Generate simple summary (first 200 chars of first message)
  const summary =
    userMessages[0]?.substring(0, 200) +
    (userMessages.length > 1 ? '...' : '');

  // Extract potential insights (look for questions, requests)
  const insights: string[] = [];
  const keywords = ['how to', 'help me', 'explain', 'what is', 'can you', 'please'];

  for (const message of userMessages) {
    const lower = message.toLowerCase();
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        insights.push(message.substring(0, 100));
        break;
      }
    }

    if (insights.length >= 5) break;
  }

  // Generate tags from message content
  const tags = generateTags(userMessages);

  return {
    summary: summary || `Conversation from ${new Date().toLocaleDateString()}`,
    insights,
    tags,
  };
}

/**
 * Format conversation for AI analysis
 */
function formatConversation(messages: CoreMessage[]): string {
  return messages
    .map((m) => {
      const role = m.role.toUpperCase();
      const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return `${role}: ${content}`;
    })
    .join('\n\n');
}

/**
 * Generate tags from message content
 */
function generateTags(messages: string[]): string[] {
  const tags: Set<string> = new Set();

  const techKeywords = [
    'javascript', 'typescript', 'python', 'react', 'vue', 'angular',
    'database', 'api', 'frontend', 'backend', 'fullstack',
    'git', 'docker', 'testing', 'debugging', 'algorithm',
    'pdf', 'audio', 'video', 'image', 'multimodal',
  ];

  const domainKeywords = [
    'biology', 'chemistry', 'physics', 'math', 'history',
    'economics', 'finance', 'business', 'management',
    'design', 'ux', 'ui', 'programming', 'development',
  ];

  const allKeywords = [...techKeywords, ...domainKeywords];

  for (const message of messages) {
    const lower = message.toLowerCase();

    for (const keyword of allKeywords) {
      if (lower.includes(keyword)) {
        tags.add(keyword);
      }
    }
  }

  return Array.from(tags).slice(0, 5); // Max 5 tags
}

/**
 * Auto-extract and store conversation insights
 *
 * @param options - Extraction options
 * @param chatFn - Optional chat function
 * @returns Stored conversation ID
 */
export async function autoExtractAndStore(
  options: InsightExtractionOptions,
  chatFn?: (messages: CoreMessage[]) => AsyncIterable<unknown>
): Promise<number | null> {
  const { threadId, messages } = options;

  // Extract insights
  const extracted = await extractInsights(options, chatFn);

  // Store in conversation memory
  const { storeConversation } = await import('./conversation-memory');

  return await storeConversation(
    threadId,
    extracted.summary,
    extracted.insights,
    undefined, // TODO: Generate embedding
    messages.length,
    extracted.tags
  );
}
