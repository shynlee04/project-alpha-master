/**
 * @fileoverview Database Recovery Dialog
 * @module presentation/components/common/DatabaseRecoveryDialog
 * @governance CRITICAL-FIX-2026-01-07
 *
 * User-facing dialog for database recovery when migration fails.
 * Shows clear explanation of the issue and action buttons.
 *
 * Story: Fix Dexie database corruption (primary key migration error)
 *
 * When to use:
 * - Dexie throws "UpgradeError: Not yet support for changing primary key"
 * - Database is closed and cannot be opened
 * - Encryption algorithm mismatch errors
 */

import { useEffect, useState } from 'react';
import { AlertCircle, Database, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Alert, AlertDescription } from '@/presentation/components/ui/alert';
import {
    isRecoveryNeeded,
    getRecoveryTimestamp,
    getRecoveryAttempts,
    recoverDatabase,
    CorruptionType,
} from '@/infrastructure/persistence/database-recovery';

interface DatabaseRecoveryDialogProps {
    /** Callback when recovery is complete */
    onRecoveryComplete?: () => void;
}

/**
 * Database Recovery Dialog
 *
 * Shows when database corruption is detected. Provides clear explanation
 * of what went wrong and a button to trigger recovery.
 *
 * Recovery Process:
 * 1. Detects corruption type (primary key change, encryption mismatch, etc.)
 * 2. Clears all IndexedDB databases
 * 3. Clears localStorage and sessionStorage
 * 4. Reloads page to initialize fresh database
 * 5. User loses all data (unavoidable due to IndexedDB limitation)
 */
export function DatabaseRecoveryDialog({ onRecoveryComplete: _ }: DatabaseRecoveryDialogProps = {}) {
    const [open, setOpen] = useState(false);
    const [isRecovering, setIsRecovering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [corruptionType, setCorruptionType] = useState<CorruptionType | null>(null);

    const recoveryNeeded = isRecoveryNeeded();
    const recoveryTimestamp = getRecoveryTimestamp();
    const recoveryAttempts = getRecoveryAttempts();

    // Auto-show dialog when recovery is needed
    useEffect(() => {
        if (recoveryNeeded) {
            setOpen(true);
        }
    }, [recoveryNeeded]);

    const handleRecover = async () => {
        setIsRecovering(true);
        setError(null);

        try {
            console.log('[DatabaseRecoveryDialog] Starting recovery...');

            const result = await recoverDatabase();

            if (result.success) {
                console.log('[DatabaseRecoveryDialog] Recovery successful, reloading...');

                // Wait a moment for the success message to be seen
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setError(result.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage);
            console.error('[DatabaseRecoveryDialog] Recovery failed:', err);
        } finally {
            setIsRecovering(false);
        }
    };

    // Auto-detect corruption type from common error messages
    useEffect(() => {
        // Check for known error patterns in console or window
        const detectFromConsole = () => {
            // This is a best-effort detection from common error patterns
            const errors = [
                { pattern: /UpgradeError.*primary key/i, type: CorruptionType.PRIMARY_KEY_CHANGE },
                { pattern: /InvalidAccessError.*key\.algorithm/i, type: CorruptionType.ENCRYPTION_MISMATCH },
                { pattern: /DatabaseClosedError/i, type: CorruptionType.DATABASE_CLOSED },
            ];

            for (const { pattern, type } of errors) {
                if (pattern.test(window.location.href) || pattern.test(document.body.innerText)) {
                    return type;
                }
            }
            return null;
        };

        if (recoveryNeeded && !corruptionType) {
            const detected = detectFromConsole();
            if (detected) setCorruptionType(detected);
        }
    }, [recoveryNeeded, corruptionType]);

    if (!recoveryNeeded) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-orange-500" />
                        <DialogTitle>Database Recovery Required</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        The database needs to be reset due to a schema migration issue.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Alert with issue explanation */}
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {corruptionType === CorruptionType.PRIMARY_KEY_CHANGE &&
                                'The database schema has changed in a way that cannot be automatically migrated. IndexedDB has a hard limitation: it cannot change primary keys once data is stored.'}
                            {corruptionType === CorruptionType.ENCRYPTION_MISMATCH &&
                                'The encryption format has changed. Your encrypted data cannot be decrypted with the current format.'}
                            {corruptionType === CorruptionType.DATABASE_CLOSED &&
                                'The database is in an inconsistent state and cannot be opened.'}
                            {!corruptionType &&
                                'The database has encountered an error and needs to be reset to continue.'}
                        </AlertDescription>
                    </Alert>

                    {/* Warning about data loss */}
                    <div className="rounded-md border border-orange-500/50 bg-orange-500/10 p-3">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                            ⚠️ Data Loss Warning
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Recovery will delete all projects, notes, settings, and other data.
                            This is unavoidable due to IndexedDB limitations.
                        </p>
                    </div>

                    {/* Recovery info */}
                    {recoveryAttempts > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Recovery attempts: {recoveryAttempts} • First detected: {recoveryTimestamp
                                ? new Date(recoveryTimestamp).toLocaleString()
                                : 'Unknown'}
                        </p>
                    )}

                    {/* Error message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isRecovering}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRecover}
                        disabled={isRecovering}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {isRecovering ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Recovering...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Recover Database
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook to check and show recovery dialog when needed
 * Call this in your app root component
 */
export function useDatabaseRecovery() {
    const recoveryNeeded = isRecoveryNeeded();

    useEffect(() => {
        if (recoveryNeeded) {
            console.warn('[useDatabaseRecovery] Database corruption detected, showing recovery dialog');
        }
    }, [recoveryNeeded]);

    return { recoveryNeeded };
}
