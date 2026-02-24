/**
 * @fileoverview Study Import Utilities
 * @module infrastructure/sync/workspace-services/study-sync/study-import-utils
 *
 * Study-specific import methods for PDFs, quizzes, and materials.
 *
 * @story ARCH-01.1.3
 */

import type { ImportResult } from './study-sync-types';
import type { Quiz } from '@/lib/study/quiz-types';

/**
 * Study Import Utilities
 *
 * Helper functions for importing study materials.
 * Separated from core service for better organization.
 */
export class StudyImportUtils {
    /**
     * Import PDF files for flashcard generation
     * Scans mounted directory for PDF files and returns list
     */
    static async importPDFAsFlashcards(
        listFiles: (path: string, recursive: boolean) => Promise<string[]>,
        directory: string
    ): Promise<string[]> {
        const allFiles = await listFiles(directory, true);
        const pdfFiles = allFiles.filter(f => f.toLowerCase().endsWith('.pdf'));

        console.log(`[StudyImportUtils] Found ${pdfFiles.length} PDF files for import`);

        return pdfFiles;
    }

    /**
     * Import quiz from JSON file
     * Validates and parses quiz JSON structure
     */
    static async importQuizJSON(
        readFile: (path: string) => Promise<string>,
        filePath: string
    ): Promise<Quiz | null> {
        try {
            const content = await readFile(filePath);
            const quizData = JSON.parse(content) as Quiz;

            // Basic validation
            if (!quizData.id || !quizData.questions || !Array.isArray(quizData.questions)) {
                throw new Error('Invalid quiz JSON structure');
            }

            console.log(`[StudyImportUtils] Imported quiz: ${quizData.title} (${quizData.questions.length} questions)`);

            return quizData;
        } catch (error) {
            console.error(`[StudyImportUtils] Failed to import quiz from ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Import all study materials from directory
     * Scans for PDFs, quiz JSONs, and Markdown files
     */
    static async importStudyMaterials(
        listFiles: (path: string, recursive: boolean) => Promise<string[]>,
        importQuizJSON: (path: string) => Promise<Quiz | null>,
        directory: string
    ): Promise<ImportResult> {
        const errors: Array<{ path: string; error: string }> = [];
        let pdfCount = 0;
        let quizCount = 0;

        try {
            const allFiles = await listFiles(directory, true);

            // Count PDFs
            const pdfs = allFiles.filter(f => f.toLowerCase().endsWith('.pdf'));
            pdfCount = pdfs.length;

            // Import quiz JSONs
            const quizFiles = allFiles.filter(f => f.toLowerCase().endsWith('.json'));
            for (const quizFile of quizFiles) {
                try {
                    const quiz = await importQuizJSON(quizFile);
                    if (quiz) {
                        quizCount++;
                    }
                } catch (error) {
                    errors.push({
                        path: quizFile,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            console.log(`[StudyImportUtils] Import complete: ${pdfCount} PDFs, ${quizCount} quizzes`);

            return {
                success: errors.length === 0,
                filesProcessed: allFiles.length,
                quizzesImported: quizCount,
                pdfsFound: pdfCount,
                errors,
            };
        } catch (error) {
            return {
                success: false,
                filesProcessed: 0,
                quizzesImported: 0,
                pdfsFound: 0,
                errors: [{
                    path: directory,
                    error: error instanceof Error ? error.message : 'Import failed'
                }]
            };
        }
    }
}
