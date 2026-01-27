# Via-Gent Epics and Stories

**Version:** 3.1.0
**Date:** 2026-01-27
**Status:** ACTIVE - Updated with EPIC-0.5 Retrospective Findings
**Last Updated:** 2026-01-27

---

## ⚠️ CRITICAL UPDATE (2026-01-27)

**Phase 1A Reality Check**: Claimed at 60% but analysis reveals **~30% true completion**.

**Root Cause**: EPIC-0 and EPIC-0.5 focused on layout/UI improvements but missed **Plugin Coordination Layer**.

**19 Coordination Gaps Identified** - See EPIC-0.6 for remediation.

**Retrospective**: `_bmad-output/retrospectives/EPIC-0.5-RETROSPECTIVE-2026-01-27.md`

---

## ⚡ Quick Reference

### Phase Overview

| Phase | Epic | Progress | Priority | Status | Target Completion |
|--------|-------|----------|----------|-----------------|
| **Phase 1A Coordination** | EPIC-0.6 | 0% | **P0 BLOCKER** | 2026-01-29 |
| **Phase 1A Remediation** | EPIC-0.5 | PARTIALLY_COMPLETE (19 gaps) | P0 CRITICAL | INCOMPLETE |
| **Phase 1A** | EPIC-CC-AR02AR03 | 37.5% (3/8 stories) | P0 CRITICAL | 2026-01-28 |
| **Foundation** | EPIC-ARCH-04-CC | 95% (CC-04 E2E pending) | P0 CRITICAL | 2026-01-26 |
| **Foundation** | EPIC-UX-GLOBAL-UI | 75% (3/4 stories) | P0 CRITICAL | 2026-01-26 |
| **Foundation** | EPIC-E2E-TOOLS | READY_FOR_PLANNING | P0 CRITICAL | - |
| **Phase 1B** | EPIC-PH1B-BYOK-NOTES | BLOCKED_BY_EPIC-0.6 | P0 HIGH | 2026-02-01 |
| **Phase 2** | EPIC-PH2-CHAT-AGENTS | BLOCKED_BY_PHASE_1A | P0 HIGH | 2026-02-02 |
| **Phase 3** | EPIC-PH3-ADVANCED-PATTERNS | BLOCKED_BY_PHASE_2 | P1 HIGH | 2026-02-10 |

### Active Epics Summary

| Metric | Count |
|--------|-------|
| **Total Active Epics** | 8 (Including EPIC-0.6) |
| **P0 Blocker Epics** | 4 (EPIC-0.6 + Phase 1A + Foundation) |
| **P1 High Priority Epics** | 4 (Phase 1B, 2, 3) |
| **Archived Legacy Epics** | 23 (EPIC-ARCH-01/02/03, FS, 38, 39, 40, 45, 46, CC-01 through CC-12, EPIC-0.5 partial) |

---

## 📋 Authoritative Sources

This document is **100% aligned** with new-fundamental-truths.md v2.0.0 and architecture.md v3.0.0.

| Document | Version | Alignment | Key Decisions |
|---------|----------|-----------|---------------|
| **new-fundamental-truths.md** | 2.0.0 | Project-centric architecture, plugin system, orchestrator pattern, TanStack AI SDK |
| **architecture.md** | 3.0.0 | Clean Architecture with 5 layers, plugin system, 3-phase approach |
| **prd.md** | 2.0.0 | Project-centric development environment, 3-phase approach |
| **the-3-phase-approach.md** | - | Phase breakdown (1A, 1B, 2, 3) |
| **EPIC-STORY-INVENTORY-2026-01-26** | - | Epic consolidation recommendations, gap analysis |
| **ADR-039** | PROPOSED | Unified Architecture Fundamentals (v2.0.0 Alignment) |

**Related Documents:**
- `_bmad-output/planning-artifacts/epics/EPIC-CC-AR02AR03-plugin-system-phase1a-2026-01-26.md`
- `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-CC-fsa-handle-lifecycle-2026-01-26.md`
- `_bmad-output/planning-artifacts/epics/EPIC-UX-GLOBAL-UI-2026-01-26.md`

---

## Phase 1A: Non-AI Core & Plugin System

### Objective

Establish project-centric architecture with plugin system, platform-aware defaults, and IDE foundation features (Terminal, Monaco, FileTree, Preview).

### Entry Criteria

- ADR-039 approved (Unified Architecture Fundamentals)
- PlatformContract interface fully implemented
- Plugin registry and FeaturePlugin interface defined
- StorageGateway abstraction complete (FSA/IDB adapters)
- Single `/$projectId` route operational
- Chrome 122+ for FSA persistent permissions
- Chrome 129+ for structured clone optimization

### Current Progress: 30% (CORRECTED 2026-01-27)

**Previous Claim**: 45% → **Actual**: 30% after EPIC-0.5 retrospective.

