/**
 * @fileoverview 8-bit BIOS boot sequence animation component
 * @module presentation/components/hub/BootSequence
 */

import { useState, useEffect } from 'react';

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
  const [lines, setLines] = useState<string[]>([]);

  // Boot sequence messages (8-bit BIOS style)
  const bootLines = [
    "BIOS CHECK... OK",
    "LOADING KERNEL... OK",
    "MOUNTING VIRTUAL FILESYSTEM...",
    "INITIALIZING NEURAL INTERFACE...",
    "ACCESS GRANTED."
  ];

  useEffect(() => {
    let delay = 0;

    // Sequentially display each boot line with random delays
    bootLines.forEach((line, i) => {
      delay += Math.random() * 300 + 100; // 100-400ms delay per line
      setTimeout(() => {
        setLines(prev => [...prev, line]);

        // Trigger completion callback after last line
        if (i === bootLines.length - 1) {
          setTimeout(onComplete, 500);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-start justify-start p-8 font-mono text-primary text-sm md:text-base">
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-muted-foreground">{`> `}</span>
            <span>{line}</span>
          </div>
        ))}
        {/* Pulsing cursor */}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
};
