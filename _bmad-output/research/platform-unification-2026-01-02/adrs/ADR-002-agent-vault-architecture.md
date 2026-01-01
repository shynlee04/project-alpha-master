# ADR-002: Agent Vault Architecture

**Status**: ACCEPTED ✅
**Date**: 2026-01-02
**Context**: Cornerstone 2 Analysis (Iteration 2)
**Related**: ADR-001 (Provider Store Consolidation)

---

## Context

The Agent Configuration Vault was previously implemented as a fragmented system with:
- Legacy god store (`agents-store.ts`, 430 lines)
- Circular dependencies with provider-store
- Inconsistent workspace bindings
- No clear separation of concerns

**Problem**: Code analysis showed maintainability issues and complex cross-store communication.

---

## Decision

Implement a **Single Bounded Store with Slice Pattern** following December 2025 Zustand best practices.

### Architecture

```
src/infrastructure/persistence/stores/
├── use-app-store.ts (321 lines) - Single bounded store
└── agents/
    ├── agent-crud-slice.ts (163 lines)
    ├── agent-workspace-bindings-slice.ts (144 lines)
    ├── agent-validation-slice.ts (130 lines)
    ├── agent-events-slice.ts (121 lines)
    └── agent-utils-slice.ts (97 lines)
```

**Total Lines**: 655 lines across 5 focused slices (vs. 430 lines in single god store)

### Key Pattern: Domain Service for Cross-Slice Communication

```typescript
// agent-validation-slice.ts
addAgentValidated: (agent) => {
  const { providerId, modelId } = agent;

  // Use domain service to validate (breaks circular dependency)
  const availableModels = (get() as any).availableModels;
  const validationResult = AgentProviderValidator.validateProviderModel(
    providerId,
    modelId,
    availableModels
  );

  if (!validationResult.isValid) {
    throw new Error(validationResult.error);
  }

  // Call CRUD slice's addAgent method (cross-slice communication via get())
  return get().addAgent(agent);
}
```

---

## Benefits

### 1. Eliminated Circular Dependencies ✅

**Before**:
```
agents-store.ts → provider-store.ts → agents-store.ts (CIRCULAR)
```

**After**:
```
agent-validation-slice.ts → AgentProviderValidator (domain service)
                              ↓
                         Validates against provider models via get()
```

### 2. Modular and Testable ✅

- Each slice < 163 lines (well under 300-line limit)
- Focused single responsibility per slice
- Easy to test in isolation
- Clear boundaries between concerns

### 3. Follows December 2025 Best Practices ✅

- ✅ Single bounded store (no multiple stores)
- ✅ Slice pattern (modular, focused)
- ✅ Individual selectors (no destructuring anti-pattern)
- ✅ Dexie persistence with partialize
- ✅ Domain services for cross-cutting concerns

### 4. Backward Compatible ✅

All consuming components migrated without breaking changes:
- UnifiedAgentSelector.tsx
- AgentConfigDialog.tsx
- AgentManager.tsx
- [13 more components]

---

## Implementation Details

### Slice Breakdown

#### 1. Agent CRUD Slice (163 lines)

**Responsibility**: Pure CRUD operations

```typescript
interface AgentCrudState {
  agents: Agent[];
  addAgent: (agentData: CreateAgentDTO) => Agent;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  getAgent: (id: string) => Agent | undefined;
  getAllAgents: () => Agent[];
}
```

**Key Features**:
- Auto-generates IDs
- Timestamps tracking (createdAt, lastActive)
- Stats tracking (tasksCompleted, successRate, tokensUsed)
- DEFAULT_AGENT pre-seeded

---

#### 2. Agent Workspace Bindings Slice (144 lines)

**Responsibility**: Workspace availability and defaults

```typescript
interface AgentWorkspaceBindingsState {
  // Actions
  setAgentWorkspaceEnabled: (agentId: string, workspaceType: WorkspaceType, enabled: boolean) => void;
  setAgentWorkspaceDefault: (agentId: string, workspaceType: WorkspaceType, isDefault: boolean) => void;

  // Selectors
  isAgentAvailableInWorkspace: (agentId: string, workspaceType: WorkspaceType) => boolean;
  getDefaultAgentForWorkspace: (workspaceType: WorkspaceType) => Agent | undefined;
  getAgentsForWorkspace: (workspaceType: WorkspaceType) => Agent[];
}
```

**Key Features**:
- Per-workspace enable/disable
- Per-workspace default selection
- Efficient filtering queries
- Workspace type safety

---

#### 3. Agent Validation Slice (130 lines)

**Responsibility**: Provider-model validation before creation

```typescript
interface AgentValidationState {
  addAgentValidated: (agentData: CreateAgentDTO) => Agent;
  updateAgentValidated: (id: string, updates: Partial<Agent>) => void;
  validateProviderModel: (providerId: string, modelId: string) => ValidationResult;
}
```

**Key Features**:
- Validates provider exists
- Validates model available in provider
- Uses domain service (AgentProviderValidator)
- Throws descriptive errors

---

#### 4. Agent Events Slice (121 lines)

**Responsibility**: Activity tracking and lifecycle events

```typescript
interface AgentEventsState {
  trackAgentActivity: (agentId: string) => void;
  recordAgentTaskCompletion: (agentId: string, success: boolean, tokens: number) => void;
  resetAgentStats: (agentId: string) => void;
  getMostActiveAgents: (limit?: number) => Agent[];
}
```

**Key Features**:
- Last activity tracking
- Success rate calculation
- Token usage tracking
- Most active agents query

---

#### 5. Agent Utils Slice (97 lines)

**Responsibility**: Utility functions and helpers

