# Brownfield Phase 0: Remediation Setup

**Date:** 2026-01-07
**Project:** Via-gent (Project Alpha v2.0)
**Health Score:** 42/100 🔴 Critical

---

## Phase 0 Objectives

1. **Establish remediation framework** - Define processes, priorities, and metrics
2. **Create remediation backlog** - Convert risk register to actionable stories
3. **Setup governance** - Define validation gates and success criteria
4. **Prepare execution environment** - Ensure tools and workflows are ready

---

## Current State Assessment

### Health Metrics

| Metric | Score | Status | Priority |
|--------|-------|--------|----------|
| TypeScript Errors | 1363 | 🔴 Critical | P0 |
| God Stores (>300 lines) | 3 | 🔴 Critical | P0 |
| God Components (>300 lines) | 18+ | 🔴 Critical | P0 |
| Explicit `any` types | 234 | 🔴 Critical | P1 |
| TS Suppressions | 162 | 🔴 Critical | P1 |
| Layer Violations | 20+ | 🟠 Warning | P1 |
| Overall Health | 42% | 🔴 Critical | - |

---

## Remediation Priorities

### P0 - Critical (Must Fix Before Features)

| ID | Issue | Files Affected | Estimated Effort |
|----|-------|----------------|------------------|
| **P0-1** | TypeScript Errors (1363) | Entire codebase | 2-3 weeks |
| **P0-2** | God Store: use-app-store.ts (367 lines) | 1 file | 2-3 days |
| **P0-3** | God Store: plugins-store.ts (316 lines) | 1 file | 1-2 days |
| **P0-4** | God Store: terminal-store.ts (307 lines) | 1 file | 1-2 days |
| **P0-5** | God Component: MonacoEditor.tsx (768 lines) | 1 file | 3-4 days |
| **P0-6** | God Component: resizable.tsx (745 lines) | 1 file | 2-3 days |
| **P0-7** | God Component: NotesPage.tsx (712 lines) | 1 file | 2-3 days |
| **P0-8** | God Component: KnowledgePage.tsx (690 lines) | 1 file | 2-3 days |

### P1 - High (Next Sprint)

| ID | Issue | Files Affected | Estimated Effort |
|----|-------|----------------|------------------|
| **P1-1** | Explicit `any` types (234) | Throughout | 1-2 weeks |
| **P1-2** | TS Suppressions (162) | Throughout | 1 week |
| **P1-3** | Layer Violations (20+) | 20+ components | 1 week |
| **P1-4** | God Components (10 more) | 10 components | 2-3 weeks |
| **P1-5** | Store Fragmentation | Multiple locations | 3-5 days |

---

## Remediation Framework

### 1. TypeScript Remediation Workflow

**Trigger:** 1363 TypeScript errors blocking safe refactoring

**Process:**
```
1. Categorize errors by type
   - Missing imports
   - Type mismatches
   - Missing properties
   - Implicit any

2. Prioritize by impact
   - Breaks production code (P0)
   - Breaks test code (P1)
   - Cosmetic warnings (P2)

3. Fix in batches
   - Run: pnpm typecheck
   - Fix category: e.g., missing imports
   - Verify: pnpm typecheck
   - Commit: "fix(types): resolve missing imports"

4. Validate
   - Zero new errors introduced
   - Build passes
   - Tests pass
```

**Success Criteria:**
- [ ] <100 TypeScript errors
- [ ] Build passes without --force
- [ ] No `@ts-ignore` in production code

---

### 2. God Store Elimination Workflow

**Trigger:** Stores >300 lines violating single responsibility

**Process:**
```
1. Identify responsibilities
   - List all methods and state
   - Group by concern

2. Design slice boundaries
   - Each slice ≤120 lines
   - Single responsibility per slice

3. Extract slices
   - Create slice files
   - Move code to slices
   - Export from combined store

4. Maintain compatibility
   - Create facade exports
   - Update consumers incrementally

5. Validate
   - All tests pass
   - Zero breaking changes
   - Store still works
```

**Slice Template:**
```typescript
// ✅ Slice pattern (≤120 lines)
export const createMySlice: StateCreator<MySlice> = (set, get) => ({
  // State (minimal)
  data: {},
  selectedId: null,

  // Actions (focused)
  setData: (data) => set({ data }),
  setSelected: (id) => set({ selectedId: id }),
  getData: () => get().data,
});
```

**Success Criteria:**
- [ ] All slices ≤120 lines
- [ ] Combined store ≤300 lines
- [ ] Facade maintains backward compatibility
- [ ] All tests pass

---

### 3. God Component Normalization Workflow

**Trigger:** Components >300 lines

**Process:**
```
1. Analyze component
   - Count lines
   - Identify sub-components
   - Find logical boundaries

2. Extract sub-components
   - Create separate component files
   - Move JSX to new components
   - Add props interfaces

3. Extract custom hooks
   - Identify stateful logic
   - Create custom hooks
   - Move business logic to hooks

4. Maintain functionality
   - Export from parent
   - Update consumers
   - Verify props flow

5. Validate
   - Component ≤300 lines
   - Hooks ≤150 lines
   - All tests pass
```

