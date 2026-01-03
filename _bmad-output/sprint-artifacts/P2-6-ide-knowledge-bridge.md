---
id: P2-6
name: "IDE ↔ Knowledge Bridge"
epic: Ralph Loop Cycle 18
priority: P0 (Critical)
status: in-progress
created: 2026-01-03
team: Team A
agent: bmad-core-bmad-master
estimated_hours: 10
---

# Story P2-6: IDE ↔ Knowledge Bridge

## User Story

**As** a developer using the BMAD platform,
**I want** to capture IDE context (errors, refactors, audits) and send them to the Knowledge workspace for persistent storage,
**So that** I can build a searchable knowledge base of debugging solutions, refactor journals, and upgrade logs.

## Problem Statement

The IDE workspace is **completely isolated** from other workspaces. There is NO way to:
1. Capture debug sessions from IDE
2. Send error context to Knowledge workspace
3. Create structured Debug Notes
4. Store refactor journals in Knowledge
5. Document dependency audits

**Impact**: 3 critical use cases blocked (UC-02, UC-11, UC-13)

## Acceptance Criteria

### AC-1: Debug Session Capture
- **Given**: User encounters an error in IDE workspace
- **When**: User clicks "Capture Debug Session" button in IDE
- **Then**: System captures stack trace, error message, environment info
- **And**: User can select relevant code files
- **And**: System creates Debug Note in Knowledge workspace
- **And**: Debug Note includes root cause hypothesis, fix pattern, tags

### AC-2: Refactor Journal Creation
- **Given**: User executes agent refactor in IDE chat
- **When**: Agent completes refactor steps
- **Then**: System creates Refactor Journal in Knowledge workspace
- **And**: Journal includes original state, migration plan, changed files
- **And**: Journal includes rollback checkpoints per major step
- **And**: Validation results (pass/fail per step)

### AC-3: Dependency Audit Documentation
- **Given**: User runs dependency audit in IDE
- **When**: Agent completes research phase
- **Then**: System creates Upgrade Log in Knowledge workspace
- **And**: Log includes breaking changes, codebase impact, upgrade plan
- **And** Log includes external links (changelogs, migration guides)

### AC-4: Event Bus Communication
- **Given**: IDE workspace generates structured data
- **When**: Data is ready to send to Knowledge
- **Then**: System publishes event to cross-workspace event bus
- **And**: Knowledge workspace subscribes to event and creates node
- **And**: User can see progress updates during data transfer

### AC-5: Knowledge Node Types
- **Given**: Data sent from IDE to Knowledge
- **When**: Knowledge workspace receives data
- **Then**: System creates appropriate node type:
  - Debug Note (for UC-02)
  - Refactor Journal (for UC-11)
  - Upgrade Log (for UC-13)
- **And**: Node has proper frontmatter, tags, metadata

### AC-6: Cross-Workspace Navigation
- **Given**: Debug Note created in Knowledge workspace
- **When**: User clicks "View in Knowledge" button in IDE
- **Then**: System navigates to Knowledge workspace
- **And**: Opens the created node
- **And**: User can edit, annotate, link on Canvas

### AC-7: TypeScript Compilation Passes
- **Given**: All changes complete
- **When**: TypeScript compiler runs
- **Then**: Zero errors in production files
- **And**: Build completes successfully

## Technical Implementation

### Phase 1: Event Bus Extension (2 hours)

**File**: `src/infrastructure/events/cross-workspace-event-bus.ts`

Add new event types:
```typescript
export type IDEToKnowledgeEvent =
  | DebugSessionCaptured
  | RefactorJournalCreated
  | DependencyAuditComplete;

export interface DebugSessionCaptured {
  type: 'debug-session-captured';
  payload: {
    workspaceType: 'ide';
    projectId: string;
    timestamp: Date;
    data: DebugSessionData;
  };
}

export interface RefactorJournalCreated {
  type: 'refactor-journal-created';
  payload: {
    workspaceType: 'ide';
    projectId: string;
    timestamp: Date;
    data: RefactorJournalData;
  };
}

export interface DependencyAuditComplete {
  type: 'dependency-audit-complete';
  payload: {
    workspaceType: 'ide';
    projectId: string;
    timestamp: Date;
    data: DependencyAuditData;
  };
}
```

### Phase 2: IDE Capture UI (3 hours)

**File**: `src/presentation/components/ide/AgentChatPanel.tsx`

Add "Capture Debug Session" button:
```typescript
{workspaceType === 'ide' && (
  <Button
    variant="outline"
    size="sm"
    onClick={handleCaptureDebugSession}
  >
    <Bug className="w-4 h-4 mr-2" />
    Capture Debug Session
  </Button>
)}
```

**Handler**:
```typescript
const handleCaptureDebugSession = async () => {
  // Collect terminal output, stack traces, file diffs
  const debugData = await collectDebugContext();

  // Publish event to event bus
  eventBus.publish('debug-session-captured', {
    workspaceType: 'ide',
    projectId,
    timestamp: new Date(),
    data: debugData,
  });

  toast.success('Debug session captured', {
    description: 'Creating Debug Note in Knowledge workspace...'
  });
};
```

### Phase 3: Knowledge Workspace Receiver (3 hours)

**File**: `src/presentation/components/knowledge/KnowledgePage.tsx`

Subscribe to IDE events:
```typescript
useEffect(() => {
  const unsubscribe = eventBus.subscribe('debug-session-captured', (event) => {
    if (event.workspaceType === 'ide') {
      createDebugNote(event.payload);
    }
  });

  return unsubscribe;
}, [eventBus]);
```