| Component | Status | Blockers | Corrected Status |
|-----------|--------|-----------|------------------|
| **Project Management System** | PARTIAL | FSA handle lifecycle incomplete | PARTIAL |
| **Monaco Editor Plugin** | ~~POC STUB~~ | ~~Real Monaco Editor missing~~ | ✅ REAL MONACO (CC-AR-05) |
| **Terminal Plugin** | ~~COMPLETE~~ | ~~WebContainer integration working~~ | ⚠️ POC ONLY (no process registry) |
| **FileTree Plugin** | ~~COMPLETE~~ | ~~Sync integration working~~ | ⚠️ 80% (no coordination contract) |
| **Notes Plugin** | PARTIAL | Markdown sync needs work | PARTIAL (hardcoded noteId) |
| **Plugin Layout System** | ~~GOD COMPONENT~~ | ~~1034 lines~~ | ✅ 305 lines (CC-AR-08) |
| **Platform-First Defaults** | NOT WIRED | platform-defaults.ts exists but not used | NOT WIRED |
| **Plugin Coordination Layer** | **NOT STARTED** | **19 gaps identified** | **P0 BLOCKER** |

---

## EPIC-0.6: Plugin Coordination Layer (P0 BLOCKER)

**Priority:** P0 BLOCKER - Must complete before Phase 1B
**Status:** 0% (New Epic)
**Created:** 2026-01-27
**Estimated:** 20-30 hours (3-4 days)
**Target Completion:** 2026-01-29

**Source**: EPIC-0.5 Retrospective - 19 coordination gaps identified

**Description:**
Create the missing Plugin Coordination Layer. EPIC-0 and EPIC-0.5 focused on individual plugin fixes but plugins remain isolated islands. This epic establishes shared state coordination between plugins.

### P0 Stories (Coordination Core)

| Story | Title | Priority | Team | Effort | Status |
|-------|-------|----------|------|--------|--------|
| **0.6-01** | Create PluginCoordinationContext with SharedDocument state | P0 | A | 4-6h | ⏳ READY |
| **0.6-02** | Add "who has file open" tracking to coordination context | P0 | A | 2-3h | ⏳ BLOCKED (by 0.6-01) |
| **0.6-03** | Implement write-lock mechanism for concurrent edit prevention | P0 | B | 2-3h | ⏳ BLOCKED (by 0.6-01) |
| **0.6-04** | Create PluginCapability interface and registry | P0 | A | 3-4h | ⏳ READY |

### P1 Stories (Terminal Production)

| Story | Title | Priority | Team | Effort | Status |
|-------|-------|----------|------|--------|--------|
| **0.6-05** | Boot WebContainer on Terminal mount | P1 | B | 4-6h | ⏳ READY |
| **0.6-06** | Mount FSA files to WebContainer | P1 | B | 4-6h | ⏳ BLOCKED (by 0.6-05) |
| **0.6-07** | Implement process registry for Terminal | P1 | B | 2-3h | ⏳ BLOCKED (by 0.6-05) |
| **0.6-08** | Emit preview URL events from Terminal | P1 | B | 2h | ⏳ BLOCKED (by 0.6-07) |

### P1 Stories (Preview Integration)

| Story | Title | Priority | Team | Effort | Status |
|-------|-------|----------|------|--------|--------|
| **0.6-09** | Wire Preview to Terminal URL events | P1 | A | 2-3h | ⏳ BLOCKED (by 0.6-08) |
| **0.6-10** | Implement graceful fallback for unsupported devices | P1 | A | 2h | ⏳ READY |

### P2 Stories (Notes Mirroring)

| Story | Title | Priority | Team | Effort | Status |
|-------|-------|----------|------|--------|--------|
| **0.6-11** | Replace hardcoded noteId with route parameter | P2 | A | 1-2h | ⏳ READY |
| **0.6-12** | Implement Monaco ↔ Notes mirroring via coordination context | P2 | B | 4-6h | ⏳ BLOCKED (by 0.6-01, 0.6-11) |

**Acceptance Criteria:**
1. Plugins can share state about which file is currently being edited
2. Write-lock prevents concurrent edits to same file from different plugins
3. Terminal boots WebContainer and mounts FSA files
4. Preview displays URL from Terminal output
5. Notes uses route parameter for noteId, not hardcoded

**Dependencies:**
- EPIC-ARCH-04-CC (CC-04 E2E complete)
- `file-event-bus.ts` exists (infrastructure ready)

**Artifacts:**
- Retrospective: `_bmad-output/retrospectives/EPIC-0.5-RETROSPECTIVE-2026-01-27.md`
- Gap Analysis: 19 coordination gaps documented in retrospective

---

## EPIC-0.5: FileTree & Plugin System Maturity (PARTIALLY_COMPLETE)

**Priority:** ARCHIVED - Superseded by EPIC-0.6
**Status:** PARTIALLY_COMPLETE - 19 coordination gaps transferred to EPIC-0.6
**Completed:** 2026-01-27
**Retrospective:** `_bmad-output/retrospectives/EPIC-0.5-RETROSPECTIVE-2026-01-27.md`

**What Was Completed:**
- ✅ Real Monaco Editor (CC-AR-05)
- ✅ PluginLayout split (305 lines from 1034)
- ✅ Store hydration fix (_hasHydrated flag)
- ✅ i18n keys added
- ✅ Preview Plugin created (POC)
- ✅ File Event Bus infrastructure

**What Was NOT Completed (19 Gaps):**
- ❌ PluginCoordinationContext (not started)
- ❌ Shared ActiveDocument state (not started)
- ❌ Terminal WebContainer boot (POC only)
- ❌ Preview URL integration (no event source)
- ❌ Notes hardcoded noteId (not fixed)
- ❌ Write-lock mechanism (not started)
- ❌ Plugin capability declarations (not started)

