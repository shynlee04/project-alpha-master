# Via-gent Comprehensive Architectural Map
**Generated:** 2026-01-01
**Analysis Scope:** Complete codebase (1,943,291 lines packed, 899 TS/TSX files)
**Methodology:** Repomix full-pack with compression + Grep pattern analysis

---

## Executive Summary

### Codebase Metrics
- **Total Files:** 899 TypeScript/TSX files
- **Total Lines:** ~172,000 (source code only, excluding build artifacts)
- **UI Components:** 304 presentation components
- **State Stores:** 50+ stores across 3 locations
- **TypeScript Errors:** 1,253 active errors (down from 1,340 after Cycle 12 fixes)
- **Circular Dependencies:** 4 high-risk cycles detected

### Critical Health Indicators
| System | Health Score | Lines of Code | Issues | Priority |
|--------|-------------|---------------|--------|----------|
| LLM Provider Vault | 83% (10/12) | 450 | ✅ Production-ready | P3 |
| Agent Configuration | 42% (5/12) | 1,500 | ❌ God store + circular deps | **P0** |
| Tool Permissions | 83% (10/12) | 380 | ✅ Fixed (Cycle 12) | P2 |
| RAG Pipeline | 65% | 3,200 | ⚠️ Partial implementation | **P1** |
| State Architecture | 35% | 6,500 | ❌ Massive duplication | **P0** |

---

## 1. Import Path Dependency Graph

### 1.1 Deprecated Import Patterns (MIGRATION REQUIRED)

#### Pattern A: `@/stores/` (OLD - 8 files)
**Usage:** 100+ import statements across codebase
**Target:** Migrate to `@/infrastructure/persistence/stores/`

```typescript
// ❌ DEPRECATED (100+ files still using)
import { useAgentsStore } from '@/stores/agents-store';
import { useProviderStore } from '@/stores/provider-store';
import { useThreadsStore } from '@/stores/conversation-threads-store';
import { useAutoApproveStore } from '@/stores/auto-approve-store';
import { usePromptEnhancementStore } from '@/stores/prompt-enhancement-store';
import { useAgentSelection } from '@/stores/agent-selection-store';

// ✅ CORRECT
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents-store';
import { useProviderStore } from '@/infrastructure/persistence/stores/providers';
import { useThreadsStore } from '@/infrastructure/persistence/stores/conversation-threads-store';
```

**Affected Files (Top 20):**
1. `/src/presentation/components/agent/AgentConfigDialog.tsx` (line 743833)
2. `/src/presentation/components/agent/ProviderConfigDialog.tsx` (line 744756)
3. `/src/lib/agent/agent-io.ts` (line 730816)
4. `/src/presentation/components/ide/AgentChatPanel.tsx` (line 712688)
5. `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` (line 667421)
6-20. Multiple chat, IDE, and agent components

---

#### Pattern B: `@/lib/state/` (OLD - 25 files)
**Usage:** 50+ import statements
**Target:** Migrate to `@/infrastructure/persistence/stores/`

```typescript
// ❌ DEPRECATED
import { useIDEStore } from '@/lib/state/ide-store';
import { useRAGStore } from '@/lib/state/rag-store';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import { useFlashcardStore } from '@/lib/state/flashcard-store';
import { useQuizStore } from '@/lib/state/quiz-store';
import { useStudyStore } from '@/lib/state/study-store';
import { useConversationStore } from '@/lib/state/conversation-store';
import { useLayoutStore } from '@/lib/state/layout-store';
import { useProviderStore } from '@/lib/state/provider-store';
import { useToolPermissionStore } from '@/lib/state/tool-permission-store';

// ✅ CORRECT
import { useIDEStore } from '@/infrastructure/persistence/stores/ide-store';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
// ... migrate all to infrastructure/persistence/stores/
```

**Migration Priority:** P1 (25 files, affects core state management)

---

### 1.2 Unified Store Pattern (NEW - Story 13-1)

**New Architecture (January 2026):**
```typescript
// ✅ NEW UNIFIED STORE (Story 13-1)
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

// Slice-based access
const agents = useAppStore(state => state.agents);
const providers = useAppStore(state => state.providers);
const activeAgent = useAppStore(state => state.activeAgent);
```

**Implementation Status:**
- ✅ Store created: `/src/infrastructure/persistence/stores/use-app-store.ts`
- ✅ Slices: `agent-crud-slice.ts`, `provider-crud-slice.ts`, `provider-models-slice.ts`, `provider-utils-slice.ts`
- ⚠️ Backward facade: `/src/stores/agents-store.ts` re-exports from new store
- ❌ Migration: 100+ files still importing from old paths

**Slices Structure:**
```
src/infrastructure/persistence/stores/providers/
├── index.ts (facade)
├── provider-crud-slice.ts (430 lines → 4 slices)
├── provider-models-slice.ts (NEW)
├── provider-utils-slice.ts (NEW)
└── types.ts (shared types)
```

---

## 2. Type Error Density Heatmap

### 2.1 High-Error Files (>20 errors)

