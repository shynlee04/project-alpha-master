---
document_id: IDEAL-ARCH-001
title: "IDEAL Architecture - Section 1: State Management Layer"
version: "1.0.0"
status: "HYPOTHESIS - PENDING VALIDATION"
created: "2026-01-30T22:30:00+07:00"
author: "architect-ext"
parent_session: "ses_3f3a97f58ffeAQG0ztux1SZMCR"
synthesis_sources:
  - "ADR-041-4-layer-state-architecture-2026-01-30.md"
  - "architecture.md v4.0.0"
  - "Zustand v5 official docs (2025)"
  - "Dexie.js v4.0 docs (2025)"
  - "Project Alpha codebase analysis"
validation_status: "NOT VALIDATED"
---

# IDEAL Architecture - Section 1: State Management Layer

> **HYPOTHESIS DOCUMENT**: This represents the TARGET state for Project Alpha's state management. All patterns here are prescriptive and opinionated. Validation required before implementation.

---

## 1. The 4-Layer State Architecture

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 4: ZUSTAND (UI Runtime State)                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ • Ephemeral UI state (panels, modals, selections)                    │  │
│  │ • Session context (current projectId, active pluginId)               │  │
│  │ • Transient forms, hover/focus states                                │  │
│  │ • NO persist middleware (resets on page reload)                      │  │
│  │ • useShallow() MANDATORY for all multi-property selectors            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │ subscribe                              │
│                                    ▼                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                    LAYER 3: DEXIE.JS (Persisted Domain State)               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ • Domain entities (Projects, Agents, Threads, Providers)             │  │
│  │ • User preferences (theme, language, keyboard shortcuts)            │  │
│  │ • Layout preferences (per-project plugin arrangements)               │  │
│  │ • useLiveQuery() for reactive reads                                  │  │
│  │ • Single source of truth for all persistent data                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │ async write                            │
│                                    ▼                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                    LAYER 2: INDEXEDDB BLOBS (File Content)                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ • Note content (Markdown/HTML blobs)                                 │  │
│  │ • File attachments (images, PDFs)                                    │  │
│  │ • Sync queue (pending operations)                                    │  │
│  │ • Browser fallback (no OPFS support)                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │ sync                                   │
│                                    ▼                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                    LAYER 1: FSA + OPFS (File System)                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ DESKTOP (FSA)                  │ MOBILE/BROWSER (OPFS)               │  │
│  │ • Real files on disk           │ • SQLite WASM database              │  │
│  │ • FileSystemObserver watching  │ • FTS5 full-text search             │  │
│  │ • Bidirectional sync           │ • RAG embeddings                    │  │
│  │ • Handle persistence in IDB    │ • Notes metadata                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Layer Ownership Matrix

| Data Type | Layer | Technology | Persist? | Reactive Hook |
|-----------|-------|------------|----------|---------------|
| Panel open/closed | 4 | Zustand | ❌ NO | useStore + useShallow |
| Selected file | 4 | Zustand | ❌ NO | useStore + useShallow |
| Modal visibility | 4 | Zustand | ❌ NO | useStore |
| Current projectId | 4 | Zustand | ❌ NO | useStore |
| Active pluginId | 4 | Zustand | ❌ NO | useStore |
| Hover/focus states | 4 | Zustand | ❌ NO | useStore |
| Transient form data | 4 | Zustand | ❌ NO | useStore |
| Project metadata | 3 | Dexie | ✅ YES | useLiveQuery |
| Agent configurations | 3 | Dexie | ✅ YES | useLiveQuery |
| Conversation threads | 3 | Dexie | ✅ YES | useLiveQuery |
| Provider configs | 3 | Dexie | ✅ YES | useLiveQuery |
| User preferences | 3 | Dexie | ✅ YES | useLiveQuery |
| Layout preferences | 3 | Dexie | ✅ YES | useLiveQuery |
| Note content | 2 | IDB Blobs | ✅ YES | Custom hook |
| File attachments | 2 | IDB Blobs | ✅ YES | Custom hook |
| Project files | 1 | FSA/OPFS | ✅ YES | FileSystemObserver |
| RAG embeddings | 1 | SQLite WASM | ✅ YES | useLiveQuery |

