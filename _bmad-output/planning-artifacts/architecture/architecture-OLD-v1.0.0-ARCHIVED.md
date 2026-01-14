# Via-Gent Architecture Document

**Version**: 1.0.0  
**Status**: ACTIVE - Best Practice Standard  
**Date**: 2026-01-07  
**Framework**: Clean Architecture + Zustand v5 + TanStack Stack

> **⚠️ IMPORTANT**: This document establishes the TARGET/BEST SHAPE architecture.
> All code and remediation MUST align with these patterns.
> See ADRs in `adr/` directory for implementation details.

## Table of Contents

1. [Overview](#1-overview)
2. [Clean Architecture Layers](#2-clean-architecture-layers)
3. [State Management](#3-state-management)
4. [Routing & API](#4-routing--api)
5. [Agent System](#5-agent-system)
6. [Workspace Architecture](#6-workspace-architecture)
7. [File System Sync](#7-file-system-sync)
8. [Governance Patterns](#8-governance-patterns)
9. [Technical Debt & Remediation](#9-technical-debt--remediation)
10. [Compliance Checklist](#10-compliance-checklist)

---

## 1. Overview

### 1.1 System Description

Via-Gent is a browser-based IDE with integrated AI agent capabilities, evolving toward a Knowledge Synthesis Station. The system provides:

- **Local-first development**: WebContainer for browser-based Node.js runtime
- **AI-powered assistance**: TanStack AI with agent tools for file operations, RAG, and synthesis
- **Multi-workspace support**: IDE, Knowledge, Notes, and Study workspaces
- **File System Access**: Browser File System Access API for local file operations

### 1.2 Technology Stack

| Layer | Technology | description |
|-------|------------|---------|
| **Framework** | Next.js 15 | React framework with server components |
| **Router** | TanStack Router v1 | File-based routing with type safety |
| **State** | Zustand v5 | State management with slice pattern |
| **Database** | Dexie.js (IndexedDB) | Client-side persistence |
| **AI** | TanStack AI | LLM orchestration |
| **UI** | React + Tailwind | Component library with 8-bit design |
| **Runtime** | WebContainer | Browser-based Node.js |

### 1.3 Directory Structure

```
src/
├── core/                          # Pure entities and types
│   └── entities/                  # Agent, Conversation, Provider, Tool
│
├── domain/                        # Business logic (pure TypeScript)
│   ├── services/                  # Agent, workspace, validation services
│   ├── use-cases/                 # Business workflows
│   └── value-objects/             # Typed primitives
│
├── infrastructure/                # External concerns
│   ├── persistence/               # Dexie stores, migrations
│   │   ├── stores/                # Zustand stores (SINGLE SOURCE OF TRUTH)
│   │   ├── dexie-db*.ts           # Database schema
│   │   └── events/                # Event bus
│   └── sync/                      # File synchronization
│
├── lib/                           # Shared utilities
│   ├── agent/                     # AI agent system
│   │   ├── providers/             # LLM provider adapters
│   │   ├── tools/                 # Agent tools (TanStack AI)
│   │   └── facades/               # Tool abstraction layer
│   ├── filesystem/                # Local FS adapter, sync
│   ├── webcontainer/              # WebContainer manager
│   └── editor/                    # Monaco editor integration
│
├── presentation/                  # UI layer (React)
│   └── components/
│       ├── ide/                   # IDE workspace components
│       ├── knowledge/             # Knowledge workspace components
│       ├── notes/                 # Notes workspace components
│       ├── study/                 # Study workspace components
│       ├── agent/                 # Agent configuration
│       ├── chat/                  # Chat interface
│       ├── ui/                    # Reusable UI components
│       └── layout/                # Layout components
│
└── routes/                        # TanStack Router file-based routes
    └── api/                       # API endpoints
```

---

## 2. Clean Architecture Layers

### 2.1 Layer Definitions

The codebase follows **strict 4-layer architecture** with unidirectional dependencies:

```
┌─────────────────────────────────────────────────────────┐
│ PRESENTATION (src/presentation/)                        │
│ → UI components, hooks, render logic                    │
│ → NO business logic, only UI state                      │
├─────────────────────────────────────────────────────────┤
│ DOMAIN (src/domain/)                                    │
│ → Business logic, use-cases, services                   │
│ → PURE TypeScript, no React, no infrastructure          │
├─────────────────────────────────────────────────────────┤
│ CORE (src/core/)                                        │
│ → Entities, value objects, types                        │
│ → NO dependencies, pure data structures                 │
├─────────────────────────────────────────────────────────┤
│ INFRASTRUCTURE (src/infrastructure/)                    │
│ → Persistence, events, external services                │
│ → Implements Domain interfaces via adapter pattern      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Dependency Rules

```typescript
// ❌ FORBIDDEN: Presentation → Infrastructure
import { db } from '@/infrastructure/persistence/'; // BAD

// ✅ CORRECT: Presentation → Domain
import { AgentService } from '@/domain/services/';

// ❌ FORBIDDEN: Domain → Infrastructure  
import { db } from '@/infrastructure/persistence/'; // BAD

// ✅ CORRECT: Domain defines interface, Infrastructure implements
// src/domain/services/agent-repository.ts
interface AgentRepository {
  getAgent(id: string): Promise<Agent>;
}

// src/infrastructure/persistence/agent-repository.ts
import { AgentRepository } from '@/domain/services/';
export class AgentRepositoryImpl implements AgentRepository { ... }
```

### 2.3 Layer Compliance

| Layer | Location | Current Files | Target Compliance |
|-------|----------|--------------|-------------------|
| Core | `src/core/` | 4 entities | 100% ✅ |
| Domain | `src/domain/` | 7 services | 75% ⚠️ |
| Infrastructure | `src/infrastructure/` | 250+ files | 90% ✅ |
| Presentation | `src/presentation/` | 474 components | 60% ⚠️ |

---

## 3. State Management

### 3.1 Zustand v5 Patterns (TARGET STATE)

All state management MUST follow these patterns:

```typescript
// 1. SLICE PATTERN - Each slice in separate file (<120 lines)
const createCounterSlice: StateCreator<CounterState, [], [], CounterState> = 
  (set, get) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  });

// 2. COMBINED STORE - Persist on combined store ONLY
export const useCounterStore = create<CounterState>()(
  persist(
    (...a) => ({
      ...createCounterSlice(...a),
      ...createOtherSlice(...a),
    }),
    {
      name: 'counter-store',
      partialize: (state) => ({ count: state.count }),
    }
  )
);

// 3. INDIVIDUAL SELECTORS - No destructuring
const count = useCounterStore(s => s.count);
const increment = useCounterStore(s => s.increment);

// 4. MULTIPLE SELECTORS - useShallow from 'zustand/react/shallow'
import { useShallow } from 'zustand/react/shallow';

const { count, increment } = useCounterStore(
  useShallow((state) => ({
    count: state.count,
    increment: state.increment,
  }))
);

// 5. CROSS-SLICE COMMUNICATION - Use get()
const handleAction = () => {
  const otherValue = get().otherValue;
  set({ result: otherValue });
};
```

### 3.2 Single Source of Truth

**`src/infrastructure/persistence/stores/` is the ONLY location for state management.**

```typescript
// ❌ DEPRECATED - Will show console warning
import { store } from '@/lib/state/old-store';

// ✅ CORRECT - Canonical path
import { store } from '@/infrastructure/persistence/stores/';
```

### 3.3 Dexie Persistence Schema

```typescript
// src/infrastructure/persistence/dexie-db.ts
import Dexie from 'dexie';

export const db = new Dexie('ViaGentDB');

db.version(1).stores({
  conversations: '++id, projectId, title, lastMessageAt',
  messages: '++id, conversationId, role, timestamp',
  projects: '++id, name, path, createdAt',
  fileMetadata: 'path, lastModified, size, contentHash',
  toolExecutionLogs: '++id, toolName, timestamp, success',
  fsaHandles: 'path, directoryHandle, permissions',
  plugins: '++id, name, version, enabled',
  sessionSnapshots: '++id, workspaceId, timestamp',
  workspaceState: 'workspaceId, state',
});
```

---

## 4. Routing & API

### 4.1 TanStack Router (File-Based)

Routes are automatically generated from file structure:

```typescript
src/routes/
├── __root.tsx                     # Root layout
├── index.tsx                      # / (home)
├── ide.$projectId.tsx             # /ide/:projectId
├── knowledge.$projectId.tsx       # /knowledge/:projectId
├── knowledge.lazy.tsx             # /knowledge
├── notes.$projectId.tsx           # /notes/:projectId
├── notes.lazy.tsx                 # /notes
├── study.$projectId.tsx           # /study/:projectId
├── study.lazy.tsx                 # /study
├── agents.tsx                     # /agents
├── settings.tsx                   # /settings
├── hub.tsx                        # /hub
├── projects.tsx                   # /projects
├── api/
│   ├── chat.ts                    # POST /api/chat
│   ├── flashcards/generate.ts     # POST /api/flashcards/generate
│   └── quizzes/generate.ts        # POST /api/quizzes/generate
└── routeTree.gen.ts               # AUTO-GENERATED
```

### 4.2 API Route Pattern

```typescript
// src/routes/api/chat.ts
import { createFileRoute } from '@tanstack/react-router';
import { createAI } from '@tanstack/react-ai';

export const Route = createFileRoute('/api/chat')({
  POST: async (c) => {
    const { message, agentId } = await c.req.json();
    // Process chat request...
    return c.json({ response: '...' });
  },
});
```

---

## 5. Agent System

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ AGENT LAYERS                                            │
├─────────────────────────────────────────────────────────┤
│ PRESENTATION: AgentConfigDialog, ProviderConfigDialog   │
├─────────────────────────────────────────────────────────┤
│ DOMAIN: Agent, Tool, Provider entities                  │
├─────────────────────────────────────────────────────────┤
│ INFRASTRUCTURE: Provider adapters, credential vault     │
├─────────────────────────────────────────────────────────┤
│ TOOLS (TanStack AI .client() pattern)                  │
│ ├── read_file      → file-tools-facade                 │
│ ├── write_file     → file-tools-facade                 │
│ ├── execute_command→ terminal-tools-facade             │
│ ├── list_files     → file-tools-facade                 │
│ ├── search_notes   → knowledge-tools-facade            │
│ ├── process_pdf    → knowledge-tools-facade            │
│ └── synthesize     → knowledge-tools-facade            │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Provider Adapter Pattern

```typescript
// src/lib/agent/providers/provider-adapter.ts
interface ProviderAdapter {
  id: string;
  name: string;
  createChat: (config: ChatConfig) => ChatStream;
  validateKey: (key: string) => Promise<boolean>;
  getModels: () => Promise<Model[]>;
}

// Factory pattern for creating adapters
export const providerAdapterFactory = {
  create: (providerId: string, config: ProviderConfig): ProviderAdapter => {
    switch (providerId) {
      case 'anthropic':
        return new AnthropicAdapter(config);
      case 'openrouter':
        return new OpenRouterAdapter(config);
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  },
};
```

### 5.3 Tool Definition (TanStack AI)

```typescript
// src/lib/agent/tools/read-file-tool.ts
import { tool } from '@tanstack/react-ai';

export const readFileTool = tool({
  description: 'Read the contents of a file',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file'),
  }),
  execute: async ({ path }) => {
    const fileTools = getFileTools();
    return await fileTools.readFile(path);
  },
});
```

---

## 6. Workspace Architecture

### 6.1 Workspace Types

```typescript
type WorkspaceType = 'ide' | 'knowledge' | 'notes' | 'study';

interface Workspace {
  id: string;
  type: WorkspaceType;
  projectId: string | null;
  bindings: WorkspaceBinding[];
  isActive: boolean;
}

interface WorkspaceBinding {
  workspaceType: WorkspaceType;
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}
```

### 6.2 Workspace Store

```typescript
// src/infrastructure/persistence/stores/workspace/workspace-store.ts
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      currentWorkspace: null,
      workspaces: {},
      transitions: {},
      
      setCurrentWorkspace: (workspace: WorkspaceType) => {
        set({ currentWorkspace: workspace });
        // Emit cross-workspace event
        eventBus.emit('workspace:changed', { 
          from: get().currentWorkspace, 
          to: workspace 
        });
      },
      
      getWorkspaceConfig: (workspace: WorkspaceType) => {
        const state = get();
        return state.workspaces[workspace];
      },
    }),
    {
      name: 'workspace-store',
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        workspaces: state.workspaces,
      }),
    }
  )
);
```

### 6.3 Cross-Workspace Event Bus

```typescript
// src/infrastructure/events/event-bus.ts
import { EventEmitter3 } from 'eventemitter3';

export const eventBus = new EventEmitter3<DomainEventMap>();

// Usage for cross-workspace communication
eventBus.emit('RAG_PROGRESS', { 
  workspaceId: 'knowledge', 
  progress: 50 
});

eventBus.on('RAG_PROGRESS', (payload) => {
  console.log('RAG Progress:', payload);
});
```

---

## 7. File System Sync

### 7.1 Architecture

```
┌─────────────────────────────────────────────────────────┐
│ USER INTERFACE                                          │
│ → File tree, editor, sync status panel                  │
├─────────────────────────────────────────────────────────┤
│ LOCAL FS ADAPTER (File System Access API)               │
│ → readFile, writeFile, directory operations             │
├─────────────────────────────────────────────────────────┤
│ SYNC EXECUTOR                                           │
│ → Incremental sync, conflict detection                  │
├─────────────────────────────────────────────────────────┤
│ WEBCONTAINER                                            │
│ → Node.js runtime, npm install, build                   │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Key Components

```typescript
// src/lib/filesystem/local-fs-adapter.ts
export class LocalFSAdapter {
  async readFile(path: string): Promise<string> { ... }
  async writeFile(path: string, content: string): Promise<void> { ... }
  async createDirectory(path: string): Promise<void> { ... }
  async deleteFile(path: string): Promise<void> { ... }
  async getDirectoryHandle(path: string): Promise<FileSystemDirectoryHandle> { ... }
}

// src/lib/filesystem/sync-executor.ts
export class SyncExecutor {
  async syncIncremental(): Promise<SyncResult> { ... }
  async detectConflicts(): Promise<Conflict[]> { ... }
  async resolveConflict(conflict: Conflict): Promise<void> { ... }
}

// src/lib/filesystem/fsa-handle-manager.ts
export class FSAHandleManager {
  async persistHandle(path: string): Promise<void> { ... }
  async restoreHandle(path: string): Promise<FileSystemDirectoryHandle | null> { ... }
}
```

---

## 8. Governance Patterns

### 8.1 BMAD Framework

The project uses BMAD (Business Model & Agile Development) for autonomous execution:

| Module | description |
|--------|---------|
| **Core Governance** | Platform routing, state management, enforcement |
| **Architecture Refactoring** | Deep scanning, god store elimination |
| **Sprint & Feature Execution** | Sprint planning, story development |
| **Integration & Testing** | Browser automation, API validation |

### 8.2 Time-Boxing Rules

| Level | Duration | On Timeout |
|-------|----------|------------|
| Step | 5 min | Escalate to story |
| Story | 30 min | Deep-investigation |
| Deep Investigation | 15 min | Split story |
| Epic | 4 hours | Assess progress |

### 8.3 Artifact TTL System

| Tier | TTL | Content |
|------|-----|---------|
| 1 | Permanent | Constitution, AGENTS.md |
| 2 | Permanent | Core governance documents |
| 3 | 90 days | Sprint artifacts, research |
| 4 | 24 hours | Temporary notes |

### 8.4 Pre-Execution Validation

```bash
# .claude/hooks/pre-execution.sh
- Check stale artifacts (TTL check)
- Validate artifact size (<5000 lines)
- Tier 1 protection verification
- Time-boxing compliance check
- Context poisoning prevention
```

---

## 9. Technical Debt & Remediation

### 9.1 Current Debt

| Category | Count | Target | Status |
|----------|-------|--------|--------|
| God Components (>300 lines) | 19 | 0 | 🔴 HIGH |
| God Stores (>300 lines) | 9 | 0 | 🔴 HIGH |
| TypeScript Errors | 1,253 | 0 | 🟡 MEDIUM |
| Store Duplicates | 3 | 0 | 🟡 MEDIUM |

### 9.2 Size Limits (Mandatory)

| Artifact Type | Max Lines | Max Functions |
|--------------|-----------|---------------|
| Component | 300 | 5 |
| Slice/Store | 120 | 10 |
| Hook | 150 | 3 |
| Utility | 120 | 5 |

### 9.3 Priority Remediation

| Priority | Item | Lines | Action |
|----------|------|-------|--------|
| P0 | dexie-db.ts | 1,169 | Decompose into helpers |
| P1 | MonacoEditor.tsx | 768 | Extract sub-components |
| P1 | useWorkspaceFileSystem.ts | 557 | Extract slices |
| P2 | KnowledgePage.tsx | 712 | Decompose into pages/ |

---

## 10. Compliance Checklist

### 10.1 Clean Architecture

- [ ] No presentation-to-infrastructure imports
- [ ] Domain defines interfaces, Infrastructure implements
- [ ] Core contains only data structures (no logic)
- [ ] Cross-layer dependencies use adapter pattern

### 10.2 State Management

- [ ] All stores in `infrastructure/persistence/stores/`
- [ ] No store exceeds 300 lines
- [ ] No slice exceeds 120 lines
- [ ] Persist middleware on combined store only
- [ ] Individual selectors used (no destructuring)
- [ ] useShallow for multiple value selection

### 10.3 Component Design

- [ ] No component exceeds 300 lines
- [ ] No component has >5 functions
- [ ] Hooks extracted for complex logic
- [ ] Sub-components for reusable patterns

### 10.4 Governance

- [ ] All architectural decisions have ADRs
- [ ] Pre-execution hooks run on every commit
- [ ] Time-boxing enforced for all tasks
- [ ] TTL filtering prevents context poisoning

---

## Related Documents

| Document | description |
|----------|---------|
| `adr/ADR-001-zustand-state-management.md` | Zustand patterns |
| `adr/ADR-002-single-source-of-truth.md` | State location |
| `adr/ADR-003-clean-architecture-layers.md` | Layer separation |
| `adr/ADR-004-god-component-decomposition.md` | Refactoring strategy |
| `adr/ADR-005-governance-patterns.md` | Governance rules |
| `codebase-analysis/directory_structure.yaml` | Current structure |
| `codebase-analysis/component-inventory.yaml` | Component inventory |
| `codebase-analysis/state-architecture.yaml` | State analysis |
| `codebase-analysis/api-contracts.yaml` | API contracts |
| `codebase-analysis/architecture-patterns.yaml` | Pattern analysis |

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-07  
**Next Review**: 2026-04-07  
**Owner**: Architecture Team
