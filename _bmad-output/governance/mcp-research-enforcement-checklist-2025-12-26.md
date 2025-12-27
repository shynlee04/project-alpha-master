# MCP Research Protocol Enforcement Checklist

**Document ID:** `MCP-ENFORCEMENT-CHECKLIST-2025-12-26`  
**Version:** 1.0  
**Classification:** P0 - Governance  
**Base Protocol:** [`.agent/rules/general-rules.md`](.agent/rules/general-rules.md)

---

## 1. Protocol Overview

This checklist enforces the **4-Step Mandatory MCP Research Protocol** defined in `.agent/rules/general-rules.md`. All agents MUST complete these steps before implementing unfamiliar patterns or using new libraries.

**Base Protocol Reference:** The foundational protocol specifies:
1. **Context7**: Query library documentation for API signatures
2. **Deepwiki**: Check repo wikis for architecture decisions
3. **Tavily/Exa**: Search for 2025 best practices
4. **Repomix**: Analyze current codebase structure

---

## 2. Pre-Implementation Gate

### 2.1 Gate Activation Criteria

Implement this gate when ANY of the following apply:

| Trigger | Description | Action Required |
|---------|-------------|-----------------|
| New Library | First-time use of external dependency | Full 4-step protocol |
| New Pattern | Implementing unfamiliar architectural pattern | Full 4-step protocol |
| Cross-Module Integration | Connecting components across module boundaries | Full 4-step protocol |
| Security-Critical Code | Auth, encryption, permission handling | Full 4-step protocol + Security review |
| External API Integration | Third-party service calls | Full 4-step protocol |

### 2.2 Gate Validation Checklist

Before writing any code, verify:

```
□ Identify unfamiliar patterns/libraries
□ Document research questions to answer
□ Complete Context7 documentation lookup
□ Complete Deepwiki architecture review
□ Complete Tavily/Exa best practices search
□ Complete Repomix codebase analysis
□ Summarize findings in research document
□ Share findings with team (if applicable)
□ Proceed with implementation
```

---

## 3. 4-Step Protocol Details

### Step 1: Context7 Documentation Lookup

**Purpose:** Obtain official API signatures and usage patterns

**When to Use:**
- New library introduction
- API version upgrades
- Pattern migration (e.g., TanStack Store → Zustand)

**Validation Criteria:**
- [ ] Library ID resolved via `mcp--context7--resolve-library-id`
- [ ] API documentation retrieved via `mcp--context7--get-library-docs`
- [ ] Key interfaces documented
- [ ] Error handling patterns identified

**Output Documentation:**
```
## Context7 Research Results

**Library:** {library-name}
**Context7 ID:** {resolved-id}
**Documentation Mode:** code | info

### Key API Signatures
- {interface/function name}: {signature}

### Critical Patterns
- {pattern description}

### Error Handling
- {error types and handling approach}
```

---

### Step 2: Deepwiki Architecture Review

**Purpose:** Check repository wikis for community-validated patterns and architecture decisions

**When to Use:**
- Complex integration scenarios
- Ecosystem libraries (TanStack, WebContainer, xterm.js)
- Architecture validation

**Validation Criteria:**
- [ ] Repository wiki structure reviewed
- [ ] Architecture decision records (ADRs) found
- [ ] Integration patterns documented
- [ ] Known issues/limitations identified

**Required Repo Links for Core Dependencies:**
```
TanStack AI:      https://deepwiki.com/TanStack/ai
WebContainer API: https://deepwiki.com/stackblitz/webcontainer-api
Dexie.js:         https://deepwiki.com/dexie/dexie.js
xterm.js:         https://deepwiki.com/xtermjs/xterm.js
Monaco Editor:    https://deepwiki.com/microsoft/monaco-editor
Zustand:          https://deepwiki.com/pmndrs/zustand
```

---

### Step 3: Tavily/Exa Best Practices Search

**Purpose:** Discover 2025 community best practices and real-world implementations

**When to Use:**
- Before implementing complex patterns
- After Context7 but before coding
- When multiple implementation approaches exist