| File | Error Count | Error Types | Priority |
|------|-------------|-------------|----------|
| `src/infrastructure/persistence/stores/index.ts` | 45+ | Missing exports, wrong imports | **P0** |
| `src/infrastructure/persistence/stores/rag/rag-store.ts` | 38+ | Type mismatches, missing properties | **P0** |
| `src/lib/agent/__tests__/prompt-composer.test.ts` | 30+ | Private constructor access, wrong types | P1 |
| `src/infrastructure/persistence/stores/session-snapshot-manager.ts` | 25+ | Missing properties, wrong module paths | P1 |
| `src/lib/agent/facades/knowledge-tools-impl.ts` | 15+ | Missing exports, type incompatibilities | P1 |

### 2.2 Error Distribution by Category

| Error Category | Count | Percentage |
|----------------|-------|------------|
| **Import/Export Errors** (TS2305, TS2307, TS2459) | 312 | 25% |
| **Type Mismatches** (TS2345, TS2322, TS2339) | 450 | 36% |
| **Missing Properties** (TS2551, TS2339) | 187 | 15% |
| **Test-Related Errors** (private access, mocks) | 156 | 12% |
| **Other** | 148 | 12% |

### 2.3 Critical Type Issues

#### Issue 1: Store Index Barrels (P0)
```typescript
// src/infrastructure/persistence/stores/index.ts

// ❌ ERRORS:
// Line 94: QuizState not exported from '@/lib/state/quiz-store'
// Line 99: FlashcardState not exported from './flashcard-store'
// Line 104: StudyState not exported from './study-store'
// Line 110: Module './rag-store' not found (should be './rag/rag-store')
// Line 129: HubState not exported from './hub-store'

// ✅ FIX: Export state types or use direct imports
export type { QuizState } from '@/lib/state/quiz-store'; // Add export in source
export type { FlashcardState } from './flashcard-store';
export type { StudyState } from './study-store';
export type { RAGState } from './rag/rag-store'; // Fix path
export type { HubState } from './hub-store';
```

#### Issue 2: RAG Store Type Incompatibilities (P0)
```typescript
// src/infrastructure/persistence/stores/rag/rag-store.ts

// ❌ ERROR Line 52:
// Argument of type '"ragState"' is not assignable to parameter of type 'keyof ViaGentDatabase'

// ❌ ERROR Line 81:
// Property 'setHasHydrated' does not exist on type 'RAGStoreState'
// Did you mean '_hasHydrated'?

// ❌ ERROR Line 86:
// Property 'loadIndexMetadata' does not exist on type 'RAGStoreState'
// Did you mean 'indexMetadata'?

// ✅ FIX: Update ViaGentDatabase schema
// src/infrastructure/persistence/dexie-db-types.ts
export interface ViaGentDatabase {
  ragState: RAGState; // Add this table
  // ... other tables
}
```

#### Issue 3: Agent Type Mismatches (P1)
```typescript
// src/lib/agent/agent-io.ts (Line 128, 137)

// ❌ ERROR: Type incompatibility with Agent.tools.workspacePermissions
// Expected: { ide: boolean; knowledge: boolean; study: boolean; notes: boolean; }
// Actual: Record<string | number | symbol, unknown>

// ✅ FIX: Update store schema or type casting
const tools: AgentToolBinding[] = agent.tools.map(tool => ({
  ...tool,
  workspacePermissions: tool.workspacePermissions as WorkspaceToolPermissions,
}));
```

#### Issue 4: Test Mock Errors (P2)
```typescript
// src/lib/agent/__tests__/prompt-composer.test.ts

// ❌ ERROR Line 7: LayerContext not exported
// ❌ ERROR Line 27: Constructor is private
// ❌ ERROR Line 71+: Missing required properties in LayerContext

// ✅ FIX: Export test utilities or use factory pattern
// src/lib/agent/prompt-composer.ts
export const createTestLayerContext = (overrides?: Partial<LayerContext>): LayerContext => ({
  openFiles: [],
  workspaceReady: true,
  ...overrides,
});
```

---

## 3. State Management Architecture

### 3.1 Current Store Distribution (Crisis Level)

```
📊 STORE LOCATION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Location A: src/stores/ (DEPRECATED - 8 files)
├── agents-store.ts (430 lines) → God store
├── provider-store.ts → Duplicate
├── conversation-threads-store.ts (726 lines) → God store
├── agent-selection-store.ts
├── auto-approve-store.ts
├── prompt-enhancement-store.ts
├── provider-models-store.ts
└── use-app-store.ts (NEW - unified store)

Location B: src/lib/state/ (DEPRECATED - 25 files)
├── ide-store.ts
├── rag-store.ts (1,595 lines) → GOD STORE (duplicated)
├── conversation-store.ts
├── knowledge-store.ts
├── flashcard-store.ts
├── quiz-store.ts
├── study-store.ts
├── provider-store.ts → Duplicate
├── tool-permission-store.ts
├── layout-store.ts
├── editor-store.ts
├── agent-loop-store.ts
├── statusbar-store.ts
├── canvas-store.ts
├── workspace-store.ts
├── tool-permission-store.ts
└── ... 10+ more stores

Location C: src/infrastructure/persistence/stores/ (TARGET - 38+ files)
├── agents/
│   ├── agents-store.ts (430 lines) → Duplicate
│   ├── agent-selection-store.ts
│   └── slices/
│       ├── agent-crud-slice.ts (NEW)
│       └── ...
├── providers/
│   ├── provider-crud-slice.ts (NEW - 148 lines)
│   ├── provider-models-slice.ts (NEW)
│   ├── provider-utils-slice.ts (NEW)
│   └── index.ts
├── conversation/
│   ├── conversation-store.ts
│   └── conversation-threads-store.ts
├── rag/
│   ├── rag-store.ts (1,595 lines) → Duplicate from lib/state
│   ├── rag-chat-slice.ts
│   ├── rag-chunking-slice.ts
│   └── rag-helpers.ts
├── quiz/
├── study/
├── canvas/
├── ide/
└── use-app-store.ts (NEW - unified store)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 71 STORE FILES (17 duplicates = 30% duplication rate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3.2 Circular Dependency Detection

#### Cycle 1: agents-store.ts ↔ provider-store.ts (CRITICAL)
```
src/stores/agents-store.ts
  └─► imports from '@/lib/state/provider-store'
       └─► imports from '@/stores/agents-store'
            └─► CYCLE! ❌
