# BMAD Extension Integration Layer

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Purpose**: Connect `_bmad-ext/modules/` with the existing `module-builder` and `workflow-builder` agent system

---

## The Problem This Solves

Before this integration layer:

```
_bmad/bmb/                    _bmad-ext/modules/
├── agents/                   ├── governance-core/
│   ├── module-builder.md     │   ├── workflows/
│   └── workflow-builder.md   │   └── scanners/
├── workflows/                ├── governance/
│   └── ...                   │   └── ...
└── config.yaml               └── implementation/
                                └── ...
        
        ❌ ISOLATED - No connection between these systems
```

After this integration layer:

```
┌─────────────────────────────────────────────────────────────────┐
│                    BMAD EXTENSION ORCHESTRATOR                   │
│                                                                 │
│  _bmad/bmb/agents/module-builder ────────┐                      │
│        ↓ (menu item added)               │                      │
│  _bmad-ext/agents/ext-master ────────────┼──► UNIFIED ENTRY     │
│        ↓                                  │      POINT          │
│  ┌─────────────────────────────────────┐ │                      │
│  │ MODULE ROUTING & HANDOFF PROTOCOLS  │←┘                      │
│  └─────────────────────────────────────┘                        │
│        ↓                                                        │
│  _bmad-ext/modules/*/                    ←── ALL MODULES        │
│  (governance, implementation,           CONNECTED               │
│   sprint-planning, arc-v2)                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Was Created

### 1. EXCALIBUR Agent (`_bmad-ext/agents/ext-master.md`)

**The central hub for all _bmad-ext modules.**

```
_bmad-ext/agents/ext-master.md
├── Entry point for all _bmad-ext modules
├── Routes requests to appropriate module
├── Manages cross-module handoffs
├── Displays unified menu of all modules
└── Auto-checks for handoffs after workflow completion
```

**Menu Options:**
```
[GV] Governance Module (Phase 0)
[GC] Governance-Core Module
[SP] Sprint-Planning Wrapper
[IM] Implementation Module (Phase 4)
[AR] Architecture Remediation v2
[XR] Cross-Module Routing
[HS] Handoff Status
```

### 2. Extension Config (`_bmad-ext/config.yaml`)

**Central configuration for all _bmad-ext modules.**

```yaml
# Module Registry
modules:
  governance: {...}
  governance-core: {...}
  implementation: {...}
  sprint-planning-wrapper: {...}
  arc-v2: {...}

# Routing Rules
routing_rules:
  - rule_id: "GOV-001"
    if: "request.type in ['feature_request', 'bug_fix']"
    module: "governance"
```

### 3. Handoff Protocol (`_bmad-ext/protocols/handoff.md`)

**Defines how modules communicate and delegate work.**

```
SOURCE MODULE → HANDOFF DOCUMENT → TARGET MODULE
     ↓              ↓                   ↓
  Creates       Auto-routes         Loads context
  context       to target           continues work
```

**Handoff States:** `pending` → `in_progress` → `completed` | `failed`

### 4. Bridge from module-builder

**Updated `_bmad/bmb/agents/module-builder.md`:**

```yaml
<item cmd="EX" exec="{project-root}/_bmad-ext/agents/ext-master.md">
  [EX] BMAD Extension Modules
</item>
```

Now users can access all _bmad-ext modules from the original module-builder menu.

### 5. State Management

```
_bmad-ext/state/
├── LOOP_STATE.yaml           # Global session state
└── ARTIFACT_REGISTRY.yaml   # Track all artifacts

_bmad-ext/.handoffs/         # Pending handoffs
_bmad-ext/.backups/          # State backups
```

---

## Usage

### Option 1: Via module-builder (Recommended)

```bash
# Start with module-builder
/module-builder

# Menu shows new option:
[EX] BMAD Extension Modules
      ↓
# EXCALIBUR appears with full module menu
```

### Option 2: Direct Entry

```bash
# Activate ext-master directly
/ext-master

