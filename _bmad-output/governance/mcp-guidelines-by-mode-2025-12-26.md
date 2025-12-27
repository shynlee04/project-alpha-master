# MCP Guidelines by Mode

**Document ID:** `MCP-GUIDELINES-BY-MODE-2025-12-26`  
**Version:** 1.0  
**Classification:** P1 - Governance  
**Base Protocol:** [`.agent/rules/general-rules.md`](.agent/rules/general-rules.md)

---

## 1. Overview

This document defines MCP research requirements for each BMAD agent mode. Different modes have different research needs based on their responsibilities.

**Base Protocol:** The 4-step MCP Research Protocol from `.agent/rules/general-rules.md`

---

## 2. Mode-Specific Research Requirements

### 2.1 @bmad-core-bmad-master (Orchestrator)

**Research Trigger:** Epic-level decisions affecting multiple workstreams

| Priority | When | MCP Steps |
|----------|------|-----------|
| HIGH | New epic definition | All 4 steps |
| MEDIUM | Cross-epic dependencies | Steps 2, 3, 4 |
| LOW | Routine delegation | Steps 3, 4 |

**Focus Areas:**
- Architecture patterns across epics
- Dependency analysis between stories
- Platform coordination strategies

---

### 2.2 @bmad-bmm-analyst (Requirements Analyst)

**Research Trigger:** Breaking down new features into stories

| Priority | When | MCP Steps |
|----------|------|-----------|
| HIGH | New library/pattern introduction | Steps 1, 2 |
| MEDIUM | Cross-module features | Steps 2, 3 |
| LOW | Incremental stories | Step 4 |

**Focus Areas:**
- API documentation for new dependencies
- Architecture patterns for integration
- Codebase structure for proper decomposition

---

### 2.3 @bmad-bmm-architect (System Design)

**Research Trigger:** Design decisions and ADRs

| Priority | When | MCP Steps |
|----------|------|-----------|
| HIGH | New architectural pattern | All 4 steps (mandatory) |
| HIGH | Cross-cutting concern | All 4 steps (mandatory) |
| MEDIUM | Component-level design | Steps 1, 2, 3 |

**Focus Areas:**
- Deepwiki architecture decisions (Step 2)
- Best practices and patterns (Step 3)
- Current codebase patterns (Step 4)

---

### 2.4 @bmad-bmm-dev (Development) ⚠️ CRITICAL

**Research Trigger:** IMPLEMENTATION OF ANY NEW PATTERN

| Priority | When | MCP Steps |
|----------|------|-----------|
| **MANDATORY** | New library/dependency | **All 4 steps** |
| **MANDATORY** | Unfamiliar pattern | **All 4 steps** |
| **MANDATORY** | Cross-module integration | **All 4 steps** |
| HIGH | External API integration | All 4 steps |
| MEDIUM | Security-critical code | Steps 1, 2, 3 |

**Dev Mode Golden Rules:**
1. **NEVER** implement without completing MCP research
2. **ALWAYS** reference existing patterns in codebase
3. **VERIFY** implementation against official docs
4. **DOCUMENT** findings in handoff for next agent

**Pre-Coding Checklist:**
```
□ Identify unfamiliar patterns
□ Complete Context7 docs lookup
□ Complete Deepwiki architecture review
□ Complete Tavily/Exa best practices search
□ Complete Repomix codebase analysis
□ Document implementation approach
□ Create/update handoff with research
```

---

### 2.5 @bmad-bmm-pm (Product Manager)

**Research Trigger:** Backlog planning and sprint management

| Priority | When | MCP Steps |
|----------|------|-----------|
| MEDIUM | New feature estimation | Steps 2, 3 |
| LOW | Sprint capacity planning | Step 4 |
| MEDIUM | Dependency identification | Steps 2, 4 |

**Focus Areas:**
- Existing codebase patterns (Step 4)
- Architecture constraints (Step 2)
- Best practices for estimation (Step 3)

---

### 2.6 @bmad-bmm-sm (Sprint Master)

**Research Trigger:** Story creation and sprint tracking

| Priority | When | MCP Steps |
|----------|------|-----------|
| MEDIUM | Story breakdown with new patterns | Steps 2, 3 |
| LOW | Routine sprint ceremonies | Optional |
| MEDIUM | Dependency mapping | Step 4 |

**Focus Areas:**
- Architecture patterns (Step 2)
- Codebase structure (Step 4)
- Best practices for story sizing (Step 3)

---

### 2.7 @bmad-bmm-tea (Test Engineer)

**Research Trigger:** Test strategy and automation

| Priority | When | MCP Steps |
|----------|------|-----------|
| HIGH | New testing library | Steps 1, 2 |
| MEDIUM | Test pattern implementation | Steps 1, 3 |
| LOW | Routine test updates | Optional |

**Focus Areas:**
- Testing library docs (Step 1)
- Testing patterns and best practices (Step 3)
- Existing test patterns (Step 4)

---

### 2.8 @bmad-bmm-tech-writer (Technical Writer)

**Research Trigger:** Documentation creation