```

**Impact:** Hot-reload breaks, state hydration fails
**Fix:** Epic AC-1 (Agent Configuration Consolidation)
- Migrate to unified `use-app-store.ts`
- Use event bus for cross-store communication
- Remove direct imports

#### Cycle 2: rag-store.ts ↔ dexie-db.ts ↔ rag-store.ts
```
src/lib/state/rag-store.ts
  └─► imports from '@/lib/state/dexie-db'
       └─► imports from '@/lib/state/rag-store'
            └─► CYCLE! ❌
```

**Impact:** IndexedDB schema conflicts
**Fix:** Separate schema definitions from store logic

#### Cycle 3: workspace-context → use-workspace-context → workspace-context
```
src/hooks/useWorkspaceContext.ts
  └─► imports from '@/lib/workspace/workspace-context'
       └─► imports from '@/hooks/useWorkspaceContext'
            └─► CYCLE! ❌
```

**Impact:** Workspace switching breaks
**Fix:** Refactor to `src/domain/use-cases/switch-workspace.ts`

#### Cycle 4: use-agent-chat ↔ use-agents-store ↔ agent-io
```
src/lib/agent/hooks/use-agent-chat-with-tools.ts
  └─► imports from '@/stores/agents-store'
       └─► imports from '@/lib/agent/agent-io'
            └─► imports from '@/lib/agent/hooks/use-agent-chat-with-tools'
                 └─► CYCLE! ❌
```

**Impact:** Agent tool execution fails
**Fix:** Use facade pattern (already done for tool permissions)

### 3.3 God Stores (>300 lines violation)

| Store | Lines | Violations | Issues | Remediation |
|-------|-------|------------|--------|-------------|
| **rag-store.ts** | 1,595 | 13.3x | Duplicated in 2 locations | Epic RAG-1 (Split into slices) |
| **conversation-threads-store.ts** | 726 | 6.0x | Thread hierarchy + messages | Story 2-3 (Extract thread manager) |
| **agents-store.ts** | 430 | 3.6x | Circular deps + CRUD + selection | ✅ FIXED (Story 13-1: 4 slices) |
| **ide-store.ts** | 380 | 3.2x | IDE state + editor + layout | Epic IDE-1 (Split into domain stores) |
| **conversation-store.ts** | 340 | 2.8x | Messages + metadata + threads | Epic CONV-1 (Message store slice) |

**Target:** Max 120 lines per store file (sweeping-validation.md standard)

---

## 4. Event Bus Flow Analysis

### 4.1 Cross-Workspace Event Bus (NEW - Cycle 12)

**Implementation:** `src/infrastructure/events/cross-workspace-event-bus.ts` (445 lines)

#### Event Types Emitted
```typescript
export interface WorkspaceChangeEvent {
  workspaceId: string;
  previousWorkspaceId?: string;
  timestamp: number;
}

export interface AgentConfigChangeEvent {
  agentId: string;
  workspaceId: string;
  changeType: 'created' | 'updated' | 'deleted';
  timestamp: number;
}

export interface ProviderChangeEvent {
  providerId: string;
  workspaceId?: string; // undefined if global
  changeType: 'added' | 'updated' | 'removed';
  timestamp: number;
}

// Event Map
type EventMap = {
  'workspace:changed': WorkspaceChangeEvent;
  'agent:config:changed': AgentConfigChangeEvent;
  'provider:changed': ProviderChangeEvent;
};
```

#### Event Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                  Cross-Workspace Event Bus                   │
│              (Singleton EventEmitter3)                       │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
        ┌───────▼─────────┐     ┌───────▼──────────┐
        │  EMITTERS       │     │  LISTENERS       │
        ├─────────────────┤     ├──────────────────┤
        │ WorkspaceSwitcher│     │ AgentConfigStore │
        │ AgentConfigDialog│     │ ProviderStore    │
        │ ProviderConfig   │     │ AgentStore       │
        │ ToolPermissionMgr│     │ RAGStore         │
        └─────────────────┘     └──────────────────┘

EVENT FLOW:
1. User switches workspace
   └─► crossWorkspaceEventBus.emit('workspace:changed', payload)
        └─► AgentStore.filterByWorkspace(workspaceId)
        └─► ProviderStore.filterByWorkspace(workspaceId)
        └─► RAGStore.loadIndexForWorkspace(workspaceId)

2. User updates agent config
   └─► crossWorkspaceEventBus.emit('agent:config:changed', payload)
        └─► AgentStore.updateAgent(agentId, config)
        └─► ToolPermissionManager.revokeAgentTools(agentId)

3. User adds provider credentials
   └─► crossWorkspaceEventBus.emit('provider:changed', payload)
        └─► ProviderStore.addProvider(provider)
        └─► ModelRegistry.fetchModels(providerId)
```

