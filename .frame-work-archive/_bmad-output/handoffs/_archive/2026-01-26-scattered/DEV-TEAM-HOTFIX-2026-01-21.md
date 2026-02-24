# DEV TEAM HOTFIX - Critical Bug Fixes Required

**Document ID:** `DEV-TEAM-HOTFIX-2026-01-21`
**Created:** 2026-01-21T12:00:00+07:00
**Priority:** P0 - BLOCKING
**Status:** READY FOR IMPLEMENTATION

---

## Executive Summary

Two critical bugs discovered after applying the previous fix batch:

| Bug | Symptom | Root Cause | Impact |
|-----|---------|------------|--------|
| **BUG-A** | Cannot create new projects (wizard or folder picker) | `folderPath` not indexed in Dexie schema + empty folderPath validation gaps | **100% blocking** - no new projects |
| **BUG-B** | Notes import still loops for old projects | Race condition in useEffect dependencies + sessionStorage key mismatch after ID migration | Import spinner forever |

---

## BUG-A: Project Creation Broken

### Symptom
- User clicks "Open Folder" from Hub → selects folder → **nothing happens**
- User uses Project Wizard → fills form → **error on submit**
- Console shows: `NotFoundError` or silent failure

### Root Cause Analysis

**Previous Fix (FIX-2026-01-20)** added duplicate folder check:

```typescript
// File: src/infrastructure/persistence/stores/project/project-crud-slice.ts
// Lines 129-136

const existingProject = await db.projects
    .where('folderPath')  // ❌ PROBLEM: folderPath is NOT indexed!
    .equals(input.folderPath)
    .first();
```

**But the Dexie schema does NOT have `folderPath` indexed:**

```typescript
// File: src/infrastructure/persistence/dexie-db-migrations.ts
// Line 86 (and all subsequent versions)

projects: 'id, lastOpened, name',  // ❌ NO folderPath index!
```

**Dexie Behavior:** Calling `.where()` on an unindexed column throws an error.

### Fix Required

**Two files need modification:**

#### File 1: Add Schema Migration

**File:** `src/infrastructure/persistence/dexie-db-migrations.ts`
**Location:** After line 1694 (end of v27 migration), before the closing `}`
**Action:** Add new version 28

```typescript
    // Schema version 28: Add folderPath index to projects table (BUG-A-2026-01-21)
    // Required for duplicate folder detection in project creation
    db.version(28).stores({
        projects: 'id, lastOpened, name, folderPath',  // ADD folderPath index
        ideState: 'projectId, updatedAt',
        conversations: 'id, projectId, updatedAt',
        taskContexts: 'id, projectId, agentId, status, [projectId+status]',
        toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
        credentials: 'providerId, createdAt',
        threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
        providerConfigs: 'id, updatedAt',
        agentConfigs: 'id, updatedAt',
        conversationState: 'id, updatedAt',
        syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
        ragState: 'id, updatedAt',
        fileSyncStatus: 'id, updatedAt',
        fileMetadata: '[projectId+filePath], projectId, lastModified',
        toolExecutionLogs: 'id, conversationId, toolName, status, createdAt, [conversationId+createdAt]',
        fsaHandles: 'projectId, workspaceId, createdAt, [projectId+workspaceId]',
        sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
        fileSnapshots: '++id, projectId, filePath, createdAt, [projectId+filePath]',
        fileContentCache: 'id, projectId, lastAccessed',
        sources: 'id, projectId, type, createdAt, [projectId+type]',
        collections: 'id, projectId, createdAt',
        synthesisResults: 'id, projectId, createdAt',
        oramaIndexes: 'id, projectId, createdAt',
        embedding_models: 'id, provider',
        notes: 'id, projectId, createdAt, updatedAt, [projectId+updatedAt]',
        workflows: 'id, name, createdAt, updatedAt, *tags',
        codeSnippets: 'id, projectId, language, createdAt, *tags',
        savedBlocks: 'id, projectId, type, createdAt, *tags',
        plugins: 'id, source, state, installedAt',
        pluginSettings: 'id',
        pluginMarketplace: 'id, category, cachedAt',
        pluginStorage: 'id, pluginId',
        flashcards: 'id, projectId, sourceId, createdAt, [projectId+sourceId]',
        flashcardSets: 'id, projectId, createdAt',
        studySessions: 'id, projectId, startedAt, [projectId+startedAt]',
        studyCards: 'id, sessionId, flashcardId',
        quizzes: 'id, projectId, createdAt, [projectId+createdAt]',
        quizQuestions: 'id, quizId, order',
        idbFiles: '[projectId+path], projectId',
        workspaceState: 'id, updatedAt',
        terminalState: 'id, updatedAt',
    }).upgrade(async () => {
        logDexieMigration(28, 'add-folderPath-index', 'started');
        // No data migration needed - just index addition
        logDexieMigration(28, 'add-folderPath-index', 'completed', 'Index added to projects table');
        markMigrationApplied(28);
    });
```

