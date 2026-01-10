# Sub-Agent Definitions for BMAD Extension

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Purpose**: Define specialized sub-agents for validation, context gathering, investigation, and research

---

## Sub-Agent Registry

```yaml
sub_agents:
  validators:
    - quality-scanner
    - typescript-fixer
    - component-splitter
    - store-refactorer
    
  context_gatherers:
    - domain-scanner
    - context-validator
    - journey-mapper
    
  investigators:
    - analyst-ext
    - architect-ext
    
  researchers:
    - analyst-ext  # With research capability
```

---

## Validator Sub-Agents

### quality-scanner (Shared Service)

```yaml
agent:
  id: "quality-scanner"
  type: "shared_service"
  version: "1.0.0"
  
  purpose: "Comprehensive quality scanning for code, architecture, and security"
  
  capabilities:
    - "health_assessment"
    - "state_scan"
    - "architecture_scan"
    - "security_scan"
    
  input_format:
    type: "object"
    required: ["scan_type", "target"]
    properties:
      scan_type:
        enum: ["full", "typescript", "security", "architecture", "state"]
      target: "file path or domain"
      depth: "shallow | medium | deep"
      
  output_format:
    type: "object"
    properties:
      status: "PASS | FAIL | WARNING"
      issues: []
      metrics: {}
      recommendations: []
      
  usage:
    delegation_type: "validator"
    example: "Validate TypeScript compilation for new service"
```

### typescript-fixer

```yaml
agent:
  id: "typescript-fixer"
  type: "sub_agent"
  version: "1.0.0"
  
  purpose: "Fix TypeScript compilation errors systematically"
  
  workflow: "typescript-fix-cycle"
  
  input_format:
    type: "object"
    required: ["file_path", "errors"]
    properties:
      file_path: "path to file with TS errors"
      errors: []
      fix_strategy: "incremental | comprehensive"
      
  output_format:
    type: "object"
    properties:
      fixed: "boolean"
      errors_fixed: []
      errors_remaining: []
      files_modified: []
      
  usage:
    delegation_type: "validator"
    triggers:
      - event: "workflow_error"
        condition: "'typescript' in error_message"
```

### component-splitter

```yaml
agent:
  id: "component-splitter"
  type: "sub_agent"
  version: "1.0.0"
  
  purpose: "Split oversized React components into focused modules"
  
  workflow: "component-split-cycle"
  
  input_format:
    type: "object"
    required: ["component_path", "threshold_lines"]
    properties:
      component_path: "path to component"
      threshold_lines: 300
      extract_hooks: "boolean"
      
  output_format:
    type: "object"
    properties:
      split: "boolean"
      new_components: []
      new_hooks: []
      api_compatibility: "maintained | broken"
      
  usage:
    delegation_type: "validator"
    triggers:
      - event: "workflow_error"
        condition: "'component' in error_message and 'too large' in error_message"
```

---

## Context Gatherer Sub-Agents

### domain-scanner

```yaml
agent:
  id: "domain-scanner"
  type: "sub_agent"
  version: "2.0.0"
  
  purpose: "Scan and map domain-specific code for context gathering"
  
  workflow: "domain-scan-cycle"
  
  domains:
    - "persistence"
    - "sync"
    - "state"
    - "routing"
    - "agents"
    - "rag"
    - "ux"
    
  input_format:
    type: "object"
    required: ["domains"]
    properties:
      domains: []
      depth: "shallow | medium | deep"
      include_dependencies: "boolean"
      
  output_format:
    type: "object"
    properties:
      domain_map: {}
      files: []
      relationships: []
      relevance_score: {}
      
  usage:
    delegation_type: "context_gatherer"
    example: "Gather context for persistence and sync domains"
```

### context-validator

```yaml
agent:
  id: "context-validator"
  type: "sub_agent"
  version: "2.0.0"
  
  purpose: "Validate context freshness and relevance"
  
  workflow: "context-validate-cycle"
  
  input_format:
    type: "object"
    required: ["context_bundle"]
    properties:
      context_bundle: {}
      max_age_hours: 4
      
  output_format:
    type: "object"
    properties:
      valid: "boolean"
      stale_items: []
      freshness_score: "number"
      recommendations: []
      
  usage:
    delegation_type: "context_gatherer"
    triggers:
      - event: "context_needed"
        condition: "context_type == 'validation'"
```

