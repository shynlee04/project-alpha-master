/**
 * @fileoverview PDF Vision Types
 * @module lib/pdf/pdf-vision-types
 * @governance EPIC-10-2
 *
 * Type definitions for PDF vision capture functionality.
 */

import type { CapturedPage } from './pdf-vision-capture';

export interface UsePdfVisionOptions {
  /**
   * PDF URL or ArrayBuffer
   */
  pdfUrl: string | ArrayBuffer | null;

  /**
   * Auto-load document on mount (default: false)
   */
  autoLoad?: boolean;

  /**
   * Maximum cache size in bytes
   */
  maxCacheSize?: number;

  /**
   * Callback when PDF loads successfully
   */
  onPdfLoaded?: (pageCount: number) => void;

  /**
   * Callback when PDF fails to load
   */
  onPdfLoadError?: (error: Error) => void;

  /**
   * Callback when page is captured
   */
  onPageCaptured?: (page: CapturedPage) => void;

  /**
   * Callback when page capture fails
   */
  onPageCaptureError?: (error: Error) => void;
}

export interface UsePdfVisionResult {
  /**
   * Whether PDF is currently loading
   */
  isLoading: boolean;

  /**
   * Whether PDF is loaded and ready
   */
  isLoaded: boolean;

  /**
   * Number of pages in PDF
   */
  pageCount: number;

  /**
   * Current captured page data
   */
  currentPage: CapturedPage | null;

  /**
   * Whether current platform is desktop
   */
  isDesktop: boolean;

  /**
   * Whether multimodal vision is supported
   */
  isVisionSupported: boolean;

  /**
   * Platform capability check error message (if not supported)
   */
  platformError: string | null;

  /**
   * Capture a specific page
   */
  capturePage: (pageNumber: number) => Promise<CapturedPage>;

  /**
   * Preload multiple pages
   */
  preloadPages: (pageNumbers: number[]) => Promise<CapturedPage[]>;

  /**
   * Get cache statistics
   */
  getCacheStats: () => {
    cachedPages: number;
    totalCacheSize: number;
    totalBandwidthUsed: number;
    cacheHitRate: number;
  };

  /**
   * Clear page cache
   */
  clearCache: () => void;

  /**
   * Reset bandwidth tracking
   */
  resetBandwidthTracking: () => void;

  /**
   * Load PDF document
   */
  loadPdf: (url: string | ArrayBuffer) => Promise<void>;

  /**
   * Dispose resources
   */
  dispose: () => void;
}
