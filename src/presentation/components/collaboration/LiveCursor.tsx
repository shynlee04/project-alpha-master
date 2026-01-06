/**
 * Live Cursor Component
 * @module components/collaboration/LiveCursor
 *
 * Renders remote user cursors in Monaco editor.
 * Desktop-only feature (hidden on mobile).
 * 8-bit gaming style with pixel art borders.
 *
 * @story S-025 - Real-Time Collaboration Indicators
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { RemoteCursor } from '@/lib/collaboration/cursor-tracker';
import { useDeviceType } from '@/hooks/useMediaQuery';

/**
 * Cursor render position
 */
interface CursorPosition {
  top: number;
  left: number;
  height: number;
}

/**
 * Single cursor props
 */
interface RemoteCursorComponentProps {
  cursor: RemoteCursor;
  editorElement: HTMLElement | null;
}

/**
 * Remote cursor with label
 */
const RemoteCursorComponent: React.FC<RemoteCursorComponentProps> = ({
  cursor,
  editorElement,
}) => {
  const { isMobile } = useDeviceType();
  const [position, setPosition] = useState<CursorPosition | null>(null);

  useEffect(() => {
    if (isMobile || !editorElement || !cursor.renderedPosition) return;

    // Calculate cursor position from Monaco editor coordinates
    const updatePosition = () => {
      try {
        const monacoEditor = editorElement.querySelector('.monaco-editor');
        if (!monacoEditor) return;

        // Get line height from Monaco
        const lineHeight = parseInt(
          monacoEditor.getComputedStyle?.(monacoEditor)?.lineHeight || '21px',
          10
        );

        // Calculate position
        const top = (cursor.renderedPosition.lineNumber - 1) * lineHeight;
        const left = cursor.renderedPosition.column * 8; // Approximate char width

        setPosition({
          top,
          left,
          height: lineHeight,
        });
      } catch (error) {
        console.warn('[LiveCursor] Failed to calculate position:', error);
      }
    };

    updatePosition();

    // Update on scroll
    const handleScroll = () => updatePosition();
    editorElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      editorElement.removeEventListener('scroll', handleScroll);
    };
  }, [cursor, editorElement, isMobile]);

  // Don't render on mobile
  if (isMobile || !position) {
    return null;
  }

  // Generate color from user ID
  const hue = stringToHue(cursor.userId);
  const cursorColor = `hsl(${hue}, 70%, 50%)`;
  const labelColor = `hsl(${hue}, 70%, 95%)`;

  return createPortal(
    <>
      {/* Cursor line */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: position.top,
          left: position.left,
          height: position.height,
        }}
      >
        {/* Cursor */}
        <div
          className="absolute top-0 left-0 w-0.5 h-full"
          style={{
            backgroundColor: cursorColor,
            boxShadow: `0 0 4px ${cursorColor}`, // Glow effect
          }}
        />

        {/* Name label */}
        <div
          className={cn(
            'absolute top-0 left-1.5 px-1.5 py-0.5 rounded-sm text-xs font-medium whitespace-nowrap',
            'border-2', // 8-bit pixel art border
            'select-none'
          )}
          style={{
            backgroundColor: labelColor,
            borderColor: cursorColor,
            color: cursorColor,
          }}
        >
          {cursor.userName}
        </div>
      </div>

      {/* Selection highlight (if present) */}
      {cursor.selection && (
        <div
          className="absolute pointer-events-none z-0 opacity-20"
          style={{
            backgroundColor: cursorColor,
          }}
        />
      )}
    </>,
    editorElement
  );
};

/**
 * Props for live cursor overlay
 */
export interface LiveCursorProps {
  /** Remote cursors to render */
  cursors: RemoteCursor[];
  /** Monaco editor container element */
  editorElement: HTMLElement | null;
  /** CSS className */
  className?: string;
}

/**
 * Live cursor overlay container
 */
export const LiveCursor: React.FC<LiveCursorProps> = ({
  cursors,
  editorElement,
  className,
}) => {
  const { isMobile } = useDeviceType();

  // Don't render on mobile
  if (isMobile || !editorElement) {
    return null;
  }

  return (
    <div className={cn('live-cursor-overlay', className)}>
      {cursors.map(cursor => (
        <RemoteCursorComponent
          key={cursor.userId}
          cursor={cursor}
          editorElement={editorElement}
        />
      ))}
    </div>
  );
};

/**
 * Generate HSL color from string
 */
function stringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

export default LiveCursor;
