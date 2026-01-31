# Sync Patterns

**Created:** 2026-01-31
**Phase:** 01 - State Architecture Contracts
**Plan:** 02 - Data Flow Contracts

---

## Purpose

This document defines the **synchronization patterns** for Project Alpha's dual storage system. It establishes how data flows between:
- Real file system (FSA on desktop)
- Virtual file system (IndexedDB on mobile)
- Cross-layer synchronization (Dexie ↔ Zustand ↔ UI)

---

## Storage System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Project Alpha Storage                    │
├─────────────────────────────┬───────────────────────────────┤
│       Desktop (FSA)         │      Mobile (IndexedDB)       │
├─────────────────────────────┼───────────────────────────────┤
│  Real files on disk         │  Virtual files in browser     │
│  Bidirectional sync         │  Single source of truth       │
│  External editor support    │  Offline-first                │
│  Handle persistence in IDB  │  No sync conflicts            │
└─────────────────────────────┴───────────────────────────────┘
```

---

## Section 1: Desktop (FSA) Sync Pattern

### Source of Truth
**File System Access API (FSA)** is the source of truth for file content on desktop.

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Desktop Storage Stack                     │
├──────────────────────────────────────────────────────────────┤
│  Layer 4: FSA (Real Files)                                   │
│    └── Actual source code, markdown, assets                  │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: IndexedDB (Handles + Cache)                        │
│    ├── FileSystemFileHandle persistence                      │
│    ├── File metadata cache                                   │
│    └── Last-known content for offline                        │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: StorageGateway                                     │
│    └── Unified API for file operations                       │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: Plugins (Monaco, Notes, FileTree)                  │
│    └── UI components consuming file content                  │
└──────────────────────────────────────────────────────────────┘
```

### Handle Persistence

FSA file handles are stored in IndexedDB to survive browser restarts:

```typescript
// Store handle on project open
await db.fileHandles.put({
  projectId,
  path: relativePath,
  handle: fileSystemFileHandle, // IDB can store handles
  lastAccessed: Date.now()
});

// Restore handle on project load
const record = await db.fileHandles.get({ projectId, path });
if (record?.handle) {
  // Verify permission still valid
  const permission = await record.handle.queryPermission({ mode: 'readwrite' });
  if (permission === 'granted') {
    return record.handle;
  } else {
    // Request permission again
    await record.handle.requestPermission({ mode: 'readwrite' });
  }
}
```

### Sync Triggers

| Trigger | Action | Direction |
|---------|--------|-----------|
| **Project open** | Scan directory, cache metadata | FSA → IDB |
| **File save** | Write to FSA, update cache | IDB → FSA |
| **File change detected** | Read FSA, update cache | FSA → IDB |
| **External edit (polling)** | Compare mtime, refresh | FSA → IDB |
| **FileSystemObserver event** | Immediate refresh | FSA → IDB |

### External Edit Detection

```typescript
// Polling fallback (Chrome < 129)
const checkExternalChanges = async () => {
  const files = await db.fileMetadata.where('projectId').equals(projectId).toArray();
  
  for (const file of files) {
    const handle = await getHandle(file.path);
    const fsFile = await handle.getFile();
    
    if (fsFile.lastModified > file.lastModified) {
      // External change detected
      eventBus.emit('file:external-change', { 
        path: file.path, 
        newMtime: fsFile.lastModified 
      });
      
      // Update cache
      await db.fileMetadata.update(file.id, {
        lastModified: fsFile.lastModified,
        size: fsFile.size
      });
    }
  }
};

// FileSystemObserver (Chrome 129+)
const observer = new FileSystemObserver(async (records) => {
  for (const record of records) {
    if (record.type === 'modified') {
      eventBus.emit('file:external-change', { 
        path: record.relativePathComponents.join('/') 
      });
    }
  }
});
await observer.observe(directoryHandle, { recursive: true });
```

### Snapshot Strategy for Fast Load

On project switch, use cached metadata to render FileTree immediately:

```typescript
// Phase 1: Render from cache (instant)
const cachedFiles = await db.fileMetadata
  .where('projectId').equals(projectId)
  .toArray();
setFileTree(buildTree(cachedFiles));

// Phase 2: Verify in background (non-blocking)
setTimeout(async () => {
  const freshFiles = await scanDirectory(directoryHandle);
  const diff = compareFileLists(cachedFiles, freshFiles);
  
  if (diff.hasChanges) {
    // Update cache and re-render only changed items
    await applyDiff(diff);
  }
}, 100);
```

