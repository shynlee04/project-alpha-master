# ARTIFACT 6: BMAD-EXT Modules Analysis
**Date:** 2026-01-13
**Focus:** _bmad-ext/modules Directory
**Status:** INVESTIGATION COMPLETE

---

## ULTRA-THINK: What This Artifact Is

**This IS:**
- ✅ Evidence-based investigation of _bmad-ext/modules
- ✅ Module descriptions and relationships documented
- ✅ Governance and workflow modules analyzed
- ✅ Agent definitions extracted

**This is NOT:**
- ❌ Assumptions without verification
- ❌ Implementation recommendations
- ❌ Solutions without investigation

---

## MODULE INVENTORY

### Core Modules
| Module | description | Related To |
|--------|---------|------------|
| arc-v2 | Architecture remediation v2.0 | All workspaces |
| governance | Unified governance framework | All workspaces |
| workspace-architect | File system architecture | All workspaces |

### Governance Modules (agent-rag)
| Module | description | Related To |
|--------|---------|------------|
| conversation-threads-governance | Conversation thread management | Chat, Notes |
| multimodality-governance | Input/output multimodality | Chat, Notes |
| rag-context-governance | RAG indexing and context | Chat, Notes |
| staging-by-phase-governance | Feature rollout phases | All workspaces |
| tools-governance | Tool CRUD operations | Chat, Notes |

---

## MODULE 1: arc-v2 (Architecture Remediation)

**File:** `_bmad-ext/modules/arc-v2/MODULE.md`

**description:** 6-domain architecture model for systematic issues

**Key Features:**
- Domains: Persistence, Sync, State, Routing, Agents, RAG, UX
- Diagnostic-first approach (always scan before planning)
- Domain isolation with clear boundaries
- Platform-aware strategies (FSA vs IndexedDB)
- Journey-centric remediation

**Agents Provided:**
- context-validator: Validates context freshness
- domain-scanner: Scans for architectural issues
- store-refactorer: Refactors god stores
- journey-repair: Fixes broken user flows

**Workflows:**
- diagnostic-first: Scan → Analyze → Plan
- domain-remediation: Targeted fixes per domain
- journey-repair: End-to-end flow fixes

---

## MODULE 2: governance (Unified Governance)

**File:** `_bmad-ext/modules/governance/MODULE.md`

**description:** Unified governance for all extension layer

**Key Features:**
- 4-tier TTL system for document management
- Self-governance triggers on session/artifact/story completion
- Three enforcement checks (context-first, expert analysis, research trigger)
- Realistic timing governance based on actual data
- Artifact lifecycle management

**Workflows:**
- self-governance-cycle: Auto-cleanup of stale artifacts
- stale-detection: Identifies outdated documents
- artifact-scanner: Scans for context poisoning

---

## MODULE 3: workspace-architect

**File:** `_bmad-ext/modules/arc-v2/agents/workspace-architect.md`

**description:** File system and architecture remediation

**Key Features:**
- Maintains 4-layer clean architecture (Core, Domain, Infrastructure, Presentation)
- Optimizes file structure across workspaces
- Consolidates cross-workspace code duplication
- Creates barrel exports for clean imports
- Manages architectural refactoring with rollback capability

**Use Cases:**
- Architecture violations detected
- File reorganization needed
- Cross-workspace consolidation
- Import path cleanup

---

## MODULE 4: conversation-threads-governance

**File:** `_bmad-ext/modules/governance/agent-rag/conversation-threads.md`

**description:** Centralize and govern user-agent conversation threads

**Key Features:**
- Prevents scattered conversations across multiple files
- Maintains audit trail of decisions
- Ensures conversation continuity between agent handoffs
- Defines thread structure with metadata and context
- Implements conversation archiving rules
- Manages handoff protocols between agents

**Use Cases:**
- Agent handoffs during story execution
- Conversation persistence across sessions
- Audit trail requirements

---

