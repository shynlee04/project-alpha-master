---
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
user_name: 'Admin'
date: '2026-01-04'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules', 'phase_2_technical_constraints', 'epic_24_schema', 'architecture_remediation_module']
generated_from: 'architecture.md'
phase: 'Phase 2'
last_updated: '2026-01-04T14:30+07:00'
autonomous_mode: 'BMad Master v2.0'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents MUST follow when implementing code. Focus on unobvious details to prevent implementation mistakes._

---

## Technology Stack & Versions (LOCKED)

### Core Runtime
| Technology | Version | Notes |
|------------|---------|-------|
| React | 19.2.3 | Hooks + Concurrent features |
| TypeScript | 5.9.3 | Strict mode enabled |
| Vite | 7.3.0 | Dev server on port 3000 |
| TanStack Start | 1.143.3 | Hybrid SSR |
| TanStack Router | 1.143.3 | File-based routing |

### State & Data
| Technology | Version | Notes |
|------------|---------|-------|
| Zustand | 5.0.9 | `useShallow` required for selectors |
| Dexie.js | 4.2.1 | IndexedDB wrapper |
| Zod | 4.2.1 | Validation at boundaries |

### AI & Chat
| Technology | Version | Notes |
|------------|---------|-------|
| TanStack AI | 0.2.0 | SSE streaming |
| @tanstack/ai-openai | 0.2.0 | OpenRouter compatible |
| @tanstack/ai-gemini | 0.2.0 | Google Gemini |

### IDE Components
| Technology | Version | Notes |
|------------|---------|-------|
| Monaco Editor | 0.55.1 | Lazy loaded |
| @xterm/xterm | 5.5.0 | Terminal |
| @webcontainer/api | 1.6.1 | Requires COOP/COEP |

### Styling & UI
| Technology | Version | Notes |
|------------|---------|-------|
| Tailwind CSS | 4.1.18 | v4 syntax |
| Radix UI | 1.x-2.x | Unstyled primitives |
| Lucide React | 0.544.0 | Icons |

---

## Critical Implementation Rules

### TypeScript Rules

```typescript
// ✅ REQUIRED: Strict mode is ON
// tsconfig.json: "strict": true

// ✅ REQUIRED: Use interface for objects, type for unions
interface AgentConfig {
  id: string;
  name: string;
}
type AgentStatus = 'idle' | 'running' | 'error';

// ✅ REQUIRED: No I prefix on interfaces
interface AgentConfig { }     // CORRECT
interface IAgentConfig { }    // WRONG

// ✅ REQUIRED: Underscore prefix for intentionally unused
const [_value, setValue] = useState();  // ESLint allows this

// ✅ REQUIRED: Path alias for internal imports
import { useIDEStore } from '@/lib/state/ide-store';  // CORRECT
import { useIDEStore } from '../../lib/state/ide-store';  // AVOID
```

### Import Order (MANDATORY)

```typescript
// 1. React imports
import { useState, useEffect, useCallback } from 'react';

// 2. Third-party libraries
import { useShallow } from 'zustand/react/shallow';
import { z } from 'zod';

// 3. Internal modules with @/ alias
import { useIDEStore } from '@/lib/state/ide-store';
import { Button } from '@/components/ui';

// 4. Relative imports
import { useLocalHandlers } from './hooks/useLocalHandlers';
import type { LayoutProps } from './types';
```

### Zustand Store Rules (CRITICAL)

```typescript
// ✅ REQUIRED: Always use useShallow for multi-property selectors
const { activeFile, setActiveFile } = useIDEStore(
  useShallow((s) => ({
    activeFile: s.activeFile,
    setActiveFile: s.setActiveFile,
  }))
);

// ❌ WRONG: Selecting entire store (causes excessive re-renders)
const state = useIDEStore();

// ✅ REQUIRED: Immutable updates only
set((state) => ({
  openFiles: [...state.openFiles, newFile],  // SPREAD
}));

// ❌ WRONG: Direct mutation
set((state) => {
  state.openFiles.push(newFile);  // MUTATION - FORBIDDEN
  return state;
});

// ✅ REQUIRED: Action naming conventions
// set{Property}  - setActiveFile(path)
// add{Item}      - addOpenFile(path)
// remove{Item}   - removeOpenFile(path)
// toggle{Prop}   - toggleChatVisible()
// load{X}Async   - loadProjectAsync(id)
```

### Dexie/IndexedDB Rules

```typescript
// ✅ REQUIRED: Table naming - camelCase, plural
class ViaGentDB extends Dexie {
  agents!: Table<Agent>;          // CORRECT
  projects!: Table<Project>;      // CORRECT
  // Agent!: Table<Agent>;        // WRONG - singular
  // Agents!: Table<Agent>;       // WRONG - PascalCase
}

// ✅ REQUIRED: Always use transaction for multi-table operations
await db.transaction('rw', [db.agents, db.projects], async () => {
  await db.agents.put(agent);
  await db.projects.put(project);
});
```

### Error Handling Rules

```typescript
// ✅ REQUIRED: Use custom error classes
import { SyncError, PermissionDeniedError } from '@/lib/filesystem/sync-types';

// ✅ REQUIRED: Catch specific errors first
try {
  await syncFile(path);
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    showPermissionModal();
  } else if (error instanceof SyncError) {
    toast.error('Sync failed: ' + error.message);
  } else {
    console.error('Unexpected error:', error);
    throw error;
  }
}

// ✅ REQUIRED: User-friendly error messages
toast.error('Unable to save file. Please check permissions.');  // CORRECT
toast.error(`SyncError: ENOENT at ${path}`);  // WRONG - too technical
```

---

## Directory Organization Rules

```
src/
├── components/           # React components BY FEATURE
│   ├── {feature}/       # Feature-specific
│   │   ├── index.ts     # ⚠️ ALWAYS create barrel export
│   │   └── Component.tsx
├── lib/                  # Non-React utilities BY DOMAIN
│   └── {domain}/
├── routes/               # TanStack Router (file-based, DO NOT manual edit routeTree.gen.ts)
├── hooks/                # GLOBAL shared hooks only
├── stores/               # Legacy (migrate to lib/state)
└── types/                # Global type definitions
```

### File Naming Rules

| Element | Convention | Example |
|---------|------------|---------|
| React Component | PascalCase.tsx | `AgentConfigDialog.tsx` |
| Utility | camelCase.ts | `createDexieStorage.ts` |
| Hook | use*.ts | `useAgentChat.ts` |
| Test | *.test.ts(x) | `credential-vault.test.ts` |
| Directory | kebab-case | `agent-tools/` |

### Barrel Export Pattern (MANDATORY)