---

## Section 2: Non-Desktop (IndexedDB) Sync Pattern

### Source of Truth
**Dexie.js (IndexedDB)** is the single source of truth for everything on mobile/tablet.

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Mobile Storage Stack                       │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: Dexie.js (IndexedDB)                               │
│    ├── projects: Project metadata                            │
│    ├── fileContents: Virtual file content                    │
│    ├── threads: Conversation history                         │
│    └── settings: User preferences                            │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: StorageGateway (IDB variant)                       │
│    └── Same API as FSA gateway                               │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: Plugins (Notes, Chat, FileTree)                    │
│    └── UI components consuming data                          │
└──────────────────────────────────────────────────────────────┘
```

### No Sync Needed

Since IndexedDB is the single source, there's no synchronization:

```typescript
// Read: Direct Dexie query
const content = await db.fileContents.get({ projectId, path });

// Write: Direct Dexie update
await db.fileContents.put({
  projectId,
  path,
  content,
  lastModified: Date.now()
});

// Reactivity: useLiveQuery handles updates
const files = useLiveQuery(
  () => db.fileContents.where('projectId').equals(projectId).toArray()
);
```

### Offline-First by Default

All data is local. No network required for basic operations:

| Operation | Network Required | Fallback |
|-----------|------------------|----------|
| Create note | No | N/A |
| Edit note | No | N/A |
| Delete note | No | N/A |
| Search notes | No | N/A |
| AI chat | Yes | Show offline indicator |
| RAG indexing | Local SQLite | N/A |

### Safari iOS 7-Day Eviction

**CRITICAL:** Safari evicts IndexedDB after 7 days of no use.

**Mitigations:**
1. Require PWA installation (PWA apps are NOT subject to eviction)
2. Show "Add to Home Screen" banner with explanation
3. Implement re-sync detection on first launch

```typescript
// Detect potential data loss
const checkDataIntegrity = async () => {
  const projectCount = await db.projects.count();
  const lastKnownCount = localStorage.getItem('lastProjectCount');
  
  if (lastKnownCount && projectCount < parseInt(lastKnownCount)) {
    // Data may have been evicted
    showDataRecoveryDialog();
  }
  
  localStorage.setItem('lastProjectCount', projectCount.toString());
};
```

---

## Section 3: Cross-Layer Sync

### Zustand ↔ Dexie Hydration

Session state in Zustand is hydrated from Dexie on mount:

```typescript
// Store definition (NO persist middleware)
const useProjectStore = create<ProjectStore>((set) => ({
  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id }),
}));

// Hydration in root component
useEffect(() => {
  const hydrate = async () => {
    const lastProject = await db.projects
      .orderBy('lastAccessed')
      .reverse()
      .first();
    
    if (lastProject) {
      useProjectStore.getState().setActiveProject(lastProject.id);
    }
  };
  
  hydrate();
}, []);
```

### Dexie → UI Reactivity

Use `useLiveQuery()` for reactive data binding:

```typescript
// ✅ CORRECT: Reactive reads
const projects = useLiveQuery(
  () => db.projects.orderBy('lastAccessed').reverse().toArray(),
  [] // dependencies
);

// Component automatically re-renders when projects table changes
return (
  <ul>
    {projects?.map(p => <li key={p.id}>{p.name}</li>)}
  </ul>
);
```

### FSA → Event Bus → UI

File changes propagate via events:

```typescript
// Gateway emits event after write
await adapter.writeFile(path, content);
eventBus.emit('file:changed', { path, changeType: 'modified' });

// FileTree subscribes
useEffect(() => {
  const unsubscribe = eventBus.on('file:changed', ({ path }) => {
    // Refresh specific node
    refreshNode(path);
  });
  return unsubscribe;
}, []);

// Monaco subscribes for open files
useEffect(() => {
  const unsubscribe = eventBus.on('file:changed', ({ path }) => {
    if (isFileOpen(path)) {
      // Show "file changed externally" notification
      showExternalChangeNotification(path);
    }
  });
  return unsubscribe;
}, [openFiles]);
```

---

## Section 4: Conflict Resolution

### Strategy Overview

| Data Type | Strategy | Rationale |
|-----------|----------|-----------|
| UI state | Last-write-wins | Transient, no harm |
| Project settings | Last-write-wins | Low frequency |
| File content | Timestamp-based | Preserve newest |
| Thread messages | Append-only | Never overwrite |

### Last-Write-Wins (UI State)

For transient UI state, latest value always wins:

```typescript
// Multiple panels updating selection
// No conflict resolution needed - just update
useLayoutStore.setState({ selectedPanel: 'left' });
```

### Timestamp-Based (File Content)

For files, compare timestamps to resolve conflicts:

```typescript
interface FileConflict {
  path: string;
  localContent: string;
  localMtime: number;
  remoteContent: string;
  remoteMtime: number;
}

