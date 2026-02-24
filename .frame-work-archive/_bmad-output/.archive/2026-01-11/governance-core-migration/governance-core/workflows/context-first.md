# Context First - Two-Step Hook Workflow

**description:** Enforce context gathering before any work proceeds

**Workflow Type:** Enforcement Check 1 of 3

**Integration:** Called by `correct-course.yaml` before expert analysis

---

## Overview

This workflow implements the first enforcement check: **Context First**. It ensures that any work request is properly contextualized with relevant domain information before proceeding.

**Two-Step Process:**
1. **Step A: Gather Context** - Scan targeted domains (not entire codebase)
2. **Step B: Contextualize Prompt** - Transform human prompt with gathered context

---

## Step A: Gather Context

### 1. Determine Target Domains

Load domain configuration from `_bmad-ext/modules/governance-core/config/domains.yaml`:

```yaml
# Priority domains selection matrix
agent_ai_rag_multimodality: P0  # If agent/AI work
file_structure_governance: P0    # If creating/modifying files
state_persistence: P0             # If touching stores/state
# ... other domains as relevant
```

**Selection Logic:**
```typescript
function selectDomains(userPrompt: string, taskType: string): Domain[] {
  const domains = loadDomains('domains.yaml');

  // P0 domains always included if task matches
  const priority = domains.filter(d =>
    d.priority === 'P0' && matchesTask(d, taskType)
  );

  // Add relevant domains based on prompt keywords
  const relevant = domains.filter(d =>
    d.keywords.some(k => userPrompt.includes(k))
  );

  return deduplicate([...priority, ...relevant]);
}
```

### 2. Slicing Strategy

**Three Slicing Dimensions:**

| Dimension | Question | Target |
|-----------|----------|--------|
| Relevance | What matters for THIS task? | Task-specific files only |
| Depth | How much context is needed? | Quick Patch < Independent Feature < Architectural Conflict |
| Token Budget | What's the context limit? | <5K tokens (97% reduction from 150K) |

**Depth by Task Complexity:**

| Complexity | Files | Token Budget | Example |
|------------|-------|--------------|---------|
| Quick Patch | 1-5 | <1K | Single component bug fix |
| Independent Feature | 5-15 | <2.5K | New isolated feature |
| Architectural Conflict | 15-50 | <5K | Cross-domain changes |

### 3. Staleness Check with LOOP_STATE

Before loading context, verify freshness:

```yaml
# Check staleness before loading context
anchor:
  staleness_threshold_hours: 4
  if: (now - human_intent_timestamp) > staleness_threshold_hours
  then: HALT and require re-confirmation
```

**Implementation:**
```typescript
function checkStaleness(loopState: LoopState): boolean {
  const anchor = loopState.anchor;
  if (!anchor.human_intent_timestamp) return true; // First prompt

  const hoursSince = (Date.now() - anchor.human_intent_timestamp) / 36e5;
  if (hoursSince > anchor.staleness_threshold_hours) {
    return false; // STALE - block and re-confirm
  }
  return true; // FRESH - proceed
}
```

### 4. Context Gathering Execution

**For Each Selected Domain:**

1. Load domain configuration
2. Identify relevant files (glob patterns)
3. Read file contents
4. Extract relevant sections (line ranges)
5. Summarize if needed

**Output Format:**
```yaml
context_gathering:
  timestamp: "2026-01-10T10:30:00Z"
  token_budget_used: 2347
  domains_scanned:
    - name: "file_structure_governance"
      priority: "P0"
      files_loaded: 12
      tokens: 856
      key_findings:
        - "FileLockService in progress at domain/services/"
        - "Naming convention: -service.ts suffix"
    - name: "state_persistence"
      priority: "P0"
      files_loaded: 8
      tokens: 723
      key_findings:
        - "note-store.ts uses Zustand v5"
        - "Individual selector pattern required"
```

---

## Step B: Contextualize Prompt

### 1. Context Injection

