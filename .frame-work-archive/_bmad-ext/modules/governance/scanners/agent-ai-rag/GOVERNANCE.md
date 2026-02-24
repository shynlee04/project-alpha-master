# Governance Scanner - Agent/AI/RAG/Multi-modality Ecosystem

**Scanner Type**: Critical Governance Area  
**description**: Govern agent tools, RAG context, multi-modality, and stage-gated feature unlocking  
**Triggered By**: 
- Agent tool usage
- RAG context creation/modification
- Multi-modality input/output
- Agent/AI feature request

---

## ⚠️ CRITICAL IMPORTANCE

This is the **MOST CRITICAL** governance area because:

1. **Tools with CRUD Operations**: Agents can create, read, update, delete - no tracking currently
2. **RAG Context Chaos**: Multiple entities, workspaces, conversation threads - no governance
3. **Multi-modality Risks**: Input/output varies by use case - no consistency
4. **Stage-Gating Required**: Cannot allow immediate full feature access

**FAILURE TO GOVERN THIS AREA WILL RESULT IN**:
- Component clusters
- Overlapping functionality
- Unmanageable context
- Security vulnerabilities
- Architectural chaos

---

## 1. Tool Usage Governance

### description
Track and approve all tool usage by agents before execution.

### Scanner: Tool Usage Tracker

```yaml
tool_usage_scanner:
  description: "Track and validate agent tool usage"
  
  triggers:
    - "agent_attempts_tool_call"
    - "tool_execution_requested"
    - "tool_chain_initiated"
  
  checks:
    - "Tool is registered"
    - "Tool is approved for current stage"
    - "Tool usage follows policy"
    - "Tool doesn't exceed scope"
  
  outputs:
    - tool_name: "{tool}"
    - tool_category: "read" | "write" | "delete" | "modify"
    - is_approved: true | false
    - approval_stage: "1" | "2" | "3"
    - usage_logged: true
```

### Tool Categories

```yaml
tool_categories:
  read:
    description: "Tools that only read data"
    examples:
      - "filesystem_read_file"
      - "grep"
      - "glob"
      - "lookup_type"
      - "list_types"
    risk_level: "low"
    stage_required: "1"
  
  write:
    description: "Tools that create or modify files"
    examples:
      - "write"
      - "edit"
      - "filesystem_write_file"
    risk_level: "medium"
    stage_required: "2"
  
  delete:
    description: "Tools that delete data"
    examples:
      - "filesystem_move_file" (to trash)
      - "delete operations"
    risk_level: "high"
    stage_required: "3"
  
  modify:
    description: "Tools that modify system state"
    examples:
      - "git operations"
      - "database operations"
      - "agent spawning"
    risk_level: "high"
    stage_required: "3"
```

### Tool Usage Policy

```yaml
tool_usage_policy:
  stage_1_exploration:
    allowed_tools:
      - "read_category tools only"
    prohibited_tools:
      - "write_category tools"
      - "delete_category tools"
      - "modify_category tools"
    approval_required: false
  
  stage_2_prototyping:
    allowed_tools:
      - "read_category tools"
      - "write_category tools (limited)"
    prohibited_tools:
      - "delete_category tools"
      - "modify_category tools (production)"
    approval_required: true
    max_writes_per_session: 10
  
  stage_3_production:
    allowed_tools:
      - "all tools"
    approval_required: false
    logging_required: true
```

---

## 2. RAG Context Governance

### description
Govern RAG context creation, management, and quality.

### Scanner: RAG Context Validator

```yaml
rag_context_scanner:
  description: "Validate RAG context quality and management"
  
  triggers:
    - "rag_index_created"
    - "rag_index_modified"
    - "rag_query_executed"
    - "context_injected"
  
  checks:
    - "Context is properly formatted"
    - "Context meets quality standards"
    - "Context is not stale"
    - "Context follows naming conventions"
    - "Context is properly categorized"
  
  outputs:
    - context_id: "{uuid}"
    - context_type: "workspace" | "conversation" | "feature" | "domain"
    - quality_score: 0-100
    - is_valid: true | false
    - warnings: [list]
```

### RAG Context Types