#### File 2: Add Fallback for Missing Index

**File:** `src/infrastructure/persistence/stores/project/project-crud-slice.ts`
**Location:** Lines 129-136
**Action:** Replace with try-catch that falls back to filter

**Current Code (REMOVE):**
```typescript
    // FIX-2026-01-20: Check if folder path is already used by another project
    const existingProject = await db.projects
        .where('folderPath')
        .equals(input.folderPath)
        .first();
    if (existingProject) {
        throw new Error(`This folder is already used by project "${existingProject.name}"`);
    }
```

**New Code (REPLACE WITH):**
```typescript
    // FIX-2026-01-21: Check if folder path is already used by another project
    // Uses try-catch for backward compatibility with older schemas without folderPath index
    try {
        let existingProject;
        try {
            // Try indexed query first (fast, requires schema v28+)
            existingProject = await db.projects
                .where('folderPath')
                .equals(input.folderPath)
                .first();
        } catch (indexError) {
            // Fallback to filter scan for older schemas
            console.warn('[ProjectStore] folderPath not indexed, using filter scan');
            const allProjects = await db.projects.toArray();
            existingProject = allProjects.find(p => p.folderPath === input.folderPath);
        }
        
        if (existingProject) {
            throw new Error(`This folder is already used by project "${existingProject.name}"`);
        }
    } catch (error) {
        // Only re-throw if it's our duplicate folder error
        if ((error as Error).message.includes('already used by project')) {
            throw error;
        }
        // Log but don't block project creation for other errors
        console.error('[ProjectStore] Error checking duplicate folder:', error);
    }
```

### Verification Steps

```bash
# 1. Build check
pnpm tsc --noEmit

# 2. Manual test - Fresh database
# - Clear IndexedDB (DevTools > Application > IndexedDB > Delete)
# - Reload app
# - Open folder from Hub
# - Should create project successfully

# 3. Manual test - Existing database
# - Keep existing IndexedDB
# - Reload app (migration v28 runs)
# - Open folder from Hub
# - Should create project successfully
```

#### File 3: Validate folderPath Input (Defense in Depth)

**File:** `src/infrastructure/persistence/stores/project/project-crud-slice.ts`
**Location:** Before line 129 (BEFORE the duplicate check)
**Action:** Add input validation

```typescript
    // FIX-2026-01-21: Validate folderPath before duplicate check
    // Prevents empty string matching legacy projects with empty folderPath
    if (!input.folderPath || input.folderPath.trim() === '') {
        throw new Error('Project folder path is required');
    }
```

#### File 4: Validate Wizard Form Slug (Defense in Depth)

**File:** `src/presentation/components/project/ProjectCreationWizard.tsx`
**Location:** In the form validation logic (step 1 validation)
**Action:** Ensure generated slug is non-empty

```typescript
    // FIX-2026-01-21: Validate project slug
    const generatedSlug = formData.projectName?.toLowerCase().replace(/\s+/g, '-') || '';
    if (!generatedSlug) {
        errors[1] = t('project.wizard.error.invalidName', 'Please enter a valid project name (not just spaces)');
    }
```

