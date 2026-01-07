# 🚨 CORRECT-COURSE: Story 38-04

**Timestamp**: 2026-01-08T14:50:00+07:00
**Trigger**: Infrastructure→lib import violations scan
**Severity**: HIGH - EPIC-38 scope significantly underestimated

---

## Issue Discovery

Story 38-04 research discovered **106 infrastructure→lib import violations**, which is **3x more** than the expected 32 violations documented in epics.md.

### Violation Breakdown

| Category | Count | Import Path | Notes |
|-----------|--------|-------------|-------|
| **RAG types** | 35 | `lib/rag/types` | Large domain, needs domain entity extraction |
| **Knowledge types** | 20 | `lib/knowledge/*` | Study materials, synthesis types |
| **Study types** | 17 | `lib/study/*` | SRS, flashcard, session types |
| **Agent providers** | 8 | `lib/agent/providers` | Credential vault, model registry |
| **Workflow types** | 4 | `lib/workflow/builder` | Workflow persistence |
| **Permission lifecycle** | 11 | `lib/filesystem/permission-lifecycle` | Known, documented for future move |
| **Other** | 1 | `lib/watcher` | File watcher types |

**Total**: 106 violations (vs 32 expected)

---

## Root Cause Analysis

1. **EPIC-38 Scope Underestimated**: Original investigation missed imports in:
   - `src/infrastructure/persistence/stores/study/` (7 files)
   - `src/infrastructure/persistence/stores/synthesis-store.ts` (1 file, 4 violations)
   - `src/infrastructure/persistence/stores/providers/` (3 files, 4 violations)
   - `src/infrastructure/persistence/rag-store-types.ts` (1 file, 8 violations)
   - `src/infrastructure/persistence/dexie-db-*-types.ts` (3 files, 3 violations)

2. **Domain Types Scattered in lib**: The `lib/` layer contains domain types that should be in `domain/`:
   - RAG domain: IndexMetadata, SearchResult, ChunkMetadata, etc.
   - Study domain: SRSData, Flashcard, StudySession, etc.
   - Knowledge domain: SourceDocument, SynthesisResult, etc.
   - Agent domain: Provider, Model, Credential types

3. **No Domain Layer**: The project lacks a proper `domain/` layer. Types are mixed between:
   - `lib/rag/types` → Should be `domain/rag/` or `domain/entities/rag/`
   - `lib/study/*` → Should be `domain/study/` or `domain/entities/study/`
   - `lib/knowledge/*` → Should be `domain/knowledge/`

---

## Options

### Option A: Proceed with 38-04 (Fix Imports In-Place)
**Approach**: Update all 106 imports to their current locations.

**Pros**:
- Can complete story 38-04 as written
- Quick fix for import direction

**Cons**:
- Doesn't solve root problem (types in wrong layer)
- Creates technical debt
- Will need rework when domain layer is added

**Effort**: 4-6 hours (vs 2 estimated)

### Option B: Create Domain Layer First (RECOMMENDED)
**Approach**:
1. Create `src/domain/entities/` structure
2. Move domain types from lib/ to domain/
3. Update infrastructure to import from domain/
4. Complete 38-04 with proper architecture

**Pros**:
- Fixes root cause
- Establishes proper domain layer
- Aligns with Clean Architecture
- Future-proof for stories 38-05 through 38-08

**Cons**:
- Larger scope change
- Requires multiple stories
- EPIC-38 needs restructuring

**Effort**: 8-12 hours across 3-4 stories

### Option C: Defer Domain Layer, Focus on Critical Path
**Approach**:
1. Fix only the agent provider imports (8 violations) - critical path
2. Document RAG/Study/Knowledge types as "technical debt for future epic"
3. Complete EPIC-38 with current scope

**Pros**:
- Unblocks critical path (agent providers)
- Manages scope realistically

**Cons**:
- Leaves significant violations unfixed
- Doesn't achieve "100% import compliance" goal

**Effort**: 2-3 hours

---

## Recommendation

**Proceed with Option B - Create Domain Layer First**

### Rationale

1. **Story 38-05 through 38-08** already exist in EPIC-38 to create domain entities:
   - 38-05: Create domain/entities/Project.ts
   - 38-06: Create domain/entities/Workspace.ts and Agent.ts
   - 38-07: Update infrastructure to import from domain entities
   - 38-08: Update application layer to use domain entities

2. **These stories need to be expanded** to cover ALL domain types, not just Project/Workspace/Agent:
   - Add: 38-05b: Create domain/entities/rag.ts (RAG domain types)
   - Add: 38-05c: Create domain/entities/study.ts (Study domain types)
   - Add: 38-05d: Create domain/entities/knowledge.ts (Knowledge domain types)

3. **Revised sequence**:
   ```
   38-04: Update 32 infrastructure→lib imports (defer until domain types ready)
   38-05: Create domain/entities/Project.ts
   38-05b: Create domain/entities/rag.ts (NEW)
   38-05c: Create domain/entities/study.ts (NEW)
   38-05d: Create domain/entities/knowledge.ts (NEW)
   38-06: Create domain/entities/Workspace.ts and Agent.ts
   38-07: Update infrastructure to import from domain entities
   38-08: Update application layer to use domain entities
   ```

---

## Immediate Actions

1. **Pause story 38-04** - Implementation deferred until domain types are created
2. **Update EPIC-38** in epics.md with revised story breakdown
3. **Create stories 38-05b, 38-05c, 38-05d** for missing domain types
4. **Proceed with story 38-05** (Create domain/entities/Project.ts) as originally planned
5. **Revisit 38-04** after domain types are in place

---

## Impact Assessment

### Timeline Impact
- **Original**: EPIC-38 ~33 hours
- **Revised**: EPIC-38 ~45-50 hours (+12-17 hours for additional domain types)

### Risk Assessment
- **Low Risk**: Domain entity extraction is additive, no breaking changes
- **Medium Risk**: More work than planned, but correct architecture

### Dependencies Updated
- Stories 38-05b, 38-05c, 38-05d must complete before 38-04
- Story 38-04 becomes dependent on domain layer establishment

---

## Sign-off

**Triggered By**: @bmad-core-bmad-master
**Severity**: HIGH - Course correction required
**Status**: AWAITING DECISION

**Options**:
- [ ] Proceed with Option A (Fix imports in-place, 4-6h)
- [ ] Proceed with Option B (Create domain layer first, 8-12h) ← **RECOMMENDED**
- [ ] Proceed with Option C (Defer domain layer, 2-3h)
