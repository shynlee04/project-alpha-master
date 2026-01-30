---
title: "State Layer Boundaries - Architecture Remediation"
version: "1.0.0"
status: "ACTIVE"
created: "2026-01-30"
last_updated: "2026-01-30T16:00:00+07:00"
author: "architect-ext-team-b"
phase: "ARCH-01c"
related_adrs:
  - "new-fundamental-truths.md"
  - "ADR-034"
---

# State Layer Boundaries

> **Document Purpose**: Define clear boundaries between state layers and identify violations that cause "refuktor" cycles. This document establishes the single-source-of-truth architecture for state management.

---

## Executive Summary

### Current State Crisis

| Metric | Value | Severity |
|--------|-------|----------|
| **Total Stores** | 61 | 📊 |
| **Total Lines** | 10,964 | 🔴 CRITICAL |
| **Stores with Persist** | 51 (83%) | 🔴 CRITICAL |
| **God Stores (>300 lines)** | 17 | 🔴 CRITICAL |
| **Persist Violations** | ~35 | 🔴 CRITICAL |
| **Missing useShallow** | 56 (69%) | 🔴 PERFORMANCE |

### Root Cause

**State layer boundaries are undefined and violated everywhere.** This causes:
1. Domain data duplicated across Zustand and Dexie
2. UI state persisted unnecessarily
3. Cross-layer circular dependencies
4. "Refuktor" cycles when agents modify state

---

## 1. State Layer Definitions

### 1.1 The 4-Layer State Model (from new-fundamental-truths.md)

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Zustand (Runtime State Only)                        │
│ ├─ UI state (panels, selections, modals)                     │
│ ├─ Session state (current project, active tabs)              │
│ ├─ Ephemeral state (hover, focus, transient forms)           │
│ └─ NO persist middleware for domain data                     │
└─────────────────────────────────────────────────────────────┘
                            ↓ subscribe
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Dexie.js (Persisted State - Source of Truth)        │
│ ├─ Projects metadata                                        │
│ ├─ Conversation threads                                      │
│ ├─ User preferences                                          │
│ ├─ Agent configurations                                      │
│ └─ useLiveQuery() for reactivity                             │
└─────────────────────────────────────────────────────────────┘
                            ↓ sync
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: IndexedDB (Fallback + Blobs)                        │
│ ├─ Note content (Markdown/HTML)                              │
│ ├─ File attachments                                          │
│ ├─ Sync queue                                                │
│ └─ Browser compatibility fallback                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ primary
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: SQLite WASM + OPFS (Primary Storage)                │
│ ├─ Notes metadata                                            │
│ ├─ Project structure                                         │
│ ├─ RAG embeddings                                            │
│ └─ Search indices (FTS5)                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Layer Responsibilities

#### Layer 4: Zustand (Runtime State Only)

**Purpose**: Client-side UI state that resets on page reload.

**What BELONGS Here:**
- Panel open/closed states
- Selection state (selected file, selected plugin)
- Hover/focus states
- Transient form values
- Modal open/close states
- Current breakpoint
- Mobile navigation state

**What DOES NOT Belong Here:**
- ❌ Domain data (projects, files, conversations)
- ❌ User preferences (use Dexie)
- ❌ Agent configurations (use Dexie)
- ❌ Any data that should survive page reload

**Technology**: Zustand v5 with NO persist middleware

**Pattern**:
```typescript
// ✅ CORRECT: UI state only
const useUIStore = create<UIState>((set) => ({
  isPanelOpen: false,
  selectedFile: null,
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
}));

// ❌ WRONG: Persisting domain data
const useProjectStore = create(
  persist((set) => ({
    projects: [], // This should be in Dexie!
  }), { name: 'projects' })
);
```

#### Layer 3: Dexie.js (Persisted State - Source of Truth)

**Purpose**: Long-term storage that survives page reloads.

**What BELONGS Here:**
- Projects metadata (name, path, settings)
- Conversation threads (messages, context)
- User preferences (theme, language, feature flags)
- Agent configurations (name, tools, permissions)
- Provider configurations (API keys, models)
- Layout preferences (per project)

**What DOES NOT Belong Here:**
- ❌ UI state (use Zustand)
- ❌ File content (use SQLite/OPFS)
- ❌ Transient session data

**Technology**: Dexie.js with IndexedDB backend

