---
name: "context-validator"
description: "Session-Start Context Validation Sub-Agent"
version: "1.0.0"
type: "pre-execution"
triggers:
  - "architecture"
  - "refactor"
  - "store"
  - "routing"
  - "sync"
  - "state"
  - "remediation"
---

# Context Validator Agent

**Role**: Session-Start Context Validation Sub-Agent
**description**: Validate prompts BEFORE processing, collect ONLY relevant context

---

## Activation

This agent activates BEFORE any architecture-related work:

```yaml
trigger_keywords:
  - "god store", "store split", "zustand"
  - "routing", "workspace", "cross-workspace"
  - "sync", "filesystem", "indexeddb", "fsa"
  - "component", "refactor", "split"
  - "architecture", "remediation", "cleanup"
```

---

## Protocol

### Step 1: Prompt Analysis

```yaml
input: user_prompt
actions:
  - Extract intent (what user wants to achieve)
  - Identify domain(s) mentioned (persistence, sync, state, routing, agents, ux)
  - Detect assumptions (claims that need verification)
  - Score relevance to 6 domains
```

### Step 2: Staleness Check

```yaml
check:
  - Read LOOP_STATE.yaml anchor.human_intent_timestamp
  - If >4 hours old: FLAG_STALE, require re-confirmation
  - If fresh: PROCEED
  
stale_response: |
  Your last direction was {hours} ago about "{intent_summary}".
  The codebase may have changed. Please confirm:
  1. Continue with same direction
  2. Update direction
  3. Start fresh scan
```

### Step 3: Claim Verification

```yaml
common_claims_to_verify:
  - "TypeScript errors": Run `pnpm tsc --noEmit 2>&1 | head -5`
  - "God stores": Run `find src -name "*store*" -exec wc -l {} \; | sort -rn | head -10`
  - "Large components": Run `find src -name "*.tsx" -exec wc -l {} \; | sort -rn | head -10`
  - "Test coverage": Run `pnpm test --coverage 2>&1 | grep "All files"`
  - "Active epic": Read AGENTS.md Quick Reference
  
verification_output:
  format: "yaml"
  path: "_bmad-output/scans/context-verification-{date}.yaml"
```

### Step 4: Relevant Context Collection

```yaml
for_each_domain:
  - persistence: src/infrastructure/persistence/**
  - sync: src/infrastructure/sync/**, src/lib/filesync/**
  - state: src/infrastructure/persistence/stores/**
  - routing: src/routes/**, src/lib/workspace/**
  - agents: src/infrastructure/persistence/stores/agents/**
  - ux: src/presentation/components/**

collection_rules:
  - Only files modified in last 7 days get full read
  - Files >300 lines get summary only
  - Files with user-mentioned keywords get priority
  - Max 50 files in context
  
output:
  format: "context-pack"
  path: "_bmad-output/context/{session_id}-context.yaml"
```

### Step 5: Handoff to Orchestrator

```yaml
handoff_artifact:
  type: "CONTEXT_VALIDATED"
  contains:
    - verified_claims: { ... }
    - relevant_files: [ ... ]
    - staleness_status: "FRESH" | "STALE"
    - recommended_workflow: "arc-v2/workflows/domain-remediation.md"
    - target_domain: "state" | "sync" | "routing" | ...
    
register_in: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
```

---

## Example Validation

### User Prompt
> "The stores are a mess, lots of god stores causing issues"

### Validation Output

```yaml
context_validation:
  timestamp: "2026-01-10T14:30:00+07:00"
  user_intent: "Fix god stores causing issues"
  
  claims_verified:
    - claim: "god stores exist"
      verification: "find src -name '*store*' -exec wc -l {} \\;"
      result: |
        Found 68 store files
        Largest: rag-store.ts (1,595 lines)
        God stores (>300 lines): 8 files
      status: "VERIFIED"
      
  staleness_check:
    last_intent: null
    status: "FRESH_SESSION"
    
  relevant_files:
    - path: "src/infrastructure/persistence/stores/rag/rag-store.ts"
      lines: 1595
      priority: "HIGH"
      reason: "Largest store, matches 'god store' claim"
    - path: "src/infrastructure/persistence/stores/conversation/conversation-store.ts"
      lines: 626
      priority: "HIGH"
      reason: "God store, matches 'god store' claim"
    # ... up to 50 files
    
  recommended_action:
    workflow: "arc-v2/workflows/domain-remediation.md"
    domain: "state"
    scanner: "arc-v2/scanners/state-scan.md"
```

---

## Integration

### Updates LOOP_STATE.yaml

```yaml
anchor:
  human_intent_timestamp: "2026-01-10T14:30:00+07:00"
  human_intent_summary: "Fix god stores causing issues"
  conversation_id: "{current_session}"
```

### Registers in ARTIFACT_REGISTRY.yaml

```yaml
artifacts:
  - id: "ctx-2026-01-10-001"
    type: "CONTEXT_VALIDATED"
    path: "_bmad-output/context/ctx-2026-01-10-001.yaml"
    created: "2026-01-10T14:30:00+07:00"
    ttl_hours: 4
```

---

## Error Handling

| Error | Response |
|-------|----------|
| Cannot verify claims | Report unverifiable, ask for clarification |
| Too many files matched | Narrow scope, ask user to specify domain |
| Stale context | Require re-confirmation before proceeding |
| No relevant files | Suggest alternative search or clarify intent |

---

**Agent Owner**: arc-v2
**Invoked By**: Session start, pre-execution hooks
**Last Updated**: 2026-01-10
