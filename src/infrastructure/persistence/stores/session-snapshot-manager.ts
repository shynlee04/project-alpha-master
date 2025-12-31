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
   * Snapshot ID (auto-generated)
   */
  id?: number;

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
  // private lastSnapshotTime = 0;
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
    const now = Date.now();
    const debounceMs = this.options.debounceMs || 5000;

    // Clear existing timeout
    if (this.snapshotTimeout) {
      clearTimeout(this.snapshotTimeout);
    }

    // Schedule new snapshot
    this.snapshotTimeout = setTimeout(async () => {
      await this.saveSnapshot(getState());
      this.lastSnapshotTime = now;
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

    await this.saveSnapshot(getState);
    this.lastSnapshotTime = Date.now();
  }

  /**
   * Save snapshot to storage
   *
   * @param ideState - Current IDE state
   */
  private async saveSnapshot(ideState: IDEState): Promise<void> {
    const { projectPath } = this.options;

    const snapshot = {
      projectId: projectPath,
      snapshot: {
        openFiles: ideState.openFiles || [],
        activeFile: ideState.activeFile || null,
        cursorPositions: ideState.cursorPositions || {},
        scrollPositions: ideState.scrollPositions || {},
        panelWidths: ideState.panelSizes || [],
        terminalHistory: [], // TODO: Implement terminal history tracking
        chatState: {
          activeConversationId: ideState.activeChatThreadId || null,
          scrollPosition: 0, // TODO: Track chat scroll position
        },
      },
    };

    // Store in IndexedDB via dexie
    const { saveSessionSnapshot } = await import('./dexie-db');
    await saveSessionSnapshot(snapshot);
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
    const { getLatestSessionSnapshot } = await import('./dexie-db');
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
      id: snapshotRecord.id,
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
    // Restore IDE state
    setState({
      activeFile: snapshot.activeFile,
      openFiles: snapshot.openFiles,
      cursorPositions: snapshot.cursorPositions,
      scrollPositions: snapshot.scrollPositions,
      sidebarWidth: snapshot.panelLayout.sidebarWidth,
      panelSizes: snapshot.panelLayout.panelSizes,
      chatVisible: snapshot.chatState?.threadsVisible,
      activeChatThreadId: snapshot.chatState?.activeThreadId,
    });

    console.log('Session snapshot restored:', new Date(snapshot.createdAt));
  }

  /**
   * Clear all snapshots for project
   */
  async clearSnapshots(): Promise<void> {
    const { clearProjectSessionSnapshots } = await import('./dexie-db');
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
