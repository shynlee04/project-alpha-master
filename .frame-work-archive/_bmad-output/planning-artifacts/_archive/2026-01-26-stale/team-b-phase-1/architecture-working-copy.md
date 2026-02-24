# Via-Gent Architecture Document

**Version:** 2.0.0 (Corrected)  
**Date:** 2026-01-11  
**Status:** WORKING COPY - Team B Phase 1 Updates  
**Last Updated:** [UPDATED: 2026-01-16 - Team B Phase 1]  
**Original Date:** 2026-01-11

## Authoritative Sources

This document is a **working copy** for Team B Phase 1 updates. The following ADRs govern all architectural decisions:

| ADR | Title | Status | Key Decisions |
|-----|-------|--------|---------------|
| **ADR-033** | Correct-Course Architectural Remediation | APPROVED | Platform detection (D1), FSA persistence (D2), Notes storage (D3), Project structure (D4-D9) |
| **ADR-034** | Workspace Access Infection Remediation | APPROVED | 31 infection points, FSA handle unification (D10), State scoping (D11), Route loading (D12), Platform guards (D13) |
| **ADR-035** | Architecture Standardization v2 | APPROVED | Entity model, storage boundaries, P0 bugs (3), Chrome 129+ detection |

**Reference:** `ADR-033-correct-course-architectural-remediation-2026-01-16.md`  
**Reference:** `ADR-034-workspace-access-infection-remediation-2026-01-11.md`  
**Reference:** `ADR-035-correct-course-v2-architecture-standardization-2026-01-14.md`

**Related Documents:**
- Epics: `_bmad-output/planning-artifacts/epics.md`
- Research: `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`
- Audit: `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md`
- Phase 1 Audit: `_bmad-output/planning-artifacts/team-b-phase-1/phase-1-audit-report.md`

---

## ⚡ Quick Reference [UPDATED: 2026-01-16]

### Architecture Metrics (Corrected)

| Component | Status | Notes |
|-----------|--------|-------|
| **Architecture Health** | 6/10 | 48 issues identified |
| **Clean Architecture Compliance** | ~50% | Not 75% (corrected) |
| **God Components** | 8 | Not 19 (corrected) |
| **God Stores** | 8 | Requires decomposition (ADR-034 lists 12 STATE infections) |
| **Layer Violations** | 130+ | Must be fixed |
| **RAG Implementation** | OramaDB | Local-first, privacy-focused |
| **Agent Auto-Switching** | EXISTS | Infrastructure built, not enabled |

### ADR-033 Key Decisions Summary

| Decision | Choice | ADR Section |
|----------|--------|-------------|
| **Storage Type Selection** | Auto-detect, no user choice | D1 |
| **Desktop Storage** | FSA (File System Access API) | D1 |
| **Mobile/Tablet Storage** | IndexedDB (Dexie) | D1 |
| **IDE Access** | Desktop only | D1 |
| **Handle Storage** | Store `FileSystemDirectoryHandle` in IndexedDB | D2 |
| **Permission Persistence** | Chrome 122+ "Allow on every visit" | D2 |
| **File Watching** | FileSystemObserver (129+), polling fallback | D2 |
| **Fast Load Strategy** | Snapshot in Dexie, diff in background | D2 |
| **Notes Location** | FSA folder (`/project/notes/*.md`) | D3 |
| **Composite Keys** | Keep `[projectId+workspaceId]` | D6 |

### Platform Contract Status

| Capability | Desktop | Mobile | Tablet |
|------------|---------|--------|--------|
| **storageType** | 'fsa' | 'indexeddb' | 'indexeddb' |
| **canAccessFSA** | ✅ true | ❌ false | ❌ false |
| **canAccessIDE** | ✅ true | ❌ false | ❌ false |
| **canWatchFiles** | Chrome 129+ | ❌ false | ❌ false |
| **canRunTerminal** | ✅ true | ❌ false | ❌ false |

### Infection Registry Summary (ADR-034)

| Domain | Infections | Severity |
|--------|------------|----------|
| **FSA Handle Persistence** | 10 | P0-P2 |
| **State Management** | 12 | P0-P2 |
| **Routing** | 13 | P0-P2 |
| **Platform Contract** | 6 | P0-P2 |
| **Total** | **31** | Multiple P0 |

