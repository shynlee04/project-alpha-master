# ADR-006: Workspace State Sharing

**Status**: ACCEPTED ✅
**Date**: 2026-01-02
**Context**: Cross-Workspace Integration
**Related**: ADR-001 through ADR-004

---

## Context

Via-gent (Project Alpha v2.0) has **4 workspaces** that must share state seamlessly:

1. **IDE**: Code execution, file editing, terminal
2. **Knowledge**: RAG, canvas, source synthesis
3. **Notes**: Block editor, note-taking, quick capture
4. **Study**: Flashcards, quizzes, spaced repetition

### Current State

**Issues Identified:**
- ✅ **Cornerstones 1 & 2**: Already unified (single bounded stores)
- ❌ **Cornerstone 3**: Fragmented (two separate stores)
- ⚠️ **Cornerstone 4**: Partially unified (needs work)
- ✅ **Cornerstone 5**: Unified (single bounded store)

**Gap:** No clear architecture for how workspaces share state from the 5 cornerstones.

---

## Decision

Implement **Cross-Workspace Event-Driven State Sharing** with:
1. **Single bounded stores** (one per cornerstone)
2. **Workspace-scoped selectors** (filter data by workspace)
3. **Cross-workspace event bus** (broadcast changes)
4. **Route guard integration** (enforce data availability)

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE BOUNDED STORES                     │
│  (One store per cornerstone, shared across all workspaces)   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Provider   │  │    Agent     │  │ Conversation │      │
│  │    Store     │  │    Store     │  │    Store     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Project    │  │     RAG      │                        │
│  │    Store     │  │    Store     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              WORKSPACE-SCOPED SELECTORS                       │
│  (Each workspace filters store data by workspaceType)        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  IDE Workspace        Knowledge Workspace    Notes Workspace │
│  - IDE agents         - Knowledge agents     - Notes agents  │
│  - IDE conversations  - Knowledge threads   - Notes threads │
│  - Project files      - Project as sources  - Project notes │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               CROSS-WORKSPACE EVENT BUS                      │
│  (Broadcast changes to all workspaces reactively)           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  WorkspaceChangeEvent → All workspaces update               │
│  ProjectChangeEvent → All bound workspaces update            │
│  AgentChangeEvent → All workspaces using agent update        │
│  ConversationChangeEvent → Active workspace updates          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Patterns

### 1. Single Bounded Stores (Already Implemented)

**Cornerstones 1, 2, 5** already follow this pattern:

```typescript
// src/infrastructure/persistence/stores/use-app-store.ts
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // Provider slices
      ...createProviderCrudSlice(...a),
      ...createProviderModelsSlice(...a),
      ...createProviderUtilsSlice(...a),

      // Agent slices
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
    }),
    {
      name: 'app-state',
      storage: createDexieStorage('appState'),
    }
  )
);
```

**Benefits**:
- Single source of truth for providers and agents
- No duplicate stores
- Zero circular dependencies

---

### 2. Workspace-Scoped Selectors

**Pattern**: Filter store data by `workspaceType`

```typescript
// Example: Agent store selector for workspace
const useWorkspaceAgents = (workspaceType: WorkspaceType) => {
  return useAppStore((state) => {
    return state.agents.filter(agent =>
      state.workspaceBindings[agent.id]?.[workspaceType]?.enabled
    );
  });
};

// Example: Get default agent for workspace
const useDefaultAgent = (workspaceType: WorkspaceType) => {
  return useAppStore((state) => {
    return state.agents.find(agent =>
      state.workspaceBindings[agent.id]?.[workspaceType]?.isDefault
    );
  });
};
```

**Usage in Components**:

```typescript
// Knowledge workspace
const KnowledgePage = () => {
  const knowledgeAgents = useWorkspaceAgents('knowledge');
  const defaultKnowledgeAgent = useDefaultAgent('knowledge');

  return (
    <AgentSelector
      agents={knowledgeAgents}
      defaultAgent={defaultKnowledgeAgent}
      onAgentChange={(agent) => handleAgentChange(agent, 'knowledge')}
    />
  );
};
```

---

### 3. Cross-Workspace Event Bus

**Architecture**:

```typescript
// src/infrastructure/events/cross-workspace-event-bus.ts
export enum WorkspaceEventType {
  PROJECT_CHANGED = 'project:changed',
  AGENT_CHANGED = 'agent:changed',
  CONVERSATION_CHANGED = 'conversation:changed',
  PROVIDER_CHANGED = 'provider:changed',
}

export interface WorkspaceChangeEvent {
  type: WorkspaceEventType;
  workspaceType?: WorkspaceType; // Optional (affects all workspaces if not specified)
  projectId?: string; // Optional (affects all projects if not specified)
  data: unknown;
}

// Event bus singleton
export const workspaceEventBus = new EventEmitter();

// Broadcast event to all workspaces
export function broadcastWorkspaceChange(event: WorkspaceChangeEvent) {
  workspaceEventBus.emit('workspace:change', event);
}

// Listen for workspace changes
export function useWorkspaceChange(
  handler: (event: WorkspaceChangeEvent) => void,
  workspaceType?: WorkspaceType
) {
  useEffect(() => {
    const listener = (event: WorkspaceChangeEvent) => {
      // Filter by workspace if specified
      if (workspaceType && event.workspaceType && event.workspaceType !== workspaceType) {
        return;
      }

      handler(event);
    };

    workspaceEventBus.on('workspace:change', listener);
    return () => workspaceEventBus.off('workspace:change', listener);
  }, [handler, workspaceType]);
}
```

