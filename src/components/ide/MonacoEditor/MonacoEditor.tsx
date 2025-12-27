/**
 * Monaco Editor component with multi-model support, auto-save, and tab management
 * @module components/ide/MonacoEditor
 * 
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-5 Monaco Editor Mobile Optimization
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { getLanguageFromPath } from '../../../lib/editor/language-utils';
import { EditorTabBar, type OpenFile } from './EditorTabBar';
import { useWorkspace } from '../../../lib/workspace';
import { SyncEditWarning } from '../SyncEditWarning';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';

/** Auto-save debounce delay in milliseconds */
const AUTO_SAVE_DELAY_MS = 2000;

export interface MonacoEditorProps {
    /** Currently open files with their content and dirty state */
    openFiles: OpenFile[];
    /** Path of the currently active file */
    activeFilePath: string | null;
    /** Callback when a file is saved (triggered by debounced auto-save) */
    onSave?: (path: string, content: string) => void;
    /** Callback when the active file changes */
    onActiveFileChange?: (path: string) => void;
    /** Callback when a tab is closed */
    onTabClose?: (path: string) => void;
    /** Callback when file content changes (updates dirty state) */
    onContentChange?: (path: string, content: string) => void;
    /** Optional initial scroll position for the active file (restored on reload) */
    initialScrollTop?: number;
    /** Callback when editor scroll position changes */
    onScrollTopChange?: (path: string, scrollTop: number) => void;
}

/**
 * Monaco Editor wrapper with multi-file support, tabs, and auto-save.
 * Uses the `path` prop for multi-model editing (unique model per file).
 */
