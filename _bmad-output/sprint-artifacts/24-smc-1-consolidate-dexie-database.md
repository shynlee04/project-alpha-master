---
date: 2026-01-04
time: 09:30:00+07:00
phase: Phase 4 - Implementation
team: Team A
agent_mode: bmad-bmm-sm → bmad-bmm-dev
story_id: 24-SMC-1
epic_id: EPIC-24-SMC
sprint_id: SPRINT-STATE-CONSOLIDATION
status: drafted
priority: P0-CRITICAL
estimated_hours: 2
---

# Story 24-SMC-1: Consolidate Dexie Database Files

## Story Header

**Epic:** 24-SMC - State Management Consolidation  
**Sprint:** State Consolidation Sprint (2026-01-04)  
**Story ID:** 24-SMC-1  
**Story Title:** Consolidate Dexie Database Files  
**Priority:** P0-CRITICAL  
**Estimated Effort:** 2 hours

## User Story

**As a** developer maintaining the Via-Gent codebase  
**I want** a single canonical Dexie database file location  
**So that** I don't have confusion about which database instance to use and avoid data corruption risks from dual instantiation

## Background Context

Currently there are **two** `dexie-db.ts` files:
1. `src/lib/state/dexie-db.ts` - **Legacy** (to be converted to facade)
2. `src/infrastructure/persistence/dexie-db.ts` - **Canonical** (single source of truth)

This duplication causes:
- Developer confusion about which to import
- Risk of different database instances being created
- Inconsistent type exports
- Maintenance burden

## Acceptance Criteria

### AC-1: Facade Creation
**Given** the legacy `lib/state/dexie-db.ts` exists  
**When** this story is complete  
**Then** it becomes a re-export facade pointing to the canonical location

### AC-2: Import Compatibility  
**Given** existing code imports from `@/lib/state/dexie-db`  
**When** the facade is in place  
**Then** all existing imports continue to work without changes

### AC-3: Deprecation Warning
**Given** development mode is active  
**When** code imports from the legacy path  
**Then** a console warning indicates the path is deprecated

### AC-4: Zero Duplicates
**Given** both files exist after the change  
**When** inspecting the legacy file  
**Then** it contains only re-exports, no duplicate class definitions

### AC-5: TypeScript Validation
**Given** the facade is created  
**When** running `pnpm exec tsc --noEmit`  
**Then** zero TypeScript errors occur

## Tasks

- [ ] **T1**: Review current exports from both dexie-db.ts files
- [ ] **T2**: Create backup of `lib/state/dexie-db.ts` (for rollback if needed)
- [ ] **T3**: Replace `lib/state/dexie-db.ts` content with re-export facade
- [ ] **T4**: Add deprecation console.warn for development mode
- [ ] **T5**: Run grep to find all imports from legacy path
- [ ] **T6**: Run TypeScript validation
- [ ] **T7**: Test that application still works (manual smoke test)

## Research Requirements

### Pre-Implementation Research
- **Context7**: Dexie.js re-export patterns
- **Codebase Search**: Find all imports from `@/lib/state/dexie-db`

## Dev Notes

### Architecture Reference
From `architecture.md` Section 4.2.1:
> Selected: Zustand + Dexie Middleware (Option A)
> Aligns with existing `dexie-storage.ts` adapter pattern

### ADR Reference
See: `_bmad-output/project-planning-artifacts/adr-state-consolidation-2026-01-04.md`

### Sprint Change Proposal Reference
See: `_bmad-output/project-planning-artifacts/sprint-change-proposal-state-consolidation-2026-01-04.md`

### Canonical Dexie Location
```
src/infrastructure/persistence/dexie-db.ts  ← CANONICAL (keep as-is)
src/lib/state/dexie-db.ts                   ← CONVERT TO FACADE
```

### Facade Pattern Template
```typescript
// src/lib/state/dexie-db.ts - FACADE
// Re-export from canonical location for backwards compatibility

// Deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] Importing from @/lib/state/dexie-db is deprecated. ' +
    'Use @/infrastructure/persistence/dexie-db instead.'
  );
}

// Re-export everything from canonical location
export * from '@/infrastructure/persistence/dexie-db';
export { default } from '@/infrastructure/persistence/dexie-db';
```

## References

- **ADR-024**: `adr-state-consolidation-2026-01-04.md`
- **Sprint Change Proposal**: `sprint-change-proposal-state-consolidation-2026-01-04.md`
- **Canonical Dexie**: `src/infrastructure/persistence/dexie-db.ts`
- **Legacy Dexie**: `src/lib/state/dexie-db.ts`

## Dev Agent Record

### Session Information
**Agent:** Pending  
**Session Start:** Pending  
**Status:** Awaiting development

### Task Progress
_(To be filled during development)_

### Files Changed
_(To be filled during development)_

### Tests Created
_(To be filled during development)_

### Decisions Made
_(To be filled during development)_

## Code Review

_(To be filled after implementation)_

## Status History

| Date | Time | Status | Agent | Notes |
|------|------|--------|-------|-------|
| 2026-01-04 | 09:30 | drafted | bmad-bmm-sm | Story file created |

---

**Story Status:** `drafted`  
**Next Phase:** Create Context XML → ready-for-dev
