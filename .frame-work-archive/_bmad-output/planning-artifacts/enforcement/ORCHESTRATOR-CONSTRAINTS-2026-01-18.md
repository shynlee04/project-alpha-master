# ORCHESTRATOR HARD ENFORCEMENT CONSTRAINTS
**Artifact ID:** ORCHESTRATOR-CONSTRAINTS-2026-01-18
**Version:** 1.0.0
**Status:** ACTIVE
**Platform:** OpenCode
**Created:** 2026-01-18T20:15:00+07:00

---

## Executive Summary

This document establishes **HARDCODED constraints** for the `bmad-ext-master-orchestrator` role in the OpenCode platform. The orchestrator role is now **physically prevented** from executing any tools directly and must operate exclusively through delegation to subagents.

**Key Enforcement:**
- ✅ ALL tool categories BLOCKED for orchestrator
- ✅ Pre-execution hook prevents any direct execution
- ✅ Auto-escalation to human on violation
- ✅ NO bypass possible

---

## File Structure

```
.opencode/
├── orchestrator-constraints.json          ← Main constraint definition
└── hooks/
    └── pre-orchestrator-execution-block.sh ← Execution blocker (executable)
```

---

## Constraint Categories (15 Categories BLOCKED)

| Category | Severity | Tools Blocked | Enforcement |
|----------|----------|---------------|-------------|
| **filesystem_tools** | CRITICAL | 14 tools | HARD_STOP |
| **read_tools** | CRITICAL | 1 tool | HARD_STOP |
| **write_tools** | CRITICAL | 1 tool | HARD_STOP |
| **edit_tools** | CRITICAL | 1 tool | HARD_STOP |
| **bash_tools** | CRITICAL | 1 tool | HARD_STOP |
| **glob_tools** | CRITICAL | 1 tool | HARD_STOP |
| **grep_tools** | CRITICAL | 1 tool | HARD_STOP |
| **serena_tools** | CRITICAL | 21 tools | HARD_STOP |
| **lookup_type_tools** | CRITICAL | 2 tools | HARD_STOP |
| **github_tools** | CRITICAL | 22 tools | HARD_STOP |
| **web_tools** | CRITICAL | 3 tools | HARD_STOP |
| **exa_tools** | CRITICAL | 2 tools | HARD_STOP |
| **brave_tools** | CRITICAL | 2 tools | HARD_STOP |
| **zread_tools** | CRITICAL | 3 tools | HARD_STOP |
| **deepwiki_tools** | CRITICAL | 3 tools | HARD_STOP |
| **chrome_devtools** | CRITICAL | 25 tools | HARD_STOP |

**Total Blocked Tools: 103+**

---

## Permitted Activities (Only 4)

| Activity | Tools | Description |
|----------|-------|-------------|
| **task_delegation** | `task` | MUST delegate all work to subagents |
| **thinking_tools** | `serena_think_*` | Analysis and reasoning |
| **memory_read** | `serena_read_memory` | Context retrieval |
| **initial_instructions** | `serena_initial_instructions` | Documentation access |

---

## Enforcement Mechanism

### 1. Pre-Execution Hook
**File:** `.opencode/hooks/pre-orchestrator-execution-block.sh`

The hook runs BEFORE every tool execution and:
1. Detects if the current role is orchestrator
2. Checks for any direct tool execution attempt
3. Blocks execution if violation detected
4. Logs violation to `_bmad-ext/state/ORCHESTRATOR_VIOLATIONS.yaml`
5. Updates `_bmad-ext/state/LOOP_STATE.yaml`
6. Exits with code 99 (permanent block until human intervention)

### 2. Constraint Validation
**File:** `.opencode/orchestrator-constraints.json`

JSON Schema validated constraints that:
- Define all blocked tool categories
- Specify permitted activities
- Set enforcement level to HARD_STOP
- Disable all bypass mechanisms

---

## Violation Response

```
╔════════════════════════════════════════════════════════════╗
║         🚫 ORCHESTRATOR EXECUTION BLOCKED 🚫              ║
╠════════════════════════════════════════════════════════════╣
║ Role: bmad-ext-master-orchestrator                        ║
║ Platform: OpenCode                                        ║
║ Enforcement: HARD STOP                                    ║
╠════════════════════════════════════════════════════════════╣
║ Violation: Attempted direct tool execution                ║
║ Blocked Tools: [detected_tools]                           ║
╠════════════════════════════════════════════════════════════╣
║ CORRECT PATTERN:                                          ║
║   Use the 'task' tool with subagent_type parameter        ║
║                                                           ║
║ Example:                                                  ║
║   {                                                       ║
║     "subagent_type": "dev-ext",                           ║
║     "prompt": "Implement feature X..."                    ║
║   }                                                       ║
╠════════════════════════════════════════════════════════════╣
║ This is NOT a suggestion. This is a HARD ENFORCEMENT.     ║
║ No bypass is possible.                                    ║
╚════════════════════════════════════════════════════════════╝
```

