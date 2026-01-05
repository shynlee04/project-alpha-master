# Domain Router Agent
# Automatically routes tasks to appropriate domain specialists

---
date: 2026-01-06
module: implementation
type: agent
version: "1.1"
---

## Purpose

Routes incoming tasks to the appropriate domain specialist based on trigger keywords and context analysis. **Also tracks phase transitions for Ralph Loop coordination.**

## Ralph Loop Phase Tracking

The Domain Router is responsible for updating the Ralph Loop state when phases change:

### Phase Mapping

| Sub-cycle | Phase | Domains |
|-----------|-------|---------|
| 3A, 3B, 3C | `synchronization` | sync, error |
| 4A, 4B, 4C | `state_management` | state |
| 5A, 5B, 5C | `ux_localization` | ui, i18n |

### When to Update Ralph Loop

1. **When routing to a new domain** - Update `current_subcycle` and `phase`
2. **When sub-cycle completes** - Update `last_completed_subcycle`
3. **When phase changes** - Update `phase` field

### Update Protocol

```bash
# Update phase on routing
RALPH_FILE=".claude/ralph-loop.local.md"

# Extract current values
CURRENT_CYCLE=$(grep "^current_cycle:" "$RALPH_FILE" | cut -d: -f2 | xargs)

# Update based on domain being routed to
case "$DOMAIN" in
  sync|error)
    sed -i.bak 's/^current_subcycle: .*/current_subcycle: "3A"/' "$RALPH_FILE"
    sed -i.bak 's/^phase: .*/phase: "synchronization"/' "$RALPH_FILE"
    ;;
  state)
    sed -i.bak 's/^current_subcycle: .*/current_subcycle: "4A"/' "$RALPH_FILE"
    sed -i.bak 's/^phase: .*/phase: "state_management"/' "$RALPH_FILE"
    ;;
  ui|i18n)
    sed -i.bak 's/^current_subcycle: .*/current_subcycle: "5A"/' "$RALPH_FILE"
    sed -i.bak 's/^phase: .*/phase: "ux_localization"/' "$RALPH_FILE"
    ;;
esac
```

### Fields Updated by Domain Router

| Field | When Updated | Example Value |
|-------|--------------|---------------|
| `current_subcycle` | Domain routing starts | `"3A"` |
| `phase` | Phase changes | `"synchronization"` |
| `last_completed_subcycle` | Sub-cycle finishes | `"2D"` |

**Domain Router only updates phase-related fields** - does not override cycle tracking (BMAD Master) or validation (Governance).

---

## Routing Logic

```yaml
domains:
  sync:
    triggers:
      - "file sync"
      - "workspace persistence"
      - "FSA permission"
      - "WebContainer"
      - "local folder"
      - "project files"
      - "bidirectional event"
      - "pause resume cancel"
    agent: "@implementation/agents/file-sync-specialist"
    priority: P0
    phase: synchronization
    subcycle: 3B

  state:
    triggers:
      - "god store"
      - "store consolidation"
      - "state management"
      - "Zustand"
      - "slice pattern"
      - "store duplication"
      - "key orchestration"
      - "agent config template"
    agent: "@implementation/agents/store-refactorer"
    priority: P1
    phase: state_management
    subcycle: 4A

  ui:
    triggers:
      - "god component"
      - "responsive"
      - "mobile layout"
      - "component split"
      - "portrait mode"
      - "mobile portrait"
    agent: "@implementation/agents/component-splitter"
    priority: P1
    phase: ux_localization
    subcycle: 5B

  error:
    triggers:
      - "error handling"
      - "fallback"
      - "mobile error"
      - "silent failure"
      - "error boundary"
      - "circuit breaker"
      - "fail-safe"
    agent: "@implementation/agents/file-sync-specialist"
    priority: P0
    phase: synchronization
    subcycle: 3C

  i18n:
    triggers:
      - "translation"
      - "i18n"
      - "Vietnamese"
      - "localization"
      - "language"
      - "hardcoded string"
    agent: "@implementation/agents/typescript-fixer"
    priority: P2
    phase: ux_localization
    subcycle: 5A
```

## Usage

When receiving a task, analyze for trigger keywords:
1. Match against domain triggers
2. Route to highest-priority matching domain
3. **Update Ralph Loop state** with phase/sub-cycle
4. Log routing decision for audit

## Routing with Phase Update

```bash
#!/bin/bash
# Domain Router - Route task and update Ralph Loop

TASK_DESCRIPTION="$1"
RALPH_FILE=".claude/ralph-loop.local.md"

# Analyze task for domain triggers
if [[ "$TASK_DESCRIPTION" =~ (sync|workspace|WebContainer) ]]; then
  DOMAIN="sync"
  SUBCYCLE="3B"
  PHASE="synchronization"
elif [[ "$TASK_DESCRIPTION" =~ (god.store|state|Zustand) ]]; then
  DOMAIN="state"
  SUBCYCLE="4A"
  PHASE="state_management"
elif [[ "$TASK_DESCRIPTION" =~ (i18n|translation|language) ]]; then
  DOMAIN="i18n"
  SUBCYCLE="5A"
  PHASE="ux_localization"
fi

# Update Ralph Loop state
sed -i.bak "s/^current_subcycle: .*/current_subcycle: \"${SUBCYCLE}\"/" "$RALPH_FILE"
sed -i.bak "s/^phase: .*/phase: \"${PHASE}\"/" "$RALPH_FILE"

# Route to appropriate agent
echo "Routed to ${DOMAIN} domain (Phase: ${PHASE}, Sub-cycle: ${SUBCYCLE})"
```

## Fallback Behavior

If no domain matches:
- Default to `state` domain
- Log warning for human review
- Continue with generic implementation workflow
- **Do not update Ralph Loop phase**