---

## 2. Layer 4: Zustand UI State (NO PERSIST)

### 2.1 Core Principle

**Zustand stores MUST NOT persist domain data.** They exist purely for:
- UI state that resets on page reload
- Session context (what the user is currently viewing)
- Transient interactions (hover, focus, drag-drop)

### 2.2 Canonical Store Structure

```typescript
// ============================================================================
// @/infrastructure/persistence/stores/ui/panel-ui-store.ts
// ============================================================================

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

/**
 * Panel UI State - EPHEMERAL (no persist)
 * 
 * Manages panel visibility and selection state.
 * Resets to defaults on page reload.
 */
interface PanelUIState {
  // State
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  selectedPanelId: string | null;
  
  // Actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setSelectedPanel: (id: string | null) => void;
  resetPanels: () => void;
}

const DEFAULT_STATE = {
  leftPanelOpen: true,
  rightPanelOpen: false,
  bottomPanelOpen: false,
  selectedPanelId: null,
};

export const usePanelUIStore = create<PanelUIState>((set) => ({
  ...DEFAULT_STATE,
  
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setSelectedPanel: (id) => set({ selectedPanelId: id }),
  resetPanels: () => set(DEFAULT_STATE),
}));

// ============================================================================
// Selector Hooks (useShallow MANDATORY)
// ============================================================================

export function usePanelState() {
  return usePanelUIStore(
    useShallow((s) => ({
      leftPanelOpen: s.leftPanelOpen,
      rightPanelOpen: s.rightPanelOpen,
      bottomPanelOpen: s.bottomPanelOpen,
    }))
  );
}

export function usePanelActions() {
  return usePanelUIStore(
    useShallow((s) => ({
      toggleLeftPanel: s.toggleLeftPanel,
      toggleRightPanel: s.toggleRightPanel,
      toggleBottomPanel: s.toggleBottomPanel,
    }))
  );
}
```

### 2.3 Session Context Store (Special Case)

```typescript
// ============================================================================
// @/infrastructure/persistence/stores/ui/session-context-store.ts
// ============================================================================

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

/**
 * Session Context - EPHEMERAL (no persist)
 * 
 * Tracks what the user is currently viewing.
 * Acts as the "current focus" for the entire application.
 */
interface SessionContextState {
  // Current context
  currentProjectId: string | null;
  currentPluginId: string | null;
  currentFilePath: string | null;
  currentThreadId: string | null;
  
  // Navigation history (ephemeral)
  recentProjectIds: string[];
  recentFilePaths: string[];
  
  // Actions
  setCurrentProject: (id: string | null) => void;
  setCurrentPlugin: (id: string | null) => void;
  setCurrentFile: (path: string | null) => void;
  setCurrentThread: (id: string | null) => void;
  clearSession: () => void;
}

export const useSessionContextStore = create<SessionContextState>((set) => ({
  currentProjectId: null,
  currentPluginId: null,
  currentFilePath: null,
  currentThreadId: null,
  recentProjectIds: [],
  recentFilePaths: [],
  
  setCurrentProject: (id) => set((s) => ({
    currentProjectId: id,
    recentProjectIds: id 
      ? [id, ...s.recentProjectIds.filter(x => x !== id)].slice(0, 5)
      : s.recentProjectIds,
    // Reset file/thread when project changes
    currentFilePath: null,
    currentThreadId: null,
  })),
  
  setCurrentPlugin: (id) => set({ currentPluginId: id }),
  
  setCurrentFile: (path) => set((s) => ({
    currentFilePath: path,
    recentFilePaths: path 
      ? [path, ...s.recentFilePaths.filter(x => x !== path)].slice(0, 10)
      : s.recentFilePaths,
  })),
  
  setCurrentThread: (id) => set({ currentThreadId: id }),
  
  clearSession: () => set({
    currentProjectId: null,
    currentPluginId: null,
    currentFilePath: null,
    currentThreadId: null,
    recentProjectIds: [],
    recentFilePaths: [],
  }),
}));

// ============================================================================
// Selector Hooks
// ============================================================================

export function useCurrentProject() {
  return useSessionContextStore((s) => s.currentProjectId);
}

export function useCurrentPlugin() {
  return useSessionContextStore((s) => s.currentPluginId);
}

export function useCurrentFile() {
  return useSessionContextStore((s) => s.currentFilePath);
}

export function useSessionContext() {
  return useSessionContextStore(
    useShallow((s) => ({
      projectId: s.currentProjectId,
      pluginId: s.currentPluginId,
      filePath: s.currentFilePath,
      threadId: s.currentThreadId,
    }))
  );
}
```

