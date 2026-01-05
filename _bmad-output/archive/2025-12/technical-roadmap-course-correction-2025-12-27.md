---
date: 2025-12-27
time: 17:06:00
phase: Course Correction
team: Team-A
agent_mode: bmad-bmm-architect
---

# Technical Roadmap: Course Correction

**Date**: 2025-12-27  
**Severity**: P0 - Blocking Feature  
**Incident Type**: Multi-Phase Course Correction  
**Related Incidents**: 
- INC-2025-12-24-001 (MVP consolidation)
- INC-2025-12-25-001 (Agentic execution loop gap)
- P1.10 - Inconsistent State Management (2025-12-26)

---

## Executive Summary

This technical roadmap provides a comprehensive, prioritized action plan to resolve critical architectural gaps and technical debt identified during the December 25-27, 2025 investigation cycle. The roadmap addresses 7 major issues blocking MVP progress and E2E validation, with clear implementation priorities, timelines, and dependencies.

**Key Issues Identified:**
1. **Agentic Execution Loop Gap (P0)** - Missing TanStack AI `agentLoopStrategy` configuration
2. **State Management Duplication (P0)** - `IDELayout.tsx` duplicates IDE state instead of using Zustand
3. **File Access Permission Issues (P1)** - Agent attempting to access files outside granted directory scope
4. **Persistence Strategy Validation** - Confirm IndexedDB via Dexie approach is correct
5. **SDK Usage Verification** - Validate TanStack AI and TanStack Router patterns
6. **E2E Validation Failure** - 12 stories incorrectly marked DONE without browser verification
7. **Layout Architecture Vulnerability** (RESOLVED) - Routes using wrong layout (fixed Dec 27)

**Current Status:**
- MVP-1: Agent Configuration & Persistence - DONE
- MVP-2/3/4: Code-complete pending E2E verification
- Epic 29: Agentic Execution Loop - Planned for post-MVP

---

## 1. Critical Issues Analysis

### 1.1 Agentic Execution Loop Gap (P0) - BLOCKING

