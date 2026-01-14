# Cross-Module Handoff Protocol

**Version**: 1.0.0  
**Created**: 2026-01-11  
**description**: Define how modules communicate and hand off work to each other

---

## Overview

The handoff protocol ensures seamless communication between BMAD Extension modules. When a workflow completes or needs to delegate to another module, it must follow this protocol.

## Handoff Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CROSS-MODULE HANDOFF                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [SOURCE MODULE]                                                 │
│       │                                                          │
│       ├─> 1. Generate handoff document                           │
│       │      └─> _bmad-ext/.handoffs/{uuid}.yaml                 │
│       │                                                          │
│       ├─> 2. Update LOOP_STATE                                   │
│       │      └─> Set current_module, next_module, context        │
│       │                                                          │
│       ├─> 3. Create handoff artifact                             │
│       │      └─> Log in ARTIFACT_REGISTRY.yaml                   │
│       │                                                          │
│       └─> 4. Route to target module                              │
│              └─> Call ext-master → ext-module handler            │
│                                                                  │
│  [TARGET MODULE]                                                 │
│       │                                                          │
│       ├─> 5. Load handoff document                               │
│       │      └─> Parse context, previous_work, recommendations   │
│       │                                                          │
│       ├─> 6. Continue execution                                  │
│       │      └─> Use handoff context as starting point           │
│       │                                                          │
│       └─> 7. Create completion artifact                          │
│              └─> Update ARTIFACT_REGISTRY, close handoff          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Handoff Document Structure

### File Location
```
_bmad-ext/.handoffs/{uuid}.yaml
```

### Template

```yaml
---
handoff_id: "{uuid}"
created_at: "{iso-timestamp}"
status: "pending" | "in_progress" | "completed" | "failed"

# Source Information
source_module: "{module-id}"
source_workflow: "{workflow-name}"
source_agent: "{agent-name}"

# Target Information  
target_module: "{module-id}"
target_workflow: "{workflow-name}"

# Context Transfer
context:
  original_request: "{user prompt or request}"
  gathered_context: 
    - "{file path 1}"
    - "{file path 2}"
  relevant_artifacts:
    - "{artifact-id 1}"
    - "{artifact-id 2}"

# Work Summary
work_summary:
  completed_steps: ["step1", "step2"]
  partial_outputs: "{description of what was completed}"
  next_steps_needed: ["step3", "step4"]

# Recommendations from Source
recommendations:
  - "{recommendation 1}"
  - "{recommendation 2}"

# Governance Decision (if applicable)
governance:
  decision: "proceed" | "warn" | "stop"
  checks_passed: ["context_first", "expert_analysis"]
  research_triggered: true
  override_allowed: false

# Priority and Timing
priority: "critical" | "high" | "medium" | "low"
deadline: "{iso-timestamp}"
timeout_minutes: 30

# Error Handling
on_failure:
  action: "retry" | "escalate" | "abort"
  retry_count: 0
  max_retries: 3
---

# Detailed Context (attached as YAML document)

## User Request
{full user request text}

## Relevant Code Sections
```typescript
{code relevant to handoff}
```

## Previous Decisions
1. {decision 1}
2. {decision 2}

## Open Questions
- {question 1}
- {question 2}
```

---

## Handoff States

| State | Meaning | Next Action |
|-------|---------|-------------|
| `pending` | Created, awaiting pickup by target module | Target module loads and changes to `in_progress` |
| `in_progress` | Being processed by target module | Continue execution, change to `completed` on finish |
| `completed` | Work finished successfully | Close handoff, cleanup if configured |
| `failed` | Work failed | Follow `on_failure` rules |

---

## Module-to-Module Handoff Patterns

### Pattern 1: Governance → Implementation

```
governance module
    │
    ├─> Runs context-first, expert-analysis, research-trigger
    ├─> Generates governance report
    └─> Decision: proceed
            │
            ▼
implementation module (story-cycle or correct-course)
    │
    ├─> Loads handoff with governance_report
    ├─> Executes development work
    └─> Creates completion artifact
```

**Handoff Fields Required:**
- `governance.decision`
- `context.gathered_context`
- `work_summary.completed_steps`
- `recommendations`

### Pattern 2: Sprint-Planning → Implementation

```
sprint-planning-wrapper
    │
    ├─> Runs enhanced sprint planning
    ├─> Validates cohesion, dependencies
    └─> Generates enhanced sprint-status.yaml
            │
            ▼
implementation module (story-cycle)
    │
    ├─> Loads handoff with sprint context
    ├─> Executes stories in order
    └─> Updates sprint-status on completion
```

**Handoff Fields Required:**
- `context.sprint_status`
- `context.story_list`
- `recommendations.cohesion_notes`

### Pattern 3: Governance → Governance-Core (Correct-Course)

```
governance module
    │
    ├─> Detects need for correct-course
    └─> Hands off to governance-core
            │
            ▼
governance-core module (correct-course workflow)
    │
    ├─> Categorizes issue (quick_patch, feature_fix, architectural)
    ├─> Routes to appropriate sub-workflow
    └─> Generates remediation plan
```

**Handoff Fields Required:**
- `context.issue_report`
- `context.codebase_analysis`
- `recommendations.severity_level`

### Pattern 4: Implementation → Governance (Post-Work Validation)

