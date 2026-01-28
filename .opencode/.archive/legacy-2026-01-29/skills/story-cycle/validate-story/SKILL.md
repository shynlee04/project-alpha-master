---
name: validate-story
description: Validate story file is 100% complete before proceeding. Use when user says "validate story", "check story", or after creating a story. Ensures story file has all required sections and properly formatted acceptance criteria.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 57
agents:
  - bmad-bmm-sm
triggers:
  - validate story
  - check story
  - verify story
  - /validate-story
---

# Step 02: Validate Story

**description**: Validate story file is 100% complete before proceeding to context creation.

## When to use

- After story file is created
- User says "validate story" or "check story"
- Before creating context XML
- Manual validation checkpoint

## Instructions

### 1. Load Story File
```bash
READ: {sprint_artifacts}/{story_key}.md
```

### 2. Validation Checklist (100% Pass Required)

#### Story File Structure
- [ ] File exists at correct path
- [ ] Frontmatter YAML is valid
- [ ] story_key follows format: {epic}-{story}-{slug}
- [ ] Status is not "blocked" or "deferred"

#### User Story Format
- [ ] "As a" section is present and populated
- [ ] "I want" section is present and populated
- [ ] "So that" section is present and populated
- [ ] User story is clear and actionable

#### Acceptance Criteria
- [ ] At least 3 ACs defined
- [ ] Each AC has Given/When/Then format
- [ ] ACs are specific and testable
- [ ] ACs are not ambiguous

#### Tasks Section
- [ ] At least 4 tasks defined
- [ ] Tasks include research tasks
- [ ] Tasks include test tasks
- [ ] Tasks are specific and actionable

#### Research Requirements
- [ ] Required MCP Research section populated
- [ ] At least one Context7 query specified
- [ ] At least one DeepWiki query specified
- [ ] Architecture patterns referenced

#### References
- [ ] Epic reference included
- [ ] Architecture reference included
- [ ] Related stories linked (if applicable)

### 3. Validation Result

#### If 100% Pass:
```yaml
# Update story status
{story_key}:
  status: "validated"
  validated_at: {timestamp}
  validation_result: "pass"
```

Proceed to: [create-context](../create-context/SKILL.md)

#### If Fail:
1. Document each failed check
2. Specify what needs to be fixed
3. Return to [create-story](../create-story/SKILL.md) or fix inline
4. Re-run validation

## Error Handling

| Error | Action |
|-------|--------|
| Story file not found | Check file path, offer to create |
| Missing required sections | Add missing sections |
| ACs not testable | Rewrite ACs with Given/When/Then |
| Tasks incomplete | Add specific tasks |
| No research requirements | Add MCP research queries |

## Output

**Validation Report** (added to story file):
```markdown
## Validation Report

**Validated At:** {timestamp}
**Result:** PASS/FAIL

### Checks Passed: {N}/{total}
### Checks Failed: {N}/{total}

### Issues Found
*List any issues that need fixing*
```

## Next Step

After validation passes:
- Proceed to: [create-context](../create-context/SKILL.md)

After validation fails:
- Fix issues and re-validate

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/02-validate-story.md`