```typescript
// Every directory MUST have index.ts
// src/components/agent/index.ts
export { AgentConfigDialog } from './AgentConfigDialog';
export { AgentSelector } from './AgentSelector';
export type { AgentConfigDialogProps } from './AgentConfigDialog';

// ✅ CORRECT: Import from barrel
import { AgentConfigDialog } from '@/components/agent';

// ❌ WRONG: Deep import
import { AgentConfigDialog } from '@/components/agent/AgentConfigDialog';
```

---

## Testing Rules

### Test Organization
- **Location:** `__tests__/` adjacent to source files
- **Pattern:** `*.test.ts(x)`
- **Environment:** `jsdom` for React, `node` for utilities

### Required Mocks
```typescript
// For IndexedDB tests
import 'fake-indexeddb/auto';

// For Zustand tests
vi.mock('zustand');

// For WebContainer tests
vi.mock('@webcontainer/api');
```

### Test Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });
  
  it('should describe behavior not implementation', () => {
    // ✅ CORRECT: "should save file when submit clicked"
    // ❌ WRONG: "should call setFile"
  });
});
```

---

## WebContainer Critical Rules

```typescript
// ⚠️ CRITICAL: COOP/COEP headers MUST be set for WebContainers to work
// vite.config.ts securityHeadersPlugin handles this in dev

// ⚠️ CRITICAL: Only ONE WebContainer instance per page
// Use WebContainerManager singleton in src/lib/webcontainer/manager.ts

// ⚠️ CRITICAL: Sync is ONE-WAY only
// Local FS → WebContainer (changes in WC do NOT sync back)

// ⚠️ CRITICAL: These are excluded from sync
const SYNC_EXCLUSIONS = ['node_modules', '.git', 'dist', '.DS_Store'];
```

---

## i18n Rules

```typescript
// ✅ REQUIRED: Use t() hook for all user-facing strings
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<button>{t('common.save')}</button>;

// ✅ REQUIRED: Run extraction after adding keys
// pnpm i18n:extract

// ⚠️ Keys are in src/i18n/en.json and src/i18n/vi.json
```

---

## Critical Anti-Patterns

### ❌ NEVER Do These

```typescript
// ❌ NEVER: Edit routeTree.gen.ts manually
// It's auto-generated by TanStack Router

// ❌ NEVER: Use any type without justification
const data: any = response;  // WRONG
const data: unknown = response;  // Use unknown instead

// ❌ NEVER: Use console.log in production code
console.log('debug');  // Use console.debug or remove

// ❌ NEVER: Mutate Zustand state directly
state.items.push(newItem);  // FORBIDDEN

// ❌ NEVER: Access IndexedDB directly from components
// Always go through Zustand stores

// ❌ NEVER: Skip error boundaries for async operations
// Always wrap with try/catch

// ❌ NEVER: Use window.localStorage for sensitive data
// Use credential vault with encryption
```

### ✅ ALWAYS Do These

```typescript
// ✅ ALWAYS: Check for existing implementation before creating new
// Use grep_search or codebase_search first

// ✅ ALWAYS: Follow existing patterns in the codebase
// Don't invent new conventions

// ✅ ALWAYS: Use useShallow for Zustand selectors

// ✅ ALWAYS: Create barrel exports (index.ts) for new directories

// ✅ ALWAYS: Validate at boundaries with Zod

// ✅ ALWAYS: Reference AGENTS.md for workflow questions

// ✅ ALWAYS: Execute MCP research for unfamiliar patterns
```

---

## Development Commands

```bash
# Start development server (COOP/COEP enabled)
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Extract i18n keys
pnpm i18n:extract

# Build for production
pnpm build
```

---

## Deployment Configuration

**Primary Target:** Cloudflare Pages  
**Status:** ✅ Active production deployment

**Key Configuration Files:**
| File | Purpose | Status |
|------|---------|--------|
| `wrangler.jsonc` | Cloudflare Workers config | ✅ **ACTIVE** |
| `vite.config.ts` | Default `DEPLOY_TARGET=cloudflare` | ✅ **ACTIVE** |
| `server/middleware/security-headers.ts` | Production COOP/COEP headers | ✅ **ACTIVE** |
| `netlify.toml` | Legacy backup config | ⚠️ **NOT IN USE** |

**Critical Deployment Rules:**
- ✅ Cloudflare Workers require `ssr.noExternal: true` (bundles all dependencies)
- ✅ Security headers (COOP/COEP) handled by Workers middleware
- ✅ WebContainer requires Cross-Origin Isolation (SharedArrayBuffer)
- ⚠️ Do NOT modify `netlify.toml` - it is not active in deployment pipeline

**Deployment Workflow:**
```bash
# Build for Cloudflare (default)
pnpm build            # Uses DEPLOY_TARGET=cloudflare by default
# Output: .output/server (Workers) + .output/public (static)

# Preview production build locally
pnpm preview

# Deploy to Cloudflare Pages
# Automated via GitHub integration (push to main branch)
```

**Why Cloudflare?**
- ✅ Global edge network (low latency for Vietnam + international users)
- ✅ Native TanStack Start SSR support via Workers
- ✅ COOP/COEP headers via Workers middleware
- ✅ Generous free tier (100K requests/day)

---

## Reference Documents

- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md`
- **Development Workflow:** `AGENTS.md`
- **Sprint Status:** `bmm-workflow-status.yaml`
- **MCP Research Protocol:** `.agent/rules/general-rules.md`

---

## Critical Dependency Matrix

_Strict execution order required to prevent blockers._

| Predecessor | Successor | Reason |
|-------------|-----------|--------|
| **Epic 1 (Theme System)** | **Epic 2 (Agent Config)** | `AgentConfigDialog` requires theme context |
| **Story 2.0 (Credential Vault)** | **Story 2.1 (Config Persistence)** | API keys must be encrypted before storage implementation |
| **Story 2.4 (Conversation Store)** | **Story 4.3 (Tool Logs)** | Tool execution history lives in conversation store |
| **Story 3.1 (FSA Handle)** | **Story 4.2 (File Tools)** | Agent cannot read/write without `WorkspaceContext` file handles |
| **Story 4.3 (Execution Log)** | **Story 5.1 (Sync Visualizer)** | Visualizer consumes audit logs from tool execution |
| **Dexie v8 Schema** | **Story 24-1 (Incremental Sync)** | Requires `fileMetadata` table (v9) |
| **Story 24-1** | **Story 24-2 (FSA Handle Persistence)** | Metadata cache enables instant restore |
| **Story 2.4 (Conversation Store)** | **Story 24-3 (Auto-Restore)** | Uses existing `loadConversation()` method |
| **Dexie v8 Schema** | **Story 24-4 (Tool Context)** | Requires `toolExecutionLogs` table (v9) |