**Success Criteria:**
- [ ] Component ≤300 lines
- [ ] Hooks ≤150 lines
- [ ] Zero breaking changes
- [ ] UI unchanged

---

### 4. Store Consolidation Workflow

**Trigger:** Duplicate stores in multiple locations

**Process:**
```
1. Identify canonical location
   - `src/infrastructure/persistence/stores/` is canonical

2. Create migration map
   - List all legacy locations
   - Map to canonical

3. Create facades
   - Re-export from canonical
   - Mark as @deprecated

4. Update imports
   - Find all imports
   - Update to canonical path
   - Run tests

5. Remove legacy
   - After confirmation period
   - Delete old files
```

**Success Criteria:**
- [ ] All stores in canonical location
- [ ] Zero duplicate store files
- [ ] All imports updated
- [ ] No data loss

---

## Validation Gates

### Before Any Remediation

- [ ] Current tests pass
- [ ] Current build succeeds
- [ ] Git branch created for work
- [ ] Backup point established

### After Each Change

- [ ] `pnpm typecheck` passes (or errors reduced)
- [ ] Related tests pass
- [ ] Manual smoke test of affected feature
- [ ] Git commit with descriptive message

### After Story Completion

- [ ] All acceptance criteria met
- [ ] Zero new TypeScript errors
- [ ] All related tests passing
- [ ] Code review approved
- [ ] Documentation updated

---

## Remediation Backlog

### Sprint 1: Foundation (P0 TypeScript Focus)

**Goal:** Reduce TypeScript errors from 1363 to <500

| Story | Points | Description |
|-------|--------|-------------|
| TS-1 | 8 | Fix all missing import errors |
| TS-2 | 13 | Fix type mismatch errors in core |
| TS-3 | 8 | Fix property access errors |
| TS-4 | 5 | Remove unused `@ts-ignore` |
| TS-5 | 3 | Fix implicit any errors |

**Total:** 37 points (~2 weeks)

### Sprint 2: God Store Elimination (P0 Stores)

**Goal:** Split all god stores into ≤120 line slices

| Story | Points | Description |
|-------|--------|-------------|
| GS-1 | 5 | Split use-app-store.ts (367 lines) |
| GS-2 | 3 | Split plugins-store.ts (316 lines) |
| GS-3 | 3 | Split terminal-store.ts (307 lines) |
| GS-4 | 2 | Validate all stores comply |

**Total:** 13 points (~1 week)

### Sprint 3: God Component Normalization (P0 Components)

**Goal:** Split all god components into ≤300 line components

| Story | Points | Description |
|-------|--------|-------------|
| GC-1 | 8 | Split MonacoEditor.tsx (768 lines) |
| GC-2 | 8 | Split resizable.tsx (745 lines) |
| GC-3 | 5 | Split NotesPage.tsx (712 lines) |
| GC-4 | 5 | Split KnowledgePage.tsx (690 lines) |
| GC-5 | 5 | Split remaining god components |

**Total:** 31 points (~2-3 weeks)

### Sprint 4: Type Safety (P1)

**Goal:** Eliminate explicit `any` types and TS suppressions

| Story | Points | Description |
|-------|--------|-------------|
| TY-1 | 8 | Replace explicit `any` with proper types |
| TY-2 | 5 | Remove `@ts-ignore` suppressions |
| TY-3 | 3 | Add proper type guards |

**Total:** 16 points (~1 week)

---

## Execution Guidelines

### Branching Strategy

```
main (protected)
  └── remediation/brownfield-sprint-1 (feature branch)
      ├── gs-01-split-use-app-store
      ├── gs-02-split-plugins-store
      └── gs-03-validate-stores
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `fix` - Bug fix
- `refactor` - Code restructuring
- `split` - Split god store/component
- `types` - TypeScript fixes
- `docs` - Documentation

**Examples:**
```
refactor(stores): split use-app-store into focused slices

split(components): extract MonacoEditor sub-components

fix(types): resolve missing imports in agent system
```

---

## Risk Management

### Rollback Strategy

If remediation breaks critical functionality:

1. **Immediately** rollback to last known good commit
2. **Assess** what went wrong
3. **Adjust** approach based on learning
4. **Re-attempt** with adjusted strategy

### Definition of Done

A remediation story is complete when:

- [ ] All acceptance criteria met
- [ ] Zero regression bugs
- [ ] TypeScript errors reduced (not increased)
- [ ] Tests updated and passing
- [ ] Documentation updated
- [ ] Code review approved

---

## Next Steps

1. **Review this document** - Ensure remediation approach is sound
2. **Prioritize stories** - Based on team capacity and impact
3. **Begin Sprint 1** - TypeScript error reduction
4. **Track progress** - Update health metrics weekly

---

## Related Documentation

- [Master Risk Register](../quality/reports/MASTER-RISK-REGISTER.md) - Full risk catalog
- [State Management](../documentation/state-management.md) - Store patterns
- [Component Inventory](../documentation/component-inventory.md) - Component catalog
