# EPIC-0.5 Retrospective: FileTree & Plugin System Maturity

**Date**: 2026-01-27
**Status**: PARTIALLY_COMPLETE - Critical Coordination Gaps Identified
**Author**: analyst-ext
**Version**: 1.0.0

---

## Executive Summary

EPIC-0.5 focused on UI/layout improvements and individual plugin fixes but **missed the core requirement: plugin coordination**. The Bento Grid layout system works visually, and individual plugins (Monaco, FileTree, Preview, Terminal, Notes, Chat) are functional in isolation. However, plugins remain **isolated islands** with no shared state coordination for cross-plugin operations.

**Reality Check**: Phase 1A was claimed at 60% but analysis reveals **~30% true completion** due to 19 coordination gaps.

### Key Findings

| What Was Claimed Complete | Actual Status | Gap |
|---------------------------|---------------|-----|
| **Layout System (Bento Grid)** | 100% | None - Layout works |
| **FileTree Plugin** | 80% | No coordination contract, expand not persistent |
| **Monaco Editor** | 70% | Has FILE_OPENED listener but not shared state |
| **Notes Plugin** | 40% | Hardcoded noteId, mirroring with Monaco incomplete |
| **Terminal Plugin** | 10% | POC - No WebContainer process management |
| **Preview Plugin** | 10% | URL listener exists but no event source |
| **Plugin Coordination** | **0%** | Not attempted - No PluginCoordinationContext |

---

## What Went Well

### 1. Real Monaco Editor Integration (CC-AR-05)
- Replaced textarea POC stub with actual `@monaco-editor/react`
- Syntax highlighting for 16+ file types functional
- Cmd+S keyboard shortcut wired to save
- Event-based file opening from FileTree via `FILE_OPENED` event
- **Evidence**: `MonacoPlugin.tsx` imports `@monaco-editor/react` (line 27)

### 2. File Event Bus Infrastructure (EPIC-0.5-02)
- `file-event-bus.ts` created (550 lines)
- Type-safe `FileEvent` interface with CRUD operations
- `useFileEventBus` React hook for subscriptions
- Project-scoped event filtering
- Monaco, Notes, and FileTree plugins subscribed
- **Evidence**: Multiple plugins importing `fileEventBus` from `@/infrastructure/events/file-event-bus`

### 3. PluginLayout God Component Resolved (CC-AR-08)
- Reduced from 1034 lines to 305 lines
- Extracted: `LayoutRenderers.tsx` (442 lines), `PluginPanel.tsx` (317 lines), `MobilePluginNav.tsx` (209 lines)
- **Evidence**: `plugin-architecture-scan-2026-01-26.md` confirms current state

### 4. Store Hydration Race Condition Fixed (CC-AR-03)
- `_hasHydrated` flag added to `PluginLayoutStore.ts`
- `$projectId.tsx` now guards rendering until hydration complete
- **Evidence**: Lines 117-119 in `PluginLayoutStore.ts`

### 5. i18n Keys Added (CC-AR-01)
- 30+ `plugin.*` keys added to `en.json` and `vi.json`
- All plugin components using translation keys
- **Evidence**: Lines 2016-2134 in `en.json`

### 6. Preview Plugin Created (CC-AR-06)
- `PreviewPlugin.tsx` (321 lines) created
- WebContainer integration placeholder
- Iframe display for preview URLs
- **Evidence**: File exists in `src/plugins/preview/`

---

## What Went Wrong

### 1. No Plugin Coordination Context Created

| Missing | Impact |
|---------|--------|
| **PluginCoordinationContext** | Plugins cannot share state |
| **ActiveDocument shared state** | Monaco doesn't know what Notes has open |
| **"Who has this file open" tracking** | No multi-editor conflict prevention |
| **Write-lock mechanism** | Concurrent edits possible |

**Root Cause**: Epic scoped as "layout + individual fixes" without coordination architecture.

### 2. Terminal Plugin Is POC Only

| Required | Current State |
|----------|---------------|
| Boot WebContainer | No - Static terminal display |
| Mount FSA files to container | No - Not implemented |
| Process registry | No - No process tracking |
| Capability declarations | No - No lifecycle hooks |

**Evidence**: `TerminalPlugin.tsx` has no `@stackblitz/sdk` or WebContainer imports.

### 3. Preview Plugin Has No Event Source

| Required | Current State |
|----------|---------------|
| Listen for Terminal URL output | No - No Terminal integration |
| WebContainer process URL detection | No - WebContainer not started |
| URL event emission | No - Event source undefined |

**Root Cause**: Preview depends on Terminal which is POC-only.

