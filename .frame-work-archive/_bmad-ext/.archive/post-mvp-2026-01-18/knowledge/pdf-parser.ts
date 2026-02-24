/**
 * @fileoverview PDF Parser using browser-native pdf.js
 * @module lib/knowledge/pdf-parser
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * PDF Parsing result interface
 */
export interface PDFParseResult {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modDate?: Date;
  };
  pages: {
    pageNum: number;
    text: string;
    width: number;
    height: number;
  }[];
}

/**
 * PDF Parsing options
 */
export interface PDFParseOptions {
  onProgress?: PDFProgressCallback;
  maxPages?: number;
  extractImages?: boolean;
}

/**
 * Progress callback type
 */
export type PDFProgressCallback = (progress: {
  loaded: number;
  total: number;
  currentPage: number;
  status: 'loading' | 'processing' | 'complete' | 'error';
  message?: string;
}) => void;

/**
 * Check if PDF parsing is available
 */
export function isPdfParsingAvailable(): boolean {
  return typeof window !== 'undefined' && typeof fetch !== 'undefined';
}

/**
 * Check if a file is a PDF
 */
export function isPDF(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  );
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}

/**
 * Parse PDF file using pdf.js
 */
export async function parsePDF(
  file: File,
  options?: PDFParseOptions
): Promise<PDFParseResult> {
  const { onProgress, maxPages, extractImages } = options || {};

  onProgress?.({
    loaded: 0,
    total: file.size,
    currentPage: 0,
    status: 'loading',
    message: 'Loading PDF file...',
  });

  try {
    // Dynamically import pdf.js
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    onProgress?.({
      loaded: 0,
      total: file.size,
      currentPage: 0,
      status: 'processing',
      message: 'Processing PDF...',
    });

    const pageCount = maxPages
      ? Math.min(pdf.numPages, maxPages)
      : pdf.numPages;

    const pages: PDFParseResult['pages'] = [];
    let fullText = '';
    const metadata = await pdf.getMetadata().catch(() => ({ info: {} }));

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');

      const viewport = page.getViewport({ scale: 1.0 });

      pages.push({
        pageNum: i,
        text,
        width: viewport.width,
        height: viewport.height,
      });

      fullText += text + '\n\n';

      onProgress?.({
        loaded: i * (file.size / pageCount),
        total: file.size,
        currentPage: i,
        status: 'processing',
        message: `Processing page ${i} of ${pageCount}...`,
      });
    }

    onProgress?.({
      loaded: file.size,
      total: file.size,
      currentPage: pageCount,
      status: 'complete',
      message: 'PDF processing complete',
    });

    return {
      text: fullText.trim(),
      pageCount,
      metadata: {
        title: (metadata.info as Record<string, string>)?.Title,
        author: (metadata.info as Record<string, string>)?.Author,
        creator: (metadata.info as Record<string, string>)?.Creator,
        producer: (metadata.info as Record<string, string>)?.Producer,
      },
      pages,
    };
  } catch (error) {
    onProgress?.({
      loaded: 0,
      total: file.size,
      currentPage: 0,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Parse PDF with options
 */
export async function parsePDFWithOptions(
  file: File,
  options: PDFParseOptions
): Promise<PDFParseResult> {
  return parsePDF(file, options);
}

/**
 * Hook for PDF parsing with React
 */
export function usePdfParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<{
    loaded: number;
    total: number;
    currentPage: number;
    status: string;
  } | null>(null);

  const parse = useCallback(
    async (file: File, options?: PDFParseOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await parsePDF(file, {
          ...options,
          onProgress: (prog) => {
            setProgress(prog);
            options?.onProgress?.(prog);
          },
        });
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setProgress(null);
  }, []);

  return {
    parse,
    isLoading,
    error,
    progress,
    reset,
    isAvailable: isPdfParsingAvailable(),
  };
}

/**
 * Hook with default progress handling
 */
export function usePdfParserWithOptions(defaultOptions?: PDFParseOptions) {
  const [progress, setProgress] = useState<{
    loaded: number;
    total: number;
    currentPage: number;
    status: string;
  } | null>(null);

  const { parse, isLoading, error, reset, isAvailable } = usePdfParser();

  const parseWithProgress = useCallback(
    async (file: File, options?: PDFParseOptions) => {
      return parse(file, {
        ...defaultOptions,
        ...options,
        onProgress: (prog) => {
          setProgress(prog);
          options?.onProgress?.(prog);
        },
      });
    },
    [parse, defaultOptions]
  );

  return {
    parse: parseWithProgress,
    isLoading,
    error,
    progress,
    reset,
    isAvailable,
  };
}
