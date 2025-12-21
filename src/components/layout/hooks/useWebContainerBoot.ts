/**
 * @fileoverview WebContainer Boot Hook
 * @module components/layout/hooks/useWebContainerBoot
 *
 * Manages WebContainer boot sequence and preview URL handling.
 * Extracted from IDELayout.tsx for code organization.
 */

import { useState, useEffect } from 'react';
import { boot, onServerReady, isBooted } from '../../../lib/webcontainer';

interface UseWebContainerBootOptions {
    /** Callback to notify when WebContainer boot completes */
    onBooted: () => void;
}

interface UseWebContainerBootResult {
    /** Preview URL from the dev server (e.g., http://localhost:3000) */
    previewUrl: string | null;
    /** Port number the dev server is running on */
    previewPort: number | null;
}

/**
 * Hook to manage WebContainer boot and dev server ready state.
 *
 * - Initiates WebContainer boot on mount
 * - Listens for server ready events
 * - Exposes preview URL and port for PreviewPanel
 */
export function useWebContainerBoot({
    onBooted,
}: UseWebContainerBootOptions): UseWebContainerBootResult {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewPort, setPreviewPort] = useState<number | null>(null);

    useEffect(() => {
        boot()
            .then(() => {
                // Notify WorkspaceContext that boot is complete
                // This enables useInitialSync to trigger auto-sync
                onBooted();
                console.log('[IDE] WebContainer booted, auto-sync can now proceed');

                if (isBooted()) {
                    const unsubscribe = onServerReady((port, url) => {
                        console.log(`[IDE] Server ready on port ${port}: ${url}`);
                        setPreviewUrl(url);
                        setPreviewPort(port);
                    });
                    return unsubscribe;
                }
            })
            .catch((error) => {
                console.error('[IDE] WebContainer boot failed:', error);
                // Don't set booted on failure - sync won't attempt
            });
    }, [onBooted]);

    return { previewUrl, previewPort };
}
