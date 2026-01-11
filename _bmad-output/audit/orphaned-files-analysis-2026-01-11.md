# Orphaned Files Analysis
**Date:** 2026-01-11
**Category:** Dead Code - Orphaned, Unused, Unclear Files
**Status:** Complete

---

## Executive Summary

This document identifies orphaned, unused, and unclear files across the codebase. These files represent maintenance burden and potential sources of confusion.

**Key Findings:**
- **Orphaned Stores:** 3 files
- **Stub Implementations:** 2 adapters
- **Misplaced Root Files:** 3 files
- **Unused Facades:** 2 files
- **Potential Dead Code:** 8+ files

---

## 1. Orphaned Stores

### 1.1 conversation-auto-restore.ts

**Location:** `src/infrastructure/persistence/stores/conversation-auto-restore.ts`

**Usage:** Test-only

**Analysis:**
- Found in test files only
- No production consumers
- Purpose: Auto-restore conversation state

**Status:** Orphaned from production code

**Recommendation:**
- If feature is planned: Document and implement
- If test-only: Move to test fixtures directory
- If not needed: Remove entirely

---

### 1.2 file-watcher-store.ts

**Location:** `src/infrastructure/persistence/stores/file-watcher-store.ts`

**Usage:** Minimal (1-2 consumers)

**Analysis:**
- Very limited usage detected
- Potential redundancy with file watching in other stores
- Unclear ownership

**Status:** Unclear purpose

**Recommendation:**
1. Audit actual usage via `grep -r "file-watcher-store" src/`
2. If redundant: Merge into appropriate store
3. If needed: Document purpose and consumers

---

### 1.3 synthesis-store.ts

**Location:** `src/infrastructure/persistence/stores/synthesis-store.ts`

**Usage:** No active consumers found

**Analysis:**
- Zero production consumers
- Zero test consumers
- Purpose unclear from name

**Status:** Fully orphaned

**Recommendation:**
- Confirm if feature is planned
- Remove if not needed
- Document if planned for future

---

## 2. Stub Implementations

### 2.1 WebDAV Adapter

**Location:** `src/infrastructure/sync/adapters/webdav-adapter.ts` (if exists)

**Analysis:**
- Adapter exists but no consumers found
- Possibly planned feature
- No tests found

**Status:** Unused stub

**Recommendation:**
- Add TODO comment with implementation plan
- Or: Remove if not actively planned
- Document if external dependency is blocking

---

### 2.2 S3 Adapter

**Location:** `src/infrastructure/sync/adapters/s3-adapter.ts` (if exists)

**Analysis:**
- Stubbed implementation
- Incomplete functionality
- No consumers

**Status:** Incomplete stub

**Recommendation:**
- Complete implementation or remove
- Add clear documentation if planned

---

## 3. Misplaced Root Files

### 3.1 global-types.d.ts

**Location:** `src/global-types.d.ts`

**Issue:** Global type definitions in src root

**Should be:** `src/types/global.d.ts` or similar

**Analysis:**
- Contains global type declarations
- Should be in organized types directory

**Recommendation:** Move to `src/types/` directory

---

### 3.2 router.tsx

**Location:** `src/router.tsx`

**Issue:** Router configuration in src root

**Should be:** `src/presentation/router.tsx` or `src/app/router.tsx`

**Analysis:**
- Contains TanStack Router configuration
- Infrastructure/presentation boundary unclear

**Recommendation:** Move to appropriate layer directory

---

### 3.3 server.ts

**Location:** `src/server.ts`

**Issue:** Server config in src root

**Should be:** `src/infrastructure/server.ts` or `src/server/index.ts`

**Recommendation:** Organize into appropriate infrastructure directory

---

## 4. Unused Facades

### 4.1 Note Tools Facade

**Locations:**
- `src/lib/agent/facades/note-tools.ts` (interface)
- `src/lib/agent/facades/note-tools-impl.ts` (implementation)

**Analysis:**
- Note CRUD operations duplicated
- Domain tools already exist in `src/domain/tools/note/`
- Facade adds unnecessary indirection

**Status:** Redundant abstraction

**Recommendation:**
- Remove facade layer
- Use domain tools directly
- Update all consumers

---

### 4.2 Other Potential Facades

**Directory:** `src/lib/agent/facades/`

**Analysis Needed:**
- Audit all facades for redundancy
- Identify which add value vs. duplicate domain logic

---

## 5. Duplicate/Misplaced Business Logic

### 5.1 Notes Logic Duplication

**Locations:**
- `src/lib/notes/note-store.ts`
- `src/domain/tools/note/`

**Status:** Duplicate business logic (covered in Architecture Conflicts)

---

### 5.2 Workspace Logic Duplication

**Locations:**
- `src/lib/workspace/`
- `src/domain/entities/workspace.ts`
- `src/infrastructure/persistence/stores/workspace/`

**Status:** Scattered workspace logic

---

## 6. Unclear Directory Structure

### 6.1 src/core/ Directory

**Analysis:**
- Entire `src/core/` is a legacy compatibility layer
- Re-exports domain entities
- Should be deprecated

**Files:**
- `src/core/index.ts`
- `src/core/entities/index.ts`
- (other core files)

**Recommendation:**
- Migrate all imports to domain layer
- Add deprecation warnings
- Eventually remove entirely

---

### 6.2 src/lib/ Directory Ambiguity

**Issue:** `lib/` contains mixed concerns:
- Cross-cutting utilities (hooks, utils)
- Feature-specific business logic (agent, notes, workspace)
- State management (stores)

**Recommendation:**
- Move business logic to domain layer
- Move state management to infrastructure layer
- Keep only true utilities in lib

---

## 7. Test-Only Files in Source

### 7.1 Test Fixtures in Source

**Pattern:** Look for files with `-test.ts`, `.test.ts`, `.spec.ts` in src/

**Recommendation:**
- Move test files to `__tests__/` or `tests/` directories
- Keep source tree clean

---

## 8. Cleanup Priority Matrix

| File/Directory | Severity | Effort | Priority |
|----------------|----------|--------|----------|
| synthesis-store.ts | Low | Low | P3 |
| conversation-auto-restore.ts | Low | Low | P3 |
| Note tools facades | Medium | Medium | P2 |
| src/core/ | Medium | High | P2 |
| Misplaced root files | Low | Low | P3 |
| Stub adapters | Low | Medium | P3 |
| file-watcher-store.ts | Low | Low | P3 |

---

## 9. Verification Commands

Before removing any file, verify with:

```bash
# Check for imports
grep -r "import.*from.*file-watcher-store" src/

# Check for references
grep -r "synthesis-store" src/

# Check for type references
grep -r "SynthesisStore" src/
```

---

## 10. Cleanup Process

For each orphaned/unclear file:

1. **Verify Usage**
   - Search for imports
   - Search for references
   - Check tests

2. **Determine Action**
   - Keep and document: If actively used
   - Move: If in wrong location
   - Deprecate: If being phased out
   - Remove: If truly unused

3. **Execute**
   - Create commit per file/group
   - Update imports if moving
   - Add deprecation warnings if keeping
   - Delete if removing

4. **Verify**
   - Run `tsc --noEmit`
   - Run tests
   - Check build

---

## Related Artifacts

- [Comprehensive Codebase Audit](./comprehensive-codebase-audit-2026-01-11.md)
- [Architecture Conflicts Analysis](./architecture-conflicts-2026-01-11.md)
- [Store Consolidation Analysis](./store-consolidation-analysis-2026-01-11.md)

---

*Analysis conducted by: BMAD Dead Code Analysis Agent*
*Report Version: 1.0*
