# Epic 27: State Architecture Stabilization

**Goal:** Unify state management, implement Event Bus across all components, and fix architectural root causes of recurring regressions.

**Priority:** 🔴 P0 - CRITICAL (Blocks All Development)  
**Stories:** 5  
**Points:** 21  
**Duration:** 1-2 weeks

---

## Background

After 3 sprint change proposals (v5, v6, v7), we identified that current bugs are symptoms of deeper architectural issues:

1. **State Management Fragmentation** - 3 competing systems (TanStack Store, React Context, IndexedDB)
2. **Event Bus Underutilized** - Components don't use Event Bus for coordination
3. **Missing Abstraction Layers** - Direct browser API usage without interfaces

See: [Architectural Stabilization Proposal](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/architectural-stabilization-proposal-v1-2025-12-21.md)

---

## Stories

| Story | Title | Priority | Points | Status |
|-------|-------|----------|--------|--------|
| 27-1 | Migrate State to Zustand + Dexie.js (Infrastructure) | P0 | 5 | ✅ done |
| 27-1b | Component Migration to Zustand + Dexie.js | P0 | 8 | ✅ done |
| 27-1c | Persistence Layer Migration (idb → Dexie) | P0 | 5 | 🔄 in-progress |
| 27-2 | Event Bus Integration Across Components | P0 | 5 | backlog |
| 27-3 | Fix TailwindCSS 4.x CSS Z-Index Stacking | P1 | 3 | backlog |
| 27-4 | Fix Terminal pnpm Version Handling | P1 | 3 | backlog |
| 27-5 | Fix Production SSR Entry Error | P0 | 5 | backlog |

**Total:** 7 stories, 34 points

---

## Tech Stack Changes

### Dependencies to ADD:
```bash
pnpm add zustand dexie@^4.0.0
```

### Dependencies to REMOVE:
```bash
pnpm remove @tanstack/react-store idb
```

### Files to CREATE:
```
src/lib/state/
├── ide-store.ts         # Zustand store with persist middleware
├── dexie-storage.ts     # Dexie.js storage adapter for Zustand
└── index.ts             # Public API
```

### Files to MODIFY:
```
src/lib/persistence/db.ts           # Replace idb with Dexie
src/hooks/useIdeStatePersistence.ts # Use new Zustand store
src/components/ide/FileTree/        # Add Event Bus subscriptions
src/components/layout/IDELayout.tsx # Simplify state management
```

---

## Success Criteria

- [ ] Single source of truth for IDE state (Zustand store)
- [ ] State persists to Dexie.js automatically via middleware
- [ ] FileTree subscribes to Event Bus, doesn't collapse on file edit
- [ ] Context menu works (z-index fixed)
- [ ] Terminal handles pnpm version mismatch gracefully
- [ ] Production site loads without "Something went wrong" error
- [ ] All existing tests pass
- [ ] New tests cover state persistence edge cases

---

## Dependencies

- **Blocks:** Epic 23 (UX/UI), Epic 25 (AI Foundation), Epic 26 (Agent Dashboard)
- **Blocked by:** None (P0 priority)

---

## References

- [Tech Debt Report 2025-12-21](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/analysis/tech-debt-architecture-gaps-report-2025-12-21.md)
- [Stack Enhancement Report 2025-12-21](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/analysis/stack-enhancement-report-2025-12-21.md)
- [Event Bus Architecture](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/architecture/event-bus-architecture-epic-10.md)

---

## Developer Notes for Next Session (2025-12-21)

### Current Progress

| Story | Status | Core Work Done |
|-------|--------|----------------|
| 27-1 | ✅ Done | Zustand + Dexie.js infrastructure |
| 27-1b | ✅ Done | Component migration, removed @tanstack/react-store |
| 27-1c | 🔄 In-Progress | idb → Dexie migration + AI Foundation |
| 27-2 | 📋 Backlog | Event Bus integration |
| 27-3 | 📋 Backlog | TailwindCSS z-index fix |
| 27-4 | 📋 Backlog | Terminal pnpm handling |
| 27-5 | 📋 Backlog | Production SSR entry fix |

### Files Modified in Story 27-1c

| File | Lines | Change |
|------|-------|--------|
| `lib/state/dexie-db.ts` | ~240 | AI tables (taskContexts, toolExecutions), schema v3, DB name |
| `lib/state/ide-store.ts` | ~340 | AI selectors (selectForAIContext, getIDEStoreState) |
| `lib/persistence/db.ts` | ~200 | IdbCompatWrapper for backward compatibility |
| `lib/workspace/project-store.ts` | ~380 | Removed idb import, native IndexedDB for legacy |
| `lib/workspace/conversation-store.ts` | ~140 | Full rewrite to Dexie-compatible API |
| `lib/workspace/ide-state-store.ts` | ~120 | Fixed deprecated transaction API |

### Known Issues (Pre-existing, out of scope)

- Vitest import errors in test files (need vitest types fix)
- IDELayout type errors (lines 178-180, 216, 231, 524)
- Cloudflare deploy.yml context warnings (lines 44-45)

### Next Actions

1. **Complete Story 27-1c**: Run `pnpm test`, `pnpm build`
2. **Start Story 27-2**: Event Bus wiring across components
3. **Unblock Epic 25**: AI Foundation (depends on 27-1c completion)

### Architecture Reference

```
┌─────────────────────────────────────────────────────┐
│ lib/state/dexie-db.ts (Schema v3)                   │
│ ├── projects, ideState, conversations               │
│ ├── taskContexts (Epic 25 AI prep)                  │
│ └── toolExecutions (Epic 25 AI prep)                │
├─────────────────────────────────────────────────────┤
│ lib/persistence/db.ts - IdbCompatWrapper            │
│ get<T>, getAll<T>, put, delete (backward compat)    │
├─────────────────────────────────────────────────────┤
│ Consumers: project-store, conversation-store,       │
│           ide-state-store (deprecated)              │
└─────────────────────────────────────────────────────┘
```
