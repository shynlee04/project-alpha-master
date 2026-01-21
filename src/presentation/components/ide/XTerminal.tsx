/**
 * XTerminal Component
 *
 * Story: LT-4.19 (Light Theme Migration)
 * CREATED_AT: 2026-01-04T10:00:00Z
 * UPDATED_AT: 2026-01-04T10:00:00Z
 *
 * Terminal component using xterm.js with light/dark theme support.
 * Uses CSS custom properties for theme-aware styling.
 */

import { useEffect, useRef, useState } from 'react';
import * as XTerm from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

// Extract Terminal class from namespace for convenience
const Terminal = XTerm.Terminal;
import { createTerminalAdapter, boot, isBooted } from '@/lib/webcontainer';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

/**
 * xterm.js theme configuration for light and dark themes
 * Maps CSS custom properties to xterm.js colors
 */
const getXtermTheme = (isLight: boolean) => ({
    background: isLight ? '#ffffff' : '#020617',
    foreground: isLight ? '#171717' : '#e2e8f0',
    cursor: isLight ? '#f97316' : '#22d3ee',
    selectionBackground: isLight ? 'rgba(249, 115, 22, 0.3)' : 'rgba(34, 211, 238, 0.3)',
    black: isLight ? '#e5e5e5' : '#020617',
    red: isLight ? '#dc2626' : '#ef4444',
    green: isLight ? '#16a34a' : '#22c55e',
    yellow: isLight ? '#d97706' : '#eab308',
    blue: isLight ? '#2563eb' : '#3b82f6',
    magenta: isLight ? '#a855f7' : '#d946ef',
    cyan: isLight ? '#0891b2' : '#06b6d4',
    white: isLight ? '#a3a3a3' : '#f8fafc',
    brightBlack: isLight ? '#737373' : '#475569',
    brightRed: isLight ? '#f87171' : '#fca5a5',
    brightGreen: isLight ? '#4ade80' : '#86efac',
    brightYellow: isLight ? '#fbbf24' : '#fde047',
    brightBlue: isLight ? '#60a5fa' : '#93c5fd',
    brightMagenta: isLight ? '#c084fc' : '#f0abfc',
    brightCyan: isLight ? '#22d3ee' : '#67e8f9',
    brightWhite: isLight ? '#ffffff' : '#ffffff',
});

interface XTerminalProps {
    /**
     * Optional class name for the container
     */
    className?: string;
    /**
     * Whether initial sync has completed (files available in WebContainer)
     * Terminal will show overlay until sync completes
     */
    initialSyncCompleted?: boolean;
    /**
     * Permission state for file system access
     */
    permissionState?: 'prompt' | 'granted' | 'denied';
    /**
     * Whether sync has encountered an error (Story 27-I)
     * If true, terminal will start with warning message
     */
    syncError?: boolean;
    /**
     * Maximum time to wait for sync before starting terminal anyway (ms)
     * Default: 30000 (30 seconds)
     */
    syncTimeout?: number;
}

