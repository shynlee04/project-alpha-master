# Terminology and API Contract Research - 2026-01-18

## Research Summary

Comprehensive analysis of terminology confusion, platform separation, and API contracts in multi-workspace application (Notes, Knowledge, Study, IDE).

## Key Findings

### 1. Terminology Analysis

**Project** (Domain Entity)
- Definition: Core business entity representing a local folder project
- Location: `src/domain/entities/project.ts`
- Fields: id, name, folderPath, storageType ('fsa' | 'indexeddb'), workspaceBindings, timestamps
- Purpose: Represents a persistent project with storage configuration and workspace bindings

**Workspace** (Multiple Meanings - CONFUSION!)
1. **WorkspaceType** (Enum): 'ide' | 'knowledge' | 'study' | 'notes'
   - Location: `src/infrastructure/persistence/dexie-db-core-types.ts:24`
   - Used in: ProjectId namespace prefix, UI mode switching
2. **WorkspaceConfig** (Entity): Static configuration of a workspace
   - Location: `src/domain/entities/workspace.ts`
3. **WorkspaceState** (Entity): Dynamic state for session restoration
   - Location: `src/domain/entities/workspace.ts`
4. **UI Context**: Current active workspace (view mode)
   - Used in: WorkspaceSwitcher, route loaders

**WorkspaceId** (Type)
- Definition: `export type WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes';`
- Location: `src/infrastructure/persistence/dexie-db-core-types.ts`
- Confusion: Used interchangeably with WorkspaceType (same thing)

**ProjectId** (Template Literal Type)
- Definition: `export type ProjectId = ${WorkspaceType}:proj_${number}_${string};`
- Location: `src/domain/types/project-ids.ts:45`
- Format: 'ide:proj_1704787200000_abc123', 'knowledge:proj_123_xyz', etc.
- Purpose: Compile-time enforcement of namespaced IDs

**Relationships**
- Project contains workspaceBindings (which workspaces are enabled)
- WorkspaceType prefixes ProjectId (namespace isolation)
- Projects can have different storage types ('fsa' vs 'indexeddb')
- Workspace is a VIEW MODE, Project is a DATA ENTITY

### 2. Platform Separation

**Desktop Configuration**
- deviceType: 'desktop'
- storageType: 'fsa' (File System Access API)
- canAccessFSA: true
- canAccessIDE: true
- canWatchFiles: true (FileSystemObserver or polling)

**Mobile/Tablet Configuration**
- deviceType: 'mobile' | 'tablet'
- storageType: 'indexeddb' (Dexie.js)
- canAccessFSA: false
- canAccessIDE: false
- canWatchFiles: false (no FSA)

**Platform Detection**
- Function: `getPlatformContract()` from `src/infrastructure/filesystem/platform-contract.ts:263`
- Caching: Result cached in `cachedContract` variable (called ONCE at startup)
- Detection: User agent + screen size + FSA support check
- Recommendation: COMPLETELY SEPARATE FLOWS - share only basic types

**Current Shared Patterns**
- Same TypeScript types (Project, Workspace entities) used by both platforms
- Same Domain entities (project.ts, workspace.ts) used by both platforms
- Different: StorageGateway implementations (FSAGateway vs IDBGateway)
- Different: Route guards (IDE blocked on mobile)
- Different: Sync implementations (FSA bidirectional vs IndexedDB-only)

### 3. API Contracts

**Explicit Contracts** (TypeScript Interfaces)

1. **PlatformContract** (`src/infrastructure/filesystem/platform-contract.ts:74`)
   ```typescript
   interface PlatformContract {
     readonly deviceType: DeviceType;
     readonly storageType: StorageType;
     readonly canAccessFSA: boolean;
     readonly canWatchFiles: boolean;
     readonly canRunTerminal: boolean;
     readonly canDoAgenticCoding: boolean;
     readonly canAccessIDE: boolean;
   }
   ```

2. **StorageGateway** (`src/domain/interfaces/storage-gateway.interface.ts:126`)
   ```typescript
   interface StorageGateway {
     read(path: string): Promise<Uint8Array>;
     write(path: string, data: Uint8Array): Promise<void>;
     delete(path: string): Promise<void>;
     list(path: string): Promise<FileEntry[]>;
     exists(path: string): Promise<boolean>;
     watch(callback: FileChangeCallback): WatchHandle;
   }
   ```

3. **StorageGatewayFactory** (`src/domain/interfaces/storage-gateway.interface.ts:202`)
   ```typescript
   interface StorageGatewayFactory {
     create(storageType: 'fsa' | 'indexeddb'): StorageGateway;
   }
   ```

**Implicit Contracts** (Function Calls)

