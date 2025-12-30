import { describe, it, expect } from 'vitest';
import { generateNoteContent } from '../note-ai-service';

describe('Note AI Service', () => {
    it('should generate content based on prompt', async () => {
        const prompt = 'Test Prompt';
        const result = await generateNoteContent(prompt);

        expect(result).toContain('Generated Content for:');
        expect(result).toContain(prompt);
        expect(result).toContain('Item 1');
    });
});
