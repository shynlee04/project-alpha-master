# FSA Migration Guide

**Version**: 1.0
**Created**: 2026-01-18
**For**: ViaGent Desktop Users
**Epic**: CC-STORAGE-GATEWAY
**Story**: CC-SG-03

---

## 📝 Overview

The File System Access API (FSA) migration enables ViaGent desktop users to store notes as actual files instead of IndexedDB database entries. This migration is optional and provides significant benefits for users who need file system access.

### Why Migrate to FSA?

**Benefits**:
- ✅ **Unlimited Storage Quota** - No more 60% of disk limit
- ✅ **File System Integration** - Notes accessible via terminal and file managers
- ✅ **Better Performance** - Direct file I/O is faster than IndexedDB operations
- ✅ **No Browser Eviction** - Files won't be deleted during browser storage pressure
- ✅ **Agentic Coding Support** - AI agents can read/write notes via terminal
- ✅ **External Editor Support** - Use your favorite editor (VS Code, Sublime, etc.)
- ✅ **Backup & Sync** - Standard file backup tools work out of the box

### What This Guide Covers

This guide provides:
- Pre-migration checklist
- Step-by-step migration process
- Rollback procedure (if needed)
- FAQ and troubleshooting

---

## 🔍 Pre-Migration Checklist

### Browser Requirements

- [ ] **Browser Version**: Chrome 122+ or Edge 122+ (for permission persistence)
- [ ] **Platform**: Desktop (Windows, macOS, or Linux)
- [ ] **Storage Quota**: Verify available disk space (recommended: 500MB+ free)

### Project Requirements

- [ ] **Current Project**: One active project (migration happens per project)
- [ ] **Note Count**: Count existing notes to verify migration completeness
- [ ] **Assets**: Note any embedded assets (images, attachments)

### Backup Requirements

- [ ] **Data Export**: Export all notes before migration
- [ ] **Backup Location**: Save export to safe location (desktop, external drive, or cloud)

### Preparation Steps

1. **Open ViaGent** - Launch application
2. **Select Project** - Open the project you want to migrate
3. **Count Notes** - Note total number of notes
4. **Export Data** - Use "Export All Notes" feature (if available) or export manually
5. **Verify Export** - Check that all notes are in the export file
6. **Save Backup** - Store export file in safe location
7. **Close ViaGent** - Quit application (optional, but recommended)

---

## 🚀 Migration Steps

### Step 1: Launch ViaGent with FSA Support

1. Open ViaGent application in Chrome 122+ or Edge 122+
2. Navigate to project you want to migrate
3. Wait for application to fully load

### Step 2: Request FSA Directory Access

1. Click **"Switch to File System Storage"** button in project settings
2. Browser will show directory picker dialog
3. Navigate to (or create) a folder where you want to store notes
4. **Select folder**: Choose the folder where notes will be stored
   - Recommended: `/Documents/ViaGent Notes/` (or create new folder)
   - Note: ViaGent creates `.viagent/` subfolder for metadata automatically
5. **Grant Permission**: Click "Select Folder" or "Allow" in the picker dialog
6. **Wait for migration**: ViaGent will automatically migrate all notes to the selected folder

### Step 3: Migration Process

During migration, ViaGent will:

1. **Export from IndexedDB**:
   - Read all notes from IndexedDB
   - Convert to markdown files with metadata
   - Create folder structure:
     ```
     /YourSelectedFolder/
     ├── .viagent/              # Metadata (indexes, hashes)
     ├── notes/                 # All notes as .md files
     │   ├── note-1.md
     │   ├── note-2.md
     │   └── ...
     └── assets/                 # Embedded images/attachments
     ```

2. **Verify Migration**:
   - Check note count matches (before = after)
   - Verify all notes have content
   - Check folder structure is created

3. **Display Status**:
   - Progress bar shows migration progress
   - Success message when complete
   - Summary of migrated notes

### Step 4: Post-Migration Verification

After migration completes:

1. **Open Notes Workspace** - Navigate to notes view
2. **Verify Notes Load** - Check all notes appear
3. **Test Note Operations**:
   - Create a new test note
   - Edit an existing note
   - Delete a test note
   - Verify all operations work correctly
4. **Check File System** - Use file manager to verify files exist in selected folder

---

## 🔙 Rollback Procedure

> **Full Rollback Documentation**: See [`_bmad-output/planning-artifacts/migration/rollback-procedure.md`](../migration/rollback-procedure.md) for comprehensive rollback guide with:
> - Step-by-step rollback process with commands
> - Pre-rollback checklists and safety verification
> - Rollback time estimates (target: <15 minutes)
> - Known limitations and support escalation path
> - Rollback log templates for audit trail

### When to Rollback?

Rollback to IndexedDB storage if:

