# EPIC-PH1A Story Cycle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create/align EPIC-PH1A story + context artifacts, sync sprint/workflow state, and dispatch Team A/B dev-story execution.

**Architecture:** Use `_bmad-output/planning-artifacts/epics/EPIC-PH1A-COMPLETION-2026-01-26.md` as the planning source, map P0 blockers to the active remediation epic (`EPIC-CC-AR02AR03` and `EPIC-ARCH-04-CC`), and keep state synchronized in `_bmad-output/sprint-artifacts/sprint-status-2026-01-26.yaml`, `_bmad-output/workflow-status-2026-01-25.yaml`, and `_bmad-ext/state/LOOP_STATE.yaml`.

**Tech Stack:** YAML/Markdown artifacts only (story files + context XML). No production code changes in this plan.

---

### Task 1: Anchor + state alignment

**Files:**
- Modify: `_bmad-ext/state/LOOP_STATE.yaml`
- Modify: `_bmad-output/sprint-artifacts/sprint-status-2026-01-26.yaml`
- Modify: `_bmad-output/workflow-status-2026-01-25.yaml`

**Step 1: Update LOOP_STATE anchor**

- Set `current.epic_id` to `EPIC-PH1A-COMPLETION`
- Set `current.story_id` to `PH1A-P0-SET`
- Set `current.workflow` to `story-dev-cycle`
- Update `anchor.human_intent` with user directive (story → context → dev-story NOW)
- Update `anchor.human_intent_timestamp` to current time

**Step 2: Normalize sprint status**

- Mirror CC-AR completed stories (01/03/04/05/06) to `COMPLETE`
- Mark CC-AR-02, CC-AR-07, CC-AR-08 as `READY`
- Keep CC-AR-08 `BLOCKED` until CC-AR-04 verified

**Step 3: Workflow status sync**

- Update `current_phase` to `phase_1a_completion`
- Set Team A current story to `CC-AR-02`
- Set Team B current story to `CC-AR-08`

---

### Task 2: Story files for remaining CC-AR work

**Files:**
- Create: `_bmad-output/sprint-artifacts/stories/CC-AR-02-platform-defaults-route-2026-01-26.md`
- Create: `_bmad-output/sprint-artifacts/stories/CC-AR-07-archive-legacy-files-2026-01-26.md`
- Create: `_bmad-output/sprint-artifacts/stories/CC-AR-08-split-pluginlayout-2026-01-26.md`

**Step 1: Write YAML story headers**

- Use required story YAML format with `Story ID`, `Title`, `Points`, `Priority`, `Status`, `Description`, `Acceptance Criteria`, `Tasks`, `Dependencies`, `Time Box`, `Handoff Artifacts`.

**Step 2: Populate dependencies**

- CC-AR-02 depends on CC-AR-01
- CC-AR-07 depends on CC-AR-04
- CC-AR-08 depends on CC-AR-04 and CC-AR-05

---

### Task 3: Context XMLs for CC-AR story execution

**Files:**
- Create: `_bmad-output/sprint-artifacts/stories/CC-AR-02-context.xml`
- Create: `_bmad-output/sprint-artifacts/stories/CC-AR-07-context.xml`
- Create: `_bmad-output/sprint-artifacts/stories/CC-AR-08-context.xml`

**Step 1: Insert current code state snippets**

- `src/routes/$projectId.tsx`
- `src/infrastructure/plugins/platform-defaults.ts`
- `src/presentation/layouts/PluginLayout.tsx`

**Step 2: Add research notes**

- Use existing findings from CC-AR dev reports to populate `<research_notes>`.

---

### Task 4: EPIC-PH1A P1 backlog story stubs

**Files:**
- Create: `_bmad-output/sprint-artifacts/stories/ADR034-ROUTE-1-redirect-deprecated-routes-2026-01-26.md`
- Create: `_bmad-output/sprint-artifacts/stories/ADR034-ROUTE-2-platform-defaults-2026-01-26.md`
- Create: `_bmad-output/sprint-artifacts/stories/ADR034-NAV-1-router-navigation-2026-01-26.md`
- Create: `_bmad-output/sprint-artifacts/stories/NFT-3.3-1-filetree-sync-2026-01-26.md`
- Create: `_bmad-output/sprint-artifacts/stories/NFT-1.2-1-single-route-2026-01-26.md`
- Create: `_bmad-output/sprint-artifacts/stories/TERM-WORKSPACE-1-terminal-integration-2026-01-26.md`

**Step 1: Mark as `pending` with dependencies**

- Block on CC-AR-04 (layout), CC-AR-02 (platform defaults), and CC-AR-05 (Monaco) as specified.

---

### Task 5: Delegation handoffs

**Files:**
- Modify: `_bmad-output/sprint-artifacts/sprint-status-2026-01-26.yaml`
- Modify: `_bmad-output/workflow-status-2026-01-25.yaml`

**Step 1: Dispatch Team A**

- CC-AR-02: Wire platform defaults
- CC-AR-07: Archive legacy files

**Step 2: Dispatch Team B**

- CC-AR-08: Split PluginLayout.tsx

**Step 3: Track results**

- Update sprint/workflow status after each callback

---

### Task 6: Validation (post-completion)

**Run (once all CC-AR tasks complete):**

```
pnpm tsc --noEmit
pnpm vitest run
```

Record outputs in the relevant story dev records before marking `done`.
