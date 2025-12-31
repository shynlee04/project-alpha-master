/**
 * DiscoveryOverlays Component
 * Command palette and feature search overlays
 * Max 120 lines
 */

import { CommandPalette } from '../ide/CommandPalette';
import { FeatureSearch } from '../ide/FeatureSearch';

interface DiscoveryOverlaysProps {
  isCommandPaletteOpen: boolean;
  isFeatureSearchOpen: boolean;
  onCommandPaletteClose: () => void;
  onFeatureSearchClose: () => void;
}

export function DiscoveryOverlays({
  isCommandPaletteOpen,
  isFeatureSearchOpen,
  onCommandPaletteClose,
  onFeatureSearchClose
}: DiscoveryOverlaysProps) {
  return (
    <>
      {/* Command Palette Overlay */}
      {isCommandPaletteOpen && (
        <CommandPalette
          onClose={onCommandPaletteClose}
        />
      )}

      {/* Feature Search Overlay */}
      {isFeatureSearchOpen && (
        <FeatureSearch
          onClose={onFeatureSearchClose}
        />
      )}
    </>
  );
}
