/**
 * @fileoverview useTerminal Hook
 * @module hooks/useTerminal
 *
 * React hook for terminal operations.
 * Manages terminal lifecycle, shell integration, and user interactions.
 *
 * @story S-036 Terminal/Console Integration
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTheme } from 'next-themes';
import { getTerminalEmulator, type TerminalSession, type CommandHistory } from '@/lib/terminal/terminal-emulator';
import { useTerminalStore } from '@/infrastructure/persistence/stores/terminal-store';
import { boot, isBooted } from '@/lib/webcontainer';

/**
 * Terminal hook options
 */
export interface UseTerminalOptions {
  /** Container element for terminal */
  container: HTMLElement | null;
  /** Initial working directory (default: project root) */
  cwd?: string;
  /** Initial sync completed flag */
  initialSyncCompleted?: boolean;
  /** Permission state */
  permissionState?: 'prompt' | 'granted' | 'denied';
  /** Session ID (uses active tab if not provided) */
  sessionId?: string;
}

/**
 * Terminal hook return value
 */
export interface UseTerminalReturn {
  /** Terminal session */
  session: TerminalSession | null;
  /** Whether terminal is ready */
  isReady: boolean;
  /** Whether shell has started */
  isShellStarted: boolean;
  /** Whether terminal is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Command history */
  history: CommandHistory[];
  /** Current working directory */
  cwd: string;
  /** Write data to terminal */
  write: (data: string) => void;
  /** Clear terminal screen */
  clear: () => void;
  /** Reset terminal state */
  reset: () => void;
  /** Navigate command history */
  navigateHistory: (direction: 'up' | 'down') => void;
  /** Search terminal content */
  search: (term: string, options?: { caseSensitive?: boolean; regex?: boolean }) => boolean;
  /** Focus terminal */
  focus: () => void;
  /** Resize terminal */
  resize: () => void;
  /** Set font size */
  setFontSize: (size: number) => void;
  /** Create new terminal tab */
  createTab: () => void;
  /** Close current tab */
  closeTab: () => void;
  /** Switch to tab */
  switchTab: (tabId: string) => void;
  /** Rename tab */
  renameTab: (name: string) => void;
  /** Toggle terminal visibility */
  toggleTerminal: () => void;
}

/**
 * Terminal hook for managing terminal lifecycle and operations
 *
 * @param options - Hook options
 * @returns Terminal operations and state
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const terminal = useTerminal({ container: containerRef.current });
 *
 * return <div ref={containerRef} className="h-full w-full" />;
 * ```
 */