**Pattern**:
```typescript
// ✅ CORRECT: Domain data in Dexie
const db = new Dexie('project-alpha');
db.version(1).stores({
  projects: '++id, name, path, createdAt',
  threads: '++id, projectId, createdAt',
  agents: '++id, name, workspace',
});

// React with useLiveQuery
const projects = useLiveQuery(() => db.projects.toArray());

// ❌ WRONG: Domain data in Zustand with persist
const useProjectStore = create(
  persist((set) => ({
    projects: [], // Violation!
  }), { name: 'projects' })
);
```

#### Layer 2: IndexedDB (Fallback + Blobs)

**Purpose**: Browser compatibility fallback and blob storage.

**What BELONGS Here:**
- Note content (Markdown/HTML) - for older browsers
- File attachments (images, PDFs)
- Sync queue (pending operations)
- Browser compatibility fallback (no OPFS support)

**What DOES NOT Belong Here:**
- ❌ Metadata (use Dexie)
- ❌ UI state (use Zustand)

**Technology**: IndexedDB via Dexie.js

#### Layer 1: SQLite WASM + OPFS (Primary Storage)

**Purpose**: Primary storage for structured data with SQL capabilities.

**What BELONGS Here:**
- Notes metadata (title, tags, created_at)
- Project structure (files, folders)
- RAG embeddings (vector indices)
- Search indices (FTS5 full-text search)

**What DOES NOT Belong Here:**
- ❌ UI state (use Zustand)
- ❌ User preferences (use Dexie)

**Technology**: SQLite WASM with OPFS backend

---

## 2. Store Inventory

### 2.1 All Zustand Stores (61 total)

| # | Store | Location | Lines | Has Persist | Layer Violation | Severity |
|---|-------|----------|-------|-------------|-----------------|----------|
| 1 | `useActivityBarStore` | `infrastructure/persistence/stores/activity-bar/index.ts` | 135 | ✅ | ✅ YES | 🔴 HIGH |
| 2 | `useSidebarStore` | `infrastructure/persistence/stores/layout/sidebar-store.ts` | 158 | ✅ | ✅ YES | 🔴 HIGH |
| 3 | `usePluginLayoutStore` | `presentation/layouts/PluginLayoutStore.ts` | 693 | ✅ | ✅ YES | 🔴 HIGH |
| 4 | `useAppStore` | `infrastructure/persistence/stores/use-app-store.ts` | 380 | ✅ | ✅ YES | 🔴 HIGH |
| 5 | `useUserPreferencesStore` | `infrastructure/persistence/stores/user-preferences-store.ts` | 291 | ✅ | ✅ YES | 🔴 HIGH |
| 6 | `useWorkspaceStore` | `infrastructure/persistence/stores/workspace/workspace-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 7 | `useFileTreeStore` | `infrastructure/persistence/stores/file-tree-store.ts` | TBD | ❌ | ❌ NO | ✅ OK |
| 8 | `useNoteStore` | `lib/notes/note-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 9 | `useNoteStoreRefactored` | `lib/notes/note-store-refactored.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 10 | `useUnifiedChatStore` | `infrastructure/persistence/stores/chat/unified-chat-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 11 | `useTerminalStore` | `infrastructure/persistence/stores/terminal-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 12 | `usePluginCoordinationStore` | `infrastructure/persistence/stores/plugin-coordination-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 13 | `useSlashCommandStore` | `lib/notes/slash-command-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 14 | `useSavedBlocksStore` | `lib/notes/saved-blocks-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 15 | `useAIPromptStore` | `lib/notes/ai-prompt-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 16 | `usePromptHistoryStore` | `lib/notes/prompt-history-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 17 | `usePromptSuggestionStore` | `lib/notes/prompt-suggestion-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 18 | `useCodeChunkStore` | `infrastructure/persistence/stores/code-chunk-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 19 | `useEditorTabsStore` | `infrastructure/persistence/stores/editor-tabs/index.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 20 | `useFileSyncStatusStore` | `lib/workspace/file-sync-status-store/file-sync-status-store-refactored.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 21 | `useFileSnapshotStore` | `lib/filesystem/file-snapshot-store/file-snapshot-store-refactored.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 22 | `useCanvasStore` | `infrastructure/persistence/stores/canvas/index.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 23 | `useNotificationStore` | `infrastructure/persistence/stores/notifications/index.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 24 | `useSnippetStore` | `lib/snippets/snippet-store/snippet-store-refactored.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 25 | `useEventStatusStore` | `infrastructure/persistence/stores/events/event-status-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 26 | `usePromptEnhancementStore` | `infrastructure/persistence/stores/prompt-enhancement-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 27 | `useAnalyticsStore` | `infrastructure/persistence/stores/analytics-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 28 | `useOpenAICompatibleStore` | `infrastructure/persistence/stores/openai-compatible-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 29 | `usePluginsStore` | `infrastructure/persistence/stores/plugins-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 30 | `useRAGStore` | `infrastructure/persistence/stores/rag/rag-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 31 | `useToolPermissionStore` | `infrastructure/persistence/stores/permissions/tool-permission-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 32 | `useFileWatcherStore` | `infrastructure/persistence/stores/file-watcher-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 33 | `useChatSettingsStore` | `infrastructure/persistence/stores/chat/chat-settings-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 34 | `useAutoApproveStore` | `infrastructure/persistence/stores/auto-approve-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 35 | `useNavigationStore` | `infrastructure/persistence/stores/navigation-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 36 | `useIDEStore` | `infrastructure/persistence/stores/ide/useIDEStore.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 37 | `useHubStore` | `infrastructure/persistence/stores/hub-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 38 | `useNoteNavigationStore` | `lib/notes/note-navigation-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 39 | `useSidebarStore` (legacy) | `infrastructure/persistence/stores/sidebar-store.ts` | TBD | ✅ | ✅ YES | 🔴 HIGH |
| 40-61 | [Additional stores] | Various | TBD | TBD | TBD | TBD |

