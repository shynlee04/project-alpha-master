---
document_id: IDEAL-ARCH-003
title: "IDEAL Architecture - Section 3: Storage Architecture"
version: "1.0.0"
status: "HYPOTHESIS - PENDING VALIDATION"
created: "2026-01-30T23:45:00+07:00"
author: "architect-ext"
parent_session: "ses_3f3a97f58ffeAQG0ztux1SZMCR"
synthesis_sources:
  - "FSA Chromium Documentation (2025-2026)"
  - "wa-sqlite OPFS Documentation (2025)"
  - "Safari PWA Storage Policies (2025)"
  - "Dexie.js v4.0 Documentation"
  - "Project Alpha codebase analysis"
  - "IDEAL-architecture-section-1-state-management-2026-01-30.md"
validation_status: "NOT VALIDATED"
---

# IDEAL Architecture - Section 3: Storage Architecture

> **HYPOTHESIS DOCUMENT**: This represents the TARGET state for Project Alpha's storage layer. All patterns here are prescriptive and opinionated. Validation required before implementation.

---

## 1. Platform Detection & Strategy Selection

### 1.1 Storage Strategy Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STORAGE STRATEGY DECISION TREE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Browser Detection]                                                         │
│         │                                                                    │
│         ├──▶ Desktop + Chrome 122+ + User grants FSA permission            │
│         │         │                                                          │
│         │         └──▶ STRATEGY A: FSA (File System Access API)             │
│         │               • Real files on disk                                 │
│         │               • FileSystemObserver (129+) OR polling              │
│         │               • Bidirectional sync with external editors           │
│         │               • Handle persisted in IndexedDB                      │
│         │               • Performance: <200ms incremental sync               │
│         │                                                                    │
│         ├──▶ Mobile/Tablet + Chrome/Safari + OPFS available                 │
│         │         │                                                          │
│         │         ├──▶ Safari? → Check PWA installation status              │
│         │         │         │                                                │
│         │         │         ├──▶ PWA installed → STRATEGY B: SQLite+OPFS    │
│         │         │         │                                                │
│         │         │         └──▶ NOT PWA → Show PWA prompt (7-day eviction) │
│         │         │                   └──▶ If declined → STRATEGY C         │
│         │         │                                                          │
│         │         └──▶ Chrome/Edge → STRATEGY B: SQLite+OPFS                │
│         │               • wa-sqlite with OPFSCoopSyncVFS                     │
│         │               • Multi-tab coordination                              │
│         │               • Virtual file system                                 │
│         │               • FTS5 full-text search                              │
│         │               • Performance: <3s initial, <200ms incremental       │
│         │                                                                    │
│         └──▶ Fallback (no OPFS / older browsers)                            │
│                   │                                                          │
│                   └──▶ STRATEGY C: IndexedDB (Dexie.js)                     │
│                         • Blob storage for file content                      │
│                         • Limited quota (browser-managed)                    │
│                         • No external editor sync                            │
│                         • Performance: <5s initial, <500ms incremental       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Platform Detection Implementation

```typescript
// ============================================================================
// @/infrastructure/platform/storage-strategy-detector.ts
// ============================================================================

/**
 * Storage Strategy Enum
 */
export type StorageStrategy = 'fsa' | 'sqlite-opfs' | 'indexeddb';

/**
 * Platform Capabilities
 */
export interface PlatformCapabilities {
  isFSASupported: boolean;
  isOPFSSupported: boolean;
  isFileSystemObserverSupported: boolean;
  isSafari: boolean;
  isPWA: boolean;
  browserVersion: { name: string; version: number };
}

/**
 * Storage Strategy Result
 */
export interface StorageStrategyResult {
  strategy: StorageStrategy;
  capabilities: PlatformCapabilities;
  warnings: string[];
  requiresPWAPrompt: boolean;
}

/**
 * Detect platform capabilities and determine storage strategy
 */
export function detectStorageStrategy(): StorageStrategyResult {
  const capabilities = detectCapabilities();
  const warnings: string[] = [];
  let requiresPWAPrompt = false;
  
  // Strategy A: FSA (Desktop with full file access)
  if (capabilities.isFSASupported && !isMobileDevice()) {
    if (!capabilities.isFileSystemObserverSupported) {
      warnings.push('FileSystemObserver not available. Using polling fallback.');
    }
    return {
      strategy: 'fsa',
      capabilities,
      warnings,
      requiresPWAPrompt: false,
    };
  }
  
  // Strategy B: SQLite+OPFS (Mobile with private file system)
  if (capabilities.isOPFSSupported) {
    // Safari requires PWA for persistence beyond 7 days
    if (capabilities.isSafari && !capabilities.isPWA) {
      requiresPWAPrompt = true;
      warnings.push('Safari requires PWA installation for persistent storage.');
    }
    
    return {
      strategy: 'sqlite-opfs',
      capabilities,
      warnings,
      requiresPWAPrompt,
    };
  }
  
  // Strategy C: IndexedDB fallback
  warnings.push('OPFS not available. Using IndexedDB with reduced performance.');
  return {
    strategy: 'indexeddb',
    capabilities,
    warnings,
    requiresPWAPrompt: false,
  };
}

/**
 * Detect individual platform capabilities
 */
function detectCapabilities(): PlatformCapabilities {
  const ua = navigator.userAgent;
  
  // Browser detection
  const isChrome = /Chrome/.test(ua) && !/Edg/.test(ua);
  const isEdge = /Edg/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  
  // Version extraction
  let browserName = 'unknown';
  let browserVersion = 0;
  
  if (isChrome) {
    browserName = 'chrome';
    browserVersion = parseInt(ua.match(/Chrome\/(\d+)/)?.[1] || '0');
  } else if (isSafari) {
    browserName = 'safari';
    browserVersion = parseInt(ua.match(/Version\/(\d+)/)?.[1] || '0');
  } else if (isEdge) {
    browserName = 'edge';
    browserVersion = parseInt(ua.match(/Edg\/(\d+)/)?.[1] || '0');
  } else if (isFirefox) {
    browserName = 'firefox';
    browserVersion = parseInt(ua.match(/Firefox\/(\d+)/)?.[1] || '0');
  }
  
  return {
    isFSASupported: 'showDirectoryPicker' in window,
    isOPFSSupported: 'storage' in navigator && 'getDirectory' in navigator.storage,
    isFileSystemObserverSupported: 'FileSystemObserver' in window,
    isSafari,
    isPWA: window.matchMedia('(display-mode: standalone)').matches,
    browserVersion: { name: browserName, version: browserVersion },
  };
}

/**
 * Mobile device detection
 */
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.matchMedia('(max-width: 768px)').matches;
}
```