---

## BUG-B: Notes Import Loop for Old Projects

### Symptom
- Navigate to Notes workspace with existing FSA project
- Import spinner appears and **never stops**
- Console shows repeated `[NotesPage] Auto-importing project files for: ...`

### Root Cause Analysis

**Previous Fix (FIX-2026-01-20)** added ref-based guard and sessionStorage tracking:

```typescript
// Line 226-231
const isImportingRef = useRef(false);
const getImportKey = (pid: string) => `notes_imported_${pid}`;
const hasImportedThisSession = (pid: string) => sessionStorage.getItem(getImportKey(pid)) === 'done';
```

**Problem:** The `notesSyncService` is in the dependency array (line 371):

```typescript
}, [isNotesSyncReady, notesSyncService, projectId, loadNotes, t]);
```

**Race Condition:**
1. Effect runs → `isImportingRef.current = true` → starts import
2. During import, `notesSyncService` reference changes (re-created by parent)
3. Effect re-runs while import is in progress
4. `isImportingRef.current` is `true` → correctly skips
5. Import finishes → `isImportingRef.current = false` → marks sessionStorage
6. `notesSyncService` reference changes again → effect re-runs
7. **For old projects:** sessionStorage might not be set if project existed before fix

**Additional Issue:** The reset effect (lines 234-239) doesn't preserve sessionStorage:

```typescript
useEffect(() => {
    setIsImportingFiles(false);
    isImportingRef.current = false;
    autoInitAttemptedRef.current = false;
    // NOTE: Do NOT clear sessionStorage here - it should persist across remounts
}, [projectId]);
```

But if the component unmounts and remounts with the same projectId, the ref gets reset to `false` while sessionStorage persists. This is correct behavior.

**The real issue:** For **old projects that existed before the fix**, sessionStorage was never set, so every mount triggers import.

### Additional Root Cause (Dev Team Finding) - SessionStorage Key Mismatch

**Critical Discovery:** Migration v27 changed project IDs but sessionStorage keys weren't migrated:

| Before Migration | After Migration |
|-----------------|-----------------|
| Project ID: `notes:browser-mode` | Project ID: `proj_browser-default` |
| sessionStorage key: `notes_imported_notes:browser-mode` | New key: `notes_imported_proj_browser-default` |
| Key value: `'done'` | Key value: `null` (new key never set!) |

**Problem Chain:**
1. User created project on Jan 18 → ID: `notes:proj_xxx` → sessionStorage: `notes_imported_notes:proj_xxx = 'done'`
2. Migration v27 runs → ID changed to `proj_xxx`
3. User revisits Notes → code checks `hasImportedThisSession('proj_xxx')`
4. Looks for `notes_imported_proj_xxx` → returns `null` (never set!)
5. Import runs again → effect re-runs → **INFINITE LOOP**

### Fix Required

**File:** `src/presentation/components/notes/NotesPage.tsx`

#### Change 0: Migrate SessionStorage Keys for Old Projects (Critical for Legacy Data)

**Location:** After line 231 (after the helper functions, before the reset effect)
**Action:** Add one-time migration for old sessionStorage keys

**Add this code:**
```typescript
    // FIX-2026-01-21: Migrate old sessionStorage keys after project ID migration (v27)
    // Old format: notes_imported_notes:proj_xxx → New format: notes_imported_proj_xxx
    useEffect(() => {
        if (!projectId) return;
        
        // Check if old key format exists (from before migration v27)
        const oldFormats = [
            `notes_imported_notes:${projectId}`,
            `notes_imported_ide:${projectId}`,
            `notes_imported_knowledge:${projectId}`,
            `notes_imported_study:${projectId}`,
        ];
        
        for (const oldKey of oldFormats) {
            if (sessionStorage.getItem(oldKey) === 'done') {
                // Migrate to new format
                const newKey = `notes_imported_${projectId}`;
                sessionStorage.setItem(newKey, 'done');
                sessionStorage.removeItem(oldKey);
                console.log(`[NotesPage] Migrated sessionStorage key: ${oldKey} → ${newKey}`);
            }
        }
    }, [projectId]);
```

