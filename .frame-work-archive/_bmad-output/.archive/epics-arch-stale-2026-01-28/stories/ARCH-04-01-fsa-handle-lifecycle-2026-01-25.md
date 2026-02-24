Story ID: ARCH-04-01
Title: Integrate FSA Handle Lifecycle into ProjectContextProvider
Points: 8
Priority: P0
Status: pending
Description: |
  As a project owner, I want the ProjectContextProvider to restore and
  persist FSA handles so that projects load without permission errors.
Acceptance Criteria:
  - ProjectContextProvider accepts an initialHandle prop.
  - Provider calls handlePersistenceService.restoreHandle for FSA projects.
  - Restored handle is passed to StorageAdapterFactory.
  - PermissionOverlay renders when user interaction is required.
  - Restoration failures surface a clear error message.
  - TypeScript compiles with zero errors.
Tasks:
  - [ ] Add initialHandle prop and fsaHandle state.
  - [ ] Restore or persist handles before adapter creation.
  - [ ] Wire PermissionOverlay callbacks and navigation.
Dependencies:
  - None
Time Box: 60 min
Handoff Artifacts:
  - _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
  - _bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md

Summary:
  Integrate the missing FSA handle lifecycle so the new context can
  initialize storage adapters without throwing permission errors.

Verification Commands:
  - pnpm tsc --noEmit
  - pnpm dev

Tool Constraints:
  write: false
  edit: true
  bash: true
  task: false
