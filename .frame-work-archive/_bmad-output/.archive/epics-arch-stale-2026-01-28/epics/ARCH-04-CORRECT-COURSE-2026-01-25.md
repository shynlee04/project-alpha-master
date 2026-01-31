# ARCH-04 Correct-Course Report (ARCH-04-01..03)

Date: 2026-01-25
Epic: EPIC-ARCH-04
ADR: ADR-034 Project-Centric Architecture
Scope: ARCH-04-01, ARCH-04-02, ARCH-04-03

## Determination: Architectural, Project-Wide Flaw
The classification and validation reports identify the issue as architectural because the missing FSA handle lifecycle and route-to-context handoff breaks the project-centric desktop flow across all FSA projects. The failure spans multiple layers (ProjectContextProvider, StorageAdapterFactory, PermissionOverlay UX), not a localized UI defect. This violates ADR-034 requirements for a single project route with reliable FSA handle persistence/restoration, making the app non-functional for desktop FSA scenarios.

## Completion Summary (ARCH-04-01..03)

### ARCH-04-01 (FSA handle lifecycle in ProjectContextProvider)
- Reported additions: initial handle lifecycle integration, handle restore/persist logic, overlay display, and handle passed into StorageAdapterFactory.
- Verification: pnpm tsc --noEmit timed out; vitest failures pre-existed.
- Evidence: dev report and verification output paths listed below.

### ARCH-04-02 (Pass FSA handle from wizard to route)
- Reported changes: wizard now passes fsaHandle in navigation state; unified route extracts location.state and forwards initialHandle to ProjectContextProvider.
- Verification: not run (per dev report).
- Evidence: dev report and story notes listed below.

### ARCH-04-03 (PermissionOverlay integration)
- Reported changes: PermissionOverlay props updated (new union type), 8-bit compliance fixes, showDirectoryPicker integration, ProjectContextProvider render wiring.
- Verification: TypeScript/build timed out; validation BLOCK due to missing provider integration requirements.
- Evidence: completion report, validation report, and classification report listed below.

## Integration Gaps vs EPIC-ARCH-04 and ADR-034
- ProjectContextProvider still missing required handle lifecycle behavior per validation: no initialHandle prop, no restore/persist flow, handle not passed into StorageAdapterFactory, and overlay not triggered in init sequence.
- PermissionOverlay cancel flow is partial (no explicit cancel control in the new interface; onCancel is only invoked on picker cancel).
- TypeScript and build validation timed out for ARCH-04-01 and ARCH-04-03, leaving verification incomplete despite claimed changes.

## Correct-Course Proposal

### Step 1: Reconcile ProjectContextProvider with ARCH-04-01 + ADR-034
Dependency: ARCH-04-02 wiring (handle in route) must be present.
Actions:
- Add initialHandle prop and ensure it is used to seed FSA handle state.
- Call handlePersistenceService.restoreHandle() for FSA projects and set showPermissionOverlay on requiresUserInteraction.
- Pass fsaHandle into storageAdapterFactory.createAdapter().
Acceptance Criteria:
- initialHandle prop exists and is passed from route.
- restoreHandle is called; successful restore sets handle.
- overlay is shown when user interaction is required.
- adapter receives non-null handle for FSA projects.

### Step 2: Align PermissionOverlay behavior with recovery flow
Dependency: Step 1 completion (overlay trigger + handle lifecycle).
Actions:
- Confirm onPermissionGranted persists handle and reinitializes adapter flow.
- Provide explicit cancel control or document picker cancel as the only path.
Acceptance Criteria:
- Permission overlay grants access and reinitializes context.
- Cancel path returns to hub intentionally and is user-visible.

### Step 3: Verification and evidence capture
Dependency: Steps 1-2 completed.
Actions:
- Run tsc and capture output to verification artifact.
- Manual validation for FSA create/load flows (new project, restore, permission flow).
Acceptance Criteria:
- tsc report captured (no timeout or documented workaround).
- Manual tests show no "No directory access granted" error.

## Evidence
- _bmad-output/handoffs/2026-01-25/ARCH-04-CORRECT-COURSE-HANDOFF-2026-01-25.md
- _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
- _bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md
- _bmad-output/handoffs/2026-01-25/ARCH-04-03-CLASSIFICATION-2026-01-25.md
- _bmad-output/handoffs/2026-01-25/ARCH-04-03-VALIDATION-2026-01-25.md
- _bmad-output/handoffs/2026-01-25/ARCH-04-01-DEV-REPORT-2026-01-25.md
- _bmad-output/handoffs/2026-01-25/ARCH-04-02-DEV-REPORT-2026-01-25.md
- _bmad-output/sprint-artifacts/stories/ARCH-04-03-completion-2026-01-25.md
- _bmad-output/handoffs/2026-01-25/ARCH-04-02-STORY-DEV-NOTES-2026-01-25.md

Awaiting Architect Decision
