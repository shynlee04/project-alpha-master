# Store Import Migration Guide (Cycle 1066)

**Purpose**: Exact import path mappings for migrating from legacy to modern stores
**Status**: Reference for Epic CC-1, CP-1, and bulk store migration

---

## Provider Store (✅ Migrated - Cycle 15)

### Old Import Pattern (DEPRECATED)
```typescript
// ❌ DO NOT USE (legacy location)
import { useProviderStore } from '@/lib/state/provider-store';
import { useProviderStore } from '@/stores/provider-store';
```

### New Import Pattern (✅ CORRECT)
```typescript
// ✅ USE THIS (modern location)
import { useAppStore } from '@/infrastructure/persistence/stores/providers';

// Individual selectors (Zustand v5 best practice)
const providers = useAppStore(s => s.providers)
const addProvider = useAppStore(s => s.addProvider)
const removeProvider = useAppStore(s => s.removeProvider)
const updateProvider = useAppStore(s => s.updateProvider)

// Multiple selectors with useShallow
import { useShallow } from 'zustand/shallow'
const { providers, activeProviderId } = useAppStore(
  useShallow((s) => ({ providers: s.providers, activeProviderId: s.activeProviderId }))
)
```

### Store Structure
```
infrastructure/persistence/stores/providers/
├── provider-crud-slice.ts      (addProvider, removeProvider, updateProvider)
├── provider-models-slice.ts    (models, getModels)
├── provider-utils-slice.ts     (activeProviderId, getProvider)
├── types.ts                     (Provider, ProviderState)
└── index.ts                     (useAppStore export)
```

---

## Agent Store (✅ Migrated - Cycle 15, 18)

### Old Import Pattern (DEPRECATED)
```typescript
// ❌ DO NOT USE (legacy location)
import { useAgentsStore } from '@/lib/state/agents-store';
import { useAgentsStore } from '@/stores/agents-store';
```

### New Import Pattern (✅ CORRECT)

**For global agent state**:
```typescript
// ✅ USE THIS (modern location)
import { useAppStore } from '@/infrastructure/persistence/stores/agents';

const agents = useAppStore(s => s.agents)
const addAgent = useAppStore(s => s.addAgent)
const updateAgent = useAppStore(s => s.updateAgent)
```

**For per-workspace agent selection** (Cycle 18 innovation):
```typescript
// ✅ USE THIS (per-workspace selection)
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';

const { selectedAgentId, setSelectedAgent, getAgentsForWorkspace } = useAgentSelectionStore();
```

### Store Structure
```
infrastructure/persistence/stores/agents/
├── slices/
│   ├── agent-crud-slice.ts              (addAgent, removeAgent, updateAgent)
│   ├── agent-events-slice.ts            (subscribe, unsubscribe)
│   ├── agent-utils-slice.ts             (getAgent, getAgentsForWorkspace)
│   ├── agent-validation-slice.ts        (validateAgent, validateAgentConfig)
│   ├── agent-workspace-bindings-slice.ts (getAvailableAgents, setWorkspaceBinding)
│   └── index.ts
├── agent-selection-store.ts             (PER-WORKSPACE selection)
├── types.ts                              (Agent, AgentState, WorkspaceBindings)
└── index.ts                              (useAppStore export)
```

---

## Conversation Store (⏳ 87.5% Migrated - Epic CC-1)

### Old Import Pattern (DEPRECATED)
```typescript
// ❌ DO NOT USE (legacy location)
import { useConversationStore } from '@/lib/state/conversation-store';
import { useConversationThreadsStore } from '@/lib/state/conversation-threads-store';
```

### New Import Pattern (✅ CORRECT)
```typescript
// ✅ USE THIS (modern location)
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation';

const conversations = useConversationStore(s => s.conversations)
const activeConversationId = useConversationStore(s => s.activeConversationId)
const createConversation = useConversationStore(s => s.createConversation)
```

