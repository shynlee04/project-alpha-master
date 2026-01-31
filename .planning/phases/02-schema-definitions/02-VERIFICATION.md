---
phase: 02-schema-definitions
verified: 2026-01-31T04:30:00Z
status: gaps_found
score: 5/8 must-haves verified
gaps:
  - truth: "All entities have single source of truth types"
    status: failed
    reason: "Two parallel type systems exist: @/domain/schemas (new Zod) and @/domain/entities (old interfaces)"
    artifacts:
      - path: "src/domain/entities/project.ts"
        issue: "Still exports Project with workspaceBindings - 9+ files import from here, not schemas"
      - path: "src/domain/schemas/project.schema.ts"
        issue: "Correct schema exists but NOT used by infrastructure"
    missing:
      - "Remove or update @/domain/entities/project.ts to re-export from @/domain/schemas"
      - "Update all 9+ infrastructure imports to use @/domain/schemas"
      - "OR create deprecation notices and migration path"

  - truth: "Legacy type aliases point to canonical schemas"
    status: failed
    reason: "All infrastructure imports @/domain/entities/project, NOT @/domain/schemas"
    artifacts:
      - path: "src/infrastructure/persistence/stores/project/project-types.ts"
        issue: "Imports from @/domain/entities/project, gets WorkspaceBindings"
      - path: "src/infrastructure/context/project-context.tsx"
        issue: "Imports Project from @/domain/entities/project"
    missing:
      - "@/domain/entities/project.ts should re-export from @/domain/schemas"
      - "All 9+ files need migration to @/domain/schemas imports"

  - truth: "No duplicate type definitions across codebase"
    status: failed
    reason: "3 Project type definitions, 6 FileMetadata type definitions found"
    artifacts:
      - path: "src/domain/schemas/project.schema.ts"
        issue: "Defines Project type"
      - path: "src/domain/entities/project.ts"
        issue: "Defines competing Project interface WITH workspaceBindings"
      - path: "src/infrastructure/persistence/stores/project/project-types.ts"
        issue: "Extends DomainProject with additional fields"
    missing:
      - "Consolidate to single Project type source"
      - "Remove 5 duplicate FileMetadata definitions"
      - "Create clear inheritance: Schema -> Entity -> Infrastructure"
---

# Phase 02: Schema Definitions Verification Report

**Phase Goal:** Define canonical TypeScript schemas for all core entities (Project, Thread, Note, File).
**Verified:** 2026-01-31T04:30:00Z
**Status:** gaps_found
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `src/domain/schemas/` contains canonical Zod schemas | ✓ VERIFIED | 5 files: project, file, thread, note, index |
| 2 | Project schema has NO workspaceBindings field | ✓ VERIFIED | `grep workspaceBindings src/domain/schemas/project.schema.ts` returns 0 |
| 3 | FileMetadata schema has NO workspaceId field | ✓ VERIFIED | `grep workspaceId src/domain/schemas/file.schema.ts` returns 0 |
| 4 | Thread schema uses projectId only | ✓ VERIFIED | Line 87: `projectId: z.string().uuid()` |
| 5 | Note schema uses projectId only | ✓ VERIFIED | Line 38: `projectId: z.string().uuid()` |
| 6 | All entities have single source of truth types | ✗ FAILED | Dual sources: @/domain/schemas vs @/domain/entities |
| 7 | Legacy type aliases point to canonical schemas | ✗ FAILED | 9+ files import @/domain/entities, 0 use @/domain/schemas |
| 8 | No duplicate type definitions across codebase | ✗ FAILED | 3 Project types, 6 FileMetadata types |

