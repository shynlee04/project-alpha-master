# IDE FSA Migration Rollback Guide

**Epic**: CC-IDE-FSA
**Story**: CC-IDE-08
**Version**: 1.0.0
**Created**: 2026-01-19T00:00:00+07:00
**Updated**: 2026-01-19T00:00:00+07:00

---

## Overview

This guide provides comprehensive rollback procedures to revert the IDE FSA migration (CC-IDE-01 through CC-IDE-07) if critical issues are encountered in production.

### When to Rollback

Rollback is recommended when:

| Situation | Description | Urgency |
|-----------|-------------|----------|
| ⚠️ **Critical Bugs** | Production critical bugs prevent IDE functionality | HIGH |
| ⚠️ **Performance Issues** | FSA causes severe degradation or freezing | HIGH |
| ⚠️ **Data Corruption** | File data corruption or loss from FSA operations | CRITICAL |
| ⚠️ **Permission Errors** | OS restrictions prevent file access after regranting | HIGH |
| ⚠️ **User Complaints** | Multiple user reports of broken file operations | MEDIUM |
| ⚠️ **Data Loss Risk** | Unrecoverable data integrity issues | CRITICAL |

### Estimated Rollback Time

| Project Size | Files | Estimated Time |
|--------------|--------|-----------------|
| Small | < 100 | 5-10 minutes |
| Medium | 100-500 | 10-15 minutes |
| Large | 500-1000 | 15-30 minutes |
| Very Large | 1000+ | 30-45 minutes |

### Rollback Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss if rollback incomplete | Low | Critical | Backup before rollback |
| Conflicts with concurrent development | Medium | Medium | Coordinate with team |
| Need to re-run tests after rollback | High | Low | Schedule rollback with QA |
| Migration conflicts if re-migrating | Low | Medium | Document state before rollback |
| Mobile IDE access issues | Low | Low | Verify platform guard removal |

---

---

## 📝 Overview

This guide provides step-by-step instructions for rolling back IDE FSA migration to IndexedDB storage. The rollback process is designed to be completed in **under 15 minutes** for typical projects.

### What This Guide Covers

- Pre-rollback checklist and safety verification
- Step-by-step rollback process with code snippets
- Data migration from FSA files to IndexedDB (optional)
- Post-rollback validation and verification
- Troubleshooting common issues
- Known limitations and support escalation path

### When to Rollback?

Rollback to IndexedDB storage if:

- ⚠️ **Data Corruption**: FSA files are damaged, unreadable, or inaccessible
- ⚠️ **Performance Issues**: FSA storage causes severe degradation or freezing in IDE
- ⚠️ **Permission Problems**: OS restrictions prevent file access, even after regranting
- ⚠️ **File System Errors**: I/O errors, disk failures, or file system corruption
- ⚠️ **User Data Loss Risk**: Data integrity issues that cannot be resolved
- ⚠️ **Development/Testing**: Need to test IDE functionality without FSA

### Target Time

| Project Size | Expected Rollback Time |
|--------------|---------------------|
| < 100 files | < 5 minutes |
| 100-500 files | 5-10 minutes |
| 500-1000 files | 10-15 minutes |
| 1000+ files | 15-20 minutes (may exceed target) |

---

## Prerequisites

Before starting rollback, verify the following:

### Safety Checks

1. [ ] **User Intent Confirmed**: User or team lead has explicitly requested rollback
2. [ ] **Backup Created**: FSA project folder backed up to safe location
3. [ ] **Correct Project Identified**: Project ID verified for rollback
4. [ ] **Git Status Clean**: Either committed changes or branch created
5. [ ] **Dev Servers Stopped**: Stop all running dev servers

### Preparation Steps

#### Step 0: Create Backup

```bash
# Create backup with timestamp
BACKUP_DIR="_bmad-ext/.archive/ide-fsa-rollback-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup FSA gateway files
cp -r src/infrastructure/filesystem/ide-file-gateway.ts "$BACKUP_DIR/infrastructure/filesystem/" 2>/dev/null || true
cp -r src/infrastructure/webcontainer/fsa-adapter.ts "$BACKUP_DIR/infrastructure/webcontainer/" 2>/dev/null || true
cp -r src/presentation/components/ide/StorageBadge.tsx "$BACKUP_DIR/presentation/components/ide/" 2>/dev/null || true

echo "Backup created at: $BACKUP_DIR"
```

#### Step 0.1: Check Git Status

```bash
# Check for uncommitted changes
git status

# If uncommitted work exists, create a backup branch
if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes detected. Creating backup branch..."
  git checkout -b pre-rollback-backup-$(date +%Y%m%d-%H%M%S)
  git commit -am "Backup before IDE FSA rollback"
fi
```

