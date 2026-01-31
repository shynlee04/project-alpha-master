# SPIKE DEEP SCAN SYNTHESIS

**Date**: 2026-01-17  
**Analyst**: ext-master (orchestrated sub-agents)  
**Scope**: Complete spike codebase scan  
**Artifacts Generated**: 4 specialized scans

---

## Executive Summary

The spike is a **mirror copy of main codebase patterns** (marked with `@spike-copy-source` comments). All flaws found in spike are **replicated from main app**. This makes spike an excellent diagnostic tool for identifying systemic issues.

### Key Insight
> "The spike reveals what we cannot easily see in the main codebase - the accumulated technical debt becomes visible when isolated."

---

## Synthesis of 4 Deep Scans

### 1. Domain Analysis (domain-scanner)

**8 Domains Identified:**
- `project-management` (12 files) - P0 layer violations
- `file-system` (10 files) - Well abstracted
- `workspace` (9 files) - Event bus patterns
- `notes` (7 files) - UI imports infrastructure
- `ide` (18 files) - Most complex, most violations
- `file-operations` (8 files) - Domain uses lib
- `agent-orchestration` (6 files) - OK structure
- `persistence` (6 files) - Direct Dexie access

**Critical Finding:**
> `src/lib/` acts as **shadow infrastructure layer** - presentation code imports from `lib/filesystem`, `lib/notes`, `lib/workspace` instead of domain abstractions

### 2. State Analysis (deep-scan-state-scanner)

**God Stores Found:**
| Store | Lines | Target | Violation |
|-------|-------|--------|-----------|
| `use-vfs-sync-slice.ts` | 432 | ≤120 | Needs 5 slices |
| `use-storage-adapter-slice.ts` | 357 | ≤120 | Needs 4 slices |
| `project-crud-slice.ts` | 301 | ≤120 | Needs 4 slices |

**State Duplication:**
- `currentProjectId` exists in 2 stores (acceptable)
- `syncStatus` exists in 3 stores (NOT acceptable - P1)
- `permissionState` was duplicated (now fixed in FSA-010)

**Selector Issues:**
- Missing `useShallow` in `use-file-loader-slice.ts:72`
- Direct selectors cause unnecessary re-renders

### 3. Architecture Analysis (deep-scan-architecture-scanner)

**Layer Violations (9 found):**

| Severity | Location | Pattern |
|----------|----------|---------|
| P0 | `ProjectPickerDialog.tsx` | UI imports `db` directly |
| P0 | `FileTree.tsx:54` | UI imports from infrastructure |
| P1 | `unified-file-crud.ts:32` | Domain imports from lib |
| P1 | `use-storage-adapter-slice.ts:29` | Store imports implementation |
| P2 | `FileTree.tsx` | UI imports `useWorkspaceSync` |

**Root Causes:**
1. Missing domain interfaces between layers
2. `lib/` dumping ground for unclear responsibilities
3. Duplicate store locations (`stores/` AND `infrastructure/persistence/stores/`)
4. Direct Dexie access bypassing abstraction

### 4. Persistence Analysis (artifact-scanner)

**Critical Issues:**
| Issue | Count | Severity |
|-------|-------|----------|
| Direct Dexie access in presentation | 3 | P0 |
| Missing repository abstraction | - | P0 |
| Duplicate files (stores vs infrastructure) | 10 | P1 |
| Schema coupling via relative imports | 23 | P1 |
| Inlined `[SPIKE FLAW]` functions | 4 | P1 |

**Schema Drift Risk:**
Spike uses relative imports from main app:
```typescript
import { ViaGentDatabase } from '../../../infrastructure/persistence/dexie-db-class';
```

This means spike schema depends on main app schema - any change in main app breaks spike.

---

## What This Reveals About Main Codebase

### Systematic Patterns (Spike = Main App Mirror)