export function XTerminal({ className, initialSyncCompleted = false, permissionState, syncError = false, syncTimeout = 30000 }: XTerminalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<XTerm.Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const adapterRef = useRef<ReturnType<typeof createTerminalAdapter> | null>(null);
    const initializedRef = useRef(false);
    const shellStartedRef = useRef(false);
    const [isReady, setIsReady] = useState(false);
    const { t } = useTranslation();
    const { resolvedTheme } = useTheme();
    const isLightTheme = resolvedTheme === 'light';

    // Initialize terminal UI when component mounts
    useEffect(() => {
        // Strict Mode protection: don't double init
        if (initializedRef.current || !containerRef.current) return;
        initializedRef.current = true;

        let disposed = false;

        console.log('[XTerminal] Initializing terminal UI...');

        // 1. Initialize xterm.js with theme-aware colors
        const term = new Terminal({
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            cursorBlink: true,
            theme: getXtermTheme(isLightTheme),
            allowProposedApi: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        const safeFitNow = () => {
            const el = containerRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            try {
                fitAddon.fit();
            } catch {
                // Ignore fit errors
            }
        };

        const scheduleFit = () => {
            window.requestAnimationFrame(() => {
                if (disposed) return;
                safeFitNow();
            });
        };

        // Open terminal in container
        term.open(containerRef.current);
        scheduleFit();

        // Save refs
        terminalRef.current = term;
        fitAddonRef.current = fitAddon;

        // Create adapter (but don't start shell yet)
        const adapter = createTerminalAdapter({
            terminal: term,
            fitAddon,
            onExit: (code) => {
                term.write(`\r\n\x1b[33m${t('terminal.shellExited', { code })}\x1b[0m\r\n`);
            },
            onError: (err) => {
                term.write(`\r\n\x1b[31m${t('terminal.error', { error: err.message })}\x1b[0m\r\n`);
            }
        });
        adapterRef.current = adapter;

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            if (disposed) return;
            if (fitAddonRef.current) {
                scheduleFit();
            }
        });
        resizeObserver.observe(containerRef.current);

        setIsReady(true);

        // Cleanup
        return () => {
            console.log('[XTerminal] Disposing...');
            disposed = true;
            resizeObserver.disconnect();
            if (adapterRef.current) {
                adapterRef.current.dispose();
            }
            if (terminalRef.current) {
                terminalRef.current.dispose();
            }

            adapterRef.current = null;
            fitAddonRef.current = null;
            terminalRef.current = null;
            initializedRef.current = false;
            shellStartedRef.current = false;
        };
    }, [t, isLightTheme]);

    // Theme change handler - update xterm.js theme when theme changes
    useEffect(() => {
        if (!terminalRef.current) return;

        const term = terminalRef.current;
        term.options.theme = getXtermTheme(isLightTheme);
    }, [isLightTheme]);

    // Start shell when sync completes OR after timeout/error (Story 27-I)
    useEffect(() => {
        if (!isReady) return;
        if (shellStartedRef.current) return;
        if (!adapterRef.current) return;

        const adapter = adapterRef.current;
        const term = terminalRef.current;

        // Start immediately if sync completed
        if (initialSyncCompleted) {
            shellStartedRef.current = true;
            console.log('[XTerminal] Sync completed, starting shell...');
            boot()
                .then(async () => {
                    if (!isBooted()) return;
                    await adapter.startShell();
                })
                .catch((err: Error) => {
                    if (term) {
                        term.write(`\r\n\x1b[31m${t('terminal.bootFailed', { error: err.message })}\x1b[0m\r\n`);
                    }
                });
            return;
        }

        // Start with warning if sync has error
        if (syncError) {
            shellStartedRef.current = true;
            console.log('[XTerminal] Sync error, starting shell with warning...');
            if (term) {
                term.write(`\r\n\x1b[33mWarning: File sync incomplete. Some files may not be available.\x1b[0m\r\n`);
            }
            boot()
                .then(async () => {
                    if (!isBooted()) return;
                    await adapter.startShell();
                })
                .catch((err: Error) => {
                    if (term) {
                        term.write(`\r\n\x1b[31m${t('terminal.bootFailed', { error: err.message })}\x1b[0m\r\n`);
                    }
                });
            return;
        }

        // Set timeout to start shell after syncTimeout ms
        const timeoutId = setTimeout(() => {
            if (shellStartedRef.current) return;
            shellStartedRef.current = true;
            console.log('[XTerminal] Sync timeout, starting shell with warning...');
            if (term) {
                term.write(`\r\n\x1b[33mWarning: Sync is taking too long. Starting terminal anyway.\x1b[0m\r\n`);
            }
            boot()
                .then(async () => {
                    if (!isBooted()) return;
                    await adapter.startShell();
                })
                .catch((err: Error) => {
                    if (term) {
                        term.write(`\r\n\x1b[31m${t('terminal.bootFailed', { error: err.message })}\x1b[0m\r\n`);
                    }
                });
        }, syncTimeout);

        return () => clearTimeout(timeoutId);
    }, [isReady, initialSyncCompleted, syncError, syncTimeout, t]);


    // Determine overlay message
    const showOverlay = !initialSyncCompleted;
    const overlayMessage = permissionState === 'prompt' || permissionState === 'denied'
        ? t('terminal.grantPermission')
        : t('terminal.waitingForSync');

    return (
        <div className={`relative h-full w-full overflow-hidden ${className || ''}`}>
            {/* Terminal container */}
            <div
                ref={containerRef}
                className={`h-full w-full ${showOverlay ? 'opacity-30' : ''}`}
            />

            {/* Sync waiting overlay */}
            {showOverlay && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        {/* Loading spinner */}
                        <svg
                            className="h-5 w-5 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span className="text-sm font-medium">{overlayMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
