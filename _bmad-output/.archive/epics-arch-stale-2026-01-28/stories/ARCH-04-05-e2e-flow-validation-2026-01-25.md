Story ID: ARCH-04-05
Title: End-to-End Flow Validation
Points: 5
Priority: P0
Status: pending
Description: |
  As a release owner, I want the core project creation and loading
  flows validated so the application is functional again.
Acceptance Criteria:
  - New FSA project creation works without permission overlay.
  - Existing FSA project load prompts for permission when required.
  - Silent restore succeeds on reload when permitted.
  - IndexedDB projects load without FSA prompts.
  - No console errors about invalid hook calls or missing access.
Tasks:
  - [ ] Run scenario tests for FSA create, load, and silent restore.
  - [ ] Validate IndexedDB flow.
  - [ ] Record findings in a test report artifact.
Dependencies:
  - ARCH-04-01
  - ARCH-04-02
  - ARCH-04-03
Time Box: 45 min
Handoff Artifacts:
  - _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
  - _bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md

Summary:
  Validate the full project lifecycle to confirm the app is functional
  once handle lifecycle and routing fixes land.

Verification Commands:
  - pnpm tsc --noEmit
  - pnpm dev

Tool Constraints:
  write: true
  edit: false
  bash: true
  task: false