### journey-mapper

```yaml
agent:
  id: "journey-mapper"
  type: "sub_agent"
  version: "1.0.0"
  
  purpose: "Map user journeys for context in UX workflows"
  
  workflow: "journey-map-cycle"
  
  input_format:
    type: "object"
    required: ["feature_id"]
    properties:
      feature_id: "identifier"
      start_point: "entry point"
      end_points: []
      
  output_format:
    type: "object"
    properties:
      journey_map: {}
      steps: []
      decision_points: []
      edge_cases: []
      
  usage:
    delegation_type: "context_gatherer"
    example: "Map user journey for file locking feature"
```

---

## Investigator Sub-Agents

### analyst-ext

```yaml
agent:
  id: "analyst-ext"
  type: "enhanced_agent"
  version: "1.0.0"
  
  purpose: "Deep analysis of requirements, patterns, and issues"
  
  investigation_types:
    - "requirements_gap"
    - "pattern_analysis"
    - "context_poisoning"
    - "performance_analysis"
    
  research_capable: true
  
  input_format:
    type: "object"
    required: ["investigation_type", "target"]
    properties:
      investigation_type: "requirements_gap | pattern_analysis | context_poisoning"
      target: "description"
      hypothesis: "initial hypothesis"
      evidence_required: []
      
  output_format:
    type: "object"
    properties:
      findings: []
      analysis: {}
      recommendations: []
      evidence: []
      
  usage:
    delegation_type: "investigator"
    example: "Investigate context poisoning in governance artifacts"
```

### architect-ext

```yaml
agent:
  id: "architect-ext"
  type: "enhanced_agent"
  version: "1.0.0"
  
  purpose: "Architecture analysis and remediation planning"
  
  investigation_types:
    - "state_boundary"
    - "sync_fragmentation"
    - "architecture_drift"
    - "dependency_conflict"
    
  input_format:
    type: "object"
    required: ["investigation_type", "target"]
    properties:
      investigation_type: "state_boundary | sync_fragmentation"
      target: "component or domain"
      scope: "local | global"
      
  output_format:
    type: "object"
    properties:
      analysis: {}
      issues: []
      remediation_plan: {}
      impact_assessment: {}
      
  usage:
    delegation_type: "investigator"
    example: "Investigate state boundary collapse in persistence domain"
```

---

## Researcher Sub-Agent

### analyst-ext (with research capability)

```yaml
researcher:
  id: "analyst-ext"
  capability: "research"
  
  research_types:
    - "tech_comparison"
    - "best_practices"
    - "performance"
    - "security"
    - "compatibility"
    
  input_format:
    type: "object"
    required: ["research_type", "query"]
    properties:
      research_type: "tech_comparison | best_practices"
      query: "search query"
      sources_min: 5
      include_raw: "boolean"
      
  output_format:
    type: "object"
    properties:
      findings: []
      sources: []
      recommendations: []
      confidence_score: "number"
      
  usage:
    delegation_type: "researcher"
    example: "Research file locking patterns across desktop IDEs"
```

---

## Sub-Agent Delegation Protocol

### Delegation Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUB-AGENT DELEGATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. WORKFLOW needs specialized task                              │
│         │                                                        │
│         ▼                                                        │
│  2. EXCALIBUR determines delegation type                          │
│     (validator | context_gatherer | investigator | researcher)   │
│         │                                                        │
│         ▼                                                        │
│  3. Select appropriate sub-agent from registry                   │
│         │                                                        │
│         ▼                                                        │
│  4. Create delegation request                                    │
│         │                                                        │
│         ▼                                                        │
│  5. Send to bmad-master for coordination                         │
│         │                                                        │
│         ▼                                                        │
│  6. bmad-master delegates to sub-agent                           │
│         │                                                        │
│         ▼                                                        │
│  7. Sub-agent executes task                                      │
│         │                                                        │
│         ▼                                                        │
│  8. Callback with results                                        │
│         │                                                        │
│         ▼                                                        │
│  9. EXCALIBUR processes results                                  │
│         │                                                        │
│         ▼                                                        │
│  10. Resume or switch workflow                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Delegation Request Schema

