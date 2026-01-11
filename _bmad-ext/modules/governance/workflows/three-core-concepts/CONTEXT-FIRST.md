# Governance Workflow - Context-First

**Workflow Type**: Core Concept (1 of 3)  
**Purpose**: Auto-transform human dev prompts with accurate, comprehensive context  
**Triggered By**: 
- User prompt submission
- Session initialization
- Correct-course categorization
- Research trigger evaluation

---

## Purpose

The **Context-First** workflow is the **foundation** of all governance. Before any work can begin, the system must:

1. **Gather Context**: Determine what domains, slices, and depth are relevant
2. **Contextualize Prompt**: Analyze user's request and map to relevant areas
3. **Transform Prompt**: Create an improved prompt with accurate context
4. **Start Session**: Initialize LOOP_STATE with the improved context

This prevents:
- Working without proper context
- Missing relevant dependencies
- Creating isolated solutions that break other areas
- Overlooking related features

---

## Workflow Steps

### Step 1: Gather Context

**Purpose**: Determine scan scope and load relevant slices

```yaml
context_first_step_1:
  name: "gather_context"
  description: "Determine what to scan and how deep"
  
  inputs:
    - user_prompt: "{raw user request}"
    - current_session: LOOP_STATE
  
  tasks:
    1. "Analyze prompt for domain keywords"
       - Extract domain names from prompt
       - Map to 13 domain categories
    
    2. "Determine scan scope"
       - Shallow: Quick checks, basic validation
       - Medium: Standard checks, include related domains
       - Deep: Comprehensive, include transitive dependencies
    
    3. "Identify feature slices"
       - Extract feature names
       - Map to feature slices in codebase
    
    4. "Load relevant code slices"
       - Load files from identified domains
       - Load files from identified features
       - Load files from identified slices
  
  outputs:
    - scan_scope: "shallow" | "medium" | "deep"
    - domains: [list of relevant domains]
    - features: [list of relevant features]
    - slices: [list of file paths]
    - related_domains: [list of indirectly related domains]
    - related_features: [list of indirectly related features]
```

**Domain Categories (13 Domains)**:

```yaml
domains:
  presentation:
    path: "src/presentation/"
    responsibility: "UI components, hooks, user interaction"
    subdomains:
      - components
      - hooks
      - pages
      - layouts
  
  domain:
    path: "src/domain/"
    responsibility: "Business logic, entities, rules"
    subdomains:
      - entities
      - value-objects
      - services
      - events
  
  infrastructure:
    path: "src/infrastructure/"
    responsibility: "External systems, persistence, APIs"
    subdomains:
      - persistence
      - api
      - auth
      - sync
  
  # ... (10 more domains)
```

### Step 2: Contextualize Prompt

**Purpose**: Analyze user's request and map to relevant areas

```yaml
context_first_step_2:
  name: "contextualize_prompt"
  description: "Map user request to relevant domains and features"
  
  inputs:
    - user_prompt: "{raw user request}"
    - gathered_context: {from step 1}
  
  tasks:
    1. "Extract intent from prompt"
       - Implementation intent (build, fix, refactor)
       - Analysis intent (review, audit, assess)
       - Planning intent (design, architect, estimate)
    
    2. "Map to domains"
       - Primary domain (directly mentioned)
       - Secondary domains (affected by changes)
       - Tertiary domains (might be impacted)
    
    3. "Map to features"
       - Core feature (main goal)
       - Dependent features (rely on core)
       - Related features (share data or logic)
    
    4. "Identify cross-cutting concerns"
       - Authentication/authorization
       - Error handling
       - Logging/monitoring
       - Performance
  
  outputs:
    - intent: "implementation" | "analysis" | "planning"
    - primary_domain: "{domain}"
    - secondary_domains: [list]
    - tertiary_domains: [list]
    - core_features: [list]
    - dependent_features: [list]
    - cross_cutting: [list]
    - risk_areas: [list]
```

### Step 3: Extend Coverage

**Purpose**: Extend the scope to include related but not-obvious areas

```yaml
context_first_step_3:
  name: "extend_coverage"
  description: "Extend scope to prevent isolated solutions"
  
  inputs:
    - contextualized_prompt: {from step 2}
    - codebase_structure: {from architecture}
  
  tasks:
    1. "Find transitive dependencies"
       - Load dependency graph
       - Add indirect dependencies to scope
    
    2. "Check for shared state"
       - Find shared stores
       - Add affected stores to scope
    
    3. "Check for shared types"
       - Find shared type definitions
       - Add affected types to scope
    
    4. "Check for shared utilities"
       - Find utility functions used
       - Add affected utilities to scope
    
    5. "Check for API contracts"
       - Find API endpoints affected
       - Add affected endpoints to scope
  
  outputs:
    - extended_domains: [list with transitive deps]
    - extended_features: [list with dependencies]
    - shared_stores: [list]
    - shared_types: [list]
    - shared_utilities: [list]
    - api_endpoints: [list]
    - coverage_score: 0-100
```

### Step 4: Transform Prompt

