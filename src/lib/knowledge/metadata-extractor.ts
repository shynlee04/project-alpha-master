/**
 * @fileoverview Metadata Extractor Service using Gemini API
 * @module lib/knowledge/metadata-extractor
 * @governance EPIC-6-4
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import type { SourceMetadata } from '@/lib/state/dexie-db';

/**
 * Zod schema for metadata generation response
 */
export const metadataGenerationSchema = z.object({
    summary: z.string().describe("A concise 3-sentence summary of the content"),
    keyConcepts: z.array(z.string()).min(1).max(10).describe("Up to 5 key concepts extracted from the content as tags"),
    suggestedQuestions: z.array(z.string()).min(1).max(5).describe("3 suggested questions to explore further"),
    language: z.string().optional().describe("The primary language of the content (e.g. 'en', 'vi')"),
    readingTime: z.string().optional().describe("Estimated reading time (e.g. '5 min')"),
});

export type MetadataGenerationResult = z.infer<typeof metadataGenerationSchema>;

/**
 * System prompt for metadata extraction
 */
const METADATA_SYSTEM_PROMPT = `You are a research assistant. Analyze the provided content and extract key metadata.
Requirements:
1. Generate a concise 3-sentence summary.
2. Identify 5 key concepts (tags).
3. Suggest 3 follow-up questions for deeper understanding.
4. Estimate reading time.
5. Identify primary language (en, vi, etc.).

Output must be valid JSON matching the schema.`;

/**
 * MetadataExtractor class
 */
export class MetadataExtractor {
    private client: GoogleGenAI | null = null;
    private model: string = 'gemini-2.5-flash';

    constructor(apiKey?: string) {
        const key = apiKey || credentialVault.getCredential('google')?.apiKey;
        if (key) {
            this.client = new GoogleGenAI({ api: key });
        }
    }

    /**
     * Check if AI service is available
     */
    isAvailable(): boolean {
        return !!this.client;
    }

    /**
     * Generate AI analysis for content
     */
    async generateAnalysis(content: string): Promise<MetadataGenerationResult> {
        if (!this.client) {
            throw new Error('AI service not configured. Please check your API key.');
        }

        // Truncate content if too large (approx 30k tokens for safety, though 2.5 flash allows more)
        // 1 token ~= 4 chars
        const truncatedContent = content.slice(0, 100000);

        const response = await this.client.models.generateContent({
            model: this.model,
            contents: `${METADATA_SYSTEM_PROMPT}\n\nContent:\n${truncatedContent}`,
            config: {
                responseMimeType: 'application/json',
                responseJsonSchema: zodToJsonSchema(metadataGenerationSchema),
            },
        });

        const text = response.text();
        if (!text) {
            throw new Error('Empty response from AI service');
        }

        try {
            const parsed = JSON.parse(text);
            return metadataGenerationSchema.parse(parsed);
        } catch (error) {
            console.error('Metadata extraction parsing error:', error);
            throw new Error('Failed to parse AI response');
        }
    }

    /**
     * Extract basic metadata locally (stats)
     */
    extractBasicStats(content: string): Partial<SourceMetadata> {
        const words = content.trim().split(/\s+/).length;
        // Estimate reading time: 200 words per minute
        const minutes = Math.ceil(words / 200);

        return {
            readingTime: `${minutes} min read`
        };
    }
}

/**
 * Mock Metadata Extractor for testing/offline
 */
export class MockMetadataExtractor {
    async generateAnalysis(content: string): Promise<MetadataGenerationResult> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            summary: "This is a mock summary of the content generated for testing purposes. It describes the key points effectively.",
            keyConcepts: ["Mock Concept", "Testing", "Metadata"],
            suggestedQuestions: ["How does this work?", "Is it reliable?", "What are the limitations?"],
            language: "en",
            readingTime: "1 min read"
        };
    }

    isAvailable(): boolean {
        return true;
    }
}

/**
 * Factory function
 */
export function createMetadataExtractor(useMock: boolean = false): MetadataExtractor | MockMetadataExtractor {
    if (useMock) {
        return new MockMetadataExtractor();
    }
    const extractor = new MetadataExtractor();
    if (!extractor.isAvailable()) {
        console.warn('MetadataExtractor: No API key found, falling back to mock (or should fail?)');
        // Depending on requirements, we might want to fail or return mock.
        // For now, let's return extractor so it can throw "not configured" error when called,
        // which helps UI show "Configure Key" prompting.
        return extractor;
    }
    return extractor;
}
