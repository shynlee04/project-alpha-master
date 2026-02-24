---
sprint: course-correction-sprint-2026-01-07
title: Course Correction Sprint Planning Framework
phase: planning
created: 2026-01-07T11:30:00+07:00
created_by: bmad-core-bmad-master
based_on:
  - client-side-rag-platform-audit-2026-01-07.md
  - routing-analysis-workflow (all 6 steps)
trigger: correct-course
---

# SPRINT PLANNING FRAMEWORK - COURSE CORRECTION

## 🎯 SPRINT OVERVIEW

**Sprint Goal**: Stabilize critical routing and state management issues blocking user access to Notes, Knowledge, Study workspaces and Settings page.

**Duration**: 5 days (40 hours)
**Team**: Both Team A (UI/Foundation) and Team B (Backend/Agent) for parallel execution
**Risk Level**: HIGH - P0 blocking issues affecting core functionality

---

## 📋 EPIC BREAKDOWN

### Epic A: Critical Fixes (P0) - 2 days
**Goal**: Unblock Settings/Study pages and prevent infinite redirect loops

| Story | Title | File | Estimate | Priority |
|-------|-------|------|----------|----------|
| **A-1** | Fix Missing Export | `useProjectStore.ts` | 1h | P0 |
| **A-2** | Add Redirect Loop Prevention | `workspace-access-helper.tsx` | 2h | P0 |
| **A-3** | Fix Credential Vault Crypto | credential-vault.ts | 3h | P0 |
| **A-4** | Add Error Boundaries (3 routes) | notes/knowledge/study.lazy.tsx | 2h | P0 |

**Total Effort**: 8 hours (1 day)

### Epic B: State Consolidation (P1) - 2 days
**Goal**: Eliminate god stores, reduce Hub complexity

| Story | Title | File(s) | Estimate | Priority |
|-------|-------|---------|----------|----------|
| **B-1** | Consolidate Hub State | `HubHomePage.tsx` (440 lines) | 4h | P1 |
| **B-2** | Split Provider Store | `provider-crud-slice.ts` (233 lines) | 3h | P1 |
| **B-3** | Route Standardization | All 4 workspace routes | 2h | P1 |
| **B-4** | Workspace Access Refactor | `workspace-access-helper.tsx` (524 lines) | 4h | P1 |

**Total Effort**: 13 hours (~1.5 days)

### Epic C: BYOK Redesign (P0) - 1 day
**Goal**: Implement secure key vault with cross-workspace access

| Story | Title | Component | Estimate | Priority |
|-------|-------|-----------|----------|----------|
| **C-1** | Design Key Vault Interface | New file | 2h | P0 |
| **C-2** | Implement Secure Storage | credential-vault.ts | 4h | P0 |
| **C-3** | Cross-Workspace Key Sharing | New component | 2h | P0 |

**Total Effort**: 8 hours (1 day)

### Epic D: Validation & Testing (P1) - 1 day
**Goal**: Ensure fixes work across all workspaces

| Story | Title | Coverage | Estimate |
|-------|-------|----------|----------|
| **D-1** | Integration Tests | Critical paths | 3h |
| **D-2** | Browser Testing | All workspaces | 3h |
| **D-3** | Regression Tests | Previous fixes | 2h |

**Total Effort**: 8 hours (1 day)

---

## 🔄 PARALLEL EXECUTION STRATEGY

### Day 1: Critical Fixes (Epic A) - Parallel

**Team A** (UI/Foundation):
- **A-4**: Add Error Boundaries to Notes/Knowledge/Study routes
  - Create `WorkspaceErrorBoundary` wrapper
  - Apply to all 3 routes
  - Test WSOD resolution

**Team B** (Backend/Agent):
- **A-1**: Fix `useProjectStats` missing export in `useProjectStore.ts`
- **A-2**: Add redirect loop prevention in `workspace-access-helper.tsx`
- **A-3**: Fix Credential Vault crypto implementation

**Sync Point**: End of Day 1 - Settings/Study pages must load, no redirect loops

### Day 2-3: State Consolidation (Epic B) - Staggered

**Team A** (UI/Foundation):
- **B-1**: Consolidate Hub state (8 useState → useReducer)
- **B-3**: Route standardization (all routes use same pattern)

