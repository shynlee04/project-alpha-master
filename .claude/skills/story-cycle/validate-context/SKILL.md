---
name: validate-context
description: Validate context XML and run stale check. Use when user says "validate context", "check context", or after creating context. Ensures context is fresh and complete before pre-planning gate.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 59
agents:
  - bmad-bmm-sm
triggers:
  - validate context
  - check context
  - verify context
  - /validate-context
---

# Step 04: Validate Context + Stale Check

**Purpose**: Validate context XML is complete and run stale check to ensure all referenced files are current.

## When to use

- After context XML is created
- User says "validate context" or "check context"
- Before pre-planning gate
- Freshness validation checkpoint

## Instructions

### 1. Load Context XML
```bash
READ: {sprint_artifacts}/{story_key}-context.xml
```

### 2. Validation Checklist

#### XML Structure
- [ ] XML is well-formed (no parse errors)
- [ ] Root `<context>` element exists
- [ ] All required sections present
- [ ] No missing closing tags

#### Meta Section
- [ ] story_key matches story file
- [ ] epic and story numbers correct
- [ ] created_at timestamp present
- [ ] status is appropriate

#### Requirements Section
- [ ] User story complete (As a/I want/So that)
- [ ] At least 3 acceptance criteria
- [ ] Each AC has Given/When/Then

#### Architecture Section
- [ ] At least one pattern referenced
- [ ] Patterns link to architecture.md
- [ ] Constraints documented

#### Research Section
- [ ] Context7 queries specified
- [ ] DeepWiki queries specified
- [ ] Query topics are specific

#### Implementation Section
- [ ] Files to create listed
- [ ] Files to modify listed
- [ ] Integration points documented

#### Testing Section
- [ ] Unit test targets specified
- [ ] Integration test targets specified

#### References Section
- [ ] Epic reference included
- [ ] Architecture reference included

### 3. Stale Check

Calls: [stale-check](../utils/stale-check/SKILL.md)

**Check these files for freshness**:
```bash
# Check modification timestamps
_bmad-output/epics.md
_bmad-output/project-planning-artifacts/architecture.md
.claude/rules/governance-rules.md

# Check git status for uncommitted changes
git status --porcelain
```

**Freshness criteria**:
- Files modified within last 24 hours: ✅ FRESH
- Files modified 24-72 hours ago: ⚠️ STALE (warn user)
- Files modified >72 hours ago: ❌ VERY STALE (require refresh)

### 4. Validation Result

#### If 100% Pass + Fresh:
```yaml
{story_key}:
  status: "context-validated"
  context_validated_at: {timestamp}
  stale_check: "pass"
```

Proceed to: [pre-planning](../pre-planning/SKILL.md)

#### If Fail:
1. Document each failed check
2. Fix context XML issues
3. If stale: offer to refresh or acknowledge
4. Re-run validation

## Stale Check Handling

| State | Action |
|-------|--------|
| Fresh (<24h) | Proceed normally |
| Stale (24-72h) | Warn user, offer refresh option |
| Very Stale (>72h) | Require refresh or explicit acknowledgement |

## Output

**Validation Report** (added to story file):
```markdown
## Context Validation Report

**Validated At:** {timestamp}
**Result:** PASS/FAIL

### Stale Check Result: PASS/STALE/VERY_STALE
| File | Last Modified | Status |
|------|---------------|--------|
| epics.md | {timestamp} | {status} |
| architecture.md | {timestamp} | {status} |

### Issues Found
*List any issues*
```

## Next Step

After validation passes:
- Proceed to: [pre-planning](../pre-planning/SKILL.md)

After validation fails or stale:
- Fix issues and re-validate

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/04-validate-context.md`
