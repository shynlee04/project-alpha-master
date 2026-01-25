# ARCH-04-03 Classification Report

Date: 2026-01-25
Story: ARCH-04-03
Epic: EPIC-ARCH-04
ADR: ADR-034
Reviewer: OpenCode (architect-ext)
Mode: Conversation (no active delegation in `_bmad-ext/state/LOOP_STATE.yaml`)

## Verdict
Architectural flaw (project-wide impact)

## Impact Scope
- App non-functional for FSA projects due to missing handle lifecycle in ProjectContextProvider.
- ARCH-04-02 integration blocked because ProjectContextProvider does not accept `initialHandle`.
- Permission overlay is wired but never triggered; user recovery path is unreachable.
- StorageAdapterFactory is created without FSA handle, leading to access failure during initialization.

## Evidence (Requirements vs. Current Code)

### EPIC-ARCH-04 + ADR-034 Requirements
- EPIC-ARCH-04 mandates FSA handle lifecycle integration in ProjectContextProvider and PermissionOverlay integration.
  - `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md`
- ADR-034 requires clean desktop FSA flow with handle persistence/restoration, single project route, and project-centric state.
  - `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`

### Current Implementation Gaps
- ProjectContextProvider props do not include `initialHandle`, so ARCH-04-02 cannot pass the handle through.
  - `src/infrastructure/context/project-context.tsx:148-151`
- StorageAdapterFactory is called without `handle`, so FSA adapters are instantiated with no handle.
  - `src/infrastructure/context/project-context.tsx:208-214`
- PermissionOverlay state exists but is never set to true during initialization flow; overlay is unreachable.
  - `src/infrastructure/context/project-context.tsx:170-172`, `src/infrastructure/context/project-context.tsx:177-271`
- `onPermissionGranted` does not persist handle or reinitialize storage gateway; it only hides the overlay.
  - `src/infrastructure/context/project-context.tsx:54-61`

### Validation Report Alignment
- Validation explicitly blocks the story due to missing handle lifecycle and overlay trigger logic in ProjectContextProvider.
  - `_bmad-output/handoffs/2026-01-25/ARCH-04-03-VALIDATION-2026-01-25.md`

## Classification Rationale
- The missing handle lifecycle is a core requirement of ADR-034 and EPIC-ARCH-04. This is not a local UI bug; it breaks the project-centric architecture for all desktop FSA projects.
- The issue spans cross-cutting layers (context provider, storage factory, permission UX), indicating architectural-level fault rather than an isolated implementation defect.

## Decision
ARCH-04-03 flaw is architectural-level with project-wide impact. A correct-course report is required before declaring EPIC-ARCH-04 stability.
