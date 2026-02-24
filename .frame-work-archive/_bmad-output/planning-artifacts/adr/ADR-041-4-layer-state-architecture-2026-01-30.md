---
title: "ADR-041: 4-Layer State Architecture"
status: "ACCEPTED"
date: "2026-01-30"
decision-makers: "architect-ext-team-b"
technical-story: "ARCH-01c"
related:
  - "state-layer-boundaries-2026-01-30.md"
  - "new-fundamental-truths.md"
  - "ADR-039"
---

# ADR-041: 4-Layer State Architecture

## Status
ACCEPTED

## Context

State management was chaotic with undefined layer boundaries, causing:

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

1. **Domain data duplicated** across Zustand and Dexie
2. **UI state persisted** unnecessarily
3. **Cross-layer circular dependencies**
4. **"Refuktor" cycles** when agents modify state

### Critical Violations Found

#### Violation 1: Domain Data in Zustand

```typescript
// ❌ WRONG: Domain data in Zustand with persist
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      agents: [],           // Domain data!
      providers: [],        // Domain data!
      activeProviderId: null, // Domain data!
      modelSettings: {},    // Domain data!
    }),
    { name: 'app-state' }
  )
);
```

#### Violation 2: UI State Persisted

```typescript
// ❌ WRONG: UI state persisted
export const useActivityBarStore = create<ActivityBarState>()(
  persist(
    (...args) => ({
      left: { activePluginId: null, plugins: [] },
      mainTop: { activePluginId: null, plugins: [] },
      right: { activePluginId: null, plugins: [] },
    }),
    { name: 'activity-bar-storage' }
  )
);
```

## Decision

### 1. The 4-Layer State Model

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

### 2. Layer Responsibilities

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

### 3. Non-Negotiable Rules

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

### 4. Dexie Schema

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

## Consequences

### Positive

- **Clear separation**: Each layer has well-defined responsibilities
- **Single source of truth**: Domain data lives in Dexie, not duplicated
- **Predictable state**: UI state resets on reload, domain data persists
- **Better performance**: useLiveQuery provides reactivity without re-renders
- **Agent safety**: Clear rules prevent "refuktor" cycles

### Negative

- **Migration effort**: ~35 stores need persist middleware removed
- **Learning curve**: Team must understand 4-layer model
- **Breaking changes**: Existing persisted data needs migration script
- **Complexity**: More layers to understand and maintain

### Neutral

- **Backward compatibility**: Migration script handles existing data
- **Rollback strategy**: Can revert to Zustand persist if needed

## Migration Plan

### Phase 1: Create Dexie Schema (Week 1)
- Define Dexie schema for all domain data
- Create migration scripts for existing data
- Implement `useLiveQuery` hooks for reactivity

### Phase 2: Migrate Domain Data (Week 2)
- Create migration script to read from Zustand persist storage
- Write data to Dexie
- Remove persist middleware from stores
- Update components to use `useLiveQuery`

### Phase 3: Update Components (Week 3)
- Replace `useStore` with `useLiveQuery` for domain data
- Keep `useStore` for UI state only
- Add `useShallow` for multiple selectors
- Test all components

### Phase 4: Remove Persist Middleware (Week 4)
- Remove `persist` middleware from all stores
- Remove `partialize` functions
- Remove `onRehydrateStorage` callbacks
- Remove custom storage wrappers

## Success Metrics

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| Stores with Persist | 51 (83%) | <10 (16%) | ✅ Only UI preferences |
| Domain Data in Zustand | ~25 | 0 | ✅ All in Dexie |
| UI State Persisted | ~10 | 0 | ✅ All ephemeral |
| God Stores (>300 lines) | 17 | <5 | ✅ All split |
| Missing useShallow | 56 (69%) | <5 (6%) | ✅ All optimized |

## Related ADRs

- **ADR-039**: Consolidated Project-Centric Architecture - Establishes project-centric model
- **ADR-040**: Canonical Type Registry - Defines type ownership
- **ADR-042**: Agent Brownfield Guard - Enforces governance rules

## References

- `state-layer-boundaries-2026-01-30.md` - Complete state layer analysis
- `new-fundamental-truths.md` - Section 2.2: Storage Strategy
- `AGENTS.md` - State Management Principles
- `Zustand v5 Documentation` - https://zustand.docs.pmnd.rs/
- `Dexie.js Documentation` - https://dexie.org/

---

**Decision Date**: 2026-01-30
**Effective**: Immediately
**Review Date**: 2026-02-28 (after migration complete)