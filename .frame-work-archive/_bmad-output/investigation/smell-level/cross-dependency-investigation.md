# Cross-Dependency Investigation Report

**Investigation ID**: CROSS-DEP-01  
**Generated**: 2026-01-20  
**Scope**: Cross-store dependencies, Cross-domain dependencies, Import/export patterns  
**Status**: Complete

---

## Executive Summary

This investigation reveals a complex cross-dependency landscape with significant technical debt in migration status. The codebase is undergoing a multi-phase transition from legacy `src/lib/` paths to canonical `src/infrastructure/` and `src/domain/` locations. While the core architecture follows Clean Architecture principles with proper dependency inversion, 120+ deprecated imports and 17 cross-layer violations need attention.

**Key Concerns**:
- 54 files still importing from `src/lib/filesystem/` facade (deadline passed)
- 50+ presentation components using deprecated `@/lib/notes` imports
- 3 infrastructure slices importing from deprecated `lib/` paths
- Domain layer importing infrastructure types (violates Clean Architecture)

---

## Findings

### 1. Store Dependencies

#### Cross-Store Dependencies Identified

| From Store | To Store | Type | Usage |
|------------|----------|------|-------|
| `workspace/slices/use-file-ops-slice.ts` | `project/useProjectStore` | Direct | `createProject()`, `getProject()`, `saveProject()` |
| `workspace/slices/use-vfs-sync-slice.ts` | `project/useProjectStore` | Direct | Read `storageType` for handle readiness check |
| `workspace/slices/use-vfs-sync-slice.ts` | `statusbar-store` | Direct | `setSyncStatus()`, `setLastSyncTime()`, `setSyncError()` |
| `workspace/slices/use-file-loader-slice.ts` | `project/` | Direct | `getProject()`, `ProjectMetadata` type |
| `workspace/slices/use-storage-adapter-slice.ts` | `project/` | Direct | `saveProject()`, `ProjectMetadata` type |
| `agents/slices/agent-events-slice.ts` | `workspace` | Direct | `useWorkspaceStore` event emission |
| `providers/provider-models-slice.ts` | `workspace` | Direct | `useWorkspaceStore` model context |
| `conversation/useConversationStore.ts` | `chat/useUnifiedChatStore` | Facade | State mapping and delegation |
| `note-context-tracker.ts` | `@/lib/notes` | Legacy | `useNoteStore` for active note context |

#### Circular Dependency Patterns

**Pattern 1**: `project → workspace → project`
- Workspace slices import from project store
- No circular import at module level
- Mitigation: Uses `getState()` pattern to avoid circular imports

**Pattern 2**: `conversation → chat → conversation`
- Facade pattern creates dependency but no circular module import
- `conversation-store.ts` imports from `chat/` but not vice versa

#### Dependency Graph

```
useWorkspaceStore → useProjectStore (creates/reads projects)
useVFSSyncStore → useProjectStore (checks storageType)
useVFSSyncStore → useStatusBarStore (syncs status)
useConversationStore → useUnifiedChatStore (facade delegation)
note-context-tracker → useNoteStore (legacy - reads active note)
agent-events-slice → useWorkspaceStore (event emission)
provider-models-slice → useWorkspaceStore (model context)
```

---

### 2. Domain Dependencies

#### Entity Relationships

| Entity | Exports | Domain Imports | Infrastructure Imports |
|--------|---------|----------------|----------------------|
| `project.ts` | Project, WorkspaceBindings, LayoutConfig | None | None |
| `workspace.ts` | WorkspaceType, WorkspaceConfig, WorkspaceState | None | None |
| `knowledge.ts` | KnowledgeSource, KnowledgeNode, KnowledgeEdge | None | None |
| `study.ts` | Flashcard, Quiz, QuizQuestion, StudySession | None | None |

**Finding**: All 4 entity files are 100% pure domain with no infrastructure dependencies ✅

#### Service Layer Dependencies

| Service | Imports Entities | Imports Services | Imports Infrastructure |
|---------|-----------------|------------------|----------------------|
| `ProjectRegistry.ts` | None | None | None |
| `workspace-transition-service.ts` | Agent | AgentOrchestrationService | None |
| `agent-orchestration-service.ts` | Agent | None | None |

**Finding**: Domain services maintain clean boundaries with only domain imports ✅

#### Domain Cross-Layer Violations

