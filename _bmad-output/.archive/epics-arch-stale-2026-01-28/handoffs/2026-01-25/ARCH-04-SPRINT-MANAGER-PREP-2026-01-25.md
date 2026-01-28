# ARCH-04 Sprint Manager Prep (Readiness + Wrapper)

date: 2026-01-25
author: sprint-manager (OpenCode)
scope: EPIC-ARCH-04 readiness + sprint-planning wrapper checks
status: complete

## Source Artifacts (read-only)
- _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
- _bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md
- _bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md
- _bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md
- new-fundamental-truths.md
- AGENTS.md
- CLAUDE.md (root)
- _bmad-ext/state/LOOP_STATE.yaml
- bmm-workflow-status.yaml
- _bmad-output/sprint-artifacts/sprint-status-2026-01-25.yaml (latest)

## Readiness Summary
- EPIC-ARCH-04 is READY_FOR_SPRINT_PLANNING with P0 blocker ARCH-04-01.
- App is non-functional due to missing FSA handle lifecycle in ProjectContextProvider.
- Story files for ARCH-04-01..06 are missing and must be created before delegation.
- bmm-workflow-status.yaml is stale vs its TTL (last_updated 2026-01-17, TTL 24h).
- ADR-034 Amendment 001 is blocking ARCH-03 navigation work (missing user + dev lead approvals); does not block ARCH-04 execution.
- CLAUDE.md exists at repo root; path /.claude/CLAUDE.md is missing.

## Sprint-Planning Wrapper Checks

### Cohesion Check
- PASS. Epic aligns with ADR-034 and new-fundamental-truths principles.
- Scope is focused on completing FSA handle lifecycle migration (single root cause).

### Dependency Map
- Critical path: ARCH-04-01 -> (ARCH-04-02 + ARCH-04-03) -> ARCH-04-05 -> (ARCH-04-04 + ARCH-04-06).
- ARCH-04-01 is gate story and blocks all other ARCH-04 stories.

### Reality Validation
- PASS. Error reproduced: "No directory access granted. Call requestAccess() first." Documented failure flow in epic and handoff.
- Feature is not a ghost or zombie; fixes map to concrete integration gaps.

## Story Ordering + Blockers (ARCH-04-01..ARCH-04-06)
1. ARCH-04-01 (P0, gate) - no dependencies, blocks 02/03/05.
2. ARCH-04-02 (P0) - depends on 01.
3. ARCH-04-03 (P0) - depends on 01.
4. ARCH-04-05 (P0) - depends on 01/02/03; blocks 04/06.
5. ARCH-04-04 (P1) - depends on 05.
6. ARCH-04-06 (P2) - depends on 05.

## Delegation-Ready Summary (ARCH-04-01)

### Objective
Integrate FSA handle lifecycle into ProjectContextProvider so FSA projects can be created and loaded without "No directory access" errors.

### Files
- src/infrastructure/context/project-context.tsx

### Acceptance Criteria
- AC-01-1: ProjectContextProvider accepts initialHandle prop.
- AC-01-2: Provider calls handlePersistenceService.restoreHandle() for FSA projects.
- AC-01-3: Restored handle is used by StorageAdapterFactory (no FSA access error).
- AC-01-4: If restore requires interaction, PermissionOverlay renders.
- AC-01-5: If restore fails, provider shows error state.
- AC-01-6: FSA handle passed to storageAdapterFactory.createAdapter().
- AC-01-7: TypeScript compiles with 0 errors.

### Verification Commands
- pnpm tsc --noEmit
- pnpm dev

### Expected Runtime Signals
- [ProjectContext] Attempting FSA handle restoration
- [ProjectContext] FSA handle restored successfully OR requires user interaction

## Missing Artifacts (must create before delegation)
- Story files: _bmad-output/sprint-artifacts/stories/ARCH-04-01..ARCH-04-06
- Story index updates: _bmad-output/sprint-artifacts/stories/STORY-INDEX.md (if required by workflow)
- Completion report placeholder: _bmad-output/sprint-artifacts/completion/EPIC-ARCH-04-completion.md

## Gate Failures / Warnings
- bmm-workflow-status.yaml stale (TTL 24h exceeded) -> refresh before delegation.
- ADR-034 Amendment 001 approvals incomplete (user + dev lead). Blocks ARCH-03 navigation changes, not ARCH-04 execution.
- /.claude/CLAUDE.md missing; CLAUDE.md present at repo root.

## Delegation Plan (ARCH-04-01)
- Assign dev-ext (write: false, edit: true, bash: true, task: false).
- Provide epic + handoff paths listed above.
- Require story file creation before dev work.
