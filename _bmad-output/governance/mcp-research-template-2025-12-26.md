# MCP Research Documentation Template

**Document ID:** `{research}-{YYYY-MM-DD}`  
**Version:** 1.0  
**Classification:** Research  
**Base Protocol:** [`.agent/rules/general-rules.md`](.agent/rules/general-rules.md)

---

## Research Metadata

| Field | Value |
|-------|-------|
| **Research ID** | `{research-id}-{YYYY-MM-DD}` |
| **Story Reference** | `{epic}-{story}` |
| **Agent Mode** | `{mode-slug}` |
| **Created** | `{YYYY-MM-DD HH:mm}` |
| **Status** | ☐ In Progress | ☐ Complete | ☐ Archived |

---

## 1. Research Question

**Primary Question:**
{What are you trying to learn?}

**Secondary Questions:**
- {Question 1}
- {Question 2}
- {Question 3}

---

## 2. Research Triggers

☐ New library/dependency introduction  
☐ Unfamiliar architectural pattern  
☐ Cross-module integration  
☐ External API integration  
☐ Security-critical implementation  
☐ Performance optimization  
☐ Other: {specify}

---

## 3. MCP Research Results

### Step 1: Context7 Documentation

| Field | Value |
|-------|-------|
| **Library/Dependency** | {library-name} |
| **Context7 ID** | {resolved-id} |
| **Documentation Mode** | code \| info |
| **Key API Signatures** | |

```typescript
// Copy relevant API signatures here
```

**Critical Patterns:**
- {pattern 1}
- {pattern 2}

**Error Handling:**
- {error types and handling}

---

### Step 2: Deepwiki Architecture Review

**Repository:** {repo-url}  
**Deepwiki URL:** {deepwiki-url}

**Architecture Decision Records (ADRs) Found:**
1. {ADR 1}
2. {ADR 2}

**Integration Patterns:**
- {pattern description}

**Known Issues/Limitations:**
- {issue 1}
- {issue 2}

**Questions Asked & Answers:**

| Question | Answer |
|----------|--------|
| {question 1} | {answer} |
| {question 2} | {answer} |

---

### Step 3: Tavily/Exa Best Practices

| Field | Value |
|-------|-------|
| **Tool Used** | Tavily \| Exa |
| **Search Query** | {query} |
| **Results Analyzed** | {n} |

**2025 Best Practices Found:**

1. **{Practice 1}**
   - Source: {URL}
   - Summary: {description}
   - Applicability: {high | medium | low}

2. **{Practice 2}**
   - Source: {URL}
   - Summary: {description}
   - Applicability: {high | medium | low}

**Anti-Patterns to Avoid:**
- {anti-pattern 1}
- {anti-pattern 2}

---

### Step 4: Repomix Codebase Analysis

**Module Analyzed:** `{src/lib/module}`  
**Output ID:** `{repomix-output-id}`

**Existing Patterns Found:**
- {pattern 1} → `src/{file}:{line}`
- {pattern 2} → `src/{file}:{line}`

**Integration Points:**
- {integration point 1}
- {integration point 2}

**Duplication Risks:**
- {risk 1}
- {risk 2}

**Code Structure Insights:**
- {insight 1}
- {insight 2}

---

## 4. Implementation Guidelines

### Recommended Approach
{Describe the implementation approach based on research}

### Key Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| {decision 1} | {rationale} | {trade-offs} |
| {decision 2} | {rationale} | {trade-offs} |

### Code References

| File | Pattern | Usage |
|------|---------|-------|
| `src/{file}` | {pattern} | {usage} |

---

## 5. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| {risk 1} | {high/med/low} | {high/med/low} | {mitigation} |
| {risk 2} | {high/med/low} | {high/med/low} | {mitigation} |

---

## 6. Related Documents

| Document | Relationship |
|----------|--------------|
| `{file}` | Parent story |
| `{file}` | Architecture doc |
| `{file}` | Previous research |

---

## 7. Research Summary

**Key Findings:**
1. {finding 1}
2. {finding 2}
3. {finding 3}

**Action Items:**
- [ ] {action 1}
- [ ] {action 2}
- [ ] {action 3}

---

## 8. Handoff Integration

**Linked Handoff:** `_bmad-output/{category}/{handoff}-{YYYY-MM-DD}.md`  
**Research Validated:** ☐ Yes | ☐ No  
**Date Validated:** {YYYY-MM-DD}

---

**Template Version:** 1.0  
**Last Updated:** 2025-12-26
