# Custom Hooks Documentation

## Overview

The Via-gent platform provides a collection of custom React hooks for responsive design, capability detection, workspace management, and cross-workspace event handling.

## File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `index.ts` | 23 | Central barrel exports |
| `useResponsive.ts` | 39 | Responsive breakpoint detection |
| `useCapabilityDetection.ts` | 34 | Browser capability detection |
| `useWorkspaceContext.ts` | - | Workspace context management |
| `use-cross-workspace-events.ts` | - | Cross-workspace event subscriptions |
| `useStoreHydration.ts` | - | Zustand store hydration |
| `useUnsavedWorkPreservation.ts` | - | Unsaved work detection |
| `useQuizSession.ts` | - | Quiz session state |
| `useQuizTimer.ts` | - | Quiz timer functionality |
| `useCanvasDrop.ts` | - | Canvas drag-and-drop |
| `useMediaQuery.ts` | - | Media query matching |
| `useProcessManager.ts` | - | Process management |
| `useAgents.ts` | - | Agents state |
| `useIdeStatePersistence.ts` | - | IDE state persistence |

## Core Hooks

### useResponsive

**Purpose:** Semantic responsive breakpoints detection

**File:** `src/hooks/useResponsive.ts`

```typescript
import { useDeviceType, useTouchDevice } from './useMediaQuery';
import { useState, useEffect } from 'react';

export interface ResponsiveState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouch: boolean;
    isReady: boolean;
}

export function useResponsive(): ResponsiveState
```

#### Breakpoints

| State | Condition |
|-------|-----------|
| `isMobile` | Viewport < 768px |
| `isTablet` | 768px ≤ Viewport < 1024px |
| `isDesktop` | Viewport ≥ 1024px |
| `isTouch` | Touch device detected |
| `isReady` | Hydration complete |

#### Usage Example

```typescript
import { useResponsive } from '@/hooks';

function ResponsiveComponent() {
    const { isMobile, isTablet, isDesktop, isTouch, isReady } = useResponsive();

    if (!isReady) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            {isMobile && <MobileLayout />}
            {isTablet && <TabletLayout />}
            {isDesktop && <DesktopLayout />}
            {isTouch && <TouchOptimizedUI />}
        </div>
    );
}
```

#### Related Hook: useMediaQuery

```typescript
function useMediaQuery(query: string): boolean;
function useDeviceType(): {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isPhonePortrait: boolean;
    isPhoneLandscape: boolean;
};
function useTouchDevice(): boolean;
```

### useCapabilityDetection

**Purpose:** Browser capability detection for WebContainer and File System Access API

**File:** `src/hooks/useCapabilityDetection.ts`

```typescript
export interface Capabilities {
    isMobile: boolean;
    canBootWebContainer: boolean;
    supportsFSA: boolean;
}

export function useCapabilityDetection(): Capabilities
```

#### Capabilities

| Capability | Detection Method |
|------------|------------------|
| `isMobile` | From useResponsive |
| `canBootWebContainer` | `SharedArrayBuffer` exists + `crossOriginIsolated` is true |
| `supportsFSA` | `'showDirectoryPicker' in window` |

#### Usage Example

```typescript
import { useCapabilityDetection } from '@/hooks';

function CapabilityAwareComponent() {
    const { isMobile, canBootWebContainer, supportsFSA } = useCapabilityDetection();

    if (isMobile) {
        return <MobileFallback />;
    }

    if (!canBootWebContainer) {
        return <WebContainerUnsupported />;
    }

    if (!supportsFSA) {
        return <FileSystemAccessRequired />;
    }

    return <FullFeatureComponent />;
}
```

### useWorkspaceContext

**Purpose:** Workspace context management for IDE, Knowledge, Notes, and Study workspaces

**File:** `src/hooks/useWorkspaceContext.ts`

```typescript
export function useWorkspaceContext(): WorkspaceContextType;
export function useCurrentWorkspace(): WorkspaceType;
export function useIsInWorkspace(workspace: WorkspaceType): boolean;
```

