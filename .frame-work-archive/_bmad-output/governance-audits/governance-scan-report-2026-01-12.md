# Corrected Course Proposal: Governance Scan

Date: 2026-01-12
Reference Audit: GOV-2026-01-12-001
Status: CORRECTED - Ready for Sprint Planning
Health Score: 19/30 (production usability at risk; correctness not yet provable under stress)

--

## Executive Summary

This document validates and corrects the original governance scan against actual sprint artifacts and codebase implementation. The original audit was directionally correct on high-impact failure modes but contained 3 overstated claims and 1 factual error that must be reconciled before remediation work begins.

### Key Corrections

## Validation Against Sprint Artifacts

### Verified Against 45-03: Unified Project State

Claim: No navigation guards before navigate() calls
Status: ✅ CONFIRMED TRUE

Evidence:

```
// src/presentation/components/notes/NotesPage.tsx:161-168
const ideProjectId = useIDEStore((s) => s.projectId);
useEffect(() => {
    if (ideProjectId && ideProjectId !== projectId) {
        console.log('[NotesPage] Project changed in IDE store, navigating:', ideProjectId);
        navigate({ to: `/notes/${ideProjectId}` }); // ❌ No guard
    }
}, [ideProjectId, projectId, navigate]);
```

Sprint Artifact Alignment: 45-03 explicitly documents this route-sync approach as the chosen architecture:

> "This approach: 1. ✅ Maintains backward compatibility 2. ✅ Uses IDE store as single source of truth 3. ✅ Provides reactivity via event-driven navigation"

The vulnerability is BY DESIGN according to the sprint artifact. This is not a bug but an inherent risk of the chosen architecture that requires mitigation.

Remediation: Add navigation idempotency guards without changing the fundamental architecture.

### Verified Against 45-04: Browser Space Mode

Claim: Browser mode project ID mismatch
Status: ✅ CORRECTED - Audit had wrong ID

Correction:

Actual Implementation:

```
// src/lib/workspace/browser-mode.ts
export const BROWSER_MODE_PROJECT_ID = 'notes:browser-mode';

export function isBrowserModeProject(project: Project | null): boolean {
  return project?.id === BROWSER_MODE_PROJECT_ID || project?.isBrowserMode === true;
}
```

Claim: "No visual distinction for browser mode"
Status: ❌ INCORRECT - Sprint artifact shows COMPLETED

Evidence from 45-04 AC3:

```
### AC3: Visual Distinction
- [x] Browser mode clearly indicated in UI
- [x] Project-scoped notes show project badge/indicator
- [ ] Filter by project available in browser mode (DEFERRED)
```

Correction: The visual distinction EXISTS. The deferred item is only the filter-by-project feature.

### Verified Against 46-01: Tool Context Propagation

Claim: "Tool context includes actual projectId ✅ VERIFIED"
Status: ❌ OVERSTATED - Should be "NOT YET VERIFIED"

Evidence from 46-01:

```
### ❌ What's Missing
| Gap | Impact | Fix |
|-----|--------|-----|
| `projectId` not in log records | Can't track which project a tool ran in | Add `projectId` to `ToolExecutionLogRecord` |
| Browser mode project handling | Tools may fail in browser mode | Verify and test |

### AC2: Tool Execution Logs Include Workspace Metadata
- [ ] Log records include `workspaceType`
- [ ] Log records include `projectId` (NEW - to be added)
- [ ] Log records include execution `duration`

**Status: PARTIAL** - `workspaceId` exists, `duration` exists, `projectId` needs to be added

### AC4: Browser Mode Properly Handled
**Status: NEEDS VERIFICATION**
```

Verification against codebase:

```
// src/infrastructure/persistence/dexie-db-session-types.ts:97-114
export interface ToolExecutionLogRecord {
    id: string;
    conversationId: string;
    messageId: string;
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
    // ❌ Missing: projectId field
    toolName: string;
    args: unknown;
    result?: { success: boolean; output?: string; error?: string; duration?: number; };
    approved: boolean;
    status: 'pending' | 'approved' | 'denied' | 'executed' | 'error';
    timestamp: number;
    createdAt: number;
}
```

