---
name: bmad-ext-implementation-bridge
description: Unified bridge to BMAD-ext Implementation Module for both .claude (skills) and .opencode (commands) platforms. Replaces old bridge patterns with consolidated access to story-cycle and correct-course workflows with v2.0 enhancements.
version: 2.0.0
category: bridge
parent: bmad-ext-bridge
children: []
priority: 45
agents:
  - bmad-ext-master
triggers:
  - ext-implementation
  - implementation module
  - story cycle
  - correct course
  - /ext-impl
  - /implementation-bridge
---

# BMAD-ext Implementation Module Bridge v2.0

**Purpose**: Unified access to Implementation Module workflows for both .claude (skills) and .opencode (commands) platforms. **Replaces old bridges with consolidated interface.**

## Bridge Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATFORM-AGNOSTIC LAYER                       │
│                                                                  │
│  .claude (Skills)              .opencode (Commands)             │
│  ─────────────────             ────────────────────              │
│  /story-cycle                  @implementation/story-cycle       │
│  /create-story                 @implementation/create-story      │
│  /dev-story                    @implementation/dev-story         │
│  /code-review                  @implementation/code-review       │
│  /correct-course               @implementation/correct-course    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED ACCESS LAYER                          │
│                                                                  │
│  _bmad-ext/modules/implementation/workflows/story-cycle/         │
│  _bmad-ext/modules/implementation/workflows/correct-course/      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## When to use this bridge

- Access story-cycle workflow from either platform
- Access correct-course workflow from either platform
- Unified entry point for implementation module
- Platform-independent workflow execution

## Platform-Specific Entry Points

### .claude (Skills)
```bash
# Load the bridge skill
/skill: bmad-ext-implementation-bridge

# Execute story-cycle workflow
/story-cycle story={story_key}
/create-story epic={N}
/dev-story story={story_key}
/code-review story={story_key}
/story-done story={story_key}

/correct-course issue={issue_key}
```

### .opencode (Commands)
```bash
# Execute via command prefix
@implementation/story-cycle --story={story_key}
@implementation/create-story --epic={N}
@implementation/dev-story --story={story_key}
@implementation/code-review --story={story_key}
@implementation/story-done --story={story_key}

@implementation/correct-course --issue={issue_key}
```

## Workflow Mapping

### Story-Cycle Workflow (v2.0 Enhanced)

| Step | .claude Skill | .opencode Command | Workflow File |
|------|---------------|-------------------|---------------|
| 1 | `/story-cycle init` | `@implementation/init` | `steps/step-01-init.md` |
| 1a | `/story-cycle journey` | `@implementation/journey` | `steps/step-01a-user-journey.md` |
| 2 | `/story-cycle validate` | `@implementation/validate` | `steps/step-02-validate.md` |
| 3a | `/story-cycle toolspec` | `@implementation/toolspec` | `steps/step-03a-agent-tool-spec.md` |
| 3 | `/dev-story` | `@implementation/dev-story` | `steps/step-03-implement.md` |
| 4 | `/story-cycle test` | `@implementation/test` | `steps/step-04-test.md` |
| 5 | `/code-review` | `@implementation/code-review` | `steps/step-05-review.md` |
| 6 | `/story-cycle done` | `@implementation/done` | `steps/step-06-done.md` |
| 6a | `/story-cycle reality` | `@implementation/reality` | `steps/step-06a-reality-check.md` |
| 7 | `/retrospective` | `@implementation/retro` | `steps/step-07-retrospective.md` |

### Correct-Course Workflow

| Step | .claude Skill | .opencode Command | Workflow File |
|------|---------------|-------------------|---------------|
| 1 | `/correct-course receive` | `@implementation/cc-receive` | `steps/step-01-receive-report.md` |
| 2 | `/correct-course categorize` | `@implementation/cc-categorize` | `steps/step-02-categorize.md` |
| 3 | `/correct-course route` | `@implementation/cc-route` | `steps/step-03-route.md` |
| 4 | `/correct-course complete` | `@implementation/cc-complete` | `steps/step-04-complete.md` |

## Key v2.0 Improvements

### 1. Deep Analysis Integration

