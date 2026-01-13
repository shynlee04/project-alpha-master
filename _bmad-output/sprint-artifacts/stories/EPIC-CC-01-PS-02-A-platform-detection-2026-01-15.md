# Story: PS-02-A Platform Detection & Storage Routing

**Story ID**: PS-02-A  
**Epic**: EPIC-CC-01 (Project Space Foundation)  
**Status**: IN_PROGRESS  
**Team**: Team B  
**Created**: 2026-01-15  
**Effort**: 4h

---

## Overview

Create platform detection system that routes storage operations to the appropriate adapter based on device capabilities:
- Desktop browsers → FSA (File System Access API)
- Mobile browsers → IndexedDB via Dexie
- WebContainer → IndexedDB (preview only)

---

## Problem Statement

Currently, the application lacks a unified way to detect platform capabilities and route storage operations accordingly. This leads to:
- Mobile users seeing FSA errors when FS API is not supported
- Inconsistent storage behavior across platforms
- No graceful fallback mechanism

---

## Solution

Implement a platform detection hook and storage adapter factory that:
1. Detects device type and FSA support
2. Routes to appropriate storage adapter
3. Provides consistent interface across platforms

---

## User Stories

### US-1: Desktop User Creates FSA Project
**As a** desktop user  
**I want to** select a folder on my computer for the project  
**So that** I can work with local files using the File System Access API

**Acceptance Criteria**:
- [ ] Detect desktop browser with FSA support
- [ ] Show folder picker dialog
- [ ] Create FSA-based project
- [ ] Store project metadata in Dexie

### US-2: Mobile User Creates IDB Project
**As a** mobile user  
**I want to** create a project stored in the browser  
**So that** I can work with files without file system access

**Acceptance Criteria**:
- [ ] Detect mobile browser (no FSA support)
- [ ] Skip folder picker
- [ ] Create IndexedDB-based project
- [ ] Store all data locally

### US-3: Adaptive Storage Selection
**As a** user on any device  
**I want** the app to automatically choose the best storage option  
**So that** I don't see errors for unsupported features

**Acceptance Criteria**:
- [ ] Platform detection happens on app init
- [ ] Storage adapter selected based on capabilities
- [ ] Consistent API regardless of underlying storage
- [ ] No user-facing errors for unsupported features

---

## Technical Requirements

### Files to Create

1. `src/infrastructure/filesystem/platform-detection.ts`
   - `PlatformInfo` interface
   - `detectPlatform()` function
   - `isFSASupported()` function
   - `isMobile()` function
   - `isWebContainer()` function

2. `src/infrastructure/filesystem/usePlatformDetection.ts`
   - `usePlatform()` hook
   - Reactive platform state
   - Capability flags

3. `src/infrastructure/filesystem/StorageAdapterFactory.ts`
   - `StorageAdapterFactory` class
   - `createAdapter(options)` method
   - Returns: `FSAStorageAdapter` | `UnifiedStorageAdapter`

4. `src/infrastructure/filesystem/storage-types.ts`
   - `StorageAdapter` interface
   - `StorageType` enum ('fsa' | 'indexeddb')
   - `StorageCapabilities` interface

### Files to Modify

1. `src/infrastructure/persistence/stores/project/project-crud-slice.ts`
   - Use `StorageAdapterFactory` for new projects
   - Pass storage type to project creation

2. `src/lib/workspace/fsa-persistence.ts`
   - Update to use new platform detection
   - Remove direct FSA checks

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    StorageAdapterFactory                     │
├─────────────────────────────────────────────────────────────┤
│  createAdapter(options: StorageOptions): StorageAdapter     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐
    │   Desktop   │ │   Mobile    │ │    WebContainer     │
    │   (FSA)     │ │   (IDB)     │ │      (IDB)          │
    └─────────────┘ └─────────────┘ └─────────────────────┘
```

---

## Implementation Plan

### Phase 1: Platform Detection
1. Create `platform-detection.ts` with detection functions
2. Create `usePlatformDetection.ts` hook
3. Test detection on various devices/browsers

### Phase 2: Storage Factory
1. Create `storage-types.ts` with interfaces
2. Create `StorageAdapterFactory.ts`
3. Implement adapter selection logic

### Phase 3: Integration
1. Update project creation to use factory
2. Update FSA persistence module
3. Test end-to-end flow

---

## API Design

```typescript
// platform-detection.ts
export interface PlatformInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  isFSASupported: boolean;
  isWebContainer: boolean;
  canWrite: boolean;
  storageType: 'fsa' | 'indexeddb';
}

export function detectPlatform(): PlatformInfo {
  // Detect device type, FSA support, WebContainer
}

export function isFSASupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export function isMobile(): boolean {
  // Check user agent or feature detection
}

// usePlatformDetection.ts
export function usePlatform(): PlatformInfo {
  const [platform, setPlatform] = useState<PlatformInfo>(() => detectPlatform());
  
  useEffect(() => {
    // Re-detect on visibility change (mobile keyboard open/close)
  }, []);
  
  return platform;
}

// StorageAdapterFactory.ts
export type StorageAdapter = FSAStorageAdapter | UnifiedStorageAdapter;

export interface StorageOptions {
  type: 'fsa' | 'indexeddb';
  projectId: string;
  handle?: FileSystemDirectoryHandle;
}

export class StorageAdapterFactory {
  createAdapter(options: StorageOptions): StorageAdapter {
    switch (options.type) {
      case 'fsa':
        return new FSAStorageAdapter({ handle: options.handle, projectId: options.projectId });
      case 'indexeddb':
        return new UnifiedStorageAdapter({ storageType: 'indexeddb', projectId: options.projectId });
    }
  }
  
  detectStorageType(): 'fsa' | 'indexeddb' {
    const info = detectPlatform();
    return info.isFSASupported ? 'fsa' : 'indexeddb';
  }
}
```

---

## Acceptance Criteria

### Functional
- [ ] Desktop with FSA support → FSA adapter selected
- [ ] Mobile/tablet without FSA → IDB adapter selected
- [ ] WebContainer → IDB adapter selected
- [ ] Platform detection is reactive (updates on state change)
- [ ] Consistent API across all adapters

### Non-Functional
- [ ] TypeScript compilation passes (0 errors)
- [ ] No runtime errors on mobile devices
- [ ] No console warnings about FSA
- [ ] Platform detection completes in <100ms
- [ ] Adapter creation completes in <200ms

### Testing
- [ ] Unit tests for `detectPlatform()` (all branches)
- [ ] Unit tests for `StorageAdapterFactory`
- [ ] Integration test: desktop project creation
- [ ] Integration test: mobile project creation

---

## Dependencies

**External**:
- None (uses native browser APIs)

**Internal**:
- `FSAStorageAdapter` (already exists)
- `UnifiedStorageAdapter` (already exists)
- Dexie (already in use)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| FSA detection unreliable on some browsers | Medium | Feature detection + user agent fallback |
| Mobile detection false positives | Low | Multiple detection methods |
| Performance impact of reactive detection | Low | Lazy detection, cache results |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] TypeScript 0 errors
- [ ] Unit tests passing (≥80% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed by another developer
- [ ] Documentation updated
- [ ] Story marked COMPLETE in bmm-workflow-status.yaml

---

## Notes

- Based on ADR-032 (Clean Storage Architecture)
- Follows existing code patterns in codebase
- Uses Zustand for state management
- Compatible with PS-02-B (Hot Reactive Sync)
- Unblocks PS-05 (Virtual File System Tree)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-01-15 | 1.0 | Initial story | Team B |
