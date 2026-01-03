---
id: KS-UC-12
name: "Test-driven feature scaffold: spec → code → test → iterate loop"
version: 1.0
status: draft
workspaces: [IDE, Knowledge, Notes]
personas: [Developer, Student]
primary_goal: "Generate a new feature module with tests from a natural-language spec, using TDD cycle with agent self-correction."
---

## Scenario
A developer writes a feature spec in Notes workspace (Markdown) and asks the IDE agent to scaffold the feature with full test coverage. The agent writes failing tests first, implements minimal code to pass, refactors, and documents each cycle.

## Preconditions
- IDE agent can read Notes workspace documents (via Knowledge API or direct file path).
- Agent has access to project's test framework config (Vitest/Jest).
- Agent can execute test commands and parse output.

## Trigger
User in IDE chat: "Implement feature from `notes/feature-spec-canvas-zoom.md`. Use TDD. Target >80% coverage."

## Main flow
1. **Spec ingestion:**
   - Agent reads the spec document.
   - Extracts:
     - Acceptance criteria (ACs).
     - API surface (functions, props, types).
     - Edge cases.
   - Generates a test plan (one test file per AC cluster).

2. **TDD cycle (per AC):**
   - **RED:** Write a failing test for AC-1.
     - Run test → expect failure.
   - **GREEN:** Write minimal implementation to pass.
     - Run test → expect pass.
   - **REFACTOR:** Clean up code (extract helpers, improve naming).
     - Run test again → must still pass.
   - Repeat for remaining ACs.

3. **Coverage validation:**
   - Run `pnpm test --coverage`.
   - If <80%, agent identifies untested branches and adds tests.

4. **Documentation:**
   - Create Knowledge node:
     - "Feature: Canvas Zoom (TDD log)".
     - Each cycle logged: test name, initial failure message, implementation diff, final pass.
   - Update original spec in Notes with "Implemented: ✅" badge and link to code.

5. **Handoff:**
   - Agent creates a PR draft (if git integration available) or outputs a checklist for manual PR.

## UX requirements
- User must see each RED/GREEN/REFACTOR transition clearly (terminal output + summary).
- Provide "Skip to final result" option (user can review later in Knowledge).
- If agent gets stuck (test won't pass after 3 attempts), surface the issue and ask for guidance.

## AI agent behaviors
- Agent must write tests first; implementation second (strict TDD).
- Agent must not skip refactor; must attempt at least one simplification per cycle.
- Agent must cite the spec when generating test descriptions (traceability).

## Failure modes & tough edges
- Spec is ambiguous (e.g., "zoom should feel smooth") → agent asks clarifying questions before starting.
- Test framework has breaking changes → agent detects version mismatch and warns.
- Spec references non-existent dependencies → agent proposes adding them or flags as blocker.

## Acceptance criteria
- All ACs have corresponding passing tests.
- Coverage report shows ≥80% for the new module.
- Knowledge log includes full TDD trace (RED → GREEN → REFACTOR per AC).

## Cross-workspace integration
- Notes workspace: spec source + implementation status badge.
- IDE workspace: code generation + test execution.
- Knowledge workspace: TDD log with diffs and test outputs.
