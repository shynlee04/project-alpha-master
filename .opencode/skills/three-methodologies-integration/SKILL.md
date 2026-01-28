---
name: three-methodologies-integration
description: Master integration skill mapping all orchestration patterns to the 3 Methodologies Framework. Connects chains, combos, and cycles to OpenCode primitives and Beast-Mode requirements.
license: MIT
compatibility: opencode
metadata:
  type: integration
  priority: master
  framework: "3-methodologies-v1.0.0"
  source: "_bmad-output/opencode-native-migration/loop-1-gap-analysis/06-three-methodologies-framework-2026-01-29.md"
---

# Three Methodologies Integration

> **Single Source of Truth**: This skill connects the orchestration layer (chains, combos, cycles) to the 3 Methodologies Framework for OpenCode Native migration.

---

## The 3 Methodologies

| # | Methodology | Principle | OpenCode Primitives | Orchestration Skills |
|---|-------------|-----------|---------------------|---------------------|
| **1** | Less for More | Load only what's needed, when needed | Skills, Agents, Permissions | `skill-chains`, `min-max-strategy` |
| **2** | Accurately Specific | Type-safe, metadata-driven precision | Custom Tools, Commands, @file | `skill-combos`, `context-first` |
| **3** | Auto Governance | Event-driven enforcement, not documentation | Plugins (before/after hooks) | `automation-cycles`, `bouncing-loops` |

---

## Methodology 1: Less for More

### Token Budget Impact

```
BEFORE: 35% context overhead (140,000 tokens)
AFTER:  <5% context overhead (20,000 tokens)
SAVINGS: 120,000 tokens per session
```

### Skill Consolidation (82 → 16)

| OLD (.agent/skills/) | NEW (.opencode/skills/) | Purpose |
|---------------------|------------------------|---------|
| 38 scattered skills | **using-superpowers** | Entry gate |
| brainstorming/* | **brainstorming** | Creative work |
| story-cycle/9 steps | **story-cycle** | Development workflow |
| architecture-remediation/11 | **arch-remediation** | Tech debt |
| systematic-debugging/11 | **debugging** | Bug investigation |
| frontend-*/* | **frontend-complete** | UI implementation |
| backend-*/* | **backend-complete** | API implementation |
| code-review/* | **code-review** | Quality gate |
| tdd-*/* | **tdd-workflow** | Test-driven |
| global-*/* | **coding-standards** | Conventions |
| writing-*/* | **writing-skills** | Documentation |
| ORCHESTRATION LAYER | **skill-chains** | Sequential execution |
| ORCHESTRATION LAYER | **skill-combos** | Parallel execution |
| ORCHESTRATION LAYER | **automation-cycles** | Loop execution |
| ORCHESTRATION LAYER | **hierarchy-orchestration** | Governance |
| ORCHESTRATION LAYER | **three-methodologies-integration** | THIS SKILL |

### On-Demand Loading Pattern

```typescript
// Agent sees available skills in tool description
<available_skills>
  <skill>
    <name>story-cycle</name>
    <description>Complete story development with TDD</description>
  </skill>
</available_skills>

// Agent loads skill when needed
skill({ name: "story-cycle" })

// Token cost: 0 until loaded, ~500 per skill when loaded
```

---

## Methodology 2: Accurately Specific with Concision

### Schema Validation

All artifacts MUST validate against Zod schemas before loading:

```typescript
// .opencode/schemas/artifacts.ts
export const StoryFrontmatterSchema = z.object({
  id: z.string().regex(/^[A-Z]+-\d+-\d+$/),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  sprint: z.string(),
  epic: z.string(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
  ttl_status: z.enum(['fresh', 'stale', 'expired']).optional(),
})
```

### @file Section References

```markdown
# ANTI-PATTERN: Full document (4,800 tokens)
@file:stories/UXUI-03-01.md

# PATTERN: Precise sections (120 tokens)
@file:stories/UXUI-03-01.md[frontmatter]
@file:stories/UXUI-03-01.md[acceptance_criteria]
```

**Token Savings**: 97.5% per artifact load

### Command Integration

Commands invoke skill chains with validation:

```yaml
# .opencode/commands/story-cycle.md
---
description: "Execute story cycle with validation"
agent: dev-ext
subtask: true
---

Execute story cycle for: $1

## Context (validated before load)
@file:$1[frontmatter,acceptance_criteria]
@file:sprint-status.yaml[current_story]

## Shell Status
!`pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l`

## Skills to Load (chain)
1. skill({ name: "story-cycle" })
2. skill({ name: "tdd-workflow" })
3. skill({ name: "code-review" })
```

---

## Methodology 3: Auto Governance (Event-Driven)

### Hook → Orchestration Mapping

