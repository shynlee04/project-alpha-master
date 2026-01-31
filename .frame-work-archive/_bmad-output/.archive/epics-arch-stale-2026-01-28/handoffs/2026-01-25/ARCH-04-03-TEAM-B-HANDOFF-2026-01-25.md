# ARCH-04-03 Team B Handoff - PermissionOverlay Integration

handoff_id: hnd_20260125_arch_04_03_team_b
parent_id: hnd_20260125_epic_arch_04_sprint
date: 2026-01-25
team: Team B
story_id: ARCH-04-03
epic_id: EPIC-ARCH-04
status: kickoff

## Scope
Integrate PermissionOverlay with the new ProjectContextProvider (ARCH-04-01) so that when permission restoration is required, the overlay prompts for access, persists the handle, re-initializes the gateway, and supports cancel navigation to the hub.

## Required Context
- Story: _bmad-output/sprint-artifacts/stories/ARCH-04-03-permission-overlay-2026-01-25.md
- Epic: _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
- ADR-034: _bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md
- Prior epics context: EPIC-ARCH-01..03 (ProjectContext + PluginLayout + FeaturePlugins)
- ARCH-04-01 completion refs:
  - _bmad-output/handoffs/2026-01-25/ARCH-04-01-DEV-REPORT-2026-01-25.md
  - _bmad-output/handoffs/2026-01-25/ARCH-04-01-TSC-VERIFY-2026-01-25.md
  - docs/plans/2026-01-25-arch-04-01-fsa-handle-lifecycle.md

## Current Findings
- PermissionOverlay props (src/presentation/components/layout/PermissionOverlay.tsx):
  - projectMetadata: ProjectMetadata | null (from deprecated '@/lib/workspace')
  - onRestoreAccess: () => void
  - onOpenFolder?: () => void
- Story requires callbacks aligned to new ProjectContextProvider: onPermissionGranted(handle) and onCancel.
- ProjectContextProvider (src/infrastructure/context/project-context.tsx) currently does not render PermissionOverlay in mainline. A prior worktree shows overlay wiring, but it is not present in the current branch.
- 8-bit compliance issues in PermissionOverlay:
  - Uses rounded-full and rounded-lg (not allowed)
  - Uses bg-amber-500/15 (transparency not allowed)

## Integration Points
- ProjectContextProvider should render PermissionOverlay when requiresUserInteraction.
- On grant, persist the FSA handle, re-init adapter/gateway, and refresh file tree.
- On cancel, navigate to hub route: "/".

## Acceptance Criteria Summary
- PermissionOverlay props match new context callbacks.
- Grant action calls onPermissionGranted with the FSA handle.
- Cancel action navigates to the hub route.
- Overlay remains 8-bit compliant.

## Decision Note
Props mismatch must be resolved either by:
1) Adding an adapter in ProjectContextProvider to map new callbacks to current overlay props, or
2) Updating PermissionOverlay props to new interface and updating call sites.
Pick the smallest surface area that aligns with ARCH-04-03 scope and current usage in layout components.

## Assigned Dev-Ext Task Stub
Task: Implement ARCH-04-03 PermissionOverlay integration.
Constraints: minimal edits, no worktrees, no real-world-validator.
Expected changes:
- Align PermissionOverlay props with new context callbacks.
- Wire overlay in ProjectContextProvider (requiresUserInteraction flow).
- Ensure cancel navigates to "/".
- Adjust styling for 8-bit compliance (no rounded-full/rounded-lg, no transparency).

## Notes
- This handoff is coordination-only; no code changes applied here.
- Pre-execution hook not run due to task constraints (bash disabled in this kickoff).
