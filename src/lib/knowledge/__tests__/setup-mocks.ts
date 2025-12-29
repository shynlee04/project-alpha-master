/**
 * @fileoverview Setup mocks for metadata extraction tests
 */

import { vi } from 'vitest';

// Mock Gemini API functions
export const mockGenerateContent = vi.fn();

export const mockGenerativeModel = {
    generateContent: mockGenerateContent,
};

export const mockGoogleGenerativeAI = vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue(mockGenerativeModel),
}));
