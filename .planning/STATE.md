# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Users can interact with AI that reads, writes, and understands their project files — all client-side with zero data sent to our servers.
**Current focus:** Strategic Rebuild R-0 — Foundation

## ⚠️ STRATEGIC REBUILD DECISION

**2026-02-02:** Pivoted from A-E remediation to Strangler Fig rebuild.

Previous A-E approach failed because:
- 74,925 lines in contaminated src/lib/ (27% of codebase)
- Deep workspaceId contamination (556 refs) at DATABASE level
- Estimated gradual migration: 3-6 months (may never complete)
- Every phase required its own "prerequisites"

**New approach:** Strangler Fig Pattern - build clean alongside old, port features incrementally.
- See: `.planning/strategic-rebuild/STRATEGIC-REBUILD-ROADMAP-2026-02-02.md`
- Estimated rebuild: 3-4 weeks to clean architecture + feature parity

## Current Position

Phase: Strategic Rebuild R-0 (pending approval)
Status: Pivot from A-E to Strangler Fig rebuild
Last activity: 2026-02-02 — Strategic Rebuild decision

Progress: ░░░░░░░░░░ 0% Strategic Rebuild (awaiting approval)

### Strategic Rebuild Phases

| Phase | Name | Status | Depends On |
|-------|------|--------|------------|
| **R-0** | Foundation | 🟡 Pending approval | None |
| **R-1** | Platform Layer | 🔴 Not started | R-0 |
| **R-2** | Port Infrastructure | 🔴 Not started | R-1 |
| **R-3** | Port Modules | 🔴 Not started | R-2 |
| **R-4** | Cutover | 🔴 Not started | R-3 |
| **R-5** | Resume Roadmap | 🔴 Not started | R-4 |

### Previous A-E Phases (Preserved)

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| **A** | BYOK Foundation | ✅ COMPLETE | Will be ported in R-2 |
| **B** | AI Gateway | ⏸️ Suspended | Resume in R-5 |
| **C** | Notes AI | ⏸️ Suspended | Resume in R-5 |
| **D** | Agentic | ⏸️ Suspended | Resume in R-5 |
| **E** | RAG | ⏸️ Suspended | Resume in R-5 |

### What Gets Preserved

- **Phase A work** (BYOK, CredentialVault, ModelLoader) → Port in R-2
- **Users' data** → Dexie schema compatibility maintained
- **Working features** (FSA, BlockNote) → Port in R-3
- **plugins/ code** (5,973 lines) → Port to src/platform/ and src/modules/

## Accumulated Context

### Decisions

**2026-02-02 (Strategic Rebuild Decision):**
- Pivoted from gradual A-E remediation to Strangler Fig rebuild
- Rationale: 74,925 lines in contaminated src/lib/, deep workspaceId contamination (556 refs)
- Estimated 3-4 weeks to clean architecture vs 3-6 months gradual (may never complete)
- Phase A work preserved, will be ported in R-2
- See: `.planning/strategic-rebuild/STRATEGIC-REBUILD-ROADMAP-2026-02-02.md`

**2026-02-02 (Phase A Completion):**
- Phase A COMPLETE with user approval
- All A-04 gaps resolved (GAP-A04-001, GAP-A04-002, GAP-A04B-003)
- API-first model loading implemented and verified working
- Hardcoded models bypass removed, file archived
- Ready for Phase B (AI Gateway) — now suspended for rebuild
- See: `.planning/phases/A-byok-foundation/A-04B-SUMMARY-2026-02-02.md`

**2026-02-01 (A-04 Verification):**
- A-04 verification complete - governance checks passed
- User verified BYOK functionality works
- Phase A core infrastructure confirmed (A-01 through A-04)
- See: `.planning/phases/A-byok-foundation/A-04-SUMMARY.md`

**2026-02-01 (Roadmap Restructure):**
- Feature-group isolation over violation-count fixing
- BYOK first (nothing works without API keys)
- Schema changes additive, not breaking (see THREAD-V2-DESIGN.md)

**Previous Phase 0-1 Decisions (archived):**
- See `.planning/ROADMAP-2026-02-01-ARCHIVE.md`

### What's Stubbed

| Component | File | Restore In |
|-----------|------|------------|
| CredentialVault | `credential-vault.ts` | ✅ Phase A (A-01 complete) |
| Model Loading | `provider-models-slice.ts` | ✅ Phase A (A-04B complete) |
| NoteAIService | `note-ai-service.ts` | R-5 (Phase C) |
| ToolPermissions | `tool-permissions.ts` | R-5 (Phase D) |
| ProviderSettings | `ProviderSettings.tsx` | ✅ Phase A (A-03 complete) |

### Contamination Status (Why Rebuild)

| Type | Count | Impact |
|------|-------|--------|
| src/lib/ | 74,925 lines | BANNED path, 27% of codebase |
| @/lib/ imports | 660 | Must all be removed |
| workspaceId refs | 556 | BANNED term, DATABASE level |
| workspaceBindings | 156 | BANNED term, cascades everywhere |
| TypeScript errors | 160+ | Schema conflicts from dual terminology |

### Governance Documents

| Document | Purpose |
|----------|---------|
| `.planning/governance/GAPS-TRACKER.yaml` | Track undocumented decisions, escalations |
| `.planning/governance/GOVERNANCE-RUNTIME-LOADER.md` | Agent context loading requirements |
| `.planning/schemas/MODEL-STRATEGY.md` | High-level design for model loading, fallback |

## Session Continuity

Last session: 2026-02-02T12:00:00Z
Stopped at: Strategic Rebuild decision made, awaiting approval
Resume: Begin Phase R-0 (Foundation) after approval

---

## Reference Documents

### Strategic Rebuild (PRIMARY)

| Document | Purpose |
|----------|---------|
| `.planning/strategic-rebuild/STRATEGIC-REBUILD-ROADMAP-2026-02-02.md` | **PRIMARY** — Strangler Fig rebuild roadmap |
| `.planning/what-bring-us-here.md` | Decision context and rationale |

### Architecture & Governance

| Document | Purpose |
|----------|---------|
| `.planning/SOURCE-OF-TRUTH.md` | Canonical architecture (MUST align) |
| `.planning/PROJECT.md` | Project context and requirements |
| `.planning/governance/GAPS-TRACKER.yaml` | Gap and escalation tracking |
| `.planning/governance/GOVERNANCE-RUNTIME-LOADER.md` | Agent context loading |

### Phase Artifacts

| Document | Purpose |
|----------|---------|
| `.planning/phases/A-byok-foundation/A-04B-SUMMARY-2026-02-02.md` | Phase A completion summary |
| `.planning/phases/00-stabilization/00-07-SUMMARY.md` | Phase 0 closure summary with baseline |
| `.planning/strategic-rebuild/phases/R-{N}-*.md` | Strategic Rebuild phase artifacts |

### Schema & Design

| Document | Purpose |
|----------|---------|
| `.planning/schemas/MODEL-STRATEGY.md` | Model loading, fallback, capabilities |
| `.planning/schemas/THREAD-V2-DESIGN.md` | Schema design for Phase D |
| `.planning/schemas/SCHEMA-OVERVIEW.md` | Schema inventory |

### Archives

| Document | Purpose |
|----------|---------|
| `.planning/ROADMAP.md` | Previous A-E roadmap (suspended) |
| `.planning/ROADMAP-2026-02-01-ARCHIVE.md` | Original phase 0-5 roadmap |

---

*Updated: 2026-02-02T12:00:00Z after Strategic Rebuild decision*
