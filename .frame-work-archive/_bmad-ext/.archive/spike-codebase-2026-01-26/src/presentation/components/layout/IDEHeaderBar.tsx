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

import { FolderOpen, Loader2 } from 'lucide-react';
import { ChatIcon, RefreshIcon } from '@/presentation/components/ui/icons';
import { useTranslation } from 'react-i18next';
/**
 * @workspace ide-only
 *
 * This component uses the unified workspace context.
 * Provides IDE-specific file system operations and sync controls.
 */
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import { QuickActionsMenu } from '../ide/QuickActionsMenu';
import { ThemeToggle } from '@/presentation/components/ui/ThemeToggle';
import { useNavigate } from '@tanstack/react-router';
import { useCapabilityDetection } from '@/hooks/useCapabilityDetection';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';
import { WorkspaceSwitcher } from '@/presentation/components/common';

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
    const navigate = useNavigate();
    const { supportsFSA } = useCapabilityDetection();
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
    } = useWorkspaceSync();

    const isSyncing = syncStatus === 'syncing';
    const isDisabled = isOpeningFolder || isSyncing;

    const handleGoHome = () => {
        navigate({ to: '/' });
    };

    return (
        <header className="h-12 md:h-10 bg-card border-b border-border flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-3">
                {/* Home button with logo */}
                <button
                    onClick={handleGoHome}
                    className="min-h-[44px] flex items-center gap-2 hover:opacity-80 transition-opacity p-2"
                    title={t('sidebar.home')}
                    aria-label={t('sidebar.home')}
                >
                    <img
                        src="/via-gent-logo.svg"
                        alt="Via-gent"
                        className="w-32 h-8"
                    />
                    <span className="text-primary font-bold tracking-tight">
                        via-gent
                    </span>
                </button>
                <span className="text-muted-foreground">/</span>
                <TruncatedText text={projectId || ''} className="font-medium text-foreground" />
            </div>
            <div className="flex items-center gap-4">
                {/* Conditional button rendering based on folder state */}
                {directoryHandle ? (
                    <FolderOpenedControls
                        autoSync={autoSync}
                        isDisabled={isDisabled || !supportsFSA}
                        isSyncing={isSyncing}
                        onSyncNow={syncNow}
                        onSwitchFolder={switchFolder}
                        onSetAutoSync={setAutoSync}
                        t={t}
                    />
                ) : (
                    <OpenFolderButton
                        isDisabled={isDisabled || !supportsFSA}
                        onOpenFolder={openFolder}
                        t={t}
                    />
                )}

                {/* Permission state indicator */}
                {permissionState !== 'unknown' && permissionState !== 'granted' && (
                    <span className="text-xs text-muted-foreground">
                        FS: {permissionState}
                    </span>
                )}

                {/* Re-authorize button when permission needs prompt */}
                {permissionState === 'prompt' && directoryHandle && (
                    <button
                        onClick={openFolder}
                        className="text-xs text-primary hover:text-primary/80 underline"
                        title={t('ide.reAuthorize')}
                    >
                        {t('ide.reAuthorize')}
                    </button>
                )}

                {/* Permission denied warning */}
                {permissionState === 'denied' && (
                    <span className="text-xs text-destructive">
                        {t('ide.fsDenied')}
                    </span>
                )}

                {/* Sync error indicator */}
                {syncError && (
                    <span className="text-xs text-destructive" title={syncError}>
                        ⚠️ {t('ide.syncError')}
                    </span>
                )}

                {/* Workspace Switcher (only when ProjectContext available) */}
                <WorkspaceSwitcherWrapper />

                {/* Chat toggle */}
                <button
                    onClick={onToggleChat}
                    className="min-h-[44px] flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
                    title={t('ide.toggleChatShortcut')}
                >
                    <ChatIcon className="w-4 h-4" aria-label={isChatVisible ? t('ide.hideChat') : t('ide.showChat')} />
                    <span className="hidden md:inline">{isChatVisible ? t('ide.hideChat') : t('ide.showChat')}</span>
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Quick actions menu */}
                <QuickActionsMenu />

                {/* Version indicator */}
                <span className="text-xs text-muted-foreground">alpha-v0.1</span>
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
                className={`flex items-center gap-2 text-xs transition-colors min-h-[44px] p-2 ${isDisabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground cursor-pointer'
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
                        `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ` +
                        (autoSync ? 'bg-primary/40' : 'bg-muted')
                    }
                    aria-hidden="true"
                >
                    <span
                        className={
                            `inline-block h-4 w-4 transform rounded-full bg-foreground transition-transform ` +
                            (autoSync ? 'translate-x-4' : 'translate-x-0.5')
                        }
                    />
                </span>
                {t('ide.autoSync')}
            </label>

            {!autoSync && (
                <span className="text-xs text-destructive">{t('ide.autoSyncOff')}</span>
            )}

            <button
                type="button"
                onClick={onSyncNow}
                disabled={isDisabled}
                className={`min-h-[44px] text-xs flex items-center gap-1 transition-colors p-2 ${isDisabled ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'
                    }`}
                title={t('ide.syncNow')}
            >
                {isSyncing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden md:inline">{t('ide.syncNow')}</span>
                    </>
                ) : (
                    <>
                        <RefreshIcon className="w-4 h-4" aria-label={t('ide.syncNow')} />
                        <span className="hidden md:inline">{t('ide.syncNow')}</span>
                    </>
                )}
            </button>
            <button
                type="button"
                onClick={onSwitchFolder}
                disabled={isDisabled}
                className={`min-h-[44px] text-xs flex items-center gap-1 transition-colors p-2 ${isDisabled ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'
                    }`}
                title={t('ide.switchFolder')}
            >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden md:inline">{t('ide.switchFolder')}</span>
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
            className={`min-h-[44px] text-xs flex items-center gap-1 transition-colors p-2 ${isDisabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
                }`}
            title={t('ide.openFolder')}
        >
            <FolderOpen className="w-4 h-4" aria-label={t('ide.openFolder')} />
            <span className="hidden md:inline">{t('ide.openFolder')}</span>
        </button>
    );
}

// ============================================================================
// Workspace Switcher Wrapper
// ============================================================================

/**
 * WorkspaceSwitcherWrapper - Conditional workspace switcher rendering
 *
 * Only renders WorkspaceSwitcher when ProjectContext is available (new routes).
 * Legacy routes (e.g., /ide without projectId) will not show the switcher.
 *
 * This prevents errors when using ProjectContext in routes that don't provide it.
 */
function WorkspaceSwitcherWrapper(): React.JSX.Element | null {
    try {
        // Dynamically import to avoid SSR issues with useContext
        const { useProjectContext } = require('@/lib/workspace/ProjectContext');
        const context = useProjectContext();

        // Only show if project has multiple workspaces enabled
        if (context.enabledWorkspaces.length > 1) {
            return <WorkspaceSwitcher />;
        }

        return null;
    } catch (error) {
        // ProjectContext not available (legacy route)
        return null;
    }
}

// ============================================================================