#### Integration Status
- ✅ Core event bus implemented
- ✅ Workspace change event working
- ⚠️ Agent config event partially implemented
- ❌ Provider change event not wired
- ❌ File change events not integrated

**Files Using Event Bus (6 files):**
1. `src/lib/events/workspace-events.ts` (workspace change emitter)
2. `src/infrastructure/persistence/stores/agents/agent-selection-store.ts` (listener)
3. `src/lib/agent/tool-permission-manager.ts` (listener)
4. `src/presentation/components/agent/WorkspacePermissionEditor.tsx` (UI component)
5. `src/lib/events/cross-workspace-event-bus.ts` (implementation)
6. `src/infrastructure/events/cross-workspace-event-bus.ts` (infrastructure layer)

---

### 4.2 File System Event Flow

**Event Bus:** Local EventBus wrapper around EventEmitter3

#### File Change Events
```typescript
// Emitted by:
// - LocalFSAdapter (local file system)
// - SyncManager (WebContainer sync)
// - AgentFileTools (agent operations)

eventBus.emit('file:created', { path, source: 'agent' });
eventBus.emit('file:modified', { path, content, source: 'agent' });
eventBus.emit('file:deleted', { path, source: 'agent' });
eventBus.emit('file:changed', { path, size, timestamp });
```

#### Sync Events
```typescript
// Emitted by SyncManager

eventBus.emit('sync:started', { fileCount, direction: 'to-wc' });
eventBus.emit('sync:progress', { current, total, currentFile });
eventBus.emit('sync:completed', { success, timestamp, filesProcessed });
eventBus.emit('sync:error', { error, file });
```

#### Agent Tool Events
```typescript
// Emitted by AgentToolExecutor

eventBus.emit('agent:tool:started', { toolId, agentId, timestamp });
eventBus.emit('agent:tool:completed', { toolId, agentId, result, duration });
eventBus.emit('agent:tool:failed', { toolId, agentId, error, duration });
```

#### Event Flow Diagram
```
┌──────────────────────────────────────────────────────────────┐
│                      FILE EVENT FLOW                         │
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
        ┌───────▼─────────┐      ┌────────▼──────────┐
        │  EMITTERS       │      │  LISTENERS        │
        ├─────────────────┤      ├───────────────────┤
        │ LocalFSAdapter  │      │ StatusBar         │
        │ SyncManager     │      │ FileTree          │
        │ AgentFileTools  │      │ Monaco Editor     │
        │ AgentTermTools  │      │ ExplorerPanel     │
        └─────────────────┘      │ XTerminal         │
                                  │ SyncStatusPanel   │
                                  └───────────────────┘

FLOW:
1. User edits file in Monaco
   └─► editor.onDidChangeModelContent
        └─► LocalFSAdapter.writeFile(path, content)
             └─► eventBus.emit('file:modified', { path, content })
                  └─► StatusBar.show('File saved: App.tsx')
                  └─► SyncManager.syncFile(path)
                       └─► WebContainer FS update
```

---

## 5. RAG Pipeline Components

### 5.1 RAG Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAG PIPELINE FLOW                            │
└───────────────┬───────────────────────────────┬────────────────┘
                │                               │
        ┌───────▼──────────┐          ┌────────▼──────────┐
        │  INGESTION       │          │  RETRIEVAL        │
        ├──────────────────┤          ├───────────────────┤
        │ SourceImport     │          │ HybridRetriever   │
        │ DocumentChunker  │          │ VectorSearch      │
        │ EmbeddingService │          │ FulltextSearch    │
        │ OramaIndex       │          │ CitationMatcher   │
        └──────────────────┘          └───────────────────┘
                │                               │
        ┌───────▼──────────┐          ┌────────▼──────────┐
        │  STORAGE         │          │  GENERATION       │
        ├──────────────────┤          ├───────────────────┤
        │ Dexie (IndexedDB)│          │ RAGChat           │
        │ OramaIndexManager│          │ CitationSidebar   │
        │ ChunkMetadata    │          │ ContextBuilder    │
        └──────────────────┘          └───────────────────┘
