---
document_id: ARCH-001
title: "Project Alpha Architecture Specification"
version: "4.0.0"
status: "ACTIVE - CANONICAL"
last_updated: "2026-01-30T18:00:00+07:00"
tier: 1
authority: "ADR-039, new-fundamental-truths.md v2.2.0"
supersedes:
  - "architecture.md v3.1.0 (2026-01-26)"
  - "new-fundamental-truths.md (content merged)"
phase_1_integration: true
---

# Project Alpha - Architecture Specification

> **SINGLE SOURCE OF TRUTH**: This document is the authoritative architecture specification. All other architecture documents are either superseded or supplementary.

---

## 1. Executive Summary

Project Alpha (Via-Gent) is a **browser-based, project-centric AI development workspace** operating with:

- **Local-first architecture** using WebContainers, IndexedDB, and File System Access API
- **Project-centric model** (NOT workspace-centric)
- **Plugin-based features** with platform-aware defaults
- **4 workspaces**: IDE, Knowledge, Study, Notes (Knowledge/Study deferred for MVP)

### Route Structure (FINAL)

| Route | Purpose | Status |
|-------|---------|--------|
| `/hub` | Project management, no project loaded | ✅ CANONICAL |
| `/$projectId` | Project loaded with feature plugins | ✅ CANONICAL |

**DEPRECATED ROUTES** (redirect to `/$projectId`):
- `/ide/$projectId`, `/notes/$projectId`, `/knowledge/$projectId`, `/study/$projectId`

### Architecture Health Snapshot (2026-01-30)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| @/lib/ imports | 654 | 0 | 🔴 CRITICAL |
| God files (>300 lines) | 30 | <10 | 🔴 CRITICAL |
| Persist violations | 35 | 0 | 🔴 CRITICAL |
| TypeScript errors | 0 | 0 | ✅ OK |
| Circular deps | 2 | <3 | ✅ OK |
| Type fragmentation | 12 groups | 1 canonical | 🔴 CRITICAL |

---

## 2. Core Architecture Principles

### 2.1 Project-Centric Mental Model

| Aspect | BEFORE (Workspace-Centric) | AFTER (Project-Centric) |
|--------|---------------------------|------------------------|
| **Route Structure** | `/ide/$projectId` → `/notes/$projectId` | Single `/$projectId` route |
| **State Management** | Duplicated per workspace | Single source of truth per project |
| **Feature Rendering** | Workspace determines features | Platform determines available plugins |
| **User Experience** | User selects "workspace mode" | Platform shows available tools |

### 2.2 Project ID Rules

**Project ID IS:**
- A unique identifier for the entire project
- Consistent across all plugins within the project
- The anchor for threads, RAG indices, and project-level settings

**Project ID is NOT:**
- Workspace-specific prefixed or suffixed
- Tied to a particular plugin or feature
- Modified based on device type

### 2.3 Nested Project Policy

**Decision**: Block nested project creation (per VSCode/Obsidian patterns).

**UX Pattern**:
1. User selects folder inside existing project
2. Show: "This folder is inside project X. Open that instead?"
3. Offer "Project Groups" for monorepo workflows (future)

### 2.4 Platform-Aware Default Plugins

| Platform | Storage | Default Plugins | Notes |
|----------|---------|-----------------|-------|
| **Desktop (FSA)** | File System Access | `filetree`, `monaco`, `chat` | Full development |
| **Desktop (IndexedDB)** | Browser Database | `filetree`, `notes`, `chat` | Notes-focused |
| **Tablet** | Browser Database | `filetree`, `notes`, `chat` | Max 2 panels |
| **Mobile** | Browser Database | `notes` | Single panel |

---

## 3. Canonical Type System

> **Source**: `type-registry-2026-01-30.md`

