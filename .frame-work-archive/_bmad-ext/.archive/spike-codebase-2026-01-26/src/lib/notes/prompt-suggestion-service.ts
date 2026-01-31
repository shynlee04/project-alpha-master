/**
 * @fileoverview AI Prompt Suggestion Service
 * @module lib/notes/prompt-suggestion-service
 * @created 2026-01-13
 * @story 43-04: AI prompt suggestion based on context
 *
 * Analyzes note content and generates relevant AI prompt suggestions
 * using the configured AI agent.
 */

import { generateNoteContent } from './note-ai-service';
import { type PromptSuggestion } from './prompt-suggestion-store';

/**
 * Suggestion category types
 */
export type SuggestionCategory = PromptSuggestion['category'];

/**
 * Configuration for suggestion generation
 */
export interface SuggestionConfig {
    maxSuggestions?: number;  // Maximum number of suggestions (default: 5)
    minConfidence?: number;   // Minimum confidence threshold (default: 50)
    categories?: SuggestionCategory[];  // Categories to suggest (default: all)
}

/**
 * Error class for suggestion service
 */
export class SuggestionError extends Error {
    code: 'NO_CONTENT' | 'ANALYSIS_FAILED' | 'PARSE_FAILED';

    constructor(code: 'NO_CONTENT' | 'ANALYSIS_FAILED' | 'PARSE_FAILED', message: string) {
        super(message);
        this.name = 'SuggestionError';
        this.code = code;
    }
}

/**
 * Prompt template for AI to generate suggestions
 */
const SUGGESTION_PROMPT = `Analyze the following note content and suggest 3-5 relevant AI prompts that would help the user improve or work with this content.

For each suggestion, provide:
- A clear, concise title (5-10 words)
- A brief description (15-25 words)
- The actual prompt to use (specific, actionable)
- Category: analysis, writing, productivity, improvement, or question
- Confidence score: 0-100 based on how relevant this suggestion is

Return your response in this JSON format:
[
  {
    "title": "Summarize Key Points",
    "description": "Generate a concise summary of the main topics",
    "suggestedPrompt": "Create a bulleted summary of the key points from this content",
    "category": "analysis",
    "confidence": 85,
    "matchedKeywords": ["main points", "summary"]
  }
]

Note content:
`;

/**
 * Generate AI prompt suggestions based on note content
 * @param content - The note content to analyze
 * @param config - Configuration options
 * @returns Array of suggested prompts
 * @throws {SuggestionError} If content is empty or analysis fails
 */
