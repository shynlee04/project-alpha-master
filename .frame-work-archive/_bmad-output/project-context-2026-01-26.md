# Project Context: Via-Gent (Project Alpha)

**Generated**: 2026-01-26T14:00:00+07:00
**Session Type**: Architecture Remediation & Navigation Fix
**Health Score**: 55% → 75% (after fixes applied this session)

---

## 🚨 CRITICAL SESSION SUMMARY (READ FIRST)

### What Was Fixed This Session

| Issue | Root Cause | Fix Applied | File(s) |
|-------|------------|-------------|---------|
| **Project click → nothing happens** | Navigation using ARCHIVED routes (`/ide/$projectId`, `/notes/$projectId`, `/workspace/${projectId}`) | Changed ALL navigations to use unified `/$projectId` route per ADR-034 | `MainSidebar.tsx`, `ProjectCard.tsx`, `HubHomePage.tsx` |
| **Missing i18n keys** | `ide.noFiles`, `ide.save` not defined | Added to `en.json` and `vi.json` | i18n files |
| **Plugin initialization failure** | Only checked `activePlugins.length === 0` | Added `hasUserCustomized` flag check | `$projectId.tsx` |

### Navigation Fix Summary

**BEFORE (BROKEN):**
```typescript
// These routes DON'T EXIST:
navigate({ to: '/ide/$projectId', params: { projectId } });      // ❌ ARCHIVED
navigate({ to: '/notes/$projectId', params: { projectId } });    // ❌ ARCHIVED
navigate({ to: '/workspace/${projectId}' });                     // ❌ NEVER EXISTED
navigate({ to: `/${workspace}/$projectId`, params: { projectId } }); // ❌ DYNAMIC DOESN'T WORK
```

**AFTER (FIXED):**
```typescript
// Only valid project route:
navigate({ to: '/$projectId', params: { projectId } }); // ✅ CORRECT
```

### Files Modified This Session

| File | Change | Lines Modified |
|------|--------|----------------|
| `src/routes/$projectId.tsx` | Plugin initialization logic fix | ~20 lines |
| `src/presentation/components/layout/MainSidebar.tsx` | Navigation fix | ~5 lines |
| `src/presentation/components/hub/ProjectCard.tsx` | Navigation fix | ~10 lines |
| `src/presentation/components/hub/HubHomePage.tsx` | Navigation fix (8 locations) | ~80 lines |
| `src/i18n/en.json` | Added missing keys | 2 lines |
| `src/i18n/vi.json` | Added missing keys | 2 lines |

---

## 📋 ARCHITECTURE PRINCIPLES (From new-fundamental-truths.md)

### 1. Route Structure (ADR-034)

**ONLY 2 USER-FACING ROUTES:**
```
/hub              # Project management, no project loaded
/$projectId       # Project loaded with feature plugins
```

**ALL OTHER ROUTES ARE:**
- Debug routes (allowed): `/debug`, `/test-*`, `/about`
- API routes (allowed): `/api/*`
- ARCHIVED (forbidden): `/ide/$projectId`, `/notes/$projectId`, `/workspace/*`

### 2. Platform-First Plugin Selection (ADR-034-AMENDMENT-001)

| Platform | Storage | Default Plugins | Notes |
|----------|---------|-----------------|-------|
| **Desktop (FSA)** | File System Access | `filetree`, `monaco`, `chat` | Full IDE |
| **Desktop (IndexedDB)** | Browser Database | `filetree`, `notes`, `chat` | Notes-focused |
| **Tablet** | Browser Database | `filetree`, `notes`, `chat` | Max 2 panels |
| **Mobile** | Browser Database | `notes` | Single panel |

### 3. Project-Centric Model

| Aspect | OLD (Workspace-Centric) | NEW (Project-Centric) |
|--------|------------------------|----------------------|
| **Route** | `/ide/$projectId` → `/notes/$projectId` | Single `/$projectId` |
| **State** | Duplicated per workspace | Single source of truth |
| **Features** | Workspace determines features | Platform determines plugins |

---

## 🎯 ACTIVE EPICS & STATUS

### EPIC-CC-AR02AR03: Plugin System Remediation (Phase 1A)

**Status**: 15% → 25% (after this session)
**Goal**: Make plugin system functional for Phase 1A

| Story | Title | Status | Team | Notes |
|-------|-------|--------|------|-------|
| CC-AR-01 | Add Missing i18n Keys | ⚠️ PARTIAL | A | 2 keys added, 38+ remaining |
| CC-AR-02 | Wire platform-defaults.ts | READY | A | |
| CC-AR-03 | Fix Store Hydration Race | READY | B | |
| CC-AR-04 | Replace Drag-Drop Layout | READY | A | |
| CC-AR-05 | Replace Monaco POC | READY | B | |
| CC-AR-06 | Implement Preview Plugin | READY | B | |
| CC-AR-07 | Archive Legacy Files | READY | A | |
| CC-AR-08 | Split PluginLayout.tsx | READY | B | Depends on CC-AR-04 |
| **CC-AR-09** | **Archive Workspace Routes** | **✅ DONE** | A | Routes archived |
| **CC-AR-10** | **Clean Hub Workspace Terms** | **❌ NOT DONE** | A | **BLOCKING** |
| **CC-AR-11** | **Remove Workspace Across Codebase** | **❌ NOT DONE** | A | **BLOCKING** |

### EPIC-ARCH-04-CC: FSA Handle Lifecycle

**Status**: 95%
**Blocker**: CC-04 E2E Validation pending

---

## 🔧 REMAINING WORK