export function useTerminal(options: UseTerminalOptions): UseTerminalReturn {
  const { container, cwd = '/', initialSyncCompleted = false, sessionId: propSessionId } = options;

  const { resolvedTheme } = useTheme();
  const emulator = getTerminalEmulator();

  // Store state
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const tabs = useTerminalStore((s) => s.tabs);
  const createTab = useTerminalStore((s) => s.createTab);
  const closeTab = useTerminalStore((s) => s.closeTab);
  const setActiveTab = useTerminalStore((s) => s.setActiveTab);
  const renameTab = useTerminalStore((s) => s.renameTab);
  const setShellStarted = useTerminalStore((s) => s.setShellStarted);
  const addCommandToHistory = useTerminalStore((s) => s.addCommandToHistory);
  const toggleTerminal = useTerminalStore((s) => s.toggleTerminal);
  const settings = useTerminalStore((s) => s.settings);

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const sessionRef = useRef<TerminalSession | null>(null);
  const initializedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(propSessionId || activeTabId);

  // Get current session ID
  const currentSessionId = propSessionId || sessionIdRef.current || activeTabId;

  /**
   * Initialize terminal
   */
  useEffect(() => {
    if (!container || initializedRef.current) return;

    const tabId = currentSessionId || createTab(cwd);
    sessionIdRef.current = tabId;

    try {
      const session = emulator.createSession(tabId, {
        container,
        cwd,
        fontSize: settings.fontSize,
        theme: (resolvedTheme as 'light' | 'dark') || 'dark',
        enableWebLinks: settings.enableWebLinks,
        scrollback: settings.scrollback,
        onShellExit: (sessionId) => {
          setShellStarted(sessionId, false);
        },
        onCommandExecuted: (sessionId, command) => {
          addCommandToHistory(sessionId, command);
        },
      });

      sessionRef.current = session;
      initializedRef.current = true;
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize terminal';
      setError(message);
      setIsLoading(false);
    }

    return () => {
      if (sessionRef.current) {
        emulator.destroySession(sessionRef.current.id);
        sessionRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [container, cwd]);

  /**
   * Start shell when ready
   */
  useEffect(() => {
    if (!sessionRef.current || !initialSyncCompleted || !container) return;

    const session = sessionRef.current;
    if (session.isShellStarted) return;

    boot()
      .then(async () => {
        if (!isBooted()) return;

        await emulator.startShell(session.id, cwd);
        setShellStarted(session.id, true);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [initialSyncCompleted, container]);

  /**
   * Update theme when changed
   */
  useEffect(() => {
    if (!resolvedTheme) return;
    emulator.setTheme(resolvedTheme as 'light' | 'dark');
  }, [resolvedTheme]);

  /**
   * Update font size when changed
   */
  useEffect(() => {
    if (!sessionRef.current) return;
    emulator.setFontSize(sessionRef.current.id, settings.fontSize);
  }, [settings.fontSize]);

  /**
   * Write data to terminal
   */
  const write = useCallback((data: string) => {
    if (!sessionRef.current) return;
    emulator.write(sessionRef.current.id, data);
  }, []);

  /**
   * Clear terminal screen
   */
  const clear = useCallback(() => {
    if (!sessionRef.current) return;
    emulator.clear(sessionRef.current.id);
  }, []);

  /**
   * Reset terminal state
   */
  const reset = useCallback(() => {
    if (!sessionRef.current) return;
    emulator.reset(sessionRef.current.id);
  }, []);

  /**
   * Navigate command history
   */
  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (!sessionRef.current) return;
    emulator.navigateHistory(sessionRef.current.id, direction);
  }, []);

  /**
   * Search terminal content
   */
  const search = useCallback(
    (term: string, options?: { caseSensitive?: boolean; regex?: boolean }): boolean => {
      if (!sessionRef.current) return false;
      return emulator.search(sessionRef.current.id, term, options);
    },
    []
  );

  /**
   * Focus terminal
   */
  const focus = useCallback(() => {
    if (!sessionRef.current) return;
    emulator.focus(sessionRef.current.id);
  }, []);

  /**
   * Resize terminal
   */
  const resize = useCallback(() => {
    if (!sessionRef.current) return;
    emulator.resize(sessionRef.current.id);
  }, []);

  /**
   * Set font size
   */
  const setFontSize = useCallback((size: number) => {
    if (!sessionRef.current) return;
    emulator.setFontSize(sessionRef.current.id, size);
  }, []);

  /**
   * Create new terminal tab
   */
  const handleCreateTab = useCallback(() => {
    const newTabId = createTab(cwd);
    sessionIdRef.current = newTabId;
    setActiveTab(newTabId);

    // Initialize new terminal in same container
    if (container && !emulator.getSession(newTabId)) {
      const session = emulator.createSession(newTabId, {
        container,
        cwd,
        fontSize: settings.fontSize,
        theme: (resolvedTheme as 'light' | 'dark') || 'dark',
        enableWebLinks: settings.enableWebLinks,
        scrollback: settings.scrollback,
      });

      sessionRef.current = session;
      initializedRef.current = false; // Force re-init
    }
  }, [container, cwd, settings, resolvedTheme]);

  /**
   * Close current tab
   */
  const handleCloseTab = useCallback(() => {
    if (!sessionRef.current) return;

    const tabId = sessionRef.current.id;
    emulator.destroySession(tabId);
    closeTab(tabId);

    // Switch to another tab if available
    const remainingTabs = tabs.filter((t) => t.id !== tabId);
    if (remainingTabs.length > 0) {
      const nextTab = remainingTabs[0];
      sessionIdRef.current = nextTab.id;
      setActiveTab(nextTab.id);
    }
  }, [tabs]);

  /**
   * Switch to tab
   */
  const handleSwitchTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    sessionIdRef.current = tabId;

    // Switch session
    const session = emulator.getSession(tabId);
    if (session) {
      sessionRef.current = session;
    }
  }, []);

  /**
   * Rename tab
   */
  const handleRenameTab = useCallback((name: string) => {
    if (!sessionRef.current) return;
    renameTab(sessionRef.current.id, name);
  }, []);

  // Get current session info
  const session = sessionRef.current;
  const currentTab = tabs.find((t) => t.id === currentSessionId);

  return {
    session,
    isReady: !!session && !isLoading,
    isShellStarted: currentTab?.isShellStarted ?? false,
    isLoading,
    error,
    history: session ? emulator.getHistory(session.id) : [],
    cwd: currentTab?.cwd ?? cwd,
    write,
    clear,
    reset,
    navigateHistory,
    search,
    focus,
    resize,
    setFontSize,
    createTab: handleCreateTab,
    closeTab: handleCloseTab,
    switchTab: handleSwitchTab,
    renameTab: handleRenameTab,
    toggleTerminal,
  };
}