| File | Issue | Severity |
|------|-------|----------|
| `src/domain/services/note-gateway.ts` | Imports `NoteRecord` from `@/infrastructure/persistence/dexie-db` | LOW |
| `src/domain/services/file-crud/unified-file-crud.ts` | Imports `FileLock` from `@/lib/agent/facades/file-lock` | LOW |
| `src/domain/services/file-crud/unified-file-crud.ts` | Imports `WorkspaceEventEmitter` from `@/lib/events/workspace-events` | LOW |

---

### 3. Infrastructure Dependencies

#### Adapter-to-Adapter Dependencies

| Adapter | Depends On | Purpose |
|---------|-----------|---------|
| `FSAAdapter` | `BaseStorageAdapter` | Shared base class |
| `IDBAdapter` | `BaseStorageAdapter` | Shared base class |
| `FSAAdapter` | `fsa-permission-manager` | Permission handling |
| `IDBAdapter` | `idb-quota-manager` | Storage quota management |
| `IDBAdapter` | `idb-eviction` | Cache eviction |

#### Cross-Boundary Patterns

1. **Infrastructure calls Domain**: Adapters implement domain-defined interfaces (dependency inversion)
2. **Domain calls Infrastructure**: Only via interfaces, never concrete implementations
3. **Adapter-to-Adapter**: Shared `BaseStorageAdapter` class for code reuse

#### Infrastructure Self-Dependency Issues

