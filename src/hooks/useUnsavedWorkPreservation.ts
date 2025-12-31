/**
 * @fileoverview Unsaved Work Preservation Hook
 * @module hooks/useUnsavedWorkPreservation
 *
 * Handles browser close/refresh warning for unsaved changes and
 * optional auto-recovery of unsaved content.
 *
 * @fix RC-028-009 - Add unsaved work preservation
 */

import { useEffect, useCallback, useRef } from 'react';
import type { OpenFile } from '@/presentation/components/ide/MonacoEditor';

/**
 * Parameters for useUnsavedWorkPreservation hook
 */
export interface UseUnsavedWorkPreservationParams {
    /** Current open files */
    openFiles: OpenFile[];
    /** Callback to save all unsaved files */
    onSaveAll?: () => Promise<void>;
    /** Enable auto-recovery of unsaved content (default: true) */
    enableAutoRecovery?: boolean;
}

/**
 * Result of useUnsavedWorkPreservation hook
 */
export interface UseUnsavedWorkPreservationResult {
    /** Check if there are unsaved changes */
    hasUnsavedChanges: () => boolean;
    /** Get list of unsaved file paths */
    getUnsavedFiles: () => string[];
    /** Manually trigger save prompt */
    triggerSavePrompt: () => void;
    /** Clear all dirty states */
    clearDirtyState: () => void;
    /** Get recovery data from localStorage (for crash recovery) */
    getRecoveryData: () => UnsavedWorkRecoveryData | null;
}

/**
 * Data structure for unsaved work recovery
 */
export interface UnsavedWorkRecoveryData {
    timestamp: number;
    files: Array<{
        path: string;
        content: string;
        dirty: boolean;
    }>;
}

/**
 * Storage key for unsaved work recovery
 */
const RECOVERY_STORAGE_KEY = 'via-gent-unsaved-work-recovery';

/**
 * Hook to manage unsaved work preservation
 *
 * Features:
 * - Shows browser warning on close/refresh if there are unsaved changes
 * - Optionally auto-saves unsaved content to localStorage for crash recovery
 * - Provides API for checking unsaved status and triggering save prompts
 *
 * @param params - Hook parameters
 * @returns Hook result with utility functions
 */
export function useUnsavedWorkPreservation({
    openFiles,
    onSaveAll,
    enableAutoRecovery = true,
}: UseUnsavedWorkPreservationParams): UseUnsavedWorkPreservationResult {
    // Track dirty files count for beforeunload handler
    const dirtyCountRef = useRef(0);
    const unsavedPathsRef = useRef<Set<string>>(new Set());

    // Update dirty tracking when openFiles changes
    useEffect(() => {
        const dirtyFiles = new Set<string>();
        let count = 0;

        for (const file of openFiles) {
            if (file.isDirty) {
                dirtyFiles.add(file.path);
                count++;
            }
        }

        dirtyCountRef.current = count;
        unsavedPathsRef.current = dirtyFiles;

        // Update document title to indicate unsaved changes
        if (count > 0) {
            document.title = `* ${document.title.replace(/^\* /, '')}`;
        } else {
            document.title = document.title.replace(/^\* /, '');
        }
    }, [openFiles]);

    // Auto-recovery: Save unsaved content to localStorage
    useEffect(() => {
        if (!enableAutoRecovery) {
            return;
        }

        const saveRecoveryData = () => {
            const files = openFiles
                .filter((f) => f.isDirty)
                .map((f) => ({
                    path: f.path,
                    content: f.content,
                    dirty: f.isDirty,
                }));

            if (files.length > 0) {
                const data: UnsavedWorkRecoveryData = {
                    timestamp: Date.now(),
                    files,
                };
                try {
                    localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(data));
                } catch {
                    // localStorage might be full or disabled
                    console.warn('[UnsavedWork] Failed to save recovery data');
                }
            }
        };

        // Save recovery data periodically (every 5 seconds if there are unsaved changes)
        const interval = setInterval(() => {
            if (dirtyCountRef.current > 0) {
                saveRecoveryData();
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            // Final save on unmount
            saveRecoveryData();
        };
    }, [openFiles, enableAutoRecovery]);

    // Beforeunload handler for browser close/refresh
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (dirtyCountRef.current > 0) {
                // Chrome requires preventDefault() and returnValue to show the dialog
                event.preventDefault();
                event.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    /**
     * Check if there are unsaved changes
     */
    const hasUnsavedChanges = useCallback(() => {
        return dirtyCountRef.current > 0;
    }, []);

    /**
     * Get list of unsaved file paths
     */
    const getUnsavedFiles = useCallback(() => {
        return Array.from(unsavedPathsRef.current);
    }, []);

    /**
     * Manually trigger save prompt (e.g., on Ctrl+S)
     */
    const triggerSavePrompt = useCallback(async () => {
        if (onSaveAll && dirtyCountRef.current > 0) {
            await onSaveAll();
        }
    }, [onSaveAll]);

    /**
     * Clear all dirty states (e.g., after save)
     */
    const clearDirtyState = useCallback(() => {
        unsavedPathsRef.current.clear();
        dirtyCountRef.current = 0;
        document.title = document.title.replace(/^\* /, '');
    }, []);

    /**
     * Get recovery data from localStorage (for crash recovery)
     */
    const getRecoveryData = useCallback((): UnsavedWorkRecoveryData | null => {
        try {
            const data = localStorage.getItem(RECOVERY_STORAGE_KEY);
            if (data) {
                return JSON.parse(data) as UnsavedWorkRecoveryData;
            }
        } catch {
            console.warn('[UnsavedWork] Failed to parse recovery data');
        }
        return null;
    }, []);

    return {
        hasUnsavedChanges,
        getUnsavedFiles,
        triggerSavePrompt,
        clearDirtyState,
        getRecoveryData,
    };
}

/**
 * Hook to check if there are unsaved changes (simpler version)
 * Use this when you only need to check for unsaved changes without full preservation
 */
export function useHasUnsavedChanges(openFiles: OpenFile[]): boolean {
    return openFiles.some((f) => f.isDirty);
}

/**
 * Get unsaved files from open files
 */
export function getUnsavedFilesList(openFiles: OpenFile[]): string[] {
    return openFiles.filter((f) => f.isDirty).map((f) => f.path);
}

/**
 * Clear recovery data from localStorage (call after successful recovery)
 */
export function clearRecoveryData(): void {
    try {
        localStorage.removeItem(RECOVERY_STORAGE_KEY);
    } catch {
        // Ignore errors
    }
}

/**
 * Get age of recovery data in milliseconds
 */
export function getRecoveryDataAge(data: UnsavedWorkRecoveryData): number {
    return Date.now() - data.timestamp;
}

/**
 * Check if recovery data is still valid (within 24 hours)
 */
export function isRecoveryDataValid(data: UnsavedWorkRecoveryData): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return getRecoveryDataAge(data) < maxAge;
}