export async function generatePromptSuggestions(
    content: string,
    config: SuggestionConfig = {}
): Promise<PromptSuggestion[]> {
    const {
        maxSuggestions = 5,
        minConfidence = 50,
        categories,
    } = config;

    // 1. Validate input
    if (!content || content.trim().length === 0) {
        throw new SuggestionError(
            'NO_CONTENT',
            'Note content is empty. Cannot generate suggestions.'
        );
    }

    if (content.trim().length < 50) {
        // Too short for meaningful analysis
        return [];
    }

    // 2. Build the full prompt
    const fullPrompt = `${SUGGESTION_PROMPT}\n${content}\n\nGenerate ${maxSuggestions} suggestions.`;

    // 3. Call AI to generate suggestions
    try {
        const response = await generateNoteContent(fullPrompt, {
            contextBlocks: undefined, // No additional context needed
        });

        if (!response || response.trim().length === 0) {
            throw new SuggestionError(
                'ANALYSIS_FAILED',
                'AI returned empty response'
            );
        }

        // 4. Parse JSON response
        const suggestions = parseAIResponse(response);

        // 5. Filter and validate
        const filtered = suggestions
            .filter((s) => s.confidence !== undefined && s.confidence >= minConfidence)
            .filter((s) => s.category !== undefined && (!categories || categories.includes(s.category)))
            .slice(0, maxSuggestions);

        // 6. Add metadata
        const withMetadata = filtered.map((s, index) => ({
            ...s,
            id: `suggestion-${Date.now()}-${index}`,
            createdAt: Date.now(),
        })) as PromptSuggestion[];

        return withMetadata;
    } catch (error) {
        console.error('[PromptSuggestionService] Analysis failed:', error);
        
        if (error instanceof SuggestionError) {
            throw error;
        }

        throw new SuggestionError(
            'ANALYSIS_FAILED',
            `Failed to generate suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Parse AI response and extract JSON array
 * Handles cases where AI might wrap JSON in markdown code blocks
 */
function parseAIResponse(response: string): Partial<PromptSuggestion>[] {
    const trimmed = response.trim();

    // Try to extract JSON from markdown code blocks
    const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : trimmed;

    try {
        const parsed = JSON.parse(jsonStr);
        
        if (!Array.isArray(parsed)) {
            console.warn('[PromptSuggestionService] Response is not an array, treating as single suggestion');
            return [validateSuggestion(parsed)];
        }

        return parsed.map(validateSuggestion);
    } catch (error) {
        console.warn('[PromptSuggestionService] Failed to parse JSON:', error);
        
        // Fallback: Try to extract individual suggestions using regex
        return extractFallbackSuggestions(trimmed);
    }
}

/**
 * Validate and sanitize a suggestion object
 */
function validateSuggestion(suggestion: any): Partial<PromptSuggestion> {
    const cat = suggestion.category;
    const isValidCategory =
        cat &&
        typeof cat === 'string' &&
        Object.hasOwn(SUGGESTION_CATEGORIES, cat);

    return {
        title: suggestion.title || 'Untitled Suggestion',
        description: suggestion.description || '',
        suggestedPrompt: suggestion.suggestedPrompt || suggestion.prompt || '',
        category: isValidCategory ? (cat as SuggestionCategory) : 'improvement',
        confidence: Math.min(100, Math.max(0, suggestion.confidence ?? 50)),
        matchedKeywords: Array.isArray(suggestion.matchedKeywords)
            ? suggestion.matchedKeywords
            : [],
    };
}

/**
 * Fallback extraction when JSON parsing fails
 * Very basic regex-based approach
 */
function extractFallbackSuggestions(text: string): Partial<PromptSuggestion>[] {
    const suggestions: Partial<PromptSuggestion>[] = [];
    
    // Simple patterns to find suggestions
    const lines = text.split('\n');
    let current: Partial<PromptSuggestion> | null = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Detect numbered lists or bullet points
        if (/^\d+\.|^-\s+|^•\s+/.test(trimmed)) {
            if (current) {
                suggestions.push(validateSuggestion(current));
            }
            current = {
                title: trimmed.replace(/^\d+\.|^-\s+|^•\s+/, '').trim(),
                description: '',
                suggestedPrompt: '',
                category: 'improvement',
                confidence: 60,
                matchedKeywords: [],
            };
        } else if (current) {
            // Accumulate description
            current.description += ' ' + trimmed;
            current.suggestedPrompt = current.title + ' ' + current.description;
        }
    }
    
    if (current) {
        suggestions.push(validateSuggestion(current));
    }
    
    return suggestions.slice(0, 3); // Limit to 3 fallback suggestions
}

/**
 * Get all available suggestion categories
 */
export const SUGGESTION_CATEGORIES: Record<
    SuggestionCategory,
    { id: SuggestionCategory; label: string; labelVi: string; icon: string; description: string }
> = {
    analysis: {
        id: 'analysis',
        label: 'Analyze',
        labelVi: 'Phân tích',
        icon: 'Brain',
        description: 'Deep dive into content',
    },
    writing: {
        id: 'writing',
        label: 'Writing',
        labelVi: 'Viết',
        icon: 'PenTool',
        description: 'Improve or create content',
    },
    productivity: {
        id: 'productivity',
        label: 'Productivity',
        labelVi: 'Năng suất',
        icon: 'ListTodo',
        description: 'Tasks and organization',
    },
    improvement: {
        id: 'improvement',
        label: 'Improve',
        labelVi: 'Cải thiện',
        icon: 'Sparkles',
        description: 'Enhance existing content',
    },
    question: {
        id: 'question',
        label: 'Questions',
        labelVi: 'Câu hỏi',
        icon: 'FileQuestion',
        description: 'Generate study questions',
    },
};

/**
 * Get localized category label
 */
export function getLocalizedCategoryLabel(
    category: SuggestionCategory,
    locale = 'en'
): string {
    const isVietnamese = locale.toLowerCase().startsWith('vi');
    const cat = SUGGESTION_CATEGORIES[category];
    return isVietnamese ? cat.labelVi : cat.label;
}