/**
 * @fileoverview PDF Vision React Hook
 * @module lib/pdf/pdf-vision-hook
 * @governance EPIC-10-2
 *
 * React hook for PDF vision capture with desktop-only detection.
 *
 * Story 10.2: Multimodal Source Vision (Desktop Only)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getPdfVisionManager, type PdfVisionManager } from './pdf-vision-manager';
import { isDesktopPlatform, supportsMultimodalVision } from '../utils/platform-detection';
import type { CapturedPage } from './pdf-vision-capture';
import type { UsePdfVisionOptions, UsePdfVisionResult } from './pdf-vision-types';

/**
 * React hook for PDF vision capture
 *
 * @param options - Hook options
 * @returns PDF vision result object
 *
 * @example
 * ```tsx
 * function PdfViewer({ url }) {
 *   const {
 *     isLoaded,
 *     pageCount,
 *     currentPage,
 *     isDesktop,
 *     capturePage,
 *   } = usePdfVision({
 *     pdfUrl: url,
 *     autoLoad: true,
 *   });
 *
 *   if (!isDesktop) {
 *     return <p>Vision requires desktop browser</p>;
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={() => capturePage(1)}>Capture Page 1</button>
 *       {currentPage && <img src={currentPage.base64} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePdfVision(options: UsePdfVisionOptions): UsePdfVisionResult {
  const {
    pdfUrl,
    autoLoad = false,
    maxCacheSize,
    onPdfLoaded,
    onPdfLoadError,
    onPageCaptured,
    onPageCaptureError,
  } = options;

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<CapturedPage | null>(null);

  // Platform detection
  const isDesktop = isDesktopPlatform();
  const isVisionSupported = supportsMultimodalVision();
  const platformError = !isDesktop
    ? 'errors.desktop_only_feature'
    : !isVisionSupported
      ? 'errors.multimodal_vision_not_supported'
      : null;

  // Refs
  const managerRef = useRef<PdfVisionManager | null>(null);
  const currentUrlRef = useRef<string | ArrayBuffer | null>(null);

  // Initialize manager on mount
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = getPdfVisionManager({ maxCacheSize });
    }

    return () => {
      // Cleanup on unmount
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, [maxCacheSize]);

  // Load PDF when pdfUrl changes
  useEffect(() => {
    if (autoLoad && pdfUrl && pdfUrl !== currentUrlRef.current) {
      loadPdf(pdfUrl);
    }
  }, [autoLoad, pdfUrl]);

  /**
   * Load PDF document
   */
  const loadPdf = useCallback(async (url: string | ArrayBuffer) => {
    if (!managerRef.current) {
      throw new Error('PDF Vision Manager not initialized');
    }

    // Check platform support
    if (!isDesktopPlatform()) {
      const error = new Error('Vision requires desktop browser');
      onPdfLoadError?.(error);
      throw error;
    }

    if (!supportsMultimodalVision()) {
      const error = new Error('Multimodal vision not supported in this browser');
      onPdfLoadError?.(error);
      throw error;
    }

    setIsLoading(true);
    setCurrentPage(null);

    try {
      await managerRef.current.loadDocument(url);
      const count = managerRef.current.getPageCount();

      setPageCount(count);
      setIsLoaded(true);
      setCurrentUrlRef.current);

      onPdfLoaded?.(count);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load PDF');
      onPdfLoadError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onPdfLoaded, onPdfLoadError]);

  /**
   * Capture a specific page
   */
  const capturePage = useCallback(async (pageNumber: number) => {
    if (!managerRef.current) {
      throw new Error('PDF Vision Manager not initialized');
    }

    if (!isLoaded) {
      throw new Error('PDF not loaded. Call loadPdf() first.');
    }

    try {
      const captured = await managerRef.current.capturePage(pageNumber);
      setCurrentPage(captured);
      onPageCaptured?.(captured);
      return captured;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(`Failed to capture page ${pageNumber}`);
      onPageCaptureError?.(err);
      throw err;
    }
  }, [isLoaded, onPageCaptured, onPageCaptureError]);

  /**
   * Preload multiple pages
   */
  const preloadPages = useCallback(async (pageNumbers: number[]) => {
    if (!managerRef.current) {
      throw new Error('PDF Vision Manager not initialized');
    }

    if (!isLoaded) {
      throw new Error('PDF not loaded. Call loadPdf() first.');
    }

    return await managerRef.current.preloadPages(pageNumbers);
  }, [isLoaded]);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    if (!managerRef.current) {
      return {
        cachedPages: 0,
        totalCacheSize: 0,
        totalBandwidthUsed: 0,
        cacheHitRate: 0,
      };
    }

    return managerRef.current.getCacheStats();
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    managerRef.current?.clearCache();
  }, []);

  /**
   * Reset bandwidth tracking
   */
  const resetBandwidthTracking = useCallback(() => {
    managerRef.current?.resetBandwidthTracking();
  }, []);

  /**
   * Dispose resources
   */
  const dispose = useCallback(() => {
    managerRef.current?.dispose();
    managerRef.current = null;
    setIsLoaded(false);
    setPageCount(0);
    setCurrentPage(null);
  }, []);

  return {
    isLoading,
    isLoaded,
    pageCount,
    currentPage,
    isDesktop,
    isVisionSupported,
    platformError,
    capturePage,
    preloadPages,
    getCacheStats,
    clearCache,
    resetBandwidthTracking,
    loadPdf,
    dispose,
  };
}
