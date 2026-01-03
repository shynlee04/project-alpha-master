---
id: KS-UC-11
name: "Agentic refactor: multi-file state migration with validation"
version: 1.0
status: draft
workspaces: [IDE, Knowledge, Notes]
personas: [Developer, Student]
primary_goal: "Delegate a complex refactor (Zustand state split + consumer updates) to an agent that validates each step and documents changes."
---

## Scenario
A developer wants to split a 400-line Zustand store into 3 slices and update all consumers. They describe the goal to an IDE agent, which generates a plan, executes file operations via FSA, runs TDD validation, and produces a Knowledge workspace "refactor journal" with rollback checkpoints.

## Preconditions
- IDE workspace has FSA read/write permissions for the project directory.
- Agent can invoke:
  - `grep` or text search across files.
  - `pnpm tsc --noEmit`, `pnpm test`, `pnpm build`.
  - File create/update/delete via FSA.
- Knowledge workspace can store structured "task journals" with code diffs and validation results.

## Trigger
User opens IDE chat and says: "Split `useAppStore` into `useAgentStore`, `useWorkspaceStore`, and `useUIStore`. Update all imports. Validate after each file."

## Main flow
1. **Planning phase:**
   - Agent analyzes `useAppStore.ts` to identify slices.
   - Searches codebase for all import statements: `grep -r "from '.*useAppStore'" src/`.
   - Generates a dependency-ordered plan:
     1. Create 3 new store files.
     2. Move slice logic + types.
     3. Update barrel export.
     4. Update consumers (batched by directory).
     5. Remove old store.
   - Presents plan to user with estimated file count and asks for approval.

2. **Execution with TDD:**
   - **Step 1:** Create `useAgentStore.ts` with slice logic.
     - Run `pnpm tsc --noEmit` → if errors, fix and retry (max 2 attempts).
   - **Step 2:** Update `index.ts` barrel export.
     - Run build → capture output.
   - **Step 3:** Update first batch of consumers (e.g., `src/components/agents/`).
     - Run tests for that directory.
   - Repeat for remaining batches.
   - **Final validation:** Full `pnpm tsc && pnpm test && pnpm build`.

3. **Documentation:**
   - Create a Knowledge workspace node:
     - Title: "Refactor: useAppStore → 3 slices (2026-01-03)".
     - Sections:
       - Original state structure (snapshot).
       - Migration plan (checklist).
       - Changed files (list + diffs).
       - Validation results (pass/fail per step).
       - Rollback instructions (git commands or file restore steps).

4. **Error handling:**
   - If validation fails after 2 retries:
     - Agent creates a "blocked" checkpoint in Knowledge.
     - Surfaces the error + file context to user.
     - Offers: "Rollback to last valid state" or "Manual fix required".

## UX requirements
- Show live progress: "Analyzing… Creating files… Validating step 2/5…".
- Each checkpoint must be browsable (user can inspect diffs before proceeding).
- Provide a "pause and review" button during execution.

## AI agent behaviors
- Agent must never proceed to next step if validation fails.
- Agent must preserve user comments and formatting when updating files.
- Agent must handle circular import detection and surface it as a blocker.

## Failure modes & tough edges
- Consumer uses dynamic imports or string interpolation → agent flags as "manual review required".
- Test suite has flaky tests → agent should run tests 2x and compare; if inconsistent, warn user.
- User has uncommitted changes → agent must check git status and refuse to proceed unless clean or user overrides.

## Acceptance criteria
- After full execution, `pnpm tsc && pnpm test && pnpm build` passes.
- Knowledge journal includes at least one rollback checkpoint per major step.
- Agent flags any files it couldn't confidently update (with reasons).

## Cross-workspace integration
- IDE workspace: file operations + command execution.
- Knowledge workspace: persistent task journal (searchable, citable).
- Notes workspace: user can add manual observations mid-refactor.