**Validation Criteria:**
- [ ] Search query formulated for specific implementation need
- [ ] Results retrieved and analyzed
- [ ] 2025 patterns identified
- [ ] Anti-patterns documented

**Tool Selection:**
| Tool | Use Case | Query Type |
|------|----------|------------|
| Tavily | General web search | "TanStack AI tool execution 2025 patterns" |
| Exa | Code-specific search | "React component streaming implementation" |
| Exa-code | Library/SDK queries | "Zustand middleware pattern examples" |

---

### Step 4: Repomix Codebase Analysis

**Purpose:** Analyze current codebase structure for integration patterns and avoid duplication

**When to Use:**
- Before adding new components
- Before creating new stores/state
- Before implementing cross-cutting concerns

**Validation Criteria:**
- [ ] Relevant modules analyzed
- [ ] Existing patterns identified
- [ ] Integration points mapped
- [ ] Duplication risks assessed

**Analysis Commands:**
```bash
# Pack relevant module
mcp--repomix--pack_codebase --directory ./src/lib/{module} --style xml

# Analyze for patterns
mcp--repomix--grep_repomix_output --outputId {id} --pattern {pattern}
```

---

## 4. Enforcement Mechanism

### 4.1 Story Acceptance Criteria Addition

All stories MUST include:

```markdown
## MCP Research Protocol

- [ ] MCP research completed before implementation
- [ ] Research findings documented in {_bmad-output/research/}
- [ ] Pattern validated against existing codebase
- [ ] Integration approach confirmed
```

### 4.2 Code Review Checkpoints

Code reviewers MUST verify:

```
□ New imports checked against MCP research
□ Pattern implementation matches documented approach
□ Integration points align with codebase structure
□ Known issues from research addressed
```

### 4.3 Handoff Document Validation

See [`handoff-mcp-validation-2025-12-26.md`](handoff-mcp-validation-2025-12-26.md) for handoff integration.

---

## 5. Violation Detection & Remediation

### 5.1 Detection Triggers

| Signal | Investigation Required |
|--------|----------------------|
| Pattern mismatch with official docs | Check Step 1 (Context7) completion |
| Architecture inconsistency | Check Step 2 (Deepwiki) completion |
| Outdated implementation approach | Check Step 3 (Tavily/Exa) completion |
| Code duplication / integration issues | Check Step 4 (Repomix) completion |

### 5.2 Remediation Workflow

```
1. Identify which step was skipped
2. Complete missing research step(s)
3. Document findings in _bmad-output/research/
4. Update implementation if needed
5. Log course correction if pattern changed
```

---

## 6. Compliance Reporting

### 6.1 Sprint Audit Checklist

Weekly, review completed stories for MCP compliance:

```yaml
stories_reviewed:
  - story_id: "XX-Y"
    mcp_research_completed: true | false
    research_document: "_bmad-output/research/{file}"
    violations: ["Step-1", "Step-3"]
```

### 6.2 Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Research completion rate | 100% | < 95% |
| Violation incidents per sprint | 0 | > 2 |
| Remediation time (hours) | < 2 | > 4 |

---

## 7. Related Documents

| Document | Purpose |
|----------|---------|
| [`.agent/rules/general-rules.md`](.agent/rules/general-rules.md) | Base MCP Research Protocol |
| [`handoff-mcp-validation-2025-12-26.md`](handoff-mcp-validation-2025-12-26.md) | Handoff validation |
| [`mcp-guidelines-by-mode-2025-12-26.md`](mcp-guidelines-by-mode-2025-12-26.md) | Mode-specific guidelines |
| [`mcp-research-template-2025-12-26.md`](mcp-research-template-2025-12-26.md) | Research documentation template |
| [`status-update-procedure-2025-12-26.md`](status-update-procedure-2025-12-26.md) | Story completion criteria |

---

**Enforcement Effective Date:** 2025-12-26  
**Governance Owner:** @bmad-bmm-pm  
**Review Cycle:** Monthly
