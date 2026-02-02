# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Users can interact with AI that reads, writes, and understands their project files — all client-side with zero data sent to our servers.
**Current focus:** Strategic Rebuild R-4 — Cutover

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

Phase: Strategic Rebuild R-4 COMPLETE
Status: Ready for R-5 (Resume Roadmap)
Last activity: 2026-02-03 — R-4 cutover validation with 171 tests passing
Commit: 3f233d64

Progress: █████████░ 80% Strategic Rebuild (R-4 complete)

### Strategic Rebuild Phases

| Phase | Name | Status | Tests | Commit |
|-------|------|--------|-------|--------|
| **R-0** | Foundation | ✅ COMPLETE | 28 | ffa590da |
| **R-1** | Platform Layer | ✅ COMPLETE | 32 | 09f845a4 |
| **R-2** | Port Infrastructure | ✅ COMPLETE | 12 | 0916d5af |
| **R-3** | Port Modules | ✅ COMPLETE | 81 | a48dca83 |
| **R-4** | Cutover | ✅ COMPLETE | 18 | 3f233d64 |
| **R-5** | Resume Roadmap | 🔴 NOT STARTED | - | - |

### R-3 Completion Summary

**Commit:** a48dca83
**Tests:** 153 total (81 module + 72 platform)
**Pass Rate:** 100%

**Modules Created:**
- `src/modules/types.ts` - IFeatureModule interface
- `src/modules/loader.ts` - ModuleLoader with lazy loading
- `src/modules/ModulePanel.tsx` - Suspense-wrapped renderer
- `src/modules/monaco/` - Code editor wrapper
- `src/modules/notes/` - BlockNote wrapper (19 blocks)
- `src/modules/terminal/` - xterm.js wrapper
- `src/modules/preview/` - Dev server iframe wrapper

**Key Achievements:**
- Strangler Fig pattern - clean interfaces wrapping existing code
- NO-WORKSPACE compliant - zero workspaceId in new code
- Activity-bar wiring - modules toggle via mainTop.activePluginId
- Test infrastructure fixed - TanStack Router mock complete

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

**2026-02-03 (R-4 Cutover Validation):**
- Phase R-4 Foundation Cutover COMPLETE with 171 tests passing
- R-4 cutover readiness test suite created (18 tests)
- NO-WORKSPACE mandate verified in production code (0 violations)
- New architecture (platform + modules) validated and ready
- Legacy cleanup deferred (669 @/lib imports still in old code)
- See: `.planning/strategic-rebuild/phases/R-4-SUMMARY-2026-02-03.md`

**2026-02-03 (R-3 Completion):**
- Phase R-3 (Port Modules) COMPLETE with 100% test pass rate
- All 4 module wrappers created: monaco, notes, terminal, preview
- 153 total tests passing (81 module + 72 platform)
- NO-WORKSPACE mandate respected - zero workspaceId in new code
- Ready for R-4 Cutover phase

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

Last session: 2026-02-03T15:00:00Z
Stopped at: R-4 (Cutover Validation) completed with 171 tests passing
Resume: Begin Phase R-5 (Resume Roadmap) — proceed with AI features on clean architecture

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

*Updated: 2026-02-03T15:00:00Z after R-4 completion*