```yaml
rag_context_types:
  workspace_context:
    description: "Context for a specific workspace (IDE, Notes, Knowledge)"
    storage: "_bmad-ext/rag-contexts/workspaces/"
    naming: "workspace-{workspace_name}-{YYYY-MM-DD}.yaml"
    ttl: "90 days"
    governance: "workspace-scanner"
  
  conversation_context:
    description: "Centralized conversation thread"
    storage: "_bmad-ext/rag-contexts/conversations/"
    naming: "conversation-{id}-{YYYY-MM-DD}.yaml"
    ttl: "30 days"
    governance: "conversation-thread-scanner"
  
  feature_context:
    description: "Context for a specific feature"
    storage: "_bmad-ext/rag-contexts/features/"
    naming: "feature-{feature_name}-{YYYY-MM-DD}.yaml"
    ttl: "180 days"
    governance: "feature-scanner"
  
  domain_context:
    description: "Context for a specific domain"
    storage: "_bmad-ext/rag-contexts/domains/"
    naming: "domain-{domain_name}-{YYYY-MM-DD}.yaml"
    ttl: "Permanent"
    governance: "domain-scanner"
```

### RAG Context Quality Standards

```yaml
rag_quality_standards:
  required_fields:
    - "id"
    - "type"
    - "created"
    - "updated"
    - "source_files"
    - "embedding_model"
  
  quality_checks:
    - "Source files exist"
    - "No broken links"
    - "Content is coherent"
    - "No duplicate entries"
    - "Properly structured"
  
  quality_scoring:
    - "Has all required fields: +20"
    - "All source files exist: +20"
    - "No broken links: +20"
    - "Content coherent: +20"
    - "Properly structured: +20"
```

---

## 3. Multi-modality Governance

### description
Govern multi-modality input/output handling.

### Scanner: Multi-modality Validator

```yaml
multimodality_scanner:
  description: "Validate multi-modality inputs and outputs"
  
  triggers:
    - "multimodal_input_received"
    - "multimodal_output_generated"
    - "image_processing_requested"
    - "voice_input_received"
  
  checks:
    - "Input type is supported"
    - "Output format is correct"
    - "Size limits respected"
    - "Security scan passed"
    - "Context injection is proper"
  
  outputs:
    - input_type: "text" | "image" | "voice" | "code" | "mixed"
    - output_type: "text" | "image" | "code" | "mixed"
    - is_valid: true | false
    - security_scan: "passed" | "failed"
    - context_type: "in_page" | "agent_managed" | "workspace"
```

### Multi-modality Context Types

```yaml
multimodality_contexts:
  in_page_context:
    description: "One-time completions, context is in-page only"
    examples:
      - "Note commands"
      - "Quick edits"
      - "Single-shot prompts"
    agent_managed: false
    persistence: "session_only"
    governance: "light"
  
  agent_managed_context:
    description: "Agent-manipulated, context managed by agent"
    examples:
      - "Extended conversations"
      - "Multi-step workflows"
      - "Agent tool chains"
    agent_managed: true
    persistence: "persistent"
    governance: "strict"
  
  workspace_context:
    description: "Context shared across workspace"
    examples:
      - "Project-wide context"
      - "Team shared context"
      - "Domain context"
    agent_managed: true
    persistence: "permanent"
    governance: "strictest"
```

### Multi-modality Rules

```yaml
multimodality_rules:
  input_rules:
    - "All inputs must be scanned for malicious content"
    - "Image inputs must be under size limit (5MB)"
    - "Voice inputs must be under time limit (5 min)"
    - "Code inputs must follow syntax rules"
  
  output_rules:
    - "Outputs must be in expected format"
    - "Image outputs must be generated safely"
    - "Code outputs must be validated"
    - "Mixed outputs must be properly structured"
  
  context_rules:
    - "In-page context: No persistence required"
    - "Agent-managed context: Must be registered"
    - "Workspace context: Must follow naming conventions"
```

---

## 4. Stage-Gating for Agent/AI Features

### description
Ensure agent/AI features are unlocked progressively, not all at once.

### Stage Definitions

