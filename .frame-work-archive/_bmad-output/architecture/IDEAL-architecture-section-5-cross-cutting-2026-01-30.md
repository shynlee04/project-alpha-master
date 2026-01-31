---
document_id: IDEAL-ARCH-005
title: "IDEAL Architecture - Section 5: Cross-Cutting Concerns"
version: "1.0.0"
status: "HYPOTHESIS - PENDING VALIDATION"
created: "2026-01-30T23:59:00+07:00"
author: "architect-ext"
parent_session: "ses_3f3a97f58ffeAQG0ztux1SZMCR"
synthesis_sources:
  - "IDEAL-architecture-section-1-state-management-2026-01-30.md"
  - "IDEAL-architecture-section-2-plugin-coordination-2026-01-30.md"
  - "IDEAL-architecture-section-3-storage-2026-01-30.md"
  - "IDEAL-architecture-section-4-agent-tools-2026-01-30.md"
  - "AGENTS.md v3.0.0"
  - "Project Alpha UX Specification"
validation_status: "NOT VALIDATED"
---

# IDEAL Architecture - Section 5: Cross-Cutting Concerns

> **HYPOTHESIS DOCUMENT**: This represents the TARGET state for Project Alpha's cross-cutting concerns. All patterns here are prescriptive and opinionated. Validation required before implementation.

---

## 1. Device-Type Capability Matrix

### 1.1 Device Classification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEVICE CLASSIFICATION TREE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [User Agent + Screen + API Detection]                                       │
│         │                                                                    │
│         ├──▶ Desktop (≥1024px + FSA + Keyboard)                             │
│         │         │                                                          │
│         │         ├──▶ Chrome/Edge 122+  → TIER A: Full Features            │
│         │         │                                                          │
│         │         └──▶ Safari/Firefox    → TIER B: FSA Fallback             │
│         │                                                                    │
│         ├──▶ Tablet (768px-1023px + Touch)                                   │
│         │         │                                                          │
│         │         ├──▶ iPadOS PWA        → TIER C: Touch-Optimized          │
│         │         │                                                          │
│         │         └──▶ Android Tablet    → TIER C: Touch-Optimized          │
│         │                                                                    │
│         └──▶ Mobile (<768px + Touch)                                        │
│                   │                                                          │
│                   ├──▶ iOS Safari PWA    → TIER D: Mobile-First             │
│                   │                                                          │
│                   └──▶ Android Chrome    → TIER D: Mobile-First             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Plugin Availability Matrix

| Plugin | Tier A (Desktop Chrome) | Tier B (Desktop Other) | Tier C (Tablet) | Tier D (Mobile) |
|--------|-------------------------|------------------------|-----------------|-----------------|
| **project-management** | ✅ Full | ✅ Full | ✅ Full | ✅ Simplified |
| **chat-cascade** | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **monaco-editor** | ✅ Full | ✅ Full | ⚠️ Limited | ❌ Disabled |
| **notes** | ✅ Full | ✅ Full | ✅ Full | ✅ Mobile-Optimized |
| **terminal** | ✅ Full | ✅ Full | ⚠️ Read-Only | ❌ Disabled |
| **preview** | ✅ Full | ✅ Full | ✅ Full | ⚠️ Limited |
| **knowledge** | ✅ Full | ✅ Full | ✅ Full | ⚠️ Search-Only |

### 1.3 Capability Detection Implementation

```typescript
// ============================================================================
// @/infrastructure/platform/device-capabilities.ts
// ============================================================================

/**
 * Device Tier Classification
 */
export type DeviceTier = 'A' | 'B' | 'C' | 'D';

/**
 * Platform Capabilities
 */
export interface DeviceCapabilities {
  tier: DeviceTier;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  hasTouch: boolean;
  hasKeyboard: boolean;
  hasMouse: boolean;
  screenWidth: number;
  screenHeight: number;
  isChrome: boolean;
  chromeVersion: number;
  isFSASupported: boolean;
  isOPFSSupported: boolean;
  isFileSystemObserverSupported: boolean;
  isPWA: boolean;
  isSafari: boolean;
  maxPlugins: number;
  pluginAvailability: Record<PluginId, PluginAvailability>;
}

export type PluginAvailability = 'full' | 'limited' | 'disabled';

/**
 * Detect device capabilities
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const ua = navigator.userAgent;
  const screenWidth = window.innerWidth;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasMouse = matchMedia('(hover: hover)').matches;
  const hasKeyboard = !hasTouch || hasMouse;
  
  // Browser detection
  const isChrome = /Chrome/.test(ua) && !/Edg/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const chromeVersion = parseInt(ua.match(/Chrome\/(\d+)/)?.[1] || '0');
  
  // API detection
  const isFSASupported = 'showDirectoryPicker' in window;
  const isOPFSSupported = 'storage' in navigator && 'getDirectory' in navigator.storage;
  const isFileSystemObserverSupported = 'FileSystemObserver' in window;
  const isPWA = matchMedia('(display-mode: standalone)').matches;
  
  // Device type classification
  let deviceType: 'desktop' | 'tablet' | 'mobile';
  let tier: DeviceTier;
  
  if (screenWidth >= 1024 && hasKeyboard) {
    deviceType = 'desktop';
    tier = isChrome && chromeVersion >= 122 ? 'A' : 'B';
  } else if (screenWidth >= 768) {
    deviceType = 'tablet';
    tier = 'C';
  } else {
    deviceType = 'mobile';
    tier = 'D';
  }
  
  // Plugin availability based on tier
  const pluginAvailability = determinePluginAvailability(tier, deviceType);
  
  return {
    tier,
    deviceType,
    hasTouch,
    hasKeyboard,
    hasMouse,
    screenWidth,
    screenHeight: window.innerHeight,
    isChrome,
    chromeVersion,
    isFSASupported,
    isOPFSSupported,
    isFileSystemObserverSupported,
    isPWA,
    isSafari,
    maxPlugins: tier === 'D' ? 3 : 7,
    pluginAvailability,
  };
}

function determinePluginAvailability(
  tier: DeviceTier,
  deviceType: 'desktop' | 'tablet' | 'mobile'
): Record<PluginId, PluginAvailability> {
  const matrix: Record<DeviceTier, Record<PluginId, PluginAvailability>> = {
    'A': {
      'project-management': 'full',
      'chat-cascade': 'full',
      'monaco-editor': 'full',
      'notes': 'full',
      'terminal': 'full',
      'preview': 'full',
      'knowledge': 'full',
    },
    'B': {
      'project-management': 'full',
      'chat-cascade': 'full',
      'monaco-editor': 'full',
      'notes': 'full',
      'terminal': 'full',
      'preview': 'full',
      'knowledge': 'full',
    },
    'C': {
      'project-management': 'full',
      'chat-cascade': 'full',
      'monaco-editor': 'limited', // Touch keyboard issues
      'notes': 'full',
      'terminal': 'limited', // Read-only, no input
      'preview': 'full',
      'knowledge': 'full',
    },
    'D': {
      'project-management': 'limited', // Simplified file tree
      'chat-cascade': 'full',
      'monaco-editor': 'disabled', // Not usable on mobile
      'notes': 'full', // Mobile-optimized
      'terminal': 'disabled',
      'preview': 'limited', // Fixed viewport
      'knowledge': 'limited', // Search-only, no full UI
    },
  };
  
  return matrix[tier];
}
```