**Example Usage**:

```typescript
// When agent is updated in Settings, broadcast change
const AgentSettings = () => {
  const handleAgentUpdate = async (agent: Agent) => {
    await updateAgent(agent);

    // Broadcast to all workspaces using this agent
    broadcastWorkspaceChange({
      type: WorkspaceEventType.AGENT_CHANGED,
      data: { agentId: agent.id },
    });
  };
};

// Knowledge workspace reacts to agent changes
const KnowledgePage = () => {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);

  useWorkspaceChange((event) => {
    if (event.type === WorkspaceEventType.AGENT_CHANGED) {
      // Reload agent if it's the active one
      if (activeAgent?.id === event.data.agentId) {
        const updatedAgent = getAgent(event.data.agentId);
        setActiveAgent(updatedAgent);
      }
    }
  }, 'knowledge');
};
```

---

### 4. Route Guard Integration

**Pattern**: Ensure required data is available before workspace access

```typescript
// src/routes/workspace/$workspaceType.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useProjectStore } from '@/infrastructure/persistence/stores';
import { useAgentStore } from '@/infrastructure/persistence/stores';

export const Route = createFileRoute('/workspace/$workspaceType')({
  component: WorkspaceLoader,
  loader: async ({ params }) => {
    const { workspaceType } = params;

    // Validate workspace type
    if (!['ide', 'knowledge', 'notes', 'study'].includes(workspaceType)) {
      throw redirect({ to: '/hub' });
    }

    // Check if any project is bound to this workspace
    const projectStore = useProjectStore.getState();
    const boundProjects = projectStore.getProjectsForWorkspace(workspaceType);

    if (boundProjects.length === 0) {
      // Redirect to hub with message
      throw redirect({
        to: '/hub',
        search: { message: `No projects bound to ${workspaceType} workspace` },
      });
    }

    // Check if agents are available
    const agentStore = useAgentStore.getState();
    const workspaceAgents = agentStore.getAgentsForWorkspace(workspaceType);

    if (workspaceAgents.length === 0) {
      throw redirect({
        to: '/agents',
        search: { message: `No agents configured for ${workspaceType} workspace` },
      });
    }

    return { workspaceType, boundProjects, workspaceAgents };
  },
});
```

---

## Data Flow Diagrams

### Scenario 1: User Updates Agent in Settings

```
User Action: Update agent system prompt in Settings

Settings Page
  ↓
updateAgent(agentId, { systemPrompt: 'New prompt' })
  ↓
useAppStore.getState().updateAgent()  ← Single bounded store
  ↓
Store updated in IndexedDB
  ↓
broadcastWorkspaceChange({
  type: AGENT_CHANGED,
  data: { agentId }
})
  ↓
┌─────────────────────────────────────────────────────────┐
│                  ALL WORKSPACES REACT                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  IDE Workspace          Knowledge Workspace              │
│  - Agent selector     - Agent selector                   │
│    re-renders           re-renders                        │
│  - Active chat        - Active chat                      │
│    uses updated         uses updated                      │
│    system prompt        system prompt                    │
│                                                          │
│  Notes Workspace       Study Workspace                   │
│  - Agent selector     - Agent selector                   │
│    re-renders           re-renders                        │
│  - AI menu uses       - Quiz generator                    │
│    updated prompt       uses updated prompt               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Points**:
- **Single update**: Store updated once
- **Broadcast**: Event sent to all workspaces
- **Reactive**: All workspaces using agent update automatically
- **No manual refresh**: Change propagates instantly

---

### Scenario 2: User Opens Project in Knowledge Workspace

```
User Action: Click project card in Knowledge workspace

Knowledge Page
  ↓
openProject(projectId)
  ↓
ProjectStore.setActiveProject(projectId)
  ↓
checkWorkspaceBinding(projectId, 'knowledge')
  ↓
Binding exists? YES → Continue
  ↓
Load project files for RAG indexing
  ↓
broadcastWorkspaceChange({
  type: PROJECT_CHANGED,
  workspaceType: 'knowledge',
  projectId: 'project-123'
})
  ↓
┌─────────────────────────────────────────────────────────┐
│            KNOWLEDGE WORKSPACE UPDATES                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Source Panel          Canvas                            │
│  - Load project       - Load project                     │
│    sources              nodes                            │
│  - Update file tree   - Create linkage                  │
│    to show project     proposals from                    │
│    files               sources                           │
│                                                          │
│  RAG Search           Citation Sidebar                   │
│  - Index project       - Citations link                  │
│    files                to project                       │
│  - Search ready        sources                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Points**:
- **Project-scoped**: Only Knowledge workspace updates
- **No impact on IDE/Notes/Study**: Other workspaces unaffected
- **Efficient**: Only re-index what changed