### 2.4 Zustand Store Size Limits

| Store Category | Max Lines | Max Properties | Split Strategy |
|----------------|-----------|----------------|----------------|
| Feature store | 150 | 10 | Split by concern |
| UI store | 100 | 8 | Split by region |
| Session store | 80 | 6 | Single store only |

**If a store exceeds 150 lines → SPLIT IMMEDIATELY into slices.**

---

## 3. Layer 3: Dexie.js Persisted State (Source of Truth)

### 3.1 Core Principle

**Dexie.js is the SINGLE SOURCE OF TRUTH for all persistent data.** Domain entities, user preferences, and configuration MUST live here.

### 3.2 Canonical Dexie Schema

```typescript
// ============================================================================
// @/infrastructure/persistence/dexie-schema.ts
// ============================================================================

import Dexie, { type Table } from 'dexie';

/**
 * Project Alpha Database Schema v25
 * 
 * SCHEMA VERSIONING RULES:
 * 1. NEVER change primary keys (causes migration failure)
 * 2. Adding indexes = safe
 * 3. Adding columns = safe
 * 4. Removing columns = migration script required
 */
export class ProjectAlphaDB extends Dexie {
  // =========================================================================
  // Domain Entities (Layer 3)
  // =========================================================================
  projects!: Table<ProjectRecord, string>;
  agents!: Table<AgentRecord, string>;
  threads!: Table<ThreadRecord, string>;
  messages!: Table<MessageRecord, string>;
  providers!: Table<ProviderRecord, string>;
  
  // =========================================================================
  // User Preferences (Layer 3)
  // =========================================================================
  userPreferences!: Table<UserPreferenceRecord, string>;
  layoutPreferences!: Table<LayoutPreferenceRecord, string>;
  
  // =========================================================================
  // FSA Handles (Layer 1→3 bridge)
  // =========================================================================
  fsaHandles!: Table<FSAHandleRecord, string>;
  
  // =========================================================================
  // Sync State (Layer 2→3 bridge)
  // =========================================================================
  syncStatus!: Table<SyncStatusRecord, string>;
  fileMetadata!: Table<FileMetadataRecord, string>;

  constructor() {
    super('project-alpha');
    
    this.version(25).stores({
      // Domain Entities
      projects: 'id, name, lastOpened, storageType, [storageType+lastOpened]',
      agents: 'id, name, projectId, [projectId+name]',
      threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
      messages: 'id, threadId, createdAt, [threadId+createdAt]',
      providers: 'id, name, isDefault',
      
      // User Preferences
      userPreferences: 'key',
      layoutPreferences: 'projectId',
      
      // FSA Handles
      fsaHandles: 'projectId, permissionStatus',
      
      // Sync State
      syncStatus: 'id, path, syncStatus, updatedAt',
      fileMetadata: 'id, [projectId+path], lastModified',
    });
  }
}

// Singleton instance
export const db = new ProjectAlphaDB();
```

### 3.3 Type Definitions

```typescript
// ============================================================================
// @/domain/types/persistence-types.ts
// ============================================================================

export interface ProjectRecord {
  id: string;
  name: string;
  folderPath: string;
  storageType: 'fsa' | 'indexeddb';
  lastOpened: number;
  createdAt: number;
  autoSync: boolean;
  deleted?: boolean;
  deletedAt?: number;
}

export interface AgentRecord {
  id: string;
  name: string;
  projectId: string;
  description: string;
  tools: string[];
  permissions: AgentPermissions;
  createdAt: number;
  updatedAt: number;
}

export interface ThreadRecord {
  id: string;
  projectId: string;
  title: string;
  messageCount: number;
  contextTokens: number;
  createdAt: number;
  updatedAt: number;
  scrollPosition?: number;
}

export interface MessageRecord {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  createdAt: number;
}

export interface ProviderRecord {
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferenceRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

export interface LayoutPreferenceRecord {
  projectId: string;
  leftPlugins: string[];
  rightPlugins: string[];
  activeLeftPlugin: string | null;
  activeRightPlugin: string | null;
  sidebarWidth: number;
  hasUserCustomized: boolean;
  updatedAt: number;
}
```

