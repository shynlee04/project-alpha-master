/**
 * @fileoverview AI Metadata Extraction Service (Story 6.4)
 * @module lib/knowledge/metadata-extractor
 * @governance EPIC-6-4
 * @ai-observable true
 *
 * Extracts AI-generated metadata from source content using Google Gemini API.
 * Provides summary, key concepts, and suggested questions for better content understanding.
 *
 * Story 6.4: Source Metadata Extraction
 *
 * @example
 * ```tsx
 * import { MetadataExtractor } from '@/lib/knowledge/metadata-extractor';
 *
 * const extractor = new MetadataExtractor();
 * const metadata = await extractor.extractAllMetadata(source);
 * console.log(metadata.summary); // AI-generated 3-sentence summary
 * ```
 */

import { GoogleGenAI } from '@google/genai';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import type { SourceRecord } from '@/lib/state/dexie-db';

/**
 * Extracted metadata result
 */
export interface ExtractedMetadata {
    /** AI-generated 3-sentence summary */
    summary?: string;
    /** Array of 5 key concept tags */
    keyConcepts?: string[];
    /** Array of 3 suggested questions */
    suggestedQuestions?: string[];
    /** Flag indicating AI analysis completed */
    metadataExtracted: boolean;
    /** Flag indicating user edited metadata */
    metadataEdited: boolean;
}

/**
 * AI Metadata Extraction Service
 *
 * Features:
 * - Generate 3-sentence summaries using Gemini API
 * - Extract 5 key concepts as tags
 * - Generate 3 thought-provoking questions
 * - Error handling with fallback to basic metadata
 * - Content truncation to avoid token limits
 * - API key management via credential vault
 */
export class MetadataExtractor {
    private readonly MAX_CONTENT_LENGTH = 10000; // 10k characters
    private readonly MODEL_NAME = 'gemini-2.0-flash';
    private client: GoogleGenAI | null = null;

    /**
     * Truncate content to maximum allowed length
     */
    private truncateContent(content: string): string {
        if (content.length <= this.MAX_CONTENT_LENGTH) {
            return content;
        }
        return content.substring(0, this.MAX_CONTENT_LENGTH);
    }

    /**
     * Get or create Gemini API client
     */
    private async getClient(): Promise<GoogleGenAI> {
        if (this.client) {
            return this.client;
        }

        const apiKey = await credentialVault.getCredential('google-gemini');

        if (!apiKey) {
            throw new Error('Google Gemini API key not found. Please add API key in settings.');
        }

        this.client = new GoogleGenAI({ apiKey: apiKey as string });
        return this.client;
    }

    /**
     * Check if API is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const apiKey = await credentialVault.getCredential('google-gemini');
            return !!apiKey;
        } catch {
            return false;
        }
    }

    /**
     * Extract basic statistics from content (no API needed)
     */
    extractBasicStats(content: string): { wordCount: number; charCount: number } {
        const words = content.trim().split(/\s+/).filter(Boolean);
        return {
            wordCount: words.length,
            charCount: content.length,
        };
    }

    /**
     * Generate AI-powered summary
     */
    async generateSummary(content: string): Promise<string> {
        try {
            const client = await this.getClient();
            const truncatedContent = this.truncateContent(content);

            const prompt = `Generate a concise 3-sentence summary of the following text. Focus on the main themes, key insights, and overall purpose. Each sentence should be clear and informative.

Text:
${truncatedContent}

Summary:`;

            const response = await client.models.generateContent({
                model: this.MODEL_NAME,
                contents: prompt,
            });

            const summary = response.text?.trim();

            if (!summary || summary.length === 0) {
                return 'AI analysis unavailable';
            }

            return summary;
        } catch (error) {
            console.error('[MetadataExtractor] Summary generation failed:', error);
            return 'AI analysis unavailable';
        }
    }

    /**
     * Extract key concepts using AI
     */
    async extractKeyConcepts(content: string): Promise<string[]> {
        try {
            const client = await this.getClient();
            const truncatedContent = this.truncateContent(content);

            const prompt = `Extract exactly 5 key concepts from the following text. Return ONLY a JSON array of strings, like this: ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]. Each concept should be 1-3 words long and represent a main topic or theme.

Text:
${truncatedContent}

Key Concepts:`;

            const response = await client.models.generateContent({
                model: this.MODEL_NAME,
                contents: prompt,
            });

            const text = response.text?.trim() || '';

            try {
                const concepts = JSON.parse(text);
                if (Array.isArray(concepts) && concepts.length === 5) {
                    return concepts;
                }
                return [];
            } catch {
                return [];
            }
        } catch (error) {
            console.error('[MetadataExtractor] Key concept extraction failed:', error);
            return [];
        }
    }

    /**
     * Generate suggested questions using AI
     */
    async generateSuggestedQuestions(content: string): Promise<string[]> {
        try {
            const client = await this.getClient();
            const truncatedContent = this.truncateContent(content);

            const prompt = `Generate exactly 3 thought-provoking questions about the following text. Return ONLY a JSON array of strings, like this: ["Question 1?", "Question 2?", "Question 3?"]. Each question should be answerable from the text and encourage deeper understanding.

Text:
${truncatedContent}

Questions:`;

            const response = await client.models.generateContent({
                model: this.MODEL_NAME,
                contents: prompt,
            });

            const text = response.text?.trim() || '';

            try {
                const questions = JSON.parse(text);
                if (Array.isArray(questions) && questions.length === 3) {
                    return questions;
                }
                return [];
            } catch {
                return [];
            }
        } catch (error) {
            console.error('[MetadataExtractor] Question generation failed:', error);
            return [];
        }
    }

    /**
     * Extract all metadata from a source
     */
    async extractAllMetadata(source: Pick<SourceRecord, 'content'>): Promise<ExtractedMetadata> {
        if (!source.content || source.content.trim().length === 0) {
            return {
                summary: 'AI analysis unavailable',
                keyConcepts: [],
                suggestedQuestions: [],
                metadataExtracted: false,
                metadataEdited: false,
            };
        }

        try {
            // Extract all metadata in parallel for speed
            const [summary, keyConcepts, suggestedQuestions] = await Promise.all([
                this.generateSummary(source.content),
                this.extractKeyConcepts(source.content),
                this.generateSuggestedQuestions(source.content),
            ]);

            return {
                summary,
                keyConcepts,
                suggestedQuestions,
                metadataExtracted: true,
                metadataEdited: false,
            };
        } catch (error) {
            console.error('[MetadataExtractor] Complete extraction failed:', error);
            return {
                summary: 'AI analysis unavailable',
                keyConcepts: [],
                suggestedQuestions: [],
                metadataExtracted: false,
                metadataEdited: false,
            };
        }
    }
}

/**
 * Singleton instance for convenience
 */
export const metadataExtractor = new MetadataExtractor();
