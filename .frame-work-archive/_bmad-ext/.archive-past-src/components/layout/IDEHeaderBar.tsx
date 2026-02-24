/**
 * @fileoverview IDE Header Bar Component
 * @module components/layout/IDEHeaderBar
 * 
 * Top navigation bar for the IDE with project name, sync controls,
 * and workspace management buttons.
 * 
 * @example
 * ```tsx
 * <IDEHeaderBar
 *   projectId="my-project"
 *   projectName="My Project"
 *   isChatVisible={true}
 *   onToggleChat={() => setIsChatVisible(!isChatVisible)}
 * />
 * ```
 */

import { MessageSquare, FolderOpen, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../../lib/workspace';

/**
 * Props for the IDEHeaderBar component.
 * 
 * @interface IDEHeaderBarProps
 */
export interface IDEHeaderBarProps {
    /** Current project ID */
    projectId: string | null;
    /** Whether the chat panel is visible */
    isChatVisible: boolean;
    /** Callback to toggle chat visibility */
    onToggleChat: () => void;
}

/**
 * IDEHeaderBar - Top navigation bar for the IDE.
 * 
 * Displays:
 * - Project name and branding
 * - Auto-sync toggle
 * - Sync Now button
 * - Open/Switch Folder button
 * - Permission state indicators
 * - Chat toggle
 * - Version indicator
 * 
 * @param props - Component props
 * @returns Header bar JSX element
 */
export function IDEHeaderBar({
    projectId,
    isChatVisible,
    onToggleChat,
}: IDEHeaderBarProps): React.JSX.Element {
    const { t } = useTranslation();
    const {
        directoryHandle,
        permissionState,
        syncStatus,
        syncError,
        autoSync,
        isOpeningFolder,
        openFolder,
        switchFolder,
        syncNow,
        setAutoSync,
    } = useWorkspace();

    const isSyncing = syncStatus === 'syncing';
    const isDisabled = isOpeningFolder || isSyncing;

    return (
        <header className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold tracking-tight">
                    via-gent
                </span>
                <span className="text-slate-600">/</span>
                <span className="font-medium text-slate-300">{projectId}</span>
            </div>
            <div className="flex items-center gap-4">
                {/* Conditional button rendering based on folder state */}
                {directoryHandle ? (
                    <FolderOpenedControls
                        autoSync={autoSync}
                        isDisabled={isDisabled}
                        isSyncing={isSyncing}
                        onSyncNow={syncNow}
                        onSwitchFolder={switchFolder}
                        onSetAutoSync={setAutoSync}
                        t={t}
                    />
                ) : (
                    <OpenFolderButton
                        isDisabled={isDisabled}
                        onOpenFolder={openFolder}
                        t={t}
                    />
                )}

                {/* Permission state indicator */}
                {permissionState !== 'unknown' && permissionState !== 'granted' && (
                    <span className="text-xs text-slate-500">
                        FS: {permissionState}
                    </span>
                )}

                {/* Re-authorize button when permission needs prompt */}
                {permissionState === 'prompt' && directoryHandle && (
                    <button
                        onClick={openFolder}
                        className="text-xs text-cyan-400 hover:text-cyan-200 underline"
                        title={t('ide.reAuthorize')}
                    >
                        {t('ide.reAuthorize')}
                    </button>
                )}

                {/* Permission denied warning */}
                {permissionState === 'denied' && (
                    <span className="text-xs text-amber-400">
                        {t('ide.fsDenied')}
                    </span>
                )}

                {/* Sync error indicator */}
                {syncError && (
                    <span className="text-xs text-amber-400" title={syncError}>
                        ⚠️ {t('ide.syncError')}
                    </span>
                )}

                {/* Chat toggle */}
                <button
                    onClick={onToggleChat}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    title={t('ide.toggleChatShortcut')}
                >
                    <MessageSquare className="w-4 h-4" />
                    {isChatVisible ? t('ide.hideChat') : t('ide.showChat')}
                </button>

                {/* Version indicator */}
                <span className="text-xs text-slate-500">alpha-v0.1</span>
            </div>
        </header>
    );
}

// ============================================================================
// Sub-components
// ============================================================================

interface FolderOpenedControlsProps {
    autoSync: boolean;
    isDisabled: boolean;
    isSyncing: boolean;
    onSyncNow: () => void;
    onSwitchFolder: () => void;
    onSetAutoSync: (enabled: boolean) => Promise<void>;
    t: (key: string) => string;
}

/**
 * Controls shown when a folder is already open.
 * Includes auto-sync toggle, sync now, and switch folder buttons.
 */
function FolderOpenedControls({
    autoSync,
    isDisabled,
    isSyncing,
    onSyncNow,
    onSwitchFolder,
    onSetAutoSync,
    t,
}: FolderOpenedControlsProps): React.JSX.Element {
    return (
        <>
            <label
                className={`flex items-center gap-2 text-xs transition-colors ${isDisabled
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-slate-400 hover:text-slate-200 cursor-pointer'
                    }`}
                title={
                    autoSync
                        ? t('ide.autoSync')
                        : t('ide.autoSync')
                }
            >
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={autoSync}
                    onChange={(event) => void onSetAutoSync(event.target.checked)}
                    disabled={isDisabled}
                />
                <span
                    className={
                        `relative inline-flex h-4 w-7 items-center rounded-full transition-colors ` +
                        (autoSync ? 'bg-cyan-500/40' : 'bg-slate-700')
                    }
                    aria-hidden="true"
                >
                    <span
                        className={
                            `inline-block h-3 w-3 transform rounded-full bg-slate-200 transition-transform ` +
                            (autoSync ? 'translate-x-3.5' : 'translate-x-0.5')
                        }
                    />
                </span>
                {t('ide.autoSync')}
            </label>

            {!autoSync && (
                <span className="text-xs text-amber-400">{t('ide.autoSyncOff')}</span>
            )}

            <button
                type="button"
                onClick={onSyncNow}
                disabled={isDisabled}
                className={`text-xs flex items-center gap-1 transition-colors ${isDisabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
                    }`}
                title={t('ide.syncNow')}
            >
                {isSyncing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('ide.syncNow')}
                    </>
                ) : (
                    <>
                        <RefreshCw className="w-4 h-4" />
                        {t('ide.syncNow')}
                    </>
                )}
            </button>
            <button
                type="button"
                onClick={onSwitchFolder}
                disabled={isDisabled}
                className={`text-xs flex items-center gap-1 transition-colors ${isDisabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
                    }`}
                title={t('ide.switchFolder')}
            >
                <FolderOpen className="w-4 h-4" />
                {t('ide.switchFolder')}
            </button>
        </>
    );
}

interface OpenFolderButtonProps {
    isDisabled: boolean;
    onOpenFolder: () => void;
    t: (key: string) => string;
}

/**
 * Button shown when no folder is open.
 */
function OpenFolderButton({
    isDisabled,
    onOpenFolder,
    t,
}: OpenFolderButtonProps): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={onOpenFolder}
            disabled={isDisabled}
            className={`text-xs flex items-center gap-1 transition-colors ${isDisabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
                }`}
            title={t('ide.openFolder')}
        >
            <FolderOpen className="w-4 h-4" />
            {t('ide.openFolder')}
        </button>
    );
}
