# Agent Migration Plan: _bmad-ext → .claude/agents/

**Created**: 2026-01-11
**Status**: READY FOR EXECUTION
**Purpose**: Migrate new hop-reading agents to Claude Code loadable location

---

## Phase 1: Create Agent Loader (30 minutes)

### Step 1.1: Create `.claude/agents/bmad-ext/` directory

```bash
mkdir -p .claude/agents/bmad-ext
```

### Step 1.2: Create main loader agent

File: `.claude/agents/bmad-ext-loader.md`

```yaml
---
name: bmad-ext-loader
description: Lightweight loader for BMAD Extension Layer agents
version: 1.0.0
---

# BMAD Extension Loader

**Purpose**: Load BMAD extension agents with hop-reading architecture

## Available Modules

| Module | Phase | Agents | Status |
|--------|-------|--------|--------|
| governance | 0 | 0 agents, 3 workflows | Ready |
| arc-v2 | 0 | 5 remediation agents | Ready |
| sprint-planning-wrapper | 2 | 3 scanners, 1 workflow | Ready |
| implementation | 4 | 2 workflows | Ready |

## Load Protocol

1. Load `_bmad-ext/modules/{module}/MODULE.md` (frontmatter only)
2. Parse available agents and workflows
3. On invocation, load full agent content
4. Execute with LOOP_STATE integration

## Quick Start

```bash
# For god store remediation
/load _bmad-ext/modules/arc-v2/agents/store-refactorer.md

# For god component remediation
/load _bmad-ext/modules/arc-v2/agents/component-splitter.md

# For workspace reorganization
/load _bmad-ext/modules/arc-v2/agents/workspace-architect.md
```
```

---

## Phase 2: Create Agent Proxies (15 minutes)

### Step 2.1: Create proxy files in `.claude/agents/`

File: `.claude/agents/bmad-ext-store-refactorer.md`

```yaml
---
name: store-refactorer
description: Zustand store refactoring specialist - loads from _bmad-ext/modules/arc-v2/agents/store-refactorer.md
version: 1.0.0
---

# Store Refactorer (Proxy)

**Full agent**: `_bmad-ext/modules/arc-v2/agents/store-refactorer.md`

## Quick Load

```bash
Load the full agent:
cat _bmad-ext/modules/arc-v2/agents/store-refactorer.md
```

## Purpose

Split god stores (>120 lines) into focused Zustand v5 slices with zero breaking changes.
```

File: `.claude/agents/bmad-ext-component-splitter.md`

```yaml
---
name: component-splitter
description: React component splitting specialist - loads from _bmad-ext/modules/arc-v2/agents/component-splitter.md
version: 1.0.0
---

# Component Splitter (Proxy)

**Full agent**: `_bmad-ext/modules/arc-v2/agents/component-splitter.md`

## Quick Load

```bash
Load the full agent:
cat _bmad-ext/modules/arc-v2/agents/component-splitter.md
```

## Purpose

Split god components (>300 lines) into focused modules with zero breaking changes.
```

File: `.claude/agents/bmad-ext-workspace-architect.md`

```yaml
---
name: workspace-architect
description: File system & architecture specialist - loads from _bmad-ext/modules/arc-v2/agents/workspace-architect.md
version: 1.0.0
---

# Workspace Architect (Proxy)

**Full agent**: `_bmad-ext/modules/arc-v2/agents/workspace-architect.md`

## Quick Load

```bash
Load the full agent:
cat _bmad-ext/modules/arc-v2/agents/workspace-architect.md
```

## Purpose

Maintain 4-layer clean architecture, reorganize files, consolidate cross-workspace code.
```

---

## Phase 3: Archive Old Agents (15 minutes)

### Step 3.1: Create archive directory

```bash
mkdir -p .claude/.archive/2026-01-11-old-agents
```

### Step 3.2: Move old agents to archive

```bash
# Move BMM subdirectories
mv .claude/agents/bmad-analysis .claude/.archive/2026-01-11-old-agents/
mv .claude/agents/bmad-planning .claude/.archive/2026-01-11-old-agents/
mv .claude/agents/bmad-research .claude/.archive/2026-01-11-old-agents/
mv .claude/agents/bmad-review .claude/.archive/2026-01-11-old-agents/

# Move individual agents
mv .claude/agents/component-splitter.md .claude/.archive/2026-01-11-old-agents/
mv .claude/agents/file-sync-specialist.md .claude/.archive/2026-01-11-old-agents/
mv .claude/agents/store-refactorer-loader.md .claude/.archive/2026-01-11-old-agents/
mv .claude/agents/unified-analyzer.md .claude/.archive/2026-01-11-old-agents/
mv .claude/agents/workspace-architect.md .claude/.archive/2026-01-11-old-agents/
```

---

## Phase 4: Update Command Registry (15 minutes)

### Step 4.1: Update `.claude/commands/index.yaml`

Add new commands:

```yaml
# BMAD Extension Commands
- id: bmad-ext-store-refactorer
  name: Store Refactorer
  shorthand: /srefactor
  path: .claude/agents/bmad-ext-store-refactorer.md
  description: Split god stores into focused Zustand slices
  category: remediation
  priority: 80

- id: bmad-ext-component-splitter
  name: Component Splitter
  shorthand: /csplit
  path: .claude/agents/bmad-ext-component-splitter.md
  description: Split god components into focused modules
  category: remediation
  priority: 81

- id: bmad-ext-workspace-architect
  name: Workspace Architect
  shorthand: /wsarch
  path: .claude/agents/bmad-ext-workspace-architect.md
  description: Maintain 4-layer architecture, reorganize files
  category: remediation
  priority: 82
```

---

## Phase 5: Verification (15 minutes)

### Step 5.1: Test agent loading

```bash
# Test store-refactorer
/srefactor

# Test component-splitter
/csplit

# Test workspace-architect
/wsarch
```

### Step 5.2: Verify token savings

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Session start load | ~100KB | ~5KB | ~95% |
| Agent proxies | 0 | ~3KB | New |
| Full agent load | 0 (old preloaded) | ~10KB on demand | Similar |

---

## Rollback Plan

If migration causes issues:

```bash
# Restore old agents
cp -r .claude/.archive/2026-01-11-old-agents/* .claude/agents/

# Remove new agents
rm .claude/agents/bmad-ext-*.md
rm -rf .claude/agents/bmad-ext/

# Restore old command paths
git checkout .claude/commands/index.yaml
```

---

## Post-Migration Tasks

1. Update CLAUDE.md with new agent paths
2. Update AGENTS.md with new agent references
3. Test all three agents with real refactoring tasks
4. Document any issues or improvements needed

---

## Success Criteria

- [ ] All three new agents loadable via commands
- [ ] Old agents archived (not deleted)
- [ ] Token reduction ≥80% on session start
- [ ] Zero breaking changes to existing workflows
- [ ] All commands in index.yaml work correctly

---

**Migration Version**: 1.0.0
**Ready For**: User approval and execution
**Estimated Time**: 90 minutes total