### 3.1 Type Ownership

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                              │
│  Owns: WorkspaceType, ProjectId, PluginId, PluginCategory   │
│  Path: @/domain/types/*                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│  Owns: SyncStatus, SyncProgress, SyncError, SyncConfig      │
│  Path: @/infrastructure/sync/types/*                         │
│  IMPORTS FROM: @/domain/types (for WorkspaceType)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                           │
│  Owns: UI-specific types only                                │
│  IMPORTS FROM: @/domain/types, @/infrastructure/*/types     │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Canonical Type Definitions

#### WorkspaceType

```typescript
// CANONICAL: @/domain/types/canonical/workspace-types.ts
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

**Import Path**: `import type { WorkspaceType } from '@/domain/types';`

#### SyncStatus

```typescript
// CANONICAL: @/domain/types/canonical/sync-types.ts
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
```

#### ProjectId

```typescript
// CANONICAL: @/domain/types/project-ids.ts
export type ProjectId = `proj_${number}_${string}`;
```

#### PluginId

```typescript
// CANONICAL: @/domain/types/plugin-types.ts
export type PluginId = 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'agents' | 'preview';
```

### 3.3 Import Path Contract

**MUST USE:**
```typescript
import type { WorkspaceType, ProjectId, PluginId } from '@/domain/types';
import type { SyncStatus } from '@/infrastructure/sync/types';
```

**FORBIDDEN PATHS:**
| Forbidden Path | Reason |
|----------------|--------|
| `@/lib/*` | Deprecated layer |
| `@/domain/entities/workspace` for WorkspaceType | Should come from types |
| `@/domain/entities/chat` for WorkspaceType | Should come from types |
| `@/domain/value-objects/workspace-type` | Redundant, use barrel |

### 3.4 Known Type Violations (Phase 1 Findings)

| Synonym Group | Active Definitions | Action |
|---------------|-------------------|--------|
| `WorkspaceType` | 8 files in src/ | Migrate to canonical |
| `SyncStatus` | 3 files (INCOMPATIBLE) | Standardize to 4-value |

---

## 4. Domain Entity Contracts

> **Source**: `domain-entity-contracts-2026-01-30.md`

### 4.1 Core Entities

| Entity | Canonical Location | Owner |
|--------|-------------------|-------|
| **Project** | `src/domain/entities/project.ts` | Project Management Domain |
| **Agent** | `src/domain/entities/agent.ts` | Agent Orchestration Domain |
| **ChatThread** | `src/domain/entities/chat.ts` | Chat Cascade Domain |
| **ChatMessage** | `src/domain/entities/chat.ts` | Chat Cascade Domain |
| **FeaturePlugin** | `src/domain/interfaces/feature-plugin.interface.ts` | Plugin System Domain |
| **KnowledgeSource** | `src/domain/entities/knowledge.ts` | Knowledge Management Domain |
| **RagCollection** | `src/domain/entities/rag.ts` | RAG Pipeline Domain |

### 4.2 Entity: Project

```typescript
interface Project {
  id: string;                  // UUID v4 or generated
  name: string;                // Display name
  folderPath: string;          // Display path for UI
  storageType: 'indexeddb' | 'fsa';
  lastOpened: Date;
  createdAt: Date;
  autoSync: boolean;           // Default: true
  workspaceBindings: WorkspaceBindings;
  tags: string[];
  deleted?: boolean;           // Soft delete
  deletedAt?: Date;
}
```

**Business Rules**:
- Project must have unique id
- Storage type determines available features (FSA = full IDE, IndexedDB = notes only)
- Soft delete: recoverable for 30 days
- Nested projects are BLOCKED

### 4.3 Entity: FeaturePlugin

```typescript
interface FeaturePlugin {
  id: PluginId;
  name: string;
  icon: React.ReactNode;
  description: string;
  
  // Platform Requirements
  requirements: PluginRequirements;
  
  // Rendering
  MainComponent: React.FC;
  SidebarComponent?: React.FC;
  ToolbarComponent?: React.FC;
  
  // Lifecycle
  onMount?: (context: PluginContext) => Promise<void>;
  onUnmount?: () => Promise<void>;
  onProjectChange?: (projectId: string) => Promise<void>;
  
  // Capabilities
  capabilities?: PluginCapability[];
  dependsOn?: PluginId[];
}
```

**Business Rules**:
- Maximum 5 plugins per project (2 always-loaded + 3 optional)
- Platform determines available plugins
- Two always-loaded: Project Management, Chat Cascade

### 4.4 Clean Architecture Violations (Current)

| File | Line | Violation | Severity |
|------|------|-----------|----------|
| `feature-plugin.interface.ts` | 30 | Imports from infrastructure | HIGH |
| `project-creation-service.ts` | 15-17 | Domain imports infrastructure | HIGH |
| `domain/adapters/index.ts` | 11-14 | Infrastructure type coupling | MEDIUM |
| `note-gateway.ts` | 23 | Dexie type in domain | MEDIUM |

**Total Violations**: 8 (2 HIGH, 4 MEDIUM, 2 LOW)

---

## 5. State Management

> **Source**: `state-layer-boundaries-2026-01-30.md`, `new-fundamental-truths.md §8`

### 5.1 The 4-Layer State Model (NON-NEGOTIABLE)

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Zustand (Runtime State Only)                        │
│ ├─ UI state (panels, selections, modals)                     │
│ ├─ Session state (current project, active tabs)              │
│ ├─ Ephemeral state (hover, focus, transient forms)           │
│ └─ NO persist middleware for domain data                     │
└─────────────────────────────────────────────────────────────┘
                            ↓ subscribe
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Dexie.js (Persisted State - Source of Truth)        │
│ ├─ Projects metadata                                         │
│ ├─ Conversation threads                                      │
│ ├─ User preferences                                          │
│ ├─ Agent configurations                                      │
│ └─ useLiveQuery() for reactivity                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ sync
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: IndexedDB (Fallback + Blobs)                        │
│ ├─ Note content (Markdown/HTML)                              │
│ ├─ File attachments                                          │
│ ├─ Sync queue                                                │
│ └─ Browser compatibility fallback                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ primary
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: SQLite WASM + OPFS (Primary Storage)                │
│ ├─ Notes metadata                                            │
│ ├─ Project structure                                         │
│ ├─ RAG embeddings                                            │
│ └─ Search indices (FTS5)                                     │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Layer Boundary Rules (CRITICAL)

1. **Never use Zustand persist middleware for Dexie-owned data**
2. **Always use `useShallow()` for Zustand selectors** (prevents re-render cascades)
3. **Always use `useLiveQuery()` for Dexie data** (ensures reactivity)
4. **File operations MUST go through sync engine** (never direct FSA/IDB access)

### 5.3 Correct Patterns

```typescript
// ✅ CORRECT: UI state in Zustand (NO persist)
const useUIStore = create<UIState>((set) => ({
  isPanelOpen: false,
  selectedFile: null,
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
}));

// ✅ CORRECT: Domain data in Dexie
const projects = useLiveQuery(() => db.projects.toArray());

// ✅ CORRECT: Multiple selectors with useShallow
const { items, addItem } = useStore(
  useShallow((state) => ({ items: state.items, addItem: state.addItem }))
);
```

### 5.4 Anti-Patterns to AVOID

```typescript
// ❌ WRONG: Domain data in Zustand with persist
const useProjectStore = create(
  persist((set) => ({
    projects: [], // This should be in Dexie!
  }), { name: 'projects' })
);

// ❌ WRONG: Inline computation in selector (causes re-renders)
const items = useStore(s => s.data.map(x => transform(x)));

// ❌ WRONG: Direct Dexie access without useLiveQuery
useEffect(() => {
  db.projects.toArray().then(setProjects);
}, []);
```

### 5.5 State Crisis Metrics (Phase 1 Findings)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Total Stores** | 61 | <30 | 🔴 CRITICAL |
| **Stores with Persist** | 51 (83%) | <10 (16%) | 🔴 CRITICAL |
| **God Stores (>300 lines)** | 17 | <5 | 🔴 CRITICAL |
| **Persist Violations** | ~35 | 0 | 🔴 CRITICAL |
| **Missing useShallow** | 56 (69%) | <5 (6%) | 🔴 PERFORMANCE |

---

## 6. Directory Structure

### 6.1 Canonical Paths (STRICT)

```
src/
├── routes/                    # TanStack Router ONLY
├── presentation/              # React UI ONLY
│   ├── components/
│   │   ├── ui/               # Design system primitives
│   │   ├── common/           # Shared components
│   │   ├── layout/           # Layout components
│   │   ├── notes/            # Notes-specific
│   │   └── ide/              # IDE-specific
│   ├── layouts/              # Page layouts
│   └── hooks/                # React hooks
├── domain/                    # Business Logic ONLY
│   ├── entities/             # Domain entities
│   ├── services/             # Domain services
│   ├── types/                # Domain types (CANONICAL)
│   │   ├── canonical/        # Canonical type definitions
│   │   ├── project-ids.ts
│   │   └── plugin-types.ts
│   ├── value-objects/        # Value objects
│   └── interfaces/           # Service contracts
└── infrastructure/            # External Interfaces ONLY
    ├── persistence/
    │   ├── dexie-db.ts
    │   └── stores/          # Zustand stores (UI state only)
    ├── filesystem/          # Storage adapters
    │   ├── fsa-storage-adapter.ts
    │   └── idb-storage-adapter.ts
    ├── sync/                # File sync logic
    ├── platform/            # Platform detection
    └── events/              # Event bus
```

### 6.2 FORBIDDEN Paths

| Path | Reason | Alternative |
|------|--------|-------------|
| `@/lib/*` | Deprecated layer | `@/domain/*` or `@/infrastructure/*` |
| `@/stores/*` | Never existed | `@/infrastructure/persistence/stores/*` |
| Relative imports crossing layers | Architecture violation | Use `@/` aliases |
| PascalCase filenames | Convention | Use kebab-case |

### 6.3 File Size Limits

| Type | Max Lines | Action if Exceeded |
|------|-----------|-------------------|
| Stores | 300 | Split into slices immediately |
| Components | 400 | Extract hooks/composables |
| Services | 500 | Decompose by responsibility |

---

## 7. Plugin System

### 7.1 Plugin Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Always-Loaded** | Loaded in every project session | Project Management, Chat Cascade |
| **Optional** | User-selectable up to 5 total | Monaco, Notes, Terminal |
| **Platform-Restricted** | Only on certain platforms | Terminal (desktop-only) |

### 7.2 The Two Always-Loaded Plugins

#### Plugin 1: Project Management Plugin

**Responsibilities:**
- File tree navigation and display
- Project switcher
- Project creation and deletion
- File/folder CRUD operations
- Database and RAG management

#### Plugin 2: Chat Cascade + Thread Management Plugin

**Responsibilities:**
- Agent orchestration and coordination
- Thread management (project-scoped)
- RAG context indexing
- Multi-format block rendering
- Streaming conversation display

**Key Principles:**
- Threads indexed by project ID (NOT workspace)
- Context window limit: 150K tokens
- Auto-compaction at 90% threshold (135K tokens)
- All threads date/time stamped with hierarchy

### 7.3 Plugin Coordination (19 Gaps Identified)

| Category | Gaps | Status |
|----------|------|--------|
| **Shared State** | 1-5 | NOT STARTED |
| **Plugin Lifecycle** | 6-9 | NOT STARTED |
| **State Preservation** | 10-12 | NOT STARTED |
| **Event Contracts** | 13-17 | PARTIAL (file-event-bus exists) |
| **Platform Constraints** | 18-19 | NOT STARTED |

### 7.4 EventBus for File CRUD (ADR-039)

```typescript
type FileEvent = 
  | { type: 'FILE_CREATED'; path: string }
  | { type: 'FILE_UPDATED'; path: string }
  | { type: 'FILE_DELETED'; path: string }
  | { type: 'FILE_MOVED'; from: string; to: string }
  | { type: 'FILE_RENAMED'; from: string; to: string };
```

| Plugin | Subscribes To |
|--------|---------------|
| FileTree | All file events |
| Monaco | FILE_UPDATED (external changes) |
| Notes | FILE_UPDATED (external changes) |

---

## 8. Storage Strategy

### 8.1 Desktop (FSA - File System Access API)

**Characteristics:**
- Real files on disk via native file system
- Bidirectional sync with external editors
- Full IDE capabilities (Monaco, Terminal)
- Handle persistence in IndexedDB

**Requirements:**
- Chrome 122+ for persistent permissions
- FileSystemObserver (Chrome 129+) for file watching with polling fallback

**FSA Handle Lifecycle (ADR-039):**
```
1. Create: persist(projectId, handle) → IndexedDB
2. Access: restoreHandle(projectId) → IndexedDB
3. Validate: queryPermission() before operations
```

**Anti-Patterns:**
- ❌ NEVER pass handle through router state (not serializable)
- ❌ NEVER assume handle survives page reload

### 8.2 Mobile/Tablet (SQLite WASM + OPFS)

**Primary: SQLite WASM + OPFS**
- Full SQL capabilities with ACID transactions
- Near-native performance via Web Workers
- FTS5 full-text search for RAG indices
- Works on Chrome 102+, Firefox 111+, Safari 15.2+

**Fallback: IndexedDB via Dexie.js**
- For older browsers without OPFS support
- Feature detection determines storage layer

**Storage Architecture:**
```
Layer 1: SQLite WASM + OPFS (Primary)
├── Notes metadata
├── Project structure
├── RAG embeddings
├── Search indices (FTS5)

Layer 2: IndexedDB (Fallback + Blobs)
├── Note content (Markdown/HTML)
├── File attachments
├── Sync queue
├── Browser compatibility fallback

Layer 3: Cache API (Static Assets Only)
├── App shell
├── Fonts, icons
├── Static images
```

### 8.3 Safari iOS 7-Day Eviction Policy (CRITICAL)

Safari evicts ALL IndexedDB/OPFS data after 7 days of no use.

**Mitigations (MANDATORY for Safari)**:
1. **Require PWA installation** on mobile Safari
2. PWA-installed apps are NOT subject to eviction
3. Show "Add to Home Screen" banner with clear explanation
4. Implement re-sync on first launch after potential eviction
5. Storage quota monitoring with user warnings

**Browser Support Matrix:**

| Browser | OPFS Support | SQLite WASM | Notes |
|---------|--------------|-------------|-------|
| Chrome 102+ | ✅ | ✅ | Recommended |
| Firefox 111+ | ✅ | ✅ | Full support |
| Safari 15.2+ | ✅ | ✅ | Requires PWA |
| Older browsers | ❌ | ❌ | Dexie.js fallback |

### 8.4 Storage Gateway Pattern

```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
}

interface FileEntry {
  path: string;
  kind: 'file' | 'directory';  // REQUIRED (per ADR-039)
  size: number;
  lastModified: number;
}
```

**Pattern Normalization (ADR-039):**

| Input | Normalized | Result |
|-------|-----------|--------|
| `'.'` | `'**/*'` | All files recursively |
| `''` | `'**/*'` | All files recursively |
| `'src'` | `'src/**/*'` | All files in src recursively |

