/**
 * @fileoverview Metadata Extraction Service Tests (Story 6.4)
 * @module lib/knowledge/__tests__/metadata-extractor
 */

import { MetadataExtractor } from '../metadata-extractor';
import type { SourceRecord } from '@/infrastructure/persistence/dexie-db';

// Mock credential vault
vi.mock('@/lib/agent/providers/credential-vault', () => ({
    credentialVault: {
        getCredentials: vi.fn().mockResolvedValue('test-api-key-123'),
    },
}));

// Mock Gemini API
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
            generateContent: vi.fn().mockResolvedValue({
                response: {
                    text: () => 'Mock response',
                },
            }),
        }),
    })),
}));

describe('MetadataExtractor (Story 6.4)', () => {
    let extractor: MetadataExtractor;
    let mockSource: Pick<SourceRecord, 'content'>;

    beforeEach(() => {
        extractor = new MetadataExtractor();
        vi.clearAllMocks();

        // Create mock source with content
        mockSource = {
            content: 'This is a test document about machine learning and artificial intelligence. ' +
                'It contains information about neural networks, data science, and algorithms. ' +
                'The document is written for educational purposes.',
        };
    });

    describe('Content Truncation', () => {
        it('should limit content to 10k characters', () => {
            const longContent = 'a'.repeat(15000);
            const truncated = extractor['truncateContent'](longContent);

            expect(truncated.length).toBe(10000);
        });

        it('should not truncate short content', () => {
            const shortContent = 'short content';
            const truncated = extractor['truncateContent'](shortContent);

            expect(truncated).toBe(shortContent);
        });
    });

    describe('Empty Content Handling', () => {
        it('should return fallback metadata for empty content', async () => {
            const emptySource: Pick<SourceRecord, 'content'> = { content: '' };

            const metadata = await extractor.extractAllMetadata(emptySource);

            expect(metadata.summary).toBe('AI analysis unavailable');
            expect(metadata.keyConcepts).toEqual([]);
            expect(metadata.suggestedQuestions).toEqual([]);
            expect(metadata.metadataExtracted).toBe(false);
        });

        it('should return fallback metadata for whitespace-only content', async () => {
            const whitespaceSource: Pick<SourceRecord, 'content'> = { content: '   \n\n   ' };

            const metadata = await extractor.extractAllMetadata(whitespaceSource);

            expect(metadata.summary).toBe('AI analysis unavailable');
            expect(metadata.keyConcepts).toEqual([]);
            expect(metadata.suggestedQuestions).toEqual([]);
            expect(metadata.metadataExtracted).toBe(false);
        });
    });

    describe('API Key Management', () => {
        it('should retrieve API key from credential vault', async () => {
            const { credentialVault } = await import('@/lib/agent/providers/credential-vault');

            // This will fail the actual API call, but we can verify the API key was requested
            try {
                await extractor.generateSummary('test content');
            } catch {
                // Expected to fail since we're using a mock
            }

            expect(credentialVault.getCredentials).toHaveBeenCalledWith('google-gemini');
        });
    });

    describe('Error Handling', () => {
        it('should handle missing API key gracefully', async () => {
            const { credentialVault } = await import('@/lib/agent/providers/credential-vault');
            vi.mocked(credentialVault).getCredential.mockResolvedValue(undefined);

            const summary = await extractor.generateSummary('test content');

            expect(summary).toBe('AI analysis unavailable');
        });

        it('should handle API errors gracefully', async () => {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            vi.mocked(GoogleGenerativeAI).mockImplementation(() => {
                throw new Error('API Error');
            });

            const summary = await extractor.generateSummary('test content');

            expect(summary).toBe('AI analysis unavailable');
        });
    });
});