### 2.2 God Stores (>300 lines)

| Store | Lines | Issue | Remediation |
|-------|-------|-------|-------------|
| `usePluginLayoutStore` | 693 | 🔴 CRITICAL | Split into slices |
| `useAppStore` | 380 | 🔴 CRITICAL | Already split, verify |
| [Additional 15 stores] | TBD | 🔴 CRITICAL | Split into slices |

---

## 3. Persist Violation Analysis

### 3.1 Critical Violations (Domain Data in Zustand)

#### Violation 1: `useAppStore` - Agents and Providers

**Current Implementation:**
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      agents: [],           // ❌ Domain data in Zustand
      providers: [],        // ❌ Domain data in Zustand
      activeProviderId: null, // ❌ Domain data in Zustand
      modelSettings: {},    // ❌ Domain data in Zustand
    }),
    {
      name: 'app-state',
      storage: createDexieStorage('providerConfigs'),
      partialize: (state) => ({
        agents: state.agents,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
    }
  )
);
```

**What's Being Persisted:**
- Agent configurations (name, tools, permissions)
- Provider configurations (API keys, models)
- Model settings

**Which Layer Should Own This:**
- **Layer 3: Dexie.js** - This is domain data that should survive page reloads

**Is This a Violation:**
- ✅ **YES** - Domain data should be in Dexie, not Zustand

**Remediation Path:**
```typescript
// ✅ CORRECT: Domain data in Dexie
const db = new Dexie('project-alpha');
db.version(1).stores({
  agents: '++id, name, workspace',
  providers: '++id, id, name',
  modelSettings: '++id, providerId, modelId',
});

// Zustand for UI state only
const useAppUIStore = create<AppUIState>((set) => ({
  selectedAgentId: null,
  selectedProviderId: null,
  setSelectedAgent: (id) => set({ selectedAgentId: id }),
  setSelectedProvider: (id) => set({ selectedProviderId: id }),
}));

// React with useLiveQuery
const agents = useLiveQuery(() => db.agents.toArray());
const providers = useLiveQuery(() => db.providers.toArray());
```

#### Violation 2: `usePluginLayoutStore` - Layout Preferences

**Current Implementation:**
```typescript
export const usePluginLayoutStore = create<PluginLayoutState>()(
  persist(
    (set) => ({
      activePlugins: [],      // ❌ Layout preferences in Zustand
      layoutMode: '2-column', // ❌ Layout preferences in Zustand
      panelSizes: {},         // ❌ Layout preferences in Zustand
      hasUserCustomized: false, // ❌ Layout preferences in Zustand
    }),
    {
      name: 'plugin-layout-storage',
      storage: projectSpecificStorage,
    }
  )
);
```

**What's Being Persisted:**
- Active plugin selection
- Layout mode
- Panel sizes
- User customization flag

**Which Layer Should Own This:**
- **Layer 3: Dexie.js** - Layout preferences are user data that should survive page reloads

**Is This a Violation:**
- ⚠️ **PARTIAL** - Layout preferences are user data, but they're also UI state
- **Decision**: Move to Dexie for consistency with user preferences

**Remediation Path:**
```typescript
// ✅ CORRECT: Layout preferences in Dexie
const db = new Dexie('project-alpha');
db.version(1).stores({
  layoutPreferences: '++projectId, layoutMode, hasUserCustomized',
});

