# Architecture Documentation

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

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
│  │  - State           │  │  - Persistence     │  │ - Code exec  │  │
│  │  - Actions         │  │  - Queries         │  │              │  │
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

---

## Store Architecture

### Store Slicing Strategy

**Rule:** Each slice ≤ 120 lines

**God Stores (>300 lines) to Split:**
1. `use-app-store.ts` (367 lines) → Split into 8 agent + 3 provider slices
2. `plugins-store.ts` (316 lines) → Split into marketplace, UI, filters
3. `terminal-store.ts` (307 lines) → Split into shell, session, history

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

---

## References

- [ADR-024: State Management Consolidation](../../project-planning-artifacts/adr-state-consolidation-2026-01-04.md)
- [CLAUDE.md](../../CLAUDE.md) - Project governance
- [AGENTS.md](../../AGENTS.md) - Agent patterns