---

## Section 1: Executive Summary

Via-Gent is a browser-based, mobile-first AI development workspace. The platform operates at approximately **30-40% feature completeness** with local-first architecture using WebContainers and IndexedDB. [UPDATED: 2026-01-16]

**⚠️ CRITICAL:** ADR-035 identifies **3 P0 bugs** that block ALL user journeys:
1. Chrome version check uses exact match instead of `>= 129`
2. Hydration regex capture group returns wrong group
3. FSA handle storage stores mock instead of actual handle

### Architecture Reality (Corrected from Previous Claims)

| Metric | Previous Claim | Actual | Source |
|--------|---------------|--------|--------|
| Feature Completeness | 70% | 30-40% | Deep analysis 2026-01-15 |
| Clean Architecture Compliance | 75% | ~50% | Audit 2026-01-11 |
| God Components | 19 | 8 | Audit correction |
| God Stores | 9 | 8 (12 STATE infections per ADR-034) | Audit confirmed |
| Layer Violations | 32 | 130+ | Audit found more |
| Error Boundary Coverage | ~50% | 22.2% | Deep analysis |
| Chrome Version Detection | Works | Bug: exact match only | ADR-035 Bug 1 |

### ADR-035 P0 Bugs (Must Fix Immediately)

| Bug ID | File | Issue | Status |
|--------|------|-------|--------|
| BUG-001 | `handle-persistence.ts` | Chrome version check `=== 129` vs `>= 129` | INFECTED |
| BUG-002 | `hydration-manager.ts` | Regex `match[1]` vs `match[2]` | INFECTED |
| BUG-003 | `project-crud-slice.ts` | Mock handle vs actual handle | INFECTED |

### AI Invocation Patterns

The codebase exhibits **three AI invocation patterns** (NOT unified):

| Pattern | Location | Status |
|---------|----------|--------|
| Full Agent System | ChatPanel → /api/chat | ✅ Proper implementation |
| Notes AI Service | note-ai-service.ts | ⚠️ Static selection, no reactivity |
| Hardcoded Provider | VoiceRecordButton.tsx | ❌ Hardcoded 'gemini' |

**Remediation:** See ADR-026 for unified AgentExecutionService proposal.

---

## Section 2: System Overview

### 2.1 Architecture Layers

Via-Gent implements a **five-layer Clean Architecture** with unidirectional dependency flow.

#### Layer Distribution (Actual State)

| Layer | Location | Files | Compliance | Status |
|-------|----------|-------|------------|--------|
| **Core** | `src/core/entities/` | 4 | ~25% | UNDERPOPULATED |
| **Domain** | `src/domain/services/` | 7 | ~50% | PARTIAL |
| **Infrastructure** | `src/infrastructure/` | 250+ | ~60% | OVERGROWN + VIOLATING |
| **Lib** | `src/lib/` | 220+ | N/A | CONFUSION ZONE |
| **Presentation** | `src/presentation/` | 474 | ~70% | DOMINANT |

#### Known Layer Violations (Must Fix)

```
❌ INFRASTRUCTURE → DOMAIN (wrong direction):
   src/infrastructure/persistence/stores/index.ts:190-195
   exports domain services from infrastructure

❌ DOMAIN → INFRASTRUCTURE (leaky abstraction):
   src/domain/services/universal-adapter-factory.ts:313
   imports credential-vault directly

❌ CIRCULAR DEPENDENCIES:
   src/domain/services/agent-orchestration-service.ts:11
   src/domain/services/workspace-transition-service.ts:11
```

### 2.2 Cross-Layer Communication

**Allowed Flow:**
```
Presentation → Infrastructure → Domain → Core
                      ↑
              (interfaces only)
```

**Communication Mechanisms:**
- **Event Bus:** `src/infrastructure/events/event-bus.ts` for reactive updates
- **Zustand Stores:** State synchronization via `src/infrastructure/persistence/stores/`
- **Facades:** Abstraction over agent tools in `src/lib/agent/facades/`

### 2.3 Platform Contract Interface [NEW - ADR-033 D1]

