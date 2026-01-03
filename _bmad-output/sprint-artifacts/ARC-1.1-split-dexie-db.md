---
id: "ARC-1.1"
epic: "ARC-1 (Foundation Stabilization)"
title: "Split dexie-db.ts (1,267 lines)"
status: "drafted"
priority: "P0"
estimate: 10
team: "Team A"
points: 8
created: "2026-01-04T15:30:00+07:00"
workflow_phase: "create-story"
skills:
  primary: "store-refactorer"
  workflow: "eliminate-god-stores"
  auto_load_triggers:
    - "dexie-db.ts"
    - "god store"
    - "1,267 lines"
    - "split database"
quality_gates:
  typescript_errors: { before: 1172, target: 0, after: null }
  test_coverage: { before: null, target: 80, after: null }
  file_size_compliance: { before: "1,267 lines", target: "≤120 lines", after: null }
  breaking_changes: { target: 0, after: null }
---

# Story ARC-1.1: Split dexie-db.ts (1,267 lines)

## User Story

**As a** developer working on the codebase,
**I want to** split the monolithic dexie-db.ts file (1,267 lines) into modular, maintainable slices (≤120 lines each),
**So that** the database schema is easier to understand, test, and extend, and the codebase adheres to the ≤120 line limit for stores.

## Context & Motivation

### Current State
- `dexie-db.ts` is **1,267 lines** long (violates ≤120 line rule by 10.6x)
- Contains database schema, migrations, utilities, and type definitions
- Violates single responsibility principle
- Difficult to test due to tight coupling
- Maintenance burden: changes risk breaking multiple concerns

### Problem
- **God class anti-pattern**: One file does too many things
- **Testing difficulty**: Hard to unit test individual concerns
- **Code review burden**: Large files slow down review process
- **Onboarding friction**: New developers struggle to understand the monolith

### Value
- **Improved testability**: Each slice can be unit tested independently
- **Easier onboarding**: Clear separation of concerns
- **Better code organization**: Each slice has single responsibility
- **Reduced merge conflicts**: Smaller files = fewer conflicts
- **Architecture compliance**: Adheres to ≤120 line limit for stores

## Acceptance Criteria

### AC-1: Database Schema Slice (≤120 lines)
**Given** the monolithic `dexie-db.ts` file (1,267 lines),
**When** I split the database schema into a dedicated slice,
**Then** the schema slice is ≤120 lines and exports only schema definitions.

```gherkin
Scenario: Schema slice extraction
  Given the dexie-db.ts file contains 1,267 lines
  And it defines database schema for multiple stores
  When I extract schema definitions to dexie-schema-slice.ts
  Then the schema slice is ≤120 lines
  And it exports schema interfaces and version number
  And it has zero dependencies on other slices
```

### AC-2: Migrations Slice (≤120 lines)
**Given** the monolithic `dexie-db.ts` file contains migration logic,
**When** I split migrations into a dedicated slice,
**Then** the migrations slice is ≤120 lines and exports migration functions.

```gherkin
Scenario: Migrations slice extraction
  Given the dexie-db.ts file contains migration logic
  And it has 10+ migration versions
  When I extract migrations to dexie-migrations-slice.ts
  Then the migrations slice is ≤120 lines
  And it exports migration version and upgrade function
  And it handles schema versioning correctly
```

### AC-3: Utilities Slice (≤120 lines)
**Given** the monolithic `dexie-db.ts` file contains utility functions,
**When** I split utilities into a dedicated slice,
**Then** the utilities slice is ≤120 lines and exports helper functions.

```gherkin
Scenario: Utilities slice extraction
  Given the dexie-db.ts file contains utility functions
  And it has helper functions for database operations
  When I extract utilities to dexie-utils-slice.ts
  Then the utilities slice is ≤120 lines
  And it exports utility functions (clear, backup, restore)
  And it has zero circular dependencies
```

### AC-4: Unified Store (≤300 lines total)
**Given** the three slices are created (schema, migrations, utilities),
**When** I combine them in a unified store,
**Then** the total unified store is ≤300 lines and composes all slices.

```gherkin
Scenario: Unified store composition
  Given the schema, migrations, and utilities slices exist
  And each slice is ≤120 lines
  When I create a unified store in dexie-db/index.ts
  Then the unified store is ≤300 lines total
  And it composes all three slices
  And it exports a single Dexie class instance
```

### AC-5: Facade Pattern (Zero Breaking Changes)
**Given** old import paths exist throughout the codebase,
**When** I add facade exports in the old location,
**Then** all existing imports continue to work (zero breaking changes).