| Hook | When Triggered | Orchestration Integration |
|------|---------------|--------------------------|
| `chat.message` | User message | Load MIN skills, detect request type, select chain/combo |
| `tool.execute.before` | Before tool runs | Validate paths, check permissions, gate enforcement |
| `tool.execute.after` | After tool completes | Run governance, advance chain step, register artifacts |
| `experimental.session.compacting` | Context compaction | Inject state, preserve chain position |

### Bouncing Loop Integration

```typescript
// Pre-execution: Gate check
"tool.execute.before": async (input, output) => {
  if (isForbiddenPath(path)) {
    // BOUNCE: Block with correction instructions
    output.block = true
    output.reason = createBounce(...)
  }
}

// Post-execution: Cascade check
"tool.execute.after": async (input, output) => {
  if (governanceViolation) {
    // BOUNCE: Signal required action
    output.context.push("⛔ BOUNCE: Run governance scripts")
  }
  // PASS: Advance chain
  advanceChainStep()
}
```

### Automation Cycle → Hook Mapping

| Cycle | Trigger Hook | Validation Hook | Exit Condition |
|-------|-------------|-----------------|----------------|
| CI Loop | `tool.execute.after` (file edit) | `tool.execute.after` (test run) | All checks pass |
| Story Cycle | `chat.message` (story request) | `tool.execute.after` (step gate) | Story DONE |
| TDD Cycle | `chat.message` (feature request) | `tool.execute.after` (test result) | GREEN confirmed |

---

## Beast-Mode Requirements Integration

### Mapping 27 Requirements to Orchestration

| Requirement ID | Requirement | Orchestration Skill | Hook |
|---------------|-------------|---------------------|------|
| **AUTO-01** | Event-driven agents | `automation-cycles` | chat.message |
| **AUTO-02** | Pre-commit hooks | `automation-cycles` | tool.execute.before |
| **AUTO-03** | Auto-staleness rejection | `bouncing-loops` | tool.execute.before |
| **ENF-01** | Hard-blocking gates | `bouncing-loops` | tool.execute.before |
| **ENF-04** | Adversarial review | `skill-chains` (code-review) | tool.execute.after |
| **ENF-06** | TypeScript zero-error | `automation-cycles` | tool.execute.after |
| **CTX-01** | Forced grep/glob first | `skill-combos` (context-first) | chat.message |
| **CTX-02** | Single source of truth | `hierarchy-orchestration` | All hooks |
| **CTX-05** | Context fingerprinting | `automation-cycles` | session.compacting |
| **COORD-01** | Mandatory Party Mode | `skill-combos` | chat.message |
| **COORD-03** | Automatic routing | `skill-chains` | chat.message |

### 10 TRAPs Prevention

| TRAP | Prevention | Orchestration |
|------|------------|---------------|
| TRAP-1 Premature Implementation | Load context-first skill | MIN strategy |
| TRAP-2 Context Poisoning | TTL validation hooks | tool.execute.before |
| TRAP-3 Scope Creep | Story scope locking | skill-chains gates |
| TRAP-4 State Boundary Violation | State file detection | tool.execute.after |
| TRAP-5 Temporary Code Permanence | Paired story requirement | chat.message |
| TRAP-6 File Tree Anarchy | Path validation | tool.execute.before |
| TRAP-7 God Component | LOC checking | tool.execute.after |
| TRAP-8 TypeScript-Only Validation | Full verification | automation-cycles |
| TRAP-9 Nonsense Sprint Cohesion | Sprint validation | skill-chains |
| TRAP-10 Documentation Drift | Auto-update hooks | tool.execute.after |

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER MESSAGE                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  METHODOLOGY 1: Less for More                                   │
│  - Load MIN skills (using-superpowers, context-first, etc.)     │
│  - Detect request type → select chain or combo                  │
│  - On-demand skill loading via skill({ name })                  │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  METHODOLOGY 2: Accurately Specific                             │
│  - Validate artifacts via Zod schemas                           │
│  - Load @file sections (97.5% token savings)                    │
│  - Execute commands with validation                             │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  METHODOLOGY 3: Auto Governance                                 │
│  - tool.execute.before: Gate enforcement → BOUNCE on violation  │
│  - tool.execute.after: Cascade governance → advance chain       │
│  - session.compacting: State preservation                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| Context overhead | 35% | <5% | Token count |
| Skill count | 82 | 16 | File count |
| Governance compliance | 1.1% | 95%+ | Gate pass rate |
| Post-compact restoration | 0% | 95%+ | Recovery test |
| Token savings per artifact | 0% | 97.5% | @file section usage |

---

## How to Use This Skill

1. **Before ANY implementation work**: Load this skill for context
2. **When selecting patterns**: Reference Methodology mapping
3. **When creating hooks**: Follow Hook → Orchestration mapping
4. **When debugging governance**: Check TRAP prevention matrix
5. **When measuring progress**: Use Success Criteria metrics