### Store Structure (Epic CC-1 Target)
```
infrastructure/persistence/stores/conversation/
├── slices/
│   ├── create-context-window-slice.ts       (getContextWindow, updateContextWindow)
│   ├── create-hierarchy-slice.ts            (getThreads, getThreadAncestry)
│   ├── create-message-slice.ts              (addMessage, updateMessage, removeMessage)
│   ├── create-metadata-slice.ts             (conversations, activeConversationId)
│   ├── create-project-state-slice.ts        (getProjectConversation, setProjectConversation)
│   ├── create-thread-crud-slice.ts          (createThread, deleteThread, archiveThread)
│   └── index.ts
├── conversation-events-slice.ts            (subscribe, emit)
├── conversation-helpers.ts                  (findConversation, filterConversations)
├── conversation-metadata-slice.ts          (metadata operations)
├── conversation-store.ts                    (unified store)
├── conversation-types.ts                    (Conversation, Message, Thread)
├── conversation-utils-slice.ts              (utils, helpers)
├── conversation-validation-slice.ts        (validateConversation, validateMessage)
├── message-crud-slice.ts                    (message CRUD operations)
├── thread-management-slice.ts              (thread management)
├── types.ts                                 (unified types)
├── useConversationStore.ts                  (export)
└── index.ts                                 (barrel export)
```

**Status**: 6 slices created, component migration batches 2-5 pending

---

## Project Store (❌ NOT MIGRATED - Epic CP-1)

### Current Import Pattern (LEGACY - Still in Use)
```typescript
// ⚠️ CURRENTLY USING (needs migration)
import { useProjectStore } from '@/lib/workspace/project-store';
import { ProjectMetadata } from '@/lib/workspace/project-store';
```

### Target Import Pattern (NOT YET AVAILABLE)
```typescript
// ✅ WILL BE (after Epic CP-1)
import { useProjectStore } from '@/infrastructure/persistence/stores/project';

const projects = useProjectStore(s => s.projects)
const activeProjectId = useProjectStore(s => s.activeProjectId)
```

### Current Store Structure (LEGACY)
```
lib/workspace/
└── project-store.ts  ❌ GOD STORE (450 lines, 3.75x standard)
```

### Target Store Structure (Epic CP-1)
```
infrastructure/persistence/stores/project/
├── project-crud-slice.ts              (createProject, deleteProject, updateProject)
├── project-workspace-bindings-slice.ts (getProjectForWorkspace, setProjectWorkspace)
├── project-permissions-slice.ts        (permissions, checkPermission)
├── project-layout-slice.ts             (layout state, panels)
├── project-utils-slice.ts              (getProject, findProject)
├── index.ts                             (unified store)
└── __tests__/                           (70 tests)
```

**Status**: Epic CP-1 NOT STARTED (18 stories, 80-100 hours)

---

## RAG Store (❌ CRITICAL GOD STORE)

### Current Import Pattern (LEGACY - God Store)
```typescript
// ⚠️ CURRENTLY USING (critical debt)
import { useRAGStore } from '@/lib/state/rag-store';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store'; // DUPLICATE
```

### Problem
- **1,595 lines** (13.3x the 120-line standard)
- **Duplicated** in 2 locations
- **Epic NOT YET SCHEDULED**

### Target Store Structure (NOT YET PLANNED)
```
infrastructure/persistence/stores/rag/
├── rag-metadata-slice.ts          (documents, collections)
├── rag-indexing-slice.ts          (indexing progress, status)
├── rag-retrieval-slice.ts         (search, retrieval)
├── rag-embedding-slice.ts         (embedding operations)
├── rag-chunking-slice.ts          (chunking strategies)
├── rag-utils-slice.ts             (helpers, utilities)
└── index.ts                        (unified store)
```

**Status**: Epic RAG-1 NOT YET DEFINED

---

## IDE Store (⏳ PARTIALLY MIGRATED)

### Old Import Pattern (DEPRECATED)
```typescript
// ❌ DO NOT USE (legacy location)
import { useIDEStore } from '@/lib/state/ide-store';
```

### New Import Pattern (✅ CORRECT)
```typescript
// ✅ USE THIS (modern location)
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';

const openFiles = useIDEStore(s => s.openFiles)
const activeFile = useIDEStore(s => s.activeFile)
const panels = useIDEStore(s => s.panels)
```

**Status**: Migration in progress, not yet consolidated

---

## Tool Permission Store (✅ Migrated - Cycle 12)