### 1.3 Strategy Initialization Hook

```typescript
// ============================================================================
// @/presentation/hooks/useStorageStrategy.ts
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { detectStorageStrategy, type StorageStrategyResult } from '@/infrastructure/platform/storage-strategy-detector';
import { db } from '@/infrastructure/persistence/dexie-schema';

interface UseStorageStrategyResult {
  strategy: StorageStrategyResult | null;
  isLoading: boolean;
  showPWAPrompt: boolean;
  dismissPWAPrompt: () => void;
  acceptPWAPrompt: () => void;
}

export function useStorageStrategy(): UseStorageStrategyResult {
  const [strategy, setStrategy] = useState<StorageStrategyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  useEffect(() => {
    async function detect() {
      const result = detectStorageStrategy();
      setStrategy(result);
      
      // Check if we should show PWA prompt
      if (result.requiresPWAPrompt) {
        const dismissed = await db.userPreferences.get('pwa-prompt-dismissed');
        if (!dismissed?.value) {
          setShowPWAPrompt(true);
        }
      }
      
      setIsLoading(false);
    }
    
    detect();
  }, []);

  const dismissPWAPrompt = useCallback(async () => {
    setShowPWAPrompt(false);
    await db.userPreferences.put({
      key: 'pwa-prompt-dismissed',
      value: true,
      updatedAt: Date.now(),
    });
  }, []);

  const acceptPWAPrompt = useCallback(() => {
    // Trigger PWA installation flow
    // This requires proper manifest.json and service worker
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
    }
    setShowPWAPrompt(false);
  }, []);

  return {
    strategy,
    isLoading,
    showPWAPrompt,
    dismissPWAPrompt,
    acceptPWAPrompt,
  };
}
```

---

## 2. Desktop FSA Strategy (Strategy A)

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DESKTOP FSA STORAGE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    USER'S FILE SYSTEM (Real Files)                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │   │
│  │  │ index.ts   │  │ App.tsx    │  │ styles.css │  │ notes/*.md │      │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                         │
│                                    │ Real-time sync                          │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     FSA STORAGE ADAPTER                               │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │ FileSystemObserver (Chrome 129+) OR Polling Fallback (2s)      │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │ Directory Handle (persisted in IndexedDB for re-permission)    │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │ Content Hash Cache (SHA-256 for delta sync)                    │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     SYNC ENGINE                                       │   │
│  │  • Delta sync (mtime + hash comparison)                               │   │
│  │  • Conflict resolution (local-wins / remote-wins / merge)             │   │
│  │  • Event emission to UI via EventBus                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     DEXIE (Metadata + Handle Storage)                 │   │
│  │  • fsaHandles table: projectId, handle, permissionStatus              │   │
│  │  • fileMetadata table: path, mtime, hash, syncState                   │   │
│  │  • projects table: id, name, storageType='fsa', folderPath            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 FSA Handle Persistence

```typescript
// ============================================================================
// @/infrastructure/persistence/fsa-handle-store.ts
// ============================================================================

import { db } from './dexie-schema';

/**
 * FSA Handle Record
 * 
 * Stores directory handles in IndexedDB for persistence across sessions.
 * Chrome supports serializing FileSystemDirectoryHandle via IDB.
 */
export interface FSAHandleRecord {
  projectId: string;
  handle: FileSystemDirectoryHandle;
  folderName: string;
  permissionStatus: 'granted' | 'denied' | 'prompt';
  lastAccessedAt: number;
  createdAt: number;
}

/**
 * Store FSA handle for a project
 */
export async function storeHandle(
  projectId: string,
  handle: FileSystemDirectoryHandle
): Promise<void> {
  await db.fsaHandles.put({
    projectId,
    handle,
    folderName: handle.name,
    permissionStatus: 'granted',
    lastAccessedAt: Date.now(),
    createdAt: Date.now(),
  });
}

/**
 * Restore FSA handle for a project
 * Returns null if handle doesn't exist or permission is denied
 */
export async function restoreHandle(
  projectId: string
): Promise<FileSystemDirectoryHandle | null> {
  const record = await db.fsaHandles.get(projectId);
  if (!record) return null;
  
  // Verify permission is still granted
  try {
    const permission = await record.handle.queryPermission({ mode: 'readwrite' });
    
    if (permission === 'granted') {
      // Update last accessed timestamp
      await db.fsaHandles.update(projectId, {
        lastAccessedAt: Date.now(),
        permissionStatus: 'granted',
      });
      return record.handle;
    }
    
    // Permission needs to be re-requested
    if (permission === 'prompt') {
      await db.fsaHandles.update(projectId, { permissionStatus: 'prompt' });
      return null;
    }
    
    // Permission was denied
    await db.fsaHandles.update(projectId, { permissionStatus: 'denied' });
    return null;
  } catch (error) {
    console.error('[FSAHandleStore] Failed to verify handle:', error);
    return null;
  }
}

/**
 * Request permission for a stored handle
 */
export async function requestPermission(
  projectId: string
): Promise<FileSystemDirectoryHandle | null> {
  const record = await db.fsaHandles.get(projectId);
  if (!record) return null;
  
  try {
    const permission = await record.handle.requestPermission({ mode: 'readwrite' });
    
    if (permission === 'granted') {
      await db.fsaHandles.update(projectId, {
        permissionStatus: 'granted',
        lastAccessedAt: Date.now(),
      });
      return record.handle;
    }
    
    await db.fsaHandles.update(projectId, { permissionStatus: 'denied' });
    return null;
  } catch (error) {
    console.error('[FSAHandleStore] Failed to request permission:', error);
    return null;
  }
}

/**
 * Remove stored handle
 */
export async function removeHandle(projectId: string): Promise<void> {
  await db.fsaHandles.delete(projectId);
}
```

### 2.3 FileSystemObserver Integration

```typescript
// ============================================================================
// @/infrastructure/filesystem/file-observer.ts
// ============================================================================

import type { FileChangeEvent, FileChangeCallback } from '@/domain/interfaces/storage-adapter.interface';

/**
 * FileSystemObserver wrapper with polling fallback
 * 
 * Chrome 129+ supports native FileSystemObserver for instant notifications.
 * Falls back to polling for older browsers.
 */
export class FileObserver {
  private handle: FileSystemDirectoryHandle | null = null;
  private observer: FileSystemObserver | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private callbacks: Set<FileChangeCallback> = new Set();
  private fileHashes: Map<string, { mtime: number; hash: string }> = new Map();
  
  private readonly POLL_INTERVAL = 2000; // 2 seconds
  
