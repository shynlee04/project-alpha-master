Story ID: ARCH-04-02
Title: Pass FSA Handle from Wizard to Route
Points: 5
Priority: P0
Status: pending
Description: |
  As a user creating a project, I want the wizard to pass the picked
  FSA handle into the project route so the project opens immediately.
Acceptance Criteria:
  - Wizard passes fsaHandle via navigation state.
  - Route extracts fsaHandle and passes initialHandle to provider.
  - New project creation avoids permission overlay on first load.
  - TypeScript compiles with zero errors.
Tasks:
  - [ ] Add navigation state with fsaHandle in ProjectCreationWizard.
  - [ ] Read state in /$projectId route and pass initialHandle.
Dependencies:
  - ARCH-04-01
Time Box: 45 min
Handoff Artifacts:
  - _bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md
  - _bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-SPRINT-HANDOFF-2026-01-25.md

Summary:
  Connect wizard navigation state to the unified route so the initial
  FSA handle is available before context initialization.

Verification Commands:
  - pnpm tsc --noEmit
  - pnpm dev

Tool Constraints:
  write: false
  edit: true
  bash: true
  task: false

Dev Notes:
  Files Changed:
    - src/presentation/components/project/ProjectCreationWizard.tsx
    - src/presentation/components/hub/HubHomePage.tsx
    - src/presentation/components/project/ProjectsPage.tsx
    - src/routes/$projectId.tsx
  Integration Points:
    - Wizard callback -> navigate state -> route -> ProjectContextProvider
  Verification Status:
    - Not run (per dev report)
  Open Follow-ups:
    - None noted

Architect Report Notes:
  - Route now consumes navigation state and forwards initialHandle for context init.
