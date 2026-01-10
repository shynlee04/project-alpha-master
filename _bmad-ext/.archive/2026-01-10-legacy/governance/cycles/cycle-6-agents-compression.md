---
id: CYCLE-6
title: AGENTS.md and CLAUDE.md Compression
description: 4-5x compression with index-based navigation
agent_mode: tech-writer
team: A
duration_hours: 3-4
risk_level: HIGH
date: 2026-01-09
---

# CYCLE 6: AGENTS.md + CLAUDE.md Compression

**Agent Mode:** Tech Writer
**Team:** A
**Duration:** 3-4 hours
**Context Poisoning Risk:** HIGH (these files are always loaded)

## OBJECTIVE

Compress AGENTS.md (3,954 lines) and CLAUDE.md (4,133 lines) to <1,000 lines each through:
1. Content deduplication (70% overlap currently)
2. Historical content archival
3. Index-based navigation with links to detailed artifacts
4. Clear "what to do next" sections

## PRECONDITIONS

- [ ] All previous cycles completed (1-5)
- [ ] Architecture.md is current and accurate
- [ ] Sprint-status.yaml is consolidated
- [ ] workflow-status.yaml is using v2 schema

## CURRENT PROBLEMS

```yaml
issues:
  - name: "Massive duplication"
    description: "AGENTS.md and CLAUDE.md share 70% content"
    impact: "Double token consumption"
    
  - name: "Historical pollution"
    description: "Ralph Loop iterations, completed epics inline"
    impact: "Stale context consumed"
    
  - name: "No clear entry point"
    description: "No 'start here' section"
    impact: "Agents consume entire file unnecessarily"
    
  - name: "Status embedded everywhere"
    description: "Epic status duplicated in multiple sections"
    impact: "Conflicting information"
```

## CONTENT REDISTRIBUTION MAP

### AGENTS.md Content Analysis (3,954 lines)

| Section | Lines | Action | Destination |
|---------|-------|--------|-------------|
| Ultra Important (resource mgmt) | 5 | KEEP | Top of file |
| BMAD Framework v2.0 | 174 | EXTRACT | `_bmad/FRAMEWORK.md` |
| Platform Integration | 50 | KEEP | Essential |
| Context Filtering (TTL) | 30 | KEEP | Essential |
| Time-Boxing | 40 | KEEP | Essential |
| Real-World Testing | 30 | KEEP | Essential |
| Architecture Reference | 50 | KEEP | Essential |
| ADR-024 Status | 100 | CONDENSE to 30 | Keep summary |
| Epic 53 Status | 100 | DELETE | Already archived |
| Epic E4 Status | 150 | DELETE | Already complete |
| Project Health (2026-01-05) | 150 | DELETE | Outdated |
| Active Sprint remediation | 100 | DELETE | Superseded |
| ASGL Module | 80 | EXTRACT | `_bmad/modules/asgl/` |
| Deep-Scan Module | 40 | EXTRACT | `_bmad/modules/deep-scan/` |
| ARC Module | 200 | EXTRACT | `_bmad/modules/architecture-remediation/` |
| Platform Unification | 400 | DELETE | Superseded by architecture.md |
| Cornerstone Health | 200 | ARCHIVE | `_bmad-output/governance/health-baseline.md` |
| Implementation Timeline | 100 | DELETE | Outdated |

### CLAUDE.md Content Analysis (4,133 lines)

| Section | Lines | Action | Destination |
|---------|-------|--------|-------------|
| Recent Updates | 70 | KEEP | Top of file |
| File System Architecture | 150 | KEEP | Essential |
| BMAD Framework (duplicate) | 170 | DELETE | Link to AGENTS.md |
| Epic 53 (duplicate) | 100 | DELETE | Already in AGENTS.md |
| Epic E4 (duplicate) | 150 | DELETE | Already in AGENTS.md |
| Health Status (duplicate) | 100 | DELETE | Already in AGENTS.md |
| Active Sprint (duplicate) | 50 | DELETE | Link to sprint-status.yaml |
| All duplicated sections | ~2000 | DELETE | Reference AGENTS.md |

## TARGET STRUCTURE

### AGENTS.md (~800 lines max)

```markdown
# AGENTS.md - Project Alpha Governance

## ⚡ Quick Reference (Always Read)
- **Current Phase:** IMPLEMENTATION
- **Active Epic:** EPIC-FS (28.6%)
- **Next Story:** FS-05
- **Health Score:** 75%
- **Last Updated:** 2026-01-09

## 📍 Navigation Index

| What You Need | Where To Find It |
|---------------|------------------|
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status.yaml` |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` |
| UX Specification | `_bmad-output/planning-artifacts/ux-specification.md` |
| PRD | `_bmad-output/planning-artifacts/prd.md` |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` |
| Standards | `agent-os/standards/` |
| Workflow Status | `bmm-workflow-status.yaml` |