  constructor() {}
  
  /**
   * Check if FileSystemObserver is available
   */
  static isNativeSupported(): boolean {
    return 'FileSystemObserver' in window;
  }
  
  /**
   * Start watching a directory
   */
  async start(
    handle: FileSystemDirectoryHandle,
    callback: FileChangeCallback
  ): Promise<void> {
    this.handle = handle;
    this.callbacks.add(callback);
    
    if (FileObserver.isNativeSupported()) {
      await this.startNativeObserver();
    } else {
      await this.startPolling();
    }
  }
  
  /**
   * Stop watching
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    this.callbacks.clear();
    this.fileHashes.clear();
  }
  
  /**
   * Start native FileSystemObserver (Chrome 129+)
   */
  private async startNativeObserver(): Promise<void> {
    if (!this.handle) return;
    
    // TypeScript doesn't know about FileSystemObserver yet
    const Observer = (window as any).FileSystemObserver;
    if (!Observer) return;
    
    this.observer = new Observer(async (records: any[]) => {
      for (const record of records) {
        const event = await this.recordToEvent(record);
        if (event) {
          this.emit(event);
        }
      }
    });
    
    await this.observer.observe(this.handle, { recursive: true });
    console.log('[FileObserver] Started native FileSystemObserver');
  }
  
  /**
   * Start polling fallback
   */
  private async startPolling(): Promise<void> {
    if (!this.handle) return;
    
    // Initial scan
    await this.scanDirectory();
    
    this.pollInterval = setInterval(async () => {
      await this.checkForChanges();
    }, this.POLL_INTERVAL);
    
    console.log('[FileObserver] Started polling fallback');
  }
  
  /**
   * Convert FileSystemObserver record to our event format
   */
  private async recordToEvent(record: any): Promise<FileChangeEvent | null> {
    try {
      const handle = record.changedHandle || record.root;
      if (!handle || handle.kind !== 'file') return null;
      
      const path = await this.getRelativePath(handle);
      if (!path) return null;
      
      return {
        type: this.mapRecordType(record.type),
        path,
        timestamp: Date.now(),
        source: 'local',
      };
    } catch {
      return null;
    }
  }
  
  /**
   * Map FileSystemObserver record type to our event type
   */
  private mapRecordType(type: string): FileChangeEvent['type'] {
    switch (type) {
      case 'appeared':
        return 'created';
      case 'disappeared':
        return 'deleted';
      case 'modified':
      default:
        return 'modified';
    }
  }
  
  /**
   * Get relative path from handle
   */
  private async getRelativePath(fileHandle: FileSystemFileHandle): Promise<string | null> {
    if (!this.handle) return null;
    
    try {
      const path = await this.handle.resolve(fileHandle);
      return path?.join('/') || null;
    } catch {
      return null;
    }
  }
  
  /**
   * Scan directory and build hash map (for polling)
   */
  private async scanDirectory(): Promise<void> {
    if (!this.handle) return;
    
    const files = await this.getAllFiles(this.handle, '');
    
    for (const path of files) {
      const hash = await this.getFileHash(path);
      if (hash) {
        this.fileHashes.set(path, hash);
      }
    }
  }
  
  /**
   * Check for changes (polling mode)
   */
  private async checkForChanges(): Promise<void> {
    if (!this.handle) return;
    
    const currentFiles = await this.getAllFiles(this.handle, '');
    const currentSet = new Set(currentFiles);
    
    // Check for modified and deleted
    for (const [path, oldHash] of this.fileHashes) {
      if (!currentSet.has(path)) {
        // Deleted
        this.emit({ type: 'deleted', path, timestamp: Date.now(), source: 'local' });
        this.fileHashes.delete(path);
      } else {
        // Check if modified
        const newHash = await this.getFileHash(path);
        if (newHash && (newHash.mtime !== oldHash.mtime || newHash.hash !== oldHash.hash)) {
          this.emit({ type: 'modified', path, timestamp: Date.now(), source: 'local' });
          this.fileHashes.set(path, newHash);
        }
      }
    }
    
    // Check for new files
    for (const path of currentFiles) {
      if (!this.fileHashes.has(path)) {
        const hash = await this.getFileHash(path);
        if (hash) {
          this.emit({ type: 'created', path, timestamp: Date.now(), source: 'local' });
          this.fileHashes.set(path, hash);
        }
      }
    }
  }
  
  /**
   * Get file hash (mtime + content hash)
   */
  private async getFileHash(path: string): Promise<{ mtime: number; hash: string } | null> {
    if (!this.handle) return null;
    
    try {
      const parts = path.split('/').filter(Boolean);
      const fileName = parts.pop()!;
      
      let dir: FileSystemDirectoryHandle = this.handle;
      for (const part of parts) {
        dir = await dir.getDirectoryHandle(part);
      }
      
      const fileHandle = await dir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      
      // Quick hash: mtime + first 1KB + last 1KB
      const mtime = file.lastModified;
      const size = file.size;
      
      let hashInput = `${mtime}:${size}`;
      if (size > 0) {
        const first = await file.slice(0, 1024).text();
        hashInput += `:${first}`;
        
        if (size > 2048) {
          const last = await file.slice(size - 1024).text();
          hashInput += `:${last}`;
        }
      }
      
      const hash = await this.computeHash(hashInput);
      return { mtime, hash };
    } catch {
      return null;
    }
  }
  
  /**
   * Compute SHA-256 hash
   */
  private async computeHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Get all files recursively
   */
  private async getAllFiles(
    dir: FileSystemDirectoryHandle,
    prefix: string
  ): Promise<string[]> {
    const files: string[] = [];
    
    for await (const [name, handle] of dir) {
      // Skip common excluded directories
      if (name === 'node_modules' || name === '.git' || name === 'dist') {
        continue;
      }
      
      const path = prefix ? `${prefix}/${name}` : name;
      
      if (handle.kind === 'file') {
        files.push(path);
      } else if (handle.kind === 'directory') {
        const subFiles = await this.getAllFiles(handle as FileSystemDirectoryHandle, path);
        files.push(...subFiles);
      }
    }
    
    return files;
  }
  
