---
date: 2026-01-05
time: 2026-01-05T14:50:00+07:00
phase: Health Assessment & Governance
team: Team A
agent_mode: bmad-core-bmad-master + presentation-master + module-builder
document_id: PHA-2026-01-05-001
version: 1.0.0
title: Project Health Assessment & Governance Consolidation Report
status: CRITICAL_ISSUES_IDENTIFIED
---

# 🏥 Project Health Assessment & Governance Consolidation Report

**Assessment Date:** 2026-01-05T14:50:00+07:00  
**Assessment Team:** Team A  
**Assessment Type:** Sprint Review + Drift Detection + Production Reality Check  

---

## 📊 Executive Summary

### Current State Overview

| Metric | Sprint Status Claim | Production Reality | Gap Severity |
|--------|-------------------|-------------------|--------------|
| **Sprint 1 (CWAC)** | 12/12 Stories DONE (100%) | Functional Testing BLOCKED | 🔴 CRITICAL |
| **ARCH-01 Epic** | Stories 1-3 DONE | Code refactored, integration untested | 🟡 MEDIUM |
| **LLM Providers** | Models load on key save | Models NOT loading (Gemini/OpenRouter) | 🔴 CRITICAL |
| **API Key Persistence** | Toast confirmation exists | Key saved but NO toast visible to user | 🟡 HIGH |
| **Workspace Integration** | Project → Workspace binding | Notes workspace NOT loading project files | 🔴 CRITICAL |
| **E2E Testing** | 43 tests pass | All tests are MOCK-based, no real integration | 🟡 HIGH |

### Health Score

| Layer | Score | Status |
|-------|-------|--------|
| **State Integrity** | 45% | 🔴 FAILING |
| **Code Hygiene** | 72% | 🟡 NEEDS WORK |
| **Integration Reality** | 25% | 🔴 CRITICAL |
| **Documentation Sync** | 60% | 🟡 DRIFT DETECTED |
| **Production Stability** | 30% | 🔴 CRITICAL |

**Overall Project Health Score: 46.4%** (down from claimed 82.5%)

---

## 🔴 Critical Issues Identified

### Issue Category 1: LLM Provider System Failures

#### P0-LLM-001: Models Not Loading After API Key Save

**Evidence:**
- User reports: "unloaded models in Gemini and Open Router" on Vercel deployment
- Production logs show API key being stored but model fetch failing

**Root Cause Analysis:**

```typescript
// ProviderConfigDialog.tsx:106-111
if (apiKey) {
    await credentialVault.storeCredentials(provider.id, apiKey);
    setIsFetchingModels(true);
    try {
        await fetchModels(provider.id);
        toast.success(`${provider.name} API key saved - loading models...`);
    } catch (error) {
```

**Problem:** The `fetchModels` function is called but:
1. The model registry cache may not be invalidated properly
2. The provider store may not be re-triggering reactivity
3. The credential vault `getCredentials` may fail silently in SSR context

**Affected Files:**
- `src/lib/agent/providers/model-registry.ts`
- `src/infrastructure/persistence/stores/providers/provider-models-slice.ts`
- `src/presentation/components/agent/ProviderConfigDialog.tsx`

**Priority:** P0 - BLOCKING ALL AI FUNCTIONALITY

---

#### P0-LLM-002: Credential Vault SSR/Hydration Issues

**Evidence:**
```typescript
// credential-vault.ts uses localStorage extensively
const VAULT_PASSWORD_STORAGE = 'vg_vp_v3';
// This fails during SSR - no localStorage
```

**Root Cause:**
- Credential vault relies on `localStorage` which is unavailable during SSR
- `await credentialVault.initialize()` may throw during server-side rendering
- The `isReady()` check does not gate critical operations properly

**Priority:** P0 - CAUSES HYDRATION ERRORS

---

### Issue Category 2: API Key UX Failures

#### P0-UX-001: No Visual Feedback for Key Save Status

**User Report:** "key saved/or not without any notice/toast for saved key (nor badge showing status of there are keys of which LLM providers)"

**Evidence from Code:**

Toast IS implemented in `ProviderConfigDialog.tsx`:
```typescript
toast.success(`${provider.name} API key saved - loading models...`);
```

**But:**
1. Toast only shows if `fetchModels` succeeds - if it throws, no success toast
2. No persistent UI indicator showing which providers have keys
3. No badge/icon on provider cards showing key status

**Gap:** Missing `hasApiKey` visual indicator in:
- Provider list in AgentConfigDialog
- Agent configuration panels
- Status bar indicators

**Priority:** P0 - USER CANNOT VERIFY KEY SAVE STATUS

---

### Issue Category 3: Workspace ↔ Project Integration Failures

#### P0-WS-001: Notes Workspace Not Loading Project Files

