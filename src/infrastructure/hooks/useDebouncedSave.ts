/**
 * @fileoverview Debounced Save Hook - Auto-save with dirty tracking
 * @module infrastructure/hooks/useDebouncedSave
 *
 * **EPIC-0.5-03**: Plugin Auto-Save Contract
 *
 * Provides debounced auto-save functionality with:
 * - 500ms default debounce delay
 * - Prevents overlapping saves (isSavingRef)
 * - Emits FILE_UPDATED event after save
 * - Callbacks for save start/completion
 * - Automatic cleanup on unmount
 *
 * @epic EPIC-0.5
 * @story EPIC-0.5-03
 * @team Team A
 * @created 2026-01-27
 */

import { useCallback, useRef, useEffect } from 'react';
import { fileEventBus } from '@/infrastructure/events/file-event-bus';

/**
 * Debounced Save Options
 *
 * Configuration options for useDebouncedSave hook.
 */
export interface DebouncedSaveOptions {
  /** Debounce delay in milliseconds (default: 500ms) */
  debounceMs?: number;
  /** Callback invoked when save starts */
  onSaveStart?: () => void;
  /** Callback invoked when save completes successfully */
  onSaveComplete?: () => void;
  /** Callback invoked when save fails */
  onSaveError?: (error: Error) => void;
}

/**
 * useDebouncedSave Hook
 *
 * Creates a debounced save function that:
 * 1. Clears previous timer on each call
 * 2. Waits for debounceMs delay before executing
 * 3. Prevents overlapping saves with isSavingRef
 * 4. Emits FILE_UPDATED event after successful save
 * 5. Calls provided callbacks
 * 6. Cleans up timer on unmount
 *
 * @param saveFn - Save function that accepts Uint8Array data
 * @param path - File path being saved
 * @param projectId - Project ID for event emission
 * @param options - Optional configuration
 * @returns Debounced save function
 *
 * @example
 * ```tsx
 * const debouncedSave = useDebouncedSave(
 *   async (data: Uint8Array) => {
 *     await gateway.write(path, data);
 *   },
 *   filePath,
 *   projectId,
 *   {
 *     debounceMs: 500,
 *     onSaveStart: () => setSaveStatus('saving'),
 *     onSaveComplete: () => setSaveStatus('saved'),
 *   }
 * );
 *
 * // Auto-save on content change
 * useEffect(() => {
 *   debouncedSave(content);
 * }, [content]);
 * ```
 */
export function useDebouncedSave(
  saveFn: (data: Uint8Array) => Promise<void>,
  path: string,
  projectId: string,
  options: DebouncedSaveOptions = {}
) {
  const {
    debounceMs = 500,
    onSaveStart,
    onSaveComplete,
    onSaveError,
  } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isSavingRef = useRef(false);

  const debouncedSave = useCallback(
    (content: string) => {
      // Clear previous timer (debounce pattern)
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(async () => {
        // Prevent overlapping saves
        if (isSavingRef.current) {
          console.warn('[useDebouncedSave] Save already in progress, skipping');
          return;
        }

        try {
          isSavingRef.current = true;
          onSaveStart?.();

          // Encode string to Uint8Array
          const encoded = new TextEncoder().encode(content);

          // Execute save function
          await saveFn(encoded);

          // Emit FILE_UPDATED event after save completes
          fileEventBus.emitFileUpdated({
            path,
            projectId,
            timestamp: Date.now(),
            source: 'user',
            content,
            size: encoded.length,
          });

          onSaveComplete?.();
          console.log('[useDebouncedSave] Saved file:', path, 'Size:', encoded.length, 'bytes');
        } catch (error) {
          console.error('[useDebouncedSave] Auto-save failed:', error);
          const err = error instanceof Error ? error : new Error(String(error));
          onSaveError?.(err);
        } finally {
          isSavingRef.current = false;
        }
      }, debounceMs);
    },
    [saveFn, path, projectId, debounceMs, onSaveStart, onSaveComplete, onSaveError]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedSave;
}
