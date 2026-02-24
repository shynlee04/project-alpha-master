/**
 * @fileoverview useFileWatcher Hook
 * @module hooks/useFileWatcher
 *
 * React hook for file watching functionality.
 * Integrates file watcher engine with React components.
 *
 * @story S-039 - File Watcher with Auto-Reload and Change Detection
 */

import { useEffect, useRef, useCallback } from 'react';
import { getFileWatcher, type FileChangeEvent } from '@/lib/watcher/file-watcher';
import { getChangeDetector } from '@/lib/watcher/change-detector';
import {
  useFileWatcherEnabled,
  useFileWatcherAutoReload,
  useStartWatching,
  useAddPendingChange,
  useSetUnsavedChanges,
  useFileWatcherConfig,
  useStopWatchingAll,
  type PendingChange
} from '@/infrastructure/persistence/stores/file-watcher-store';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface UseFileWatcherOptions {
  /** File path to watch */
  path: string;
  /** Content type of the file */
  contentType?: 'code' | 'config' | 'asset' | 'binary';
  /** Current file content for change detection */
  content?: string;
  /** Callback when file is reloaded */
  onReload?: (newContent: string) => void;
  /** Callback when file is overwritten */
  onOverwrite?: (content: string) => void;
  /** Callback when changes are ignored */
  onIgnore?: () => void;
  /** Callback when external change is detected */
  onExternalChange?: (event: FileChangeEvent) => void;
}

export interface FileWatcherActions {
  /** Manually trigger a file check */
  checkForChanges: () => Promise<void>;
  /** Mark file as having unsaved changes */
  markUnsavedChanges: (hasUnsaved: boolean) => void;
}

/**
 * React hook for file watching
 *
 * Automatically watches files for external changes and provides
 * conflict detection and resolution options.
 */
export function useFileWatcher(options: UseFileWatcherOptions): FileWatcherActions {
  const {
    path,
    contentType = 'code',
    content,
    onExternalChange
  } = options;

  const { t } = useTranslation();

  // Store selectors
  const enabled = useFileWatcherEnabled();
  const autoReload = useFileWatcherAutoReload();
  const config = useFileWatcherConfig();
  const startWatching = useStartWatching();
  const addPendingChange = useAddPendingChange();
  const setUnsavedChanges = useSetUnsavedChanges();

  // Refs for cleanup
  const watcherRef = useRef<ReturnType<typeof getFileWatcher> | null>(null);
  const detectorRef = useRef<ReturnType<typeof getChangeDetector> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const contentRef = useRef(content);
  const hasUnsavedRef = useRef(false);

  // Update content ref when content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Initialize watcher and detector
  useEffect(() => {
    if (!enabled || !path) {
      return;
    }

    // Get instances
    const watcher = getFileWatcher({
      debounceMs: 500,
      pollingInterval: config.pollingInterval,
      includePatterns: config.includePatterns,
      excludePatterns: config.excludePatterns,
      enablePolling: true
    });
    const detector = getChangeDetector();

    watcherRef.current = watcher;
    detectorRef.current = detector;

    // Register file
    startWatching(path, contentType);

    // Start polling if needed
    watcher.startPolling();

    // Subscribe to changes
    const unsubscribe = watcher.onChange((event: FileChangeEvent) => {
      handleFileChange(event);
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup
    return () => {
      unsubscribe?.();
      watcher.unwatchFile(path);
      detector.unregisterFile(path);

      // Stop polling if no files are being watched
      if (watcher.getStats().watchedCount === 0) {
        watcher.stopPolling();
      }
    };
  }, [enabled, path, contentType, config]);

  // Track unsaved changes in detector
  useEffect(() => {
    if (!path || !content) return;

    const detector = detectorRef.current;
    if (!detector) return;

    if (hasUnsavedRef.current) {
      detector.trackUnsavedChanges(path, content);
    } else {
      detector.clearUnsavedChanges(path);
    }
  }, [content, path]);

  /**
   * Handle file change event
   */
  const handleFileChange = useCallback(async (event: FileChangeEvent) => {
    // Ignore events for other files
    if (event.path !== path) return;

    const detector = detectorRef.current;
    if (!detector) return;

    // Check for conflicts
    const conflict = await detector.checkForConflict(path, contentRef.current || '');

    // Create pending change
    const pendingChange: PendingChange = {
      path: event.path,
      changeType: event.type,
      contentType: event.contentType,
      timestamp: event.timestamp,
      hasUnsavedChanges: conflict.hasConflict
    };

    // Auto-reload if enabled and no conflict
    if (autoReload && !conflict.hasConflict) {
      // Trigger reload callback
      onExternalChange?.(event);
      return;
    }

    // Show notification
    const changeTypeKey = `fileWatcher.changes.${event.type}`;
    const message = t(changeTypeKey, 'File {{path}} was {{type}}', {
      path: event.path,
      type: event.type
    });

    toast(message, {
      description: conflict.hasConflict
        ? t('fileWatcher.conflictDetected', 'Conflict detected: You have unsaved changes')
        : undefined,
      action: {
        label: t('fileWatcher.view', 'View'),
        onClick: () => {
          addPendingChange(pendingChange);
          onExternalChange?.(event);
        }
      }
    });

    // Add to pending changes
    addPendingChange(pendingChange);
  }, [path, autoReload, addPendingChange, onExternalChange, t]);

  /**
   * Manually check for changes
   */
  const checkForChanges = useCallback(async () => {
    const detector = detectorRef.current;
    if (!detector || !path) return;

    const changes = await detector.detectChanges(path);
    if (changes && changes.hasChanged) {
      const event: FileChangeEvent = {
        path,
        type: 'modified',
        timestamp: Date.now(),
        contentType
      };
      handleFileChange(event);
    }
  }, [path, contentType, handleFileChange]);

  /**
   * Mark file as having unsaved changes
   */
  const markUnsavedChanges = useCallback((hasUnsaved: boolean) => {
    hasUnsavedRef.current = hasUnsaved;
    setUnsavedChanges(path, hasUnsaved);
  }, [path, setUnsavedChanges]);

  return {
    checkForChanges,
    markUnsavedChanges
  };
}

/**
 * Hook to access file watcher statistics
 */
export function useFileWatcherStats() {
  const enabled = useFileWatcherEnabled();

  useEffect(() => {
    if (!enabled) return;

    const watcher = getFileWatcher();
    void watcher.getStats(); // Query stats for side effects

    return () => {
      // Cleanup handled by individual file watchers
    };
  }, [enabled]);
}

/**
 * Hook to stop watching all files
 */
export function useStopWatchingAllFiles() {
  const stopWatchingAll = useStopWatchingAll();

  return useCallback(() => {
    stopWatchingAll();
    const watcher = getFileWatcher();
    watcher.unwatchAll();
  }, [stopWatchingAll]);
}

/**
 * Hook to update file watcher configuration
 */
export function useFileWatcherConfiguration() {
  const config = useFileWatcherConfig();
  const setConfig = useFileWatcherConfig();

  useEffect(() => {
    const watcher = getFileWatcher();
    watcher.updateConfig(config);
  }, [config]);

  return { config, setConfig };
}