---

## Epic 24: Dexie Schema v9 Additions (NEW)

_Schema changes required for Performance & UX Optimization stories._

### New Tables

```typescript
// src/lib/state/dexie-db.ts (Schema v9)

// File metadata cache for incremental sync (Story 24-1)
fileMetadata: 'path, lastModified, [path+lastModified]'

// Tool execution audit trail (Story 24-4)
toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp'

// FSA handle persistence (Story 24-2 - optional, may use existing ideState)
fsaHandles: 'projectId, handle, grantedAt'
```

### New Interfaces

```typescript
// File metadata for incremental sync
interface CachedFileMetadata {
    path: string;           // File path (primary key)
    lastModified: number;   // Unix timestamp
    size: number;           // File size in bytes
    hash?: string;          // Optional SHA-256 for content verification
    syncedAt: number;       // Last sync timestamp
}

// Tool execution log for context persistence
interface ToolExecutionLog {
    id: string;             // UUID
    conversationId: string; // Foreign key to conversation
    messageId: string;      // Foreign key to message
    toolName: string;       // e.g., 'readFile', 'writeFile'
    args: Record<string, unknown>;
    result: {
        success: boolean;
        output?: string;
        error?: string;
    };
    approved: boolean;      // User approval status
    timestamp: number;      // Execution timestamp
}
```

### Migration Strategy

```typescript
// Upgrade from v8 to v9
this.version(9).stores({
    // Existing tables unchanged
    projects: 'id, lastOpened, name',
    ideState: 'projectId, updatedAt',
    // ... other existing tables ...
    
    // NEW: Epic 24 tables
    fileMetadata: 'path, lastModified, [path+lastModified]',
    toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp',
}).upgrade(async () => {
    console.log('[Dexie] Running migration to v9 (Epic 24 Performance & UX)');
});
```

## Phase 2 Technical Constraints

### Cross-Architecture Support

#### CPU Architecture Compatibility

| Architecture | Status | WebContainer Support | Vector Store Support | Notes |
|-------------|--------|---------------------|---------------------|-------|
| **x86-64** | ✅ Primary Target | ✅ Full | ✅ Full | Desktop browsers (Chrome/Edge) |
| **ARM64** | ✅ Supported | ⚠️ Partial (WASM) | ✅ Full | Apple Silicon Macs, ARM64 browsers |
| **Emerging** | 🔜 Future | ❌ Not Tested | ❌ Not Tested | RISC-V, experimental architectures |

**Implementation Constraints:**
- WebContainer requires x86-64 for full Node.js compatibility
- Orama WASM supports ARM64 (vector operations optimized)
- Fallback strategy: Graceful degradation for unsupported architectures

#### Platform Targets

| Platform | WebContainer | Vector Store | File System | Deployment | Notes |
|-----------|-------------|----------------|--------------|------------|-------|
| **Linux (Desktop)** | ✅ Full | ✅ Full | ✅ FSA + IndexedDB | Cloudflare, Netlify, Node.js |
| **macOS (Desktop)** | ✅ Full | ✅ Full | ✅ FSA + IndexedDB | Cloudflare, Netlify, Electron |
| **Windows (Desktop)** | ✅ Full | ✅ Full | ✅ FSA + IndexedDB | Cloudflare, Netlify, Electron |
| **iOS (Mobile)** | ❌ Not Supported | ✅ Full | ⚠️ IndexedDB Only | Safari 15.2+, PWA |
| **Android (Mobile)** | ❌ Not Supported | ✅ Full | ⚠️ IndexedDB Only | Chrome Mobile, PWA |

**Browser Compatibility Matrix:**
```typescript
// Capability Detection
interface BrowserCapabilities {
  webContainer: boolean;      // SharedArrayBuffer support
  fileSystemAccess: boolean;  // window.showDirectoryPicker
  indexedDB: boolean;          // Always true (modern browsers)
  serviceWorker: boolean;         // Offline support
  webAssembly: boolean;          // Orama requirement
}

// Runtime Detection
const detectCapabilities = (): BrowserCapabilities => ({
  webContainer: typeof SharedArrayBuffer !== 'undefined',
  fileSystemAccess: 'showDirectoryPicker' in window,
  indexedDB: 'indexedDB' in window,
  serviceWorker: 'serviceWorker' in window.navigator,
  webAssembly: typeof WebAssembly !== 'undefined',
});
```

#### Deployment Models

| Model | Architecture | Storage | Network | Offline | Use Case |
|--------|-------------|---------|---------|-----------|-----------|
| **On-Premise** | x86-64, ARM64 | Local FS | Optional | ✅ | Enterprise, privacy-sensitive |
| **Cloud-Native** | x86-64 | Cloud Storage | Required | ❌ | SaaS, multi-tenant |
| **Hybrid** | x86-64, ARM64 | Local + Cloud | Optional | ✅ | Best of both worlds |

**Deployment Constraints:**
- Primary: Cloudflare Pages (edge-first, COOP/COEP headers)
- Fallback: Netlify Edge Functions (alternative deployment)
- Local: Electron/Tauri (desktop app with native FS)
- PWA: Service Worker cache for offline-first

#### Runtime Environments

| Runtime | WebContainer | Vector Store | File System | Notes |
|---------|-------------|----------------|--------------|-------|
| **Browser (Chrome/Edge)** | ✅ Full | ✅ Orama WASM | ✅ FSA + IndexedDB | Primary target |
| **Browser (Safari)** | ⚠️ Partial | ✅ Orama WASM | ⚠️ IndexedDB only | FSA not available |
| **Browser (Firefox)** | ❌ Experimental | ✅ Orama WASM | ⚠️ IndexedDB only | WebContainer experimental |
| **Node.js (Electron)** | ✅ Full | ✅ Orama WASM | ✅ Native FS | Desktop app fallback |
| **Node.js (Server)** | N/A | ❌ Not Supported | N/A | Future: server-side RAG |

**Architecture Alignment:** See [`architecture.md`](../architecture.md) Section 3.5 - Phase 2 Vector Store Strategy

---

### Advanced State Management & Persistence

#### Client-Side State Patterns

| State Type | Storage Method | Persistence Scope | Sync Strategy | Reactivity |
|-------------|-----------------|---------------------|---------------|-------------|
| **Component-Level** | useState, useRef | Component lifecycle | N/A | ✅ Immediate |
| **Global Shared** | Zustand stores | Cross-component | Dexie middleware | ✅ Reactive |
| **Ephemeral Session** | In-memory, WeakMap | Session duration | N/A | ✅ Fast |
| **Persistent Domain** | Dexie (IndexedDB) | Cross-session | Immediate sync | ✅ Reactive |