---

## 2. Graceful Degradation Patterns

### 2.1 Degradation Strategy Tree

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GRACEFUL DEGRADATION STRATEGY                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Feature Request]                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────┐                                                    │
│  │ Check Availability  │                                                    │
│  └─────────┬───────────┘                                                    │
│            │                                                                 │
│     ┌──────┴──────┐                                                         │
│     │             │                                                          │
│     ▼             ▼                                                          │
│  AVAILABLE     UNAVAILABLE                                                   │
│     │             │                                                          │
│     ▼             ▼                                                          │
│  Execute      ┌────────────────────────┐                                    │
│  Normally     │ Select Fallback:       │                                    │
│               │ 1. Alternative Plugin  │                                    │
│               │ 2. Reduced Capability  │                                    │
│               │ 3. Deferred Queue      │                                    │
│               │ 4. User Notification   │                                    │
│               └────────────────────────┘                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Fallback Definitions

```typescript
// ============================================================================
// @/infrastructure/plugins/fallback-registry.ts
// ============================================================================

/**
 * Fallback Configuration
 */
interface FallbackConfig {
  /** Alternative plugin that can handle the capability */
  alternativePlugin?: PluginId;
  
  /** Reduced capability mode */
  reducedMode?: {
    description: string;
    limitations: string[];
  };
  
  /** Queue action for later execution */
  canDefer: boolean;
  
  /** User-facing message when unavailable */
  userMessage: string;
  
  /** Action to take when unavailable */
  action: 'alternative' | 'reduced' | 'defer' | 'block';
}

/**
 * Fallback Registry
 * 
 * Defines what happens when a plugin/capability is unavailable.
 */
export const FALLBACK_REGISTRY: Record<PluginId, FallbackConfig> = {
  'monaco-editor': {
    alternativePlugin: 'notes',
    reducedMode: {
      description: 'Basic text editing mode',
      limitations: [
        'No syntax highlighting',
        'No LSP support',
        'No code folding',
        'No multi-cursor',
      ],
    },
    canDefer: false,
    userMessage: 'Code editor is not available on this device. Using basic text editing.',
    action: 'alternative',
  },
  
  'terminal': {
    reducedMode: {
      description: 'Output-only terminal mode',
      limitations: [
        'No command input',
        'View-only logs',
        'No shell interaction',
      ],
    },
    canDefer: true,
    userMessage: 'Terminal is in view-only mode on this device.',
    action: 'reduced',
  },
  
  'preview': {
    reducedMode: {
      description: 'Fixed viewport preview',
      limitations: [
        'No responsive testing',
        'Fixed device width',
        'No DevTools integration',
      ],
    },
    canDefer: false,
    userMessage: 'Preview is available in simplified mode.',
    action: 'reduced',
  },
  
  'knowledge': {
    reducedMode: {
      description: 'Search-only mode',
      limitations: [
        'No document indexing',
        'Search only',
        'No RAG context injection',
      ],
    },
    canDefer: true,
    userMessage: 'Knowledge base is in search-only mode on mobile.',
    action: 'reduced',
  },
  
  'notes': {
    canDefer: false,
    userMessage: 'Notes plugin is always available.',
    action: 'reduced',
  },
  
  'project-management': {
    reducedMode: {
      description: 'Simplified file tree',
      limitations: [
        'Flat list view only',
        'No drag-drop',
        'Limited multi-select',
      ],
    },
    canDefer: false,
    userMessage: 'File manager is in simplified mode.',
    action: 'reduced',
  },
  
  'chat-cascade': {
    canDefer: false,
    userMessage: 'Chat is always available.',
    action: 'reduced',
  },
};
```

