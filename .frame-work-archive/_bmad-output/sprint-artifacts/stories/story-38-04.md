---
story_id: "38-04"
story_title: "Update 32 infrastructure→lib imports"
epic_id: "EPIC-38"
priority: "P0"
effort_hours: 2
status: "drafted"
created_at: "2026-01-08T14:45:00+07:00"
updated_at: "2026-01-08T14:45:00+07:00"
assigned_to: "@bmad-bmm-dev"
dependencies: ["38-01", "38-02", "38-03"]
research_artifacts:
  - source: "codebase-analysis"
    query: "Infrastructure files importing from lib layer"
    findings: "Need to identify all infrastructure→lib import violations"
  - source: "architecture-review"
    query: "Clean Architecture import direction rules"
    findings: "infrastructure must not import from lib (types OK via re-export)"
---

# Story 38-04: Update 32 infrastructure→lib imports

## Epic Context
**EPIC-38**: Clean Architecture Compliance - Achieve 100% import direction compliance across the codebase.

## Overview
Fix all remaining import direction violations where infrastructure layer files import from `lib` layer. After stories 38-01, 38-02, and 38-03, the main violations should be infrastructure files importing sync types, file system utilities, or other items that have moved to infrastructure.

## User Story

**As a** developer maintaining clean architecture
**I want** infrastructure layer files to NOT import from lib layer
**So that** import direction flows correctly: infrastructure → domain → lib

## Acceptance Criteria

### AC-1: Infrastructure→Lib Imports Identified
**Given** the codebase has import direction violations
**When** I scan for infrastructure importing from lib
**Then** all violations are catalogued and prioritized

### AC-2: Sync Types Imports Fixed
**Given** sync-types were moved to infrastructure/sync/types
**When** infrastructure files import sync types
**Then** they import from @/infrastructure/sync/types

### AC-3: File System Imports Fixed
**Given** file system utilities were moved to infrastructure/filesystem
**When** infrastructure files import file system items
**Then** they import from @/infrastructure/filesystem

### AC-4: Zero Circular Dependencies
**Given** import directions are being corrected
**When** I analyze the dependency graph
**Then** no circular dependencies exist between infrastructure and lib

### AC-5: TypeScript Compilation Passes
**Given** imports have been updated
**When** I run `pnpm typecheck`
**Then** zero TypeScript errors occur related to these changes

## Dependencies

### Story Dependencies
- **38-01**: Must complete first (moved sync-types to infrastructure)
- **38-02**: Must complete first (moved file system adapters to infrastructure)
- **38-03**: Must complete first (created facade with deprecation warnings)

### Code Dependencies
- `src/infrastructure/sync/types` (canonical sync types location)
- `src/infrastructure/filesystem` (canonical file system location)

### Files to Modify:
- Infrastructure files importing from lib layer (TBD during research)

## Research Findings

### Source 1: Codebase Analysis - Infrastructure Import Violations
**Finding**: Need to scan for infrastructure→lib import violations after stories 38-01, 38-02, 38-03.

**Impact**: Must identify and fix all remaining violations.

**Expected Pattern**:
```typescript
// ❌ VIOLATION (infrastructure importing from lib)
// src/infrastructure/some-file.ts
import type { Something } from '@/lib/something';

// ✅ CORRECT (infrastructure imports from infrastructure or domain)
import type { Something } from '@/infrastructure/something';
import type { Entity } from '@/domain/entities';
```

### Source 2: Architecture Review - Import Direction Rules
**Finding**: Clean Architecture requires strict import direction:
- **infrastructure** can import from: infrastructure, domain
- **infrastructure** CANNOT import from: lib, application, presentation
- **lib** can import from: domain, lib (pure utilities only)

**Exception**: Type-only imports via re-export are acceptable for transition period.

## Implementation Plan

### Step 1: Scan for Violations (15 minutes)
```bash
# Find all infrastructure files importing from lib
grep -r "from '@/lib/" src/infrastructure --include='*.ts' | grep -v "test.ts"

# Find all infrastructure files importing from lib (type imports)
grep -r "import type.*from '@/lib/" src/infrastructure --include='*.ts' | grep -v "test.ts"
```