#### Step 0.2: Stop Dev Servers

```bash
# Stop running development servers
pkill -f "vite" 2>/dev/null || true
pkill -f "webcontainer" 2>/dev/null || true

echo "Development servers stopped"
```

---

## Rollback Steps

### Files to Modify (Summary)

| File | Change Type | Description |
|------|-------------|-------------|
| `src/presentation/components/ide/FileTree.tsx` | **MODIFY** | Remove FSA gateway, restore direct DB operations |
| `src/presentation/components/ide/MonacoEditor.tsx` | **MODIFY** | Remove FSA gateway, restore direct DB operations |
| `src/routes/ide.$projectId.tsx` | **MODIFY** | Remove platform guard (`beforeLoad`) |
| `src/presentation/components/ide/Header.tsx` | **MODIFY** | Remove StorageBadge component |
| `src/infrastructure/filesystem/ide-file-gateway.ts` | **ARCHIVE** | Remove FSA gateway file |
| `src/infrastructure/webcontainer/fsa-adapter.ts` | **ARCHIVE** | Remove FSA adapter file |
| `src/presentation/components/ide/StorageBadge.tsx` | **ARCHIVE** | Remove storage badge component |
| `src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts` | **ARCHIVE** | Remove test file |
| `src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts` | **ARCHIVE** | Remove test file |
| `src/e2e/ide-fsa-crud.spec.ts` | **ARCHIVE** | Remove E2E test |
| `src/e2e/ide-webcontainer.spec.ts` | **ARCHIVE** | Remove E2E test |
| `src/e2e/ide-terminal-fsa.spec.ts` | **ARCHIVE** | Remove E2E test |
| `src/e2e/ide-mobile-guard.spec.ts` | **ARCHIVE** | Remove E2E test |

Total Files to Modify: **4 files** (FileTree, MonacoEditor, IDE route, Header)
Total Files to Archive: **9 files** (FSA components, tests)

---

### Step 1: Remove FSA Adapter from FileTree

**File**: `src/presentation/components/ide/FileTree.tsx`

**Changes to revert**:

```typescript
// --- REMOVE THESE LINES ---
// import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';

// REMOVE this initialization:
// const gateway = createIdeFileGateway({ projectId });

// REPLACE this gateway.list() call:

// ❌ REMOVE:
// const files = await gateway.list('');

// ✅ REPLACE WITH:
import { db } from '@/infrastructure/persistence/dexie-db';

const files = await db.ide_files
  .where('projectId')
  .equals(projectId)
  .toArray();
```

**Verification Command**:
```bash
# Check for FSA references
grep -n "ide-file-gateway\|createIdeFileGateway\|gateway.list" \
  src/presentation/components/ide/FileTree.tsx

# Should return empty or only comments
```

---

### Step 2: Remove FSA Adapter from Monaco Editor

**File**: `src/presentation/components/ide/MonacoEditor.tsx`

**Changes to revert**:

```typescript
// --- REMOVE THESE LINES ---
// import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';

// REMOVE this initialization:
// const gateway = createIdeFileGateway({ projectId });

// REPLACE gateway operations:

// ❌ REMOVE read operation:
// const data = await gateway.read(filePath);
// const content = new TextDecoder().decode(data);

// ✅ REPLACE WITH:
import { db } from '@/infrastructure/persistence/dexie-db';

const file = await db.ide_files.where({ projectId, path: filePath }).first();
const content = file ? file.content : '';

// ❌ REMOVE write operation:
// const data = new TextEncoder().encode(content);
// await gateway.write(filePath, data);

// ✅ REPLACE WITH:
await db.ide_files.put({
  projectId,
  path: filePath,
  content,
  updatedAt: Date.now()
});
```

**Verification Command**:
```bash
# Check for FSA references
grep -n "ide-file-gateway\|createIdeFileGateway\|gateway.read\|gateway.write" \
  src/presentation/components/ide/MonacoEditor.tsx

# Should return empty or only comments
```

---

### Step 3: Remove StorageBadge Component

**File**: `src/presentation/components/ide/Header.tsx`

**Changes to revert**:

```typescript
// --- REMOVE THESE LINES ---
// import { StorageBadge } from './StorageBadge';

// ❌ REMOVE from JSX:
// <StorageBadge />

// ✅ No replacement needed - simply remove component
```

**Archive Command**:
```bash
mv src/presentation/components/ide/StorageBadge.tsx \
   "_bmad-ext/.archive/ide-fsa-rollback-$(date +%Y%m%d-%H%M%S)/presentation/components/ide/"
```

---

### Step 4: Remove Platform Guard

**File**: `src/routes/ide.$projectId.tsx`

**Changes to revert**:

