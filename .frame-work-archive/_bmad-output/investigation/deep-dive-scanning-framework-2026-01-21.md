# Deep-Dive Scanning Framework - ADR Rescue Investigation

**Date**: 2026-01-15
**Status**: ACTIVE - Investigation in Progress
**Purpose**: Systematic investigation of all infection domains + hooks error
**Approach**: Option 3 - Investigation-First Approach

---

## Executive Summary

This framework provides a structured methodology for deep-scanning all infection domains identified in ADR-034/035, plus the new hooks error blocking Notes workspace.

**Investigation Scope**:
1. **Hooks Error** (NEW - P0) - React Hooks violation in NotesWorkspaceDefault
2. **FSA Handle Infection** (10 points) - Handle persistence and restoration
3. **State Management Infection** (12 points) - Store scoping and hydration
4. **Routing Infection** (13 points) - Route guards and loading patterns
5. **Platform Contract Infection** (6 points) - Platform detection and enforcement

**Total Infection Points**: 42 (1 new + 41 from ADRs)

---

## Investigation Methodology

### Phase 1: Codebase Mapping (30 min)

**Objective**: Create comprehensive map of current implementation

**Steps**:
1. Scan all files mentioned in ADR-034/035 infection registries
2. Identify actual vs expected implementation
3. Map dependencies and data flow
4. Document current state vs ADR requirements

**Deliverable**: `codebase-map-2026-01-15.md`

---

### Phase 2: Hooks Error Deep-Dive (45 min)

**Objective**: Identify root cause of "Rendered fewer hooks than expected"

**Investigation Points**:
1. Read `src/routes/notes.lazy.tsx` line 28 (NotesWorkspaceDefault component)
2. Analyze hook usage pattern:
   - Conditional hook calls (hooks inside if/else)
   - Early returns before all hooks called
   - Hook order changes between renders
   - Missing dependency arrays
3. Trace render cycles:
   - Initial render
   - After platform detection
   - After project selection
   - After fsaProjects query
4. Identify exact violation pattern

**Expected Findings**:
- Specific line number causing violation
- Render cycle where violation occurs
- Root cause (conditional, early return, order change, or dependency)

**Deliverable**: `hooks-error-analysis-2026-01-15.md`

---

### Phase 3: FSA Handle Infection Scan (2 hours)

**Objective**: Verify all 10 FSA infection points

**Investigation Points**:

| ID | File | Issue | Investigation Steps |
|----|------|-------|---------------------|
| FSA-001 | `fsa-handle-manager.ts:26-36` | Stores `handle as any` | Read file, verify DataCloneError |
| FSA-002 | `fsa-handle-manager.ts:45-70` | `restoreHandle()` calls picker | Read file, verify prompt behavior |
| FSA-003 | `handle-persistence.ts:97-116` | Stores `handleData: null` | Read file, verify null storage |
| FSA-004 | `handle-persistence.ts:190-207` | `trySilentRestore()` prompts | Read file, verify prompt |
| FSA-005 | `permission-lifecycle.ts:46-61` | `deserializeHandle()` returns null | Read file, verify null return |
| FSA-006 | `storage-gateway-factory.ts:117-141` | Handle not available | Read file, verify timing |
| FSA-007 | `ProjectContext.tsx` | No handle in context | Read file, verify context interface |
| FSA-008 | `ide.$projectId.tsx:148-157` | Claims restore - doesn't exist | Read file, verify claim |
| FSA-009 | Multiple files | 3 different handle managers | Search for all handle managers |
| FSA-010 | `project-types.ts:39-41` | Duplicate permission state | Read file, verify duplication |

**Deliverable**: `fsa-handle-infection-scan-2026-01-15.md`

---

### Phase 4: State Management Infection Scan (2 hours)

**Objective**: Verify all 12 state infection points

**Investigation Points**:

