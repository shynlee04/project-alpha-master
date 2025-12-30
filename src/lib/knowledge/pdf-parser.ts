/**
 * @fileoverview PDF Parser for Client-Side PDF Text Extraction
 * @module lib/knowledge/pdf-parser
 * @governance EPIC-6-1
 * @ai-observable true
 *
 * PDF.js wrapper for extracting text content from PDF files client-side.
 * Uses PDF.js WebWorker for parsing with progress tracking.
 * Cloudflare Edge-compatible implementation using runtime loading.
 *
 * Story 6.1: Source Import Pipeline
 */

import { useState } from 'react';

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
 */
export type PDFProgressCallback = (page: number, total: number) => void;

// PDF.js CDN URL - using a version known to work in browsers
const PDF_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs';
const PDF_JS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';

/**
 * PDF.js type stub for CDN-loaded module
 */
interface PdfJsModule {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument: (data: ArrayBuffer) => {
        promise: Promise<{
            numPages: number;
            getMetadata: () => Promise<{ info: Record<string, unknown> }>;
            getPage: (pageNum: number) => Promise<{
                getTextContent: () => Promise<{
                    items: Array<{ str: string }>;
                }>;
            }>;
        }>;
    };
}

/**
 * Get PDF.js from CDN at runtime
 * This avoids bundling issues in edge/SSR environments
 */
async function getPdfJs(): Promise<PdfJsModule> {
    if (typeof window === 'undefined') {
        throw new Error('PDF.js is only available in browser environments');
    }

    // Check if already loaded
    const globalPdfJs = (window as unknown as { __pdfjsLib__?: PdfJsModule }).__pdfjsLib__;
    if (globalPdfJs) {
        return globalPdfJs;
    }

    // Fetch and eval the PDF.js module from CDN
    const response = await fetch(PDF_JS_CDN);
    if (!response.ok) {
        throw new Error('Failed to load PDF.js from CDN');
    }

    const code = await response.text();
    const module = await eval(code) as PdfJsModule;

    // Configure worker
    module.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER_CDN;

    // Cache for subsequent calls
    (window as unknown as { __pdfjsLib__?: PdfJsModule }).__pdfjsLib__ = module;

    return module;
}

/**
 * Check if PDF parsing is available
 */
export function isPdfParsingAvailable(): boolean {
    return typeof window !== 'undefined' && typeof fetch !== 'undefined';
}

/**
 * Parse PDF file and extract text content
 * Uses PDF.js loaded from CDN at runtime
 */
export async function parsePDF(
    file: File | Blob,
    onProgress?: PDFProgressCallback
): Promise<PDFParseResult> {
    if (!isPdfParsingAvailable()) {
        throw new Error('PDF parsing is not available in this environment');
    }

    try {
        const pdfjs = await getPdfJs();

        // Load PDF document from array buffer
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;

        const totalPages = pdf.numPages;
        let fullText = '';

        // Extract metadata if available
        let metadata: PDFParseResult['metadata'];
        try {
            const meta = await pdf.getMetadata();
            const info = meta.info;
            metadata = {
                title: info.Title ? String(info.Title) : undefined,
                author: info.Author ? String(info.Author) : undefined,
                subject: info.Subject ? String(info.Subject) : undefined,
                keywords: info.Keywords ? String(info.Keywords).split(',').map((k: string) => k.trim()) : undefined,
            };
        } catch {
            metadata = undefined;
        }

        // Extract text from each page
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map((item) => item.str)
                .join(' ');

            fullText += pageText + '\n\n';

            onProgress?.(i, totalPages);
        }

        const wordCount = fullText.split(/\s+/).filter((w: string) => w.length > 0).length;

        return {
            text: fullText.trim(),
            pageCount: totalPages,
            wordCount,
            metadata,
        };
    } catch (error) {
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
 * Validate file is a PDF
 */
export function isPDF(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
}

/**
 * Get estimated file size in MB
 */
export function getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
}

/**
 * React hook for PDF parsing with loading state
 */
export function usePdfParser() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parse = async (file: File, onProgress?: PDFProgressCallback) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await parsePDF(file, onProgress);
            return result;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to parse PDF';
            setError(message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    return { parse, isLoading, error, isAvailable: isPdfParsingAvailable() };
}