### 4. Notes Plugin Hardcoded Paths

| Required | Current State |
|----------|---------------|
| Dynamic noteId from route/context | Hardcoded `default-note.md` |
| Mirroring with Monaco for same file | Partial - events sent but no coordinator |
| BlockNote ↔ Markdown bidirectional sync | Partial - basic conversion exists |

### 5. Layout Work Prioritized Over Coordination

**What Happened**:
- 6+ hours spent on layout refinements
- 0 hours on PluginCoordinationContext
- Epic scope allowed this because "coordination" wasn't in acceptance criteria

**Lesson**: Epic scope was too narrow. Should have included "Plugins can communicate about shared resources".

---

## The 19 Coordination Gaps (Detailed Analysis)

### Category 1: Shared State (5 gaps)

| Gap # | Description | Impact | Status |
|-------|-------------|--------|--------|
| **1** | No shared ActiveDocument state | Monaco and Notes cannot coordinate on same file | NOT STARTED |
| **2** | No "who has this file open" tracking | Multiple plugins can open same file with conflicts | NOT STARTED |
| **3** | No write-lock mechanism | Race condition on save | NOT STARTED |
| **4** | No deferred capability queue | Plugins cannot request actions from other plugins | NOT STARTED |
| **5** | Monaco has active file state but not shared | Other plugins cannot query Monaco's current file | NOT STARTED |

### Category 2: Plugin Lifecycle (4 gaps)

| Gap # | Description | Impact | Status |
|-------|-------------|--------|--------|
| **6** | No process registry | Terminal processes not tracked | NOT STARTED |
| **7** | No capability declarations | Plugins cannot advertise what they can do | NOT STARTED |
| **8** | No dependency declarations | Plugins cannot express requirements | NOT STARTED |
| **9** | No onEnable/onDisable hooks | Plugin toggle has no lifecycle | NOT STARTED |

### Category 3: State Preservation (3 gaps)

| Gap # | Description | Impact | Status |
|-------|-------------|--------|--------|
| **10** | No state preservation across toggle | Toggling plugin off loses all state | NOT STARTED |
| **11** | No lazy resource booting | All plugins load resources at mount | NOT STARTED |
| **12** | No dependency checker | Plugins cannot verify prerequisites | NOT STARTED |

### Category 4: Event Contracts (5 gaps)

| Gap # | Description | Impact | Status |
|-------|-------------|--------|--------|
| **13** | No event schema contracts | Events are type-safe but not validated at runtime | PARTIAL (types exist) |
| **14** | No event ordering/priority | No guaranteed event processing order | NOT STARTED |
| **15** | No cross-plugin event documentation | Developers don't know what events exist | PARTIAL (JSDoc exists) |
| **16** | No prerequisite resolution | Events may fire before listeners ready | NOT STARTED |
| **17** | FileTree provides selection but no coordination contract | Selection not propagated to other plugins | PARTIAL (events sent) |

### Category 5: Platform/Device Constraints (2 gaps)

| Gap # | Description | Impact | Status |
|-------|-------------|--------|--------|
| **18** | No device-type enforcement per plugin | Terminal available on mobile (should be blocked) | NOT STARTED |
| **19** | No graceful fallback for unsupported devices | User sees broken UI instead of alternative | NOT STARTED |

---

## Root Cause Analysis

### 1. Epic Scope Too Narrow

**What Happened**: EPIC-0.5 was scoped as "FileTree fixes + Layout improvements" without including plugin coordination.

**Why It Happened**: Previous epic (EPIC-0) focused on foundation issues. Team assumed coordination would be implicit.

**What Should Have Been Done**: Include explicit acceptance criteria: "Plugins can coordinate on shared resources (files, processes, state)".

### 2. No User Journey Validation Before Completion

**What Happened**: Stories were marked complete after TypeScript passed.

**Why It Happened**: No E2E testing framework in place. Manual testing insufficient.

**Evidence**: CC-AR-05 marked complete but Monaco doesn't coordinate with Notes.

**What Should Have Been Done**: 
- User Journey: "Open file in Monaco → Edit → Save → See update in Notes"
- User Journey: "Terminal starts → Preview shows URL"

### 3. Individual Plugin Fixes Without Integration Testing

**What Happened**: Each plugin fixed in isolation.

**Why It Happened**: Team B worked on Monaco/Preview/Terminal independently.

**What Should Have Been Done**: Cross-plugin integration tests before marking complete.

---

## Lessons Learned

### 1. Coordination Architecture Must Be Explicit in Epic Scope

> **Lesson**: If plugins need to communicate, the coordination layer must be an explicit acceptance criterion, not an assumed implementation detail.