**Severity**: P0 - Feature Blocking  
**Impact**: MVP-2, MVP-3, MVP-4 cannot complete E2E validation  
**Root Cause**: Missing `agentLoopStrategy` configuration in [`useAgentChatWithTools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts:232-243)

#### Technical Details

The current implementation uses TanStack AI's `useChat` hook without configuring the agent loop strategy:

```typescript
// CURRENT IMPLEMENTATION (BROKEN) - Lines 232-243
const chatOptions = {
    connection,
    tools: agentTools.getClientTools(),
    // MISSING: agentLoopStrategy: maxIterations(10), // ← NOT CONFIGURED!
};
```

This omission causes:
- **Single-shot execution**: TanStack AI treats chat as one-shot, stops after first tool result
- **No iteration capability**: Agent cannot plan → act → observe → refine cycle
- **No state tracking**: No `AgentLoopState` to track iterations
- **No termination control**: No `maxIterations()` or `untilFinishReason()` limits

#### Impact on MVP Stories

| Story | Status | Impact |
|--------|---------|---------|
| MVP-2: Chat Interface with Streaming | Code-complete | Cannot test multi-step conversations |
| MVP-3: Tool Execution - File Operations | Code-complete | Agent cannot chain file operations |
| MVP-4: Tool Execution - Terminal Commands | Code-complete | Agent cannot run tests then read results |

#### Resolution Strategy

**Immediate Fix (MVP Continuation)** - Add minimal loop configuration:

```typescript
// In use-agent-chat-with-tools.ts
import { maxIterations } from "@tanstack/ai";

const chatOptions = useMemo(() => {
    if (agentTools) {
        return {
            connection,
            tools: agentTools.getClientTools(),
            agentLoopStrategy: maxIterations(3), // Temporary safety limit
        };
    }
    return { connection };
}, [connection, agentTools]);
```

**Long-term Fix (Epic 29)** - Full agentic execution loop implementation:
- Story 29-1: Agent Loop Strategy Implementation
- Story 29-2: Iteration UI & State Visualization
- Story 29-3: Intelligent Termination Strategies
- Story 29-4: Error Recovery & User Handoff

**Timeline**: 
- Immediate fix: 2-4 hours
- Epic 29 full implementation: 2 weeks post-MVP

---

### 1.2 State Management Duplication (P0) - DEFERRED

**Severity**: P0 - Critical  
**Impact**: Breaks single source of truth, potential state sync issues  
**Status**: Deferred to post-MVP to avoid interference with MVP-3/MVP-4

#### Technical Details

[`IDELayout.tsx`](src/components/layout/IDELayout.tsx:86-98) duplicates IDE state using local `useState` instead of centralized [`useIDEStore`](src/lib/state/ide-store.ts):

```typescript
// CURRENT (INCORRECT) - Lines 86-98
const [isChatVisible, setIsChatVisible] = useState(true);
const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
const [terminalTab, setTerminalTab] = useState<TerminalTab>('terminal');
const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
```

#### State Duplication Analysis

| State Property | Current (Local useState) | Should Be (useIDEStore) | Impact |
|---------------|---------------------------|--------------------------|--------|
| `isChatVisible` | `useState(true)` | `useIDEStore(s => s.chatVisible)` + `setChatVisible` | Duplicates centralized state |
| `terminalTab` | `useState<TerminalTab>('terminal')` | `useIDEStore(s => s.terminalTab)` + `setTerminalTab` | Duplicates centralized state |
| `openFiles` | `useState<OpenFile[]>([])` | `useIDEStore(s => s.openFiles)` + `addOpenFile/removeOpenFile` | Duplicates centralized state |
| `activeFilePath` | `useState<string | null>(null)` | `useIDEStore(s => s.activeFile)` + `setActiveFile` | Duplicates centralized state |

#### Resolution Strategy (Deferred)

**Recommended Refactoring** (from state management audit):

1. Replace duplicated state in [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) with Zustand hooks:
   - `isChatVisible` → `useIDEStore(s => s.chatVisible)` + `setChatVisible()`
   - `terminalTab` → `useIDEStore(s => s.terminalTab)` + `setTerminalTab()`
   - `openFiles` → Use `useIDEStore` with local file content cache
   - `activeFilePath` → `useIDEStore(s => s.activeFile)` + `setActiveFile()`

2. Add local `fileContentCache` Map for ephemeral file content (not persisted)

3. Update [`useIDEFileHandlers`](src/components/layout/hooks/useIDEFileHandlers.ts) to work with Zustand actions

4. Remove duplicate state synchronization code (lines 142-148 in [`IDELayout.tsx`](src/components/layout/IDELayout.tsx))

**Timeline**: Post-MVP, Week 1 (estimated 8-12 hours)

---

### 1.3 File Access Permission Issues (P1)

**Severity**: P1 - High  
**Impact**: Agent cannot access files outside granted directory scope  
**Root Cause**: File System Access API permission scope not validated before tool execution

#### Technical Details

The Vietnamese error message "không thể truy cập vào thư mục gốc hoặc các thư mục con" translates to "cannot access root directory or subdirectories", indicating:

1. Agent attempted to access files outside granted directory scope
2. File System Access API permissions were not properly scoped
3. No validation of file paths before tool execution

#### Resolution Strategy

**Add path validation to agent tools**:

```typescript
// In read-file-tool.ts, add validation:
import { validatePath, PathValidationError } from '../facades/file-tools';

export function createReadFileTool(getTools: () => AgentFileTools) {
    return readFileDef.server(async (args: unknown): Promise<ToolResult<ReadFileOutput>> => {
        const { path } = args as { path: string };
        
        // Validate path is within granted directory scope
        validatePath(path);
        
        try {
            const content = await getTools().readFile(path);
            // ... rest of implementation
        } catch (error) {
            // Check if error is permission-related
            if (error instanceof PathValidationError) {
                return {
                    success: false,
                    error: `Permission denied: Cannot access ${path}. Ensure directory access is granted.`,
                };
            }
            // ... rest of error handling
        }
    });
}
```

**Timeline**: 2-3 hours (can be done in parallel with MVP-3/MVP-4)

---

### 1.4 Persistence Strategy Validation

**Status**: ✅ CONFIRMED CORRECT

#### Audit Findings

The Via-gent codebase has **ZERO persistence strategy issues**:

| Persistence Layer | Status | Details |
|-----------------|---------|---------|
| **IndexedDB via Dexie** | ✅ CORRECT | All IndexedDB operations use Dexie consistently |
| **Legacy idb Library** | ✅ REMOVED | Zero usage found across codebase |
| **TanStack Store** | ✅ REMOVED | Zero usage found across codebase |
| **Duplicate Stores** | ✅ NONE | All 6 Zustand stores are unique and serve distinct purposes |
| **localStorage Usage** | ✅ APPROPRIATE | Used for agent configurations (appropriate for small data) |

#### Dexie Database Schema

**Single Dexie database instance** with 6 tables:

1. `projects` - Project metadata
2. `ideState` - IDE state per project
3. `conversations` - AI chat history
4. `taskContexts` - AI agent task tracking (Epic 25 prep)
5. `toolExecutions` - AI tool audit trail (Epic 25 prep)
6. `credentials` - Encrypted API keys (Epic 25 prep)

**Custom Storage Adapter**: [`src/lib/state/dexie-storage.ts`](src/lib/state/dexie-storage.ts:1) - Zustand persist middleware adapter for Dexie

#### Conclusion

**No action required**. The persistence strategy is correct and follows best practices:
- ✅ Single Dexie database instance
- ✅ No legacy idb usage
- ✅ No duplicate stores
- ✅ Appropriate use of localStorage for small data
- ✅ Zustand stores properly configured with Dexie persistence

---

### 1.5 SDK Usage Verification

#### TanStack AI Usage

**Current Status**: ⚠️ INCOMPLETE IMPLEMENTATION

**Issue**: Missing `agentLoopStrategy` configuration (see Section 1.1)

**Required Imports**:
```typescript
import { maxIterations, untilFinishReason, chat } from "@tanstack/ai";
```

**Documentation Reference**: https://tanstack.com/ai

#### TanStack Router Usage

**Current Status**: ✅ CORRECT

**Verification**: File-based routing properly configured in [`src/routes/`](src/routes/)
- Auto-generated `routeTree.gen.ts` (read-only, not manually edited)
- Layout inheritance correctly fixed (Dec 27 resolution)
- No manual route configuration issues found

**Documentation Reference**: https://tanstack.com/router

#### Conclusion

**Action Required**: Update TanStack AI usage to include `agentLoopStrategy` configuration. TanStack Router usage is correct.

---

## 2. Implementation Priorities

### Priority Matrix

| Priority | Issue | Timeline | Effort | Dependency |
|-----------|---------|----------|------------|
| **P0** | Agentic Execution Loop Gap | Immediate (2-4h) | None |
| **P0** | State Management Duplication | Post-MVP Week 1 (8-12h) | MVP completion |
| **P1** | File Access Permission Validation | Parallel with MVP-3/4 (2-3h) | None |
| **P2** | SDK Usage Verification | Complete with P0 fixes | None |
| **P2** | E2E Validation Process | Ongoing | All stories |

### Execution Order

#### Phase 1: Immediate Unblocking (Week 1, Days 1-2)
1. **P0**: Add `maxIterations(3)` to [`useAgentChatWithTools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts)
2. **P1**: Add path validation to agent tools
3. **P2**: Verify TanStack AI and TanStack Router usage patterns