---

## EPIC-CC-AR02AR03: Plugin System Complete Rework for Phase 1A

**Priority:** P0 CRITICAL
**Status:** 37.5% COMPLETE (3 of 8 stories done)
**Created:** 2026-01-26
**Estimated:** 16-24 hours (2-3 days)
**Target Completion:** 2026-01-28

**Remediates:** EPIC-ARCH-02 (70% true), EPIC-ARCH-03 (45% true)

**Blockers:**
- EPIC-ARCH-04-CC (FSA handle lifecycle) - 95% complete, CC-04 E2E pending
- EPIC-UX-GLOBAL-UI (75% complete) - foundation UI work

**Description:**
Remediate premature completion of EPIC-ARCH-02 (Feature Plugin Architecture) and EPIC-ARCH-03 (Layout System & UX). Fix all Phase 1A blockers: Monaco POC stub, PluginLayout god component, 40+ i18n keys missing, store hydration race condition, toggle-based layout.

### Stories

| Story | Title | Priority | Team | Effort | Status | Completed |
|-------|-------|----------|------|----------|------------|
| **CC-AR-01** | Add All Missing i18n Translation Keys | P0 | A | 2h | ⏳ READY |
| **CC-AR-02** | Wire platform-defaults.ts to Route | P0 | A | 2-3h | ⏳ READY |
| **CC-AR-03** | Fix Store Hydration Race Condition | P0 | B | 2-3h | ✅ COMPLETE (2026-01-26) |
| **CC-AR-04** | Replace Drag-Drop with Toggle-Based Layout | P0 | A | 4-6h | ⏳ READY |
| **CC-AR-05** | Replace Monaco POC with Real Monaco Editor | P1 | B | 4-6h | ✅ COMPLETE (2026-01-26) |
| **CC-AR-06** | Implement Preview Plugin (WebContainer) | P1 | B | 4-6h | ✅ COMPLETE (2026-01-26) |
| **CC-AR-07** | Archive Legacy/Duplicate Files | P2 | A | 1h | ⏳ BLOCKED (by CC-AR-04) |
| **CC-AR-08** | Split PluginLayout.tsx (1034 Lines) | P2 | B | 2-3h | ⏳ BLOCKED (by CC-AR-04) |

**Dependencies:**
```
CC-AR-01 (2h) → CC-AR-02 (3h) → CC-AR-04 (6h) → CC-AR-07 (1h)
                              ↓
                        CC-AR-08 (3h)

CC-AR-03 (3h) → CC-AR-05 (6h) → CC-AR-06 (6h)
```

**Files Owned (Team A):**
- `src/i18n/en.json`
- `src/i18n/vi.json`
- `src/routes/$projectId.tsx`
- `src/presentation/layouts/PluginLayout.tsx`

**Files Owned (Team B):**
- `src/presentation/layouts/PluginLayoutStore.ts`
- `src/plugins/monaco/MonacoPlugin.tsx`
- `src/plugins/preview/PreviewPlugin.tsx`

---

## EPIC-ARCH-04-CC: FSA Handle Lifecycle Integration

**Priority:** P0 CRITICAL
**Status:** 95% COMPLETE (CC-04 E2E pending)
**Created:** 2026-01-25
**Estimated:** 4-6 hours
**Target Completion:** 2026-01-26

**Blocks:** ALL PHASES (1A, 1B, 2, 3) - FSA handle lifecycle is foundational

**Description:**
Integrate FSA handle lifecycle into ProjectContextProvider. Add `initialHandle` prop, restore handle from IndexedDB, pass to StorageAdapterFactory, and wire PermissionOverlay for permission persistence/reinit.

### Stories

| Story | Title | Priority | Team | Effort | Status | Completed |
|-------|-------|----------|------|----------|------------|
| **CC-01** | Add initialHandle Prop and FSA Restore Logic | P0 | A | 2h | ✅ COMPLETE (2026-01-26) |
| **CC-02** | Wire PermissionOverlay with Persist and Reinit | P0 | A | 1h | ✅ COMPLETE (2026-01-26) |
| **CC-03** | Wire Route to Pass initialHandle | P0 | A | 1h | ✅ COMPLETE (2026-01-26) |
| **CC-04** | End-to-End Validation with Evidence | P0 | real-world-validator | 1.5h | ⏳ READY (E2E execution pending) |

**Files Owned:**
- `src/infrastructure/context/project-context.tsx`
- `src/routes/$projectId.tsx`
- `src/presentation/components/layout/PermissionOverlay.tsx`

---

## EPIC-UX-GLOBAL-UI: Global UI Improvements & 8-Bit Compliance

**Priority:** P0 CRITICAL
**Status:** 75% COMPLETE (3 of 4 stories done)
**Created:** 2026-01-26
**Estimated:** 29-33 hours

**Description:**
Implement system rail, fix color palette enforcement, ensure 8-bit design compliance, and mobile responsive fixes. Foundation work for all phases.

### Stories

