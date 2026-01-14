# BMAD Architecture - Single Source of Truth
**Version:** 3.0.0
**Date:** 2026-01-11
**Status:** ACTIVE - Consolidated from all sources

---

## What is BMAD?

**BMAD (Business Model & Agile Development)** is an autonomous AI agent orchestration framework for software development lifecycle management. It provides:

- **Multi-layered governance** with autonomous execution capabilities
- **Agent-based architecture** with specialized roles (BMM, CIS, Core)
- **Workflow-driven development** with epic/story tracking
- **Continuous governance scanning** to prevent context poisoning
- **Time-boxed execution** with artifact lifecycle management

---

## Architecture Decision Records (ADRs)

### ADR-001: Single Source of Truth Principle
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** All architecture decisions must be recorded in this document only. Duplicate ADRs across multiple locations are prohibited.

**Rationale:** Previous architecture had conflicting ADRs in `_bmad/`, `_bmad-ext/`, and `_bmad-output/` causing decision ambiguity.

**Implications:**
- All other ADR files are deprecated
- This document is the only authoritative source
- Changes must be dated and signed

---

### ADR-002: BMAD-EXT as Active Implementation
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** The `_bmad-ext/` directory contains the active BMAD implementation. Original `_bmad/` is legacy reference only.

**Rationale:** The extension layer was created to address governance and context issues in original BMAD.

**Structure:**
```
_bmad-ext/
├── orchestrator/         # Enhanced orchestrator with routing
├── agents/              # Enhanced versions of core agents
├── modules/
│   ├── governance/      # UNIFIED governance system (v2.0)
│   ├── arc-v2/          # Architecture remediation
│   └── sprint-planning/ # Sprint planning workflows
└── state/
    └── LOOP_STATE.yaml  # Unified state tracking
```

**Implications:**
- Commands must point to `_bmad-ext/` paths
- Original `_bmad/` is reference only, not executed
- All new features go into `_bmad-ext/`

---

### ADR-003: Unified Governance System
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Single governance system at `_bmad-ext/modules/governance/`. All other governance systems are deprecated.

**Rationale:** Multiple governance systems (governance, governance-core, legacy) caused confusion and conflicts.

**Active Components:**
- `workflows/` - Context-first, expert analysis, research trigger
- `policies/` - Artifact lifecycle, gating policy
- `config/` - Gates, checklists, retention policy
- `scanners/` - Agent-AI-RAG, deep-scan, file-structure

**Deprecated:** `_bmad-ext/modules/governance-core/` - Archive immediately

---

### ADR-004: Workspace-First Architecture
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** All user-facing features are organized around workspaces, not clients.

**Rationale:** Workspace abstraction elegantly handles multi-client scenarios without separate implementations.

**Workspace Types:**
| Workspace | description | Tool Focus |
|-----------|---------|------------|
| `ide` | Code development | Files, terminal, search |
| `knowledge` | Knowledge synthesis | RAG, PDF, images, web |
| `study` | Study materials | Notes, flashcards |
| `notes` | Note-taking | Notes, search |

**Implications:**
- Different clients (desktop, mobile) access same workspaces
- Tools are workspace-scoped, not client-scoped
- Sync operates at workspace level

---

### ADR-005: Agent Orchestrator with Mode Switching
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Agents operate in modes, with tools restricted by mode.

**Agent Modes:**
| Mode | description | Example Tools |
|------|---------|---------------|
| `coding` | Development-focused | read_file, write_file, terminal |
| `knowledge` | RAG and synthesis | synthesize, processPDF |
| `orchestrator` | Multi-step workflows | composite tools |

**Tool Permission Model:**
```typescript
toolPermission = {
  trustLevel: 'auto' | 'prompt' | 'block',
  allowedModes: AgentMode[],
  workspaceScope: WorkspaceType[]
}
```

**Implications:**
- Agent mode determines available tools
- User can override tool permissions per workspace
- Permissions are workspace-scoped, not global

---

### ADR-006: File Synchronization Strategy
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Bidirectional sync with conflict resolution, workspace-scoped.

**Implementation:**
- **Adapters:** FSA (File System Access API) for desktop, IndexedDB for fallback
- **Strategy:** Bidirectional sync with last-write-wins + user prompts for conflicts
- **Scope:** Workspace-level sync with cross-workspace references

**Key Files:**
- `src/infrastructure/sync/workspace-services/file-sync-service.ts`
- `src/infrastructure/sync/strategies/bidirectional-sync.ts`
- `src/infrastructure/sync/adapters/` (FSA, IDB adapters)

---

### ADR-007: RAG Implementation (Gemini Multimodal)
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** RAG uses Google Gemini multimodal API, not traditional vector database.

**Rationale:** Gemini provides native multimodal processing without separate embedding/vector infrastructure.

**RAG Operations:**
- `synthesize()` - Knowledge synthesis
- `processPDF()` - PDF extraction
- `processImage()` - Image analysis with OCR
- `processURL()` - Web content processing

**Implications:**
- No separate vector database needed
- Gemini dependency for RAG features
- Multimodal out-of-the-box

---

### ADR-008: Thread Management for Chat
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Hierarchical thread system with parent-child relationships.

**Thread Structure:**
```typescript
Thread {
  id: string
  parentThreadId?: string  // Hierarchical
  messages: Message[]
  agentId: string
  workspaceType: WorkspaceType
  projectId?: string      // Project-scoped
}
```

