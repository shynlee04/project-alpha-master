# Phase 2 Summary: Data Flow

## State Management Overview

| Category | Count | Health |
|----------|-------|--------|
| **Zustand Stores** | 35+ | 🟡 60% |
| **Dexie Tables** | 26+ | 🟢 80% |
| **Event Buses** | 4 | 🟡 70% |
| **React Contexts** | 7 | 🔴 40% |

---

## Critical Data Flow Issues

### 1. 🔴 P0: useLiveQuery Removed from useWorkspaceAccess
**Location:** `lib/workspace/workspace-access-helper.tsx` (lines 230-238)

**Root Cause:** Dexie's live query subscription mechanism conflicting with React's render cycle

**Impact:**
- Knowledge workspace completely broken
- Study workspace likely broken
- useWorkspaceAccess returns empty data always

**Evidence:**
```typescript
// STATIC MOCK DATA - no database access
const allProjects: ProjectRecord[] = [];
const status: WorkspaceAccessStatus = 'no_projects';
```

### 2. 🔴 P0: React Contexts Not Memoized
**Locations:**
- `lib/workspace/ProjectContext.tsx`
- `infrastructure/persistence/stores/workspace/workspace-context.ts`
- `infrastructure/persistence/stores/workspace/unified-workspace-context.ts`

**Impact:** ALL context consumers re-render on ANY provider change

**Evidence:** Provider values not wrapped in `useMemo()`

### 3. 🟡 P1: Event Bus Payload Bloat
**Location:** Multiple event buses

**Issue:** Full objects passed instead of IDs
**Example:** `'files:changed'` sends full file objects

### 4. 🟡 P1: Missing Dexie Indexes
**Tables:** conversations, notes

**Issue:** Queries scan entire tables
**Impact:** Performance degradation as data grows

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│  (MainLayout, StableNotesWorkspace, IDEWorkspace)           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORES                           │
│  useAppStore │ useIDEStore │ WorkspaceStore │ NoteStore     │
│  (35+ stores, 60% healthy)                                  │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  REACT CONTEXTS  │ │  EVENT BUSES     │ │  DIRECT HOOKS    │
│  (7 contexts,    │ │  (4 buses,       │ │  useNoteStore    │
│   40% healthy)   │ │   70% healthy)   │ │  useChatHistory  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DEXIE DATABASE                           │
│  (26+ tables, 80% healthy)                                  │
│  projects │ conversations │ syncStatus │ notes │ sources   │
└─────────────────────────────────────────────────────────────┘
```

---

## Priority Fixes

### P0 (Immediate - Blocking)
1. **Fix useWorkspaceAccess hook**
   - Re-implement with proper default values
   - Use `useMemo` for query result stability
   - Add explicit undefined handling

2. **Memoize React Context provider values**
   - ProjectContext
   - WorkspaceContext
   - UnifiedWorkspaceContext

### P1 (This Week)
1. **Add missing Dexie indexes**
   - `conversations.updatedAt`
   - `notes.projectId`

2. **Optimize event payloads**
   - Use IDs instead of full objects
   - Add event debouncing

### P2 (This Month)
1. **Split god stores**
   - rag-store.ts (1,595 lines)
   - conversation-threads-store.ts (726 lines)

2. **Create unified data flow documentation**

---

## Phase 2 Complete ✅

**Output Files Created:**
- `zustand-inventory.md` - Complete store inventory
- `dexie-analysis.md` - Database schema and relationships
- `uselivequery-audit.md` - useLiveQuery usage audit
- `event-bus-analysis.md` - Event system mapping
- `context-analysis.md` - React context audit

**Next Phase:** Phase 3 - Performance Analysis (3 sub-agents)
