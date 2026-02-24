/**
 * @fileoverview DEPRECATED - File Sync Status Store stub
 * @deprecated Use sync status from FileService instead
 */

import { create } from 'zustand';

/** @deprecated Use 'synced' | 'syncing' | 'error' | 'pending' */
export type FileSyncState = 'synced' | 'syncing' | 'error' | 'pending';

/** @deprecated */
export interface FileSyncStatus {
  path: string;
  status: FileSyncState;
  lastSynced?: Date;
}

/** @deprecated */
export interface FileSyncCounts {
  total: number;
  synced: number;
  syncing: number;
  error: number;
  pending: number;
}

/** @deprecated */
export interface SyncProgress {
  current: number;
  total: number;
  percentage: number;
}

/** @deprecated */
export interface FileSyncStatusStore {
  statuses: Map<string, FileSyncStatus>;
  getStatus: (path: string) => FileSyncStatus | undefined;
  setStatus: (path: string, status: FileSyncStatus) => void;
  clearStatus: (path: string) => void;
}

/** @deprecated Use FileService sync status */
export const useFileSyncStatusStore = create<FileSyncStatusStore>((set, get) => ({
  statuses: new Map(),
  getStatus: (path: string) => get().statuses.get(path),
  setStatus: (path: string, status: FileSyncStatus) => {
    set((state) => {
      const newStatuses = new Map(state.statuses);
      newStatuses.set(path, status);
      return { statuses: newStatuses };
    });
  },
  clearStatus: (path: string) => {
    set((state) => {
      const newStatuses = new Map(state.statuses);
      newStatuses.delete(path);
      return { statuses: newStatuses };
    });
  },
}));

/** @deprecated */
export const fileSyncStatusStore = useFileSyncStatusStore;

/** @deprecated */
export const fileSyncCountsStore = create(() => ({
  total: 0,
  synced: 0,
  syncing: 0,
  error: 0,
  pending: 0,
}));

/** @deprecated Use FileService */
export function setFileSyncPending(path: string): void {
  useFileSyncStatusStore.getState().setStatus(path, { path, status: 'pending' });
}

/** @deprecated Use FileService */
export function setFileSyncSynced(path: string): void {
  useFileSyncStatusStore.getState().setStatus(path, { path, status: 'synced', lastSynced: new Date() });
}

/** @deprecated Use FileService */
export function setFileSyncError(path: string): void {
  useFileSyncStatusStore.getState().setStatus(path, { path, status: 'error' });
}

/** @deprecated Use FileService */
export function clearFileSyncStatus(path: string): void {
  useFileSyncStatusStore.getState().clearStatus(path);
}

/** @deprecated Use FileService */
export function clearAllFileSyncStatuses(): void {
  useFileSyncStatusStore.setState({ statuses: new Map() });
}