1. **Direct Zustand store access** → No interface boundary
   - Example: `useProjectStore((state) => state.projects)`
   - Problem: Tightly coupled to store implementation

2. **Direct Dexie calls** → No interface boundary
   - Example: `await db.notes.update(id, changes)`
   - Problem: Tight coupling to persistence implementation

**Layer Boundaries**

1. **Presentation → Domain** (REASONABLY CLEAR)
   - UI Components → Zustand Stores (state management)
   - Contract: Store selectors (get() calls)
   - Violations: Some UI calls Dexie directly

2. **Domain → Infrastructure** (CLEAR via StorageGateway)
   - Domain Services → StorageGateway interface
   - Implementation: FSAGateway or IDBGateway
   - Enforcement: Good abstraction layer

3. **Infrastructure → Persistence** (UNCLEAR)
   - StorageGateway → FSA API or Dexie API
   - Issue: Some sync logic bypasses StorageGateway
   - Example: Direct Dexie calls in note-crud-slice.ts

**Contract Violations**

1. **Four sync implementations** (from bounded-contexts-map.json)
   - `lib/sync/`
   - `lib/filesync/`
   - `lib/filesystem/sync-manager/`
   - `infrastructure/sync/`
   - Problem: Violates single source of truth

2. **Duplicate entity definitions**
   - `core/entities/Project.ts` (re-export)
   - `domain/entities/project.ts` (canonical)
   - Problem: Confuses which source to use

3. **Direct infrastructure access in stores**
   - Example: `db.notes.update()` in note-crud-slice.ts
   - Problem: Bypasses StorageGateway interface

### 4. Data Flow Analysis

**UI → Store** (Zustand)
- Trigger: User action (click, type, drag-drop)
- Contract: Store selector functions (`useProjectStore()`)
- Example: `handleWorkspaceSwitch()` → `setActiveProjectId()`
- Boundary: Well-defined through React hooks

**Store → Persistence** (StorageGateway)
- Trigger: State update (persist middleware or manual write)
- Contract: StorageGateway interface
- Example: `updateNote()` → `gateway.write()`
- Boundary: EXPLICIT interface abstraction
- Implementation: FSAGateway (desktop) or IDBGateway (mobile)

**Persistence → External** (FSA or IndexedDB)
- Trigger: StorageGateway.write() call
- Contract: File System Access API or IndexedDB API
- Example: `FSAGateway.write()` → `directoryHandle.getFileHandle()`
- Boundary: Browser API (no abstraction possible)

**Boundary Crossings**

1. **Workspace Switch Trace** (cycle2-critical-paths/workspace-switch-trace.json)
   - UI event → PlatformContract check → WorkspaceTransitionManager
   - → WorkspaceStore state update → CrossWorkspaceEventBus
   - → AgentSelectionStore → Route navigation
   - Crossings: 4 distinct layer transitions

2. **Sync Notes Trace** (cycle2-critical-paths/sync-notes-trace.json)
   - BlockNote change → debouncedSave → note-crud-slice
   - → Dexie DB update → FSA write (desktop only)
   - Crossings: UI → Store → Persistence → External

**Key Boundary Issues**

1. **Debounce timing mismatch**
   - Save to Dexie: 500ms
   - Sync to FSA: 2000ms
   - Problem: Potential data loss if app closes before FSA sync

2. **No transaction boundaries**
   - Dexie: Implicit single-record transactions (not explicit)
   - Problem: No rollback on multi-record failures

3. **Race conditions possible**
   - Concurrent updates to same note
   - Problem: last-write-wins without conflict resolution

### 5. Simplification Opportunities

**Terminology Alignment**

