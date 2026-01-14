# FSA-006 + FSA-007 Usage Example

**Date:** 2026-01-19
**Stories:** FSA-006, FSA-007
**Status:** REMEDIATED

## Overview

This document shows the usage patterns for the remediated FSA storage handle flow.

## 1. Updated ProjectContext Interface

```tsx
// src/lib/workspace/ProjectContext.tsx

export interface ProjectContextValue {
  project: Project | null;
  currentWorkspace: WorkspaceId;
  enabledWorkspaces: WorkspaceId[];
  fsaHandle: FileSystemDirectoryHandle | null;  // FSA-007: Added handle
  setFsaHandle: (handle: FileSystemDirectoryHandle | null) => void;  // FSA-006: Setter
  switchWorkspace: (workspace: WorkspaceId) => void;
  navigateToWorkspace: (workspace: WorkspaceId, options?: { replace?: boolean }) => Promise<void>;
}
```

## 2. Updated StorageAdapterFactory

```tsx
// src/infrastructure/filesystem/StorageAdapterFactory.ts

interface StorageOptions {
  projectId: string;
  storageType?: StorageType;
  handle?: FileSystemDirectoryHandle | null;  // Now optional
  handleGetter?: () => FileSystemDirectoryHandle | null;  // FSA-006: Context-based retrieval
  directoryPath?: string;
}

// Usage pattern:
const adapter = StorageAdapterFactory.createAdapter({
  projectId,
  handleGetter: () => fsaHandle,  // Get from context
});
```

## 3. Usage in Route Loader

```tsx
// src/routes/ide.$projectId.tsx or similar

import { useProjectContext } from '@/lib/workspace/ProjectContext';
import { StorageAdapterFactory } from '@/infrastructure/filesystem/StorageAdapterFactory';

function useStorageAdapter() {
  const { project, fsaHandle, setFsaHandle } = useProjectContext();
  
  // Create adapter with handle from context
  const adapter = React.useMemo(() => {
    if (!project?.id) return null;
    
    return StorageAdapterFactory.createAdapter({
      projectId: project.id,
      handle: fsaHandle,  // Handle may be null initially
    });
  }, [project?.id, fsaHandle]);
  
  return adapter;
}
```

## 4. Setting Handle When Permission Granted

```tsx
// Component that handles FSA permission

import { useProjectContext } from '@/lib/workspace/ProjectContext';
import { restoreHandle } from '@/infrastructure/filesystem/handle-persistence';

function FSAHandleManager() {
  const { project, setFsaHandle } = useProjectContext();
  
  React.useEffect(() => {
    if (!project?.id) return;
    
    async function initFSA() {
      // Restore handle from persistence (may prompt user)
      const result = await restoreHandle(project.id);
      
      if (result.success && result.handle) {
        // FSA-007: Set handle in ProjectContext
        setFsaHandle(result.handle);
        console.log('[FSAHandleManager] Handle restored and set in context');
      }
    }
    
    initFSA();
  }, [project?.id, setFsaHandle]);
  
  return null; // Side-effect only component
}
```

## 5. Complete Route Example

```tsx
// src/routes/ide.$projectId.tsx

import { createFileRoute } from '@tanstack/react-router';
import { ProjectProvider, useProjectContext } from '@/lib/workspace/ProjectContext';
import { StorageAdapterFactory } from '@/infrastructure/filesystem/StorageAdapterFactory';

export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: IDEWorkspace,
});

function IDEWorkspace() {
  const { project } = Route.useLoaderData();
  
  return (
    <ProjectProvider project={project} workspace="ide">
      <IDEContent />
    </ProjectProvider>
  );
}

function IDEContent() {
  const { fsaHandle } = useProjectContext();
  const [adapter, setAdapter] = React.useState(null);
  
  React.useEffect(() => {
    // Create adapter with handle from context
    const storageAdapter = StorageAdapterFactory.createAdapter({
      projectId: project.id,
      handle: fsaHandle,  // May be null initially
    });
    
    setAdapter(storageAdapter);
  }, [fsaHandle]);
  
  // Use adapter for file operations...
}
```

## Test Scenario (As Per Requirements)

1. ✅ User creates FSA project
2. ✅ Grants "Allow on every visit" permission
3. ✅ Refreshes browser
4. ✅ Opens IDE route
5. ✅ Storage adapter uses handle from context WITHOUT error

## Key Changes Summary

| File | Change |
|------|--------|
| `src/lib/workspace/ProjectContext.tsx` | Added `fsaHandle` and `setFsaHandle` to interface and provider |
| `src/infrastructure/filesystem/storage-types.ts` | Added `handleGetter` type, made `handle` optional |
| `src/infrastructure/filesystem/StorageAdapterFactory.ts` | Updated `createFSAAdapter()` to handle null gracefully |

## Migration Guide

**Before (Broken):**
```tsx
// ❌ Required handle at creation time - impossible for fresh load
const adapter = StorageAdapterFactory.createAdapter({
  projectId,
  handle: userHandle, // User hasn't granted permission yet!
});
```

**After (Fixed):**
```tsx
// ✅ Handle retrieved from context when available
const adapter = StorageAdapterFactory.createAdapter({
  projectId,
  handle: fsaHandle, // May be null, handled gracefully
});
```

**Future (Optimal):**
```tsx
// ✅ Use handleGetter for lazy retrieval
const adapter = StorageAdapterFactory.createAdapter({
  projectId,
  handleGetter: () => fsaHandle, // Always fresh from context
});
```