#### Phase 2: MVP Completion (Week 1, Days 3-5)
4. Complete MVP-2 E2E verification with browser testing
5. Complete MVP-3 E2E verification with browser testing
6. Complete MVP-4 E2E verification with browser testing

#### Phase 3: Post-MVP Refactoring (Week 2)
7. **P0**: Refactor [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) state duplication
8. Complete Epic 29: Agentic Execution Loop (4 stories)

---

## 3. Technical Specifications

### 3.1 Agentic Execution Loop Specification

#### Current Limitation (Temporary MVP Measure)

- **maxIterations(3)**: Currently enforced as a temporary safety measure during MVP-3/MVP-4 validation
- **Limited Execution**: Agents will terminate after 3 tool execution iterations to prevent infinite loops
- **Full Implementation Deferred**: Complete agentic loop with state tracking, iteration UI, and intelligent termination is planned for Epic 29

#### Epic 29: Full Agentic Execution Loop

**Story 29-1: Agent Loop Strategy Implementation** (3 points)
- Add `agentLoopStrategy` to `use-agent-chat-with-tools.ts`
- Support configurable max iterations (default: 10)
- Track iteration count in component state
- Emit iteration events for UI updates
- Pass iteration context to tool execution

**Story 29-2: Iteration UI & State Visualization** (3 points)
- Display current iteration count (e.g., "Step 3/10")
- Show collapsible reasoning sections
- Add progress bar to approval overlay
- Implement pause/resume controls
- Visual indicator for iteration limits