- ⚠️ **Data Corruption**: FSA files are damaged, unreadable, or inaccessible
- ⚠️ **Performance Issues**: FSA storage causes severe degradation or freezing
- ⚠️ **Permission Problems**: OS restrictions prevent file access, even after regranting
- ⚠️ **File System Errors**: I/O errors, disk failures, or file system corruption
- ⚠️ **User Data Loss Risk**: Data integrity issues that cannot be resolved

### Quick Rollback Summary

1. **Backup Current State** (5 min):
   - Export DexieDB cache (if available)
   - Copy FSA notes folder to backup location
   - Document migration status and issues

2. **Revert to DexieDB-Only Mode** (3 min):
   - Update project storage type from 'fsa' to 'indexeddb'
   - Clear FSA file handles and metadata
   - Restart application

3. **Import FSA Notes to DexieDB** (5 min):
   - Read all `.md` files from `/project/notes/`
   - Parse frontmatter using `note-formatter.ts`
   - Insert notes into DexieDB via bulk import

4. **Validation** (2 min):
   - Test note CRUD operations
   - Verify note count matches FSA files
   - Check UI functionality and agent tools

**Target Time**: <15 minutes (for typical projects with <200 notes)

### Rollback Success Criteria

- [ ] All notes restored from FSA files
- [ ] Note count matches or is acceptable (matches FSA files or documented variance)
- [ ] All note operations work in IndexedDB mode
- [ ] No data corruption or loss
- [ ] Backup files preserved in safe location
- [ ] Rollback documented with timestamp and outcomes

### What Rollback Does NOT Do

