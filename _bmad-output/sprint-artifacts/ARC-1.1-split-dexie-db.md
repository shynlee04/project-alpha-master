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
