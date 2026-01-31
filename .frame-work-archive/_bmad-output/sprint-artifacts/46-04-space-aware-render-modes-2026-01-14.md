# 46-04: Space-Aware Render Modes for Chat Components

**Epic:** EPIC-46 - Space-Aware Agent Orchestration
**Story:** 46-04
**Status:** READY
**Created:** 2026-01-14
**Priority:** P2-MEDIUM
**Team:** Team A

---

## User Story

**As a** user viewing AI-generated code blocks in different workspaces
**I want** to see action buttons that are appropriate for my current workspace
**So that** I can execute code in IDE, save to notes in Notes, etc. without confusion

---

## Current Problem

### Static Action Buttons

The current `CodeBlock` component has:
- Copy button (always available)
- Preview button (HTML/SVG only)
- Save button (if `onSave` prop provided)
- Accept/Reject buttons (if `onAccept`/`onReject` props provided)

**Missing:**
- Workspace-aware actions (Execute in Terminal, Save to Note, etc.)
- Context-sensitive button visibility
- Workspace-specific button labels

### User Impact

Users in different workspaces see:
- Same buttons regardless of workspace
- "Execute" button in Notes workspace (won't work)
- "Save to Note" button in IDE workspace (may not want)

---

## Acceptance Criteria

### AC1: CodeBlock Shows Workspace-Specific Actions
- [ ] IDE workspace: Shows "Execute in Terminal" button for code
- [ ] Notes workspace: Shows "Save to Note" button
- [ ] Knowledge workspace: Shows "Reference" button
- [ ] Study workspace: Shows "Add to References" button
- [ ] Actions only shown when workspace-appropriate

### AC2: Execute Button (IDE Workspace Only)
- [ ] Button only visible in IDE workspace
- [ ] Executes code in integrated terminal
- [ ] Shows execution status (running/success/error)
- [ ] Disabled for non-code languages (markdown, text, etc.)

### AC3: Save to Note Button (Notes Workspace)
- [ ] Button only visible in Notes workspace
- [ ] Opens note picker dialog
- [ ] Appends code to selected note
- [ ] Handles browser mode (saves to browser mode project)

### AC4: Reference Buttons (Knowledge/Study Workspaces)
- [ ] Knowledge: "Add to Knowledge" button
- [ ] Study: "Add to References" button
- [ ] Both create appropriate references
- [ ] Show confirmation on success

---

## Technical Implementation

### Approach: Workspace-Aware Action Buttons

Create a new `WorkspaceActionButtons` component that:
1. Takes `workspaceType` and `code` props
2. Renders appropriate buttons for each workspace
3. Integrates with existing workspace services

### Files to Create

#### 1. `src/presentation/components/chat/WorkspaceActionButtons.tsx`

```typescript
import { cn } from '@/lib/utils';
import { Terminal, Save, BookOpen, Plus } from 'lucide-react';
import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types';

export interface WorkspaceActionButtonsProps {
  /** Current workspace type */
  workspaceType: WorkspaceType;
  /** Code content to act on */
  code: string;
  /** Code language */
  language?: string;
  /** Callback for execute action */
  onExecute?: (code: string, language?: string) => void;
  /** Callback for save to note action */
  onSaveToNote?: (code: string) => void;
  /** Callback for add to knowledge action */
  onAddToKnowledge?: (code: string) => void;
  /** Callback for add to references action */
  onAddToReferences?: (code: string) => void;
  /** Optional className */
  className?: string;
}

/**
 * Workspace-specific action configurations
 */
const WORKSPACE_ACTIONS: Record<
  WorkspaceType,
  { icon: any; label: string; action: keyof WorkspaceActionButtonsProps; validLangs?: string[] }[]
> = {
  ide: [
    { icon: Terminal, label: 'Execute', action: 'onExecute', validLangs: ['typescript', 'javascript', 'python', 'bash', 'shell'] },
  ],
  notes: [
    { icon: Save, label: 'Save to Note', action: 'onSaveToNote' },
  ],
  knowledge: [
    { icon: BookOpen, label: 'Add to Knowledge', action: 'onAddToKnowledge' },
  ],
  study: [
    { icon: Plus, label: 'Add to References', action: 'onAddToReferences' },
  ],
};

export function WorkspaceActionButtons({
  workspaceType,
  code,
  language,
  onExecute,
  onSaveToNote,
  onAddToKnowledge,
  onAddToReferences,
  className,
}: WorkspaceActionButtonsProps) {
  const actions = WORKSPACE_ACTIONS[workspaceType] || [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {actions.map((actionConfig) => {
        const { icon: Icon, label, action, validLangs } = actionConfig;
        const callback = { onExecute, onSaveToNote, onAddToKnowledge, onAddToReferences }[action];

        // Skip if language not valid for this action
        if (validLangs && language && !validLangs.includes(language)) {
          return null;
        }

        // Skip if no callback provided
        if (!callback) {
          return null;
        }

        return (
          <button
            key={action}
            type="button"
            onClick={() => callback(code, language)}
            className={cn(
              'flex items-center gap-1 px-2 py-1',
              'text-xs font-mono font-semibold',
              'bg-primary/10 text-primary border border-primary/30',
              'rounded-none shadow-sm',
              'hover:bg-primary/20 active:translate-y-[1px] active:shadow-none',
              'transition-all duration-150'
            )}
            title={`${label} in ${workspaceType} workspace`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
```

### Files to Modify

#### 2. `src/presentation/components/chat/CodeBlock.tsx`

Add `workspaceType` prop and integrate `WorkspaceActionButtons`:

```typescript
export interface CodeBlockProps {
  // ... existing props
  /** Current workspace type for workspace-specific actions */
  workspaceType?: WorkspaceType;
  /** Callback for workspace-specific actions */
  onWorkspaceAction?: (action: string, code: string) => void;
}

export function CodeBlock({
  code,
  language,
  workspaceType,
  onWorkspaceAction,
  // ... other props
}: CodeBlockProps) {
  // ... existing code

  return (
    <div className={cn(/* ... */)}>
      {/* Header */}

      {/* Code content */}

      {/* Workspace-specific actions */}
      {workspaceType && (
        <WorkspaceActionButtons
          workspaceType={workspaceType}
          code={code}
          language={language}
          onExecute={(code, lang) => onWorkspaceAction?.('execute', code)}
          onSaveToNote={(code) => onWorkspaceAction?.('saveToNote', code)}
          onAddToKnowledge={(code) => onWorkspaceAction?.('addToKnowledge', code)}
          onAddToReferences={(code) => onWorkspaceAction?.('addToReferences', code)}
        />
      )}

      {/* Existing action buttons */}
      {showActions && !accepted && (
        <div className="flex items-center justify-end gap-2 px-3 py-2 bg-muted/30 border-t border-border">
          {/* ... existing Accept/Reject buttons */}
        </div>
      )}
    </div>
  );
}
```

#### 3. `src/presentation/components/chat/ChatBubble.tsx` (or equivalent)

Pass `workspaceType` to `CodeBlock`:

```typescript
// In ChatBubble render:
<CodeBlock
  workspaceType={workspaceType}  // NEW
  onWorkspaceAction={handleWorkspaceAction}  // NEW
  code={content}
  language={language}
/>
```

---

## Action Implementations

### Execute in Terminal (IDE)

```typescript
// In parent component handler:
const handleWorkspaceAction = (action: string, code: string) => {
  switch (action) {
    case 'execute':
      // Send code to terminal for execution
      terminalTools?.executeCommand(code, [], { cwd: projectPath });
      toast.success('Code sent to terminal');
      break;
    // ... other cases
  }
};
```

### Save to Note (Notes)

```typescript
case 'saveToNote':
  // Open note picker dialog
  setPendingCode(code);
  setShowNotePicker(true);
  break;
```

```typescript
// Note picker dialog:
const NotePicker = ({ code, onSave }) => {
  const { notes } = useNoteStore();

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>Select Note</DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => onSave(note.id, code)}
            >
              {note.title}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### Add to Knowledge/Study

```typescript
case 'addToKnowledge':
  knowledgeTools?.addReference({
    type: 'code',
    content: code,
    language,
    source: 'agent',
  });
  toast.success('Added to knowledge base');
  break;

case 'addToReferences':
  studyTools?.addReference({
    type: 'code',
    content: code,
    language,
    timestamp: Date.now(),
  });
  toast.success('Added to references');
  break;
```

---

## Design Specifications

### Button Styles

| Workspace | Button Color | Icon | Label |
|-----------|--------------|------|-------|
| IDE | Primary blue | Terminal | Execute |
| Notes | Green | Save | Save to Note |
| Knowledge | Purple | BookOpen | Add to Knowledge |
| Study | Yellow | Plus | Add to References |

### Language Restrictions

The "Execute" button should only show for executable languages:
- `typescript`, `javascript`, `tsx`, `jsx`
- `python`, `py`
- `bash`, `shell`
- Any other code-execution language

Hidden for:
- `markdown`, `md`
- `text`, `txt`
- `json`, `yaml` (data formats, not executable)

---

## Component Examples

### IDE Workspace - Code Block

```
┌─────────────────────────────────────────┐
│ TYPESCRIPT              [Copy] [Save]  │
├─────────────────────────────────────────┤
│ const x = 1;                             │
│ console.log(x);                          │
├─────────────────────────────────────────┤
│ [Execute]                        [✗] [✓]│
└─────────────────────────────────────────┘
```

### Notes Workspace - Code Block

```
┌─────────────────────────────────────────┐
│ TYPESCRIPT              [Copy] [Save]  │
├─────────────────────────────────────────┤
│ const x = 1;                             │
│ console.log(x);                          │
├─────────────────────────────────────────┤
│ [Save to Note]                  [✗] [✓]│
└─────────────────────────────────────────┘
```

### Knowledge Workspace - Code Block

```
┌─────────────────────────────────────────┐
│ TYPESCRIPT              [Copy] [Save]  │
├─────────────────────────────────────────┤
│ const x = 1;                             │
│ console.log(x);                          │
├─────────────────────────────────────────┤
│ [Add to Knowledge]               [✗] [✓]│
└─────────────────────────────────────────┘
```

---

## Implementation Tasks

| Task | Type | Effort | Depends On |
|------|------|--------|------------|
| Create WorkspaceActionButtons component | Implementation | 30m | - |
| Add workspaceType prop to CodeBlock | Implementation | 15m | Component |
| Integrate actions in CodeBlock render | Implementation | 20m | Props |
| Implement Execute action handler | Implementation | 30m | CodeBlock |
| Implement Save to Note handler + dialog | Implementation | 30m | CodeBlock |
| Implement Add to Knowledge handler | Implementation | 15m | CodeBlock |
| Implement Add to References handler | Implementation | 15m | CodeBlock |
| Test all workspace actions | Testing | 30m | All above |

**Total Estimated Effort:** ~2 hours

---

## Testing Checklist

### IDE Workspace
- [ ] Execute button shows for code languages
- [ ] Execute button hidden for markdown/text
- [ ] Execute sends code to terminal
- [ ] Toast shows success message

### Notes Workspace
- [ ] Save to Note button shows
- [ ] Note picker dialog opens
- [ ] Code appended to selected note
- [ ] Browser mode saves to browser mode project

### Knowledge Workspace
- [ ] Add to Knowledge button shows
- [ ] Reference added to knowledge base
- [ ] Toast confirms addition

### Study Workspace
- [ ] Add to References button shows
- [ ] Reference added to study references
- [ ] Toast confirms addition

---

## Handoff

**Story Status:** READY TO IMPLEMENT
**Next Phase:** Implementation

### Files Created
- [x] Story artifact (this file)

### Files to Create
1. `src/presentation/components/chat/WorkspaceActionButtons.tsx`

### Files to Modify
1. `src/presentation/components/chat/CodeBlock.tsx`
2. `src/presentation/components/chat/ChatBubble.tsx` (or equivalent chat message component)

### Dependencies
- Can be developed in parallel with 46-02, 46-03
- Requires workspace context from useWorkspaceContext

---

## Notes

**Why This Matters:**

1. **Workspace Consistency** - Actions match workspace capabilities
2. **User Expectations** - No unavailable actions shown
3. **Productivity** - Direct actions without manual copy-paste
4. **Discovery** - Users learn workspace capabilities through visible actions

**Complexity Consideration:**

This is a P2 feature because:
- UI enhancement (doesn't change core behavior)
- Builds on existing infrastructure
- Can be added incrementally
- Individual actions can be added separately

**Future Enhancements:**

- Custom actions per workspace configuration
- User-configured action buttons
- Action history and favorites
- Batch actions (multiple code blocks)

---

## Related Stories

- **46-01**: Provides workspace context for action decisions
- **46-03**: Workspace badge display complements action buttons
- **EPIC-47**: Workspace-aware artifacts expands on these actions