```
implementation module
    │
    ├─> Completes story or fix
    ├─> Creates handoff for validation
    └─> Hands off to governance
            │
            ▼
governance module
    │
    ├─> Validates changes against standards
    ├─> Checks for regressions
    └─> Approves or requests corrections
```

---

## API: Handoff Operations

### Create Handoff

```typescript
function createHandoff(params: {
  sourceModule: string;
  sourceWorkflow: string;
  targetModule: string;
  targetWorkflow: string;
  context: HandoffContext;
  workSummary: WorkSummary;
  recommendations: string[];
  priority: Priority;
}): HandoffDocument {
  // 1. Generate UUID
  const handoffId = generateUUID();
  
  // 2. Create handoff document
  const handoff = {
    handoff_id: handoffId,
    created_at: new Date().toISOString(),
    status: 'pending',
    source_module: params.sourceModule,
    source_workflow: params.sourceWorkflow,
    target_module: params.targetModule,
    target_workflow: params.targetWorkflow,
    context: params.context,
    work_summary: params.workSummary,
    recommendations: params.recommendations,
    priority: params.priority,
    on_failure: { action: 'escalate', retry_count: 0, max_retries: 3 }
  };
  
  // 3. Write to file
  writeFile(`_bmad-ext/.handoffs/${handoffId}.yaml`, handoff);
  
  // 4. Update LOOP_STATE
  updateLoopState({ current_handoff: handoffId });
  
  // 5. Register in ARTIFACT_REGISTRY
  registerArtifact({
    id: handoffId,
    type: 'handoff',
    path: `_bmad-ext/.handoffs/${handoffId}.yaml`,
    created_by: params.sourceModule
  });
  
  return handoff;
}
```

### Load Handoff

```typescript
function loadHandoff(handoffId: string): HandoffDocument {
  const content = readFile(`_bmad-ext/.handoffs/${handoffId}.yaml`);
  const handoff = parseYAML(content);
  
  // Update state
  handoff.status = 'in_progress';
  writeFile(`_bmad-ext/.handoffs/${handoffId}.yaml`, handoff);
  
  return handoff;
}
```

### Complete Handoff

```typescript
function completeHandoff(handoffId: string, completionReport: object): void {
  const handoff = loadHandoff(handoffId);
  
  handoff.status = 'completed';
  handoff.completion_report = completionReport;
  
  writeFile(`_bmad-ext/.handoffs/${handoffId}.yaml`, handoff);
  
  // Update LOOP_STATE - clear current handoff
  updateLoopState({ current_handoff: null });
}
```

---

## Error Handling

### Retry Pattern

```yaml
on_failure:
  action: "retry"
  retry_count: 0
  max_retries: 3
  retry_delay_seconds: 60
```

### Escalation Pattern

```yaml
on_failure:
  action: "escalate"
  escalate_to: "bmad-master"
  escalation_reason: "Unable to complete after {retry_count} retries"
```

---

## State Tracking

### LOOP_STATE Updates

When handoff is created:
```yaml
current_handoff: "{uuid}"
handoff_chain:
  - from: "governance"
    to: "implementation"
    created: "{timestamp}"
    status: "pending"
```

When handoff is completed:
```yaml
current_handoff: null
handoff_chain:
  - from: "governance"
    to: "implementation"
    created: "{timestamp}"
    completed: "{timestamp}"
    status: "completed"
```

---

## Examples

### Example 1: Governance → Implementation Handoff

```yaml
---
handoff_id: "7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f"
created_at: "2026-01-11T10:30:00Z"
status: "in_progress"

source_module: "governance"
source_workflow: "context-first"
source_agent: "EXCALIBUR"

target_module: "implementation"
target_workflow: "story-cycle"

context:
  original_request: "Create FileLockService for EPIC-FS Story FS-05"
  gathered_context:
    - "src/domain/services/file-lock.ts"
    - "src/infrastructure/persistence/stores/"
    - "_bmad-output/planning-artifacts/epics.md"
  relevant_artifacts:
    - "story-fs-05-context-2026-01-11.yaml"

work_summary:
  completed_steps: ["scan", "contextualize", "transform"]
  partial_outputs: "Improved prompt with file lock patterns"
  next_steps_needed: ["execute story", "test", "review"]

recommendations:
  - "Use Zustand persist middleware for cross-session lock state"
  - "Implement retry logic for lock acquisition conflicts"

governance:
  decision: "proceed"
  checks_passed: ["context_first", "expert_analysis"]
  research_triggered: false
  override_allowed: false

priority: "high"
timeout_minutes: 30

on_failure:
  action: "escalate"
  retry_count: 0
  max_retries: 3
---

# User Request
Create FileLockService for managing file locks across IDE workspace

# Relevant Code
```typescript
// Existing file lock pattern
interface FileLock {
  fileId: string;
  owner: string;
  expiresAt: Date;
}
```

# Previous Decisions
1. Use persistent lock state via Zustand
2. Implement lock acquisition with retry

# Open Questions
- Should locks be session-scoped or global?
```

---

## Cleanup Rules

### Automatic Cleanup

```yaml
cleanup:
  enabled: true
  completed_after_hours: 24
  failed_after_hours: 4
  pending_after_hours: 1
  archive_dir: "_bmad-ext/.archive/handoffs"
```

---

**Last Updated**: 2026-01-11  
**Next Review**: 2026-01-18
