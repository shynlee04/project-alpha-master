---
name: pre-planning
description: Pre-planning research gate - mandatory "plan before code" step. Use when user says "pre-planning", "research gate", or after context validation. Executes required MCP research, checks standards compliance, and creates implementation plan.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 60
agents:
  - bmad-bmm-dev
triggers:
  - pre-planning
  - pre planning
  - research gate
  - /pre-planning
---

# Step 05: Pre-Planning Gate (NEW)

**Purpose**: v2.0 innovation - mandatory research and validation BEFORE any code is written. This prevents context mismatches and wrong patterns.

## When to use

- After context validation passes
- User says "pre-planning" or "research gate"
- Before development begins
- Required gate for all stories

## Why This Step Exists

**Problem from v1.0**: Agents implemented stories without proper research, leading to:
- Wrong patterns used
- API misunderstandings
- Unnecessary rework
- Context drift

**Solution**: Mandatory research gate that MUST pass before development.

## Instructions

### 1. Load All Context
```bash
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/{story_key}-context.xml
READ: _bmad-output/project-planning-artifacts/architecture.md
READ: .claude/rules/governance-rules.md
```

### 2. Execute Required Research

#### A. Context7 Research (Official Documentation)
For each research requirement in story:
```bash
# Step 1: Resolve library ID
mcp__context7__resolve-library-id("{library_name}")

# Step 2: Get relevant docs
mcp__context7__get-library-docs(
  context7CompatibleLibraryID: "{id}",
  topic: "{specific_pattern_or_api}",
  tokens: 3000
)
```

**Document findings in story:**
```markdown
### Research Executed
- Context7: {library} {topic}
  - Pattern: {code_pattern_found}
  - Reference: {doc_url}
```

#### B. DeepWiki Research (GitHub Patterns)
```bash
mcp__deepwiki__ask_repository(
  repo: "{owner/repo}",
  question: "How does {pattern} work in this codebase?"
)
```

**Document findings:**
```markdown
- DeepWiki: {repo} {pattern}
  - Implementation: {pattern_found}
  - Reference: {github_url}
```

#### C. Codebase Analysis (Repomix)
For complex patterns:
```bash
# Analyze local codebase
Grep.search({
  pattern: "{pattern_to_find}",
  path: "src",
  output_mode: "content"
})
```

### 3. Constitution/Standards Check

**Verify implementation will comply with:**
- [ ] Coding standards (global-coding-style skill)
- [ ] Error handling patterns (global-error-handling skill)
- [ ] Architecture patterns (from architecture.md)
- [ ] Component size limits (≤300 lines)
- [ ] Store size limits (≤120 lines)
- [ ] Import patterns (no circular dependencies)

### 4. Create Implementation Plan

**Add to story file:**
```markdown
## Implementation Plan

### Approach
{brief_description_of_implementation_approach}

### Files to Create
- [ ] {path/to/new_file.ts} - {purpose}

### Files to Modify
- [ ] {path/to/existing_file.ts} - {change_summary}

### Integration Strategy
1. {step_1}
2. {step_2}
3. {step_3}

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk_1} | {level} | {mitigation} |

### Test Strategy
- Unit tests for: {functions/components}
- Integration tests for: {interactions}
- E2E tests for: {user_flows}
```

### 5. Pre-Planning Validation (100% Pass Required)

#### Research Complete
- [ ] All Context7 queries executed
- [ ] All DeepWiki queries executed
- [ ] All codebase patterns analyzed
- [ ] Findings documented in story

#### Standards Check
- [ ] Coding standards understood
- [ ] Architecture patterns identified
- [ ] Size limits acknowledged
- [ ] No circular dependencies planned

#### Implementation Plan
- [ ] Approach clearly defined
- [ ] Files to create/modify listed
- [ ] Integration strategy documented
- [ ] Risks assessed
- [ ] Test strategy defined

#### Context Match
- [ ] Research findings match architecture.md
- [ ] Implementation uses approved dependencies
- [ ] No conflicts with existing code

### 6. Validation Result

#### If 100% Pass:
```yaml
{story_key}:
  status: "ready-for-implementation"
  pre_planning_complete: true
  pre_planning_at: {timestamp}
```

Proceed to: [dev-story](../dev-story/SKILL.md)

#### If Fail:
1. Document what failed
2. Complete missing research
3. Fix standards violations
4. Re-run validation

## Pre-Planning Template

```markdown
## Pre-Planning Gate Report

**Story:** {story_key}
**Date:** {timestamp}

### Research Summary
| Tool | Queries | Findings |
|------|---------|----------|
| Context7 | {N} | {summary} |
| DeepWiki | {N} | {summary} |
| Repomix | {N files} | {summary} |

### Standards Check
| Standard | Status | Notes |
|----------|--------|-------|
| Coding Style | ✅/❌ | |
| Error Handling | ✅/❌ | |
| Architecture | ✅/❌ | |
| Size Limits | ✅/❌ | |

### Implementation Plan
- **Approach:** {one_line_summary}
- **Files:** {N} create, {N} modify
- **Risks:** {N} identified
- **Tests:** {N} planned

### Overall: PASS/FAIL
```

## Next Step

After passing:
- Proceed to: [dev-story](../dev-story/SKILL.md)

After failing:
- Trigger: [correct-course](../utils/correct-course/SKILL.md) if unable to pass

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/05-pre-planning.md`
