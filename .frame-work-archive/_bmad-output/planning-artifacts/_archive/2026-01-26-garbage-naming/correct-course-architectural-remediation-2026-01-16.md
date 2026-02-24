# Correct-Course: Architectural Remediation Grand Master Plan
**Date**: 2026-01-16
**Last Updated**: 2026-01-16T18:00:00+07:00
**Status**: PLANNING - ITERATION 2
**Trigger**: Manual - Foundation collapse (Notes/IDE non-functional)
**Severity**: CRITICAL

---

## Document description

This is the **single source of truth** for the Correct-Course Architectural Remediation. All discussion findings, decisions, and research are consolidated here. This document is iteratively updated as planning progresses.

**This document does NOT authorize implementation. It presents findings for review.**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Decided Architecture](#decided-architecture)
3. [Platform Detection & Routing](#platform-detection--routing)
4. [FSA Handle Persistence Solution](#fsa-handle-persistence-solution)
5. [File Watching & Sync Solution](#file-watching--sync-solution)
6. [CRUD Capabilities Matrix](#crud-capabilities-matrix)
7. [Workspace Architecture Matrix](#workspace-architecture-matrix)
8. [AI Agent Tool Contract](#ai-agent-tool-contract)
9. [Notes Rich Content Parity](#notes-rich-content-parity)
10. [Architectural Domains](#architectural-domains)
11. [Epic Formulation](#epic-formulation)
12. [Open Questions](#open-questions)

---

## Executive Summary

### The Core Problem

The codebase has reached a critical state where fundamental features (Notes, IDE) are non-functional due to unregulated boundaries between storage types, state management, and routing.

### Key Findings from Research

| Finding | Source | Implication |
|---------|--------|-------------|
| FSA handles CAN persist in IndexedDB | Chrome DevRel | No "re-click folder" needed |
| Chrome 122+ has persistent permissions | Chrome Blog (Jan 2024) | "Allow on every visit" option |
| FileSystemObserver API available | Chrome 129+ (Sept 2024) | Native file watching, no polling |
| Installed PWAs auto-persist permissions | Chrome DevRel | Zero-click for installed apps |
| IndexedDB cannot support agentic coding | Technical limitation | IDE = Desktop FSA only |

---

## Decided Architecture

### Storage Routing (DECIDED)

| Platform | Auto-Selected Storage | User Choice? | Rationale |
|----------|----------------------|--------------|-----------|
| **Desktop** | FSA | ❌ No choice | FSA strictly better for IDE |
| **Tablet** | IndexedDB | ❌ No choice | FSA not supported |
| **Mobile** | IndexedDB | ❌ No choice | FSA not supported |

**No mixing. No user choice. Automatic detection.**

```typescript
// At project creation - FINAL LOGIC
const storageType = isDesktopDevice() && isFSASupported() ? 'fsa' : 'indexeddb';
```

### Workspace Access by Platform (DECIDED)

| Device | IDE Access | Notes Access | Knowledge Access | Study Access |
|--------|------------|--------------|------------------|--------------|
| Desktop | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Tablet | ❌ Blocked | ✅ Full | ✅ Full | ✅ Full |
| Mobile | ❌ Blocked | ✅ Full | ✅ Full | ✅ Full |

**IDE is desktop-only by technical necessity (FSA required for agentic coding).**

---

## Platform Detection & Routing

### Entry Point Flow (PROPOSED)

```
Hub Card Click → getPlatformContract() → Route Decision

Desktop + FSA Project   → /ide/$projectId (full IDE)
Desktop + IDB Project   → /notes/$projectId (notes view)
Mobile/Tablet + Any     → /notes/$projectId (notes only)
```

### Platform Contract Interface (PROPOSED)

```typescript
interface PlatformContract {
  // Platform info
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  
  // Capabilities
  canAccessFSA: boolean;        // true for desktop Chrome/Edge
  canWatchFiles: boolean;       // true if FileSystemObserver available
  canRunTerminal: boolean;      // true if WebContainer available
  
  // Derived permissions
  canDoAgenticCoding: boolean;  // FSA + WebContainer
  canAccessIDE: boolean;        // desktop only
}
```

---

## FSA Handle Persistence Solution

### Research Findings (Chrome 122+)

**Source**: https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api

| Feature | Availability | Behavior |
|---------|--------------|----------|
| Store `FileSystemHandle` in IndexedDB | Chrome 86+ | Handle object is serializable |
| Persistent permissions (3-way prompt) | Chrome 122+ | "Allow on every visit" option |
| Installed app auto-persistence | Chrome 122+ | No prompt needed for PWA |

### How It Works

1. **First Visit**: User clicks "Open Folder" → FSA handle granted
2. **Store Handle**: Save `FileSystemDirectoryHandle` to IndexedDB (Dexie)
3. **Subsequent Visit**: Retrieve handle from IndexedDB → Call `requestPermission()`
4. **Chrome 122+ Prompt**: User sees three options:
   - "Allow this time" (session only)
   - **"Allow on every visit"** (persistent - OUR GOAL)
   - "Don't allow"
5. **Installed PWA**: Permissions auto-persist, no prompt shown

### Implementation Strategy (PROPOSED)

```typescript
interface StoredProjectHandle {
  projectId: string;
  handle: FileSystemDirectoryHandle;  // Stored in IndexedDB
  folderName: string;
  lastAccessTime: Date;
  permissionGranted: 'unknown' | 'prompt' | 'granted' | 'denied';
}

// On app load
async function restoreProjectAccess(projectId: string): Promise<boolean> {
  const stored = await getStoredHandle(projectId);
  if (!stored) return false;
  
  // Query current permission state
  const permission = await stored.handle.queryPermission({ mode: 'readwrite' });
  
  if (permission === 'granted') {
    return true; // Already have access
  }
  
  if (permission === 'prompt') {
    // Request permission - triggers Chrome's 3-way prompt
    const result = await stored.handle.requestPermission({ mode: 'readwrite' });
    return result === 'granted';
  }
  
  return false; // Denied
}
```

### Snapshot Strategy for Fast Load (PROPOSED)

**Problem**: Full file tree scan on every load is slow (10,000+ files = 5-10 seconds).

**Solution**: Store file tree snapshot in Dexie, load instantly, diff in background.

```
First Load:
  1. User opens folder → Full scan → Store snapshot in Dexie
  2. Snapshot = { files: Map<path, {hash, mtime}>, lastScan: Date }

Subsequent Load:
  1. Retrieve handle from IndexedDB
  2. Request permission (if needed)
  3. IMMEDIATELY show UI with cached snapshot
  4. Background: Start observer OR poll for changes
  5. Diff changes → Update only modified files
```

### Persistence Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FSA HANDLE PERSISTENCE (Chrome 122+)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   First Visit:                                                               │
│   User ──► showDirectoryPicker() ──► Handle ──► Store in Dexie              │
│                                                                              │
│   Subsequent Visit:                                                          │
│   App Load ──► Get handle from Dexie ──► queryPermission()                  │
│                     │                                                        │
│                     ├── 'granted' ──► Use immediately ✅                     │
│                     │                                                        │
│                     └── 'prompt' ──► requestPermission()                    │
│                                          │                                   │
│                                          ├── Chrome 122+ 3-way prompt:       │
│                                          │   • "Allow this time"             │
│                                          │   • "Allow on every visit" ✅     │
│                                          │   • "Don't allow"                 │
│                                          │                                   │
│   Installed PWA:                                                             │
│   Permissions auto-persist ──► No prompt ✅                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Watching & Sync Solution

### Research Findings (Chrome 129+)

**Source**: https://developer.chrome.com/blog/file-system-observer

| Feature | Availability | Status |
|---------|--------------|--------|
| `FileSystemObserver` API | Chrome 129+ | Origin Trial (Sept 2024 - Feb 2025) |
| Native file change events | Chrome 129+ | Replaces polling |
| Change types: appeared, disappeared, modified, moved | Chrome 129+ | Full coverage |

### FileSystemObserver API

```typescript
// Native file watching (Chrome 129+)
const observer = new FileSystemObserver(async (records, observer) => {
  for (const record of records) {
    console.log(`${record.type}: ${record.changedHandle.name}`);
    // record.type: 'appeared' | 'disappeared' | 'modified' | 'moved' | 'errored'
  }
});

// Start observing a directory
await observer.observe(directoryHandle, { recursive: true });

// Stop observing
observer.disconnect();
```

### Implementation Strategy (PROPOSED)

```typescript
// Feature detection
const hasNativeObserver = 'FileSystemObserver' in window;

if (hasNativeObserver) {
  // Use native observer (Chrome 129+)
  const observer = new FileSystemObserver(handleChanges);
  await observer.observe(handle, { recursive: true });
} else {
  // Fallback to polling (Chrome 86-128)
  startPolling(handle, { interval: 500 });
}
```

### Sync Status Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE WATCHING STRATEGY                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Feature Detection:                                                         │
│   'FileSystemObserver' in window?                                            │
│        │                                                                     │
│        ├── YES (Chrome 129+) ──► Native Observer                             │
│        │                         • Zero CPU when idle                        │
│        │                         • Instant change detection                  │
│        │                         • Full change type info                     │
│        │                                                                     │
│        └── NO (Chrome 86-128) ──► Polling Fallback                           │
│                                   • 500ms interval                           │
│                                   • Compare file hashes                      │
│                                   • Higher CPU usage                         │
│                                                                              │
│   On Change Detected:                                                        │
│   1. Update file tree in Zustand                                             │
│   2. Update snapshot in Dexie                                                │
│   3. Notify Monaco editor (if file open)                                     │
│   4. Trigger RAG re-index (if content changed)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## CRUD Capabilities Matrix

### By Storage Type

| Operation | FSA (Desktop) | IndexedDB | WebContainer |
|-----------|---------------|-----------|--------------|
| **Create File** | ✅ Real file on disk | ✅ Virtual blob | ✅ In-memory |
| **Read File** | ✅ Real content | ✅ Virtual content | ✅ In-memory |
| **Update File** | ✅ Real write | ✅ Virtual update | ✅ In-memory |
| **Delete File** | ✅ Real delete | ✅ Virtual delete | ✅ In-memory |
| **Watch Changes** | ✅ Native (129+) / Polling | ❌ No | ✅ Native |
| **External Edit** | ✅ Detected | ❌ N/A | ❌ N/A |
| **Terminal/Exec** | ❌ No | ❌ No | ✅ Full |
| **Persist Refresh** | ✅ Handle in IDB | ✅ Full | ❌ Memory only |
| **Cross-Tab Sync** | ⚠️ Via observer | ✅ BroadcastChannel | ❌ No |

### Key Insight

**IndexedDB stores blobs, not files.** For AI agents to do agentic coding:
- Real file paths agents can reference
- External tools can interact with file system
- Can run `npm install`, `git commit`, etc.

**IndexedDB CANNOT support agentic coding. FSA required.**

---

## Workspace Architecture Matrix

| Workspace | Primary File Types | Storage Requirement | AI Integration | Device Support |
|-----------|-------------------|---------------------|----------------|----------------|
| **Notes** | `.md`, `.blocknote` | IndexedDB ✅ | Rewrite, Summarize, Generate | All devices |
| **IDE** | All code files | FSA ⚠️ REQUIRED | Full CRUD tools, Terminal | **Desktop ONLY** |
| **Knowledge** | `.pdf`, `.md`, URLs | IndexedDB ✅ | RAG, Semantic Search | All devices |
| **Study** | Flashcard records | IndexedDB ✅ | Quiz Generation | All devices |

---

## AI Agent Tool Contract

### Why This Matters

Without a clear contract, AI agents will:
1. Attempt operations that fail silently
2. Hallucinate file paths that don't exist
3. Corrupt state by mixing storage types

### Agent Capabilities Interface (PROPOSED)

```typescript
interface AgentCapabilities {
  // Always available (both platforms)
  canSearchRAG: true;
  canReadChatHistory: true;
  canWriteNotes: true;
  canEmbedContent: true;
  
  // Platform-dependent
  canWriteRealFiles: boolean;      // true for FSA only
  canRunTerminal: boolean;         // true for WebContainer
  canWatchFileChanges: boolean;    // true for FSA only
  canAccessExternalTools: boolean; // true for FSA only
  
  // Derived
  canDoAgenticCoding: boolean;     // FSA + WebContainer
  storageType: 'fsa' | 'indexeddb';
  deviceType: 'desktop' | 'mobile' | 'tablet';
}
```

### Tool Availability by Platform

| Tool | FSA Desktop | IDB Desktop | IDB Mobile | WebContainer |
|------|-------------|-------------|------------|--------------|
| `readFile(path)` | ✅ | ⚠️ Virtual | ⚠️ Virtual | ✅ |
| `writeFile(path, content)` | ✅ | ⚠️ Virtual | ⚠️ Virtual | ✅ |
| `createFile(path)` | ✅ | ⚠️ Virtual | ⚠️ Virtual | ✅ |
| `deleteFile(path)` | ✅ | ⚠️ Virtual | ⚠️ Virtual | ✅ |
| `listDirectory(path)` | ✅ | ⚠️ Virtual | ⚠️ Virtual | ✅ |
| `runTerminal(cmd)` | ❌ | ❌ | ❌ | ✅ |
| `gitCommit()` | ❌ | ❌ | ❌ | ✅ |
| `installPackage(pkg)` | ❌ | ❌ | ❌ | ✅ |
| `openInEditor(path)` | ✅ | ⚠️ Virtual | ❌ | ❌ |

---

## Notes Rich Content Parity

Both user types MUST have full Notes capability with rich content.

### Feature Parity Matrix

| Feature | FSA Desktop | IndexedDB Mobile | Parity? |
|---------|-------------|------------------|---------|
| Text blocks | ✅ | ✅ | ✓ |
| Image blocks | ✅ File in folder | ✅ Blob in Dexie | ✓ |
| PDF blocks | ✅ File in folder | ✅ Blob in Dexie | ✓ |
| Video blocks | ✅ File in folder | ✅ Blob in Dexie | ✓ |
| HTML render blocks | ✅ | ✅ | ✓ |
| AI rewrite/summarize | ✅ | ✅ | ✓ |
| RAG "Ask my notes" | ✅ | ✅ | ✓ |
| Cross-note linking | ✅ | ✅ | ✓ |
| Export to .md | ✅ Real file | ✅ Download blob | ✓ |

### Rich Content Storage Strategy

```
FSA Desktop:
  /MyProject/
  ├── notes/
  │   ├── welcome.md
  │   └── assets/
  │       ├── image-abc123.png
  │       └── video-def456.mp4
  └── .viagent/
      └── notes-meta.json  ← BlockNote JSON structure

IndexedDB Mobile:
  Dexie tables:
  ├── notes: { id, title, blocks: BlockNote JSON }
  ├── noteAssets: { id, noteId, type, blob, filename }
  └── noteIndex: { noteId, chunks, embeddings }
```

### RAG for Both Platforms

```
FSA Folder (Real Files)          Dexie (IndexedDB)
┌─────────────────────┐          ┌─────────────────────┐
│ /src/index.ts       │ ──READ──►│ Chunks + Embeddings │
│ /README.md          │          │ Vector Index        │
│ /docs/api.md        │          │ RAG Search Index    │
└─────────────────────┘          └─────────────────────┘
```

**Key**: RAG vectors are NEVER stored in FSA. They go to Dexie. FSA is only for source file content.

---

## Architectural Domains

### 6 Domains Identified

| Domain | Severity | Root Cause | Impact |
|--------|----------|------------|--------|
| **D1: Identity & Routing** | 🔴 CRITICAL | No platform contract, broken hooks | All workspace entry fails |
| **D2: Storage Contract** | 🔴 CRITICAL | FSA vs IndexedDB decided at call site | Race conditions, data loss |
| **D3: State & Persistence** | 🔴 CRITICAL | 59 store files, STUB implementations | Silent failures |
| **D4: Entity Standardization** | 🟡 HIGH | `project` vs `workspace` confusion | Debugging impossible |
| **D5: Database Consolidation** | 🟡 HIGH | 11 separate IndexedDB databases | Performance, data silos |
| **D6: File Tree Governance** | 🟡 HIGH | Duplicate files in lib/ and infrastructure/ | Context poisoning |

### Files to Archive/Remove

#### IMMEDIATE REMOVAL (Dead Code)
```
src/lib/workspace/fsa-persistence.ts.bak
src/lib/workspace/fsa-persistence.ts.bak2
src/lib/workspace/fsa-persistence.ts.bak3
```

#### ARCHIVE AFTER FACADE CREATION
```
src/lib/workspace/project-store/           → Move to _bmad-ext/.archive/
src/lib/filesystem/local-fs-adapter.ts     → Move to _bmad-ext/.archive/
src/lib/workspace/file-sync-status-store/  → Move to _bmad-ext/.archive/
```

---

## Epic Formulation

### Correct-Course Epic: EPIC-CC-ARC (Architectural Remediation Core)

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-CC-ARC |
| **Name** | Architectural Remediation Core |
| **Priority** | P0 - CRITICAL |
| **Estimated Effort** | 40-50 hours |
| **Duration** | 4-6 weeks |
| **Dependencies** | None (foundational) |
| **Blocks** | All feature epics |

### Phase A: Identity & Routing (D1)

| Story ID | Title | Effort | Priority |
|----------|-------|--------|----------|
| ARC-A01 | Create `getPlatformContract()` service | 4h | P0 |
| ARC-A02 | Implement route guards for all workspace routes | 6h | P0 |
| ARC-A03 | Fix `useWorkspaceAccess` hook (DONE) | 2h | P0 |
| ARC-A04 | Mobile → Notes redirect for IDE routes | 2h | P0 |

### Phase B: Storage Contract (D2)

| Story ID | Title | Effort | Priority |
|----------|-------|--------|----------|
| ARC-B01 | Create `StorageGateway` abstraction layer | 6h | P0 |
| ARC-B02 | Implement `FSAGateway` adapter with handle persistence | 4h | P0 |
| ARC-B03 | Implement `IDBGateway` adapter | 4h | P0 |
| ARC-B04 | Fix `browser-mode.ts` persistence (DONE) | 2h | P0 |
| ARC-B05 | Implement FileSystemObserver with polling fallback | 4h | P0 |
| ARC-B06 | Implement snapshot caching for fast load | 3h | P1 |

### Phase C: State & Persistence (D3)

| Story ID | Title | Effort | Priority |
|----------|-------|--------|----------|
| ARC-C01 | Consolidate Project Store to infrastructure | 6h | P0 |
| ARC-C02 | Create facade re-exports for old paths | 2h | P0 |
| ARC-C03 | Fix `saveProject` STUB implementation | 2h | P0 |
| ARC-C04 | Implement persist-first pattern for all stores | 4h | P1 |
| ARC-C05 | Archive duplicate store files | 2h | P1 |

### Phase D: Entity Standardization (D4)

| Story ID | Title | Effort | Priority |
|----------|-------|--------|----------|
| ARC-D01 | Enforce ProjectId template literal type | 3h | P1 |
| ARC-D02 | Fix `workspaceId || projectId` fallback bugs | 4h | P1 |
| ARC-D03 | Rename `bindings` → `workspaceBindings` | 2h | P2 |

### Phase E: File Tree Cleanup (D6)

| Story ID | Title | Effort | Priority |
|----------|-------|--------|----------|
| ARC-E01 | Delete dead `.bak` files | 0.5h | P0 |
| ARC-E02 | Archive `src/lib/workspace/project-store/` | 1h | P1 |
| ARC-E03 | Archive `src/lib/filesystem/` duplicates | 1h | P1 |
| ARC-E04 | Update all imports to canonical paths | 4h | P2 |

---

## What Was Already Fixed (Phase 0)

| Fix | File | Status |
|-----|------|--------|
| `useWorkspaceAccess` hook | `workspace-access-helper.tsx` | ✅ DONE |
| `browser-mode.ts` direct Dexie | `browser-mode.ts` | ✅ DONE |
| TypeScript errors (10 → 0) | `AITransformMenu.tsx`, `ReplacementPreviewDialog.tsx` | ✅ DONE |

---

## Open Questions

### Requiring User Decision

1. **Notes Storage for FSA Desktop Users**:
   - Option A: Notes stored as `.md` files in project folder (real files, external editor can open)
   - Option B: Notes stored in Dexie (same as mobile), FSA only for IDE code files
   
2. **Cross-Workspace Project Sharing**:
   - Should one project work across all workspaces (with bindings)?
   - Or should each workspace have separate projects?

3. **PWA Installation Strategy**:
   - Should we encourage PWA installation for auto-persistent permissions?
   - Add "Install App" prompt for desktop users?

---

## Research Sources

| Topic | Source | Date |
|-------|--------|------|
| FSA Handle Persistence | developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api | Jan 2024 |
| FileSystemObserver API | developer.chrome.com/blog/file-system-observer | Aug 2024 |
| Chrome 129 Release Notes | developer.chrome.com/release-notes/129 | Sept 2024 |
| MDN FileSystemObserver | developer.mozilla.org/en-US/docs/Web/API/FileSystemObserver | 2025 |

---

**Document Owner**: BMAD Master Orchestrator
**Created**: 2026-01-16T16:00:00+07:00
**Last Updated**: 2026-01-16T18:00:00+07:00
**Status**: PLANNING - ITERATION 2