| ID | File | Issue | Investigation Steps |
|----|------|-------|---------------------|
| STATE-001 | `useProjectStore.ts:50-53` | No persistence | Read file, verify memory-only |
| STATE-002 | `useIDEStore.ts:65-71` | Hydrates "most recent" | Read file, verify hydration logic |
| STATE-003 | `workspace-store.ts:174-179` | localStorage leak | Read file, verify localStorage usage |
| STATE-004 | `file-sync-status-store-refactored.ts:76-77` | Global persist | Read file, verify global key |
| STATE-005 | `agent-selection-store.ts:43-56` | Global activeAgentId | Read file, verify global state |
| STATE-006 | `useConversationStore.ts:381-404` | Module-level leak | Read file, verify subscription |
| STATE-007 | `unified-chat-store.ts:338` | Global storage key | Read file, verify key pattern |
| STATE-008 | `rag-store.ts:56-60` | Global indexMetadata | Read file, verify global state |
| STATE-009 | `terminal-store.ts:304` | Uses localStorage | Read file, verify localStorage |
| STATE-010 | `hydration-manager.ts:46-61` | Empty hydrate functions | Read file, verify empty functions |
| STATE-011 | `project-crud-slice.ts:153` | Calls `persistHandle(null)` | Read file, verify null handle |
| STATE-012 | Multiple stores | No cleanup on switch | Search for cleanup logic |

**Deliverable**: `state-management-infection-scan-2026-01-15.md`

---

### Phase 5: Routing Infection Scan (1.5 hours)

**Objective**: Verify all 13 routing infection points

**Investigation Points**:

| ID | File | Issue | Investigation Steps |
|----|------|-------|---------------------|
| ROUTE-001 | `ide.tsx:37-44` | No beforeLoad guard | Read file, verify missing guard |
| ROUTE-002 | `ide.tsx:89-101` | Uses window.location | Read file, verify navigation pattern |
| ROUTE-003 | `ide.$projectId.tsx:86-131` | Double fetch | Read file, verify beforeLoad + loader |
| ROUTE-004 | `notes.$projectId.lazy.tsx:116-132` | useEffect instead of loader | Read file, verify useEffect |
| ROUTE-005 | `workspace/$projectId.tsx:75-93` | No platform guard | Read file, verify missing guard |
| ROUTE-006 | `HubHomePage.tsx:143-151` | Double-checks FSA | Read file, verify redundant checks |
| ROUTE-007 | `WorkspaceSwitcher.tsx:119-133` | No platform validation | Read file, verify missing check |
| ROUTE-008 | `ProjectContext.tsx:247-270` | Auto-switch to IDE on mobile | Read file, verify auto-switch |
| ROUTE-009 | `ProjectContext.tsx:295-320` | switchWorkspace no check | Read file, verify missing check |
| ROUTE-010 | `index.tsx` + `hub.tsx` | Duplicate routes | Read both files, verify duplication |
| ROUTE-011 | `study.lazy.tsx`, `knowledge.lazy.tsx` | IDE buttons no check | Read files, verify missing checks |
| ROUTE-012 | Missing files | Non-lazy routes don't exist | Verify file existence |
| ROUTE-013 | `notes.lazy.tsx:50-127` | Dynamic import in useEffect | Read file, verify dynamic import |

**Deliverable**: `routing-infection-scan-2026-01-15.md`

---

### Phase 6: Platform Contract Infection Scan (1 hour)

**Objective**: Verify all 6 platform infection points

**Investigation Points**:

| ID | File | Issue | Investigation Steps |
|----|------|-------|---------------------|
| PLAT-001 | `ide.tsx` | Temp project on desktop | Read file, verify temp project |
| PLAT-002 | `notes.lazy.tsx:43-46` | Hardcoded browser-mode | Read file, verify hardcoded |
| PLAT-003 | `MainSidebar.tsx:161-168` | Bypasses platform checks | Read file, verify bypass |
| PLAT-004 | Multiple routes | getPlatformContract not called | Search for missing calls |
| PLAT-005 | `temp-project.ts:180-188` | Logic inverted | Read file, verify inversion |
| PLAT-006 | Multiple stores | No platform-aware hydration | Search for hydration logic |

**Deliverable**: `platform-contract-infection-scan-2026-01-15.md`

---

### Phase 7: Cross-Domain Impact Analysis (1 hour)

**Objective**: Identify how infections interact and compound

**Investigation Points**:
1. FSA handle failure → State hydration failure
2. State scoping failure → Route guard failure
3. Platform detection failure → Wrong storage type
4. Routing failure → Wrong workspace loaded
5. All failures → User journey blocked

**Deliverable**: `cross-domain-impact-analysis-2026-01-15.md`

---

### Phase 8: Unified Remediation Plan (1 hour)

**Objective**: Create single coordinated remediation plan

**Structure**:
1. Priority ordering (P0 → P1 → P2)
2. Dependency mapping (what must be fixed first)
3. Risk assessment (what could break)
4. Rollback strategy (how to revert)
5. Testing strategy (how to verify)