```typescript
interface AgentUtilsState {
  getAgentById: (id: string) => Agent | undefined;
  getAgentsByProvider: (providerId: string) => Agent[];
  filterAgents: (predicate: (agent: Agent) => boolean) => Agent[];
  sortAgents: (comparator: (a: Agent, b: Agent) => number) => Agent[];
}
```

**Key Features**:
- Query helpers
- Filtering by provider
- Custom sorting
- Type-safe predicates

---

## Domain Service Pattern

### AgentProviderValidator

**Location**: `src/domain/services/agent-workspace-utils.ts` (106 lines)

**Purpose**: Encapsulates business logic for Agent workspace operations

**Pattern**: Pure functions (no side effects) operating on domain entities

**Available Utilities**:
```typescript
// Check workspace availability
isAgentAvailableIn(agent, workspaceType): boolean

// Check default status
isAgentDefaultFor(agent, workspaceType): boolean

// Filter agents by workspace
getAgentsForWorkspace(agents, workspaceType): Agent[]

// Find default agent
getDefaultAgentForWorkspace(agents, workspaceType): Agent | undefined
```

**Benefits**:
- Agent entity remains pure (data only, no methods)
- Business logic in domain service layer (testable, reusable)
- Functions are composable (can be combined for complex logic)
- Zero circular dependencies (unidirectional data flow)

---

## Persistence Strategy

### Dexie Integration

```typescript
persist(
  (...a) => ({ ...slices }),
  {
    name: 'app-state',
    storage: createDexieStorage('appState'),
    partialize: (state) => ({
      agents: state.agents,
      activeProviderId: state.activeProviderId,
      modelSettings: state.modelSettings,
    }),
    onRehydrateStorage: () => (state) => {
      if (!state.agents || state.agents.length === 0) {
        state.agents = [DEFAULT_AGENT];
      }
      state._hasHydrated = true;
    },
  }
)
```

**Key Decisions**:
- Persist agents array (core data)
- Persist active provider ID (cross-cornerstone reference)
- Persist model settings (user preferences)
- Rehydrate with DEFAULT_AGENT if empty (failsafe)
- Hydration flag for async loading states

---

## Component Migration

### Before (Legacy Pattern)

```typescript
// ❌ Causes infinite loops in Zustand v5
const { agents, addAgent } = useAgentsStore();

// ❌ Direct db access (bypasses store)
const agents = await db.agents.toArray();
```

### After (Individual Selectors)

```typescript
// ✅ Stable references, no infinite loops
const agents = useAppStore(s => s.agents)
const addAgent = useAppStore(s => s.addAgent)

// ✅ Store manages all db interactions
const agents = useAppStore(s => s.agents) // Automatically syncs with Dexie
```

---

## Consequences

### Positive

- **Maintainability**: Each slice < 163 lines, easy to understand
- **Testability**: Focused slices, pure domain services
- **Performance**: Individual selectors prevent unnecessary re-renders
- **Type Safety**: Strongly typed interfaces throughout
- **Zero Circular Dependencies**: Clean unidirectional data flow
- **Production Ready**: Health score 9/10

### Neutral

- **More Files**: 5 slices vs. 1 god store (but better organized)
- **Learning Curve**: Team must understand slice pattern (well-documented)

### Negative

- None identified

---

## Compliance with December 2025 Best Practices

| Practice | Status | Evidence |
|----------|--------|----------|
| Single Bounded Store | ✅ | `use-app-store.ts` combines agents + providers |
| Slice Pattern | ✅ | 5 focused slices, all < 163 lines |
| Individual Selectors | ✅ | Components use `s => s.property` pattern |
| Dexie Persistence | ✅ | `createDexieStorage` adapter |
| Domain Services | ✅ | AgentProviderValidator for cross-cutting logic |
| Zero Circular Deps | ✅ | Domain service breaks cycles |
| Facade Pattern | ✅ | Re-exports for backward compatibility |

---

## Migration Guide

### For New Features

1. **Add action to slice**:
   ```typescript
   // agent-crud-slice.ts
   export const createAgentCrudSlice: StateCreator<AgentCrudState> = (set) => ({
     agents: [DEFAULT_AGENT],

     addAgent: (agentData) => {
       const newAgent: Agent = {
         ...agentData,
         id: generateId(),
         createdAt: new Date().toISOString(),
       };
       set((state) => ({ agents: [...state.agents, newAgent] }));
       return newAgent;
     },
   });
   ```

2. **Use in component**:
   ```typescript
   // MyComponent.tsx
   const agents = useAppStore(s => s.agents)
   const addAgent = useAppStore(s => s.addAgent)

   return (
     <button onClick={() => addAgent({ name: 'New Agent', providerId: 'openrouter', modelId: 'gpt-4' })}>
       Create Agent
     </button>
   );
   ```

### For Legacy Components

1. **Replace store import**:
   ```typescript
   // Before
   import { useAgentsStore } from '@/stores/agents-store';

   // After
   import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
   ```

2. **Update selectors**:
   ```typescript
   // Before
   const { agents, addAgent } = useAgentsStore();

   // After
   const agents = useAppStore(s => s.agents)
   const addAgent = useAppStore(s => s.addAgent)
   ```

---

## References

- [Cornerstone 2 Analysis](_bmad-output/research/platform-unification-2026-01-02/cornerstone-2-agent-analysis.md)
- [December 2025 Zustand Migration Plan](_bmad-output/zustand-migration-plan-2026-01-01.md)
- [December 2025 Zustand Patterns Guide](_bmad-output/zustand-patterns-guide-2026-01-01.md)

---

## Status

**ACCEPTED** ✅

This architecture has been successfully implemented and is production-ready.

**Health Score**: 9/10

**Next**: Apply this pattern to Cornerstone 3 (Conversations) and Cornerstone 4 (Project Management)

---

**END OF ADR-002**
