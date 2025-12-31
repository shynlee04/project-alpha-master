---
date: 2025-12-31
time: "11:34:00+07:00"
phase: story-dev-cycle
team: Team-A
agent_mode: bmad-bmm-sm
---

# Story 38-10: State Management Cleanup

**Epic:** EPIC-38 (Project Management System Restoration)  
**Story ID:** 38-10  
**Priority:** P0  
**Effort:** 1 day  
**Team:** Team A (UI/Foundation)  
**Status:** drafted  
**Dependencies:** None

---

## User Story

**As a** developer working on the Via-gent IDE,  
**I want** to have consistent state management across all IDE components,  
**So that** state is managed in a single source of truth (Zustand stores) instead of being duplicated in local component state.

---

## Problem Statement

The P1.10 State Management Audit identified a critical P0 issue: [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) duplicates IDE state with local `useState` instead of using `useIDEStore`. This creates:
- State inconsistency between components
- Difficult debugging due to multiple sources of truth
- Potential data loss on component unmount
- Maintenance burden and increased bug surface area

**Reference:** [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md)

---

## Acceptance Criteria

### AC-1: IDELayout State Migration
- [ ] **Given** the current `IDELayout.tsx` uses local `useState` for IDE state  
  **When** the component is refactored  
  **Then** all local state should be replaced with `useIDEStore` selectors and actions

### AC-2: State Architecture Validation
- [ ] **Given** the refactored `IDELayout.tsx`  
  **When** the IDE is loaded and used  
  **Then** state should only flow through Zustand stores (persisted in IndexedDB)

### AC-3: Component Integration Tests
- [ ] **Given** the refactored components  
  **When** tests are run  
  **Then** all existing functionality should be preserved and tests should pass

### AC-4: No Regressions
- [ ] **Given** the state management changes  
  **When** users interact with the IDE (open/close panels, tabs, etc.)  
  **Then** behavior should be identical to before the refactor

### AC-5: Documentation Update
- [ ] **Given** the refactoring is complete  
  **When** the work is reviewed  
  **Then** the state management documentation should be updated to reflect the fix

---

## Implementation Notes

### Current State Architecture (Before)

```typescript
// IDELayout.tsx - PROBLEMATIC PATTERN
export function IDELayout() {
  const [activeFile, setActiveFile] = useState<string | null>(null)  // DUPLICATE!
  const [openFiles, setOpenFiles] = useState<string[]>([])           // DUPLICATE!
  const [panels, setPanels] = useState<PanelConfig[]>([])            // DUPLICATE!
  const [chatVisible, setChatVisible] = useState(true)               // DUPLICATE!
  
  // Should use useIDEStore instead!
}
```

### Target State Architecture (After)

```typescript
// IDELayout.tsx - CORRECT PATTERN
export function IDELayout() {
  const { activeFile, openFiles, panels, chatVisible } = useIDEStore()
  
  // All state mutations go through store actions
  // State is persisted to IndexedDB automatically
}
```

### Key Files to Modify

1. [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx) - Main component
2. [`src/lib/state/ide-store.ts`](src/lib/state/ide-store.ts) - Zustand store (may need extensions)
3. Related components that consume IDELayout state

### Migration Strategy

1. Identify all `useState` calls in `IDELayout.tsx` that duplicate store state
2. Replace with `useIDEStore` selectors
3. Replace `setXxx` calls with store actions
4. Ensure store actions handle all necessary mutations
5. Add any missing store state/persistence if needed
6. Test all user interactions

---

## Tasks

- [ ] **T1:** Audit IDELayout.tsx for duplicated state (use list_files + read_file)
- [ ] **T2:** Review useIDEStore to understand existing state structure
- [ ] **T3:** Add any missing state/actions to useIDEStore if needed
- [ ] **T4:** Replace local useState with useIDEStore selectors
- [ ] **T5:** Update component to use store actions for mutations
- [ ] **T6:** Run TypeScript checks: `pnpm tsc --noEmit`
- [ ] **T7:** Run tests: `pnpm test`
- [ ] **T8:** Manual testing of IDE functionality
- [ ] **T9:** Update state management documentation

---

## Research Requirements

Before implementation, the developer MUST:

1. **Read the P1.10 State Management Audit:**
   - `_bmad-output/state-management-audit-p1.10-2025-12-26.md`

2. **Review Current IDELayout Implementation:**
   - `src/components/layout/IDELayout.tsx`

3. **Review useIDEStore:**
   - `src/lib/state/ide-store.ts`

4. **Query MCP Tools for Best Practices:**
   - Context7: Zustand store patterns for React components
   - DeepWiki: State migration strategies in React

---

## Dev Notes

### Architecture Patterns

- Follow the **State Architecture** section from AGENTS.md
- Use Zustand with IndexedDB persistence (via Dexie)
- All UI state should flow through stores, not local component state

### Code Style

- Use TypeScript interfaces for props (not `type` aliases)
- Follow import order: React → Third-party → @/ → Relative
- Use design tokens from `src/styles/design-tokens.css`
- All strings via i18n `t()` hook

### Testing Strategy

- Tests co-located in `__tests__/` directory
- Mock File System Access API as needed
- Use `vi.mock()` for external dependencies

---

## Dev Agent Record

*(Empty - to be filled by Dev agent during implementation)*

---

## Code Review

*(Empty - to be filled by Code Reviewer)*

---

## Status History

| Date | Time | Agent | Action | Status |
|------|------|-------|--------|--------|
| 2025-12-31 | 11:34:00+07:00 | bmad-bmm-sm | Story created | drafted |
| 2025-12-31 | 11:35:00+07:00 | bmad-bmm-sm | Story validated, context created | ready-for-dev |
| 2025-12-31 | HH:MM:00+07:00 | bmad-bmm-dev | Implementation started | in-progress |
| 2025-12-31 | HH:MM:00+07:00 | bmad-bmm-dev | All tasks complete | review |
| 2025-12-31 | HH:MM:00+07:00 | code-reviewer | Code review complete | done |

---

## References

1. **State Management Audit:** [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md)
2. **AGENTS.md State Architecture:** See "State Architecture (P1.10 Audit Complete)"
3. **useIDEStore:** [`src/lib/state/ide-store.ts`](src/lib/state/ide-store.ts)
4. **IDELayout:** [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx)
5. **Zustand Docs:** https://zustand.docs.pmnd.rs