```typescript
// --- REMOVE THESE LINES ---
// import { getPlatformContract } from '@/infrastructure/filesystem/platform-detection';

// ❌ REMOVE beforeLoad guard:
// beforeLoad: async ({ location }) => {
//   const platform = getPlatformContract();
//   if (!platform.canAccessIDE) {
//     throw redirect({ to: '/notes' });
//   }
// }

// ✅ No replacement needed - simply remove guard
```

---

### Step 5: Archive FSA Files

**Files to archive**:
- `src/infrastructure/filesystem/ide-file-gateway.ts`
- `src/infrastructure/webcontainer/fsa-adapter.ts`
- `src/presentation/components/ide/StorageBadge.tsx` (if not already archived)
- `src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts`
- `src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts`
- `src/e2e/ide-fsa-crud.spec.ts`
- `src/e2e/ide-webcontainer.spec.ts`
- `src/e2e/ide-terminal-fsa.spec.ts`
- `src/e2e/ide-mobile-guard.spec.ts`

**Archive Commands**:

```bash
# Create archive directory with timestamp
ARCHIVE_DIR="_bmad-ext/.archive/ide-fsa-rollback-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARCHIVE_DIR/infrastructure/filesystem"
mkdir -p "$ARCHIVE_DIR/infrastructure/webcontainer"
mkdir -p "$ARCHIVE_DIR/presentation/components/ide"
mkdir -p "$ARCHIVE_DIR/e2e"

# Archive FSA gateway files
if [ -f src/infrastructure/filesystem/ide-file-gateway.ts ]; then
  mv src/infrastructure/filesystem/ide-file-gateway.ts \
     "$ARCHIVE_DIR/infrastructure/filesystem/"
  echo "Archived: ide-file-gateway.ts"
fi

if [ -f src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts ]; then
  mv src/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts \
     "$ARCHIVE_DIR/infrastructure/filesystem/__tests__/"
  echo "Archived: ide-file-gateway.test.ts"
fi

# Archive FSA adapter files
if [ -f src/infrastructure/webcontainer/fsa-adapter.ts ]; then
  mv src/infrastructure/webcontainer/fsa-adapter.ts \
     "$ARCHIVE_DIR/infrastructure/webcontainer/"
  echo "Archived: fsa-adapter.ts"
fi

if [ -f src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts ]; then
  mv src/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts \
     "$ARCHIVE_DIR/infrastructure/webcontainer/__tests__/"
  echo "Archived: fsa-adapter.test.ts"
fi

# Archive presentation components
if [ -f src/presentation/components/ide/StorageBadge.tsx ]; then
  mv src/presentation/components/ide/StorageBadge.tsx \
     "$ARCHIVE_DIR/presentation/components/ide/"
  echo "Archived: StorageBadge.tsx"
fi

# Archive E2E tests
for test_file in src/e2e/ide-fsa-*.spec.ts; do
  if [ -f "$test_file" ]; then
    mv "$test_file" "$ARCHIVE_DIR/e2e/"
    echo "Archived: $(basename "$test_file")"
  fi
done

echo "Archive complete: $ARCHIVE_DIR"
```

#### Option 1: Using DevTools Console (Fastest)

1. Open ViaGent IDE in browser
2. Press F12 to open DevTools
3. Navigate to Console tab
4. Run the following JavaScript:

```javascript
// Rollback IDE project to IndexedDB storage
async function rollbackIdeProject(projectId) {
  // Get project store (assuming Zustand store pattern)
  // This code assumes access to project store via window or require
  const { useProjectStore } = await import('/node_modules/.pnpm/zustand/build/vanilla.js');

  const updateProject = useProjectStore.getState().updateProject;

  // Update project storage type to indexeddb
  updateProject(projectId, {
    storageType: 'indexeddb',
    storageMetadata: null // Clear FSA handle metadata
  });

  console.log(`[Rollback] Project ${projectId} rolled back to IndexedDB`);
  console.log('[Rollback] Please refresh the page to apply changes');
}

// Run rollback - REPLACE WITH YOUR PROJECT ID
rollbackIdeProject('your-project-id-here');
```

5. Refresh the page (F5) to apply changes
6. Navigate to IDE route - it should now use IDBGateway

#### Option 2: Using Browser IndexedDB (Manual)

1. Open ViaGent IDE in browser
2. Press F12 to open DevTools
3. Navigate to Application tab
4. Expand IndexedDB section
5. Find ViaGent database
6. Open `projects` table
7. Find your project by ID
8. Edit the project record:
   - Change `storageType` from `'fsa'` to `'indexeddb'`
   - Set `storageMetadata` to `null`
9. Save the record
10. Refresh the page (F5)