**Story 29-3: Intelligent Termination Strategies** (2 points)
- Combine multiple termination strategies
- Detect stuck states (3+ consecutive failures)
- Natural completion detection
- Timeout protection (60s max per loop)
- Per-agent iteration limits

**Story 29-4: Error Recovery & User Handoff** (2 points)
- Automatic retry for transient errors
- Pause agent on persistent failures
- Provide clear error messages
- Suggest corrective actions
- Allow user to resume or abort

#### Technical Implementation

```typescript
// In use-agent-chat-with-tools.ts
import { maxIterations, untilFinishReason, combineStrategies } from '@tanstack/ai';

const agentStrategy = combineStrategies([
  maxIterations(15),
  untilFinishReason(['stop']),
  stuckDetectionStrategy,
]);

const chatOptions = useMemo(() => ({
  connection,
  tools: agentTools.getClientTools(),
  agentLoopStrategy: agentStrategy,
}), [connection, agentTools]);
```

---

### 3.2 State Management Refactoring Specification

#### Refactoring Plan

**File**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx:86-98)

**Changes Required**:

1. **Remove duplicated state**:
   ```typescript
   // REMOVE:
   const [isChatVisible, setIsChatVisible] = useState(true);
   const [terminalTab, setTerminalTab] = useState<TerminalTab>('terminal');
   const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
   const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
   
   // REPLACE WITH:
   const chatVisible = useIDEStore(s => s.chatVisible);
   const terminalTab = useIDEStore(s => s.terminalTab);
   const openFiles = useIDEStore(s => s.openFiles);
   const activeFile = useIDEStore(s => s.activeFile);
   const { setChatVisible, setTerminalTab, addOpenFile, removeOpenFile, setActiveFile } = useIDEStore();
   ```

2. **Add local file content cache**:
   ```typescript
   // ADD (ephemeral, not persisted):
   const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());
   ```

3. **Update handlers**:
   ```typescript
   // In useIDEFileHandlers.ts, work with Zustand actions
   const handleFileOpen = (path: string) => {
       addOpenFile(path); // Use Zustand action
       setActiveFile(path); // Use Zustand action
   };
   ```

4. **Remove synchronization code**:
   ```typescript
   // REMOVE lines 142-148 in IDELayout.tsx:
   // Duplicate state synchronization logic
   ```

**Expected Impact**:
- ✅ Single source of truth for IDE state
- ✅ Automatic persistence to IndexedDB
- ✅ Consistent state access across all components
- ✅ Reduced code complexity

---

### 3.3 File Access Permission Validation Specification

**File**: [`src/lib/agent/tools/read-file-tool.ts`](src/lib/agent/tools/read-file-tool.ts)

**Changes Required**:

1. **Import validation utilities**:
   ```typescript
   import { validatePath, PathValidationError } from '../facades/file-tools';
   ```

2. **Add validation before tool execution**:
   ```typescript
   export function createReadFileTool(getTools: () => AgentFileTools) {
       return readFileDef.server(async (args: unknown): Promise<ToolResult<ReadFileOutput>> => {
           const { path } = args as { path: string };
           
           // Validate path is within granted directory scope
           try {
               validatePath(path);
           } catch (error) {
               if (error instanceof PathValidationError) {
                   return {
                       success: false,
                       error: `Permission denied: Cannot access ${path}. Ensure directory access is granted.`,
                   };
               }
               throw error;
           }
           
           // ... rest of implementation
       });
   }
   ```

3. **Apply same pattern to other file tools**:
   - `write-file-tool.ts`
   - `list-files-tool.ts`

**Expected Impact**:
- ✅ Prevents agent from accessing files outside granted scope
- ✅ Provides clear error messages
- ✅ Aligns with File System Access API security model

---

## 4. Persistence Architecture Confirmation

### 4.1 Current Architecture

**State Ownership Boundaries**:

```
┌─────────────────────────────────────────────────────────────────┐
│                         State Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  IDE State (useIDEStore) - ⚠️ PARTIALLY USED │ │
│  │  - Open files, active file, expanded paths             │ │
│  │  - Panel layouts, terminal tab, chat visibility        │ │
│  │  - Persists to IndexedDB via Dexie                │ │
│  │  - ⚠️ IDELayout.tsx duplicates some of this state │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  StatusBar State (useStatusBarStore)                  │ │
│  │  - WC status, sync status, cursor position           │ │
│  │  - Ephemeral (in-memory)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Agents State (useAgentsStore)                         │ │
│  │  - Agent configurations, models, providers             │ │
│  │  - Persists to localStorage                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Agent Selection State (useAgentSelectionStore)          │ │
│  │  - Currently selected agent                             │ │
│  │  - Persists to localStorage                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  File Sync Status Store (useFileSyncStatusStore)        │ │
│  │  - Sync progress, file-specific status                 │ │
│  │  - Ephemeral (in-memory)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
```

### 4.2 Dexie Database Schema

**Database**: `via-gent-db` (single instance)

**Tables**:

| Table | Purpose | Indexes |
|--------|---------|----------|
| `projects` | Project metadata | `id`, `name`, `createdAt` |
| `ideState` | IDE state per project | `projectId` |
| `conversations` | AI chat history | `projectId`, `createdAt` |
| `taskContexts` | AI agent task tracking | `conversationId` |
| `toolExecutions` | AI tool audit trail | `conversationId`, `timestamp` |
| `credentials` | Encrypted API keys | `providerId` |

**Custom Storage Adapter**: [`src/lib/state/dexie-storage.ts`](src/lib/state/dexie-storage.ts:1)

### 4.3 Conclusion

**Persistence Strategy**: ✅ CONFIRMED CORRECT

- ✅ Single Dexie database instance
- ✅ No legacy idb usage
- ✅ No duplicate stores
- ✅ Appropriate use of localStorage for small data
- ✅ Zustand stores properly configured with Dexie persistence
- ✅ Clear separation of persisted vs. ephemeral state

**No action required** for persistence architecture.

---

## 5. SDK Usage Patterns

### 5.1 TanStack AI

**Current Status**: ⚠️ INCOMPLETE

**Missing Configuration**:
```typescript
// MISSING in useAgentChatWithTools.ts
import { maxIterations } from "@tanstack/ai";

const chatOptions = {
    connection,
    tools: agentTools.getClientTools(),
    agentLoopStrategy: maxIterations(3), // ← ADD THIS
};
```

**Documentation**: https://tanstack.com/ai

### 5.2 TanStack Router

**Current Status**: ✅ CORRECT

**Usage Pattern**:
- File-based routing in [`src/routes/`](src/routes/)
- Auto-generated `routeTree.gen.ts` (read-only)
- Layout inheritance correctly configured
- No manual route configuration issues

**Documentation**: https://tanstack.com/router

### 5.3 Conclusion

**Action Required**: Update TanStack AI usage to include `agentLoopStrategy` configuration. TanStack Router usage is correct.

---

## 6. E2E Validation Process

### 6.1 Updated Definition of Done

**MANDATORY Requirements** (applied Dec 25):

1. **MANDATORY Browser E2E Verification**: Every story requires manual browser E2E verification before DONE
2. **Screenshot Required**: Capture screenshot or recording of working feature
3. **Full Workflow**: Test complete user journey, not just component existence
4. **No Exceptions**: Stories cannot be marked DONE without browser verification

### 6.2 Validation Process

**For each story completion**:

1. **Start development server**: `pnpm dev` (port 3000)
2. **Open browser**: Navigate to `http://localhost:3000`
3. **Grant permissions**: File System Access API when prompted
4. **Test complete workflow**: Execute full user journey
5. **Capture evidence**: Screenshot or recording of working feature
6. **Mark DONE**: Only after successful E2E verification

### 6.3 Re-verification Required

**12 stories** marked DONE without E2E verification require re-verification:

| Story | Status | Action Required |
|--------|---------|----------------|
| [List of 12 stories from investigation] | ❌ DONE (incorrect) | Re-verify with browser E2E testing |

---

## 7. Implementation Timeline

### Week 1: Immediate Unblocking & MVP Completion

| Day | Priority | Task | Effort |
|------|-----------|-------|---------|
| Day 1 | P0 | Add `maxIterations(3)` to `useAgentChatWithTools.ts` | 2-4h |
| Day 1 | P1 | Add path validation to agent tools | 2-3h |
| Day 2 | P2 | Verify TanStack AI and TanStack Router usage | 1-2h |
| Day 2-3 | - | Complete MVP-2 E2E verification | 4-6h |
| Day 3-4 | - | Complete MVP-3 E2E verification | 4-6h |
| Day 4-5 | - | Complete MVP-4 E2E verification | 4-6h |

