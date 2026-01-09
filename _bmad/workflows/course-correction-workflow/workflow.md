---
name: course-correction-workflow
description: Cross-workspace assessment orchestrating IDE and Notes space stabilization with vertical-first sprint strategy
web_bundle: true
created: 2026-01-07T11:30:00+07:00
updated: 2026-01-09T19:00:00+07:00
created_by: bmad-core-bmad-master
workflow_type: remediation
trigger: /correct-course
version: 2.0.0
---

# Course Correction Workflow v2.0

> **CRITICAL CONTEXT**: EPIC-3x stories are NOT the active sprint. Focus ONLY on **Phase 1 (P1-xx)** and **Phase 2 (P2-xx)** prefixed stories. Any reference to EPIC-30, EPIC-31, EPIC-38 etc. should be ignored until all P1/P2 stories are complete.

---

## Mission Statement

You are tasked with orchestrating a cross-workspace assessment with a primary focus on the **IDE** and **Notes** spaces. While "study page" and "knowledge page" contexts exist, they must not distract or confuse the agents; they should only resurface if they do not interfere with the core objective.

**Primary Goal**: Analyze the system architecture to unblock user journeys, prioritizing **vertical progression before horizontal expansion**.

---

## Strategic Approach

### 1. Vertical Unblocking (FIRST PRIORITY)
Focus on clearing the user's journey down a single vertical line.
- Complete one workspace fully before moving to the next
- IDE Space → Notes Space → (Others only if non-interfering)

### 2. Horizontal Expansion (SECOND PRIORITY)
Once the vertical path is clear, expand to all possible horizontal lines.
- Cross-workspace features
- Shared components
- Common utilities

### 3. Architectural Assessment (CONTINUOUS)
Continuously assess the architecture to identify points for consolidation, refactoring, or decision-making:
- Split "god components" only when they lack feature involvement
- Review latest project planning and ADRs
- Document decisions in handoffs

### 4. Prioritization (END-USER PERSPECTIVE)
Validate and prioritize document scanning from an end-user perspective.
- Can user complete their task?
- What blocks them first?
- Fix that first, then the next block.

---

## The Matrix: Critical Blocking Factors

Look beyond superficial "journey blocking" assessments. Drill down to identify:

### Deep-Seated Issues

| Category | What to Identify |
|----------|-----------------|
| **Loops & Context** | React/Zustand discrepancies, inefficient DB queries |
| **Logic & Routing** | Redirect loops, routing logic, data flow, API contracts |
| **State Management** | State/persistence conflicts, reactive pattern inefficiencies |
| **File System Centralization** | CRUD permissions, file types vs rendering, agent tooling, sync |
| **UI/UX Implementation** | Prop wiring inefficiency, UI component chains, dependent features |
| **Interface Intelligence** | Signposting next steps, user confusion points |

### File System Centralization (HIGH-RISK)

This is a **high-risk architectural area** across workspaces. Address:

| Aspect | Considerations |
|--------|----------------|
| CRUD Permissions | Users AND AI agents, edge cases (concurrency) |
| File Types vs Frontend | Rendering compatibility |
| Agent Tooling | Monaco editor, terminal, file tree, notes space sync |
| Mobile vs Desktop | Temporary spaces parity |

---

## Current Configuration Constraints

### Google Gemini API (CRITICAL BLOCKER)

**Status**: Configuration is currently **hardcoded and not configurable**.

**Impact**:
- Severely affects vertical agent configuration
- Blocks 2nd and 3rd architecture levels
- Multimodality capabilities for Notes space are blocked

**Required Fix**: Must be addressed in Phase 1 before agent features can work.

---

## Space-Specific Analysis

### General Mindset

Treat IDE and Notes spaces with a matrix of understanding rooted in **project creation**:
- Users create projects by syncing to local system folders
- Each folder acts as a root, traversing down to the deepest files
- Project = folder context for all operations

---

## 1. IDE Space

### Current State

**STATUS**: BLOCKED

**Root Cause**: No file systems synchronized to start any task.

**Mobile Users**: Feature is disabled (intentional).

### Required User Scenario

> "I am a developer; I want to build a quick NextJS prototype landing page."

### Agent Capabilities Needed