#### Change 1: Stabilize dependencies by deriving boolean

**Location:** Before line 284 (before the auto-import useEffect)
**Action:** Add stable boolean derivation

**Add this code:**
```typescript
    // FIX-2026-01-21: Create stable boolean to prevent re-runs from service reference changes
    const canAutoImport = Boolean(
        isNotesSyncReady && 
        notesSyncService && 
        projectId &&
        !isImportingRef.current
    );
```

#### Change 2: Update the useEffect condition and dependencies

**Location:** Lines 284-371 (the auto-import useEffect)
**Action:** Replace entire useEffect

**Current Code (REMOVE):**
```typescript
    // S-007: Auto-import project files when file sync service becomes ready
    // BUG-FIX-003: Added timeout and cleanup to prevent infinite spinning
    // PHASE0-2: Use Dexie hash tracking for idempotent imports
    useEffect(() => {
        let mounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        if (!projectId) return;

        if (isNotesSyncReady && notesSyncService && !isImportingRef.current && !hasImportedThisSession(projectId)) {
            // ... rest of effect
        }

        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isNotesSyncReady, notesSyncService, projectId, loadNotes, t]);
```

**New Code (REPLACE WITH):**
```typescript
    // S-007: Auto-import project files when file sync service becomes ready
    // BUG-FIX-003: Added timeout and cleanup to prevent infinite spinning
    // PHASE0-2: Use Dexie hash tracking for idempotent imports
    // FIX-2026-01-21: Stabilized dependencies to prevent re-runs from service reference changes
    useEffect(() => {
        let mounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        // Early exit conditions (before any async work)
        if (!projectId) return;
        if (!canAutoImport) return;
        if (hasImportedThisSession(projectId)) {
            console.log('[NotesPage] Import skipped - already imported this session:', projectId);
            return;
        }

        const autoImportFiles = async () => {
            // Double-check ref guard (in case of race)
            if (isImportingRef.current) {
                console.log('[NotesPage] Import skipped - already in progress');
                return;
            }
            
            if (!mounted) return;

            setIsImportingFiles(true);
            isImportingRef.current = true;
            setImportProgress({ current: 0, total: 0, currentFile: '' });

            // BUG-FIX-003: Create a timeout promise (30 seconds max)
            const importTimeout = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error('Import timeout after 30 seconds - operation cancelled'));
                }, 30000);
            });

            try {
                console.log('[NotesPage] Auto-importing project files for:', projectId);

                // BUG-FIX-003: Race between import and timeout
                const result = await Promise.race([
                    (notesSyncService as NotesFileSyncService).importDirectory(
                        '', // Root directory
                        (current: number, total: number, currentFile: string) => {
                            if (mounted) {
                                setImportProgress({ current, total, currentFile });
                            }
                        }
                    ),
                    importTimeout,
                ]) as Awaited<ReturnType<typeof NotesFileSyncService.prototype.importDirectory>>;

                // Clear timeout on success
                if (timeoutId) clearTimeout(timeoutId);

                if (!mounted) return;

                console.log('[NotesPage] Auto-import complete:', result);

                // PHASE0-2: Handle skipped import (hash unchanged)
                if (result.skipped && result.skipReason === 'unchanged') {
                    console.log('[NotesPage] Import skipped - files unchanged');
                    // Still load notes to ensure they're available
                    if (projectId) {
                        await loadNotes(projectId);
                    }
                } else {
                    // Reload notes after successful import
                    if (projectId) {
                        await loadNotes(projectId);
                    }
                }
            } catch (error) {
                if (!mounted) return;

                const err = error as Error;
                console.error('[NotesPage] Auto-import failed:', err);

                // BUG-FIX-003: Show specific error for timeout
                const isTimeout = err.message.includes('timeout');
                toast.error(t('notes.import_failed', 'Failed to auto-import files'), {
                    description: isTimeout
                        ? t('notes.import_timeout', 'Import took too long. The folder may be too large or access was denied.')
                        : err.message,
                });
            } finally {
                if (mounted) {
                    isImportingRef.current = false;
                    setIsImportingFiles(false);
                    // Mark as imported regardless of success/failure to prevent infinite retries
                    markImportedThisSession(projectId);
                }
            }
        };

        autoImportFiles();

        // BUG-FIX-003: Cleanup function to prevent state updates after unmount
        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    // FIX-2026-01-21: Use stable boolean instead of service reference
    }, [canAutoImport, projectId, loadNotes, t, notesSyncService]);
```

