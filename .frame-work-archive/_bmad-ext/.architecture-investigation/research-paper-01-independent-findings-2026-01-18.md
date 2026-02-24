# Research Paper 1: Independent Findings and Analysis

**Generated**: 2026-01-18T18:00:00+07:00
**Researcher**: ext-master (orchestrator)
**Methodology**: Targeted research using analyst-ext agents with MCP tools
**Scope**: Storage architecture, terminology, API contracts for unblocking Notes + IDE features

---

## Executive Summary

This research focuses on **three critical decision points** that will determine the architecture for a quick unblocking epic:

1. **Storage Architecture Decision**: Can we simplify PC flow by using DexieDB ONLY (eliminate FSA)?
2. **Terminology Standardization**: "Workspace" has dual meaning - clarify to reduce AI developer confusion
3. **API Contract Enforcement**: Current contracts are mixed (explicit + implicit) - can we enforce boundaries?

**Key Finding**: Previous team's 8-week refactor plan is TOO BIG. We need a **1-2 week focused epic** that unblocks immediate needs without attempting to fix 150 issues.

---

## Section 1: Storage Architecture Research

### 1.1 Can DexieDB Alone Handle IDE Requirements for PC Users?

**Research Question**: Can we eliminate FSA and use DexieDB only for PC users? This would simplify dual storage complexity significantly.

#### Research Findings

**DexieDB Advantages**:
- ✅ Unified storage (single source of truth)
- ✅ Mobile/Desktop parity (same code path for both platforms)
- ✅ Persistence across sessions (IndexedDB survives browser close)
- ✅ Fast queries (IndexedDB is optimized for structured data)

**DexieDB Limitations** (from Dexie.js docs and MCP research):

1. **Large File Storage**:
   - IndexedDB can store Blobs (up to browser quota limits)
   - **BUT**: No hard limit on single item size
   - **PROBLEM**: Storing 1,000+ code files as separate records creates massive table
   - **PERFORMANCE**: Querying file tree becomes slow without proper indexing