### 3.4 useLiveQuery Patterns

```typescript
// ============================================================================
// @/presentation/hooks/useProjects.ts
// ============================================================================

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-schema';

/**
 * Reactive Projects Hook
 * 
 * Uses useLiveQuery for automatic reactivity.
 * No manual subscription or re-render management needed.
 */
export function useProjects(limit = 10) {
  return useLiveQuery(
    () => db.projects
      .where('deleted').notEqual(true)
      .orderBy('lastOpened')
      .reverse()
      .limit(limit)
      .toArray(),
    [limit],
    [] // Default value while loading
  );
}

export function useProject(projectId: string | null) {
  return useLiveQuery(
    () => projectId ? db.projects.get(projectId) : undefined,
    [projectId],
    undefined
  );
}

export function useProjectsByStorageType(storageType: 'fsa' | 'indexeddb') {
  return useLiveQuery(
    () => db.projects
      .where('storageType').equals(storageType)
      .toArray(),
    [storageType],
    []
  );
}
```

```typescript
// ============================================================================
// @/presentation/hooks/useThreads.ts
// ============================================================================

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-schema';

/**
 * Reactive Threads Hook
 * 
 * Returns threads for a project, sorted by most recent.
 */
export function useThreads(projectId: string | null) {
  return useLiveQuery(
    () => projectId 
      ? db.threads
          .where('projectId').equals(projectId)
          .reverse()
          .sortBy('updatedAt')
      : [],
    [projectId],
    []
  );
}

export function useThread(threadId: string | null) {
  return useLiveQuery(
    () => threadId ? db.threads.get(threadId) : undefined,
    [threadId],
    undefined
  );
}

export function useMessages(threadId: string | null, limit = 50) {
  return useLiveQuery(
    () => threadId
      ? db.messages
          .where('threadId').equals(threadId)
          .limit(limit)
          .sortBy('createdAt')
      : [],
    [threadId, limit],
    []
  );
}
```

---

## 4. Layer 2: IndexedDB Blobs (File Content)

### 4.1 Core Principle

**IndexedDB stores file CONTENT as blobs.** Metadata lives in Dexie (Layer 3), but the actual file bytes live here for offline access.

### 4.2 Blob Storage Pattern

```typescript
// ============================================================================
// @/infrastructure/persistence/blob-storage.ts
// ============================================================================

/**
 * Blob Storage for File Content
 * 
 * Stores actual file content (not metadata) in IndexedDB.
 * Used for offline access when FSA is unavailable.
 */
export interface BlobRecord {
  id: string;              // projectId + filePath hash
  projectId: string;
  filePath: string;
  content: Blob;
  mimeType: string;
  size: number;
  hash: string;            // Content hash for sync detection
  storedAt: number;
}

export async function storeBlob(record: Omit<BlobRecord, 'storedAt'>): Promise<void> {
  await db.idbFiles.put({
    ...record,
    storedAt: Date.now(),
  });
}

export async function getBlob(projectId: string, filePath: string): Promise<Blob | null> {
  const record = await db.idbFiles.get([projectId, filePath]);
  return record?.content ?? null;
}

export async function deleteBlob(projectId: string, filePath: string): Promise<void> {
  await db.idbFiles.delete([projectId, filePath]);
}

export async function clearProjectBlobs(projectId: string): Promise<number> {
  const records = await db.idbFiles.where('projectId').equals(projectId).toArray();
  await db.idbFiles.bulkDelete(records.map(r => r.id));
  return records.length;
}
```

---

## 5. Layer 1: FSA + OPFS (File System)