| Capability | Description |
|------------|-------------|
| **Guidance** | Guide user or transform prompts into actionable plan |
| **Tool Execution** | YOLO mode, streaming tools, or text-based context |
| **Chat Thread** | Cross-workspace entity, indexed for RAG |

### Phase 1 Stories (IDE)

| Story | Title | Priority | Status |
|-------|-------|----------|--------|
| **P1-02** | Simplify IDE Route to 2 Patterns | P0 | drafted |
| **P1-03** | Create Temp Project Auto-Flow | P0 | pending |
| **P1-06** | Investigate IDE Full CRUD | P1 | pending |

---

## 2. Notes Space

### Current State

**STATUS**: PARTIALLY BLOCKED

**Issues**:
1. Disconnection from project-level file system
2. Non-reactive note switching (no hotloading)
3. Unwired or non-functional props in 3-pane layout

### AI Agent Configuration Challenge

**Key Distinction**: "Coding Agent" (IDE) vs "Notes Agent" must be differentiated.

| Aspect | Shared | Different |
|--------|--------|-----------|
| Agent Concept | ✅ Same | - |
| Conversation Thread | ✅ Same (RAG table) | - |
| System Instructions | - | ❌ Different per workspace |
| Toolset | - | ❌ Different per workspace |
| User Prompt Space | - | ❌ Currently missing for customization |

### LLM & Multimodality

**Features**:
- Content generation via commands
- Prompt injection
- Context transformation

**Architectural Dilemma**:
Both Coding Agent and Notes generation use the **same API vault key and endpoint**. 

**Decision Required**: Determine best architectural approach to handle shared resource while maintaining distinct behaviors.

### Phase 1 Stories (Notes)

| Story | Title | Priority | Status |
|-------|-------|----------|--------|
| **P1-01** | Simplify Notes Route to 2 Patterns | P0 | drafted |
| **P1-07** | Investigate Notes Full CRUD | P1 | pending |
| **P1-08** | Trace Vault → AI Chain | P0 | drafted |

---

## Phase Structure

### Phase 1: Vertical Unblocking (CURRENT)

**Focus**: Clear user journey down single vertical line.

**Stories** (P1-xx prefix):

| Story | Space | Title | Priority | Est. |
|-------|-------|-------|----------|------|
| P1-01 | Notes | Simplify Notes Route to 2 Patterns | P0 | 2h |
| P1-02 | IDE | Simplify IDE Route to 2 Patterns | P0 | 2h |
| P1-03 | IDE | Create Temp Project Auto-Flow | P0 | 3h |
| P1-04 | Both | Fix Gemini API Hardcoding | P0 | 2h |
| P1-05 | Both | Agent Config per Workspace | P1 | 3h |
| P1-06 | IDE | Investigate IDE Full CRUD | P1 | 4h |
| P1-07 | Notes | Investigate Notes Full CRUD | P1 | 4h |
| P1-08 | Both | Trace Vault → AI Chain | P0 | 2h |

**Acceptance Gate**:
- [ ] `/notes` loads without errors
- [ ] `/ide` loads with temp project auto-created
- [ ] API key from vault reaches AI endpoint
- [ ] Zero infinite loops

---

### Phase 2: Horizontal Expansion (NEXT)

**Focus**: Cross-workspace features after verticals clear.

**Stories** (P2-xx prefix):

| Story | Scope | Title | Priority | Est. |
|-------|-------|-------|----------|------|
| P2-01 | Cross | Unified File System Permissions | P1 | 4h |
| P2-02 | Cross | Agent/Workspace Differentiation | P1 | 3h |
| P2-03 | Cross | Chat Thread as RAG Entity | P1 | 4h |
| P2-04 | Mobile | Temp Space Parity | P2 | 3h |
| P2-05 | UX | Note Hotloading (Reactivity) | P1 | 3h |
| P2-06 | UX | 3-Pane Layout Props Wiring | P1 | 2h |

**Acceptance Gate**:
- [ ] File operations work across IDE and Notes
- [ ] Agent behaves differently per workspace
- [ ] Chat threads indexed in RAG
- [ ] Notes update reactively

---

### Phase 3: Deferred Spaces (LATER)

**Study and Knowledge pages**: Only resurface if they do not interfere with core objective.

| Space | Status | Action |
|-------|--------|--------|
| Study | Placeholder | Defer until Phase 3 |
| Knowledge | Coming Soon | Defer until Phase 3 |