**State Management Architecture:**
```typescript
// src/lib/state/ide-store.ts (Pattern)
import { create } from 'zustand';
import { persist, createDexieStorage } from './dexie-storage';

export const useIDEStore = create<IDEState>()(
  persist(
    (set, get) => ({
      // State (nouns)
      openFiles: [],
      activeFile: null,
      
      // Actions (verbs)
      setActiveFile: (path) => set({ activeFile: path }),
      addOpenFile: (path) => set((state) => ({
        openFiles: [...state.openFiles, path],
      })),
      
      // Async actions (verb + Async)
      loadProjectAsync: async (id) => {
        const project = await db.projects.get(id);
        set({ activeProject: project });
      },
    }),
    {
      name: 'ide-storage',
      storage: createDexieStorage('ideStates'),
      partialize: (state) => ({
        openFiles: state.openFiles,
        activeFile: state.activeFile,
      }),
    }
  )
);
```

#### Server-Side State Patterns (Future - Phase 3)

| Pattern | Description | Use Case | Implementation |
|---------|-------------|-----------|----------------|
| **Database Persistence** | Direct DB writes | Server-side RAG | IndexedDB for offline, sync to server |
| **Caching Layer** | Redis/Memcached | High-frequency reads | Service Worker cache for PWA |
| **Distributed Sync** | Multi-device state | Collaboration | CRDT-based conflict resolution |
| **Event Sourcing** | Immutable event log | Audit trail | IndexedDB event log for replay |

**State Synchronization Pipeline:**
```
User Action → Component State → Zustand Store → Dexie Persist → IndexedDB
     ↓
Optimistic UI Update (<100ms)
     ↓
Background Sync (debounced 500ms)
     ↓
Success/Rollback Notification
```

#### Persistent Management Strategies

| Strategy | Implementation | Migration | Backup/Recovery |
|-----------|----------------|------------|-------------------|
| **Schema Versioning** | Dexie version upgrades | Auto-migration on DB open | Rollback to previous version |
| **Data Lifecycle** | TTL-based pruning | Auto-cleanup of old data | Manual export/import |
| **Backup/Recovery** | JSON export | N/A | Restore from backup file |
| **Conflict Resolution** | Last-write-wins | N/A | Manual merge UI |

**IndexedDB Schema Management:**
```typescript
// src/lib/workspace/project-store.ts
class ViaGentDB extends Dexie {
  projects!: Table<Project>;
  ragDocuments!: Table<RAGDocument>;
  embeddings!: Table<Embedding>;
  canvasBlocks!: Table<CanvasBlock>;
  
  constructor() {
    super('via-gent-db');
    
    // Version 5: Phase 1 (Current)
    this.version(5).stores({
      projects: '++id, name, createdAt',
      ragDocuments: '++id, sourceId, chunkId',
      embeddings: '++id, documentId, vector',
      canvasBlocks: '++id, type, position',
    });
    
    // Version 6: Phase 2 (Future - RAG)
    this.version(6).upgrade((trans) => {
      // Migration: Add RAG tables
      trans.db.createObjectStore('ragDocuments');
      trans.db.createObjectStore('embeddings');
      trans.db.createObjectStore('canvasBlocks');
    });
  }
}
```

#### State Persistence Patterns

| Pattern | Description | Pros | Cons | Use Case |
|---------|-------------|-------|-------|-----------|
| **Event Sourcing** | Immutable event log | Audit trail, replayability | Complex queries | RAG audit trail |
| **CQRS** | Read/Write separation | Scalable reads | Complexity | RAG read/write split |
| **Traditional CRUD** | Direct DB operations | Simple, familiar | N/A | Most state (default) |
| **Optimistic UI** | Immediate update, rollback | Great UX | Race conditions | File operations, agent tools |

**RAG-Specific State Management:**
```typescript
// src/lib/state/rag-store.ts (New in Phase 2)
interface RAGState {
  documents: RAGDocument[];
  embeddings: Map<string, number[]>;
  searchResults: SearchResult[];
  retrievalState: 'idle' | 'searching' | 'retrieving';
}

export const useRAGStore = create<RAGState>()(
  persist(
    (set) => ({
      documents: [],
      embeddings: new Map(),
      searchResults: [],
      retrievalState: 'idle',
      
      // RAG-specific actions
      addDocument: (doc) => set((state) => ({
        documents: [...state.documents, doc],
      })),
      
      search: (query) => {
        set({ retrievalState: 'searching' });
        // Async: vector search
        vectorSearch(query).then(results => {
          set({ searchResults: results, retrievalState: 'idle' });
        });
      },
    }),
    {
      name: 'rag-storage',
      storage: createDexieStorage('ragStates'),
      partialize: (state) => ({
        documents: state.documents,
        embeddings: Array.from(state.embeddings.entries()),
      }),
    }
  )
);
```

**Architecture Alignment:** See [`architecture.md`](../architecture.md) Section 4.2 - Data Architecture

---

### RAG Infrastructure Constraints

#### Vector Database Specifications

| Component | Technology | Constraints | Performance Target | Implementation |
|-----------|-------------|--------------|-------------------|----------------|
| **Vector Store** | Orama WASM | Browser-only, 180KB WASM | <500ms search (1K docs) | `src/lib/rag/orama-store.ts` |
| **Embedding Model** | Transformers.js | Client-side, 50MB model | <2s per 100 chunks | `src/lib/rag/embedding-service.ts` |
| **Chunking Strategy** | Fixed-size | 512-2048 tokens, 100-200 overlap | <1s per 50-page PDF | `src/lib/rag/chunker.ts` |
| **Retrieval** | Hybrid search | Vector + BM25 fusion, top-k=3-10 | <500ms total | `src/lib/rag/retriever.ts` |

**Orama WASM Integration Constraints:**
```typescript
// src/lib/rag/orama-store.ts
import { create, insert, search } from '@orama/orama';

interface RAGConfig {
  dimension: number;      // Embedding dimension (e.g., 384, 768)
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  topK: number;          // Number of results to return
}

// Initialize Orama WASM vector store
const initializeOrama = async () => {
  const db = await create({
    schema: {
      document: {
        id: 'string',
        title: 'string',
        content: 'string',
        embedding: 'vector[384]',  // 384-dimensional embeddings
      },
    },
  });
  
  return db;
};

// Insert document with embedding
const indexDocument = async (db: OramaDB, doc: RAGDocument) => {
  await insert(db, 'document', {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    embedding: await generateEmbedding(doc.content), // Client-side generation
  });
};

// Semantic search
const searchDocuments = async (db: OramaDB, query: string, topK: number = 5) => {
  const results = await search(db, {
    term: query,
    properties: ['title', 'content'],
    limit: topK,
  });
  
  return results.hits.map(hit => ({
    document: hit.document,
    score: hit.score,
  }));
};
```

