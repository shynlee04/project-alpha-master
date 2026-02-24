---
name: context-first
description: Load required context before any implementation. Uses document tiering to determine freshness and hierarchy.
---

# Context First

> **MIN Strategy**: Always before implementation

## Core Rule

**Never implement before understanding.** Context loading is mandatory.

## 3-Step Validation Protocol

### Step 1: Dry Reading
Read existing code to understand:
- Current architecture patterns
- Related components and dependencies
- Conventions in similar files

### Step 2: Context Gathering
Load artifacts based on request type:

| Request Type | Context to Load |
|-------------|-----------------|
| New feature | Product requirements, UX specs |
| Extension | Architecture, existing patterns |
| Bug fix | Sprint status, story context |
| Refactoring | Architecture, project truths |
| Documentation | Architecture, existing docs |

### Step 3: Plan Validation
Confirm approach before coding:
- Aligns with project architecture?
- Scope manageable (< 4 hours)?
- Dependencies identified?

## Document Tiering

Documents iterate in tiers - higher tiers govern lower:

```
Tier 1: Governing (Architecture, PRD, AGENTS.md) → Long-lived
   ↓
Tier 2: Planning (Epics, Stories, ADRs) → Sprint-lived
   ↓  
Tier 3: Execution (Tech Specs, Tasks) → Story-lived
   ↓
Tier 4: Ephemeral (Session notes) → Session-lived
```

**Rule**: If Tier 3 conflicts with Tier 1, Tier 1 wins.

## Freshness Thresholds

| Document Type | Stale After |
|--------------|-------------|
| Ephemeral | 30 minutes |
| Execution | 2 hours |
| Planning | 24 hours |
| Governing | Check on major changes only |

## On Violation

```
⛔ CONTEXT FIRST BOUNCE

Attempted: {action}
Missing: {missing_context}
Tier conflict: {if any}

Required: Complete 3-Step Validation before proceeding.
```