### 5.1 Storage Strategy Decision Tree

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STORAGE STRATEGY DECISION                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Platform Detection]                                                │
│         │                                                            │
│         ├──▶ Desktop + Chrome 122+ + User grants FSA permission     │
│         │         │                                                  │
│         │         └──▶ ✅ USE FSA (File System Access API)           │
│         │               • Real files on disk                         │
│         │               • FileSystemObserver for watching            │
│         │               • Bidirectional sync with external editors   │
│         │               • Handle stored in Dexie (Layer 3)          │
│         │                                                            │
│         ├──▶ Mobile / Tablet / No FSA permission                    │
│         │         │                                                  │
│         │         └──▶ ✅ USE OPFS + SQLite WASM                     │
│         │               • Private file system in browser            │
│         │               • wa-sqlite with OPFSCoopSyncVFS            │
│         │               • Multi-tab support                          │
│         │               • 7-day eviction (Safari) → PWA required    │
│         │                                                            │
│         └──▶ Browser fallback (no OPFS)                             │
│                   │                                                  │
│                   └──▶ ✅ USE IndexedDB (Layer 2)                    │
│                         • Dexie.js for structured data              │
│                         • Blob storage for file content              │
│                         • Limited to browser storage quota           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 FSA Storage Adapter

```typescript
// ============================================================================
// @/infrastructure/filesystem/fsa-storage-adapter.ts
// ============================================================================

import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';

/**
 * File System Access API Storage Adapter
 * 
 * Provides read/write access to real files on disk.
 * Requires user permission grant.
 */
export class FSAStorageAdapter implements StorageAdapter {
  private handle: FileSystemDirectoryHandle | null = null;
  
  async initialize(projectId: string): Promise<boolean> {
    // Restore handle from Dexie
    const stored = await db.fsaHandles.get(projectId);
    if (!stored) return false;
    
    this.handle = stored.handle as FileSystemDirectoryHandle;
    
    // Verify permission
    const permission = await this.handle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      const request = await this.handle.requestPermission({ mode: 'readwrite' });
      if (request !== 'granted') {
        await db.fsaHandles.update(projectId, { permissionStatus: 'denied' });
        return false;
      }
    }
    
    await db.fsaHandles.update(projectId, { 
      permissionStatus: 'granted',
      lastAccessedAt: Date.now(),
    });
    
    return true;
  }
  
  async readFile(path: string): Promise<string> {
    if (!this.handle) throw new Error('FSA not initialized');
    
    const file = await this.getFileHandle(path);
    const fileData = await file.getFile();
    return fileData.text();
  }
  
  async writeFile(path: string, content: string): Promise<void> {
    if (!this.handle) throw new Error('FSA not initialized');
    
    const file = await this.getFileHandle(path, { create: true });
    const writable = await file.createWritable();
    await writable.write(content);
    await writable.close();
  }
  
  async deleteFile(path: string): Promise<void> {
    if (!this.handle) throw new Error('FSA not initialized');
    
    const parts = path.split('/');
    const fileName = parts.pop()!;
    const dir = await this.getDirectoryHandle(parts.join('/'));
    await dir.removeEntry(fileName);
  }
  
  async listFiles(path: string): Promise<string[]> {
    if (!this.handle) throw new Error('FSA not initialized');
    
    const dir = await this.getDirectoryHandle(path);
    const entries: string[] = [];
    
    for await (const entry of dir.values()) {
      entries.push(entry.name);
    }
    
    return entries;
  }
  
  private async getFileHandle(
    path: string, 
    options?: FileSystemGetFileOptions
  ): Promise<FileSystemFileHandle> {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop()!;
    
    let current = this.handle!;
    for (const part of parts) {
      current = await current.getDirectoryHandle(part, { create: options?.create });
    }
    
    return current.getFileHandle(fileName, options);
  }
  
  private async getDirectoryHandle(path: string): Promise<FileSystemDirectoryHandle> {
    const parts = path.split('/').filter(Boolean);
    
    let current = this.handle!;
    for (const part of parts) {
      current = await current.getDirectoryHandle(part);
    }
    
    return current;
  }
}
```

---

## 6. State Flow Diagrams

### 6.1 Read Flow: Zustand → Dexie → UI

