---
id: P2-7
name: "Knowledge → Notes Export"
epic: Ralph Loop Cycle 18
priority: P0 (Critical)
status: in-progress
created: 2026-01-03
team: Team A
agent: bmad-core-bmad-master
estimated_hours: 6
---

# Story P2-7: Knowledge → Notes Export

## User Story

**As** a student or researcher using the BMAD platform,
**I want** to export synthesis content from the Knowledge workspace to the Notes workspace,
**So that** I can further edit, annotate, and organize synthesized research materials in my notes.

## Problem Statement

The Knowledge workspace can synthesize research and create structured content, but there is NO way to:
1. Export synthesis results to Notes for further editing
2. Create new notes from knowledge nodes
3. Transfer literature maps to notes for annotation
4. Export exam-focused synthesis to study notes

**Impact**: 2 critical use cases blocked (UC-01, UC-03)

## Acceptance Criteria

### AC-1: Export Synthesis to Notes
- **Given**: User has created synthesis content in Knowledge workspace
- **When**: User clicks "Export to Notes" button on a knowledge node
- **Then**: System creates a new Note in Notes workspace
- **And**: Note includes frontmatter (title, tags, source references)
- **And**: Note includes synthesis content in Markdown format
- **And**: User is notified with success message and link to view note

### AC-2: Batch Export Multiple Nodes
- **Given**: User has selected multiple knowledge nodes (3+ nodes)
- **When**: User clicks "Export Selected to Notes" button
- **Then**: System creates separate Notes for each node
- **And**: Notes are grouped in a folder/tag for easy organization
- **And**: User sees progress indicator during export

### AC-3: Preserve Metadata and Tags
- **Given**: Knowledge node has frontmatter (tags, source, timestamp)
- **When**: Node is exported to Notes
- **Then**: All metadata is preserved in Note frontmatter
- **And**: Tags are added to Note for searchability
- **And**: Source references are included as clickable links

### AC-4: Event Bus Communication
- **Given**: Knowledge workspace has synthesis ready to export
- **When**: User triggers export action
- **Then**: System publishes event to cross-workspace event bus
- **And**: Notes workspace subscribes to event and creates note
- **And**: User can see progress updates during export

### AC-5: Note Creation in Notes Workspace
- **Given**: Notes workspace receives export event from Knowledge
- **When**: Event payload is received
- **Then**: System creates Note with proper structure (title, blocks, frontmatter)
- **And**: Note uses BlockNote format with proper block types
- **And**: Note is set as active note for immediate editing

### AC-6: Cross-Workspace Navigation
- **Given**: Note created from Knowledge export
- **When**: User clicks "View in Notes" button in Knowledge workspace
- **Then**: System navigates to Notes workspace
- **And**: Opens the created note
- **And**: User can immediately edit the exported content

### AC-7: TypeScript Compilation Passes
- **Given**: All changes complete
- **When**: TypeScript compiler runs
- **Then**: Zero errors in production files
- **And**: Build completes successfully

## Technical Implementation

### Phase 1: Event Bus Extension (1 hour)

**File**: `src/infrastructure/events/event-bus.ts`

Add new event type:
```typescript
export type KnowledgeToNotesEvent =
  | SynthesisExportRequested;

export interface SynthesisExportRequested {
  type: 'synthesis-export-requested';
  payload: {
    workspaceType: 'knowledge';
    nodeId: string;
    timestamp: Date;
    data: SynthesisExportData;
  };
}

export interface SynthesisExportData {
  nodeId: string;
  title: string;
  content: string; // Markdown content
  frontmatter: {
    createdAt: string;
    updatedAt: string;
    workspaceType: 'knowledge';
    tags: string[];
    sources?: Array<{
      type: 'pdf' | 'url' | 'note';
      path: string;
      title?: string;
    }>;
  };
  blocks?: Array<{
    type: 'paragraph' | 'heading' | 'list' | 'code';
    content: string;
    level?: number;
  }>;
}
```

### Phase 2: Knowledge Export UI (2 hours)

**File**: `src/presentation/components/knowledge/KnowledgePage.tsx`

Add "Export to Notes" button to node actions:
```typescript
{selectedNode && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => handleExportToNotes(selectedNode)}
  >
    <FileText className="w-4 h-4 mr-2" />
    Export to Notes
  </Button>
)}
```

**Handler**:
```typescript
const handleExportToNotes = async (node: KnowledgeNode) => {
  // Transform knowledge node to synthesis format
  const synthesisData: SynthesisExportData = {
    nodeId: node.id,
    title: node.title,
    content: node.content,
    frontmatter: {
      createdAt: node.frontmatter.createdAt,
      updatedAt: node.frontmatter.updatedAt,
      workspaceType: 'knowledge',
      tags: node.frontmatter.tags || [],
      sources: node.frontmatter.sources,
    },
    blocks: parseMarkdownToBlocks(node.content),
  };

  // Publish event to event bus
  eventBus.emit(DomainEventType.SYNTHESIS_EXPORT_REQUESTED, {
    workspaceType: 'knowledge',
    nodeId: node.id,
    timestamp: new Date(),
    data: synthesisData,
  });

  toast.success('Exporting to Notes', {
    description: 'Creating note from synthesis...'
  });
};
```

### Phase 3: Notes Workspace Receiver (2 hours)

**File**: `src/presentation/components/notes/NotesPage.tsx`

