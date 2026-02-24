# Rollback Procedure: FSA Migration

**Version**: 1.0.0
**Created**: 2026-01-18
**Epic**: CC-DESKTOP-FSA
**Story**: CC-DF-06
**Target Rollback Time**: < 15 minutes
**Status**: READY FOR USE

---

## 📋 Overview

This document describes the comprehensive rollback procedure for reverting Desktop FSA Migration back to IndexedDB-only storage mode in case of critical issues that prevent normal operation.

### When to Rollback

Rollback to IndexedDB storage if:

- ⚠️ **Data Corruption**: FSA files become damaged, unreadable, or inaccessible
- ⚠️ **Performance Issues**: FSA storage causes severe degradation or freezing
- ⚠️ **Permission Problems**: OS restrictions prevent file access, even after regranting permissions
- ⚠️ **File System Errors**: I/O errors, disk failures, or file system corruption
- ⚠️ **User Data Loss Risk**: Data integrity issues that cannot be resolved

### What Rollback Does

The rollback process:
1. **Backs up** current FSA state (for safety and audit trail)
2. **Reverts** project storage type from 'fsa' to 'indexeddb'
3. **Imports** all FSA markdown files back into DexieDB
4. **Clears** FSA file handles and metadata
5. **Validates** data integrity and functionality

### What Rollback Does NOT Do