| Story | Title | Priority | Team | Effort | Status | Completed |
|-------|-------|----------|------|----------|------------|
| **UX-05** | Implement System Rail | P0 | B | 4h | ✅ COMPLETE (2026-01-26) |
| **UX-06** | Fix PluginToolbar/Layout (Blue to Orange) | P0 | B | 4h | ✅ COMPLETE (2026-01-26) |
| **UX-08** | Color Palette Enforcement | P1 | B | 6h | ✅ COMPLETE (2026-01-26) |
| **UX-10** | Mobile Responsive Fixes | P2 | B | 12h | ⏳ DEFERRED (lower priority) |

**Files Owned:**
- `src/styles/tokens.css`
- `src/presentation/components/layout/SystemRail.tsx`
- `src/presentation/components/layout/PluginToolbar.tsx`
- `src/presentation/layouts/PluginLayout.tsx`
- `src/plugins/monaco/MonacoPlugin.tsx`
- `src/infrastructure/context/project-context.tsx`
- `src/presentation/components/onboarding/LayoutOnboarding.tsx`
- `src/plugins/filetree/FileTreePlugin.tsx`
- `src/presentation/components/sidebar/ProjectSidebar.tsx`
- `src/i18n/en.json`
- `src/i18n/vi.json`

---

## EPIC-E2E-TOOLS: Browser Automation & E2E Testing Framework

**Priority:** P0 CRITICAL
**Status:** READY_FOR_PLANNING
**Created:** 2026-01-25
**Estimated:** 4-6 hours

**Description:**
Install Playwright dependencies, create E2E test framework, and re-execute E2E User Journey Investigation. Enables verification of user interactions, UI behavior, and feature completeness. EPIC-ARCH-03 cannot be marked "validated" without E2E validation.

### Stories

| Story | Title | Priority | Team | Effort | Status |
|-------|-------|----------|------|----------|
| **E2E-TOOLS-01** | Install Playwright Dependencies | P0 | - | 1-2h | ⏳ READY |
| **E2E-TOOLS-02** | Create E2E Test Framework | P0 | - | 2-3h | ⏳ READY |
| **E2E-TOOLS-03** | Re-Execute E2E User Journey Investigation | P0 | - | 2-3h | ⏳ READY |

**Success Criteria:**
- All 5 user journeys can be executed via Playwright
- Screenshots captured at each checkpoint
- Comprehensive E2E report generated
- Remediation backlog created (if issues found)
- EPIC-ARCH-03 can be marked as "validated"

---

## Phase 1B: BYOK & Notes Features

### Objective

Implement TanStack AI SDK integration for all LLM calls and complete Notes plugin with AI features.

### Entry Criteria

- Phase 1A 100% complete
- TanStack AI SDK integrated and tested
- Provider adapters for all first-tier providers
- Project-scoped BYOK vault operational
- Notes plugin with BlockNote editor and AI commands
- EPIC-CC-AR02AR03 100% complete

### Current Progress: 0% (Not Started)

---

## EPIC-PH1B-BYOK-NOTES: BYOK Vault & Notes Plugin

**Priority:** P0 HIGH
**Status:** READY_FOR_EXECUTION
**Created:** 2026-01-26
**Estimated:** 20-30 hours (3-4 days)
**Target Completion:** 2026-02-03

**Depends On:** EPIC-CC-AR02AR03 (Phase 1A), EPIC-E2E-TOOLS

**Description:**
Complete TanStack AI SDK integration for all LLM calls. Implement provider adapters for first-tier providers (Gemini, OpenRouter, OpenAI, Anthropic) and second-tier providers (Grok, Ollama). Create project-scoped BYOK vault with AES-256-GCM encryption. Complete Notes plugin with BlockNote editor and AI features (summarize, expand, organize, cite), with bidirectional Markdown sync.

### Stories

| Story | Title | Priority | Team | Effort | Status |
|-------|-------|----------|------|----------|
| **BYOK-01** | Implement TanStack AI SDK Client | P0 | A | 4-6h | ⏳ READY |
| **BYOK-02** | Create Gemini Provider Adapter | P0 | A | 2-3h | ⏳ READY |
| **BYOK-03** | Create OpenRouter Provider Adapter | P0 | A | 2-3h | ⏳ READY |
| **BYOK-04** | Create OpenAI Provider Adapter | P0 | A | 2-3h | ⏳ READY |
| **BYOK-05** | Create Anthropic Provider Adapter | P0 | A | 2-3h | ⏳ READY |
| **BYOK-06** | Create Grok Provider Adapter (Second-Tier) | P1 | A | 2h | ⏳ READY |
| **BYOK-07** | Create Ollama Provider Adapter (Second-Tier) | P1 | A | 2h | ⏳ READY |
| **BYOK-08** | Implement Fallback Chain | P0 | A | 3-4h | ⏳ READY |
| **BYOK-09** | Create Project-Scoped BYOK Vault | P0 | A | 3h | ⏳ READY |
| **BYOK-10** | Implement Secure Key Distribution | P0 | A | 4-6h | ⏳ READY |
| **BYOK-11** | Migrate Existing Providers to TanStack AI SDK | P1 | A | 4h | ⏳ READY |
| **BYOK-12** | Implement Settings UI Integration | P1 | B | 3h | ⏳ READY |
| **NOTES-01** | Complete BlockNote Editor Integration | P0 | A | 6h | ⏳ READY |
| **NOTES-02** | Implement AI Commands (Summarize) | P1 | A | 2h | ⏳ READY |
| **NOTES-03** | Implement AI Commands (Expand) | P1 | A | 2h | ⏳ READY |
| **NOTES-04** | Implement AI Commands (Organize) | P1 | A | 2h | ⏳ READY |
| **NOTES-05** | Implement AI Commands (Cite) | P1 | A | 2h | ⏳ READY |
| **NOTES-06** | Implement Prompt Chains | P1 | A | 2h | ⏳ READY |
| **NOTES-07** | Implement Text Selection Transformations | P1 | A | 2h | ⏳ READY |
| **NOTES-08** | Implement Notes ↔ Markdown Bidirectional Sync | P0 | A | 4-6h | ⏳ READY |
| **NOTES-09** | Add Conflict Resolution UI | P1 | B | 3h | ⏳ READY |
| **NOTES-10** | Test Desktop FSA and Mobile IndexedDB | P1 | - | 2h | ⏳ READY |
| **NOTES-11** | Implement Asset Indexing for RAG | P2 | B | 3h | ⏳ READY |