```
┌─────────────────────────────────────────────────────────────────────┐
│                         READ FLOW                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Component Mount]                                                   │
│         │                                                            │
│         ├──▶ useSessionContext()  ──▶ Zustand (Layer 4)             │
│         │         │                      └──▶ currentProjectId       │
│         │         │                                                  │
│         │         ▼                                                  │
│         ├──▶ useProject(projectId) ──▶ Dexie useLiveQuery (Layer 3) │
│         │         │                      └──▶ db.projects.get()      │
│         │         │                                                  │
│         │         ▼                                                  │
│         └──▶ Component renders with reactive data                   │
│                                                                      │
│  [Data Changes in Dexie]                                            │
│         │                                                            │
│         └──▶ useLiveQuery auto-triggers re-render                   │
│                   └──▶ No manual subscription needed                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Write Flow: Action → Zustand → Dexie

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WRITE FLOW                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [User Action: Create Project]                                       │
│         │                                                            │
│         ▼                                                            │
│  [Domain Service: ProjectService.create()]                          │
│         │                                                            │
│         ├──1──▶ Write to Dexie (Layer 3)                            │
│         │         db.projects.add(project)                          │
│         │                                                            │
│         ├──2──▶ Update Zustand session (Layer 4)                    │
│         │         setCurrentProject(project.id)                     │
│         │                                                            │
│         └──3──▶ useLiveQuery auto-triggers re-render                │
│                   All components using useProjects() update         │
│                                                                      │
│  [Key Principle]                                                     │
│  • Dexie is written FIRST (source of truth)                         │
│  • Zustand is updated SECOND (UI context)                           │
│  • useLiveQuery provides reactivity (no manual sync)                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 File Sync Flow: FSA → Layer 2 → Layer 3

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FILE SYNC FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [FileSystemObserver detects change]                                │
│         │                                                            │
│         ▼                                                            │
│  [SyncEngine.handleFileChange()]                                    │
│         │                                                            │
│         ├──1──▶ Read file from FSA (Layer 1)                        │
│         │         const content = await fsa.readFile(path)          │
│         │                                                            │
│         ├──2──▶ Update metadata in Dexie (Layer 3)                  │
│         │         db.fileMetadata.put({ path, mtime, hash })        │
│         │                                                            │
│         ├──3──▶ Store blob in IndexedDB (Layer 2) [optional]        │
│         │         db.idbFiles.put({ path, content: blob })          │
│         │                                                            │
│         └──4──▶ Emit event via EventBus                             │
│                   eventBus.emit({ type: 'FILE_UPDATED', path })     │
│                                                                      │
│  [Monaco/Notes Plugin receives event]                               │
│         │                                                            │
│         └──▶ Refresh if file is currently open                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Anti-Patterns (FORBIDDEN)

### 7.1 ❌ Domain Data in Zustand with Persist

```typescript
// ❌ WRONG: Domain data (projects) in Zustand with persist
const useProjectStore = create(
  persist(
    (set) => ({
      projects: [],  // This is domain data!
      addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
    }),
    { name: 'projects' }
  )
);

// ✅ CORRECT: Domain data in Dexie
const projects = useLiveQuery(() => db.projects.toArray());

async function addProject(project: ProjectRecord) {
  await db.projects.add(project);
  // useLiveQuery automatically triggers re-render
}
```

### 7.2 ❌ Missing useShallow for Multi-Property Selectors

```typescript
// ❌ WRONG: Returns new object reference every render
const { items, addItem } = useStore((s) => ({
  items: s.items,
  addItem: s.addItem,
}));
// ↑ Causes infinite re-renders!

// ✅ CORRECT: useShallow for shallow comparison
const { items, addItem } = useStore(
  useShallow((s) => ({
    items: s.items,
    addItem: s.addItem,
  }))
);
```

### 7.3 ❌ Inline Computation in Selectors

```typescript
// ❌ WRONG: Inline computation creates new reference every time
const filtered = useStore((s) => s.items.filter((x) => x.active));
// ↑ filter() returns new array every call!

