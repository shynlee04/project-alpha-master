# Via-Gent Architecture Document (REMEDIATED)
**Version:** 2.0.0
**Date:** 2026-01-11
**Status:** SINGLE SOURCE OF TRUTH - Connected to BMAD SSOT

---

## Document Navigation

| Section | Description | Connected To |
|---------|-------------|--------------|
| 1 | Executive Summary | PRD, Sprint Status |
| 2 | System Overview | BMAD ADR-004 (Workspace-First) |
| 3 | ADRs (Consolidated) | BMAD Architecture SSOT |
| 4 | True Use Cases | TRUE-USE-CASES document |
| 5 | Current State | Audit Reports |
| 6 | Target State | EPICS-REMEDIATED |
| 7 | Implementation Roadmap | Sprint Plan |

---

## Section 1: Executive Summary

Via-Gent is a browser-based, mobile-first AI development workspace that enables solo developers, learners, and distributed teams to eliminate setup friction and ship applications faster. The platform operates at approximately **70% feature completeness** with sophisticated local-first architecture utilizing WebContainers for browser-based Node.js execution and IndexedDB for persistent storage.

### Verified Metrics (Corrected)

| Metric | Value | Source |
|--------|-------|--------|
| Feature Completeness | 70% | PRD |
| Clean Architecture Compliance | 65% | Architecture Audit (corrected from 75%) |
| God Components | 17 | Component Scan |
| God Stores | 9 | State Architecture Scan |
| Presentation Components | 474 | Component Inventory |
| Error Boundary Coverage | 22.2% | ADR-028 |
| Infrastructure Files | 250+ | Directory Analysis |
| Core Entities | 4 | Core Layer Analysis |

### Architecture Summary

The current architecture exhibits **five distinct layers** following Clean Architecture principles at approximately **65% compliance** (corrected from 75%), with the presentation layer dominating file count at 474 components while the core layer remains minimal with only 4 entities.

The AI invocation system currently exhibits **three different patterns** with inconsistent behavior. The agent system uses a **factory pattern** for provider abstraction with implementations for Anthropic, OpenRouter, OpenAI, and Google.

**Key Architectural Decisions:**
- Workspace-first architecture (BMAD ADR-004)
- Zustand v5 state management with slice pattern
- RAG via Gemini multimodal API (NOT vector database)
- Manual agent mode switching (NOT automatic)
- Bidirectional file synchronization with conflict resolution

---

## Section 2: System Overview

### 2.1 Five-Layer Architecture

Via-Gent implements a **five-layer Clean Architecture** with clear separation of concerns and unidirectional dependency flow from presentation inward toward core entities.

**Layer 1: Core (src/core/entities/)**
The core layer contains enterprise-wide business rules expressed as pure TypeScript entities. Currently contains 4 entity files: `Agent.ts`, `Conversation.ts`, `Provider.ts`, `Tool.ts` (25% of intended coverage).

**Layer 2: Domain (src/domain/services/)**
The domain layer implements application business rules through use cases and domain services. Currently contains 7 services at approximately 50% compliance.

**Layer 3: Infrastructure (src/infrastructure/)**
The infrastructure layer handles external concerns including database implementations, file system adapters, API clients, event bus implementations, and persistence stores. Contains ~250 files.

**Layer 4: Lib (src/lib/)**
The lib layer provides shared utilities and integrations for agent systems, editors, file system operations, webcontainer management, and workspace operations. Contains ~220 files.

**Layer 5: Presentation (src/presentation/)**
The presentation layer contains all React components, custom hooks, and route definitions. Dominates file count at 474 components.

### 2.2 Workspace-First Architecture (BMAD ADR-004)

**Workspace Types:**

| Workspace | description | Tool Focus |
|-----------|---------|------------|
| `ide` | Code development | Files, terminal, search |
| `knowledge` | Knowledge synthesis | RAG, PDF, images, web |
| `study` | Study materials | Notes, flashcards |
| `notes` | Note-taking | Notes, search |