- ❌ **Does NOT delete** FSA files (they remain for manual review)
- ❌ **Does NOT preserve** external file edits made during FSA mode
- ❌ **Does NOT restore** file watching/sync history from FSA mode
- ❌ **Does NOT recover** data lost due to corruption (only imports what's available)

---

## 🔍 Pre-Rollback Checklist

Complete this checklist **BEFORE** initiating rollback:

### Safety Verification

- [ ] **All user data backed up**
  - Run: `pnpm run export-all-notes` (if available)
  - Or manually copy FSA notes folder to safe location
  - Verify backup count matches current note count

- [ ] **Current issues documented**
  - Screenshot error messages
  - Record console errors (F12 → Console)
  - Note the exact steps that triggered the issue

- [ ] **Rollback procedure reviewed**
  - Read this entire document
  - Understand each step and expected outcomes
  - Confirm you have the required tools/admin access

- [ ] **Sufficient time available**
  - Allocate 15-20 minutes for complete rollback
  - Avoid interruptions during rollback process

### Technical Requirements

- [ ] **Browser**: Chrome 122+ or Edge 122+ (for IndexedDB operations)
- [ ] **Permissions**: Admin access (if OS-level file permission issues)
- [ ] **Disk Space**: At least 2x current notes size available
- [ ] **Network**: Stable connection (for downloading backup if needed)

### Backup Verification

- [ ] **Backup files exist and are readable**
  - FSA notes folder: `/project/notes/`
  - Backup export file (if created)
  - Check file counts match

- [ ] **Backup timestamp recorded**
  - Document the time of backup creation
  - Useful for audit trail and recovery

---

## 🚀 Rollback Steps

### Step 1: Backup Current State (5 minutes)

**Purpose**: Create safety snapshot before rollback. Even though we're reverting, we need to preserve current state for debugging and potential recovery.

#### 1.1 Export Current DexieDB Cache

```bash
# Run backup utility (if available)
pnpm run export-dexie-backup

# Expected output:
# ✓ Backup created at: /backup/dexie-backup-2026-01-18T143000.json
# ✓ Notes exported: 123
# ✓ Duration: 450ms
```

**Alternative**: If export script not available, use browser DevTools:
1. Open DevTools (F12)
2. Go to Application → IndexedDB → ViaGentDatabase
3. Right-click each store → Export to JSON
4. Save to safe location

#### 1.2 Backup FSA Notes Directory

```bash
# For each project with FSA storage
cd /path/to/project/
cp -r notes/ ../backup/project-notes-$(date +%Y%m%d-%H%M%S)/

# Or use rsync for better handling of permissions
rsync -av notes/ ../backup/project-notes-$(date +%Y%m%d-%H%M%S)/
```

**Verify backup**:
```bash
# Check file counts match
ls notes/*.md | wc -l  # Should match note count
ls ../backup/project-notes-*/notes/*.md | wc -l  # Should match
```

#### 1.3 Document Current Migration Status

Create a migration status file for audit trail:

```markdown
# Migration Status Before Rollback

**Date**: 2026-01-18
**Time**: 14:30:00
**Project ID**: proj-1737183600000-abc123

## Storage Configuration

- **Current Storage Type**: fsa
- **Storage Location**: /Users/username/Documents/ViaGent Notes/
- **File System**: FSA (File System Access API)

## Statistics

- **Total Notes**: 123
- **Total Assets**: 15
- **FSA Files**: 123
- **IndexedDB Cache**: 123 (mirrored)

## Issues Encountered

1. **Issue**: FSA files become inaccessible after browser update
   - **Error**: "NotFoundError: The file handle has been lost"
   - **Frequency**: Every time browser is restarted
   - **Workaround Attempted**: Re-grant permissions (failed)

2. **Issue**: Performance degradation
   - **Symptom**: Note loading takes >5 seconds
   - **Expected**: <1 second
   - **Note Count**: 123

## Backup Location

- **DexieDB Export**: `/backup/dexie-backup-2026-01-18.json`
- **FSA Notes Backup**: `/backup/project-notes-20260118-143000/`

## Rollback Reason

Critical: File handles lost on browser restart, making FSA storage unusable.
```

**Success Criteria for Step 1**:
- [ ] DexieDB export created and readable
- [ ] FSA notes folder copied to backup location
- [ ] File counts verified (backup = current)
- [ ] Migration status documented

---

### Step 2: Revert to DexieDB-Only Mode (3 minutes)

**Purpose**: Update project configuration to use IndexedDB storage instead of FSA.

#### 2.1 Update Project Storage Type

**Method A: Via ViaGent UI (Recommended)**

1. Open ViaGent application
2. Navigate to Project Settings
3. Find "Storage Type" or "File System" section
4. Change from "File System Storage" to "IndexedDB Storage"
5. Click "Switch" or "Save"
6. Confirm dialog: "Are you sure you want to switch to IndexedDB?"
7. Wait for switch to complete

**Method B: Direct DexieDB Update (Advanced)**

```typescript
// Use browser DevTools Console (F12 → Console)
// Connect to IndexedDB
const request = indexedDB.open('ViaGentDatabase', 1);

request.onsuccess = async (event) => {
  const db = event.target.result;
  const tx = db.transaction('projects', 'readwrite');
  const store = tx.objectStore('projects');

  // Get all projects
  const projects = await store.getAll();

  // Update storage type for FSA projects
  for (const project of projects) {
    if (project.storageType === 'fsa') {
      console.log(`Reverting project ${project.id}...`);

      await store.put({
        ...project,
        storageType: 'indexeddb', // Switch back to IndexedDB
        storageMetadata: null, // Clear FSA metadata
        fsaHandle: null, // Clear file handle
      });
    }
  }

  console.log('✓ All projects reverted to IndexedDB');
};

request.onerror = (event) => {
  console.error('Failed to open database:', event.target.error);
};
```

**Method C: Rollback Script (Preferred - if implemented)**

```bash
# Run rollback utility
pnpm run rollback-fsa-migration

# Expected output:
# ✓ Reverting projects to IndexedDB...
#   - Project 1: fsa → indexeddb
#   - Project 2: fsa → indexeddb
# ✓ Cleared FSA metadata
# ✓ 2 projects reverted
```

#### 2.2 Clear FSA File References

After switching storage type, clear any cached FSA handles:

```typescript
// ViaGent will automatically clear handles on storage type change
// But to be thorough, you can manually clear:

// Method 1: Via UI
1. Go to Project Settings
2. Click "Clear File Handles"
3. Confirm "Clear all file handles?"

// Method 2: Via DevTools Console
if (window.__VIAGENT_STATE__?.fsaHandles) {
  window.__VIAGENT_STATE__.fsaHandles.clear();
  console.log('✓ FSA handles cleared');
}
```

#### 2.3 Restart Application

1. **Close** ViaGent (close browser tab or window)
2. **Wait** 2-3 seconds for cleanup
3. **Open** ViaGent again
4. **Navigate** to the project you just reverted

**Expected Behavior**:
- Storage indicator shows "BrowserDB" or "IndexedDB" (not FSA)
- Notes list loads from IndexedDB (may be empty initially)
- No FSA-related error messages in console

**Success Criteria for Step 2**:
- [ ] All FSA projects reverted to 'indexeddb' storage type
- [ ] FSA metadata cleared (storageMetadata: null)
- [ ] Application restarted successfully
- [ ] Storage indicator shows IndexedDB mode
- [ ] No FSA errors in console

---

### Step 3: Import FSA Notes to DexieDB (5 minutes)

**Purpose**: Convert all FSA markdown files back to DexieDB records.

#### 3.1 Run Import Script

**Method A: Via ViaGent UI (Recommended - if available)**

1. Open Project Settings
2. Find "Import from Files" or "Migration" section
3. Click "Import Notes from FSA Files"
4. Select the FSA notes folder (e.g., `/Users/username/Documents/ViaGent Notes/notes/`)
5. Wait for import to complete
6. Review import report

**Method B: Rollback Utility Script (Preferred - if implemented)**

```bash
# Run import utility
pnpm run import-fsa-notes-to-dexie

# Expected output:
# ✓ Reading FSA notes from: /path/to/project/notes/
# ✓ Found 123 markdown files
# ✓ Importing notes to DexieDB...
#   Progress: [████████░░] 100/123 (81%)
# ✓ Import complete!
#   - Imported: 123
#   - Failed: 0
#   - Duration: 3450ms
```

**Method C: Manual Import (Fallback - if automation not available)**

```typescript
// Run this script in browser DevTools Console
// Requires DexieDB access and note-formatter functions

async function importFSAFilesToDexie() {
  console.log('📥 Starting FSA import...');

  // 1. Open DexieDB
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('ViaGentDatabase', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // 2. Read all FSA markdown files
  // NOTE: This requires FSA access, which may be problematic
  // If FSA handles are lost, you'll need to use File System Picker

  // Instead, use File System Picker to manually select folder
  const dirHandle = await window.showDirectoryPicker({
    mode: 'read',
  });

  let imported = 0;
  let failed = 0;

  // 3. Iterate through markdown files
  for await (const [name, handle] of dirHandle.entries()) {
    if (!name.endsWith('.md')) continue;

    try {
      const file = await handle.getFile();
      const content = await file.text();

      // Parse markdown using note-formatter
      const noteId = name.replace('.md', '');
      const parsed = parseNoteFromStorage(content, noteId);

      // Convert to NoteRecord
      const noteRecord = parsedToNoteRecord(parsed);

      // Insert into DexieDB
      const tx = db.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      await store.put(noteRecord);

      imported++;
      console.log(`✓ Imported: ${name}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed to import ${name}:`, error);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   - Imported: ${imported}`);
  console.log(`   - Failed: ${failed}`);

  // 4. Close database
  db.close();
}

