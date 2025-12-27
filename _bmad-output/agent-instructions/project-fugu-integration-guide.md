# Project Fugu Integration Guide for Via-Gent

**Created:** 2025-12-11  
**Status:** Research Complete - Ready for Epic 4.5 Implementation  
**Prerequisite:** Epic 3 (File System Access Layer) - COMPLETED

---

## Executive Summary

This guide provides research-validated recommendations for integrating Project Fugu APIs into Via-Gent. The integration is designed as **Epic 4.5** - an additive enhancement that builds on Epic 3's FSA foundation without architectural disruption.

### Key Findings

| API | Browser Support | Priority | Implementation Effort |
|-----|-----------------|----------|----------------------|
| **FSA Permission Persistence** | Chrome 122+ | P0 | Low (builds on 3-4) |
| **File Watcher** | Polling required | P0 | Medium |
| **Async Clipboard** | Wide support | P1 | Low |
| **Badging API** | Chromium only | P2 | Low |
| **Local Font Access** | Chrome 103+ | P3 | Low |
| **Web Share** | Wide mobile | P3 | Low |

---

## Architecture Integration Points

### Current Architecture (Post-Epic 3)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Via-Gent IDE                                │
├─────────────────────────────────────────────────────────────────┤
│  UI Layer        │  File Tree  │  Monaco Editor  │  Terminal   │
├─────────────────────────────────────────────────────────────────┤
│  Sync Layer      │         SyncManager (Epic 3-3)              │
├─────────────────────────────────────────────────────────────────┤
│  FS Adapters     │  LocalFSAdapter  │  WebContainerFSAdapter   │
├─────────────────────────────────────────────────────────────────┤
│  Permissions     │  PermissionManager (Epic 3-4 in progress)   │
└─────────────────────────────────────────────────────────────────┘
```

### Proposed Enhancement Points (Epic 4.5)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Via-Gent IDE                                │
├─────────────────────────────────────────────────────────────────┤
│  UI Layer        │  + Badge │ + Font Picker │ + Share Button   │
├─────────────────────────────────────────────────────────────────┤
│  Fugu Layer (NEW)│  ClipboardManager │ BadgeManager │ FontMgr  │
├─────────────────────────────────────────────────────────────────┤
│  Sync Layer      │  SyncManager + FileWatcher (enhanced)       │
├─────────────────────────────────────────────────────────────────┤
│  FS Adapters     │  LocalFSAdapter (unchanged)                 │
├─────────────────────────────────────────────────────────────────┤
│  Permissions     │  PermissionManager (enhanced for persist)   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Priority 0: FSA Permission Persistence

### Research Summary

Chrome 122+ introduces persistent permissions via a three-way prompt:
- "Allow this time" - Session only
- "Allow on every visit" - Persistent
- "Don't allow" - Denied

### Integration with Story 3-4

**Current `PermissionManager` responsibilities (3-4):**
- Grant/revoke permission lifecycle
- Store handles in IndexedDB
- Query permission status

**Enhancement for 4.5.1:**
```typescript
// Enhanced PermissionManager interface
interface PermissionManager {
  // Existing (3-4)
  requestPermission(handle: FileSystemDirectoryHandle): Promise<boolean>;
  revokePermission(projectId: string): Promise<void>;
  
  // New (4.5.1) - Permission persistence
  checkPersistentPermission(handle: FileSystemDirectoryHandle): Promise<PermissionState>;
  handleExpiredPermission(projectId: string): Promise<void>;
  getStoredHandles(): Promise<Map<string, FileSystemDirectoryHandle>>;
}