#### Option 3: Code Change (Development Environment)

If you have access to the codebase, temporarily modify the gateway factory:

```typescript
// File: src/infrastructure/filesystem/ide-file-gateway.ts

export function createIdeFileGateway(options: {
  projectId: string;
  fsaHandle?: FileSystemDirectoryHandle | undefined;
}): StorageGateway {
  const { projectId, fsaHandle } = options;
  const platform = getPlatformContract();

  // TEMPORARY ROLLBACK: Force IDBGateway even on desktop
  // Remove this code after rollback is complete
  const forceRollback = true; // Set to false after rollback

  if (platform.canAccessIDE && fsaHandle && !forceRollback) {
    console.log('[ide-file-gateway] Creating FSAGateway for desktop IDE');
    return new FSAGateway(fsaHandle);
  } else {
    console.log('[ide-file-gateway] Creating IDBGateway for IDE (rollback mode)');
    return new IDBGateway(projectId);
  }
}
```

### Step 2: Clear FSA Handle Metadata (1 minute)

Clear any persisted FSA handles from IndexedDB to prevent conflicts.

```javascript
// Clear FSA handle records from IndexedDB
async function clearFsaHandles() {
  // Open IndexedDB
  const request = indexedDB.open('ViaGentDatabase', 1);

  request.onsuccess = async (event) => {
    const db = (event.target as IDBOpenDBRequest).result;

    // Clear fsaHandles table (if it exists)
    if (db.objectStoreNames.contains('fsaHandles')) {
      const transaction = db.transaction(['fsaHandles'], 'readwrite');
      const store = transaction.objectStore('fsaHandles');
      await store.clear();
      console.log('[Rollback] FSA handles cleared');
    }

    // Clear idbFiles table (optional - removes all FSA-synced files)
    if (db.objectStoreNames.contains('idbFiles')) {
      const confirmClear = confirm('Do you want to clear all IDE files from IndexedDB? This will require re-importing from FSA.');
      if (confirmClear) {
        const transaction = db.transaction(['idbFiles'], 'readwrite');
        const store = transaction.objectStore('idbFiles');
        await store.clear();
        console.log('[Rollback] IDE files cleared from IndexedDB');
      }
    }
  };
}

clearFsaHandles();
```

### Step 3: Import FSA Files to IndexedDB (Optional - 5 minutes)

**IMPORTANT**: This step is only needed if you want to migrate IDE files from FSA disk to IndexedDB. If you plan to switch back to FSA in the future, you can skip this step.

#### Option 1: Manual Import via Browser Console

```javascript
// Import IDE files from FSA to IndexedDB
async function importIdeFilesToIdb(projectId) {
  // Request directory access (same directory used for FSA storage)
  const dirHandle = await window.showDirectoryPicker({
    mode: 'read',
    title: 'Select IDE project folder to import'
  });

  // Open IndexedDB
  const request = indexedDB.open('ViaGentDatabase', 1);
  request.onsuccess = async (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    const transaction = db.transaction(['idbFiles'], 'readwrite');
    const store = transaction.objectStore('idbFiles');

    let importedCount = 0;
    let errorCount = 0;

    // Recursive function to walk directory tree
    async function* walkDirectory(dir, path = '') {
      for await (const entry of dir.values()) {
        const entryPath = path ? `${path}/${entry.name}` : entry.name;

        if (entry.kind === 'file') {
          yield { handle: entry, path: entryPath };
        } else if (entry.kind === 'directory') {
          yield* walkDirectory(entry, entryPath);
        }
      }
    }

    // Walk through directory and import files
    for await (const { handle, path } of walkDirectory(dirHandle)) {
      try {
        const file = await handle.getFile();
        const content = await file.arrayBuffer();

        const record = {
          projectId,
          path,
          content: new Uint8Array(content),
          kind: 'file',
          size: content.byteLength,
          lastModified: file.lastModified,
          createdAt: file.lastModified,
          updatedAt: file.lastModified
        };

        await store.put(record);
        importedCount++;
      } catch (error) {
        console.error(`[Rollback] Failed to import ${path}:`, error);
        errorCount++;
      }
    }

    console.log(`[Rollback] Import complete: ${importedCount} files imported, ${errorCount} errors`);
  };
}

// Run import - REPLACE WITH YOUR PROJECT ID
importIdeFilesToIdb('your-project-id-here');
```

#### Option 2: Skip Import (Recommended)

If you plan to re-enable FSA in the future, skip this step. The FSA files will remain on disk, and you can switch back by simply updating `storageType` back to `'fsa'`.

### Step 6: Verify Rollback

#### 6.1 Check for FSA Remnants

