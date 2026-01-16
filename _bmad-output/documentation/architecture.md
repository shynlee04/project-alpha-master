# Architecture Documentation

**Generated:** 2026-01-07
**Last Updated:** 2026-01-16
**Scan Mode:** Exhaustive
**Status:** Aligned with ADR-033, Fundamental Truth Checklist

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Platform Contract & Device Detection](#platform-contract--device-detection)
3. [Layer Responsibilities](#layer-responsibilities)
4. [State Management Boundaries](#state-management-boundaries)
5. [Key Architectural Decisions](#key-architectural-decisions)
6. [Data Flow Patterns](#data-flow-patterns)
7. [Project Space Routing](#project-space-routing)
8. [BYOK Architecture](#byok-architecture)
9. [Store Architecture](#store-architecture)
10. [Component Architecture](#component-architecture)
11. [Integration Points](#integration-points)
12. [Technology Rationale](#technology-rationale)
13. [Architecture Concerns](#architecture-concerns)

---

## System Architecture

Via-gent follows **4-Layer Clean Architecture** with dependency inversion:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  React Components (468 files)                                │  │
│  │  - Workspace pages (IDE, Knowledge, Notes, Study)           │  │
│  │  - UI components (dialogs, inputs, buttons)                 │  │
│  │  - Layout components (panels, resizable)                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                           │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Application Services                                        │  │
│  │  - Agent orchestration                                       │  │
│  │  - Workspace switching                                       │  │
│  │  - File synchronization                                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                     │
├─────────────────────────────────────────────────────────────────────┤
│                           DOMAIN LAYER                             │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Entities & Value Objects                                     │  │
│  │  - Agent (with workspace bindings)                           │  │
│  │  - Workspace (type, state)                                  │  │
│  │  - Tool permissions                                          │  │
│  │  - Domain services (pure functions)                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE LAYER                        │
│  ┌───────────────────┐  ┌───────────────────┐  ┌──────────────┐  │
│  │  Zustand Stores    │  │  Dexie IndexedDB  │  │ WebContainer │  │
│  │  - UI State        │  │  - Persistence     │  │ - Code exec  │  │
│  │  - Reactivity      │  │  - Queries         │  │              │  │
│  └───────────────────┘  └───────────────────┘  └──────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Cross-Workspace Event Bus                                   │  │
│  │  - Provider config changes                                   │  │
│  │  - Agent updates                                             │  │
│  │  - File changes                                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Platform Contract & Device Detection

### PlatformContract Interface (P0-4)

Platform detection is performed **ONCE at app start**. The contract is immutable and used throughout the application.

```typescript
// Platform detection - done ONCE at app start
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;        // Desktop only
  canWatchFiles: boolean;       // Desktop with FSA
  canRunTerminal: boolean;      // Desktop with WebContainer
  canDoAgenticCoding: boolean;  // Desktop with FSA + Terminal
  canAccessIDE: boolean;        // Desktop only
}

// ✅ CORRECT: Call once, use everywhere
const platform = getPlatformContract();
if (!platform.canAccessIDE) {
  redirect({ to: '/notes/$projectId', params });
}

// ❌ WRONG: Check device type at call site
if (navigator.userAgent.match(/mobile/i)) { ... }  // NEVER
if (window.innerWidth < 768) { ... }  // NEVER for routing
```

### Device Detection Strategy

| Device Type | Storage | IDE Access | Terminal | Agentic Coding |
|-------------|---------|------------|----------|----------------|
| **Desktop** | FSA | Full | Yes | Yes |
| **Tablet** | IndexedDB | Blocked | No | No |
| **Mobile** | IndexedDB | Blocked | No | No |

### ADR-033 Key Decisions (Non-Negotiable)

| Decision | Rule | Enforcement |
|----------|------|-------------|
| **D1: Platform Detection** | Auto-detect ONCE at app start. Desktop=FSA, Mobile=IndexedDB | Never check device type at call sites |
| **D2: Storage Immutable** | Storage type set at project creation, never changes | Never decide FSA vs IndexedDB per operation |
| **D3: IDE Desktop Only** | IDE workspace blocked on mobile/tablet | Always redirect mobile to Notes |
| **D4: Notes on FSA** | Desktop notes save as `.md` files in `/project/notes/` | Same tech as IDE, bidirectional sync |
| **D5: Persist First** | Write to DexieDB FIRST, then update Zustand | Never update Zustand without DB success |
| **D6: Single Database** | Only `ViaGentDatabase` for all tables | Never create new Dexie databases |
| **D7: Path-Based IDs** | File IDs are relative paths from project root | Never use UUIDs for file identity |
| **D8: Metadata Folder** | `.viagent/` at project root for metadata | Never scatter metadata files |

---

## Layer Responsibilities

### Presentation Layer (`src/presentation/`)

**Responsibility:** UI rendering and user interaction

**Key Patterns:**
- Component composition over inheritance
- Custom hooks for state access
- Event handlers delegate to application layer
- No business logic, only UI logic

**Key Files:**
```
src/presentation/components/
├── ide/              # IDE workspace components
├── knowledge/         # Knowledge workspace components
├── notes/             # Notes workspace components
├── study/             # Study workspace components
├── agent/             # Agent configuration UI
├── chat/              # Chat interface components
└── ui/                # Reusable UI components
```

### Application Layer (`src/application/`)

**Responsibility:** Orchestration and workflow coordination

**Key Patterns:**
- Services coordinate between domain and infrastructure
- Use cases encapsulate business workflows
- Hooks bridge presentation to application

**Key Files:**
```
src/application/services/
├── AgentOrchestrationService.ts
├── WorkspaceTransitionService.ts
└── ...

src/domain/use-cases/
├── switch-workspace-use-case.ts
└── ...
```

### Domain Layer (`src/domain/`)

**Responsibility:** Core business logic and rules

**Key Patterns:**
- Pure functions (no side effects)
- No framework dependencies
- Entity-driven design
- Domain services for cross-entity operations

**Key Files:**
```
src/domain/
├── entities/
│   ├── agent.ts           # Agent entity with workspace bindings
│   └── ...
├── value-objects/
│   ├── workspace-type.ts
│   ├── tool-permission.ts
│   └── ...
└── services/
    ├── agent-workspace-utils.ts    # Pure functions
    └── ...
```

### Infrastructure Layer (`src/infrastructure/`)

**Responsibility:** External concerns and persistence

**Key Patterns:**
- Zustand stores with Dexie persistence
- Event bus for cross-workspace communication
- Adapter pattern for external services

**Key Files:**
```
src/infrastructure/
├── persistence/
│   ├── stores/           # Zustand stores
│   ├── dexie-db.ts       # IndexedDB schema
│   └── dexie-storage.ts  # Dexie adapter
├── events/
│   └── cross-workspace-event-bus.ts
└── sync/
    └── ...
```

---

## State Management Boundaries

### Zustand vs Dexie Responsibilities (P0-5)

**Zustand** (Reactive UI State):
- Triggers React re-renders
- Temporary UI state (modals, selections, loading states)
- In-memory operations
- Fast access for component consumption

**Dexie IndexedDB** (Persistent Storage):
- Survives page reloads
- Cross-session data
- Source of truth for all application data
- Indexed queries for performance

### Persist-First Pattern (ADR-033 D5)

```typescript
// ✅ CORRECT: Persist first, then Zustand
async createNote(input: CreateNoteInput): Promise<Note> {
  const note = generateNote(input);

  // Step 1: Persist to DexieDB FIRST (fail-fast)
  await db.notes.put(note);

  // Step 2: Update Zustand ONLY after persistence succeeds
  set((state) => ({ notes: [...state.notes, note] }));

  return note;
}

// ❌ WRONG: Zustand first (data loss risk)
async createNote(input: CreateNoteInput): Promise<Note> {
  const note = generateNote(input);
  set((state) => ({ notes: [...state.notes, note] }));  // Lost if DB fails!
  await db.notes.put(note);
  return note;
}
```

### Hydration Strategy

**Rules:**
1. Wait for hydration before querying Dexie from Zustand stores
2. Use event-driven detection (not time-based)
3. Show loading state during hydration
4. Never assume data is available before hydration completes

```typescript
// ✅ CORRECT: Wait for hydration
const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true })
    }),
    {
      name: 'projects-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      }
    }
  )
);

// Usage: always check hydration
const { projects, hydrated } = useProjectStore();
if (!hydrated) return <LoadingSpinner />;
```

### Responsibility Matrix

| Concern | Zustand | Dexie |
|---------|---------|-------|
| UI State (modals, selections) | ✅ | ❌ |
| Projects | ✅ (cached) | ✅ (source) |
| Notes | ✅ (cached) | ✅ (source) |
| Agents | ✅ | ✅ |
| Conversations | ✅ | ✅ |
| Settings | ✅ | ✅ |
| File System | ❌ | ✅ (IndexedDB mode only) |

---

## Key Architectural Decisions

### 1. Single Bounded Store (Zustand v5)

**Decision:** Combine related state into single bounded stores instead of multiple scattered stores.

**Rationale:**
- Eliminates circular dependencies
- Simplifies cross-slice communication via `get()`
- Single hydration point for persisted state

**Example:**
```typescript
// Agent store combines 5 slices
export const useAgentsStore = create<AgentsStore>()(
  persist(
    (...a) => ({
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),
    }),
    { name: 'agents-storage', ... }
  )
);
```

### 2. Cross-Workspace Event Bus

**Decision:** Use event bus for workspace-to-workspace communication.

**Rationale:**
- Workspaces are isolated but need to sync state
- Agent configuration changes should propagate
- File changes need to be visible across workspaces

**Example:**
```typescript
crossWorkspaceEventBus.emitAgentConfigChange({
  workspaceId: 'ide',
  agentId: 'agent-123',
  changeType: 'updated'
});
```

### 3. Facade Pattern for Legacy Code

**Decision:** Keep legacy paths as facades during migration.

**Rationale:**
- Zero breaking changes during refactoring
- Gradual migration path
- Clear deprecation warnings

**Example:**
```typescript
// src/lib/state (deprecated)
export * from '@/infrastructure/persistence/stores/ide';
```

### 4. Workspace-Aware Agents

**Decision:** Agents have workspace-specific availability and tool permissions.

**Rationale:**
- Not all agents are useful in all workspaces
- Tools may have different permissions per workspace
- User needs control over agent capabilities

**Data Structure:**
```typescript
interface Agent {
  id: string;
  name: string;
  workspaceBindings: WorkspaceBinding[];  // Per-workspace availability
  tools: AgentToolBinding[];              // Per-workspace permissions
}
```

### 5. Local-First with IndexedDB

**Decision:** Use Dexie (IndexedDB wrapper) for all persistent state.

**Rationale:**
- Works offline
- Better than localStorage (async, larger capacity)
- Indexed by queries
- Transactional integrity

### 6. Platform Contract (ADR-033)

**Decision:** Single platform detection at app start, immutable thereafter.

**Rationale:**
- Eliminates device detection scattered across codebase
- Consistent behavior throughout session
- Enables proper feature gating per device type

---

## Data Flow Patterns

### Agent Tool Execution Flow

```
┌─────────────┐
│   User      │  "Run npm install"
└──────┬──────┘
       ↓
┌─────────────────────────────────────────────────────────┐
│  Presentation: AgentChatPanel                           │
│  - Displays user message                                  │
│  - Shows tool approval UI                                 │
└──────┬──────────────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────────────┐
│  Application: useAgentChatWithTools                      │
│  - Orchestrates chat + tools                              │
│  - Handles streaming responses                             │
└──────┬──────────────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────────────┐
│  Domain: WorkspacePermissionManager                      │
│  - Validates tool permissions for workspace              │
│  - Checks trust level (auto/prompt/block)                │
└──────┬──────────────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────────────┐
│  Infrastructure: ToolExecutor                            │
│  - Delegates to file/terminal facades                    │
│  - Executes in WebContainer                               │
└──────┬──────────────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────────────┐
│  External: WebContainer                                   │
│  - Runs shell command                                      │
│  - Streams output back                                   │
└─────────────────────────────────────────────────────────┘
```

### File Synchronization Flow

```
Local FS (FSA)          LocalFSAdapter          SyncManager          WebContainer
     │                        │                        │                     │
     │ 1. Read file           │                        │                     │
     ├──────────────────────>│                        │                     │
     │                        │ 2. Detect change       │                     │
     │                        ├──────────────────────>│                     │
     │                        │                        │ 3. Queue sync       │
     │                        │                        ├──────────────────> │
     │                        │                        │                     │ 4. Write file
     │                        │                        │<──────────────────┤
     │                        │ 5. Confirm synced       │
     │                        │<───────────────────────┤
     │ 6. Update UI           │                        │
     │<───────────────────────┤                        │
```

### Hydration Flow

```
App Start
    ↓
Get Platform Contract (once)
    ↓
Initialize Zustand Stores with Persist
    ↓
Wait for onRehydrateStorage callback
    ↓
Mark store as hydrated
    ↓
Allow UI to render with data
```

### Project Selection Flow

```
Homepage
    ↓
Platform Check → Device Type
    ↓
    ├─ Desktop: Show project list + create new
    └─ Mobile/Tablet: Show create new only
    ↓
Select/Create Project
    ↓
Generate projectId: "proj_{uuid}"
    ↓
Determine storageType: FSA (desktop) or IndexedDB (mobile)
    ↓
Show Workspace Selection
    ↓
    ├─ IDE (desktop only) → redirect to /ide/$projectId
    ├─ Notes → redirect to /notes/$projectId
    ├─ Knowledge → redirect to /knowledge/$projectId
    └─ Study → redirect to /study/$projectId
```

---

## Project Space Routing

### Project ID Format

**Canonical Format:** `proj_{uuid}`

Example: `proj_a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Entry Matrix

| User Type | Device | Entry Point | Options |
|-----------|--------|-------------|---------|
| **New User** | Desktop | Homepage | Create project → select workspace |
| **New User** | Mobile/Tablet | Homepage | Create project → select workspace (IDE blocked) |
| **Returned User** | Desktop | Homepage | Select from list OR create new → select workspace |
| **Returned User** | Mobile/Tablet | Homepage | Create new (no list, IndexedDB only) → select workspace |

### Route Structure

| Route | Workspace | Device Restriction | Storage |
|-------|-----------|-------------------|---------|
| `/ide/$projectId` | IDE | Desktop only | FSA |
| `/notes/$projectId` | Notes | All devices | FSA (desktop) / IndexedDB (mobile) |
| `/knowledge/$projectId` | Knowledge | All devices | FSA (desktop) / IndexedDB (mobile) |
| `/study/$projectId` | Study | Disabled (MVP) | N/A |

### Route Guard Pattern

```typescript
// ✅ CORRECT: Every workspace route has beforeLoad guard
export const Route = createFileRoute('/ide/$projectId')({
  beforeLoad: async ({ params }) => {
    const platform = getPlatformContract();

    // Platform check
    if (!platform.canAccessIDE) {
      throw redirect({
        to: '/notes/$projectId',
        params,
        search: { error: 'ide-desktop-only' }
      });
    }

    // Project validation
    const project = await db.projects.get(params.projectId);
    if (!project) {
      throw redirect({ to: '/hub', search: { error: 'not-found' } });
    }

    return { project, platform };
  }
});
```

### Workspace Rules

1. **No workspace without project**: All workspace routes require valid `projectId`
2. **IDE desktop only**: Mobile/tablet users redirected to Notes with toast
3. **Direct landing**: Once project + workspace selected, direct navigation to workspace
4. **Hotload switching**: Project selection within workspace is reactive (no page reload)
5. **Storage immutable**: Storage type set at project creation, never changes

---

## BYOK Architecture

### Architecture Diagram (P1-1)

```
┌─────────────────────────────────────────────────────────┐
│                    Credential Vault                      │
│  - AES-256-GCM encrypted                                 │
│  - Provider: API Key mapping                             │
│  - Workspace-specific access                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  AgentExecutionService                   │
│  - Retrieves key from vault                              │
│  - Passes to provider adapter                            │
│  - Enforces workspace permissions                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Provider Adapters                       │
│  - Anthropic, OpenAI, Gemini, OpenRouter                 │
└─────────────────────────────────────────────────────────┘
```

### Key Components

**Credential Vault:**
- AES-256-GCM encryption for all stored keys
- Maps provider IDs to encrypted API keys
- Workspace-specific key access control
- Secure retrieval only during agent execution

**Provider Adapters:**
```typescript
interface ProviderAdapter {
  chat(messages: Message[]): AsyncGenerator<Chunk>;
  fetchModels(): Promise<Model[]>;
}

// Implementations:
// - AnthropicAdapter
// - OpenRouterAdapter
// - OpenAIAdapter
// - GeminiAdapter
```

**Conditional Usage:**
- Keys retrieved only when agent needs them
- Workspace-specific permissions enforced
- Audit logging for all key access events

### Security Considerations

1. **No Runtime Persistence**: Keys never stored in memory between operations
2. **Workspace Isolation**: Keys scoped to specific workspace contexts
3. **Audit Trail**: All key accesses logged for security monitoring
4. **Key Rotation**: Support for periodic key rotation (planned feature)

---

## Store Architecture

### Store Slicing Strategy

**Rule:** Each slice <= 120 lines

**God Stores (>300 lines) to Split:**
1. `use-app-store.ts` (367 lines) -> Split into 8 agent + 3 provider slices
2. `plugins-store.ts` (316 lines) -> Split into marketplace, UI, filters
3. `terminal-store.ts` (307 lines) -> Split into shell, session, history

### Store Naming Convention

```
src/infrastructure/persistence/stores/
├── {domain}/
│   ├── {domain}-store.ts        # Main store (facade/barrel)
│   ├── slices/
│   │   ├── {domain}-{feature}-slice.ts
│   │   └── index.ts              # Barrel export
│   ├── types.ts                  # Domain types
│   └── index.ts                  # Public exports
```

### Persistence Strategy

```typescript
// Apply persist to combined store ONLY
export const useStore = create<Store>()(
  persist(
    (...a) => ({
      ...createSlice1(...a),
      ...createSlice2(...a),
    }),
    {
      name: 'storage-key',
      partialize: (state) => ({
        // Only persist critical fields
        data: state.data,
        // NOT persisted: uiState, loading
      }),
    }
  )
);
```

### Hydration Strategy (Expanded)

**Requirements:**
1. Wait for hydration before querying Dexie
2. Use event-driven detection (not time-based)
3. Show loading state during hydration
4. Handle hydration failures gracefully

```typescript
// Hydration pattern for all stores
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      hydrated: false,

      createProject: async (input) => {
        // Persist to Dexie FIRST
        const project = await db.projects.add(input);

        // Then update Zustand
        set((state) => ({
          projects: [...state.projects, project]
        }));

        return project;
      }
    }),
    {
      name: 'projects-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }
    }
  )
);
```

---

## Component Architecture

### Component Size Limits

| Type | Limit | Rationale |
|------|-------|-----------|
| Components | 300 lines | Maintainability |
| Hooks | 150 lines | Focus |
| Utilities | 120 lines | Simplicity |
| Store slices | 120 lines | Modularity |

### God Components (>300 lines)

Top offenders:
1. `MonacoEditor.tsx` (768 lines)
2. `resizable.tsx` (745 lines)
3. `NotesPage.tsx` (712 lines)
4. `KnowledgePage.tsx` (690 lines)
5. `IndexingProgressPanel.tsx` (593 lines)

### Component Patterns

**Composition over Props:**
```tsx
// ❌ Anti-pattern: Pass everything as props
<ComplexComponent
  data={data}
  onEdit={onEdit}
  onDelete={onDelete}
  // ... 20 more props
/>

// ✅ Pattern: Compose smaller components
<ComplexComponent>
  <DataView data={data} />
  <ActionToolbar onEdit={onEdit} onDelete={onDelete} />
</ComplexComponent>
```

---

## Integration Points

### WebContainer Integration

**Entry Point:** `src/lib/webcontainer/manager.ts`

**Key Operations:**
- Boot WebContainer instance
- Start shell with project path
- Execute commands
- Stream output
- File system operations

### File System Integration

**Adapter Pattern:**
```typescript
// Abstract over File System Access API + WebContainer FS
interface FileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  listFiles(path: string): Promise<string[]>;
}
```

**Implementations:**
- `LocalFSAdapter` - Browser File System Access API
- `WebContainerFSAdapter` - WebContainer virtual FS
- `Facades` - Unified interface for agents

### Agent Integration

**Provider Adapter Pattern:**
```typescript
interface ProviderAdapter {
  chat(messages: Message[]): AsyncGenerator<Chunk>;
  fetchModels(): Promise<Model[]>;
}

// Implementations:
// - AnthropicAdapter
// - OpenRouterAdapter
// - OpenAIAdapter
// - GeminiAdapter
```

---

## Technology Rationale

| Technology | Why Chosen |
|-------------|-------------|
| Zustand v5 | Simple, no boilerplate, TypeScript-first |
| Dexie | Type-safe IndexedDB, Promise-based |
| TanStack Router | File-based, type-safe, SSR-ready |
| Radix UI | Accessible, unstyled, composable |
| Monaco Editor | Industry standard, VS Code core |
| Orama | WASM vector DB, local-first RAG |
| WebContainer | Run Node.js in browser |
| TanStack AI SDK | BYOK support, provider abstraction |

---

## Architecture Concerns

### Known Issues

1. **Layer Violations:** 20+ presentation components import directly from infrastructure
2. **God Stores:** 3 stores exceed 300-line limit
3. **God Components:** 18+ components exceed 300-line limit
4. **TypeScript Errors:** 1363 errors in production code
5. **Viral `any` Types:** 234 explicit `: any` usages
6. **Store Fragmentation:** Multiple store locations across codebase

### Remediation Plan

See [Master Risk Register](../quality/reports/MASTER-RISK-REGISTER.md) for detailed remediation steps.

### Conflict Resolution (Planned)

**Issue:** Agent CRUD operations may conflict with human edits on the same file.

**Strategy:**
1. File locking mechanism during agent operations
2. Optimistic concurrency control with versioning
3. Merge conflict resolution UI
4. Audit trail for all file modifications

---

## References

### Architecture Decision Records
- [ADR-033: PlatformContract & StorageGateway](../planning-artifacts/architecture/ADR-033-platform-contract-2026-01-17.md)
- [ADR-024: State Management Consolidation](../project-planning-artifacts/adr-state-consolidation-2026-01-04.md)

### Project Governance
- [CLAUDE.md](../../CLAUDE.md) - Project governance
- [AGENTS.md](../../AGENTS.md) - Agent patterns
- [Fundamental Truth Checklist](../../check-list-for-fundamental-truth.md)

### External Research
- BYOK Best Practices (2026) - AES-256-GCM, audit logging, key rotation
- Zustand vs IndexedDB Patterns (2025-2026) - Reactivity vs persistence
- Agent Tool Permissions (2026) - Orchestrator pattern, parallel execution
- RAG Infrastructure (2026) - Browser vector DB, local embeddings

---

**Document Version:** 2.0.0
**Last Updated:** 2026-01-16
**Status:** Aligned with ADR-033, Fundamental Truth Checklist