### 2.3 Fallback Executor

```typescript
// ============================================================================
// @/infrastructure/plugins/fallback-executor.ts
// ============================================================================

/**
 * Fallback Executor
 * 
 * Handles capability requests when primary plugin is unavailable.
 */
export class FallbackExecutor {
  constructor(
    private readonly pluginRegistry: PluginRegistry,
    private readonly deferredQueue: DeferredCapabilityQueue,
    private readonly eventBus: PluginEventBus
  ) {}

  /**
   * Handle a capability request with fallback
   */
  async handleCapabilityRequest(
    capability: PluginCapability,
    preferredPlugin: PluginId,
    action: { type: string; payload: unknown }
  ): Promise<FallbackResult> {
    // Check if preferred plugin is available
    if (this.pluginRegistry.isEnabled(preferredPlugin)) {
      return { status: 'primary', plugin: preferredPlugin };
    }
    
    const fallback = FALLBACK_REGISTRY[preferredPlugin];
    
    switch (fallback.action) {
      case 'alternative':
        if (fallback.alternativePlugin && this.pluginRegistry.isEnabled(fallback.alternativePlugin)) {
          this.notifyUser(fallback.userMessage, 'info');
          return { status: 'alternative', plugin: fallback.alternativePlugin };
        }
        // Fall through to reduced mode
        
      case 'reduced':
        this.notifyUser(fallback.userMessage, 'warning');
        return {
          status: 'reduced',
          plugin: preferredPlugin,
          limitations: fallback.reducedMode?.limitations || [],
        };
        
      case 'defer':
        if (fallback.canDefer) {
          const actionId = this.deferredQueue.enqueue(capability, action, {
            pluginId: preferredPlugin,
            priority: 'normal',
          });
          this.notifyUser(`Action queued. Will execute when ${preferredPlugin} is enabled.`, 'info');
          return { status: 'deferred', actionId };
        }
        // Fall through to block
        
      case 'block':
      default:
        this.notifyUser(fallback.userMessage, 'error');
        return { status: 'blocked', reason: fallback.userMessage };
    }
  }

  private notifyUser(message: string, level: 'info' | 'warning' | 'error'): void {
    this.eventBus.emit('notification:show', {
      message,
      level,
      duration: 5000,
    });
  }
}

type FallbackResult =
  | { status: 'primary'; plugin: PluginId }
  | { status: 'alternative'; plugin: PluginId }
  | { status: 'reduced'; plugin: PluginId; limitations: string[] }
  | { status: 'deferred'; actionId: string }
  | { status: 'blocked'; reason: string };
```

---

## 3. State Preservation Across Toggle

### 3.1 Toggle Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PLUGIN TOGGLE LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    DISABLE FLOW                                          ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                                                                          ││
│  │  [User clicks Disable]                                                   ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [1] Check dependents (block if others depend on this)                   ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [2] Emit 'plugin:disabling' event                                       ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [3] Call plugin.onDisable(context)                                      ││
│  │         │                                                                ││
│  │         ├──▶ Plugin saves: cursor positions, scroll states, open tabs    ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [4] Receive PluginStateSnapshot                                         ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [5] Persist snapshot to Dexie (pluginSnapshots table)                   ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [6] Release plugin resources (DOM, event listeners, timers)             ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [7] Update registry: enabledState[pluginId] = false                     ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [8] Emit 'plugin:disabled' event                                        ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    ENABLE FLOW                                           ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                                                                          ││
│  │  [User clicks Enable]                                                    ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [1] Check dependencies (enable required plugins first)                  ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [2] Emit 'plugin:enabling' event                                        ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [3] Load snapshot from Dexie                                            ││
│  │         │                                                                ││
│  │         ├──▶ Has snapshot?                                               ││
│  │         │         │                                                      ││
│  │         │    YES  │  NO                                                  ││
│  │         │    ▼    ▼                                                      ││
│  │  [4] Call plugin.onRestore(snapshot)  OR  plugin.onEnable(context)       ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [5] Plugin restores: cursor positions, scroll states, open tabs         ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [6] Register capabilities in PluginRegistry                             ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [7] Process deferred queue for this plugin's capabilities               ││
│  │         │                                                                ││
│  │         ▼                                                                ││
│  │  [8] Emit 'plugin:enabled' event                                         ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Snapshot Persistence Service

```typescript
// ============================================================================
// @/infrastructure/plugins/snapshot-persistence.ts
// ============================================================================

import { db } from '@/infrastructure/persistence/dexie-schema';
import type { PluginStateSnapshot, PluginId } from '@/domain/interfaces/plugin.interface';

/**
 * Snapshot Persistence Service
 * 
 * Persists plugin state snapshots for restoration after toggle.
 */
export class SnapshotPersistenceService {
  /**
   * Save a plugin's state snapshot
   */
  async saveSnapshot(snapshot: PluginStateSnapshot): Promise<void> {
    await db.pluginSnapshots.put({
      pluginId: snapshot.pluginId,
      version: snapshot.version,
      savedAt: snapshot.savedAt,
      data: JSON.stringify(snapshot.data),
      projectId: this.getCurrentProjectId(),
    });
  }

  /**
   * Load a plugin's state snapshot
   */
  async loadSnapshot(pluginId: PluginId): Promise<PluginStateSnapshot | null> {
    const projectId = this.getCurrentProjectId();
    const record = await db.pluginSnapshots
      .where({ pluginId, projectId })
      .first();
    
    if (!record) return null;
    
    return {
      pluginId: record.pluginId,
      version: record.version,
      savedAt: record.savedAt,
      data: JSON.parse(record.data),
    };
  }

  /**
   * Clear a plugin's snapshot
   */
  async clearSnapshot(pluginId: PluginId): Promise<void> {
    const projectId = this.getCurrentProjectId();
    await db.pluginSnapshots
      .where({ pluginId, projectId })
      .delete();
  }

  /**
   * Clear all snapshots for a project (e.g., on project delete)
   */
  async clearProjectSnapshots(projectId: string): Promise<void> {
    await db.pluginSnapshots
      .where({ projectId })
      .delete();
  }

  private getCurrentProjectId(): string {
    return useSessionContextStore.getState().currentProjectId ?? 'default';
  }
}
```