```bash
# Check for FSA references in codebase
echo "Checking for FSA remnants..."

grep -r "ide-file-gateway\|fsa-adapter\|StorageBadge\|canAccessIDE" src/ \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=_bmad-ext \
  --exclude-dir=dist \
  --exclude-dir=.next \
  2>/dev/null

# Should return only comments or be empty
# If matches found, check if they're in comments
```

#### 6.2 Verify TypeScript Compilation

```bash
echo "Running TypeScript check..."
pnpm tsc --noEmit

# Expected: 0 errors
# If errors exist, check for broken imports:
grep -r "from.*ide-file-gateway\|from.*fsa-adapter" src/ \
  --exclude-dir=node_modules \
  --exclude-dir=.git
```

#### 6.3 Verify Build Succeeds

```bash
echo "Running build..."
pnpm build

# Expected: Build succeeds without errors
# If build fails, check console for FSA-related errors
```

#### 6.4 Run Tests

```bash
echo "Running test suite..."
pnpm vitest run

# Expected: All tests pass (excluding FSA tests which were archived)
# FSA-specific tests should not exist after rollback
```

#### 6.5 Verify IDE Loads

```bash
# Start dev server
pnpm dev

# Manual verification steps:
# 1. Open browser to http://localhost:5173
# 2. Navigate to IDE route: /ide/[projectId]
# 3. Check that IDE loads without errors
# 4. Check browser console (F12) - no FSA errors
# 5. Verify FileTree displays files
# 6. Verify MonacoEditor loads a file
```

#### 6.6 Verify File Operations

**Manual verification steps**:

1. **Create File**:
   - Right-click FileTree → New File
   - Enter filename: `test-rollback.txt`
   - Press Enter

2. **Write Content**:
   - File should open in Monaco Editor
   - Type: "Rollback test - $(date)"

3. **Save File**:
   - Press Ctrl+S (or Cmd+S on Mac)
   - Verify save indicator disappears
   - Check for "File saved" toast (if enabled)

4. **Reopen File**:
   - Close file tab
   - Click file in FileTree
   - Verify content persists

5. **Delete File**:
   - Right-click file → Delete
   - Confirm deletion
   - Verify file removed from FileTree

#### 6.7 Verify Mobile Access

```bash
# Test mobile browser or simulate with DevTools:
# 1. Open DevTools (F12)
# 2. Toggle device toolbar (Ctrl+Shift+M)
# 3. Select mobile device (e.g., iPhone 12)
# 4. Navigate to IDE route
# Expected: IDE loads (no redirect to Notes)
# Expected: No "IDE not available on mobile" toast
```

1. **Refresh the page** (F5)
2. **Navigate to IDE route** - `/ide/{projectId}`
3. **Check Storage Badge** - Should now show "IndexedDB" instead of "FSA"
4. **Test File Operations**:
   - Create a new file: `test-rollback.txt`
   - Write content: "Rollback test"
   - Save file (auto-save or Ctrl+S)
   - Read file content
   - Delete file

5. **Check File Tree** - Verify file tree loads and displays files
6. **Open Monaco Editor** - Verify Monaco editor loads a file
7. **Check Terminal** - Verify terminal file operations work (if terminal is open)

### Step 6.8 Verify Data Integrity

**Ensure no data was lost during rollback:**

1. **Compare File Counts**:
   - Before rollback: Note number of files in FSA folder
   - After rollback: Note number of files in IDE FileTree
   - **Acceptable**: Counts match or within expected variance (±5%)

2. **Check File Contents**:
   - Open a few random files in Monaco Editor
   - Verify content matches original FSA files
   - Check for any corruption or truncation

3. **Check IDE State**:
   - Monaco editor state preserved
   - File tree state preserved
   - Terminal history preserved (if applicable)

---

## Re-migration Steps

After rollback and issue resolution, to re-apply FSA migration:

### Step 1: Restore Archived FSA Files

