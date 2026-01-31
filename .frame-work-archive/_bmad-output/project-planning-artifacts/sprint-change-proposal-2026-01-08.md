---
title: "PHASED REMEDIATION PLAN: Scaffolded Complexity"
type: sprint_change_proposal
version: "1.0.0"
priority: P0-BLOCKING
status: PROPOSED
created: 2026-01-08T19:50:00+07:00
triggered_by: "Codebase diagnostic + strategic course correction"
phase: correct_course
team: Team A
agent: bmad-bmm-pm + bmad-bmm-architect
output_location: "_bmad-output/project-planning-artifacts/sprint-change-proposal-2026-01-08.md"
---

# PHASED REMEDIATION PLAN

## Philosophy: Scaffolded Complexity with Gates

**Principle**: Start simple, add complexity only when gates pass.

```
Complexity Stack:
                    ┌─────────────────────────────┐
                    │ PHASE 4: Architecture       │ ← Clean up AFTER it works
                    │ (store splitting, types)    │
                    ├─────────────────────────────┤
                    │ PHASE 3: Advanced Flows     │ ← Multi-step journeys
                    │ (AI, vault, project flows)  │
                    ├─────────────────────────────┤
                    │ PHASE 2: Persistence        │ ← DexieDB re-attached
                    │ (project creation, sync)    │
                    ├─────────────────────────────┤
                    │ PHASE 1: Foundation         │ ← Desktop file system ONLY
                    │ (IDE + Notes work)          │
                    └─────────────────────────────┘
```

---

## PHASE 1: Foundation (Simplified Routing + Full Workspace Capability)

**Objective**: IDE and Notes work FULLY with clear mobile/desktop paths.

**Duration**: 3-4 days
**Gate**: Both workspaces fully functional for CRUD operations

---

### 1.1 User Flow: Mobile vs Desktop

```
USER ARRIVES
    │
    ├─── Mobile/Tablet ─────────────────────────────────────────┐
    │                                                            │
    │   AUTO-CREATE temp project                                 │
    │   └── projectId: 'alpha-temp-{timestamp}'                  │
    │   └── storageType: 'virtual' (in-memory/IndexedDB-simple)  │
    │   └── ONE project only, persistent across refresh          │
    │   └── Virtual file system (no FSA)                         │
    │                                                            │
    └─── Desktop ───────────────────────────────────────────────┐
                                                                 │
        MUST SELECT folder to sync (FSA picker)                  │
        └── storageType: 'fsa' (File System Access API)          │
        └── Real file sync to local disk                         │
                                                                 │
        IF user accidentally hits route without recognized project:
        └── FALLBACK to mobile flow (temp project)               │
        └── Show toast: "No project selected, using temp project"│
```

---

### 1.2 Route Structure (Simplified)

**KEEP (Only 2 route patterns per workspace):**

```
/notes              → NotesWorkspace (temp project or last used)
/notes/$projectId   → NotesWorkspace (specific project)

/ide                → IDEWorkspace (temp project or last used)  
/ide/$projectId     → IDEWorkspace (specific project)
```

**DETACH (Comment out all others):**

```typescript
// ═══════════════════════════════════════════════════════════════
// ⚠️ PHASE 1 DETACHMENT: Complex route variations
// Re-attach in: Phase 2
// ═══════════════════════════════════════════════════════════════

// DETACHED: /notes/$projectId/$noteId (nested note routing)
// DETACHED: /ide/$projectId/file/$filePath (nested file routing)
// DETACHED: /ide/$projectId/terminal (terminal-specific routing)
// DETACHED: /knowledge, /study (focus on IDE + Notes first)
```

---

### 1.3 Forms (Simplified)

**KEEP (Simple forms only):**

| Form | description | Complexity |
|------|---------|------------|
| `FolderPickerDialog` | Desktop: Select folder to sync | Simple |
| `TempProjectBanner` | Mobile: Show "Using temp project" | Simple |
| `ProjectNameInput` | Optional: Name the project | Simple |

**DETACH (Complex forms):**

```typescript
// ═══════════════════════════════════════════════════════════════
// ⚠️ PHASE 1 DETACHMENT: Complex project creation wizard
// Re-attach in: Phase 2
// ═══════════════════════════════════════════════════════════════

// DETACHED: ProjectCreationWizard (5-step wizard)
// DETACHED: WorkspaceBindingDialog (multi-workspace selection)
// DETACHED: AgentSelectionStep (agent configuration in wizard)
// DETACHED: FileSetupStep (initial file creation)
```