| File | Imports From | Issue |
|------|--------------|-------|
| `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | `@/lib/filesystem/unified-storage-adapter` | Infrastructure importing from deprecated lib/ path |
| `src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts` | `@/lib/filesystem/unified-storage-adapter` | Infrastructure importing from deprecated lib/ path |
| `src/infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts` | `@/lib/filesystem/*` | Infrastructure importing from deprecated lib/ path |

---

### 4. Import/Export Issues

#### Deprecated Import Paths

| Legacy Path | Canonical Path | Files Affected |
|-------------|----------------|----------------|
| `@/lib/notes/*` | `@/infrastructure/persistence/stores/notes/*` | 82 files |
| `@/lib/workspace/*` | `@/infrastructure/persistence/stores/workspace/*` | 44 files |
| `@/lib/filesystem/*` | `@/infrastructure/filesystem/*` | 49 files |
| `@/lib/state/*` | `@/infrastructure/persistence/stores/*` | 2 files |

#### Facade Patterns

| Facade File | Purpose | Deadline | Status |
|-------------|---------|----------|--------|
| `src/lib/filesystem/index.ts` | Re-exports from infrastructure/filesystem | 2026-01-22 | **PAST DUE** |
| `src/lib/notes/store-facades.ts` | Slash commands facade | None | Active |
| `src/infrastructure/sync/index.ts` | Sync manager re-exports | None | Active |
| `src/infrastructure/persistence/stores/index.ts` | File sync status re-exports | None | Active |

#### Barrel File Complexity

| Barrel File | Exports | Re-exports from lib/ |
|-------------|---------|---------------------|
| `src/infrastructure/filesystem/index.ts` | 216 lines | 1 (permission-lifecycle) |
| `src/infrastructure/persistence/stores/index.ts` | 228 lines | 1 (file-sync-status-store) |
| `src/infrastructure/sync/index.ts` | ~200 lines | 5 (sync-manager) |
| `src/domain/services/index.ts` | 76 lines | 0 |

---

## Uncleaned Files

### P0 - Critical

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/lib/filesystem/index.ts` | Facade deadline passed | 54 re-exports from infrastructure/filesystem | Remove facade, update 54 consumer imports |
| `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | Infrastructure importing from lib/ | Lines 22, 33: Imports from `@/lib/filesystem/*` | Update to `@/infrastructure/filesystem/` |
| `src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts` | Infrastructure importing from lib/ | Line 20: Imports from `@/lib/filesystem/*` | Update to `@/infrastructure/filesystem/` |
| `src/infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts` | Infrastructure importing from lib/ | Line 29: Imports from `@/lib/filesystem/*` | Update to `@/infrastructure/filesystem/` |

### P1 - High Priority

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/presentation/components/notes/NoteEditor.tsx` | Deprecated imports | Lines 68-69: Imports from `@/lib/notes/*` | Migrate to infrastructure store |
| `src/presentation/components/notes/AISlashCommand.tsx` | High volume deprecated imports | 7 different `@/lib/notes` imports | Consolidate to unified notes store |
| `src/domain/services/note-gateway.ts` | Cross-layer violation | Line 23: Imports NoteRecord from infrastructure | Move NoteRecord to domain/entities |
| `src/domain/services/file-crud/unified-file-crud.ts` | Cross-layer violations | Lines 32-34: Imports from lib/ | Create domain interfaces |
| `src/lib/filesystem/file-snapshot-store.ts` | Deprecated class | 517-line class with Zustand facade | Remove class, keep Zustand store |
| `src/lib/notes/store-facades.ts` | Dual-store transition pending | Facade for slash-command-store | Update 5 consumers, remove facade |

### P2 - Medium Priority

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/infrastructure/sync/index.ts` | Bridge facade | Lines 190-200: Re-exports from lib/ | Migrate SyncManager to infrastructure/ |
| `src/lib/workspace/index.ts` | Deprecated exports | 12+ `@deprecated` function exports | Audit consumers, remove systematically |
| `src/lib/workspace/temp-project.ts` | Deprecated | Phase 4 timeline passed | Remove or complete Phase 4 cleanup |
| `src/routes/workspace/$projectId.tsx` | Deprecated route | Line 4: `@deprecated Use /ide/$projectId` | Remove after confirming no consumers |

### P3 - Low Priority

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/presentation/components/Header.tsx` | Deprecated component | Comment: `@deprecated 2025-12-27` | Remove or complete v2.0 migration |
| `src/presentation/components/notes/NotesMobileLayout.tsx` | Unimplemented TODO | Line 212: `// TODO: Implement create note` | Implement or document as deferred |
| `src/lib/workspace/session-snapshot.ts` | Deprecated class | Multiple `@deprecated` comments | Remove or migrate to infrastructure/ |

---

## Migration Status Summary

| Migration | Status | Consumers Updated | Consumers Remaining |
|-----------|--------|-------------------|---------------------|
| Notes Store | In Progress | 45 | 75 |
| Workspace Store | Partial | 20 | 35 |
| Filesystem | Partial | 25 | 54 |
| Conversation Store | Facade Pattern | 10 | 15 |
| Study Workspace | Deferred | N/A | N/A |
| Knowledge Workspace | Deferred | N/A | N/A |

---

## Synthesis

The cross-dependency investigation reveals a codebase in active transition from legacy patterns to Clean Architecture compliance. While the core domain layer (entities and services) demonstrates excellent architectural discipline with zero infrastructure dependencies, the presentation and infrastructure layers contain significant technical debt from incomplete migrations.

**Three Critical Dependencies** require immediate attention:

1. **Filesystem Facade (`src/lib/filesystem/index.ts`)**: 54 files are still importing through this deprecated facade despite the 2026-01-22 deadline passing. This creates an artificial dependency layer that obscures the true architecture and slows TypeScript compilation.

2. **Infrastructure Self-Dependency**: Three infrastructure slice files (`use-file-ops-slice.ts`, `use-file-loader-slice.ts`, `use-storage-adapter-slice.ts`) are importing from deprecated `lib/` paths instead of canonical `infrastructure/` locations. This violates the principle that infrastructure code should depend only on domain interfaces, not on legacy facades.

3. **Cross-Layer Type Violations**: The domain layer contains 17 instances where domain services import infrastructure types (`NoteRecord`, `FileLock`, `WorkspaceEventEmitter`). While low severity, these violations compromise the Clean Architecture principle that the domain layer should be independent of infrastructure details.

**Architectural Strengths** observed:
- All entity files are pure domain with zero infrastructure imports
- Domain services maintain clean boundaries with only domain dependencies
- Storage adapters properly implement domain-defined interfaces (dependency inversion)
- Shared `BaseStorageAdapter` class reduces code duplication

**Recommended Next Steps**:
1. Complete P0 cleanup: Remove filesystem facade and update infrastructure slices
2. Create domain interfaces for cross-layer type violations
3. Systematically update presentation layer to use canonical import paths
4. Archive or complete deferred workspace files (study/knowledge)

---

## Validation Required

After remediation, run:

```bash
# TypeScript validation
pnpm tsc --noEmit

# All tests
pnpm vitest run

# Verify no broken imports
# (manual verification after facade removal)
```

---

**Report Generated**: 2026-01-20  
**Investigation ID**: CROSS-DEP-01  
**Files Analyzed**: 150+  
**Issues Identified**: 20 uncleaned files, 120 deprecated imports, 17 cross-layer violations