---

## Required Delegation Pattern

### ❌ FORBIDDEN (Will be BLOCKED)
```json
// Direct tool execution - BLOCKED
{
  "read": {"filePath": "/path/to/file.ts"}
}

{
  "write": {"content": "...", "filePath": "/path/to/file.ts"}
}

{
  "bash": {"command": "pnpm build"}
}
```

### ✅ REQUIRED (Delegation Only)
```json
// Must use task tool to delegate
{
  "subagent_type": "dev-ext",
  "description": "Implement feature X",
  "prompt": "Implement the new notes feature:\n1. Create components in src/presentation/components/notes/\n2. Update routes in src/routes/\n3. Use 8-bit design system\n\nReport location: _bmad-output/stories/notes-feature.md",
  "write": true,
  "edit": true,
  "bash": true,
  "task": true
}
```

---

## Valid Subagent Types for Delegation

| Agent Type | Purpose |
|------------|---------|
| `dev-ext` | Implementation |
| `architect-ext` | Architecture |
| `ux-designer-ext` | UI/UX Design |
| `tech-writer-ext` | Documentation |
| `analyst-ext` | Analysis |
| `tea-ext` | Testing |
| `bmad-sprint-manager` | Sprint Management |
| `deep-scan-orchestrator` | Diagnostics |
| `real-world-validator` | Testing |
| And 15+ more specialized agents... |

---

## Logging & Escalation

### Violation Log
**Location:** `_bmad-ext/state/ORCHESTRATOR_VIOLATIONS.yaml`

```yaml
violation_[uuid]:
  timestamp: 2026-01-18T20:15:00Z
  role: bmad-ext-master-orchestrator
  type: DIRECT_TOOL_EXECUTION
  detected_tools: filesystem_tools bash_tools
  status: BLOCKED
  action_required: HUMAN_INTERVENTION
```

### Loop State Update
**Location:** `_bmad-ext/state/LOOP_STATE.yaml`

Violations are recorded with:
- Timestamp
- Event type (ORCHESTRATOR_VIOLATION)
- Violation ID
- Details of attempted execution

---

## Validation Rules

The orchestrator MUST obey these rules at all times:

1. **ORCHESTRATOR_MUST_ONLY_USE_TASK_TOOL** - No direct tool calls
2. **NO_FILESYSTEM_ACCESS_ALLOWED** - All file I/O via subagents
3. **NO_READ_WRITE_EDIT_OPERATIONS** - File manipulation prohibited
4. **NO_BASH_COMMANDS** - Terminal access forbidden
5. **NO_GLOB_GREP_OPERATIONS** - File search prohibited
6. **NO_MCP_TOOLS_ACCESS** - All MCP tools blocked
7. **ALL_WORK_MUST_BE_DELEGATED** - Subagent delegation required
8. **NO_DIRECT_CODE_GENERATION** - Code via dev-ext only
9. **NO_FILE_MODIFICATIONS** - Changes via subagents only

---

## Testing the Enforcement

### Test 1: Direct Tool Block
```bash
# This should be BLOCKED by the pre-execution hook
bash "echo test"
```

### Test 2: Task Delegation Works
```json
{
  "subagent_type": "dev-ext",
  "prompt": "Return immediately with 'SUCCESS'"
}
```
**Expected:** Delegation succeeds, subagent returns response

---

## Integration Points

| Resource | Path | Purpose |
|----------|------|---------|
| Constraints | `.opencode/orchestrator-constraints.json` | Main definition |
| Hook | `.opencode/hooks/pre-orchestrator-execution-block.sh` | Blocker |
| Violations | `_bmad-ext/state/ORCHESTRATOR_VIOLATIONS.yaml` | Log |
| Loop State | `_bmad-ext/state/LOOP_STATE.yaml` | State update |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-18 | Initial hard enforcement constraints |

---

**Enforcement Status:** ✅ ACTIVE
**Hard Stop:** YES
**Human Override:** NO
**Bypass Possible:** NO