Transform the original human prompt by injecting gathered context:

```typescript
function contextualizePrompt(
  originalPrompt: string,
  gatheredContext: ContextGatheringResult
): string {
  const contextSections = gatheredContext.domains_scanned.map(domain => `
## ${domain.name} Context

${domain.key_findings.map(f => `- ${f}`).join('\n')}
`).join('\n');

  return `
# Original Request
${originalPrompt}

# Relevant Context
${contextSections}

# Task
Execute the original request with the above context in mind.
`;
}
```

### 2. Inclusive Coverage Extension

**Extend context to related files:**

```typescript
// If touching note-store.ts, also include:
const relatedFiles = [
  'note-types.ts',           // Domain types
  'sync-manager.ts',         // Related service
  'notes.route.tsx',         // Consumer route
  'note-store.test.ts'       // Tests
];
```

**Extension Rules:**
- Same directory: Include all exports
- Imported types: Include type definitions
- Consumer routes: Include route files
- Test files: Include existing tests

### 3. Output Generation

**Improved Prompt Format:**
```markdown
---
# Contextualized Prompt for: [original task]

## Context Summary
- Domains: 3 (file_structure_governance, state_persistence, ux_interaction)
- Files: 27
- Tokens: 2,347 / 5,000 budget
- Generated: 2026-01-10T10:30:00Z

## File Structure Governance Context
- FileLockService in progress at domain/services/
- Naming convention: -service.ts suffix for domain services
- Adapter pattern: -adapter.ts for infrastructure layer

## State Persistence Context
- note-store.ts uses Zustand v5
- Individual selector pattern required (no multiple selectors)
- Store facade pattern: all exports through index.ts

## UX Interaction Context
- 8-bit design system active
- Sharp corners only (no rounded-lg)
- Pixel shadows: shadow-[4px_4px_0_0]

---

[Original user prompt here]
```

---

## Integration Points

### Input: From correct-course.yaml

```yaml
context_first:
  trigger: "before_any_work"
  input:
    user_prompt: "{{original_prompt}}"
    task_type: "{{detected_type}}"
    loop_state: "{{LOOP_STATE}}"
  output:
    contextualized_prompt: "{{improved_prompt}}"
    context_summary: "{{gathering_result}}"
```

### Output: To expert-analysis.md

```yaml
expert_analysis:
  input:
    contextualized_prompt: "{{from_context_first}}"
    context_summary: "{{from_context_first}}"
    user_prompt: "{{original}}"
```

---

## Success Criteria

### PASS Conditions:
- [ ] At least one P0 domain scanned (if applicable)
- [ ] Token budget within target (<5K)
- [ ] Staleness check passed (or re-confirmed)
- [ ] Contextualized prompt generated
- [ ] Related files included

### FAIL Conditions:
- [ ] Context staleness detected and not re-confirmed
- [ ] Token budget exceeded significantly (>10K)
- [ ] No relevant domains found
- [ ] Context gathering failed

---

## Example Execution

**Input:**
```
User: "Fix the FileLockService to use WebLock API"
```

**Step A Output:**
```yaml
domains_scanned:
  - file_structure_governance:
    files: [file-lock-service.ts, lock-types.ts]
    findings: ["FileLockService exists", "Currently stub implementation"]
  - state_persistence:
    files: [sync-manager.ts]
    findings: ["SyncManager depends on FileLockService"]
```

**Step B Output:**
```markdown
# Contextualized Prompt

## Context
- FileLockService exists at domain/services/file-lock-service.ts
- Currently stub implementation
- SyncManager depends on FileLockService

## Task
Fix the FileLockService to use WebLock API
```

---

**Workflow Owner:** governance-core
**Integrates With:**
- `_bmad-ext/state/LOOP_STATE.yaml` (staleness checking)
- `_bmad-ext/modules/governance-core/config/domains.yaml`
- `_bmad-ext/modules/governance-core/workflows/expert-analysis.md`

**Last Updated:** 2026-01-10