type PermissionState = 'persistent' | 'session' | 'prompt' | 'denied' | 'expired';
```

### Implementation Pattern (browser-fs-access validated)

```typescript
// Check and restore persistent permission
async function restorePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const options = { mode: 'readwrite' as const };
  
  // Query without user gesture first
  const status = await handle.queryPermission(options);
  
  if (status === 'granted') {
    return true; // Persistent or still valid
  }
  
  if (status === 'prompt') {
    // Need user gesture to re-request
    // Show UI: "Click to restore access to [folder name]"
    return false;
  }
  
  // status === 'denied'
  return false;
}
```

### Non-Disruptive Integration

- **No changes to LocalFSAdapter** - Permission logic stays in PermissionManager
- **No changes to SyncManager** - Uses PermissionManager interface
- **UI addition only** - Add "Restore Access" button in FileTree header

---

## Priority 0: File Watcher

### Research Summary

**Native File System Observer API:** Not yet available (Chrome Origin Trial only)

**Recommended approach:** Polling with optimization

### Implementation Pattern

```typescript
interface FileWatcher {
  watch(paths: string[], handle: FileSystemDirectoryHandle): void;
  unwatch(paths: string[]): void;
  onExternalChange: EventEmitter<{ path: string; action: 'modified' | 'deleted' | 'created' }>;
  
  // Optimization controls
  setPollingInterval(ms: number): void;
  pause(): void;
  resume(): void;
}

class PollingFileWatcher implements FileWatcher {
  private intervalId: number | null = null;
  private fileHashes: Map<string, string> = new Map();
  private pollingInterval = 5000; // 5 seconds default
  
  async pollChanges(): Promise<void> {
    for (const [path, handle] of this.watchedFiles) {
      try {
        const file = await handle.getFile();
        const hash = await this.computeHash(file);
        const prevHash = this.fileHashes.get(path);
        
        if (prevHash && prevHash !== hash) {
          this.onExternalChange.emit({ path, action: 'modified' });
        }
        this.fileHashes.set(path, hash);
      } catch (e) {
        if (e.name === 'NotFoundError') {
          this.onExternalChange.emit({ path, action: 'deleted' });
          this.fileHashes.delete(path);
        }
      }
    }
  }
  
  private async computeHash(file: File): Promise<string> {
    // Use lastModified + size for fast comparison
    return `${file.lastModified}-${file.size}`;
  }
}
```

### Integration with SyncManager

```typescript
// In SyncManager - add file watcher integration
class SyncManager {
  private fileWatcher: FileWatcher;
  
  async initializeWatcher(): Promise<void> {
    this.fileWatcher.onExternalChange.on(async ({ path, action }) => {
      if (action === 'modified') {
        // Emit event for UI to handle
        this.events.emit('external-file-change', { path });
      }
    });
  }
}
```

---

## Priority 1: Async Clipboard

### Browser Support

- Chrome 86+, Edge 86+, Safari 13.1+, Firefox 87+ ✅

### Implementation Pattern

```typescript
interface ClipboardManager {
  copyCode(code: string, language: string): Promise<void>;
  copyFilePath(relativePath: string): Promise<void>;
  pasteImage(): Promise<Blob | null>;
  copyAsRichText(code: string, language: string): Promise<void>;
}

class BrowserClipboardManager implements ClipboardManager {
  async copyCode(code: string, language: string): Promise<void> {
    // Copy as both plain text and HTML
    const html = await this.highlightCode(code, language);
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([code], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      }),
    ]);
  }
  
  async pasteImage(): Promise<Blob | null> {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes('image/png')) {
        return await item.getType('image/png');
      }
    }
    return null;
  }
  
  private async highlightCode(code: string, language: string): Promise<string> {
    // Use Monaco's tokenizer or Shiki for syntax highlighting
    const { codeToHtml } = await import('shiki');
    return codeToHtml(code, { lang: language, theme: 'github-dark' });
  }
}
```

---

## Priority 2: Badging API

### Browser Support

- Chrome 81+, Edge 81+ ✅
- Safari 16.4+ (partial)
- Firefox ❌

### Implementation Pattern

```typescript
interface BadgeManager {
  setBuildErrors(count: number): void;
  setAgentActivity(): void;
  clearBadge(): void;
}

class BrowserBadgeManager implements BadgeManager {
  private supported = 'setAppBadge' in navigator;
  
