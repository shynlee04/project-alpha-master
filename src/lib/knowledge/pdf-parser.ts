/**
 * @fileoverview PDF Parser for Client-Side PDF Text Extraction
 * @module lib/knowledge/pdf-parser
 * @governance EPIC-6-1
 * @ai-observable true
 *
 * PDF.js wrapper for extracting text content from PDF files client-side.
 * Uses PDF.js WebWorker for parsing with progress tracking.
 *
 * Story 6.1: Source Import Pipeline
 *
 * @example
 * ```tsx
 * import { PDFParser } from '@/lib/knowledge/pdf-parser';
 *
 * const parser = new PDFParser();
 * const result = await parser.parsePDF(file, (page, total) => {
 *   console.log(`Processing page ${page} of ${total}`);
 * });
 * ```
 */

import * as pdfjsLib from 'pdfjs-dist';

/**
 * PDF parse result with extracted content and metadata
 */
export interface PDFParseResult {
    /** Full extracted text content */
    text: string;
    /** Number of pages in PDF */
    pageCount: number;
    /** Estimated word count */
    wordCount: number;
    /** Optional metadata from PDF */
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
    };
}

/**
 * Progress callback type for PDF parsing
 * @param page - Current page being processed (1-indexed)
 * @param total - Total number of pages
 */
export type PDFProgressCallback = (page: number, total: number) => void;

/**
 * PDF Parser using PDF.js for client-side text extraction
 *
 * Features:
 * - Worker-based parsing for non-blocking UI
 * - Progress tracking during extraction
 * - Metadata extraction from PDF document info
 * - Error handling for corrupted or password-protected PDFs
 */
export class PDFParser {
    private workerInitialized = false;

    constructor() {
        this.initializeWorker();
    }

    /**
     * Initialize PDF.js worker for Vite
     * Must be called before any parse operations
     */
    private initializeWorker(): void {
        if (typeof window === 'undefined') {
            return; // Skip in SSR context
        }

        if (!this.workerInitialized) {
            // Configure worker for Vite
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.mjs',
                import.meta.url
            ).toString();
            this.workerInitialized = true;
        }
    }

    /**
     * Parse PDF file and extract text content
     *
     * @param file - PDF file blob
     * @param onProgress - Optional progress callback called after each page
     * @returns PDFParseResult with extracted text and metadata
     * @throws Error if PDF is invalid, password-protected, or corrupted
     *
     * @example
     * ```tsx
     * const result = await parser.parsePDF(file, (page, total) => {
     *   updateProgress(`Reading page ${page} of ${total}...`);
     * });
     * console.log(`Extracted ${result.wordCount} words from ${result.pageCount} pages`);
     * ```
     */
    async parsePDF(
        file: File | Blob,
        onProgress?: PDFProgressCallback
    ): Promise<PDFParseResult> {
        // Ensure worker is initialized
        this.initializeWorker();

        try {
            // Load PDF document from array buffer
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;

            const totalPages = pdf.numPages;
            let fullText = '';

            // Extract metadata if available
            const metadata = await this.extractMetadata(pdf);

            // Extract text from each page
            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Join text items with proper spacing
                const pageText = textContent.items
                    .map((item: unknown) => {
                        // PDF.js text items have 'str' property
                        const textItem = item as { str: string; hasEOL: boolean };
                        return textItem.str;
                    })
                    .join(' ');

                fullText += pageText + '\n\n';

                // Report progress
                onProgress?.(i, totalPages);
            }

            // Calculate word count
            const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;

            return {
                text: fullText.trim(),
                pageCount: totalPages,
                wordCount,
                metadata,
            };
        } catch (error) {
            // Enhance error messages for common issues
            if (error instanceof Error) {
                if (error.message.includes('password')) {
                    throw new Error('PDF is password-protected. Please remove the password and try again.');
                }
                if (error.message.includes('Invalid PDF')) {
                    throw new Error('Invalid PDF file. Please check the file and try again.');
                }
            }
            throw error;
        }
    }

    /**
     * Extract metadata from PDF document
     *
     * @param pdf - Loaded PDF document proxy
     * @returns Metadata object with title, author, subject, keywords
     */
    private async extractMetadata(
        pdf: pdfjsLib.PDFDocumentProxy
    ): Promise<PDFParseResult['metadata']> {
        try {
            const metadata = await pdf.getMetadata();

            const info = metadata.info;
            const result: PDFParseResult['metadata'] = {};

            // Extract title
            if (info.Title) {
                result.title = String(info.Title);
            }

            // Extract author
            if (info.Author) {
                result.author = String(info.Author);
            }

            // Extract subject
            if (info.Subject) {
                result.subject = String(info.Subject);
            }

            // Extract keywords
            if (info.Keywords) {
                result.keywords = String(info.Keywords).split(',').map(k => k.trim());
            }

            return result;
        } catch {
            // Metadata extraction failed, return undefined
            return undefined;
        }
    }

    /**
     * Validate file is a PDF
     *
     * @param file - File to validate
     * @returns true if file is a valid PDF
     */
    isPDF(file: File): boolean {
        return file.type === 'application/pdf' || file.name.endsWith('.pdf');
    }

    /**
     * Get estimated file size in MB
     *
     * @param file - File to check
     * @returns File size in megabytes
     */
    getFileSizeMB(file: File): number {
        return file.size / (1024 * 1024);
    }
}

/**
 * Singleton instance for convenience
 */
export const pdfParser = new PDFParser();
