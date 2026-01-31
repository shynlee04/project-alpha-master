# SPRINT ASSIGNMENT: CC-01

handoff_id: "cc_01_assignment_20260125"
from: "bmad-sprint-manager"
to: "dev-ext"
created_at: "2026-01-25T23:55:00+07:00"
reissued_at: "2026-01-25T22:04:51+07:00"
priority: "P0"
status: "REISSUED"

## Scope

- Story: CC-01 - Add initialHandle Prop and FSA Restore Logic
- Epic: EPIC-ARCH-04-CC
- Timebox: 2 hours

## Required Inputs

- Handoff: `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-CC-SPRINT-HANDOFF-2026-01-25.md`
- Epic spec: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-CC-correct-course-remediation-2026-01-25.md`

## Files In Scope

- `src/infrastructure/context/project-context.tsx`

## Evidence Requirements (Non-Negotiable)

- Step 1 (Init): minimal grep/glob evidence (related files + key symbols).
- Step 1a (Journey): brief journey map (mermaid ok) for initial load, restore, permission prompt, success.
- Step 2 (Validate): file:line checklist for each CC-01 AC.
- Step 4/5 (Test/Review): save TypeScript output to file (no timeouts).
- Capture grep verification output for:
  - `handlePersistenceService`
  - `initialHandle`
  - `handle:` usage in project context
- Include TS gate blocker note: HubHomePage/ProjectsPage navigation state typing must avoid `null` for `fsaHandle`.
- Include evidence in `_bmad-output/handoffs/2026-01-25/CC-01-DEV-REPORT-2026-01-25.md`.

## Tool Constraints

- write: true
- edit: true
- bash: true (limited: grep + pnpm tsc evidence capture only)
- task: false

## Role Boundaries

- Only apply changes explicitly listed in the epic spec.
- Do not refactor or modify other files.
- Report blockers immediately if spec cannot be followed.

## Completion Output

- Dev report: `_bmad-output/handoffs/2026-01-25/CC-01-DEV-REPORT-2026-01-25.md`
- Include evidence logs and a brief summary of changes.