---

## Validation of Previous Work

### EPIC-38 Stories (Clean Architecture)

**Relevance Check**:

| Story | Relevant? | Action |
|-------|-----------|--------|
| 38-01 to 38-03 | ⚠️ Maybe | Only if sync-types block P1 stories |
| 38-04 | ❌ No | Domain imports don't unblock user journey |
| 38-05 to 38-06 | ❌ No | Domain entities don't unblock user journey |
| 38-07+ | ❌ No | Defer until P2 complete |

**Verdict**: EPIC-38 stories should be **PAUSED**. They add architectural polish but don't unblock user journeys. Resume after P1/P2 complete.

### EPIC-30 Stories (P0 Critical Fixes)

**Relevance Check**:

| Story | Relevant? | Action |
|-------|-----------|--------|
| 30-01 (ErrorBoundaries) | ✅ Yes | Prevents WSOD, helps debugging |
| 30-02 (useProjectStats) | ⚠️ Maybe | Only if Hub uses it |
| 30-03 (Redirect loops) | ✅ Yes | Directly relates to P1-01, P1-02 |
| 30-04 (BYOK vault) | ✅ Yes | Relates to P1-08 |
| 30-05 (Race conditions) | ⚠️ Maybe | Only if causing P1 blocks |
| 30-06 (Monitoring) | ❌ No | Polish, not unblocking |

**Verdict**: 30-01, 30-03, 30-04 are **RELEVANT** and may already be done. Validate their completion before P1 work.

### Diagnostics (2026-01-09)

**Files to Review**:

| File | Relevance | Use For |
|------|-----------|---------|
| `vault-ai-chain-trace.md` | ✅ Critical | P1-08 context |
| `ai-slash-command-chain.md` | ✅ Critical | Notes AI feature |
| `journey-hub-to-ide.md` | ✅ High | P1-02, P1-03 |
| `journey-hub-to-notes.md` | ✅ High | P1-01, P1-07 |
| `cross-workspace-events-analysis.md` | ⚠️ Medium | Only if causing P1 blocks |
| `feature-study.md` | ❌ Low | Defer |
| `feature-knowledge.md` | ❌ Low | Defer |

---

## Workflow Commands

| Command | Action |
|---------|--------|
| `/correct-course` | Initialize this workflow |
| `/p1-status` | Show Phase 1 progress |
| `/p2-status` | Show Phase 2 progress |
| `/validate-p1` | Run Phase 1 acceptance gate |
| `/validate-p2` | Run Phase 2 acceptance gate |
| `/start-story P1-01` | Begin specific story |
| `/complete-story P1-01` | Mark story complete |

---

## Story Location

All Phase 1/Phase 2 stories are in:
```
_bmad-output/sprint-artifacts/stories/phase-1/
_bmad-output/sprint-artifacts/stories/phase-2/  (create when needed)
```

**Naming Convention**:
- `P1-01-simplify-notes-routes.md`
- `P1-02-simplify-ide-routes.md`
- `P2-01-unified-file-permissions.md`

---

## Handoff to Dev Agents

### Critical Context to Load

1. **DO NOT** reference EPIC-3x stories as active work
2. **FOCUS ONLY** on P1-xx and P2-xx prefixed stories
3. **IDE and Notes** are the only spaces that matter in Phase 1/2
4. **Study and Knowledge** are deferred - do not investigate

### Story Execution Order

```
P1-01 (Notes routing) → P1-02 (IDE routing) → P1-03 (Temp project)
     ↓
P1-04 (Gemini hardcode fix) → P1-08 (Vault-AI trace)
     ↓
P1-05, P1-06, P1-07 (can parallelize)
     ↓
[PHASE 1 GATE]
     ↓
P2-01, P2-02, P2-03 (can parallelize)
     ↓
P2-04, P2-05, P2-06 (can parallelize)
     ↓
[PHASE 2 GATE]
```

---

## Current Status

**Phase**: 1 - Vertical Unblocking
**Active Stories**: P1-01, P1-02 (drafted, ready for dev)
**Next Action**: Execute P1-01 and P1-02 in parallel

---

**Course correction v2.0 activated. Focus on IDE and Notes spaces. Ignore EPIC-3x.**