```

### 5.2 RAG Component Inventory

#### Ingestion Layer
| Component | File | Lines | Status | Issues |
|-----------|------|-------|--------|--------|
| **SourceImportDialog** | `src/presentation/components/knowledge/SourceImportDialog.tsx` | 280 | ✅ Complete | Missing i18n keys |
| **DocumentChunker** | `src/lib/rag/chunk-strategies/` | 450 | ✅ Complete | 5 strategies implemented |
| **EmbeddingService** | `src/lib/knowledge/embedding-worker-bridge.ts` | 180 | ✅ Complete | Worker-based |
| **OramaIndexManager** | `src/lib/knowledge/orama/index.ts` | 550 | ⚠️ Partial | Vector search WIP |

#### Storage Layer
| Component | File | Lines | Status | Issues |
|-----------|------|-------|--------|--------|
| **RAGStore** | `src/infrastructure/persistence/stores/rag/rag-store.ts` | 1,595 | ❌ CRITICAL | God store + 38 TS errors |
| **Dexie DB Schema** | `src/infrastructure/persistence/dexie-db-types.ts` | 120 | ⚠️ Partial | Missing ragState table |
| **OramaIndexRecord** | `src/lib/state/dexie-db.ts` | 15 | ✅ Complete | IndexedDB schema |

#### Retrieval Layer
| Component | File | Lines | Status | Issues |
|-----------|------|-------|--------|--------|
| **HybridRetriever** | `src/lib/rag/retrieval/hybrid-retriever.ts` | 340 | ⚠️ Partial | Not wired to UI |
| **VectorSearch** | `src/lib/rag/search/vector-search.ts` | 180 | ⚠️ WIP | Orama WASM integration |
| **FulltextSearch** | `src/lib/rag/search/fulltext-search.ts` | 120 | ✅ Complete | Working |
| **CitationMatcher** | `src/lib/rag/citations/citation-matcher.ts` | 95 | ✅ Complete | Working |

#### Generation Layer
| Component | File | Lines | Status | Issues |
|-----------|------|-------|--------|--------|
| **RAGChat** | `src/infrastructure/persistence/stores/rag/rag-chat-slice.ts` | 180 | ⚠️ Partial | Type errors |
| **CitationSidebar** | `src/presentation/components/rag/CitationSidebar.tsx` | 220 | ✅ Complete | UI working |
| **ContextBuilder** | `src/lib/rag/context/context-builder.ts` | 140 | ⚠️ WIP | Not integrated |

### 5.3 RAG Data Flow

```
USER UPLOADS PDF
     │
     ├─► SourceImportDialog.handleImport()
     │    └─► GeminiPDFProcessor.extractText(pdfFile)
     │         └─► DocumentChunker.chunkDocument(text, strategy='semantic')
     │              ├─► chunkDocument() returns Chunk[]
     │              └─► EmbeddingService.embedChunks(chunks)
     │                   └─► Web Worker (XenovaTransformers)
     │                        └─► embeddings: FloatArray[]
     │                             └─► OramaIndex.addDocument({
     │                                  id: chunkId,
     │                                  vector: embedding,
     │                                  content: chunk.text,
     │                                  metadata: { sourceId, ... }
     │                               })
     │                                    └─► Dexie.write(OramaIndexRecord)
     │                                         └─► RAGStore.addSource(sourceDoc)
     │
USER ASKS QUESTION
     │
     ├─► RAGChat.handleQuery(query)
     │    └─► HybridRetriever.retrieve(query, { topK: 5 })
     │         ├─► VectorSearch.search(queryEmbedding) → results1
     │         ├─► FulltextSearch.search(query) → results2
     │         └─► mergeAndRank(results1, results2) → topChunks
     │              └─► ContextBuilder.buildContext(topChunks)
     │                   └─► LLM Chat Completion with context
     │                        └─► Response with citations
     │                             └─► CitationSidebar.showCitations(citations)
```

### 5.4 RAG Type Errors (Priority P0)

```typescript
// ❌ ERROR: rag-chat-slice.ts (Line 35)
// Property 'id' does not exist on type 'ChatMessage'

// ✅ FIX: Update ChatMessage interface
// src/lib/rag/types/rag-types.ts
export interface ChatMessage {
  id: string; // Add this
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  timestamp: number;
}

// ❌ ERROR: rag-chat-slice.ts (Line 49)
// Type 'any[]' is not assignable to parameter of type 'Citation'

// ✅ FIX: Add citation type validation
export interface Citation {
  id: string;
  sourceId: string;
  passage: string;
  score: number;
}