  /**
   * Emit event to all callbacks
   */
  private emit(event: FileChangeEvent): void {
    for (const callback of this.callbacks) {
      try {
        callback(event);
      } catch (error) {
        console.error('[FileObserver] Callback error:', error);
      }
    }
  }
}
```

---

## 3. Mobile SQLite+OPFS Strategy (Strategy B)

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MOBILE SQLITE+OPFS STORAGE ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    OPFS (Origin Private File System)                  │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │ project-alpha.db (SQLite WASM database)                        │  │   │
│  │  │  • notes table: id, content, updatedAt, syncState              │  │   │
│  │  │  • files table: id, projectId, path, content, metadata         │  │   │
│  │  │  • fts_notes: FTS5 virtual table for full-text search          │  │   │
│  │  │  • embeddings: RAG vectors (future)                            │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │ Lock files for multi-tab coordination                          │  │   │
│  │  │  • OPFSCoopSyncVFS handles shared access                       │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     WA-SQLITE ADAPTER                                 │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │ OPFSCoopSyncVFS - Multi-tab safe VFS                           │  │   │
│  │  │  • Cooperative locking across tabs                              │  │   │
│  │  │  • Sync writes to OPFS                                          │  │   │
│  │  │  • Handles tab close gracefully                                 │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │ Query Interface                                                 │  │   │
│  │  │  • Prepared statements                                          │  │   │
│  │  │  • Transaction support                                          │  │   │
│  │  │  • FTS5 search                                                  │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     SQLITE STORAGE ADAPTER                            │   │
│  │  • Implements StorageAdapter interface                                │   │
│  │  • Async API matching FSA adapter                                     │   │
│  │  • Virtual file paths (not real files)                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 wa-sqlite Setup

```typescript
// ============================================================================
// @/infrastructure/sqlite/sqlite-adapter.ts
// ============================================================================

import type {
  StorageAdapter,
  FileContent,
  FileMetadata,
  FileChangeCallback,
  FileChangeEvent,
} from '@/domain/interfaces/storage-adapter.interface';

/**
 * SQLite WASM Storage Adapter
 * 
 * Uses wa-sqlite with OPFSCoopSyncVFS for mobile storage.
 * Provides virtual file system experience with SQLite backing.
 */
export class SQLiteStorageAdapter implements StorageAdapter {
  readonly name = 'sqlite-opfs';
  
  private db: any = null; // wa-sqlite database instance
  private sqlite3: any = null; // SQLite3 module
  private initialized = false;
  private callbacks: Set<FileChangeCallback> = new Set();
  
  constructor() {}
  
  /**
   * Initialize SQLite WASM with OPFS VFS
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Dynamic import wa-sqlite
      const { default: initSqlite } = await import('@aspect-build/wa-sqlite');
      const { OPFSCoopSyncVFS } = await import('@aspect-build/wa-sqlite/src/OPFSCoopSyncVFS');
      
      // Initialize SQLite
      const sqlite3 = await initSqlite();
      this.sqlite3 = sqlite3;
      
      // Create VFS
      const vfs = await OPFSCoopSyncVFS.create('project-alpha');
      sqlite3.vfs_register(vfs, true);
      
      // Open database
      this.db = await sqlite3.open_v2('project-alpha.db');
      
      // Run migrations
      await this.runMigrations();
      
      this.initialized = true;
      console.log('[SQLiteAdapter] Initialized with OPFS VFS');
    } catch (error) {
      console.error('[SQLiteAdapter] Failed to initialize:', error);
      throw error;
    }
  }
  
  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    // Files table
    await this.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        path TEXT NOT NULL,
        content BLOB,
        content_type TEXT,
        size INTEGER,
        last_modified INTEGER,
        sync_state TEXT DEFAULT 'synced',
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        UNIQUE(project_id, path)
      )
    `);
    
    // Notes table with FTS5
    await this.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT,
        content TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);
    
    // FTS5 virtual table for full-text search
    await this.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS fts_notes USING fts5(
        title,
        content,
        content=notes,
        content_rowid=rowid
      )
    `);
    
    // Triggers to keep FTS in sync
    await this.exec(`
      CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
        INSERT INTO fts_notes(rowid, title, content)
        VALUES (new.rowid, new.title, new.content);
      END
    `);
    
    await this.exec(`
      CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
        INSERT INTO fts_notes(fts_notes, rowid, title, content)
        VALUES ('delete', old.rowid, old.title, old.content);
      END
    `);
    
    await this.exec(`
      CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
        INSERT INTO fts_notes(fts_notes, rowid, title, content)
        VALUES ('delete', old.rowid, old.title, old.content);
        INSERT INTO fts_notes(rowid, title, content)
        VALUES (new.rowid, new.title, new.content);
      END
    `);
    
    // Indexes
    await this.exec(`CREATE INDEX IF NOT EXISTS idx_files_project_path ON files(project_id, path)`);
    await this.exec(`CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id)`);
  }
  
  /**
   * Execute SQL
   */
  private async exec(sql: string): Promise<void> {
    if (!this.db || !this.sqlite3) throw new Error('Database not initialized');
    await this.sqlite3.exec(this.db, sql);
  }
  
