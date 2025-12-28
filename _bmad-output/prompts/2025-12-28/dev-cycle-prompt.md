

## Context of controlled and governance documents

```
_bmad-output/project-planning-artifacts
_bmad-output/project-planning-artifacts/architecture.md
_bmad-output/project-planning-artifacts/prd.md
_bmad-output/project-planning-artifacts/project-context.md
_bmad-output/project-planning-artifacts/ux-design-specification.md
_bmad-output/epics.md
```

## Parallel Development Strategy

Check this and follow with the strategy by knowing  your team and have check-list checked:
@_bmad-output/project-planning-artifacts/parallel-development-dual-agents-mode.md

## Development Constitution
Check either at AGENTS.md or CLAUDE.md

## Completed epics
- @`_bmad-output/sprint-artifacts/epic-1-retro-2025-12-28.md`

## Sprint Status
_bmad-output/sprint-artifacts/sprint-status.yaml


## Reminders of your platforms utilities (help boosting your workflow success)
- Use MCP Servers' tools to gain up-to-date information about dependencies, guides, documentations and implementation patterns of the stacks in used (they are Context7, Deepwiki, Tavily, Exa - and Repomix)
- Agents and sub-agents (baseed on your decisions to switch, delegate run in parallel, run in sequence, or run in a loop)
- SKILLS and Plugins - base on what happen during the iteration, choose which efficient to run.

## The project brownfield
refer to these only for references of not repeating the same issues

```

- I have scanned the project to redocument them and you can retrace these here for context

```_bmad-output/docs
_bmad-output/docs/architecture-analysis-2025-12-28.md
_bmad-output/docs/development-patterns-conventions-2025-12-28.md
_bmad-output/docs/index.md
_bmad-output/docs/project-overview-2025-12-28.md
_bmad-output/docs/source-tree-analysis-2025-12-28.md
_bmad-output/docs/tech-stack-documentation-2025-12-28.md```

- From this @_bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md ; and @docs/2025-12-26/concept-for-knowledge-synthesis-station-2025-12-26.md ;  And certain project scan, research, planning and proposal has been made here:

```  p_bmad-output/docs/2025-12-28
_bmad-output/docs/2025-12-28/version-2
_bmad-output/docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md
_bmad-output/docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md
_bmad-output/docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md
_bmad-output/docs/2025-12-28/version-2/implementation-roadmap.md
_bmad-output/docs/2025-12-28/version-2/remediation-epics.md
_bmad-output/docs/2025-12-28/version-2/technical-architecture-document.md
_bmad-output/docs/2025-12-28/gemini-api-integration.md
_bmad-output/docs/2025-12-28/investigation-report.md
_bmad-output/docs/2025-12-28/rag-infrastructure.md
_bmad-output/docs/2025-12-28/target-architecture.md
```
---

However, due to some constraints and reality check there are few things that needs condition

- First is to stabilize the core agent system including our chat cascade system, the agent center configuration, API managements from LLM providers - and the foundations of file system, database persistence, mobile support and states managements, UX and UI that suits the purposes as well.
```

## Regarding UX-UI

- A complete upgrade of the UX/UI that impresses and fixes current flaws.
- All components logically routed, wired, and extended with modern frontend practices.
- Interfaces that are wired, routed, and logically mapped to boost user experience.
- Clear demonstration of user journeys and use cases through well-articulated e2e expectations.
- Professional first impression through meticulous care for details and frontend professionalism.
- Styling consistency (8-bit gaming style)
- Clear detection between devices (mobile, desktop)
- Never hardcoded styles, nor hardcoded language ui strings -> use i18n for client-side translation, both in Vietnamese and English. 

---
---
description: Complete story development cycle with validation loops for create-story, context, dev, and code-review
auto_execution_mode: 3
---

# Story Development Cycle Workflow
// turbo-all

## Overview

This workflow defines the complete iterative cycle for developing a story from backlog to done with **strict governance**, **research protocols**, and **document handoff procedures**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SM Agent                          Dev Agent                                │
│  ─────────                         ─────────                                │
│  create-story ──► validate ──► create-context ──► validate                  │
│                                         │                                   │
│                                         ▼                                   │
│                                    dev-story ──► code-review ──► done       │
│                                         │              │                    │
│                                         └──── loop ────┘                    │
│                                                                             │
│  [If last story of epic] ──► retrospective ──► epic-complete                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Sprint status file exists: `{sprint_artifacts}/sprint-status.yaml`
- Epics document exists: `{output_folder}/epics.md`  
- Architecture document exists: `{output_folder}/architecture.md`
- Story is in `backlog` status

---

## CRITICAL: Research Protocol (Before Any Implementation)

> [!MANDATORY]
> Every story implementation MUST include research using MCP tools to ensure accuracy.