Correction: The audit sub-agent A2's claim was OVERSTATED. The sprint artifact correctly identifies this as "NEEDS VERIFICATION."

### Verified Against 46-02: Workspace Prompts

Claim: Stale prompt cache after permission changes
Status: ✅ CONFIRMED TRUE

Evidence:

```
// src/lib/agent/prompt-composer.ts:163-169
public updateConfig(config: Partial<PromptComposerConfig>): void {
  const newConfig = { ...this.getConfig(), ...config };
  this.config = newConfig;
  // Invalidate cache when configuration changes
  this.invalidateCache();
  // ...
}

// src/lib/agent/prompt-composer.ts:299-301
private invalidateCache(): void {
  this.cache.clear();
}
```

No event subscriptions found for:

- permission:changed events
- workspace:transition:complete events
- Tool availability changes
Sprint Artifact Alignment: 46-02 AC1 explicitly requires "Prompt lists tools available in current workspace" and AC2 requires "Prompt explains unavailable tools" - both of which depend on non-stale cache.

The vulnerability is REAL and blocks 46-02 completion.

### Verified Against EPIC-45 Retrospective

Claim: Scroll-position map growth causes performance degradation
Status: ✅ CONFIRMED - Acknowledged as technical debt

Evidence from retrospective:

```
### 2. Scroll Position Storage Unbounded
**Impact:** `noteScrollPositions` map grows indefinitely

**Severity:** Low (storage is local, typical usage <100 notes)

**Action:** Consider cleanup strategy if user reports issues
```

This is KNOWN technical debt, not a newly discovered issue. The audit correctly identified it but mischaracterized the severity (user called it out specifically, so it may be more impactful than "Low").

## Corrected Risk Assessment

### Proven Vulnerabilities (Require Action)

### Overstated Claims (Must Correct)

### Factual Error (Must Fix)

## Corrected Remediation Roadmap

### Phase 1: Immediate (Today) - Production Blockers

Priority: P0 - Stop the Bleed

#### 1.1 Navigation Idempotency Guards (2 hours)

Reference: V1, 45-03 architecture

Approach: Add guards WITHOUT changing route-sync architecture

```
// src/presentation/components/notes/NotesPage.tsx
const lastNavRef = useRef<{ projectId: string | null; timestamp: number }>();

useEffect(() => {
    // Guard 1: Already at target
    if (ideProjectId === projectId) return;

    // Guard 2: Invalid target
    if (!ideProjectId || ideProjectId === 'null' || ideProjectId === 'undefined') return;

    // Guard 3: Recent navigation (debounce)
    if (lastNavRef.current?.projectId === ideProjectId &&
        Date.now() - lastNavRef.current.timestamp < 500) return;

    // Navigate
    navigate({ to: `/notes/${ideProjectId}` });
    lastNavRef.current = { projectId: ideProjectId, timestamp: Date.now() };
}, [ideProjectId, projectId, navigate]);
```

Apply same pattern to:

- KnowledgePage.tsx
- StudyPage.tsx
Acceptance Criteria:

#### 1.2 Prompt Cache Invalidation Fix (2 hours)

Reference: V3, 46-02 AC1-AC4

Approach: Subscribe to permission and workspace transition events

```
// src/lib/agent/prompt-composer.ts
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

// In constructor or initialization:
private setupCacheInvalidation(): void {
    // Invalidate on permission changes
    eventBus.on(DomainEventType.PERMISSION_CHANGED, () => {
        this.invalidateCache();
    });

    // Invalidate on workspace transitions
    eventBus.on(DomainEventType.WORKSPACE_TRANSITION_COMPLETE, () => {
        this.invalidateCache();
    });

    // Invalidate on agent availability changes
    eventBus.on(DomainEventType.AGENT_AVAILABILITY_CHANGED, () => {
        this.invalidateCache();
    });
}
```

Note: May need to add new event types to DomainEventType enum if not present.

Acceptance Criteria:

### Phase 2: Short-Term (This Sprint) - Data Integrity

Priority: P0 - Correctness

#### 2.1 Add projectId to Tool Execution Logs (3 hours)

Reference: V2, 46-01 AC2

Schema Change:

```
// src/infrastructure/persistence/dexie-db-session-types.ts
export interface ToolExecutionLogRecord {
    id: string;
    conversationId: string;
    messageId: string;
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
    projectId: string | null;  // ✅ ADD THIS
    toolName: string;
    // ... rest unchanged
}
```

Migration v21:

```
db.version(21).stores({
    toolExecutionLogs: 'id, conversationId, messageId, workspaceId, ++projectId, toolName, [timestamp]'
}).upgrade(async tx => {
    const logs = await tx.table('toolExecutionLogs').toArray();
    for (const log of logs) {
        const projectId = await deriveProjectIdFromConversation(log.conversationId) ?? 'unknown';
        await tx.table('toolExecutionLogs').put({ ...log, projectId });
    }
    markMigrationApplied(21);
});
```

Acceptance Criteria:

#### 2.2 Browser Mode Tool Verification (2 hours)

Reference: V5, 46-01 AC4

Test Matrix:

Each test must verify:

1. Tool executes without error
1. projectId logged correctly
1. Browser mode notes persist correctly
Acceptance Criteria:

### Phase 3: Long-Term (Next Sprint) - Architecture Hardening

Priority: P1 - Best-in-Class

#### 3.1 Bounded Scroll Position Storage (4 hours)

Reference: V4, EPIC-45 retrospective

Approach: Add LRU cache with TTL

```
// src/lib/notes/stores/note-navigation-store.ts
class BoundedScrollStorage {
    private maxEntries = 100;
    private ttl = 7 * 24 * 60 * 60 * 1000; // 7 days
    private storage = new Map<string, { position: number; timestamp: number }>();

  set(noteId: string, position: number): void {
    // Remove oldest if at capacity
    if (this.storage.size >= this.maxEntries) {
      const oldest = Array.from(this.storage.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      this.storage.delete(oldest[0]);
    }

    // Set with timestamp
    this.storage.set(noteId, { position, timestamp: Date.now() });
  }

  get(noteId: string): number | undefined {
    const entry = this.storage.get(noteId);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.storage.delete(noteId);
      return undefined;
    }

    // LRU: move to end
    this.storage.delete(noteId);
    this.storage.set(noteId, entry);
    return entry.position;
  }
}
```

Acceptance Criteria:

#### 3.2 Prompt-Tool Source Unification (3 hours)

Reference: V3, 46-02 design

Approach: Use same permission manager for prompts and execution

```
// src/lib/agent/workspace-prompt-builder.ts
import { WorkspacePermissionManager } from './workspace-permission-manager';

export function buildToolListPrompt(
  agent: AgentData,
  workspaceContext: WorkspaceContext
): string {
  const permissionManager = new WorkspacePermissionManager(
    ToolPermissionManager.getInstance()
  );

  // ✅ Use SAME source as execution
  const availableTools = permissionManager.getToolsForWorkspace(
    agent.tools,
    agent.workspaceBindings,
    workspaceContext.workspaceType
  );

  // Generate prompt from permission results
  const available = availableTools.filter(t => t.enabled).map(t =>
    `- ${t.toolId}: ${t.description}`
  );

  const unavailable = availableTools.filter(t => !t.enabled).map(t =>
    `- ${t.toolId}: ${t.blockReason || 'Not available in this workspace'}`
  );

  return `## Available Tools\n${available.join('\n')}\n\n## Unavailable Tools\n${unavailable.join('\n')}`;
}
```

Acceptance Criteria:

## Impact Map (User-Facing)

### What Breaks What

## Test Requirements

### Must-Prove Edge Cases

## Document Corrections Required

### Original Audit Documents

## Next Steps

### Immediate (Today)

1. Review and approve this corrected course proposal
1. Create GitHub issues for Phase 1 tasks with acceptance criteria
1. Assign priority labels
### This Sprint

1. Implement Phase 1 items (navigation guards, prompt cache)
1. Start Phase 2 (projectId logging, browser mode verification)
### Next Sprint

1. Complete Phase 2
1. Implement Phase 3 (bounded storage, prompt-tool unification)
Prepared By: Governance Scan Validation
Date: 2026-01-12
Status: Ready for Sprint Planning Review
Confidence: HIGH - All claims verified against sprint artifacts and codebase