---

## 9. Agent & Tool Architecture

### 9.1 Orchestrator Pattern

```
User Input
    ↓
Orchestrator/Coordinator (read-only tools only)
    ├─→ Mode Switching (to domain-specific agent)
    └─→ Task Delegation (to sub-agents with isolated context)
```

**Orchestrator Responsibilities:**
- Conversational, user-guidance oriented
- Context detection and task decomposition
- Uses only read-related tools:
  - `read-files`, `grep`, `glob`, `list-files`
  - `todowrite`, `todoread`, `question`
  - `switch-mode`, `delegate-tasks`

### 9.2 Domain-Specific Agents

| Agent Type | Tools | Use Case |
|------------|-------|----------|
| **dev-ext** | File CRUD, bash, task | Code implementation |
| **architect-ext** | Design docs, review | Architecture decisions |
| **analyst-ext** | Research, analysis | Requirements gathering |
| **ux-designer-ext** | UI/UX design | Interface design |
| **tech-writer-ext** | Documentation | API docs, guides |

### 9.3 Tool Permission Matrix

| Agent Type | write | edit | bash | task | Notes |
|------------|-------|------|------|------|-------|
| **orchestrator** | false | false | false | true | Coordination only |
| **dev-ext** | true | true | limited | true | Implementation |
| **architect-ext** | false | design | false | true | Architecture docs |
| **analyst-ext** | false | false | false | true | Research only |