```gherkin
Scenario: Facade exports for backwards compatibility
  Given the codebase has 50+ imports from dexie-db.ts
  And the unified store is in a new location
  When I add facade exports in src/lib/workspace/dexie-db.ts
  Then all existing imports continue to work
  And zero TypeScript errors are introduced
  And deprecation warnings are added (optional)
```

### AC-6: Test Coverage (≥80%)
**Given** the three slices are created,
**When** I write unit tests for each slice,
**Then** test coverage is ≥80% and all tests pass.

```gherkin
Scenario: Test coverage for slices
  Given the schema, migrations, and utilities slices exist
  And each slice has public functions
  When I write unit tests for all exported functions
  Then test coverage is ≥80%
  And all tests pass (100% pass rate)
  And tests use mock IndexedDB for isolation
```

### AC-7: Documentation Updated
**Given** the refactoring is complete,
**When** I update documentation,
**Then** AGENTS.md reflects the new structure and governance rules pass.

```gherkin
Scenario: Documentation update
  Given the refactoring is complete
  And all acceptance criteria are met
  When I run /governance-enforcement workflow
  Then AGENTS.md is updated with new file locations
  And CLAUDE.md reflects the new structure (if it exists)
  And project-context.md is regenerated
```

## Tasks

### Research (5 tasks)
- [ ] **T0**: Context7 MCP - Query Dexie.js official documentation for database schema patterns
- [ ] **T1**: Context7 MCP - Query Dexie.js migration best practices
- [ ] **T2**: DeepWiki - Search dfahlander/Dexie.js repository for modular database examples
- [ ] **T3**: Analyze `src/lib/workspace/dexie-db.ts` for import locations and usage patterns
- [ ] **T4**: Analyze test files to understand current testing approach for IndexedDB

### Analysis (5 tasks)
- [ ] **T5**: Count lines, functions, and dependencies in `dexie-db.ts` (baseline metrics)
- [ ] **T6**: Identify circular dependencies between dexie-db and other stores
- [ ] **T7**: Map all imports of `dexie-db.ts` across the codebase (grep search)
- [ ] **T8**: Identify logical boundaries for schema, migrations, and utilities
- [ ] **T9**: Estimate slice sizes based on analysis (target: ≤120 lines each)

### Slice Extraction (5 tasks)
- [ ] **T10**: Create `dexie-schema-slice.ts` (≤120 lines) with schema interfaces
- [ ] **T11**: Create `dexie-migrations-slice.ts` (≤120 lines) with migration logic
- [ ] **T12**: Create `dexie-utils-slice.ts` (≤120 lines) with utility functions
- [ ] **T13**: Write JSDoc comments for all exported functions in each slice
- [ ] **T14**: Verify zero circular imports between slices (use `tsc --noEmit`)

### Store Unification (5 tasks)
- [ ] **T15**: Create unified store at `src/lib/workspace/dexie-db/index.ts`
- [ ] **T16**: Compose all three slices in the unified store (≤300 lines total)
- [ ] **T17**: Export single Dexie class instance from unified store
- [ ] **T18**: Create barrel exports at `src/lib/workspace/dexie-db/index.ts`
- [ ] **T19**: Add individual selector exports (Zustand v5 pattern if applicable)

### Facade Implementation (3 tasks)
- [ ] **T20**: Create facade export in old location (`src/lib/workspace/dexie-db.ts`)
- [ ] **T21**: Re-export all public APIs from new location (zero breaking changes)
- [ ] **T22**: Verify all existing imports still work (`pnpm tsc --noEmit`)

### Testing (6 tasks)
- [ ] **T23**: Write unit tests for `dexie-schema-slice.ts` (3 tests)
- [ ] **T24**: Write unit tests for `dexie-migrations-slice.ts` (4 tests)
- [ ] **T25**: Write unit tests for `dexie-utils-slice.ts` (3 tests)
- [ ] **T26**: Write integration test for unified store (2 tests)
- [ ] **T27**: Run all tests and verify 100% pass rate (`pnpm test`)
- [ ] **T28**: Verify test coverage ≥80% (`pnpm test -- --coverage`)

### Validation (6 tasks)
- [ ] **T29**: TypeScript check passes with zero new errors (`pnpm tsc --noEmit`)
- [ ] **T30**: All acceptance criteria verified (7/7 ACs met)
- [ ] **T31**: File size compliance verified (all slices ≤120 lines, unified ≤300 lines)
- [ ] **T32**: Zero breaking changes confirmed (all imports work)
- [ ] **T33**: Documentation updated (AGENTS.md, CLAUDE.md if exists)
- [ ] **T34**: Sprint status updated (ARC-1.1 → done)