#### Change 3: Add debug logging for troubleshooting

**Location:** After line 231 (after the helper functions)
**Action:** Add debug effect (can be removed after fix is verified)

```typescript
    // DEBUG: Log import state changes (remove after fix verified)
    useEffect(() => {
        console.log('[NotesPage DEBUG] Import state:', {
            projectId,
            canAutoImport,
            isImportingRef: isImportingRef.current,
            hasImported: projectId ? hasImportedThisSession(projectId) : 'no-project',
            isNotesSyncReady,
            hasService: Boolean(notesSyncService),
        });
    }, [projectId, canAutoImport, isNotesSyncReady, notesSyncService]);
```

### Verification Steps

```bash
# 1. Build check
pnpm tsc --noEmit

# 2. Manual test - Old project (existed before fix)
# - Open Notes with existing FSA project
# - Import should run ONCE
# - Check console: "[NotesPage] Auto-import complete: ..."
# - Navigate away and back
# - Check console: "[NotesPage] Import skipped - already imported this session"

# 3. Manual test - New project
# - Create new project
# - Navigate to Notes
# - Import should run ONCE
# - Navigate away and back
# - Should NOT re-import

# 4. Manual test - Refresh behavior
# - Refresh page (sessionStorage clears)
# - Import runs once (expected - new session)
# - Navigate away and back within session
# - Should NOT re-import
```

---

## Complete File Change Summary

| File | Lines Changed | Type |
|------|---------------|------|
| `src/infrastructure/persistence/dexie-db-migrations.ts` | +50 | Add v28 migration |
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | +25/-7 | Replace duplicate check + add validation |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | +5 | Add slug validation |
| `src/presentation/components/notes/NotesPage.tsx` | +40/-2 | SessionStorage migration + canAutoImport + deps |

---

## Testing Checklist

### BUG-A: Project Creation
- [ ] Fresh database: Open folder from Hub creates project
- [ ] Fresh database: Project wizard creates project
- [ ] Fresh database: Wizard rejects whitespace-only names
- [ ] Existing database: Migration v28 runs without error
- [ ] Existing database: Open folder from Hub creates project
- [ ] Duplicate folder: Shows error "This folder is already used..."
- [ ] Empty folderPath: Shows error "Project folder path is required"

### BUG-B: Notes Import Loop
- [ ] Old project (existed before v27): Import runs once, not infinitely
- [ ] Old project: Check console for "Migrated sessionStorage key" message
- [ ] New project: Import runs once
- [ ] Navigate away/back: No re-import within session
- [ ] Page refresh: Import runs once (new session)
- [ ] Console logs show correct skip reasons

---

## Rollback Plan

If fixes cause new issues:

### BUG-A Rollback
1. Remove v28 migration (won't cause data loss - just removes index)
2. Replace duplicate check with simple `// TODO: add duplicate check` comment
3. Deploy

### BUG-B Rollback
1. Revert NotesPage.tsx to previous version
2. Add `isImportingFiles` back to dependency array
3. Deploy (will still loop, but no worse than before)

---

## Contact

**Investigation by:** architect-ext agent
**Handoff created:** 2026-01-21T12:00:00+07:00
**Blocking issues:** Yes - no new projects can be created

---

*End of handoff document*