```yaml
deep_analysis:
  grep_glob_enforcement:
    - pattern: "ENFORCED before any code"
      files: "steps/step-03-implement.md"
      description: "Must run grep/glob before writing code"
      
  cross_impact_mapping:
    - workspace_impact: "All workspaces analyzed"
      files: "steps/step-01-init.md"
      description: "IDE/Notes/Knowledge impact mapped"
      
  dead_code_detection:
    - orphaned_files: "Systematically detected"
      files: "steps/step-01-init.md"
      description: "Dead code and overlaps identified"
```

### 2. Evidence-Based Validation

```yaml
evidence_validation:
  checklist_items:
    - item: "Every check has evidence"
      files: "steps/step-02-validate.md"
      description: "File:line references for all checks"
      
  code_path_verification:
    - walk_every_path: "Required for all ACs"
      files: "steps/step-05-review.md"
      description: "Step-by-step code path walking"
```

### 3. Real Code Analysis

```yaml
real_code_analysis:
  file_reads:
    - requirement: "Full file reads, not diffs"
      files: "steps/step-05-review.md"
      description: "Read actual changed files completely"
      
  html_output_validation:
    - state_check: "All states validated"
      files: "steps/step-06a-reality-check.md"
      description: "Initial/loading/error/success states"
      
  journey_walking:
    - actual_flow: "Walk user journey through code"
      files: "steps/step-05-review.md"
      description: "Verify every step with code evidence"
```

## Unified Entry Point

### From .claude
```bash
# Direct workflow access
/story-cycle {story_key}          # Starts story-cycle
/correct-course {issue_key}       # Starts correct-course

# Step-specific access
/story-cycle step=1 story={key}   # Jump to step
/story-cycle continue             # Continue from current step
```

### From .opencode
```bash
# Direct workflow access
@implementation/story-cycle --story={key}
@implementation/correct-course --issue={key}

# Step-specific access
@implementation/story-cycle --step=3 --story={key}
@implementation/story-cycle --continue
```

## State Management

The bridge manages state across both platforms:

```yaml
state_management:
  reads_from:
    - "_bmad-ext/state/LOOP_STATE.yaml"
    - "{sprint-status.yaml}"
    
  writes_to:
    - "_bmad-ext/state/LOOP_STATE.yaml"
    - "{story_file}"
    - "{sprint-status.yaml}"
    
  shared_state:
    - "current_story"
    - "current_step"
    - "workflow_status"
```

## Handoff Protocol

When transitioning between platforms:

```yaml
handoff:
  artifact_created: "{story_key}-handoff.md"
  uuid_generated: true
  parent_id_tracked: true
  context_preserved: true
  
  from_claude_to_opencode:
    - "Export LOOP_STATE"
    - "Create handoff artifact"
    - "Route to opencode agent"
    
  from_opencode_to_claude:
    - "Import LOOP_STATE"
    - "Read handoff artifact"
    - "Resume from current step"
```

## Error Handling

| Error Type | .claude Response | .opencode Response |
|------------|------------------|-------------------|
| Story not found | Show error, list available | Error message, --help |
| Step invalid | Show valid steps | Error with valid options |
| State corrupted | Run stale-check | Prompt for reset |
| Platform mismatch | Auto-handoff | Auto-handoff |

## Quick Reference

### .claude Commands
```bash
/story-cycle {story_key}          # Start story-cycle
/story-cycle step=N story={key}   # Jump to step
/correct-course {issue_key}       # Start correct-course
```

### .opencode Commands
```bash
@implementation/story-cycle --story={key}
@implementation/story-cycle --step=3 --story={key}
@implementation/correct-course --issue={key}
```

## Deprecation Notice

**v2.0 REPLACES the following:**
- ✅ This file (was v1.0) - **REPLACED**
- `.claude/skills/bmad-bridge/` patterns - **DEPRECATED**
- `.opencode/instructions/bmad-constitution.md` - **INTEGRATED**

All new work should use this v2.0 bridge.

---

**Source**: `_bmad-ext/modules/implementation/MODULE.md`
**Version**: 2.0.0
**Last Updated**: 2026-01-12
**Replaces**: v1.0 implementation bridge