**User Report:** "simply when I choose my project folder nothing is loaded into notes and there are no handling for files synchronizations"

**Root Cause Analysis:**

The route structure shows:
```typescript
// routes/notes.$projectId.lazy.tsx
export const Route = createLazyFileRoute('/notes/$projectId')({...})
```

BUT the `note-store.ts` shows:
```typescript
// note-store.ts:142
console.log(`[NoteStore] Loaded ${notes.length} notes for project ${projectId}`);
```

**Gap Identified:**
1. Notes are stored per-projectId in Dexie
2. BUT there's no automatic sync from FSA (File System Access) to Notes
3. The `note-file-sync.ts` exists but is NOT wired to workspace initialization
4. No conversion from project files → Note objects

**Missing Integration Chain:**
```
User selects project folder 
  → FSA reads files 
  → [MISSING] File-to-Note conversion 
  → [MISSING] Notes Dexie population 
  → Notes UI renders
```

**Priority:** P0 - CORE USE CASE BROKEN

---

#### P0-WS-002: Cross-Workspace Configuration Inconsistency

**User Report:** "configuration inconsistency - across workspaces - through transitional ux ui - reactive vs persistence layer"

**Evidence:**

1. **Agent Selection Store** tracks per-workspace agents:
```typescript
// agent-selection-store.ts
defaultAgentIds: {
    ide: null,
    knowledge: null,
    study: null,
    notes: null,
},
```

2. **BUT** the configuration doesn't persist correctly across:
   - Workspace switches
   - Page refreshes
   - Session restarts

**Root Cause:**
- Multiple stores with overlapping responsibility
- Event bus synchronization incomplete
- Hydration race conditions

**Priority:** P0 - CONFIGURATION DRIFT

---

### Issue Category 4: Architecture Drift

#### P1-ARCH-001: Sprint Status Claims vs Reality

| Claim in sprint-status.yaml | Actual Reality |
|---------------------------|----------------|
| "ARCH-01.1 DONE - All god files split" | ✅ Code IS split |
| "ARCH-01.2 DONE - State Consolidation" | ⚠️ Stores moved, but integration untested |
| "ARCH-01.3 DONE - Workspace Context Unification" | ❌ Unified provider exists, but not all components use it |
| "E1 DONE - 12/12 stories complete" | ❌ Tests are all mocks, no real integration |

**Evidence:**
```yaml
# cross-workspace-chat-sprint-status.yaml
  - id: "E1-12"
    title: "End-to-End Testing"
    test_notes:
      - "Created E2E test suite with Vitest + Testing Library"
      - "43 tests across 2 test suites"
      - "Tests use mock components for faster execution"  # <-- RED FLAG
```

**Problem:** "Tests use mock components" means NO real integration testing.

---

## 🟡 High-Severity Issues

### P1-INT-001: Tool Permission System Not Workspace-Aware

**Gap:** Tools should be enabled/disabled per workspace, but:
- `tool-permission-manager.ts` is a single singleton
- No workspace-scoped permission sets
- Content Generation AI in Notes uses different tools than IDE Chat

### P1-FS-001: File System Sync Unidirectional

**Gap:** 
- IDE → WebContainer sync works
- WebContainer → Local sync works
- BUT: Local files → Notes workspace conversion MISSING
- Local files → Knowledge workspace indexing MISSING

### P1-STATE-001: God Files Still Exist in Critical Paths

**Evidence from codebase search:**
- `unified-workspace-provider.tsx` was 734 lines → refactored to 138 lines ✅
- BUT `useWorkspaceFileSystem.ts` is now 468 lines 🔴 NEW GOD FILE
- `canvas-store.ts` is 18,954 bytes (~600 lines) 🔴 GOD FILE
- `factory.ts` is 22,861 bytes (~750 lines) 🔴 GOD FILE

---

## 📋 Orphan & Stale Artifacts Inventory

### Category A: Orphaned Documentation

| Artifact | Last Updated | Status | Action |
|----------|-------------|--------|--------|
| `docs/2025-12-23/` | 2025-12-23 | 🟡 STALE | Archive or update |
| `mvp-sprint-plan-2025-12-24.md` | 2025-12-24 | 🔴 OBSOLETE | Archive |
| `state-management-audit-2025-12-24.md` | 2025-12-24 | 🟡 SUPERSEDED | Reference only |

### Category B: Orphaned Code

| File/Pattern | Issue | Action |
|--------------|-------|--------|
| `src/lib/workspace/WorkspaceContext.tsx` | Claimed deleted, verify | Verify deletion |
| `src/stores/` legacy path | Should be migrated | Verify no imports |
| Multiple `index.ts` barrel files | May have dead exports | Audit |

### Category C: Context Poisoning (Conflicting Sources of Truth)

