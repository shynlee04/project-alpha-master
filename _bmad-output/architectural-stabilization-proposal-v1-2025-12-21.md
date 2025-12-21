# 🏗️ Architectural Stabilization Proposal v1

**Date:** 2025-12-21  
**Version:** Final  
**Status:** CRITICAL - Blocks All Further Development

---

## Executive Summary

After 3 sprint change proposals (v5, v6, v7) that each addressed symptoms rather than root causes, we've identified the **true architectural problems** causing the recurring regressions.

> **"We're patching tiny holes in a broken roof."** - Admin

The tech debt report (2025-12-21) correctly predicted these issues would manifest.

---

## 🔴 Root Cause Analysis

### The 5 Regressions Have 3 Root Causes

| Regression | Symptom | Root Cause |
|------------|---------|------------|
| BUG-10: Persistence broken | Sync state not persisting | **State Fragmentation** |
| BUG-11: Context menu missing | Right-click not working | **CSS z-index + TailwindCSS 4.x** |
| BUG-12: Terminal pnpm version | ERR_PNPM_UNSUPPORTED_ENGINE | **WebContainer version mismatch** |
| BUG-13: "Something went wrong" | Production crash | **SSR Entry + Error propagation** |
| BUG-14: FileTree collapse | Tree resets on edit | **Event Bus not used + State Fragmentation** |

### Root Cause #1: State Management Fragmentation (Tech Debt #5)

**Current State (3 competing systems):**
```
┌────────────────────────────────────────┐
│ 1. TanStack Store (project metadata)    │ ← Some data here
├────────────────────────────────────────┤
│ 2. React Context (WorkspaceContext)     │ ← Duplicate data here
├────────────────────────────────────────┤
│ 3. IndexedDB direct (persistence layer) │ ← Read on load, not synced
└────────────────────────────────────────┘
```

**The Problem:**
- `useIdeStatePersistence` reads from IndexedDB but doesn't update TanStack Store
- React Context updates don't trigger persistence
- State can get out of sync across all 3 systems
- File edits trigger context updates but not persistence

**Evidence from tech debt report:**
> "Same data (e.g., 'open files') lives in multiple places. Potential for state desync bugs."

### Root Cause #2: Event Bus Underutilization (Tech Debt #4)

**Current:**
- Event Bus infrastructure exists (`eventemitter3`)
- But FileTree, Monaco, Terminal **don't use it**
- Components rely on direct prop drilling and context

**Evidence:**
> "Event Bus infrastructure exists but IDE components don't use it."

**Impact:**
- When AI/sync writes files, FileTree doesn't know
- When files change externally, Monaco tabs go stale
- No coordination mechanism between components

### Root Cause #3: Missing Abstraction Layers (Tech Debt #6)

**Current:**
- Components directly use browser APIs
- No interfaces for testing
- No middleware for state persistence
- CSS changes in TailwindCSS 4.x affect z-index stacking

---

## 🎯 The Solution: Architectural Stabilization Epic

### NOT Another Patch - A Foundation Fix

Instead of Epic 27 with 5 more stories, we need:

## Epic 27: State Architecture Stabilization

**Goal:** Unify state management, implement Event Bus across components, fix CSS baseline

**Duration:** 1-2 weeks (blocks all other work)  
**Priority:** P0-CRITICAL

### 📦 Phase A: State Unification (3-5 days)

#### Story 27-1: Migrate to Zustand + Dexie

**Changes:**
1. Replace TanStack Store with Zustand
2. Replace `idb` with Dexie.js
3. Implement persist middleware connecting Zustand → Dexie

```typescript
// NEW: src/lib/state/ide-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DexieStorage } from './dexie-storage';

interface IDEState {
  // Unified state
  openFiles: string[];
  activeFile: string | null;
  expandedPaths: Set<string>;
  panelLayouts: Record<string, number[]>;
  
  // Actions
  addOpenFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  toggleExpanded: (path: string) => void;
  setPanelLayout: (groupId: string, layout: number[]) => void;
}

export const useIDEStore = create<IDEState>()(
  persist(
    (set, get) => ({
      openFiles: [],
      activeFile: null,
      expandedPaths: new Set(),
      panelLayouts: {},
      
      addOpenFile: (path) => set((state) => ({
        openFiles: [...new Set([...state.openFiles, path])]
      })),
      
      setActiveFile: (path) => set({ activeFile: path }),
      
      toggleExpanded: (path) => set((state) => {
        const next = new Set(state.expandedPaths);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return { expandedPaths: next };
      }),
      
      setPanelLayout: (groupId, layout) => set((state) => ({
        panelLayouts: { ...state.panelLayouts, [groupId]: layout }
      })),
    }),
    {
      name: 'ide-state',
      storage: createJSONStorage(() => new DexieStorage()),
      partialize: (state) => ({
        openFiles: state.openFiles,
        activeFile: state.activeFile,
        expandedPaths: Array.from(state.expandedPaths),
        panelLayouts: state.panelLayouts,
      }),
    }
  )
);
```

