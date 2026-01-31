/**
 * IDE Discovery Mechanisms Component
 *
 * Renders command palette and feature search modals.
 *
 * @layer Presentation
 * @component IDEDiscoveryMechanisms
 */

import { CommandPalette } from '../../ide/CommandPalette';
import { FeatureSearch } from '../../ide/FeatureSearch';

interface IDEDiscoveryMechanismsProps {
    isCommandPaletteOpen: boolean;
    isFeatureSearchOpen: boolean;
    onCommandPaletteClose: () => void;
    onFeatureSearchClose: () => void;
}

/**
 * IDE Discovery Mechanisms Component
 */
export function IDEDiscoveryMechanisms({
    isCommandPaletteOpen,
    isFeatureSearchOpen,
    onCommandPaletteClose,
    onFeatureSearchClose
}: IDEDiscoveryMechanismsProps) {
    return (
        <>
            {isCommandPaletteOpen && (
                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={onCommandPaletteClose}
                />
            )}

            {isFeatureSearchOpen && (
                <FeatureSearch
                    isOpen={isFeatureSearchOpen}
                    onClose={onFeatureSearchClose}
                />
            )}
        </>
    );
}