---

## 4. Conflict Resolution

### 4.1 Conflict Types

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CONFLICT TYPE CLASSIFICATION                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TYPE A: Human vs Agent (Same File)                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Scenario: User editing in Monaco while Agent writes via tool            ││
│  │ Detection: WriteLockManager detects concurrent access                   ││
│  │ Resolution: HUMAN WINS (Agent action deferred or blocked)               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  TYPE B: External Editor vs App (FSA Sync)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Scenario: User edits in VS Code while file open in Project Alpha        ││
│  │ Detection: FileSystemObserver / polling detects mtime change            ││
│  │ Resolution: MERGE or PROMPT (show diff, let user choose)                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  TYPE C: Agent vs Agent (Parallel Tasks)                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Scenario: Two delegated agents try to edit same file                    ││
│  │ Detection: WriteLockManager blocks second agent                         ││
│  │ Resolution: SEQUENTIAL (second agent waits for lock release)            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  TYPE D: Multi-Plugin (Monaco + Notes on same .md)                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Scenario: Same markdown file open in Monaco (code) and Notes (rich)     ││
│  │ Detection: EditorMirroringCoordination tracks shared edits              ││
│  │ Resolution: SYNC (changes propagate between plugins)                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Conflict Resolution Service

```typescript
// ============================================================================
// @/infrastructure/sync/conflict-resolver.ts
// ============================================================================

/**
 * Conflict Type
 */
export type ConflictType = 
  | 'human-vs-agent'
  | 'external-vs-app'
  | 'agent-vs-agent'
  | 'multi-plugin';

/**
 * Conflict Resolution Strategy
 */
export type ResolutionStrategy =
  | 'local-wins'      // Keep local version
  | 'remote-wins'     // Accept external version
  | 'merge'           // Attempt automatic merge
  | 'prompt'          // Ask user to resolve
  | 'defer'           // Queue for later
  | 'sequential';     // Wait for lock

/**
 * Conflict Record
 */
export interface ConflictRecord {
  id: string;
  type: ConflictType;
  filePath: string;
  localVersion: { content: string; mtime: number; author: string };
  remoteVersion: { content: string; mtime: number; author: string };
  detectedAt: number;
  resolvedAt?: number;
  resolution?: ResolutionStrategy;
}

/**
 * Conflict Resolver Service
 */
export class ConflictResolverService {
  constructor(
    private readonly eventBus: PluginEventBus,
    private readonly writeLocks: WriteLockManager
  ) {}

  /**
   * Detect and classify conflict type
   */
  classifyConflict(
    filePath: string,
    localAuthor: string,
    remoteAuthor: string
  ): ConflictType {
    const isLocalHuman = localAuthor === 'user';
    const isRemoteHuman = remoteAuthor === 'user';
    const isLocalAgent = localAuthor.startsWith('agent:');
    const isRemoteAgent = remoteAuthor.startsWith('agent:');
    const isRemoteExternal = remoteAuthor === 'external';
    
    if (isLocalHuman && isRemoteAgent) return 'human-vs-agent';
    if (isLocalHuman && isRemoteExternal) return 'external-vs-app';
    if (isLocalAgent && isRemoteAgent) return 'agent-vs-agent';
    
    return 'multi-plugin';
  }

  /**
   * Get recommended resolution strategy
   */
  getRecommendedStrategy(type: ConflictType): ResolutionStrategy {
    const strategies: Record<ConflictType, ResolutionStrategy> = {
      'human-vs-agent': 'local-wins', // Human always wins
      'external-vs-app': 'prompt',    // Let user decide
      'agent-vs-agent': 'sequential', // Wait for lock
      'multi-plugin': 'merge',        // Try to sync
    };
    return strategies[type];
  }

  /**
   * Resolve a conflict
   */
  async resolve(
    conflict: ConflictRecord,
    strategy: ResolutionStrategy
  ): Promise<string> {
    switch (strategy) {
      case 'local-wins':
        return conflict.localVersion.content;
        
      case 'remote-wins':
        return conflict.remoteVersion.content;
        
      case 'merge':
        return await this.attemptMerge(conflict);
        
      case 'prompt':
        // Emit event for UI to show conflict resolution dialog
        this.eventBus.emit('conflict:detected', {
          conflictId: conflict.id,
          filePath: conflict.filePath,
          type: conflict.type,
        });
        throw new Error('Awaiting user resolution');
        
      case 'defer':
        // Queue for later
        throw new Error('Conflict deferred');
        
      case 'sequential':
        // Wait for lock then retry
        throw new Error('Awaiting lock release');
        
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  /**
   * Attempt 3-way merge
   */
  private async attemptMerge(conflict: ConflictRecord): Promise<string> {
    // Use diff-match-patch or similar for merging
    const dmp = new DiffMatchPatch();
    
    // Simple text merge
    const patches = dmp.patch_make(
      conflict.localVersion.content,
      conflict.remoteVersion.content
    );
    
    const [merged, results] = dmp.patch_apply(
      patches,
      conflict.localVersion.content
    );
    
    // Check if all patches applied cleanly
    if (results.every(r => r)) {
      return merged;
    }
    
    // Merge failed, need manual resolution
    throw new Error('Automatic merge failed');
  }
}
```

