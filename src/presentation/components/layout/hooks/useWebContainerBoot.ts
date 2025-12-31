/**
 * @fileoverview WebContainer Boot Hook
 * @module components/layout/hooks/useWebContainerBoot
 *
 * Manages WebContainer boot sequence and preview URL handling.
 * Extracted from IDELayout.tsx for code organization.
 */

import { useState, useEffect } from 'react';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { useCapabilityDetection } from '@/hooks/useCapabilityDetection';
import { showMobileWebContainerError } from '@/lib/utils/mobile-error-handling';
import { boot, onServerReady, isBooted } from '@/lib/webcontainer';

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
    const deviceType = useDeviceType();
    const { canBootWebContainer } = useCapabilityDetection();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewPort, setPreviewPort] = useState<number | null>(null);

    useEffect(() => {
        if (!canBootWebContainer) {
            console.log('[IDE] WebContainer boot skipped (missing capabilities)');
            return;
        }

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

                // Check if mobile/tablet and show mobile-friendly error
                const { isMobile, isTablet } = deviceType;
                if (isMobile || isTablet) {
                    showMobileWebContainerError('bootFailed');
                } else {
                    // Desktop users see improved error message
                    console.error('[IDE] WebContainer boot failed:', error);
                }
            });
    }, [onBooted]);

    return { previewUrl, previewPort };
}
