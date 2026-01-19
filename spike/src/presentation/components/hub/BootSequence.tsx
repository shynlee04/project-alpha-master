/**
 * @fileoverview 8-bit BIOS boot sequence animation component
 * @module presentation/components/hub/BootSequence
 */

import { useEffect } from 'react';

export interface BootSequenceProps {
  /** Callback when boot animation completes */
  onComplete: () => void;
}

/**
 * BootSequence Component
 *
 * Displays an 8-bit BIOS-style boot animation with:
 * - Sequential line output with random delays
 * - Typing effect for each line
 * - Pulsing cursor indicator
 * - Full-screen overlay with fixed positioning
 *
 * Part of the Hub's retro gaming aesthetic.
 *
 * @component
 * @example
 * ```tsx
 * <BootSequence onComplete={() => setBooting(false)} />
 * ```
 */
export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  // IMMEDIATE COMPLETION - No animation, instant callback
  // This bypasses SSR/hydration issues with setTimeout

  useEffect(() => {
    // Complete immediately on mount
    const timer = setTimeout(() => {
      onComplete();
    }, 100); // Minimal delay to ensure React has mounted

    return () => clearTimeout(timer);
  }, [onComplete]);

  return null; // No UI, instant completion
};