---

## 5. Error Boundaries

### 5.1 Error Boundary Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ERROR BOUNDARY HIERARCHY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    GLOBAL ERROR BOUNDARY                                 ││
│  │  Catches: Unhandled exceptions, React errors                            ││
│  │  Action: Show "Something went wrong" with refresh button                ││
│  │  Logging: Send to error reporting service                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    WORKSPACE ERROR BOUNDARY                              ││
│  │  Catches: Workspace-level errors (routing, data loading)                ││
│  │  Action: Show workspace error UI, allow navigation                      ││
│  │  Scope: Per workspace (IDE, Notes, Knowledge, Study)                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    PLUGIN ERROR BOUNDARY (Per Plugin)                    ││
│  │  Catches: Plugin-specific errors (Monaco crash, TipTap error)           ││
│  │  Action: Show plugin error UI, allow disable/retry                      ││
│  │  Scope: Isolated per plugin                                             ││
│  │  Key: Other plugins continue working                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Plugin Error Boundary Component

```typescript
// ============================================================================
// @/presentation/components/common/PluginErrorBoundary.tsx
// ============================================================================

import React, { Component, type ReactNode } from 'react';
import type { PluginId } from '@/domain/interfaces/plugin.interface';

interface Props {
  pluginId: PluginId;
  children: ReactNode;
  onError?: (error: Error, pluginId: PluginId) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Plugin Error Boundary
 * 
 * Isolates plugin errors from affecting other plugins.
 * Shows plugin-specific error UI with retry/disable options.
 */
export class PluginErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log to error reporting service
    console.error(`[Plugin ${this.props.pluginId}] Error:`, error, errorInfo);
    
    // Notify parent
    this.props.onError?.(error, this.props.pluginId);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleDisable = (): void => {
    // Emit event to disable this plugin
    window.dispatchEvent(
      new CustomEvent('plugin:request-disable', {
        detail: { pluginId: this.props.pluginId },
      })
    );
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="plugin-error-boundary">
          {/* 8-bit design system styling */}
          <div className="p-4 border-2 border-solid border-red-500 bg-red-50">
            <h3 className="font-pixel text-red-700 text-lg mb-2">
              Plugin Error: {this.props.pluginId}
            </h3>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-500 text-white border-2 border-blue-700"
                style={{ boxShadow: '4px 4px 0 0 #1e40af' }}
              >
                Retry
              </button>
              <button
                onClick={this.handleDisable}
                className="px-4 py-2 bg-gray-500 text-white border-2 border-gray-700"
                style={{ boxShadow: '4px 4px 0 0 #374151' }}
              >
                Disable Plugin
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5.3 Error Recovery Service

```typescript
// ============================================================================
// @/infrastructure/error/error-recovery-service.ts
// ============================================================================

/**
 * Error Recovery Service
 * 
 * Handles automatic recovery from plugin errors.
 */
export class ErrorRecoveryService {
  private errorCounts = new Map<PluginId, number>();
  private readonly maxErrors = 3;
  private readonly resetWindow = 60000; // 1 minute

  constructor(
    private readonly pluginRegistry: PluginRegistry,
    private readonly eventBus: PluginEventBus
  ) {
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('plugin:error', (event: CustomEvent) => {
      this.handlePluginError(event.detail.pluginId, event.detail.error);
    });
  }

  /**
   * Handle a plugin error with automatic recovery
   */
  async handlePluginError(pluginId: PluginId, error: Error): Promise<void> {
    const count = (this.errorCounts.get(pluginId) || 0) + 1;
    this.errorCounts.set(pluginId, count);
    
    // Reset count after window
    setTimeout(() => {
      this.errorCounts.set(pluginId, 0);
    }, this.resetWindow);
    
    if (count >= this.maxErrors) {
      // Too many errors, disable plugin
      console.error(`[ErrorRecovery] Plugin ${pluginId} exceeded error limit, disabling`);
      
      await this.pluginRegistry.disablePlugin(pluginId);
      
      this.eventBus.emit('notification:show', {
        message: `Plugin ${pluginId} has been disabled due to repeated errors.`,
        level: 'error',
        duration: 10000,
      });
    } else {
      // Attempt recovery
      console.warn(`[ErrorRecovery] Plugin ${pluginId} error (${count}/${this.maxErrors})`);
      
      this.eventBus.emit('notification:show', {
        message: `Plugin ${pluginId} encountered an error. Attempting recovery...`,
        level: 'warning',
        duration: 3000,
      });
    }
  }
}
```

---

## 6. Performance Budgets

### 6.1 Performance Budget Definitions

| Metric | Budget | Critical Threshold | Measurement |
|--------|--------|-------------------|-------------|
| **Bundle Size (Initial)** | <500KB | 750KB | Vite build |
| **Bundle Size (Per Plugin)** | <100KB | 150KB | Dynamic import |
| **First Contentful Paint** | <1.5s | 2.5s | Lighthouse |
| **Time to Interactive** | <3.0s | 4.5s | Lighthouse |
| **Largest Contentful Paint** | <2.5s | 4.0s | Lighthouse |
| **Cumulative Layout Shift** | <0.1 | 0.25 | Lighthouse |
| **First Input Delay** | <100ms | 300ms | Web Vitals |
| **Interaction to Next Paint** | <200ms | 500ms | Web Vitals |
| **Memory Usage (Baseline)** | <100MB | 200MB | Chrome DevTools |
| **Memory Usage (With Editor)** | <300MB | 500MB | Chrome DevTools |

### 6.2 Performance Monitoring Service

```typescript
// ============================================================================
// @/infrastructure/performance/performance-monitor.ts
// ============================================================================

