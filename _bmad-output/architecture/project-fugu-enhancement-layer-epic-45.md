# Project Fugu Enhancement Layer (Epic 4.5)

**Status:** Research Complete - Ready for Implementation  
**Prerequisite:** Epic 3 Complete ✅

### Architecture Enhancement Points

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

### Fugu API Integration Priority

| API | Browser Support | Priority | File Location |
|-----|-----------------|----------|---------------|
| FSA Permission Persistence | Chrome 122+ | P0 | `src/lib/fugu/permission-manager.ts` |
| File Watcher (Polling) | All FSA browsers | P0 | `src/lib/fugu/file-watcher.ts` |
| Async Clipboard | Wide support | P1 | `src/lib/fugu/clipboard-manager.ts` |
| Badging API | Chromium only | P2 | `src/lib/fugu/badge-manager.ts` |

### Feature Detection Pattern

```typescript
const fuguCapabilities = {
  persistentPermissions: 'queryPermission' in FileSystemHandle.prototype,
  clipboard: 'clipboard' in navigator && 'write' in navigator.clipboard,
  badging: 'setAppBadge' in navigator,
  localFonts: 'queryLocalFonts' in window,
};

// Progressive enhancement
if (fuguCapabilities.persistentPermissions) {
  // Use enhanced permission flow with three-way prompt
} else {
  // Fall back to session-only permissions
}
```

---
