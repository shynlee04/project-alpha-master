
import { renderHook } from '@testing-library/react';
import { useCapabilityDetection } from './useCapabilityDetection';
import { useResponsive } from './useResponsive';

// Mock useResponsive
jest.mock('./useResponsive', () => ({
    useResponsive: jest.fn(),
}));

describe('useCapabilityDetection', () => {
    const originalCrossOriginIsolated = window.crossOriginIsolated;
    const originalSharedArrayBuffer = window.SharedArrayBuffer;
    const originalShowDirectoryPicker = window.showDirectoryPicker;

    beforeEach(() => {
        // Reset mocks
        (useResponsive as jest.Mock).mockReturnValue({ isMobile: false });

        // Reset window properties
        Object.defineProperty(window, 'crossOriginIsolated', {
            writable: true,
            value: originalCrossOriginIsolated,
        });
        Object.defineProperty(window, 'SharedArrayBuffer', {
            writable: true,
            value: originalSharedArrayBuffer,
        });
        Object.defineProperty(window, 'showDirectoryPicker', {
            writable: true,
            value: originalShowDirectoryPicker,
        });
    });

    it('should detect mobile device', () => {
        (useResponsive as jest.Mock).mockReturnValue({ isMobile: true });
        const { result } = renderHook(() => useCapabilityDetection());
        expect(result.current.isMobile).toBe(true);
    });

    it('should detect WebContainer capability (success)', () => {
        window.crossOriginIsolated = true;
        (window as any).SharedArrayBuffer = jest.fn();

        const { result } = renderHook(() => useCapabilityDetection());
        expect(result.current.canBootWebContainer).toBe(true);
    });

    it('should fail WebContainer if not isolated', () => {
        window.crossOriginIsolated = false;
        (window as any).SharedArrayBuffer = jest.fn();

        const { result } = renderHook(() => useCapabilityDetection());
        expect(result.current.canBootWebContainer).toBe(false);
    });

    it('should fail WebContainer if no SharedArrayBuffer', () => {
        window.crossOriginIsolated = true;
        (window as any).SharedArrayBuffer = undefined;

        const { result } = renderHook(() => useCapabilityDetection());
        expect(result.current.canBootWebContainer).toBe(false);
    });

    it('should detect FSA support', () => {
        (window as any).showDirectoryPicker = jest.fn();
        const { result } = renderHook(() => useCapabilityDetection());
        expect(result.current.supportsFSA).toBe(true);
    });

    it('should fail FSA support if missing', () => {
        (window as any).showDirectoryPicker = undefined;
        const { result } = renderHook(() => useCapabilityDetection());
        expect(result.current.supportsFSA).toBe(false);
    });
});