**Key Principle:** All user-facing features are organized around workspaces, not clients. Different clients (desktop, mobile) access the same workspaces through responsive UI.

### 2.3 Cross-Layer Communication Patterns

The architecture enforces **unidirectional dependency flow**:
- Presentation imports from Infrastructure
- Infrastructure imports from Domain interfaces only
- Domain imports from Core entities

Cross-layer communication occurs through:
- Event bus (`src/infrastructure/events/event-bus.ts`)
- Zustand stores for state synchronization
- Facade pattern for agent tools

---

## Section 3: ADRs (Consolidated from BMAD SSOT)

This section consolidates all valid ADRs from the BMAD Architecture Single Source of Truth. For the complete authoritative ADR document, see [BMAD-ARCHITECTURE-SSOT-2026-01-11.md](BMAD-ARCHITECTURE-SSOT-2026-01-11.md).

### Core ADRs

| ADR | Title | Key Decision |
|-----|-------|--------------|
| ADR-001 | Single Source of Truth Principle | One authoritative document only |
| ADR-002 | BMAD-EXT as Active Implementation | `_bmad-ext/` is active, `_bmad/` is legacy |
| ADR-003 | Unified Governance System | Single governance at `modules/governance/` |
| ADR-004 | Workspace-First Architecture | Features organized around workspaces |
| ADR-005 | Agent Orchestrator Mode Switching | **Manual** mode switching (not automatic) |
| ADR-006 | File Synchronization Strategy | Bidirectional with conflict resolution |
| ADR-007 | RAG Implementation | **Gemini multimodal API** (NOT vector DB) |
| ADR-008 | Thread Management | Hierarchical thread system |
| ADR-009 | Tool Registry System | Centralized registry with 10 categories |
| ADR-010 | Epic and Story Governance | Max 4 active epics, 8 stories per epic |
| ADR-011 | Sprint Planning Structure | Phase-based sprints with quality gates |
| ADR-012 | Artifact Lifecycle Management | Tiered TTL system |
| ADR-013 | Context Poisoning Prevention | Active governance scanning |

### Critical Clarifications

**RAG Implementation (ADR-007):**
```
Documented (INCORRECT): "RAG uses embeddings and vector database"
Actual (CORRECT): "RAG uses Google Gemini multimodal API - no vector DB"
```

**Agent Mode Switching (ADR-005):**
```
Documented (INCORRECT): "Automatic mode switching based on context"
Actual (CORRECT): "Manual mode selection only"
```

**Multi-Client Support (ADR-004):**
```
Documented (INCORRECT): "Separate client implementations (phone, desktop)"
Actual (CORRECT): "Workspace-based architecture with responsive UI"
```

---

## Section 4: True Use Cases

This section summarizes the ground truth use cases based on actual implementation. For complete details, see [TRUE-USE-CASES-2026-01-11.md](TRUE-USE-CASES-2026-01-11.md).

### Use Case Summary

| Use Case | Status | Discrepancy |
|----------|--------|-------------|
| Agent CRUD tools | ✅ Confirmed | None |
| RAG operations | ✅ Gemini-based | ⚠️ Docs mention vector DB |
| Multi-client | ✅ Workspace-based | ⚠️ Docs suggest separate clients |
| File sync | ✅ Bidirectional | None |
| Workspace management | ✅ Confirmed | None |
| Project space | ✅ Confirmed | None |
| Thread management | ✅ Confirmed | None |
| Agent orchestrator | ⚠️ Manual switching | ⚠️ Docs suggest auto |
| User permissions | ✅ Multi-layer | None |

### Tool Permission Model

Four-layer permission system:
1. **Tool Level:** Is tool enabled for agent?
2. **Workspace Level:** Is tool available in workspace?
3. **Mode Level:** Is tool allowed in current agent mode?
4. **Trust Level:** auto/prompt/block

