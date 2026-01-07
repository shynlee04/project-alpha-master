# State Management Patterns

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

---

## Overview

Via-gent uses **Zustand v5** for client state management with **Dexie** (IndexedDB wrapper) for persistence. The architecture follows the **single bounded store** pattern with slice-based modularity.

---

## Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Zustand | Client state management | v5 |
| Dexie | IndexedDB wrapper | v4.2+ |
| dexie-react-hooks | React hooks for Dexie | v4.2+ |
| Event Emitter 3 | Cross-store event bus | v5 |

---

## Store Architecture

### December 2025 Zustand Patterns

The project follows these Zustand v5 best practices:

1. **Slice Pattern:** Split stores into focused slices (<120 lines each)
2. **Persist on Combined Store:** Apply persist middleware ONLY to combined store
3. **partialize:** Selective persistence (API keys yes, UI state no)
4. **version + migrate:** Schema evolution support
5. **Cross-slice Communication:** Use `get()` instead of direct imports
6. **Typed Hooks:** Individual selectors for optimal re-renders

### Store Structure Template

```typescript
// Step 1: Define state and actions interfaces
export interface SomeState {
  data: Record<string, Item>;
  selectedId: string | null;
}

export interface SomeActions {
  setData: (data: Record<string, Item>) => void;
  setSelected: (id: string) => void;
  getData: () => Record<string, Item>;
}

// Step 2: Create slice (≤120 lines)
export const createSomeSlice: StateCreator<SomeSlice> = (set, get) => ({
  // Initial state
  data: {},
  selectedId: null,

  // Actions
  setData: (data) => set({ data }),
  setSelected: (id) => set({ selectedId: id }),
  getData: () => get().data,
});

// Step 3: Combine into single bounded store
export const useSomeStore = create<SomeSlice>()(
  persist(
    (...a) => ({
      ...createSomeSlice(...a),
    }),
    {
      name: 'some-storage',
      partialize: (state) => ({
        data: state.data,  // Persist
        // selectedId NOT persisted (ephemeral)
      }),
    }
  )
);

// Step 4: Individual selectors (optimized re-renders)
export const useSomeData = () => useSomeStore((s) => s.data);
export const useSetSomeData = () => useSomeStore((s) => s.setData);
```

---

## Store Catalog by Domain

### Agent Stores

**Location:** `src/infrastructure/persistence/stores/agents/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `agent-crud-slice.ts` | Agent CRUD operations | ≤120 | ✅ |
| `agent-workspace-bindings-slice.ts` | Workspace filtering | ≤120 | ✅ |
| `agent-validation-slice.ts` | Provider/model validation | ≤120 | ✅ |
| `agent-events-slice.ts` | Cross-workspace events | ≤120 | ✅ |
| `agent-utils-slice.ts` | Selectors, hydration | ≤120 | ✅ |
| `agent-selection-store.ts` | Per-workspace selection | - | ✅ |
| `types.ts` | Agent types | - | ✅ |

**State:** Refactored into 5 slices (✅ Complete)

### Provider Stores

**Location:** `src/infrastructure/persistence/stores/providers/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `provider-crud-slice.ts` | Provider CRUD | ≤120 | ✅ |
| `provider-models-slice.ts` | Model fetching, caching | ≤120 | ✅ |
| `provider-utils-slice.ts` | Model settings, selection | ≤120 | ✅ |
| `migrate-api-keys-to-vault.ts` | API key migration | - | ✅ |
| `types.ts` | Provider types | - | ✅ |

**State:** Refactored into 3 slices (✅ Complete)

### Conversation Stores