---

### 1.4 IDE Investigation: Full Capability Scope

**Objective**: Understand what IDE MUST do and verify it works.

**User CRUD:**
| Action | Implementation | Status |
|--------|----------------|--------|
| Create file | Monaco + file system adapter | VERIFY |
| Read file | Monaco loads from FSA/virtual | VERIFY |
| Update file | Monaco saves with debounce | VERIFY |
| Delete file | File tree context menu | VERIFY |
| Create folder | File tree context menu | VERIFY |
| Rename file/folder | Inline rename | VERIFY |

**Agent CRUD (Agentic Coding):**
| Action | Implementation | Status |
|--------|----------------|--------|
| Agent creates file | `writeFile()` API | INVESTIGATE |
| Agent reads file | `readFile()` API | INVESTIGATE |
| Agent updates file | `writeFile()` with content | INVESTIGATE |
| Agent deletes file | `deleteFile()` API | INVESTIGATE |
| Agent runs command | Terminal/WebContainer | INVESTIGATE |
| Agent manages files | File tree updates reactively | INVESTIGATE |

**Edge Cases:**
| Edge Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| Large file (>1MB) | Load with warning, chunk if needed | INVESTIGATE |
| Binary file | Show preview or hex editor | INVESTIGATE |
| File sync conflict | Show diff, let user resolve | INVESTIGATE |
| Offline file edit | Queue for sync when online | INVESTIGATE |
| Concurrent edit | Last write wins or merge | INVESTIGATE |
| FSA permission revoked | Graceful fallback to virtual | INVESTIGATE |

**Sync Issues to Fix:**
| Issue | Current State | Fix |
|-------|---------------|-----|
| File not updating after save | May be caching | Clear cache on save |
| File tree not refreshing | Event not firing | Wire file events |
| Agent writes not visible | Not syncing | Force refresh after agent write |

---

### 1.5 Notes Investigation: Full Capability Scope

**Objective**: Understand what Notes MUST do and verify it works.

**User CRUD:**
| Action | Implementation | Status |
|--------|----------------|--------|
| Create note | BlockNote + note store | VERIFY |
| Read note | Note loads from store | VERIFY |
| Update note | Auto-save with debounce | VERIFY |
| Delete note | Context menu or sidebar | VERIFY |
| Rename note | Inline title edit | VERIFY |
| Favorite note | Toggle in sidebar | VERIFY |

**Agent CRUD (AI Features):**
| Action | Implementation | Status |
|--------|----------------|--------|
| Agent generates content | AI slash commands | INVESTIGATE |
| Agent summarizes | /summarize command | INVESTIGATE |
| Agent continues writing | /continue command | INVESTIGATE |
| Agent translates | /translate command | INVESTIGATE |
| Agent creates flashcards | /flashcards command | INVESTIGATE |
| Agent transforms text | Selection menu | INVESTIGATE |

**AI Feature Chain Investigation:**
```
WHERE DOES IT BREAK?

1. Settings Page
   └── User enters API key
   └── Clicks "Save"
   └── WHERE does key go? → credential-vault.ts? provider-store?

2. Note Workspace
   └── User types /summarize
   └── AISlashCommand.tsx triggered
   └── WHERE does it get API key from?
   └── WHERE does it get model from?
   └── HOW does it call the API?

3. API Call
   └── WHAT provider is used?
   └── WHAT model is used?
   └── WHERE is the error "API Key missing" thrown?
```

---

### 1.6 Agent/Key/Permissions Investigation (Critical)

**The Zustand + React + IndexedDB Confusion:**

```
CURRENT STATE (Broken):

credential-vault.ts (saves to IndexedDB)
    ↓
??? (HOW does provider-store know key exists?)
    ↓
??? (HOW does agent-config get the key?)
    ↓
??? (HOW does AI service read from agent-config?)
    ↓
FAILURE: "API Key missing"
```

**Investigation Tasks:**

