/**
 * @fileoverview Session State Snapshot Manager
 * @module lib/state/session-snapshot-manager
 * @governance EPIC-24-5
 *
 * Manages session state snapshots for IDE restoration.
 * Captures and restores complete IDE session state with debouncing.
 *
 * Story 24.5: Session State Snapshot System
 */

import type { IDEState } from '@/lib/state/ide-store';

export interface SessionSnapshot {
  /**
   * Snapshot ID (auto-generated, matches SessionSnapshotRecord.id type)
   */
  id?: string;

  /**
   * Project path (identifier)
   */
  projectPath: string;

  /**
   * Timestamp when snapshot was created
   */
  createdAt: number;

  /**
   * IDE state snapshot
   */
  ideState: IDEState;

  /**
   * Active file path
   */
  activeFile?: string;

  /**
   * Open file paths
   */
  openFiles: string[];

  /**
   * Cursor positions per file (path -> {line, column})
   */
  cursorPositions: Record<string, { line: number; column: number }>;

  /**
   * Scroll positions per file (path -> scrollOffset)
   */
  scrollPositions: Record<string, number>;

  /**
   * Panel widths/resizing state
   */
  panelLayout: {
    sidebarWidth?: number;
    panelSizes?: number[];
  };

  /**
   * Chat state (threads, visible panels, etc.)
   */
  chatState?: {
    threadsVisible: boolean;
    activeThreadId?: string;
  };
}

export interface SnapshotOptions {
  /**
   * Minimum time between snapshots in ms (default: 5000ms)
   */
  debounceMs?: number;

  /**
   * Maximum snapshot age in days (default: 7)
   */
  maxAgeDays?: number;

  /**
   * Project path (identifier)
   */
  projectPath: string;
}

/**
 * Session Snapshot Manager class
 *
 * Captures and restores IDE session state with automatic debouncing.
 */
export class SessionSnapshotManager {
  private snapshotTimeout: ReturnType<typeof setTimeout> | null = null;
  private maxAgeMs: number;

  constructor(
    private options: SnapshotOptions
  ) {
    const { maxAgeDays = 7 } = options;
    this.maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  }

  /**
   * Trigger a debounced snapshot capture
   *
   * @param getState - Function to get current IDE state
   */
  captureSnapshot(getState: () => IDEState): void {
    const debounceMs = this.options.debounceMs || 5000;

    // Clear existing timeout
    if (this.snapshotTimeout) {
      clearTimeout(this.snapshotTimeout);
    }

    // Schedule new snapshot
    this.snapshotTimeout = setTimeout(async () => {
      const state = getState();
      await this.saveSnapshot(state);
    }, debounceMs);
  }

  /**
   * Immediately save snapshot (no debounce)
   *
   * @param getState - Function to get current IDE state
   */
  async saveSnapshotNow(getState: () => IDEState): Promise<void> {
    if (this.snapshotTimeout) {
      clearTimeout(this.snapshotTimeout);
      this.snapshotTimeout = null;
    }

    const state = getState();
    await this.saveSnapshot(state);
  }

  /**
   * Save snapshot to storage
   *
   * @param ideState - Current IDE state
   */
  private async saveSnapshot(ideState: IDEState): Promise<void> {
    const { projectPath } = this.options;

    // Build snapshot matching SessionSnapshotRecord structure
    const snapshot = {
      projectId: projectPath,
      snapshot: {
        openFiles: ideState.openFiles || [],
        activeFile: ideState.activeFile || null,
        cursorPositions: {} as Record<string, { line: number; column: number }>,
        scrollPositions: {} as Record<string, number>,
        panelWidths: [] as number[],
        terminalHistory: [] as string[],
        chatState: {
          activeConversationId: ideState.chatVisible ? 'active' : null,
          scrollPosition: 0,
        },
      },
    };

    // Type cast for compatibility with saveSessionSnapshot signature
    const snapshotRecord = snapshot as Omit<
      import('../dexie-db-session-types').SessionSnapshotRecord,
      'createdAt' | 'expiresAt'
    >;

    // Store in IndexedDB via dexie
    const { saveSessionSnapshot } = await import('../dexie-db');
    await saveSessionSnapshot(snapshotRecord);
  }

