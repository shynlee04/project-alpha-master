# Story Index

**Last Updated:** 2026-01-09T20:48:00+07:00
**Updated By:** Team A - CYCLE 2 Governance

---

## Quick Stats

| Status | Count |
|--------|-------|
| DONE | 12 |
| IN_PROGRESS | 2 |
| NOT_STARTED | 8 |
| BLOCKED | 1 |

---

## Active Stories (Current Sprint)

| ID | Title | Status | Epic | Sprint | Last Updated |
|----|-------|--------|------|--------|--------------|
| FS-05 | FileLockService Implementation | IN_PROGRESS | EPIC-FS | phase-2 | 2026-01-09 |
| FS-06 | Unified CRUD Operations | NOT_STARTED | EPIC-FS | phase-2 | 2026-01-09 |
| 39-01 | 8-bit Design Audit | NOT_STARTED | EPIC-39 | phase-2 | 2026-01-09 |
| 39-02 | Mobile-Friendly Redesign | NOT_STARTED | EPIC-39 | phase-2 | 2026-01-09 |

---

## In Review Stories

| ID | Title | Status | Epic | Reviewer | Last Updated |
|----|-------|--------|------|----------|--------------|
| P1.5-04 | Notes Reactivity Fix | CODE_REVIEW | Phase-1.5 | Pending | 2026-01-09 |

---

## Completed Stories

### EPIC-38 (Architecture Remediation)

| ID | Title | Completed | File |
|----|-------|-----------|------|
| 38-01 | Error Boundaries | 2026-01-08 | [story-38-01.md](story-38-01.md) |
| 38-02 | Move FS Adapters | 2026-01-08 | [story-38-02.md](story-38-02.md) |
| 38-03 | Storage Type Consolidation | 2026-01-08 | [story-38-03.md](story-38-03.md) |
| 38-04 | Interface Standardization | 2026-01-08 | [story-38-04.md](story-38-04.md) |
| 38-05 | Adapter Registry | 2026-01-08 | [story-38-05.md](story-38-05.md) |
| 38-05b | Registry Enhancements | 2026-01-08 | [story-38-05b.md](story-38-05b.md) |
| 38-05c | Registry Testing | 2026-01-08 | [story-38-05c.md](story-38-05c.md) |
| 38-05d | Registry Documentation | 2026-01-08 | [story-38-05d.md](story-38-05d.md) |
| 38-06 | Migration Cleanup | 2026-01-08 | [story-38-06.md](story-38-06.md) |
| 38-08 | Final Validation | 2026-01-08 | [story-38-08.md](story-38-08.md) |

### EPIC-30 (Stability)

| ID | Title | Completed | File |
|----|-------|-----------|------|
| 30-01 | Error Boundaries | 2026-01-05 | [story-30-01.md](story-30-01.md) |

### EPIC-31 (State Management)

| ID | Title | Completed | File |
|----|-------|-----------|------|
| 31-01 | Store Consolidation | 2026-01-04 | [story-31-01.md](story-31-01.md) |

---

## Phase-1 Stories (Archived)

Located in: `stories/phase-1/`

| ID | Title | Status | File |
|----|-------|--------|------|
| P1-01 | Simplify Notes Routes | DONE | [phase-1/P1-01-simplify-notes-routes.md](phase-1/P1-01-simplify-notes-routes.md) |
| P1-02 | Simplify IDE Routes | DONE | [phase-1/P1-02-simplify-ide-routes.md](phase-1/P1-02-simplify-ide-routes.md) |
| P1-03 | Temp Project Auto Flow | DONE | [phase-1/P1-03-temp-project-auto-flow.md](phase-1/P1-03-temp-project-auto-flow.md) |
| P1-04 | Fix Gemini Hardcoding | DONE | [phase-1/P1-04-fix-gemini-hardcoding.md](phase-1/P1-04-fix-gemini-hardcoding.md) |
| P1-05 | Agent Config Per Workspace | PARTIAL | [phase-1/P1-05-agent-config-per-workspace.md](phase-1/P1-05-agent-config-per-workspace.md) |
| P1-06 | IDE Full CRUD | NOT_STARTED | [phase-1/P1-06-investigate-ide-full-crud.md](phase-1/P1-06-investigate-ide-full-crud.md) |
| P1-07 | Notes Full CRUD | NOT_STARTED | [phase-1/P1-07-investigate-notes-full-crud.md](phase-1/P1-07-investigate-notes-full-crud.md) |
| P1-08 | Vault AI Chain | NOT_STARTED | [phase-1/P1-08-trace-vault-ai-chain.md](phase-1/P1-08-trace-vault-ai-chain.md) |

---

## Epic Summary

| Epic | Status | Stories Total | Done | Progress |
|------|--------|---------------|------|----------|
| EPIC-FS | IN_PROGRESS | 14 | 4 | 28.6% |
| EPIC-39 | NOT_STARTED | 5 | 0 | 0% |
| EPIC-38 | DONE | 10 | 10 | 100% |
| EPIC-30 | DONE | 1 | 1 | 100% |
| EPIC-31 | DONE | 1 | 1 | 100% |
| Phase-1 | PARTIAL | 8 | 4 | 50% |

---

## Governance Rules

### Story Lifecycle States

```
NOT_STARTED → CONTEXT_CREATED → IN_PROGRESS → CODE_REVIEW → TESTING → DONE
```

### Naming Convention

- Standard: `story-{epic}-{nn}.md` (e.g., `story-38-01.md`)
- Phase-specific: `{phase}-{nn}-{slug}.md` (e.g., `P1-03-temp-project-auto-flow.md`)
- Epic-specific: `epic-{id}-story-{nn}-{slug}.md`

### Policies

| Policy | Rule |
|--------|------|
| Max active stories | 8 per epic |
| Story TTL | 48h if inactive, requires review |
| Code review required | Yes, before DONE |
| Context file required | Yes, before IN_PROGRESS |