### Step 2: Categorize Violations (15 minutes)
- **Sync types**: Should import from @/infrastructure/sync/types
- **File system**: Should import from @/infrastructure/filesystem
- **Domain entities**: Should import from @/domain/entities (future story)
- **Other**: Analyze case-by-case

### Step 3: Fix Imports (45 minutes)
Update each violating file:
1. Identify what's being imported
2. Find canonical location (likely infrastructure/ now)
3. Update import statement
4. Verify no breakage

### Step 4: Validate Circular Dependencies (15 minutes)
```bash
# Run dependency analysis
# Check for circular imports
pnpm typecheck
```

### Step 5: Test and Verify (15 minutes)
- Run pnpm typecheck
- Verify all imports resolve
- Check for any remaining violations

## Tasks

- [ ] T1: Scan for infrastructure→lib import violations
- [ ] T2: Categorize violations by type
- [ ] T3: Fix sync types imports
- [ ] T4: Fix file system imports
- [ ] T5: Fix other violations
- [ ] T6: Validate with TypeScript
- [ ] T7: Verify zero circular dependencies

## Research Requirements

### Required MCP Research
- [ ] Codebase scan: Find all `from '@/lib/` in infrastructure layer
- [ ] Analysis: Verify import direction after fixes
- [ ] Architecture: Confirm Clean Architecture compliance

## Dev Notes

### Import Direction Rules (Clean Architecture)
```
┌─────────────────────────────────────────────────┐
│  PRESENTATION (UI)                               │
│  ↓ can import from                               │
│  APPLICATION (Hooks, Services)                    │
│  ↓ can import from                               │
│  LIB (Pure utilities)                             │
│  ↓ can import from (types only via re-export)    │
│  DOMAIN (Entities, Repository Interfaces)         │
│  ↓ can import from                               │
│  INFRASTRUCTURE (Adapters, Stores)                │
└─────────────────────────────────────────────────┘
```

### Migration Strategy
1. Infrastructure files must NOT import from lib
2. If infrastructure needs something from lib, either:
   - Move it to infrastructure (already done for sync-types, filesystem)
   - Create a domain entity (future stories 38-05, 38-06)
   - Use a re-export from domain (for types)

## References

- Epic: `_bmad-output/planning-artifacts/architecture.md#epic-38`
- ADR-024: State Management Consolidation
- Related Stories: 38-01, 38-02, 38-03

## Dev Agent Record

*This section populated during development phase*

### Agent
- Model: TBD
- Session: TBD

### Task Progress
- [ ] T1: Scan for violations
- [ ] T2: Categorize violations
- [ ] T3: Fix sync types imports
- [ ] T4: Fix file system imports
- [ ] T5: Fix other violations
- [ ] T6: Validate TypeScript
- [ ] T7: Verify zero circular dependencies

### Research Executed
*Documentation of scan findings*

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| TBD | TBD | TBD |

### Tests Created
- TBD

### Decisions Made
- TBD

## Code Review

*This section populated during review phase*

**Reviewer:** TBD
**Date:** TBD

### Checklist
- [ ] All ACs verified (5/5)
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Zero infrastructure→lib imports
- [ ] Zero circular dependencies

### Issues Found
*Issues and resolutions documented here*

### Sign-off
[ ] APPROVED for merge

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-08T14:45:00+07:00 | @bmad-bmm-sm | Created from epic definition |
| drafted | 2026-01-08T14:45:00+07:00 | @bmad-bmm-sm | Story file created |

---

## Metadata

**Story Type:** Architecture Refactoring
**Complexity:** Medium (import direction fixes across multiple files)
**Risk Level:** MEDIUM
**Test Coverage Required:** Import resolution, circular dependency check
**Rollback Plan:** Revert import changes, zero data risk

---

**Generated:** 2026-01-08T14:45:00+07:00
**Workflow:** story-dev-cycle-v2.md
**Template Version:** 2.0.0