| Priority | When | MCP Steps |
|----------|------|-----------|
| LOW | Routine documentation | Optional |
| MEDIUM | New API documentation | Steps 1, 2 |
| LOW | Template updates | Optional |

**Focus Areas:**
- API documentation (Step 1)
- Architecture decisions (Step 2)

---

### 2.9 @bmad-bmm-ux-designer (UX Designer)

**Research Trigger:** UI/UX design and design system

| Priority | When | MCP Steps |
|----------|------|-----------|
| HIGH | New design library | Steps 1, 2 |
| MEDIUM | Component patterns | Steps 1, 3 |
| LOW | Design token updates | Optional |

**Focus Areas:**
- Design system documentation (Step 1)
- Component patterns (Step 2)
- Best practices (Step 3)

---

### 2.10 @bmad-bmm-quick-flow-solo-dev (Quick Fix Dev)

**Research Trigger:** Fast-track bug fixes

| Priority | When | MCP Steps |
|----------|------|-----------|
| LOW | Trivial fixes (< 10 lines) | Optional (exempt) |
| MEDIUM | Non-trivial fixes | Steps 3, 4 |
| HIGH | Security-related fixes | Steps 1, 2, 3 |

**Exemption Criteria:**
- Fix is < 10 lines
- Fix follows existing pattern exactly
- No new libraries or patterns introduced

**Documentation Required for Exemption:**
```markdown
### MCP Research Exemption

**Fix Type:** ☐ Trivial | ☐ Pattern match | ☐ Security

**Justification:**
- Line count: {n}
- Existing pattern: `src/{file}`
- No new patterns introduced
```

---

### 2.11 @code-reviewer (Code Reviewer)

**Research Trigger:** Quality gates and security review

| Priority | When | MCP Steps |
|----------|------|-----------|
| HIGH | New pattern detected | Verify all 4 steps |
| MEDIUM | Cross-module changes | Verify Steps 2, 4 |
| LOW | Routine changes | Verify Step 4 |

**Review Checkpoint:**
```
□ MCP research documented in handoff
□ Implementation matches documented approach
□ No unresearched patterns detected
□ Known risks addressed
```

---

### 2.12 CIS Modes (Creative/Innovation)

| Mode | Research Trigger | MCP Steps |
|------|------------------|-----------|
| @bmad-cis-brainstorming-coach | New concepts | Steps 2, 3 (optional) |
| @bmad-cis-creative-problem-solver | Complex problems | Steps 2, 3 (recommended) |
| @bmad-cis-design-thinking-coach | Design sessions | Optional |
| @bmad-cis-innovation-strategist | Strategic planning | Steps 2, 3 (recommended) |
| @bmad-cis-presentation-master | Presentation decks | Optional |
| @bmad-cis-storyteller | Feature narratives | Optional |

---

## 3. Quick Reference Table

| Mode | MCP Required | Primary Focus | Exemption |
|------|--------------|---------------|-----------|
| Orchestrator | Sometimes | Architecture | No |
| Analyst | Sometimes | Requirements | No |
| Architect | Always | Design | No |
| **Dev** | **ALWAYS** | **Implementation** | **Limited** |
| PM | Sometimes | Planning | No |
| SM | Sometimes | Stories | No |
| TEA | Sometimes | Testing | No |
| Tech Writer | Rarely | Docs | Yes |
| UX Designer | Sometimes | UI/UX | Yes |
| Quick Dev | Rarely | Fast fixes | Yes |
| Code Reviewer | Verification | Quality | N/A |

---

## 4. Common Patterns by Mode

### 4.1 When Dev Mode MUST Research

| Pattern | Example | Research Required |
|---------|---------|------------------|
| New library | `@tanstack/ai`, `zod` | ✅ All 4 steps |
| New integration | WebContainer + File System | ✅ All 4 steps |
| New state management | Zustand store creation | ✅ All 4 steps |
| New API pattern | Provider adapter | ✅ All 4 steps |
| UI component library | Radix UI new component | ✅ All 4 steps |
| Security implementation | Credential storage | ✅ All 4 steps |

### 4.2 When Dev Mode Can Skip (with exemption)

| Pattern | Example | Exemption Criteria |
|---------|---------|-------------------|
| CSS tweaks | Tailwind class adjustment | < 5 lines, no new patterns |
| Simple bug fix | Null check addition | < 10 lines |
| Text updates | Translation strings | No code changes |
| Comment updates | Documentation only | No functional changes |

---

## 5. Related Documents

| Document | Purpose |
|----------|---------|
| [`mcp-research-enforcement-checklist-2025-12-26.md`](mcp-research-enforcement-checklist-2025-12-26.md) | Core enforcement checklist |
| [`handoff-mcp-validation-2025-12-26.md`](handoff-mcp-validation-2025-12-26.md) | Handoff validation |
| [`mcp-research-template-2025-12-26.md`](mcp-research-template-2025-12-26.md) | Research documentation template |
| [`.agent/rules/general-rules.md`](.agent/rules/general-rules.md) | Base MCP Research Protocol |

---

**Effective Date:** 2025-12-26  
**Governance Owner:** @bmad-bmm-pm  
**Review Cycle:** Monthly