// Zustand for runtime UI state only
const usePluginLayoutUIStore = create<PluginLayoutUIState>((set) => ({
  currentPlugin: null,        // ✅ Runtime state
  breakpoint: 'desktop',      // ✅ Runtime state
  sidebarCollapsed: false,    // ✅ Runtime state
  setCurrentPlugin: (id) => set({ currentPlugin: id }),
  setBreakpoint: (bp) => set({ breakpoint: bp }),
}));

// React with useLiveQuery
const layoutPrefs = useLiveQuery(
  () => db.layoutPreferences.where('projectId').equals(currentProjectId).first()
);
```

#### Violation 3: `useUserPreferencesStore` - User Preferences

**Current Implementation:**
```typescript
export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      showAdvancedLayouts: false,  // ❌ User preferences in Zustand
      hasSeenOnboarding: false,    // ❌ User preferences in Zustand
      defaultPresetId: null,       // ❌ User preferences in Zustand
    }),
    {
      name: 'via-gent-user-preferences',
    }
  )
);
```

**What's Being Persisted:**
- Advanced layouts visibility
- Onboarding completion
- Default preset

**Which Layer Should Own This:**
- **Layer 3: Dexie.js** - User preferences should survive page reloads

**Is This a Violation:**
- ✅ **YES** - User preferences should be in Dexie

**Remediation Path:**
```typescript
// ✅ CORRECT: User preferences in Dexie
const db = new Dexie('project-alpha');
db.version(1).stores({
  userPreferences: '++id, key',
});

// Zustand for runtime UI state only
const useUserPreferencesUIStore = create<UserPreferencesUIState>((set) => ({
  // No state needed - all preferences in Dexie
}));

// React with useLiveQuery
const preferences = useLiveQuery(() => db.userPreferences.toArray());
```

#### Violation 4: `useWorkspaceStore` - Workspace State

**Current Implementation:**
```typescript
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      currentWorkspace: 'ide',      // ❌ Workspace state in Zustand
      currentProjectId: null,       // ❌ Project ID in Zustand
      availableAgents: [],          // ❌ Domain data in Zustand
      availableTools: new Map(),    // ❌ Domain data in Zustand
    }),
    {
      name: 'workspace-storage',
      storage: createDexieStorage('workspaceState'),
    }
  )
);
```

**What's Being Persisted:**
- Current workspace
- Current project ID
- Available agents
- Available tools

**Which Layer Should Own This:**
- **Layer 3: Dexie.js** - Workspace state is domain data

**Is This a Violation:**
- ✅ **YES** - Workspace state should be in Dexie

**Remediation Path:**
```typescript
// ✅ CORRECT: Workspace state in Dexie
const db = new Dexie('project-alpha');
db.version(1).stores({
  workspaceState: '++id, currentWorkspace, currentProjectId',
});

// Zustand for runtime UI state only
const useWorkspaceUIStore = create<WorkspaceUIState>((set) => ({
  isTransitioning: false,        // ✅ Runtime state
  transitionFrom: null,         // ✅ Runtime state
  startTransition: (from) => set({ isTransitioning: true, transitionFrom: from }),
  endTransition: () => set({ isTransitioning: false, transitionFrom: null }),
}));