### Import Pattern
```typescript
// ✅ USE THIS (modern location with facade)
import { ToolPermissionManager } from '@/lib/agent/tool-permission-manager';

// OR use directly
import { useToolPermissionStore } from '@/infrastructure/persistence/stores/tool-permission';

const trustLevels = useToolPermissionStore(s => s.trustLevels)
const getTrustLevel = useToolPermissionStore(s => s.getTrustLevel)
```

### Features
- **Zustand + Dexie persistence**
- **Partialize** for selective persistence
- **Ephemeral session trust** (cleared on reload)
- **Facade pattern** (backwards compatible)

---

## Legacy Stores (Delete Candidates)

### src/stores/ (DEPRECATED - Delete After Migration)

```typescript
// ❌ DO NOT USE (deprecated)
import { useAgentsStore } from '@/stores/agents-store';
import { useConversationThreadsStore } from '@/stores/conversation-threads-store';
```

**Status**: Empty or archived, safe to delete after confirming all components migrated

---

## Zustand v5 Best Practices (Cycle 18)

### ✅ CORRECT: Individual Selectors

```typescript
// Single property selector (stable reference)
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)

// Multiple properties with useShallow
import { useShallow } from 'zustand/shallow'
const { providers, models } = useAppStore(
  useShallow((s) => ({ providers: s.providers, models: s.models }))
)
```

### ❌ ANTI-PATTERN: Destructuring (Causes Infinite Loops)

```typescript
// NEVER destructure entire store - creates new object every render
const { providers, removeProvider } = useProviderStore(); // ❌ WRONG
```

**Why This Matters**:
- Zustand v5 uses stricter referential equality checks
- Destructuring creates new object references on every render
- React's `useSyncExternalStore` detects reference changes and triggers infinite re-renders
- Individual selectors return stable references, preventing unnecessary re-renders

---

## Migration Checklist

### For Each Store

**Step 1**: Update imports in component
```typescript
// BEFORE
import { useProviderStore } from '@/lib/state/provider-store';
const { providers, removeProvider } = useProviderStore();

// AFTER
import { useAppStore } from '@/infrastructure/persistence/stores/providers';
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)
```

**Step 2**: Update property access
```typescript
// BEFORE
const provider = providers.find(p => p.id === id);

// AFTER (if using individual selectors)
const provider = useAppStore(s => s.providers.find(p => p.id === id));
```

**Step 3**: Run TypeScript check
```bash
pnpm tsc --noEmit
```

**Step 4**: Run tests
```bash
pnpm test
```

**Step 5**: Verify no infinite loops
- Open component in browser
- Check React DevTools for re-render count
- Should be stable (not re-rendering on every state change)

---

## Bulk Migration Script Template

```bash
# Find all files importing from legacy store location
grep -r "from '@/lib/state/" src/ --include="*.tsx" --include="*.ts"

# Find all files importing from deprecated store location
grep -r "from '@/stores/" src/ --include="*.tsx" --include="*.ts"

# Replace imports (example for provider store)
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  "s|from '@/lib/state/provider-store'|from '@/infrastructure/persistence/stores/providers'|g" {} +
```

---

## Test Migration Pattern

```typescript
// BEFORE (legacy)
import { renderHook, act } from '@testing-library/react';
import { useProviderStore } from '@/lib/state/provider-store';

describe('provider store', () => {
  it('should add provider', () => {
    const { result } = renderHook(() => useProviderStore());
    act(() => {
      result.current.addProvider(mockProvider);
    });
    expect(result.current.providers).toContain(mockProvider);
  });
});

// AFTER (modern)
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/infrastructure/persistence/stores/providers';

describe('provider store', () => {
  it('should add provider', () => {
    const { result } = renderHook(() => useAppStore(s => s));
    act(() => {
      result.current.addProvider(mockProvider);
    });
    expect(result.current.providers).toContain(mockProvider);
  });
});
```

---

## Contact & Handoff

**Current Cycle**: 1066
**Epic References**: CC-1 (Conversation), CP-1 (Project), AC-1 (Agents), AC-1.5 (Providers)
**Analysis**: Full patterns available in packed codebase (104MB XML)
**Next Update**: After Epic CC-1 completion

---

**Generated by**: Ralph Loop Cycle 1066
**Timestamp**: 2026-01-03
**Purpose**: Exact import path mappings for error reduction work