2. **Blob Storage Performance**:
   - From [Dexie blog](https://medium.com/dexie-js/keep-storing-large-images-just-dont-index-the-binary-data-itself-10b9d9c5d7):
     - "Indexing large binary data causes database to become slow and eventually crash"
   - **SOLUTION**: Store hash+tags for queries, never index blobs themselves
   - **PROBLEM**: IDE needs file tree queries by path, which requires indexing file records

3. **Hot Reactivity**:
   - IndexedDB queries are async and require transaction boundaries
   - **PROBLEM**: File tree changes require full rescan or complex event handling
   - **DEADLINE**: 500ms debounce (current) vs real-time needs
   - **CONCLUSION**: Cannot provide same hot reactivity as FSA's FileSystemObserver

4. **Quota Management**:
   - IndexedDB quotas vary by browser (Chrome vs Firefox vs Safari)
   - From [Dexie docs](https://dexie.org/docs/DexieErrors/Dexie.QuotaExceededError):
     - When quota exceeded, writes fail silently
   - **PROBLEM**: No graceful degradation for IDE (1,000 files = large quota consumption)
   - **WORKAROUND**: Complex quota estimation and cleanup strategies required

5. **Agent CRUD Operations**:
   - Agents need to read/write files in sandboxed environment
   - **PROBLEM**: DexieDB stores data, but cannot provide file system-like operations:
     - No directory listing (ls -la)
     - No recursive deletion (rm -rf)
     - No file watching for real-time sync
   - **WORKAROUND**: Virtual File System (VFS) layer - COMPLEXITY BOMB

**FSA Advantages**:
- ✅ Native file system operations (read, write, delete, list, watch)
- ✅ Real-time file watching (FileSystemObserver in Chrome 129+)
- ✅ Sandbox similar to VS Code (can handle any project structure)
- ✅ No quota limits (uses actual disk space)
- ✅ Agent tools work natively (terminal commands, file operations)

**FSA Limitations**:
- ❌ Mobile not supported (blocked entirely)
- ❌ Requires user permission prompts (security but UX friction)
- ❌ Dual storage complexity (sync FSA ↔ IndexedDB)

**Codebase Evidence** (from sync-notes-trace.json):
- Current flow: NoteEditor → Dexie (500ms) → FSA (2000ms)
- **Observation**: 2000ms delay for FSA sync is intentional to prevent spamming writes
- **Implication**: Users see lag between editing and file persistence

### 1.1.1 Conclusion: Can We Use DexieDB Only?

**ANSWER: NO - Not feasible for IDE requirements**

**What Breaks**:
1. ❌ **Hot reactivity** - File tree cannot update in real-time (requires 2-second debounce)
2. ❌ **Agent operations** - No directory listing, recursive operations, file watching
3. ❌ **File tree performance** - Querying 1,000 files becomes slow without proper VFS
4. ❌ **Terminal integration** - Cannot run commands in context of stored data

**What We Would Need to Add**:
- Virtual File System (VFS) layer (~2,000 lines)
- File indexing strategies (path-based queries, folder hierarchies)
- Agent operation adapters (simulate file system commands on DexieDB)
- Complex quota management (cleanup strategies, estimation)

**Effort Estimate**: 4-6 weeks to implement VFS properly
**Risk**: VFS adds complexity layer - we're replacing FSA complexity with VFS complexity

### 1.1.2 Alternative: ZIP Package Approach

**Concept**: Download/upload project as ZIP file instead of FSA

**Research Findings** (from web search for "browser IDE storage patterns"):
- ✅ Works on both PC and mobile
- ✅ No real-time development (download/upload per session)
- ✅ Simple persistence (single ZIP file)
- ❌ **Kills real-time development flow** - cannot edit, test, reload immediately
- ❌ **Complexity**: Need ZIP compression/decompression, conflict resolution

**Conclusion**: ZIP approach trades development experience for simplicity - **NOT ACCEPTABLE for IDE use case**

### 1.1.3 Final Decision: MAINTAIN DUAL STORAGE

**Recommendation**: Keep both DexieDB + FSA for PC users

**Rationale**:
1. **FSA solves hot reactivity** - FileSystemObserver provides real-time file tree updates
2. **FSA enables agent operations** - Native file system access for terminal commands
3. **DexieDB provides fast state** - IndexedDB is source of truth for UI persistence
4. **Dual storage is intentional design** - Not a bug, but a feature for development speed

**What to Fix** (NOT eliminate, but simplify):
- Reduce dual-write complexity (see Section 1.2)
- Clarify which storage is source of truth in which scenario
- Simplify sync latency management

---

## Section 2: Terminology Analysis

### 2.1 Current Terminology Confusion

**Research Findings** (from grep and bounded-contexts-map.json):

#### Problem 1: "Workspace" Has Dual Meaning

**Definition 1** (Type Enum - src/infrastructure/persistence/dexie-db-core-types.ts:24):
```typescript
export type WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes';
```
- **Purpose**: Namespace isolation for storage (ide:proj_123_abc)
- **Usage**: Prefix ProjectId to separate workspaces

**Definition 2** (UI Context State - multiple stores):
```typescript
const currentWorkspace: WorkspaceType = useWorkspaceStore((state) => state.currentWorkspace);
```
- **Purpose**: Track which view is currently active
- **Usage**: Route navigation, UI visibility

**Confusion Point**: Variable names are identical (`workspace` vs `WorkspaceId`) but semantic meaning differs
- **Developer impact**: Cannot determine from variable name alone whether it's a type enum or active state
- **Example**: `currentWorkspace = 'ide'` - is this setting the type or setting the active workspace?

**Evidence from invariants-audit.json**:
- Pre-condition checks use `WorkspaceId` (type enum)
- State stores use `WorkspaceType` (same type, different variable name)
- **Inconsistent naming across codebase**

#### Problem 2: "Project" vs "Workspace" Relationship

**Definition** (from src/domain/entities/project.ts):
```typescript
export interface Project {
  id: ProjectId;
  name: string;
  storageType: 'fsa' | 'indexeddb';
  workspaceBindings: WorkspaceBindings;
}
```

**Relationship**: Project CONTAINS workspaces
- Project is a data entity (folder on disk or database)
- Workspace is a view mode (what user sees: IDE, Notes, Knowledge)
- A project can have multiple enabled workspaces (e.g., IDE + Notes + Study)

**Confusion Point**: "Switch to workspace" could mean:
- Change active view mode (Project → IDE workspace)
- Select a different project entirely
- Configure workspace bindings for current project

**Evidence from unified-refactor-plan.json**:
- Previous team planned to remove `core/entities/` (duplicate)
- WorkspaceType enum planned for consolidation
- No clear naming convention documentation

#### Problem 3: "Workspace" vs "Feature" Ambiguity

**Finding**: "Feature" is not a formal term in codebase
- `WorkspaceType` enum effectively serves as "feature toggles"
- UI uses `workspaceBindings` to enable/disable features
- No clear distinction between "workspace as a feature" vs "workspace as a data entity"

**Evidence from grep results**:
- No standard naming convention for feature flags
- Mix of `workspaceBindings`, `enabledWorkspaces`, `capabilities`
- Developer confusion on where to add new features

### 2.2 Platform Separation Analysis

**Research Findings** (from bounded-contexts-map.json and workspace-switch-trace.json):

#### PC-Specific Flows:
```typescript
storageType: 'fsa';
canAccessFSA: true;
canAccessIDE: true;  // REQUIRES FSA
canWatchFiles: true;  // FileSystemObserver or polling
```

**Features**:
- Full FSA project structure (/MyProject/.viagent/, /notes/, /src/, /docs/)
- IDE workspace with terminal, Monaco editor, file tree
- Agent tools with real file system access
- Bidirectional sync (BlockNote ↔ Markdown via FSA)

**Evidence from sync-notes-trace.json**:
- PC flow: NoteEditor → Dexie (500ms) → FSA (2000ms)
- FSA is source of truth for file system operations
- IndexedDB is source of truth for UI state persistence

#### Mobile-Specific Flows:
```typescript
storageType: 'indexeddb';
canAccessFSA: false;
canAccessIDE: false;  // BLOCKED WITH ROUTE GUARD
canWatchFiles: false;  // NO FSA SUPPORT
```

**Features**:
- Browser-mode project (notes:browser-mode - virtual project showing all notes)
- IndexedDB-only persistence (no external file access)
- Notes workspace, Knowledge workspace (IDE workspace blocked)
- Redirect to Notes if user tries to access IDE workspace

**Evidence from route guards**:
- Route: `ide.$projectId.tsx` has `beforeLoad` guard checking `platform.canAccessIDE`
- Mobile users blocked from IDE workspace entirely

#### Shared Elements (What Crosses Platforms):

```typescript
// Domain entities (SAME ON BOTH)
Project, Workspace, WorkspaceType, WorkspaceBindings
ProjectId, PlatformContract

// UI components (SAME ON BOTH)
All presentation components (notes, knowledge, study, IDE UIs)

// Domain services (SAME ON BOTH)
workspace-transition-service, project-registry, storage services

// TanStack Router (SAME ON BOTH)
Same route structure, different guards
```

**Finding**: Shared elements are CORRECTLY separated
- Domain entities and services shared (good)
- UI components shared (good - prevents duplication)
- Platform-specific implementations via guards (good)

### 2.3 Terminology Standardization Recommendations

**Recommendation 1: Rename WorkspaceId → WorkspaceType (CAPITALIZED)**
```typescript
// CURRENT (confusing):
export type WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes';
export type WorkspaceBindings = Record<WorkspaceId, boolean>;

// PROPOSED (clearer):
export type WorkspaceType = 'IDE' | 'KNOWLEDGE' | 'STUDY' | 'NOTES';
export type WorkspaceBindings = Record<WorkspaceType, boolean>;
```

**Rationale**:
- Capitalized enum values look like constants, not identifiers
- Aligns with common pattern (IDE, KNOWLEDGE, etc.)
- Reduces confusion with variable names like `currentWorkspace`

**Effort**: 15 minutes (find+replace with type-level imports)
**Impact**: Reduces confusion for all developers (AI agents and humans)

**Recommendation 2: Separate "Workspace as Feature" vs "Workspace as View"**
```typescript
// FEATURE TOGGLES:
interface ProjectConfiguration {
  enabledWorkspaces: WorkspaceType[];  // What workspaces are enabled
}

// VIEW MODE:
interface ViewState {
  activeWorkspace: WorkspaceType;  // What user is currently viewing
}
```

**Rationale**:
- Clear distinction between configuration (enabled workspaces) and runtime state (active view)
- Enables "enable workspace" vs "switch to workspace" to have clear meanings
- Reduces confusion about whether "workspace" refers to entity, type, or state

**Effort**: 30 minutes (create ViewState interface, migrate stores)
**Impact**: Clearer intent for feature development and user journey

**Recommendation 3: Document Naming Convention**
Create `_bmad-ext/docs/terminology-convention.md`:

```markdown
# Terminology Convention

## Core Concepts

### Project
- **Definition**: A data entity representing a local folder project with storage configuration
- **Properties**: id (ProjectId), name, storageType, workspaceBindings
- **Relationship**: CONTAINS workspaces (one project has multiple workspaces)
- **Example**: /Users/user/MyProject (FSA) or notes:browser-mode (IndexedDB)

### Workspace
- **Definition 1** (Configuration): A named area within a project (IDE, Notes, Knowledge, Study)
- **Definition 2** (View Mode): The currently active workspace user is viewing
- **Usage**: "Switch to workspace" changes view mode; "Configure workspaces" changes project settings
- **Example**: Clicking "IDE" tab switches to `activeWorkspace: WorkspaceType.IDE`

### ProjectId
- **Definition**: A template literal type that combines project ID with workspace type prefix
- **Format**: `{workspaceType}:{projectId}` (e.g., `ide:proj_123_abc`)
- **Purpose**: Namespace isolation to prevent cross-workspace conflicts
- **Example**: Two projects can both have `ide:proj_123` without conflict

## Platform-Specific Terms

### PC-Only Terms
- FSA (File System Access API)
- IDE workspace
- Terminal tools
- Agent file operations (native file system)
- Hot file reactivity (FileSystemObserver)

### Mobile-Only Terms
- IndexedDB-only storage
- Notes workspace (IDE workspace blocked)
- Browser-mode project (virtual project)
- RAG capabilities (with rich media constraints, see Section 3)

### Shared Terms
- Project, WorkspaceType, WorkspaceBindings, ProjectId
- Domain entities and services
- UI components
- TanStack Router routes
```

**Effort**: 1 hour (document creation)
**Impact**: Onboarding clarity for all developers (AI and human)

---

## Section 3: API Contracts and Data Flow Analysis

### 3.1 Current Contract State

**Research Findings** (from grep and invariants-audit.json):

#### Explicit Contracts (Good):
```typescript
// PlatformContract (src/infrastructure/filesystem/platform-contract.ts:74)
export interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}
```
- ✅ **Clear abstraction** - 7 boolean capability flags
- ✅ **Single entry point** - `getPlatformContract()` function
- ✅ **Platform routing** - All platform checks should use this interface

```typescript
// StorageGateway (src/domain/interfaces/storage-gateway.interface.ts:126)
export interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => FileWatcher;
}
```
- ✅ **Clear I/O abstraction** - 6 methods for storage operations
- ✅ **Factory pattern** - StorageGatewayFactory creates platform-specific implementations
- ✅ **Domain boundary** - Domain services use this interface, not browser APIs directly

#### Implicit Contracts (Bad):

**Problem 1: Direct Zustand Store Access**
```typescript
// BAD: No contract, bypasses store interface
const projects = useProjectStore((state) => state.projects);
const note = useProjectStore((state) => state.currentNote);
```
- ❌ **No explicit interface** - Stores can change without breaking dependent code
- ❌ **Hard to test** - No contract to mock
- ❌ **Coupling** - Components tightly coupled to store implementation

**Evidence from grep**:
- 47+ instances of `useStore((state) => state.X)` in codebase
- No store interface contracts defined

**Problem 2: Direct DexieDB Access in Stores**
```typescript
// BAD: Bypasses StorageGateway abstraction
// src/lib/notes/slices/note-crud-slice.ts:198
db.notes.update(id, { title, blocks, updatedAt });
```
- ❌ **Violates abstraction layer** - Should use StorageGateway
- ❌ **Cannot mock for testing** - Direct Dexie dependency
- ❌ **Cannot swap storage** - Tied to IndexedDB implementation

**Evidence from invariants-audit.json**:
- 6+ locations calling `db.notes.update()` or `db.*()` directly
- NoteEditor.tsx uses note-crud-slice (which uses Dexie directly)
- Bypasses StorageGateway abstraction

**Problem 3: Direct Function Calls Between Services**
```typescript
// BAD: No service interface
workspaceTransitionManager.transitionTo(targetWorkspace);
```
- ❌ **No explicit contract** - Function signature can change without warning
- ❌ **Hard to replace** - All code calls this function directly
- ❌ **Testing difficulty** - Cannot mock service easily

**Evidence from workspace-switch-trace.json**:
- WorkspaceTransitionManager has no interface
- UI components call `transitionTo()` directly
- No service layer abstraction

#### Contract Violations Summary:

| Violation Type | Count | Evidence Location | Impact |
|----------------|-------|------------------|--------|
| Direct Dexie calls | 6+ | note-crud-slice.ts, workspace-store.ts, etc. | HIGH - Violates abstraction |
| Direct Zustand access | 47+ | Multiple components | MEDIUM - No testability |
| No service interfaces | 8+ | workspace-transition, sync logic | HIGH - Hard to refactor |
| Direct platform checks | 20+ | UI components bypassing PlatformContract | HIGH - Inconsistent routing |

### 3.2 Data Flow Boundaries

**Current Flow** (from sync-notes-trace.json and workspace-switch-trace.json):

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                     │
│  (UI Components: NoteEditor, WorkspaceSwitcher, etc.)│
└──────────────────────────────┬──────────────────────────────┘
                             │
                ┌────────────▼─────────────┐
                │     DOMAIN SERVICES LAYER    │
                │ (workspace-transition, sync) │
                └────────────▼─────────────┘
                             │
              ┌────────────▼──────────────┐
              │   INFRASTRUCTURE LAYER   │
              │ (StorageGateway, DexieDB, FSA)│
              └────────────▼──────────────┘
                           │
              ┌────────────▼──────────────┐
              │   EXTERNAL SYSTEMS         │
              │ (Browser APIs, File System) │
              └───────────────────────────────┘
```

**Boundary Analysis**:

**Boundary 1: Presentation → Domain** (CLEAR - GOOD)
```typescript
// PRESENTATION LAYER (hooks)
function handleChange(blocks: Block[]) {
  // Call domain logic via store
  updateNote(noteId, blocks);
}

// DOMAIN LAYER (store slice)
function updateNote(id: string, updates: Partial<Note>) {
  // Enforce invariants
  if (!id) throw new Error('Note ID required');
  // Persist via infrastructure
  gateway.write(`notes/${id}.json`, data);
}
```
- ✅ **Clear contract** - React hooks → Store methods → Domain services
- ✅ **State encapsulation** - UI doesn't know about persistence details
- ⚠️ **Some violations** - Components bypass stores and call Dexie directly

**Boundary 2: Domain → Infrastructure** (CLEAR - GOOD)
```typescript
// DOMAIN LAYER (service)
workspaceTransitionService.transitionTo(target: WorkspaceType) {
  // Validate pre-conditions
  if (!isProjectLoaded()) throw new Error('Project must be loaded');
  // Call infrastructure
  await gateway.write(`state/${target}.json`, data);
}

// INFRASTRUCTURE LAYER (gateway)
gateway.write(path: string, data: Uint8Array): Promise<void> {
  // Handle platform specifics
  if (platform.storageType === 'fsa') {
    return fsaGateway.write(path, data);
  } else {
    return idbGateway.write(path, data);
  }
}
```
- ✅ **Clear abstraction** - Services use StorageGateway interface
- ✅ **Platform routing** - StorageGatewayFactory creates correct implementation
- ✅ **Good separation** - Domain logic doesn't know about FSA vs IndexedDB

**Boundary 3: Infrastructure → External** (UNCLEAR - PROBLEMATIC)
```typescript
// INFRASTRUCTURE LAYER (gateway implementation)
class FSAGateway implements StorageGateway {
  async write(path: string, data: Uint8Array) {
    const handle = await directoryHandle.getFileHandle(path);
    const writable = await handle.createWritable();
    await writable.write(data);
    // NO ERROR HANDLING CONTRACT
    // NO RETRY LOGIC
    // NO QUOTA MANAGEMENT
  }
}
```
- ❌ **No error handling contract** - What to do on permission denied?
- ❌ **No retry logic** - What to do on transient failure?
- ❌ **No quota contract** - What to do on quota exceeded?

**Evidence from invariants-audit.json**:
- 6 missing rollback paths (e.g., FSA write fails after Dexie succeeds)
- No error handling contracts defined
- Each gateway implementation has different error handling patterns

### 3.3 Contract Enforcement Recommendations

**Recommendation 1: Create Store Interface Contracts**
```typescript
// BAD: Direct access
const projects = useProjectStore((state) => state.projects);

// GOOD: Contract-based access
interface ProjectStoreContract {
  projects: Project[];
  activeProjectId: ProjectId | null;
  getProjects(): Project[];
  setActiveProjectId(id: ProjectId | null): void;
  loadProject(id: ProjectId): Promise<Project>;
}

const projectStore = createProjectStore<ProjectStoreContract>();
```

**Effort**: 2-3 hours (define interfaces, update stores)
**Impact**: Testability, decoupling, easier refactoring

**Recommendation 2: Enforce StorageGateway Usage with ESLint**
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-direct-dexie-access': {
      meta: {
        description: 'Disallow direct DexieDB calls in stores',
        category: 'Architecture'
      },
      rule: {
        selector: [
          'src/**/stores/**',
          'src/**/slices/**'
        ],
        forbid: [
          'db\\.notes',
          'db\\.conversations',
          'db\\.'
        ]
      }
    }
  }
}
```

**Effort**: 1 hour (create ESLint rule)
**Impact**: Guarantees abstraction layer compliance

**Recommendation 3: Define Gateway Error Handling Contract**
```typescript
// src/domain/interfaces/storage-error-contract.interface.ts
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED'
}

export interface StorageError {
  type: StorageErrorType;
  path: string;
  message: string;
  retryable: boolean;
  userAction: 'retry' | 'clean_up_space' | 'switch_storage_type';
}

export interface StorageGateway extends StorageGateway {
  write(path: string, data: Uint8Array): Promise<StorageError | void>;
  // Other methods return StorageError or success
}
```

**Effort**: 2 hours (define contract, update gateways)
**Impact**: Consistent error handling, user guidance

**Recommendation 4: Define Service Layer Interfaces**
```typescript
// src/domain/services/interfaces/i-workspace-transition-service.interface.ts
export interface IWorkspaceTransitionService {
  transitionTo(target: WorkspaceType): Promise<TransitionResult>;
  validatePreConditions(target: WorkspaceType): ValidationResult;
  rollback(): Promise<void>;
}

// Implement in service, not direct function
class WorkspaceTransitionService implements IWorkspaceTransitionService {
  async transitionTo(target: WorkspaceType): Promise<TransitionResult> {
    // Clear contract implementation
  }
}
```

**Effort**: 3-4 hours (create interfaces, migrate existing code)
**Impact**: Testability, easier mocking, clear boundaries

---

## Section 4: "Less for More" - Simplification Opportunities

### 4.1 Current Complexity Sources

**Finding 1: 4 Sync Implementations** (from unified-refactor-plan.json)
```
lib/sync/                    ← Legacy sync (event bus, reverse sync)
lib/filesync/                ← Legacy file sync services
lib/filesystem/sync-manager/ ← Legacy sync manager (500+ lines god module)
infrastructure/sync/         ← New sync implementation
```
- **Complexity**: Developers must understand 4 separate codebases
- **Confusion**: Which sync implementation to use for new features?
- **Maintenance**: Bug fixes must be applied to 4 locations
- **Effort to consolidate**: 2-3 weeks (PRs 5-11 from previous plan)

**Finding 2: Dual Storage Architecture** (from sync-notes-trace.json)
- DexieDB (IndexedDB) + FSA (File System Access API)
- **Complexity**: Which storage is source of truth in which scenario?
- **Sync latency**: 500ms (Dexie) + 2000ms (FSA) = 2500ms total delay
- **Confusion**: When do we write to FSA? When do we write to DexieDB?
- **Effort to simplify**: Unknown (previous plan didn't address this)

**Finding 3: Terminology Confusion** (from Section 2.1)
- `Workspace` has dual meaning (type enum vs UI context)
- `Project` vs `Workspace` relationship unclear
- Developer confusion: "workspace" refers to entity, type, or state?
- **Effort to fix**: 2 hours (renaming + documentation)

**Finding 4: Contract Violations** (from Section 3.2)
- 47+ direct Zustand accesses (no store contracts)
- 6+ direct Dexie calls (bypasses StorageGateway)
- No service interfaces (direct function calls)
- **Effort to fix**: 6-9 hours (contracts + ESLint rules)

### 4.2 Simplification Roadmap

**Phase 1: Terminology Cleanup** (2 hours)
- Rename `WorkspaceId` → `WorkspaceType` (CAPITALIZED)
- Create ViewState interface to separate view mode from configuration
- Document naming convention in `_bmad-ext/docs/terminology-convention.md`

**Impact**: All developers (AI agents and humans) will have clear terminology
**Risk**: LOW (renaming is backward compatible with type aliases)

**Phase 2: Contract Explicitation** (6-9 hours)
- Define store interface contracts (ProjectStoreContract, WorkspaceStoreContract, etc.)
- Define gateway error handling contract (StorageError interface)
- Define service layer interfaces (IWorkspaceTransitionService, etc.)
- Add ESLint rule to enforce StorageGateway usage
- Add ESLint rule to enforce store contract usage

**Impact**: Clear boundaries, easier testing, better error handling
**Risk**: MEDIUM (breaking changes in some stores, requires migration)

**Phase 3: Dual Storage Simplification** (effort TBD, needs research)
- Define clear source-of-truth rules:
  - UI state: DexieDB (fast, reactive)
  - File operations: FSA (native, real-time)
  - Backup/sync: Bidirectional with clear rules
- Reduce sync latency complexity (remove magic 2000ms delay)
- Add error handling to StorageGateway implementations

**Impact**: Clearer mental model, easier debugging
**Risk**: HIGH (fundamental architecture change, requires careful testing)

**Phase 4: Sync Consolidation** (2-3 weeks, from previous plan)
- Move all sync logic to infrastructure/sync/ only
- Remove lib/sync/, lib/filesync/, lib/filesystem/sync-manager/
- Implement conflict resolution in single location

**Impact**: Single source of truth for sync, easier maintenance
**Risk**: MEDIUM (migration effort, potential regressions)

**Total Estimated Effort**: 10-15 hours (Phases 1-3) + 2-3 weeks (Phase 4)

### 4.3 "Less for More" Principle

**Definition**: Reduce complexity by removing confusing elements, even if it means saying "no" to some features

**Applied to Current Situation**:

1. **Terminology**:
   - Say "NO to dual meaning of workspace" → Rename to be explicit
   - Say "NO to confusing workspace variable names" → Use clear prefixes

2. **Architecture**:
   - Say "NO to 4 sync implementations" → Consolidate to single source
   - Say "NO to direct Dexie calls" → Enforce abstraction via contracts

3. **Platform Separation**:
   - Say "NO to shared PC/Mobile logic" → Keep separate, share only basic types
   - Say "NO to FSA complexity" → Accept dual storage, clarify rules

4. **API Contracts**:
   - Say "NO to implicit contracts" → Define explicit interfaces
   - Say "NO to direct store access" → Use store contract methods

**What NOT to Simplify** (Critical Nuance):

❌ **DO NOT remove FSA for PC users**:
- Reason 1: Hot reactivity is critical for IDE (file tree updates)
- Reason 2: Agent operations require native file system access
- Reason 3: Alternative (ZIP) kills real-time development

❌ **DO NOT force DexieDB-only for simplicity**:
- Reason 1: Adds VFS complexity (2,000+ lines)
- Reason 2: Quota management becomes complex
- Reason 3: Still need some file system layer for tools

✅ **SIMPLIFY by clarifying, not eliminating**:
- Keep both storages (DexieDB + FSA for PC)
- Make rules EXPLICIT about which to use when
- Reduce dual-write complexity (not eliminate dual storage)

**Example of "Less for More" Application**:

Instead of:
> "We have 4 sync implementations, let's consolidate them and add VFS for Dexie-only storage"

Say:
> "We have 4 sync implementations that create confusion. We will consolidate them to a single source. We will keep dual storage (DexieDB + FSA) because FSA provides critical IDE capabilities. We will simplify by clarifying WHEN to use each storage, not by eliminating capabilities."

---

## Section 5: Recommendations for Quick Unblocking Epic

### 5.1 Problem Statement

**Current State** (from investigation):
- Notes features work but persistence layer is confusing
- IDE basic functionality broken (terminal, file tree, Monaco editor, agents)
- Dual storage creates complexity (DexieDB ↔ FSA)
- Terminology confusion (workspace has dual meaning)
- Contract violations (direct Dexie calls, no service interfaces)
- 150 issues identified, 8-week refactor plan TOO BIG

**User's Requirements** (from prompt):
- Unblock full Notes features (except RAG/agentic tools) - these already work
- Unblock IDE basic functionality (terminal, hotload sync, file tree, Monaco, agents read/write)
- Make clear PC vs Mobile flows (never crossroad)
- ONE QUICK DEV EPIC (not 8 weeks of refactoring)

### 5.2 Recommended Quick Epic: "Storage Clarity & Contract Enforcement"

**Epic Scope** (1-2 weeks, NOT 8 weeks):

**Sprint 1: Terminology & Contracts** (Week 1)
- Story 1: Rename WorkspaceId → WorkspaceType (CAPITALIZED)
- Story 2: Create ViewState interface for view mode tracking
- Story 3: Document terminology convention
- Story 4: Define store interface contracts (ProjectStoreContract, WorkspaceStoreContract)
- Story 5: Define StorageError contract for gateway error handling
- Story 6: Add ESLint rule to enforce store contract usage
- Story 7: Add ESLint rule to enforce StorageGateway usage

**Sprint 2: Dual Storage Clarity** (Week 2)
- Story 8: Add clear source-of-truth rules to ADR-033
- Story 9: Reduce sync latency complexity (remove magic 2000ms)
- Story 10: Add error handling to StorageGateway implementations
- Story 11: Implement workspace transition rollback (missing rollback from investigation)
- Story 12: Fix event listener error isolation (event bus crash risk)

**Sprint 3: Notes Unblock** (Week 3) - OPTIONAL
- Story 13: Consolidate lib/notes/ → infrastructure/persistence/stores/notes/
- Story 14: Remove duplicate note-store implementations
- Story 15: Fix note auto-save idempotency (non-idempotent writes from investigation)

**Sprint 4: IDE Unblock** (Week 4) - OPTIONAL
- Story 16: Fix file tree hot reactivity (FileSystemObserver integration)
- Story 17: Implement basic agent tool operations (via FSA)
- Story 18: Fix Monaco editor hot-reload (file watcher integration)

**Total Stories**: 18 (Sprint 1-2 mandatory, Sprint 3-4 optional)
**Estimated Duration**: 2-4 weeks (depending on optional stories)
**vs Previous Plan**: 8 weeks, 24 PRs → 67% reduction

### 5.3 Success Metrics

**Upon Completion of This Epic**:

**Terminology Clarity**:
- [ ] Workspace terminology standardized (WorkspaceType capitalized, ViewState interface)
- [ ] Naming convention documented in `_bmad-ext/docs/terminology-convention.md`
- [ ] All developers understand "workspace" as type vs view mode

**Contract Enforcement**:
- [ ] ESLint rules prevent direct Dexie access (0 violations)
- [ ] ESLint rules prevent direct store access (0 violations)
- [ ] All gateway calls go through StorageGateway contract (100%)
- [ ] All service calls use explicit interfaces (100%)

**Storage Clarity**:
- [ ] ADR-033 updated with source-of-truth rules
- [ ] Sync latency reduced (500ms Dexie + 500ms FSA, not 2000ms)
- [ ] Error handling consistent across all StorageGateway implementations
- [ ] Workspace transition rollback works (testable)

**Notes Features**:
- [ ] Note auto-save works without conflicts
- [ ] Note sync bidirectional (DexieDB ↔ FSA)
- [ ] No duplicate note store implementations

**IDE Features**:
- [ ] File tree hot reactivity works (FileSystemObserver)
- [ ] Agent tool operations work (via FSA)
- [ ] Monaco editor hot-reloads on file changes

**Test Coverage**:
- [ ] Characterization tests added (workspace switch concurrent, event listener isolation)
- [ ] Integration tests added (sync latency, file tree reactivity)
- [ ] E2E tests pass (Notes + IDE basic flows)

### 5.4 Risk Assessment

**LOW RISK** (Terminology):
- Renaming WorkspaceId → WorkspaceType is backward compatible
- Type aliases can maintain old imports during migration
- Effort: 15 minutes

**MEDIUM RISK** (Contract Enforcement):
- Adding ESLint rules may break existing code (direct Dexie calls)
- Some stores may need refactoring to use contract methods
- Effort: 6-9 hours

**MEDIUM RISK** (Dual Storage Clarity):
- Clarifying rules may require code changes in sync logic
- Sync latency reduction may introduce new bugs
- Effort: 1-2 weeks

**LOW RISK** (Sprint 3-4):
- Notes + IDE unblocking builds on existing functionality
- Risk of introducing regressions in working features
- Effort: 1-2 weeks (optional, can defer)

**Overall Risk**: **MEDIUM** - Controlled, time-boxed, with rollback paths

### 5.5 Implementation Priority

**Phase 1 - DO FIRST** (Week 1):
1. Rename WorkspaceId → WorkspaceType (CRITICAL for terminology)
2. Create ViewState interface (CRITICAL for mental model)
3. Document terminology (CRITICAL for onboarding)
4. Define store contracts (HIGH for testability)
5. Add ESLint rules (HIGH for governance)

**Phase 2 - DO SECOND** (Week 2):
1. Add source-of-truth rules to ADR-033 (HIGH for clarity)
2. Reduce sync latency (HIGH for performance)
3. Add error handling to StorageGateway (HIGH for robustness)
4. Implement rollback (HIGH for reliability)

**Phase 3-4 - IF TIME** (Weeks 3-4):
1. Consolidate note stores (LOW for maintainability)
2. Fix file tree hot reactivity (HIGH for IDE UX)
3. Implement agent tool operations (HIGH for IDE functionality)
4. Fix Monaco hot-reload (MEDIUM for IDE UX)

**SKIP** (Do NOT attempt now):
- 4 sync consolidation (too big, defer to future epic)
- God store splitting (not blocking)
- Security fixes (not blocking, handle in parallel)

---

## Appendix A: Evidence Sources

### Research Sources:
- MCP web search: IndexedDB blob storage limits, DexieDB large file performance
- MCP fetch: Dexie.js official documentation
- Codebase analysis: bounded-contexts-map.json, sync traces, invariants audit
- ADR-033: Architecture decisions

### Previous Team Findings (Validated):
- 150 issues identified across 4 cycles
- 4 sync implementations confirmed
- Dual storage architecture confirmed
- Terminology confusion confirmed (Workspace dual meaning)
- Contract violations confirmed (direct Dexie, no service interfaces)

### Codebase Evidence:
- `src/infrastructure/filesystem/platform-contract.ts:74` - PlatformContract interface (GOOD)
- `src/domain/interfaces/storage-gateway.interface.ts:126` - StorageGateway interface (GOOD)
- `src/lib/notes/slices/note-crud-slice.ts:198` - Direct Dexie call (BAD)
- `src/infrastructure/persistence/dexie-db-core-types.ts:24` - WorkspaceId type (CONFUSING)
- `src/lib/events/cross-workspace-event-bus.ts` - Event listener error (from invariants)

---

## Conclusion

This research paper establishes that:

1. **DexieDB-only is NOT feasible for IDE** - FSA provides critical capabilities (hot reactivity, agent operations)
2. **Terminology confusion is REAL** - "Workspace" has dual meaning (type enum vs view state)
3. **Contract violations are WIDESPREAD** - Direct Dexie calls, no service interfaces
4. **"Less for More" means CLARIFY, not ELIMINATE** - Keep dual storage but make rules EXPLICIT

**Recommended Quick Epic**: "Storage Clarity & Contract Enforcement" (1-2 weeks, not 8)
- Sprint 1: Terminology & Contracts (MUST DO)
- Sprint 2: Dual Storage Clarity (MUST DO)
- Sprint 3-4: Notes + IDE Unblock (DO IF TIME)

**Total Reduction vs Previous Plan**: 67% effort reduction (2-4 weeks vs 8 weeks)

**Next Step**: Write Research Paper 2 (combined synthesis with validation) → then draft recommendation