```bash
# Restore from archive
ARCHIVE_DIR="_bmad-ext/.archive/ide-fsa-rollback-[TIMESTAMP]"

# Restore FSA gateway
if [ -f "$ARCHIVE_DIR/infrastructure/filesystem/ide-file-gateway.ts" ]; then
  cp "$ARCHIVE_DIR/infrastructure/filesystem/ide-file-gateway.ts" \
     src/infrastructure/filesystem/
  echo "Restored: ide-file-gateway.ts"
fi

if [ -f "$ARCHIVE_DIR/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts" ]; then
  cp "$ARCHIVE_DIR/infrastructure/filesystem/__tests__/ide-file-gateway.test.ts" \
     src/infrastructure/filesystem/__tests__/
  echo "Restored: ide-file-gateway.test.ts"
fi

# Restore FSA adapter
if [ -f "$ARCHIVE_DIR/infrastructure/webcontainer/fsa-adapter.ts" ]; then
  cp "$ARCHIVE_DIR/infrastructure/webcontainer/fsa-adapter.ts" \
     src/infrastructure/webcontainer/
  echo "Restored: fsa-adapter.ts"
fi

if [ -f "$ARCHIVE_DIR/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts" ]; then
  cp "$ARCHIVE_DIR/infrastructure/webcontainer/__tests__/fsa-adapter.test.ts" \
     src/infrastructure/webcontainer/__tests__/
  echo "Restored: fsa-adapter.test.ts"
fi

# Restore presentation components
if [ -f "$ARCHIVE_DIR/presentation/components/ide/StorageBadge.tsx" ]; then
  cp "$ARCHIVE_DIR/presentation/components/ide/StorageBadge.tsx" \
     src/presentation/components/ide/
  echo "Restored: StorageBadge.tsx"
fi
```

### Step 2: Restore Integration Points

**Option A: Using Git History (Recommended)**

```bash
# Restore FileTree.tsx to include FSA gateway integration
git checkout HEAD~1 src/presentation/components/ide/FileTree.tsx

# Restore MonacoEditor.tsx to include FSA gateway integration
git checkout HEAD~1 src/presentation/components/ide/MonacoEditor.tsx

# Restore Header.tsx to include StorageBadge
git checkout HEAD~1 src/presentation/components/ide/Header.tsx

# Restore platform guard in IDE route
git checkout HEAD~1 src/routes/ide.$projectId.tsx

echo "Integration points restored from git history"
```

**Option B: Manual Re-implementation**

If git history is not available:

1. **FileTree.tsx** - Add FSA gateway integration:
   ```typescript
   import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';

   const gateway = createIdeFileGateway({ projectId });
   const files = await gateway.list('');
   ```

2. **MonacoEditor.tsx** - Add FSA gateway integration:
   ```typescript
   import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';

   const gateway = createIdeFileGateway({ projectId });

   // Read file
   const data = await gateway.read(filePath);
   const content = new TextDecoder().decode(data);

   // Write file
   const data = new TextEncoder().encode(content);
   await gateway.write(filePath, data);
   ```

3. **Header.tsx** - Add StorageBadge component:
   ```typescript
   import { StorageBadge } from './StorageBadge';

   // Add to JSX
   <StorageBadge />
   ```

4. **ide.$projectId.tsx** - Add platform guard:
   ```typescript
   import { getPlatformContract } from '@/infrastructure/filesystem/platform-detection';

   beforeLoad: async ({ location }) => {
     const platform = getPlatformContract();
     if (!platform.canAccessIDE) {
       throw redirect({ to: '/notes' });
     }
   }
   ```

### Step 3: Verify Re-migration

```bash
# Verify TypeScript compilation
echo "Checking TypeScript..."
pnpm tsc --noEmit
# Expected: 0 errors

# Run tests
echo "Running tests..."
pnpm vitest run
# Expected: All tests pass (including FSA tests)

# Verify build
echo "Building..."
pnpm build
# Expected: Build succeeds

# Start dev server
echo "Starting dev server..."
pnpm dev

# Manual verification:
# 1. Open IDE route
# 2. Check StorageBadge shows "FSA"
# 3. Verify file operations work
# 4. Check console for FSA-related errors
```

### Step 4: Monitor for Issues

After re-migration, monitor the following:

1. **Performance Metrics**:
   - File read/write speed
   - IDE load time
   - Resource usage (CPU, memory)

2. **Error Monitoring**:
   - FSA permission errors
   - File access errors
   - Browser console for FSA-related warnings

3. **User Feedback**:
   - Collect user reports
   - Monitor GitHub issues
   - Check for feature requests or complaints

### Step 5: Document Re-migration

Create a re-migration log:

```markdown
# IDE FSA Re-migration Log

**Project ID**: [PROJECT_ID]
**Re-migration Date**: [YYYY-MM-DD HH:MM:SS]
**Operator**: [YOUR_NAME]

## Re-migration Steps
- [ ] Step 1: Restored archived FSA files
- [ ] Step 2: Restored integration points
- [ ] Step 3: Verified re-migration
- [ ] Step 4: Monitored for issues

## Results
- TypeScript Errors: [0 / X]
- Test Failures: [0 / X]
- Build Status: [SUCCESS / FAILED]
- Performance: [NORMAL / DEGRADED / CRITICAL]

## Issues Encountered
[List any issues during re-migration]

## Next Steps
[What to do after re-migration - e.g., continue monitoring, adjust settings, etc.]
```

2. **Check File Contents**:
   - Open a few random files in Monaco Editor
   - Verify content matches original FSA files
   - Check for any corruption or truncation