**Location:** `src/infrastructure/persistence/stores/conversation/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `conversation-metadata-slice.ts` | Thread CRUD | ≤120 | ✅ |
| `message-crud-slice.ts` | Message operations | ≤120 | ✅ |
| `conversation-utils-slice.ts` | Query helpers | ≤120 | ✅ |
| `conversation-validation-slice.ts` | Pre-execution validation | ≤120 | ✅ |
| `thread-management-slice.ts` | Thread hierarchy | ≤120 | ✅ |
| `conversation-events-slice.ts` | Activity tracking | ≤120 | ✅ |
| `create-context-window-slice.ts` | Token management | ≤120 | ✅ |
| `create-hierarchy-slice.ts` | Parent-child threads | ≤120 | ✅ |
| `create-message-slice.ts` | Message CRUD | ≤120 | ✅ |
| `create-metadata-slice.ts` | Thread metadata | ≤120 | ✅ |
| `create-project-state-slice.ts` | Project association | ≤120 | ✅ |
| `create-thread-crud-slice.ts` | Thread operations | ≤120 | ✅ |

**State:** Split into 6 modular slices (✅ Complete)

### Project Stores

**Location:** `src/infrastructure/persistence/stores/project/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `project-crud-slice.ts` | Project CRUD | ≤120 | ✅ |
| `project-workspace-bindings-slice.ts` | WB-1 bindings | ≤120 | ✅ |
| `project-permissions-slice.ts` | Permission state | ≤120 | ✅ |
| `project-layout-slice.ts` | Layout persistence | ≤120 | ✅ |
| `project-utils-slice.ts` | Query helpers | ≤120 | ✅ |

**State:** Split into 5 slices (✅ Complete)

### RAG Stores

**Location:** `src/infrastructure/persistence/stores/rag/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `rag-index-slice.ts` | Indexing operations | ≤120 | ✅ |
| `rag-search-slice.ts` | Vector search | ≤120 | ✅ |
| `rag-chunking-slice.ts` | Document chunking | ≤120 | ✅ |
| `rag-chat-slice.ts` | RAG chat | ≤120 | ✅ |
| `rag-voice-slice.ts` | Voice indexing | ≤120 | ✅ |

**State:** Split into 5 slices (✅ Complete)

### IDE Stores

**Location:** `src/infrastructure/persistence/stores/ide/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `ide-editor-slice.ts` | Editor state | ≤120 | ✅ |
| `ide-terminal-slice.ts` | Terminal state | ≤120 | ✅ |
| `ide-explorer-slice.ts` | File tree state | ≤120 | ✅ |
| `ide-layout-slice.ts` | Panel layout | ≤120 | ✅ |
| `ide-project-slice.ts` | Project association | ≤120 | ✅ |
| `ide-selectors-slice.ts` | Computed selectors | ≤120 | ✅ |

**State:** Split into 6 slices (✅ Complete)

---

## God Stores Requiring Split

### use-app-store.ts (367 lines) 🔴

**Issue:** Exceeds 300-line limit by 22%

**Current Structure:**
```typescript
// Combines 5 agent slices + 3 provider slices
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),
      ...createProviderCrudSlice(...a),
      ...createProviderModelsSlice(...a),
      ...createProviderUtilsSlice(...a),
    }),
    // ...
  )
);
```

**Remediation:** Already split into slices, but combined store exceeds limit. Need to extract hydration logic.

### plugins-store.ts (316 lines) 🔴

**Issue:** Marketplace, UI state, filters mixed

**Remediation:** Extract into:
- `plugins-marketplace-slice.ts`
- `plugins-ui-slice.ts`
- `plugins-filters-slice.ts`

### terminal-store.ts (307 lines) 🔴

**Issue:** Shell, session, history mixed

**Remediation:** Extract into:
- `terminal-shell-slice.ts`
- `terminal-session-slice.ts`
- `terminal-history-slice.ts`

---

## Cross-Slice Communication

### Pattern: Use get() for Cross-Slice Calls

```typescript
// ❌ WRONG - Direct import causes circular dependency
import { updateProject } from './project-crud-slice';

export const createWorkspaceBindingSlice = (set, get) => ({
  updateWorkspaceBinding: (projectId, binding) => {
    updateProject(projectId, { binding }); // Circular!
  }
});

// ✅ CORRECT - Use get() for cross-slice communication
export const createWorkspaceBindingSlice = (set, get) => ({
  updateWorkspaceBinding: (projectId, binding) => {
    // Call CRUD slice via get() (no circular dependency)
    get().updateProject(projectId, { workspaceBindings: updatedBindings });
  }
});
```

---

## Persistence Strategy

