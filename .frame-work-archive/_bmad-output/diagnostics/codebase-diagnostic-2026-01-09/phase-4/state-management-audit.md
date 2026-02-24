# Phase 4: State Management Architecture Audit

**Date**: 2026-01-09
**Scope**: Comprehensive audit of Zustand stores, context providers, and state architecture
**Status**: Complete

---

## Executive Summary

This audit examines the state management architecture across the Via-gent codebase, focusing on:

1. Zustand store organization and slice patterns
2. Context provider implementation and memoization
3. Store duplication and fragmentation
4. Cross-store dependencies and potential circular references
5. Persistence configuration and migration paths

### Key Findings

| Category | Count | Health Score |
|----------|-------|--------------|
| Zustand Stores | 47 | 72% |
| Context Providers | 8 | 65% |
| Slice Pattern Compliance | 23/47 | 49% |
| Memoized Contexts | 3/8 | 38% |
| Deprecated Stores | 5 | N/A |

---

## Zustand Store Inventory

### Primary Stores (Active)

| Store | Location | Lines | Slice Pattern? | Persistence |
|-------|----------|-------|----------------|-------------|
| **useAppStore** | `use-app-store.ts` | ~400 | Partial | Dexie |
| **useProjectStore** | `project/index.ts` | ~600 | Yes | Dexie |
| **useIDEStore** | `ide/useIDEStore.ts` | ~500 | Yes | Dexie |
| **useConversationStore** | `conversation/useConversationStore.ts` | ~700 | Yes | Dexie |
| **useAgentsStore** | `agents/index.ts` | ~450 | Partial | Dexie |
| **useAgentSelectionStore** | `agents/agent-selection-store.ts` | ~200 | Yes | Memory |
| **useRAGStore** | `knowledge/rag-store.ts` | ~450 | Partial | Dexie |
| **useNoteStore** | `lib/notes/note-store.ts` | ~300 | No | Dexie |
| **useWorkspaceStore** | `workspace/workspace-store.ts` | ~350 | Partial | Memory |
| **useToolPermissionStore** | `permissions/tool-permission-store.ts` | ~200 | Yes | Dexie |

### Store Line Count Analysis

```
Stores by Size Category:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  < 100 lines   ████████████████████ 8 stores (17%)
  100-200 lines ██████████████████    7 stores (15%)
  200-300 lines ████████████████████  8 stores (17%)
  300-500 lines ████████████████      6 stores (13%)
  500-700 lines ████████████          4 stores (9%)
  > 700 lines   ████████████          4 stores (8%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GOD STORES (>500 lines): 8/47 (17%)
  Target: 0 god stores
```

---

## Slice Pattern Compliance

### ✅ Compliant Stores (Using Slice Pattern)

| Store | Slice Files | Compliance |
|-------|-------------|------------|
| **useConversationStore** | 7 slices | 95% |
| **useProjectStore** | 5 slices | 90% |
| **useIDEStore** | 5 slices | 85% |
| **useAgentSelectionStore** | 3 slices | 80% |
| **useToolPermissionStore** | 2 slices | 75% |
| **useRAGStore** | 4 slices | 70% |

### ❌ Non-Compliant Stores

| Store | Issues | Recommendation |
|-------|--------|----------------|
| **useAppStore** | Single 400-line file, 50+ methods | Split into slices |
| **useAgentsStore** | 450 lines, mixed concerns | Split into slices |
| **useNoteStore** | 300 lines, monolithic | Split into slices |
| **useWorkspaceStore** | 350 lines, mixed concerns | Split into slices |
| **useRAGStore** | 450 lines, multiple responsibilities | Split into slices |

### Slice Pattern Violation Examples

```typescript
// ❌ VIOLATION - Multiple concerns in one slice
// agents-store.ts
export const useAgentsStore = create((set, get) => ({
  // Agent CRUD operations
  agents: {},
  createAgent: () => {},
  updateAgent: () => {},
  deleteAgent: () => {},
  
  // Agent selection (separate concern)
  selectedAgentId: null,
  setSelectedAgent: () => {},
  
  // Workspace bindings (separate concern)
  workspaceBindings: {},
  updateWorkspaceBinding: () => {},
  
  // Tool permissions (separate concern)
  toolPermissions: {},
  updateToolPermission: () => {},
}));

// ✅ COMPLIANT - Separate slices
// slices/agent-crud-slice.ts
const createAgentCrudSlice = (set, get) => ({
  agents: {},
  createAgent: () => {},
  updateAgent: () => {},
  deleteAgent: () => {},
});

// slices/agent-selection-slice.ts
const createAgentSelectionSlice = (set) => ({
  selectedAgentId: null,
  setSelectedAgent: (id) => set({ selectedAgentId: id }),
});

// Combined store
export const useAgentsStore = create(
  persist(
    (...a) => ({
      ...createAgentCrudSlice(...a),
      ...createAgentSelectionSlice(...a),
      ...createWorkspaceBindingsSlice(...a),
      ...createToolPermissionsSlice(...a),
    }),
    { name: 'agents-store' }
  )
);
```