3. **Check IDE State**:
   - Monaco editor state preserved
   - File tree state preserved
   - Terminal history preserved (if applicable)

---

## ✅ Rollback Success Criteria

Rollback is successful if all criteria are met:

- [ ] Project `storageType` updated to `'indexeddb'`
- [ ] FSA handle metadata cleared (`storageMetadata: null`)
- [ ] IDE route loads without errors
- [ ] FileTree displays files correctly
- [ ] Monaco editor opens and displays file content
- [ ] File operations (read/write/delete) work correctly
- [ ] StorageBadge shows "IndexedDB"
- [ ] No data loss detected (file counts match expected)
- [ ] Rollback time < 15 minutes (for typical projects)
- [ ] Backup files preserved in safe location

---

## ❌ Known Limitations

### What Rollback Does NOT Do

- ❌ **Does NOT delete** FSA files (they remain on disk for manual review)
- ❌ **Does NOT preserve** external file edits made during FSA mode (only imports current state)
- ❌ **Does NOT restore** file watching/sync history from FSA mode
- ❌ **Does NOT recover** data lost due to FSA corruption (only imports what's available)

### What Rollback Cannot Handle

- ❌ **FSA File Corruption**: If FSA files are corrupted, rollback cannot restore them
- ❌ **File System Errors**: Disk failures or OS-level issues require external recovery
- ❌ **Large Projects**: Projects with 1000+ files may exceed 15-minute target
- ❌ **Browser Storage Limits**: IndexedDB quota issues prevent full file import

### When Rollback May Fail

Rollback may fail or require additional steps if:

1. **IndexedDB Quota Exceeded**: Browser cannot store all files from FSA
   - **Solution**: Clear browser data, use different browser, or reduce file count

2. **FSA Directory Inaccessible**: Permission denied or directory moved
   - **Solution**: Re-request directory access via `showDirectoryPicker()` API

3. **Project Metadata Corrupted**: Cannot update project in IndexedDB
   - **Solution**: Manually delete project and recreate (requires backup)

4. **Browser Compatibility**: Browser doesn't support required APIs
   - **Solution**: Use Chrome 122+ or Edge 122+

---

## 🔧 Troubleshooting

### Issue: Rollback Script Fails

**Symptoms**:
- JavaScript errors in DevTools console
- Script execution stops unexpectedly
- "Store not found" errors

**Solutions**:
1. **Check Store Access**: Ensure project store is accessible:
   ```javascript
   // Check if store exists on window
   console.log('Available stores:', Object.keys(window));

   // Try alternative import paths
   const { useProjectStore } = await import('/src/infrastructure/persistence/stores/project/project-store');
   ```

2. **Verify Project ID**: Ensure you're using correct project ID:
   ```javascript
   // List all projects to find correct ID
   const { getAllProjects } = useProjectStore.getState();
   console.log('Available projects:', getAllProjects());
   ```

3. **Clear Browser Cache**: Sometimes cached modules cause issues:
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

### Issue: IDE Shows Empty File Tree After Rollback

**Symptoms**:
- FileTree shows no files
- "No files found" message
- Files exist in FSA folder but not in IDE

**Solutions**:
1. **Import FSA Files**: Run Step 3 (Import FSA Files to IndexedDB)
2. **Verify Project ID**: Ensure you're using correct project ID
3. **Check IndexedDB**: Verify files were imported:
   ```javascript
   // Check idbFiles table in IndexedDB
   const request = indexedDB.open('ViaGentDatabase', 1);
   request.onsuccess = (event) => {
     const db = (event.target as IDBOpenDBRequest).result;
     const transaction = db.transaction(['idbFiles'], 'readonly');
     const store = transaction.objectStore('idbFiles');
     const index = store.index('projectId');
     const count = await index.count('your-project-id');
     console.log(`Files in IndexedDB: ${count}`);
   };
   ```

### Issue: Storage Badge Still Shows "FSA" After Rollback

**Symptoms**:
- StorageBadge component displays "FSA" instead of "IndexedDB"
- IDE still uses FSAGateway
- Refresh page doesn't update display

**Solutions**:
1. **Verify Metadata Update**: Check project metadata was updated:
   ```javascript
   const project = useProjectStore.getState().getProject('your-project-id');
   console.log('Project storage type:', project.storageType);
   console.log('Storage metadata:', project.storageMetadata);
   ```

2. **Force Update**: Manually update project again:
   ```javascript
   const { updateProject } = useProjectStore.getState();
   updateProject('your-project-id', {
     storageType: 'indexeddb',
     storageMetadata: null
   });
   ```

3. **Hard Refresh**: Clear browser cache and reload:
   - Chrome: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   - Edge: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)