  /**
   * Run query with parameters
   */
  private async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db || !this.sqlite3) throw new Error('Database not initialized');
    
    const results: T[] = [];
    await this.sqlite3.exec(this.db, sql, (row: any) => {
      results.push(row);
    }, params);
    
    return results;
  }
  
  // ============================================================================
  // StorageAdapter Implementation
  // ============================================================================
  
  isAvailable(): boolean {
    return this.initialized;
  }
  
  async readFile(path: string): Promise<FileContent> {
    await this.ensureInitialized();
    
    const rows = await this.query<{
      content: ArrayBuffer;
      content_type: string;
      size: number;
      last_modified: number;
    }>(
      'SELECT content, content_type, size, last_modified FROM files WHERE path = ?',
      [path]
    );
    
    if (rows.length === 0) {
      throw new Error(`File not found: ${path}`);
    }
    
    const row = rows[0];
    const data = new Uint8Array(row.content);
    
    return {
      path,
      data,
      text: new TextDecoder().decode(data),
      metadata: {
        path,
        size: row.size,
        lastModified: row.last_modified,
        contentType: row.content_type,
        syncState: 'synced',
      },
    };
  }
  
  async writeFile(path: string, content: Uint8Array): Promise<void> {
    await this.ensureInitialized();
    
    const id = this.generateId();
    const now = Date.now();
    const contentType = this.guessContentType(path);
    
    await this.exec(`
      INSERT OR REPLACE INTO files (id, project_id, path, content, content_type, size, last_modified, updated_at)
      VALUES (?, 'default', ?, ?, ?, ?, ?, ?)
    `, [id, path, content.buffer, contentType, content.length, now, now]);
    
    // Emit change event
    this.emit({ type: 'modified', path, timestamp: now, source: 'user' });
  }
  
  async deleteFile(path: string): Promise<void> {
    await this.ensureInitialized();
    
    await this.exec('DELETE FROM files WHERE path = ?', [path]);
    
    this.emit({ type: 'deleted', path, timestamp: Date.now(), source: 'user' });
  }
  
  async listFiles(pattern: string): Promise<string[]> {
    await this.ensureInitialized();
    
    // Convert glob to LIKE pattern
    const likePattern = pattern
      .replace(/\*\*/g, '%')
      .replace(/\*/g, '%')
      .replace(/\?/g, '_');
    
    const rows = await this.query<{ path: string }>(
      'SELECT path FROM files WHERE path LIKE ?',
      [likePattern]
    );
    
    return rows.map(r => r.path);
  }
  
  async getMetadata(path: string): Promise<FileMetadata> {
    await this.ensureInitialized();
    
    const rows = await this.query<{
      size: number;
      last_modified: number;
      content_type: string;
      sync_state: string;
    }>(
      'SELECT size, last_modified, content_type, sync_state FROM files WHERE path = ?',
      [path]
    );
    
    if (rows.length === 0) {
      throw new Error(`File not found: ${path}`);
    }
    
    const row = rows[0];
    return {
      path,
      size: row.size,
      lastModified: row.last_modified,
      contentType: row.content_type,
      syncState: row.sync_state as any,
    };
  }
  
  async exists(path: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const rows = await this.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM files WHERE path = ?',
      [path]
    );
    
    return rows[0]?.count > 0;
  }
  
  watch(callback: FileChangeCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
  
  // ============================================================================
  // Full-Text Search
  // ============================================================================
  
  /**
   * Search notes using FTS5
   */
  async searchNotes(query: string, limit = 20): Promise<{ id: string; title: string; snippet: string }[]> {
    await this.ensureInitialized();
    
    return this.query(
      `
      SELECT 
        notes.id,
        notes.title,
        snippet(fts_notes, 1, '<mark>', '</mark>', '...', 32) as snippet
      FROM fts_notes
      JOIN notes ON fts_notes.rowid = notes.rowid
      WHERE fts_notes MATCH ?
      ORDER BY rank
      LIMIT ?
      `,
      [query, limit]
    );
  }
  
  // ============================================================================
  // Helpers
  // ============================================================================
  
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
  
  private guessContentType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
      'ts': 'text/typescript',
      'tsx': 'text/typescript',
      'js': 'text/javascript',
      'json': 'application/json',
      'md': 'text/markdown',
      'html': 'text/html',
      'css': 'text/css',
    };
    return types[ext] || 'application/octet-stream';
  }
  
  private emit(event: FileChangeEvent): void {
    for (const callback of this.callbacks) {
      try {
        callback(event);
      } catch (error) {
        console.error('[SQLiteAdapter] Callback error:', error);
      }
    }
  }
  
  /**
   * Dispose resources
   */
  async dispose(): Promise<void> {
    if (this.db && this.sqlite3) {
      await this.sqlite3.close(this.db);
      this.db = null;
      this.initialized = false;
    }
    this.callbacks.clear();
  }
}
```

---

## 4. Safari PWA Requirement

### 4.1 The Safari 7-Day Eviction Problem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SAFARI STORAGE EVICTION POLICY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ⚠️ CRITICAL: Safari deletes ALL site data after 7 days of inactivity      │
│                                                                              │
│  This affects:                                                               │
│    • IndexedDB (Dexie data)                                                  │
│    • OPFS (SQLite database)                                                  │
│    • LocalStorage                                                            │
│    • Cache Storage                                                           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  REGULAR SAFARI BROWSING                                              │   │
│  │  ┌─────────────────┐                                                  │   │
│  │  │ Day 0: Data OK  │                                                  │   │
│  │  │ Day 3: Data OK  │                                                  │   │
│  │  │ Day 7: ⚠️ WARNING                                                  │   │
│  │  │ Day 8: ❌ DATA DELETED                                             │   │
│  │  └─────────────────┘                                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  PWA INSTALLED (Add to Home Screen)                                   │   │
│  │  ┌─────────────────┐                                                  │   │
│  │  │ Day 0: Data OK  │                                                  │   │
│  │  │ Day 30: Data OK │                                                  │   │
│  │  │ Day 365: Data OK│  ✅ Persistent storage                           │   │
│  │  └─────────────────┘                                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 PWA Installation Detection & Prompt

```typescript
// ============================================================================
// @/infrastructure/platform/pwa-manager.ts
// ============================================================================

/**
 * PWA Installation State
 */
export interface PWAState {
  isInstalled: boolean;
  isSafari: boolean;
  canPrompt: boolean;
  isStandalone: boolean;
}

/**
 * PWA Manager
 * 
 * Handles PWA installation detection and prompts for Safari.
 */
export class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installListeners: Set<(state: PWAState) => void> = new Set();
  
  constructor() {
    this.setupListeners();
  }
  
  /**
   * Get current PWA state
   */
  getState(): PWAState {
    const ua = navigator.userAgent;
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    return {
      isInstalled: isStandalone,
      isSafari,
      canPrompt: this.deferredPrompt !== null || (isSafari && !isStandalone),
      isStandalone,
    };
  }
  
  /**
   * Check if PWA prompt should be shown
   */
  shouldShowPrompt(): boolean {
    const state = this.getState();
    return state.isSafari && !state.isInstalled;
  }
  
  /**
   * Prompt user to install PWA
   * 
   * For Chrome: Uses beforeinstallprompt
   * For Safari: Shows instructions modal
   */
  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
    const state = this.getState();
    
    if (state.isSafari) {
      // Safari doesn't support programmatic install
      // Return 'unsupported' and let UI show manual instructions
      return 'unsupported';
    }
    
    if (!this.deferredPrompt) {
      return 'unsupported';
    }
    
    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      
      return choice.outcome === 'accepted' ? 'accepted' : 'dismissed';
    } catch {
      return 'unsupported';
    }
  }
  
  /**
   * Subscribe to install state changes
   */
  onStateChange(callback: (state: PWAState) => void): () => void {
    this.installListeners.add(callback);
    return () => this.installListeners.delete(callback);
  }
  
  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    // Chrome/Edge install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyListeners();
    });
    
    // Detect when app is installed
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyListeners();
    });
    
    // Detect display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
      this.notifyListeners();
    });
  }
  
  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getState();
    for (const listener of this.installListeners) {
      listener(state);
    }
  }
}

