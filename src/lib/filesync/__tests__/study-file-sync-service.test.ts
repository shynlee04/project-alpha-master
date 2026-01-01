/**
 * @fileoverview Unit tests for file sync services
 * @module lib/filesync/__tests__/file-sync-services.test
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import { StudyFileSyncService } from '../study-file-sync-service';

// Mock LocalFSAdapter
const mockLocalFSAdapter = {
    readFile: vi.fn(),
    listDirectory: vi.fn(),
} as unknown as LocalFSAdapter;

describe('StudyFileSyncService', () => {
    let service: StudyFileSyncService;

    beforeEach(() => {
        service = new StudyFileSyncService({
            localAdapter: mockLocalFSAdapter,
        });
        vi.clearAllMocks();
    });

    describe('Read-Only Enforcement', () => {
        it('should throw error when writeFile is called', async () => {
            await expect(service.writeFile('test.txt', 'content')).rejects.toThrow(
                'Study workspace is read-only'
            );
        });

        it('should throw error when deleteFile is called', async () => {
            await expect(service.deleteFile('test.txt')).rejects.toThrow(
                'Study workspace is read-only'
            );
        });

        it('should throw error when writeBatch is called', async () => {
            await expect(
                service.writeBatch([{ path: 'test.txt', content: 'content' }])
            ).rejects.toThrow('Study workspace is read-only');
        });
    });

    describe('PDF Import', () => {
        it('should find PDF files in directory', async () => {
            const mockFiles = ['document.pdf', 'notes.md', 'quiz.json'];
            vi.mocked(mockLocalFSAdapter.listDirectory).mockResolvedValue([
                { name: 'document.pdf', type: 'file' },
                { name: 'notes.md', type: 'file' },
                { name: 'quiz.json', type: 'file' },
            ]);

            const pdfs = await service.importPDFAsFlashcards('');

            expect(pdfs).toEqual(['document.pdf']);
        });

        it('should return empty array when no PDFs found', async () => {
            vi.mocked(mockLocalFSAdapter.listDirectory).mockResolvedValue([
                { name: 'notes.md', type: 'file' },
                { name: 'quiz.json', type: 'file' },
            ]);

            const pdfs = await service.importPDFAsFlashcards('');

            expect(pdfs).toEqual([]);
        });
    });

    describe('Quiz Import', () => {
        it('should import valid quiz JSON', async () => {
            const validQuiz = JSON.stringify({
                id: 'quiz-1',
                title: 'Test Quiz',
                questions: [
                    {
                        id: 'q1',
                        question: 'Test question?',
                        options: ['A', 'B', 'C', 'D'],
                        correctIndex: 0,
                        explanation: 'A is correct',
                        difficulty: 'easy',
                        topic: 'test',
                        createdAt: Date.now(),
                        sourceIds: [],
                    },
                ],
            });

            vi.mocked(mockLocalFSAdapter.readFile).mockResolvedValue({
                content: validQuiz,
            });

            const quiz = await service.importQuizJSON('quiz.json');

            expect(quiz).toBeDefined();
            expect(quiz?.id).toBe('quiz-1');
            expect(quiz?.questions).toHaveLength(1);
        });

        it('should return null for invalid quiz JSON', async () => {
            const invalidQuiz = JSON.stringify({
                id: 'quiz-1',
                // Missing questions array
            });

            vi.mocked(mockLocalFSAdapter.readFile).mockResolvedValue({
                content: invalidQuiz,
            });

            const quiz = await service.importQuizJSON('invalid.json');

            expect(quiz).toBeNull();
        });

        it('should return null for non-JSON content', async () => {
            vi.mocked(mockLocalFSAdapter.readFile).mockResolvedValue({
                content: 'not json',
            });

            const quiz = await service.importQuizJSON('text.txt');

            expect(quiz).toBeNull();
        });
    });

    describe('Study Materials Import', () => {
        it('should import all study materials and count them', async () => {
            const allFiles = [
                'document.pdf',
                'quiz1.json',
                'quiz2.json',
                'notes.md',
            ];

            // Mock listDirectory to return all files
            vi.mocked(mockLocalFSAdapter.listDirectory).mockResolvedValue([
                { name: 'document.pdf', type: 'file' },
                { name: 'quiz1.json', type: 'file' },
                { name: 'quiz2.json', type: 'file' },
                { name: 'notes.md', type: 'file' },
            ]);

            // Mock quiz import
            const validQuiz = JSON.stringify({
                id: 'quiz-1',
                title: 'Test Quiz',
                questions: [],
            });
            vi.mocked(mockLocalFSAdapter.readFile).mockResolvedValue({
                content: validQuiz,
            });

            const result = await service.importStudyMaterials('');

            expect(result.success).toBe(true);
            expect(result.pdfsFound).toBe(1);
            expect(result.quizzesImported).toBe(2);
            expect(result.filesProcessed).toBe(4);
        });

        it('should handle import with only PDFs (no quizzes)', async () => {
            vi.mocked(mockLocalFSAdapter.listDirectory).mockResolvedValue([
                { name: 'document.pdf', type: 'file' },
            ]);

            const result = await service.importStudyMaterials('');

            // Success because no errors occurred
            expect(result.success).toBe(true);
            expect(result.pdfsFound).toBe(1);
            expect(result.quizzesImported).toBe(0);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('Content Type Inference', () => {
        it('should infer content type from file extension', async () => {
            vi.mocked(mockLocalFSAdapter.readFile).mockResolvedValue({
                content: 'test content',
            });

            const pdfMetadata = await service.getFileMetadata('test.pdf');
            expect(pdfMetadata.contentType).toBe('application/pdf');

            const jsonMetadata = await service.getFileMetadata('test.json');
            expect(jsonMetadata.contentType).toBe('application/json');

            const mdMetadata = await service.getFileMetadata('test.md');
            expect(mdMetadata.contentType).toBe('text/markdown');
        });
    });

    describe('File Listing', () => {
        it('should list non-recursively by default', async () => {
            vi.mocked(mockLocalFSAdapter.listDirectory).mockResolvedValue([
                { name: 'file1.txt', type: 'file' },
                { name: 'file2.txt', type: 'file' },
            ]);

            const files = await service.listFiles('');

            expect(files).toEqual(['file1.txt', 'file2.txt']);
        });

        it('should list recursively when requested', async () => {
            vi.mocked(mockLocalFSAdapter.listDirectory)
                .mockResolvedValueOnce([
                    { name: 'file1.txt', type: 'file' },
                    { name: 'subdir', type: 'directory' },
                ])
                .mockResolvedValueOnce([
                    { name: 'file2.txt', type: 'file' },
                ]);

            const files = await service.listFiles('', true);

            expect(files).toContain('file1.txt');
            expect(files).toContain('subdir');
            expect(files).toContain('subdir/file2.txt');
        });
    });

    describe('Dispose', () => {
        it('should clear change listeners on dispose', async () => {
            const unsubscribe = service.onFileChange(() => {});
            await service.dispose();

            // After dispose, operations should throw
            await expect(service.readFile('test.txt')).rejects.toThrow(
                'disposed'
            );
        });
    });
});