/**
 * Performance Budget Configuration
 */
const PERFORMANCE_BUDGETS = {
  bundle: {
    initial: 500 * 1024,     // 500KB
    perPlugin: 100 * 1024,   // 100KB
  },
  timing: {
    fcp: 1500,               // 1.5s
    tti: 3000,               // 3s
    lcp: 2500,               // 2.5s
    fid: 100,                // 100ms
    inp: 200,                // 200ms
  },
  memory: {
    baseline: 100 * 1024 * 1024,    // 100MB
    withEditor: 300 * 1024 * 1024,  // 300MB
  },
  cls: 0.1,
};

/**
 * Performance Monitor Service
 */
export class PerformanceMonitorService {
  private violations: PerformanceViolation[] = [];

  constructor() {
    this.setupObservers();
  }

  /**
   * Set up performance observers
   */
  private setupObservers(): void {
    // Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        this.checkBudget('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.checkBudget('fid', (entry as any).processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      
      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.checkBudget('cls', clsValue);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }

    // Memory monitoring
    this.startMemoryMonitoring();
  }

  /**
   * Check if metric exceeds budget
   */
  private checkBudget(metric: string, value: number): void {
    const budget = (PERFORMANCE_BUDGETS.timing as any)[metric] ?? 
                   (PERFORMANCE_BUDGETS as any)[metric];
    
    if (budget && value > budget) {
      const violation: PerformanceViolation = {
        metric,
        value,
        budget,
        timestamp: Date.now(),
        severity: value > budget * 1.5 ? 'critical' : 'warning',
      };
      
      this.violations.push(violation);
      this.reportViolation(violation);
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedJS = memory.usedJSHeapSize;
        
        this.checkBudget('memory', usedJS);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Report violation
   */
  private reportViolation(violation: PerformanceViolation): void {
    console.warn('[Performance Budget Exceeded]', {
      metric: violation.metric,
      value: violation.value,
      budget: violation.budget,
      overBy: `${((violation.value / violation.budget - 1) * 100).toFixed(1)}%`,
    });
    
    // Emit event for monitoring dashboard
    window.dispatchEvent(
      new CustomEvent('performance:violation', { detail: violation })
    );
  }

  /**
   * Get all violations
   */
  getViolations(): PerformanceViolation[] {
    return [...this.violations];
  }
}

interface PerformanceViolation {
  metric: string;
  value: number;
  budget: number;
  timestamp: number;
  severity: 'warning' | 'critical';
}
```

---

## 7. Accessibility Requirements

### 7.1 Accessibility Compliance Matrix

| WCAG Criterion | Level | Requirement | Implementation |
|----------------|-------|-------------|----------------|
| **1.1.1** Text Alternatives | A | All images have alt text | `alt` prop validation |
| **1.3.1** Info and Relationships | A | Semantic HTML structure | Proper heading hierarchy |
| **1.4.3** Contrast (Minimum) | AA | 4.5:1 for normal text | Design token enforcement |
| **1.4.11** Non-text Contrast | AA | 3:1 for UI components | Border/shadow contrast |
| **2.1.1** Keyboard | A | All functions via keyboard | Focus management |
| **2.1.2** No Keyboard Trap | A | Can escape any component | Escape key handling |
| **2.4.3** Focus Order | A | Logical focus sequence | TabIndex management |
| **2.4.6** Headings and Labels | AA | Descriptive headings | Semantic h1-h6 |
| **2.4.7** Focus Visible | AA | Visible focus indicator | Focus ring styling |
| **3.2.1** On Focus | A | No context change on focus | Controlled interactions |
| **4.1.2** Name, Role, Value | A | ARIA attributes | Proper ARIA usage |

### 7.2 Keyboard Navigation Map

```typescript
// ============================================================================
// @/infrastructure/accessibility/keyboard-navigation.ts
// ============================================================================

/**
 * Global Keyboard Shortcuts
 */
export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { key: 'Mod+1', action: 'workspace:ide', description: 'Switch to IDE workspace' },
  { key: 'Mod+2', action: 'workspace:notes', description: 'Switch to Notes workspace' },
  { key: 'Mod+3', action: 'workspace:knowledge', description: 'Switch to Knowledge workspace' },
  { key: 'Mod+4', action: 'workspace:study', description: 'Switch to Study workspace' },
  
  // Panels
  { key: 'Mod+b', action: 'panel:toggle-sidebar', description: 'Toggle sidebar' },
  { key: 'Mod+j', action: 'panel:toggle-bottom', description: 'Toggle bottom panel' },
  { key: 'Mod+\\', action: 'panel:toggle-right', description: 'Toggle right panel' },
  
  // Files
  { key: 'Mod+p', action: 'file:quick-open', description: 'Quick open file' },
  { key: 'Mod+s', action: 'file:save', description: 'Save current file' },
  { key: 'Mod+Shift+s', action: 'file:save-all', description: 'Save all files' },
  { key: 'Mod+w', action: 'file:close-tab', description: 'Close current tab' },
  
  // Chat
  { key: 'Mod+k', action: 'chat:focus', description: 'Focus chat input' },
  { key: 'Mod+/', action: 'chat:toggle', description: 'Toggle chat panel' },
  
  // Search
  { key: 'Mod+Shift+f', action: 'search:global', description: 'Global search' },
  { key: 'Mod+f', action: 'search:file', description: 'Search in file' },
  
  // Terminal
  { key: 'Mod+`', action: 'terminal:toggle', description: 'Toggle terminal' },
  { key: 'Mod+Shift+`', action: 'terminal:new', description: 'New terminal' },
  
  // Accessibility
  { key: 'Escape', action: 'focus:escape', description: 'Escape current context' },
  { key: 'F6', action: 'focus:next-panel', description: 'Focus next panel' },
  { key: 'Shift+F6', action: 'focus:prev-panel', description: 'Focus previous panel' },
];

