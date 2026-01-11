# Governance Workflow - Agent as Expert

**Workflow Type**: Core Concept (2 of 3)  
**Purpose**: Expert analysis of bugs/errors/features against actual codebase  
**Triggered By**: 
- Context-first workflow completion
- Bug/error report filing
- Feature implementation request
- Architectural decision point

---

## Purpose

The **Agent-as-Expert** workflow transforms the agent from a passive executor to an **active expert consultant** who:

1. **Defines Level**: Categorizes the issue by severity and complexity
2. **Compares & Contrasts**: Analyzes user's approach against actual codebase
3. **Detects Flaws**: Identifies overlapping, conflicting, or overwhelming patterns
4. **Makes Decisions**: Recommends proceed, modify, or block

This prevents:
- Blind execution of flawed approaches
- Creating solutions that conflict with existing code
- Over-engineering simple problems
- Under-engineering complex problems

---

## Workflow Steps

### Step 1: Define Level

**Purpose**: Categorize the issue by severity, complexity, and impact

```yaml
agent_expert_step_1:
  name: "define_level"
  description: "Categorize issue severity and complexity"
  
  inputs:
    - context: {from context-first}
    - user_request: "{what user wants to do}"
  
  tasks:
    1. "Analyze issue type"
       - Bug fix: Something is broken
       - Feature: Something new to build
       - Refactor: Something to improve
       - Investigation: Something to understand
    
    2. "Determine severity (P0-P3)"
       - P0: Critical - breaks core functionality
       - P1: High - breaks important functionality
       - P2: Medium - breaks minor functionality
       - P3: Low - enhancement or cosmetic
    
    3. "Determine complexity (L1-L3)"
       - L1: Simple - single file, no dependencies
       - L2: Medium - multiple files, some dependencies
       - L3: Complex - many files, many dependencies
    
    4. "Determine impact scope"
       - Single component
       - Multiple components in one domain
       - Multiple domains
       - Cross-workspace
  
  outputs:
    - issue_type: "bug_fix" | "feature" | "refactor" | "investigation"
    - severity: "P0" | "P1" | "P2" | "P3"
    - complexity: "L1" | "L2" | "L3"
    - impact_scope: "single" | "multi_component" | "multi_domain" | "cross_workspace"
    - urgency_score: 1-100
```

### Step 2: Load Codebase Reality

**Purpose**: Load actual code to compare against user's approach

```yaml
agent_expert_step_2:
  name: "load_codebase_reality"
  description: "Load actual code state for comparison"
  
  inputs:
    - context: {from context-first}
    - issue_type: {from step 1}
  
  tasks:
    1. "Load target files"
       - Load files in the affected scope
       - Load files in the extended scope
    
    2. "Load related files"
       - Load parent components
       - Load child components
       - Load dependencies
    
    3. "Load architectural context"
       - Load architecture.md
       - Load relevant ADRs
       - Load domain boundaries
    
    4. "Load existing solutions"
       - Check for similar implementations
       - Check for related utilities
       - Check for shared patterns
  
  outputs:
    - target_files: [list of files to modify]
    - related_files: [list of affected files]
    - architectural_constraints: [list]
    - existing_solutions: [list]
    - code_snapshot: "{hash of current state}"
```

### Step 3: Compare & Contrast

**Purpose**: Analyze user's approach against actual codebase

```yaml
agent_expert_step_3:
  name: "compare_contrast"
  description: "Compare user's approach with codebase reality"
  
  inputs:
    - user_request: "{what user wants to do}"
    - codebase_reality: {from step 2}
    - context: {from context-first}
  
  tasks:
    1. "Extract user's approach"
       - What solution does user envision?
       - What files does user expect to modify?
       - What patterns does user expect to use?
    
    2. "Compare with existing code"
       - Does the envisioned solution exist?
       - Are there similar patterns?
       - Are there conflicting patterns?
    
    3. "Identify conflicts"
       - Direct conflicts (opposite implementations)
       - Indirect conflicts (different assumptions)
       - Potential conflicts (might break later)
    
    4. "Identify opportunities"
       - Reusable patterns to leverage
       - Existing solutions to extend
       - Shared utilities to use
  
  outputs:
    - approach_summary: "{what user wants}"
    - conflicts_found: [list]
    - opportunities_found: [list]
    - recommendations: [list]
```

### Step 4: Detect Flaws

**Purpose**: Identify problematic patterns in user's approach

```yaml
agent_expert_step_4:
  name: "detect_flaws"
  description: "Detect overlapping, conflicting, or overwhelming patterns"
  
  inputs:
    - user_request: "{what user wants to do}"
    - codebase_reality: {from step 2}
    - compare_results: {from step 3}
  
  tasks:
    1. "Detect overlapping functionality"
       - Does solution overlap with existing code?
       - Will it duplicate functionality?
       - Can it reuse existing code?
    
    2. "Detect conflicting approaches"
       - Does it conflict with architectural decisions?
       - Does it use different patterns than codebase?
       - Does it violate domain boundaries?
    
    3. "Detect overwhelming complexity"
       - Is the solution too complex for the problem?
       - Does it introduce unnecessary dependencies?
       - Does it over-engineer the solution?
    
    4. "Detect under-engineering"
       - Is the solution too simple?
       - Does it ignore important edge cases?
       - Does it skip validation or error handling?
  
  outputs:
    - overlap_warnings: [list]
    - conflict_warnings: [list]
    - complexity_warnings: [list]
    - flaw_score: 0-100 (lower is better)
    - critical_flaws: [list of P0/P1 issues]
```

