# Product Reality: UX Gate

> **Version**: 1.0.0 | **Step**: 01a - User Journey Simulation

---

## description

"The Movie Script Test" - Generate a 30-second demo script for the entire story. If the story can't be demonstrated in 30 seconds with a coherent narrative, the UX is fragmented.

---

## When to Use

Invoke this skill when:
- Starting story implementation (after Init step)
- Validating UX design before coding
- Reviewing user journey completeness
- Sprint planning (cohesion validation)

---

## The Movie Script Test

Generate a 30-second demo script that answers:

1. **Where does the user start?** (Entry point)
2. **What does the user do?** (Actions)
3. **What does the system show?** (Immediate feedback)
4. **What is the result?** (Value delivered)

```markdown
# 30-Second Demo: {story_id}

## The Story
{Narrative of user experiencing the feature}

## User Journey
1. User starts at: {entry_point}
2. User clicks: {action}
3. System shows: {immediate_feedback}
4. Value delivered: {outcome}

## Fail If
- User must switch between disconnected UIs
- Multiple workflows for same goal visible
- Demo requires explanation to understand
```

---

## Anti-Patterns Detected

| Pattern | Severity | Description |
|---------|----------|-------------|
| `island_feature` | medium | No clear entry point - accessible only via URL |
| `split_brain` | critical | Dual workflows for same goal (e.g., two chat systems) |
| `ghost_result` | high | Action with no visible result location |
| `dead_end` | medium | No clear next step after completion |
| `loading_vacuum` | medium | No feedback during processing |
| `empty_state_void` | low | No empty state when no data exists |

---

## Scoring Rubric (1-5)

| Score | Description |
|-------|-------------|
| 5 | Delightful - Seamless narrative flow |
| 4 | Good - Minor friction points |
| 3 | Acceptable - Some rough edges |
| 2 | Poor - Fragmented, confusing |
| 1 | Broken - Incoherent user journey |

**Threshold**: Score ≥ 3 to proceed

---

## Output Artifacts

```
_bmad-output/artifacts/{story_id}/
├── journey-map.mermaid          # User journey diagram
├── demo-script.md               # 30-second demo script
└── ux-validation-report.md      # Anti-patterns detected
```

---

## Example

**Story**: "Add note summary feature"

**FAIL - Split Brain**:
```
User clicks "Summarize" in sidebar → modal opens
User clicks "Summarize" in toolbar → different behavior
Result: Users confused, which one to use?
```

**PASS**:
```
User clicks "Summarize" → inline summary appears
User knows where result will be
Single workflow, clear outcome
```

---

**Integration**: Called by `story-cycle` Step 01a, `sprint-planning-wrapper` Step 03