const citations: Citation[] = rawCitations.map((cite: any) => ({
  id: cite.id || generateId(),
  sourceId: cite.sourceId,
  passage: cite.passage,
  score: cite.score || 0,
}));
```

---

## 6. UI Component Gaps Inventory

### 6.1 Missing P0 Components (Critical)

#### Knowledge Workspace
| Component | Priority | Est. Lines | Story | Status |
|-----------|----------|------------|-------|--------|
| **KnowledgeSearchInterface** | P0 | 350 | 9-1 | ❌ Missing |
| **DocumentPreviewViewer** | P0 | 280 | 9-2 | ❌ Missing |
| **EmbeddingVisualization** | P1 | 220 | 9-3 | ❌ Missing |
| **SourceManagementPanel** | P1 | 180 | 9-4 | ⚠️ Partial (SourceImportDialog exists) |
| **ChunkingStrategySelector** | P2 | 120 | 9-5 | ❌ Missing |

#### Study Workspace
| Component | Priority | Est. Lines | Story | Status |
|-----------|----------|------------|-------|--------|
| **AdvancedQuizEditor** | P0 | 450 | 10-1 | ❌ Missing |
| **ProgressTrackingDashboard** | P0 | 320 | 10-2 | ❌ Missing |
| **SpacedRepetitionScheduler** | P1 | 380 | 10-3 | ❌ Missing (SRS logic exists) |
| **StudySessionAnalytics** | P1 | 250 | 10-4 | ❌ Missing |
| **FlashcardReviewUI** | P1 | 280 | 10-5 | ⚠️ Partial (QuizContainer exists) |

#### Notes Workspace
| Component | Priority | Est. Lines | Story | Status |
|-----------|----------|------------|-------|--------|
| **AdvancedNoteEditor** | P0 | 500 | 11-1 | ⚠️ Partial (NoteEditor exists, needs blocks) |
| **NoteLinkingGraph** | P1 | 350 | 11-2 | ❌ Missing |
| **NoteSearchFilter** | P1 | 180 | 11-3 | ⚠️ Partial (NoteTree exists) |
| **NoteTemplateManager** | P2 | 150 | 11-4 | ❌ Missing |
| **NoteVersionHistory** | P2 | 200 | 11-5 | ❌ Missing |

#### IDE Workspace
| Component | Priority | Est. Lines | Story | Status |
|-----------|----------|------------|-------|--------|
| **ProcessPanel** (sync queue UI) | P0 | 250 | 8-5 | ⚠️ Partial (SyncStatusPanel exists) |
| **TerminalCWDManager** | P0 | 120 | 8-6 | ✅ Complete (story-13-1 fix) |
| **FileSearchAdvanced** | P1 | 180 | 8-7 | ❌ Missing (basic search exists) |
| **BreakpointManager** | P2 | 150 | 8-8 | ❌ Missing |
| **ProfilerPanel** | P2 | 200 | 8-9 | ❌ Missing |

### 6.2 TODO Comments Analysis

**Found 16 TODO comments in presentation layer:**

```typescript
// Agent Configuration
AgentConfigDialog.tsx:453
  // TODO: Add advanced settings UI here

CustomModelIdInput.tsx:59
  // TODO: Implement model loading from custom endpoint

// Chat UI
AgentSelector.tsx:110
  // TODO: Add config dialog integration in future iteration

TimeoutWarning.tsx:181
  // TODO: Implement actual dialog with options

// Workspace
WorkspaceSwitcher.tsx:119
  // TODO: Eventually migrate ProjectContext to use WorkspaceTransitionManager

// Sync
SyncStatusPanel.tsx:91
  // TODO: Subscribe to sync queue events

SyncStatusPanel.tsx:128
  // TODO: Emit retry event to sync manager

// RAG
IndexingProgressPanel.tsx:117
  // TODO: Subscribe to RAG indexing events

IndexingProgressPanel.tsx:161
  // TODO: Emit cancel event to RAG indexing service

IndexingProgressPanel.tsx:169
  // TODO: Emit retry event to RAG indexing service

// Study
QuizContainer.tsx:31
  // TODO: Load quiz from store if not provided

// UI Components
resizable.tsx:175
  collapse: (_id) => { /* TODO: implement collapse */ },

resizable.tsx:176
  expand: (_id) => { /* TODO: implement expand */ }
```

**Priority Mapping:**
- **P0 (3):** Sync status panel events, RAG indexing events
- **P1 (8):** Advanced settings, model loading, config dialogs, workspace context migration
- **P2 (5):** UI polish (collapse/expand), retry handlers

---

## 7. Workspace Routing Architecture

### 7.1 Route Structure (TanStack Router)

```
src/routes/
├── __root.tsx (root layout + outlet)
├── index.tsx (redirects to /hub)
├── ide.tsx (IDE workspace)
├── knowledge.lazy.tsx (Knowledge workspace)
├── notes.lazy.tsx (Notes workspace)
├── study.lazy.tsx (Study workspace)
├── dashboard/
│   └── pitch-deck.tsx (onboarding)
├── workspace/
│   ├── $workspaceId.tsx (workspace loader)
│   └── switch.tsx (workspace switch route)
└── api/
    ├── chat.ts (chat completion endpoint)
    ├── quizzes/
    │   └── $quizId.ts
    └── flashcards/
        └── $flashcardId.ts
```

### 7.2 Workspace Route Imports

#### IDE Workspace (`ide.tsx`)
```typescript
// Current imports (mixed old/new paths)
import { IDELayoutMain } from '@/presentation/components/layout/IDELayoutMain';
import { AgentChatPanel } from '@/presentation/components/ide/AgentChatPanel';
import { ExplorerPanel } from '@/presentation/components/ide/ExplorerPanel';
import { XTerminal } from '@/presentation/components/ide/XTerminal';

// ❌ DEPRECATED STORE IMPORTS
import { useAgentsStore } from '@/stores/agents-store';
import { useIDEStore } from '@/lib/state/ide-store';

// ✅ CORRECT (Story 13-1)
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
```

#### Knowledge Workspace (`knowledge.lazy.tsx`)
```typescript
import { KnowledgePage } from '@/presentation/components/knowledge/KnowledgePage';
import { SourceImportDialog } from '@/presentation/components/knowledge/SourceImportDialog';
import { IndexingProgressPanel } from '@/presentation/components/knowledge/IndexingProgressPanel';

// ❌ DEPRECATED
import { useRAGStore } from '@/lib/state/rag-store';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';

// ✅ CORRECT
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
import { useKnowledgeStore } from '@/infrastructure/persistence/stores/knowledge-store';
```

#### Study Workspace (`study.lazy.tsx`)
```typescript
import { StudyPage } from '@/presentation/components/study/StudyPage';
import { QuizContainer } from '@/presentation/components/study/QuizContainer';