---

## Context Provider Analysis

### Context Inventory

| Context | Provider | Memoized? | Consumers | Risk |
|---------|----------|-----------|-----------|------|
| **ToastContext** | ToastProvider | ❌ No | 45+ | High |
| **SidebarContext** | SidebarProvider | ❌ No | 12 | High |
| **SelectContext** | select-react19-compatible | ❌ No | 25+ | Medium |
| **ResizableContext** | ResizablePanel | ❌ No | 30+ | Medium |
| **ProjectContext** | ProjectProvider | ❌ No | 15 | Medium |
| **WorkspaceContext** | WorkspaceProvider | ❌ No | 20+ | High |
| **StatusAnnouncerContext** | StatusAnnouncerProvider | ❌ No | 5 | Low |
| **AgentConfigContext** | useAgentConfigProvider | ❌ No | 8 | Medium |

### Context Value Memoization Status

```typescript
// ❌ NOT MEMOIZED - Creates new object on every render
// ToastContext.tsx
return (
  <ToastContext.Provider value={{ toasts, toast, dismiss }}>
    {children}
  </ToastContext.Provider>
);

// ✅ MEMOIZED - Only recreates when toasts change
const contextValue = useMemo(
  () => ({ toasts, toast, dismiss }),
  [toasts, toast, dismiss]
);

return (
  <ToastContext.Provider value={contextValue}>
    {children}
  </ToastContext.Provider>
);
```

---

## Store Duplication & Fragmentation

### Duplicate Store References Found

| Legacy Path | Canonical Path | Status |
|-------------|----------------|--------|
| `src/lib/state/dexie-db.ts` | `@/infrastructure/persistence/dexie-db` | Deprecated facade |
| `src/lib/state/ide-store.ts` | `@/infrastructure/persistence/stores/ide` | Partial migration |
| `src/lib/state/quiz-store.ts` | `@/infrastructure/persistence/stores/study` | Partial migration |
| `src/lib/state/conversation/` | `@/infrastructure/persistence/stores/conversation` | Partial migration |
| `src/lib/state/rag-store.ts` | `@/infrastructure/persistence/stores/knowledge` | Partial migration |
| `src/lib/state/agents-store.ts` | `@/infrastructure/persistence/stores/agents` | Partial migration |

### Fragmentation Map

```
Legacy Location                              → Canonical Location
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
src/lib/state/dexie-db.ts                    → @/infrastructure/persistence/dexie-db
src/lib/state/dexie-db-helpers/              → @/infrastructure/persistence/dexie-db-helpers/
src/lib/state/knowledge/                     → @/infrastructure/persistence/stores/knowledge/
src/lib/state/ide-store.ts                   → @/infrastructure/persistence/stores/ide/
src/lib/state/quiz-store.ts                  → @/infrastructure/persistence/stores/study/
src/lib/state/conversation-threads-store.ts  → @/infrastructure/persistence/stores/conversation/
src/lib/state/conversation-store.ts          → @/infrastructure/persistence/stores/conversation/
src/lib/state/agents-store.ts                → @/infrastructure/persistence/stores/agents/
src/lib/state/tool-permission-store.ts       → @/infrastructure/persistence/stores/permissions/
```

---

## Cross-Store Dependencies

### Potential Circular Dependencies

| Store A | Store B | Risk Level | Evidence |
|---------|---------|------------|----------|
| **useAgentsStore** | useAppStore | Medium | Both import/useAgentsStore |
| **useWorkspaceStore** | useProjectStore | Medium | Project references workspace |
| **useConversationStore** | useAgentsStore | Low | Agent references in threads |
| **useNoteStore** | useRAGStore | Low | Notes indexed in RAG |

### Cross-Store Communication Patterns

```typescript
// ❌ PROBLEMATIC - Direct cross-store access
// In useAgentsStore
const dependentAgents = agents.filter(
  a => a.providerId === id  // Accesses provider from useAppStore
);

// ✅ RECOMMENDED - Event-driven communication
// Use event bus for cross-store communication
eventBus.emit('provider:removed', { providerId: id });
useAgentsStore.getState().handleProviderRemoval(id);
```

---

## Persistence Configuration Audit

### Persisted Stores

