---
step: 5
name: "pre-planning"
phase: "planning-gate"
agent: "@bmad-bmm-dev"
timeout: "20 min"
next: "06-dev-story.md"
on_fail: "trigger-correct-course"
---

# Step 05: Pre-Planning Gate (NEW)

> **Agent:** Developer (Dev)
> **description:** Research and validation BEFORE any code is written
> **v2.0 Innovation:** This is the "plan before you code" gate that prevents context mismatches

---

## Why This Step Exists

**Problem from v1.0:** Agents implemented stories without proper research, leading to:
- Wrong patterns used
- API misunderstandings
- Unnecessary rework
- Context drift

**Solution:** A mandatory research and planning gate that MUST pass before development.

---

## Instructions

### 1. Load All Context

```bash
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/{story_key}-context.xml
READ: _bmad-output/project-planning-artifacts/architecture.md
READ: .claude/rules/governance-rules.md  # Constitution check
```

### 2. Execute Required Research

**For EACH research requirement in the story:**

#### A. Context7 Research (Official Documentation)
```bash
# Step 1: Resolve library ID
Context7.resolve-library-id("{library_name}")

# Step 2: Get relevant docs
Context7.get-library-docs(
  context7CompatibleLibraryID: "{id}",
  topic: "{specific_pattern_or_api}",
  tokens: 3000
)
```

**Document in story file Dev Agent Record:**
```markdown
### Research Executed
- Context7: {library} {topic}
  - Pattern: {code_pattern_found}
  - Reference: {doc_url}
```

#### B. DeepWiki Research (GitHub Implementation Patterns)
```bash
DeepWiki.ask_repository(
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
```bash
# For complex patterns, analyze local codebase
Repomix.pack({
  include: ["src/**/*.{ts,tsx}"],
  output: ".repomix-output.txt"
})

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
- [ ] Component size limits (≤300 lines for components)
- [ ] Store size limits (≤120 lines for slices)
- [ ] Import patterns (no circular dependencies)

### 4. Create Implementation Plan

**Add to story file:**

```markdown
## Implementation Plan

### Approach
{brief_description_of_implementation_approach}

### Files to Create
- [ ] {path/to/new_file.ts} - {description}

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

### 5. Pre-Planning Validation

**ALL must pass (100%):**

#### Research Complete
- [ ] All Context7 queries executed
- [ ] All DeepWiki queries executed
- [ ] All codebase patterns analyzed
- [ ] Findings documented in story file

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
- [ ] Research findings match architecture.md patterns
- [ ] Implementation uses approved dependencies
- [ ] No conflicts with existing code

### 6. Validation Result

#### If 100% Pass:
```yaml
# Update sprint status
{story_key}:
  status: "ready-for-implementation"
  pre_planning_complete: true
  pre_planning_at: {timestamp}
```

Proceed to next step: `06-dev-story.md`

#### If Fail:
1. Document what failed
2. If research incomplete: Complete research
3. If standards violation: Trigger `_correct-course.md`
4. If context mismatch: Re-evaluate approach
5. Re-run validation

---

## Pre-Planning Template

```markdown
## Pre-Planning Gate Report

**Story:** {story_key}
**Developer:** Dev Agent
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

---

## Handoff Output

```markdown
## 📋 STEP COMPLETE: 05-pre-planning

**Story:** {story_key}
**Status:** ready-for-implementation

### Artifacts Updated:
- ✅ {sprint_artifacts}/{story_key}.md (Dev Agent Record updated)
- ✅ {sprint_artifacts}/sprint-status.yaml

### Pre-Planning Summary:
- Research queries: {N} Context7, {N} DeepWiki
- Standards check: ✅ PASS
- Implementation plan: ✅ COMPLETE
- Risk assessment: {N} risks documented

### Approved Implementation:
- Approach: {summary}
- Files: {N} to create, {N} to modify
- Tests: {N} planned

### Next Step:
- Execute: 06-dev-story.md
- Input: Story file with complete research and plan
```