**Location:** `src/infrastructure/platform/platform-detection.ts`

```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}
```

**Implementation:** `getPlatformContract()` function (Story ARC-A01)

**Usage Pattern:**
```typescript
const platform = getPlatformContract();
// Use platform.storageType to determine storage strategy
// Use platform.canAccessIDE to guard IDE routes
```

### 2.4 Storage Gateway Abstraction [NEW - ADR-033 D2, D3, ADR-035]

**Location:** `src/infrastructure/filesystem/`

```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
}

// Factory pattern
const gateway = StorageGatewayFactory.create({
  storageType: platform.storageType,
  projectId: projectId,
  handle: handle  // FSA only
});
```

**Implementations:**
| Gateway | Storage Type | Location |
|---------|--------------|----------|
| **FSAGateway** | 'fsa' | `src/infrastructure/filesystem/fsa-storage-adapter.ts` |
| **IDBGateway** | 'indexeddb' | `src/infrastructure/filesystem/idb-storage-adapter.ts` |

### 2.5 Route Loading Patterns [NEW - ADR-034 D12]

**Pattern:** Use `loader` for data fetch, `beforeLoad` for platform guards only

```typescript
// route.ts
export const route = createRoute({
  getParentRoute: () => rootRoute,
  path: '$projectId',
  component: IDEWorkspace,
  beforeLoad: ({ params }) => {
    // Platform guard ONLY - redirect if needed
    const platform = getPlatformContract();
    if (!platform.canAccessIDE) {
      throw redirect({ to: '/hub', replace: true });
    }
  },
  loader: ({ params }) => {
    // Data fetch - project, FSA handle, state
    return fetchProjectAndHydrate(params.projectId);
  },
});
```

**Key Rules:**
- NO `beforeLoad` for data fetching (use `loader`)
- NO `useEffect` for data fetching (use route `loader`)
- Platform guards in `beforeLoad` for all workspace routes

### 2.6 Chrome 129+ Feature Detection [NEW - ADR-035 Bug 1 Fix]

```typescript
export function isStructuredCloneSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('structuredClone' in window)) return false;

  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = match ? parseInt(match[1], 10) : 0;
  return chromeVersion >= 129;  // ✅ >= 129, not exact match
}

export function canStoreHandleInIndexedDB(): Promise<boolean> {
  // Feature detection for FileSystemDirectoryHandle storage
  // Returns true for Chrome 129+
}
```

---

## Section 3: RAG Implementation

### 3.1 Current State

**Technology Stack:**
- **Vector Database:** OramaDB (browser-based, local-first)
- **Embeddings:** Xenova/all-MiniLM-L6-v2 (384-dimension)
- **Search Type:** Hybrid (vector 0.7 + BM25 0.3)
- **Fallback:** Gemini API for embedding generation

**Implementation Location:**
- `src/lib/rag/` - 30+ files (RAG logic)
- `src/infrastructure/persistence/stores/rag/` - Store layer
- `src/presentation/components/rag/` - UI components

### 3.2 RAG Architecture (OramaDB-based)

```
User Query
    ↓
Hybrid Retriever (vector + BM25)
    ↓
├─→ OramaDB Vector Search (local in-memory)
└─→ BM25 Full-text Search
    ↓
Reranking (if implemented)
    ↓
Context + Query → LLM
    ↓
Response with Citations
```

### 3.3 RAG Options Analysis

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Keep OramaDB (current)** | Local, privacy-first, offline | Browser memory limited | ✅ Recommended |
| **Gemini File Search API** | Fully managed, simple | Google dependency | Consider for simplification |
| **Qdrant** | Advanced features | Additional infrastructure | Future consideration |

**Verdict:** Keep OramaDB for now. It's solid for browser-based local-first architecture.

### 3.4 RAG N+1 Query Pattern Fix [UPDATED - ADR-034]

**Problem:** `knowledge-source-crud-slice.ts:56-62` uses loop for individual queries

**Solution:** Replace loop with bulk operations

```typescript
// BEFORE (N+1 pattern - BROKEN)
for (const source of sources) {
  await ragStore.addSource(source);  // Each call = separate query
}

// AFTER (bulk operation - FIXED)
await ragStore.addSourcesBulk(sources);  // Single batch operation
```