**Action**: EPIC-0.6 must include "PluginCoordinationContext with SharedDocument state" as P0 story.

### 2. TypeScript Passing != Feature Complete

> **Lesson**: TypeScript validates syntax and types. It does NOT validate that plugins actually coordinate at runtime.

**Action**: Every plugin story must include integration test with at least one other plugin.

### 3. POC Stubs Must Be Identified as Blockers

> **Lesson**: Terminal and Preview were marked "working" but are POC stubs. This blocked Preview functionality.

**Action**: Create explicit "POC → Production" stories with acceptance criteria for real implementation.

### 4. Event Bus Exists But Contract Is Missing

> **Lesson**: `file-event-bus.ts` provides infrastructure but no contract for plugin-to-plugin coordination.

**Action**: Create `PluginCoordinationContract` interface that plugins must implement.

---

## Recommendations for EPIC-0.6

### Priority 1: Plugin Coordination Layer (MUST HAVE)

| Story | Description | Effort |
|-------|-------------|--------|
| **0.6-01** | Create `PluginCoordinationContext` with SharedDocument state | 4-6h |
| **0.6-02** | Add "who has file open" tracking to coordination context | 2-3h |
| **0.6-03** | Implement write-lock mechanism for concurrent edit prevention | 2-3h |
| **0.6-04** | Create `PluginCapability` interface and registry | 3-4h |

### Priority 2: Terminal Production Implementation (SHOULD HAVE)

| Story | Description | Effort |
|-------|-------------|--------|
| **0.6-05** | Boot WebContainer on Terminal mount | 4-6h |
| **0.6-06** | Mount FSA files to WebContainer | 4-6h |
| **0.6-07** | Implement process registry for Terminal | 2-3h |
| **0.6-08** | Emit preview URL events from Terminal | 2h |

### Priority 3: Preview Integration (SHOULD HAVE)

| Story | Description | Effort |
|-------|-------------|--------|
| **0.6-09** | Wire Preview to Terminal URL events | 2-3h |
| **0.6-10** | Implement graceful fallback for unsupported devices | 2h |

### Priority 4: Notes Mirroring (NICE TO HAVE)

| Story | Description | Effort |
|-------|-------------|--------|
| **0.6-11** | Replace hardcoded noteId with route parameter | 1-2h |
| **0.6-12** | Implement Monaco ↔ Notes mirroring via coordination context | 4-6h |

---

## Deferred Items (Carry Forward to EPIC-0.6)

### From EPIC-0.5 Incomplete Work

| Item | Original Story | New Story | Priority |
|------|----------------|-----------|----------|
| Plugin coordination context | Not scoped | 0.6-01 | P0 |
| Terminal WebContainer boot | CC-AR-06 (partial) | 0.6-05 | P1 |
| Preview URL integration | CC-AR-06 (partial) | 0.6-09 | P1 |
| Notes hardcoded noteId | Not scoped | 0.6-11 | P2 |

### From EPIC-0 Gaps

| Gap ID | Description | New Story |
|--------|-------------|-----------|
| GAP-02 | Event-emitter sync for browser CRUD | 0.6-01 |
| GAP-03 | Plugin data mapping contracts | 0.6-04 |

---

## Metrics

| Metric | Value |
|--------|-------|
| **Claimed Completion** | 60% |
| **Actual Completion** | ~30% |
| **Coordination Gaps** | 19 |
| **Stories Complete** | 6/8 (75%) |
| **Integration Working** | 2/6 plugins (33%) |
| **Time Spent** | ~8 hours |
| **Rework Required** | ~16-24 hours |

---

## Conclusion

EPIC-0.5 successfully delivered layout improvements and individual plugin fixes but **failed to address the fundamental coordination problem**. The file event bus infrastructure (`file-event-bus.ts`) provides a foundation, but without a `PluginCoordinationContext`, plugins remain isolated.

**Recommendation**: Create EPIC-0.6 focused exclusively on Plugin Coordination Layer before attempting any more individual plugin improvements.

---

## Related Documents

| Document | Path |
|----------|------|
| EPIC-0 Retrospective | `_bmad-output/retrospectives/EPIC-0-RETROSPECTIVE-2026-01-26.md` |
| Plugin Architecture Scan | `_bmad-output/diagnostics/plugin-architecture-scan-2026-01-26.md` |
| File Event Bus | `src/infrastructure/events/file-event-bus.ts` |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` |
| Epics | `_bmad-output/planning-artifacts/epics.md` |

---

**Document Version**: 1.0.0
**Created**: 2026-01-27
**Author**: analyst-ext
**Status**: COMPLETE