### Step 5: Make Decision

**Purpose**: Recommend proceed, modify, or block

```yaml
agent_expert_step_5:
  name: "make_decision"
  description: "Recommend action based on analysis"
  
  inputs:
    - issue_level: {from step 1}
    - flaws_detected: {from step 4}
    - conflicts_found: {from step 3}
  
  tasks:
    1. "Calculate decision score"
       - Start with 100
       - Subtract for each flaw
       - Subtract for each conflict
       - Subtract for complexity warnings
    
    2. "Determine decision"
       - Score > 80: PROCEED with minor notes
       - Score 50-80: PROCEED with warnings
       - Score 30-50: MODIFY approach recommended
       - Score < 30: BLOCK - major rework required
    
    3. "Generate recommendations"
       - List specific changes to make
       - List specific files to avoid
       - List specific patterns to follow
    
    4. "Generate warnings"
       - List potential risks
       - List areas to watch
       - List fallback options
  
  outputs:
    - decision: "proceed" | "proceed_with_warnings" | "modify" | "block"
    - decision_score: 0-100
    - recommendations: [list]
    - warnings: [list]
    - risks: [list]
    - expert_report: "{detailed analysis}"
```

---

## Decision Framework

### Decision: PROCEED

```yaml
decision: "proceed"
conditions:
  - flaw_score > 80
  - no critical flaws
  - no major conflicts
actions:
  1. "Generate brief notes for user"
  2. "Proceed with implementation"
  3. "Log decision in LOOP_STATE"
```

### Decision: PROCEED WITH WARNINGS

```yaml
decision: "proceed_with_warnings"
conditions:
  - flaw_score 50-80
  - some minor flaws
  - no critical flaws
actions:
  1. "Present warnings to user"
  2. "Ask: 'Do you want to proceed?'"
  3. "If yes, proceed with notes"
  4. "Log warnings in LOOP_STATE"
```

### Decision: MODIFY

```yaml
decision: "modify"
conditions:
  - flaw_score 30-50
  - several significant flaws
  - some conflicts
actions:
  1. "Present specific modifications needed"
  2. "Suggest alternative approaches"
  3. "Ask: 'Which approach do you prefer?'"
  4. "Re-run agent-expert with new approach"
  5. "Log modification request"
```

### Decision: BLOCK

```yaml
decision: "block"
conditions:
  - flaw_score < 30
  - critical flaws found
  - major conflicts
actions:
  1. "Present critical issues to user"
  2. "Explain why approach cannot work"
  3. "Suggest fundamentally different approach"
  4. "Ask: 'Do you want to try a different approach?'"
  5. "Block implementation until resolved"
  6. "Log block in LOOP_STATE.governance.violations"
```

---

## Example Analysis

### Example: User Wants to Add New Store

```yaml
# User Request
user_request: "Create a new Zustand store for user preferences"

# Step 1: Define Level
issue_type: "feature"
severity: "P2"
complexity: "L2"
impact_scope: "multi_component"

# Step 2: Load Codebase Reality
existing_stores:
  - "src/infrastructure/persistence/stores/user-store.ts"
  - "src/infrastructure/persistence/stores/project-store.ts"
  - "src/infrastructure/persistence/stores/ui-store.ts"
store_pattern: "Zustand v5 with useShallow"

# Step 3: Compare & Contrast
conflicts_found:
  - "User preferences might overlap with UI store"
opportunities_found:
  - "Can follow existing store pattern"
  - "Can use shared persistence utilities"

# Step 4: Detect Flaws
overlap_warnings:
  - "User preferences might overlap with user-store"
complexity_warnings: []

# Step 5: Make Decision
decision: "proceed_with_warnings"
warnings:
  - "Check if user-store already has preferences"
  - "Consider adding to existing store vs new store"
recommendations:
  - "Review user-store.ts before implementing"
  - "Follow existing store pattern exactly"
```

---

## Integration Points

### With Context-First Workflow

```yaml
# Triggered after context-first completes
workflow: "agent-expert"
inputs:
  - context: {from context-first}
  - user_request: "{transformed prompt}"
on_complete:
  - "Pass decision to next step"
  - "If block: ask user to modify approach"
  - "If proceed: continue with implementation"
```

### With Correct-Course Workflow

```yaml
# Triggered when bug is reported
workflow: "agent-expert"
inputs:
  - context: {from context-first}
  - user_request: "{bug description}"
  - issue_type: "bug_fix"
on_complete:
  - "Generate expert analysis"
  - "If block: create remediation task"
  - "If proceed: continue with fix"
```

### With Research Workflow

```yaml
# Triggered before research
workflow: "agent-expert"
inputs:
  - user_request: "{tech approach}"
  - issue_type: "investigation"
on_complete:
  - "If block: research alternative approaches"
  - "If modify: research specific changes"
  - "If proceed: minimal research needed"
```

---

## Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| `agent_expert_invocations` | Times agent-expert was run | N/A |
| `proceed_rate` | Percentage of proceed decisions | > 70% |
| `block_rate` | Percentage of block decisions | < 10% |
| `false_positives` | Blocks that were actually valid | < 10% |
| `avg_flaw_score` | Average flaw score | > 60 |

---

## Version

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Updated**: 2026-01-11

---

## Related Files

- `context-first.md` - Context gathering workflow
- `research.md` - Internet-based research workflow
- `correct-course-governance.md` - Integration with remediation
- `comparison-engine.md` - Compare docs to code