### Week 2: Post-MVP Refactoring

| Day | Priority | Task | Effort |
|------|-----------|-------|---------|
| Day 1-2 | P0 | Refactor `IDELayout.tsx` state duplication | 8-12h |
| Day 3-5 | P0 | Epic 29: Agentic Execution Loop (4 stories) | 24-32h |

### Week 3: E2E Validation & Documentation

| Day | Priority | Task | Effort |
|------|-----------|-------|---------|
| Day 1-2 | - | Re-verify 12 stories with browser E2E testing | 16-20h |
| Day 3-5 | - | Update documentation and AGENTS.md | 8-12h |

---

## 8. Risk Assessment

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|-------|-------------|---------|------------|
| Agentic loop causes infinite loops | Medium | High | Implement `maxIterations(3)` as safety limit |
| State refactoring breaks existing functionality | Low | High | Comprehensive testing, rollback plan |
| Path validation blocks legitimate operations | Low | Medium | Clear error messages, user override option |
| E2E verification reveals additional bugs | High | Medium | Allocate buffer time for bug fixes |

### 8.2 Timeline Risks

| Risk | Probability | Impact | Mitigation |
|-------|-------------|---------|------------|
| MVP-2/3/4 E2E verification takes longer than expected | Medium | High | Allocate buffer time, prioritize critical paths |
| Epic 29 implementation takes longer than 2 weeks | Medium | High | Break into smaller stories, iterative delivery |
| Re-verification of 12 stories exceeds timeline | High | High | Prioritize high-impact stories, defer low-impact |

---

## 9. Success Criteria

### 9.1 Phase 1: Immediate Unblocking

- [ ] `agentLoopStrategy` configured with `maxIterations(3)`
- [ ] Path validation added to all file tools
- [ ] TanStack AI and TanStack Router usage verified
- [ ] MVP-2 passes E2E verification with screenshot
- [ ] MVP-3 passes E2E verification with screenshot
- [ ] MVP-4 passes E2E verification with screenshot

### 9.2 Phase 2: Post-MVP Refactoring

- [ ] `IDELayout.tsx` uses `useIDEStore` for all IDE state
- [ ] No state duplication in codebase
- [ ] Epic 29-1: Agent Loop Strategy Implementation completed
- [ ] Epic 29-2: Iteration UI & State Visualization completed
- [ ] Epic 29-3: Intelligent Termination Strategies completed
- [ ] Epic 29-4: Error Recovery & User Handoff completed

### 9.3 Phase 3: E2E Validation & Documentation

- [ ] All 12 re-verified stories pass E2E testing
- [ ] AGENTS.md updated with new patterns
- [ ] All documentation reflects current implementation
- [ ] No P0 or P1 issues remaining

---

## 10. Related Artifacts & References

### 10.1 Investigation Documents

1. [`_bmad-output/course-corrections/comprehensive-investigation-consolidation-2025-12-27.md`](_bmad-output/course-corrections/comprehensive-investigation-consolidation-2025-12-27.md) - Consolidated investigation findings
2. [`_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md`](_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md) - Agentic execution loop gap analysis
3. [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md) - State management audit

### 10.2 Epic Specifications

1. [`_bmad-output/epics/epic-29-agentic-execution-loop.md`](_bmad-output/epics/epic-29-agentic-execution-loop.md) - Epic 29 specification
2. [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md) - MVP sprint plan
3. [`_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md) - Story validation criteria

### 10.3 Research Documents

1. [`_bmad-output/research/agentic-execution-loop-deep-research-2025-12-25.md`](_bmad-output/research/agentic-execution-loop-deep-research-2025-12-25.md) - TanStack AI agentic cycle research
2. [`_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md`](_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md) - Agentic platforms research

### 10.4 Technical Documentation

1. [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md) - State management audit
2. [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) - Agent chat hook
3. [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx) - IDE layout component
4. [`src/lib/state/ide-store.ts`](src/lib/state/ide-store.ts) - IDE state store
5. [`src/lib/agent/tools/read-file-tool.ts`](src/lib/agent/tools/read-file-tool.ts) - Read file tool

### 10.5 External Documentation

1. **TanStack AI**: https://tanstack.com/ai
2. **TanStack Router**: https://tanstack.com/router
3. **Zustand**: https://zustand.docs.pmnd.rs
4. **Dexie**: https://dexie.org

---

## 11. Recommendations

### 11.1 Immediate Actions (Next 24-48 hours)

1. **P0**: Add `maxIterations(3)` to [`useAgentChatWithTools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts)
2. **P1**: Add path validation to all file tools
3. **P2**: Verify TanStack AI and TanStack Router usage patterns
4. **E2E**: Complete MVP-2 E2E verification with browser testing

