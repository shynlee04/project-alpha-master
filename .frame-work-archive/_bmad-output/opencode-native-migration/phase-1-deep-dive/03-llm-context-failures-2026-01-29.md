---
artifact_id: "phase1.3-llm-context-failures-2026-01-29"
artifact_type: "analysis"
version: "1.0.0"
status: "ACTIVE"
date: "2026-01-29"
created_by: "ext-master"
phase: "1.3"
---

# Phase 1.3: LLM Context Failures

## Executive Summary

**Problem**: Stateless + No memory = Protocols forgotten after compact.

## Core Problems

### 1. Context Received Through API

**Problem**: As an LLM, what context I receive through API causes difficulty following context.

**Evidence**:
- 35.4% context overhead
- 1,500 lines loaded before task
- No filtering mechanism
- Too much noise, no filtering

**Impact**: Can't find what's important.

### 2. OpenCode AutoRun Hallucinations

**Problem**: When OpenCode starts autorun (or when I run `compact` commands), I start hallucinating.

**Evidence**:
- Not knowing where are the anchoring context
- Not knowing my roles anymore
- Lost track of what is more important
- Lost track of iterations and delegations of multi-level works

**Impact**: Hallucinations from context poisoning.

### 3. No Filtering Mechanism

**Problem**: Too much noise, no filtering mechanism of preventing context poisoning.

**Evidence**:
- All artifacts loaded every time
- No metadata, no IDs, no frontmatter
- No TTL system
- No validation status

**Impact**: Poisoned context leads to hallucinations.

### 4. Stateless + No Memory

**Problem**: Protocols forgotten after compact.

**Evidence**:
- After compact, lost protocols
- No state persistence
- No memory of previous context
- No way to resume work

**Impact**: Can't continue work after compact.

## The 5 Principles for OpenCode Native

### Principle 1: LESS IS MORE

- Max 200 lines of pre-loaded context
- Max 10 skills per agent type
- Max 1 authority source
- Max 50 lines for state injection

### Principle 2: ENFORCE, DON'T DOCUMENT

- Pre-commit hooks that fail
- Validation scripts that block
- No governance gates that rely on memory
- No optional compliance

### Principle 3: STATE OVER PROSE

- Current state in JSON, not markdown
- Parseable, not readable
- Injected, not loaded
- Short, not comprehensive

### Principle 4: FLAT OVER NESTED

- No wrapper agents
- No multi-level delegation
- Direct tool access
- Simple return values

### Principle 5: VERIFY OR REJECT

- Sub-agent results must be verifiable
- If can't verify → don't trust
- Automated checks over manual review
- Fail fast, recover explicitly

## What OpenCode Native Fixes

### Context Management

| Aspect | BMAD Framework | OpenCode Native |
|--------|----------------|-----------------|
| Context Load | ~1,500 lines | ~200 lines |
| After Compact | Lost protocols | Injected state |
| Artifact Loading | All artifacts | On-demand only |
| Validation | Manual | Automatic hooks |

### State Management

| Aspect | BMAD Framework | OpenCode Native |
|--------|----------------|-----------------|
| State Format | Markdown | JSON/YAML |
| Persistence | Lost after compact | Injected into continuation |
| Memory | None | State injection |
| Resume | Can't continue | Can resume work |

## Next Steps

1. ✅ LLM context failures identified
2. ⏭️ Phase 2: OpenCode Native design
3. ⏭️ Create agent files that work

---

**Status**: COMPLETE
**Next**: Phase 2