**Files Owned:**
- `src/infrastructure/ai/tanstack-ai-client.ts`
- `src/infrastructure/ai/providers/gemini-adapter.ts`
- `src/infrastructure/ai/providers/openrouter-adapter.ts`
- `src/infrastructure/ai/providers/openai-adapter.ts`
- `src/infrastructure/ai/providers/anthropic-adapter.ts`
- `src/infrastructure/ai/providers/grok-adapter.ts`
- `src/infrastructure/ai/providers/ollama-adapter.ts`
- `src/infrastructure/vault/byok-vault.ts`
- `src/plugins/notes/NotesPlugin.tsx`
- `src/presentation/components/settings/ProviderConfig.tsx`

---

## Phase 2: Chat Cascade, Thread Management, Agents

### Objective

Implement chat cascade plugin with thread management, agent orchestrator pattern, and domain-specific agents.

### Entry Criteria

- Phase 1B 100% complete
- TanStack AI SDK fully integrated
- Plugin system operational
- Agent tool registry defined

### Current Progress: 0% (Not Started)

---

## EPIC-PH2-CHAT-AGENTS: Chat Cascade & Agent Orchestration

**Priority:** P0 HIGH
**Status:** READY_FOR_EXECUTION
**Created:** 2026-01-26
**Estimated:** 40-60 hours (5-8 days)
**Target Completion:** 2026-02-15

**Depends On:** EPIC-PH1B-BYOK-NOTES

**Description:**
Implement chat cascade plugin with project-scoped thread management, 150K token limit, 90% compaction threshold, multi-format block rendering (code, rich text, HTML artifacts, streaming tokens), and bi-directional file references. Implement orchestrator pattern with read-only tools, mode switching, task delegation. Create domain-specific agents (dev-ext, architect-ext, analyst-ext, ux-designer-ext, tech-writer-ext) with focused tool groups. Implement tool permission matrix with ask/allow/den workflows. Configure agent tool registry.

### Stories

| Story | Title | Priority | Team | Effort | Status |
|-------|-------|----------|------|----------|
| **CHAT-01** | Implement Chat Cascade Plugin Structure | P0 | A | 4-6h | ⏳ READY |
| **CHAT-02** | Implement Thread Architecture (Main/Sub/Compaction) | P0 | A | 6h | ⏳ READY |
| **CHAT-03** | Implement Context Window Management (150K limit) | P0 | A | 4-6h | ⏳ READY |
| **CHAT-04** | Implement Auto-Compaction at 90% Threshold | P0 | A | 6h | ⏳ READY |
| **CHAT-05** | Implement Multi-Format Block Rendering | P0 | A | 6-8h | ⏳ READY |
| **CHAT-06** | Implement Bi-Directional File References (@ syntax) | P0 | A | 4-6h | ⏳ READY |
| **CHAT-07** | Implement File-to-Chat Operations (Insert/Copy) | P1 | A | 3h | ⏳ READY |
| **CHAT-08** | Implement Orchestrator Pattern | P0 | A | 6h | ⏳ READY |
| **CHAT-09** | Create Domain-Specific Agents (5 agents) | P0 | A | 12h | ⏳ READY |
| **CHAT-10** | Implement Tool Permission Matrix | P0 | A | 4h | ⏳ READY |
| **CHAT-11** | Implement Tool Approval Workflows | P1 | A | 4h | ⏳ READY |
| **CHAT-12** | Implement Agentic Cycle Pattern | P1 | A | 4h | ⏳ READY |
| **CHAT-13** | Integrate Agents with Chat Cascade | P1 | A | 4h | ⏳ READY |
| **CHAT-14** | Test Agent Execution with Tool Registry | P1 | - | 4h | ⏳ READY |

**Files Owned:**
- `src/plugins/chat/ChatCascadePlugin.tsx`
- `src/infrastructure/persistence/stores/chat/`
- `src/lib/agent/orchestrator/`
- `src/lib/agent/agents/`
- `src/lib/agent/tools/`
- `src/lib/agent/tool-permissions.ts`

---

## Phase 3: Advanced Patterns