### 11.2 Short-term Actions (Next 1-2 weeks)

1. **P0**: Complete MVP-3 and MVP-4 E2E verification
2. **P0**: Refactor [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) state duplication
3. **P0**: Start Epic 29: Agentic Execution Loop implementation

### 11.3 Long-term Actions (Next 2-4 weeks)

1. Complete Epic 29: Agentic Execution Loop (4 stories)
2. Re-verify 12 stories with browser E2E testing
3. Update AGENTS.md with new patterns and best practices
4. Update documentation to reflect current implementation

### 11.4 Process Improvements

1. Add "agentic loop" to Definition of Done for agent features
2. Update test plans to include multi-step scenarios
3. Cross-reference research docs during implementation
4. Add integration tests for agent loop state management
5. Enforce mandatory E2E verification for all story completions

---

## 12. Alignment with "Agentic Workstation" Vision

### 12.1 Vision Alignment

**Via-gent Vision**: Browser-based IDE with integrated AI agent capabilities for autonomous coding tasks.

**Current State**:
- ✅ Browser-based IDE with Monaco Editor
- ✅ WebContainer integration for local code execution
- ✅ File System Access API for local file management
- ✅ Multi-provider AI agent support (OpenRouter, Anthropic, etc.)
- ✅ Streaming chat interface
- ⚠️ Limited agent autonomy (single-shot execution)
- ⚠️ No iteration progress visibility
- ⚠️ No intelligent termination strategies

**Post-Correction State**:
- ✅ All above plus:
  - ✅ Multi-step agent execution with iteration limits
  - ✅ Iteration progress visibility in UI
  - ✅ Intelligent termination strategies
  - ✅ Error recovery and user handoff
  - ✅ Full agentic capabilities matching Cursor/Windsurf/Roo Code

### 12.2 Competitive Parity

**Competitor Capabilities**:
- **Cursor**: Multi-step agent execution, iteration visibility, intelligent termination
- **Windsurf**: "Turbo Mode" with auto-execution of safe commands
- **Roo Code**: "Ask" mode for all Execute actions, autonomous task completion

**Via-gent Post-Correction**:
- ✅ Multi-step agent execution (Epic 29)
- ✅ Iteration visibility (Epic 29-2)
- ✅ Intelligent termination (Epic 29-3)
- ✅ Error recovery (Epic 29-4)
- ✅ Competitive parity achieved

---

## 13. Conclusion

This technical roadmap provides a comprehensive, prioritized action plan to resolve all critical issues identified during the December 25-27, 2025 investigation cycle. The roadmap addresses 7 major issues with clear implementation priorities, timelines, and dependencies.

**Key Outcomes**:
1. **Immediate Unblocking**: P0 fixes enable MVP-2/3/4 E2E verification
2. **Technical Debt Reduction**: State management refactoring eliminates duplication
3. **Competitive Parity**: Epic 29 enables full agentic capabilities
4. **Quality Assurance**: E2E validation ensures features work in production
5. **Documentation Alignment**: All artifacts reflect current implementation

**Next Steps**:
1. Implement P0 fixes (agentic loop, path validation)
2. Complete MVP-2/3/4 E2E verification
3. Refactor state management (post-MVP)
4. Implement Epic 29: Agentic Execution Loop
5. Re-verify 12 stories with browser E2E testing

**Timeline**: 3 weeks total (1 week MVP completion, 1 week refactoring, 1 week E2E validation & documentation)

---

**Author**: BMAD Architect (Platform A)  
**Status**: Ready for Implementation  
**Next Action**: Report to @bmad-core-bmad-master with completion summary and proceed to Step 4: Sprint Plan Refactoring