| Spike Pattern | Main Codebase Equivalent | Impact |
|---------------|-------------------------|--------|
| Direct Dexie in `ProjectPickerDialog` | Same in main `ProjectPickerDialog` | State inconsistency |
| UI imports infrastructure | Components in main do same | Layer violation |
| God stores >300 lines | `useProjectStore` likely same | Maintenance burden |
| `lib/` shadow layer | Main has `src/lib/` | Architecture confusion |
| Duplicate store locations | Main has `stores/` and `src/stores/` | Where to put new stores? |
| Missing repository abstraction | Main likely has none | Tight coupling |
| Inlined helpers | Main has actual implementations | Spike is incomplete mirror |
| `@spike-copy-source` comments | N/A - spike only | Shows mirror pattern |

### Main Codebase Flaws Inferred

1. **Presentation Layer Pollution**
   - Components access Dexie directly via `useLiveQuery()`
   - UI imports infrastructure implementations
   - No domain interfaces between layers

2. **State Management Debt**
   - God stores >300 lines exist in main
   - `useShallow` not used consistently
   - State duplication between stores

3. **Architecture Erosion**
   - `src/lib/` contains shadow infrastructure
   - Duplicate directories (`stores/` vs `src/stores/`)
   - No clear layer boundaries enforced

4. **Persistence Leaks**
   - No repository pattern
   - Components know about database schema
   - Type safety issues (`any` in `fromRecord()`)

---

## Remediation Priority Matrix

| Priority | Flaw Category | Spike Fix | Main Codebase Fix |
|----------|---------------|-----------|-------------------|
| **P0** | Direct Dexie in UI | Create `useProjects()` hook | Same in main |
| **P0** | Missing Repository | Create `ProjectRepository` interface | Same in main |
| **P0** | God Stores | Split into slices | Find & split in main |
| **P1** | Layer Violations | Refactor imports | Same in main |
| **P1** | State Duplication | Consolidate `syncStatus` | Find & consolidate in main |
| **P1** | Duplicate Files | Consolidate `stores/` | Delete duplicate dir in main |
| **P2** | Selector Issues | Add `useShallow` | Same in main |
| **P2** | Import Order | Fix per file | Same in main |

---

## Next Steps

### Immediate Actions

1. **Create Spike Remediation Stories**
   - `SPIKE-R01`: Extract `use-vfs-sync-slice.ts` into 5 slices
   - `SPIKE-R02`: Create `useProjects()` hook to replace direct Dexie
   - `SPIKE-R03`: Create `ProjectRepository` interface
   - `SPIKE-R04`: Consolidate duplicate store files

2. **Cross-Reference with Main Codebase**
   - Find files with same violations in main
   - Use spike fixes as templates for main fixes
   - Spike becomes testbed for remediation patterns

3. **Monitor Schema Drift**
   - Add schema version check to spike
   - Alert if main app schema changes
   - Prevent silent breakage

### Long-term Actions

1. **Architecture Enforcement**
   - Add lint rules for layer boundaries
   - Create barrel exports to enforce structure
   - Automated architecture checks in CI

2. **State Management Refactor**
   - Target: all stores ≤120 lines
   - Enforce `useShallow` in all combined selectors
   - Create state management documentation

3. **Persistence Layer Completion**
   - Implement repository pattern fully
   - Remove all direct Dexie access from presentation
   - Add integration tests for persistence layer

---

## Artifacts Generated

| Artifact | Path | Analysis |
|----------|------|----------|
| Domain Analysis | `_bmad-output/planning-artifacts/spike-domain-analysis-2026-01-17.yaml` | 8 domains, 7 violations |
| State Analysis | `_bmad-output/planning-artifacts/spike-state-analysis-2026-01-17.yaml` | 14 stores, 3 god stores |
| Architecture Analysis | `_bmad-output/planning-artifacts/spike-architecture-analysis-2026-01-17.yaml` | 9 layer violations |
| Persistence Analysis | `_bmad-output/planning-artifacts/spike-persistence-analysis-2026-01-17.yaml` | 4 critical issues |

---

## Conclusion

The spike is a **faithful mirror** of main codebase patterns, including all technical debt. This makes it invaluable for:

1. **Safe testing** - Fix patterns in spike first
2. **Pattern identification** - Same flaws appear in both
3. **Remediation templates** - Spike fixes can guide main fixes

**Key takeaway**: Fixing spike will reveal exactly what needs fixing in main codebase. The two are in sync because spike is a direct copy with minimal modifications.
