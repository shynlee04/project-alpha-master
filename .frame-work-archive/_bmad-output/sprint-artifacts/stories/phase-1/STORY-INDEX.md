---
sprint: "PHASE-1-VERTICAL-UNBLOCKING"
updated: "2026-01-09T19:00:00+07:00"
status: "ACTIVE"
focus: "IDE and Notes spaces ONLY"
---

# Phase 1 Story Index

> **CRITICAL**: Focus ONLY on P1-xx prefixed stories. EPIC-3x stories are PAUSED.

## Sprint Strategy

1. **Vertical Unblocking**: Clear user journey down single vertical line
2. **IDE and Notes ONLY**: Study and Knowledge are deferred
3. **Ignore EPIC-3x**: All EPIC-30, EPIC-31, EPIC-38 etc. are NOT active

## Phase 1 Stories

| Story | Title | Priority | Status | Points | Depends On |
|-------|-------|----------|--------|--------|------------|
| **P1-01** | Simplify Notes Route to 2 Patterns | P0 | drafted | 2 | - |
| **P1-02** | Simplify IDE Route to 2 Patterns | P0 | drafted | 2 | - |
| **P1-03** | Create Temp Project Auto-Flow | P0 | pending | 3 | P1-02 |
| **P1-04** | Fix Gemini API Hardcoding | P0 | pending | 2 | - |
| **P1-05** | Agent Config per Workspace | P1 | pending | 3 | P1-04 |
| **P1-06** | Investigate IDE Full CRUD | P1 | pending | 4 | P1-02, P1-03 |
| **P1-07** | Investigate Notes Full CRUD | P1 | pending | 4 | P1-01 |
| **P1-08** | Trace Vault → AI Chain | P0 | drafted | 2 | - |

**Total Points**: 22
**Estimated Effort**: ~22 hours

## Story Files

```
_bmad-output/sprint-artifacts/stories/phase-1/
├── P1-01-simplify-notes-routes.md
├── P1-02-simplify-ide-routes.md
├── P1-03-temp-project-auto-flow.md
├── P1-04-fix-gemini-hardcoding.md
├── P1-05-agent-config-per-workspace.md
├── P1-06-investigate-ide-full-crud.md
├── P1-07-investigate-notes-full-crud.md
└── P1-08-trace-vault-ai-chain.md
```

## Execution Order

```
PARALLEL TRACK A:          PARALLEL TRACK B:
P1-01 (Notes routing)      P1-02 (IDE routing)
   │                          │
   └──→ P1-07 (Notes CRUD)    ├──→ P1-03 (Temp project)
                              │       │
                              │       └──→ P1-06 (IDE CRUD)
                              │
PARALLEL TRACK C:             │
P1-04 (Gemini fix) ───────────┤
   │                          │
   └──→ P1-08 (Vault-AI trace)│
          │                   │
          └──→ P1-05 (Agent config per workspace)
```

## Phase 1 Gate Criteria

- [ ] `/notes` loads without "Maximum update depth exceeded"
- [ ] `/ide` loads with temp project auto-created
- [ ] API key from vault reaches AI endpoint
- [ ] Zero infinite loops
- [ ] Gemini API is configurable (not hardcoded)

## What Previous Work is Relevant?

| Previous Work | Relevant? | Reason |
|--------------|-----------|--------|
| EPIC-30-01 (ErrorBoundaries) | ✅ Yes | Prevents WSOD |
| EPIC-30-03 (Redirect loops) | ✅ Yes | Same problem as P1-01/P1-02 |
| EPIC-30-04 (BYOK vault) | ✅ Yes | Relates to P1-08 |
| EPIC-38-xx | ❌ No | Architectural polish, not unblocking |
| Diagnostics/vault-ai-chain-trace.md | ✅ Yes | Context for P1-08 |
| Diagnostics/journey-hub-to-*.md | ✅ Yes | Context for P1-01/P1-02 |

## What to Ignore

- All EPIC-3x stories (30, 31, 32, 33, 34, 35, 36, 37, 38)
- Study workspace analysis
- Knowledge workspace analysis
- Domain entity creation (38-05x)
- Clean architecture compliance (38-xx)

---

*Focus on making IDE and Notes work. Everything else is noise.*
