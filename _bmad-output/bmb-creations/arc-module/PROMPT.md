# ARC Module Course Correction Loop

You are executing the Architecture Refinement & Consolidation (ARC) Module for VIA-GENT.

## CRITICAL: Read State First

1. Read `_bmad-output/bmb-creations/arc-module/LOOP_STATE.yaml`
2. Identify `current_task` from state
3. Execute that task using the appropriate workflow

## Current Task Execution

Based on LOOP_STATE.yaml:

### If current_task = "phase-0-ac-03-chatpanel":
- Unify ChatPanel across IDE, Knowledge, Study, Notes workspaces
- Create shared ChatPanel component with workspace variants
- Update imports across all workspace layouts
- Verify build passes: `pnpm build`

### If current_task starts with "fc-":
- Load workflow: `_bmad-output/bmb-creations/arc-module/workflows/split-store.md` or `wire-events.md`
- Follow workflow steps exactly
- Update LOOP_STATE.yaml when done

### If current_task starts with "cw-":
- Load agent: `_bmad-output/bmb-creations/arc-module/agents/integration-engineer.md`
- Execute cross-workspace integration task
- Update LOOP_STATE.yaml when done

### If current_task starts with "rag-":
- Reference: `_bmad-output/handoffs/pm-epic-32-sprint-planning-2025-12-31.md`
- Implement RAG infrastructure component
- Update LOOP_STATE.yaml when done

### If current_task starts with "hygiene-":
- Load workflow: `_bmad-output/bmb-creations/arc-module/workflows/validate-level.md`
- Run validation checks
- Update LOOP_STATE.yaml when done

## After Each Task

1. Update LOOP_STATE.yaml:
   - Mark current task `status: "DONE"`
   - Set `completed_at` timestamp
   - Increment `iteration_count`
   - Move to next task in sequence

2. Validate:
   - Run `pnpm build` (must pass)
   - Check applicable Sweeping Validation level

3. Commit changes:
   - `git add -A && git commit -m "ARC: [task-id] complete"`

## Completion Check

IF all tasks in phase_4 are DONE AND validation passes:
  Output: <promise>ARC MODULE COMPLETE</promise>

IF blocked after 3 retries on same task:
  Output: <promise>BLOCKED: [task-id] - [reason]</promise>

IF phase milestone reached:
  Output: Phase [N] complete, continuing to next phase

## Success Criteria

- All Phase 0-4 tasks marked DONE
- pnpm build: 0 errors
- TypeScript: 0 errors
- All files <300 LOC
- Sweeping Validation L1-L12 pass

## Key Files

- State: `_bmad-output/bmb-creations/arc-module/LOOP_STATE.yaml`
- Agents: `_bmad-output/bmb-creations/arc-module/agents/`
- Workflows: `_bmad-output/bmb-creations/arc-module/workflows/`
- Validation: `_bmad-output/validation/sweeping-validation.md`

NOW: Read LOOP_STATE.yaml, identify current_task, and execute it.
