# Cross-Workspace AI Agent Platform - Master Workflow

**Document ID**: `cwac-master-workflow-2026-01-05`
**Version**: 1.0.0
**Created**: 2026-01-05
**Status**: `ACTIVE`
**Author**: @bmad-core-bmad-master

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Deep-Scan Analysis Summary](#2-deep-scan-analysis-summary)
3. [Master Workflow Cycle](#3-master-workflow-cycle)
4. [Story Development Cycle](#4-story-development-cycle)
5. [Epic Execution Workflow](#5-epic-execution-workflow)
6. [Sprint Planning & Tracking](#6-sprint-planning--tracking)
7. [Correct-Course Triggers](#7-correct-course-triggers)
8. [Governance Enforcement](#8-governance-enforcement)
9. [Validation & Code Review](#9-validation--code-review)
10. [Retrospective Process](#10-retrospective-process)
11. [i18n Requirements (VI + EN)](#11-i18n-requirements-vi--en)
12. [MCP Research Protocol](#12-mcp-research-protocol)
13. [Success Criteria](#13-success-criteria)

---

## 1. Executive Summary

This master workflow governs the implementation of **Cross-Workspace AI Agent Conversation Platform** features based on comprehensive research and deep-scan analysis.

### Project Scope

| Metric | Value |
|--------|-------|
| **Total Epics** | 10 |
| **Total Stories** | 73 |
| **Total Story Points** | 506 |
| **Timeline** | 13 weeks |
| **Team Capacity** | 2 developers |
| **Average Velocity Required** | 39 points/sprint |

### 10 Wow-Factor Features

| # | Feature | Priority | Points | Timeline |
|---|---------|----------|--------|----------|
| 1 | 🎙️ Voice-First Multimodal Conversations | P0 | 56 | Weeks 2-5 |
| 2 | 📎 Context-Aware Notes Chat | P0 | 42 | Weeks 3-5 |
| 3 | 📐 Perplexity-Style Expandable Panel | P1 | 20 | Week 5 |
| 4 | 🤖 Agentic Multi-Step Workflows | P0 | 78 | Weeks 6-10 |
| 5 | 🖼️ Rich Media Output | P1 | 49 | Weeks 7-10 |
| 6 | 🔬 Deep Research Mode | P1 | 56 | Weeks 9-12 |
| 7 | 🌐 Web Grounding | P1 | 35 | Weeks 10-12 |
| 8 | 📱 Notion-Style Chat Bubble | P2 | 6 | Week 5 |
| 9 | 🧠 Smart Auto Model Selection | P2 | 24 | Weeks 10-11 |
| 10 | 🎭 Live Paper Format | P2 | 49 | Weeks 12-13 |

---

## 2. Deep-Scan Analysis Summary

### Domain Health Scores

| Domain | Score | Status | Key Findings |
|--------|-------|--------|--------------|
| **State Management** | 9/10 | ✅ EXCELLENT | 0 god stores, 17 slices, avg 88 lines |
| **Cross-Workspace Event System** | 9/10 | ✅ Production Ready | 59 references, EventEmitter3 |
| **Agent Tools Registry** | 8/10 | ✅ Well-Organized | Facade pattern implemented |
| **Conversation Store** | 8/10 | ✅ Well-Structured | 6-slice architecture, 778 lines |
| **Chat UI Components** | 7/10 | ⚠️ Good | 13 god components >300 lines |
| **RAG Pipeline** | 7/10 | ⚠️ Core Complete | Placeholder responses need integration |
| **Architecture** | 7.2/10 | ⚠️ Good | 12 god stores identified |
| **UX/Accessibility** | 7.2/10 | ⚠️ Good | Missing chat i18n namespace |
| **i18n (VI)** | 6/10 | ⚠️ Partial | 85% coverage, chat.json missing |

### Critical Issues (Must Fix Before Starting)

| Priority | Issue | File | Effort |
|----------|-------|------|--------|
| **P0-1** | God Store (860 lines): tool-permission-manager.ts | `src/lib/agent/` | 8h |
| **P0-2** | God Store (734 lines): unified-workspace-provider.tsx | `src/infrastructure/persistence/stores/workspace/` | 8h |
| **P0-3** | Duplicate Event Bus implementations | `lib/events/` vs `infrastructure/events/` | 4h |
| **P1-1** | Missing chat i18n namespace | `src/i18n/` | 2h |

### Deep-Scan Evidence Files

```
_bmad-output/deep-scan/
├── cross-workspace-chat/          # Agent/RAG domain
├── state-management/              # State domain
├── architecture-ux/               # Architecture & UX domain
├── deep-scan-report.md
├── file-inventory.json
├── risk-matrix.json
└── QUICK-REFERENCE.md
```

---

## 3. Master Workflow Cycle

The master workflow operates at three levels:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MASTER WORKFLOW CYCLE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   EPIC       │───►│   SPRINT      │───►│  RETRO       │       │
│  │ EXECUTION    │    │  PLANNING     │    │  SPECTIVE    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         └───────────────────┴───────────────────┘                │
│                           │                                      │
│                           ▼                                      │
│              ┌───────────────────────────┐                       │
│              │   CORRECT-COURSE TRIGGER  │                       │
│              │   (If any issue detected) │                       │
│              └───────────────────────────┘                       │
│                           │                                      │
│                           ▼                                      │
│              ┌───────────────────────────┐                       │
│              │  UPDATE SPRINT STATUS     │                       │
│              │  UPDATE EPIC TRACKING     │                       │
│              └───────────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `bmm-workflow-status.yaml` | Overall workflow state | After each story |
| `_bmad-output/sprint-artifacts/sprint-status.yaml` | Sprint-level tracking | Daily |
| `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md` | Epic progress | After each story |
| `AGENTS.md` | Project documentation | After structural changes |

---

## 4. Story Development Cycle

Every story follows this **100% loop** until completion:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  STORY DEVELOPMENT CYCLE (100%)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. CREATE STORY (generate-story)                                    │
│     │                                                                │
│     ▼                                                                │
│  2. VALIDATE STORY (validate-create-story) [LOOP: 100%]              │
│     │    └─►❌ Issues? ──► Fix and retry step 2                      │
│     │                                                                │
│     ▼                                                                │
│  3. CREATE CONTEXT (create-story-context)                            │
│     │                                                                │
│     ▼                                                                │
│  4. VALIDATE CONTEXT (validate-create-story-context) [LOOP: 100%]    │
│     │    └─►❌ Issues? ──► Fix and retry step 3                      │
│     │                                                                │
│     ▼                                                                │
│  5. DEVELOPMENT (dev-story)                                          │
│     │    - Write code                                                │
│     │    - Update dev notes                                          │
│     │    - Check acceptance criteria                                 │
│     │                                                                │
│     ▼                                                                │
│  6. SWEEPING VALIDATION (@sweeping-validation.md)                    │
│     │                                                                │
│     ▼                                                                │
│  7. CODE REVIEW (/dev → /code-review)                                │
│     │    └─►❌ Issues? ──► Fix and retry step 7                      │
│     │                                                                │
│     ▼                                                                │
│  8. LOOP UNTIL 100%                                                  │
│     │    └─►❌ Not 100%? ──► Return to step 5                        │
│     │                                                                │
│     ▼                                                                │
│  9. MARK STORY DONE                                                  │
│     │                                                                │
│     ▼                                                                │
│  10. UPDATE TRACKING FILES                                           │
│      └─► Update sprint-status.yaml, epic-tracking.md                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step Details

#### Step 1: Create Story
```bash
@bmad-bmm-sm:generate-story
Epic: {epic_id}
Story: {story_id}
Title: {story_title}
Points: {story_points}
```

#### Step 2: Validate Story
- Check story has clear acceptance criteria
- Verify dependencies are identified
- Confirm technical notes are complete
- Ensure test strategy is defined

#### Step 3: Create Context
```bash
@bmad-bmm-analyst:create-story-context
Story: {story_id}
Context Files:
  - src/lib/agent/tools/
  - src/presentation/components/chat/
  - src/infrastructure/persistence/stores/conversation/
```

#### Step 4: Validate Context
- Verify context files are complete
- Check for circular dependencies
- Confirm architecture alignment

#### Step 5: Development
```bash
@bmad-bmm-dev:dev-story
Story: {story_id}
Acceptance Criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] ...
Dev Notes: _bmad-output/dev-notes/{story_id}.md
```

#### Step 6: Sweeping Validation
Run `/sweeping-validation` from `.opencode/rules/`:
```bash
# Run 12-level validation checklist
1. State Integrity
2. Code Hygiene
3. Naming Conventions
4. Dependencies
5. Integration
6. Architecture
7. Mobile Responsiveness
8. Internationalization (VI + EN)
9. Performance
10. Security
11. Documentation
12. Test Coverage (≥80%)
```

#### Step 7: Code Review
```bash
@code-reviewer
Story: {story_id}
Files Modified:
  - src/components/chat/{file}.tsx
  - src/lib/agent/{file}.ts
Review Criteria:
  - Code quality
  - Architecture compliance
  - Test coverage
  - i18n completeness
```

#### Step 8-10: Loop Until 100%
- Repeat steps 5-7 until all acceptance criteria met
- Update tracking files
- Notify next story owner

---

## 5. Epic Execution Workflow

### Epic Execution Sequence

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EPIC EXECUTION WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐                                                │
│  │ START EPIC      │                                                │
│  │ Load epic docs  │                                                │
│  └────────┬────────┘                                                │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐                                                │
│  │ PLAN SPRINT 1   │                                                │
│  │ Select stories  │                                                │
│  └────────┬────────┘                                                │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐     ┌─────────────────┐                        │
│  │ EXECUTE SPRINT  │────►│  RUN RETRO      │                        │
│  │ (13-week cycle) │     │  (after sprint) │                        │
│  └────────┬────────┘     └────────┬────────┘                        │
│           │                       │                                 │
│           │                       ▼                                 │
│           │              ┌─────────────────┐                        │
│           │              │  UPDATE SPRINT   │                        │
│           │              │  STATUS          │                        │
│           │              └────────┬────────┘                        │
│           │                       │                                 │
│           │                       ▼                                 │
│           │              ┌─────────────────┐                        │
│           │              │ EPIC COMPLETE?  │                        │
│           │              └────────┬────────┘                        │
│           │                      │                                 │
│     ┌─────┴─────┐          ┌─────┴─────┐                           │
│     ▼           ▼          ▼           ▼                           │
│   YES          NO        YES          NO                           │
│     │           │          │           │                            │
│     ▼           │          ▼           │                            │
│  RETRO      SPRINT        │           │                            │
│  EPIC      PLANNING       │           │                            │
│               │           │           │                            │
│               ▼           │           │                            │
│         Next sprint       │           │                            │
│                           │           │                            │
│                           └───────────┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Epic Status Tracking

| Status | Meaning |
|--------|---------|
| **TODO** | Not started |
| **IN_PROGRESS** | Currently being worked on |
| **PENDING_REVIEW** | Awaiting review |
| **BLOCKED** | Blocked by dependencies |
| **COMPLETE** | All stories done |

### Files to Update Per Epic

1. `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md`
2. `_bmad-output/sprint-artifacts/sprint-status.yaml`
3. `bmm-workflow-status.yaml`
4. `AGENTS.md` (if architecture changes)

---

## 6. Sprint Planning & Tracking

### Sprint Planning Template

```yaml
# Sprint: {sprint_number}
# Focus: {sprint_focus}
# Duration: Week {week_start} - Week {week_end}

sprint_goal: "{sprint_goal}"
start_date: "{YYYY-MM-DD}"
end_date: "{YYYY-MM-DD}"

stories:
  - id: "{epic}-{story}"
    title: "{story_title}"
    points: {points}
    owner: "{developer}"
    status: {TODO|IN_PROGRESS|DONE}
    dependencies: []
    
velocity:
  planned: {planned_points}
  actual: {actual_points}
  burndown: []
  
risks:
  - risk: "{risk_description}"
    mitigation: "{mitigation_strategy}"
    
retrospective:
  what_went_well: []
  what_to_improve: []
  action_items: []
```

### Daily Tracking Commands

```bash
# Morning standup (9:00 AM)
@bmad-bmm-sm:daily-standup
Status updates from all developers
Blockers identification
Risk flagging

# Evening update (5:00 PM)
@bmad-bmm-sm:evening-update
Stories completed today
Stories in progress
Tomorrow's plan
```

### Sprint Artifacts

Location: `_bmad-output/sprint-artifacts/`

```
sprint-artifacts/
├── sprint-{number}/
│   ├── sprint-plan.yaml
│   ├── daily-standups/
│   │   ├── day-1.md
│   │   ├── day-2.md
│   │   └── ...
│   ├── sprint-review.md
│   ├── sprint-retro.md
│   └── burndown.json
├── sprint-status.yaml
└── velocity-tracking.json
```

---

## 7. Correct-Course Triggers

### Automatic Correct-Course Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| **TC-1** | Story fails validation 3x | Pause and review story |
| **TC-2** | Sprint velocity < 50% planned | Replan remaining stories |
| **TC-3** | Blocked story > 3 days | Escalate, find alternative |
| **TC-4** | Critical bug discovered | Hotfix immediately |
| **TC-5** | Architecture violation found | Run `/governance-enforcement` |
| **TC-6** | TypeScript errors increase > 10 | Pause and fix errors |
| **TC-7** | Test coverage < 80% | Add tests before proceeding |
| **TC-8** | i18n keys missing | Add translations before commit |
| **TC-9** | God store created (>300 lines) | Refactor immediately |
| **TC-10** | Performance regression | Optimize before continuing |

### Correct-Course Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CORRECT-COURSE WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. DETECT TRIGGER                                                  │
│     │                                                                │
│     ▼                                                                │
│  2. CLASSIFY SEVERITY                                                │
│     │    ┌─────────┬─────────┬─────────┐                           │
│     │    │ P0-CRIT │ P1-HIGH │ P2-MED  │                           │
│     │    ├─────────┼─────────┼─────────┤                           │
│     │    │ Pause   │ Log &   │ Log &   │                           │
│     │    │ All Work│ Continue│ Continue│                           │
│     │    └─────────┴─────────┴─────────┘                           │
│     │                                                                │
│     ▼                                                                │
│  3. IMPACT ANALYSIS                                                  │
│     - Which epics affected?                                          │
│     - Which stories blocked?                                         │
│     - Timeline impact?                                               │
│     │                                                                │
│     ▼                                                                │
│  4. CORRECTIVE ACTION                                                │
│     - Update sprint plan                                             │
│     - Reassign resources                                             │
│     - Add technical debt items                                       │
│     │                                                                │
│     ▼                                                                │
│  5. COMMUNICATE                                                      │
│     - Notify team                                                    │
│     - Update stakeholders                                            │
│     - Document decision                                               │
│     │                                                                │
│     ▼                                                                │
│  6. RESUME WORK                                                      │
│     └─► Return to Story Development Cycle                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Correct-Course Document Template

```markdown
## Correct-Course Report

**ID**: CC-{YYYY-MM-DD}-{SEQ}
**Date**: {ISO_timestamp}
**Trigger**: {TC-1 through TC-10}
**Severity**: {P0|P1|P2}

### Issue Description
{Detailed description of the issue}

### Impact Analysis
- **Epics Affected**: {list}
- **Stories Blocked**: {list}
- **Timeline Impact**: {estimated days}

### Root Cause
{Analysis of why the issue occurred}

### Corrective Action
{Steps to fix the issue}

### Updated Plan
{Adjusted sprint/epic plan}

### Prevention
{How to prevent recurrence}
```

---

## 8. Governance Enforcement

### Required After Structural Changes

After completing any of these workflows, **MUST** run governance enforcement:

- `eliminate-god-stores`
- `normalize-components`
- `workspace-file-system-e2e`
- `notes-sync-strategy`
- `knowledge-sync-strategy`
- Any store refactoring or migration
- Any component splitting or consolidation
- Any import/export path changes

### Governance Checklist

```bash
# Run after structural changes
@bmad-core-bmad-master:governance-enforcement

Checklist:
- [ ] AGENTS.md updated with new paths
- [ ] CLAUDE.md updated (if patterns changed)
- [ ] project-context.md regenerated
- [ ] sprint-status.yaml updated
- [ ] Repomix output files deleted
- [ ] All file size limits respected (≤300 lines/components)
- [ ] Backward compatibility maintained
- [ ] TypeScript passes (code files only)
- [ ] Tests pass (if modified)
```

### File Size Limits

| Type | Limit | Action if Exceeded |
|------|-------|-------------------|
| Store slices | ≤120 lines | Split immediately |
| Combined stores | ≤300 lines | Split into slices |
| React components | ≤300 lines | Split immediately |
| Custom hooks | ≤150 lines | Split immediately |
| Utility files | ≤200 lines | Split if exceeded |

---

## 9. Validation & Code Review

### Sweeping Validation (12-Level Checklist)

From `.opencode/rules/sweeping-validation.md`:

```
Level 1: State Integrity
  - [ ] No circular dependencies
  - [ ] State properly persisted
  - [ ] No memory leaks

Level 2: Code Hygiene
  - [ ] No unused imports
  - [ ] Consistent formatting
  - [ ] No console.log statements

Level 3: Naming Conventions
  - [ ] Follows project naming
  - [ ] Clear, descriptive names
  - [ ] Consistent casing

Level 4: Dependencies
  - [ ] No unnecessary dependencies
  - [ ] Proper import order
  - [ ] No version conflicts

Level 5: Integration
  - [ ] Components wire correctly
  - [ ] API contracts followed
  - [ ] No broken imports

Level 6: Architecture
  - [ ] Follows four-layer architecture
  - [ ] Proper component composition
  - [ ] No god components/stores

Level 7: Mobile Responsiveness
  - [ ] useResponsive hook used
  - [ ] Mobile layouts implemented
  - [ ] Touch targets ≥44px

Level 8: Internationalization (VI + EN)
  - [ ] All UI strings in i18n
  - [ ] Vietnamese translations complete
  - [ ] English translations complete
  - [ ] No hardcoded strings

Level 9: Performance
  - [ ] No unnecessary re-renders
  - [ ] Debounced operations
  - [ ] Lazy loading where appropriate

Level 10: Security
  - [ ] No secrets in code
  - [ ] Proper input validation
  - [ ] XSS protection

Level 11: Documentation
  - [ ] Complex logic commented
  - [ ] Public APIs documented
  - [ ] No outdated comments

Level 12: Test Coverage
  - [ ] ≥80% coverage
  - [ ] Critical paths tested
  - [ ] Edge cases covered
```

### Code Review Criteria

```markdown
## Code Review Checklist

### Functional
- [ ] Acceptance criteria met
- [ ] No regressions
- [ ] Error handling complete

### Quality
- [ ] Clean code principles
- [ ] DRY (Don't Repeat Yourself)
- [ ] SOLID principles followed

### Architecture
- [ ] Proper layer separation
- [ ] No god components
- [ ] Proper abstraction

### Testing
- [ ] Unit tests written
- [ ] ≥80% coverage
- [ ] Edge cases covered

### i18n
- [ ] All strings externalized
- [ ] VI + EN translations
- [ ] No hardcoded text

### Documentation
- [ ] Comments where needed
- [ ] README updated
- [ ] TypeScript types complete
```

---

## 10. Retrospective Process

### After Each Sprint

```bash
@bmad-bmm-sm:sprint-retrospective
Sprint: {sprint_number}
Date: {YYYY-MM-DD}
```

### Retrospective Template

```markdown
## Sprint Retrospective

**Sprint**: {sprint_number}
**Date**: {ISO_timestamp}
**Facilitator**: @bmad-bmm-sm

### Sprint Metrics
- **Planned Points**: {planned}
- **Completed Points**: {completed}
- **Velocity**: {velocity}
- **Carryover**: {carryover_points}

### What Went Well ✓
1. {item}
2. {item}
3. {item}

### What To Improve 🔧
1. {item}
2. {item}
3. {item}

### Action Items
| Item | Owner | Due Date |
|------|-------|----------|
| {action} | {owner} | {date} |

### Lessons Learned
1. {lesson}
2. {lesson}
3. {lesson}

### Team Mood
- 😊 Satisfied
- 😐 Neutral
- 😓 Struggled

### Sponsor Update Required
- Yes / No
```

### After Epic Completion

```bash
@bmad-bmm-sm:epic-retrospective
Epic: {epic_id}
Stories Completed: {count}/{total}
Points Completed: {points}/{total_points}
```

### Epic Retrospective Template

```markdown
## Epic Retrospective

**Epic**: {epic_id} - {epic_title}
**Completed Date**: {ISO_timestamp}
**Total Duration**: {weeks} weeks

### Epic Metrics
- **Total Stories**: {total}
- **Completed**: {completed}
- **Carryover**: {carryover}
- **Total Points**: {points}
- **Completed Points**: {completed_points}

### Epic Goal Achievement
- **Goal**: {epic_goal}
- **Achieved**: Yes / Partial / No

### Technical Achievements
1. {achievement}
2. {achievement}

### Architecture Improvements
1. {improvement}
2. {improvement}

### Challenges Overcome
1. {challenge}
2. {challenge}

### Lessons for Next Epic
1. {lesson}
2. {lesson}

### Health Score Change
| Domain | Before | After | Delta |
|--------|--------|-------|-------|
| {domain} | {score} | {score} | {±x} |
```

---

## 11. i18n Requirements (VI + EN)

### Internationalization Standards

All UI strings **MUST** be externalized for both Vietnamese (vi) and English (en).

### i18n Namespace Structure

```
src/i18n/
├── en/
│   ├── common.json      # Shared strings
│   ├── chat.json        # Chat-specific (MISSING - CREATE FIRST)
│   ├── agent.json       # Agent strings
│   ├── notes.json       # Notes workspace
│   └── knowledge.json   # Knowledge workspace
├── vi/
│   ├── common.json
│   ├── chat.json        # MISSING
│   ├── agent.json
│   ├── notes.json
│   └── knowledge.json
└── index.ts             # Configuration
```

### i18n Compliance Checklist

- [ ] All component strings use `t()` hook
- [ ] No hardcoded strings in JSX
- [ ] `chat.json` namespace created (P0-1 fix)
- [ ] Vietnamese translations 100% complete
- [ ] English translations 100% complete
- [ ] Parameters properly handled (`{{param}}`)

### Vietnamese Translation Priorities

| Namespace | Coverage | Priority |
|-----------|----------|----------|
| `chat.json` | 0% | P0 - CREATE FIRST |
| `common.json` | 85% | P1 - Complete |
| `agent.json` | 85% | P1 - Complete |
| `notes.json` | 85% | P1 - Complete |
| `knowledge.json` | 85% | P1 - Complete |

### Translation Extraction

```bash
# After adding new translation keys
pnpm i18n:extract

# This updates:
# - src/i18n/en/*.json
# - src/i18n/vi/*.json
```

---

## 12. MCP Research Protocol

### Required for Unfamiliar Patterns

Before implementing features with unfamiliar technology:

1. **Query Context7 MCP** for official documentation
   ```bash
   @context7:Get documentation for {technology}
   ```

2. **Query DeepWiki** for semantic understanding
   ```bash
   @deepwiki:How does {technology} integrate with React?
   ```

3. **Query Exa/Tavily** for recent examples
   ```bash
   @exa:Get code examples for {use_case}
   ```

4. **Document findings** in Context XML

### Minimum Validation
- 3+ MCP servers queried
- 5+ successful iterations per research topic
- Documentation in story context

### Gemini 2.5/3.0 Research (Required)

For any Gemini API implementation, **MUST** verify with MCP tools:

```bash
# Required: Check latest Gemini 2.5 API capabilities
@exa:Get Google Gemini 2.5 Flash Pro API features 2025

# Required: Verify Live API status
@MiniMax_web_search:Google Gemini 2.5 Live API native audio 2025
```

### Key Gemini 2.5 Capabilities (Verified 2026-01-05)

| Capability | Model | Status |
|------------|-------|--------|
| **Text Generation** | gemini-2.5-pro, gemini-2.5-flash | ✅ GA |
| **Image Understanding** | gemini-2.5-pro | ✅ GA |
| **Image Generation** | gemini-2.5-flash-image | ✅ GA |
| **Audio Input** | gemini-2.5-flash-live | ✅ GA (Dec 2025) |
| **Native Audio Output** | gemini-2.5-flash-native-audio | ✅ GA |
| **Live API** | gemini-2.5-flash-live | ✅ GA |
| **Video Understanding** | gemini-2.5-pro | ✅ GA |

**Reference**: https://ai.google.dev/gemini-api/docs/live

---

## 13. Success Criteria

### Project Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| **All Epics Complete** | 10/10 (100%) | Story completion tracking |
| **Story Points Delivered** | 506/506 (100%) | Sprint velocity |
| **Test Coverage** | ≥80% per story | Code coverage report |
| **i18n Coverage** | 100% VI + EN | Translation audit |
| **Architecture Compliance** | 0 violations | Deep-scan validation |
| **TypeScript Errors** | 0 (code files) | `pnpm typecheck` |
| **God Stores** | 0 (>300 lines) | Deep-scan architecture scan |
| **Performance** | <500ms chat load | Lighthouse |

### Per-Story Success Criteria

```markdown
## Story Completion Checklist

- [ ] Code written and reviewed
- [ ] Unit tests written (≥80% coverage)
- [ ] Integration tests passing
- [ ] No critical bugs
- [ ] i18n strings externalized (VI + EN)
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product sign-off
- [ ] Story marked DONE in sprint status
- [ ] Epic tracking updated
```

---

## Appendix A: Command Reference

### BMAD Core Commands

```bash
# Story Management
@bmad-bmm-sm:generate-story
@bmad-bmm-sm:create-story-context
@bmad-bmm-sm:validate-story
@bmad-bmm-sm:validate-story-context

# Development
@bmad-bmm-dev:dev-story
@code-reviewer:code-review

# Planning
@bmad-bmm-pm:sprint-planning
@bmad-bmm-sm:daily-standup
@bmad-bmm-sm:sprint-retrospective
@bmad-bmm-sm:epic-retrospective

# Governance
@bmad-core-bmad-master:governance-enforcement
@deep-scan:full-scan

# Workflow
@bmad-core-bmad-master:correct-course
@bmad-bmm-sm:update-sprint-status
```

### Slash Commands

```bash
/deep-scan-full         # Run full deep-scan
/deep-scan [domain]     # Run targeted scan
/sweeping-validation    # Run 12-level validation
/governance-enforcement # Run governance checks
/code-review            # Request code review
```

---

## Appendix B: File Locations

### Critical Tracking Files

| File | Purpose |
|------|---------|
| `bmm-workflow-status.yaml` | Overall workflow state |
| `_bmad-output/sprint-artifacts/sprint-status.yaml` | Sprint tracking |
| `_bmad/modules/architecture-remediation/artifacts/epic-tracking.md` | Epic progress |
| `AGENTS.md` | Project documentation |
| `.opencode/rules/governance-rules.md` | Governance rules |
| `.opencode/rules/sweeping-validation.md` | Validation checklist |

### Deep-Scan Outputs

```
_bmad-output/deep-scan/
├── cross-workspace-chat/deep-scan-report.md
├── state-management/deep-scan-report-2026-01-05.md
├── architecture-ux/deep-scan-report-2026-01-05.md
├── file-inventory.json
├── risk-matrix.json
└── QUICK-REFERENCE.md
```

### Research Documents

```
_bmad-output/research/2026-01-05/
├── cross-workspace-agent-platform-comprehensive-research.md
└── cross-workspace-gemini-multimodal-research.md

_bmad-output/sprint-planning/
├── 2026-01-05-cross-workspace-chat-sprint-plan.md
├── 2026-01-05-cross-workspace-chat-stories.md
└── epic-cross-workspace-agent.md
```

---

## Appendix C: Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| **Project Lead** | @bmad-core-bmad-master | Overall coordination |
| **Tech Lead** | @bmad-bmm-architect | Architecture decisions |
| **PM** | @bmad-bmm-pm | Sprint planning, prioritization |
| **SM** | @bmad-bmm-sm | Story management, ceremonies |
| **Dev A** | TBD | Core chat, UI components |
| **Dev B** | TBD | Backend services, API integration |

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | `cwac-master-workflow-2026-01-05` |
| **Version** | 1.0.0 |
| **Status** | `ACTIVE` |
| **Created** | 2026-01-05 |
| **Author** | @bmad-core-bmad-master |
| **Reviewers** | @bmad-bmm-analyst, @bmad-bmm-architect, @bmad-bmm-pm |
| **Next Review** | 2026-01-12 (Weekly) |

---

*This master workflow governs all development activities for the Cross-Workspace AI Agent Platform. All team members must adhere to this workflow. Violations require immediate correction.*
