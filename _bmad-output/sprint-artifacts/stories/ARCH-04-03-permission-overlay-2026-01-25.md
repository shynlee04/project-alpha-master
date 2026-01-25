Story ID: ARCH-04-03
Title: Integrate PermissionOverlay for New Architecture
Points: 5
Priority: P0
Status: pending
Description: |
  As a user reopening a project, I want a permission overlay to request
  folder access so that I can restore FSA access when silent restore fails.
Acceptance Criteria:
  - PermissionOverlay props match new context callbacks.
  - Grant action calls onPermissionGranted with the FSA handle.
  - Cancel action returns user to the hub route.
  - Overlay follows 8-bit design rules.
Tasks:
  - [ ] Verify PermissionOverlay prop interface.
  - [ ] Add adapter or updates if props mismatch.
  - [ ] Validate overlay wiring in ProjectContextProvider.
Dependencies:
  - ARCH-04-01
Time Box: 45 min
Handoff Artifacts:
  - _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
  - _bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md

Summary:
  Ensure the permission overlay can grant access back into the new
  ProjectContextProvider without breaking 8-bit UI constraints.

Verification Commands:
  - pnpm dev

Tool Constraints:
  write: false
  edit: true
  bash: true
  task: false
