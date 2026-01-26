/**
 * @fileoverview Content-Based Routing Agent
 * @module lib/workflow/agents/content-routing-agent
 * @governance EPIC-E4-3
 * @created 2026-01-06
 *
 * Analyzes query intent and routes to specialized handlers.
 *
 * Story E4-3: Content-Based Routing Agent
 */

import { credentialVault } from '@/lib/agent/providers';

// ============================================================================
// Types
// ============================================================================

/**
 * Supported intent categories
 */
export enum IntentType {
    /** Code generation, debugging, technical questions */
    CODING = 'coding',
    /** Information lookup, research, fact-finding */
    RESEARCH = 'research',
    /** Content creation, editing, documentation */
    WRITING = 'writing',
    /** General conversation, unclear intent */
    GENERAL = 'general',
    /** Unknown intent (fallback) */
    UNKNOWN = 'unknown',
}

/**
 * Routing decision with metadata
 */
export interface RoutingDecision {
    /** Classified intent */
    intent: IntentType;
    /** Confidence score (0-1) */
    confidence: number;
    /** Reasoning for the classification */
    reasoning: string;
    /** Suggested agent/tool to use */
    suggestedAgent: string;
    /** Suggested tools to enable */
    suggestedTools: string[];
    /** Timestamp of decision */
    timestamp: number;
}

/**
 * Routing configuration
 */
export interface RoutingConfig {
    /** Provider ID for classification LLM */
    providerId?: string;
    /** Model to use for classification (default: gemini-2.0-flash) */
    model?: string;
    /** Minimum confidence threshold (default: 0.5) */
    minConfidence?: number;
    /** Enable learning from corrections (default: true) */
    enableLearning?: boolean;
}

/**
 * Context for routing decision
 */
export interface RoutingContext {
    /** User query/message */
    query: string;
    /** Workspace type (ide, knowledge, notes, study) */
    workspaceType?: string;
    /** Conversation history for context */
    history?: Array<{ role: string; content: string }>;
    /** Available agents/tools */
    availableAgents?: string[];
}

/**
 * Feedback for learning
 */
export interface RoutingFeedback {
    /** Original query */
    query: string;
    /** Original routing decision */
    originalDecision: RoutingDecision;
    /** Correct intent (user-provided) */
    correctIntent: IntentType;
    /** Timestamp of feedback */
    timestamp: number;
}

// ============================================================================
// Errors
// ============================================================================

export class RoutingError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'RoutingError';
    }
}

export const ROUTING_ERRORS = {
    NO_CREDENTIALS: 'no_credentials',
    CLASSIFICATION_FAILED: 'classification_failed',
    INVALID_RESPONSE: 'invalid_response',
    LOW_CONFIDENCE: 'low_confidence',
} as const;

// ============================================================================
// Constants
// ============================================================================

/**
 * Default routing configuration
 */
const DEFAULT_CONFIG: Required<RoutingConfig> = {
    providerId: 'gemini',
    model: 'gemini-2.0-flash',
    minConfidence: 0.5,
    enableLearning: true,
};

/**
 * Few-shot examples for intent classification
 */
const CLASSIFICATION_EXAMPLES = [
    {
        query: "How do I implement a binary search tree in TypeScript?",
        intent: IntentType.CODING,
        reasoning: "Asks for implementation of a data structure in a programming language",
    },
    {
        query: "What are the latest developments in quantum computing?",
        intent: IntentType.RESEARCH,
        reasoning: "Seeks current information on a scientific topic",
    },
    {
        query: "Help me write a professional email to my client",
        intent: IntentType.WRITING,
        reasoning: "Requests assistance with content creation for communication",
    },
    {
        query: "Can you explain what machine learning is?",
        intent: IntentType.GENERAL,
        reasoning: "General educational question without specific task requirement",
    },
] as const;

/**
 * Agent suggestions per intent
 */
const INTENT_TO_AGENT: Record<IntentType, { agent: string; tools: string[] }> = {
    [IntentType.CODING]: {
        agent: 'code-assistant',
        tools: ['read', 'write', 'execute', 'search_code'],
    },
    [IntentType.RESEARCH]: {
        agent: 'research-assistant',
        tools: ['web_search', 'read'],
    },
    [IntentType.WRITING]: {
        agent: 'writing-assistant',
        tools: ['note_create', 'note_search', 'read'],
    },
    [IntentType.GENERAL]: {
        agent: 'general-assistant',
        tools: ['chat'],
    },
    [IntentType.UNKNOWN]: {
        agent: 'general-assistant',
        tools: ['chat'],
    },
};

