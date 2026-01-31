---
name: "context-strategy"
type: "governance-policy"
description: "Define context gathering and application strategy"
version: "1.0.0"
lastUpdated: "2026-01-14"
---

# Context Strategy Policy

**description**: Define how context is gathered, packaged, and applied to prevent context poisoning.

## Context Gathering Philosophy

**Principle**: Context-first means understanding before acting. Never begin development without proper context.

## The Two-Step Hook

```yaml
context_first_hook:
  step_1_scan:
    description: "Identify what context is needed"
    actions:
      - "Identify relevant domains"
      - "Determine scan depth"
      - "List context slices needed"

  step_2_contextualize:
    description: "Gather and package context"
    actions:
      - "Run identified scanners"
      - "Gather entity context"
      - "Create context package"
      - "Transform user prompt"

  output:
    - "Improved prompt with accurate context"
    - "Context package for reference"
    - "Scan results for governance"
```

## Context Poisoning Prevention

```yaml
prevention_strategy:
  staleness:
    problem: "Old artifacts poison context"
    solution: "48-hour freshness threshold"
    enforcement: "Reject stale artifacts"

  bloat:
    problem: "Too much context degrades quality"
    solution: "Relevance scoring and limits"
    enforcement: "Cap at 10K tokens"

  inconsistency:
    problem: "Conflicting information"
    solution: "Single source of truth per domain"
    enforcement: "Detect and flag conflicts"

  orphaned:
    problem: "Referenced files don't exist"
    solution: "File validation before inclusion"
    enforcement: "Remove or flag missing files"
```

## Context Package Structure

```yaml
context_package:
  metadata:
    generated_at: "{timestamp}"
    request_id: "{uuid}"
    domains_scanned: [list]
    total_tokens: {number}

  domains:
    - name: "{domain_name}"
      path: "{domain_path}"
      files_included: {count}
      relevance_score: {0-1}

      entities:
        - name: "{entity_name}"
          type: "{file|component|service}"
          path: "{relative_path}"
          summary: "{brief description}"

  warnings:
    - type: "{staleness|bloat|inconsistency|orphaned}"
      severity: "{low|medium|high}"
      recommendation: "{action}"

  quality_metrics:
    freshness_score: {0-1}
    relevance_score: {0-1}
    consistency_score: {0-1}
```

## Context Transformation

```yaml
prompt_transformation:
  original_prompt: "{user input}"

  context_injection:
    - "Add relevant domain context"
    - "Include current sprint status"
    - "Reference active story context"
    - "Add known constraints"

  transformed_prompt:
    format: |
      CONTEXT:
      {context_summary}

      CURRENT WORK:
      {sprint_and_story_context}

      USER REQUEST:
      {original_prompt}

      CONSTRAINTS:
      {known_constraints}
```

## Scan Strategies

```yaml
scan_strategies:
  quick_context:
    domains: ["presentation", "domain"]
    depth: "shallow"
    max_tokens: 2000
    use_for: "Simple bug fixes, small features"

  standard_context:
    domains: ["presentation", "domain", "infrastructure"]
    depth: "medium"
    max_tokens: 5000
    use_for: "Most development work"

  deep_context:
    domains: ["all"]
    depth: "deep"
    max_tokens: 10000
    use_for: "Architecture changes, new features"

  targeted_context:
    domains: "{specific domains}"
    depth: "{user specified}"
    max_tokens: "{user specified}"
    use_for: "Expert analysis, research"
```

## Context Refresh

```yaml
refresh_policy:
  automatic_refresh:
    trigger: "context_package age > 1 hour"
    action: "re-scan and update"

  manual_refresh:
    trigger: "user request"
    action: "force re-scan"

  incremental_refresh:
    trigger: "file changes detected"
    action: "update only changed entities"
```

## Quality Metrics

```yaml
quality_metrics:
  freshness:
    metric: "percentage of artifacts < 48 hours old"
    threshold: "> 90%"
    failure: "flag for review"

  relevance:
    metric: "user-rated relevance of included context"
    threshold: "> 70%"
    failure: "adjust relevance scoring"

  efficiency:
    metric: "percentage of context actually used"
    threshold: "> 50%"
    failure: "reduce context size"
```

## Integration

**Implemented By**: context-first workflow

**Used By**: All workflows requiring context

**Location**: `_bmad-ext/modules/governance/policies/context-strategy.md`

---

`★ Insight ─────────────────────────────────────`
1. Two-step hook ensures context before action
2. Context package format standardizes delivery
3. Refresh policies prevent staleness during long sessions
`─────────────────────────────────────────────────`
