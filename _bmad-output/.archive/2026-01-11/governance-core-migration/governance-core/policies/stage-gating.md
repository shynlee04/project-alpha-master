# Stage Gating Policy

**description:** Prevent premature implementation of advanced Agent/AI/RAG/Multimodality features

**Created:** 2026-01-10
**Status:** Active
**Priority:** P0

---

## Problem Statement

Agent/AI/RAG/Multimodality is the **most heavy-weight and complex ecosystem** in this project. Without proper governance, it easily becomes:

- A cluster of overlapping components
- A web of conflicting agents
- A source of cross-domain coupling issues
- A maintenance nightmare

**Wrong Approach:** Immediate sprint planning for agent/AI features
```
1. Identify agent/AI feature
2. Create epic → stories → tasks
3. Start sprint implementation
```

**Correct Approach:** Stage-gated development with clear unlock criteria
```
Stage 0 (Governance) → Stage 1 (Basic Tools) → Stage 2 (RAG) → Stage 3 (Multimodal) → Stage 4 (Advanced AI)
```

---

## Stage Definitions

### Stage 0: Governance Foundation ⏳ CURRENT

**Goal:** Establish governance infrastructure BEFORE creating any agents

**Components:**
- governance-core module structure
- 13 domain scanners (P0: artifact, document, state_persistence, agent_ai_rag, file_structure, domain)
- Three enforcement checks (Context First, Agent as Expert, Research Required)
- Artifact Management System
- Context Poisoning Prevention

**Entry Criteria:** Project start
**Exit Criteria:** All 13 P0/P1 scanners operational

**Blocks:** All agent/AI feature implementation

---

### Stage 1: Basic Agent Tools 🔒 LOCKED

**Goal:** Establish foundational agent tooling

**Components:**
- Read-only tools (file read, code search, grep)
- Basic CRUD tools (create, update files)
- Tool permission system
- Agent lifecycle management
- Basic agent-to-file boundaries

**Entry Criteria:** Stage 0 complete (all scanners operational)
**Exit Criteria:** Read-only + CRUD tools tested and validated

**Blocks:** RAG, context management, conversation threads

---

### Stage 2: RAG Context Management 🔒 LOCKED

**Goal:** Implement retrieval-augmented generation with proper isolation

**Components:**
- Workspace-specific context isolation
- Conversation thread storage and retrieval
- Context vector management (embeddings)
- Overlap detection between workspaces
- Context freshness tracking

**Entry Criteria:** Stage 1 complete (basic tools tested)
**Exit Criteria:** Context isolation verified, no cross-workspace leakage

**Blocks:** Multimodal input/output, advanced context features

---

### Stage 3: Multimodal Input/Output 🔒 LOCKED

**Goal:** Add image, audio, video support with proper routing

**Components:**
- Image input processing and storage
- Audio/video support
- Cross-workspace multimodal routing
- Multimodal context isolation (per-workspace media)
- Multimodal permission boundaries

**Entry Criteria:** Stage 2 complete (RAG context isolated)
**Exit Criteria:** Multimodal routing tested, no media leakage

**Blocks:** Advanced multi-agent orchestration

---

### Stage 4: Advanced AI Features 🔒 LOCKED

**Goal:** Multi-agent systems and self-improving capabilities

**Components:**
- Multi-agent orchestration
- Agent-to-agent communication protocols
- Hierarchical agent systems
- Self-improving agents (with safeguards)
- Advanced AI safety measures

**Entry Criteria:** Stage 3 complete (multimodal tested)
**Exit Criteria:** Multi-agent orchestration safe, no runaway loops

**Blocks:** None (final stage)

---

## Gatekeeper Behavior

### When User Requests Stage N Feature

**Example 1: User requests Stage 2 feature while in Stage 0**

```
User: "Add RAG context management for agents"

Governance Report:
┌─────────────────────────────────────────────────────────────┐
│                    GOVERNANCE REPORT                        │
├─────────────────────────────────────────────────────────────┤
│ Status: BLOCK 🔒                                             │
│                                                              │
│ Stage Violation Detected                                     │
│   Requested: Stage 2 (RAG Context Management)               │
│   Current Stage: 0 (Governance Foundation)                  │
│   Required: Complete Stage 1 (Basic Agent Tools) first      │
│                                                              │
│ Stage 0 Progress:                                            │
│   ✅ governance-core module structure                       │
│   ✅ config files (7 files)                                 │
│   ✅ policy files (4 files)                                 │
│   ✅ core services (3 files)                                │
│   ⏳ P0 scanners (2/6 complete)                             │
│   ⏳ P1/P2 scanners (0/7 complete)                          │
│                                                              │
│ To unlock Stage 1:                                           │
│   - Complete all 6 P0 scanners                              │
│   - Validate scanner outputs                                │
│   - Pass governance health check                            │
│                                                              │
│ Type 'I am aware but...' to proceed with warning            │
│ (This will be logged as technical debt)                     │
└─────────────────────────────────────────────────────────────┘
```

