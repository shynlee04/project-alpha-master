import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { createTerminalAdapter, boot, isBooted } from '../../lib/webcontainer';
import { useTranslation } from 'react-i18next';

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
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const adapterRef = useRef<ReturnType<typeof createTerminalAdapter> | null>(null);
    const initializedRef = useRef(false);
    const shellStartedRef = useRef(false);
    const [isReady, setIsReady] = useState(false);
    const { t } = useTranslation();

    // Initialize terminal UI when component mounts
    useEffect(() => {
        // Strict Mode protection: don't double init
        if (initializedRef.current || !containerRef.current) return;
        initializedRef.current = true;

        let disposed = false;

        console.log('[XTerminal] Initializing terminal UI...');

        // 1. Initialize xterm.js
        const term = new Terminal({
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            cursorBlink: true,
            theme: {
                background: '#020617', // slate-950
                foreground: '#e2e8f0', // slate-200
                cursor: '#22d3ee',     // cyan-400
                selectionBackground: 'rgba(34, 211, 238, 0.3)', // cyan-400/30
                black: '#020617',
                red: '#ef4444',
                green: '#22c55e',
                yellow: '#eab308',
                blue: '#3b82f6',
                magenta: '#d946ef',
                cyan: '#06b6d4',
                white: '#f8fafc',
                brightBlack: '#475569',
                brightRed: '#fca5a5',
                brightGreen: '#86efac',
                brightYellow: '#fde047',
                brightBlue: '#93c5fd',
                brightMagenta: '#f0abfc',
                brightCyan: '#67e8f9',
                brightWhite: '#ffffff',
            },
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
    }, [t]);

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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
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