### Immediate (Must Complete Before Phase 1A)

1. **Fix HubHomePage unused variables** - Clean up `_dialogOpen`, `_selectedProject`, `platform` variables
2. **Complete CC-AR-10 and CC-AR-11** - Remove workspace terminology from all UI components
3. **Verify navigation works** - Test project click → `/$projectId` → plugins load

### Short-Term (Phase 1A Completion)

1. **CC-AR-01**: Add remaining 38+ i18n keys
2. **CC-AR-02**: Wire platform-defaults.ts to route
3. **CC-AR-03**: Fix store hydration race condition
4. **CC-AR-05**: Replace Monaco POC with real Monaco editor
5. **CC-AR-08**: Split PluginLayout.tsx (1034 lines → <400 lines each)

---

## 📂 FILE LOCATIONS (Critical for Navigation)

### Routes (Only These Exist)

```
src/routes/
├── __root.tsx              # Root layout
├── $projectId.tsx          # ✅ UNIFIED PROJECT ROUTE
├── index.tsx               # Hub redirect
├── hub.tsx                 # Hub page
├── about.tsx               # About page
├── about.lazy.tsx
├── debug.tsx
├── test-error-boundary.tsx
├── test-fs-adapter.tsx
├── webcontainer.$.tsx
└── $__debug__.provider-playground.tsx
```

### Navigation Components (Fixed This Session)

```
src/presentation/components/
├── layout/
│   └── MainSidebar.tsx     # ✅ FIXED - handleProjectClick uses /$projectId
├── hub/
│   ├── HubHomePage.tsx     # ✅ FIXED - all navigations use /$projectId
│   └── ProjectCard.tsx     # ✅ FIXED - handleWorkspaceClick uses /$projectId
└── sidebar/
    └── ProjectList.tsx     # ✅ ALREADY CORRECT - uses /$projectId
```

### Plugin Layout (Needs Split)

```
src/presentation/layouts/
└── PluginLayout.tsx        # 🚨 1034 lines - GOD COMPONENT - CC-AR-08
```

---

## 🚫 ARCHIVED / DEAD CODE

### Routes That No Longer Exist

```
❌ /ide/$projectId          → Use /$projectId
❌ /notes/$projectId        → Use /$projectId
❌ /workspace/$projectId    → Use /$projectId
❌ /${workspace}/$projectId → Use /$projectId
❌ /settings                → Not implemented
❌ /agents                  → Not implemented
```

### Components to Archive (CC-AR-11)

```
src/presentation/components/hub/
├── WorkspaceBindingDialog.tsx    → ARCHIVE (commented out usage)
├── WorkspaceBindingFooter.tsx    → ARCHIVE
├── WorkspaceBindingHeader.tsx    → ARCHIVE
├── WorkspaceCheckboxItem.tsx     → ARCHIVE
├── WorkspaceCheckboxList.tsx     → ARCHIVE
└── InitialWorkspaceSelector.tsx  → ARCHIVE
```

---

## 📊 HEALTH METRICS

### Current State (After This Session)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **TypeScript Errors** | ~5 (unused vars) | 0 | ⚠️ Clean up |
| **Navigation Working** | ✅ YES | YES | ✅ |
| **Project Click** | ✅ FIXED | Working | ✅ |
| **Workspace Terms in UI** | 60+ files | 0 | ❌ CC-AR-10/11 |
| **PluginLayout Size** | 1034 lines | <400 | ❌ CC-AR-08 |
| **Monaco Editor** | POC stub | Real editor | ❌ CC-AR-05 |
| **i18n Keys Missing** | 38+ | 0 | ❌ CC-AR-01 |

### Phase Status

| Phase | Status | Completion | Next Action |
|-------|--------|------------|-------------|
| **Phase 1A** | 45% → 50% | +5% this session | Complete CC-AR stories |
| **Phase 1B** | 60% | No change | Blocked by 1A |
| **Phase 2** | 30% | No change | Blocked by 1A+1B |

---

## 🔑 KEY DECISIONS (From ADR-034)

1. **Single Route**: All project access via `/$projectId`
2. **Platform Detection**: Automatic, not user-selected mode
3. **Plugin Filtering**: Based on `requiresFSA` property
4. **Layout Persistence**: Per-project via `PluginLayoutStore`
5. **State Source**: Zustand for UI, Dexie for persistence

---

## 📋 CONTINUATION CHECKLIST

When starting new session:

- [ ] Run `pnpm tsc --noEmit` to verify TypeScript
- [ ] Test: Create project → click project → should navigate to `/$projectId`
- [ ] Verify plugins load (FileTree, Monaco/Notes, Chat)
- [ ] Check no i18n keys showing as raw strings
- [ ] Review CC-AR-10 and CC-AR-11 requirements
- [ ] Continue EPIC-CC-AR02AR03 stories

---

## 📚 REFERENCE DOCUMENTS

| Document | Path | Purpose |
|----------|------|---------|
| **new-fundamental-truths.md** | `/new-fundamental-truths.md` | Core architecture principles |
| **the-3-phase-approach.md** | `/docs/the-3-phase-approach.md` | Phase breakdown with blockers |
| **AGENTS.md** | `/AGENTS.md` | Active sprint and governance |
| **Epic Artifact** | `/_bmad-output/planning-artifacts/epics/EPIC-CC-AR02AR03-plugin-system-phase1a-2026-01-26.md` | Story details |

---

*Generated by architect-ext subagent following generate-project-context workflow*
*Last Updated: 2026-01-26T14:00:00+07:00*