**Score:** 5/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/domain/schemas/project.schema.ts` | Canonical Project Zod schema | ✓ SUBSTANTIVE | 161 lines, exports ProjectSchema, Project type |
| `src/domain/schemas/file.schema.ts` | Canonical File Zod schema | ✓ SUBSTANTIVE | 156 lines, exports FileMetadataSchema |
| `src/domain/schemas/thread.schema.ts` | Canonical Thread/Message schema | ✓ SUBSTANTIVE | 171 lines, exports ThreadSchema, ThreadMessageSchema |
| `src/domain/schemas/note.schema.ts` | Canonical Note schema | ✓ SUBSTANTIVE | 133 lines, exports NoteSchema |
| `src/domain/schemas/index.ts` | Barrel exports | ✓ SUBSTANTIVE | 99 lines, exports all 4 entity types |

All artifacts exist and are substantive (not stubs).

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/domain/schemas/*.ts` | `z.infer` | Zod type inference | ✓ WIRED | All types derived from schemas |
| `src/domain/schemas/index.ts` | `*.schema.ts` | Barrel re-export | ✓ WIRED | All schemas exported |
| `@/domain/schemas` | Infrastructure | Import usage | ✗ NOT_WIRED | 0 infrastructure files import from @/domain/schemas |
| `@/domain/entities/project.ts` | Infrastructure | Import usage | ✓ WIRED (wrong) | 9+ files still use old entities |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| SCHEMA-01: Project entity | ⚠️ PARTIAL | Schema exists but not used by infrastructure |
| SCHEMA-02: Thread entity | ✓ SATISFIED | Schema created, uses projectId only |
| SCHEMA-03: Note entity | ✓ SATISFIED | Schema created, uses projectId only |
| SCHEMA-04: File entity | ⚠️ PARTIAL | Schema exists but 6 competing definitions remain |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/domain/entities/project.ts` | 7-16 | Competing type definitions | 🛑 BLOCKER | Creates dual source of truth |
| `src/lib/watcher/change-detector.ts` | - | Duplicate FileMetadata | ⚠️ WARNING | Type fragmentation |
| `src/domain/services/file-crud/file-crud-types.ts` | - | Duplicate FileMetadata | ⚠️ WARNING | Type fragmentation |
| `src/domain/interfaces/storage-adapter.interface.ts` | - | Duplicate FileMetadata | ⚠️ WARNING | Type fragmentation |
| `src/infrastructure/sync/workspace-services/file-sync-service.ts` | - | Duplicate FileMetadata | ⚠️ WARNING | Type fragmentation |
| `src/presentation/components/ide/hooks/useLazyFileContent.ts` | - | Duplicate FileMetadata | ⚠️ WARNING | Type fragmentation |

### Human Verification Required

None - all checks were programmatic.

### TypeScript Status

**Current:** 4 errors (all pre-existing in `src/_prototype/governance-test/test-violation.ts`)
**Schema-related:** 0 errors

The schema files compile cleanly. The 4 errors are unrelated prototype test violations.

---

## Gaps Summary

The Phase 02 PLANs were executed correctly - the schema FILES were created with the correct structure:
- workspaceBindings removed from ProjectSchema
- workspaceId removed from FileMetadata/FileSyncStatus
- Thread and Note schemas created with projectId-only model
- Barrel exports updated

**HOWEVER**, the ROADMAP Success Criteria were NOT fully achieved:

### Gap 1: Dual Source of Truth
`@/domain/entities/project.ts` still exports a `Project` interface WITH `workspaceBindings: WorkspaceBindings`. This is what the infrastructure layer actually uses. The new `@/domain/schemas/project.schema.ts` (without workspaceBindings) is NOT used by any file outside the schemas directory.

**Evidence:**
```
grep -rn "from '@/domain/entities/project'" src/ | wc -l
# Returns: 9 files
grep -rn "from '@/domain/schemas'" src/ | wc -l  
# Returns: 0 files (only self-reference)
```

### Gap 2: No Migration Path
There is no re-export from `@/domain/entities/project.ts` to the new schemas. The old interfaces and new Zod schemas exist as parallel, incompatible systems.

### Gap 3: FileMetadata Fragmentation
6 different `FileMetadata` interface/type definitions exist across the codebase with different shapes:
1. `src/domain/schemas/file.schema.ts` - new canonical (no workspaceId)
2. `src/lib/watcher/change-detector.ts` - different shape
3. `src/infrastructure/persistence/dexie-db-session-types.ts` - FileMetadataRecord
4. `src/infrastructure/sync/workspace-services/file-sync-service.ts` - different shape
5. `src/domain/services/file-crud/file-crud-types.ts` - different shape
6. `src/presentation/components/ide/hooks/useLazyFileContent.ts` - different shape

---

## Recommendation

The schema FILES are correct. The gap is in WIRING - the infrastructure layer needs to:

1. **Option A (Preferred):** Update `@/domain/entities/project.ts` to re-export from `@/domain/schemas/project.schema.ts`
2. **Option B:** Create a Phase 02.5 migration plan to update all 9+ import sites

This should be addressed before Phase 04 (State Layer Enforcement) since enforcement depends on consistent types.

---

*Verified: 2026-01-31T04:30:00Z*
*Verifier: Claude (gsd-verifier)*
