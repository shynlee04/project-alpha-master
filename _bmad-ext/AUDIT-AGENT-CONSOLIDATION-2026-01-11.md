# BMAD Agent System Audit & Consolidation Plan

**Created**: 2026-01-11
**Status**: READY FOR IMPLEMENTATION
**Purpose**: Audit old vs new agent systems, provide consolidation roadmap

---

## Executive Summary

**Problem**: Two parallel agent systems exist:
- **OLD**: `.claude/agents/` - Loaded by Claude Code, token-heavy (~100KB)
- **NEW**: `_bmad-ext/modules/` - Hop-reading architecture, NOT loaded by Claude Code

**Root Cause**: Claude Code only loads agents from `.claude/agents/` - it doesn't know about `_bmad-ext/modules/`

**Impact**:
- ~100KB of verbose agents loaded on every session
- New efficient agents unused
- Parallel maintenance burden
- Context pollution from redundant agents

---

## Part 1: Old System Audit (`.claude/agents/`)

### Inventory by Size

| Agent | Size | Status | Used In |
|-------|------|--------|---------|
| component-splitter.md | 11K | ACTIVE | Ralph Loop, architecture-remediation |
| file-sync-specialist.md | 9.3K | ACTIVE | File sync issues |
| workspace-architect.md | 6.6K | ACTIVE | Workspace E2E implementation |
| unified-analyzer.md | 5.9K | ? | Unclear - appears redundant |
| store-refactorer-loader.md | 5.1K | ACTIVE | God store remediation |
| **bmad-analysis/** | ~17K | PARTIAL | BMM workflows |
| **bmad-planning/** | ~26K | PARTIAL | BMM workflows |
| **bmad-research/** | ~7K | PARTIAL | ADO workflows |
| **bmad-review/** | ~14K | PARTIAL | Code review |

**Total**: ~100KB across 21 files

### Usage Analysis (from grep)

```
Referenced in active plans:
- component-splitter: ✅ Active (jiggly-giggling-waterfall.md)
- store-refactorer: ✅ Active (cheerful-popping-aurora.md)
- workspace-architect: ✅ Active (index.yaml priority 83)
- file-sync-specialist: ✅ Active (index.yaml priority - not direct)

BMM sub-agents (loaded internally by BMM workflows):
- bmad-analysis/*: Used by BMM codebase-analyzer
- bmad-planning/*: Used by BMM planning workflows
- bmad-research/*: Used by ADO research
- bmad-review/*: Used by code review workflows
```

### Token Efficiency Problem

Old agents are **prose-heavy** with embedded instructions:
- Full descriptions embedded in every file
- No frontmatter-only loading
- No hop-reading pattern
- Entire file loaded even when only metadata needed

Example: `codebase-analyzer.md` (4.3KB)
- Full methodology embedded
- Complete discovery techniques
- All output formats specified
- Loaded even for simple "what files exist" queries

---

## Part 2: New System Audit (`_bmad-ext/modules/`)

### Module Inventory

| Module | Phase | Status | Agents | Workflows |
|--------|-------|--------|--------|-----------|
| governance | 0 | ACTIVE | 0 | 3 workflows |
| arc-v2 | 0 | ACTIVE | 2 agents | 1 workflow |
| sprint-planning-wrapper | 2 | ACTIVE | 3 scanners | 1 workflow |
| implementation | 4 | ACTIVE | 0 | 2 workflows |

### Agent Quality Comparison

**OLD**: `bmad-analysis/codebase-analyzer.md` (4.3KB)
```yaml
name: bmm-codebase-analyzer
description: Performs comprehensive codebase analysis...
[83 lines of prose methodology]
```

**NEW**: `arc-v2/agents/domain-scanner.md` (7.5KB)
```yaml
---
name: "domain-scanner"
description: "6-Domain Targeted Scanner"
version: "1.0.0"
type: "diagnostic"
domains:
  - persistence
  - sync
  - state
  - routing
  - agents
  - ux
---
[Structured scan protocols]
[Thresholds in YAML]
[Output format in YAML]
[Integration points defined]
```

**Key Difference**: New agents have:
- Proper frontmatter for metadata-only loading
- Structured protocols (not prose)
- Clear integration points
- TTL-based artifact registration

### Why New Agents Aren't Loaded

1. **Location**: `_bmad-ext/modules/arc-v2/agents/` not `.claude/agents/`
2. **No Registration**: Not in `.claude/agents/` directory
3. **Command-Only**: Only accessible via commands (`/bmad-ext`)

---

## Part 3: Functional Overlap Analysis

### Capability Mapping

| Function | Old Agent | New Equivalent | Gap |
|----------|-----------|----------------|-----|
| Codebase analysis | bmad-analysis/* | arc-v2/domain-scanner | New is 6-domain specific |
| Architecture scanning | unified-analyzer | arc-v2/domain-scanner | New has thresholds |
| Store refactoring | store-refactorer | Not yet created | Needs creation |
| Component splitting | component-splitter | Not yet created | Needs creation |
| File sync issues | file-sync-specialist | arc-v2/domain-scanner (sync) | Partial overlap |
| Sprint planning | bmad-planning/* | sprint-planning-wrapper | New has cohesion check |
| Implementation | dev-story workflow | implementation/story-cycle | New has validation gates |
| Governance | None | governance/* | NEW - no old equivalent |

### Critical Gaps (New → Old)

| Gap | Impact | Priority |
|-----|--------|----------|
| store-refactorer equivalent | High - god store remediation active | P0 |
| component-splitter equivalent | High - god component remediation active | P0 |
| workspace-architect equivalent | Medium - FS-E2E pending | P1 |

### New Capabilities (No Old Equivalent)

| Capability | Value | Status |
|------------|-------|--------|
| Self-governance with TTL | Prevents context poisoning | Ready |
| Context validation | Pre-execution checks | Ready |
| Cohesion scanning | Sprint quality | Ready |
| Artifact registry | Track output freshness | Ready |

---

## Part 4: Consolidation Recommendations

### Option A: Full Migration (Recommended)

**Strategy**: Migrate `_bmad-ext/modules/` agents to `.claude/agents/` with hop-reading architecture

**Steps**:
1. Create `.claude/agents/bmad-ext/` directory structure
2. Copy MODULE.md files as agent loaders (frontmatter only)
3. Create lightweight agent proxies for each actual agent
4. Archive old agents to `.claude/.archive/2026-01-11-legacy/`
5. Update command registry paths

**Benefits**:
- ~70% token reduction (frontmatter-only loading)
- Single source of truth
- Governance integration
- TTL-based artifact management

**Effort**: 2-3 hours

---

### Option B: Bridge/Loader Agent

**Strategy**: Create a single loader agent that compiles `_bmad-ext/` agents on-demand

**Implementation**:
```
.claude/agents/bmad-ext-loader.md
  ├─ Reads _bmad-ext/modules/*/MODULE.md (frontmatter only)
  ├─ Builds agent registry in memory
  └─ Delegates to appropriate agent on invocation