interface KeyboardShortcut {
  key: string;          // Mod = Cmd on Mac, Ctrl on Windows
  action: string;       // Action identifier
  description: string;  // Human-readable description
}

/**
 * Focus Management Service
 */
export class FocusManagementService {
  private focusTrap: HTMLElement | null = null;
  private lastFocused: HTMLElement | null = null;

  /**
   * Trap focus within an element (for modals)
   */
  trapFocus(element: HTMLElement): void {
    this.lastFocused = document.activeElement as HTMLElement;
    this.focusTrap = element;
    
    const focusables = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusables.length > 0) {
      focusables[0].focus();
    }
    
    element.addEventListener('keydown', this.handleTrapKeydown);
  }

  /**
   * Release focus trap
   */
  releaseFocus(): void {
    if (this.focusTrap) {
      this.focusTrap.removeEventListener('keydown', this.handleTrapKeydown);
      this.focusTrap = null;
    }
    
    if (this.lastFocused) {
      this.lastFocused.focus();
      this.lastFocused = null;
    }
  }

  private handleTrapKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || !this.focusTrap) return;
    
    const focusables = this.focusTrap.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /**
   * Skip to main content (skip link)
   */
  skipToMain(): void {
    const main = document.querySelector('main');
    if (main) {
      (main as HTMLElement).focus();
    }
  }
}
```

### 7.3 Screen Reader Announcements

```typescript
// ============================================================================
// @/infrastructure/accessibility/announcer.ts
// ============================================================================

/**
 * Screen Reader Announcer
 * 
 * Provides live region announcements for screen readers.
 */
export class ScreenReaderAnnouncer {
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;

  constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
    
    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  private createLiveRegion(politeness: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only'; // Visually hidden
    region.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    return region;
  }

  /**
   * Announce message (polite - waits for idle)
   */
  announce(message: string): void {
    this.politeRegion.textContent = '';
    // Force reflow
    void this.politeRegion.offsetHeight;
    this.politeRegion.textContent = message;
  }

  /**
   * Announce urgently (assertive - interrupts)
   */
  announceUrgent(message: string): void {
    this.assertiveRegion.textContent = '';
    void this.assertiveRegion.offsetHeight;
    this.assertiveRegion.textContent = message;
  }
}

// Singleton
export const announcer = new ScreenReaderAnnouncer();
```

---

## 8. i18n Architecture

### 8.1 Supported Locales

| Locale | Language | Status | Coverage Target |
|--------|----------|--------|-----------------|
| `en` | English (US) | Primary | 100% |
| `vi` | Vietnamese | Secondary | 100% |

### 8.2 Translation File Structure

```
src/
└── infrastructure/
    └── i18n/
        ├── locales/
        │   ├── en/
        │   │   ├── common.json      # Shared strings
        │   │   ├── workspace.json   # Workspace-specific
        │   │   ├── plugins.json     # Plugin strings
        │   │   └── errors.json      # Error messages
        │   └── vi/
        │       ├── common.json
        │       ├── workspace.json
        │       ├── plugins.json
        │       └── errors.json
        ├── i18n.ts                   # Configuration
        └── hooks/
            └── useTranslation.ts     # React hook
```

### 8.3 i18n Implementation

```typescript
// ============================================================================
// @/infrastructure/i18n/i18n.ts
// ============================================================================

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Lazy load locale files
const loadLocale = async (locale: string, namespace: string) => {
  const module = await import(`./locales/${locale}/${namespace}.json`);
  return module.default;
};

/**
 * i18n Configuration
 * 
 * - Auto-detects browser language
 * - Falls back to English
 * - Lazy loads translations
 */
export const initI18n = async () => {
  await i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'vi'],
      
      // Namespaces
      ns: ['common', 'workspace', 'plugins', 'errors'],
      defaultNS: 'common',
      
      // Detection options
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      
      // Interpolation
      interpolation: {
        escapeValue: false, // React already escapes
      },
      
      // Backend configuration (lazy loading)
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      
      // React options
      react: {
        useSuspense: true,
      },
    });

  return i18next;
};

