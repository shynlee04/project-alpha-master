# Mobile File Access Research: Solutions for Workspace Loading

> **Date**: 2025-12-28  
> **Epic**: Mobile Responsive Transformation (MRT)  
> **Status**: Research Complete - Awaiting Decision  
> **Framework**: Course Correction Analysis

---

## Executive Summary

The **File System Access API** (`showDirectoryPicker`) is **NOT supported on mobile browsers** (iOS Safari, Chrome for Android, Firefox Mobile). This is a fundamental browser limitation that prevents mobile users from opening local project folders.

This research identifies **4 viable solutions** for enabling workspace functionality on mobile devices, each with different trade-offs.

---

## Problem Statement

**Current Architecture:**
```
User clicks "Open Folder" 
→ window.showDirectoryPicker() 
→ LocalFSAdapter wraps handle
→ SyncManager syncs to WebContainer
→ WebContainer runs Node.js
```

**Mobile Issue:**
- `showDirectoryPicker`: ❌ Not supported on iOS/Android
- `WebContainer.boot()`: ❌ WebContainers only work on desktop browsers (Chrome, Edge, Safari 16.4+)
- IndexedDB: ✅ Works on mobile
- Service Workers: ✅ Works on mobile

---

## Solution Options

### Option 1: Zip File Upload + Client-Side Processing

**Approach:** Allow users to upload a `.zip` file containing their project

**Implementation:**
```typescript
// 1. User uploads zip file via <input type="file">
const file = await new Promise<File>(resolve => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.zip';
  input.onchange = () => resolve(input.files![0]);
  input.click();
});

// 2. Extract with JSZip
import JSZip from 'jszip';
const zip = await JSZip.loadAsync(file);
const files: FileSystemTree = {};

await Promise.all(
  Object.keys(zip.files).map(async (path) => {
    const entry = zip.files[path];
    if (!entry.dir) {
      files[path] = { file: { contents: await entry.async('string') } };
    }
  })
);

// 3. Mount to WebContainer (if supported)
await webcontainer.mount(files);

// 4. Store in IndexedDB for persistence
await projectStore.save({ files, metadata });
```

**Pros:**
- Works on all browsers with `<input type="file">`
- User maintains ownership of files
- Can export modified files back as zip

**Cons:**
- Manual zip/unzip workflow
- No real-time sync with local filesystem
- WebContainer still required for Node.js (desktop only)

**Effort:** Medium (2-3 days)

---

### Option 2: Template/Demo Mode with Pre-loaded Projects

**Approach:** Offer curated project templates that load from server

**Implementation:**
```typescript
// Pre-built snapshots served from server
const templates = [
  { id: 'vite-react', name: 'React + Vite Starter' },
  { id: 'nextjs', name: 'Next.js Template' },
  { id: 'node-express', name: 'Node.js API' },
];

// Load template from CDN/server
const snapshot = await fetch(`/templates/${templateId}.snapshot`);
const buffer = await snapshot.arrayBuffer();
await webcontainer.mount(buffer);

// Save user modifications to IndexedDB
```

**Server-Side Generation (using @webcontainer/snapshot):**
```typescript
import { snapshot } from '@webcontainer/snapshot';

const SOURCE_FOLDER = './templates/vite-react';
const templateSnapshot = await snapshot(SOURCE_FOLDER);

// Serve as binary
app.get('/templates/:id.snapshot', (req, res) => {
  res.setHeader('content-type', 'application/octet-stream');
  res.send(templateSnapshot);
});
```

**Pros:**
- No user file upload needed
- Consistent starting point
- Fast load times (binary snapshots)

**Cons:**
- Limited to predefined templates
- Requires server infrastructure
- Users can't bring their own projects

**Effort:** Low-Medium (1-2 days)

---

### Option 3: IndexedDB-Only Persistence (Mobile-First Editor)

**Approach:** Create projects entirely in-browser, persist to IndexedDB