```yaml
stage_gating:
  stage_1_exploration:
    description: "Read-only exploration and research"
    duration: "Until user confirms understanding"
    
    allowed:
      - "Read operations"
      - "Query operations"
      - "Research operations"
      - "Context gathering"
    
    blocked:
      - "Write operations"
      - "Delete operations"
      - "Agent spawning"
      - "RAG index modification"
      - "Production deployments"
    
    exit_criteria:
      - "User confirms understanding of constraints"
      - "Initial research completed"
      - "Architecture reviewed"
  
  stage_2_prototyping:
    description: "Limited write operations for prototyping"
    duration: "Until prototype is validated"
    
    allowed:
      - "All stage_1 operations"
      - "Limited write operations (< 10 files)"
      - "Tool composition"
      - "Experimental features (sandboxed)"
    
    blocked:
      - "Production deployments"
      - "Schema modifications"
      - "Agent self-modification"
      - "Large-scale refactoring"
      - "Data migrations"
    
    exit_criteria:
      - "Prototype validated"
      - "Tests pass"
      - "Code review approved"
      - "Security scan passed"
  
  stage_3_production:
    description: "Full access for production work"
    duration: "Until project completion"
    
    allowed:
      - "All operations"
    
    blocked:
      - "None (within policy)"
    
    requirements:
      - "Full logging enabled"
      - "Rollback plan ready"
      - "Monitoring enabled"
      - "Documentation complete"
```

### Stage Transition Workflow

```yaml
stage_transition:
  trigger: "user_requests_stage_change"
  
  step_1_validate_criteria:
    - "Check if exit criteria are met"
    - "If not met: reject transition"
    - "If met: proceed to step 2"
  
  step_2_present_risks:
    - "Explain what becomes available"
    - "Explain what risks are introduced"
    - "Ask for user confirmation"
  
  step_3_execute_transition:
    - "Update LOOP_STATE.stage"
    - "Update permission matrix"
    - "Log transition in governance"
    - "Notify user of new capabilities"
```

---

## 5. Integration with Other Governance Areas

### With Correct-Course Workflow

```yaml
correct_course_integration:
  trigger: "agent_tool_causes_issue"
  
  actions:
    1. "Run agent-ai-rag scanner on the tool usage"
    2. "Check if tool was approved for current stage"
    3. "Check if context was properly managed"
    4. "Generate remediation plan"
    5. "If tool misused: downgrade stage"
    6. "If context polluted: clean context"
```

### With Context-First Workflow

```yaml
context_first_integration:
  trigger: "context_first_runs"
  
  actions:
    1. "Check if RAG context is valid"
    2. "Check if multi-modality inputs are proper"
    3. "Check if tool usage is approved"
    4. "If issues found: flag in context"
    5. "If critical: block until resolved"
```

### With Deep-Scan Workflow

```yaml
deep_scan_integration:
  trigger: "deep_scan_runs"
  
  actions:
    1. "Include agent-ai-rag in scan scope"
    2. "Check for unauthorized tool usage"
    3. "Check for stale RAG contexts"
    4. "Check for multi-modality violations"
    5. "Report findings to governance"
```

---

## Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| `tool_usage_logged` | Tool calls logged | 100% |
| `tool_approval_rate` | Tools approved at current stage | > 95% |
| `rag_context_quality` | Average RAG context quality | > 80% |
| `multimodality_violations` | Multi-modality violations | 0 |
| `stage_transitions` | Stage transition count | N/A |
| `unauthorized_tools` | Tools used without approval | < 1% |
| `stale_rag_contexts` | Stale RAG contexts found | < 5% |

---

## Error Handling

### Unauthorized Tool Usage

```yaml
error: "unauthorized_tool_usage"
severity: "P0"
actions:
  1. "Block tool execution"
  2. "Log violation in LOOP_STATE.governance.violations"
  3. "Downgrade stage to 1"
  4. "Notify user of violation"
  5. "Require stage re-qualification"
```

### Stale RAG Context

```yaml
error: "stale_rag_context"
severity: "P1"
actions:
  1. "Flag context as stale"
  2. "Suggest context refresh"
  3. "If critical: block usage until refreshed"
  4. "Log in ARTIFACT_REGISTRY"
```

### Multi-modality Violation

```yaml
error: "multimodality_violation"
severity: "P1"
actions:
  1. "Block operation"
  2. "Explain violation"
  3. "Suggest correction"
  4. "Log in governance"
```

---

## Version

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Updated**: 2026-01-11

---

## Related Files

- `context-first.md` - Context gathering workflow
- `agent-expert.md` - Expert analysis workflow
- `research.md` - Internet-based research workflow
- `correct-course-governance.md` - Integration with remediation
- `stage-gating-policy.md` - Stage-gating rules
- `tool-usage-policy.md` - Tool usage rules
- `rag-governance-policy.md` - RAG context rules