#### Embedding Service Constraints

| Constraint | Value | Rationale | Implementation |
|------------|-------|-----------|----------------|
| **Model Size** | <50MB | Browser memory limits | Lazy load on demand |
| **Batch Size** | 10-50 chunks | Balance speed vs memory | Queue-based processing |
| **Cache Strategy** | IndexedDB | Persistent across sessions | LRU eviction policy |
| **Dimension** | 384 or 768 | Standard embedding sizes | Configurable per provider |

**Embedding Generation Pipeline:**
```typescript
// src/lib/rag/embedding-service.ts
interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  generateBatch(texts: string[]): Promise<number[][]>;
  clearCache(): void;
}

// Client-side embedding using Transformers.js
class TransformersEmbeddingService implements EmbeddingService {
  private model: any;
  private cache: Map<string, number[]>;
  
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }
    
    // Generate embedding
    const embedding = await this.model.embed(text);
    
    // Cache result
    this.cache.set(text, embedding);
    
    return embedding;
  }
  
  async generateBatch(texts: string[]): Promise<number[][]> {
    // Process in batches of 10-50
    const results: number[][] = [];
    for (let i = 0; i < texts.length; i += 10) {
      const batch = texts.slice(i, i + 10);
      const embeddings = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      );
      results.push(...embeddings);
    }
    return results;
  }
}
```

#### Retrieval Mechanisms

| Mechanism | Description | Pros | Cons | Use Case |
|-----------|-------------|-------|-------|-----------|
| **Semantic Search** | Vector similarity | Captures meaning | Miss exact matches | Concept queries |
| **Hybrid Search** | Vector + BM25 fusion | Best of both | Complexity | General queries |
| **Re-ranking** | Re-score results | Improved relevance | Latency | Complex queries |
| **Context Expansion** | Query variations | Better recall | Cost | Ambiguous queries |

**Retrieval Pipeline:**
```typescript
// src/lib/rag/retriever.ts
interface RetrievalConfig {
  topK: number;           // Number of chunks to retrieve
  minScore: number;        // Minimum relevance threshold
  expandQueries: boolean;  // Generate variations
  rerank: boolean;         // Re-score results
}

const retrieveContext = async (
  query: string,
  config: RetrievalConfig
): Promise<RetrievalResult> => {
  // Step 1: Query expansion (if enabled)
  const queries = config.expandQueries
    ? await expandQuery(query)
    : [query];
  
  // Step 2: Vector search (parallel)
  const vectorResults = await Promise.all(
    queries.map(q => vectorSearch(q, config.topK))
  );
  
  // Step 3: BM25 keyword search
  const keywordResults = await bm25Search(query);
  
  // Step 4: Merge and re-rank
  const merged = mergeResults(vectorResults, keywordResults);
  
  // Step 5: Re-ranking (if enabled)
  const final = config.rerank
    ? await rerankResults(merged, query)
    : merged;
  
  return {
    chunks: final.slice(0, config.topK),
    sources: extractUniqueSources(final),
    scores: final.map(r => r.score),
  };
};
```

#### Knowledge Base Curation

| Aspect | Constraint | Implementation | Validation |
|---------|-------------|----------------|-------------|
| **Source Validation** | User-upload only | File hash verification | SHA-256 checksum |
| **Freshness Management** | TTL-based pruning | Auto-cleanup | 30-day retention |
| **Deduplication** | Content hash | Prevent duplicates | Hash-based dedup |
| **Quality Scoring** | User ratings | Community moderation | Star rating system |

**Source Management Schema:**
```typescript
// src/lib/rag/source-manager.ts
interface RAGSource {
  id: string;
  type: 'pdf' | 'url' | 'youtube' | 'audio';
  title: string;
  contentHash: string;      // SHA-256 for dedup
  createdAt: number;
  lastAccessed: number;
  freshness: number;        // Days since last access
  tags: string[];
  language: 'en' | 'vi';
}

class SourceManager {
  async addSource(source: RAGSource): Promise<void> {
    // Validate source
    const hash = await this.computeHash(source);
    const existing = await db.sources
      .where('contentHash')
      .equals(hash)
      .first();
    
    if (existing) {
      throw new DuplicateSourceError(source.id);
    }
    
    // Store source
    await db.sources.add(source);
  }
  
  async pruneOldSources(): Promise<void> {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
    await db.sources
      .where('createdAt')
      .below(cutoff)
      .delete();
  }
}
```

**Architecture Alignment:** See [`architecture.md`](../architecture.md) Section 3.5 - Phase 2 Vector Store Strategy and [`prd.md`](../prd.md) Section 10.1 - RAG Infrastructure Requirements

---

### Bilingual Support Constraints

#### Vietnamese/English Support Requirements

| Aspect | English (en) | Vietnamese (vi) | Implementation |
|---------|----------------|-------------------|----------------|
| **UI Strings** | 100% coverage | 100% coverage | `src/i18n/{en,vi}.json` |
| **AI Responses** | English default | Vietnamese default | Prompt language selection |
| **Content Parsing** | UTF-8 support | UTF-8 + diacritics | Unicode normalization |
| **Date/Time Format** | MM/DD/YYYY | DD/MM/YYYY | Locale-specific formatting |
| **Number Format** | 1,234.56 | 1.234,56 | Number separators |
| **Currency** | USD | VND | Currency symbols |

**i18n Configuration:**
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LOCALES = ['en', 'vi'] as const;

export const initializeI18n = () => {
  i18n
    .use(LanguageDetector)
    .init({
      resources: {
        en: { translation: require('./en.json') },
        vi: { translation: require('./vi.json') },
      },
      fallbackLng: 'en',
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });
};

// Usage in components
const { t } = useTranslation();
const greeting = t('common.hello'); // "Hello" (en) or "Xin chào" (vi)
```

#### Locale-Specific Formatting

| Format Type | English (en) | Vietnamese (vi) | Implementation |
|-------------|----------------|-------------------|----------------|
| **Date** | MM/DD/YYYY | DD/MM/YYYY | `Intl.DateTimeFormat` |
| **Time** | 12-hour AM/PM | 24-hour | `Intl.DateTimeFormat` |
| **Number** | 1,234.56 | 1.234,56 | `Intl.NumberFormat` |
| **Currency** | $1,234.56 | 1.234,56 ₫ | `Intl.NumberFormat` |
| **Percent** | 50% | 50% | `Intl.NumberFormat` |
| **List Separator** | ", " | ", " | Locale-specific |

**Locale Formatting Utilities:**
```typescript
// src/lib/utils/locale-formatter.ts
export class LocaleFormatter {
  private locale: string;
  