// ❌ DEPRECATED
import { useQuizStore } from '@/lib/state/quiz-store';
import { useFlashcardStore } from '@/lib/state/flashcard-store';

// ✅ CORRECT
import { useQuizStore } from '@/infrastructure/persistence/stores/quiz/quiz-store';
import { useFlashcardStore } from '@/infrastructure/persistence/stores/flashcard-store';
```

#### Notes Workspace (`notes.lazy.tsx`)
```typescript
import { NoteEditor } from '@/presentation/components/notes/NoteEditor';
import { NoteTree } from '@/presentation/components/notes/NoteTree';

// ❌ NO STORE (missing persistence)
// ✅ NEEDED: useNotesStore
```

### 7.3 Workspace Switching Flow

```
USER CLICKS WORKSPACE SWITCHER
     │
     ├─► WorkspaceSwitcher.open()
     │    └─► <WorkspaceSwitcherDialog />
     │         └─► User selects "Knowledge" workspace
     │              └─► navigate({ to: '/knowledge', params: { workspaceId } })
     │                   └─► TanStack Router lazy loads knowledge.lazy.tsx
     │                        └─► crossWorkspaceEventBus.emit('workspace:changed', {
     │                              workspaceId,
     │                              previousWorkspaceId: 'ide',
     │                              timestamp: Date.now()
     │                            })
     │                             └─► useAppStore.subscribe((state) => {
     │                                  if (state.workspaceId !== workspaceId) {
     │                                    // Trigger store migrations
     │                                    RAGStore.loadIndexForWorkspace(workspaceId);
     │                                    AgentStore.filterByWorkspace(workspaceId);
     │                                  }
     │                                })
```

---

## 8. Migration Roadmap

### 8.1 Immediate Actions (Week 1)

#### Day 1-2: Fix Critical Type Errors
- [ ] Fix `src/infrastructure/persistence/stores/index.ts` (45 errors)
  - Export missing state types
  - Fix import paths (rag-store → rag/rag-store)
- [ ] Fix `src/infrastructure/persistence/stores/rag/rag-store.ts` (38 errors)
  - Add `ragState` table to `ViaGentDatabase`
  - Fix property access errors
- [ ] Fix `src/lib/agent/agent-io.ts` type mismatches (15 errors)

**Estimated Time:** 8 hours

#### Day 3-4: Break Store Circular Dependencies
- [ ] Epic AC-1 Story 1: Extract agent slice from agents-store.ts
  - Migrate to `use-app-store.ts` (already created in Story 13-1)
  - Update 100+ import statements
  - Test hot-reload functionality
- [ ] Update import paths in top 20 affected files
  - AgentConfigDialog.tsx
  - ProviderConfigDialog.tsx
  - AgentChatPanel.tsx
  - use-agent-chat-with-tools.ts

**Estimated Time:** 12 hours

#### Day 5-7: Migrate Deprecated Store Paths
- [ ] Migrate `@/stores/` → `@/infrastructure/persistence/stores/` (8 files)
- [ ] Migrate `@/lib/state/` → `@/infrastructure/persistence/stores/` (25 files)
- [ ] Update barrel exports (index.ts files)
- [ ] Run type checking and fix remaining errors

**Estimated Time:** 16 hours

### 8.2 Short-Term Goals (Weeks 2-3)

#### Week 2: Complete State Consolidation
- [ ] Epic AC-1 (8 stories, 42 hours)
  - Split agents-store.ts into 4 slices ✅ (DONE in Story 13-1)
  - Migrate provider-store to unified store
  - Implement event-driven orchestration
  - Remove all circular dependencies
- [ ] Delete duplicate stores (17 files)
  - Keep only `src/infrastructure/persistence/stores/`
  - Remove deprecated `src/stores/` and `src/lib/state/` locations

#### Week 3: RAG Pipeline Stabilization
- [ ] Fix rag-store.ts type errors (38 errors)
- [ ] Complete OramaIndex vector search (Story 7-1)
- [ ] Wire up HybridRetriever to UI
- [ ] Implement missing RAG events in event bus

### 8.3 Long-Term Vision (Month 2)

#### Phase 1: Missing UI Components
- [ ] Implement 20+ P0/P1 components
  - Knowledge: 3 components
  - Study: 5 components
  - Notes: 4 components
  - IDE: 2 components

#### Phase 2: Workspace Binding Completion
- [ ] Epic WB (8 stories, 42 hours)
  - Complete workspace filtering for agents
  - Complete workspace filtering for providers
  - Implement workspace-scoped tool permissions
  - Add workspace migration utilities

#### Phase 3: Production Hardening
- [ ] Epic 22 (Production Hardening)
- [ ] Epic 23 (UX/UI Modernization)
- [ ] Epic 13 (Core Stabilization - ongoing)

---

## 9. Risk Assessment

### 9.1 Critical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Store circular dependencies** | HIGH | HIGH | ✅ Epic AC-1 in progress |
| **Type errors blocking builds** | HIGH | MEDIUM | ✅ Cycle 12 reduced by 6.5% |
| **Duplicate stores causing state drift** | HIGH | HIGH | ⚠️ Epic AC-1 + Epic WB needed |
| **Missing P0 UI components** | MEDIUM | MEDIUM | ⚠️ Epic 9, 10, 11 needed |
| **RAG pipeline incomplete** | MEDIUM | LOW | ⚠️ Story 7-1 WIP |

### 9.2 Technical Debt Hotspots

1. **State Architecture Crisis (P0)**
   - 71 store files, 30% duplication
   - 4 circular dependencies
   - 1,253 TypeScript errors

2. **RAG Pipeline (P1)**
   - God store (1,595 lines)
   - 38 type errors in rag-store.ts
   - Missing vector search UI

3. **Missing Components (P1)**
   - 20+ P0/P1 components across 4 workspaces
   - 16 TODO comments in critical paths

### 9.3 Success Criteria

#### Phase 1 Complete (Week 1)
- [ ] TypeScript errors < 500 (60% reduction)
- [ ] All circular dependencies resolved
- [ ] Store consolidation started (use-app-store.ts adopted)

#### Phase 2 Complete (Weeks 2-3)
- [ ] Duplicate stores deleted (move to infrastructure/persistence/stores/)
- [ ] Epic AC-1 complete (agent configuration unified)
- [ ] Epic WB complete (workspace binding functional)

#### Phase 3 Complete (Month 2)
- [ ] TypeScript errors < 100 (92% reduction)
- [ ] All P0 UI components implemented
- [ ] RAG pipeline production-ready
- [ ] State architecture compliant with sweeping-validation.md

---

## 10. Appendices

### Appendix A: File Count Breakdown

```
Total TypeScript Files: 899
├── Presentation Components: 304
│   ├── IDE: 80
│   ├── Knowledge: 15
│   ├── Study: 12
│   ├── Notes: 10
│   ├── Agent Config: 20
│   ├── Chat: 15
│   ├── Layout: 10
│   └── UI Primitives: 142
├── State Stores: 71
│   ├── src/stores/: 8 (DEPRECATED)
│   ├── src/lib/state/: 25 (DEPRECATED)
│   └── src/infrastructure/persistence/stores/: 38 (TARGET)
├── Agent System: 145
│   ├── Tools: 25
│   ├── Hooks: 20
│   ├── Providers: 15
│   └── Facades: 10
├── RAG Pipeline: 65
│   ├── Chunking: 12
│   ├── Embedding: 8
│   ├── Search: 15
│   └── Storage: 30
└── Infrastructure: 314
    ├── File System: 85
    ├── WebContainer: 45
    ├── Events: 25
    └── Other: 159