## 🚫 Non-Negotiable Rules (50 lines)
[Critical patterns only - what MUST be followed]

## 🏗️ Architecture Essence (100 lines)
[Clean Architecture paths, Zustand patterns, 8-bit design]

## 📋 Active Work (Link Only)
Sprint details: See `sprint-status.yaml`
Story details: See `stories/STORY-INDEX.md`

## 🔗 Module References
- BMAD Framework: `_bmad/FRAMEWORK.md`
- Governance: `_bmad/modules/governance/`
- Architecture Remediation: `_bmad/modules/architecture-remediation/`

## 📦 Archives
Historical content: `_bmad-output/.archive/`
```

### CLAUDE.md (~600 lines max)

```markdown
# CLAUDE.md - AI Agent Instructions

## Context Loading Priority
1. Read this file first (essential patterns)
2. Read AGENTS.md for project state
3. Load sprint-status.yaml for active work
4. Load story context for specific task

## 📅 Recent Updates (50 lines)
[Last 7 days only - rotate weekly]

## 🗂️ File System Architecture (100 lines)
[Current EPIC-FS status and patterns]

## 🚫 Critical Anti-Patterns (30 lines)
[Quick reference - what NOT to do]

## ✅ Import Patterns (50 lines)
[Canonical paths only]

## 🏗️ Architecture Overview (100 lines)
[High-level only - link to architecture.md for details]

## 📚 Full Reference
For complete project state, see: `AGENTS.md`
For architecture decisions, see: `architecture.md`
```

## EXECUTION STEPS

### Step 1: Extract Module Content

```bash
# Create destination files
mkdir -p _bmad/modules/asgl
mkdir -p _bmad/modules/deep-scan

# Extract ASGL section to module
grep -A 100 "ASGL MODULE" AGENTS.md > _bmad/modules/asgl/README.md

# Extract Deep-Scan section to module
grep -A 50 "DEEP-SCAN MODULE" AGENTS.md > _bmad/modules/deep-scan/README.md
```

### Step 2: Archive Historical Content

```bash
mkdir -p _bmad-output/governance/extracted-from-agents-2026-01-09

# Extract to archive
# - Platform Unification section
# - Cornerstone Health section
# - Implementation Timeline section
# - Completed Epic sections
```

### Step 3: Create New AGENTS.md

1. Create `AGENTS-v2.md` with compressed structure
2. Ensure Quick Reference is accurate
3. Ensure all links resolve
4. Validate <800 lines

### Step 4: Create New CLAUDE.md

1. Create `CLAUDE-v2.md` with compressed structure
2. Remove ALL duplicated content (reference AGENTS.md instead)
3. Keep only Claude-specific guidance
4. Validate <600 lines

### Step 5: Validate and Replace

```bash
# Validate line counts
wc -l AGENTS-v2.md  # Should be <800
wc -l CLAUDE-v2.md  # Should be <600

# Validate links
grep -oE '\`[^`]+\.(md|yaml)\`' AGENTS-v2.md | while read f; do
  path=$(echo $f | tr -d '`')
  if [ ! -f "$path" ]; then
    echo "BROKEN LINK: $path"
  fi
done

# Replace
mv AGENTS.md _bmad-output/.archive/2026-01-09/AGENTS-v1.md
mv AGENTS-v2.md AGENTS.md
mv CLAUDE.md _bmad-output/.archive/2026-01-09/CLAUDE-v1.md
mv CLAUDE-v2.md CLAUDE.md
```

## VALIDATION CHECKLIST

- [ ] AGENTS.md < 800 lines
- [ ] CLAUDE.md < 600 lines
- [ ] Quick Reference section accurate
- [ ] All links resolve to existing files
- [ ] No duplicated content between files
- [ ] Historical content archived
- [ ] Module content extracted to correct locations
- [ ] Agent can still find all necessary information

## OUTPUT ARTIFACTS

1. Compressed `AGENTS.md` (~800 lines)
2. Compressed `CLAUDE.md` (~600 lines)
3. `_bmad/FRAMEWORK.md` (extracted BMAD framework content)
4. `_bmad-output/governance/extracted-from-agents-2026-01-09/` (historical content)
5. `_bmad-output/.archive/2026-01-09/AGENTS-v1.md` (backup)
6. `_bmad-output/.archive/2026-01-09/CLAUDE-v1.md` (backup)

## HANDOFF

Report completion to orchestrator with:
- Before/after line counts
- List of extracted/archived content
- Validation that all links work
- Confirmation agents can still navigate project
