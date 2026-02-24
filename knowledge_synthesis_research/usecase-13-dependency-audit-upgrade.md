---
id: KS-UC-13
name: "Dependency audit & upgrade: agent-driven version reconciliation"
version: 1.0
status: draft
workspaces: [IDE, Knowledge, Notes]
personas: [Developer, Maintainer]
primary_goal: "Audit outdated dependencies, research breaking changes, generate upgrade plan, and execute with validation gates."
---

## Scenario
A developer wants to upgrade dependencies (e.g., React 18→19, Zustand 4→5) but fears breaking changes. They ask the IDE agent to audit, research changelogs, propose a safe upgrade sequence, and execute with rollback checkpoints.

## Preconditions
- IDE agent can read `package.json`, `pnpm-lock.yaml`.
- Agent can invoke `pnpm outdated`, `pnpm update`, `pnpm install`.
- Agent can fetch and parse changelogs from npm/GitHub (via web search or API).
- Knowledge workspace can store research notes and upgrade checklists.

## Trigger
User in IDE chat: "Audit dependencies. Propose upgrade plan for major versions. Research breaking changes."

## Main flow
1. **Audit phase:**
   - Run `pnpm outdated`.
   - Identify:
     - Security vulnerabilities (via `pnpm audit`).
     - Major version bumps (breaking change risk).
     - Minor/patch bumps (low risk).

2. **Research phase:**
   - For each major bump:
     - Fetch changelog (npm page, GitHub releases, or migration guide).
     - Extract breaking changes, new features, deprecations.
     - Search codebase for usage patterns of deprecated APIs: `grep -r "oldAPI" src/`.
   - Store findings in Knowledge workspace:
     - "Dependency Upgrade Research: [pkg-name] v4→v5".
     - Breaking changes list.
     - Codebase impact estimate (file count).

3. **Plan generation:**
   - Propose sequence:
     1. Low-risk patches/minors first.
     2. Major bumps in dependency order (leaf deps before root deps).
   - For each major bump, include:
     - Pre-upgrade checklist (e.g., "Update all `useStore()` destructuring to selectors").
     - Validation gate (test suite + build).

4. **Execution (per package):**
   - **Step 1:** Run pre-upgrade checklist (if codebase changes needed, agent makes them or flags for manual review).
   - **Step 2:** `pnpm update [pkg]@latest`.
   - **Step 3:** Validation gate: `pnpm tsc && pnpm test && pnpm build`.
   - If failure:
     - Agent attempts automatic fixes (e.g., update import paths).
     - If unresolved after 2 tries, rollback and document blocker.

5. **Documentation:**
   - Create Knowledge node: "Upgrade Log 2026-01-03".
   - For each package:
     - Version change.
     - Breaking changes addressed.
     - Files modified.
     - Validation results.

## UX requirements
- Show risk assessment per package (low/medium/high).
- Provide "upgrade all low-risk now" quick action.
- For high-risk upgrades, require explicit user approval before execution.

## AI agent behaviors
- Agent must never upgrade all at once; must validate per package or per logical group.
- Agent must prefer stable versions (not `@next` or `@rc`) unless user specifies.
- Agent must check peer dependency conflicts and surface them before upgrading.

## Failure modes & tough edges
- Changelog is missing or vague → agent uses community discussions (GitHub issues, Stack Overflow) and flags uncertainty.
- Circular dependency conflicts after upgrade → agent must detect via `pnpm why` and propose resolution.
- Flaky tests mask real breakage → agent runs tests 2-3x and compares; flags inconsistencies.

## Acceptance criteria
- After execution, no high/critical security vulnerabilities remain (unless explicitly deferred).
- All upgraded packages pass validation gates.
- Knowledge log includes research notes with external links (changelogs, migration guides).

## Cross-workspace integration
- IDE workspace: dependency commands + file modifications.
- Knowledge workspace: research notes + upgrade log (citable by future developers).
- Notes workspace: user can add manual testing checklists mid-upgrade.