### 9.4 TanStack AI SDK (CONFIRMED)

**SDK Choice: TanStack AI SDK** ✅ CONFIRMED (per new-fundamental-truths.md)

| Criterion | TanStack AI | Vercel SDK v6 | Winner |
|-----------|-------------|---------------|--------|
| Client-side tools | ✅ First-class `.client()` | ⚠️ Callback-based | TanStack |
| Tool approval | ✅ `needsApproval` flag | ⚠️ Manual output flow | TanStack |
| TanStack integration | ✅ Native | ⚠️ Compatible | TanStack |

**Integration Rules:**
1. **TanStack AI SDK First**: All LLM calls must use SDK with provider adapters
2. **No Direct Provider Calls**: Direct calls to provider packages PROHIBITED
3. **Fallback Chain**: Provider → model fallback with graceful degradation
4. **Use `.client()` for browser operations**: File CRUD, storage, IndexedDB access

---

## 10. BYOK (Bring Your Own Key) Vault

### 10.1 Supported LLM Providers

**Provider Priority Order:**

| Priority | Provider | Models (2026) | Key Advantage |
|----------|----------|---------------|---------------|
| **P1** | Google Gemini | 3.0 Pro/Flash | **FREE embeddings**, 2M context |
| **P2** | Anthropic Claude | 4.5 Sonnet/Opus | 90% caching savings, extended thinking |
| **P3** | OpenAI | GPT-5.2 variants | Ecosystem maturity |
| **P4** | OpenRouter | 400+ models | Model variety, fallback routing |
| **P5** | Ollama (Local) | Any GGUF model | Privacy mode, offline capable |