#### Workspace Types

```typescript
type WorkspaceType = 'ide' | 'knowledge' | 'notes' | 'study';

interface WorkspaceContextType {
    currentWorkspace: WorkspaceType;
    previousWorkspace: WorkspaceType | null;
    isTransitioning: boolean;
    transitionTo: (workspace: WorkspaceType) => void;
    workspaceMetadata: WorkspaceMetadata;
}

interface WorkspaceMetadata {
    name: string;
    icon: string;
    description: string;
}
```

#### Usage Example

```typescript
import { useWorkspaceContext, useCurrentWorkspace, useIsInWorkspace } from '@/hooks';

function WorkspaceAwareComponent() {
    const { currentWorkspace, transitionTo, isTransitioning } = useWorkspaceContext();
    const isInKnowledge = useIsInWorkspace('knowledge');

    return (
        <div>
            <p>Current: {currentWorkspace}</p>
            {isInKnowledge && <KnowledgeWorkspaceFeatures />}
            <button 
                disabled={isTransitioning}
                onClick={() => transitionTo('ide')}
            >
                Switch to IDE
            </button>
        </div>
    );
}
```

### use-cross-workspace-events

**Purpose:** Cross-workspace event subscriptions for RAG operations

**File:** `src/hooks/use-cross-workspace-events.ts`

```typescript
export function useRAGEmbeddingProgress(): {
    progress: number;
    current: number;
    total: number;
    isEmbedding: boolean;
};

export function useRAGChunkingStatus(): {
    status: 'idle' | 'chunking' | 'complete' | 'error';
    chunks: number;
    totalChunks: number;
};

export function useRAGDatabaseIndexing(): {
    isIndexing: boolean;
    indexedCount: number;
    totalCount: number;
};

export function useRAGSourceProcessing(): {
    isProcessing: boolean;
    currentSource: string | null;
    progress: number;
};

export function useCrossWorkspaceEvent<T = unknown>(
    eventType: string,
    callback: (data: T) => void
): void;
```

#### Usage Example

```typescript
import { 
    useRAGEmbeddingProgress,
    useRAGChunkingStatus,
    useCrossWorkspaceEvent 
} from '@/hooks';

function RAGProgressDisplay() {
    const { progress, current, total, isEmbedding } = useRAGEmbeddingProgress();
    const { status, chunks, totalChunks } = useRAGChunkingStatus();

    useCrossWorkspaceEvent('source:imported', (data) => {
        console.log('New source imported:', data);
    });

    return (
        <ProgressBar 
            progress={progress}
            label={`Embedding ${current}/${total}`}
        />
    );
}
```

## Supporting Hooks

### useStoreHydration

**Purpose:** Track Zustand store hydration state

```typescript
export function useStoreHydration(): {
    isHydrated: boolean;
    hydrationTime: number | null;
};
```

### useUnsavedWorkPreservation

**Purpose:** Detect and warn about unsaved changes

```typescript
export function useUnsavedWorkPreservation(): {
    hasUnsavedChanges: boolean;
    markDirty: () => void;
    markClean: () => void;
    confirmNavigation: () => boolean;
};
```

### useQuizSession

**Purpose:** Manage quiz session state

```typescript
export function useQuizSession(quizId: string): {
    session: QuizSession | null;
    isLoading: boolean;
    startSession: () => Promise<void>;
    submitAnswer: (answerId: string) => Promise<void>;
    endSession: () => Promise<void>;
};
```

### useQuizTimer

**Purpose:** Quiz countdown timer

```typescript
export function useQuizTimer(
    durationMinutes: number,
    onComplete: () => void
): {
    remainingSeconds: number;
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
};
```

### useCanvasDrop

**Purpose:** Handle drag-and-drop on canvas

