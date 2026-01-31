Story ID: ARCH-04-06
Title: Clean Up Deprecated Options in Wizard
Points: 3
Priority: P2
Status: pending
Description: |
  As a user, I want a simplified project wizard that auto-detects
  storage type so creation is faster and aligns with ADR-034.
Acceptance Criteria:
  - Knowledge and Study workspace options are removed.
  - Storage type is auto-detected without user choice.
  - Wizard flow is simplified and quicker to finish.
Tasks:
  - [ ] Remove deferred workspace toggles from the wizard.
  - [ ] Auto-detect storage type based on platform.
  - [ ] Validate wizard UX flow on desktop and mobile.
Dependencies:
  - ARCH-04-05
Time Box: 30 min
Handoff Artifacts:
  - _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
  - _bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md

Summary:
  Remove deferred options and rely on platform detection to keep the
  project creation flow focused on supported workspaces.

Verification Commands:
  - pnpm tsc --noEmit
  - pnpm dev

Tool Constraints:
  write: false
  edit: true
  bash: true
  task: false
