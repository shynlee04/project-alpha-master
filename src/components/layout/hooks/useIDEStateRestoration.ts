/**
 * @fileoverview IDE State Restoration Hook
 * @module components/layout/hooks/useIDEStateRestoration
 *
 * Manages restoring IDE state from persistence (panels, files, settings).
 * Extracted from IDELayout.tsx for code organization.
 */

import { useEffect } from 'react';
import type { ImperativePanelGroupHandle } from 'react-resizable-panels';
import type { OpenFile } from '../../ide/MonacoEditor';
import type { LocalFSAdapter } from '../../../lib/filesystem';
import type { TerminalTab, SyncStatus } from '../../../lib/workspace';
import type { FsaPermissionState } from '../../../lib/filesystem/permission-lifecycle';

interface RestoredIdeState {
    chatVisible?: boolean;
    terminalTab?: TerminalTab;
    activeFile?: string | null;
    activeFileScrollTop?: number;
    openFiles?: string[];
    panelLayouts?: Record<string, number[]>;
}

interface UseIDEStateRestorationOptions {
    restoredIdeState: RestoredIdeState | null;
    isChatVisible: boolean;
    openFilesCount: number;
    permissionState: FsaPermissionState;
    syncStatus: SyncStatus;
    localAdapterRef: React.RefObject<LocalFSAdapter | null>;
    // Refs from useIdeStatePersistence
    appliedPanelGroupsRef: React.MutableRefObject<Set<string>>;
    didRestoreOpenFilesRef: React.MutableRefObject<boolean>;
    activeFileScrollTopRef: React.MutableRefObject<number | undefined>;
    // Panel refs
    mainPanelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
    centerPanelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
    editorPanelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
    // Setters - using simpler types compatible with Zustand store actions
    setChatVisible: (visible: boolean) => void;
    setTerminalTab: (tab: TerminalTab) => void;
    setActiveFilePath: (path: string | null) => void;
    setSelectedFilePath: (path: string | undefined) => void;
    setOpenFiles: (files: OpenFile[]) => void;
}

/**
 * Hook to restore IDE state from persistence.
 *
 * Handles:
 * - UI state (chat visibility, terminal tab, active file)
 * - Panel layouts
 * - Open files tabs
 */
export function useIDEStateRestoration({
    restoredIdeState,
    isChatVisible,
    openFilesCount,
    permissionState,
    syncStatus,
    localAdapterRef,
    appliedPanelGroupsRef,
    didRestoreOpenFilesRef,
    activeFileScrollTopRef,
    mainPanelGroupRef,
    centerPanelGroupRef,
    editorPanelGroupRef,
    setChatVisible,
    setTerminalTab,
    setActiveFilePath,
    setSelectedFilePath,
    setOpenFiles,
}: UseIDEStateRestorationOptions): void {
    // Restore UI state (except activeFilePath - that's set in file restoration effect)
    useEffect(() => {
        if (!restoredIdeState) return;
        // Only set if values are defined
        if (restoredIdeState.chatVisible !== undefined) {
            setChatVisible(restoredIdeState.chatVisible);
        }
        if (restoredIdeState.terminalTab !== undefined) {
            setTerminalTab(restoredIdeState.terminalTab);
        }
        // NOTE: Do NOT set activeFilePath here!
        // It must be set AFTER files are restored in the file restoration effect below.
        // Setting it here causes the editor to show "no file open" because the openFiles
        // array is still empty when activeFilePath is set.
        activeFileScrollTopRef.current = restoredIdeState.activeFileScrollTop;
    }, [restoredIdeState, activeFileScrollTopRef, setChatVisible, setTerminalTab]);

    // Apply panel layouts
    useEffect(() => {
        const layouts = restoredIdeState?.panelLayouts;
        if (!layouts) return;

        const applyLayout = (
            groupKey: string,
            ref: ImperativePanelGroupHandle | null,
            expectedLength?: number,
        ) => {
            if (appliedPanelGroupsRef.current.has(groupKey)) return;
            const layout = layouts[groupKey];
            if (!ref || !layout) return;
            if (expectedLength !== undefined && layout.length !== expectedLength) return;
            ref.setLayout(layout);
            appliedPanelGroupsRef.current.add(groupKey);
        };

        applyLayout('center', centerPanelGroupRef.current);
        applyLayout('editor', editorPanelGroupRef.current);
        applyLayout('main', mainPanelGroupRef.current, isChatVisible ? 3 : 2);
    }, [restoredIdeState, isChatVisible, appliedPanelGroupsRef, mainPanelGroupRef, centerPanelGroupRef, editorPanelGroupRef]);

    // Restore open files
    useEffect(() => {
        if (didRestoreOpenFilesRef.current || !restoredIdeState) return;
        if (openFilesCount > 0) {
            didRestoreOpenFilesRef.current = true;
            return;
        }
        const filesToRestore = restoredIdeState.openFiles ?? [];
        if (filesToRestore.length === 0) {
            didRestoreOpenFilesRef.current = true;
            return;
        }
        if (permissionState !== 'granted' || syncStatus === 'syncing') return;

        const adapter = localAdapterRef.current;
        if (!adapter) return;

        didRestoreOpenFilesRef.current = true;

        void (async () => {
            const restoredFiles: OpenFile[] = [];
            for (const path of filesToRestore) {
                try {
                    const result = await adapter.readFile(path);
                    if ('content' in result) {
                        restoredFiles.push({ path, content: result.content, isDirty: false });
                    }
                } catch (error) {
                    console.warn('[IDE] Failed to restore tab:', path, error);
                }
            }
            if (restoredFiles.length === 0) return;
            setOpenFiles(restoredFiles);
            const preferredActive =
                restoredIdeState.activeFile &&
                    restoredFiles.some((f) => f.path === restoredIdeState.activeFile)
                    ? restoredIdeState.activeFile
                    : restoredFiles[0].path;
            setActiveFilePath(preferredActive);
            setSelectedFilePath(preferredActive);
        })();
    }, [restoredIdeState, openFilesCount, permissionState, syncStatus, localAdapterRef, didRestoreOpenFilesRef, setOpenFiles, setActiveFilePath, setSelectedFilePath]);
}