// Execute import
importFSAFilesToDexie().catch(console.error);
```

#### 3.2 Import Report

After import completes, review the import report:

```markdown
# FSA Notes Import Report

**Date**: 2026-01-18T14:35:00.000Z
**Source**: /Users/username/Documents/ViaGent Notes/notes/
**Destination**: DexieDB (ViaGentDatabase.notes table)

## Summary

- **Total Files Found**: 125
- **Successfully Imported**: 123
- **Failed**: 2
- **Duration**: 3.45 seconds

## Imported Notes

| Note ID | Title | Created | Status |
|----------|--------|----------|--------|
| note-abc123 | Project Meeting Notes | 2026-01-15 | ✅ Success |
| note-def456 | Research Findings | 2026-01-16 | ✅ Success |
| ... | ... | ... | ... |

## Failed Imports

| Filename | Error |
|----------|--------|
| corrupted-note.md | "Invalid YAML frontmatter: missing 'title' field" |
| empty-note.md | "Note has no content after frontmatter" |

## Recommendations

1. Review failed imports and fix if possible
2. Verify note count matches FSA file count
3. Test note operations (create, edit, delete)
```

**Success Criteria for Step 3**:
- [ ] All FSA markdown files imported to DexieDB
- [ ] Import count matches FSA file count (or acceptable if some failed)
- [ ] Import report generated with no critical errors
- [ ] All imported notes have valid frontmatter and content
- [ ] No duplicate note IDs in DexieDB

---

### Step 4: Validation (2 minutes)

**Purpose**: Verify that rollback is successful and system is fully functional.

#### 4.1 Test Note CRUD Operations

**Test 1: Create New Note**
1. Navigate to Notes workspace
2. Click "New Note" or "+" button
3. Add some content
4. Save note
5. **Expected**: Note appears in list and persists after refresh
6. **Verify**: Note is in DexieDB (DevTools → Application → IndexedDB)

**Test 2: Edit Existing Note**
1. Open any note from the list
2. Modify content or title
3. Save note
4. **Expected**: Changes persist after refresh
5. **Verify**: Updated record in DexieDB

**Test 3: Delete Note**
1. Select a test note
2. Click "Delete" or move to trash
3. **Expected**: Note removed from list
4. **Verify**: Record removed from DexieDB

#### 4.2 Verify Agent Tools Work

If using AI agents that interact with notes:

**Test 1: List Notes**
```
# Via Agent Command
/list-notes