**Deliverable**: `unified-remediation-plan-2026-01-15.md`

---

## Investigation Tools

### Code Analysis Tools

```bash
# Find all hook violations
grep -r "useEffect\|useState\|useRef\|useMemo\|useCallback" src/routes/notes.lazy.tsx

# Find all handle managers
find src -name "*handle*" -type f

# Find all store files
find src -name "*store*" -type f

# Find all route files
find src/routes -name "*.tsx" -type f

# Find platform contract usage
grep -r "getPlatformContract" src/
```

### TypeScript Analysis

```bash
# Check for type errors
pnpm tsc --noEmit

# Check for unused imports
pnpm eslint --fix src/

# Check for circular dependencies
pnpm madge --circular src/
```

### Runtime Analysis

```bash
# Check for console errors
# (Manual - open DevTools)

# Check for network failures
# (Manual - open DevTools Network tab)

# Check for state mutations
# (Manual - use Redux DevTools or Zustand DevTools)
```

---

## Investigation Checklist

### Phase 1: Codebase Mapping
- [ ] All ADR-034 files located
- [ ] All ADR-035 files located
- [ ] Dependency map created
- [ ] Data flow documented

### Phase 2: Hooks Error
- [ ] NotesWorkspaceDefault component analyzed
- [ ] Hook usage pattern identified
- [ ] Render cycles traced
- [ ] Root cause pinpointed

### Phase 3: FSA Handle
- [ ] All 10 infection points verified
- [ ] Current implementation documented
- [ ] Expected implementation defined
- [ ] Gap analysis completed

### Phase 4: State Management
- [ ] All 12 infection points verified
- [ ] Store scoping analyzed
- [ ] Hydration logic reviewed
- [ ] Cleanup logic checked

### Phase 5: Routing
- [ ] All 13 infection points verified
- [ ] Route guards reviewed
- [ ] Loading patterns analyzed
- [ ] Navigation flow documented

### Phase 6: Platform Contract
- [ ] All 6 infection points verified
- [ ] Platform detection reviewed
- [ ] Enforcement points checked
- [ ] UX impact assessed

### Phase 7: Cross-Domain
- [ ] Interaction points identified
- [ ] Compound effects documented
- [ ] Critical path mapped
- [ ] Failure cascade analyzed

### Phase 8: Unified Plan
- [ ] Priority ordering established
- [ ] Dependencies mapped
- [ ] Risks assessed
- [ ] Rollback strategy defined
- [ ] Testing strategy created

---

## Deliverables Summary

| Deliverable | Format | Location | Due |
|-------------|--------|----------|-----|
| Codebase Map | Markdown | `_bmad-output/investigation/` | Phase 1 |
| Hooks Error Analysis | Markdown | `_bmad-output/investigation/` | Phase 2 |
| FSA Handle Scan | Markdown | `_bmad-output/investigation/` | Phase 3 |
| State Management Scan | Markdown | `_bmad-output/investigation/` | Phase 4 |
| Routing Scan | Markdown | `_bmad-output/investigation/` | Phase 5 |
| Platform Contract Scan | Markdown | `_bmad-output/investigation/` | Phase 6 |
| Cross-Domain Impact | Markdown | `_bmad-output/investigation/` | Phase 7 |
| Unified Remediation Plan | Markdown | `_bmad-output/investigation/` | Phase 8 |

---

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Codebase Mapping | 30 min | T+0h | T+0.5h |
| Phase 2: Hooks Error | 45 min | T+0.5h | T+1.25h |
| Phase 3: FSA Handle | 2 hours | T+1.25h | T+3.25h |
| Phase 4: State Management | 2 hours | T+3.25h | T+5.25h |
| Phase 5: Routing | 1.5 hours | T+5.25h | T+6.75h |
| Phase 6: Platform Contract | 1 hour | T+6.75h | T+7.75h |
| Phase 7: Cross-Domain | 1 hour | T+7.75h | T+8.75h |
| Phase 8: Unified Plan | 1 hour | T+8.75h | T+9.75h |
| **Total** | **9.75 hours** | | |

---

## Success Criteria

- [ ] All 42 infection points verified and documented
- [ ] Hooks error root cause identified
- [ ] Cross-domain impacts mapped
- [ ] Unified remediation plan created
- [ ] All deliverables completed
- [ ] Ready for execution phase

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-21T10:00:00+07:00
**Status**: ACTIVE - Investigation in Progress
**Next Step**: Begin Phase 1 - Codebase Mapping