/**
 * BeforeInstallPromptEvent type (not in lib.dom.d.ts)
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
```

### 4.3 Safari PWA Prompt Component

```typescript
// ============================================================================
// @/presentation/components/common/SafariPWAPrompt.tsx
// ============================================================================

import { useState, useEffect } from 'react';
import { PWAManager } from '@/infrastructure/platform/pwa-manager';
import { db } from '@/infrastructure/persistence/dexie-schema';

interface SafariPWAPromptProps {
  onDismiss: () => void;
}

export function SafariPWAPrompt({ onDismiss }: SafariPWAPromptProps) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    async function check() {
      const manager = new PWAManager();
      if (!manager.shouldShowPrompt()) return;
      
      // Check if user already dismissed
      const dismissed = await db.userPreferences.get('safari-pwa-dismissed');
      if (dismissed?.value) return;
      
      setShow(true);
    }
    check();
  }, []);
  
  const handleDismiss = async () => {
    await db.userPreferences.put({
      key: 'safari-pwa-dismissed',
      value: true,
      updatedAt: Date.now(),
    });
    setShow(false);
    onDismiss();
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border-2 border-border p-6 max-w-md shadow-[4px_4px_0_0_var(--color-shadow)]">
        <h2 className="text-xl font-bold mb-4">Install Project Alpha</h2>
        
        <div className="mb-4 p-4 bg-warning/10 border border-warning">
          <p className="text-sm">
            <strong>Safari Warning:</strong> Without installing as an app, 
            your data will be deleted after 7 days of inactivity.
          </p>
        </div>
        
        <div className="mb-6">
          <p className="mb-2">To install:</p>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Tap the Share button <span className="text-primary">(⎙)</span></li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to confirm</li>
          </ol>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 border-2 border-border hover:bg-surface-hover"
          >
            Maybe Later
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 bg-primary text-on-primary border-2 border-primary-dark"
          >
            I've Installed It
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Delta Sync Architecture

### 5.1 Sync Engine Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DELTA SYNC ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    CHANGE DETECTION                                   │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │   │
│  │  │ FileSystemObserver│  │ Polling Fallback │  │ Manual Trigger   │   │   │
│  │  │ (Chrome 129+)     │  │ (2s interval)    │  │ (Save button)    │   │   │
│  │  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘   │   │
│  │           │                      │                      │            │   │
│  │           └──────────────────────┴──────────────────────┘            │   │
│  │                                  │                                    │   │
│  │                                  ▼                                    │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                    MTIME CACHE                                │   │   │
│  │  │  path -> { mtime, hash, size, syncState }                     │   │   │
│  │  │  Stored in: Dexie fileMetadata table                          │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    CHANGE CLASSIFICATION                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Quick Check: mtime unchanged? → SKIP (no change)                │ │   │
│  │  │ Quick Check: mtime changed, size same? → HASH CHECK             │ │   │
│  │  │ Quick Check: size changed? → DEFINITELY CHANGED                  │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Hash Check: First 1KB + Last 1KB + Size → Quick Hash            │ │   │
│  │  │ Full Hash: SHA-256 of entire content (for conflicts)            │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    CONFLICT RESOLUTION                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │ NO CONFLICT:                                                     │ │   │
│  │  │   • Only local change → Write to platform                        │ │   │
│  │  │   • Only platform change → Update local cache                    │ │   │
│  │  │                                                                   │ │   │
│  │  │ CONFLICT DETECTED (both changed since last sync):                │ │   │
│  │  │   • Strategy: LAST_WRITE_WINS (default)                          │ │   │
│  │  │   • Strategy: LOCAL_WINS (for notes)                             │ │   │
│  │  │   • Strategy: MERGE (for certain file types)                     │ │   │
│  │  │   • Strategy: ASK_USER (interactive resolution)                  │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    SYNC OPERATIONS                                    │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐             │   │
│  │  │ PULL          │  │ PUSH          │  │ RECONCILE     │             │   │
│  │  │ Platform→Local│  │ Local→Platform│  │ Resolve       │             │   │
│  │  │ (download)    │  │ (upload)      │  │ conflicts     │             │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Sync Engine Implementation

```typescript
// ============================================================================
// @/infrastructure/sync/delta-sync-engine.ts
// ============================================================================

import type { StorageAdapter, FileMetadata } from '@/domain/interfaces/storage-adapter.interface';
import { db } from '@/infrastructure/persistence/dexie-schema';

/**
 * Conflict Resolution Strategy
 */
export type ConflictStrategy = 'last-write-wins' | 'local-wins' | 'remote-wins' | 'merge' | 'ask-user';

/**
 * Sync Result
 */
export interface SyncResult {
  success: boolean;
  filesProcessed: number;
  filesPulled: number;
  filesPushed: number;
  conflicts: ConflictInfo[];
  errors: SyncError[];
  duration: number;
}

/**
 * Conflict Information
 */
export interface ConflictInfo {
  path: string;
  localMtime: number;
  remoteMtime: number;
  resolution: ConflictStrategy;
  resolved: boolean;
}

/**
 * Sync Error
 */
export interface SyncError {
  path: string;
  operation: 'pull' | 'push' | 'delete';
  message: string;
}

/**
 * Delta Sync Engine
 * 
 * Performs efficient file synchronization using mtime + hash comparison.
 */
export class DeltaSyncEngine {
  private adapter: StorageAdapter;
  private conflictStrategy: ConflictStrategy;
  private syncing = false;
  
  constructor(adapter: StorageAdapter, conflictStrategy: ConflictStrategy = 'last-write-wins') {
    this.adapter = adapter;
    this.conflictStrategy = conflictStrategy;
  }
  