```yaml
delegation_request:
  id: "{uuid}"
  type: "validator" | "context_gatherer" | "investigator" | "researcher"
  sub_agent_id: "agent-name"
  created_at: NOW()
  
  # Task Definition
  task:
    description: "Clear description of what needs to be done"
    input: {}
    
  # Workflow Context
  context:
    workflow_id: "current workflow"
    step_id: "current step"
    original_request: "user's request"
    
  # Output Expectations
  expected_output:
    format: "validation_report | context_bundle | investigation_report | research_findings"
    schema_version: "1.0.0"
    
  # Timing
  timeout_minutes: 30
  priority: "high" | "medium" | "low"
  
  # Callbacks
  on_complete: "resume_workflow"
  on_timeout: "retry_or_abort"
  on_error: "escalate"
```

### Delegation Callback Schema

```yaml
delegation_callback:
  delegation_id: "{uuid}"
  status: "SUCCESS" | "PARTIAL" | "FAILED"
  sub_agent_id: "agent-name"
  completed_at: NOW()
  
  # Output
  output: {}
  
  # Metadata
  execution_time_ms: 12000
  tokens_used: 5000
  
  # Results
  findings: []
  artifacts_created: []
  
  # Next Action
  next_action: "continue" | "switch" | "retry" | "abort"
  next_action_params: {}
```

---

## Usage Examples

### Example 1: Validator Delegation

```yaml
# During story-cycle step-04, TypeScript validation needed
event:
  type: "validation_required"
  payload:
    validation_type: "typescript"
    target: "src/domain/services/file-lock.ts"

# Delegation created
delegation:
  type: "validator"
  sub_agent_id: "typescript-fixer"
  task:
    description: "Fix TypeScript errors in FileLockService"
    input:
      file_path: "src/domain/services/file-lock.ts"
      errors: []

# Callback received
callback:
  status: "SUCCESS"
  output:
    fixed: true
    errors_fixed: []
    files_modified: ["src/domain/services/file-lock.ts"]
```

### Example 2: Context Gatherer Delegation

```yaml
# During governance step, need context for persistence domain
event:
  type: "context_needed"
  payload:
    context_type: "domain_scan"
    domains: ["persistence", "sync"]

# Delegation created
delegation:
  type: "context_gatherer"
  sub_agent_id: "domain-scanner"
  task:
    description: "Scan persistence and sync domains"
    input:
      domains: ["persistence", "sync"]
      depth: "deep"

# Callback received
callback:
  status: "SUCCESS"
  output:
    domain_map:
      persistence: {...}
      sync: {...}
    files: []
    relevance_score: {...}
```

### Example 3: Investigator Delegation

```yaml
# Investigation triggered for state boundary collapse
event:
  type: "investigation_triggered"
  payload:
    investigation_type: "state_boundary"
    target: "persistence domain state management"
    hypothesis: "State boundaries are bleeding across domains"

# Delegation created
delegation:
  type: "investigator"
  sub_agent_id: "architect-ext"
  task:
    description: "Investigate state boundary collapse"
    input:
      investigation_type: "state_boundary"
      target: "persistence domain"

# Callback received
callback:
  status: "SUCCESS"
  output:
    analysis: {...}
    issues: ["state_bleed_1", "state_bleed_2"]
    remediation_plan: {...}
```

### Example 4: Researcher Delegation

```yaml
# Research needed for file locking patterns
event:
  type: "research_required"
  payload:
    research_type: "best_practices"
    query: "file locking patterns desktop applications"

# Delegation created
delegation:
  type: "researcher"
  sub_agent_id: "analyst-ext"
  task:
    description: "Research file locking best practices"
    input:
      research_type: "best_practices"
      query: "file locking patterns desktop applications"
      sources_min: 5

# Callback received
callback:
  status: "SUCCESS"
  output:
    findings: [...]
    sources: [...]
    recommendations: ["Use advisory locks", "Implement retry logic"]
```

---

**Last Updated**: 2026-01-11  
**Version**: 1.0.0
