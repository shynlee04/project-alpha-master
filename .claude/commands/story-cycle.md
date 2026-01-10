# Command: story-cycle

> **Module**: `_bmad-ext/modules/implementation/workflows/story-cycle/` | **Version**: 2.1.0

---

## Description

Execute the complete story development cycle with **Product Reality Gates**. Enhanced from v2.0 to include UX validation, Agent tool specification, and Visual reality checks.

---

## Usage

```bash
story-cycle                    # Start new story (prompts for epic/story)
story-cycle continue S-001     # Continue existing story
story-cycle step=N story=S-001 # Jump to specific step
```

---

## 10-Step Workflow (Enhanced v2.1)

| Step | Name | Gate | Purpose |
|------|------|------|---------|
| 01 | Init | - | Load story context |
| **01a** | **User Journey** | **UX Gate** | **NEW**: Movie Script Test - 30-second demo validation |
| 02 | Validate | - | Validate prerequisites |
| 03 | Context | - | Load technical context |
| **03a** | **Agent Tool Spec** | **Brain Gate** | **NEW**: LLM tool definition (JSON Schema, permissions) |
| 04 | Implement | - | TDD implementation |
| 05 | Test | - | Run tests, coverage |
| 06 | Review | - | Code review |
| 07 | Done | - | Update sprint-status |
| **06a** | **Reality Check** | **Visual Gate** | **NEW**: Visual regression, UI validation |
| 08 | Retrospective | - | Summary, learnings |

---

## Product Reality Gates

### UX Gate (Step 01a - User Journey Simulation)
**Purpose**: "The Movie Script Test" - Can you demo the whole sprint in 30 seconds?

**Detects**:
- `island_feature` - No clear entry point
- `split_brain` - Dual workflows for same goal
- `ghost_result` - Action with no visible result
- `dead_end` - No next step defined
- `loading_vacuum` - No feedback during processing
- `empty_state_void` - No empty state handling

**Output**: `journey-map.mermaid`

### Brain Gate (Step 03a - Agent Tool Specification)
**Purpose**: Define LLM tools properly - Does the AI know when/how to use this?

**Detects**:
- `orphan_tool` - Tool with no clear trigger
- `permission_gap` - Security hole (no permission check)
- `silent_thinking` - User doesn't know AI is working
- `vague_trigger` - Unclear when to invoke
- `timeout_void` - No timeout handling

**Output**: `tool-definition.json`, `prompt-context.md`

### Visual Gate (Step 06a - Reality Check)
**Purpose**: End-to-end UI verification - Does the UI actually work?

**Detects**:
- `visual_break` - Component not rendering
- `missing_state` - Error/empty/loading states missing
- `zombie_feature` - Feature immediately replaced
- `context_switch` - User must switch away mid-flow
- `result_hiding` - Result appears off-screen
- `broken_loop` - Retry mechanism broken

**Output**: `visual-regression-report.md`

---

## Key Insight

> **Sprints fail due to Cohesion & Reality** (fragmented UX, nonsensical flows), NOT just Logic & Order.
>
> Example: "Dual Chat Systems" - technically valid, tests pass, but users hate history loss when switching tabs.
>
> These gates catch issues that TDD, linting, and architecture reviews never will.

---

## Configuration

**Requires**:
- `_bmad/bmm/config.yaml`
- `_bmad-output/sprint-artifacts/sprint-status.yaml`
- `_bmad-ext/modules/implementation/config/journey-validation-rules.yaml`
- `_bmad-ext/modules/implementation/config/agent-tool-spec-template.yaml`

---

## Output

```
_bmad-output/sprint-artifacts/
├── {epic}-{story}-{slug}.md           # Story file
├── {epic}-{story}-{slug}-context.xml   # Context XML
├── {epic}-{story}-{slug}-handoff.md    # Handoff artifact
├── journey-map.mermaid                  # NEW: User journey diagram
├── tool-definition.json                 # NEW: LLM tool spec
└── visual-regression-report.md          # NEW: Visual validation
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `story-cycle` | Full cycle (prompts) |
| `story-cycle continue S-001` | Resume story |
| `create-story epic=21` | Create new story |
| `dev-story story=S-001` | Implement story |
| `code-review story=S-001` | Review implementation |
| `sprint-plan` | Enhanced sprint planning (NEW) |

---

## Enhanced Story Template

Stories now include **Agentic & UX Context** section:

```yaml
## The User Journey
1. User starts at: {Screen/State}
2. User performs: {Action}
3. System responds: {Immediate UI Feedback}
4. Agent thinks: {Tool Selection Logic}
5. Agent acts: {Tool Execution}
6. Final Result: {UI Update}

## Agent Tool Spec
- **Tool Name**: `{tool_name}`
- **Trigger**: When user asks {condition}
- **Risk**: {High latency? Permission needed?}
- **UI State**: {What user sees while agent thinks}
```

---

**See Also**: `sprint-planning-wrapper`, `dev-story`, `correct-course`
