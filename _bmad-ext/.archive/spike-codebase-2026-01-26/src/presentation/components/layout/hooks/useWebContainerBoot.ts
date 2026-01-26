/**
 * @fileoverview WebContainer Boot Hook
 * @module components/layout/hooks/useWebContainerBoot
 *
 * Manages WebContainer boot sequence and preview URL handling.
 * Extracted from IDELayout.tsx for code organization.
 *
 * BUG-FIX-2026-01-11: Fixed boot loop caused by unstable onBooted callback
 * - Uses useRef to track boot completion across re-renders
 * - Prevents multiple boot() calls when callback reference changes
 */

import { useState, useEffect, useRef } from 'react';
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
 * - Initiates WebContainer boot on mount (once per component lifecycle)
 * - Listens for server ready events
 * - Exposes preview URL and port for PreviewPanel
 *
 * @bugfix Boot loop prevention: Uses useRef to track if boot was already attempted,
 * preventing re-boots when the onBooted callback reference changes on re-renders.
 */
export function useWebContainerBoot({
    onBooted,
}: UseWebContainerBootOptions): UseWebContainerBootResult {
    const deviceType = useDeviceType();
    const { canBootWebContainer } = useCapabilityDetection();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewPort, setPreviewPort] = useState<number | null>(null);

    // Track if boot was already attempted to prevent boot loops
    // BUG-FIX-2026-01-11: onBooted callback is unstable (new function on each render)
    // Without this ref, the effect would re-run on every render
    const bootAttemptedRef = useRef(false);
    const onBootedRef = useRef(onBooted);

    // Keep the callback ref updated without triggering effect
    useEffect(() => {
        onBootedRef.current = onBooted;
    }, [onBooted]);

    useEffect(() => {
        if (!canBootWebContainer) {
            console.log('[IDE] WebContainer boot skipped (missing capabilities)');
            return;
        }

        // BUG-FIX-2026-01-11: Prevent boot loop - only attempt once per component lifecycle
        if (bootAttemptedRef.current) {
            return;
        }
        bootAttemptedRef.current = true;

        boot()
            .then(() => {
                // Notify WorkspaceContext that boot is complete
                // This enables useInitialSync to trigger auto-sync
                onBootedRef.current();
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
    }, [canBootWebContainer, deviceType]);

    return { previewUrl, previewPort };
}
