# ASGL Master Initialization Prompt v2.0

**Module**: `asgl`  
**Version**: 2.0.0  
**Purpose**: Orchestrate autonomous development cycles by invoking existing modules

---

## ⚠️ CRITICAL: ASGL Role

> **ASGL is an ORCHESTRATOR, not an executor.**
> - For diagnostics → ASGL invokes `deep-scan`
> - For remediation → ASGL invokes `architecture-remediation`
> - For standard dev → ASGL invokes `bmad-core` workflows

---

## Quick Start Prompt

Copy this prompt to start an autonomous loop:

---

# ASGL Autonomous Loop Orchestration

@bmad-core-bmad-master

## Mission
Orchestrate the course correction sprint by invoking appropriate modules for each story.

## Session
- **ID**: ASGL-{current-timestamp}
- **Source**: Project Health Assessment 2026-01-05
- **Stories**: 7 (see course-correction-p0-2026-01-05.yaml)

## Context Files (Load)
```
_bmad/modules/asgl/LOOP_STATE.yaml
_bmad/modules/asgl/config/governance.yaml
_bmad/modules/asgl/config/module-integration.yaml
_bmad-output/sprint-artifacts/course-correction-p0-2026-01-05.yaml
```

## Module Integration (DO NOT REPLACE)

| Module | Invoke When |
|--------|-------------|
| **deep-scan** | Need diagnostics |
| **architecture-remediation** | Need store/component refactoring |
| **bmad-core dev-story** | Standard implementation |

## Governance Enforcement

| Document | Update Frequency |
|----------|-----------------|
| **AGENTS.md** | Every 3 stories |
| **CLAUDE.md** | Every 5 stories |
| **Child AGENTS.md** | When layer changes significantly |

## Constraints

1. **Design**: 8-bit only, NO glassmorphism
2. **Mobile**: Touch targets ≥44px
3. **i18n**: All strings via t()
4. **Wires**: Track all migrations in pending-wires.yaml
5. **Governance**: Update AGENTS.md/CLAUDE.md per frequency

## Execution Protocol

1. **Load** LOOP_STATE and current story
2. **Route** to appropriate module based on story type:
   - Diagnostic → invoke deep-scan
   - Refactoring → invoke architecture-remediation
   - Implementation → invoke bmad-core dev-story
3. **Execute** module workflow (module handles the work)
4. **Validate** completion (design, mobile, i18n, wires)
5. **Governance check** (update docs if trigger hit)
6. **Continue** to next story if remaining > 0

## Interrupt Commands

| Command | Action |
|---------|--------|
| `pause` | Save state, pause loop |
| `stop` | Complete current, generate report |
| `status` | Show current state |
| `override [check]` | Skip validation (requires reason) |

## Start

Begin loop from current story in LOOP_STATE.yaml.

---

## Story Routing Reference

| Story Type | Module | Workflow |
|------------|--------|----------|
| DIAGNOSTIC | deep-scan | targeted-scan |
| GOD_STORE_SPLIT | architecture-remediation | eliminate-god-stores |
| COMPONENT_SPLIT | architecture-remediation | normalize-components |
| TYPESCRIPT_FIX | architecture-remediation | fix-typescript-errors |
| EPIC-53 stories | architecture-remediation | state-consolidation-cycle |
| IMPLEMENTATION | bmad-core | dev-story |
| CODE_REVIEW | bmad-core | code-review |

---

## Resume Prompt (for paused sessions)

```markdown
@bmad-core-bmad-master

Resume ASGL session from LOOP_STATE.yaml:
- Check session.status == PAUSED
- Load continuation.next_action
- Verify pending_wires resolved
- Continue from current_story
```

---

## Validation Commands Reference

```bash
# TypeScript (production only)
pnpm exec tsc --noEmit 2>&1 | grep -v '.test.' | grep 'error TS' | wc -l

# Design violations
grep -r 'backdrop-blur\|bg-opacity-[0-4]' src --include='*.tsx' --include='*.css' | wc -l

# i18n violations  
grep -r '>[A-Z][a-z]' src --include='*.tsx' | grep -v 't(' | head -20

# Pending wires check
cat _bmad/modules/asgl/scratchpad/pending-wires.yaml | grep 'PENDING' | wc -l
```

---

**Generated**: 2026-01-05T15:40:00+07:00  
**Module**: _bmad/modules/asgl  
**Version**: 2.0.0
