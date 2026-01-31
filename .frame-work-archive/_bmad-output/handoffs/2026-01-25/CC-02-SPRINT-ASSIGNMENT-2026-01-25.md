# SPRINT ASSIGNMENT: CC-02

handoff_id: "cc_02_assignment_20260125"
from: "bmad-sprint-manager"
to: "dev-ext"
created_at: "2026-01-25T23:59:00+07:00"
reaffirmed_at: "2026-01-25T22:04:51+07:00"
priority: "P0"
status: "QUEUED"

## Scope

- Story: CC-02 - Wire PermissionOverlay with Persist and Reinit
- Epic: EPIC-ARCH-04-CC
- Timebox: 1.5 hours
- Blocked by: CC-01 evidence

## Required Inputs

- Handoff: `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-CC-SPRINT-HANDOFF-2026-01-25.md`
- Epic spec: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-CC-correct-course-remediation-2026-01-25.md`
- CC-01 evidence: `_bmad-output/handoffs/2026-01-25/CC-01-DEV-REPORT-2026-01-25.md`

## Files In Scope

- `src/infrastructure/context/project-context.tsx`

## Evidence Requirements (Non-Negotiable)

- Step 1 (Init): minimal grep/glob evidence (PermissionOverlay render block + initializeProject useEffect).
- Step 1a (Journey): brief journey map (mermaid ok) for permission-required load -> grant -> reinit.
- Step 2 (Validate): file:line checklist for each CC-02 AC.
- Step 4/5 (Test/Review): save TypeScript output to file (no timeouts).
- Capture grep verification output for:
  - `persistHandle` in `onPermissionGranted`
  - `fsaHandle` in the `initializeProject` useEffect dependency array
- Include evidence in `_bmad-output/handoffs/2026-01-25/CC-02-DEV-REPORT-2026-01-25.md`.

## Tool Constraints

- write: true
- edit: true
- bash: true (limited: grep + pnpm tsc evidence capture only)
- task: false

## Role Boundaries

- Only apply changes explicitly listed in the epic spec.
- Do not refactor or modify other files.
- Do not start until CC-01 evidence is verified.
- Plan for parallel execution with CC-03 once CC-01 evidence clears.
- Report blockers immediately if spec cannot be followed.

## Completion Output

- Dev report: `_bmad-output/handoffs/2026-01-25/CC-02-DEV-REPORT-2026-01-25.md`
- Include evidence logs and a brief summary of changes.