**Team B** (Backend/Agent):
- **B-2**: Split provider store into slices
- **B-4**: Refactor workspace access helper (524 lines → modular)

**Sync Point**: End of Day 3 - Hub simplified, routes consistent

### Day 4: BYOK Redesign (Epic C) - Team B Only

**Team B** (Backend/Agent):
- **C-1**: Design Key Vault interface with encryption
- **C-2**: Implement secure storage with Dexie
- **C-3**: Add cross-workspace key sharing

**Team A** (UI/Foundation):
- Start validation testing prep

**Sync Point**: End of Day 4 - Keys persist across sessions

### Day 5: Validation (Epic D) - Both Teams

**Both Teams**:
- **D-1**: Integration tests
- **D-2**: Browser testing (all workspaces)
- **D-3**: Regression tests

**Sync Point**: End of Day 5 - All acceptance criteria met

---

## 📊 STORY TEMPLATES

### Template for Critical Fix Stories

```markdown
# Story A-{N}: {Title}

**Priority**: P0
**File**: {path/to/file.tsx}
**Lines**: {line_numbers}
**Estimated**: {hours}h

## Problem
{Description of the blocking issue}

## Evidence
{Link to audit finding or error screenshot}

## Acceptance Criteria
- [ ] {Specific, testable criterion 1}
- [ ] {Specific, testable criterion 2}
- [ ] Zero TypeScript errors (production code)
- [ ] Browser testing passes

## Implementation Notes
{Technical guidance for implementing agent}

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Component smoke test
# Navigate to {path} and verify no console errors
```
```

---

## 🎯 SUCCESS METRICS

### Technical Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Settings/Study load time | <2s | Browser DevTools |
| Redirect loop count | 0 | Manual testing |
| Error boundary coverage | 100% | Code scan |
| BYOK maturity | >80% | Audit checklist |
| TypeScript errors | 0 (prod) | `pnpm typecheck` |

### User Experience Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Settings page accessible | ✅ | Can load /settings |
| Study page accessible | ✅ | Can load /study |
| Notes direct access | ✅ | `/notes` loads editor |
| Cross-workspace keys | ✅ | Key works in all workspaces |
| Zero WSOD | ✅ | No white screen crashes |

---

## 🚨 RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes during refactoring | Medium | High | Facade pattern for backward compatibility |
| Dexie migration failure | Low | Critical | Backup before migration, rollback plan |
| Redirect loop introduces new bugs | Medium | High | Thorough testing before merge |
| BYOK encryption incompatible | Low | Medium | Fallback to localStorage if needed |

---

## 📋 SPRINT TRACKING

### Daily Standup Template

```yaml
# day-{N}-standup.yaml
date: "{YYYY-MM-DD}"
day: {N}

completed:
  - story: "{ID}"
    status: "DONE | BLOCKED | IN_PROGRESS"
    notes: "{brief update}"

blocked:
  - story: "{ID}"
    blocker: "{description}"
    needs: "{resource/help}"

next:
  - story: "{ID}"
    owner: "{Team A | Team B}"
    priority: "{P0 | P1}"
```

---

## 🎯 SPRINT COMPLETION CHECKLIST

### Before Sprint End
- [ ] All P0 stories completed
- [ ] Settings page loads without WSOD
- [ ] Study page loads without WSOD
- [ ] `/notes` direct access works
- [ ] Zero redirect loops
- [ ] API keys persist across sessions
- [ ] All workspace routes have ErrorBoundary
- [ ] TypeScript passes (production code only)
- [ ] Browser testing completed for all workspaces
- [ ] AGENTS.md updated with new paths

### Sprint Retrospective
Generate: `_bmad-output/sprint-artifacts/course-correction-retro-{YYYY-MM-DD}.md`

---

## MENU OPTIONS

**[S]** Start Sprint - Day 1 (Epic A - Critical Fixes)
**[D]** Delegate Story A-1 to Team B
**[D]** Delegate Story A-4 to Team A
**[MH]** Redisplay Menu Help
**[DA]** Exit workflow

---

*Sprint planning framework ready. Execute sprint stories in priority order.*