```

### Appendix B: God Component Violations

**Definition:** Files >300 lines (sweeping-validation.md standard)

| File | Lines | Violation Factor | Issue |
|------|-------|------------------|-------|
| rag-store.ts | 1,595 | 13.3x | Duplicated in 2 locations |
| conversation-threads-store.ts | 726 | 6.0x | Thread hierarchy + messages |
| agents-store.ts | 430 | 3.6x | Circular deps (FIXED in Story 13-1) |
| ide-store.ts | 380 | 3.2x | IDE state + editor + layout |
| conversation-store.ts | 340 | 2.8x | Messages + metadata |
| use-app-store.ts | 320 | 2.7x | Unified store (acceptable) |

**Total God Components:** 16 files identified across codebase

### Appendix C: Import Path Migration Checklist

**Phase 1: Critical Path (100+ files affected)**
- [ ] Update `@/stores/` imports → `@/infrastructure/persistence/stores/`
- [ ] Update `@/lib/state/` imports → `@/infrastructure/persistence/stores/`
- [ ] Remove deprecated barrel exports
- [ ] Add new barrel exports to `src/infrastructure/persistence/stores/index.ts`

**Phase 2: Test Updates**
- [ ] Fix mock imports in test files
- [ ] Update test utilities for new paths
- [ ] Fix circular dependency mocks

**Phase 3: Documentation**
- [ ] Update AGENTS.md with new import patterns
- [ ] Update CLAUDE.md with store architecture
- [ ] Create migration guide for contributors

---

## Conclusion

This architectural map reveals a codebase in active transition:

**Strengths:**
- ✅ Solid agent system foundation (145 files, well-structured)
- ✅ Event-driven architecture partially implemented (Cycle 12)
- ✅ Tool permissions system production-ready (83% health)
- ✅ Store consolidation started (Story 13-1)

**Critical Issues:**
- ❌ State architecture in crisis (30% duplication, 4 circular deps)
- ❌ 1,253 TypeScript errors blocking development
- ❌ God stores violating size standards (6 files >300 lines)
- ❌ Missing 20+ P0/P1 UI components

**Immediate Priorities:**
1. Fix 45 critical type errors in store index files
2. Complete Epic AC-1 (agent configuration consolidation)
3. Migrate 100+ import paths from deprecated stores
4. Implement missing P0 UI components

**Next Steps:**
- Use this map to guide Ralph Loop iterations
- Prioritize P0/P1 stories based on error hotspots
- Track progress against success criteria in Section 9.3

---

**Document Control**
- **Version:** 1.0.0
- **Generated:** 2026-01-01
- **Author:** BMAD Master Architect Mode
- **Status:** Ready for execution
- **Next Review:** After Epic AC-1 completion (Week 2)