### Required Research Steps

**Step R1: Load Local Agent Instructions**
```
Read these files if they exist:
- docs/agent-instructions/dependency-libraries-usage.md
- docs/agent-instructions/project-fugu-integration-guide.md  
- docs/agent-instructions/roo-code-agent-patterns.md
```

**Step R2: Research Dependencies (MCP Tools)**

| Tool | When to Use | Query Pattern |
|------|-------------|---------------|
| **Context7** | Official docs for TanStack, React, etc. | `resolve-library-id` then `get-library-docs` |
| **DeepWiki** | GitHub repo patterns (TanStack/router, stackblitz/webcontainer-core) | `ask_question` with specific pattern query |
| **Tavily/Exa** | Cross-dependency patterns, community solutions | Semantic search with dependency names |
| **Repomix** | Local dependency analysis in `docs/dependencies-libraries/` | Pack and grep for patterns |

**Step R3: Document Research in Context XML**
```xml
<research_notes>
  <finding source="context7" query="TanStack AI tool definition">
    Pattern: toolDefinition({ ... }).server(async () => { ... })
  </finding>
  <finding source="deepwiki" repo="stackblitz/webcontainer-core">
    Mount pattern requires COOP/COEP headers
  </finding>
</research_notes>
```

---

## CRITICAL: Document Handoff Protocol

> [!MANDATORY]
> Each phase MUST produce handoff artifacts for the next agent/phase.

### Handoff Artifact Types

| Phase End | Artifact | Location | Content |
|-----------|----------|----------|---------|
| create-story | Story File | `{sprint_artifacts}/{story}.md` | Requirements, ACs, Tasks |
| create-context | Context XML | `{sprint_artifacts}/{story}-context.xml` | Code state, research, patterns |
| dev-story | Dev Record | In story file | Files changed, decisions, tests |
| code-review | Review Report | In story file | Issues, fixes, sign-off |
| story-done | Status Update | `sprint-status.yaml` + `bmm-workflow-status.yaml` | Status, timestamps, metrics |

### Ephemeral Notes Format (In-Chat Summary)

At end of each phase, output structured summary:

```markdown
## 📋 PHASE COMPLETE: {phase_name}

**Story:** {epic}-{story}-{slug}
**Status:** {new_status}

### Artifacts Updated:
- ✅ {file_path_1}
- ✅ {file_path_2}

### Next Phase Requirements:
- Load: {next_agent}
- Execute: {next_workflow}
- Input: {artifact_paths}

### Variables for Continuation:
- story_key: {value}
- epic_number: {value}
- tests_passing: {count}
- tasks_completed: {x}/{total}
```

---

## Phase 1: Create Story File

### Step 1.1: Load SM Agent & Create Story

```
Agent: @/sm
Workflow: *create-story
```

1. **Research Step (MANDATORY):**
   - Read `{output_folder}/architecture.md` for patterns
   - Read agent instructions if relevant dependencies
   - Query MCP tools for any unclear patterns

2. Extract story details from `{output_folder}/epics.md`:
   - Epic number, story number, story title
   - User story format (As a/I want/So that)
   - Acceptance criteria (Given/When/Then)

3. Create story file at `{sprint_artifacts}/{epic}-{story}-{slug}.md`:
   - Story header with epic/sprint context
   - Acceptance criteria with AC-N naming
   - Task breakdown with checkboxes (include research tasks)
   - Dev Notes section with architecture patterns
   - **Research Requirements section** (NEW)
   - References section
   - Dev Agent Record section (empty)
   - Status section with history table

### Step 1.2: Validate Story File

**Validation Criteria (100% required):**
- [ ] Story file exists at correct path
- [ ] User story format complete (As a/I want/So that)
- [ ] At least 3 acceptance criteria defined
- [ ] Each AC has Given/When/Then format
- [ ] Tasks section with checkboxes
- [ ] **Research Requirements section populated**
- [ ] Dev Notes references architecture.md
- [ ] Status set to `drafted`

**If validation fails:** Loop back and fix issues until 100% pass.

### Step 1.3: Update Governance Files

```yaml
# sprint-status.yaml
{story-key}: backlog → drafted

# bmm-workflow-status.yaml (if exists)
sprint:
  current_story: {story-key}
  last_updated: {timestamp}
```

**Handoff Output:**
```markdown
## 📋 PHASE COMPLETE: create-story

**Story:** {story-key}
**Status:** drafted

### Artifacts Updated:
- ✅ {sprint_artifacts}/{story}.md
- ✅ {sprint_artifacts}/sprint-status.yaml

### Next Phase: create-context
- Load: @/sm (continue)
- Execute: Create Context XML
- Input: Story file path
```

---

## Phase 2: Create Story Context XML