### Issue: Rollback Takes Longer Than 15 Minutes

**Symptoms**:
- File import process takes >15 minutes
- Browser freezes or becomes unresponsive
- Import progress bar stops moving

**Solutions**:
1. **Check File Count**: Large projects (>1000 files) may exceed target
   - Accept extended time for large projects
   - Consider splitting project into smaller projects

2. **Browser Performance**: Close other tabs and applications:
   - Free up system resources
   - Reduce background processes

3. **Skip Import**: Don't import files to IndexedDB:
   - Keep FSA files on disk
   - Switch back to FSA in future

---

## 📞 Support Escalation

If rollback fails and troubleshooting doesn't resolve the issue:

### Information to Collect

1. **Project Details**:
   - Project ID
   - Number of files in FSA folder
   - Total size of FSA folder

2. **Error Messages**:
   - Console errors (DevTools Console tab)
   - IndexedDB errors (DevTools Application tab)
   - Browser error notifications

3. **Environment Details**:
   - Browser name and version
   - Operating system and version
   - Available disk space

4. **Rollback Steps Attempted**:
   - Which options were tried (DevTools, manual, code change)
   - Steps completed successfully
   - Step where rollback failed

### Escalation Path

1. **Check GitHub Issues**: Search for similar issues
   - URL: https://github.com/[your-repo]/issues
   - Keywords: "IDE rollback", "FSA rollback", "storage migration"

2. **Create Bug Report**: If issue not found, create new issue with:
   - Title: "IDE FSA Rollback Failed - [Brief Description]"
   - Description: Include all collected information above
   - Attachments: Screenshots, console logs, backup files (if relevant)

3. **Community Support**: Check for community discussions:
   - URL: https://github.com/[your-repo]/discussions
   - Search for "IDE rollback" or "FSA migration"

---

## 📊 Rollback Log Template

Use this template to document rollback operations for audit trail:

```markdown
# IDE FSA Rollback Log

**Project ID**: [PROJECT_ID]
**Project Name**: [PROJECT_NAME]
**Rollback Date**: [YYYY-MM-DD HH:MM:SS]
**Operator**: [YOUR_NAME]

## Pre-Rollback State
- Storage Type: FSA
- FSA Directory: [PATH_TO_FSA_DIRECTORY]
- File Count: [NUMBER_OF_FILES]
- Total Size: [TOTAL_SIZE_MB]

## Rollback Steps
- [ ] Step 1: Updated project storage type to IndexedDB
- [ ] Step 2: Cleared FSA handle metadata
- [ ] Step 3: Imported FSA files to IndexedDB (optional)
- [ ] Step 4: Verified IDE works after rollback
- [ ] Step 5: Verified data integrity

## Rollback Results
- Rollback Start Time: [HH:MM:SS]
- Rollback End Time: [HH:MM:SS]
- Total Time: [MINUTES] minutes
- Files Imported: [NUMBER]
- Files Failed: [NUMBER]

## Post-Rollback Verification
- [ ] IDE route loads without errors
- [ ] FileTree displays files correctly
- [ ] Monaco editor opens and displays files
- [ ] File operations work correctly
- [ ] StorageBadge shows "IndexedDB"
- [ ] File counts match expected (±5%)
- [ ] No data loss detected

## Issues Encountered
[List any issues or errors encountered during rollback]

## Next Steps
[What to do after rollback - e.g., re-enable FSA, report bug, etc.]
```

---

## ✅ Rollback Complete

After successful rollback, you should experience:

- ✅ IDE using IndexedDB storage
- ✅ File operations working correctly
- ✅ Monaco editor functioning normally
- ✅ FileTree displaying files properly
- ✅ No data loss detected
- ✅ Rollback time < 15 minutes

### Next Steps

1. **Test IDE Thoroughly**: Use IDE for normal workflow
2. **Monitor Performance**: Compare with FSA performance
3. **Decision**: Decide whether to:
   - Keep IndexedDB storage
   - Re-enable FSA storage (restore from backup)
   - Report issues for further investigation

---

**Guide Version**: 1.0
**Last Updated**: 2026-01-18
**Next Review**: 2026-01-19

---

## Related Documents

- **FSA Migration Guide**: `_bmad-output/planning-artifacts/migration/fsa-migration-guide.md`
- **Desktop FSA Migration**: `_bmad-output/planning-artifacts/migration/desktop-fsa-migration-guide.md` (if exists)
- **ADR-033**: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- **Clean Context**: `_bmad-ext/.correct-course/CLEAN-CONTEXT-2026-01-18.md`

---

**Story Reference**: CC-IDE-08 - IDE Rollback Procedure
**Epic**: CC-IDE-FSA
**Team**: TEAM_B