### Objective

Implement advanced patterns for multi-agent coordination, cross-plugin communication, RAG integration, and sophisticated tool usage.

### Entry Criteria

- Phase 2 100% complete
- Chat cascade stable with thread management
- Agent orchestrator operational
- All domain-specific agents tested

### Current Progress: 0% (Not Started)

---

## EPIC-PH3-ADVANCED-PATTERNS: Advanced Multi-Agent & RAG

**Priority:** P1 HIGH
**Status:** READY_FOR_EXECUTION
**Created:** 2026-01-26
**Estimated:** 60-80 hours (8-10 days)
**Target Completion:** 2026-02-25

**Depends On:** EPIC-PH2-CHAT-AGENTS

**Description:**
Implement advanced patterns for multi-agent coordination, cross-plugin communication, and RAG integration. Create event bus for cross-plugin notifications, shared state patterns, file reference passing between plugins. Implement multi-agent coordination with handoff patterns, context transfer, consensus mechanisms, and priority-based execution scheduling. Add RAG advanced features including metadata filtering, hybrid retriever optimization, and per-project RAG index management. Implement advanced agentic patterns including multi-agent consensus, conflict resolution, and priority-based execution. Create generative AI features distinction (individual AI in Notes vs agent-driven features in Chat).

### Stories

| Story | Title | Priority | Team | Effort | Status |
|-------|-------|----------|------|----------|
| **ADV-01** | Implement Event Bus for Cross-Plugin Communication | P0 | A | 6-8h | ⏳ READY |
| **ADV-02** | Implement Shared State for Coordinated Operations | P1 | A | 4-6h | ⏳ READY |
| **ADV-03** | Implement File Reference Passing Between Plugins | P1 | A | 4h | ⏳ READY |
| **ADV-04** | Implement Multi-Agent Handoff Patterns | P1 | A | 6h | ⏳ READY |
| **ADV-05** | Implement Multi-Agent Context Transfer | P1 | A | 4h | ⏳ READY |
| **ADV-06** | Implement Multi-Agent Consensus Mechanisms | P1 | A | 4h | ⏳ READY |
| **ADV-07** | Implement Priority-Based Execution Scheduling | P1 | A | 4h | ⏳ READY |
| **ADV-08** | Implement RAG Advanced Features (Metadata Filtering) | P1 | B | 6h | ⏳ READY |
| **ADV-09** | Implement Hybrid Retriever Optimization | P1 | B | 6h | ⏳ READY |
| **ADV-10** | Implement Per-Project RAG Index Management | P0 | A | 4-6h | ⏳ READY |
| **ADV-11** | Implement RAG Advanced Features (Embedding Endpoints) | P2 | B | 3h | ⏳ READY |
| **ADV-12** | Implement Advanced Tool Patterns (Granular Permissions) | P1 | A | 6h | ⏳ READY |
| **ADV-13** | Implement Advanced Agentic Patterns (Error Recovery) | P1 | A | 4h | ⏳ READY |
| **ADV-14** | Distinguish Individual AI vs Agent-Driven Features | P2 | A | 4h | ⏳ READY |

**Files Owned:**
- `src/lib/events/event-bus.ts`
- `src/lib/plugin/interfaces.ts`
- `src/plugins/chat/components/shared-state/`
- `src/lib/agent/handoff/`
- `src/lib/agent/consensus/`
- `src/infrastructure/persistence/stores/rag/`
- `src/lib/agent/error-recovery/`
- `src/plugins/notes/components/ai-commands/`
- `src/plugins/chat/components/agent-features/`

---

## Dependency Graph

```
Foundation (Unblocks All Phases)
├── EPIC-ARCH-04-CC [P0 - 95%]
│   └── Blocks: Phase 1A, 1B, 2, 3
├── EPIC-UX-GLOBAL-UI [P0 - 75%]
│   └── Foundation for all phases
└── EPIC-E2E-TOOLS [P0 - READY]
    └── Enables Phase 2 validation

Phase 1A (Plugin System)
├── EPIC-CC-AR02AR03 [P0 - 37.5%]
│   ├── CC-AR-01 (Team A)
│   ├── CC-AR-02 (Team A)
│   ├── CC-AR-03 (Team B) ✅
│   ├── CC-AR-05 (Team B) ✅
│   └── CC-AR-06 (Team B) ✅
│       CC-AR-04 (Team A) ─→ CC-AR-07, CC-AR-08 (blocked)
│
└── Depends On: EPIC-ARCH-04-CC (CC-04 pending)

Phase 1B (BYOK + Notes)
└── EPIC-PH1B-BYOK-NOTES [P0 - READY]
    ├── Depends On: EPIC-CC-AR02AR03 (100%)
    ├── BYOK Stories (10 stories)
    └── NOTES Stories (11 stories)

Phase 2 (Chat + Agents)
└── EPIC-PH2-CHAT-AGENTS [P0 - READY]
    ├── Depends On: EPIC-PH1B-BYOK-NOTES (100%)
    └── CHAT Stories (14 stories)

Phase 3 (Advanced Patterns)
└── EPIC-PH3-ADVANCED-PATTERNS [P1 - READY]
    ├── Depends On: EPIC-PH2-CHAT-AGENTS (100%)
    └── ADV Stories (14 stories)
```

