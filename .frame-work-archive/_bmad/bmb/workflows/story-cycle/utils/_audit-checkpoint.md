# Utility: Audit Checkpoint

> **description:** Cross-cutting audit to ensure quality and compliance
> **Trigger:** After each major phase, or manually via `/audit {story_key}`

---

## What It Audits

### 1. Artifact Completeness
- Story file exists and is complete
- Context XML exists and is valid
- Handoff artifacts created
- Sprint status updated

### 2. Governance Compliance
- Constitution rules followed
- Coding standards applied
- Architecture patterns used
- Size limits respected

### 3. Quality Metrics
- Tests passing percentage
- TypeScript error count
- Code coverage (if available)
- Performance benchmarks (if applicable)

### 4. Traceability
- Decisions documented
- Files changed tracked
- Research findings linked
- Handoffs complete

---

## Audit Procedure

### 1. Load Story Context

```bash
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/sprint-status.yaml
```

### 2. Run Audit Checks

```markdown
## Audit Report: {story_key}

**Audited At:** {timestamp}
**Auditor:** Audit Agent

### Section 1: Artifact Completeness

| Artifact | Exists | Complete | Valid |
|----------|--------|----------|-------|
| Story file | ✅/❌ | ✅/❌ | ✅/❌ |
| Context XML | ✅/❌ | ✅/❌ | ✅/❌ |
| Handoff | ✅/❌ | ✅/❌ | ✅/❌ |
| Sprint status | ✅/❌ | ✅/❌ | ✅/❌ |

**Status:** {PASS|FAIL}

### Section 2: Governance Compliance

| Standard | Compliant | Issues |
|----------|-----------|--------|
| Constitution rules | ✅/❌ | {details} |
| Coding standards | ✅/❌ | {details} |
| Architecture patterns | ✅/❌ | {details} |
| Size limits | ✅/❌ | {details} |

**Status:** {PASS|FAIL}

### Section 3: Quality Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Tests passing | 100% | {N}% | ✅/❌ |
| TypeScript errors | 0 | {N} | ✅/❌ |
| Code coverage | ≥80% | {N}% | ✅/❌ |

**Status:** {PASS|FAIL}

### Section 4: Traceability

| Item | Tracked | Location |
|------|---------|----------|
| Decisions | ✅/❌ | {story_file} |
| Files changed | ✅/❌ | {dev_record} |
| Research findings | ✅/❌ | {context_xml} |
| Handoffs | ✅/❌ | {handoff_files} |

**Status:** {PASS|FAIL}

### Overall Audit Result: {PASS|FAIL}

### Critical Issues
{if any, list critical items that MUST be fixed}

### Recommendations
{suggestions for improvement}
```

### 3. Record Audit Result

```yaml
# In story file Status History
| audit | {timestamp} | Audit Agent | {PASS|FAIL} - {summary} |
```

### 4. On Failure

**If audit fails:**

1. **Critical Issues:** Must fix before proceeding
   - Notify with specific issues
   - Create action plan
   - Re-audit after fixes

2. **Non-Critical Issues:** Document for improvement
   - Add to recommendations
   - Track in retrospective
   - Address in future stories

---

## Checkpoint Locations

**Mandatory Audits:**
- After step 02 (validate-story)
- After step 04 (validate-context)
- After step 07 (code-review)
- After step 08 (story-done)

**Optional Audits:**
- Anytime via `/audit {story_key}`
- Before merging to main
- After major changes

---

## Integration

```bash
# Manual trigger
/audit {story_key}

# Automatic (built into steps)
Called by: 02-validate-story, 04-validate-context, 07-code-review, 08-story-done
```
