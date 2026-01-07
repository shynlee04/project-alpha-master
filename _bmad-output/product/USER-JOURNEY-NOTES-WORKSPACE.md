# USER JOURNEY MAP: NOTES WORKSPACE
**Product Manager Systematic Analysis**
**Generated:** 2026-01-07
**Workspace:** Notes (First Target)
**Approach:** Horizontal expansion before vertical progression

---

## Methodology

```
LEVEL 1: Hub Page → First Interaction
    ↓
LEVEL 2: All Branched Entry Points to Notes
    ↓
LEVEL 3: For Each Branch → Horizontal Expansion (edge cases, errors, fallbacks)
    ↓
LEVEL 4: Resolve All Horizontals → No throwing errors, absolute fallbacks, no routing loops
    ↓
LEVEL 5: Only Then → Advance to Next Level
```

**Critical Rule:** Any throwing error on first 4 sequential steps = 50% product health reduction

---

## LEVEL 1: HUB PAGE ENTRY POINTS

### Hub Page Components Analysis
**File:** `src/presentation/components/hub/HubHomePage.tsx`

| Entry Point | Component | Handler | Target |
|-------------|-----------|---------|--------|
| **Notes Card** | BentoCard (id: 'notes') | `navigateToWorkspace('notes')` | ProjectPickerDialog |
| **Sidebar Notes** | WorkspaceFilter | Navigate to `/notes` | ProjectPickerDialog |
| **Recent Projects** | RecentProjectsSection | `handleOpenRecentProject()` | WorkspaceBindingDialog |

**Hardcoded Strings Found (NON-I18N):**
```typescript
// Line 107-108: HubHomePage.tsx
toast.info(`No projects yet`, {
  description: `Create or mount a project first to access the ${workspace} workspace.`,

// Line 320-322: Terminal card
toast.info("Global Terminal Access Restricted", {
  description: "Please access terminal via an active Workspace."

// Line 432-434: Search result
toast.info('Search result selected', {
  description: result.document.filename,
```

---

## LEVEL 2: NOTES WORKSPACE ENTRY POINTS

### Entry Point Flow Diagram

```
HubHomePage.tsx
    │
    ├─→ User clicks "FIELD_NOTES" card
    │       ↓
    │   navigateToWorkspace('notes')
    │       ↓
    │   Check: projects.length === 0?
    │       ├─ YES → toast "No projects yet"
    │       └─ NO  → Check: projects.length === 1?
    │               ├─ YES → navigate('/notes/$projectId')
    │               └─ NO  → ProjectPickerDialog
    │
    └─→ User clicks recent project card
            ↓
        handleOpenRecentProject()
            ↓
        WorkspaceBindingDialog
            ↓
        User selects workspace → navigate('/notes/$projectId')
```

---

## LEVEL 3: HORIZONTAL EXPANSION - 4 CASES

### CASE 1: Desktop User, No System File Sync

**User Profile:** Desktop browser, wants to use Notes as standalone app, no file sync

**Journey Steps:**

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | User opens app | Hub page loads | ✅ Works | PASS |
| 2 | User clicks Notes card | ProjectPickerDialog appears | ✅ Works | PASS |
| 3 | User clicks "Create New Project" | ProjectCreationWizard opens | ✅ Works | PASS |
| 4 | User enters name, selects IndexedDB | Project created, navigate to Notes | 🔴 **FAIL** | **BUG** |

**Step 4 Failure Analysis:**

```typescript
// HubHomePage.tsx:142-157 - handleProjectCreated()
if (project.storageType === 'indexeddb') {
  const bindings = project.bindings || {};
  if (bindings.knowledge) {
    navigate({ to: '/knowledge/$projectId', ... });
  } else if (bindings.notes) {
    navigate({ to: '/notes/$projectId', ... });
  } else if (bindings.study) {
    navigate({ to: '/study/$projectId', ...});
  } else {
    // ❌ BUG: User selects IndexedDB but no bindings set
    toast.info('No workspace enabled for this project...');
    // ❌ User is STUCK - no way to proceed
  }
}
```

**Root Cause:** ProjectCreationWizard creates project WITHOUT default bindings for IndexedDB storage type.

**Edge Cases:**
- User creates project with NO workspace bindings → Stuck in hub
- User has NO existing projects → No clear "Create Notes Project" path
- Back button doesn't work from wizard

**Fallback Required:** None - silent failure

---

### CASE 2: Desktop User, Sync Folder (FSA)

**User Profile:** Desktop browser, wants to sync local folder with all file types

**Journey Steps:**

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | User opens app | Hub page loads | ✅ Works | PASS |
| 2 | User clicks "CREATE_PROJECT" | ProjectCreationWizard opens | ✅ Works | PASS |
| 3 | User selects folder | Directory picker opens | ✅ Works | PASS |
| 4 | User confirms | Project created, files synced to Notes | 🔴 **FAIL** | **BUG** |

**Step 4 Failure Analysis:**

```typescript
// HubHomePage.tsx:158-164 - handleProjectCreated()
else {
  // For fsa storage, navigate to IDE (full file system access)
  navigate({
    to: '/ide/$projectId',
    params: { projectId }
  });
}
```