### 10.2 Embedding Strategy (CRITICAL for RAG)

```yaml
Primary: Google Text Embedding 004
  Cost: FREE
  Quality: Excellent for RAG
  
Fallback: OpenAI text-embedding-3-small
  Cost: $0.02/1M tokens
  
Note: Anthropic does NOT provide embedding endpoints
```

### 10.3 Context Caching Strategy

| Provider | Caching | Cost Reduction |
|----------|---------|----------------|
| Anthropic | Prompt caching | 90% on cached |
| Gemini | Context caching | 75% on cached |
| OpenAI | None | N/A |

---

## 11. ADR Index

### 11.1 Active ADRs

| ADR | Title | Status | Authority |
|-----|-------|--------|-----------|
| **ADR-039** | Consolidated Project-Centric Architecture | APPROVED | PRIMARY |
| **ADR-040** | Layout Architecture Consolidation | APPROVED | Layout system |
| **ADR-034** | Project-Centric Architecture | SUPERSEDED by ADR-039 | Reference only |
| **ADR-034-AMENDMENT-001** | Platform-First Plugin Selection | APPROVED | Plugin defaults |

### 11.2 Pending ADRs

| ADR | Title | Status |
|-----|-------|--------|
| ADR-041 | Chat Cascade & Thread Management | PENDING |
| ADR-042 | CRUD Permissions & Concurrency | PENDING |
| ADR-043 | Unified Layout System & Responsive Design | PENDING |

