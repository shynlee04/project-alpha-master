# Story: ARC-DUP-IMPROVE-2

## Story Header

**Epic:** ARC-DUP (Eliminate Dexie Duplication)
**Story:** ARC-DUP-IMPROVE-2
**Title:** "Fix dexie-db missing exports/imports"
**Priority:** P0
**Estimated Hours:** 3
**Assigned Agent:** @bmad-bmm-dev
**Status:** in_progress
**Created:** 2026-01-04

## User Story

**As a** Developer,
**I want** to fix 20 dexie-db import/export errors,
**So that** the dexie facade works correctly and all helper files can import types.

## Acceptance Criteria

### AC-1: All 20 dexie-db import/export errors resolved
**Given** 20 TypeScript errors in dexie-db files,
**When** I fix the imports/exports,
**Then** all errors should be resolved.

### AC-2: Facade exports all required types
**Given** dexie-db-types.ts is a facade,
**When** I update the exports,
**Then** all required types should be exported.

### AC-3: Helper files import from correct locations
**Given** 15 helper files import dexie types,
**When** I fix the imports,
**Then** all imports should resolve correctly.

### AC-4: Zero circular dependencies
**Given** import chains can create cycles,
**When** I fix the imports,
**Then** no circular dependencies should exist.

## Task Breakdown

- [ ] **T1:** Fix missing `useActiveAgent` export in use-app-store
- [ ] **T2:** Fix synthesis results type errors (13 errors)
- [ ] **T3:** Verify all helper file imports resolve
- [ ] **T4:** Write 8 tests for facade functionality
- [ ] **T5:** Run TypeScript validation

## Dev Notes

### Known Errors (from validation report)

1. **Missing Export (1 error):**
   - `use-app-store/index.ts`: Missing `useActiveAgent` export

2. **Synthesis Results (13 errors):**
   - Missing `SynthesisResultRecord` type definition
   - Root cause: Missing `synthesisResults` table in ViaGentDatabase type

### Quick Fixes Required

**Fix 1:** Add `useActiveAgent` export to `src/infrastructure/persistence/stores/use-app-store.ts`

**Fix 2:** Add synthesis results to Dexie database schema
