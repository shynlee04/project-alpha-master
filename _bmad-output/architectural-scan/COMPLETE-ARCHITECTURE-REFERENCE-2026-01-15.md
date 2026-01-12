# PROJECT SPACE ARCHITECTURE - COMPLETE REFERENCE DOCUMENT

**Generated**: 2026-01-15  
**Purpose**: Single source of truth for architectural decisions  
**Scope**: Entry points, routing, state persistence, CRUD permissions, boundaries

---

# TABLE OF CONTENTS

1. [Route Files & Entry Points](#1-route-files--entry-points)
2. [Routing Logic Flow](#2-routing-logic-flow)
3. [Storage Type Determination](#3-storage-type-determination)
4. [State Persistence Layers](#4-state-persistence-layers)
5. [CRUD Permissions Matrix](#5-crud-permissions-matrix)
6. [Architectural Problems](#6-architectural-problems)
7. [File Dependency Map](#7-file-dependency-map)

---

# 1. ROUTE FILES & ENTRY POINTS

## 1.1 All Route Files

```
src/routes/
├── index.tsx                          # Root route - redirects to /hub
├── hub.tsx                            # Main landing with boot sequence
├── projects.tsx                       # Full project management
├── ide.tsx                            # IDE workspace selector
├── ide.$projectId.tsx                 # IDE with specific project
├── notes.lazy.tsx                     # Notes browser mode
├── notes.$projectId.lazy.tsx          # Notes with project
├── study.lazy.tsx                     # Study workspace (Phase 2)
├── study.$projectId.lazy.tsx          # Study with project (Phase 2)
├── knowledge.lazy.tsx                 # Knowledge workspace (Phase 2)
├── knowledge.$projectId.lazy.tsx      # Knowledge with project (Phase 2)
└── workspace/
    ├── index.tsx                      # Legacy no-project landing
    └── $projectId.tsx                 # Legacy workspace route
```

## 1.2 Route Behavior Matrix

| Route | Has projectId? | Storage Type | Default Content | Mobile Support |
|-------|----------------|--------------|-----------------|----------------|
| `/` | No | N/A | Redirects to /hub | ✅ |
| `/hub` | No | N/A | Dashboard, no project | ✅ |
| `/projects` | No | N/A | Project list | ✅ |
| `/ide` | No | Selector shown | Shows 3 options | ✅ (limited) |
| `/ide/$projectId` | Yes | fsa/idb | IDE layout | ✅ (no WebContainer) |
| `/notes` | No | indexeddb | Creates notes:browser-mode + default_note | ✅ |
| `/notes/$projectId` | Yes | fsa/idb | Notes editor | ✅ |
| `/study` | No | N/A | Placeholder | ✅ |
| `/study/$projectId` | Yes | fsa/idb | Placeholder | ✅ |
| `/knowledge` | No | N/A | Placeholder | ✅ |
| `/knowledge/$projectId` | Yes | fsa/idb | Placeholder | ✅ |

## 1.3 Exact Route Handler Functions

### `/ide/$projectId` Handler (src/routes/ide.$projectId.tsx)

```typescript
// Lines ~71-78: Project restoration logic
if (restoredProject?.storageType === 'fsa' && !restoredProject.fsaHandle) {
  await projectStore.restoreProjectHandle(_projectId);
}

// Lines ~85-92: Adapter creation
const adapter = createStorageAdapter({
  storageType: restoredProject.storageType,
  projectId: restoredProject.id,
  fsaHandle: restoredProject.fsaHandle,
});

// Lines ~95-105: SyncManager creation
const syncManager = new SyncManager(adapter, {
  onProgress: (progress) => setSyncProgress(progress),
  onError: (error) => setSyncError(error.message),
  onComplete: (result) => handleSyncComplete(result),
});

// Lines ~115-130: WebContainer mounting (FSA only)
if (restoredProject.storageType === 'fsa' && webContainerBooted) {
  await syncManager.syncToWebContainer();
}
```

### `/notes` Handler (src/routes/notes.lazy.tsx:76-118)

```typescript
// Auto-create browser-mode project if not exists
const browserModeProjectId = 'notes:browser-mode';
const existingProject = await getProject(browserModeProjectId);

if (!existingProject) {
  const newProject = {
    id: browserModeProjectId,
    name: 'Browser Mode',
    folderPath: 'Notes',
    storageType: 'indexeddb',
    isBrowserMode: true,
    autoCreated: true,
  } as Project;
  await createProject(newProject);
}

// Auto-create default_note
const defaultNoteId = await createNote({
  title: 'Welcome to Notes',
  content: [{ type: 'paragraph', content: 'Welcome to your notes...' }],
  projectId: browserModeProjectId,
});

// Redirect to project-specific route
navigate({ to: '/notes/$projectId', params: { projectId: browserModeProjectId } });
```

### `/hub` Handler (src/presentation/components/hub/HubHomePage.tsx:81-95)

```typescript
useEffect(() => {
  if (workspace) {
    // User clicked a workspace card from dashboard
    setProjectPickerWorkspace(workspace);
    setProjectPickerOpen(true);
  } else if (action === 'create-project') {
    // User clicked "Create Project" card
    setProjectCreationWizardOpen(true);
  }
}, [workspace, action, message]);
```

---

# 2. ROUTING LOGIC FLOW

## 2.1 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ROUTING DECISION TREE                              │
└─────────────────────────────────────────────────────────────────────────────┘

USER ENTERS URL
        │
        ▼
┌───────────────────────────┐
│ Extract route + params    │
│                           │
│ /hub → route='hub'        │
│ /ide/$id → route='ide'    │
│ /notes → route='notes'    │
│ etc.                      │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ Route-specific loader     │──▶ See section 1.3
└───────────┬───────────────┘
            │
            ▼
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌─────────┐
│ Has    │    │  No     │
│project │    │ project │
│  id?   │    │   id?   │
└───┬────┘    └────┬────┘
    │              │
    │              ▼
    │    ┌─────────────────────────┐
    │    │ Show selector/UI        │
    │    │ - /ide: 3 options       │
    │    │ - /hub: Dashboard       │
    │    │ - /notes: Auto-create   │
    │    └───────────┬─────────────┘
    │                │
    │                ▼
    │    ┌─────────────────────────┐
    │    │ User selects/creates    │
    │    │                         │
    │    │ - Select folder → FSA   │
    │    │ - Quick IDE → IDB temp  │
    │    │ - Create project → FSA  │
    │    └───────────┬─────────────┘
    │                │
    │                ▼
    │    ┌─────────────────────────┐
    │    │ Navigate with projectId │
    │    │ → /ide/$id              │
    │    │ → /notes/$id            │
    │    └───────────┬─────────────┘
    │                │
    └──────┬─────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│              IDELOADER LOGIC                 │
│ ┌────────────────────────────────────────┐   │
│ │ 1. fetchProject($projectId)            │   │
│ │    ↓                                   │   │
│ │ 2. NOT FOUND → error "Project not      │   │
│ │    found"                              │   │
│ │    ↓                                   │   │
│ │ 3. Check storageType:                  │   │
│ │    ├── 'fsa':                          │   │
│ │    │   └── restoreProjectHandle()      │   │
│ │    └── 'indexeddb':                    │   │
│ │        └── use IDBAdapter              │   │
│ │    ↓                                   │   │
│ │ 4. adapter = createStorageAdapter({    │   │
│ │    storageType, projectId, fsaHandle   │   │
│ │    })                                  │   │
│ │    ↓                                   │   │
│ │ 5. syncManager = new SyncManager(      │   │
│ │    adapter, callbacks)                 │   │
│ │    ↓                                   │   │
│ │ 6. IF FSA + webContainerBooted:        │   │
│ │    └── syncManager.syncToWebContainer()│   │
│ │    ↓                                   │   │
│ │ 7. Render IDELayout                    │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

## 2.2 Project Selection Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROJECT PICKER INTERACTION                               │
└─────────────────────────────────────────────────────────────────────────────┘

User clicks workspace card on /hub (e.g., "IDE")
        │
        ▼
HubHomePage detects ?workspace=ide query param
        │
        ▼
Opens ProjectPickerDialog with workspace='ide' filter
        │
        ┌────────────────────┐
        │                    │
        ▼                    ▼
┌──────────────────┐  ┌──────────────────────────┐
│ "Select Existing"│  │ "Create New Project"     │
│                  │  │                          │
│ Lists projects   │  │ Opens ProjectCreation    │
│ with workspaceId │  │ Wizard                   │
│ = 'ide'          │  │                          │
│                  │  │ Step 1: New Project      │
│ User selects:    │  │ → handleNewProject()     │
│ → navigate to    │  │ → showDirectoryPicker()  │
│   /ide/$projectId│  │ → createProject()        │
│                  │  │ → navigate /ide/$projectId│
└──────────────────┘  └──────────────────────────┘
```

---

# 3. STORAGE TYPE DETERMINATION

## 3.1 Decision Points

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STORAGE TYPE DECISION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

PROJECT CREATION
        │
        ▼
┌──────────────────────────────────────────┐
│ What triggered creation?                 │
└────────────┬─────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────┐  ┌─────────────────┐
│ FSA Picker  │  │ Auto-created    │
│ (showDirectory│  │ (Quick IDE,    │
│ Picker())    │  │ Browser Mode)  │
└──────┬──────┘  └────────┬────────┘
       │                  │
       ▼                  ▼
┌─────────────┐  ┌─────────────────┐
│ User selects│  │ System decides  │
│ folder      │  │ based on:       │
└──────┬──────┘  │ - Mobile → IDB  │
       │         │ - Quick IDE → IDB│
       ▼         │ - Browser Mode→ │
┌─────────────┐  │   IDB          │
│ storageType │  └────────┬────────┘
│ = 'fsa'     │           │
└──────┬──────┘           │
       │                  ▼
       │         ┌─────────────────┐
       │         │ storageType     │
       │         │ = 'indexeddb'   │
       │         └─────────────────┘
       ▼
┌──────────────────────────────────────────┐
│ Store in Dexie 'projects' table:         │
│ {                                       │
│   id: UUID,                             │
│   name: "My Project",                   │
│   storageType: "fsa",                   │
│   fsaHandle: DirectoryHandle,           │
│   createdAt: timestamp,                 │
│   ...                                   │
│ }                                       │
└──────────────────────────────────────────┘
```

## 3.2 Platform Detection (src/lib/utils/platform-detection.ts)

```typescript
function detectPlatformType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const screenWidth = window.screen.width;
  
  if (hasTouch && screenWidth < 768) return 'mobile';
  if (hasTouch && screenWidth >= 768 && screenWidth < 1024) return 'tablet';
  if (!hasTouch || screenWidth >= 1024) return 'desktop';
  return 'unknown';
}

function isDesktopPlatform(): boolean {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasLargeScreen = window.screen.width >= 1024;
  const isMobileUA = /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent);
  return !hasTouch || (hasLargeScreen && !isMobileUA);
}
```

## 3.3 Storage Type by Scenario

| Scenario | Trigger | Storage Type | Reason |
|----------|---------|--------------|--------|
| Desktop user creates project | showDirectoryPicker() | 'fsa' | User selected folder |
| Desktop user clicks "Quick IDE" | getOrCreateTempProject() | 'indexeddb' | No folder selected |
| Mobile user creates project | N/A (disabled) | 'indexeddb' | No FSA on mobile |
| Notes browser mode entry | Auto-create | 'indexeddb' | No folder concept |
| Direct /ide/$fsaProjectId | fetchProject() | 'fsa' | Project stored as FSA |
| Direct /ide/$idbProjectId | fetchProject() | 'indexeddb' | Project stored as IDB |

## 3.4 Adapter Factory (src/infrastructure/sync/adapters/adapter-factory.ts)

```typescript
export function createStorageAdapter(options: CreateAdapterOptions): StorageAdapter {
  const { storageType, projectId, fsaHandle, debug = false } = options;

  if (storageType === 'indexeddb') {
    return new IDBAdapter({
      projectId,
      databaseName: 'via-gent-persistence',
      tableName: 'syncFileContent',
      quotaThreshold: 0.9,
      evictionPolicy: 'least-recently-used',
      debug,
    });
  }

  // FSA adapter
  const adapter = new FSAAdapter({ debug });
  if (fsaHandle) {
    void adapter.mount(fsaHandle);
  }
  return adapter;
}
```

---

# 4. STATE PERSISTENCE LAYERS

## 4.1 Persistence Layer Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STATE PERSISTENCE HIERARCHY                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                    RUNTIME STATE (In-Memory)                            │
│                                                                    │
│  Zustand Stores (src/infrastructure/persistence/stores/):            │
│  ├── useAppStore.ts                                                  │
│  │   └── Persistence: Dexie (providerConfigs table)                  │
│  ├── useIDEStore.ts                                                  │
│  │   └── Persistence: Custom adapter → ideState table                │
│  ├── useConversationStore.ts                                         │
│  │   └── Persistence: Dexie + debounced write                        │
│  ├── useProjectStore.ts ⚠️ IN-MEMORY ONLY                            │
│  │   └── Persistence: NONE - LOSES STATE ON RELOAD!                  │
│  ├── useFileSyncStatusStore.ts                                       │
│  │   └── Persistence: Dexie (fileSyncStatus table)                   │
│  └── useEditorTabsStore.ts                                           │
│      └── Persistence: Dexie (providerConfigs table - WRONG!)          │
│                                                                    │
└────────────────────────────────────────────────────────────────────────┘
         │ persist() middleware
         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    DEXIE PERSISTENCE (IndexedDB)                       │
│                                                                    │
│  ViaGentDatabase (Main DB):                                           │
│  ├── projects (PRIMARY KEY: id)                                       │
│  ├── ideState (PRIMARY KEY: projectId)                                │
│  ├── conversations (PRIMARY KEY: id)                                  │
│  ├── threads (PRIMARY KEY: id)                                        │
│  ├── sources (PRIMARY KEY: id)                                        │
│  ├── collections (PRIMARY KEY: id)                                    │
│  ├── syncStatus (PRIMARY KEY: id)                                     │
│  ├── fsaHandles (PRIMARY KEY: projectId, workspaceId)                 │
│  ├── sessions (PRIMARY KEY: id)                                       │
│  ├── fileMetadata (PRIMARY KEY: id)                                   │
│  ├── toolExecutionLogs (PRIMARY KEY: id)                              │
│  └── ... (25+ tables)                                                 │
│                                                                    │
│  FlashcardDatabase (Separate DB):                                     │
│  ├── flashcards (PRIMARY KEY: id)                                     │
│  ├── flashcardSets (PRIMARY KEY: id)                                  │
│  └── ...                                                             │
│                                                                    │
│  StudyDatabase (Separate DB):                                         │
│  ├── studySessions (PRIMARY KEY: id)                                  │
│  ├── studyCards (PRIMARY KEY: id)                                     │
│  └── ...                                                             │
│                                                                    │
└────────────────────────────────────────────────────────────────────────┘
         │
         │ File System Access API
         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    FILE SYSTEM (Desktop Only)                          │
│                                                                    │
│  User-selected folder (FSA):                                          │
│  ├── /project-folder/                                                │
│  │   ├── src/ (WebContainer syncs here)                              │
│  │   ├── notes/ (Notes workspace files)                              │
│  │   └── ...                                                         │
│  │                                                                    │
│  FSA Handle stored in Dexie 'fsaHandles' table:                      │
│  {                                                                   │
│   projectId: UUID,                                                   │
│   workspaceId: 'ide' | 'notes' | etc.,                               │
│   lastAccessedAt: timestamp,                                         │
│   // Handle is NOT serialized - restored from session               │
│  }                                                                   │
│                                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Dexie Schema (src/infrastructure/persistence/dexie-db-migrations.ts)

```typescript
// Current schema (version 23)
const db = new Dexie('ViaGentDatabase');
db.version(23).stores({
  // Projects table
  projects: 'id, name, storageType, createdAt, lastAccessedAt',
  
  // IDE state (keyed by projectId for workspace isolation)
  ideState: 'projectId, workspaceId',
  
  // Conversations and threads
  conversations: 'id, projectId, workspaceType, createdAt',
  threads: 'id, conversationId, workspaceType',
  
  // Knowledge management
  sources: 'id, projectId, workspaceId, contentType, createdAt',
  collections: 'id, projectId, workspaceId, createdAt',
  oramaIndexes: 'id, projectId, workspaceId',
  
  // Sync and metadata
  syncStatus: 'id, projectId, workspaceId, syncState, lastSyncedAt',
  fileMetadata: 'id, projectId, path, lastModified',
  fsaHandles: '[projectId+workspaceId], lastAccessedAt',
  
  // Session and execution
  sessions: 'id, projectId, workspaceId, createdAt',
  toolExecutionLogs: 'id, projectId, sessionId, toolName, timestamp',
  
  // Flashcard data (workspace-scoped)
  flashcards: '[id+workspaceId], projectId, setId, createdAt',
  flashcardSets: '[id+workspaceId], projectId, createdAt',
  
  // Study data (workspace-scoped)
  studySessions: '[id+workspaceId], projectId, createdAt',
  studyCards: '[id+workspaceId], sessionId, createdAt',
  
  // Default++
  '&identities, *sent, *received, *groups, *labeled',
});
```

## 4.3 State Hydration Flow

```
PAGE LOAD
    │
    ▼
┌─────────────────────────────────────────┐
│ HydrationManager initializes             │
│                                         │
│ For each store with persistence:         │
│ 1. Create Dexie query                   │
│ 2. Get stored state                      │
│ 3. Call onRehydrateStorage callback      │
│ 4. Update store with persisted state     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ useProjectStore hydration               │
│ ⚠️ NO persist middleware!               │
│                                         │
│ hydrateProjects() is called:            │
│ 1. Query Dexie 'projects' table         │
│ 2. Update in-memory store               │
│ 3. NO persist on changes!               │
│                                         │
│ Result: State lost on page reload!      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ FSA Handle restoration                  │
│                                         │
│ For FSA projects:                       │
│ 1. Check Dexie 'fsaHandles' table       │
│ 2. Get lastAccessedAt timestamp         │
│ 3. Check session cache for handle       │
│ 4. If expired, prompt user again        │
│ 5. Restore adapter with handle          │
└─────────────────────────────────────────┘
```

## 4.4 State Store Details

| Store | Location | Persistence | Table/Key | Issue |
|-------|----------|-------------|-----------|-------|
| useAppStore | stores/use-app-store.ts | Dexie | providerConfigs | ✅ OK |
| useIDEStore | stores/ide/useIDEStore.ts | Custom → ideState | projectId key | ✅ OK |
| useConversationStore | stores/conversation/ | Dexie | conversations | ✅ OK |
| **useProjectStore** | stores/project/ | **NONE** | **N/A** | 🔴 CRITICAL |
| useFileSyncStatusStore | lib/workspace/ | Dexie | fileSyncStatus | ✅ OK |
| useEditorTabsStore | stores/editor-tabs/ | Dexie | providerConfigs | ⚠️ WRONG TABLE |
| useFlashcardStore | stores/flashcard/ | Dual | FlashcardDB | ⚠️ DUAL DB |
| useStudyStore | stores/study/ | Dual | StudyDatabase | ⚠️ DUAL DB |

---

# 5. CRUD PERMISSIONS MATRIX

## 5.1 File Operations (FSA + WebContainer)

| Operation | Human | AI Agent | AI Default Trust | Enforcement |
|-----------|-------|----------|------------------|-------------|
| readFile | ✅ | ✅ | auto | file-tools-impl.ts:readFile() |
| writeFile | ✅ | ⚠️ | prompt/block | file-tools-impl.ts:writeFile() |
| listFiles | ✅ | ✅ | auto | file-tools-impl.ts:listFiles() |
| deleteFile | ✅ | ❌ | block | file-tools-impl.ts:deleteFile() |
| createDir | ✅ | ⚠️ | prompt/block | file-tools-impl.ts:createDirectory() |
| deleteDir | ✅ | ❌ | block | file-tools-impl.ts:deleteDirectory() |
| executeCmd | ✅ | ⚠️ | prompt (IDE only) | terminal-tools-impl.ts:executeCommand() |
| rename | ✅ | ❌ | block | file-tools-impl.ts:rename() |

## 5.2 Note Operations

| Operation | Human | AI Agent | AI Default Trust | Enforcement |
|-----------|-------|----------|------------------|-------------|
| readNote | ✅ | ✅ | auto | notes-file-sync-service.ts |
| createNote | ✅ | ⚠️ | prompt | notes-file-sync-service.ts |
| updateNote | ✅ | ⚠️ | prompt | notes-file-sync-service.ts |
| deleteNote | ✅ | ❌ | block | notes-file-sync-service.ts |
| createBlock | ✅ | ⚠️ | prompt | notes-file-sync-core.ts |
| updateBlock | ✅ | ⚠️ | prompt | notes-file-sync-core.ts |
| deleteBlock | ✅ | ❌ | block | notes-file-sync-core.ts |

## 5.3 Project Operations

| Operation | Human | AI Agent | AI Default Trust | Enforcement |
|-----------|-------|----------|------------------|-------------|
| createProject | ✅ | ❌ | block | ProjectCreationWizard |
| deleteProject | ✅ | ❌ | block | ProjectPickerDialog |
| updateSettings | ✅ | ❌ | block | ProjectSettingsDialog |
| listProjects | ✅ | ⚠️ | prompt | HubHomePage |
| selectProject | ✅ | ⚠️ | prompt | ProjectPickerDialog |

## 5.4 AI Tool Operations

| Operation | Human | AI Agent | AI Default Trust | Enforcement |
|-----------|-------|----------|------------------|-------------|
| runTool | N/A | ⚠️ | per-tool | tool-permission-manager.ts |
| approveTool | ✅ | ❌ | N/A | tool-execution-slice.ts |
| denyTool | ✅ | ❌ | N/A | tool-execution-slice.ts |
| setContext | N/A | ⚠️ | prompt | context-slice.ts |
| getContext | N/A | ✅ | auto | context-slice.ts |

## 5.5 Permission Enforcement Points

### file-tools-impl.ts (src/lib/agent/facades/file-tools-impl.ts)

```typescript
async readFile(path: string): Promise<string> {
  // ✅ Always allowed
  return this.executeWithPermissionCheck('readFile', path, async () => {
    const content = await this.localAdapter.readFileAsText(path);
    return content;
  });
}

async writeFile(path: string, content: string): Promise<void> {
  // ⚠️ Conditional (depends on trust level)
  return this.executeWithPermissionCheck('writeFile', path, async () => {
    await this.localAdapter.writeFileAsText(path, content);
    await this.syncManager.writeFile(path, content);
  });
}

async deleteFile(path: string): Promise<void> {
  // ❌ Blocked for AI
  return this.executeWithPermissionCheck('deleteFile', path, async () => {
    throw new Error('AI agents cannot delete files');
  });
}
```

### tool-permission-manager.ts (src/lib/agent/tool-permission-manager.ts)

```typescript
interface ToolPermission {
  workspaceId: string;
  toolName: string;
  trustLevel: 'auto' | 'prompt' | 'block';
}

function checkPermission(toolName: string, workspaceId: string): PermissionResult {
  const permission = this.getPermission(workspaceId, toolName);
  
  if (permission.trustLevel === 'block') {
    return { allowed: false, reason: 'Tool blocked for AI agents' };
  }
  
  if (permission.trustLevel === 'prompt') {
    return { allowed: false, reason: 'User approval required' };
  }
  
  return { allowed: true };
}
```

---

# 6. ARCHITECTURAL PROBLEMS

## 6.1 Critical Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | **useProjectStore has NO persist middleware** | stores/project/use-project-store.ts:54-67 | 🔴 CRITICAL |
| 2 | **Wrong adapter creation** | slices/use-storage-adapter-slice.ts:188 | 🔴 CRITICAL |
| 3 | **Hardcoded 'ide' workspaceId** | ide-state-storage.ts:137 | 🔴 CRITICAL |
| 4 | **Editor tabs use wrong table** | stores/editor-tabs/index.ts:58 | 🟠 HIGH |
| 5 | **Dual database chaos** | stores/flashcard/, stores/study/ | 🟠 HIGH |
| 6 | **Migration creates data loss risk** | dexie-db-migrations.ts:54-69 | 🟠 HIGH |

### Problem 1: useProjectStore In-Memory Only

```typescript
// src/infrastructure/persistence/stores/project/use-project-store.ts:54-67
interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  // ...
}

// The store has NO persist middleware!
// State is loaded from Dexie on mount but NOT saved back
const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  
  hydrateProjects: async () => {
    const projects = await db.projects.toArray();
    set({ projects }); // Loads from Dexie
  },
  
  // NO persist() call when projects change!
  // Changes are lost on page reload!
}));
```

### Problem 2: Wrong Adapter Creation

```typescript
// src/infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts:187-189
if (!adapter || !syncManager) {
  const fsAdapter = new LocalFSAdapter(); // ❌ WRONG!
  fsAdapter.setDirectoryHandle(handle);
}

// Should be:
const adapter = createStorageAdapter({
  storageType: project.storageType,
  projectId: project.id,
  fsaHandle: handle,
});
```

### Problem 3: Hardcoded WorkspaceId

```typescript
// src/infrastructure/persistence/stores/ide/ide-state-storage.ts:137
function saveIDEState(state: IDEState): Promise<void> {
  return db.ideState.put({
    ...state,
    workspaceId: 'ide', // ❌ Always 'ide' - ignores actual workspace!
    projectId: state.projectId,
    updatedAt: Date.now(),
  });
}
```

## 6.2 File Dependency Map

### LocalFSAdapter Dependencies (26 files)

| File | Layer | Usage | Impact |
|------|-------|-------|--------|
| infrastructure/filesystem/local-fs-adapter.ts | SOURCE | All methods | CRITICAL |
| lib/filesystem/unified-storage-adapter.ts | infrastructure | extends | CRITICAL |
| routes/test-fs-adapter.tsx | presentation | new LocalFSAdapter() | HIGH |
| lib/workspace/hooks/useSyncOperations.ts | infrastructure | new LocalFSAdapter() | HIGH |
| presentation/components/ide/FileTree/hooks/useFileTreeState.ts | presentation | new LocalFSAdapter() | HIGH |
| infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts | infrastructure | new SyncManager(), setDirectoryHandle() | HIGH |
| infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts | infrastructure | isSupported(), type | MEDIUM |
| lib/workspace/hooks/useWorkspaceActions.ts | infrastructure | isSupported() | LOW |
| presentation/components/ide/FileTree/hooks/useFileTreeActions.ts | presentation | listDirectory, readFile, writeFile | HIGH |
| infrastructure/sync/workspace-services/ide-file-sync-service.ts | infrastructure | readFile, writeFile, deleteFile, listDirectory | CRITICAL |
| infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts | infrastructure | readFile | HIGH |
| infrastructure/sync/workspace-services/notes/note-folder-bridge.ts | infrastructure | type | MEDIUM |
| infrastructure/sync/workspace-services/notes/notes-file-sync-core.ts | infrastructure | readFile, writeFile, listDirectory | HIGH |
| infrastructure/sync/workspace-services/study-sync/study-sync-service-core.ts | infrastructure | readFile, listDirectory | HIGH |
| lib/agent/facades/file-tools-impl.ts | infrastructure | readFile, listDirectory | CRITICAL |
| lib/filesync/hooks/use-file-sync-service.ts | infrastructure | readFileAsText | HIGH |
| lib/filesystem/index.ts | infrastructure | re-export | LOW |
| infrastructure/filesystem/index.ts | infrastructure | re-export | MEDIUM |

### SyncManager Dependencies (22 files)

| File | Layer | Usage | Impact |
|------|-------|-------|--------|
| lib/filesystem/sync-manager/sync-manager.ts | infrastructure | SOURCE | CRITICAL |
| infrastructure/sync/workspace-services/ide-file-sync-service.ts | infrastructure | syncToWebContainer, incrementalSyncToWebContainer | CRITICAL |
| lib/agent/facades/file-tools-impl.ts | infrastructure | writeFile, deleteFile, writeMultiple, deleteMultiple | CRITICAL |
| infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts | infrastructure | new SyncManager() | HIGH |
| lib/workspace/hooks/useSyncOperations.ts | infrastructure | new SyncManager() | HIGH |
| lib/filesystem/sync-manager/sync-manager-factory.ts | infrastructure | new SyncManager() | MEDIUM |
| infrastructure/sync/index.ts | infrastructure | re-export | MEDIUM |

---

# 7. SUMMARY DECISION POINTS

## 7.1 What Needs Fixing

| Priority | Fix | Files to Change | Risk |
|----------|-----|-----------------|------|
| P0 | Fix useProjectStore persistence | use-project-store.ts | Low |
| P0 | Fix adapter creation | use-storage-adapter-slice.ts | Medium |
| P1 | Fix SyncManager to accept StorageAdapter | sync-manager.ts, related | High |
| P1 | Fix hardcoded workspaceId | ide-state-storage.ts | Medium |
| P1 | Fix editor tabs table | editor-tabs/index.ts | Low |
| P2 | Consolidate databases | flashcard/, study/ | High |

## 7.2 Entry Point Summary

| Entry | Creates Project? | Storage Type | Default Content |
|-------|------------------|--------------|-----------------|
| /hub → Create Project | Yes | 'fsa' | Empty folder |
| /hub → IDE | No | - | Selector |
| /ide → Quick IDE | Yes (temp) | 'indexeddb' | Empty |
| /ide → Select Folder | Yes | 'fsa' | Folder files |
| /notes | Yes | 'indexeddb' | default_note |
| Mobile /hub → IDE | No | - | Selector (FSA disabled) |
| Mobile /notes | Yes | 'indexeddb' | default_note |

## 7.3 State Boundaries

| Store | Workspace Isolation | Persistence Layer |
|-------|---------------------|-------------------|
| ideState | projectId | Dexie |
| conversations | projectId, workspaceType | Dexie |
| sources | projectId, workspaceId | Dexie |
| flashcards | projectId, workspaceId | FlashcardDB |
| studySessions | projectId, workspaceId | StudyDatabase |
| fsaHandles | projectId, workspaceId | Dexie |

---

**END OF DOCUMENT**

For questions or clarifications, refer to the specific file paths and line numbers above.