**Purpose**: Create an improved prompt with accurate, comprehensive context

```yaml
context_first_step_4:
  name: "transform_prompt"
  description: "Create improved prompt with full context"
  
  inputs:
    - original_prompt: "{raw user request}"
    - extended_context: {from step 3}
  
  tasks:
    1. "Summarize original intent"
       - Extract core goal
       - Identify success criteria
    
    2. "Add domain context"
       - List relevant domains
       - Describe their current state
    
    3. "Add feature context"
       - List affected features
       - Describe their relationships
    
    4. "Add risk context"
       - List risk areas
       - Describe potential impacts
    
    5. "Add constraint context"
       - List existing constraints
       - Describe architectural boundaries
  
  outputs:
    - transformed_prompt: "{comprehensive prompt}"
    - context_summary: "{brief summary}"
    - coverage_notes: "{what's included}"
    - risk_notes: "{what to watch for}"
```

**Transformed Prompt Example**:

```markdown
## Original Request
"Fix the auth service to support refresh tokens"

## Transformed Prompt

### Goal
Implement refresh token support in the authentication service.

### Scope
**Primary Domain**: `infrastructure/auth` (affects 5 files)
**Secondary Domains**: 
- `domain/services` (auth-service.ts)
- `presentation/hooks` (useAuth.ts)

**Features Affected**:
- Authentication flow (3 components)
- Session management (2 stores)
- API endpoints (2 routes)

**Cross-cutting Concerns**:
- Security (token handling)
- Error handling (401 responses)
- Persistence (token storage)

### Constraints
- Must use existing JWT utilities
- Must not break existing session flow
- Must follow 8-bit design patterns
- Must be TypeScript with zero errors

### Success Criteria
1. Refresh tokens issued on login
2. Refresh tokens stored securely
3. Access tokens can be refreshed
4. All existing tests pass
5. No breaking changes to API

### Risk Areas
- Token storage in persistence layer
- Session state synchronization
- Logout handling with refresh tokens
```

### Step 5: Initialize Session

**Purpose**: Start new session with accurate context in LOOP_STATE

```yaml
context_first_step_5:
  name: "initialize_session"
  description: "Set up LOOP_STATE with transformed context"
  
  inputs:
    - transformed_prompt: {from step 4}
    - context_summary: {from step 4}
  
  tasks:
    1. "Update LOOP_STATE.anchor"
       - Set original_request
       - Set human_intent_summary
       - Set human_intent_timestamp
    
    2. "Update LOOP_STATE.current_work"
       - Set scope
       - Set domains
       - Set features
    
    3. "Update LOOP_STATE.context_stack"
       - Push context summary
       - Push relevant files
  
  outputs:
    - session_initialized: true
    - anchor_updated: true
    - context_set: true
```

---

## Integration Points

### With User Prompt Hook

```yaml
# Triggered by .claude/hooks/user-prompt-submit.yaml
workflow: "context-first"
on_complete:
  - "Enrich user prompt with context"
  - "Update LOOP_STATE.anchor"
  - "Continue with agent execution"
```

### With Correct-Course Workflow

```yaml
# Triggered when bug is reported
workflow: "context-first"
inputs:
  - user_prompt: "{bug description}"
  - scope: "deep"  # Bugs need deep context
on_complete:
  - "Categorize bug"
  - "Identify affected areas"
  - "Pass to agent-expert workflow"
```

### With Research Workflow

```yaml
# Triggered before research
workflow: "context-first"
inputs:
  - user_prompt: "{tech question}"
  - scope: "medium"
on_complete:
  - "Provide context for research"
  - "Identify what to research"
  - "Pass to research workflow"
```

---

## Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| `context_first_invocations` | Times context-first was run | N/A |
| `avg_coverage_score` | Average scope coverage | > 85% |
| `scope_adjustments` | Times scope was adjusted after step 3 | < 20% |
| `context_switches` | Times context changed mid-workflow | Decreasing |
| `missed_dependencies` | Dependencies found after initial scope | < 5% |

---

## Error Handling

### If Context Gathering Fails

```yaml
error: "context_gathering_failed"
actions:
  1. "Use fallback context (project root only)"
  2. "Warn user about limited context"
  3. "Continue with reduced scope"
  4. "Log error in LOOP_STATE.errors"
```

### If Scope is Too Broad

```yaml
error: "scope_too_broad"
condition: "coverage_score > 95%"
actions:
  1. "Suggest narrowing scope to user"
  2. "Ask: 'Focus on which specific area?'"
  3. "Re-run with narrowed scope"
```

### If Scope is Too Narrow

```yaml
error: "scope_too_narrow"
condition: "coverage_score < 50%"
actions:
  1. "Warn user about limited scope"
  2. "Suggest: 'Also include: {suggested_areas}'"
  3. "Re-run with extended scope"
```

---

## Version

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Updated**: 2026-01-11

---

## Related Files

- `agent-expert.md` - Expert analysis workflow
- `research.md` - Internet-based research workflow
- `domain-scanner.md` - Scan domain structures
- `feature-scanner.md` - Scan feature relationships