**Root Cause:**
1. FSA projects ALWAYS navigate to IDE, never to Notes
2. No option to use FSA project in Notes workspace
3. Files don't auto-import to Notes even if folder contains .md files

**User Complaint:**
> "I cant fucking create a project, nor sync with local file system"

**Edge Cases:**
- User has FSA project but wants Notes workspace → Not supported
- Folder has .md files but Notes shows empty → No sync
- User can't access their synced files in Notes

**Fallback Required:** None - wrong workspace forced

---

### CASE 3: Mobile User

**User Profile:** Smartphone browser, no FSA support available

**Journey Steps:**

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | User opens app on mobile | Hub page loads | ✅ Works | PASS |
| 2 | User clicks "CREATE_PROJECT" | FSA check fails | ✅ Detected | PASS |
| 3 | Graceful degradation message | Toast explains mobile limitation | ✅ Works | PASS |
| 4 | User clicks Notes card | Should access Notes via IndexedDB | 🔴 **FAIL** | **BUG** |

**Step 4 Failure Analysis:**

```typescript
// HubHomePage.tsx:167-183 - handleNewProject()
if (!isFSASupported) {
  toast.info('Folder Mounting Not Available', {
    description: 'Folder mounting requires a desktop browser...'
  });
  return; // ❌ STOPS HERE - no alternative path offered
}
```

**Root Cause:**
1. Mobile users get "not supported" toast but NO path forward
2. No automatic fallback to IndexedDB project creation
3. NotesPage.tsx shows "Desktop-only feature" banner

**NotesPage Mobile Fallback (Lines 396-412):**
```typescript
{!isNotesSyncSupported && (
  <div className="bg-muted/50 border-b border-border p-3">
    <p className="text-sm font-medium">Desktop-only feature</p>
    <p className="text-xs text-muted-foreground mt-1">
      File sync requires a desktop browser...
    </p>
  </div>
)}
```

**User Feedback:**
> "fallback infrastructure for smartphone users"

**Edge Cases:**
- Mobile user sees "Desktop-only feature" → Can't create notes
- No "Create Notes Project" button for mobile
- No IndexedDB option shown on mobile

**Fallback Status:** Message only, no functional fallback

---

### CASE 4: AI Content Generation Features

**User Profile:** Any user, wants to use AI features in Notes

**Journey Steps:**

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | User in Notes workspace | Notes page loads | ✅ Works | PASS |
| 2 | User types message in chat | Should work with AI | 🔴 **FAIL** | **BUG** |
| 3 | No API key configured | Should prompt for key | 🔴 **FAIL** | **BUG** |
| 4 | User saves key | Should retrieve and use key | 🔴 **FAIL** | **CRITICAL** |

**Step 2-3 Failure Analysis:**

**NotesPage.tsx Chat Integration (Lines 662-669):**
```typescript
<UnifiedChatPanel
  mode="agent"
  projectId={projectId}
  projectName={project?.name || projectId}
  workspaceType="notes"
  className="h-full"
/>
```

**The Chat Panel Does:**
- Sends messages to agent
- Displays responses

**The Chat Panel Does NOT:**
- Check if API key exists before allowing user to type
- Prompt user to configure key if missing
- Show key status indicator

**From FAILURE-GAP-ANALYSIS.md:**
> Journey J3: Agent Chat in Notes - User sends message WITHOUT API key → 401 error

**Root Cause:**
1. No key vault check before enabling chat
2. No "Configure API Key" call-to-action
3. User sends message → 401 error with no helpful guidance

**Step 4 Failure Analysis:**

```typescript
// From conversation history:
// User saves key in Provider Settings
// Key stored in vault ✅
// User tries AI feature
// Key never retrieved to service ❌
// 401 Unauthorized error
```

**Critical Gap:** Vault → Service bridge is broken

---

## LEVEL 4: ALL HORIZONTAL ISSUES SUMMARY

### Architecture Issues Found

| Issue | Location | Impact | Severity |
|-------|----------|--------|----------|
| **No default bindings for IndexedDB** | ProjectCreationWizard | User stuck in hub | P0 |
| **FSA projects force IDE only** | HubHomePage.handleProjectCreated() | Can't use Notes with FSA | P0 |
| **No mobile project creation path** | HubHomePage.handleNewProject() | Mobile users blocked | P0 |
| **No key vault check before chat** | UnifiedChatPanel | 401 errors, no guidance | P0 |
| **Vault→Service bridge broken** | Provider credential retrieval | Keys not retrieved to services | P0 |
| **No file type sync to Notes** | NotesFileSyncService | .md files don't appear | P1 |
| **Hardcoded strings everywhere** | Multiple files | Not i18n compliant | P2 |
| **Inline styles, hardcoded classes** | Multiple files | Violates design system | P2 |

### Error States Not Handled

