/**
 * IDE Layout Discovery State Hook
 *
 * Manages discovery mechanism state (command palette, feature search).
 *
 * @layer Presentation
 * @hook useIDELayoutDiscoveryState
 */

import { useState } from 'react';

interface UseIDELayoutDiscoveryStateResult {
    isCommandPaletteOpen: boolean;
    setIsCommandPaletteOpen: (open: boolean) => void;
    isFeatureSearchOpen: boolean;
    setIsFeatureSearchOpen: (open: boolean) => void;
}

/**
 * Hook to manage discovery mechanism state
 */
export function useIDELayoutDiscoveryState(): UseIDELayoutDiscoveryStateResult {
    // P1.4: Discovery mechanisms state
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isFeatureSearchOpen, setIsFeatureSearchOpen] = useState(false);

    return {
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isFeatureSearchOpen,
        setIsFeatureSearchOpen
    };
}
