---
name: audit
description: Quality audit checkpoint for story artifacts. Use when user says "audit story", "quality check", or for periodic quality gates. Verifies story file completeness, documentation, and compliance with standards.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: utility
parent: story-cycle
children: []
priority: 67
agents:
  - code-reviewer
triggers:
  - audit story
  - quality check
  - audit checkpoint
  - /audit
---

# Utility: Audit Checkpoint

**description**: Quality audit checkpoint for story artifacts - verifies completeness, documentation, and compliance with standards.

## When to use

- Periodic quality checkpoint
- User says "audit story" or "quality check"
- Before major milestones
- After significant changes

## Instructions

### 1. Load Story Artifacts

```bash
READ: {sprint_artifacts}/{story_key}.md
READ: {sprint_artifacts}/{story_key}-context.xml (if exists)
READ: _bmad-output/sprint-artifacts/sprint-status.yaml
```

### 2. Audit Checklist

#### Story File Audit

**Structure (100% required)**
- [ ] Frontmatter YAML present and valid
- [ ] story_key follows format {epic}-{story}-{slug}
- [ ] Epic and story numbers correct
- [ ] Status is valid value

**User Story (100% required)**
- [ ] "As a" section present
- [ ] "I want" section present
- [ ] "So that" section present
- [ ] Story is clear and actionable

**Acceptance Criteria (100% required)**
- [ ] At least 3 ACs defined
- [ ] Each AC has name
- [ ] Each AC has Given/When/Then
- [ ] ACs are testable

**Tasks (100% required)**
- [ ] At least 4 tasks defined
- [ ] Tasks include research
- [ ] Tasks include testing
- [ ] Tasks are specific

**Research Requirements (100% required)**
- [ ] Context7 queries specified
- [ ] DeepWiki queries specified
- [ ] Architecture patterns referenced

**Documentation (80% required)**
- [ ] Dev Notes section populated
- [ ] Dependencies listed
- [ ] Integration points listed
- [ ] References included

#### Context File Audit (if exists)

**XML Structure**
- [ ] Well-formed XML
- [ ] All required sections present
- [ ] Links to valid files

**Content Completeness**
- [ ] User story matches story file
- [ ] All ACs included
- [ ] Architecture patterns referenced
- [ ] Implementation plan included

### 3. Compliance Check

#### Size Limits
- [ ] No component >300 lines planned
- [ ] No store >120 lines planned

#### Import Patterns
- [ ] No circular dependencies planned
- [ ] Proper import paths specified

#### TypeScript Compliance
- [ ] Type definitions planned
- [ ] No `any` types without justification

#### Testing Strategy
- [ ] Unit tests planned
- [ ] Integration tests planned (if applicable)
- [ ] E2E tests planned (if applicable)

### 4. Quality Score

Calculate quality score:

```yaml
audit:
  story_file: {percentage}%
  context_file: {percentage}%
  compliance: {percentage}%
  overall: {percentage}%

thresholds:
  excellent: 90-100%
  good: 80-89%
  acceptable: 70-79%
  needs_improvement: <70%
```

### 5. Audit Report

```markdown
## Story Audit Report

**Story:** {story_key}
**Audited At:** {timestamp}
**Auditor:** {agent}

### Overall Score: {score}%

### Category Scores

| Category | Score | Threshold | Status |
|----------|-------|-----------|--------|
| Story File | {N}% | 100% | {✅/❌} |
| Context File | {N}% | 100% | {✅/❌} |
| Compliance | {N}% | 80% | {✅/❌} |

### Issues Found

#### Critical (Must Fix)
1. {critical_issue}

#### Major (Should Fix)
1. {major_issue}

#### Minor (Nice to Have)
1. {minor_issue}

### Recommendations

{actionable_recommendations}

### Re-audit Date
{if_needs_improvement}
```

### 6. Actions Based on Score

| Score | Action |
|-------|--------|
| 90-100% | ✅ Excellent - No action needed |
| 80-89% | ✅ Good - Minor improvements optional |
| 70-79% | ⚠️ Acceptable - Some improvements recommended |
| <70% | ❌ Needs Improvement - Re-audit required |

## Usage Example

```bash
User: /audit story=21-2-fix-auth

Agent: Story Audit: 21-2-fix-auth

Overall Score: 85% (Good)

Category Scores:
├─ Story File: 100% ✅
├─ Context File: 80% ✅
└─ Compliance: 75% ⚠️

Issues Found:
- Major: Dev Notes section incomplete
- Minor: No E2E tests planned

Recommendations:
1. Complete Dev Notes with dependencies
2. Consider adding E2E test for user flow

Re-audit: Not required (above threshold)
```

## Audit Frequency

| Trigger | Frequency |
|---------|-----------|
| After story creation | Always |
| After context creation | Always |
| After implementation | Always |
| Periodic | Weekly |
| On demand | User request |

---

**Source**: `_bmad/bmb/workflows/story-cycle/utils/_audit-checkpoint.md`