| Error Scenario | Current Behavior | Expected Fallback |
|----------------|-----------------|-------------------|
| No API key configured | 401 error, silent failure | Prompt to configure key |
| Key saved but not retrieved | Silent 401 error | Show key status, retry retrieval |
| File sync not supported | "Desktop-only feature" banner | Offer IndexedDB alternative |
| No workspace bindings | "No workspace enabled" toast | Auto-bind to Notes, guide user |
| Mobile user wants FSA | Toast + return | Auto-switch to IndexedDB flow |
| Project creation fails | Generic error toast | Show specific error, retry options |

---

## LEVEL 5: CRITICAL PATH REMEDIATION

### Priority Order (Based on User Impact)

#### P0-1: Fix LLM Key Vault → Service Bridge

**Files to Audit:**
```
src/infrastructure/persistence/stores/providers/
├── provider-store-core.ts
├── provider-store-credentials.ts
├── provider-store-events.ts
└── index.ts

src/lib/agent/providers/
├── credential-vault.ts
├── credential-storage.ts
└── provider-adapter.ts
```

**Required Fix:**
1. When service starts, check vault for key
2. If key exists, load into service memory
3. If key missing, show "Configure Key" CTA
4. After key save, notify all services to reload

**Acceptance Criteria:**
- [ ] Service retrieves key from vault on mount
- [ ] Chat panel shows key status indicator
- [ ] Missing key shows "Configure Key" button
- [ ] Key save triggers service reload

---

#### P0-2: Fix Project Creation Default Bindings

**Files to Audit:**
```
src/presentation/components/project/ProjectCreationWizard.tsx
src/infrastructure/persistence/stores/project/project-crud-slice.ts
```

**Required Fix:**
1. When IndexedDB selected, auto-bind Notes by default
2. Show workspace checkboxes (at least one required)
3. If user creates project without bindings, show error
4. After creation, navigate to first bound workspace

**Acceptance Criteria:**
- [ ] IndexedDB projects default to Notes binding
- [ ] User sees workspace selection
- [ ] Validation prevents no-binding projects
- [ ] Navigation goes to bound workspace

---

#### P0-3: Fix Mobile Project Creation Path

**Files to Audit:**
```
src/presentation/components/hub/HubHomePage.tsx
src/presentation/components/project/ProjectCreationWizard.tsx
```

**Required Fix:**
1. Detect FSA not supported → Auto-show IndexedDB option
2. Hide FSA option on mobile
3. Add "Create Notes Project" direct button
4. Skip folder picker on mobile

**Acceptance Criteria:**
- [ ] Mobile users see "Create Notes Project" button
- [ ] FSA option hidden on mobile
- [ ] IndexedDB default selected on mobile
- [ ] Project creation completes on mobile

---

#### P0-4: Fix File Sync to Notes Workspace

**Files to Audit:**
```
src/infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts
src/presentation/components/notes/NotesFilePicker.tsx
```

**Required Fix:**
1. When FSA project opened in Notes, scan for .md files
2. Import found .md files automatically
3. Show import progress with file count
4. Handle errors per-file, don't fail all

**Acceptance Criteria:**
- [ ] FSA project in Notes shows file list
- [ ] .md files auto-import on mount
- [ ] Progress bar shows import status
- [ ] Errors don't block other files

---

## DESIGN SYSTEM VIOLATIONS FOUND

### Hardcoded Strings (Must Use i18n)

**HubHomePage.tsx:**
```typescript
// ❌ WRONG
toast.info(`No projects yet`, {
  description: `Create or mount a project first...`

// ✅ CORRECT
toast.info(t('hub.noProjects'), {
  description: t('hub.noProjectsDesc')
```

**NotesPage.tsx:**
```typescript
// ❌ WRONG
<p className="text-sm font-medium">Desktop-only feature</p>
<p className="text-xs text-muted-foreground mt-1">
  File sync requires a desktop browser...

// ✅ CORRECT
<p className="text-sm font-medium">{t('notes.desktopOnly.title')}</p>
<p className="text-xs text-muted-foreground mt-1">
  {t('notes.desktopOnly.description')}
```

### Inline Styles (Must Use Design Tokens)

**NotesPage.tsx:**
```typescript
// ❌ WRONG
style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}

// ✅ CORRECT
className="w-full bg-muted rounded-full h-2 overflow-hidden"
// Then CSS --progress-width variable set via inline style ONLY for dynamic values
```

---

## NEXT STEPS

1. **STOP** all god store/component splitting work
2. **FOCUS** on P0 issues above
3. **FIX** LLM key retrieval bridge (blocks all AI features)
4. **FIX** Project creation flow (blocks new users)
5. **FIX** File sync to Notes (blocks FSA users)
6. **THEN** return to code quality improvements

---

**User Quote:**
> "code splitting should not be addressed while the feature is still in development"

This is exactly right. We're splitting components while the core functionality doesn't work.

---

**Health Impact Assessment:**

| Metric | Current | After P0 Fixes |
|--------|---------|-----------------|
| User can create project | ❌ NO | ✅ YES |
| User can use AI in Notes | ❌ NO (401) | ✅ YES |
| User can sync files to Notes | ❌ NO | ✅ YES |
| Mobile user can use Notes | ❌ NO | ✅ YES |
| **Overall Health** | **~20%** | **~80%** |

Current brownfield plan focuses on TypeScript errors and god stores - but users can't even use the basic features.
