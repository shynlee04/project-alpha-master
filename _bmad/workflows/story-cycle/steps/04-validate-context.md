---
step: 4
name: "validate-context"
phase: "validation"
agent: "@bmad-bmm-sm"
timeout: "10 min"
next: "05-pre-planning.md"
on_fail: "loop-to-03"
---

# Step 04: Validate Context XML

> **Agent:** Story Manager (SM)
> **Purpose:** Ensure context is complete, current, and actionable before development

---

## Instructions

### 1. Load Context XML

```bash
READ: {sprint_artifacts}/{story_key}-context.xml
```

### 2. Load Stale Check Utility

```bash
READ: _bmad/bmb/workflows/story-cycle/utils/_stale-check.md
```

Execute stale check on all referenced files.

### 3. Run Validation Checklist

**CRITICAL: All items must pass (100%) before proceeding.**

#### XML Structure Validation
- [ ] File exists at correct path
- [ ] Valid XML (no parse errors)
- [ ] Root element is `<context>` with story and created attributes
- [ ] Version attribute present

#### Content Completeness Validation
- [ ] `<metadata>` section complete with epic, story, title, sprint
- [ ] `<acceptance_criteria>` has all ACs from story file
- [ ] `<files>` has at least 1 current code snippet
- [ ] `<research_notes>` has at least 3 MCP findings
- [ ] `<architecture_patterns>` references architecture.md
- [ ] `<technical_notes>` has prioritized implementation hints
- [ ] `<dependencies>` lists all required packages
- [ ] `<integration_points>` documents touched files
- [ ] `<test_requirements>` specifies test approach

#### Freshness Validation (via _stale-check.md)
- [ ] All referenced files exist
- [ ] File modification times are recent (<24 hours OR explicitly acknowledged)
- [ ] No uncommitted changes in referenced files
- [ ] Context XML timestamp is current

#### Quality Validation
- [ ] Code snippets are relevant (50-200 lines each)
- [ ] Research findings have actionable insights
- [ ] Technical notes have clear priorities
- [ ] Integration points identify risks
- [ ] Test requirements are specific

#### Cross-Reference Validation
- [ ] Story file ACs match context XML ACs
- [ ] Architecture patterns exist in referenced document
- [ ] Dependencies match Dev Notes in story file

### 4. Validation Result

#### If 100% Pass:
```yaml
# Update sprint status
{story_key}:
  status: "context-validated"
  context_validated_at: {timestamp}
```

Proceed to next step: `05-pre-planning.md`

#### If Stale Check Fails:
1. Identify stale files
2. Offer options:
   - Refresh context with current files
   - Acknowledge stale state (if intentional)
   - Defer story until code is committed
3. If refreshing: Loop back to `03-create-context.md`

#### If Other Validation Fails:
1. Create list of failing items
2. Specify fixes needed
3. Loop back to `03-create-context.md`
4. Re-run validation until 100% pass

---

## Validation Template

```markdown
## Context Validation Report

**Story:** {story_key}
**Context File:** {context_file_path}
**Validated At:** {timestamp}
**Validator:** SM Agent

### Results

| Category | Status | Issues |
|----------|--------|--------|
| XML Structure | ✅/❌ | {details} |
| Content Completeness | ✅/❌ | {details} |
| Freshness | ✅/❌ | {details} |
| Quality | ✅/❌ | {details} |
| Cross-Reference | ✅/❌ | {details} |

### Freshness Check
| File | Last Modified | Status |
|------|---------------|--------|
| {file_path} | {timestamp} | ✅ Current / ⚠️ Stale |

### Overall: PASS/FAIL

### Required Actions
{if FAIL, list specific fixes needed}
```

---

## Handoff Output

```markdown
## 📋 STEP COMPLETE: 04-validate-context

**Story:** {story_key}
**Status:** context-validated

### Artifacts Updated:
- ✅ {sprint_artifacts}/{story_key}-context.xml (validated)
- ✅ {sprint_artifacts}/sprint-status.yaml

### Validation Summary:
- XML Structure: ✅ PASS
- Completeness: ✅ PASS
- Freshness: ✅ PASS (all files current)
- Quality: ✅ PASS
- Cross-Reference: ✅ PASS

### Files Referenced:
- Code files: {N}
- Architecture patterns: {N}
- Research findings: {N}

### Next Step:
- Execute: 05-pre-planning.md
- Input: Story file + Context XML
```
