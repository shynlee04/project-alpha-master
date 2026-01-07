/**
 * @fileoverview Database Recovery Utility
 * @module infrastructure/persistence/database-recovery
 * @governance CRITICAL-FIX-2026-01-07
 *
 * Handles database corruption recovery when Dexie migrations fail.
 *
 * PROBLEM:
 * - Dexie cannot migrate primary key changes
 * - Previous schema changes caused database corruption
 * - Users get "UpgradeError: Not yet support for changing primary key"
 *
 * SOLUTION:
 * - Detect migration failures
 * - Clear corrupted database
 * - Initialize fresh schema
 * - Notify user of data loss
 *
 * ROOT CAUSE:
 * - Schema v20 changed primary keys (e.g., 'id' → 'id, workspaceId')
 * - IndexedDB CANNOT migrate primary key changes
 * - This is a hard IndexedDB limitation, not a Dexie bug
 */

import { toast } from 'sonner';
import type Dexie from 'dexie';

// ============================================================================
// Constants
// ============================================================================

const DB_NAME = 'via-gent-persistence';
const RECOVERY_FLAG_KEY = 'via-gent-db-recovery-needed';
const RECOVERY_TIMESTAMP_KEY = 'via-gent-db-recovery-timestamp';
const RECOVERY_ATTEMPT_KEY = 'via-gent-db-recovery-attempts';

/**
 * Database corruption types detected
 */
export enum CorruptionType {
    /** Primary key migration error - cannot be fixed, must reset */
    PRIMARY_KEY_CHANGE = 'primary_key_change',
    /** Encryption algorithm mismatch - old data cannot be decrypted */
    ENCRYPTION_MISMATCH = 'encryption_mismatch',
    /** Database is closed and cannot be opened */
    DATABASE_CLOSED = 'database_closed',
    /** Unknown corruption - treat as fatal */
    UNKNOWN_CORRUPTION = 'unknown_corruption',
}

/**
 * Recovery result
 */
export interface RecoveryResult {
    success: boolean;
    corruptionType: CorruptionType | null;
    message: string;
    tablesCleared: number;
    error?: Error;
}

// ============================================================================
// Corruption Detection
// ============================================================================

/**
 * Detect if database needs recovery based on error
 */
export function detectCorruptionType(error: unknown): CorruptionType | null {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Dexie primary key migration error
    if (errorMessage.includes('UpgradeError') &&
        errorMessage.includes('primary key')) {
        return CorruptionType.PRIMARY_KEY_CHANGE;
    }

    // Database closed error
    if (errorMessage.includes('DatabaseClosedError') ||
        errorMessage.includes('InvalidStateError')) {
        return CorruptionType.DATABASE_CLOSED;
    }

    // Encryption algorithm mismatch
    if (errorMessage.includes('InvalidAccessError') &&
        errorMessage.includes('key.algorithm')) {
        return CorruptionType.ENCRYPTION_MISMATCH;
    }

    return CorruptionType.UNKNOWN_CORRUPTION;
}

/**
 * Check if recovery was previously flagged
 */
export function isRecoveryNeeded(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(RECOVERY_FLAG_KEY) === 'true';
}

/**
 * Get when recovery was first flagged
 */