**Reference:** ADR-034 STATE-001 through STATE-012

### 3.5 RAG Issues (from Audit) [UPDATED: 2026-01-16]

| Issue | Location | Severity | ADR Reference | Status |
|-------|----------|----------|---------------|--------|
| **N+1 Query Pattern** | knowledge-source-crud-slice.ts:56-62 | HIGH | ADR-034 | INFECTED |
| **God Store** | useRAGStore.ts (327 lines) | HIGH | ADR-034 STATE-008 | INFECTED |
| **Missing Error Boundary** | /knowledge route | HIGH | ADR-028 | PARTIAL |
| **Type Scattering** | 5+ locations | MEDIUM | ADR-029 | VIOLATION |
| **Global indexMetadata** | rag-store.ts:56-60 | P1 | ADR-034 STATE-008 | INFECTED |
| **No project scope** | RAG store | P1 | ADR-034 D11 | INFECTED |

### 3.6 RAG God Store Decomposition [NEW - ADR-034]

Target structure for RAG store decomposition:

```
src/infrastructure/persistence/stores/rag/
├── slices/
│   ├── index-slice.ts (≤120 lines)
│   ├── query-slice.ts (≤120 lines)
│   └── sync-slice.ts (≤120 lines)
├── rag-store.ts (≤300 lines)
├── rag-store.test.ts
└── index.ts (barrel export)
```

**Composite Key Pattern:** `[projectId+workspaceId]` for RAG indices (ADR-033 D6)

---

### 3.5 RAG Remediation

**Quick Wins:**
1. Fix N+1 query pattern (2 hours)
2. Add /knowledge error boundary (1 hour)
3. Add query cache (4 hours)

**Core Improvements:**
1. Decompose useRAGStore (1 day)
2. Add metadata filtering (4 hours)
3. Implement reranker (1 day)

**Reference:** See `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`

---

## Section 4: Agent Mode Auto-Switching

### 4.1 Current State

**Infrastructure EXISTS but NOT ENABLED:**

| Component | Location | Status |
|-----------|----------|--------|
| ModeClassifier | mode-classifier.ts | ✅ Implemented |
| Scoring System | lines 393-448 | ✅ Working |
| Confidence Thresholds | Configurable | ✅ Ready |
| Context Sources | prompt, workspace, files, history | ✅ Available |

**What's Missing:**
- ❌ Mode persistence in conversation history
- ❌ Auto-switching enabled (manual override takes precedence)
- ❌ UI confidence indicator

### 4.2 Two-Layer System Instruction Prompts [NEW]

**Architecture:** ADR-033 defines two-layer prompting for agent isolation

```typescript
interface SystemInstructionLayers {
  // Layer 1: Universal (applies to all agents)
  universal: `
    You are an AI assistant in Via-Gent workspace.
    Current workspace: ${workspaceId}
    Project: ${projectId}
    Platform: ${platform.storageType}
    Capabilities: ${JSON.stringify(platformCapabilities)}
  `;

  // Layer 2: Mode-Specific (applies based on workspace)
  modeSpecific: {
    ide: `
      You have access to file system and terminal.
      - Read files via file gateway
      - Write files via file gateway
      - Execute terminal commands
      - Current project: ${projectId}
    `,
    notes: `
      You are helping with document editing.
      - Read/write markdown notes
      - Use BlockNote format
      - Sync to ${platform.storageType === 'fsa' ? 'FSA' : 'IndexedDB'}
    `,
    knowledge: `
      You are helping with research.
      - Search RAG index: ${projectId}
      - Add sources to knowledge base
      - Synthesize information
    `,
    study: `
      You are helping with learning.
      - Access flashcards
      - Generate quizzes
      - Track progress
    `;
  };
}
```

### 4.3 Tool Permissions Model [NEW]

**Pattern:** Capabilities defined per workspace, enforced by PlatformContract