---

## Appendix A: Known Issues & Remediation

### A.1 Type System Issues (12 Groups)

| Issue | Count | Severity | Remediation |
|-------|-------|----------|-------------|
| WorkspaceType duplicates | 8 files | CRITICAL | Migrate to canonical |
| SyncStatus incompatible | 3 files | CRITICAL | Standardize to 4-value |
| Import path fragmentation | 26 files | HIGH | Use barrel exports |

**Reference**: `type-registry-2026-01-30.md`

### A.2 State Layer Violations (35 Stores)

| Category | Count | Action |
|----------|-------|--------|
| Domain data in Zustand with persist | ~25 | Move to Dexie |
| UI state persisted unnecessarily | ~10 | Remove persist |
| God stores (>300 lines) | 17 | Split into slices |

**Reference**: `state-layer-boundaries-2026-01-30.md`

### A.3 @/lib/ Imports (654)

**Migration Path**: Replace with canonical paths

| From | To |
|------|-----|
| `@/lib/workspace/*` | `@/domain/types` |
| `@/lib/notes/*` | `@/infrastructure/persistence/stores/notes/*` |
| `@/lib/rag/*` | `@/infrastructure/rag/*` |

### A.4 Clean Architecture Violations (8)

| Severity | Count | Action |
|----------|-------|--------|
| HIGH | 2 | Sprint 1 - block architecture |
| MEDIUM | 4 | Sprint 2 - type coupling |
| LOW | 2 | Sprint 3 - documentation |

