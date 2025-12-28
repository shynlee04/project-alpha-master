/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useResponsive } from '../useResponsive';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

describe('useResponsive', () => {
    // Mock matchMedia
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    it('should return default values', () => {
        const { result } = renderHook(() => useResponsive());
        expect(result.current).toEqual({
            isMobile: false,
            isTablet: false,
            isDesktop: false,
            isTouch: true,
            isReady: true
        });
    });
});
