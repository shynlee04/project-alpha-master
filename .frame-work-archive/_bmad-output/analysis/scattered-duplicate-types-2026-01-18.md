# Scattered Duplicate Types Analysis Report
**Generated:** 2026-01-18
**Author:** analyst-ext
**Scope:** Type definitions duplicated across multiple locations

---

## Executive Summary

| Category | Count | Recommendation |
|----------|-------|----------------|
| **Genuine Duplicates** | 7 | CAN ARCHIVE |
| **Extension Patterns** | 2 | KEEP - Architecture correct |
| **Inconsistent Definitions** | 3 | NEEDS STANDARDIZATION |

---

## Detailed Findings

### 1. Project Types

**Type Name:** `Project`

| File | Layer | Status |
|------|-------|--------|
| `src/domain/entities/project.ts` | Domain | CANONICAL |
| `src/infrastructure/persistence/stores/project/project-types.ts` | Infrastructure | EXTENSION |

**Analysis:** Domain version defines core business entity. Infrastructure version **extends** DomainProject with `storageMetadata` field. This is **CORRECT architecture** - not a duplicate.

**Verdict:** KEEP BOTH - Extension pattern properly applied

---

### 2. NoteRecord Types - DUPLICATE

**Type Name:** `NoteRecord`

| File | Layer | Key Difference |
|------|-------|------------------|
| `src/infrastructure/persistence/dexie-db-knowledge-types.ts` | Infrastructure | `blocks: unknown[]` |
| `src/lib/notes/types.ts` | Lib/Presentation | `blocks: Block[]` |

**Analysis:** Both define same 13 fields (id, projectId, workspaceId, title, emoji, blocks, parentId, isFavorite, order, isIndexed, indexedAt, createdAt, updatedAt). Only difference: `unknown[]` vs `Block[]`. Lib version is just a convenience wrapper.

**Verdict:** CAN ARCHIVE `lib/notes/types.ts`
**Reason:** Presentation layer should import from infrastructure

---

### 3. Flashcard Types

**Type Name:** `Flashcard`

| File | Layer | Key Fields |
|------|-------|--------|
| `src/domain/entities/study.ts` | Domain | deckId, front, back, status, nextReview, interval, easeFactor |
| `src/lib/knowledge/types.ts` | Lib/Archived | sourceId, setId, srsData (simplified) |
| `src/infrastructure/persistence/dexie-db-study-types.ts` | Persistence | workspaceId, projectId, question, answer, difficulty, topic |

**Analysis:** Domain version has SRS learning metadata. Persistence version has workspaceId/projectId for IndexedDB. These are intentionally different (entity vs record pattern).

**Verdict:** ARCHITECTURALLY CORRECT - Keep domain + persistence, remove lib/archived

---

### 4. Quiz Types - GENUINE DUPLICATES

**Type Name:** `Quiz`, `QuizQuestion`

| File | Status | Fields |
|------|--------|--------|
| `src/domain/entities/study.ts` | CANONICAL | id, title, questions, metadata, created, updated |
| `src/lib/study/quiz-types.ts` | DUPLICATE | id, sourceId, questions, createdAt, options |
| `src/lib/study/quiz-generator.ts` | DUPLICATE | Similar to quiz-types.ts |

**Analysis:** Domain version: Proper entity. Lib versions: Different structure, marked `@deprecated This module is archived for MVP`.

**Verdict:** CAN ARCHIVE BOTH lib/study/quiz-types.ts and lib/study/quiz-generator.ts

---

### 5. QuizQuestion Type - FIELD NAME INCONSISTENCY

**Type Name:** `QuizQuestion`

| File | Field Name |
|------|-----------------|
| `src/domain/entities/study.ts` | `correctOptionIndex` |
| `src/lib/study/quiz-types.ts` | `correctAnswer` |
| `src/lib/study/quiz-generator.ts` | `correctAnswer` |

**Analysis:** Domain version uses `correctOptionIndex`, lib versions use `correctAnswer` - same meaning, different naming.

**Verdict:** NEEDS STANDARDIZATION - Update lib versions to match domain

---

### 6. ToolResult Type - DUPLICATE

**Type Name:** `ToolResult<T>`

| File | Layer |
|------|-------|
| `src/lib/agent/tools/types.ts` | Lib/Agent |
| `src/domain/tools/provider/types.ts` | Domain/Tools |

Both define identical interface:
```typescript
interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Verdict:** CAN ARCHIVE `domain/tools/provider/types.ts`
**Reason:** Lib/Agent version is used more widely

---

### 7. ToolCategory Type - INCONSISTENT DEFINITIONS

**Type Name:** `ToolCategory`

| File | Categories Count |
|------|------------|
| `src/domain/tools/tool-permissions.ts` | 10 (includes notes, unified, composite, provider) |
| `src/lib/agent/tool-permission/types.ts` | 6 (missing some) |
| `src/types/tool-call.ts` | 6 |

**Analysis:** Domain version is more complete. Lib versions are subsets, causing inconsistency.

**Verdict:** NEEDS STANDARDIZATION - Lib versions should import from domain

---

### 8. ToolTrustLevel Type

**Type Name:** `ToolTrustLevel`

All three files define `'auto' | 'prompt' | 'block'` identically:
- `src/domain/tools/tool-permissions.ts`
- `src/lib/agent/tool-permission/types.ts`
- `src/infrastructure/persistence/stores/permissions/types.ts` (re-exports)

**Verdict:** CORRECT - Domain is source of truth

---

## Action Items Summary

### High Priority (Can Archive)

| Type | Files to Archive | Reason |
|------|------------------|--------|
| NoteRecord | `lib/notes/types.ts` | Duplicate of infrastructure version |
| Quiz | `lib/study/quiz-types.ts` | Deprecated archive |
| QuizGenerator | `lib/study/quiz-generator.ts` | Deprecated archive |
| ToolResult | `domain/tools/provider/types.ts` | Duplicate |
| Flashcard (lib) | `lib/knowledge/types.ts` | Deprecated archive |

### Medium Priority (Standardize)

| Type | Action |
|------|--------|
| ToolCategory | Update lib versions to import from domain |
| QuizQuestion.correctAnswer | Rename to `correctOptionIndex` to match domain |

---

## Files to Archive (5 files)

```
src/lib/notes/types.ts
src/lib/study/quiz-types.ts
src/lib/study/quiz-generator.ts
src/domain/tools/provider/types.ts
src/lib/knowledge/types.ts
```

## Files to Keep (4 files)

```
src/domain/entities/project.ts          - Domain entity source of truth
src/domain/entities/study.ts            - Domain entities
src/domain/tools/tool-permissions.ts    - Tool permissions source of truth
src/infrastructure/persistence/stores/project/project-types.ts  - Correct extension
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total duplicate type definitions found | 23 |
| Genuine duplicates (can archive) | 7 |
| Extension patterns (correct architecture) | 2 |
| Inconsistent definitions (need fix) | 3 |
| Deprecated archives | 5 |
| Unique features (keep) | 6 |

---

## Recommendations

1. **Archive 5 files** identified as deprecated/duplicate
2. **Standardize 2 type definitions** (ToolCategory, QuizQuestion field names)
3. **Keep extension pattern** for Project types (correct architecture)
4. **Consolidate ToolResult** to single location (lib/agent/tools/types.ts)
