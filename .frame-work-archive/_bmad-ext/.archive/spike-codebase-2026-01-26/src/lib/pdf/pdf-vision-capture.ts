/**
 * @fileoverview PDF Vision Capture Utility
 * @module lib/pdf/pdf-vision-capture
 * @governance EPIC-10-2
 *
 * Captures PDF pages as base64 JPEG images for multimodal AI vision.
 * Uses PDF.js to render pages to canvas, then converts to base64.
 *
 * Story 10.2: Multimodal Source Vision (Desktop Only)
 *
 * @deprecated TODO: Install pdfjs-dist package to enable PDF vision capture
 * @see https://www.npmjs.com/package/pdfjs-dist
 */

// TODO: Uncomment after installing pdfjs-dist package
// import * as pdfjsLib from 'pdfjs-dist';
//
// // Configure PDF.js worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface CaptureOptions {
  /**
   * Scale factor for rendering (default: 1.5 for good quality/size balance)
   * Higher scale = better quality but larger file size
   */
  scale?: number;

  /**
   * JPEG quality (0-1, default: 0.85)
   */
  quality?: number;

  /**
   * Whether to capture entire page or just viewport (default: true for viewport)
   */
  fullPage?: boolean;
}

export interface CapturedPage {
  /**
   * Base64 encoded JPEG image
   */
  base64: string;

  /**
   * MIME type (always image/jpeg)
   */
  mimeType: 'image/jpeg';

  /**
   * Approximate size in bytes
   */
  sizeBytes: number;

  /**
   * Page number
   */
  pageNumber: number;

  /**
   * Original PDF viewport dimensions
   */
  width: number;
  height: number;
}

/**
 * Capture a PDF page as base64 JPEG image
 *
 * @param pdfDocument - Loaded PDF.js document
 * @param pageNumber - Page number to capture (1-indexed)
 * @param options - Capture options
 * @returns Captured page data
 *
 * @example
 * ```typescript
 * const pdf = await pdfjsLib.getDocument(url).promise;
 * const captured = await capturePdfPage(pdf, 1, { scale: 1.5, quality: 0.85 });
 * console.log(`Captured ${captured.sizeBytes} bytes`);
 * ```
 */
export async function capturePdfPage(
  _pdfDocument: any,
  _pageNumber: number,
  _options: CaptureOptions = {}
): Promise<CapturedPage> {
  throw new Error('capturePdfPage: pdfjs-dist package not installed. Run: pnpm add pdfjs-dist');
}

/**
 * Capture multiple PDF pages as base64 JPEG images
 *
 * @param pdfDocument - Loaded PDF.js document
 * @param pageNumbers - Array of page numbers to capture (1-indexed)
 * @param options - Capture options
 * @returns Array of captured page data
 *
 * @example
 * ```typescript
 * const pdf = await pdfjsLib.getDocument(url).promise;
 * const pages = await capturePdfPages(pdf, [1, 2, 3]);
 * console.log(`Captured ${pages.length} pages`);
 * ```
 */
export async function capturePdfPages(
  _pdfDocument: any,
  _pageNumbers: number[],
  _options: CaptureOptions = {}
): Promise<CapturedPage[]> {
  throw new Error('capturePdfPages: pdfjs-dist package not installed. Run: pnpm add pdfjs-dist');
}

/**
 * Extract base64 value from data URL
 * Removes the "data:image/jpeg;base64," prefix
 *
 * @param dataUrl - Data URL string
 * @returns Base64 string without prefix
 */
export function extractBase64(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) {
    return dataUrl;
  }
  return dataUrl.substring(commaIndex + 1);
}

/**
 * Check if PDF.js is supported in current browser
 *
 * @returns true if PDF.js is supported
 */
export function isPdfJsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    !!document.createElement?.('canvas')?.getContext
  );
}

/**
 * Estimate bandwidth cost for transmitting base64 image
 *
 * @param base64 - Base64 image string
 * @returns Size in kilobytes
 */
export function estimateBandwidthCost(base64: string): number {
  // Base64 is ~33% larger than binary, so divide by 0.75 to get binary size
  const binaryBytes = (base64.length * 3) / 4;
  return Math.round(binaryBytes / 1024); // Return KB
}
