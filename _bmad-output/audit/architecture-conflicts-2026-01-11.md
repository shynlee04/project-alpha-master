# Architecture Conflicts Analysis
**Date:** 2026-01-11
**Category:** Architecture - Conflicts, Inversion, Logic Gaps
**Status:** Complete

---

## Executive Summary

This document details architectural conflicts found in the codebase, including:
- Dependency inversion violations (infrastructure depending on domain)
- Circular dependencies between services
- Layer boundary violations
- Logic conflicts and data flow issues

**Total Architecture Conflicts:** 12
- **High Severity:** 8
- **Medium Severity:** 3
- **Low Severity:** 1

---

## 1. Circular Dependencies

### 1.1 AgentOrchestrationService ↔ WorkspaceTransitionService

**Type:** Direct Circular Import

**Files:**
```
src/domain/services/agent-orchestration-service.ts:11
src/domain/services/workspace-transition-service.ts:11
```

**Dependency Chain:**
```
AgentOrchestrationService
    ↓ imports
WorkspaceTransitionService
    ↓ imports
AgentOrchestrationService  ← CIRCULAR
```

**Code Evidence:**
```typescript
// agent-orchestration-service.ts
import { WorkspaceTransitionService } from './workspace-transition-service';

// workspace-transition-service.ts
import { AgentOrchestrationService } from './agent-orchestration-service';
```

**Impact Assessment:**
- **Risk:** HIGH - Can cause runtime initialization failures
- **Maintainability:** LOW - Changes to one service require coordinated changes
- **Testability:** LOW - Cannot test services in isolation

**Remediation Strategy:**
1. Extract shared `ValidationResult` interface to `src/domain/types/common-types.ts`
2. Create `WorkspaceAgentSelector` utility class for shared logic
3. Refactor to use dependency injection with interfaces

---

### 1.2 Infrastructure Layer → Domain Services

**Type:** Wrong Direction Dependency

**File:** `src/infrastructure/persistence/stores/index.ts:190-195`

**Dependency Chain:**
```
Infrastructure Layer (stores/index.ts)
    ↓ imports (WRONG DIRECTION)
Domain Layer (services/*)
```

**Code Evidence:**
```typescript
// infrastructure/persistence/stores/index.ts
export {
  isAgentAvailableIn,
  isAgentDefaultFor,
  getAgentsForWorkspace,
  getDefaultAgentForWorkspace,
} from '@/domain/services';
```

**Impact Assessment:**
- **Architecture Principle Violated:** Dependency Inversion Principle
- **Risk:** HIGH - Domain layer becomes coupled to infrastructure
- **Reusability:** LOW - Domain cannot be reused without infrastructure

**Remediation Strategy:**
1. Remove these exports from infrastructure index
2. Create proper domain service barrel exports
3. Update all consumers to import from domain layer directly

---

### 1.3 Domain Service → Infrastructure (Leaky Abstraction)

**Type:** Layer Violation

**File:** `src/domain/services/universal-adapter-factory.ts:313`

**Dependency Chain:**
```
Domain Layer (universal-adapter-factory.ts)
    ↓ imports (WRONG)
Infrastructure Layer (lib/agent/providers/credential-vault.ts)
```

**Code Evidence:**
```typescript
// domain/services/universal-adapter-factory.ts:313
import { getCredential } from '@/lib/agent/providers/credential-vault';
```

**Impact Assessment:**
- **Architecture Principle Violated:** Clean Architecture / Onion Architecture
- **Risk:** HIGH - Domain cannot be used without this specific infrastructure
- **Testability:** LOW - Cannot test domain logic without mocking infrastructure

**Remediation Strategy:**
1. Create `ICredentialProvider` interface in domain layer
2. Move credential vault to infrastructure layer
3. Inject credential provider into factory

---

## 2. Layer Boundary Violations

### 2.1 Business Logic in Lib Directory

**Type:** Misplaced Responsibility

**Locations:**
- `src/lib/notes/note-store.ts` - Contains note business logic
- `src/domain/tools/note/` - Also contains note business logic

**Conflict:**
```
Domain Layer: src/domain/tools/note/
    ↓ SAME RESPONSIBILITY
Lib Layer: src/lib/notes/
```

**Impact Assessment:**
- **Single Responsibility Principle:** VIOLATED
- **Maintainability:** LOW - Unclear where to make changes
- **Consistency:** RISK - Logic may diverge

**Analysis:**
Both locations implement:
- Note creation
- Note updates
- Note deletion
- Note queries

**Remediation Strategy:**
1. Audit differences between implementations
2. Consolidate to domain layer only
3. Remove lib layer implementation
4. Update all imports

---

### 2.2 Misplaced Types

**Type:** File Organization Violation

**File:** `src/domain/services/project-registry-types.ts`

**Issue:** Type definitions file in services directory

**Should be:** `src/domain/types/project-registry-types.ts`

**Impact Assessment:**
- **Severity:** LOW
- **Discoverability:** Reduced

**Remediation Strategy:**
1. Move file to types directory
2. Update all imports

---

## 3. Duplicate Entity Exports

### 3.1 Core Index Redundancy

**Type:** Redundant Abstraction Layer

**Files:**
- `src/core/entities/index.ts` (36 lines re-exports)
- `src/core/index.ts` (25 lines re-exports)