export function getRecoveryTimestamp(): number | null {
    if (typeof localStorage === 'undefined') return null;
    const timestamp = localStorage.getItem(RECOVERY_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
}

/**
 * Get number of recovery attempts
 */
export function getRecoveryAttempts(): number {
    if (typeof localStorage === 'undefined') return 0;
    const attempts = localStorage.getItem(RECOVERY_ATTEMPT_KEY);
    return attempts ? parseInt(attempts, 10) : 0;
}

// ============================================================================
// Database Recovery
// ============================================================================

/**
 * Clear all IndexedDB databases for this app
 * This is the ONLY fix for primary key migration errors
 */
async function clearAllDatabases(): Promise<string[]> {
    if (typeof indexedDB === 'undefined') {
        throw new Error('IndexedDB not available in this environment');
    }

    const databases = await indexedDB.databases();
    const appDatabases = databases.filter(db => db.name?.startsWith(DB_NAME));

    const cleared: string[] = [];
    for (const database of appDatabases) {
        if (!database.name) continue;

        try {
            await new Promise<void>((resolve, reject) => {
                const request = indexedDB.deleteDatabase(database.name);
                request.onsuccess = () => {
                    cleared.push(database.name);
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`[Database Recovery] Failed to delete ${database.name}:`, error);
        }
    }

    return cleared;
}

/**
 * Clear all localStorage keys related to the app
 */
function clearLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('vg_') || key.startsWith('dexie-') ||
                      key.startsWith('via-gent') || key === 'sync-status-store')) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[Database Recovery] Cleared ${keysToRemove.length} localStorage keys`);
}

/**
 * Clear sessionStorage
 */
function clearSessionStorage(): void {
    if (typeof sessionStorage === 'undefined') return;

    sessionStorage.clear();
    console.log('[Database Recovery] Cleared sessionStorage');
}

/**
 * Attempt to recover the database
 *
 * This will DELETE ALL USER DATA - projects, notes, settings, everything.
 * This is the ONLY fix when primary keys have changed.
 */
export async function recoverDatabase(): Promise<RecoveryResult> {
    console.log('[Database Recovery] Starting database recovery...');

    const attempts = getRecoveryAttempts() + 1;
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(RECOVERY_ATTEMPT_KEY, attempts.toString());
    }

    try {
        // Step 1: Clear all IndexedDB databases
        console.log('[Database Recovery] Step 1: Clearing IndexedDB databases...');
        const clearedDbs = await clearAllDatabases();
        console.log(`[Database Recovery] Cleared databases:`, clearedDbs);

        // Step 2: Clear localStorage
        console.log('[Database Recovery] Step 2: Clearing localStorage...');
        clearLocalStorage();

        // Step 3: Clear sessionStorage
        console.log('[Database Recovery] Step 3: Clearing sessionStorage...');
        clearSessionStorage();

        // Step 4: Clear recovery flags
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(RECOVERY_FLAG_KEY);
            localStorage.removeItem(RECOVERY_TIMESTAMP_KEY);
            localStorage.removeItem(RECOVERY_ATTEMPT_KEY);
        }

        console.log('[Database Recovery] ✅ Database recovery complete');

        // Show success notification
        toast.success('Database recovered successfully', {
            description: 'A fresh database has been initialized',
            duration: 5000,
        });

        return {
            success: true,
            corruptionType: null,
            message: 'Database recovered successfully',
            tablesCleared: clearedDbs.length,
        };
    } catch (error) {
        console.error('[Database Recovery] ❌ Recovery failed:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        toast.error('Database recovery failed', {
            description: 'Please refresh the page and try again',
            duration: 10000,
        });

        return {
            success: false,
            corruptionType: CorruptionType.UNKNOWN_CORRUPTION,
            message: 'Recovery failed: ' + errorMessage,
            tablesCleared: 0,
            error: error instanceof Error ? error : new Error(String(error)),
        };
    }
}

/**
 * Flag that database recovery is needed
 * Called when migration errors are detected
 */
export function flagRecoveryNeeded(corruptionType: CorruptionType): void {
    if (typeof localStorage === 'undefined') return;

    console.warn(`[Database Recovery] Flagging recovery needed: ${corruptionType}`);
    localStorage.setItem(RECOVERY_FLAG_KEY, 'true');
    localStorage.setItem(RECOVERY_TIMESTAMP_KEY, Date.now().toString());
}

// ============================================================================
// Recovery UI Component Helpers
// ============================================================================

/**
 * Check if we should show recovery UI to user
 */
export function shouldShowRecoveryUI(): boolean {
    return isRecoveryNeeded();
}

/**
 * Get user-friendly message about the corruption
 */
export function getCorruptionMessage(corruptionType: CorruptionType): string {
    switch (corruptionType) {
        case CorruptionType.PRIMARY_KEY_CHANGE:
            return 'The database format has changed in a way that requires a reset. Your data cannot be migrated automatically.';
        case CorruptionType.ENCRYPTION_MISMATCH:
            return 'The encryption format has changed. Your encrypted data cannot be decrypted with the current format.';
        case CorruptionType.DATABASE_CLOSED:
            return 'The database is in an inconsistent state and cannot be opened.';
        case CorruptionType.UNKNOWN_CORRUPTION:
        default:
            return 'The database has encountered an error and needs to be reset.';
    }
}

/**
 * Initialize database with error recovery
 * Wraps db.open() with recovery logic
 */
export async function initializeDatabaseWithRecovery(
    dbOpen: () => Promise<Dexie>
): Promise<boolean> {
    try {
        await dbOpen();
        console.log('[Database Recovery] Database opened successfully');
        return true;
    } catch (error) {
        console.error('[Database Recovery] Database open failed:', error);

        const corruptionType = detectCorruptionType(error);
        if (corruptionType) {
            console.log(`[Database Recovery] Detected corruption type: ${corruptionType}`);
            flagRecoveryNeeded(corruptionType);

            // Show error to user with recovery option
            toast.error('Database Error - Recovery Needed', {
                description: getCorruptionMessage(corruptionType),
                duration: 10000,
                action: {
                    label: 'Recover Database',
                    onClick: async () => {
                        const result = await recoverDatabase();
                        if (result.success) {
                            // Reload page to initialize fresh database
                            window.location.reload();
                        }
                    },
                },
            });

            return false;
        }

        // Unknown error - rethrow
        throw error;
    }
}

// ============================================================================
// Manual Recovery Trigger (for developer console)
// ============================================================================

/**
 * Trigger manual database recovery
 * Call this from browser console: window.__recoverDatabase()
 */
export async function manualRecovery(): Promise<RecoveryResult> {
    console.log('[Database Recovery] Manual recovery triggered');
    return recoverDatabase();
}

// Expose to window for emergency recovery
if (typeof window !== 'undefined') {
    (window as any).__recoverDatabase = manualRecovery;
    (window as any).__detectCorruption = detectCorruptionType;
}
