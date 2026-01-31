# SPRINT ASSIGNMENT: CC-03

handoff_id: "cc_03_assignment_20260125"
from: "bmad-sprint-manager"
to: "dev-ext"
created_at: "2026-01-25T23:59:00+07:00"
reaffirmed_at: "2026-01-25T22:04:51+07:00"
priority: "P0"
status: "QUEUED"

## Scope

- Story: CC-03 - Wire Route to Pass initialHandle
- Epic: EPIC-ARCH-04-CC
- Timebox: 1 hour
- Blocked by: CC-01 evidence

## Required Inputs

- Handoff: `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-CC-SPRINT-HANDOFF-2026-01-25.md`
- Epic spec: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-CC-correct-course-remediation-2026-01-25.md`
- CC-01 evidence: `_bmad-output/handoffs/2026-01-25/CC-01-DEV-REPORT-2026-01-25.md`

## Files In Scope

- `src/routes/$projectId.tsx`
- `src/routes/ide.$projectId.tsx` (ensure redirect preserves navigation state)
- `src/routes/notes.$projectId.tsx` (ensure redirect preserves navigation state)
- `src/presentation/components/hub/HubHomePage.tsx` (fix navigation state typing for fsaHandle)
- `src/presentation/components/project/ProjectsPage.tsx` (fix navigation state typing for fsaHandle)

## Evidence Requirements (Non-Negotiable)

- Step 1 (Init): minimal grep/glob evidence (route handle extraction + navigate state passing).
- Step 1a (Journey): brief journey map (mermaid ok) for wizard -> navigate (state) -> provider initialHandle.
- Step 2 (Validate): file:line checklist for each CC-03 AC.
- Step 4/5 (Test/Review): save TypeScript output to file (no timeouts).
- Capture grep verification output for:
  - `initialHandle` usage in `src/routes/$projectId.tsx`
  - `state:` usage in hub/projects navigation (ensure no `null` state passed)
  - `state: true` (or equivalent) in redirect calls for `/ide/$projectId` and `/notes/$projectId` (preserve navigation state)
- Include evidence in `_bmad-output/handoffs/2026-01-25/CC-03-DEV-REPORT-2026-01-25.md`.

## Tool Constraints

- write: true
- edit: true
- bash: true (limited: grep + pnpm tsc evidence capture only)
- task: false

## Role Boundaries

- Only apply changes explicitly listed in the epic spec.
- Do not refactor or modify other files.
- Do not start until CC-01 evidence is verified.
- Plan for parallel execution with CC-02 once CC-01 evidence clears.
- Report blockers immediately if spec cannot be followed.

## Completion Output

- Dev report: `_bmad-output/handoffs/2026-01-25/CC-03-DEV-REPORT-2026-01-25.md`
- Include evidence logs and a brief summary of changes.
