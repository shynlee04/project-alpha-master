# Context Strategy Policy

**Version:** 1.0.0
**Last Updated:** 2026-01-10

---

## Purpose

Defines the strategy for progressive context loading to minimize token usage while maximizing relevance.

---

## Problem Statement

**Before:** Load entire codebase (~150K tokens) even when user needs small slice

**After:** Load targeted domains (~2-5K tokens) with high relevance

---

## Progressive Context Loading

### Principle

Load ONLY what's needed for the current task, expand on demand.

### Levels

```
Level 0: Nothing (0 tokens)
   ↓
Level 1: Frontmatter only (~500 tokens)
   ↓
Level 2: Frontmatter + structure (~2K tokens)
   ↓
Level 3: Frontmatter + structure + key files (~5K tokens)
   ↓
Level 4: Full domain context (~10K tokens)
   ↓
Level 5: Cross-domain context (~20K tokens)
```

### When to Use Each Level

| Level | Use Case | Token Budget |
|-------|----------|-------------|
| 0 | Session idle | 0 |
| 1 | Agent selection, quick lookups | < 1K |
| 2 | Understanding domain structure | < 3K |
| 3 | Starting work in domain | < 8K |
| 4 | Deep work in domain | < 15K |
| 5 | Cross-domain remediation | < 25K |

---

## Domain-Based Context Slicing

### Intent → Domain Mapping

```yaml
user_prompt_keywords:
  "store", "state", "zustand":
    domains: ["state_persistence"]
    files: ["**/stores/**/*.ts"]

  "component", "ui", "split":
    domains: ["ux_ui"]
    files: ["**/components/**/*.tsx"]

  "sync", "fsa", "indexeddb", "storage":
    domains: ["state_persistence", "workspace"]
    files: ["**/sync/**/*.ts", "**/adapters/**/*.ts"]

  "agent", "tool", "permission":
    domains: ["api_contract"]
    files: ["**/agents/**/*.ts", "**/tools/**/*.ts"]

  "artifact", "doc", "governance":
    domains: ["artifact", "document"]
    files: ["CLAUDE.md", "AGENTS.md", "**/*.yaml"]
```

### File Relevance Scoring

For each file in domain, calculate relevance:

```typescript
score = (
  keyword_matches * 2.0 +
  import_references * 1.5 +
  export_references * 1.0 +
  recent_changes * 0.5
) / file_size_factor
```

Include files with score > threshold.

---

## Two-Step Context Hook

### Step A: Gather Context

**Trigger:** Session start or user prompt

**Process:**
1. Parse user prompt for keywords
2. Map keywords to domains
3. Scan domains for relevant files
4. Score files by relevance
5. Generate file list with line ranges

**Output:**
```yaml
context_gathered:
  domains: ["state_persistence"]
  files: 23
  total_lines: 1,847
  estimated_tokens: 2,300
```

### Step B: Contextualize Prompt

**Input:** Original user prompt + gathered context

**Process:**
1. Enhance prompt with relevant context
2. Add file references with line numbers
3. Include related components
4. Add domain-specific considerations

**Output:**
```yaml
enhanced_prompt:
  original: "Split the agent-config-store"
  enhanced: |
    # Task: Split the agent-config-store

    ## Context from Domain Analysis
    - Current file: src/infrastructure/persistence/stores/agent-config-store.ts (448 lines)
    - Referenced by: 12 components
    - Depends on: base-store.ts, agent-types.ts
    - State boundary: AGENTS domain

    ## Related Components
    - AgentConfigDialog (uses this store)
    - AgentSelector (subscribes to this store)
    - AgentToolbar (depends on agent.selection state)

    ## Considerations
    - This is an ARCHITECTURAL CONFLICT (cross-domain impact)
    - Journey mapping required
    - Estimated: 4-6 hours for comprehensive remediation
```

---

## Context Caching

### Cache Strategy

```yaml
cache:
  enabled: true
  key: "{domain_hash}_{intent_hash}"
  ttl_minutes: 240  # 4 hours

  invalidate_on:
    - "file_changes_in_domain"
    - "explicit_refresh_request"
    - "cache_age_exceeded"
```

### Cache Key Generation

```typescript
cacheKey = hash([
  domain.id,
  intent.keywords.sort(),
  context.level,
  lastDomainScanTimestamp
])
```

---

## Context Expansion

### On-Demand Expansion

When agent needs more context:

1. **Detect need:** "This file references X but X not loaded"
2. **Request expansion:** Load additional files
3. **Update context:** Add new files to session
4. **Cache:** Store expanded context for future

### Expansion Limits

```yaml
expansion:
  max_files_per_request: 10
  max_tokens_per_expansion: 5,000
  max_expansions_per_session: 5
```

---

## Context Freshness

### Freshness Thresholds

| Context Type | Freshness Required |
|--------------|-------------------|
| Code files | < 4 hours |
| Artifact content | < 24 hours |
| Domain structure | < 12 hours |
| Cross-domain mapping | < 24 hours |

### Validation

Before using cached context:
1. Check timestamp
2. Verify files still exist
3. Confirm no breaking changes
4. Refresh if stale

---

## Anti-Patterns

### DON'T Load Everything

❌ "Read entire src/ folder"
❌ "Load all stores to fix one store"
❌ "Full codebase scan for simple bug"

### DO Load Targeted

✅ "Load state_persistence domain only"
✅ "Load files that import the target"
✅ "Load files with keyword matches"

---

## Platform-Specific Behavior

### Claude Code

- Use native SessionStart hook for initial context
- Use UserPromptSubmit hook for contextualization
- Progressive disclosure via frontmatter

### Other Platforms

- Pre-execution workflow for context gathering
- Two-step hook implementation
- Same progressive disclosure strategy

---

## Measurement

### Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Session start tokens | < 5K | ~2K |
| Context relevance score | > 0.8 | TBD |
| Cache hit rate | > 60% | TBD |
| Expansion requests per session | < 3 | TBD |

### Token Savings

```
Before: ~150K tokens per session
After: ~2-5K tokens per session
Savings: ~97% reduction
```

---

**Policy Owner:** governance-core
**Review Frequency:** Monthly
**Next Review:** 2026-02-10