**Tool Categories (10 total):**
| Category | Tools | Permission Model |
|----------|-------|------------------|
| `files` | read, write, list, search | Workspace-scoped |
| `terminal` | execute, shell | Trust-based |
| `knowledge` | synthesize, processPDF, processImage | Workspace-scoped |
| `vision` | analyze, OCR | Trust-based |
| `search` | code, text, semantic | Workspace-scoped |
| `web` | scrape, fetch | Trust-based |
| `notes` | create, read, update, delete | Workspace-scoped |
| `unified` | cross-workspace operations | Special permissions |
| `composite` | multi-step workflows | Orchestrator-only |
| `provider` | LLM operations | Admin-level |

---

## Section 5: Current State (Verified from Audit)

### Architecture Health

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Clean Architecture Compliance | 65% | 100% | ⚠️ Needs work |
| God Components | 17 | 0 | ❌ Critical |
| God Stores | 9 | 0 | ❌ Critical |
| Error Boundary Coverage | 22.2% | 80% | ❌ Critical |
| Circular Dependencies | 2 pairs | 0 | ⚠️ Medium |
| Layer Violations | 12 | 0 | ⚠️ Medium |

### God Components (17 identified)

| Component | Lines | Priority |
|-----------|-------|----------|
| MonacoEditor.tsx | 768 | P0 |
| resizable.tsx | 745 | P0 |
| NotesPage.tsx | 712 | P0 |
| KnowledgePage.tsx | 712 | P0 |
| IndexingProgressPanel.tsx | 593 | P0 |
| EnhancedChatInterface.tsx | 592 | P0 |
| ChatConversation.tsx | 522 | P1 |
| dexie-db.ts | 1,169 | P0 |
| useWorkspaceFileSystem.ts | 557 | P0 |
| provider-credentials-slice.ts | 396 | P1 |
| use-app-store.ts | 367 | P1 |
| unified-workspace-context.ts | 367 | P2 |
| session-snapshot-manager.ts | 321 | P2 |
| plugins-store.ts | 316 | P2 |
| schema-migrations.ts | 314 | P2 |
| terminal-store.ts | 307 | P2 |
| useConversationStore.ts | 304 | P2 |

### Critical Issues from Audit

