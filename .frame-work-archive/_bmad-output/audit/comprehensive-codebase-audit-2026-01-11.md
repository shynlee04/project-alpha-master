# Comprehensive Codebase Audit Report
**Date:** 2026-01-11
**Audit Type:** Deep Scan - Architecture, Gaps, Smells, Tech Debt, Conflicts
**Status:** Complete

---

## Executive Summary

This audit represents a comprehensive deep scan of the entire codebase, examining:
- All files, domains, slices, paths, and concerns
- Conflicts (inversion, logic, contracts, data flow, user journey per interfaces)
- Split components with conflicting or overlapping functionality
- Orphaned and disconnected components

**Overall Architecture Health Score:** 6/10

| Category | Issues Found | Severity Distribution |
|----------|--------------|----------------------|
| Architecture Violations | 12 | 8 High, 3 Medium, 1 Low |
| State Management | 15 | 6 High, 7 Medium, 2 Low |
| Type Definitions | 8 | 3 High, 4 Medium, 1 Low |
| Performance | 7 | 4 High, 3 Medium |
| Orphaned/Unclear | 6 | 0 High, 4 Medium, 2 Low |
| **TOTAL** | **48** | **21 High, 21 Medium, 6 Low** |

---

## 1. Architecture Violations

### 1.1 Circular Dependencies (HIGH)

#### Issue 1.1.1: Service Circular Dependency
**Location:**
- `src/domain/services/agent-orchestration-service.ts`
- `src/domain/services/workspace-transition-service.ts`

**Description:** Two domain services import from each other directly, creating a circular dependency.

**Impact:**
- Breaks clean architecture principles
- Makes testing difficult
- Can cause runtime initialization issues

**Files Affected:**
```
src/domain/services/agent-orchestration-service.ts:11
src/domain/services/workspace-transition-service.ts:11
```

---

#### Issue 1.1.2: Infrastructure → Domain Import
**Location:** `src/infrastructure/persistence/stores/index.ts:190-195`

**Description:** Infrastructure layer re-exports domain services, violating dependency rule.

**Code:**
```typescript
// Infrastructure layer importing from domain (creates circular dependency risk)
export {
  isAgentAvailableIn,
  isAgentDefaultFor,
  getAgentsForWorkspace,
  getDefaultAgentForWorkspace,
} from '@/domain/services';
```

**Impact:**
- Infrastructure should not depend on domain
- Creates coupling in wrong direction
- Makes domain layer less reusable

---

#### Issue 1.1.3: Domain → Infrastructure Import (Leaky Abstraction)
**Location:** `src/domain/services/universal-adapter-factory.ts:313`

**Description:** Domain service imports directly from infrastructure layer (`@/lib/agent/providers/credential-vault`)

**Impact:**
- Violates dependency inversion principle
- Domain layer cannot be used without infrastructure
- Creates tight coupling

---

### 1.2 Duplicate Entity Exports (MEDIUM)

#### Issue 1.2.1: Core Index Redundancy
**Locations:**
- `src/core/entities/index.ts` (lines 1-36)
- `src/core/index.ts` (lines 11-35)

**Description:** Two different index files re-export the same domain entities. The entire `src/core/` directory is a legacy compatibility layer.

**Impact:**
- Confusion about canonical import path
- Maintenance burden (changes must be mirrored)
- Unclear which imports to use

**Recommendation:** Migrate all imports to domain layer directly, deprecate `src/core/`

---

### 1.3 Layer Boundary Violations (HIGH)

#### Issue 1.3.1: Business Logic in Lib Directory
**Locations:**
- `src/lib/notes/note-store.ts`
- `src/domain/tools/note/`

**Description:** Notes business logic exists in both domain layer and lib layer.

**Impact:**
- Violates onion architecture
- Unclear where to make changes
- Potential for divergence

---

#### Issue 1.3.2: Misplaced Types
**Location:** `src/domain/services/project-registry-types.ts`

**Description:** Type definitions file located in services directory instead of types directory.

**Impact:**
- Violates file organization conventions
- Makes type discovery harder

---

## 2. State Management Issues

### 2.1 God Stores (HIGH)

A "god store" is defined as any store file exceeding 300 lines, indicating excessive responsibility.