export function MonacoEditor({
    openFiles,
    activeFilePath,
    onSave,
    onActiveFileChange,
    onTabClose,
    onContentChange,
    initialScrollTop,
    onScrollTopChange,
}: MonacoEditorProps): React.JSX.Element {
    const { t } = useTranslation();
    // MRT-5: Mobile responsive detection for editor options
    const { isMobile } = useDeviceType();

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeFilePathRef = useRef<string | null>(activeFilePath);
    const onScrollTopChangeRef = useRef<MonacoEditorProps['onScrollTopChange']>(onScrollTopChange);
    const scrollListenerDisposeRef = useRef<{ dispose: () => void } | null>(null);

    // Track view states (scroll, cursor) per file for restoration
    const viewStatesRef = useRef<Map<string, editor.ICodeEditorViewState>>(new Map());

    // Track pending content changes per file
    const pendingChangesRef = useRef<Map<string, string>>(new Map());

    const activeFile = openFiles.find(f => f.path === activeFilePath);

    // Story 13-3: Sync edit warning state
    const { syncStatus } = useWorkspace();
    const [showSyncWarning, setShowSyncWarning] = useState(false);
    const syncWarningShownRef = useRef(false);

    // Reset warning state when sync completes
    useEffect(() => {
        if (syncStatus !== 'syncing') {
            syncWarningShownRef.current = false;
        }
    }, [syncStatus]);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            if (scrollDebounceTimeoutRef.current) {
                clearTimeout(scrollDebounceTimeoutRef.current);
            }
            scrollListenerDisposeRef.current?.dispose();
        };
    }, []);

    useEffect(() => {
        activeFilePathRef.current = activeFilePath;
    }, [activeFilePath]);

    useEffect(() => {
        onScrollTopChangeRef.current = onScrollTopChange;
    }, [onScrollTopChange]);

    // Save view state when switching files
    useEffect(() => {
        if (editorRef.current && activeFilePath) {
            // Save current view state before switching
            const viewState = editorRef.current.saveViewState();
            if (viewState) {
                // View state saved on tab switch
            }
        }
    }, [activeFilePath]);

    // Restore view state when active file changes
    useEffect(() => {
        if (editorRef.current && activeFilePath) {
            const savedState = viewStatesRef.current.get(activeFilePath);
            if (savedState) {
                editorRef.current.restoreViewState(savedState);
            }
        }
    }, [activeFilePath]);

    // Story 5-4: Restore scroll position for the active file (on reload)
    useEffect(() => {
        if (!editorRef.current) return;
        if (!activeFilePath) return;
        if (initialScrollTop === undefined) return;

        editorRef.current.setScrollTop(initialScrollTop);
    }, [activeFilePath, initialScrollTop]);

    const handleEditorMount: OnMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Add Cmd+S / Ctrl+S keybinding for immediate save
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            // Clear any pending debounce
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }

            // Get current file path and content
            const currentPath = activeFilePath;
            const currentContent = editor.getValue();

            if (currentPath && currentContent !== undefined && onSave) {
                console.log('[MonacoEditor] Manual save (Cmd+S):', currentPath);
                onSave(currentPath, currentContent);
                pendingChangesRef.current.delete(currentPath);
            }
        });

        // Focus the editor on mount
        editor.focus();

        // Story 5-4: Persist scroll position (debounced) for active file
        scrollListenerDisposeRef.current?.dispose();
        scrollListenerDisposeRef.current = editor.onDidScrollChange(() => {
            const path = activeFilePathRef.current;
            const handler = onScrollTopChangeRef.current;
            if (!path || !handler) return;

            const scrollTop = editor.getScrollTop();
            if (scrollDebounceTimeoutRef.current) {
                clearTimeout(scrollDebounceTimeoutRef.current);
            }
            scrollDebounceTimeoutRef.current = setTimeout(() => {
                handler(path, scrollTop);
            }, 200);
        });
    }, [activeFilePath, onSave]);

    const handleEditorChange: OnChange = useCallback((value) => {
        if (!activeFilePath || value === undefined) return;

        // Story 13-3: Show warning on first edit during sync
        if (syncStatus === 'syncing' && !syncWarningShownRef.current) {
            syncWarningShownRef.current = true;
            setShowSyncWarning(true);
        }

        // Store pending change
        pendingChangesRef.current.set(activeFilePath, value);

        // Notify parent of content change (for dirty state tracking)
        onContentChange?.(activeFilePath, value);

        // Debounced auto-save
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            const pendingContent = pendingChangesRef.current.get(activeFilePath);
            if (pendingContent !== undefined && onSave) {
                console.log('[MonacoEditor] Auto-save:', activeFilePath);
                onSave(activeFilePath, pendingContent);
                pendingChangesRef.current.delete(activeFilePath);
            }
        }, AUTO_SAVE_DELAY_MS);
    }, [activeFilePath, onContentChange, onSave, syncStatus]);

    const handleTabClick = useCallback((path: string) => {
        // Save current view state before switching
        if (editorRef.current && activeFilePath) {
            const viewState = editorRef.current.saveViewState();
            if (viewState) {
                viewStatesRef.current.set(activeFilePath, viewState);
            }
        }
        onActiveFileChange?.(path);
    }, [activeFilePath, onActiveFileChange]);

    const handleTabClose = useCallback((path: string) => {
        // Clean up view state for closed file
        viewStatesRef.current.delete(path);
        pendingChangesRef.current.delete(path);
        onTabClose?.(path);
    }, [onTabClose]);

    // Determine language for current file
    const language = activeFile ? getLanguageFromPath(activeFile.path) : 'plaintext';

    // Show empty state if no files are open
    if (!activeFile) {
        return (
            <div className="h-full flex flex-col bg-background">
                <EditorTabBar
                    openFiles={openFiles}
                    activeFilePath={activeFilePath}
                    onTabClick={handleTabClick}
                    onTabClose={handleTabClose}
                />
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <p className="text-sm">{t('ide.noFileOpen')}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            {t('ide.selectFile')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background">
            <EditorTabBar
                openFiles={openFiles}
                activeFilePath={activeFilePath}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
            />
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    path={activeFile.path}
                    defaultLanguage={language}
                    defaultValue={activeFile.content}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    loading={
                        <div className="h-full flex items-center justify-center text-slate-500">
                            <span className="animate-pulse">{t('editor.loading')}</span>
                        </div>
                    }
                    options={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        // MRT-5: Mobile-optimized settings
                        // 16px prevents iOS Safari from zooming on focus
                        fontSize: isMobile ? 16 : 13,
                        // Reduced line height on mobile for more visible lines
                        lineHeight: isMobile ? 1.4 : 1.6,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        renderLineHighlight: 'line',
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        padding: { top: 8, bottom: 8 },
                        automaticLayout: true,
                        tabSize: 2,
                        // MRT-5: Enable word wrap on mobile to prevent horizontal scrolling
                        wordWrap: isMobile ? 'on' : 'off',
                        folding: true,
                        foldingHighlight: true,
                        showFoldingControls: 'mouseover',
                        bracketPairColorization: { enabled: true },
                        guides: { bracketPairs: true, indentation: true },
                    }}
                />
            </div>
            {/* Story 13-3: Sync edit warning toast */}
            <SyncEditWarning
                isVisible={showSyncWarning}
                onDismiss={() => setShowSyncWarning(false)}
            />
        </div>
    );
}