  constructor(locale: string = 'vi') {
    this.locale = locale;
  }
  
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
  
  formatNumber(num: number): string {
    return new Intl.NumberFormat(this.locale).format(num);
  }
  
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }
  
  formatPercent(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value / 100);
  }
}
```

#### RTL Language Preparation

| Language | Direction | Status | Implementation Notes |
|---------|-----------|--------|---------------------|
| **Vietnamese** | LTR (Left-to-Right) | ✅ Supported (default) |
| **English** | LTR (Left-to-Right) | ✅ Supported |
| **Arabic** | RTL (Right-to-Left) | 🔜 Future support |
| **Hebrew** | RTL (Right-to-Left) | 🔜 Future support |

**RTL/LTR Support:**
```css
/* src/styles/rtl-support.css */
:root {
  --direction: ltr; /* Default LTR */
}

[dir="rtl"] {
  --direction: rtl;
  /* Mirror layouts for RTL */
  .sidebar {
    order: 2; /* Move to right */
  }
  .main-content {
    order: 1; /* Move to left */
  }
}

/* Dynamic direction switching */
[dir="rtl"] .icon-arrow-right {
  transform: scaleX(-1); /* Flip icon */
}
```

#### Translation Key Management

| Aspect | Constraint | Implementation | Validation |
|---------|-------------|----------------|-------------|
| **Key Extraction** | Automated via i18next-scanner | `pnpm i18n:extract` |
| **Key Organization** | Namespace-based | `common.*`, `agent.*`, `rag.*` |
| **Missing Keys** | Fallback to English | Development mode warning |
| **Key Length** | <100 chars | Readability guideline |
| **Pluralization** | ICU message format | Count-based strings |

**Translation Workflow:**
```bash
# Extract translation keys after adding new strings
pnpm i18n:extract

# Output: src/i18n/{en,vi}.json
# Keys are auto-extracted from t() and i18next.t() calls

# Translation file structure
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm"
  },
  "agent": {
    "thinking": "Thinking...",
    "searching": "Searching..."
  },
  "rag": {
    "indexing": "Indexing...",
    "searching": "Searching..."
  }
}
```

**Architecture Alignment:** See [`prd.md`](../prd.md) Section 10.5 - Bilingual Support (VI/EN) and [`ux-design-specification.md`](../ux-design-specification.md) Section 8 - Content & Microcopy Guidelines (Localization)

---

### Performance Targets

#### PDF Ingestion Performance

| Metric | Target | Measurement | Red Flag Threshold |
|--------|---------|-------------|---------------------|
| **PDF Parse Time** | <60s (50-page PDF) | `performance.mark()` start → end | >120s |
| **Text Extraction** | <30s (50-page PDF) | pdf.js text extraction duration | >60s |
| **Chunking Time** | <10s (50-page PDF) | Chunk generation duration | >20s |
| **Embedding Generation** | <30s (100 chunks) | Batch embedding duration | >60s |
| **Total Ingestion** | <60s (end-to-end) | Upload → Indexed | >120s |

**PDF Ingestion Pipeline:**
```typescript
// src/lib/ingestion/pdf-ingestion.ts
interface PDFIngestionMetrics {
  parseTime: number;
  extractTime: number;
  chunkingTime: number;
  embeddingTime: number;
  totalTime: number;
}

const ingestPDF = async (file: File): Promise<PDFIngestionMetrics> => {
  const start = performance.now();
  
  // Step 1: Parse PDF
  const parseStart = performance.now();
  const pdf = await pdfjsLib.getDocument(file);
  const parseTime = performance.now() - parseStart;
  
  // Step 2: Extract text
  const extractStart = performance.now();
  const text = await extractText(pdf);
  const extractTime = performance.now() - extractStart;
  
  // Step 3: Chunk content
  const chunkStart = performance.now();
  const chunks = await chunkText(text);
  const chunkingTime = performance.now() - chunkStart;
  
  // Step 4: Generate embeddings
  const embedStart = performance.now();
  const embeddings = await generateEmbeddings(chunks);
  const embeddingTime = performance.now() - embedStart;
  
  const totalTime = performance.now() - start;
  
  return { parseTime, extractTime, chunkingTime, embeddingTime, totalTime };
};
```

#### Vector Search Performance

| Metric | Target | Measurement | Red Flag Threshold |
|--------|---------|-------------|---------------------|
| **Search Latency** | <500ms (1K docs) | Query → results display | >1s |
| **Indexing Time** | <2s (100 chunks) | Chunk → vector store | >5s |
| **Retrieval Time** | <200ms (top-k=10) | Vector search duration | >500ms |
| **Re-ranking Time** | <100ms (100 results) | Re-score duration | >200ms |

**Vector Search Optimization:**
```typescript
// src/lib/rag/vector-search.ts
const searchWithMetrics = async (
  query: string,
  topK: number = 5
): Promise<SearchResult[]> => {
  const start = performance.now();
  
  // Vector search
  const results = await oramaSearch(query, topK);
  
  const searchTime = performance.now() - start;
  
  // Log metrics
  logMetric('vector_search_latency', searchTime);
  
  // Red flag check
  if (searchTime > 1000) {
    console.warn(`Slow vector search: ${searchTime}ms`);
  }
  
  return results;
};
```

#### Summary Generation Performance

| Metric | Target | Measurement | Red Flag Threshold |
|--------|---------|-------------|---------------------|
| **Generation Time** | <30s (5 sources) | LLM response time | >60s |
| **Citation Accuracy** | 100% | Citation validation | <90% |
| **Source Attribution** | 100% | Source linking | <95% |

**Summary Generation Pipeline:**
```typescript
// src/lib/rag/summary-generator.ts
interface SummaryMetrics {
  generationTime: number;
  citationCount: number;
  sourceCount: number;
}