| Store File | Lines | Primary Issue |
|------------|-------|---------------|
| `src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts` | 571 | File system + sync + project metadata |
| `src/infrastructure/persistence/stores/providers/migration-backup.ts` | 549 | Migration logic in store layer |
| `src/infrastructure/persistence/stores/conversation/migration/conversation-migration.ts` | 549 | Migration logic should be in infrastructure |
| `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` | 497 | Multiple responsibilities |
| `src/infrastructure/persistence/stores/chat/unified-chat-store.ts` | 448 | Chat state management |
| `src/infrastructure/persistence/stores/providers/provider-store.ts` | 387 | Provider management |
| `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | 347 | Workspace state |
| `src/infrastructure/persistence/stores/rag/useRAGStore.ts` | 327 | RAG functionality |

**Impact:**
- Difficult to understand and modify
- High change risk
- Testing complexity

---

### 2.2 Store Duplication & Overlap (MEDIUM)

#### Issue 2.2.1: Multiple Conversation Stores
**Files:**
- `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`
- `src/infrastructure/persistence/stores/conversation/conversation-store.ts`
- `src/infrastructure/persistence/stores/chat/unified-chat-store.ts`

**Description:** Three separate stores managing conversational state with unclear boundaries.

---

#### Issue 2.2.2: Multiple Workspace Stores
**Files:**
- `src/infrastructure/persistence/stores/workspace/workspace-store.ts`
- `src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts`
- `src/lib/workspace/unified-workspace-context.tsx`

**Description:** Workspace functionality scattered across three locations.

---

#### Issue 2.2.3: Store Architecture Inconsistency
**Description:** Store implementations spread across three locations:
1. `src/infrastructure/persistence/stores/` (Primary - Zustand slice pattern)
2. `src/lib/snippets/snippet-store` (Custom Zustand)
3. `src/lib/workspace/project-store` (Custom Zustand)
4. `src/lib/filesystem/file-snapshot-store` (Custom Zustand)

**Impact:** Inconsistent patterns, difficult to maintain

---

### 2.3 Orphaned/Unused Stores (LOW-MEDIUM)

| Store File | Usage Status | Notes |
|------------|--------------|-------|
| `conversation-auto-restore.ts` | Test-only | No production consumers found |
| `file-watcher-store.ts` | Minimal | Very limited usage |
| `synthesis-store.ts` | None | No active consumers found |

---

### 2.4 Cross-Store Dependencies (MEDIUM)

**Location:** `src/infrastructure/persistence/stores/workspace/useCornerstoneStores.ts`

**Description:** Centralized store access creates tight coupling:
```typescript
import { useWorkspaceStore } from './workspace-store';
import { useAppStore } from '../use-app-store';
import { useConversationStore } from '../conversation';
import { useRAGStore } from '../rag';
import { useAgentSelectionStore } from '../agents/agent-selection-store';
```

**Impact:**
- Stores tightly coupled
- Difficult to test in isolation
- Change propagation unpredictable

---

## 3. Type Definition Issues

### 3.1 Duplicate Type Definitions (MEDIUM-HIGH)

#### Issue 3.1.1: ValidationResult (4+ definitions)
**Locations:**
- `src/domain/services/agent-orchestration-service.ts:15`
- `src/domain/services/workspace-transition-service.ts:227`
- `src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts`
- (Possibly more)

**Description:** Same interface defined multiple times.

**Impact:**
- Type drift risk
- Maintenance burden
- Potential for subtle bugs

---

#### Issue 3.1.2: ProviderResponse (Duplicate)
**Locations:**
- `src/domain/types/llm/provider-types.ts:376` (Canonical)
- `src/routes/$__debug__.provider-playground.tsx:79` (Duplicate)

**Description:** Debug component redefines interface instead of importing from domain.

---

#### Issue 3.1.3: Provider Types Scattered
**Locations:**
- `src/shared/types/index.ts`
- `src/lib/agent/providers/types.ts`
- `src/infrastructure/persistence/stores/providers/types.ts`
- `src/domain/types/llm/provider-types.ts`

**Description:** Provider-related types defined in four separate locations.

**Impact:**
- Unclear canonical source
- Risk of inconsistency
- Import confusion

---

### 3.2 Type Contract Violations (MEDIUM)

#### Issue 3.2.1: AgentProviderValidator Contract
**Location:** `src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts:70`

**Description:** Function throws instead of returning ValidationResult as contract specifies.

**Expected:** Always returns ValidationResult with error message
**Actual:** Sometimes throws without returning error result

---

#### Issue 3.2.2: UniversalProviderRegistry.update()
**Location:** `src/domain/services/universal-provider-registry.ts:298`

**Description:** Method returns undefined when entry not found, but signature suggests always returns.

---

#### Issue 3.2.3: ProjectRegistry Conflict Detection
**Description:** `detectConflict()` returns `isResolvable: false` for conflicts that `resolveConflict()` can handle.

**Impact:** Inconsistent API promises

---

### 3.3 Type Safety Issues (MEDIUM)

**Location:** `src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts:59`

**Description:** Type assertions using `as any` when accessing domain services from stores.

**Impact:**
- Bypasses type checking
- Hides potential errors
- Makes refactoring dangerous

---

## 4. Performance Issues

### 4.1 N+1 Query Patterns (HIGH)

#### Issue 4.1.1: Knowledge Source Deletion
**Location:** `src/infrastructure/persistence/stores/knowledge/slices/knowledge-source-crud-slice.ts:56-62`

**Description:** Database queries inside loop:
```typescript
for (const collection of get().collections) {
  if (collection.sourceIds.includes(sourceId)) {
    await db.collections.where('id').equals(collection.id).modify(...)
  }
}
```

**Should be:** Bulk operation

---

#### Issue 4.1.2: Additional N+1 Patterns
**Locations Found:**
- Multiple files with `forEach` containing `db.` operations
- File metadata queries in loops
- Collection updates in iteration

---

### 4.2 Sync Race Conditions (HIGH)

**Location:** `src/infrastructure/sync/core/sync-engine-core.ts:78-80`

**Description:** Simple boolean check doesn't prevent race conditions:
```typescript
if (this.state.isSyncing) {
  throw new Error('Sync already in progress');
}
```

**Issues:**
- Not thread-safe
- No proper mutex/lock
- Multiple syncs can start simultaneously
- Last-write-wins can cause data loss

---

### 4.3 Unnecessary Write Operations (LOW-MEDIUM)

**Location:** `src/domain/services/universal-provider-registry.ts:208`

**Description:** `lastAccessedOn` updated on every `get()` call.

**Impact:**
- Causes write operations on read operations
- Unecessary I/O
- Performance degradation

---

### 4.4 Data Transformation Overhead (LOW-MEDIUM)

**Description:** Multiple transformation points for same data:
```
buildRequestPayload() → executeProviderRequest() → buildBody()
```

**Locations:**
- `src/domain/services/universal-adapter-factory.ts:65`
- `src/domain/services/universal-adapter-factory.ts:229`

---

## 5. Orphaned and Unclear Files

### 5.1 Orphaned Stores (See Section 2.3)

### 5.2 Stub Implementations (LOW)

**Files:**
- WebDAV adapter (exists but no consumers)
- S3 adapter (stubbed, not implemented)

---

### 5.3 Misplaced Root Files (LOW)

**Files in `src/` root:**
- `global-types.d.ts`
- `router.tsx`
- `server.ts`

**Description:** Should be organized into appropriate layers.

---

### 5.4 Unused Facades (LOW-MEDIUM)

**Location:** `src/lib/agent/facades/`

**Description:** Agent tool facades duplicate domain tool functionality:
- `note-tools.ts` (interface)
- `note-tools-impl.ts` (implementation)

**Issue:** Note CRUD operations duplicated in domain tools and agent facades

---

## 6. Data Flow Issues

### 6.1 Ambiguous Input Types (MEDIUM)

**Location:** `src/domain/services/agent-workspace-utils.ts:30`

**Description:** Functions expect both plain objects and class instances.

**Impact:** Unclear what format is expected, runtime type checking needed.

---

### 6.2 Missing Sync Handlers (MEDIUM)

**Incomplete Sync:**
- Canvas state sync incomplete
- Knowledge base sync not implemented
- Plugin state sync missing

---

## 7. Dexie/IndexedDB Issues

### 7.1 Scattered Schema Definitions (MEDIUM)

**Files:**
- `dexie-db.ts` (main)
- `dexie-db-class.ts`
- `dexie-db-core-types.ts`
- `dexie-db-ai-types.ts`
- `dexie-db-session-types.ts`
- `dexie-db-knowledge-types.ts`

**Description:** Schema definitions spread across 6+ files.

**Impact:** Maintenance difficulty, unclear ownership

---

### 7.2 Complex Migrations (HIGH)

**Description:** Database recovery system needed due to primary key changes. Schema v20 migration issues.

**Location:** `dexie-db.ts:29-30`

---

## 8. Adapter Pattern Issues

### 8.1 Abstraction Leaks (HIGH)

**Location:** `src/infrastructure/sync/adapters/base-adapter.ts`

**Description:** Base adapter has FSA-specific logic, violating LSP principle.

---

### 8.2 Complex Inheritance (MEDIUM)

**Location:** `src/lib/filesystem/unified-storage-adapter.ts`

**Description:** Extends LocalFSAdapter but also uses StorageAdapter - complex hierarchy.

---

## Summary by Severity

### HIGH (21 issues) - Immediate Attention Required
1. Circular service dependencies
2. Infrastructure → domain imports
3. Domain → infrastructure imports
4. God stores (8 files)
5. N+1 query patterns
6. Sync race conditions
7. Abstraction leaks in adapters

### MEDIUM (21 issues) - Plan to Address
1. Duplicate entity exports
2. Store duplication
3. Type definition duplication (8+ instances)
4. Type contract violations
5. Cross-store dependencies
6. Scattered schema definitions
7. Missing sync handlers

### LOW (6 issues) - Backlog
1. Orphaned stores
2. Misplaced root files
3. Unnecessary write operations
4. Stub implementations

---

## Recommendations Priority Matrix

| Priority | Issues | Estimated Effort |
|----------|--------|-----------------|
| P0 | Circular dependencies, layer violations | 2-3 days |
| P1 | God store breakdown, N+1 queries | 1 week |
| P2 | Type consolidation, store deduplication | 3-5 days |
| P3 | Orphan cleanup, documentation | 2-3 days |

---

## Related Artifacts

- [Architecture Conflict Analysis](./architecture-conflicts-2026-01-11.md)
- [Store Consolidation Analysis](./store-consolidation-analysis-2026-01-11.md)
- [Type Definition Audit](./type-definition-audit-2026-01-11.md)
- [Orphaned Files Analysis](./orphaned-files-analysis-2026-01-11.md)
- [Performance Issues Analysis](./performance-issues-analysis-2026-01-11.md)

---

*Audit conducted by: BMAD Codebase Analysis Agents*
*Report Version: 1.0*