**P0 Issues:**
1. Dual governance systems (governance vs governance-core)
2. LOOP_STATE not initialized (null values)
3. Command path mismatches (point to `_bmad/` instead of `_bmad-ext/`)
4. Conflicting ADR locations
5. Sync race conditions (boolean check isn't thread-safe)

**P1 Issues:**
- Archive sprawl
- Stale workflow definitions
- Duplicate sprint status files
- Epic index inconsistency
- State file duplication

For complete audit details, see:
- [comprehensive-codebase-audit-2026-01-11.md](../audit/comprehensive-codebase-audit-2026-01-11.md)
- [architecture-conflicts-2026-01-11.md](../audit/architecture-conflicts-2026-01-11.md)
- [store-consolidation-analysis-2026-01-11.md](../audit/store-consolidation-analysis-2026-01-11.md)

---

## Section 6: Target State

### Architecture Health Targets

| Metric | Target | Timeline |
|--------|--------|----------|
| Clean Architecture Compliance | 100% | 7 weeks |
| God Components | 0 | 6 weeks |
| God Stores | 0 | 4 weeks |
| Error Boundary Coverage | 80% | 1 week |
| Circular Dependencies | 0 | 2 weeks |
| Layer Violations | 0 | 7 weeks |

### Target ADR Implementation

| ADR | Focus | Target State |
|-----|-------|--------------|
| ADR-007 | RAG | Gemini multimodal clearly documented |
| ADR-005 | Agent Modes | Manual switching, roadmap for auto |
| ADR-004 | Workspace | All docs updated to workspace-based |
| ADR-006 | File Sync | Race conditions fixed |
| ADR-009 | Tools | All tools categorized |

---

## Section 7: Implementation Roadmap

### Current Active Epics

| Epic | Progress | Status | Priority |
|------|----------|--------|----------|
| EPIC-FS | 28.6% (4/14) | ACTIVE | P0 |
| EPIC-39 | 67% (4/6) | ACTIVE | P1 |
| EPIC-40 | 100% | COMPLETED | P1 |

### Blocked Epics

| Epic | Blocking Reason |
|------|-----------------|
| EPIC-38 | Waits for EPIC-FS 100% |

### Remediation Phases

**Phase 1: Critical Fixes (Immediate)**
- Remove deprecated governance modules
- Initialize LOOP_STATE
- Update command paths
- Complete EPIC-FS stories

**Phase 2: Documentation Corrections**
- Fix RAG documentation (remove vector DB refs)
- Update agent mode documentation
- Correct client architecture descriptions

**Phase 3: New Epics**
- EPIC-ARCH: Architecture Cleanup
- Agent mode enhancements
- Sync race condition fixes

For complete remediation details, see:
- [EPIC-STORY-REMEDIATION-2026-01-11.md](EPIC-STORY-REMEDIATION-2026-01-11.md)
- [EPICS-REMEDIATED-2026-01-11.md](EPICS-REMEDIATED-2026-01-11.md) (to be created)
- [sprint-plan-REMEDIATED-2026-01-11.md](../sprint-artifacts/sprint-plan-REMEDIATED-2026-01-11.md) (to be created)

---

## Appendix A: Evidence Traceability Matrix

| Claim | Section | Evidence Source | Confidence |
|-------|---------|-----------------|------------|
| 70% feature completeness | Executive Summary | PRD:24-28 | HIGH |
| 5-layer architecture | System Overview | Directory Structure:36-45 | HIGH |
| 65% Clean Architecture compliance | Current State | Architecture Audit 2026-01-11 | HIGH |
| 17 god components | Current State | Component Scan 2026-01-11 | HIGH |
| 9 god stores | Current State | State Architecture Scan 2026-01-11 | HIGH |
| 22.2% error boundary coverage | Current State | Component Inventory 2026-01-11 | HIGH |
| RAG uses Gemini (not vector DB) | ADR-007 | TRUE-USE-CASES:57-85 | HIGH |
| Manual mode switching | ADR-005 | TRUE-USE-CASES:255-286 | HIGH |
| Workspace-based (not client-based) | ADR-004 | TRUE-USE-CASES:87-115 | HIGH |

---

## Appendix B: Document Connections

### Single Sources of Truth

| Topic | Document | Location |
|-------|----------|----------|
| BMAD ADRs | BMAD-ARCHITECTURE-SSOT-2026-01-11.md | `_bmad-output/architecture/` |
| True Use Cases | TRUE-USE-CASES-2026-01-11.md | `_bmad-output/architecture/` |
| Poisoning Context | POISONING-CONTEXT-2026-01-11.md | `_bmad-output/architecture/` |
| Epic Remediation | EPIC-STORY-REMEDIATION-2026-01-11.md | `_bmad-output/architecture/` |
| Sprint Status | sprint-status.yaml | `_bmad-output/sprint-artifacts/` |

### Audit Reports

| Report | Location |
|--------|----------|
| Comprehensive Audit | `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md` |
| Architecture Conflicts | `_bmad-output/audit/architecture-conflicts-2026-01-11.md` |
| Store Consolidation | `_bmad-output/audit/store-consolidation-analysis-2026-01-11.md` |
| Type Definition Audit | `_bmad-output/audit/type-definition-audit-2026-01-11.md` |
| Orphaned Files | `_bmad-output/audit/orphaned-files-analysis-2026-01-11.md` |
| Performance Issues | `_bmad-output/audit/performance-issues-analysis-2026-01-11.md` |
| Poisoning Isolation | `_bmad-output/audit/POISONING-CONTEXT-ISOLATED-2026-01-11.md` |

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-07 | 1.0.0 | Initial architecture document | BMAD Analysis |
| 2026-01-11 | 2.0.0 | Remediated - Connected to BMAD SSOT, fixed false data, added clarifications | BMAD Remediation |

---

*Architecture Document Remediated: 2026-01-11*
*Single Source of Truth Established*
*Connected to BMAD Architecture SSOT*
*Ready for Implementation*