**Operations:**
- `createThread(parentThreadId?)` - Create with optional parent
- `deleteThread(threadId)` - Cascade delete children
- `getThreadHierarchy(threadId)` - Get full tree

---

### ADR-009: Tool Registry System
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Centralized tool registry with metadata-driven permissions.

**Tool Categories (10 total):**
1. `files` - File operations (read, write, list)
2. `terminal` - Command execution
3. `knowledge` - RAG and synthesis
4. `vision` - Image/video processing
5. `search` - Search operations
6. `web` - Web scraping and URL processing
7. `notes` - Note CRUD
8. `unified` - Cross-workspace operations
9. `composite` - Multi-step workflows
10. `provider` - LLM provider operations

**Trust Levels:**
- `auto` - Executes without prompting (low risk)
- `prompt` - Requires user approval (medium risk)
- `block` - Blocked from execution (high risk)

---

### ADR-010: Epic and Story Governance
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Epics and stories follow strict dependency rules.

**Epic Rules:**
- Maximum 4 active epics
- Maximum 8 stories per epic
- EPIC-N cannot start before EPIC-(N-1) reaches 80%
- Epic ID format: `EPIC-{SHORTNAME}`

**Story Rules:**
- Story ID format: `{EPIC}-{NN}` (e.g., FS-05, 39-01)
- Must have acceptance criteria
- Dependencies must be documented
- Code review required before DONE

**Current Active Epics:**
1. **EPIC-FS** - File System Foundation (28.6% complete)
2. **EPIC-39** - 8-bit Design Compliance (67% complete)
3. **EPIC-40** - Multimodal Chat Unification (COMPLETED)

---

### ADR-011: Sprint Planning Structure
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Phase-based sprints with quality gates.

**Sprint Structure:**
- Maximum 4 active sprint files
- 24-hour rotation for completed sprints
- Story Index as source of truth

**Quality Gates:**
- Entry gate: Verify prerequisites
- Exit gate: Verify completion
- Phase gate: Verify phase completion
- Quality gate: Verify standards met

**Current Sprint:** Phase 2 (Agentic Capabilities)

---

### ADR-012: Artifact Lifecycle Management
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Tiered TTL system for artifacts.

**TTL Tiers:**
| Tier | TTL | Examples |
|------|-----|----------|
| Permanent | ∞ | ADRs, architecture docs |
| Long-term | 90 days | Epic completions |
| Medium-term | 30 days | Sprint artifacts |
| Short-term | 7 days | Research artifacts |
| Session | 24 hours | Temporary research |

**Archive Location:** `_bmad-output/.archive/YYYY-MM-DD/`

---

### ADR-013: Context Poisoning Prevention
**Status:** ACTIVE
**Date:** 2026-01-11

**Decision:** Active governance scanning to prevent context poisoning.

**Prevention Measures:**
1. **Artifact TTL** - Stale artifacts auto-expire
2. **Pre-execution Validation** - Check age and size
3. **Context-First Workflow** - Scan for conflicts
4. **Single Source of Truth** - One authoritative document per topic

**Poisoning Indicators:**
- Duplicate/conflicting ADRs
- Stale artifacts (>24 hours for session data)
- Overlapping module responsibilities
- Conflicting path references

---

## Active Module Registry

### Core Modules
| Module | Path | Version | Status |
|--------|------|---------|--------|
| Governance | `_bmad-ext/modules/governance/` | 2.0 | ACTIVE |
| Architecture Remediation | `_bmad-ext/modules/arc-v2/` | 2.0 | ACTIVE |
| Sprint Planning | `_bmad-ext/modules/sprint-planning-wrapper/` | 1.0 | ACTIVE |

### Deprecated Modules
| Module | Path | Replacement |
|--------|------|-------------|
| Governance Core | `_bmad-ext/modules/governance-core/` | governance/ |
| Legacy Governance | `_bmad-ext/.archive/2026-01-10-legacy/governance/` | governance/ |

---

## State Tracking

### LOOP_STATE.yaml
**Location:** `_bmad-ext/state/LOOP_STATE.yaml`

**Required Fields:**
```yaml
session:
  id: string           # Must be initialized
  anchorTimestamp: i64 # Must be set
  phase: string        # Current phase

loop:
  cycleCount: number
  lastAction: string
  nextAction: string

artifacts:
  active: string[]     # Active artifact paths
  stale: string[]      # Stale artifact paths
```

---

## Command Path References

### Active Commands
All commands must reference `_bmad-ext/` paths:

```yaml
# Correct
_ref: _bmad-ext/agents/dev-ext.md

# Incorrect (deprecated)
_ref: _bmad/bmm/agents/dev.md
```

---

## Related Documents (Single Source)

1. [True Use Cases Mapping](_bmad-output/architecture/TRUE-USE-CASES-2026-01-11.md)
2. [Poisoning Context Report](_bmad-output/architecture/POISONING-CONTEXT-2026-01-11.md)
3. [Epic/Story Remediation Plan](_bmad-output/architecture/EPIC-STORY-REMEDIATION-2026-01-11.md)
4. [Sprint Status](_bmad-output/sprint-artifacts/sprint-status.yaml)

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-11 | 3.0.0 | Initial consolidated SSOT | BMAD Analysis |

---

*This is the SINGLE SOURCE OF TRUTH for BMAD architecture decisions.*
*All other ADR files are deprecated.*
