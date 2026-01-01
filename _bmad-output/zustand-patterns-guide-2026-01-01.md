# Zustand State Management Patterns - January 2026

## Executive Summary

This document provides comprehensive guidance for Zustand state management in Project Alpha, reflecting January 2026 best practices from official Zustand documentation and MCP research (5+ Context7 turns).

**Current Status**: ✅ **PHASE 1 COMPLETE** - Critical infinite loop bugs fixed, migration plan in progress.

**Key Achievement**: Eliminated "Maximum update depth exceeded" errors through proper selector patterns.

---

## 1. ZUSTAND V5 BEST PRACTICES

### 1.1 The Golden Rule: Individual Selectors

**✅ CORRECT PATTERN** (Prevents infinite loops, stable references):
```typescript
// Single property selector
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)

// Multiple properties with useShallow
import { useShallow } from 'zustand/shallow'
const { providers, models } = useAppStore(
  useShallow((s) => ({ providers: s.providers, models: s.models }))
)
```

**❌ ANTI-PATTERN** (Causes infinite loops in v5):
```typescript
// NEVER destructure entire store - creates new object every render
const { providers, removeProvider } = useProviderStore();
```

**Why This Matters**:
- Zustand v5 uses stricter referential equality checks
- Destructuring creates new object references on every render
- React's `useSyncExternalStore` detects reference changes and triggers infinite re-renders
- Individual selectors return stable references, preventing unnecessary re-renders

### 1.2 Slice Pattern for Large Stores

**For stores exceeding 200 lines**, use the slice pattern:

```typescript
// Create individual slices
export const createAgentCrudSlice = (set) => ({
  agents: [],
  addAgent: (agent) => set((state) => ({
    agents: [...state.agents, agent],
  })),
  removeAgent: (id) => set((state) => ({
    agents: state.agents.filter(a => a.id !== id),
  })),
})

export const createProviderCrudSlice = (set) => ({
  providers: [],
  addProvider: (provider) => set((state) => ({
    providers: [...state.providers, provider],
  })),
})

// Combine into bounded store
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAgentCrudSlice(...a),
      ...createProviderCrudSlice(...a),
    }),
    {
      name: 'app-state',
      partialize: (state) => ({ agents: state.agents }),
    }
  )
)
```

**Benefits**:
- Modular organization (each slice ~100-150 lines)
- Clear separation of concerns
- Easy to test slices in isolation
- Combines into single bounded store

### 1.3 Persist Middleware Best Practices