const generateSummary = async (
  sources: RAGSource[],
  query: string
): Promise<SummaryMetrics> => {
  const start = performance.now();
  
  // Construct RAG context
  const context = await retrieveContext(sources, query);
  
  // Generate summary with citations
  const response = await llmGenerate(
    systemPrompt: CITATION_SYSTEM_PROMPT,
    userPrompt: query,
    context: context
  );
  
  const generationTime = performance.now() - start;
  
  // Validate citations
  const citations = extractCitations(response);
  const citationCount = citations.length;
  
  return {
    generationTime,
    citationCount,
    sourceCount: sources.length,
  };
};
```

#### Audio Generation Performance

| Metric | Target | Measurement | Red Flag Threshold |
|--------|---------|-------------|---------------------|
| **Script Generation** | <30s (5-page summary) | LLM script time | >60s |
| **TTS Encoding** | <30s (5-min audio) | Speech synthesis duration | >60s |
| **Total Generation** | <60s (end-to-end) | Script → audio | >120s |

**Audio Generation Pipeline:**
```typescript
// src/lib/rag/audio-generator.ts
interface AudioMetrics {
  scriptTime: number;
  ttsTime: number;
  totalTime: number;
}

const generateAudio = async (
  summary: string,
  language: 'vi' | 'en'
): Promise<AudioMetrics> => {
  const start = performance.now();
  
  // Step 1: Generate script
  const scriptStart = performance.now();
  const script = await llmGenerateScript(summary, language);
  const scriptTime = performance.now() - scriptStart;
  
  // Step 2: Text-to-speech
  const ttsStart = performance.now();
  const audio = await textToSpeech(script, language);
  const ttsTime = performance.now() - ttsStart;
  
  const totalTime = performance.now() - start;
  
  return { scriptTime, ttsTime, totalTime };
};
```

#### Canvas Interaction Performance

| Metric | Target | Measurement | Red Flag Threshold |
|--------|---------|-------------|---------------------|
| **Zoom Performance** | 60fps | Frame rate during zoom | <30fps |
| **Pan Performance** | 60fps | Frame rate during pan | <30fps |
| **Block Drag** | 60fps | Frame rate during drag | <30fps |
| **Card Flip** | 60fps | Animation frame rate | <30fps |

**Canvas Performance Optimization:**
```typescript
// src/components/canvas/Canvas.ts
const useCanvasPerformance = () => {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      const delta = now - lastTime;
      
      if (delta >= 1000) {
        const currentFPS = Math.round((frameCount * 1000) / delta);
        setFps(currentFPS);
        
        // Red flag check
        if (currentFPS < 30) {
          console.warn(`Low canvas FPS: ${currentFPS}`);
        }
        
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }, []);
  
  return fps;
};
```

**Architecture Alignment:** See [`prd.md`](../prd.md) Section 10.8 - Quality & Performance Requirements and [`ux-design-specification.md`](../ux-design-specification.md) Section 24 - Performance Targets (Phase 2)

---

### Brownfield Architecture Alignment

#### Integration Points with Legacy Systems

| Legacy System | Integration Point | Strategy | Status |
|---------------|-------------------|----------|--------|
| **Phase 1 IDE** | File system bridge | Reuse FSA adapters | ✅ Existing |
| **Phase 1 Agent** | Tool registry | Extend tool definitions | ✅ Existing |
| **Phase 1 State** | Zustand stores | Add RAG stores | 🔜 Phase 2 |
| **IndexedDB Schema** | Version 5 → 6 migration | Auto-migration | 🔜 Phase 2 |
| **WebContainer** | File system sync | Maintain dual-write sync | ✅ Existing |

**Gradual Migration Strategy:**
```typescript
// Migration Path: Phase 1 → Phase 2
interface MigrationPhase {
  version: number;
  description: string;
  migration: () => Promise<void>;
}

const migrations: MigrationPhase[] = [
  {
    version: 6,
    description: 'Add RAG infrastructure',
    migration: async () => {
      // Create RAG tables
      await db.version(6).stores({
        ragDocuments: '++id, sourceId, chunkId',
        embeddings: '++id, documentId, vector',
      });
      
      // Migrate existing data
      await migrateDocumentsToRAG();
    },
  },
];

// Auto-migration on DB open
db.on('populate', () => {
  const currentVersion = await db.version.get('currentVersion');
  const pendingMigrations = migrations.filter(m => m.version > currentVersion);
  
  for (const migration of pendingMigrations) {
    await migration.migration();
    await db.version.put('currentVersion', migration.version);
  }
});
```

#### Backward Compatibility Requirements

| Component | Compatibility Strategy | Implementation | Validation |
|-----------|---------------------|----------------|-------------|
| **State Stores** | Versioned schema | Auto-migration | Migration tests |
| **File Format** | JSON-based | Version field | Format validation |
| **API Surface** | Deprecation warnings | Graceful fallback | Deprecated API logs |
| **UI Components** | Feature flags | Progressive disclosure | Feature flag tests |

**Backward Compatibility Pattern:**
```typescript
// src/lib/utils/compatibility.ts
interface VersionedData<T> {
  version: number;
  data: T;
}

export const migrateData = async <T>(
  rawData: unknown,
  currentVersion: number,
  targetVersion: number
): Promise<T> => {
  // Validate version
  if (typeof rawData !== 'object' || !rawData.hasOwnProperty('version')) {
    throw new InvalidDataError('Missing version field');
  }
  
  const versioned = rawData as VersionedData<T>;
  
  // Apply migrations sequentially
  let data = versioned.data;
  for (let v = versioned.version + 1; v <= targetVersion; v++) {
    const migration = migrations.find(m => m.version === v);
    if (migration) {
      data = await migration.migrate(data);
    }
  }
  
  return data;
};
```

#### Strangler Fig Pattern Implementation

| Phase | Strangled Component | New Implementation | Integration |
|-------|-------------------|-------------------|------------|
| **Phase 1** | File system sync | RAG file system | Dual-write to vector store |
| **Phase 1** | Agent tools | RAG tools | Tool registry extension |
| **Phase 1** | State management | RAG state | Zustand store addition |
| **Phase 2** | Knowledge canvas | Phase 2 canvas | React Flow integration |

**Strangler Fig Pattern:**
```typescript
// src/lib/strangler-fig/registry.ts
interface StrangledModule {
  name: string;
  version: number;
  status: 'active' | 'deprecated' | 'replaced';
}

const moduleRegistry: StrangledModule[] = [
  {
    name: 'file-system-sync',
    version: 1,
    status: 'active',
  },
  {
    name: 'rag-file-system',
    version: 2,
    status: 'active',
  },
  {
    name: 'knowledge-canvas',
    version: 1,
    status: 'deprecated',
  },
];