### Dexie IndexedDB Schema

**Location:** `src/infrastructure/persistence/dexie-db.ts`

**Tables:**
- `providerConfigs` - Provider state (used as generic storage)
- `agents` - Agent configurations
- `projects` - Project metadata
- `conversations` - Chat conversations
- `threads` - Conversation threads
- `flashcards` - Study flashcards
- `quizzes` - Quiz data
- `fileMetadata` - File sync metadata
- `toolExecutionLogs` - Tool execution history
- `fsaHandles` - File system handles

### partialize Pattern

```typescript
// ✅ Persist critical data
partialize: (state) => ({
  agents: state.agents,
  activeAgentId: state.activeAgentId,
  projects: state.projects,

  // NOT persisted (ephemeral):
  // - validationErrors (cleared on reload)
  // - _hasHydrated (runtime flag)
  // - isLoading (ephemeral)
  // - selectedModelId (ephemeral)
})
```

---

## Event Bus Pattern

### Cross-Workspace Event Bus

**Location:** `src/lib/events/cross-workspace-event-bus.ts`

**Events:**
- `AGENT_CONFIG_CHANGE` - Agent created/updated/deleted
- `FILE_CHANGE` - File created/modified/deleted
- `WORKSPACE_CHANGED` - User switched workspaces
- `PROVIDER_CONFIG_CHANGE` - Provider API key saved
- `MODELS_UPDATED` - Models list refreshed
- `SYNC_STATUS` - File sync status
- `PROJECT_STATE_CHANGE` - Project opened/closed

**Usage:**
```typescript
// Emit
crossWorkspaceEventBus.emitAgentConfigChange({
  workspaceId: 'ide',
  agentId: 'agent-123',
  changeType: 'updated'
});

// Subscribe
crossWorkspaceEventBus.onAgentConfigChange((event) => {
  // Handle update
});
```

---

## Individual Selectors Pattern

### Preventing Infinite Re-render Loops

```typescript
// ❌ WRONG - Creates new object every render
const { agents, addAgent } = useAgentsStore();

// ✅ CORRECT - Stable reference via individual selector
const agents = useAgentsStore((s) => s.agents);
const addAgent = useAgentsStore((s) => s.addAgent);
```

**Why:** Zustand v5 has stricter referential equality checks. Destructuring creates new object references, triggering infinite re-renders.

---

## Store Fragmentation Issues

### Current Store Locations

| Location | Count | Status |
|----------|-------|--------|
| `infrastructure/persistence/stores/` | Canonical | ✅ Primary |
| `src/lib/state/` | Legacy | 🟡 Migrating |
| `src/lib/workspace/` | Legacy | 🟡 Migrating |
| `src/lib/filesystem/` | Legacy | 🟡 Migrating |
| `src/lib/notes/` | Legacy | 🟡 Migrating |

**Remediation:** Consolidate all to `infrastructure/persistence/stores/`

---

## Performance Patterns

### Selector Optimization

```typescript
// ✅ Use shallow comparison for multiple values
import { useShallow } from 'zustand/shallow';

const { providers, models } = useAppStore(
  useShallow((s) => ({ providers: s.providers, models: s.models }))
);
```

### Computed Selectors

```typescript
// ✅ Memoize derived state
const getAgentsForWorkspace = (workspaceType: WorkspaceType) =>
  useAppStore((state) => state.getAgentsForWorkspace(workspaceType));
```

---

## Testing Patterns

### Store Testing

```typescript
import { renderHook, act } from '@testing-library/react';

describe('agent-crud-slice', () => {
  it('should create agent with auto-generated ID', () => {
    const { result } = renderHook(() => useAgentsStore());

    act(() => {
      result.current.addAgent({ name: 'Test Agent' });
    });

    expect(result.current.agents[0].id).toMatch(/^agent_/);
  });
});
```

---

## References

- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Dexie Documentation](https://dexie.org/)
- [ADR-024: State Consolidation](../../project-planning-artifacts/adr-state-consolidation-2026-01-04.md)
- [Master Risk Register](../quality/reports/MASTER-RISK-REGISTER.md) - God stores catalog