| Topic | Source A | Source B | Resolution Needed |
|-------|----------|----------|-------------------|
| Workspace state | `workspace-store.ts` | `useWorkspaceFileSystem.ts` | Consolidate |
| Agent selection | `agent-selection-store.ts` | `useAgentSelectionStore` hook | Same - OK |
| Provider models | `provider-models-slice.ts` | `model-registry.ts` cache | Needs sync |

---

## 🎯 Remediation Roadmap

### Immediate Actions (P0 - Next 24 Hours)

#### Action 1: Debug Model Loading Flow

```bash
# Step 1: Add diagnostic logging
console.log('[DIAGNOSTIC] Provider ID:', providerId);
console.log('[DIAGNOSTIC] Has credential:', await credentialVault.hasCredentials(providerId));

# Step 2: Verify on Vercel
- Open browser DevTools Network tab
- Save API key
- Check for /v1/models or /v1beta/models requests
- Verify response status
```

#### Action 2: Add API Key Status Indicators

**Location:** `src/presentation/components/agent/AgentConfigDialog.tsx`

```tsx
// Add visual indicator
{providers.map(p => (
  <div key={p.id} className="flex items-center gap-2">
    {p.name}
    {p.hasApiKey ? <Badge variant="success">Key Set</Badge> : null}
  </div>
))}
```

#### Action 3: Wire Notes ← Project Folder Sync

**Required New Files:**
1. `src/lib/notes/note-folder-bridge.ts` - Convert folder files to Notes
2. Hook in `UnifiedWorkspaceProvider` to trigger on folder open

---

### Short-Term Actions (P1 - Next 7 Days)

1. **Create Real Integration Tests**
   - Replace mock-based E2E with actual browser tests
   - Use Playwright for real browser testing
   - Test actual API calls to OpenRouter/Gemini (with test keys)

2. **Consolidate State Stores**
   - Merge overlapping store slices
   - Single source of truth for each domain

3. **Split Remaining God Files**
   - `useWorkspaceFileSystem.ts` (468 lines) → 3 files
   - `canvas-store.ts` (18KB) → slices
   - `factory.ts` (22KB) → per-provider factories

---

### Medium-Term Actions (P2 - Next 14 Days)

1. Archive stale documentation
2. Update AGENTS.md with current patterns
3. Create cross-workspace integration tests
4. Implement 3-Device Rule validation

---

## 📊 Validation Checklists

### Checklist A: LLM Provider Validation

- [ ] API key saved successfully (toast shows)
- [ ] Models load automatically after key save
- [ ] Model dropdown populates with fetched models
- [ ] Chat can send message with selected model
- [ ] Messages stream correctly
- [ ] Error handling shows clear messages

### Checklist B: Workspace Integration Validation

- [ ] Open project folder in Hub
- [ ] Project files visible in IDE
- [ ] Navigate to Notes workspace
- [ ] Notes workspace shows project-related notes
- [ ] Navigate to Knowledge workspace
- [ ] Knowledge workspace shows indexed sources
- [ ] Workspace switching preserves context

### Checklist C: Persistence Validation

- [ ] Configuration survives page refresh
- [ ] Configuration survives browser restart
- [ ] Configuration survives incognito → normal
- [ ] API keys remain encrypted
- [ ] Agent selections persist per-workspace

---

## 🔗 Related Documents

- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status.yaml`
- Cross-Workspace Sprint: `_bmad-output/sprint-artifacts/cross-workspace-chat-sprint-status.yaml`
- Workflow Status: `bmm-workflow-status.yaml`
- Documentation Index: `_bmad-output/documentation/index.md`

---

## ✅ Next Actions for Agents

### For BMAD Master (Orchestrator)

1. **Immediate:** Create P0 bug tickets for:
   - LLM model loading failure
   - Notes ← Folder sync missing
   - API key status indicators

2. **Assign:** Route to @bmad-bmm-dev for implementation

### For Dev Agent

1. **Priority 1:** Debug and fix model loading flow
2. **Priority 2:** Add hasApiKey visual indicators
3. **Priority 3:** Create note-folder-bridge.ts

### For TEA Agent (Testing)

1. Replace mock E2E tests with real integration tests
2. Create production smoke test suite
3. Validate on Vercel deployment

---

## 📝 Tracking Section

| Field | Value |
|-------|-------|
| **Document ID** | PHA-2026-01-05-001 |
| **Version** | 1.0.0 |
| **Created** | 2026-01-05T14:50:00+07:00 |
| **Created By** | Team A - bmad-core-bmad-master |
| **Phase** | Health Assessment |
| **Status** | CRITICAL_ISSUES_IDENTIFIED |

### Handoff History

| Date | Agent | Action |
|------|-------|--------|
| 2026-01-05T14:50:00+07:00 | @bmad-core-bmad-master | Initial assessment created |

---

**END OF HEALTH ASSESSMENT REPORT**