```typescript
export function useCanvasDrop(
    onDrop: (items: DroppedItem[]) => void
): {
    isDragging: boolean;
    dropZoneRef: RefObject<HTMLDivElement>;
    getDroppedItems: () => DroppedItem[];
};
```

### useMediaQuery

**Purpose:** Match CSS media queries

```typescript
export function useMediaQuery(query: string): boolean;
```

### useProcessManager

**Purpose:** Manage background processes

```typescript
export function useProcessManager(): {
    processes: Process[];
    startProcess: (config: ProcessConfig) => Promise<Process>;
    stopProcess: (processId: string) => Promise<void>;
    getProcess: (processId: string) => Process | undefined;
};
```

### useAgents

**Purpose:** Manage AI agents state

```typescript
export function useAgents(): {
    agents: Agent[];
    activeAgent: Agent | null;
    selectAgent: (agentId: string) => void;
    createAgent: (config: AgentConfig) => Promise<Agent>;
    updateAgent: (agentId: string, updates: Partial<Agent>) => Promise<void>;
    deleteAgent: (agentId: string) => Promise<void>;
};
```

### useIdeStatePersistence

**Purpose:** Persist IDE state

```typescript
export function useIdeStatePersistence(): {
    savedState: IdeState | null;
    saveState: (state: IdeState) => Promise<void>;
    loadState: () => Promise<IdeState | null>;
    clearState: () => Promise<void>;
};
```

## Index Exports

All hooks are exported from the central barrel file:

```typescript
// src/hooks/index.ts

// Workspace hooks
export {
    useWorkspaceContext,
    useCurrentWorkspace,
    useIsInWorkspace,
} from './useWorkspaceContext';

// Cross-workspace events hooks
export {
    useRAGEmbeddingProgress,
    useRAGChunkingStatus,
    useRAGDatabaseIndexing,
    useRAGSourceProcessing,
    useCrossWorkspaceEvent,
} from './use-cross-workspace-events';
```

## Usage Patterns

### Responsive Design Pattern

```typescript
// Create responsive components
function ResponsiveLayout() {
    const { isMobile, isTablet, isDesktop } = useResponsive();

    if (isMobile) {
        return <MobileLayout />;
    }
    if (isTablet) {
        return <TabletLayout />;
    }
    return <DesktopLayout />;
}
```

### Capability Detection Pattern

```typescript
// Graceful degradation based on capabilities
function FeatureComponent() {
    const capabilities = useCapabilityDetection();

    if (!capabilities.canBootWebContainer) {
        return <WebContainerRequired />;
    }

    return <FullFeatureComponent />;
}
```

### Event Subscription Pattern

```typescript
// Subscribe to cross-workspace events
function EventListener() {
    useCrossWorkspaceEvent('workspace:changed', (data) => {
        console.log('Workspace changed:', data);
    });

    return null;
}
```

## Testing

### useResponsive Tests

```typescript
// __tests__/useResponsive.test.ts
import { renderHook } from '@testing-library/react';
import { useResponsive } from '../useResponsive';

describe('useResponsive', () => {
    it('returns isReady as false initially', () => {
        const { result } = renderHook(() => useResponsive());
        expect(result.current.isReady).toBe(false);
    });

    it('detects mobile viewport', () => {
        // Mock window.matchMedia
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === '(max-width: 767px)',
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
        }));

        const { result } = renderHook(() => useResponsive());
        expect(result.current.isMobile).toBe(true);
    });
});
```

## Known Issues and Limitations

1. **useResponsive**: Requires client-side rendering; SSR returns `isReady: false`
2. **useCapabilityDetection**: Some capabilities may not be detectable in all browsers
3. **useMediaQuery**: May cause re-renders on window resize
4. **Cross-workspace events**: Events are tied to EventEmitter3 implementation

## Developer Notes

1. All hooks follow React best practices (rules of hooks)
2. Hooks are properly typed with TypeScript
3. Return objects are stable (no unnecessary re-renders)
4. Cleanup functions are implemented where needed
5. Tests are co-located in `__tests__/` directories