```

**Benefits**:
- Minimal changes to `.claude/agents/`
- Can be deployed incrementally
- Preserves `_bmad-ext/` as source of truth

**Drawbacks**:
- Extra indirection layer
- Still requires migration for full efficiency

**Effort**: 1-2 hours

---

### Option C: Create Missing Agents Only

**Strategy**: Create `store-refactorer` and `component-splitter` equivalents in `_bmad-ext/`, then migrate

**Steps**:
1. Create `_bmad-ext/modules/arc-v2/agents/store-refactorer.md`
2. Create `_bmad-ext/modules/arc-v2/agents/component-splitter.md`
3. Create `_bmad-ext/modules/arc-v2/agents/workspace-architect.md`
4. Then proceed with Option A

**Benefits**:
- Ensures feature parity before migration
- Safer - no capability loss

**Effort**: 3-4 hours (includes agent creation)

---

## Part 5: Recommended Implementation Plan

### Phase 1: Create Missing Agents (1 hour)

```
_bmad-ext/modules/arc-v2/agents/
├── store-refactorer.md      # Migrate from .claude/agents/
├── component-splitter.md    # Migrate from .claude/agents/
└── workspace-architect.md   # Migrate from .claude/agents/
```

### Phase 2: Create Agent Loader (30 minutes)

```
.claude/agents/bmad-ext.md
  # Frontmatter-only loader that:
  # 1. Lists all available modules
  # 2. Provides shorthand paths
  # 3. Loads MODULE.md frontmatter on demand
```

### Phase 3: Archive Old Agents (15 minutes)

```
.claude/.archive/2026-01-11-old-agents/
├── bmad-analysis/
├── bmad-planning/
├── bmad-research/
├── bmad-review/
├── component-splitter.md
├── file-sync-specialist.md
├── store-refactorer-loader.md
├── unified-analyzer.md
└── workspace-architect.md
```

### Phase 4: Update Command Registry (15 minutes)

Update `.claude/commands/index.yaml` to reference new agent paths

---

## Part 6: Token Savings Estimate

### Current (Old System)
- Session start: ~100KB loaded (all agents full content)
- Per-command: 0KB (already loaded)

### After (New System with Hop-Reading)
- Session start: ~5KB (frontmatter only)
- Per-command: ~10-20KB (load full agent on demand)

**Savings**: ~80-90% on session start, similar per-command after first invocation

---

## Decision Matrix

| Factor | Option A | Option B | Option C |
|--------|----------|----------|----------|
| Token efficiency | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Implementation time | Medium | Short | Long |
| Risk level | Low | Low | Very Low |
| Feature parity | Needs agents | Needs agents | Complete |
| Long-term maintainability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

**Recommendation**: Option C (Create missing agents first) → Option A (Full migration)

---

## Next Steps

1. **Choose option**: Confirm which approach to take
2. **Create missing agents**: If Option C
3. **Execute migration**: Move to `.claude/agents/bmad-ext/`
4. **Test**: Verify agents load and work correctly
5. **Archive**: Move old agents to archive
6. **Update commands**: Fix all path references

---

**Document Version**: 1.0.0
**Created**: 2026-01-11
**Ready For**: User decision and implementation