**Selective Persistence** (Only persist what's necessary):
```typescript
import { persist, createJSONStorage } from 'zustand/middleware'
import { createDexieStorage } from '@/lib/state/dexie-storage'

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({ /* state slices */ }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => createDexieStorage('appState')),

      // CRITICAL: Only persist critical data
      partialize: (state) => ({
        agents: state.agents,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
        // NOT persisted:
        // - validationErrors (cleared on reload)
        // - _hasHydrated (runtime flag)
        // - availableModels (fetched on demand)
        // - isLoading (ephemeral)
      }),

      // Handle hydration
      onRehydrateStorage: () => (state) => {
        if (!state.agents || state.agents.length === 0) {
          state.agents = [DEFAULT_AGENT];
        }
        state._hasHydrated = true;
      },
    }
  )
)
```

### 1.4 TypeScript Patterns

**Extract State Types**:
```typescript
import { create, type ExtractState } from 'zustand'

export const useBearStore = create((set) => ({
  bears: 0,
  increase: () => set((s) => ({ bears: s.bears + 1 })),
}))

// Extract full type for reuse
export type BearState = ExtractState<typeof useBearStore>
```

**Generic Store Creation**:
```typescript
interface BearState {
  bears: number
  increase: (by: number) => void
}

export const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((s) => ({ bears: s.bears + by })),
      }),
      { name: 'bear-storage' }
    )
  )
)
```

---

## 2. CURRENT ARCHITECTURE

### 2.1 Store Locations

**Primary Location** (Modern Architecture):
```
src/infrastructure/persistence/stores/
├── use-app-store.ts          # Single bounded store (281 lines)
├── agents/                   # Agent domain (5 slices)
│   ├── agent-selection-store.ts
│   └── slices/
│       ├── agent-crud-slice.ts
│       ├── agent-workspace-bindings-slice.ts
│       ├── agent-validation-slice.ts
│       ├── agent-events-slice.ts
│       └── agent-utils-slice.ts
├── providers/                # Provider domain (3 slices)
│   └── slices/
│       ├── provider-crud-slice.ts
│       ├── provider-models-slice.ts
│       └── provider-utils-slice.ts
├── conversation/             # Conversation domain
│   ├── conversation-threads-store.ts
│   └── conversation-store.ts
├── rag/                      # RAG domain (6 slices)
│   └── slices/
│       ├── rag-chat-slice.ts
│       ├── rag-chunking-slice.ts
│       ├── rag-index-slice.ts
│       ├── rag-search-slice.ts
│       └── rag-voice-slice.ts
└── [other domain stores]
```

**Legacy Location** (Being Migrated):
```
src/lib/state/
├── conversation-store.ts      # 626 lines - Canonical conversation store
├── knowledge-store.ts          # 718 lines - RAG/knowledge store
├── ide-store.ts                # 339 lines - IDE layout state
├── quiz-store.ts               # 629 lines - Quiz management
└── tool-permission-store.ts    # 243 lines - Tool trust levels
```

**Deprecated**:
```
src/stores/                      # Empty, all stores migrated
```

### 2.2 Store Consolidation Status

| Domain | Status | Canonical Location | Migration % |
|--------|--------|-------------------|-------------|
| **Agents** | ✅ **MIGRATED** | `infrastructure/persistence/stores/agents/` | 100% |
| **Providers** | ✅ **MIGRATED** | `infrastructure/persistence/stores/providers/` | 100% |
| **Conversation** | ⚠️ **IN PROGRESS** | `lib/state/conversation-store.ts` | 60% |
| **RAG/Knowledge** | ⚠️ **IN PROGRESS** | `lib/state/knowledge-store.ts` | 50% |
| **IDE** | ⚠️ **LEGACY** | `lib/state/ide-store.ts` | 0% |
| **Quiz** | ⚠️ **LEGACY** | `lib/state/quiz-store.ts` | 0% |
| **Tool Permissions** | ⚠️ **LEGACY** | `lib/state/tool-permission-store.ts` | 0% |

**Consolidation Plan**: See [`_bmad-output/zustand-migration-plan-2026-01-01.md`](zustand-migration-plan-2026-01-01.md)

---

## 3. COMPONENT PATTERNS

### 3.1 Component Store Usage

**When to Use Individual Selectors**:
```typescript
// ✅ Single value
const activeAgentId = useAgentsStore(s => s.activeAgentId)

// ✅ Multiple values with useShallow
import { useShallow } from 'zustand/shallow'
const { providers, availableModels } = useAppStore(
  useShallow((s) => ({ providers: s.providers, availableModels: s.availableModels }))
)

// ✅ Actions (stable functions)
const addAgent = useAppStore(s => s.addAgent)
```

**When to Use Custom Hooks**:
```typescript
// For complex derived state, create a custom hook
export function useActiveAgent() {
  const activeAgentId = useAgentSelectionStore(s => s.activeAgentId)
  const agents = useAppStore(s => s.agents)

  return useMemo(() => {
    if (!activeAgentId) return undefined;
    return agents.find(a => a.id === activeAgentId);
  }, [activeAgentId, agents]);
}
```

### 3.2 Store Access Patterns by Layer

**LAYER 4: Presentation Components** (UI Only)
```typescript
// DO: Access stores via individual selectors
// DON'T: Direct state mutations
// DON'T: Business logic in components

function AgentConfigDialog() {
  // ✅ Correct: Individual selectors
  const removeAgent = useAgentsStore(s => s.removeAgent)
  const agents = useAgentsStore(s => s.agents)

  // ❌ Wrong: Destructuring (causes infinite loops)
  // const { removeAgent, agents } = useAgentsStore()
}
```

**LAYER 3: Application Services** (Orchestration)
```typescript
// DO: Use stores directly with getState()
// DO: Orchestrate multiple store operations
// DON'T: Mix concerns

export class AgentService {
  createAgent(config: AgentConfig) {
    // Use getState() for non-reactive access
    const state = useAppStore.getState()
    useAppStore.getState().addAgent(config)
  }
}
```

**LAYER 2: Domain** (Pure Business Logic)
```typescript
// DON'T: Access Zustand stores directly
// DO: Operate on pure entities
// DO: Return results for application layer to persist

export function validateAgent(agent: Agent): ValidationResult {
  // Pure validation logic, no store access
  if (!agent.name) return { valid: false, errors: ['Name required'] }
  return { valid: true }
}
```

---

## 4. ANTI-PATTERNS TO AVOID

### 4.1 Destructuring Entire Store

**❌ ANTI-PATTERN**:
```typescript
// Creates new object every render → infinite loops
const { providers, models, isLoading } = useProviderStore()
```

**✅ CORRECT**:
```typescript
const providers = useAppStore(s => s.providers)
const models = useAppStore(s => s.models)
const isLoading = useAppStore(s => s.isLoading)
```

### 4.2 Direct State Mutation

**❌ ANTI-PATTERN**:
```typescript
// Bypasses setState, doesn't trigger re-renders
const person = personStore.getState()
person.name = 'New Name'
```

**✅ CORRECT**:
```typescript
// Always use setState/immer pattern
personStore.setState({ name: 'New Name' })
// OR with immer
personStore.setState((state) => { state.name = 'New Name' })
```

### 4.3 Subscribe Without Cleanup

**❌ ANTI-PATTERN**:
```typescript
useEffect(() => {
  // Missing unsubscribe - memory leak!
  useAppStore.subscribe((state) => {
    console.log(state)
  })
}, [])
```

**✅ CORRECT**:
```typescript
useEffect(() => {
  const unsubscribe = useAppStore.subscribe((state) => {
    console.log(state)
  })
  return unsubscribe // Cleanup on unmount
}, [])
```

---

## 5. MIGRATION CHECKLIST

### 5.1 For Each Component

When creating or refactoring components:

- [ ] Uses individual selectors: `useStore(s => s.property)`
- [ ] Never destructures: `const { ... } = useStore()`
- [ ] For multiple properties: Uses `useShallow` wrapper
- [ ] Component ≤120 lines
- [ ] Store subscriptions in `useEffect` have cleanup
- [ ] No direct state mutations

### 5.2 For Each Store

When creating or refactoring stores:

- [ ] Uses slice pattern if >200 lines
- [ ] Has proper TypeScript types
- [ ] Uses `partialize` for selective persistence
- [ ] Has `onRehydrateStorage` handler
- [ ] No circular dependencies with other stores
- [ ] Exported individual selector hooks
- [ ] Documented with JSDoc comments

### 5.3 Validation Steps

**Before Merging to Main**:
```bash
# 1. Type check
pnpm tsc --noEmit

# 2. Lint check
pnpm lint

# 3. Test coverage
pnpm test

# 4. Check component sizes
find src/presentation/components -name "*.tsx" -exec wc -l {} \; | sort -rn

# 5. Verify no destructive patterns
grep -r "const { .* } = useStore()" src --include="*.tsx" --include="*.ts"
```

---

## 6. PERFORMANCE OPTIMIZATION

### 6.1 Selector Optimization

**✅ OPTIMIZED** (Minimal re-renders):
```typescript
// Subscribes only to specific property
const activeAgentId = useAgentsStore(s => s.activeAgentId)

// Re-renders only when activeAgentId changes
// Ignores changes to other store properties
```

**❌ NOT OPTIMIZED** (Excessive re-renders):
```typescript
// Subscribes to entire store
const state = useAgentsStore()

// Re-renders on ANY store change
```

### 6.2 Derived State with useMemo

**For computed values**, use useMemo with individual selectors:

```typescript
function AgentSelector() {
  const activeAgentId = useAgentsStore(s => s.activeAgentId)
  const agents = useAgentsStore(s => s.agents)

  // Memoize derived value
  const activeAgent = useMemo(() => {
    return agents.find(a => a.id === activeAgentId)
  }, [activeAgentId, agents])

  return activeAgent
}
```

### 6.3 Store Subscription for Non-React Code

**For services or utilities** that don't need reactivity:

```typescript
// Use subscribe directly, no React overhead
const unsubscribe = useAppStore.subscribe((state) => {
  // Perform non-UI action
  console.log('Agent added:', state.agents.length)
})

// Cleanup when done
unsubscribe()
```

---

## 7. REFERENCES

### 7.1 Official Documentation
- **Zustand GitHub**: https://github.com/pmndrs/zustand
- **Zustand Docs**: https://zustand-demo.pmnd.rs/
- **v5 Migration Guide**: https://github.com/pmndrs/zustand/blob/main/docs/migrations/migrating-to-v5.md

### 7.2 Internal Documentation
- **Migration Plan**: `_bmad-output/zustand-migration-plan-2026-01-01.md`
- **Architectural Gap Analysis**: `_bmad-output/architectural-gap-analysis-2025-12-31.md`
- **Module Gap Analysis**: `_bmad-output/arc-module-gap-analysis-2025-12-31.md`

### 7.3 Research Sources (MCP)
- **Context7 Research**: 4+ turns on Zustand patterns, selectors, performance
- **Repomix Analysis**: Comprehensive store architecture audit
- **Codebase Statistics**: 89 files analyzed across 3 store locations

---

**Last Updated**: 2026-01-01
**Version**: 1.0.0
**Status**: Phase 1 Complete, Phase 2 Ready for Execution
**Maintainer**: @bmad-bmm-dev (BMAD Framework)