```typescript
interface AgentCapabilities {
  // Always available
  canSearchRAG: true;
  canReadChatHistory: true;
  canWriteNotes: true;
  canEmbedContent: true;

  // Platform-dependent
  canWriteRealFiles: boolean;  // FSA only
  canRunTerminal: boolean;     // Desktop only
  canWatchFileChanges: boolean; // Chrome 129+ FSA
  canAccessExternalTools: boolean;

  // Derived
  canDoAgenticCoding: boolean;  // canWriteRealFiles && canRunTerminal
  storageType: 'fsa' | 'indexeddb';
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

// Enforcement: ModeClassifier filters tools based on capabilities
const availableTools = filterToolsByCapabilities(allTools, capabilities);
```

### 4.4 Auto-Switching Architecture

```
User Input → ModeClassifier → Agent Router → Best Agent
                  ↓
           Confidence Score
                  ↓
           ├─ > 0.8 → Auto-switch
           ├─ 0.5-0.8 → Suggest with UI
           └─ < 0.5 → Manual selection
```

### 4.5 Required Changes to Enable

1. **Remove manual override** of auto-classification
2. **Add mode field** to ChatMessage interface
3. **Persist mode** in conversation store
4. **Add UI indicator** showing current mode + confidence

### 4.6 Agent Registry

```typescript
const AGENT_REGISTRY = {
  chat: {
    capabilities: ['conversation', 'qa', 'general'],
    triggers: ['general chat', 'questions']
  },
  ide: {
    capabilities: ['code', 'terminal', 'fileops'],
    triggers: ['code', 'debug', 'terminal']
  },
  notes: {
    capabilities: ['write', 'edit', 'format'],
    triggers: ['document', 'write', 'edit']
  },
  knowledge: {
    capabilities: ['search', 'rag', 'synthesize'],
    triggers: ['research', 'find', 'learn']
  }
};
```

### 4.5 Handoff Pattern (Future Enhancement)

After auto-switching is enabled, consider implementing handoff pattern:

```
Agent A (current) → Handoff → Agent B (new)
    ↓
Transfer context:
├─ Conversation history
├─ Current task state
├─ User preferences
└─ Workspace context
```

**Reference:** See `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`

---

## Section 5: State Management

### 5.0 State Boundaries [NEW - ADR-035 Part 1]

**Key Principle:** Zustand for ephemeral UI state, Dexie for persistent data

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STATE LAYER BOUNDARIES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER 1: DEXIE (IndexedDB) - Persistent Database                           │
│  ═════════════════════════════════════════════════                          │
│  ┌────────────────────┬────────────────────┬────────────────────┐           │
│  │ Table              │ Purpose            │ Owner              │           │
│  ├────────────────────┼────────────────────┼────────────────────┤           │
│  │ db.projects        │ Project metadata   │ Domain Layer       │           │
│  │ db.notes           │ Note content       │ Domain Layer       │           │
│  │ db.conversations   │ Chat history       │ Domain Layer       │           │
│  │ db.fsaHandles      │ FSA handle storage │ Infrastructure     │           │
│  │ db.ideState        │ IDE layout/tabs    │ State Layer        │           │
│  │ db.fileSnapshots   │ File tree cache    │ Infrastructure     │           │
│  │ db.fileContentCache│ File content cache │ Infrastructure     │           │
│  │ db.providerConfigs │ Zustand persist    │ State Layer        │           │
│  │ db.terminalState   │ Terminal persist   │ State Layer        │           │
│  │ db.workspaceState  │ Workspace persist  │ State Layer        │           │
│  └────────────────────┴────────────────────┴────────────────────┘           │
│                                                                              │
│  LAYER 2: ZUSTAND - Reactive UI State                                       │
│  ════════════════════════════════════════                                    │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ Pattern: Zustand store + persist middleware + Dexie storage    │         │
│  │                                                                 │         │
│  │ persist({                                                       │         │
│  │   name: `store-name-${projectId}`,  // SCOPED by projectId     │         │
│  │   storage: createJSONStorage(() => createDexieStorage('table'))│         │
│  │ })                                                              │         │
│  │                                                                 │         │
│  │ ⚠️ ALL Zustand stores MUST use Dexie (not localStorage)        │         │
│  │ ⚠️ ALL persist keys MUST include projectId for scoping         │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  LAYER 3: LOCALSTORAGE - DEPRECATED (DO NOT USE)                            │
│  ═══════════════════════════════════════════════                            │
│  ❌ localStorage is NOT scoped by projectId                                  │
│  ❌ localStorage has 5MB limit                                               │
│  ❌ localStorage causes cross-tab conflicts                                  │
│                                                                              │
│  EXCEPTION: Last workspace preference per project                           │
│  Key: `project_{projectId}_last_workspace`                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.0.1 Composite Key Pattern [NEW - ADR-033 D6, ADR-035]

