---
step: 2
name: "validate-story"
phase: "validation"
agent: "@bmad-bmm-sm"
timeout: "5 min"
next: "03-create-context.md"
on_fail: "loop-to-01"
---

# Step 02: Validate Story File

> **Agent:** Story Manager (SM)
> **description:** Ensure story file meets 100% quality standards before proceeding

---

## Instructions

### 1. Load Story File

```bash
READ: {sprint_artifacts}/{story_key}.md
```

### 2. Run Validation Checklist

**CRITICAL: All items must pass (100%) before proceeding.**

#### Format Validation
- [ ] File exists at correct path: `{sprint_artifacts}/{epic}-{story}-{slug}.md`
- [ ] Frontmatter contains: story_key, epic, story, status, created_at, points
- [ ] Status is set to `drafted`

#### User Story Validation
- [ ] "As a" section complete with valid role
- [ ] "I want" section complete with clear action
- [ ] "So that" section complete with measurable benefit
- [ ] Story follows format: As a/{role}/I want/{action}/So that/{benefit}

#### Acceptance Criteria Validation
- [ ] At least 3 ACs defined (minimum)
- [ ] Each AC has: Given/{precondition}, When/{action}, Then/{outcome}
- [ ] ACs are testable and specific
- [ ] ACs follow Gherkin syntax correctly
- [ ] ACs cover all user story aspects

#### Tasks Validation
- [ ] Tasks section exists
- [ ] At least 4 task checkboxes present
- [ ] Tasks include: implementation, research, testing
- [ ] Tasks are specific and actionable

#### Research Requirements Validation
- [ ] Research Requirements section exists
- [ ] At least 3 MCP tool research items listed
- [ ] Architecture Patterns referenced from architecture.md

#### Dev Notes Validation
- [ ] Dependencies section exists
- [ ] Integration Points documented
- [ ] References section links to epic and architecture

#### Structure Validation
- [ ] Dev Agent Record section exists (empty is OK)
- [ ] Code Review section exists (empty is OK)
- [ ] Status History table has at least 2 entries

### 3. Validation Result

#### If 100% Pass:
```yaml
# Update story file status
status: "drafted" → "validated"

# Update sprint status
{story_key}:
  status: "validated"
  validated_at: {timestamp}
```

Proceed to next step: `03-create-context.md`

#### If Any Fail:
1. Create list of failing items
2. For each failure, specify:
   - What failed
   - Why it failed
   - How to fix
3. Loop back to: `01-create-story.md`
4. Re-run validation until 100% pass

---

## Validation Template

```markdown
## Story Validation Report

**Story:** {story_key}
**Validated At:** {timestamp}
**Validator:** SM Agent

### Results

| Category | Status | Issues |
|----------|--------|--------|
| Format | ✅/❌ | {details} |
| User Story | ✅/❌ | {details} |
| Acceptance Criteria | ✅/❌ | {details} |
| Tasks | ✅/❌ | {details} |
| Research Requirements | ✅/❌ | {details} |
| Dev Notes | ✅/❌ | {details} |
| Structure | ✅/❌ | {details} |

### Overall: PASS/FAIL

### Required Actions
{if FAIL, list specific fixes needed}
```

---

## Handoff Output

```markdown
## 📋 STEP COMPLETE: 02-validate-story

**Story:** {story_key}
**Status:** validated

### Artifacts Updated:
- ✅ {sprint_artifacts}/{story_key}.md (status: validated)
- ✅ {sprint_artifacts}/sprint-status.yaml

### Validation Summary:
- Format: ✅ PASS
- User Story: ✅ PASS
- ACs: ✅ PASS (N criteria)
- Tasks: ✅ PASS (N tasks)
- Research: ✅ PASS

### Next Step:
- Execute: 03-create-context.md
- Input: Story file path
```