**Dependency Chain:**
```
src/core/entities/index.ts → re-exports → src/domain/entities/*
src/core/index.ts → re-exports → src/core/entities/*
```

**Impact Assessment:**
- **Confusion:** HIGH - Unclear canonical import path
- **Maintenance:** MEDIUM - Changes must be mirrored
- **Legacy Debt:** Entire `src/core/` is compatibility layer

**Remediation Strategy:**
1. Audit all imports of `@/core/*`
2. Migrate to direct domain imports
3. Add deprecation warnings
4. Eventually remove `src/core/` entirely

---

## 4. Store Architecture Conflicts

### 4.1 Scattered Store Implementations

**Type:** Inconsistent Patterns

**Locations:**
1. `src/infrastructure/persistence/stores/` - Zustand slice pattern (primary)
2. `src/lib/snippets/snippet-store` - Custom Zustand
3. `src/lib/workspace/project-store` - Custom Zustand
4. `src/lib/filesystem/file-snapshot-store` - Custom Zustand

**Conflict:**
Same concern (state management) implemented in different ways across codebase.

**Impact Assessment:**
- **Consistency:** LOW
- **Maintainability:** MEDIUM
- **Onboarding:** Confusing for new developers

**Remediation Strategy:**
1. Standardize on infrastructure layer stores
2. Migrate lib stores to proper location
3. Document Zustand slice pattern

---

### 4.2 Store Duplication

**Type:** Overlapping Responsibility

**Conversation Stores:**
- `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`
- `src/infrastructure/persistence/stores/conversation/conversation-store.ts`
- `src/infrastructure/persistence/stores/chat/unified-chat-store.ts`

**Workspace Stores:**
- `src/infrastructure/persistence/stores/workspace/workspace-store.ts`
- `src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts`
- `src/lib/workspace/unified-workspace-context.tsx`

**Impact Assessment:**
- **Boundaries:** Unclear
- **State Ownership:** Confusing
- **Changes:** Risk of breaking something unexpected

**Remediation Strategy:**
1. Audit each store's actual responsibilities
2. Merge or clearly separate concerns
3. Document each store's purpose

---

## 5. Cross-Store Dependencies

### 5.1 Tight Coupling via Cornerstone Stores

**File:** `src/infrastructure/persistence/stores/workspace/useCornerstoneStores.ts`

**Dependency Graph:**
```
useCornerstoneStores
    ├─ useWorkspaceStore
    ├─ useAppStore
    ├─ useConversationStore
    ├─ useRAGStore
    └─ useAgentSelectionStore
```

**Impact Assessment:**
- **Coupling:** HIGH
- **Testability:** LOW
- **Change Risk:** HIGH

**Remediation Strategy:**
1. Consider event-based communication
2. Implement proper dependency injection
3. Reduce cross-store dependencies

---

## 6. Data Flow Conflicts

### 6.1 Ambiguous Input Types

**File:** `src/domain/services/agent-workspace-utils.ts:30`

**Issue:** Functions expect both plain objects AND class instances

**Impact Assessment:**
- **Type Safety:** LOW
- **Runtime Errors:** RISK

**Remediation Strategy:**
1. Standardize on one input format
2. Add proper type guards
3. Document expected format

---

### 6.2 Inconsistent Sync Handlers

**Missing Sync:**
- Canvas state sync incomplete
- Knowledge base sync not implemented
- Plugin state sync missing

**Impact Assessment:**
- **Data Consistency:** RISK
- **User Experience:** Potential data loss

---

## Conflict Severity Matrix

| Conflict | Type | Severity | Risk | Complexity |
|----------|------|----------|------|------------|
| Circular service dependencies | Circular | HIGH | Runtime failure | Medium |
| Infra → Domain imports | Wrong direction | HIGH | Architecture debt | Low |
| Domain → Infra imports | Leaky abstraction | HIGH | Coupling | Medium |
| Business logic duplication | Boundary | HIGH | Divergence | High |
| Store duplication | Overlap | MEDIUM | Confusion | Medium |
| Core entity exports | Redundancy | MEDIUM | Maintenance | Low |
| Misplaced types | Organization | LOW | Discoverability | Low |
| Cross-store coupling | Coupling | MEDIUM | Testability | High |
| Ambiguous input types | Type safety | MEDIUM | Runtime errors | Low |
| Missing sync handlers | Completeness | MEDIUM | Data loss | High |

---

## Remediation Priority Order

### Phase 1: Critical (Breaks Architecture)
1. Remove circular service dependencies
2. Fix infra → domain imports
3. Fix domain → infra imports

### Phase 2: High (Maintainability)
4. Consolidate business logic (notes)
5. Clarify store boundaries
6. Reduce cross-store coupling

### Phase 3: Medium (Cleanup)
7. Remove core entity export redundancy
8. Fix ambiguous input types
9. Complete sync handlers

---

## Related Artifacts

- [Comprehensive Codebase Audit](./comprehensive-codebase-audit-2026-01-11.md)
- [Store Consolidation Analysis](./store-consolidation-analysis-2026-01-11.md)
- [Data Flow Analysis](./data-flow-analysis-2026-01-11.md)

---

*Analysis conducted by: BMAD Architecture Analysis Agent*
*Report Version: 1.0*