# Or load specific workflow directly
cat _bmad-ext/modules/governance/workflows/context-first/workflow.md
```

### Option 3: Via Slash Command (if configured)

```bash
/correct-course  # Routes to governance-core
```

---

## Cross-Module Flow Example

### Scenario: New Feature Development

```
1. USER REQUEST
   "Create FileLockService for EPIC-FS"
        ↓
2. MODULE-BUILDER → EXCALIBUR
   [EX] → [GV] Governance Module
        ↓
3. GOVERNANCE (Phase 0)
   ├─ context-first: Scan domains, gather context
   ├─ expert-analysis: Define issue level
   └─ research-trigger: (if needed)
        ↓
4. GOVERNANCE REPORT: decision="proceed"
        ↓
5. HANDOFF TO IMPLEMENTATION
   ├─ Create handoff document
   ├─ Transfer context
   └─ Route to implementation module
        ↓
6. IMPLEMENTATION (Phase 4)
   ├─ Load handoff with governance_report
   ├─ Execute story-cycle workflow
   └─ Complete development
        ↓
7. VALIDATION (optional)
   ├─ Handoff back to governance for validation
   └─ Final approval
```

---

## Module Integration Map

| Module | Phase | Entry Via | Handoffs To | Handoffs From |
|--------|-------|-----------|-------------|---------------|
| `governance` | 0 | EXCALIBUR → [GV] | implementation, governance-core | module-builder |
| `governance-core` | 0 | EXCALIBUR → [GC] | implementation, arc-v2 | governance |
| `implementation` | 4 | EXCALIBUR → [IM] | governance (validation) | governance, governance-core |
| `sprint-planning-wrapper` | - | EXCALIBUR → [SP] | implementation | module-builder |
| `arc-v2` | - | EXCALIBUR → [AR] | implementation | governance-core |

---

## File Structure

```
_bmad-ext/
├── agents/
│   └── ext-master.md           ← NEW: Central orchestrator
├── config.yaml                 ← NEW: Module registry & routing
├── protocols/
│   └── handoff.md              ← NEW: Cross-module handoff protocol
├── state/
│   ├── LOOP_STATE.yaml         ← NEW: Global state
│   └── ARTIFACT_REGISTRY.yaml ← NEW: Artifact tracking
├── .handoffs/                  ← NEW: Handoff documents
├── .backups/                   ← NEW: State backups
├── modules/
│   ├── governance/
│   ├── governance-core/
│   ├── implementation/
│   ├── sprint-planning-wrapper/
│   └── arc-v2/
└── orchestrator/
    └── routing-rules.yaml      ← (existing)

_bmad/bmb/agents/
├── module-builder.md           ← UPDATED: Added EX menu item
└── workflow-builder.md         ← UPDATED: Added EX menu item
```

---

## Migration Guide

### For Existing Users

1. **No changes required** - existing workflows still work
2. **New capability**: Access _bmad-ext modules via module-builder
3. **Recommended**: Use EXCALIBUR for any _bmad-ext module work

### For New Users

1. Start with `/module-builder`
2. Select `[EX] BMAD Extension Modules`
3. Choose module from EXCALIBUR's menu
4. Follow module's workflow

---

## Troubleshooting

### Handoff Not Routing

```bash
# Check handoff status
/ext-master → [HS] Handoff Status

# Verify LOOP_STATE
cat _bmad-ext/state/LOOP_STATE.yaml
```

### Module Not Found

```bash
# Verify config loaded
cat _bmad-ext/config.yaml | grep modules

# Check module status
grep -A5 "module-id" _bmad-ext/config.yaml
```

### State Corruption

```bash
# Restore from backup
ls _bmad-ext/.backups/
cp _bmad-ext/.backups/LOOP_STATE-*.yaml _bmad-ext/state/LOOP_STATE.yaml
```

---

## Next Steps

1. **Hook Integration**: Connect hooks to auto-trigger governance
2. **Orchestrator Update**: Add routing rules for auto-dispatching
3. **Enhanced Scanners**: Implement remaining domain scanners
4. **Quality Gates**: Add automated testing in workflows

---

**Last Updated**: 2026-01-11  
**Next Review**: 2026-01-18