---

## Archived Legacy Epics

The following epics have been archived due to supersession, duplication, or consolidation:

### Superseded by v2.0.0 Architecture

| Epic | Name | Superseded By | Reason |
|-------|-------|---------------|--------|
| **EPIC-ARCH-01** | EPIC-CC-AR02AR03 | Foundation cleanup consolidated into Phase 1A |
| **EPIC-ARCH-02** | EPIC-CC-AR02AR03 | Plugin system rework (70% true, remediated) |
| **EPIC-ARCH-03** | EPIC-CC-AR02AR03 | Layout system (45% true, remediated) |
| **EPIC-FS** | Phase 1A (EPIC-CC-AR02AR03) | File system foundation consolidated |
| **EPIC-39** | EPIC-UX-GLOBAL-UI | 8-bit design consolidated |
| **EPIC-38** | EPIC-CC-AR02AR03 | Architecture extension consolidated |
| **EPIC-40** | EPIC-PH2-CHAT-AGENTS | Agent chat remediation consolidated |
| **EPIC-45** | EPIC-PH1B-BYOK-NOTES | BYOK/Notes consolidated |
| **EPIC-46** | - | Consolidated into Phase epics |

### Duplicate/Overlapping Epics Consolidated

| Epic | Consolidated Into | Reason |
|-------|------------------|--------|
| **EPIC-PH1A-COMPLETION** | EPIC-CC-AR02AR03 | Duplicate Phase 1A completion epic |
| **EPIC-CONSOLIDATION** | EPIC-CC-AR02AR03 | Duplicate foundation cleanup epic |
| **EPIC-CTX-CLEAN** | EPIC-PH3-ADVANCED-PATTERNS | Duplicate context remediation epic |

### Correct-Course Series (Archived)

| Epic Series | Consolidated Into | Reason |
|------------|------------------|--------|
| **EPIC-CC-01 through CC-12** | Various Phase epics | Correct-course series consolidated into canonical epics |
| **ARC Stories** | EPIC-CC-AR02AR03, EPIC-PH2-CHAT-AGENTS | ADR-033 remediation stories merged into Phase epics |

### Archive Location

Legacy epics are archived in:
`_bmad-output/.archive/epics/legacy-epics-2026-01-26/`

---

## Epic Authority Model

### Principles

1. **Single Authoritative Epic Per Phase**: Each phase has exactly ONE epic that represents ALL work for that phase
2. **No Duplicate Scope**: Epics never overlap in requirements or deliverables
3. **Clear Dependencies**: Epic dependencies are explicit and phase-based
4. **Progress Tracking**: Each epic has clear progress metrics (stories done / total stories)
5. **Completion Criteria**: Epic completion is defined by 100% story completion AND phase entry criteria met

### Phase Entry Requirements

| Phase | Prerequisite | Authority | Entry Criteria |
|--------|--------------|----------|----------------|
| **Phase 1A** | Foundation epics (ARCH-04-CC, UX-GLOBAL-UI, E2E-TOOLS) | EPIC-CC-AR02AR03 | ADR-039 approved, PlatformContract complete, plugin system defined |
| **Phase 1B** | Phase 1A 100% + E2E-TOOLS | EPIC-PH1B-BYOK-NOTES | Phase 1A complete, TanStack AI SDK integrated |
| **Phase 2** | Phase 1B 100% | EPIC-PH2-CHAT-AGENTS | TanStack AI SDK fully integrated, plugin system operational |
| **Phase 3** | Phase 2 100% | EPIC-PH3-ADVANCED-PATTERNS | Chat cascade stable, agent orchestrator operational |

---

## Timeline

### Week 1: Foundation & Phase 1A Completion (2026-01-20 to 2026-01-28)

| Day | Focus | Epics |
|-----|-------|--------|
| 1 | FSA Handle Lifecycle | EPIC-ARCH-04-CC (CC-04 E2E) |
| 2-3 | Plugin System Rework | EPIC-CC-AR02AR03 (CC-AR-01, AR-02, AR-04) |
| 4-5 | Team A Stories | EPIC-CC-AR02AR03 (CC-AR-07, AR-08) |
| 6-7 | Global UI Cleanup | EPIC-UX-GLOBAL-UI (remaining stories) |

**Target:** Foundation complete, Phase 1A 100% (Monaco editor real, PluginLayout split, i18n complete)

### Week 2: E2E Framework & Phase 1B Planning (2026-01-29 to 2026-02-05)

| Day | Focus | Epics |
|-----|-------|--------|
| 1-2 | E2E Testing | EPIC-E2E-TOOLS (3 stories) |
| 3-5 | BYOK Foundation | EPIC-PH1B-BYOK-NOTES (BYOK-01 through BYOK-12) |
| 6-7 | Notes Features | EPIC-PH1B-BYOK-NOTES (NOTES-01 through NOTES-11) |

**Target:** E2E framework operational, Phase 1B 100% (BYOK SDK integrated, Notes complete)

### Week 3+: Phase 2 & 3 Execution (2026-02-06 onwards)