**Debug Note Creation**:
```typescript
const createDebugNote = async (data: DebugSessionData) => {
  const note = await synthesisService.createDebugNote({
    title: `${data.errorType} - ${new Date().toLocaleDateString()}`,
    symptoms: data.symptoms,
    environment: data.environment,
    attemptedFixes: data.attemptedFixes,
    finalFix: data.finalFix,
    tags: data.tags,
  });

  // Add to knowledge store
  addNode({
    type: 'debug-note',
    title: note.title,
    content: note.content,
    frontmatter: note.frontmatter,
    embeddings: await generateEmbeddings(note.content),
  });

  toast.success('Debug Note created', {
    description: `Available in Knowledge workspace`
  });
};
```

### Phase 4: Synthesis Service Integration (2 hours)

**File**: `src/lib/knowledge/synthesis-service.ts`

Add new synthesis methods:
```typescript
async createDebugNote(data: DebugSessionData): Promise<DebugNote> {
  // Use LLM to analyze debug context
  const prompt = `
    Analyze this debug session and create a structured Debug Note:

    Error: ${data.symptoms}
    Environment: ${data.environment}
    Attempted Fixes: ${data.attemptedFixes}
    Final Fix: ${data.finalFix}

    Generate:
    1. Root cause hypothesis (with confidence score)
    2. Minimal reproducible steps (checklist format)
    3. Fix pattern (generalized solution)
    4. Local patch (specific diff)
    5. Tags (framework, error family, language feature)
  `;

  const analysis = await llmService.generate(prompt);

  return {
    id: generateId(),
    type: 'debug-note',
    title: `${data.errorType} Debug Note`,
    content: analysis.content,
    frontmatter: {
      createdAt: new Date(),
      updatedAt: new Date(),
      workspaceType: 'ide',
      projectId: data.projectId,
      tags: analysis.tags,
      confidence: analysis.confidence,
    },
    embeddings: [],
  };
}

async createRefactorJournal(data: RefactorJournalData): Promise<RefactorJournal> {
  // Similar implementation for refactor journals
}

async createUpgradeLog(data: DependencyAuditData): Promise<UpgradeLog> {
  // Similar implementation for upgrade logs
}
```

## Dev Notes

### Architecture Patterns

Follow existing event bus pattern:
- `src/infrastructure/events/cross-workspace-event-bus.ts`
- Use existing `WorkspaceChangeEvent` as reference

### Data Flow
```
IDE Workspace                    Knowledge Workspace
     |                                    ^
     | Publishes event                  | Subscribes to event
     v                                    |
Event Bus  →  Event Payload  →  Synthesis Service  →  Knowledge Node
```

### Dependencies
- Event bus (already exists)
- Synthesis service (already exists in knowledge workspace)
- LLM service (already exists)
- Knowledge store (already exists)

### File Modifications
- `src/presentation/components/ide/AgentChatPanel.tsx` - Add capture button
- `src/presentation/components/knowledge/KnowledgePage.tsx` - Subscribe to events
- `src/infrastructure/events/cross-workspace-event-bus.ts` - Add event types
- `src/lib/knowledge/synthesis-service.ts` - Add IDE synthesis methods
- `src/types/workspace-events.ts` - Add event interfaces

## Testing Strategy

### Manual Testing
1. Open IDE workspace
2. Trigger an error (e.g., TypeScript error)
3. Click "Capture Debug Session"
4. Verify event published to console
5. Switch to Knowledge workspace
6. Verify Debug Note created
7. Verify note is searchable, taggable, linkable

### Type Checking
```bash
pnpm tsc --noEmit 2>&1 | grep -v "test\|spec" | grep "error"
# Expected: 0 errors
```

### Event Bus Testing
```typescript
// Test event publishing
eventBus.publish('debug-session-captured', payload);

// Test event subscription
eventBus.subscribe('debug-session-captured', (event) => {
  console.log('Received event:', event);
});
```

## Use Cases Unblocked

Completing this story unblocks:
- **UC-02: IDE Debugging Vault** - Capture errors, create Debug Notes
- **UC-11: Agentic Refactor Validation** - Document refactor journals
- **UC-13: Dependency Audit Upgrade** - Store upgrade research

**Total**: 3 critical use cases move from "Not Feasible" → "Feasible"

## Dev Agent Record

**Agent**: bmad-core-bmad-master
**Session**: 2026-01-03

### Tasks Completed:
- [x] Read 3 blocked use cases (UC-02, UC-11, UC-13)
- [x] Created story file with acceptance criteria
- [ ] Extend event bus with IDE→Knowledge events
- [ ] Add capture button to IDE workspace
- [ ] Add event subscription to Knowledge workspace
- [ ] Implement synthesis service methods
- [ ] Test cross-workspace communication
- [ ] Manual testing of debug session capture

### Files Changed:
*TBD*

### Research Executed:
- [x] Read use cases UC-02, UC-11, UC-13
- [x] Analyzed event bus architecture
- [x] Reviewed synthesis service capabilities

### Decisions Made:
- P0 priority - blocks 3 critical use cases
- Event bus pattern for cross-workspace communication (follows existing pattern)
- Synthesis service generates structured content from IDE context
- Separate node types for Debug Note, Refactor Journal, Upgrade Log

## Status

**Current**: in-progress
**Last Updated**: 2026-01-03T17:30:00+07:00
**Next Action**: Extend event bus with IDE→Knowledge event types