**Reference**: `domain-entity-contracts-2026-01-30.md`

---

## Appendix B: Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **Type Registry** | `type-registry-2026-01-30.md` | Canonical type locations |
| **Entity Contracts** | `domain-entity-contracts-2026-01-30.md` | Domain entity catalog |
| **State Boundaries** | `state-layer-boundaries-2026-01-30.md` | State layer rules |
| **AGENTS.md** | Root | Agent governance |
| **ADR-039** | `adr/` | Authoritative decisions |

---

## Appendix C: Implementation Checklist

### Architecture Alignment

- [ ] Single route `/$projectId` implemented
- [ ] No workspace-specific routes or query params
- [ ] Platform detection working correctly
- [ ] Platform-aware default plugins configured

### Type System

- [ ] Canonical type directory created
- [ ] All WorkspaceType imports from `@/domain/types`
- [ ] All SyncStatus imports standardized
- [ ] @/lib/ imports eliminated

### State Management

- [ ] Zustand stores have NO persist for domain data
- [ ] All domain data in Dexie with useLiveQuery
- [ ] All selectors use useShallow
- [ ] God stores split to <300 lines

### Plugin System

- [ ] Two always-loaded plugins functioning
- [ ] Plugin registry implemented
- [ ] Maximum 5 plugins per project enforced

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0.0 | 2026-01-30 | architect-ext | Major consolidation, merged new-fundamental-truths.md, integrated Phase 1 findings |
| 3.1.0 | 2026-01-26 | Architect Agent | EPIC-0 learnings, plugin coordination |
| 3.0.0 | 2026-01-25 | Architect Agent | Project-centric shift, ADR-039 alignment |
| 2.1.0 | 2026-01-16 | Architect Agent | Initial version |

---

**END OF DOCUMENT**

*Last Updated: 2026-01-30T18:00:00+07:00*
*Version: 4.0.0*
*Status: ACTIVE - CANONICAL*
*Authority: ADR-039, new-fundamental-truths.md v2.2.0*