| Week | Focus | Epics |
|------|-------|--------|
| 3-4 | Chat Cascade & Agents | EPIC-PH2-CHAT-AGENTS (CHAT-01 through CHAT-08) |
| 5-7 | Agent Integration & Orchestration | EPIC-PH2-CHAT-AGENTS (CHAT-09 through CHAT-14) |
| 8+ | Advanced Patterns & RAG | EPIC-PH3-ADVANCED-PATTERNS (all ADV stories) |

**Target:** Phase 2 100% (chat cascade, agents, threads), Phase 3 100% (advanced patterns)

---

## Summary Statistics

### Epic Completion Status

| Phase | Epic | Stories | Complete | In Progress | Pending | % Complete |
|--------|-------|---------|------------|------------|------------|
| **Phase 1A** | EPIC-CC-AR02AR03 | 3 | 5 | 0 | 37.5% |
| **Foundation** | EPIC-ARCH-04-CC | 3 | 1 | 0 | 75% |
| **Foundation** | EPIC-UX-GLOBAL-UI | 3 | 1 | 0 | 75% |
| **Foundation** | EPIC-E2E-TOOLS | 0 | 0 | 3 | 0% |
| **Phase 1B** | EPIC-PH1B-BYOK-NOTES | 0 | 0 | 21 | 0% |
| **Phase 2** | EPIC-PH2-CHAT-AGENTS | 0 | 0 | 14 | 0% |
| **Phase 3** | EPIC-PH3-ADVANCED-PATTERNS | 0 | 0 | 14 | 0% |

### Overall Progress

| Metric | Value |
|--------|-------|
| **Total Active Epics** | 7 (single epic per phase) |
| **Total Stories** | 74 |
| **Stories Complete** | 9 (12.2%) |
| **Stories In Progress** | 5 (6.8%) |
| **Stories Pending** | 60 (81.1%) |
| **Archived Epics** | 22 |
| **Consolidation Reduction** | 69% (from 22 to 7 active) |

---

## Governance Alignment

### Compliance with ADR-039 (Unified Architecture Fundamentals v2.0.0)

| ADR Principle | Status | Evidence |
|--------------|--------|-----------|
| **Project-Centric Architecture** | ✅ ALIGNED | Single route `/$projectId` defined, project ID as anchor |
| **Plugin-Based** | ⏳ IN PROGRESS | Plugin system being built in Phase 1A |
| **Platform-First** | ✅ ALIGNED | PlatformContract interface implemented (ARC-A01) |
| **BYOK with TanStack AI** | ⏳ IN PROGRESS | TanStack AI SDK planned for Phase 1B |
| **Orchestrator Pattern** | ⏳ IN PROGRESS | Planned for Phase 2 |
| **Thread Management** | ⏳ IN PROGRESS | Planned for Phase 2 |
| **Clean Architecture** | ⏳ IN PROGRESS | Layer violations being addressed across Phase 1A |

### Compliance with new-fundamental-truths.md v2.0.0

| Principle | Status | Notes |
|-----------|--------|-------|
| **Section 1: Project-Centric Architecture** | ✅ ALIGNED | Route structure consolidated, plugin system defined |
| **Section 3.1: FeaturePlugin Interface** | ✅ ALIGNED | Interface documented in Phase 1A epic |
| **Section 3.2: Two Always-Loaded Plugins** | ✅ ALIGNED | Project Management + Chat Cascade defined |
| **Section 4: BYOK Vault** | ⏳ IN PROGRESS | Planned for Phase 1B |
| **Section 5: Agent and Tool Architecture** | ⏳ IN PROGRESS | Planned for Phase 2 |
| **Section 6: Chat Cascade** | ⏳ IN PROGRESS | Planned for Phase 2 |
| **Section 8: State Management** | ⏳ IN PROGRESS | Composite key pattern being updated |

### Compliance with architecture.md v3.0.0

| Section | Status | Notes |
|---------|--------|-------|
| **Section 3: Plugin System** | ⏳ IN PROGRESS | Phase 1A building plugin system |
| **Section 4: Agent and Tool Architecture** | ⏳ IN PROGRESS | Phase 2 planning agents and tools |
| **Section 5: Chat Cascade** | ⏳ IN PROGRESS | Phase 2 planning chat cascade |
| **Section 6: BYOK Vault** | ⏳ IN PROGRESS | Phase 1B planning BYOK integration |
| **Section 7: State Management** | ⏳ IN PROGRESS | WorkspaceId removal across all stores |

---

## Related Documents

| Document | Description |
|----------|-------------|
| `new-fundamental-truths.md` | Core architecture principles v2.0.0 |
| `architecture.md` | System architecture v3.0.0 (100% aligned) |
| `prd.md` | Product requirements v2.0.0 (100% aligned) |
| `the-3-phase-approach.md` | Phase breakdown (1A, 1B, 2, 3) |
| `EPIC-STORY-INVENTORY-2026-01-26.md` | Epic consolidation analysis |
| `ADR-039` | Unified Architecture Fundamentals (PROPOSED) |

---

**Document Version:** 3.0.0
**Original Version:** 2.2.0 (2026-01-16)
**Last Updated:** 2026-01-26
**Author:** Architect Agent (architect-ext)
**Status:** ACTIVE - Single authoritative epic per phase, 100% aligned with new-fundamental-truths.md v2.0.0

**Next Review:** 2026-02-02 (weekly)