## MODULE 5: multimodality-governance

**File:** `_bmad-ext/modules/governance/agent-rag/multimodality-governance.md`

**description:** Govern input/output multimodality across workspaces

**Key Features:**
- Tracks supported input/output types per workspace (text, image, audio, video, file)
- Defines workspace capabilities matrix (desktop, web, mobile)
- Ensures consistency across different platforms
- Manages tool manipulation restrictions
- Implements fallback mechanisms for unsupported modalities

**Workspace Capabilities:**
| Workspace | Inputs | Outputs | Tools |
|-----------|--------|---------|-------|
| IDE | Text, images, code | Code, files | File, terminal |
| Notes | Text, images, files | Blocks, text | Note CRUD |
| Knowledge | Text, files | Text, citations | RAG search |

---

## MODULE 6: rag-context-governance

**File:** `_bmad-ext/modules/governance/agent-rag/rag-context-governance.md`

**description:** Govern RAG indexing, entity context, and conversation threads

**Key Features:**
- Prevents context poisoning from stale artifacts
- Manages entity lifecycle for RAG systems
- Defines index strategies (full, chunk, embedding)
- Implements context gathering rules
- Ensures context freshness with TTL checks
- Prevents duplicate or oversized context

**Use Cases:**
- RAG indexing for notes workspace
- Context gathering for AI responses
- Entity lifecycle management

---

## MODULE 7: staging-by-phase-governance

**File:** `_bmad-ext/modules/governance/agent-rag/staging-by-phase.md`

**description:** Govern feature unlocking by phase rather than sprint

**Key Features:**
- 5 phases of feature rollout: foundation, consolidation, execution, remediation, enhancement
- Dependency management between phases
- Prerequisites validation before unlocking
- Rollback protocols for failed deployments
- Quality gates for each phase

**Phase Gates:**
1. **Foundation:** Basic infrastructure
2. **Consolidation:** Code unification
3. **Execution:** Feature delivery
4. **Remediation:** Technical debt cleanup
5. **Enhancement:** Advanced features

---

## MODULE 8: tools-governance

**File:** `_bmad-ext/modules/governance/agent-rag/tools-governance.md`

**description:** Track and govern tool CRUD operations

**Key Features:**
- Registers all tools and their CRUD operations
- Implements safeguards for high-risk operations
- Tracks tool usage for audit trail
- Pre-execution validation
- Delete protection and rollback capabilities

**Tool Safety:**
- High-risk tools: File delete, database operations
- Medium-risk tools: File write, terminal commands
- Low-risk tools: File read, search

---

## AGENT SUMMARY

| Agent | description | Module |
|-------|---------|---------|
| workspace-architect | File system architecture | arc-v2 |
| context-validator | Validates context freshness | governance |
| domain-scanner | Scans for issues | arc-v2 |
| store-refactorer | Refactors god stores | arc-v2 |
| journey-repair | Fixes user flows | arc-v2 |
| artifact-scanner | Scans for poisoning | governance |

---

## WORKFLOW SUMMARY

| Workflow | description | Module |
|----------|---------|--------|
| diagnostic-first | Scan before plan | arc-v2 |
| domain-remediation | Targeted fixes | arc-v2 |
| journey-repair | Flow fixes | arc-v2 |
| self-governance-cycle | Auto cleanup | governance |
| stale-detection | Find outdated | governance |

---

## IDENTIFIED ISSUES

### Medium (P2)
1. **Module complexity** - 8+ modules with overlapping responsibilities
2. **Documentation sprawl** - Each module has own markdown but no unified index
3. **Agent coordination** - Multiple agents but no clear orchestration

---

## DELIVERABLES STATUS

- ✅ All _bmad-ext modules catalogued
- ✅ Module descriptions documented
- ✅ Agent inventory created
- ✅ Workflow inventory created
- ✅ Relationships mapped

---

**Last Updated:** 2026-01-13
**Version:** 1.0
