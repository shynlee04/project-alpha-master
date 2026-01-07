# Store Catalog

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

---

## Overview

Via-gent uses **Zustand v5** for state management with **Dexie** (IndexedDB) for persistence. There are **57 store files** organized by domain.

**Technology Stack:**
- Zustand v5 - Client state management
- Dexie v4.2+ - IndexedDB wrapper
- dexie-react-hooks - React hooks
- Event Emitter 3 - Cross-store event bus

---

## God Stores Requiring Split

### 🔴 use-app-store.ts (367 lines)

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

**Remediation:** Extract hydration logic, slice already modular.

---

### 🔴 plugins-store.ts (316 lines)

**Issue:** Marketplace, UI state, filters mixed

**Remediation:** Extract into:
- `plugins-marketplace-slice.ts`
- `plugins-ui-slice.ts`
- `plugins-filters-slice.ts`

---

### 🔴 terminal-store.ts (307 lines)

**Issue:** Shell, session, history mixed

**Remediation:** Extract into:
- `terminal-shell-slice.ts`
- `terminal-session-slice.ts`
- `terminal-history-slice.ts`

---

## Agent Stores

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

---

## Provider Stores

**Location:** `src/infrastructure/persistence/stores/providers/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `provider-crud-slice.ts` | Provider CRUD | ≤120 | ✅ |
| `provider-models-slice.ts` | Model fetching, caching | ≤120 | ✅ |
| `provider-utils-slice.ts` | Model settings, selection | ≤120 | ✅ |
| `migrate-api-keys-to-vault.ts` | API key migration | - | ✅ |
| `types.ts` | Provider types | - | ✅ |

**State:** Refactored into 3 slices (✅ Complete)

---

## Conversation Stores

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

**State:** Split into modular slices (✅ Complete)

---

## Project Stores

**Location:** `src/infrastructure/persistence/stores/project/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `project-crud-slice.ts` | Project CRUD | ≤120 | ✅ |
| `project-workspace-bindings-slice.ts` | WB-1 bindings | ≤120 | ✅ |
| `project-permissions-slice.ts` | Permission state | ≤120 | ✅ |
| `project-layout-slice.ts` | Layout persistence | ≤120 | ✅ |
| `project-utils-slice.ts` | Query helpers | ≤120 | ✅ |

**State:** Split into 5 slices (✅ Complete)

---

## RAG Stores

**Location:** `src/infrastructure/persistence/stores/rag/`

| Store | Purpose | Lines | Status |
|-------|---------|-------|--------|
| `rag-index-slice.ts` | Indexing operations | ≤120 | ✅ |
| `rag-search-slice.ts` | Vector search | ≤120 | ✅ |
| `rag-chunking-slice.ts` | Document chunking | ≤120 | ✅ |
| `rag-chat-slice.ts` | RAG chat | ≤120 | ✅ |
| `rag-voice-slice.ts` | Voice indexing | ≤120 | ✅ |

**State:** Split into 5 slices (✅ Complete)

---

## IDE Stores

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

## Other Stores

| Domain | Store | Purpose |
|--------|-------|---------|
| **Canvas** | `canvas-store.ts` | Canvas state (5 slices) |
| **Editor** | `editor-tabs-store.ts` | Tab management (3 slices) |
| **Flashcard** | `flashcard-store.ts` | Flashcard data (5 slices) |
| **Git** | `git-store.ts` | Git operations (4 slices) |
| **Knowledge** | `knowledge-store.ts` | Knowledge data (6 slices) |
| **Notifications** | `notification-store.ts` | Notification state (3 slices) |
| **Permissions** | `tool-permission-store.ts` | Tool trust levels |
| **Quiz** | `quiz-store.ts` | Quiz data (4 slices) |
| **Study** | `study-store.ts` | Study session (5 slices) |
| **Workspace** | `workspace-store.ts` | Workspace context |
| **Analytics** | `analytics-store.ts` | Analytics dashboard |
| **Hub** | `hub-store.ts` | Hub state |
| **Layout** | `layout-store.ts` | Layout persistence |
| **Navigation** | `navigation-store.ts` | Navigation state |
| **Status Bar** | `statusbar-store.ts` | Status bar segments |
| **Synthesis** | `synthesis-store.ts` | Knowledge synthesis |
| **Terminal** | `terminal-store.ts` | Terminal state |
| **Auto Approve** | `auto-approve-store.ts` | Auto-approval settings |
| **Prompt Enhancement** | `prompt-enhancement-store.ts` | Prompt settings |
| **OpenAI Compatible** | `openai-compatible-store.ts` | Custom providers |
| **File Watcher** | `file-watcher-store.ts` | File watching |
| **Event Status** | `event-status-store.ts` | Event tracking |

---

## Cross-Slice Communication Pattern

### ❌ WRONG - Direct Import (Circular Dependency)

```typescript
import { updateProject } from './project-crud-slice';

export const createWorkspaceBindingSlice = (set, get) => ({
  updateWorkspaceBinding: (projectId, binding) => {
    updateProject(projectId, { binding }); // Circular!
  }
});
```

### ✅ CORRECT - Use get() for Cross-Slice

```typescript
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

**Tables:**
- `providerConfigs` - Provider state
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
  // - validationErrors
  // - _hasHydrated
  // - isLoading
  // - selectedModelId
})
```

---

## Individual Selectors Pattern

### ❌ WRONG - Creates new object every render

```typescript
const { agents, addAgent } = useAgentsStore();
```

### ✅ CORRECT - Stable reference via individual selector

```typescript
const agents = useAgentsStore((s) => s.agents);
const addAgent = useAgentsStore((s) => s.addAgent);
```

---

## Event Bus Pattern

### Cross-Workspace Events

**Location:** `src/lib/events/cross-workspace-event-bus.ts`

| Event | Purpose |
|-------|---------|
| `AGENT_CONFIG_CHANGE` | Agent created/updated/deleted |
| `FILE_CHANGE` | File created/modified/deleted |
| `WORKSPACE_CHANGED` | User switched workspaces |
| `PROVIDER_CONFIG_CHANGE` | Provider API key saved |
| `MODELS_UPDATED` | Models list refreshed |
| `SYNC_STATUS` | File sync status |
| `PROJECT_STATE_CHANGE` | Project opened/closed |

---

## Related Documentation

- [State Management Patterns](./state-management.md) - Detailed Zustand patterns
- [Data Models](./data-models.md) - Entity definitions
- [Architecture](./architecture.md) - System design