## Research Requirements

### MCP Tool Queries (5 Required)

#### R1: Context7 - Dexie.js Schema Patterns
```bash
# Query Context7 MCP for Dexie.js official documentation
# Tool: context7
# Query: "Dexie.js database schema definition patterns version 4.x"

# Expected Findings:
# - How to define database schema with tables and indexes
# - Best practices for schema versioning
# - Type-safe schema definitions with TypeScript
```

#### R2: Context7 - Dexie.js Migration Patterns
```bash
# Query Context7 MCP for Dexie.js migration best practices
# Tool: context7
# Query: "Dexie.js database migration strategies upgrade patterns"

# Expected Findings:
# - How to handle schema version upgrades
# - Migration transaction patterns
# - Data preservation during migrations
```

#### R3: DeepWiki - Modular Database Examples
```bash
# Query DeepWiki for Dexie.js repository patterns
# Tool: deepwiki
# Repository: dfahlander/Dexie.js
# Query: "modular database schema separation examples"

# Expected Findings:
# - Community examples of splitting large schemas
# - Patterns for schema organization
# - Import/export patterns for Dexie databases
```

#### R4: Exa/Web Search - Zustand v5 Patterns
```bash
# Query Exa for Zustand v5 slice composition
# Tool: exa (or web-search-prime)
# Query: "Zustand v5 slice composition best practices 2025"

# Expected Findings:
# - How to compose multiple slices
# - Individual selector patterns
# - Persist middleware with slice composition
```

#### R5: Repomix - Current Dexie Usage Patterns
```bash
# Use Repomix to analyze current codebase
# Tool: repomix-explorer
# Repository: Local codebase
# Query: "dexie-db import patterns and usage"

# Expected Findings:
# - All files importing from dexie-db.ts
# - Common usage patterns
# - Potential breaking changes to watch for
```

## Dev Notes

### Architecture Patterns

#### 4-Layer Architecture (Reference)
```
Layer 4: Presentation (UI Components)
Layer 3: Application (Services, DTOs)
Layer 2: Domain (Business Entities, Rules)
Layer 1: Infrastructure (Persistence, Database)
```

**dexie-db.ts Location**: Layer 1 (Infrastructure/Persistence)

#### Zustand v5 Patterns (December 2025)
- **Individual Selectors**: Use `s => s.property` instead of destructuring
- **Slice Composition**: Combine multiple slices with `...a` spread operator
- **Persist Middleware**: Apply to combined store, not individual slices
- **Partialize**: Select which state to persist (Dexie storage adapter)

**Note**: dexie-db.ts is NOT a Zustand store, but similar slice patterns apply

#### Facade Strategy
- **Old Location**: `src/lib/workspace/dexie-db.ts` (becomes facade)
- **New Location**: `src/lib/workspace/dexie-db/index.ts` (unified store)
- **Re-exports**: All public APIs re-exported for backwards compatibility
- **Deprecation**: Optional deprecation warnings using `@deprecated` JSDoc

### Dexie.js Specific Patterns

#### Schema Definition Pattern
```typescript
// Standard Dexie schema (from official docs)
import Dexie, { Table } from 'dexie';

export class AppDatabase extends Dexie {
  documents!: Table<Document, number>;
  chunks!: Table<Chunk, number>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      documents: '++id, title, createdAt',
      chunks: '++id, documentId, content',
    });
  }
}
```

#### Migration Pattern
```typescript
// Schema version upgrade
this.version(2).stores({
  documents: '++id, title, createdAt, updatedAt', // Added index
  chunks: '++id, documentId, content, embeddingVector', // Added column
}).upgrade(tx => {
  // Data migration logic here
  return tx.table('documents').toCollection().modify(doc => {
    doc.updatedAt = new Date();
  });
});
```

### Quality Standards

- **Max Lines per Slice**: 120 lines (strict)
- **Max Functions per Slice**: 10 functions
- **Max Dependencies per Slice**: 5 imports
- **Test Coverage Target**: ≥80%
- **TypeScript Errors**: 0 new errors
- **Breaking Changes**: 0 (facade pattern required)

### Critical Technical Notes

