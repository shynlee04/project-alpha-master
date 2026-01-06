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
import { getLanguageFromPath } from '@/lib/editor/language-utils';
import { EditorTabBar, type OpenFile } from './EditorTabBar';
/**
 * @workspace ide-only
 *
 * This component uses the unified workspace context.
 * Provides IDE sync status for edit warning functionality.
 */
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import { SyncEditWarning } from '../SyncEditWarning';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { useTheme } from 'next-themes';
import { codeAnalysisBridge } from '@/lib/ide/code-analysis-bridge';
import { UserPresenceIndicator } from '@/presentation/components/collaboration/UserPresenceIndicator';
import type { UserPresence } from '@/presentation/components/collaboration/UserPresenceIndicator';
import { SnippetManager } from '@/presentation/components/snippets/SnippetManager';
import type { CodeSnippetRecord } from '@/infrastructure/persistence/dexie-db-snippet-types';
import { DiffViewer } from '@/presentation/components/diff/DiffViewer';
import type { DiffViewMode } from '@/presentation/components/diff/DiffViewer';

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
    /** Users currently viewing the file (collaboration) */
    currentFileUsers?: UserPresence[];
    /** S-029: Enable diff mode */
    diffMode?: boolean;
    /** S-029: Original content for comparison (in diff mode) */
    originalContent?: string;
    /** S-029: Diff view mode (unified, side-by-side, line-by-line) */
    diffViewMode?: DiffViewMode;
    /** S-029: Callback when diff mode is toggled */
    onDiffModeToggle?: (enabled: boolean) => void;
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
    currentFileUsers = [],
    diffMode = false,
    originalContent = '',
    diffViewMode = 'unified',
    onDiffModeToggle,
}: MonacoEditorProps): React.JSX.Element {
    const { t } = useTranslation();
    const { resolvedTheme } = useTheme();
    // MRT-5: Mobile responsive detection for editor options
    const { isMobile } = useDeviceType();

    const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs';

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeFilePathRef = useRef<string | null>(activeFilePath);
    const onScrollTopChangeRef = useRef<MonacoEditorProps['onScrollTopChange']>(onScrollTopChange);
    const scrollListenerDisposeRef = useRef<{ dispose: () => void } | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    // Track view states (scroll, cursor) per file for restoration
    const viewStatesRef = useRef<Map<string, editor.ICodeEditorViewState>>(new Map());

    // Track pending content changes per file
    const pendingChangesRef = useRef<Map<string, string>>(new Map());

    const activeFile = openFiles.find(f => f.path === activeFilePath);

    // Story 13-3: Sync edit warning state
    const { syncStatus } = useWorkspaceSync();
    const [showSyncWarning, setShowSyncWarning] = useState(false);
    const syncWarningShownRef = useRef(false);

    // Reset warning state when sync completes
    useEffect(() => {
        if (syncStatus !== 'syncing') {
            syncWarningShownRef.current = false;
        }
    }, [syncStatus]);

    // S-031: Snippet manager state
    const [isSnippetManagerOpen, setIsSnippetManagerOpen] = useState(false);

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

        // S-031: Add Cmd+Shift+S keybinding to open snippet manager
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS, () => {
            console.log('[MonacoEditor] Opening snippet manager');
            setIsSnippetManagerOpen(true);
        });

        // P2-10 AC2: Add "Analyze in Knowledge" context menu action
        editor.addAction({
            id: 'analyze-in-knowledge',
            label: 'Analyze in Knowledge',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1,
            run: (ed) => {
                const currentPath = activeFilePath;
                const currentContent = ed.getValue();

                if (!currentPath) {
                    console.warn('[MonacoEditor] No active file to analyze');
                    return;
                }

                console.log('[MonacoEditor] Analyzing in Knowledge:', currentPath);

                // Request code analysis via bridge
                codeAnalysisBridge.requestCodeAnalysis(
                    currentPath,
                    currentContent,
                    'default' // TODO: Get actual project ID
                );
            },
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

    // S-029: Handle diff mode toggle with keyboard shortcut (Cmd+D)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault();
                onDiffModeToggle?.(!diffMode);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [diffMode, onDiffModeToggle]);

    // S-031: Handle snippet insertion
    const handleSnippetInsert = useCallback((snippet: CodeSnippetRecord) => {
        const editor = editorRef.current;
        if (!editor) {
            console.warn('[MonacoEditor] No editor instance for snippet insertion');
            return;
        }

        // Process snippet for insertion
        let processedCode = snippet.code.replace(/\$\{\d+:([^}]*)\}/g, '$1');
        processedCode = processedCode.replace(/\$\{([^}]+)\}/g, '$1');

        // Get current cursor position
        const position = editor.getPosition();
        if (!position) return;

        // Calculate indentation
        const model = editor.getModel();
        const lineContent = model.getLineContent(position.lineNumber);
        const indentation = lineContent.match(/^\s*/)?.[0] || '';

        // Add indentation to each line
        const indentedCode = processedCode
            .split('\n')
            .map((line, index) => (index === 0 ? line : indentation + line))
            .join('\n');

        // Insert snippet
        editor.executeEdits('snippetInsertion', [
            {
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                },
                text: indentedCode,
            },
        ]);

        console.log('[MonacoEditor] Snippet inserted:', snippet.name);
    }, []);

    return (
        <div className="h-full flex flex-col bg-background">
            <EditorTabBar
                openFiles={openFiles}
                activeFilePath={activeFilePath}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
            />
            {/* S-025: User presence indicator in tab bar */}
            {currentFileUsers.length > 0 && (
                <div className="absolute top-2 right-2 z-10">
                    <UserPresenceIndicator users={currentFileUsers} size="sm" />
                </div>
            )}

            {/* S-029: Diff mode toggle button */}
            {originalContent && (
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                        {t('diff.diffMode', 'Diff Mode')}
                    </span>
                    <button
                        type="button"
                        onClick={() => onDiffModeToggle?.(!diffMode)}
                        className="px-3 py-1 text-xs font-medium rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        aria-label={t('diff.toggleDiffMode', 'Toggle diff mode (Cmd+D)')}
                    >
                        {diffMode ? t('diff.editMode', 'Edit Mode') : t('diff.diffMode', 'Diff Mode')}
                    </button>
                </div>
            )}

            {/* S-029: Show DiffViewer in diff mode, otherwise show regular editor */}
            {diffMode && originalContent ? (
                <div className="flex-1 min-h-0 overflow-auto">
                    <DiffViewer
                        oldContent={originalContent}
                        newContent={activeFile.content}
                        fileName={activeFile.path}
                        language={language}
                        defaultViewMode={diffViewMode}
                        maxHeight="100%"
                    />
                </div>
            ) : (
                <div className="flex-1 min-h-0 relative" ref={editorContainerRef}>
                <Editor
                    height="100%"
                    theme={editorTheme}
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
                {/* S-025: Live cursor overlay (desktop only) */}
                {/* Note: Remote cursors would be rendered here via LiveCursor component */}
            </div>
            )}
            {/* Story 13-3: Sync edit warning toast */}
            <SyncEditWarning
                isVisible={showSyncWarning}
                onDismiss={() => setShowSyncWarning(false)}
            />

            {/* S-031: Snippet Manager Dialog */}
            <SnippetManager
                open={isSnippetManagerOpen}
                onOpenChange={setIsSnippetManagerOpen}
                onSnippetSelect={handleSnippetInsert}
            />
        </div>
    );
}