| Component | Question | File to Investigate |
|-----------|----------|---------------------|
| **Vault** | How is key saved? | `src/lib/credential-vault/` |
| **Vault → Store** | How does store know key exists? | `provider-models-store.ts` |
| **Agent Config** | Where does agent config read key from? | `agent-config-store.ts` |
| **AI Service** | How does AI service get agent config? | `note-ai-service.ts` |
| **Permissions** | How are tool permissions checked? | `tool-permission-store.ts` |

**State Persistence Issues:**

| Issue | Current Behavior | Expected Behavior |
|-------|------------------|-------------------|
| Key not persisting | Lost on refresh? | Should persist in IndexedDB |
| Agent config not loading | Always empty? | Should load from store on init |
| Permissions not syncing | Out of date? | Should react to changes |
| Workspace transitions | State lost? | Should persist across nav |

**Required Fixes (in Phase 1):**

1. **Trace the vault → AI chain** and document where it breaks
2. **Simplify for Phase 1**: Direct key storage, no complex vault
3. **Document the expected chain** for Phase 3 re-attachment

---

### 1.7 What Gets Detached in Phase 1

**Code to Comment Out:**

| File | Lines | Feature | Why |
|------|-------|---------|-----|
| `notes.lazy.tsx` | Various | Complex routing | Use simple 2-route pattern |
| `ide.tsx` | Various | Complex routing | Use simple 2-route pattern |
| `workspace-access-helper.tsx` | 230-340 | DexieDB queries | Use simple in-memory |
| `use-cross-workspace-events.ts` | All | Event sync | Causes infinite loops |
| `ProjectCreationWizard.tsx` | All | Complex wizard | Use simple picker |
| `**/temp-*.tsx` | All | Temp routes | Not needed in Phase 1 |

**Comment Pattern:**

```typescript
// ═══════════════════════════════════════════════════════════════
// ⚠️ PHASE 1 DETACHMENT
// Feature: [Feature Name]
// Reason: [Why detached]
// Re-attach in: Phase [2/3/4]
// Gate: [What must pass]
// Documentation: _bmad-output/project-planning-artifacts/sprint-change-proposal-2026-01-08.md
// ═══════════════════════════════════════════════════════════════
```

---

### 1.8 Phase 1 Stories

| Story ID | Title | Effort | Description |
|----------|-------|--------|-------------|
| **P1-01** | Simplify Notes route to 2 patterns | 2h | Keep `/notes` and `/notes/$id` only |
| **P1-02** | Simplify IDE route to 2 patterns | 2h | Keep `/ide` and `/ide/$id` only |
| **P1-03** | Create temp project auto-flow (mobile) | 3h | Auto-create `alpha-temp-*` project |
| **P1-04** | Create folder picker flow (desktop) | 2h | FSA folder selection with fallback |
| **P1-05** | Detach complex forms with markers | 2h | Comment out wizard, add markers |
| **P1-06** | Investigate IDE full CRUD | 4h | Document all capabilities, verify |
| **P1-07** | Investigate Notes full CRUD | 4h | Document all capabilities, verify |
| **P1-08** | Trace vault → AI chain | 3h | Document where it breaks |
| **P1-09** | Verify Phase 1 gate | 2h | Browser test all criteria |

**Total Effort**: ~24 hours

---

### 1.9 Phase 1 Gate Criteria

**PHASE 1 PASSES WHEN:**

**Routing:**
- [ ] `/notes` renders (using temp project on mobile, picker on desktop)
- [ ] `/notes/$projectId` renders with specific project
- [ ] `/ide` renders (using temp project on mobile, picker on desktop)
- [ ] `/ide/$projectId` renders with specific project
- [ ] Unknown route falls back to temp project with toast

**IDE:**
- [ ] User can CRUD files (create, read, update, delete)
- [ ] File tree shows files correctly
- [ ] Monaco editor loads file content
- [ ] Save writes to file system (FSA) or virtual
- [ ] Agent CRUD documented and working OR blockers identified

**Notes:**
- [ ] User can CRUD notes (create, read, update, delete)
- [ ] Note sidebar shows notes
- [ ] BlockNote editor loads note content
- [ ] Auto-save persists changes
- [ ] AI features documented and blockers identified

**No Errors:**
- [ ] Zero "Maximum update depth exceeded"
- [ ] Zero console errors
- [ ] HMR doesn't break pages