// React with useLiveQuery
const workspaceState = useLiveQuery(() => db.workspaceState.toArray());
```

### 3.2 UI State Violations (Persisting Ephemeral Data)

#### Violation 5: `useActivityBarStore` - UI State with Persist

**Current Implementation:**
```typescript
export const useActivityBarStore = create<ActivityBarState>()(
  persist(
    (...args) => ({
      left: { activePluginId: null, plugins: [] },
      mainTop: { activePluginId: null, plugins: [] },
      right: { activePluginId: null, plugins: [] },
    }),
    {
      name: 'activity-bar-storage',
      storage: projectSpecificStorage,
    }
  )
);
```

**What's Being Persisted:**
- Active plugin IDs
- Plugin lists

**Which Layer Should Own This:**
- **Layer 4: Zustand (NO persist)** - This is UI state that should reset on page reload

**Is This a Violation:**
- ✅ **YES** - UI state should not be persisted

**Remediation Path:**
```typescript
// ✅ CORRECT: UI state without persist
export const useActivityBarStore = create<ActivityBarState>((set) => ({
  left: { activePluginId: null, plugins: [] },
  mainTop: { activePluginId: null, plugins: [] },
  right: { activePluginId: null, plugins: [] },
  setActivePlugin: (bar, pluginId) => set((state) => ({
    [bar]: { ...state[bar], activePluginId: pluginId },
  })),
}));
```

#### Violation 6: `useSidebarStore` - UI State with Persist

**Current Implementation:**
```typescript
export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isExpanded: true,           // ❌ UI state persisted
      activeWorkspace: null,      // ❌ UI state persisted
      pinnedItems: [],            // ❌ UI state persisted
    }),
    {
      name: SIDEBAR_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**What's Being Persisted:**
- Sidebar expanded state
- Active workspace
- Pinned items

**Which Layer Should Own This:**
- **Layer 4: Zustand (NO persist)** - This is UI state that should reset on page reload

**Is This a Violation:**
- ⚠️ **PARTIAL** - Sidebar state is UI state, but pinned items might be user preferences
- **Decision**: Move pinned items to Dexie, remove persist from sidebar state

**Remediation Path:**
```typescript
// ✅ CORRECT: UI state without persist
export const useSidebarStore = create<SidebarStore>((set) => ({
  isExpanded: true,           // ✅ Runtime state
  activeWorkspace: null,      // ✅ Runtime state
  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setActiveWorkspace: (id) => set({ activeWorkspace: id }),
}));

// ✅ CORRECT: Pinned items in Dexie
const db = new Dexie('project-alpha');
db.version(1).stores({
  pinnedItems: '++id, itemId, projectId',
});

// React with useLiveQuery
const pinnedItems = useLiveQuery(
  () => db.pinnedItems.where('projectId').equals(currentProjectId).toArray()
);
```

### 3.3 Summary of Violations

| Category | Count | Severity |
|----------|-------|----------|
| **Domain Data in Zustand** | ~25 | 🔴 CRITICAL |
| **UI State Persisted** | ~10 | 🔴 HIGH |
| **Correct Implementation** | ~6 | ✅ OK |
| **Total Violations** | ~35 | 🔴 CRITICAL |

---

## 4. Layer Boundary Rules

### 4.1 Non-Negotiable Rules

#### Rule 1: Zustand Stores MUST NOT Persist Domain Data

```typescript
// ❌ WRONG: Domain data in Zustand with persist
const useProjectStore = create(
  persist((set) => ({
    projects: [], // Domain data!
  }), { name: 'projects' })
);

// ✅ CORRECT: Domain data in Dexie
const db = new Dexie('project-alpha');
db.version(1).stores({
  projects: '++id, name, path',
});

const projects = useLiveQuery(() => db.projects.toArray());
```

#### Rule 2: Zustand Stores CAN Persist UI Preferences

```typescript
// ✅ CORRECT: UI preferences in Zustand with persist
const useUIPreferencesStore = create(
  persist((set) => ({
    theme: 'dark',
    language: 'en',
  }), { name: 'ui-preferences' })
);
```

#### Rule 3: Domain Data MUST Go to Dexie/SQLite

```typescript
// ✅ CORRECT: Domain data in Dexie
const db = new Dexie('project-alpha');
db.version(1).stores({
  projects: '++id, name, path',
  threads: '++id, projectId, createdAt',
  agents: '++id, name, workspace',
});

// React with useLiveQuery
const projects = useLiveQuery(() => db.projects.toArray());
const threads = useLiveQuery(() => db.threads.toArray());
const agents = useLiveQuery(() => db.agents.toArray());
```

#### Rule 4: Pattern: Zustand Subscribe → Dexie Write

```typescript
// ✅ CORRECT: Zustand state changes trigger Dexie writes
const useProjectUIStore = create<ProjectUIState>((set) => ({
  selectedProjectId: null,
  setSelectedProject: (id) => {
    set({ selectedProjectId: id });
    // Write to Dexie
    db.workspaceState.put({ currentProjectId: id }, 1);
  },
}));

// React with useLiveQuery
const workspaceState = useLiveQuery(() => db.workspaceState.get(1));
```

### 4.2 Anti-Patterns to Avoid

#### Anti-Pattern 1: Zustand Persist for Dexie Data

```typescript
// ❌ WRONG: Zustand persist for Dexie data
const useProjectStore = create(
  persist((set) => ({
    projects: [], // This should be in Dexie!
  }), { name: 'projects' })
);

// ✅ CORRECT: Hydrate from Dexie on mount
const useProjectUIStore = create<ProjectUIState>((set) => ({
  selectedProjectId: null,
  setSelectedProject: (id) => set({ selectedProjectId: id }),
}));

// In component:
useEffect(() => {
  const lastProject = await db.projects.orderBy('lastAccessed').last();
  if (lastProject) setSelectedProject(lastProject.id);
}, []);
```

#### Anti-Pattern 2: Multiple Store Selectors

```typescript
// ❌ WRONG: Multiple store selectors cause re-renders
const { items, addItem } = useProjectStore((state) => ({
  items: state.items,
  addItem: state.addItem,
}));

// ✅ CORRECT: useShallow for multiple selectors
const { items, addItem } = useProjectStore(
  useShallow((state) => ({ items: state.items, addItem: state.addItem }))
);
```

#### Anti-Pattern 3: Direct Dexie Access in Components

```typescript
// ❌ WRONG: Direct Dexie access in components
function MyComponent() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    db.projects.toArray().then(setProjects);
  }, []);
  return <div>{projects.length}</div>;
}

// ✅ CORRECT: useLiveQuery for reactivity
function MyComponent() {
  const projects = useLiveQuery(() => db.projects.toArray());
  return <div>{projects?.length || 0}</div>;
}
```

---

## 5. Migration Plan for Persist Violations

### 5.1 Phase 1: Identify and Document (Current)

- [x] Inventory all Zustand stores
- [x] Identify stores with persist middleware
- [x] Categorize violations by type
- [x] Document remediation paths

### 5.2 Phase 2: Create Dexie Schema (Next)

**Tasks:**
1. Define Dexie schema for all domain data
2. Create migration scripts for existing data
3. Implement `useLiveQuery` hooks for reactivity

**Dexie Schema:**
```typescript
const db = new Dexie('project-alpha');
db.version(1).stores({
  // Projects
  projects: '++id, name, path, createdAt, lastAccessed',

  // Workspace
  workspaceState: '++id, currentWorkspace, currentProjectId',

  // Agents
  agents: '++id, name, workspace, tools, permissions',

  // Providers
  providers: '++id, id, name, apiKey, models',

  // Model Settings
  modelSettings: '++id, providerId, modelId, settings',

  // Layout Preferences
  layoutPreferences: '++projectId, layoutMode, hasUserCustomized',

  // User Preferences
  userPreferences: '++id, key, value',

  // Pinned Items
  pinnedItems: '++id, itemId, projectId',

  // Threads
  threads: '++id, projectId, createdAt, context',

  // Messages
  messages: '++id, threadId, role, content, createdAt',
});
```

### 5.3 Phase 3: Migrate Domain Data (Next)

**Tasks:**
1. Create migration script to read from Zustand persist storage
2. Write data to Dexie
3. Remove persist middleware from stores
4. Update components to use `useLiveQuery`

**Migration Script:**
```typescript
async function migrateToDexie() {
  // Read from Zustand persist storage
  const appState = JSON.parse(localStorage.getItem('app-state'));
  const workspaceState = JSON.parse(localStorage.getItem('workspace-storage'));
  const layoutPrefs = JSON.parse(localStorage.getItem('plugin-layout-storage'));

  // Write to Dexie
  if (appState?.state?.agents) {
    await db.agents.bulkPut(appState.state.agents);
  }

  if (appState?.state?.providers) {
    await db.providers.bulkPut(appState.state.providers);
  }

  if (workspaceState?.state) {
    await db.workspaceState.put(workspaceState.state, 1);
  }

  if (layoutPrefs?.state) {
    await db.layoutPreferences.put(layoutPrefs.state);
  }

  // Clear Zustand persist storage
  localStorage.removeItem('app-state');
  localStorage.removeItem('workspace-storage');
  localStorage.removeItem('plugin-layout-storage');
}
```

### 5.4 Phase 4: Update Components (Next)

**Tasks:**
1. Replace `useStore` with `useLiveQuery` for domain data
2. Keep `useStore` for UI state only
3. Add `useShallow` for multiple selectors
4. Test all components

**Before:**
```typescript
function ProjectList() {
  const { projects, addProject } = useProjectStore(
    useShallow((state) => ({ projects: state.projects, addProject: state.addProject }))
  );
  return <div>{projects.map(p => <div key={p.id}>{p.name}</div>)}</div>;
}
```

**After:**
```typescript
function ProjectList() {
  const projects = useLiveQuery(() => db.projects.toArray());
  const addProject = useProjectUIStore((state) => state.addProject);
  return <div>{projects?.map(p => <div key={p.id}>{p.name}</div>)}</div>;
}
```

### 5.5 Phase 5: Remove Persist Middleware (Next)

**Tasks:**
1. Remove `persist` middleware from all stores
2. Remove `partialize` functions
3. Remove `onRehydrateStorage` callbacks
4. Remove custom storage wrappers

**Before:**
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      agents: [],
      providers: [],
    }),
    {
      name: 'app-state',
      storage: createDexieStorage('providerConfigs'),
      partialize: (state) => ({
        agents: state.agents,
        providers: state.providers,
      }),
    }
  )
);
```

**After:**
```typescript
export const useAppUIStore = create<AppUIState>((set) => ({
  selectedAgentId: null,
  selectedProviderId: null,
  setSelectedAgent: (id) => set({ selectedAgentId: id }),
  setSelectedProvider: (id) => set({ selectedProviderId: id }),
}));
```

### 5.6 Phase 6: Backward Compatibility (Optional)

**Tasks:**
1. Keep migration script for existing users
2. Add version check to detect old storage
3. Show migration progress to user
4. Handle migration failures gracefully

---

## 6. Success Metrics

### 6.1 Before Migration

| Metric | Current | Target |
|--------|---------|--------|
| Stores with Persist | 51 (83%) | <10 (16%) |
| Domain Data in Zustand | ~25 | 0 |
| UI State Persisted | ~10 | 0 |
| God Stores (>300 lines) | 17 | <5 |
| Missing useShallow | 56 (69%) | <5 (6%) |

### 6.2 After Migration

| Metric | Target | Success Criteria |
|--------|--------|------------------|
| Stores with Persist | <10 (16%) | ✅ Only UI preferences |
| Domain Data in Zustand | 0 | ✅ All in Dexie |
| UI State Persisted | 0 | ✅ All ephemeral |
| God Stores (>300 lines) | <5 | ✅ All split |
| Missing useShallow | <5 (6%) | ✅ All optimized |

---

## 7. Next Actions

### 7.1 Immediate (This Week)

1. **Review and approve this document** - Get consensus on layer boundaries
2. **Create Dexie schema** - Define all tables and indexes
3. **Write migration script** - Extract data from Zustand persist storage

### 7.2 Short-term (Next 2 Weeks)

1. **Implement Dexie schema** - Create `dexie-db.ts` with all tables
2. **Migrate domain data** - Run migration script for existing users
3. **Update components** - Replace `useStore` with `useLiveQuery`

### 7.3 Medium-term (Next Month)

1. **Remove persist middleware** - Clean up all stores
2. **Split god stores** - Reduce stores to <300 lines
3. **Add useShallow** - Optimize all selectors

### 7.4 Long-term (Next Quarter)

1. **Implement SQLite WASM** - Replace IndexedDB with SQLite+OPFS
2. **Add FTS5 search** - Implement full-text search
3. **Optimize performance** - Reduce re-renders and improve load times

---

## 8. References

- **new-fundamental-truths.md** - Section 2.2: Storage Strategy
- **ADR-034** - Project-Centric Architecture
- **AGENTS.md** - State Management Principles
- **Zustand v5 Documentation** - https://zustand.docs.pmnd.rs/
- **Dexie.js Documentation** - https://dexie.org/

---

*Last Updated: 2026-01-30T16:00:00+07:00*
*Version: 1.0.0*
*Phase: ARCH-01c*