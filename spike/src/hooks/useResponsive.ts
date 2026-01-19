/**
 * @fileoverview Hook for semantic responsive breakpoints
 * @module hooks/useResponsive
 * 
 * Provides standardized breakpoints for the application:
 * - Mobile: < 768px
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px
 */

import { useDeviceType, useTouchDevice } from './useMediaQuery';
import { useState, useEffect } from 'react';

export interface ResponsiveState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouch: boolean;
    isReady: boolean;
}

export function useResponsive(): ResponsiveState {
    const { isMobile, isTablet, isDesktop } = useDeviceType();
    const isTouch = useTouchDevice();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    return {
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        isReady
    };
}