// ✅ CORRECT: Compute outside or memoize
const items = useStore((s) => s.items);
const filtered = useMemo(() => items.filter((x) => x.active), [items]);
```

### 7.4 ❌ Direct Dexie Access Without useLiveQuery

```typescript
// ❌ WRONG: Direct access loses reactivity
useEffect(() => {
  db.projects.toArray().then(setProjects);
}, []);
// ↑ Won't update when data changes!

// ✅ CORRECT: useLiveQuery for reactivity
const projects = useLiveQuery(() => db.projects.toArray());
```

### 7.5 ❌ UI State Persisted Unnecessarily

```typescript
// ❌ WRONG: Persisting UI state that should reset
const useModalStore = create(
  persist(
    (set) => ({
      isOpen: false,  // This should NOT persist!
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: 'modal-state' }
  )
);

// ✅ CORRECT: UI state without persist
const useModalStore = create((set) => ({
  isOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
```

---

## 8. Boundary Rules (NON-NEGOTIABLE)

### 8.1 The 5 Commandments

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | **Zustand NO persist for domain data** | Lint rule + code review |
| 2 | **useShallow for ALL multi-property selectors** | ESLint custom rule |
| 3 | **useLiveQuery for ALL Dexie reads in components** | Code review |
| 4 | **Dexie write BEFORE Zustand update** | Architecture pattern |
| 5 | **File operations MUST go through SyncEngine** | Import restrictions |

### 8.2 Import Restrictions

```typescript
// ============================================================================
// ALLOWED IMPORTS BY LAYER
// ============================================================================

// Layer 4 (Zustand) can import from:
// ✅ @/domain/types/*
// ✅ @/domain/interfaces/*
// ❌ @/infrastructure/persistence/dexie-*  (use hooks instead)

// Layer 3 (Dexie Hooks) can import from:
// ✅ @/infrastructure/persistence/dexie-*
// ✅ @/domain/types/*
// ❌ @/infrastructure/persistence/stores/*  (no Zustand in Dexie hooks)

// Components can import from:
// ✅ @/presentation/hooks/*  (wrapper hooks)
// ✅ @/infrastructure/persistence/stores/ui/*  (Zustand UI stores)
// ❌ @/infrastructure/persistence/dexie-*  (use hooks instead)
```

### 8.3 Store Naming Conventions

| Store Type | Naming Pattern | Example |
|------------|----------------|---------|
| UI State | `use{Feature}UIStore` | `usePanelUIStore` |
| Session Context | `useSessionContextStore` | Singleton |
| Domain Hook (Dexie) | `use{Entity}s` | `useProjects`, `useThreads` |
| Action Hook | `use{Feature}Actions` | `useProjectActions` |

---

## 9. Migration Checklist

### 9.1 Phase 1: Audit Current Stores

- [ ] Identify all stores using `persist` middleware
- [ ] Classify each as UI, Session, or Domain data
- [ ] Flag persist violations (domain data with persist)

### 9.2 Phase 2: Create Dexie Schema

- [ ] Define all domain entity tables
- [ ] Create useLiveQuery hooks for each entity
- [ ] Add migration scripts for existing data

### 9.3 Phase 3: Migrate Domain Data

- [ ] Remove persist from domain stores
- [ ] Replace store reads with useLiveQuery
- [ ] Update writes to go through Dexie first

### 9.4 Phase 4: Add useShallow

- [ ] Audit all Zustand selectors
- [ ] Add useShallow to multi-property selectors
- [ ] Add ESLint rule to enforce

### 9.5 Phase 5: Validate

- [ ] Run `pnpm typecheck:fast`
- [ ] Run `pnpm test:fast`
- [ ] Run `pnpm governance`
- [ ] Manual QA for reactivity

---

## 10. Success Metrics

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| Stores with persist | 51 (83%) | <10 (16%) | Lint check |
| Domain data in Zustand | ~25 | 0 | Code review |
| Missing useShallow | 56 (69%) | <5 (6%) | ESLint rule |
| God stores (>300 lines) | 17 | <5 | File size check |
| useLiveQuery adoption | ~10% | 100% | Grep analysis |

---

**Document Status**: HYPOTHESIS - Awaiting validation
**Next Steps**: Review with team, iterate based on feedback, then create implementation stories

---

*Generated by architect-ext on 2026-01-30*