1. **Rename WorkspaceId → WorkspaceType** (CAPITALIZED TYPE)
   - Current: `export type WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes';`
   - Problem: "Id" suffix misleading (it's a type enum, not an identifier)
   - Fix: `export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';`
   - Impact: Clearer intent, reduces confusion with ID fields

2. **Standardize "workspace" terminology**
   - Option A: Rename to "viewMode" for UI context
   - Option B: Keep "workspace" but add comment clarifying dual meaning
   - Option C: Separate into WorkspaceType (enum) and WorkspaceContext (state)
   - Recommendation: Option C - preserve domain meaning while clarifying usage

3. **ProjectId naming convention clarity**
   - Current: Format enforced, but purpose unclear to new developers
   - Fix: Add comment explaining namespace strategy
   - Impact: Better onboarding for new developers

**Contract Explicitation**

1. **Create Store Interface contracts**
   - Problem: Direct Zustand access without interface
   - Fix: Define `interface ProjectStoreContract` for external consumers
   - Example:
     ```typescript
     interface ProjectStoreContract {
       projects: Project[];
       activeProjectId: string | null;
       setActiveProjectId: (id: string | null) => void;
     }
     ```
   - Impact: Testability, decoupling from implementation

2. **Enforce StorageGateway usage**
   - Problem: Direct Dexie calls in stores
   - Fix: Add ESLint rule to disallow direct db.* calls
   - Impact: Guarantees abstraction layer compliance

3. **Create Service Layer interfaces**
   - Problem: Direct function calls between services
   - Fix: Define domain service interfaces (e.g., `IWorkspaceTransitionService`)
   - Impact: Better testing, clearer contracts

**Flow Simplification**

1. **Consolidate sync implementations**
   - Current: 4 separate sync implementations
   - Fix: Migrate all to `infrastructure/sync/` only
   - Impact: Single source of truth, easier maintenance

2. **Remove lib/ duplicates**
   - Current: `lib/notes/`, `lib/knowledge/`, `lib/study/` duplicate infrastructure/
   - Fix: Delete or migrate to canonical locations
   - Impact: Reduced confusion, canonical structure

3. **Unified debounce strategy**
   - Current: 500ms (Dexie) + 2000ms (FSA)
   - Fix: Single configurable debounce
   - Impact: Consistent behavior, easier tuning

4. **Explicit transaction boundaries**
   - Current: Implicit Dexie transactions
   - Fix: Wrap multi-record operations in explicit transactions
   - Impact: Better error handling, rollback support

## Recommendations

### Priority 1 (Critical)

1. **Rename WorkspaceId → WorkspaceType**
   - File: `src/infrastructure/persistence/dexie-db-core-types.ts:24`
   - Effort: 15 min
   - Impact: Reduces terminology confusion for all developers

2. **Consolidate sync implementations**
   - Target: Remove `lib/sync/`, `lib/filesync/`, `lib/filesystem/sync-manager/`
   - Canonical: `infrastructure/sync/`
   - Effort: 2-3 hours
   - Impact: Single source of truth for sync logic

3. **Remove lib/ duplicates**
   - Target: `lib/notes/`, `lib/knowledge/`, `lib/study/`, `lib/workspace/`
   - Canonical: `infrastructure/persistence/stores/`
   - Effort: 4-6 hours
   - Impact: Clear architecture, reduces confusion

### Priority 2 (High)

1. **Create Store Interface contracts**
   - Target: All Zustand stores in infrastructure/persistence/stores/
   - Pattern: Define explicit TypeScript interfaces
   - Effort: 3-4 hours
   - Impact: Testability, decoupling

2. **Enforce StorageGateway usage**
   - Target: Add ESLint rule
   - Pattern: Disallow direct db.* calls in stores
   - Effort: 1 hour
   - Impact: Guarantees abstraction layer compliance

3. **Create Service Layer interfaces**
   - Target: All services in domain/services/
   - Pattern: Define explicit TypeScript interfaces
   - Effort: 2-3 hours
   - Impact: Better testing, clearer contracts

### Priority 3 (Medium)

1. **Unified debounce strategy**
   - Target: All debounce timers in stores
   - Pattern: Single configurable debounce utility
   - Effort: 1-2 hours
   - Impact: Consistent behavior

2. **Explicit transaction boundaries**
   - Target: Multi-record Dexie operations
   - Pattern: Wrap in `db.transaction()`
   - Effort: 2-3 hours
   - Impact: Better error handling

3. **Add ProjectId naming convention documentation**
   - Target: `src/domain/types/project-ids.ts`
   - Pattern: Comprehensive JSDoc explaining namespace strategy
   - Effort: 30 min
   - Impact: Better onboarding

## Conclusions

1. **Terminology Confusion**: "Workspace" has dual meaning (type enum vs UI context) causing confusion for AI developers
   - Fix: Rename WorkspaceId → WorkspaceType, add clarifying comments

2. **Platform Separation**: Desktop and mobile flows are already well-separated via PlatformContract
   - Recommendation: Maintain separation, share only basic types (Project, Workspace entities)

3. **API Contracts**: Mixed - explicit contracts (PlatformContract, StorageGateway) and implicit contracts (direct function calls)
   - Fix: Create Store interfaces, enforce StorageGateway usage, create service interfaces

4. **Data Flow**: Reasonably clear with some violations (direct Dexie calls in stores)
   - Fix: Enforce abstraction layer compliance via ESLint rules

5. **Simplification Opportunities**: Significant - consolidate sync, remove lib/ duplicates, create explicit interfaces
   - Estimated Effort: 12-18 hours for all Priority 1 + 2 items

---

Generated: 2026-01-18
Researcher: analyst-ext agent
Context: Cycle 1-4 investigation findings + ADR-033 + codebase analysis