Subscribe to Knowledge export events:
```typescript
useEffect(() => {
  const handleSynthesisExport = (event: any) => {
    const exportData = event.payload;

    // Transform synthesis data to Note format
    const noteData = {
      title: exportData.data.title,
      emoji: '📝', // Knowledge-sourced note
      blocks: exportData.data.blocks || parseMarkdownToBlocks(exportData.data.content),
      tags: exportData.data.frontmatter.tags,
      metadata: {
        source: 'knowledge',
        sourceNodeId: exportData.nodeId,
        createdAt: exportData.data.frontmatter.createdAt,
        sources: exportData.data.frontmatter.sources,
      },
    };

    // Create note in Notes workspace
    createNote(noteData);
    setActiveNote(newNoteId);

    toast.success('Note created from Knowledge', {
      description: noteData.title,
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to Notes workspace if not already there
          // Note is already set as active
        },
      },
    });
  };

  const unsubscribe = eventBus.on(
    DomainEventType.SYNTHESIS_EXPORT_REQUESTED,
    handleSynthesisExport as any
  );

  return unsubscribe;
}, [eventBus, createNote, setActiveNote]);
```

### Phase 4: Markdown to BlockNote Parser (1 hour)

**File**: `src/lib/knowledge/markdown-to-blocks-parser.ts` (NEW)

Utility to convert Markdown content to BlockNote blocks:
```typescript
export function parseMarkdownToBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      blocks.push({
        id: generateId(),
        type: 'heading',
        props: { level: 1 },
        content: [[line.substring(2), 'text']],
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        id: generateId(),
        type: 'heading',
        props: { level: 2 },
        content: [[line.substring(3), 'text']],
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        id: generateId(),
        type: 'heading',
        props: { level: 3 },
        content: [[line.substring(4), 'text']],
      });
    } else if (line.trim().startsWith('- ')) {
      blocks.push({
        id: generateId(),
        type: 'list',
        props: { type: 'bullet' },
        content: [[line.trim().substring(2), 'text']],
      });
    } else if (line.startsWith('```')) {
      // Code block (multi-line)
      // ...
    } else if (line.trim()) {
      blocks.push({
        id: generateId(),
        type: 'paragraph',
        content: [[line, 'text']],
      });
    }
  }

  return blocks;
}
```

## Dev Notes

### Architecture Patterns

Follow existing event bus pattern from P2-6:
- `src/infrastructure/events/cross-workspace-event-bus.ts`
- Use existing `DomainEventType` enum

### Data Flow
```
Knowledge Workspace                    Notes Workspace
     |                                    ^
     | Publishes event                    | Subscribes to event
     v                                    |
Event Bus  →  Event Payload  →  Note Creation  →  Active Note
```

### Dependencies
- Event bus (already exists)
- Note store (already exists)
- Knowledge store (already exists)
- BlockNote (already exists)

### File Modifications
- `src/infrastructure/events/event-bus.ts` - Add Knowledge event type
- `src/presentation/components/knowledge/KnowledgePage.tsx` - Add export button
- `src/presentation/components/notes/NotesPage.tsx` - Subscribe to events
- `src/lib/knowledge/markdown-to-blocks-parser.ts` - NEW: Markdown parser utility

## Testing Strategy

### Manual Testing
1. Open Knowledge workspace
2. Create or select a knowledge node with synthesis
3. Click "Export to Notes" button
4. Verify event published to console
5. Switch to Notes workspace
6. Verify Note created with proper content
7. Verify Note is editable with BlockNote
8. Verify metadata preserved in Note

### Type Checking
```bash
pnpm tsc --noEmit 2>&1 | grep -v "test\\|spec" | grep "error"
# Expected: 0 errors
```

### Event Bus Testing
```typescript
// Test event publishing
eventBus.emit(DomainEventType.SYNTHESIS_EXPORT_REQUESTED, payload);

// Test event subscription
eventBus.subscribe(DomainEventType.SYNTHESIS_EXPORT_REQUESTED, (event) => {
  console.log('Received event:', event);
});
```

## Use Cases Unblocked

Completing this story unblocks:
- **UC-01: Exam Sprint Mixed Media** - Can export synthesis to notes for further editing
- **UC-03: Citation-Grade Literature Map** - Can export literature maps to notes for annotation

**Total**: 2 critical use cases move from "Not Feasible" → "Feasible"

## Dev Agent Record

**Agent**: bmad-core-bmad-master
**Session**: 2026-01-03

### Tasks Completed:
- [x] Read 2 blocked use cases (UC-01, UC-03)
- [x] Created story file with acceptance criteria
- [ ] Extend event bus with Knowledge→Notes event type
- [ ] Add export button to Knowledge workspace
- [ ] Add event subscription to Notes workspace
- [ ] Implement Markdown to BlockNote parser
- [ ] Test cross-workspace communication
- [ ] Manual testing of synthesis export

### Files Changed:
*TBD*

### Research Executed:
- [x] Read use cases UC-01, UC-03
- [x] Analyzed Notes workspace structure (NotesPage.tsx)
- [x] Reviewed Knowledge workspace structure (KnowledgePage.tsx)
- [x] Analyzed event bus pattern from P2-6

### Decisions Made:
- P0 priority - blocks 2 critical use cases
- Event bus pattern for cross-workspace communication (follows P2-6 pattern)
- Export creates new Note (does NOT update existing notes)
- Markdown to BlockNote parser for content transformation
- Preserves all metadata and tags from Knowledge nodes

## Status

**Current**: in-progress
**Last Updated**: 2026-01-03T23:30:00+07:00
**Next Action**: Extend event bus with SYNTHESIS_EXPORT_REQUESTED event type
