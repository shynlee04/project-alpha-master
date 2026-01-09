# EPIC-40 Fresh Start Handoff

**Date:** 2026-01-10
**Status:** Ready for Development
**Team:** Team A (Single Team)

---

## What is EPIC-40?

**Name:** Agent Chat Self-Switching & Tool Registry

**Problem:** Current agent chat system has:
- Static mode selection (requires manual selection)
- Only 4 tools hardcoded in `getTools()`
- No permission/mode/workspace filtering
- Fragmented system prompts

**Solution:**
1. **Centralized Tool Registry** - Single source of truth for tool definitions
2. **Self-Switching Agent Mode** - Auto-select mode (CODING/KNOWLEDGE/ORCHESTRATOR) based on 4 context sources
3. **Centralized System Prompt** - One constitution, layered prompts

---

## Artifacts Prepared

### Design Documents
| File | Status | Purpose |
|------|--------|---------|
| `_bmad-output/phase3-synthesis/centralized-system-prompt-design-2026-01-10.md` | ✅ | 5-layer prompt architecture |
| `_bmad-output/planning-artifacts/architecture/adr/ADR-032-agent-chat-self-switching-orchestrator-2026-01-10.md` | ✅ | Architecture decision record |

### Sprint Planning
| File | Status | Purpose |
|------|--------|---------|
| `_bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md` | ✅ | Sprint plan (9 stories, Team A) |
| `_bmad-output/bmm-workflow-status.yaml` | ✅ | Workflow: EPIC-40 active |
| `_bmad-output/sprint-artifacts/sprint-status.yaml` | ✅ | EPIC-40 tracking added |

### Ralph Loop Coordination
| File | Status | Purpose |
|------|--------|---------|
| `.claude/LOOP_STATE-child.yaml` | ✅ | Operational level tracking |

### Governance (Read & Understood)
| Checklist | Purpose |
|-----------|---------|
| `_bmad/modules/governance/checklists/story-start-gate.yaml` | 5 gates before story start |
| `_bmad/modules/governance/checklists/story-done-gate.yaml` | 5 gates before story done |
| `_bmad/modules/governance/checklists/epic-done-gate.yaml` | 5 gates before epic complete |
| `_bmad/modules/governance/checklists/sprint-rotation-gate.yaml` | 4 gates for sprint rotation |
| `_bmad/modules/governance/checklists/artifact-freshness-gate.yaml` | 3 tiers with TTL rules |

---

## 9 Stories in EPIC-40

### Phase 1: Foundation (4 hours)
| ID | Story | Purpose |
|----|-------|---------|
| 40-01 | Create Centralized Tool Registry | Single source of truth for tools |
| 40-03 | Implement Tool Permission Filtering | Filter by permission/mode/workspace |

### Phase 2: Context Injection (5 hours)
| ID | Story | Purpose |
|----|-------|---------|
| 40-02 | Create Mode Classifier | Analyze 4 context sources, auto-select mode |
| 40-04 | Implement Workspace Context Injection | Inject workspace state into prompt |
| 40-05 | Implement Document Context Injection | Inject active document context |

### Phase 3: Centralized Prompt (6 hours)
| ID | Story | Purpose |
|----|-------|---------|
| 40-06 | Create Prompt Layer System | 5-layer architecture |
| 40-07 | Implement Agent Mode Prompts | CODING/KNOWLEDGE/ORCHESTRATOR modes |
| 40-08 | Integrate All Context Layers | Full context injection pipeline |

### Phase 4: Integration (6 hours)
| ID | Story | Purpose |
|----|-------|---------|
| 40-09 | End-to-End Integration | Wire everything together |

---

## How to Start Fresh

### Step 1: Load Ralph Loop State
```bash
Read: .claude/LOOP_STATE-child.yaml
```
This shows:
- Current epic: EPIC-40
- Current story: 40-01
- Team: A
- Step: 06-dev-story

### Step 2: Load Sprint Plan
```bash
Read: _bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md
```
This shows:
- All 9 stories with acceptance criteria
- Sequential execution order (Team A only)
- Dependencies between stories

### Step 3: Load Design Documents
```bash
Read: _bmad-output/phase3-synthesis/centralized-system-prompt-design-2026-01-10.md
Read: _bmad-output/planning-artifacts/architecture/adr/ADR-032-agent-chat-self-switching-orchestrator-2026-01-10.md
```

### Step 4: Start Story Cycle
```
/story-cycle story=40-01
```

---

## Key Code References

### Current Implementation (What Exists)
| File | Current State | What Needs to Change |
|------|---------------|---------------------|
| `src/lib/agent/chat.ts:getTools()` | 4 hardcoded tools | Use CentralizedToolRegistry |
| `src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Manual mode selection | Self-switching via ModeClassifier |
| `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` | Store setup | Add tool registry integration |

### Type Definitions Needed
```typescript
// Domain layer - new types needed
interface IToolDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  allowedModes: AgentMode[];
  allowedWorkspaces: WorkspaceType[];
  category: ToolCategory;
}

type Permission = 'read' | 'write' | 'execute';
type WorkspaceType = 'notes' | 'chat' | 'global';
type AgentMode = 'CODING' | 'KNOWLEDGE' | 'ORCHESTRATOR';
type ToolCategory = 'file' | 'search' | 'ai' | 'workspace';
```

---

## Governance Compliance

All work follows:
- **Story Cycle v2.0**: `/bmad:bmm:workflows:story-cycle`
- **Ralph Loop**: Auto-coordination via `/bmad:core:agents:bmad-master`
- **BMAD Master**: Timestamp validation, stale artifact detection

### Critical Gates
- **SDG-002**: TypeScript must pass (`pnpm tsc --noEmit`)
- **SDG-004**: Tests must pass (`pnpm vitest run`)
- **EDG-004**: Cannot be bypassed (Epic Done Gate)

---

## What to Say to Start

Option 1 - Start full story cycle:
```
/story-cycle story=40-01
```

Option 2 - Start specific step:
```
/dev-story story=40-01
```

Option 3 - Load and assess:
```
Read .claude/LOOP_STATE-child.yaml
Read _bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md
```

---

## File Structure for Development

```
src/
├── domain/
│   ├── tools/
│   │   ├── tool-definition.ts        # IToolDefinition, types
│   │   ├── tool-registry.ts           # CentralizedToolRegistry
│   │   └── tool-permissions.ts        # Permission constants
│   └── agent/
│       ├── mode-classifier.ts         # ModeClassifier
│       └── context-sources.ts         # Context type definitions
├── infrastructure/
│   └── agent/
│       ├── prompt-builder.ts          # PromptBuilder
│       └── tool-filter-service.ts     # Tool filtering logic
└── lib/
    └── agent/
        ├── chat.ts                    # MODIFY: Use registry
        └── hooks/
            └── use-agent-chat-with-tools.ts  # MODIFY: Self-switching
```

---

## Dependencies

### Upstream (Must exist first)
- TanStack AI v0.2.0 ✅
- Zustand v5 ✅
- Dexie ✅

### Downstream (Depend on this epic)
- Enhanced agent chat UI
- Agent analytics
- Tool usage monitoring

---

*Handoff created for fresh context start - 2026-01-10*