**Implementation:**
```typescript
// Using Dexie for IndexedDB
import Dexie from 'dexie';

class ProjectDB extends Dexie {
  files!: Table<{ path: string; content: string; projectId: string }>;
  
  constructor() {
    super('projectdb');
    this.version(1).stores({
      files: '[projectId+path], projectId'
    });
  }
}

// Create new project in-browser
async function createMobileProject(name: string) {
  const projectId = generateId();
  
  // Initialize with starter files
  await db.files.bulkAdd([
    { projectId, path: 'index.html', content: '<html>...</html>' },
    { projectId, path: 'style.css', content: '...' },
    { projectId, path: 'script.js', content: '...' },
  ]);
  
  return projectId;
}

// Export to download
async function exportProject(projectId: string) {
  const files = await db.files.where({ projectId }).toArray();
  const zip = new JSZip();
  files.forEach(f => zip.file(f.path, f.content));
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${projectId}.zip`);
}
```

**Pros:**
- Fully offline capable
- No server required
- Works on all browsers

**Cons:**
- No Node.js execution (WebContainer still desktop-only)
- HTML/CSS/JS only (no bundler, no npm)
- Data loss risk if user clears browser data

**Effort:** Medium (3-4 days)

---

### Option 4: Hybrid Cloud Sync (Master File Approach)

**Approach:** Store project state as serialized "master file" that syncs across devices

**Implementation:**
```typescript
// Project state as single JSON blob
interface MasterFile {
  version: number;
  metadata: { name: string; created: Date };
  files: Record<string, { content: string; type: 'text' | 'binary' }>;
  openFiles: string[];
  activeFile: string;
}

// Export master file
async function exportMasterFile(projectId: string): Promise<Blob> {
  const state = await buildMasterFile(projectId);
  return new Blob([JSON.stringify(state)], { type: 'application/json' });
}

// Import master file
async function importMasterFile(file: File): Promise<string> {
  const content = await file.text();
  const master: MasterFile = JSON.parse(content);
  
  // Restore to IndexedDB
  const projectId = generateId();
  for (const [path, data] of Object.entries(master.files)) {
    await db.files.add({ projectId, path, content: data.content });
  }
  
  return projectId;
}
```

**Pros:**
- Portable across devices
- Single file to backup/share
- Works with cloud storage (iCloud, Google Drive)

**Cons:**
- File can get large for big projects
- Merge conflicts if editing on multiple devices
- Still no Node.js execution on mobile

**Effort:** Medium (2-3 days)

---

## Critical Limitation: WebContainers on Mobile

> **⚠️ WebContainers do NOT work on mobile browsers.**

From [official docs](https://developer.stackblitz.com/platform/webcontainers/browser-support):
> "WebContainers are supported in all **recent desktop browsers** (fully in Chrome and Chrome-based browsers, in beta in Firefox and Safari)"

**What this means:**
- Even if we load files via zip/IndexedDB, **Node.js cannot run on mobile**
- Mobile users can only:
  - Edit static files (HTML/CSS/JS)
  - Preview static HTML
  - Use client-side frameworks (no SSR, no npm)

---

## Recommendation Matrix

| Solution | Mobile File Load | Mobile Node.js | Offline | Effort |
|----------|-----------------|----------------|---------|--------|
| Zip Upload | ✅ | ❌ | ✅ | Medium |
| Templates | ✅ | ❌ | ❌ | Low |
| IndexedDB Only | ✅ | ❌ | ✅ | Medium |
| Master File | ✅ | ❌ | ✅ | Medium |

---

## Recommended Approach: Progressive Enhancement

**Phase 1: Immediate (1-2 days)**
- Add "Demo Mode" with pre-loaded templates
- Show clear message: "Full IDE features require desktop browser"
- Implement read-only project viewer on mobile

**Phase 2: Short-term (3-5 days)**
- Add zip file upload for mobile
- IndexedDB persistence for mobile projects
- Export-to-zip functionality

**Phase 3: Long-term (Future)**
- Cloud sync service for cross-device projects
- Monaco editor in read-only mode on mobile
- PWA with offline support

---

## Architecture Changes Required

```diff
# Current Architecture
LocalFSAdapter → showDirectoryPicker → Desktop Only

# Proposed Architecture
+ MobileFileAdapter → Zip Upload / IndexedDB → Mobile Supported
+ DesktopFileAdapter → showDirectoryPicker → Desktop Only
  
  FileAdapterFactory.create() → 
    if (isMobile) return MobileFileAdapter
    else return DesktopFileAdapter
```

**New Files:**
- `src/lib/filesystem/mobile-fs-adapter.ts`
- `src/lib/filesystem/zip-handler.ts`
- `src/components/hub/MobileProjectUpload.tsx`

---

## Decision Required

> **@USER**: Which approach should we implement?

1. **Demo Mode Only** - Quick win, limited functionality
2. **Zip Upload** - Full file access, manual workflow
3. **IndexedDB + Zip Export** - Best offline experience
4. **All of the above** - Progressive enhancement

---

## References

- [WebContainer Browser Support](https://webcontainers.io/guides/browser-support)
- [WebContainer File System API](https://webcontainers.io/guides/working-with-the-file-system)
- [JSZip Documentation](https://stuk.github.io/jszip/)
- [BrowserFS with IndexedDB](https://github.com/jvilk/BrowserFS)
- [isomorphic-git fs compatibility](https://isomorphic-git.org/docs/en/fs)
