/**
 * @fileoverview Media Query Hook for Responsive Detection
 * @module hooks/useMediaQuery
 *
 * Custom hook for detecting viewport breakpoints using CSS media queries.
 * Essential for mobile-responsive component branching.
 *
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-2 Create Mobile Tab Bar
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Breakpoint constants following TailwindCSS conventions
 */
export const BREAKPOINTS = {
    /** Phone portrait: 375px-413px */
    xs: '(max-width: 413px)',
    /** Phone landscape / Small tablet: 414px-767px */
    sm: '(min-width: 414px) and (max-width: 767px)',
    /** Tablet portrait: 768px-1023px */
    md: '(min-width: 768px) and (max-width: 1023px)',
    /** Desktop: 1024px+ */
    lg: '(min-width: 1024px)',
    /** Mobile any (phone + tablet portrait): <768px */
    mobile: '(max-width: 767px)',
    /** Tablet any: 768px-1023px */
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    /** Desktop any: 1024px+ */
    desktop: '(min-width: 1024px)',
} as const;

/**
 * Hook for matching CSS media queries
 *
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery(BREAKPOINTS.mobile);
 * const isTablet = useMediaQuery(BREAKPOINTS.tablet);
 * const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
 *
 * // Or custom queries
 * const isPortrait = useMediaQuery('(orientation: portrait)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
    // Initialize with false for SSR safety, then check on mount
    const [matches, setMatches] = useState<boolean>(false);

    const handleChange = useCallback((event: MediaQueryListEvent) => {
        setMatches(event.matches);
    }, []);

    useEffect(() => {
        // Skip on server
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQueryList = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQueryList.matches);

        // Modern browsers support addEventListener
        mediaQueryList.addEventListener('change', handleChange);

        return () => {
            mediaQueryList.removeEventListener('change', handleChange);
        };
    }, [query, handleChange]);

    return matches;
}

/**
 * Hook for detecting current device type based on viewport width
 *
 * @returns Object with boolean flags for device type
 *
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, isPhonePortrait } = useDeviceType();
 *
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 * return <DesktopLayout />;
 * ```
 */
export function useDeviceType() {
    const isMobile = useMediaQuery(BREAKPOINTS.mobile);
    const isTablet = useMediaQuery(BREAKPOINTS.tablet);
    const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
    const isPhonePortrait = useMediaQuery(BREAKPOINTS.xs);
    const isPhoneLandscape = useMediaQuery(BREAKPOINTS.sm);

    return {
        isMobile,
        isTablet,
        isDesktop,
        isPhonePortrait,
        isPhoneLandscape,
    };
}

/**
 * Hook for detecting touch capability
 *
 * @returns boolean indicating if device supports touch
 */
export function useTouchDevice(): boolean {
    const [isTouch, setIsTouch] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        // Check for touch support
        const hasTouch =
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            // @ts-expect-error - Legacy IE detection
            navigator.msMaxTouchPoints > 0;

        setIsTouch(hasTouch);
    }, []);

    return isTouch;
}