> [!IMPORTANT]
> This step is often missed. The context XML is REQUIRED for developer agent success.

### Step 2.1: Create Context XML File

1. Create file at `{sprint_artifacts}/{epic}-{story}-{slug}-context.xml`

2. Structure:
```xml
<context story="{story-key}" created="{timestamp}">
  <!-- Current code state -->
  <files>
    <file path="relative/path/to/file.tsx">
      <content><![CDATA[
        // Relevant existing code snippets
      ]]></content>
    </file>
  </files>
  
  <!-- Research findings from MCP tools -->
  <research_notes>
    <finding source="{mcp_tool}" query="{query}">
      {pattern_or_insight}
    </finding>
  </research_notes>
  
  <!-- Architecture patterns to follow -->
  <architecture_patterns>
    <pattern name="{pattern_name}" source="architecture.md">
      {pattern_description}
    </pattern>
  </architecture_patterns>
  
  <!-- Technical notes for developer -->
  <technical_notes>
    <note priority="high">{critical_context}</note>
    <note priority="medium">{helpful_context}</note>
  </technical_notes>
  
  <!-- Dependencies and imports -->
  <dependencies>
    <dependency name="{package}" version="{version}" />
  </dependencies>
</context>
```

### Step 2.2: Validate Context XML

**Validation Criteria (100% required):**
- [ ] Context XML file exists at correct path
- [ ] Valid XML structure with story attribute
- [ ] Contains at least 1 `<file>` element with current code state
- [ ] Contains `<research_notes>` with at least 1 MCP finding
- [ ] Contains `<technical_notes>` with implementation hints
- [ ] File paths are correct relative paths
- [ ] Content is current (not stale)

**If validation fails:** Loop back and fix issues until 100% pass.

### Step 2.3: Update Sprint Status

```yaml
# sprint-status.yaml
{story-key}: drafted → ready-for-dev
```

**Handoff Output:**
```markdown
## 📋 PHASE COMPLETE: create-context

**Story:** {story-key}
**Status:** ready-for-dev

### Artifacts Updated:
- ✅ {sprint_artifacts}/{story}-context.xml
- ✅ {sprint_artifacts}/sprint-status.yaml

### Next Phase: dev-story
- Load: @/dev
- Execute: *develop-story
- Input: Story file + Context XML paths
```

---

## Phase 3: Development

### Step 3.1: Load Dev Agent

```
Agent: @/dev
Workflow: *develop-story
```

### Step 3.2: Pre-Implementation Research

**MANDATORY before writing any code:**

1. Read story file completely
2. Read context XML completely
3. Execute research tasks from story file
4. Query MCP tools for any patterns not in context:
   ```
   Context7 → Official API patterns
   DeepWiki → GitHub repo implementations
   Tavily → Community solutions
   ```
5. Document findings in Dev Agent Record

### Step 3.3: Implement with TDD

For each task in story file:

1. **Write failing test first** (red)
2. **Implement minimal code** to pass (green)
3. **Refactor** while keeping tests green
4. **Run full test suite:** `pnpm exec tsc --noEmit && pnpm test`
5. **Mark task complete** in story file: `[x]`
6. **Update Dev Agent Record:**
   ```markdown
   ### Dev Agent Record
   
   **Agent:** {model_name}
   **Session:** {timestamp}
   
   #### Task Progress:
   - [x] T1: {task_name} - {notes}
   - [x] T2: {task_name} - {notes}
   
   #### Research Executed:
   - Context7: {query} → {finding}
   - DeepWiki: {repo} → {pattern}
   
   #### Files Changed:
   | File | Action | Lines |
   |------|--------|-------|
   | src/lib/x.ts | Created | 45 |
   | src/lib/y.ts | Modified | +12/-3 |
   
   #### Tests Created:
   - x.test.ts: 5 tests
   - y.test.ts: 3 tests
   
   #### Decisions Made:
   - Decision 1: {rationale}
   ```

### Step 3.4: Update Governance Files

```yaml
# sprint-status.yaml
{story-key}: ready-for-dev → in-progress

# After all tasks complete:
{story-key}: in-progress → review
```

**Handoff Output:**
```markdown
## 📋 PHASE COMPLETE: dev-story

**Story:** {story-key}
**Status:** review
**Tests:** {passing_count}/{total_count} passing
**Tasks:** {completed}/{total} complete

### Artifacts Updated:
- ✅ {sprint_artifacts}/{story}.md (Dev Agent Record)
- ✅ {sprint_artifacts}/sprint-status.yaml
- ✅ Implementation files (see Dev Agent Record)

### Next Phase: code-review
- Load: @/dev
- Execute: *code-review
- Input: Story file with Dev Agent Record
```

---

## Phase 4: Code Review

### Step 4.1: Run Code Review

