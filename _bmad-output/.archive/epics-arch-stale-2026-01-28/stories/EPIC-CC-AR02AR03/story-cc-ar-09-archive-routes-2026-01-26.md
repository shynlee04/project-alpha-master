# CC-AR-09: Archive All Legacy Routes

## Story Metadata

| Field | Value |
|--------|--------|
| **Story ID** | CC-AR-09 |
| **Epic ID** | EPIC-CC-AR02AR03 |
| **Title** | Archive All Legacy Routes |
| **Team** | Team A |
| **Priority** | P0 |
| **Status** | READY |
| **Effort** | 1 hour |
| **Depends On** | None (Can run parallel to CC-AR-01) |

---

## User Story

**As a** developer maintaining the codebase,
**I want to** archive all legacy routes that violate the 2-route architecture (ADR-034),
**So that** the route structure is clean and only the 6 canonical routes remain.

---

## Problem Statement

The codebase contains 20+ legacy routes that violate ADR-034's 2-route architecture:

- Multiple workspace-specific routes (`workspace/$projectId.tsx`, `workspace/index.tsx`)
- Separate IDE and Notes routes (`ide.$projectId.tsx`, `notes.$projectId.tsx`)
- Settings, projects, agents as standalone routes
- Fragmented user journey across multiple entry points

### ADR-034 Target Route Structure

```
src/routes/
├── __root.tsx      # ROOT - Keep
├── index.tsx       # REDIRECT - Keep
├── hub.tsx         # HUB - Keep
├── $projectId.tsx  # PROJECT - Keep
├── about.tsx       # INFO - Keep
├── about.lazy.tsx  # INFO - Keep
└── api/            # API - Keep
```

**Target**: Only 6 user-facing routes (plus api/ folder).

---

## Acceptance Criteria

- [ ] All legacy routes moved to `_bmad-ext/.archive/legacy-routes-2026-01-26/`
- [ ] Only 6 user-facing routes remain in `src/routes/` (plus api/ folder)
- [ ] Archive manifest created with file list
- [ ] TypeScript compiles with 0 errors
- [ ] Build completes successfully (`pnpm build`)
- [ ] Route tree regenerates successfully

---

## Files to Archive

```
src/routes/ide.$projectId.tsx      → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/notes.$projectId.tsx    → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/workspace/$projectId.tsx → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/workspace/index.tsx     → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/notes.lazy.tsx          → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/ide.tsx                 → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/agents.tsx              → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/settings.tsx            → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/projects.tsx            → _bmad-ext/.archive/legacy-routes-2026-01-26/
```

---

## Validation Gate

```bash
# Count remaining route files
ls src/routes/*.tsx | wc -l
# Target: ~8 (including about.lazy.tsx, debug.tsx, etc.)

# TypeScript check
pnpm tsc --noEmit

# Build check
pnpm build
```

---

## Implementation Notes

### Archive Process

1. Verify no imports from routes to be archived
2. Create archive directory: `_bmad-ext/.archive/legacy-routes-2026-01-26/`
3. Move files to archive
4. Create `ARCHIVE-MANIFEST.md` with file list and reasons

### Breaking Changes

**This story removes the following routes**:
- `/workspace/$projectId` → Replaced by `/$projectId`
- `/ide/$projectId` → Replaced by `/$projectId` (with plugin system)
- `/notes/$projectId` → Replaced by `/$projectId` (with plugin system)
- `/settings` → Settings now in `/$projectId` or SystemRail
- `/projects` → Hub page now handles project selection

### Facade Exports

If any imports remain from archived files, create facade re-exports in `_bmad-ext/.archive/facades/` for backward compatibility.

---

## Dependencies

**Dependencies**: None (Can run parallel to CC-AR-01)

**Blocks**: CC-AR-10 (Hub cleanup)

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Legacy routes in src/routes/ | 20+ | 0 |
| Canonical routes | 6 | 6 |
| Route file count | ~30 | ~8 |
| TypeScript errors | 0 | 0 |

---

**Created**: 2026-01-26
**Story Type**: Correct-Course (Foundation Reset)
**ADR Reference**: ADR-034 (Project-Centric Architecture)