  /**
   * Load latest snapshot for project
   *
   * @returns Snapshot or null if none found or too old
   */
  async loadSnapshot(): Promise<SessionSnapshot | null> {
    const { projectPath } = this.options;
    const now = Date.now();

    // Get from IndexedDB
    const { getLatestSessionSnapshot } = await import('../dexie-db');
    const snapshotRecord = await getLatestSessionSnapshot(projectPath);

    if (!snapshotRecord) {
      return null;
    }

    // Check if snapshot is too old
    const age = now - snapshotRecord.createdAt;
    if (age > this.maxAgeMs) {
      console.log('Snapshot too old, ignoring:', new Date(snapshotRecord.createdAt));
      return null;
    }

    // Convert SessionSnapshotRecord to SessionSnapshot format
    return {
      id: snapshotRecord.id, // SessionSnapshotRecord.id is string
      projectPath: snapshotRecord.projectId,
      createdAt: snapshotRecord.createdAt,
      ideState: {} as IDEState, // IDE state will be populated by restoreSnapshot
      activeFile: snapshotRecord.snapshot.activeFile || undefined,
      openFiles: snapshotRecord.snapshot.openFiles,
      cursorPositions: snapshotRecord.snapshot.cursorPositions,
      scrollPositions: snapshotRecord.snapshot.scrollPositions,
      panelLayout: {
        sidebarWidth: snapshotRecord.snapshot.panelWidths[0],
        panelSizes: snapshotRecord.snapshot.panelWidths,
      },
      chatState: {
        threadsVisible: !!snapshotRecord.snapshot.chatState.activeConversationId,
        activeThreadId: snapshotRecord.snapshot.chatState.activeConversationId || undefined,
      },
    };
  }

  /**
   * Restore snapshot to IDE state
   *
   * @param snapshot - Snapshot to restore
   * @param setState - Function to set IDE state
   */
  async restoreSnapshot(
    snapshot: SessionSnapshot,
    setState: (state: Partial<IDEState>) => void
  ): Promise<void> {
    // Restore IDE state (only properties that exist in IDEState)
    setState({
      activeFile: snapshot.activeFile || null,
      openFiles: snapshot.openFiles,
      chatVisible: snapshot.chatState?.threadsVisible || false,
      // NOTE: cursorPositions, scrollPositions, panelSizes not in IDEState
      // TODO: Add these properties to IDEState if needed
      // cursorPositions: snapshot.cursorPositions,
      // scrollPositions: snapshot.scrollPositions,
      // panelSizes: snapshot.panelLayout.panelSizes,
      // activeChatThreadId: snapshot.chatState?.activeThreadId,
    });

    console.log('Session snapshot restored:', new Date(snapshot.createdAt));
  }

  /**
   * Clear all snapshots for project
   */
  async clearSnapshots(): Promise<void> {
    const { clearProjectSessionSnapshots } = await import('../dexie-db');
    await clearProjectSessionSnapshots(this.options.projectPath);
  }

  /**
   * Get snapshot age in days
   *
   * @param snapshot - Snapshot to check
   * @returns Age in days
   */
  getSnapshotAge(snapshot: SessionSnapshot): number {
    const now = Date.now();
    const ageMs = now - snapshot.createdAt;
    return ageMs / (24 * 60 * 60 * 1000);
  }
}

/**
 * Global snapshot manager instance
 */
let globalSnapshotManager: SessionSnapshotManager | null = null;

/**
 * Get global snapshot manager instance
 *
 * @param options - Snapshot options
 * @returns Snapshot manager instance
 */
export function getSessionSnapshotManager(
  options: SnapshotOptions
): SessionSnapshotManager {
  // Always create new instance for current project
  globalSnapshotManager = new SessionSnapshotManager(options);
  return globalSnapshotManager;
}

/**
 * Auto-capture snapshot on state changes
 *
 * @param getState - Function to get current IDE state
 * @param options - Snapshot options
 */
export function autoCaptureSnapshot(
  getState: () => IDEState,
  options: SnapshotOptions
): void {
  const manager = getSessionSnapshotManager(options);
  manager.captureSnapshot(getState);
}

/**
 * Auto-restore snapshot on project load
 *
 * @param options - Snapshot options
 * @param setState - Function to set IDE state
 * @returns Whether snapshot was restored
 */
export async function autoRestoreSnapshot(
  options: SnapshotOptions,
  setState: (state: Partial<IDEState>) => void
): Promise<boolean> {
  const manager = getSessionSnapshotManager(options);
  const snapshot = await manager.loadSnapshot();

  if (snapshot) {
    await manager.restoreSnapshot(snapshot, setState);
    return true;
  }

  return false;
}
