/**
 * Cursor Tracker for Real-Time Collaboration
 * @module lib/collaboration/cursor-tracker
 *
 * Tracks remote cursor positions with smooth animation (lerp).
 * Provides cursor lifecycle management and position interpolation.
 *
 * @story S-025 - Real-Time Collaboration Indicators
 */

import type { CursorData } from './websocket-client';

/**
 * Remote cursor state
 */
export interface RemoteCursor {
  userId: string;
  userName: string;
  filePath: string;
  position: {
    lineNumber: number;
    column: number;
  };
  selection?: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  // For smooth animation
  renderedPosition?: {
    lineNumber: number;
    column: number;
  };
  lastUpdate: number;
}

/**
 * Cursor tracker configuration
 */
export interface CursorTrackerConfig {
  lerpFactor?: number; // Interpolation factor (0-1)
  cursorTimeout?: number; // Remove cursor after inactivity
}

/**
 * Cursor tracker events
 */
export interface CursorTrackerEvents {
  onCursorUpdate: (cursors: Map<string, RemoteCursor>) => void;
  onCursorRemove: (userId: string) => void;
}

/**
 * Cursor tracker implementation
 */
export class CursorTracker {
  private config: Required<CursorTrackerConfig>;
  private events: CursorTrackerEvents;
  private cursors = new Map<string, RemoteCursor>();
  private cleanupTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private animationFrame: number | null = null;
  private currentFilePath: string | null = null;

  constructor(
    config: CursorTrackerConfig = {},
    events: CursorTrackerEvents
  ) {
    this.config = {
      lerpFactor: 0.2, // Smooth animation
      cursorTimeout: 30000, // 30 seconds
      ...config,
    };
    this.events = events;
  }

  /**
   * Set current file path (filter cursors by file)
   */
  setCurrentFile(filePath: string | null): void {
    this.currentFilePath = filePath;
    this.notifyCursorUpdate();
  }

  /**
   * Update cursor position
   */
  updateCursor(data: CursorData): void {
    const existing = this.cursors.get(data.userId);

    const cursor: RemoteCursor = {
      userId: data.userId,
      userName: data.userName,
      filePath: data.filePath,
      position: data.position,
      selection: data.selection,
      renderedPosition: existing?.renderedPosition || data.position,
      lastUpdate: Date.now(),
    };

    this.cursors.set(data.userId, cursor);

    // Reset cleanup timer
    this.resetCleanupTimer(data.userId);

    // Start animation loop if not running
    if (!this.animationFrame) {
      this.startAnimationLoop();
    }

    this.notifyCursorUpdate();
  }

  /**
   * Remove cursor
   */
  removeCursor(userId: string): void {
    this.cursors.delete(userId);
    this.clearCleanupTimer(userId);
    this.notifyCursorUpdate();
    this.events.onCursorRemove?.(userId);
  }

  /**
   * Get cursors for current file
   */
  getCurrentFileCursors(): RemoteCursor[] {
    if (!this.currentFilePath) return [];

    return Array.from(this.cursors.values()).filter(
      cursor => cursor.filePath === this.currentFilePath
    );
  }

  /**
   * Get all cursors
   */
  getAllCursors(): RemoteCursor[] {
    return Array.from(this.cursors.values());
  }

  /**
   * Start smooth animation loop
   */
  private startAnimationLoop(): void {
    const animate = () => {
      let needsUpdate = false;

      // Interpolate cursor positions
      for (const cursor of this.cursors.values()) {
        if (!cursor.renderedPosition) {
          cursor.renderedPosition = { ...cursor.position };
          needsUpdate = true;
          continue;
        }

        // Linear interpolation (lerp)
        const newLineNumber = this.lerp(
          cursor.renderedPosition.lineNumber,
          cursor.position.lineNumber,
          this.config.lerpFactor
        );
        const newColumn = this.lerp(
          cursor.renderedPosition.column,
          cursor.position.column,
          this.config.lerpFactor
        );

        // Check if position changed significantly
        if (
          Math.abs(newLineNumber - cursor.renderedPosition.lineNumber) > 0.01 ||
          Math.abs(newColumn - cursor.renderedPosition.column) > 0.01
        ) {
          cursor.renderedPosition = {
            lineNumber: newLineNumber,
            column: newColumn,
          };
          needsUpdate = true;
        } else {
          // Snap to target when close enough
          cursor.renderedPosition = { ...cursor.position };
        }
      }

      if (needsUpdate) {
        this.notifyCursorUpdate();
      }

      // Continue animation if there are cursors to animate
      if (this.cursors.size > 0) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animationFrame = null;
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Linear interpolation
   */
  private lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  /**
   * Reset cleanup timer for cursor
   */
  private resetCleanupTimer(userId: string): void {
    this.clearCleanupTimer(userId);

    this.cleanupTimers.set(
      userId,
      setTimeout(() => {
        console.log(`[CursorTracker] Removing stale cursor for user: ${userId}`);
        this.removeCursor(userId);
      }, this.config.cursorTimeout)
    );
  }

  /**
   * Clear cleanup timer for cursor
   */
  private clearCleanupTimer(userId: string): void {
    const timer = this.cleanupTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(userId);
    }
  }

  /**
   * Notify cursor update listeners
   */
  private notifyCursorUpdate(): void {
    this.events.onCursorUpdate?.(this.cursors);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    for (const timer of this.cleanupTimers.values()) {
      clearTimeout(timer);
    }

    this.cleanupTimers.clear();
    this.cursors.clear();
  }
}

/**
 * Factory function to create cursor tracker
 */
export function createCursorTracker(
  config?: CursorTrackerConfig,
  events?: CursorTrackerEvents
): CursorTracker {
  return new CursorTracker(config, events || {});
}