**Documentation:**
- [ ] IDE investigation report complete
- [ ] Notes investigation report complete
- [ ] Vault → AI chain documented

---

## PHASE 2: Persistence Layer

**Objective**: DexieDB re-attached, project creation works, cross-workspace state persists.

**Duration**: 2-3 days
**Gate**: Data persists across refresh, project flows work

**Prerequisites**: Phase 1 PASSED

### What's RE-ATTACHED

| Feature | File | How to Re-attach |
|---------|------|------------------|
| DexieDB queries | `useLiveQuery` | Use stable dependency arrays + loading state |
| Cross-workspace events | `useAllCrossWorkspaceEvents` | Individual selectors (not getState()) |
| Project creation | `ProjectCreationWizard` | Wire to DexieDB correctly |
| Project picker | `ProjectPickerDialog` | Read from DexieDB projects table |
| workspace-access-helper | `workspace-access-helper.tsx` | Restore with fixes |

### What's STILL DETACHED

| Feature | File | Why Still Detached | Re-attach In |
|---------|------|-------------------|--------------|
| AI features | All AI components | Requires Agent Config chain | Phase 3 |
| Vault integration | `credential-vault.ts` | Complex async flow | Phase 3 |
| temp-xxx routes | Temporary routes | Still too complex | Phase 3 |

### Gate Criteria

**PHASE 2 PASSES WHEN:**
- [ ] Create project in wizard → project appears in Hub
- [ ] Project appears in project selector
- [ ] Navigate to Notes with project → notes load for that project
- [ ] Refresh browser → data still there
- [ ] Switch workspaces → return → state preserved
- [ ] Cross-workspace events fire without loops
- [ ] projectId correctly passes through routes

**Verification Method**: Browser test (complete flow)

---

## PHASE 3: Advanced Flows

**Objective**: AI features work, vault integration complete, multi-step flows functional.

**Duration**: 3-4 days
**Gate**: Complete user journey works end-to-end

**Prerequisites**: Phase 2 PASSED

### What's RE-ATTACHED

| Feature | File | How to Re-attach |
|---------|------|------------------|
| AI slash commands | `AISlashCommand.tsx` | Wire to agent config store |
| Vault reading | `note-ai-service.ts` | Read from vault on demand |
| Agent config loading | `AgentConfigStore` | Initialize from vault on store init |
| temp-xxx routes | Temporary routes | Re-enable with guards |
| Multi-step wizards | Full wizard flows | All steps working |

### Chain Verification (API Key → AI)

```
TRACE THIS CHAIN:
Settings Page (save API key)
    ↓
credential-vault.ts (store encrypted)
    ↓
Provider store (notifies key available)
    ↓
AgentConfigStore (reads from vault)
    ↓
note-ai-service.ts (gets agent config)
    ↓
AI slash command (makes API call)
    ↓
SUCCESS: AI responds
```

### Gate Criteria

**PHASE 3 PASSES WHEN:**
- [ ] Save API key in Settings
- [ ] Create project
- [ ] Open Notes workspace
- [ ] Type /summarize
- [ ] AI responds (no "API Key missing" error)
- [ ] Save note
- [ ] Refresh browser
- [ ] Note still there
- [ ] AI still works

**Verification Method**: Complete user journey test

---

## PHASE 4: Architecture Cleanup

**Objective**: Now safe to refactor because FUNDAMENTALS WORK.

**Duration**: 1-2 weeks
**Gate**: Clean architecture compliance 100%

**Prerequisites**: Phase 3 PASSED

### What's NOW SAFE to Do

| Task | Why Now Safe |
|------|--------------|
| Split god stores | Features work, we know what breaks |
| Clean type errors | Data flow verified |
| Move files to correct layers | Won't break working features |
| Add ESLint rules | Can enforce without false positives |
| Store consolidation (CC-1, CP-1) | Clear boundaries now |

### What's OFF-LIMITS Until Phase 4

- EPIC-38 (Clean Architecture) - PAUSED until Phase 3 PASSES
- Store splitting - PAUSED
- Type cleanup - PAUSED
- Layer reorganization - PAUSED

---

## Communication Protocol

### Detachment Markers in Code

Every detached feature MUST have this comment:

```typescript
// ═══════════════════════════════════════════════════════════════
// ⚠️ PHASE 1 DETACHMENT
// Feature: Cross-workspace events
// Reason: Causes infinite loops via useAgentsStore.getState()
// Re-attach in: Phase 2
// Gate: Phase 1 PASS (routes render without errors)
// Ticket: STAB-04
// ═══════════════════════════════════════════════════════════════
// useAllCrossWorkspaceEvents();
```

### Status Tracking

Update `bmm-workflow-status.yaml` after each phase:

```yaml
phased_remediation:
  current_phase: 1  # or 2, 3, 4
  phase_1_gate: PENDING  # or PASSED, FAILED
  phase_2_gate: PENDING
  phase_3_gate: PENDING
  phase_4_gate: PENDING
  
  detached_features:
    - name: "DexieDB project loading"
      detached_in: "Phase 1"
      reattach_in: "Phase 2"
      status: DETACHED
      
    - name: "AI slash commands"
      detached_in: "Phase 1"
      reattach_in: "Phase 3"
      status: DETACHED
```

### Epic/Story Updates

**PAUSED EPICS (Until Phase 4):**
- EPIC-38: Clean Architecture Compliance
- EPIC-31: AI Service Unification (unless needed for Phase 3)

**ACTIVE EPICS:**
- EPIC-STAB: Stability (NEW - maps to Phases 1-3)

**EPIC-30 (P0 Critical Fixes):**
- Re-map stories to phases:
  - 30-01 (ErrorBoundaries) → Phase 1
  - 30-03 (Redirect loop) → Phase 1
  - 30-04 (BYOK vault) → Phase 3
  - 30-05 (Race conditions) → Phase 2

---

## Risk Mitigation

### Risk 1: Detached features get deleted

**Mitigation**: 
- Comment marker pattern (shown above)
- List in `bmm-workflow-status.yaml`
- Ticket reference in comments

### Risk 2: Noise from detached code

**Mitigation**:
- Features are COMMENTED OUT, not deleted
- Clear markers explain why
- No linting errors from commented code

### Risk 3: Re-attachment causes regression

**Mitigation**:
- Gate must PASS before re-attaching
- One feature re-attached at a time
- Browser test after each re-attachment

### Risk 4: Team works on wrong phase

**Mitigation**:
- `bmm-workflow-status.yaml` single source of truth
- Phase status visible in file header
- Sprint planning reflects phases

---

## Dependency Matrix (Horizontal x Vertical)

```
                    PHASE 1    PHASE 2    PHASE 3    PHASE 4
                    ─────────────────────────────────────────
File System         ✅ IN      ✅ IN      ✅ IN      ✅ IN
DexieDB             ❌ OUT     ✅ RE-IN   ✅ IN      ✅ IN
Cross-WS Events     ❌ OUT     ✅ RE-IN   ✅ IN      ✅ IN
Project Creation    ❌ OUT     ✅ RE-IN   ✅ IN      ✅ IN
AI Features         ❌ OUT     ❌ OUT     ✅ RE-IN   ✅ IN
Vault Integration   ❌ OUT     ❌ OUT     ✅ RE-IN   ✅ IN
Store Splitting     ❌ OUT     ❌ OUT     ❌ OUT     ✅ RE-IN
Type Cleanup        ❌ OUT     ❌ OUT     ❌ OUT     ✅ RE-IN
Clean Arch (38)     ❌ OUT     ❌ OUT     ❌ OUT     ✅ RE-IN
```

Legend:
- ✅ IN = Feature active in this phase
- ❌ OUT = Feature detached/bypassed
- ✅ RE-IN = Feature re-attached in this phase

---

## Approval Request

**Admin**, this Phased Remediation Plan proposes:

1. **Phase 1**: Desktop file system only (DexieDB detached)
2. **Phase 2**: Re-attach persistence layer
3. **Phase 3**: Re-attach advanced flows (AI, vault)
4. **Phase 4**: THEN do architecture cleanup

**Trade-offs accepted:**
- DexieDB temporarily offline in Phase 1
- AI features offline until Phase 3
- Architecture work delayed until Phase 4

**Benefits:**
- Users can ACCESS features immediately
- Complexity added ONLY when gates pass
- Clear communication of what's detached

Do you approve this approach?

---

*Sprint Change Proposal generated by Correct Course Workflow*
*2026-01-08T19:50:00+07:00*