**Pattern:** `[projectId+workspaceId]` for all workspace-scoped state

```typescript
// Composite key for workspace-isolated state
interface CompositeKey {
  projectId: string;   // e.g., "proj_a1b2c3d4"
  workspaceId: string; // e.g., "ide", "notes", "study", "knowledge"
}

// Usage in Zustand stores
const store = createStore()(
  persist(
    (set, get) => ({
      // State for this specific project + workspace
      fileTree: null,
      selectedFile: null,

      // Actions
      setFileTree: (tree) => set({ fileTree: tree }),

      // Cleanup on workspace switch
      reset: () => set({ fileTree: null, selectedFile: null }),
    }),
    {
      name: `ide-store-${projectId}-${workspaceId}`,  // ✅ Composite key
      storage: createJSONStorage(() => createDexieStorage('ideState')),
    }
  )
);
```

**Rationale:** Same project = different data per workspace (ADR-033 D6)

### 5.0.2 State Scoping Rules [NEW - ADR-034 D11]

| State Type | Storage | Scope Key | Example |
|------------|---------|-----------|---------|
| Project metadata | Dexie | `projectId` | `db.projects` |
| FSA Handles | Dexie | `projectId` | `db.fsaHandles` |
| IDE State | Dexie + Zustand | `[projectId+workspaceId]` | `ideState-proj_abc-ide` |
| Chat history | Dexie | `projectId` | `db.conversations` |
| RAG Index | Dexie + Orama | `[projectId+workspaceId]` | Per-knowledge workspace |
| Theme/Locale | Dexie | `global` | `db.settings` |
| Last workspace | localStorage (exception) | `project_{projectId}` | User preference only |

### 5.1 God Stores (Requiring Decomposition) [UPDATED: 2026-01-16]

| Store | Lines | Issue | ADR Reference | Action |
|-------|-------|-------|---------------|--------|
| useWorkspaceFileSystem.ts | 571 | File system + sync + metadata | STATE-012 | Decompose |
| migration-backup.ts | 549 | Migration logic in store | - | Move to infra |
| conversation-migration.ts | 549 | Migration logic in store | - | Move to infra |
| useConversationStore.ts | 497 | Multiple responsibilities | STATE-006, STATE-007 | Decompose |
| unified-chat-store.ts | 448 | Chat state | STATE-006, STATE-007 | Decompose |
| provider-store.ts | 387 | Provider management | - | Decompose |
| workspace-store.ts | 347 | Workspace state + localStorage leak | STATE-003, STATE-004 | Decompose |
| useRAGStore.ts | 327 | RAG functionality | STATE-008 | Decompose |
| useIDEStore.ts | TBD | Hydrates "most recent" not "current" | STATE-002 | Fix hydration |
| hydration-manager.ts | TBD | Empty hydrate functions | STATE-010 | Implement properly |

### 5.2 State Flow Diagram [NEW]

**Target Structure:**
```
src/infrastructure/persistence/stores/{domain}/
├── slices/
│   ├── {slice-name}-slice.ts (≤120 lines)
│   └── {slice-name}-slice.test.ts
├── {domain}-store.ts (≤300 lines, combines slices)
├── {domain}-store.test.ts
└── index.ts (barrel export)
```