// ============================================================================
// Agent Class
// ============================================================================

/**
 * Content-Based Routing Agent
 *
 * Analyzes user queries to determine intent and route to specialized agents.
 * Uses few-shot classification with configurable LLM provider.
 */
export class ContentRoutingAgent {
    private config: Required<RoutingConfig>;
    private feedbackHistory: RoutingFeedback[] = [];

    constructor(config: RoutingConfig = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Classify intent from query
     */
    async classifyIntent(context: RoutingContext): Promise<RoutingDecision> {
        const { query, workspaceType, history } = context;

        // Fast path: check for explicit keywords
        const keywordMatch = this.checkKeywords(query);
        if (keywordMatch) {
            return this.createDecision(keywordMatch, 0.9, 'Keyword match');
        }

        // LLM-based classification for ambiguous queries
        try {
            const prompt = this.buildClassificationPrompt(query, workspaceType, history);
            const classification = await this.callClassificationAPI(prompt);

            // Validate confidence threshold
            if (classification.confidence < this.config.minConfidence) {
                return this.createDecision(IntentType.GENERAL, classification.confidence, 'Low confidence, using general fallback');
            }

            return classification;
        } catch (error) {
            console.error('[ContentRoutingAgent] Classification failed:', error);
            return this.createDecision(IntentType.GENERAL, 0, 'Classification error, using general fallback');
        }
    }

    /**
     * Fast keyword-based classification
     */
    private checkKeywords(query: string): IntentType | null {
        const lowerQuery = query.toLowerCase();

        // Coding keywords
        const codingKeywords = ['code', 'function', 'class', 'implement', 'debug', 'compile', 'syntax', 'algorithm', 'api', 'endpoint'];
        if (codingKeywords.some(kw => lowerQuery.includes(kw))) {
            return IntentType.CODING;
        }

        // Research keywords
        const researchKeywords = ['search', 'find', 'lookup', 'research', 'what is', 'who is', 'when did', 'latest', 'recent'];
        if (researchKeywords.some(kw => lowerQuery.includes(kw))) {
            return IntentType.RESEARCH;
        }

        // Writing keywords
        const writingKeywords = ['write', 'draft', 'compose', 'edit', 'summarize', 'outline', 'blog post', 'email', 'document'];
        if (writingKeywords.some(kw => lowerQuery.includes(kw))) {
            return IntentType.WRITING;
        }

        return null;
    }

    /**
     * Build few-shot classification prompt
     */
    private buildClassificationPrompt(
        query: string,
        workspaceType?: string,
        history?: Array<{ role: string; content: string }>
    ): string {
        let prompt = `You are an intent classifier. Analyze the user query and determine the most appropriate category.

Categories:
- coding: Code generation, debugging, technical implementation, programming questions
- research: Information lookup, fact-finding, web search, current events
- writing: Content creation, editing, documentation, communication
- general: General conversation, unclear or mixed intent

Examples:
${CLASSIFICATION_EXAMPLES.map(ex => `- Query: "${ex.query}"
  Intent: ${ex.intent}
  Reasoning: ${ex.reasoning}`).join('\n\n')}`;

        if (workspaceType) {
            prompt += `\n\nUser is in workspace: ${workspaceType}`;
        }

        if (history && history.length > 0) {
            const recent = history.slice(-3);
            prompt += `\n\nRecent conversation:\n${recent.map(m => `${m.role}: ${m.content}`).join('\n')}`;
        }

        prompt += `\n\nNow classify this query: "${query}"

Respond in JSON format:
{
  "intent": "coding|research|writing|general",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation"
}`;

        return prompt;
    }

    /**
     * Call classification API
     */
    private async callClassificationAPI(prompt: string): Promise<RoutingDecision> {
        const apiKey = await credentialVault.getCredentials(this.config.providerId);
        if (!apiKey) {
            throw new RoutingError('No credentials found for provider', ROUTING_ERRORS.NO_CREDENTIALS);
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 200,
                    responseMimeType: 'application/json',
                },
            }),
        });

        if (!response.ok) {
            throw new RoutingError(`API call failed: ${response.status}`, ROUTING_ERRORS.CLASSIFICATION_FAILED);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new RoutingError('No response content', ROUTING_ERRORS.INVALID_RESPONSE);
        }

        try {
            const parsed = JSON.parse(text);
            return this.parseClassificationResponse(parsed);
        } catch (error) {
            console.error('[ContentRoutingAgent] Failed to parse response:', text);
            throw new RoutingError('Invalid JSON response', ROUTING_ERRORS.INVALID_RESPONSE);
        }
    }

    /**
     * Parse classification response
     */
    private parseClassificationResponse(data: { intent?: string; confidence?: number; reasoning?: string }): RoutingDecision {
        const intent = this.validateIntent(data.intent);
        const confidence = Math.min(1, Math.max(0, data.confidence ?? 0.5));
        const reasoning = data.reasoning || 'No reasoning provided';

        return this.createDecision(intent, confidence, reasoning);
    }

    /**
     * Validate and normalize intent
     */
    private validateIntent(intent: unknown): IntentType {
        if (typeof intent === 'string' && Object.values(IntentType).includes(intent as IntentType)) {
            return intent as IntentType;
        }
        return IntentType.GENERAL;
    }

    /**
     * Create routing decision
     */
    private createDecision(intent: IntentType, confidence: number, reasoning: string): RoutingDecision {
        const suggestion = INTENT_TO_AGENT[intent];
        return {
            intent,
            confidence,
            reasoning,
            suggestedAgent: suggestion.agent,
            suggestedTools: suggestion.tools,
            timestamp: Date.now(),
        };
    }

    /**
     * Record feedback for learning
     */
    recordFeedback(feedback: RoutingFeedback): void {
        if (!this.config.enableLearning) return;

        this.feedbackHistory.push(feedback);

        // Keep only last 100 feedback entries
        if (this.feedbackHistory.length > 100) {
            this.feedbackHistory = this.feedbackHistory.slice(-100);
        }

        console.log('[ContentRoutingAgent] Feedback recorded:', {
            query: feedback.query.substring(0, 50),
            original: feedback.originalDecision.intent,
            corrected: feedback.correctIntent,
        });
    }

    /**
     * Get feedback statistics
     */
    getFeedbackStats(): { total: number; accuracy: number; intentBreakdown: Record<string, number> } {
        const total = this.feedbackHistory.length;
        if (total === 0) {
            return { total: 0, accuracy: 0, intentBreakdown: {} };
        }

        const correct = this.feedbackHistory.filter(f => f.originalDecision.intent === f.correctIntent).length;
        const accuracy = correct / total;

        const breakdown: Record<string, number> = {};
        for (const feedback of this.feedbackHistory) {
            breakdown[feedback.correctIntent] = (breakdown[feedback.correctIntent] || 0) + 1;
        }

        return { total, accuracy, intentBreakdown: breakdown };
    }

    /**
     * Get routing suggestions for UI display
     */
    getSuggestions(decision: RoutingDecision): string[] {
        const suggestions: string[] = [];

        switch (decision.intent) {
            case IntentType.CODING:
                suggestions.push('Consider enabling IDE tools for code execution');
                suggestions.push('Provide code context for better suggestions');
                break;
            case IntentType.RESEARCH:
                suggestions.push('Enable web search for current information');
                suggestions.push('Specify sources for academic research');
                break;
            case IntentType.WRITING:
                suggestions.push('Select a note to save your content');
                suggestions.push('Provide target audience for tone adjustment');
                break;
            case IntentType.GENERAL:
                suggestions.push('This query will use standard chat capabilities');
                break;
        }

        if (decision.confidence < 0.6) {
            suggestions.push('Routing confidence is low - you can specify the desired mode');
        }

        return suggestions;
    }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a routing agent with default or custom config
 */
export function createRoutingAgent(config?: RoutingConfig): ContentRoutingAgent {
    return new ContentRoutingAgent(config);
}

/**
 * Classify a single query (convenience function)
 */
export async function classifyQuery(
    query: string,
    config?: RoutingConfig
): Promise<RoutingDecision> {
    const agent = new ContentRoutingAgent(config);
    return agent.classifyIntent({ query });
}

/**
 * Classify with workspace context
 */
export async function classifyQueryWithContext(
    query: string,
    workspaceType?: string,
    history?: Array<{ role: string; content: string }>,
    config?: RoutingConfig
): Promise<RoutingDecision> {
    const agent = new ContentRoutingAgent(config);
    return agent.classifyIntent({ query, workspaceType, history });
}
