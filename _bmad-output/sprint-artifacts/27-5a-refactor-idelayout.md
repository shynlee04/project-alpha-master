# Story 27-5a: Refactor IDELayout.tsx

**Epic:** [27 - State Architecture Stabilization](../epics/epic-27-state-architecture-stabilization.md)  
**Status:** `drafted`  
**Priority:** P1 (Code Organization)  
**Platform:** Platform A  
**Created:** 2025-12-22T02:31:00+07:00

---

## User Story

**As a** developer  
**I want** IDELayout.tsx to be split into smaller, focused modules  
**So that** the codebase complies with the 250-line limit and is easier to maintain

---

## Background

`IDELayout.tsx` is currently 590 lines, exceeding the 250-line limit per [coding-style.md](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/agent-os/standards/global/coding-style.md).

This story extracts hooks and components to reduce the file to ~150 lines as an orchestrator.

---

## Acceptance Criteria

### AC-1: IDELayout.tsx Line Count
**Given** the refactored IDELayout.tsx  
**When** I count lines  
**Then** the file is ≤ 150 lines

### AC-2: All Extracted Files Under Limit
**Given** the new hook and component files  
**When** I count lines for each  
**Then** each file is ≤ 100 lines

### AC-3: Existing Tests Pass
**Given** the refactored code  
**When** I run `pnpm test -- IDELayout`  
**Then** all 10 existing tests pass

### AC-4: No TypeScript Errors
**Given** the refactored code  
**When** I run `pnpm typecheck`  
**Then** no new TypeScript errors

### AC-5: Build Succeeds
**Given** the refactored code  
**When** I run `pnpm build`  
**Then** build completes successfully

---

## Tasks

### Discovery & Research
- [ ] T1: Review react-resizable-panels docs for pattern best practices

### Hook Extraction
- [ ] T2: Create `hooks/useIDEKeyboardShortcuts.ts` (~25 lines)
- [ ] T3: Create `hooks/useIDEStateRestoration.ts` (~60 lines)
- [ ] T4: Create `hooks/useWebContainerBoot.ts` (~25 lines)
- [ ] T5: Create `hooks/useIDEFileHandlers.ts` (~70 lines)
- [ ] T6: Create `hooks/index.ts` (barrel export)

### Component Extraction
- [ ] T7: Create `PermissionOverlay.tsx` (~30 lines)
- [ ] T8: Move `MinViewportWarning` to `MinViewportWarning.tsx` (~20 lines)

### Orchestrator Refactoring
- [ ] T9: Update `IDELayout.tsx` to import and use extracted modules
- [ ] T10: Remove inline code, keep only orchestration logic

### Testing & Validation
- [ ] T11: Run `pnpm test -- IDELayout` (expect 10 passing)
- [ ] T12: Run `pnpm test` (full suite)
- [ ] T13: Run `pnpm typecheck`
- [ ] T14: Run `pnpm build`

---

## Research Requirements

- **react-resizable-panels**: Confirm hook patterns for imperative refs
- **Zustand**: Confirm selector patterns for extracted hooks

---

## Dev Notes

### Architecture Patterns
- Hooks should receive WorkspaceContext values as parameters
- Components should be pure presentational where possible
- Preserve existing test interfaces

### File Structure After Refactoring
```
src/components/layout/
├── IDELayout.tsx           (~150 lines) - Orchestrator
├── PermissionOverlay.tsx   (~30 lines) - NEW
├── MinViewportWarning.tsx  (~20 lines) - MOVED
├── hooks/
│   ├── index.ts
│   ├── useIDEKeyboardShortcuts.ts
│   ├── useIDEStateRestoration.ts
│   ├── useWebContainerBoot.ts
│   └── useIDEFileHandlers.ts
└── __tests__/
    └── IDELayout.test.tsx  (existing)
```

---

## Dev Agent Record

**Agent:** Antigravity  
**Session:** 2025-12-22T02:31:00+07:00

### Progress:
- [ ] Story created
- [ ] Context XML created
- [ ] Development started
- [ ] Tests passing
- [ ] Code review complete

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| - | - | - |

### Research Conducted:
- Pending

### Decisions Made:
- Pending

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-22T02:31 | drafted | Story file created per story-dev-cycle |