# Expected Output
✓ Found 123 notes in project
- note-abc123: Project Meeting Notes
- note-def456: Research Findings
...
```

**Test 2: Read Note**
```
# Via Agent Command
/read-note --id note-abc123

# Expected Output
✓ Note loaded: "Project Meeting Notes"
Content: [Full markdown content]
```

**Test 3: Write Note**
```
# Via Agent Command
/write-note --title "Test Note" --content "This is a test"

# Expected Output
✓ Note created: note-xyz789
✓ Note saved to DexieDB
```

#### 4.3 Test UI Functionality

**Checklist**:
- [ ] Notes workspace loads without errors
- [ ] Note list displays all imported notes
- [ ] Note editor opens and works correctly
- [ ] Storage indicator shows "BrowserDB" or "IndexedDB"
- [ ] No FSA-related error messages in console (F12)
- [ ] Application is responsive (no freezing or lagging)

#### 4.4 Verify Data Integrity

**Verify Note Counts**:
```typescript
// Run in DevTools Console
const request = indexedDB.open('ViaGentDatabase', 1);
request.onsuccess = async (event) => {
  const db = event.target.result;
  const tx = db.transaction('notes', 'readonly');
  const store = tx.objectStore('notes');
  const count = await store.count();

  console.log(`Total notes in DexieDB: ${count}`);
  // Should match FSA file count (or be close if some imports failed)
};
```

**Verify Frontmatter Integrity**:
```typescript
// Check that notes have valid frontmatter
const request = indexedDB.open('ViaGentDatabase', 1);
request.onsuccess = async (event) => {
  const db = event.target.result;
  const tx = db.transaction('notes', 'readonly');
  const store = tx.objectStore('notes');
  const notes = await store.getAll();

  const invalidNotes = notes.filter(note =>
    !note.title ||
    !note.createdAt ||
    !note.modifiedAt ||
    !note.blocks ||
    note.blocks.length === 0
  );

  console.log(`Invalid notes: ${invalidNotes.length}`);
  if (invalidNotes.length > 0) {
    console.error('Invalid notes:', invalidNotes);
  }
};
```

**Success Criteria for Step 4**:
- [ ] All CRUD operations work correctly
- [ ] Agent tools functional (if applicable)
- [ ] UI displays correctly with no errors
- [ ] Note count matches or is acceptable
- [ ] All notes have valid frontmatter and content
- [ ] Performance is acceptable (no severe lag)

---

## 📊 Rollback Time Estimate

| Step | Estimated Time | Actual Time | Notes |
|-------|----------------|--------------|-------|
| **Step 1: Backup Current State** | 5 min | ____ min | Including documentation |
| **Step 2: Revert to DexieDB Mode** | 3 min | ____ min | UI or script-based |
| **Step 3: Import FSA Notes** | 5 min | ____ min | Depends on note count |
| **Step 4: Validation** | 2 min | ____ min | Basic functionality tests |
| **TOTAL** | **15 min** | **____ min** | Should be < 20 min |

**Performance Benchmarks**:
- Small projects (≤50 notes): 5-10 minutes
- Medium projects (50-200 notes): 10-15 minutes
- Large projects (200-500 notes): 15-20 minutes
- Very large projects (500+ notes): 20-30 minutes (may exceed target)

---

## ⚠️ Known Limitations

### 1. External File Edits Lost

**Issue**: Any changes made to FSA files using external editors (VS Code, Sublime, etc.) during FSA mode will be lost during rollback.

**Why**: Rollback only imports what's in FSA files at rollback time. If you edited notes externally, but those changes aren't reflected in DexieDB, they'll be lost when reverting to DexieDB-only mode.

**Mitigation**:
- Always make external edits through ViaGent when possible
- Before rollback, check FSA files for recent external edits
- Manually reapply important external edits after rollback

### 2. Sync History Cleared

**Issue**: File watching, change detection, and sync history from FSA mode will be reset.

**Why**: IndexedDB doesn't track file-level changes like FSA does. Sync mechanisms that depend on FSA file watching will be reset.

**Mitigation**:
- Sync is not critical for single-user workflows
- If using multi-user sync, re-establish sync connections after rollback
- Sync will rebuild over time based on note changes

### 3. Agent Tool Context Loss

**Issue**: AI agents that learned FSA-based workflows may lose context or need retraining.

**Why**: Agent tools may be hardcoded to expect FSA file paths or FSA-specific APIs.

**Mitigation**:
- Update agent tool configurations after rollback
- Use DexieDB-based APIs for agent operations
- Test all agent tools after rollback

### 4. Potential Data Loss on Corruption

**Issue**: If FSA files are corrupted before rollback, rollback cannot recover that data.

**Why**: Rollback imports from FSA files. If files are damaged or unreadable, data is lost.

**Mitigation**:
- Always keep pre-migration backups
- Verify FSA file integrity regularly
- Use version control (Git) for FSA notes folder if critical

### 5. No "Partial Rollback"

**Issue**: Cannot rollback specific notes or projects. Rollback is all-or-nothing for a project.

**Why**: Storage type is per-project. You can't mix FSA and IndexedDB for the same project.

**Mitigation**:
- Export specific notes before rollback if you want to preserve them separately
- Create a new project for FSA notes if you want to keep both modes

---

## 🆘 Support & Escalation

### If Rollback Fails

#### 1. Check Backup Files

```bash
# Verify backup exists and is readable
ls -la /backup/dexie-backup-*.json
ls -la /backup/project-notes-*/