#### IndexedDB Considerations
- **Quota Management**: Check `_bmad-output/ralph-loop-cycle-18-gap-summary-2026-01-01.md` for P0 data loss risks
- **Transaction Safety**: Migrations must be atomic (all-or-nothing)
- **Schema Versioning**: Never downgrade version numbers
- **Backup Strategy**: Create timestamped backup before migration

#### Import Location Analysis
**Before splitting**, verify all import locations:
```bash
# Grep for all imports of dexie-db.ts
grep -r "from.*dexie-db" src/
grep -r "import.*dexie-db" src/
```

**Expected**: 20-30 import locations across the codebase

#### Testing Strategy
- **Mock IndexedDB**: Use `fake-indexeddb` for unit tests
- **Transaction Tests**: Test migration rollback scenarios
- **Schema Tests**: Verify schema version upgrades
- **Utility Tests**: Test clear/backup/restore operations

## References

### Workflow & Agent Documentation
- `_bmad/modules/architecture-remediation/workflows/eliminate-god-stores.md` - Master workflow for god store elimination
- `_bmad/modules/architecture-remediation/agents/store-refactorer.md` - Store refactoring specialist agent
- `.agent/workflows/story-dev-cycle.md` - Story development cycle workflow (this template)

### Project Planning Documents
- `_bmad-output/sprint-artifacts/arc-sprint-status.yaml` - ARC sprint tracking (this story's status)
- `_bmad-output/prompts/2026-01-04/comprehensive-correct-course-production-ready.md` - Course correction document
- `_bmad-output/correct-course-status-2026-01-04.md` - Course correction status

### Architecture & Standards
- `_bmad-output/project-planning-artifacts/architecture.md` - System architecture decisions
- `_bmad-output/project-planning-artifacts/project-context.md` - Project context and constraints
- `.claude/rules/governance-rules.md` - Governance rules for development
- `CLAUDE.md` - Project-specific guidance (if exists)

### Dependencies Documentation
- `docs/dependencies-libraries-usage.md` - Dexie.js usage patterns (if exists)
- Dexie.js Official Docs: https://dexie.org/
- Dexie.js GitHub: https://github.com/dexie/Dexie.js

### Related Epics & Stories
- Epic ARC-1: Foundation Stabilization (parent epic)
- Story ARC-1.2: Split rag-store.ts (1,595 lines) - Next story
- Story ARC-1.3: Split conversation stores (25 duplicates) - Future story

---

## 🔴 POST-IMPLEMENTATION CODE REVIEW FINDINGS (2026-01-04)

### Executive Summary

**Story Status**: 75% Complete - Core Functionality Works, But Critical Issues Remain

**Claimed vs Reality**:
- **Claimed**: "Split dexie-db.ts (1,267 lines) → 14 helper modules, 100% complete"
- **Reality**: Created 15 helper files, reduced to 333 lines (11% over AC target), 3/7 acceptance criteria failed

**Overall Assessment**: Story ARC-1.1 successfully eliminated the god store anti-pattern by extracting 75 functions into 15 focused helper modules (74% line reduction). However, critical acceptance criteria failures (AC-3, AC-6, AC-7), code quality issues, and missing test coverage prevent this story from being marked as DONE.

---

### What Story ARC-1.1 Actually Accomplished ✅

#### 1. Helper Files Created (Exceeds Target)
- **Claim**: Create 8-14 helper files
- **Actual**: Created **15 helper files** in `src/lib/state/dexie-db-helpers/`
- **Max File Size**: 128 lines (`synthesis-result-helpers-crud.ts`) - 7% over 120-line target
- **Assessment**: ⚠️ PARTIAL - Exceeded target count but 1 file exceeds size limit

**All Helper Files Created**:
```
additional-file-metadata-helpers.ts (45 lines)
collection-helpers-basic.ts (91 lines)
collection-helpers-sources.ts (75 lines)
conversation-thread-helpers.ts (97 lines)
file-metadata-helpers.ts (113 lines)
fsa-handle-helpers.ts (102 lines)
ide-state-helpers.ts (68 lines)
session-snapshot-helpers.ts (83 lines)
source-helpers-basic.ts (93 lines)
source-helpers-search.ts (56 lines)
sync-status-helpers-basic.ts (74 lines)
sync-status-helpers-query.ts (73 lines)
synthesis-result-helpers-create.ts (77 lines)
synthesis-result-helpers-crud.ts (128 lines) ⚠️ 7% over limit
tool-execution-log-helpers.ts (118 lines)
```

#### 2. Main File Reduction (74% Reduction)
- **Before**: 1,267 lines (god store, 10.6x over 120-line limit)
- **After**: 333 lines
- **Reduction**: 934 lines eliminated (74% reduction)
- **Assessment**: ❌ FAILED - 333 lines exceeds 300-line AC target by 11% (AC-3 violated)

**Why 333 lines?**
The main file is now a barrel export with 75 re-exported functions:

```typescript
// Barrel export pattern (75 functions)
export * from './dexie-db-helpers/additional-file-metadata-helpers';
export * from './dexie-db-helpers/collection-helpers-basic';
// ... 13 more re-exports

export async function getDb() { /* database initialization */ }
export function isDefaultProject() { /* default check */ }
export { db } from './dexie-db-class';
export type { DbClasses, DbTables } from './dexie-db-class';
export * from './dexie-db-class';
export * from './dexie-db-core-types';
export * from './dexie-db-migrations';
// ... 8 more re-exports
```

#### 3. Zero Breaking Changes ✅
- **Import Locations**: 52 files importing from old location
- **Facade Pattern**: All re-exports work correctly
- **TypeScript**: Zero new errors
- **Assessment**: ✅ PASSED - Backwards compatibility maintained (AC-5 met)

---

### 🔴 CRITICAL ISSUES DISCOVERED (Not in Story Scope)

**These issues were discovered during comprehensive codebase analysis after story completion.**

#### Issue 1: Dexie Storage Duplication Crisis (P0 - Data Loss Risk)

**Problem**: TWO VERSIONS of `dexie-storage.ts` with DIFFERENT CODE

**Version 1** (`src/lib/state/dexie-storage.ts` - 84 lines):
- Simple implementation
- ❌ NO quota handling
- ❌ NO proactive cleanup
- ❌ NO retry mechanism
- Used by: 7 files (mostly stores)

**Version 2** (`src/infrastructure/persistence/dexie-storage.ts` - 207 lines):
- Advanced implementation
- ✅ HAS quota handling (Ralph Loop Cycle 18 DB-001 requirement)
- ✅ HAS proactive cleanup
- ✅ HAS retry mechanism
- Used by: 1 file (rag-store.ts)

**Impact**: 7 files using the 84-line version are missing P0 data loss protection. This is a **CRITICAL DATA LOSS RISK** identified in Ralph Loop Cycle 18.

**Recommendation**: URGENT - Consolidate to 207-line version (Phase 1 of cleanup plan).

---

#### Issue 2: Dexie Type Files Duplicated (8 Files)

**Problem**: 8 dexie type files exist in BOTH locations:
- `src/lib/state/` (legacy, 68 imports)
- `src/infrastructure/persistence/` (modern, 14 imports)

**Duplicated Files**:
```
dexie-db-ai-types.ts
dexie-db-class.ts
dexie-db-core-types.ts
dexie-db-helpers.ts
dexie-db-knowledge-types.ts
dexie-db-migrations.ts
dexie-db-session-types.ts
dexie-db.ts
```

**Impact**: Confusion about canonical location, maintenance burden, developers don't know where to import from.

**Recommendation**: Consolidate to infrastructure/persistence with facade (Phase 2 of cleanup plan).

---

#### Issue 3: God Store Crisis Discovered (6 Stores)

**Problem**: Discovered 6 god stores violating 300-line limit during codebase analysis:

1. **`canvas-store.ts`**: 18,954 lines (63x over limit!) - HIGHEST PRIORITY
2. **`flashcard-store.ts`**: 15,726 lines (52x over limit!)
3. **`use-app-store.ts`**: 13,174 lines (43x over limit!)
4. **`study-store.ts`**: 11,864 lines (39x over limit!)
5. **`rag-store.ts`**: Large (not measured yet, likely god store)
6. **`conversation-store.ts`**: 626 lines (2x over limit)

**Impact**: Massive technical debt, unmaintainable code, violates architectural standards.

**Recommendation**: NEW EPIC required - "Epic ARC-GOD: God Store Elimination" (48-72 hours, 6 stores).

---

#### Issue 4: Three-Layer Architecture Chaos

**Problem**: Discovered codebase has 3 competing layers for state management:

**Layer 1** (`src/infrastructure/persistence/stores/`):
- 45 slice files organized by domain (agents, conversation, ide, knowledge, project, providers, rag, filesystem)
- 18 standalone stores
- **Status**: PRIMARY LOCATION - Current active implementation

**Layer 2** (`src/lib/state/`):
- 16 files: 11 dexie type files + 5 store files
- dexie-db-helpers/ (15 helper files from Story ARC-1.1)
- **Status**: BACKWARDS COMPATIBILITY - Should be consolidated

**Layer 3** (`src/lib/workspace/`):
- 10 files: project-store.ts (DUPLICATE), threads-store.ts, session-snapshot.ts, etc.
- **Status**: UTILITY FOCUS - project-store is duplicate

**Impact**: Developers don't know where to put new code, architectural confusion, maintenance burden.

**Recommendation**: Create architectural decision document (Phase 6 of cleanup plan).

---

### 📋 CODE REVIEW FINDINGS (10 Specific Issues)

#### HIGH Severity Issues

**1. AC-3 VIOLATED: Main File Exceeds 300-Line Target**
- **Location**: `src/lib/state/dexie-db.ts` (333 lines)
- **Requirement**: <300 lines for unified store
- **Actual**: 333 lines (11% over target)
- **Root Cause**: 75 verbose re-export statements
- **Fix**: Reduce to concise barrel export or split further

**2. CRITICAL SSR BUG: Line 285 Environment Check**
- **Location**: `src/lib/state/dexie-db.ts:285`
- **Code**:
  ```typescript
  if (typeof window === 'undefined' && typeof indexedDB === 'undefined') return null;
  ```
- **Problem**: Uses `&&` (AND) instead of `||` (OR)
- **Impact**: Returns null on server AND when indexedDB is missing, but should return null on server OR when indexedDB is missing
- **Fix**: Change `&&` to `||`

**3. DANGEROUS TEST FUNCTION: No Safety Checks**
- **Location**: `src/lib/state/dexie-db.ts:327-332`
- **Code**:
  ```typescript
  export async function resetDatabaseForTesting(): Promise<void> {
      const instance = getDb();
      if (!instance) return;
      await instance.delete(); // ⚠️ Deletes ALL data with no confirmation
      await instance.open();
  }
  ```
- **Problem**: Deletes entire IndexedDB database without:
  - Confirmation prompt
  - Backup creation
  - Environment check (could run in production)
- **Fix**: Add environment guard, confirmation, or delete entirely

**4. ZERO TEST FILES CREATED: AC-6 Failed**
- **Requirement**: "Test Coverage (≥80%)" with 3 test files
- **Actual**: 0 test files created
- **Impact**: Cannot verify AC-6, no test coverage metrics
- **Fix**: Write tests for all 15 helper files (Story ARC-1.1.3)

**5. STORY DOCUMENTATION MISMATCH: Wrong Directory Structure**
- **Story Expects**: `src/lib/workspace/dexie-db/` (slices + index.ts)
- **Actual Implementation**: `src/lib/state/dexie-db-helpers/` (helper files, not slices)
- **Impact**: Confusion for future developers reading story
- **Fix**: Update story documentation to match actual implementation

#### MEDIUM Severity Issues

**6. AMBIGUOUS EXPORT: Import from Directory**
- **Location**: `src/lib/state/dexie-db.ts:18`
- **Code**:
  ```typescript
  export { queueItemToSyncStatus } from './dexie-db-helpers';
  ```
- **Problem**: Imports from directory instead of specific file
- **Fix**: Specify file path: `from './dexie-db-helpers/sync-status-helpers-basic'`

**7. ONE FILE EXCEEDS 120-LINE LIMIT**
- **Location**: `synthesis-result-helpers-crud.ts` (128 lines)
- **Requirement**: Helper files ≤120 lines
- **Actual**: 128 lines (7% over limit)
- **Fix**: Split into 2 files or refactor to reduce lines

**8. ALL CHANGES UNCOMMITTED: Git State**
- **Modified Files**: 9 files
- **New Files**: 2 files
- **Status**: Not committed to git
- **Fix**: Commit changes with proper message

**9. 34 TASKS MARKED INCOMPLETE**
- **Story Status**: Claims "done" in sprint-status.yaml
- **Task List**: All 34 tasks marked `[ ]` (incomplete)
- **Impact**: Inconsistent story tracking
- **Fix**: Update task checklist or remove claims of completion

**10. dexie-storage.ts VERSION CONFLICT**
- **Issue**: Two versions with different code (84 vs 207 lines)
- **Impact**: Confusion about which to use, missing quota handling
- **Fix**: Consolidate to 207-line version (Issue 1)

---

### ✅ ACCEPTANCE CRITERIA STATUS (Updated)

| AC | Requirement | Status | Notes |
|----|------------|--------|-------|
| AC-1 | Helper Files Created (≤120 lines) | ⚠️ PARTIAL | 15 files created, but 1 exceeds 120 by 7% |
| AC-2 | File Size Compliance (≤120 lines) | ⚠️ PARTIAL | 128 lines (synthesis-result-helpers-crud.ts) |
| AC-3 | Main File Reduction (<300 lines) | ❌ FAILED | 333 lines (11% over target) |
| AC-4 | Barrel Export Pattern | ✅ PASSED | All 75 functions re-exported |
| AC-5 | Zero Breaking Changes | ✅ PASSED | 52 import locations verified |
| AC-6 | Test Coverage (≥80%) | ❌ FAILED | 0 test files created |
| AC-7 | Documentation Updated | ❌ FAILED | Story doesn't match implementation |

**Final Assessment**: Story ARC-1.1 is **75% complete**. Core functionality works, but AC-3, AC-6, and AC-7 failed.

---

### 🎯 RECOMMENDATIONS FOR FOLLOW-UP WORK

Based on code review findings, recommend creating these stories:

#### Epic ARC-DUP: Eliminate Dexie Duplication (5 stories, 8-12 hours)

**Story ARC-DUP.1**: Consolidate dexie-storage.ts versions (2-3 hours) - P0 URGENT
- Copy 207-line version (with quota handling) to lib/state
- Update all 7 imports
- Delete duplicate from infrastructure/persistence
- Test quota handling works

**Story ARC-DUP.2**: Move dexie type files to infrastructure/persistence (3-4 hours)
- Move 8 dexie type files
- Create facade in lib/state for backwards compatibility
- Update 68 imports
- Verify zero breaking changes

**Story ARC-DUP.3**: Delete knowledge-store.ts facade (1-2 hours)
- Update all imports to direct path
- Verify 10-15 files work
- Test knowledge workspace

**Story ARC-DUP.4**: Delete workspace/project-store.ts duplicate (1-2 hours)
- Update 5-10 imports
- Verify project workspace works
- Test project CRUD

**Story ARC-DUP.5**: Create architectural decision document (2-3 hours)
- Document 3-layer chaos
- Define canonical locations
- Update AGENTS.md, CLAUDE.md

#### Epic ARC-GOD: God Store Elimination (6 stories, 48-72 hours)

**Story ARC-GOD.1**: Split canvas-store.ts (18,954 lines, 8-12 hours) - HIGHEST PRIORITY
**Story ARC-GOD.2**: Split flashcard-store.ts (15,726 lines, 8-12 hours)
**Story ARC-GOD.3**: Split use-app-store.ts (13,174 lines, 8-12 hours)
**Story ARC-GOD.4**: Split study-store.ts (11,864 lines, 8-12 hours)
**Story ARC-GOD.5**: Split rag-store.ts (large, 8-12 hours)
**Story ARC-GOD.6**: Split conversation-store.ts (626 lines, 8-12 hours)

#### Story ARC-1.1 Follow-Ups (4 stories, 6-8 hours)

**Story ARC-1.1.1**: Fix dexie-db.ts SSR bug (Line 285, 30 minutes)
- Change `&&` to `||` for environment check
- Test SSR works correctly

**Story ARC-1.1.2**: Reduce dexie-db.ts to ≤300 lines (1 hour)
- Remove verbose re-exports
- Use concise barrel export pattern

**Story ARC-1.1.3**: Write tests for 15 helper files (4-6 hours)
- Target ≥80% test coverage
- Test all helper functions
- Verify AC-6 passes

**Story ARC-1.1.4**: Commit and push changes (30 minutes)
- Commit all 11 modified/new files
- Use conventional commit message
- Push to feature branch

---

### 📚 LESSONS LEARNED

1. **✅ Story Approach Was Correct**:
   - Splitting 1,267-line file was the right call
   - 15 helper files are well-organized
   - Facade pattern worked perfectly

2. **⚠️ Process Improvements Needed**:
   - Code review should happen BEFORE marking story DONE
   - Should analyze codebase context BEFORE implementation
   - Need to check for duplicates in other locations

3. **🔴 Deeper Problems Exposed**:
   - Story ARC-1.1 was just the tip of the iceberg
   - Codebase has 3-layer architecture chaos
   - God store crisis is MUCH worse than expected
   - Need comprehensive cleanup epic (60-85 hours)

---

**Analysis Performed By**: Critical Code Review Agent (Adversarial Review)
**Analysis Date**: 2026-01-04
**Comprehensive Plan**: See `/Users/apple/.claude/plans/magical-booping-allen.md`

---

## Dev Agent Record

*(This section will be populated during development phase)*

### Agent Session
**Agent**: {model_name}
**Session Start**: {timestamp}
**Session End**: {timestamp}

### Task Progress
- [ ] T0-T4: Research tasks completed
- [ ] T5-T9: Analysis tasks completed
- [ ] T10-T14: Slice extraction completed
- [ ] T15-T19: Store unification completed
- [ ] T20-T22: Facade implementation completed
- [ ] T23-T28: Testing completed
- [ ] T29-T34: Validation completed

### Research Executed
- **Context7**: {query} → {finding}
- **DeepWiki**: {repo} → {pattern}
- **Exa/Web Search**: {query} → {result}
- **Repomix**: {scope} → {insights}

### Files Changed
| File | Action | Lines | Notes |
|------|--------|-------|-------|
| src/lib/workspace/dexie-db/schema-slice.ts | Created | 120 | Schema definitions |
| src/lib/workspace/dexie-db/migrations-slice.ts | Created | 120 | Migration logic |
| src/lib/workspace/dexie-db/utils-slice.ts | Created | 120 | Utility functions |
| src/lib/workspace/dexie-db/index.ts | Created | 300 | Unified store |
| src/lib/workspace/dexie-db.ts | Modified | +10/-1267 | Facade exports |
| src/lib/workspace/dexie-db/__tests__/schema-slice.test.ts | Created | 80 | Unit tests |
| src/lib/workspace/dexie-db/__tests__/migrations-slice.test.ts | Created | 100 | Unit tests |
| src/lib/workspace/dexie-db/__tests__/utils-slice.test.ts | Created | 80 | Unit tests |

### Tests Created
- `schema-slice.test.ts`: 3 tests (schema definitions, version, types)
- `migrations-slice.test.ts`: 4 tests (upgrade, rollback, data preservation)
- `utils-slice.test.ts`: 3 tests (clear, backup, restore)
- `unified-store.integration.test.ts`: 2 tests (composition, exports)

**Total Tests**: 12 tests
**Test Coverage**: {percentage}%

### Decisions Made
1. **Schema Slice Structure**: Chosen pattern (e.g., class-based vs functional) → {rationale}
2. **Migration Strategy**: Incremental versioning → {rationale}
3. **Facade Approach**: Re-exports only (no deprecation warnings) → {rationale}
4. **Testing Approach**: Mock IndexedDB with fake-indexeddb → {rationale}

### Issues Encountered
- **Issue 1**: {description} → {resolution}
- **Issue 2**: {description} → {resolution}

### Code Review Feedback
*(This section will be populated during code review phase)*

## Code Review

*(This section will be populated during code review phase)*

### Reviewer
**Reviewer**: {model_name}
**Review Date**: {timestamp}

### Checklist
- [ ] All 7 acceptance criteria verified (100%)
- [ ] All 34 tasks completed
- [ ] All 12 tests passing (100% pass rate)
- [ ] Test coverage ≥80%
- [ ] Zero TypeScript errors (`pnpm tsc --noEmit`)
- [ ] Zero ESLint warnings
- [ ] File size compliance verified (all slices ≤120 lines, unified ≤300 lines)
- [ ] Zero breaking changes (all imports work)
- [ ] Documentation updated (AGENTS.md, CLAUDE.md if exists)
- [ ] Governance rules followed (`.claude/rules/governance-rules.md`)

### Issues Found
- **Issue 1**: {description} → {resolution}
- **Issue 2**: {description} → {resolution}

### Sign-off
**Status**: {APPROVED | NEEDS_REVISION}
**Comments**: {reviewer comments}

## Status History

| Phase | Status | Timestamp | Agent | Notes |
|-------|--------|-----------|-------|-------|
| backlog | backlog | 2026-01-04T15:00+07:00 | @/sm | Story created in backlog |
| create-story | drafted | 2026-01-04T15:30+07:00 | @/sm | Story file created |
| create-context | ready-for-dev | {timestamp} | @/sm | Context XML created |
| dev-story | in-progress | {timestamp} | @/dev | Development started |
| code-review | review | {timestamp} | @/dev | Code review in progress |
| story-done | done | {timestamp} | @/sm | All ACs verified, story complete |

---

**Story File Version**: 1.0.0
**Last Updated**: 2026-01-04T15:30:00+07:00
**Next Action**: Execute Phase 2 (create-context) with @/sm agent
