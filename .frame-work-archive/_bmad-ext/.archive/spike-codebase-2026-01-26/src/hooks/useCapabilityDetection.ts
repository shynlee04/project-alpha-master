
import { useResponsive } from './useResponsive';
import { useMemo } from 'react';

export interface Capabilities {
    isMobile: boolean;
    canBootWebContainer: boolean;
    supportsFSA: boolean;
}

export function useCapabilityDetection(): Capabilities {
    const { isMobile } = useResponsive();

    const canBootWebContainer = useMemo(() => {
        if (typeof window === 'undefined') return false;

        const hasSharedArrayBuffer = typeof window.SharedArrayBuffer !== 'undefined';
        const isIsolated = window.crossOriginIsolated;

        return hasSharedArrayBuffer && isIsolated;
    }, []);

    const supportsFSA = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return 'showDirectoryPicker' in window;
    }, []);

    return {
        isMobile,
        canBootWebContainer,
        supportsFSA
    };
}
