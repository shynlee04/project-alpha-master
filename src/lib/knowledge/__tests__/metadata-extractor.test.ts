
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetadataExtractor, createMetadataExtractor, MockMetadataExtractor } from '../metadata-extractor';

// Mock dependencies
vi.mock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: {
            generateContent: vi.fn().mockResolvedValue({
                text: JSON.stringify({
                    summary: "This is a test summary.",
                    keyConcepts: ["Test", "Concept"],
                    suggestedQuestions: ["Q1?", "Q2?", "Q3?"],
                    language: "en",
                    readingTime: "1 min"
                }),
            }),
        },
    })),
}));

vi.mock('@/lib/agent/providers/credential-vault', () => ({
    credentialVault: {
        getCredential: vi.fn().mockReturnValue({ apiKey: 'test-key' }),
    },
}));

describe('MetadataExtractor', () => {
    let extractor: MetadataExtractor;

    beforeEach(() => {
        vi.clearAllMocks();
        extractor = new MetadataExtractor('test-key');
    });

    it('extracts basic stats correctly', () => {
        const content = "Word ".repeat(200); // 200 words
        const stats = extractor.extractBasicStats(content);
        expect(stats.readingTime).toBe('1 min read');
    });

    it('generates analysis via AI', async () => {
        const result = await extractor.generateAnalysis('some content');

        expect(result.summary).toBe('This is a test summary.');
        expect(result.keyConcepts).toContain('Test');
        expect(result.suggestedQuestions).toHaveLength(3);
    });

    it('uses MockMetadataExtractor when requested', () => {
        const mock = createMetadataExtractor(true);
        expect(mock).toBeInstanceOf(MockMetadataExtractor);
    });
});
