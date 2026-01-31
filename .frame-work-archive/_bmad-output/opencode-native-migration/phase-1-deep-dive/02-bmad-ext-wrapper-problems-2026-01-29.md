---
artifact_id: "phase1.2-bmad-ext-wrapper-problems-2026-01-29"
artifact_type: "analysis"
version: "1.0.0"
status: "ACTIVE"
date: "2026-01-29"
created_by: "ext-master"
phase: "1.2"
---

# Phase 1.2: _bmad-ext Wrapper Problems

## Executive Summary

**Problem**: 7-layer indirection, 450,189 lines, 35.4% context overhead.

## Core Problems

### 1. Confusing Hierarchy

**Problem**: Wrappers in wrappers, agents don't know where they are.

**Evidence**:
```
You → OpenCode → .opencode/instructions (references BMAD)
                   → _bmad/ (BMAD Core - 128K lines)
                     → _bmad-ext/ (Extensions - 450K lines)
                       → modules/ → workflows/ → steps/
                         → 7+ layers before work
```

**Impact**: Agents get lost in the hierarchy.

### 2. Too Much Jumping Around

**Problem**: No clear flow, agents jump between modules.

**Evidence**:
- 5 modules with 14,306 directories
- 7 agent definitions
- 82 skills at 31% utilization
- No clear delegation path

**Impact**: Context poisoning from jumping around.

### 3. Context Window Hell

**Problem**: Too much which LLMs give a fuck of reading what.

**Evidence**:
- 35.4% context overhead
- 1,500 lines loaded before task
- 450,189 lines of wrapper code
- 1,707 files to navigate

**Impact**: Agents can't find what they need.

### 4. Context Poisoning

**Problem**: No separation between artifact types.

**Evidence**:
- All sorts of archiving
- Wanting to do many things while not filtering out
- No metadata, no IDs, no frontmatter
- Waste time on text rather than values

**Impact**: Poisoned context leads to hallucinations.

### 5. No Separation of Concerns

**Problem**: All artifacts treated the same.

**Evidence**:
- No TTL system
- No validation status
- No artifact types
- No freshness checks

**Impact**: Stale artifacts poison context.

## What OpenCode Native Fixes

### Flat Structure

```
You → OpenCode → .opencode/agents/         (Direct agent definitions)
              → .opencode/skills/          (10 focused skills max)
              → .opencode/hooks/           (Enforcement - runs automatically)
              → .opencode/instructions/    (50 lines max, no nesting)
```

### Key Improvements

| Aspect | BMAD Framework | OpenCode Native |
|--------|----------------|-----------------|
| Context Load | ~1,500 lines | ~200 lines |
| Wrapper Depth | 7 layers | 2 layers max |
| Skill Discovery | 82 to search | 10 directly available |
| Authority Sources | 5 (conflicts) | 1 (no conflicts) |
| Enforcement | Honor system | Hook-based (automatic) |

## Next Steps

1. ✅ Wrapper problems identified
2. ⏭️ Phase 1.3: LLM context failures
3. ⏭️ Phase 2: OpenCode Native design

---

**Status**: COMPLETE
**Next**: Phase 1.3