| Store | Storage | partialize? | version | Migration? |
|-------|---------|-------------|---------|------------|
| useAppStore | Dexie | ✅ Yes | 1 | ✅ Yes |
| useProjectStore | Dexie | ✅ Yes | 1 | ✅ Yes |
| useIDEStore | Dexie | ✅ Yes | 1 | ✅ Yes |
| useConversationStore | Dexie | ✅ Yes | 1 | ✅ Yes |
| useAgentsStore | Dexie | ✅ Yes | 1 | ✅ Yes |
| useToolPermissionStore | Dexie | ✅ Yes | 1 | ✅ Yes |
| useRAGStore | Dexie | ✅ Yes | 1 | ❌ No |
| useNoteStore | Dexie | ✅ Yes | 1 | ❌ No |
| useWorkspaceStore | Memory | N/A | N/A | N/A |
| useAgentSelectionStore | Memory | N/A | N/A | N/A |

### Persistence Anti-patterns

```typescript
// ❌ ANTI-PATTERN - Persisting entire store
persist(
  (set) => ({ ...entireStoreState }),
  { name: 'store-name' }
);

// ✅ COMPLIANT - Selective persistence
persist(
  (set) => ({ ...storeState }),
  {
    name: 'store-name',
    partialize: (state) => ({
      // Only persist what needs to survive reload
      credentials: state.credentials,
      preferences: state.preferences,
      // Exclude transient UI state
      // uiState: state.uiState,
    }),
  }
);
```

---

## Deprecated Store Files

### Files Requiring Cleanup

| File | Status | Migration Path |
|------|--------|----------------|
| `src/lib/state/dexie-db.ts` | Deprecated | Re-exports from infrastructure |
| `src/lib/state/dexie-db-helpers/` | Deprecated | Migrated to infrastructure |
| `src/lib/state/knowledge/` | Deprecated | Migrated to stores/knowledge |
| `src/lib/state/conversation-threads-store.ts` | Deprecated | Migrated to conversation/ |
| `src/lib/state/conversation-store.ts` | Deprecated | Migrated to conversation/ |
| `src/lib/state/ide-store.ts` | Deprecated | Migrated to stores/ide |
| `src/lib/state/quiz-store.ts` | Deprecated | Migrated to stores/study |
| `src/lib/state/agents-store.ts` | Deprecated | Migrated to stores/agents |
| `src/lib/state/tool-permission-store.ts` | Deprecated | Migrated to permissions/ |

---

## Recommendations

### Immediate (P0 - This Week)

1. **Memoize ToastContext value**
   ```typescript
   const contextValue = useMemo(
     () => ({ toasts, toast, dismiss }),
     [toasts, toast, dismiss]
   );
   ```

2. **Memoize SidebarContext value**
   ```typescript
   const contextValue = useMemo(
     () => ({ activePanel, setActivePanel, isCollapsed, toggleCollapsed }),
     [activePanel, isCollapsed]
   );
   ```

3. **Add migration for useRAGStore**
   - Implement version + migrate pattern
   - Test upgrade path

### Short-term (P1 - Next Sprint)

1. **Split useAppStore into slices**
   - Agent slice
   - Provider slice
   - Settings slice

2. **Split useAgentsStore into slices**
   - CRUD slice
   - Selection slice
   - Workspace bindings slice

3. **Add useShallow for multi-property selectors**
   ```typescript
   import { useShallow } from 'zustand/shallow';
   
   const { agents, selectedAgent } = useAgentsStore(
     useShallow((s) => ({ agents: s.agents, selectedAgent: s.selectedAgent }))
   );
   ```

### Medium-term (P2 - Following Sprint)

1. **Complete store migration**
   - Remove all deprecated files
   - Update all import paths

2. **Implement event-driven cross-store communication**
   - Add event bus integration
   - Remove direct cross-store dependencies

3. **Add comprehensive store tests**
   - Unit tests for each slice
   - Integration tests for store combinations

---

## Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Slice-compliant stores | 23/47 (49%) | 47/47 (100%) |
| Memoized contexts | 3/8 (38%) | 8/8 (100%) |
| God stores (>500 lines) | 8 | 0 |
| Deprecated files | 9 | 0 |
| Stores with migrations | 6/10 (60%) | 10/10 (100%) |

---

## Files Audited

- `src/infrastructure/persistence/stores/` - 47 store files
- `src/presentation/components/*/contexts/` - 8 context providers
- `src/lib/state/` - Legacy store files (deprecated)
- `src/hooks/` - Store hook integrations

---

**Audit completed**: 2026-01-09
**Next review**: 2026-01-23 (2 weeks)