- ❌ **Does NOT delete** FSA files (they remain for manual review)
- ❌ **Does NOT preserve** external file edits made during FSA mode
- ❌ **Does NOT restore** file watching/sync history from FSA mode
- ❌ **Does NOT recover** data lost due to corruption (only imports what's available)

**Note**: For detailed rollback procedure with commands, scripts, and troubleshooting, see [rollback-procedure.md](../migration/rollback-procedure.md).

---

## 📋 FAQ

### General Questions

**Q: Will I lose my notes during migration?**
A: No. Migration is a copy process. All notes are preserved in both IndexedDB and FSA files during migration.

**Q: How long does migration take?**
A: Typically 1-2 minutes per 100 notes. Large projects (500+ notes) may take 5-10 minutes.

**Q: Can I migrate multiple projects?**
A: Yes, but each project is migrated separately. Select a project, complete migration, then repeat for next project.

**Q: What happens to my shared notes?**
A: Notes shared with other users are not affected. Migration only affects your local storage.

**Q: Can I use both FSA and IndexedDB?**
A: No. ViaGent uses one storage type per project. You choose FSA or IndexedDB, not both.

### Browser and Platform Questions

**Q: What browsers support FSA?**
A: Chrome 86+, Edge 86+, Opera (limited support). Safari and Firefox do not support FSA.

**Q: What about mobile devices?**
A: FSA is not available on mobile (iOS Safari, Android Chrome). Mobile users continue using IndexedDB storage.

**Q: Do I need to keep ViaGent open during migration?**
A: No. Migration runs in the background. You can continue using other applications.

**Q: Will FSA storage work offline?**
A: FSA files are stored on your disk. You can view and edit notes offline, but file changes won't sync until ViaGent is reopened.

### Technical Questions

**Q: What is the `.viagent` folder?**
A: This is ViaGent's metadata folder containing:
- `project.json` - Project configuration
- `notes-index.json` - Note order and favorites
- `file-tree-snapshot.json` - File tree cache
- `rag-index/` - Local RAG vectors (if RAG is enabled)

**Q: Are my notes encrypted?**
A: No. Notes are stored as plain markdown files. You can add encryption later if needed.

**Q: What happens to my Note versions/history?**
A: ViaGent preserves version history. When you migrate, all versions are included in FSA files. The versioning UI continues to work with FSA storage.

---

## 🔧 Troubleshooting

### Issue: Migration Fails or Hangs

**Symptoms**:
- Progress bar stops moving
- Application freezes
- "Migration failed" error message

**Solutions**:
1. **Reload ViaGent** - Refresh page and try again
2. **Check Browser Console** - Press F12 to see error messages
3. **Clear Browser Cache** - Sometimes cached data causes issues
4. **Try Incognito Mode** - If extensions interfere, try incognito window
5. **Check Disk Space** - Ensure sufficient free space
6. **Close Other Applications** - Too many open files can cause issues

### Issue: Notes Don't Appear After Migration

**Symptoms**:
- Empty notes list
- "No notes found" message
- Notes count is zero

**Solutions**:
1. **Wait for Indexing** - ViaGent may need time to build index
2. **Refresh Notes View** - Pull to refresh or press F5
3. **Check Selected Folder** - Verify you're looking at correct location
4. **Verify File System** - Use file manager to confirm files exist
5. **Check Permissions** - Ensure ViaGent has file system access

### Issue: Some Notes Missing After Migration

**Symptoms**:
- Note count doesn't match before migration
- Random notes are missing
- Folder shows fewer files than expected

**Solutions**:
1. **Check Export** - Verify your pre-migration export was complete
2. **Retry Migration** - Switch back to IndexedDB, then retry migration
3. **Check for Corrupt Notes** - Some notes may have failed export
4. **Compare Files** - Use file manager to see what's actually in folder
5. **Contact Support** - If issue persists, report via GitHub Issues

### Issue: File Access Denied After Migration

**Symptoms**:
- "Permission denied" when opening notes
- Can't save edits to notes
- "File not accessible" errors

**Solutions**:
1. **Regrant Permission** - Open ViaGent settings, click "Change Folder"
2. **Check OS Permissions** - Ensure ViaGent has file system access
3. **Check Antivirus/Firewall** - May be blocking file access
4. **Use Administrator Mode** - Run browser with elevated permissions (Windows)
5. **Verify Folder Location** - Ensure folder exists and is accessible

---

## 📊 Technical Details

### Storage Path Format

**FSA Storage (Desktop)**:
```
/YourSelectedFolder/
├── .viagent/
│   ├── project.json              # Project configuration
│   ├── notes-index.json          # Note metadata
│   └── file-tree-snapshot.json  # Cache
├── notes/
│   ├── {noteId}.md            # Each note is a markdown file
│   ├── {noteId}.md
│   └── ...
└── assets/
    ├── {assetId}.png
    └── ...
```

**IndexedDB Storage (Mobile/Fallback)**:
- Notes stored in `notes` table
- Assets stored in `assets` table
- Metadata stored in `notes` table (as part of note records)
- Indexed in `notes_content` table for search

### Note File Format

Each note file contains:

```markdown
---
id: "note-uuid"
projectId: "proj-timestamp-random"
workspaceId: "notes"
title: "Note Title"
emoji: "📝"
parentId: "parent-uuid"
isFavorite: false
order: 0
isIndexed: true
indexedAt: 1234567890
createdAt: 1234567890
updatedAt: 1234567890
---
[BlockNote JSON content as markdown blocks]
```

### Migration API Flow

**IndexedDB → FSA Export**:
```typescript
// ViaGent reads from IndexedDB
const notes = await db.notes.toArray();

// Converts each note to markdown
for (const note of notes) {
  const markdown = serializeNoteToMarkdown(note);
  const content = encoder.encode(markdown);
  await gateway.write(`/notes/${note.id}.md`, content);
}
```

**FSA → IndexedDB Import (Rollback)**:
```typescript
// ViaGent reads from FSA files
const files = await gateway.list('/notes');

// Converts each file back to note record
for (const file of files) {
  const content = await gateway.read(file.path);
  const markdown = decoder.decode(content);
  const note = parseMarkdownToNote(markdown);
  await db.notes.add(note);
}
```

### Performance Characteristics

| Storage Type | Read Speed | Write Speed | Capacity | Notes Retrieval |
|--------------|-----------|-------------|----------|----------------|
| **FSA** | Fast (file I/O) | Fast (file I/O) | Unlimited | Full-text search via files |
| **IndexedDB** | Medium | Medium | ~60% of disk | Limited (need indexing) |

---

## 🎓 Best Practices

### After Migration

1. **Regular Backups** - Use standard file backup tools
2. **Version Control** - Consider Git for tracking note changes
3. **Avoid Too Many Notes** - Performance degrades with 1000+ notes in single folder
4. **Use Subfolders** - Organize notes into folders for better management
5. **Check Disk Space** - Ensure sufficient free space regularly

### File Organization

**Recommended Structure**:
```
/ViaGent Notes/
├── Work/
│   ├── Project Alpha/
│   └── Personal/
├── Personal/
├── Archive/
└── Templates/
```

### Security Considerations

1. **Sensitive Data** - Avoid storing passwords or API keys in notes
2. **Public Sharing** - Be careful what you share via FSA folders
3. **Access Control** - Use OS file permissions for sensitive notes
4. **Encryption** - Consider external encryption tools for sensitive data

---

## 📞 Support

If you encounter issues not covered in this guide:

1. **Check GitHub Issues**: https://github.com/[your-repo]/issues
2. **Review Documentation**: https://docs.viagent.app
3. **Join Community**: Check for community discussions and solutions
4. **Report Bugs**: Include browser version, OS, and error messages

---

## ✅ Migration Complete

After successful migration, you should experience:
- ✅ Faster note operations
- ✅ Unlimited storage quota
- ✅ Better search performance (native OS file search)
- ✅ Terminal and file manager access
- ✅ Backup and sync with standard tools
- ✅ Agentic coding support

**Welcome to the future of ViaGent storage!**

---

**Guide Version**: 1.0
**Last Updated**: 2026-01-18
**Next Review**: 2026-01-19