  setBuildErrors(count: number): void {
    if (!this.supported) return;
    
    if (count > 0) {
      navigator.setAppBadge(count);
    } else {
      navigator.clearAppBadge();
    }
  }
  
  setAgentActivity(): void {
    if (!this.supported) return;
    navigator.setAppBadge(); // Boolean badge (no count)
  }
  
  clearBadge(): void {
    if (!this.supported) return;
    navigator.clearAppBadge();
  }
}
```

### Integration Point

```typescript
// In Terminal component - listen for build errors
terminal.onData((data) => {
  const errorCount = parseErrorCount(data);
  if (errorCount > 0) {
    badgeManager.setBuildErrors(errorCount);
  }
});

// Clear on tab focus
window.addEventListener('focus', () => {
  badgeManager.clearBadge();
});
```

---

## Recommended Implementation Order

### Phase 1: Complete Epic 3-4 First

Before starting Epic 4.5, ensure story 3-4 (Directory Permission Lifecycle) is complete. This provides the foundation for permission persistence.

### Phase 2: Epic 4.5 Stories

```yaml
Week 1:
  - 4.5.1: Enhanced FSA Permission Persistence (builds on 3-4)
  - 4.5.2: File Watcher (polling implementation)

Week 2:
  - 4.5.3: Async Clipboard (copy code with highlighting)

Week 3 (Optional):
  - 4.5.4: Badging API
  - 4.5.5: Font Selection
  - 4.5.6: Web Share
```

---

## File Structure (Proposed)

```
src/
├── lib/
│   └── fugu/                    # New Epic 4.5 directory
│       ├── permission-manager.ts    # Enhanced from 3-4
│       ├── file-watcher.ts
│       ├── clipboard-manager.ts
│       ├── badge-manager.ts
│       ├── font-manager.ts
│       └── share-manager.ts
└── components/
    └── ide/
        ├── file-tree/
        │   └── RestoreAccessButton.tsx  # New UI
        └── editor/
            └── FontPicker.tsx           # New UI
```

---

## Browser Compatibility Matrix

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| FSA Persistent Permissions | ✅ 122+ | ✅ 122+ | ❌ | ❌ |
| File System Access API | ✅ 86+ | ✅ 86+ | ✅ 15.2+ | ❌ |
| Async Clipboard | ✅ 86+ | ✅ 86+ | ✅ 13.1+ | ✅ 87+ |
| Badging API | ✅ 81+ | ✅ 81+ | ⚠️ 16.4+ | ❌ |
| Local Font Access | ✅ 103+ | ✅ 103+ | ❌ | ❌ |
| Web Share | ✅ 89+ | ✅ 93+ | ✅ 12.1+ | ⚠️ Mobile |

---

## Fallback Strategy

```typescript
// Feature detection pattern
const fuguCapabilities = {
  persistentPermissions: 'queryPermission' in FileSystemHandle.prototype,
  clipboard: 'clipboard' in navigator && 'write' in navigator.clipboard,
  badging: 'setAppBadge' in navigator,
  localFonts: 'queryLocalFonts' in window,
  webShare: 'share' in navigator,
};

// Use capabilities for progressive enhancement
if (fuguCapabilities.persistentPermissions) {
  // Use enhanced permission flow
} else {
  // Fall back to session-only permissions
}
```

---

## Research Sources Used

1. **Chrome Developer Blog:** Persistent permissions for FSA
2. **browser-fs-access library:** Pattern validation (Context7)
3. **Tavily Search:** Browser compatibility December 2025
4. **CanIUse:** Detailed browser support matrix
5. **WICG Specs:** Official API specifications

---

## Next Steps

1. ✅ Complete story 3-4 (Directory Permission Lifecycle)
2. Run `docs/proposal/project-fugu.md` Phase 1 research sprint
3. Create story specs in `docs/sprint-artifacts/`
4. Implement in priority order
5. Update `bmm-workflow-status.yaml` with Epic 4.5 progress

---

*This guide should be referenced when implementing any Project Fugu API integration.*