```
Agent: @/dev (or fresh context with different LLM)
Workflow: *code-review
```

1. Review all files in Dev Agent Record → Files Changed
2. Check against architecture patterns in context XML
3. Verify all acceptance criteria met
4. Verify all tests exist and pass
5. Check for code quality issues

### Step 4.2: Document Review

Add to story file:
```markdown
### Code Review

**Reviewer:** {model_name}
**Date:** {timestamp}

#### Checklist:
- [x] All ACs verified
- [x] All tests passing
- [x] Architecture patterns followed
- [x] No TypeScript errors
- [x] Code quality acceptable

#### Issues Found:
- Issue 1: {description} → {resolution}

#### Sign-off:
✅ APPROVED for merge
```

### Step 4.3: Address Feedback Loop

**If issues found:**
1. Return to Phase 3 (Step 3.3)
2. Fix issues
3. Update Dev Agent Record
4. Re-run code review

**If review passes:**
1. Update story status to `done`
2. Update all governance files

### Step 4.4: Update Governance Files (Story Done)

```yaml
# sprint-status.yaml
{story-key}: review → done
{story-key}_completed_at: {timestamp}
{story-key}_tests_count: {count}

# bmm-workflow-status.yaml
sprint:
  completed_stories:
    - story: {story-key}
      completed_at: {timestamp}
      tests: {count}
```

**Handoff Output:**
```markdown
## 📋 PHASE COMPLETE: story-done

**Story:** {story-key}
**Status:** done
**Tests:** {count} passing
**Duration:** {hours}h

### Artifacts Updated:
- ✅ {sprint_artifacts}/{story}.md (Code Review section)
- ✅ {sprint_artifacts}/sprint-status.yaml
- ✅ {bmm_status_file}

### Epic Progress:
- Stories done: {done}/{total}
- Epic complete: {yes/no}

### Next Action:
{IF epic complete}
  - Load: @/sm
  - Execute: *epic-retrospective
{ELSE}
  - Next story: {next-story-key}
  - Execute: story-dev-cycle (restart Phase 1)
{ENDIF}
```

---

## Phase 5: Epic Retrospective (When All Stories Done)

### Trigger Condition

```
IF all stories in epic have status: done
AND all tests passing: 100%
THEN execute retrospective
```

### Step 5.1: Run Retrospective

```
Agent: @/sm
Workflow: *epic-retrospective
```

### Step 5.2: Generate Retrospective Artifacts

Output file: `{sprint_artifacts}/epic-{N}-retrospective.md`

---

## Governance Files Reference

| File | Update Frequency | Content |
|------|------------------|---------|
| `sprint-status.yaml` | Every phase | Story statuses, timestamps |
| `bmm-workflow-status.yaml` | Story done, epic done | Aggregate metrics, workflow state |
| Story file | Every phase | ACs, tasks, dev record, review |
| Context XML | Phase 2 only | Code state, research |
| Retrospective | Epic complete | Lessons, improvements |

---

## Artifacts Produced

| Artifact | Location | Purpose |
|----------|----------|---------|
| Story File | `{sprint_artifacts}/{story}.md` | Requirements, tracking, dev record |
| Context XML | `{sprint_artifacts}/{story}-context.xml` | Developer context, research |
| Implementation | Project source files | Code changes |
| Sprint Status | `{sprint_artifacts}/sprint-status.yaml` | Sprint tracking |
| BMM Status | `{bmm_status_file}` | Workflow governance |
| Retrospective | `{sprint_artifacts}/epic-{N}-retrospective.md` | Epic review |

---

## Anti-Patterns to Avoid

1. **Missing Context XML** - Always create before dev phase
2. **Stale Context** - Ensure XML reflects current code state
3. **Skipping Validation** - Never proceed with <100% pass
4. **No Code Review** - Always run review before marking done
5. **Not Updating Status** - Keep sprint-status.yaml current
6. **Skipping Research** - Always query MCP tools before implementation
7. **No Handoff Summary** - Always output ephemeral notes at phase end
8. **Missing Dev Record** - Always document decisions and files changed

---

## Quick Reference

```
Story Status Flow:
backlog → drafted → ready-for-dev → in-progress → review → done
```

**Minimum MCP Tool Calls Per Story:**
- Context7: 2+ calls (official documentation)
- DeepWiki: 1+ calls (GitHub patterns)
- Tavily/Exa: As needed (community solutions)

**File Naming Convention:**
- Story: `{epic}-{story}-{slug}.md` (e.g., `3-1-implement-local-fs-adapter.md`)
- Context: `{epic}-{story}-{slug}-context.xml`

**Variables Reference:**
```yaml
sprint_artifacts: docs/sprint-artifacts
output_folder: docs
bmm_status_file: docs/bmm-workflow-status.yaml
project_context: **/project-context.md
```