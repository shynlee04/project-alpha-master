# Handoff Document MCP Validation

**Document ID:** `HANDOFF-MCP-VALIDATION-2025-12-26`  
**Version:** 1.0  
**Classification:** P0 - Governance  
**Base Protocol:** [`.agent/rules/general-rules.md`](.agent/rules/general-rules.md)

---

## 1. Overview

This document defines MCP research validation requirements for BMAD handoff documents. All handoffs between agents MUST include MCP research evidence to ensure proper implementation context.

**Base Protocol:** The 4-step MCP Research Protocol from `.agent/rules/general-rules.md`

---

## 2. Handoff Document Structure

### 2.1 Required MCP Research Section

All handoff documents MUST include this section:

```markdown
## MCP Research Validation

### Research Triggers
- [ ] New library/dependency introduced
- [ ] Unfamiliar architectural pattern
- [ ] Cross-module integration
- [ ] External API integration
- [ ] Security-critical implementation

### Research Completed
| Step | Tool | Status | Artifact |
|------|------|--------|----------|
| 1 | Context7 | ✅ / ❌ | {file} |
| 2 | Deepwiki | ✅ / ❌ | {file} |
| 3 | Tavily/Exa | ✅ / ❌ | {file} |
| 4 | Repomix | ✅ / ❌ | {file} |

### Key Findings Summary
- {finding 1}
- {finding 2}

### Implementation Guidelines
{derived implementation approach}

### Known Risks
- {risk 1 and mitigation}
```

---

## 3. Handoff Template with MCP Section

### 3.1 Delegation Handoff Template

```markdown
# Handoff to {Agent Mode}

## Task Information
**Task ID:** {epic}-{story}  
**Priority:** P0 | P1 | P2  
**Created:** {YYYY-MM-DD}

## Task Description
{brief description of work}

## Context Files
1. {file} - {description}
2. {file} - {description}

## MCP Research Section (REQUIRED)

### Research Triggers
☐ New library/dependency introduced
☐ Unfamiliar architectural pattern  
☐ Cross-module integration
☐ External API integration
☐ Security-critical implementation

### MCP Research Evidence

| Step | Tool | Question Asked | Findings | Status |
|------|------|----------------|----------|--------|
| 1 | Context7 | {API question} | {key signatures} | ✅/❌ |
| 2 | Deepwiki | {architecture question} | {patterns found} | ✅/❌ |
| 3 | Tavily/Exa | {best practices question} | {2025 patterns} | ✅/❌ |
| 4 | Repomix | {codebase analysis question} | {existing patterns} | ✅/❌ |

### Research Documents
- `_bmad-output/research/{context7-findings}-{YYYY-MM-DD}.md`
- `_bmad-output/research/{deepwiki-findings}-{YYYY-MM-DD}.md`
- `_bmad-output/research/{tavily-findings}-{YYYY-MM-DD}.md`

### Implementation Approach
{derived from MCP research}

### Code References
- `src/{file}` - {component/function}
- `src/{file}` - {component/function}

## Acceptance Criteria
1. {criterion 1}
2. {criterion 2}
3. {criterion 3}

## Output Location
`_bmad-output/{category}/{artifact-name}-{YYYY-MM-DD}.md`

## Notes
{additional context}
```

---

## 4. Validation Checklist

### 4.1 Handoff Receiver Validation

Before accepting a handoff, verify:

```
□ MCP Research Section exists
□ All 4 steps addressed (or explicitly waived)
□ Research artifacts linked and accessible
□ Implementation guidelines derived from research
□ Known risks documented
□ Code references point to existing files
```

### 4.2 Handoff Sender Requirements

Before sending a handoff, ensure:

```
□ Research questions documented
□ All MCP steps completed (or justified exemption)
□ Findings summarized for receiver
□ Implementation approach validated
□ Risk assessment completed
```

---

## 5. Exemption Process

### 5.1 When MCP Research Can Be Waived

MCP research MAY be skipped when:

| Scenario | Justification Required | Approver |
|----------|----------------------|----------|
| Trivial fix (< 10 lines) | Explain why no new patterns | Self |
| Known well-documented pattern | Reference existing implementation | Self |
| Emergency hotfix | Document post-fix research | Tech Lead |
| Already researched in parent story | Reference parent research | Self |

### 5.2 Exemption Documentation

When waiving MCP research, document:

```markdown
### MCP Research Exemption

**Reason:** ☐ Trivial fix | ☐ Known pattern | ☐ Emergency | ☐ Already researched

**Justification:**
{explain why research is not needed}

**Reference:**
- Existing implementation: `src/{file}`
- Parent story research: `{story-id}`

**Approved by:** {if required}
```

---

## 6. Traceability

### 6.1 Research-to-Handoff Mapping

| Research Document | Handoff | Story |
|-------------------|---------|-------|
| `_bmad-output/research/{file}` | `handoff-{YYYY-MM-DD}.md` | {epic}-{story} |

### 6.2 Handoff-to-Story Mapping

```yaml
handoffs:
  - handoff_id: "H-{YYYY-MM-DD}-{agent}"
    story_id: "{epic}-{story}"
    research_artifacts:
      - "_bmad-output/research/{file}"
    validated: true | false
```

---

## 7. Related Documents

| Document | Purpose |
|----------|---------|
| [`mcp-research-enforcement-checklist-2025-12-26.md`](mcp-research-enforcement-checklist-2025-12-26.md) | Core enforcement checklist |
| [`mcp-guidelines-by-mode-2025-12-26.md`](mcp-guidelines-by-mode-2025-12-26.md) | Mode-specific guidelines |
| [`mcp-research-template-2025-12-26.md`](mcp-research-template-2025-12-26.md) | Research documentation template |
| [`.agent/rules/general-rules.md`](.agent/rules/general-rules.md) | Base MCP Research Protocol |

---

**Effective Date:** 2025-12-26  
**Governance Owner:** @bmad-bmm-pm  
**Review Cycle:** Monthly
