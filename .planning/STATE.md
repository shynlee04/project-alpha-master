# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Users can interact with AI that reads, writes, and understands their project files — all client-side with zero data sent to our servers.
**Current focus:** Phase A — BYOK Foundation

## ⚠️ ROADMAP CHANGE NOTICE

**2026-02-01:** Roadmap restructured from phase-based (0-5) to feature-group-based (A-E).

Previous approach failed because:
- Phases marked complete while 3,900+ violations remained
- No isolation strategy — fixes broke working features
- No bounce-back governance

**New approach:** Fix by feature group with clear isolation boundaries.
- See: `.planning/ROADMAP.md` (updated structure)
- Archive: `.planning/ROADMAP-2026-02-01-ARCHIVE.md` (previous structure)

## Current Position

Phase: A of 5 (BYOK Foundation)
Plan: 2 of 4 (Wave 1 complete: A-01 + A-02)
Status: Wave 1 complete, ready for Wave 2 (A-03)
Last activity: 2026-02-01 — Completed A-01-PLAN.md (credential vault infrastructure)

Progress: ██░░░░░░░░ 20% (Wave 1: A-01 + A-02 complete)

### Phase Summary

| Phase | Name | Status | Depends On |
|-------|------|--------|------------|
| **A** | BYOK Foundation | 🔴 Ready | None |
| **B** | AI Gateway | 🔴 Blocked | Phase A |
| **C** | Notes AI | 🔴 Blocked | Phase B |
| **D** | Agentic | ⏸️ Deferred | Phase C |
| **E** | RAG | ⏸️ Deferred | Phase D |

### Working Features (DO NOT BREAK)

| Feature | Health | Notes |
|---------|--------|-------|
| Project CRUD | ~70% | Working, has violations but functional |
| FileTree | ~70% | Working, has violations but functional |
| FSA Sync | ~60% | Working on desktop |
| Hub Dashboard | Working | Display logic works |
| Notes UI | Working | Editor works, AI stubbed |

## Accumulated Context

### Decisions

**2026-02-01 (Phase 0 Closure):**
- Phase 0 closed after Plan 06
- Plans 07+ superseded by feature-group approach
- Final baseline captured: 233 TS errors, 1,295 violation refs
- Handoff to Phase A complete
- See: `.planning/phases/00-stabilization/00-07-SUMMARY.md`

**2026-02-01 (Roadmap Restructure):**
- Feature-group isolation over violation-count fixing
- BYOK first (nothing works without API keys)
- AI Gateway second (unify fragmented endpoints)
- Notes AI third (user priority)
- Agentic/RAG deferred (complex, not needed yet)
- Schema changes additive, not breaking (see THREAD-V2-DESIGN.md)

**Previous Phase 0-1 Decisions (archived):**
- See `.planning/ROADMAP-2026-02-01-ARCHIVE.md`

### What's Stubbed

| Component | File | Restore In |
|-----------|------|------------|
| CredentialVault | `credential-vault.ts` | ✅ Phase A (A-01 complete) |
| NoteAIService | `note-ai-service.ts` | Phase C |
| ToolPermissions | `tool-permissions.ts` | Phase D |
| ProviderSettings | `ProviderSettings.tsx` | Phase A |

### What's Fragmented

- 15+ AI endpoint patterns (unify in Phase B)
- Hardcoded API key in `linkage-ai-enhancer.ts` (remove in Phase B)

### Violations Status (Baseline from Phase 0 Closure)

| Type | Count | Action |
|------|-------|--------|
| TypeScript errors | 233 | Baseline for Phase A |
| workspaceBindings | 156 | Incremental, not blocking |
| workspaceId | 553 | Mostly DB schema (legitimate) |
| @/lib/ imports | 586 | Incremental, not blocking |

**Total violations:** 1,295 references to migrate incrementally

## Session Continuity

Last session: 2026-02-01T15:33:03Z
Stopped at: Completed A-01-PLAN.md (Wave 1 complete with A-02)
Resume: Execute Wave 2 (A-03) - ProviderSettings UI

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| `.planning/ROADMAP.md` | **PRIMARY** — Feature-group remediation roadmap |
| `.planning/PROJECT.md` | Project context and requirements |
| `.planning/SOURCE-OF-TRUTH.md` | Canonical architecture |
| `.planning/phases/00-stabilization/00-07-SUMMARY.md` | Phase 0 closure summary with baseline |
| `.planning/schemas/THREAD-V2-DESIGN.md` | Schema design for Phase D |
| `.planning/schemas/SCHEMA-OVERVIEW.md` | Schema inventory |
| `.planning/ROADMAP-2026-02-01-ARCHIVE.md` | Previous phase 0-5 roadmap (reference) |

---

*Updated: 2026-02-01T15:33:03Z after A-01 completion (Wave 1 complete)*