# Check file counts
cat /backup/dexie-backup-*.json | jq '.notes | length'
ls /backup/project-notes-*/notes/*.md | wc -l
```

#### 2. Review Import Report

If import script generates a report, review errors:

```bash
# View import report
cat /tmp/fsa-import-report.md

# Check for common issues:
# - Invalid YAML frontmatter
# - Missing required fields (title, created, modified)
# - Corrupt markdown content
# - File access errors
```

#### 3. Restore from Time-Machine Backup

If backup files are corrupted or missing:

```bash
# macOS Time Machine
tmutil restore /Volumes/Backup/Backups.backupdb/.../project/notes/

# Or use Time Machine UI:
# 1. Open Time Machine
# 2. Navigate to backup date before rollback
# 3. Select FSA notes folder
# 4. Click "Restore"
```

#### 4. Manual Reconstruction

If automated rollback completely fails:

1. **Export FSA files manually** (copy to safe location)
2. **Create new ViaGent project** with IndexedDB storage
3. **Import notes manually** via ViaGent UI (if available)
4. **Verify each note** for completeness
5. **Document the process** for future reference

### Escalation Path

**Level 1: Self-Service**
- Review this document thoroughly
- Check GitHub Issues for similar problems
- Search ViaGent documentation

**Level 2: Community Support**
- Create GitHub issue with full error logs
- Include:
  - Rollback step that failed
  - Console errors (F12)
  - Backup status (available/corrupted)
  - Browser and OS version
  - Note count and project size

**Level 3: TEAM_B Escalation**
- Contact TEAM_B directly with detailed report
- Include all Level 2 information plus:
  - Screenshots of error messages
  - Import/export report files
  - Timeline of events leading to rollback

**Issue Template for Escalation**:

```markdown
# FSA Rollback Failure Report

**Date**: 2026-01-18
**User**: [Your Name]
**Project ID**: [Project ID]
**Storage Type**: fsa → indexeddb (rollback attempt)

## Rollback Attempt Details

- **Step Failed**: [1/2/3/4] - [Step name]
- **Error Message**: [Full error message]
- **Console Log**: [Copy-paste from F12]

## Environment

- **Browser**: [Chrome/Edge + version]
- **OS**: [Windows/macOS/Linux + version]
- **ViaGent Version**: [Version number]
- **Note Count**: [Number of notes]

## Backup Status

- [x] DexieDB export: [Available/Corrupted/Missing]
- [x] FSA notes backup: [Available/Corrupted/Missing]
- [x] Backup file counts verified: [Yes/No]

## Import Report

[Attach import report or paste errors here]

## Attempted Workarounds

1. [Description of workaround 1] - [Result: Success/Failure]
2. [Description of workaround 2] - [Result: Success/Failure]
3. ...

## Screenshots

[Attach screenshots of error messages and UI]
```

---

## 📚 Related Documents

### Migration Documentation

- **Migration Guide**: `_bmad-output/planning-artifacts/migration/fsa-migration-guide.md`
  - Pre-migration checklist
  - Step-by-step migration process
  - FAQ and troubleshooting

- **Epic Document**: `_bmad-ext/.correct-course/epics/CC-DESKTOP-FSA-2026-01-18.md`
  - Epic overview and requirements
  - Story breakdown and dependencies
  - Acceptance criteria

### Architecture Documentation

- **ADR-033**: Storage Architecture Decisions
  - Platform storage decisions (FSA vs IndexedDB)
  - Platform contract and storage gateway interfaces
  - File system structure and metadata

- **Migration Backup System**: `src/infrastructure/persistence/stores/providers/migration-backup.ts`
  - 3-layer backup strategy (IndexedDB, localStorage, downloadable)
  - Backup creation and restoration logic
  - Checksum verification for integrity

### Utility Scripts

- **Note Exporter**: `src/lib/notes/export/note-exporter.ts`
  - Exports Dexie notes to FSA markdown format
  - Export options and progress tracking
  - Export validation and reporting

- **Note Formatter**: `src/lib/notes/format/note-formatter.ts`
  - Converts between Dexie NoteRecord and FSA markdown
  - YAML frontmatter parsing and generation
  - ISO 8601 timestamp handling

### Testing Documentation

- **Migration Verification Tests**: `_bmad-output/planning-artifacts/migration/migration-verification-tests.md` (from CC-DF-05)
  - Test coverage for migration
  - Verification criteria and test data
  - Known issues and edge cases

---

## 🔄 Future Improvements

### Planned Enhancements

1. **Automated Rollback Script**
   - Implement `pnpm run rollback-fsa-migration`
   - Single-command rollback with progress tracking
   - Automatic backup creation before rollback

2. **Import Utility**
   - Implement `pnpm run import-fsa-notes-to-dexie`
   - Batch import with error handling
   - Detailed import report generation

3. **Rollback Health Check**
   - Pre-rollback validation script
   - Checks backup integrity and FSA file accessibility
   - Warns user if rollback is risky

4. **Partial Rollback Support**
   - Allow rolling back specific notes or folders
   - Preserves FSA mode for some notes
   - Useful for testing and gradual migration

5. **Rollback Simulation**
   - Dry-run mode that tests rollback without executing
   - Shows what would happen and potential issues
   - Helps user prepare for actual rollback

### Known Issues

- **Issue**: Rollback script not yet implemented
  - **Status**: Documentation only (no automation)
  - **Workaround**: Manual rollback using UI and DevTools
  - **Priority**: P2 (low - rollback is rare)

- **Issue**: Import utility not yet implemented
  - **Status**: Manual import only
  - **Workaround**: Use ViaGent UI import if available
  - **Priority**: P2 (low - import is one-time operation)

- **Issue**: Rollback time may exceed 15 minutes for large projects
  - **Status**: Documented limitation
  - **Workaround**: Patience, or break into smaller projects
  - **Priority**: P3 (lowest - acceptable for large datasets)

---

## ✅ Rollback Success Checklist

After completing all rollback steps, verify:

- [ ] All notes accessible via DexieDB
- [ ] Note count matches or is acceptable (matches FSA files or acceptable loss)
- [ ] All note operations work (create, read, update, delete)
- [ ] No FSA-related errors in console
- [ ] UI displays correctly and is responsive
- [ ] Agent tools functional (if applicable)
- [ ] Performance acceptable (no severe lag or freezing)
- [ ] Backup files preserved in safe location
- [ ] Rollback documented (timestamp, issues, outcomes)

**If all checked**: Rollback successful! System is now in DexieDB-only mode.

**If any unchecked**: Review corresponding section and resolve before considering rollback complete.

---

## 📝 Rollback Log

Document your rollback experience here for future reference:

```markdown
## Rollback Log Entry

**Date**: [YYYY-MM-DD]
**Time**: [HH:MM:SS]
**Project ID**: [Project ID]
**Triggered By**: [Self / Team / Automated]
**Reason**: [Description of issue that triggered rollback]

### Execution Summary

- **Total Time**: [XX minutes]
- **Steps Completed**: [1/2/3/4 - all/some]
- **Issues Encountered**: [None / List issues]

### Results

- **Notes Imported**: [Number]
- **Notes Failed**: [Number]
- **Data Loss**: [None / Some / Critical]
- **System Status**: [Stable / Unstable]

### Follow-Up Actions

- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]

### Lessons Learned

[What went well, what didn't, what to improve]
```

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-18
**Reviewed By**: TEAM_B
**Status**: READY FOR USE
**Next Review**: 2026-02-18 (or after first rollback attempt)