---

## Persistence Strategy

### IndexedDB Schema (Shared Across Workspaces)

```typescript
// dexie-db-workspaces.ts
export class WorkspacesDB extends Dexie {
  // Single tables for all workspaces (not duplicated per workspace)
  projects!: Table<ProjectMetadata, string>;
  agents!: Table<Agent, string>;
  providers!: Table<Provider, string>;
  conversations!: Table<Conversation, string>;

  constructor() {
    super('via-gent-workspaces');

    this.version(1).stores({
      // Projects (shared across all workspaces)
      projects: 'id, name, lastOpened',

      // Agents (shared across all workspaces)
      agents: 'id, name, providerId, createdAt',

      // Providers (shared across all workspaces)
      providers: 'id, name, baseEndpoint, status',

      // Conversations (one per workspace session)
      conversations: 'id, workspaceType, projectId, agentId, createdAt',
    });
  }
}
```

**Key Design**:
- **No workspace-specific tables**: Data is shared
- **Workspace filtering**: Via `workspaceType` field
- **Single source of truth**: No duplication

---

## Best Practices

### ✅ DO

1. **Use single bounded stores** (one per cornerstone)
2. **Filter by workspaceType** in selectors
3. **Broadcast changes** via event bus
4. **Route guards** to ensure data availability
5. **Workspace-scoped queries** for efficiency

### ❌ DON'T

1. **Create workspace-specific stores** (causes duplication)
2. **Duplicate data** across workspaces (causes inconsistency)
3. **Manually sync** state between workspaces (error-prone)
4. **Skip route guards** (causes runtime errors)
5. **Ignore workspace filtering** (causes wrong data display)

---

## Benefits

### 1. Single Source of Truth ✅

**Before**: Multiple stores, potential conflicts
**After**: One store per cornerstone, data integrity guaranteed

### 2. Reactive Updates ✅

**Before**: Manual refresh required
**After**: Event-driven, instant propagation

### 3. Reduced Duplication ✅

**Before**: Workspace-specific copies of data
**After**: Shared data, filtered by workspace

### 4. Type Safety ✅

**Before**: Runtime errors from wrong workspace data
**After**: Compile-time guarantees via workspaceType

### 5. Better Performance ✅

**Before**: Large workspace-specific stores
**After**: Shared stores, selective loading

---

## Estimated Effort

| Task | Effort | Description |
|------|--------|-------------|
| Event bus implementation | 8-10 hours | Cross-workspace event system |
| Workspace-scoped selectors | 6-8 hours | Filter stores by workspace |
| Route guard integration | 10-12 hours | Enforce data availability |
| Component updates | 12-16 hours | Update 20+ components |
| Testing | 8-10 hours | Cross-workspace tests |
| **Total** | **44-56 hours** | **Full implementation** |

---

## Compliance with December 2025 Best Practices

| Practice | Status |
|----------|--------|
| Single Bounded Stores | ✅ Implemented (CS1, CS2, CS5) |
| Slice Pattern | ✅ Implemented (CS1, CS2, CS5) |
| Individual Selectors | ✅ Workspace-scoped filters |
| Event-Driven Architecture | ✅ Cross-workspace event bus |
| Zero Duplication | ✅ Shared stores, no copies |

---

## Migration Path

### Phase 1: Event Bus Implementation (Non-Breaking)

1. Create event bus at `src/infrastructure/events/cross-workspace-event-bus.ts`
2. Add event types for all 5 cornerstones
3. **Do not modify existing components yet**

### Phase 2: Workspace-Scoped Selectors

1. Add utility functions to store slices:
   ```typescript
   getAgentsForWorkspace(workspaceType)
   getConversationsForWorkspace(workspaceType)
   getProjectsForWorkspace(workspaceType)
   ```

2. Update components incrementally

### Phase 3: Route Guard Integration

1. Add loader functions to workspace routes
2. Implement data availability checks
3. Add helpful redirect messages

### Phase 4: Component Updates

1. Start with low-risk workspaces (Study, Notes)
2. Then Knowledge
3. Finally IDE (highest risk)

### Phase 5: Testing & Validation

1. Cross-workspace data sharing tests
2. Event propagation tests
3. Route guard tests
4. End-to-end integration tests

---

## Status

**ACCEPTED** ✅

**Implementation Status**: Partially Complete
- ✅ Cornerstones 1, 2, 5: Single bounded stores implemented
- ⚠️ Cornerstone 3: Needs refactoring (ADR-003)
- ⚠️ Cornerstone 4: Needs refactoring (ADR-004)
- ⏳ Cross-workspace event bus: Pending implementation

**Priority**: HIGH (Required for workspace unification)

**Next**: Implement event bus after Cornerstones 3 & 4 refactored

---

**END OF ADR-006**