**Example 2: User requests Stage 3 feature while in Stage 1**

```
User: "Add image input processing for agents"

Governance Report:
┌─────────────────────────────────────────────────────────────┐
│                    GOVERNANCE REPORT                        │
├─────────────────────────────────────────────────────────────┤
│ Status: BLOCK 🔒                                             │
│                                                              │
│ Stage Violation Detected                                     │
│   Requested: Stage 3 (Multimodal I/O)                       │
│   Current Stage: 1 (Basic Agent Tools)                      │
│   Required: Complete Stage 2 (RAG Context Management) first  │
│                                                              │
│ Why This Order Matters:                                      │
│   - RAG establishes context isolation patterns              │
│   - Multimodal builds on those isolation patterns           │
│   - Skipping RAG will cause cross-workspace media leakage    │
│                                                              │
│ Type 'I am aware but...' to proceed with warning            │
└─────────────────────────────────────────────────────────────┘
```

---

## Stage Transition Criteria

| Stage | Entry Criteria | Exit Criteria | Unlock |
|-------|----------------|---------------|--------|
| 0: Governance | Project start | All 13 scanners operational | Stage 1 |
| 1: Basic Tools | Stage 0 complete | Read-only + CRUD tools tested | Stage 2 |
| 2: RAG | Stage 1 complete | Context isolation verified | Stage 3 |
| 3: Multimodal | Stage 2 complete | Multimodal routing tested | Stage 4 |
| 4: Advanced AI | Stage 3 complete | Multi-agent orchestration safe | None |

### Stage 0 Exit Criteria (Current Focus)

**Must Complete:**
- [ ] artifact-scanner.md
- [ ] document-scanner.md
- [ ] state-persistence-scanner.md
- [ ] agent-ai-rag-scanner.md (P0 - CRITICAL)
- [ ] file-structure-scanner.md (P0 - CRITICAL)
- [ ] domain-scanner.md
- [ ] workspace-scanner.md
- [ ] feature-scanner.md
- [ ] relational-scanner.md
- [ ] journey-scanner.md
- [ ] ux-ui-scanner.md
- [ ] api-contract-scanner.md
- [ ] schema-structure-scanner.md

**Validation:**
- [ ] All scanners run without errors
- [ ] Scanner outputs are accurate
- [ ] Cross-scanner conflicts resolved
- [ ] Governance health check passes

---

## Override Behavior

**Pattern:** `I am aware but...`

```
User: "I am aware but I need to prototype RAG quickly for a demo and will refactor later"

Governance: "⚠️ PROCEED WITH CAUTION - Logged as technical debt
  Debt Ticket: DEBT-8a3f2c1b
  Risk Multiplier: 1.5x (architectural_conflict)
  Estimated Remediation: 8-12 hours

  Dependencies skipped:
    - Stage 1: Basic Agent Tools
    - Context isolation not established

  Known risks:
    - Cross-workspace context leakage
    - No permission boundaries for CRUD
    - Thread storage may conflict with future design

  Review required before Stage 2 implementation."
```

**Debt Tracking:**
- All overrides logged with UUID
- Risk multiplier based on stages skipped
- Remediation estimate provided
- Dependencies skipped documented

---

## Feature Classification by Stage

### Stage 0 Features (Current)
- Domain scanners
- Enforcement checks
- Artifact management
- Context poisoning prevention

### Stage 1 Features (Basic Tools)
- File reading tools
- Code search tools
- Basic CRUD (create, update)
- Tool permissions
- Agent lifecycle

### Stage 2 Features (RAG)
- Conversation threads
- Context vectors/embeddings
- Workspace context isolation
- RAG retrieval
- Context overlap detection

### Stage 3 Features (Multimodal)
- Image input
- Audio input
- Video input
- Multimodal routing
- Media isolation per workspace

### Stage 4 Features (Advanced AI)
- Multi-agent orchestration
- Agent-to-agent communication
- Hierarchical agents
- Self-improving agents
- AI safety measures

---

## Implementation Notes

### Why "Unlocking by Stage"?

1. **Foundation First**: Governance must exist before agents are created
2. **Progressive Complexity**: Each stage builds on the previous
3. **Prevent Chaos**: Without stages, agents would overlap and conflict
4. **Clear Path**: Developers know what to work on next
5. **Safe Progress**: Each stage validates before unlocking the next

### What This Prevents

- ❌ Creating agents before governance exists
- ❌ Implementing RAG before basic tools work
- ❌ Adding multimodal before context is isolated
- ❌ Building multi-agent systems before single agents work
- ❌ Premature optimization of advanced features

### What This Enables

- ✅ Solid foundation before building complex features
- ✅ Clear validation at each stage
- ✅ Prevents "big bang" integration problems
- ✅ Allows focused sprints on specific capabilities
- ✅ Provides escape hatch via "I am aware but..." override

---

**Version:** 2026-01-10
**Next Review:** After Stage 0 completion