  /**
   * Perform full sync
   */
  async sync(): Promise<SyncResult> {
    if (this.syncing) {
      return {
        success: false,
        filesProcessed: 0,
        filesPulled: 0,
        filesPushed: 0,
        conflicts: [],
        errors: [{ path: '', operation: 'pull', message: 'Sync already in progress' }],
        duration: 0,
      };
    }
    
    this.syncing = true;
    const startTime = Date.now();
    
    try {
      // Get all files from platform
      const platformFiles = await this.adapter.listFiles('**/*');
      
      // Get cached metadata
      const cachedMetadata = await db.fileMetadata.toArray();
      const cachedMap = new Map(cachedMetadata.map(m => [m.path, m]));
      
      const result: SyncResult = {
        success: true,
        filesProcessed: 0,
        filesPulled: 0,
        filesPushed: 0,
        conflicts: [],
        errors: [],
        duration: 0,
      };
      
      // Process platform files
      for (const path of platformFiles) {
        try {
          const processed = await this.processFile(path, cachedMap.get(path));
          result.filesProcessed++;
          
          if (processed.action === 'pull') result.filesPulled++;
          if (processed.action === 'push') result.filesPushed++;
          if (processed.conflict) result.conflicts.push(processed.conflict);
        } catch (error) {
          result.errors.push({
            path,
            operation: 'pull',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      
      // Check for deleted files (in cache but not on platform)
      for (const [path] of cachedMap) {
        if (!platformFiles.includes(path)) {
          await db.fileMetadata.delete(path);
          result.filesProcessed++;
        }
      }
      
      result.duration = Date.now() - startTime;
      return result;
    } finally {
      this.syncing = false;
    }
  }
  
  /**
   * Process a single file
   */
  private async processFile(
    path: string,
    cached: { lastModified: number; checksum: string; lastSyncedAt: number } | undefined
  ): Promise<{ action: 'none' | 'pull' | 'push'; conflict?: ConflictInfo }> {
    // Get current metadata from platform
    const metadata = await this.adapter.getMetadata(path);
    
    // No cache = new file, pull it
    if (!cached) {
      await this.updateCache(path, metadata);
      return { action: 'pull' };
    }
    
    // Quick check: mtime unchanged
    if (metadata.lastModified === cached.lastModified) {
      return { action: 'none' };
    }
    
    // mtime changed - check for conflict
    const localChanged = cached.lastSyncedAt < cached.lastModified;
    const remoteChanged = metadata.lastModified > cached.lastSyncedAt;
    
    if (localChanged && remoteChanged) {
      // CONFLICT
      const conflict: ConflictInfo = {
        path,
        localMtime: cached.lastModified,
        remoteMtime: metadata.lastModified,
        resolution: this.conflictStrategy,
        resolved: false,
      };
      
      // Resolve based on strategy
      switch (this.conflictStrategy) {
        case 'last-write-wins':
          if (metadata.lastModified > cached.lastModified) {
            await this.updateCache(path, metadata);
            conflict.resolved = true;
            return { action: 'pull', conflict };
          } else {
            conflict.resolved = true;
            return { action: 'push', conflict };
          }
          
        case 'local-wins':
          conflict.resolved = true;
          return { action: 'push', conflict };
          
        case 'remote-wins':
          await this.updateCache(path, metadata);
          conflict.resolved = true;
          return { action: 'pull', conflict };
          
        case 'ask-user':
        case 'merge':
          // Leave unresolved for UI to handle
          return { action: 'none', conflict };
      }
    }
    
    // Only remote changed
    if (remoteChanged) {
      await this.updateCache(path, metadata);
      return { action: 'pull' };
    }
    
    // Only local changed
    if (localChanged) {
      return { action: 'push' };
    }
    
    return { action: 'none' };
  }
  
  /**
   * Update cache with new metadata
   */
  private async updateCache(path: string, metadata: FileMetadata): Promise<void> {
    await db.fileMetadata.put({
      id: path,
      projectId: 'default',
      path,
      lastModified: metadata.lastModified,
      checksum: metadata.checksum || '',
      syncState: 'synced',
      lastSyncedAt: Date.now(),
    });
  }
  
  /**
   * Force sync a specific file
   */
  async syncFile(path: string, direction: 'pull' | 'push'): Promise<void> {
    if (direction === 'pull') {
      const content = await this.adapter.readFile(path);
      await this.updateCache(path, content.metadata);
    } else {
      // For push, the adapter should already have the content
      const metadata = await this.adapter.getMetadata(path);
      await this.updateCache(path, metadata);
    }
  }
}
```

---

## 6. Unified Storage Adapter Interface

### 6.1 Interface Definition

```typescript
// ============================================================================
// @/domain/interfaces/storage-adapter.interface.ts
// ============================================================================

/**
 * Storage Adapter Interface
 * 
 * Unified API for all storage backends:
 * - FSA (File System Access API) for desktop
 * - SQLite+OPFS for mobile
 * - IndexedDB for fallback
 * 
 * All methods are async and return consistent types.
 */
export interface StorageAdapter {
  /** Adapter name for debugging */
  readonly name: 'fsa' | 'sqlite-opfs' | 'indexeddb';
  
  /** Read file content */
  readFile(path: string): Promise<FileContent>;
  
  /** Write file content */
  writeFile(path: string, content: Uint8Array): Promise<void>;
  
  /** Delete file */
  deleteFile(path: string): Promise<void>;
  
  /** List files matching glob pattern */
  listFiles(pattern: string): Promise<string[]>;
  
  /** Get file metadata */
  getMetadata(path: string): Promise<FileMetadata>;
  
  /** Check if file exists */
  exists(path: string): Promise<boolean>;
  
  /** Watch for changes (optional) */
  watch?(callback: FileChangeCallback): () => void;
  
  /** Check if adapter is ready */
  isAvailable(): boolean;
}
```

### 6.2 Adapter Factory

```typescript
// ============================================================================
// @/infrastructure/filesystem/storage-adapter-factory.ts
// ============================================================================

import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
import { FSAStorageAdapter } from './fsa-storage-adapter';
import { SQLiteStorageAdapter } from '../sqlite/sqlite-adapter';
import { IndexedDBStorageAdapter } from './indexeddb-storage-adapter';
import { detectStorageStrategy, type StorageStrategy } from '../platform/storage-strategy-detector';

/**
 * Storage Adapter Factory
 * 
 * Creates the appropriate adapter based on platform detection.
 */
export class StorageAdapterFactory {
  private static instances: Map<StorageStrategy, StorageAdapter> = new Map();
  
  /**
   * Get or create adapter for current platform
   */
  static async getAdapter(): Promise<StorageAdapter> {
    const { strategy } = detectStorageStrategy();
    
    // Return cached instance if available
    if (this.instances.has(strategy)) {
      return this.instances.get(strategy)!;
    }
    
    // Create new instance
    const adapter = await this.createAdapter(strategy);
    this.instances.set(strategy, adapter);
    
    return adapter;
  }
  
  /**
   * Create adapter for specific strategy
   */
  private static async createAdapter(strategy: StorageStrategy): Promise<StorageAdapter> {
    switch (strategy) {
      case 'fsa':
        return new FSAStorageAdapter();
        
      case 'sqlite-opfs':
        const sqliteAdapter = new SQLiteStorageAdapter();
        await sqliteAdapter.initialize();
        return sqliteAdapter;
        
      case 'indexeddb':
      default:
        return new IndexedDBStorageAdapter();
    }
  }
  
  /**
   * Force a specific adapter (for testing)
   */
  static async forceAdapter(strategy: StorageStrategy): Promise<StorageAdapter> {
    const adapter = await this.createAdapter(strategy);
    this.instances.set(strategy, adapter);
    return adapter;
  }
  
  /**
   * Clear all cached instances
   */
  static clearCache(): void {
    this.instances.clear();
  }
}
```

---

## 7. Performance Targets

### 7.1 Performance Requirements Matrix

| Metric | FSA (Desktop) | SQLite+OPFS (Mobile) | IndexedDB (Fallback) |
|--------|---------------|----------------------|----------------------|
| **Initial Sync (1000 files)** | <3s | <5s | <8s |
| **Incremental Sync** | <200ms | <300ms | <500ms |
| **File Read (1MB)** | <50ms | <100ms | <200ms |
| **File Write (1MB)** | <100ms | <150ms | <300ms |
| **File List (1000 files)** | <500ms | <800ms | <1500ms |
| **Search (FTS)** | N/A | <50ms | N/A |
| **Watch Latency** | <100ms (Observer) / 2s (poll) | N/A | N/A |

### 7.2 Performance Monitoring

```typescript
// ============================================================================
// @/infrastructure/monitoring/storage-performance.ts
// ============================================================================

/**
 * Storage Performance Metrics
 */
export interface StorageMetrics {
  operation: 'read' | 'write' | 'delete' | 'list' | 'sync';
  path?: string;
  fileCount?: number;
  bytesProcessed?: number;
  duration: number;
  adapter: string;
  timestamp: number;
}

/**
 * Storage Performance Monitor
 */
export class StoragePerformanceMonitor {
  private metrics: StorageMetrics[] = [];
  private readonly MAX_METRICS = 1000;
  
  /**
   * Record a metric
   */
  record(metric: Omit<StorageMetrics, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }
  
  /**
   * Get average duration for operation type
   */
  getAverageDuration(operation: StorageMetrics['operation']): number {
    const filtered = this.metrics.filter(m => m.operation === operation);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }
  
  /**
   * Check if performance is within target
   */
  isWithinTarget(operation: StorageMetrics['operation'], adapter: string): boolean {
    const avg = this.getAverageDuration(operation);
    
    const targets: Record<string, Record<string, number>> = {
      'fsa': { read: 50, write: 100, list: 500, sync: 200 },
      'sqlite-opfs': { read: 100, write: 150, list: 800, sync: 300 },
      'indexeddb': { read: 200, write: 300, list: 1500, sync: 500 },
    };
    
    return avg <= (targets[adapter]?.[operation] ?? Infinity);
  }
  
  /**
   * Get performance report
   */
  getReport(): Record<string, { avg: number; p95: number; count: number }> {
    const report: Record<string, { avg: number; p95: number; count: number }> = {};
    
    const byOperation = new Map<string, number[]>();
    for (const m of this.metrics) {
      const key = m.operation;
      if (!byOperation.has(key)) byOperation.set(key, []);
      byOperation.get(key)!.push(m.duration);
    }
    
    for (const [op, durations] of byOperation) {
      durations.sort((a, b) => a - b);
      const sum = durations.reduce((a, b) => a + b, 0);
      const p95Index = Math.floor(durations.length * 0.95);
      
      report[op] = {
        avg: sum / durations.length,
        p95: durations[p95Index] || 0,
        count: durations.length,
      };
    }
    
    return report;
  }
}

// Singleton
export const storageMonitor = new StoragePerformanceMonitor();
```

---

## 8. Migration & Rollout Strategy

### 8.1 Migration Phases

| Phase | Description | Duration | Risk |
|-------|-------------|----------|------|
| **Phase 1** | Ship IndexedDB adapter (current) | Complete | Low |
| **Phase 2** | Add FSA adapter with feature flag | 1 week | Medium |
| **Phase 3** | Enable FSA by default on desktop | 1 week | Medium |
| **Phase 4** | Add SQLite+OPFS adapter | 2 weeks | High |
| **Phase 5** | Enable SQLite+OPFS on mobile | 1 week | Medium |
| **Phase 6** | Deprecate pure IndexedDB | 2 weeks | Low |

### 8.2 Feature Flags

```typescript
// ============================================================================
// @/infrastructure/config/feature-flags.ts
// ============================================================================

export const STORAGE_FLAGS = {
  /** Enable FSA storage adapter */
  ENABLE_FSA: true,
  
  /** Enable SQLite+OPFS adapter (experimental) */
  ENABLE_SQLITE_OPFS: false,
  
  /** Enable FileSystemObserver (Chrome 129+) */
  ENABLE_FILE_OBSERVER: true,
  
  /** Enable delta sync engine */
  ENABLE_DELTA_SYNC: true,
  
  /** Enable PWA prompt for Safari */
  ENABLE_SAFARI_PWA_PROMPT: true,
  
  /** Performance monitoring */
  ENABLE_STORAGE_METRICS: true,
};
```

---

## 9. Anti-Patterns (FORBIDDEN)

### 9.1 Synchronous File Operations

```typescript
// ❌ WRONG: Synchronous file access blocks UI
function readFileSync(path: string): string {
  // Never use synchronous APIs!
  return fs.readFileSync(path, 'utf-8');
}

// ✅ CORRECT: Async file access
async function readFile(path: string): Promise<string> {
  const adapter = await StorageAdapterFactory.getAdapter();
  const content = await adapter.readFile(path);
  return content.text || '';
}
```

### 9.2 Direct IndexedDB Access

```typescript
// ❌ WRONG: Direct IDB access bypasses abstraction
const tx = db.transaction('files', 'readwrite');
const store = tx.objectStore('files');
await store.put(content);

// ✅ CORRECT: Use storage adapter
const adapter = await StorageAdapterFactory.getAdapter();
await adapter.writeFile(path, content);
```

### 9.3 Ignoring Platform Detection

```typescript
// ❌ WRONG: Assuming FSA is always available
const handle = await window.showDirectoryPicker();

// ✅ CORRECT: Check platform support
const { strategy } = detectStorageStrategy();
if (strategy === 'fsa') {
  const handle = await window.showDirectoryPicker();
} else {
  // Use appropriate fallback
}
```

---

## 10. Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| FSA adoption (desktop) | 0% | 80% | Analytics |
| SQLite+OPFS adoption (mobile) | 0% | 60% | Analytics |
| Safari PWA installation rate | N/A | 40% | Analytics |
| Initial sync time (p95) | N/A | <5s | Performance monitor |
| Incremental sync time (p95) | N/A | <300ms | Performance monitor |
| Data loss incidents | N/A | 0 | Error tracking |
| FileSystemObserver usage | 0% | 50% of Chrome users | Analytics |

---

**Document Status**: HYPOTHESIS - Awaiting validation
**Next Steps**: Review with team, prototype FSA adapter, validate SQLite+OPFS performance

---

*Generated by architect-ext on 2026-01-30*