### 5.3 State Flow Diagram [NEW]

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STATE FLOW SEQUENCE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Action (Presentation Layer)                                            │
│         ↓                                                                    │
│  Zustand Store Action (UI State)                                             │
│         ↓                                                                    │
│  State Validation + Update                                                   │
│         ↓                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    PERSISTENCE LAYER                                 │    │
│  │  ┌─────────────────┐     ┌─────────────────────────────────────┐    │    │
│  │  │ Ephemeral State │     │ Persistent Data                     │    │    │
│  │  │ (in-memory)     │     │ ↓ Persist to Dexie                  │    │    │
│  │  │                 │     │ - db.projects                       │    │    │
│  │  │ - UI toggles    │     │ - db.conversations                  │    │    │
│  │  │ - Loading       │     │ - db.ideState (keyed by composite)  │    │    │
│  │  │ - Temp data     │     │ - db.fsaHandles                     │    │    │
│  │  └─────────────────┘     └─────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         ↓                                                                    │
│  Event Bus Emit (if subscribed)                                              │
│         ↓                                                                    │
│  Reactive Component Update                                                   │
│         ↓                                                                    │
│  UI Reflects State                                                           │
│                                                                              │
│  ON WORKSPACE SWITCH:                                                        │
│  1. Call `onWorkspaceChange()` on all stores                                 │
│  2. Clear composite-keyed state                                              │
│  3. Hydrate new `[projectId+workspaceId]` data                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Section 6: Data Flow

### 6.1 Persistence Layer

**Dexie Tables:**
| Table | description | Access |
|-------|---------|--------|
| conversations | Conversation threads | Frequent |
| messages | Chat messages | Frequent |
| projects | Project metadata | Moderate |
| fileMetadata | File metadata | Frequent |
| toolExecutionLogs | Execution history | Append |
| fsaHandles | Directory handles | Moderate |
| plugins | Plugin configs | Infrequent |
| sessionSnapshots | State restoration | Session |
| workspaceState | Workspace preferences | Moderate |

### 6.2 State Flow Sequence

```
1. User interaction (presentation)
2. Store action call (Zustand)
3. State validation + update
4. Persist to Dexie (IndexedDB)
5. Event bus emit
6. Reactive component update
7. UI reflects state
```

---

## Section 7: Security

### 7.1 Credential Vault

**Location:** `src/lib/agent/providers/credential-vault.ts` (18,167 lines)

**Security Features:**
- AES-256-GCM encryption for API keys
- Encrypted storage in IndexedDB
- Decryption on-demand for provider requests
- No plaintext in state

### 7.2 Known Issues

| Issue | Location | Severity | Status |
|-------|----------|----------|--------|
| Hardcoded provider | VoiceRecordButton.tsx | HIGH | Needs fix |
| Vault unused | Provider implementations | HIGH | Integration needed |
| Permission bypass | note-ai-service.ts | MEDIUM | Migration needed |

---

## Section 8: API Contracts

### 8.1 Routes

| Pattern | File | description |
|---------|------|---------|
| `/ide/:projectId` | IDE workspace | Code execution |
| `/knowledge/:projectId` | Knowledge workspace | RAG/search |
| `/notes/:projectId` | Notes workspace | Document editing |
| `/study/:projectId` | Study workspace | Flashcards/quizzes |
| `/api/chat` | AI conversations | Full agent system |

### 8.2 Provider Adapters

| Provider | Location | Lines |
|----------|----------|-------|
| Anthropic | anthropic-adapter.ts | 7,807 |
| OpenRouter | provider-adapter.ts | 12,956 |
| Model Registry | model-registry.ts | 13,540 |
| Credential Vault | credential-vault.ts | 18,167 |

---

## Section 9: Architecture Decision Records [UPDATED: 2026-01-16]

### ADR Status (Authoritative - ADR-033/034/035)

| ADR | Title | Status | Key Points |
|-----|-------|--------|------------|
| **ADR-033** | Correct-Course Architectural Remediation | APPROVED | Platform detection (D1), FSA persistence (D2), Notes storage (D3), Project structure (D4-D9) |
| **ADR-034** | Workspace Access Infection Remediation | APPROVED | 31 infection points, FSA handle unification (D10), State scoping (D11), Route loading (D12), Platform guards (D13) |
| **ADR-035** | Architecture Standardization v2 | APPROVED | Entity model, storage boundaries, 3 P0 bugs, Chrome 129+ detection |
| ADR-026 | AI Service Unification | SUPERSEDED | Replaced by ADR-033/agent orchestration |
| ADR-027 | State Management Consolidation | SUPERSEDED | Replaced by ADR-034/035 |
| ADR-028 | Error Boundary Coverage | SUPERSEDED | 22.2% coverage, needs remediation |
| ADR-029 | Clean Architecture Layer Compliance | SUPERSEDED | Actual compliance ~50%, not 70% |
| ADR-032 | Agent Chat Self-Switching | EXTENDED | Infrastructure exists, not enabled |