// Gradual migration: Replace deprecated modules
const migrateModule = async (moduleName: string) => {
  const module = moduleRegistry.find(m => m.name === moduleName);
  if (!module || module.status !== 'deprecated') return;
  
  // Initialize new module
  await initializeNewModule(moduleName);
  
  // Migrate data
  await migrateData(moduleName, module.version);
  
  // Mark as replaced
  module.status = 'replaced';
};
```

**Architecture Alignment:** See [`architecture.md`](../architecture.md) Section 2.3 - Brownfield Architecture Constraints and [`prd.md`](../prd.md) Section 10.7 - Technical Requirements Alignment

---

## Architecture Remediation Module (NEW - 2026-01-04)

**Module Location**: `_bmad/modules/architecture-remediation/`

**Purpose**: Systematic elimination of god stores, component normalization, and workspace E2E implementation.

### Autonomous Execution Mode (BMad Master v2.0)

**Agent**: `@bmad-core-bmad-master`
**Mode**: Autonomous workflow orchestration
**Activation**: Load agent, state intent → auto-select workflows → chain execution

**Intent Classification**:
```yaml
refactor|split|god.*(store|class) → eliminate-god-stores workflow
component.*(large|split) → normalize-components workflow
workspace.*(file|sync|e2e) → workspace-file-system-e2e workflow
typescript|ts.?error → typescript-fixer workflow
test|coverage → test-writer workflow
```

### Current Epic Structure

| Epic ID | Name | Priority | Duration | Status |
|---------|------|----------|----------|--------|
| ARC-1 | Foundation Stabilization | P0 | Week 1 | 🟢 IN_PROGRESS |
| ARC-2 | IDE Workspace E2E | P0 | Week 2 | 🔴 TODO |
| ARC-3 | Notes Workspace E2E | P0 | Week 3 | 🔴 TODO |
| ARC-4 | Knowledge Workspace E2E | P0 | Week 4 | 🔴 TODO |

### Epic ARC-1 Stories (Week 1)

| Story ID | Task | Hours | Status |
|----------|------|-------|--------|
| ARC-1.1 | Split dexie-db.ts (1,267 lines) | 8-12 | 🟢 READY |
| ARC-1.2 | Consolidate duplicate dexie-db.ts | 4-6 | 🔴 TODO |
| ARC-1.3 | Refactor event-bus.ts (644 lines) | 6-8 | 🔴 TODO |
| ARC-1.4 | Create workspace-specific store facades | 8-10 | 🔴 TODO |

**Sprint Status**: `_bmad-output/sprint-artifacts/arc-sprint-status.yaml`
**Epic Tracking**: `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`

### Store Architecture (CRITICAL)

**Canonical Location**: `src/infrastructure/persistence/stores/`
**Deprecated**: `src/lib/state/` (migrate to canonical)
**Deleted**: `src/stores/` (2026-01-03)

**God Stores Identified** (>500 lines):
- `dexie-db.ts` - 1,267 lines (DATABASE SCHEMA, not Zustand)
- `canvas-store.ts` - 623 lines → split into 6 slices
- `flashcard-store.ts` - 531 lines → split into 4-5 slices
- `study-store.ts` - 458 lines → split into 4-5 slices

**Store Splitting Strategy** (eliminate-god-stores workflow):
```typescript
// Target architecture (max 120 lines per slice)
src/infrastructure/persistence/stores/{domain}/
├── {domain}-crud-slice.ts          (120 lines)
├── {domain}-workspace-bindings-slice.ts  (100 lines)
├── {domain}-permissions-slice.ts    (110 lines)
├── {domain}-events-slice.ts         (90 lines)
├── {domain}-utils-slice.ts          (90 lines)
└── index.ts (unified store)         (150 lines)
```

**Facade Pattern** (MANDATORY for backward compatibility):
```typescript
// Old export path continues to work
export * from './infrastructure/persistence/stores/{domain}';
```

### Component Size Limits

**Rules**:
- React components: ≤300 lines
- Custom hooks: ≤150 lines
- Store slices: ≤120 lines
- Utility files: ≤200 lines

**Violations Found**: 41 components exceed 300 lines (13.9%)
**Critical Violations** (>600 lines):
- `resizable.tsx` - 745 lines
- `KnowledgePage.tsx` - 658 lines
- `IndexingProgressPanel.tsx` - 593 lines

**Action**: Use `normalize-components` workflow to split

### TypeScript Error Strategy

**Code Files** (ENFORCE): Fix all errors
- Use incremental checking: `pnpm exec tsc --noEmit --incremental`
- Filter out test files: `grep -v "\.test\." | grep -v "__tests__"`

**Test Files** (EXCLUDE): Errors are non-blocking
- Do not count in metrics
- Focus on production code quality

### Workflow Execution Pattern

**Example**: "Split dexie-db.ts using eliminate-god-stores workflow"

1. BMad Master detects intent → loads `@store-refactorer`
2. Executes workflow with validation loops
3. Uses incremental TypeScript checking (excludes tests)
4. Generates handoff artifacts between phases
5. Updates sprint status on completion
6. Auto-runs `/governance-enforcement` workflow

### Available Workflows

- `eliminate-god-stores` - Split large stores into slices
- `normalize-components` - Split oversized components
- `workspace-file-system-e2e` - E2E validation for workspaces
- `notes-sync-strategy` - Notes local filesystem sync
- `knowledge-sync-strategy` - Knowledge source import sync

### Available Agents

- `@store-refactorer` - God store elimination specialist
- `@component-splitter` - Component normalization expert
- `@typescript-fixer` - TS error remediation
- `@test-writer` - Test coverage improvement
- `@workspace-architect` - Workspace E2E architect
- `@file-sync-specialist` - Sync strategies expert

---

## Reference Documents

- **Architecture:** [`architecture.md`](../architecture.md)
- **PRD:** [`prd.md`](../prd.md)
- **UX Design Specification:** [`ux-design-specification.md`](../ux-design-specification.md)
- **Sprint Status:** `../sprint-artifacts/sprint-status.yaml`
- **Epics:** [`../epics.md`](../epics.md)
- **MCP Research Protocol:** `.agent/rules/general-rules.md`

## Critical Dependency Matrix

_Strict execution order required to prevent blockers._

| Predecessor | Successor | Reason |
|-------------|-----------|--------|
| **Phase 1 State** | **Phase 2 RAG State** | RAG requires stable state foundation |
| **Phase 1 File System** | **Phase 2 RAG Ingestion** | RAG requires file access |
| **Phase 1 Agent Tools** | **Phase 2 RAG Tools** | RAG extends tool registry |
| **RAG Infrastructure** | **Knowledge Canvas** | Canvas requires RAG context |
| **Knowledge Canvas** | **Study Artifacts** | Artifacts generated from canvas |
| **Bilingual Support** | **All Phase 2 Features** | Vietnamese-first UI required |

---

_Generated: 2025-12-28T20:46+07:00_
_Enhanced: 2025-12-29T23:29+07:00_
_This document is optimized for LLM context efficiency. Keep it lean.
_Autonomous Mode Update: 2026-01-04T14:30+07:00_