const resolveFileConflict = async (conflict: FileConflict) => {
  if (conflict.remoteMtime > conflict.localMtime) {
    // Remote is newer, use it
    await updateLocal(conflict.path, conflict.remoteContent);
    return 'remote';
  } else if (conflict.localMtime > conflict.remoteMtime) {
    // Local is newer, keep it
    return 'local';
  } else {
    // Same timestamp, show diff dialog
    return await showMergeDialog(conflict);
  }
};
```

### Append-Only (Thread Messages)

Messages are never overwritten:

```typescript
// New message always appends
await db.messages.add({
  id: generateId(),
  threadId,
  role: 'user',
  content,
  createdAt: Date.now()
});

// Editing creates new version, keeps original
await db.messages.update(messageId, {
  content: newContent,
  editedAt: Date.now(),
  originalContent: oldContent
});
```

---

## Section 5: Sync Mechanism Selection Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│           "Where should this data sync happen?"             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  Is it UI-only state?         │
              │  (selection, hover, focus)    │
              └───────────────────────────────┘
                     │                │
                    YES               NO
                     │                │
                     ▼                ▼
         ┌────────────────┐  ┌───────────────────────────┐
         │ Zustand store  │  │ Does it need persistence? │
         │ (NO persist)   │  │ (survives refresh)        │
         └────────────────┘  └───────────────────────────┘
                                    │              │
                                   YES             NO
                                    │              │
                                    ▼              ▼
              ┌─────────────────────────┐  ┌────────────────────┐
              │ Is it file content?     │  │ Zustand + Hydration│
              └─────────────────────────┘  │ (session state)    │
                     │             │       └────────────────────┘
                    YES            NO
                     │             │
                     ▼             ▼
         ┌────────────────┐  ┌────────────────┐
         │ StorageGateway │  │ Dexie.js       │
         │ + Event Bus    │  │ + useLiveQuery │
         └────────────────┘  └────────────────┘
```

### Quick Reference

| Scenario | Mechanism | Example |
|----------|-----------|---------|
| Panel is resizing | Zustand (UI) | `usePanelStore` |
| User selects file | Zustand (UI) | `selectedPath` state |
| Project loads | Zustand + Hydration | `activeProjectId` |
| Layout preference | Dexie + useLiveQuery | `pluginLayout` |
| File content read | Gateway → FSA/IDB | `projectContext.readFile()` |
| File content write | Gateway → Event Bus | `projectContext.saveFile()` |
| Chat message | Dexie + useLiveQuery | `messages` table |
| Settings change | Dexie + useLiveQuery | `settings` table |

---

## Anti-Patterns

### ❌ DO NOT: Duplicate data across layers

```typescript
// ❌ WRONG: Storing projects in both Zustand persist AND Dexie
const useProjectStore = create(
  persist((set) => ({
    projects: [] // Duplicates Dexie!
  }))
);

// ✅ CORRECT: Dexie is source, Zustand only for active reference
const useProjectStore = create((set) => ({
  activeProjectId: null // Just a reference
}));
```

### ❌ DO NOT: Poll when events are available

```typescript
// ❌ WRONG: Polling for file changes
setInterval(async () => {
  const files = await readAllFiles();
  setFileTree(files);
}, 1000);

// ✅ CORRECT: Subscribe to events
eventBus.on('file:changed', refreshFileTree);
```

### ❌ DO NOT: Skip the gateway for file ops

```typescript
// ❌ WRONG: Direct FSA access
const handle = await window.showOpenFilePicker();
const file = await handle.getFile();
const content = await file.text();

// ✅ CORRECT: Go through gateway
const content = await projectContext.readFile(path);
```

### ❌ DO NOT: Use Zustand persist for Dexie data

```typescript
// ❌ WRONG: Persisting what Dexie owns
create(persist((set) => ({
  preferences: {} // Should be in Dexie!
})));

// ✅ CORRECT: Use useLiveQuery
const preferences = useLiveQuery(() => 
  db.settings.get('preferences')
);
```

---

*Sync Patterns: 2026-01-31*
*Phase: 01-state-architecture-contracts*
*Plan: 02*