**Note:** All architecture decisions are now governed by ADR-033, ADR-034, and ADR-035.

---

## Section 10: Implementation Roadmap

### Priority Matrix

| Priority | Item | Effort | Dependencies |
|----------|------|--------|--------------|
| **P0** | Fix N+1 queries | 2h | None |
| **P0** | Add /knowledge error boundary | 1h | None |
| **P0** | Break circular dependencies | 1 day | None |
| **P1** | Decompose god stores | 1 week | P0 items |
| **P1** | Enable agent auto-switching | 1 week | ModeClassifier exists |
| **P2** | Implement RAG reranker | 1 day | Metadata filtering |
| **P2** | Consolidate RAG types | 4h | None |

### Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Week 1 | Critical fixes (P0) |
| Phase 2 | Week 2-3 | Store decomposition (P1) |
| Phase 3 | Week 4+ | Advanced features (P2) |

---

## Appendix A: Evidence References

| Claim | Section | Evidence Source |
|-------|---------|-----------------|
| 65% feature completeness | Executive Summary | PRD assessment |
| ~50% architecture compliance | 2.1 | Audit 2026-01-11 |
| 8 god stores | 5.1 | Audit findings |
| OramaDB implementation | 3.1 | src/lib/rag/ |
| ModeClassifier exists | 4.1 | mode-classifier.ts |

**Full Audit:** `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md`

---

## Appendix B: Related Documents

| Document | description |
|----------|---------|
| `epics.md` | Epic and story definitions |
| `RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md` | Detailed research findings |
| `adr-audit-report-2026-01-11.md` | ADR validity assessment |
| `numbering-scheme-standard-2026-01-11.md` | Epic/story numbering |
| `epics-reconciliation-report-2026-01-11.md` | Story status verification |

---

## Appendix C: Verification Checklist [UPDATED: 2026-01-16]

Before marking architecture tasks complete:

```
□ TypeScript clean (pnpm tsc --noEmit)
□ Tests passing (pnpm vitest run)
□ No layer violations
□ No god files >300 lines

[P0 - Critical]
□ Chrome 129 version check fixed (isStructuredCloneSupported >= 129)
□ Hydration regex capture group fixed (match[2] not match[1])
□ FSA handle storage uses actual handle (not mock)
□ PlatformContract.getPlatformContract() implemented
□ Route guards on all workspace routes (beforeLoad pattern)

[State Management]
□ All stores scoped by [projectId+workspaceId] composite key
□ No localStorage usage (except last_workspace preference)
□ IDE hydrates for current projectId (not "most recent")
□ Workspace cleanup on switch implemented

[Storage]
□ StorageGateway abstraction layer implemented
□ FSAGateway with handle persistence
□ IDBGateway implementation
□ HandlePersistenceService stores actual handle in Chrome 129+

[RAG]
□ RAG N+1 queries fixed (bulk operations)
□ useRAGStore decomposed into slices
□ Per-project RAG index (composite key)

[Documentation]
□ ADR-033/034/035 referenced as authoritative
□ PlatformContract interface documented
□ StorageGateway abstraction documented
□ Route loading patterns documented (loader vs beforeLoad)
□ Platform guards distribution documented
□ State scoping [projectId+workspaceId] documented
□ Chrome 129+ feature detection documented
```

---

**Document Version:** 2.1.0 (Working Copy - Team B Phase 1)  
**Original Version:** 2.0.0 (2026-01-11)  
**Last Updated:** 2026-01-16  
**Author:** Architecture Recovery Process + Team B Phase 1  
**Status:** WORKING COPY - For comparison against original

**This is a working copy for Team B Phase 1 updates. See document header for authoritative ADR references.**

**Next Review:** 2026-02-11 (quarterly)

---

*This working copy is part of Team B Phase 1 remediation.*  
*Original document: `architecture.md` (2026-01-11)*