export { i18next };
```

### 8.4 Translation Hook

```typescript
// ============================================================================
// @/presentation/hooks/useAppTranslation.ts
// ============================================================================

import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * App Translation Hook
 * 
 * Wraps react-i18next with type-safe namespace handling.
 */
export function useAppTranslation(namespace: TranslationNamespace = 'common') {
  const { t, i18n } = useTranslation(namespace);
  
  /**
   * Change language
   */
  const changeLanguage = useCallback(async (locale: 'en' | 'vi') => {
    await i18n.changeLanguage(locale);
    // Persist preference
    localStorage.setItem('i18nextLng', locale);
  }, [i18n]);
  
  /**
   * Get current language
   */
  const currentLanguage = i18n.language as 'en' | 'vi';
  
  return {
    t,
    changeLanguage,
    currentLanguage,
    isRTL: false, // Neither EN nor VI is RTL
  };
}

type TranslationNamespace = 'common' | 'workspace' | 'plugins' | 'errors';
```

### 8.5 Translation Key Patterns

```json
// locales/en/common.json
{
  "app": {
    "name": "Project Alpha",
    "tagline": "Your AI-Powered Development Environment"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "close": "Close",
    "retry": "Retry"
  },
  "status": {
    "loading": "Loading...",
    "saving": "Saving...",
    "error": "An error occurred",
    "success": "Success"
  },
  "time": {
    "justNow": "Just now",
    "minutesAgo": "{{count}} minute ago",
    "minutesAgo_plural": "{{count}} minutes ago",
    "hoursAgo": "{{count}} hour ago",
    "hoursAgo_plural": "{{count}} hours ago"
  }
}
```

```json
// locales/vi/common.json
{
  "app": {
    "name": "Project Alpha",
    "tagline": "Môi trường phát triển hỗ trợ AI"
  },
  "actions": {
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa",
    "create": "Tạo",
    "close": "Đóng",
    "retry": "Thử lại"
  },
  "status": {
    "loading": "Đang tải...",
    "saving": "Đang lưu...",
    "error": "Đã xảy ra lỗi",
    "success": "Thành công"
  },
  "time": {
    "justNow": "Vừa xong",
    "minutesAgo": "{{count}} phút trước",
    "hoursAgo": "{{count}} giờ trước"
  }
}
```

---

## 9. Cross-Cutting Integration Points

### 9.1 Integration Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CROSS-CUTTING INTEGRATION MATRIX                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Device Capabilities ──▶ Plugin Availability ──▶ Graceful Degradation       │
│         │                       │                       │                    │
│         │                       │                       │                    │
│         ▼                       ▼                       ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        PLUGIN REGISTRY                                   ││
│  │  • Tracks enabled/disabled state                                         ││
│  │  • Enforces device capability constraints                                ││
│  │  • Manages state preservation on toggle                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│         │                       │                       │                    │
│         ▼                       ▼                       ▼                    │
│  Error Boundaries ◀──▶ Conflict Resolution ◀──▶ Performance Monitoring      │
│         │                       │                       │                    │
│         │                       │                       │                    │
│         ▼                       ▼                       ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        EVENT BUS                                         ││
│  │  • Plugin lifecycle events                                                ││
│  │  • Error events                                                           ││
│  │  • Conflict events                                                        ││
│  │  • Performance violation events                                           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│         │                       │                       │                    │
│         ▼                       ▼                       ▼                    │
│  Accessibility ◀────────▶ i18n ◀────────▶ User Preferences (Dexie)          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Validation Checklist

Before this section is VALIDATED, the following must be true:

- [ ] Device capability detection covers all target platforms
- [ ] Plugin availability matrix matches UX specification
- [ ] Graceful degradation provides meaningful fallbacks
- [ ] State preservation works across plugin toggle cycles
- [ ] Conflict resolution handles all 4 conflict types
- [ ] Error boundaries isolate plugin failures
- [ ] Performance budgets are measurable and enforced
- [ ] Keyboard navigation covers all critical paths
- [ ] Screen reader announcements are implemented
- [ ] i18n supports EN + VI with 100% coverage

---

## 11. Implementation Priority

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| Device Capability Detection | P0 | Low | None |
| Plugin Availability Matrix | P0 | Low | Device Detection |
| Error Boundaries | P0 | Medium | React |
| Graceful Degradation | P1 | Medium | Plugin Registry |
| State Preservation | P1 | Medium | Dexie |
| Conflict Resolution | P1 | High | WriteLockManager, EventBus |
| Performance Monitoring | P2 | Medium | None |
| Keyboard Navigation | P2 | Medium | None |
| Screen Reader Announcements | P2 | Low | None |
| i18n Setup | P2 | Medium | None |

---

## 12. Success Metrics

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| Device detection coverage | N/A | 100% | Test suite |
| Graceful degradation coverage | N/A | 100% | Manual QA |
| Plugin error isolation | N/A | 100% | E2E tests |
| Accessibility audit score | N/A | 90+ | Lighthouse |
| Performance budget compliance | N/A | 100% | CI/CD |
| i18n coverage (EN) | N/A | 100% | Script check |
| i18n coverage (VI) | N/A | 100% | Script check |
| Keyboard navigation coverage | N/A | 100% | Accessibility audit |

---

**END OF SECTION 5: CROSS-CUTTING CONCERNS**

*Next: Section 6 - Testing Strategy & Quality Assurance*