#### Story 27-2: Event Bus Integration

**Changes:**
1. Create typed event schemas
2. FileTree subscribes to `file:*` events
3. SyncManager publishes events instead of direct mutations
4. Monaco subscribes to external file changes

```typescript
// NEW: src/lib/events/event-schemas.ts
export const EventTypes = {
  FILE_CREATED: 'file:created',
  FILE_UPDATED: 'file:updated', 
  FILE_DELETED: 'file:deleted',
  TREE_REFRESH: 'tree:refresh',
  SYNC_COMPLETE: 'sync:complete',
} as const;

// FileTree subscribes:
useEffect(() => {
  const unsub = eventBus.on(EventTypes.FILE_UPDATED, (data) => {
    // Refresh only affected node, not whole tree
    refreshNode(data.path);
  });
  return unsub;
}, [eventBus]);
```

### 📦 Phase B: CSS Stabilization (1 day)

#### Story 27-3: Fix TailwindCSS 4.x Z-Index + Context Menu

**Changes:**
1. Add z-index tokens to CSS variables
2. Ensure ContextMenu has `z-50` or higher
3. Verify portal rendering for overlays

```css
/* src/index.css */
:root {
  --z-dropdown: 50;
  --z-modal: 100;
  --z-toast: 200;
}

.context-menu {
  z-index: var(--z-dropdown);
  position: fixed;
}
```

### 📦 Phase C: Terminal + WebContainer Fix (1 day)

#### Story 27-4: Fix Terminal pnpm Version

**Changes:**
1. Add engines field to package.json
2. Update WebContainer boot to handle version mismatch gracefully
3. Show user-friendly error instead of crash

```json
// package.json
{
  "engines": {
    "node": ">=18",
    "pnpm": "^8.15.0 || ^9 || ^10"
  }
}
```

```typescript
// src/lib/webcontainer/manager.ts
async function boot() {
  // After boot, check pnpm version
  const { output } = await spawn('pnpm', ['-v']);
  if (!isCompatiblePnpm(output)) {
    eventBus.emit('terminal:warning', {
      message: 'pnpm version mismatch, installing compatible version...'
    });
    await spawn('npm', ['i', '-g', 'pnpm@latest']);
  }
}
```

### 📦 Phase D: SSR Entry Fix (1 day)

#### Story 27-5: Fix Production SSR Error

**Changes:**
1. Add error handling to `src/server.ts`
2. Ensure response is properly cloned
3. Add fallback for non-HTML responses

```typescript
// src/server.ts
export default createServerEntry({
    async fetch(request) {
        try {
            const response = await handler.fetch(request);
            
            // Don't modify non-HTML responses
            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('text/html')) {
                return response;
            }
            
            const headers = new Headers(response.headers);
            headers.set('Cross-Origin-Opener-Policy', 'same-origin');
            headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
            
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers,
            });
        } catch (error) {
            console.error('[Server Entry Error]', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    },
});
```

---

## 🗓️ Implementation Order

```
Week 1: State Stabilization (BLOCKS ALL)
├── Day 1-2: Story 27-1 (Zustand + Dexie migration)
├── Day 3-4: Story 27-2 (Event Bus integration)
├── Day 5: Story 27-3 (CSS z-index fix)

Week 2: Terminal + Production (PARALLEL)
├── Story 27-4 (Terminal pnpm fix) - Platform A
├── Story 27-5 (SSR entry fix) - Platform B
└── Verification & Testing
```

---

## 🚫 What We're NOT Doing

1. **NOT** creating Epic 27 with 5 separate bug stories
2. **NOT** continuing Epic 23 (UX/UI) until state is stable
3. **NOT** adding new features until foundation is solid

---

## 📋 Definition of Done

- [ ] `useIDEStore` replaces all TanStack Store + Context usage
- [ ] Dexie.js replaces `idb` for persistence
- [ ] FileTree uses Event Bus, doesn't collapse on edit
- [ ] Context menu works (z-index fixed)
- [ ] Terminal handles pnpm version gracefully
- [ ] Production site loads without error
- [ ] State persists across page reload (verified in both local + Cloudflare)

---

## 📎 Related Documents

- [Tech Debt Report](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/analysis/tech-debt-architecture-gaps-report-2025-12-21.md)
- [Stack Enhancement](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/analysis/stack-enhancement-report-2025-12-21.md)
- [Sprint Change v5](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/sprint-change-proposal-v5-2025-12-20.md)
- [Sprint Change v6](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/sprint-change-proposal-v6-2025-12-20.md)
- [Sprint Change v7](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/sprint-change-proposal-v7-2025-12-21.md)
