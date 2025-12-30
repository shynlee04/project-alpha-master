---
id: "26-1"
title: "Integrated BlockNote Editor"
status: "in-progress"
created: "2025-12-30T18:30:00+07:00"
last_updated: "2025-12-30T18:55:00+07:00"
epic: 26
phase: "phase-2-extended"
priority: "P0"
estimated_hours: 12
assigned_team: "Team A or B"
---

# Story 26.1: Integrated BlockNote Editor

## User Story

**As a** user creating personal notes,  
**I want** a Notion-like block editor,  
**So that** I can write structured notes with rich formatting.

---

## Acceptance Criteria

### AC-1: Basic Editor Integration
**Given** a user opens the Notes panel  
**When** they create a new note  
**Then** a BlockNote editor initializes with default placeholder text  
**And** editor uses existing design system (dark/light theme via CSS variables)

### AC-2: Slash Commands
**Given** a user types in the editor  
**When** they use slash commands  
**Then** `/heading` creates heading block (H1-H3)  
**And** `/list` creates bullet or numbered list  
**And** `/code` creates a syntax-highlighted code block  
**And** `/quote` creates a blockquote

### AC-3: Auto-Save Persistence
**Given** a user edits a note  
**When** content changes  
**Then** auto-save triggers after 500ms of inactivity (debounced)  
**And** note persists to Dexie `notes` table as JSON blocks  
**And** "Saved" indicator appears in status bar

### AC-4: Mobile Responsiveness
**Given** a user on mobile  
**When** they edit a note  
**Then** formatting toolbar adapts to viewport (floating or bottom-docked)  
**And** touch targets are ≥44px  
**And** virtual keyboard doesn't overlap active block

---

## Technical Tasks

### Task 1: Install BlockNote Dependencies
```bash
npm install @blocknote/core @blocknote/react @blocknote/mantine
```

**Files Modified:**
- `package.json`
- `package-lock.json`

### Task 2: Extend Dexie Schema for Notes

**File:** `src/lib/db/dexie-storage.ts`

```typescript
// Add to schema
notes: '++id, title, parentId, isFavorite, order, createdAt, updatedAt'

// Add interface
interface Note {
  id: string;
  title: string;
  emoji?: string;
  blocks: Block[];        // BlockNote JSON
  parentId?: string;      // For nesting
  isFavorite: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}
```

### Task 3: Create Note Store (Zustand + Dexie)

**File:** `src/lib/notes/note-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/db/dexie-storage';

interface NoteStore {
  // State
  activeNoteId: string | null;
  notes: Map<string, Note>;
  
  // Actions
  createNote: (parentId?: string) => Promise<string>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  loadNotes: () => Promise<void>;
  setActiveNote: (id: string | null) => void;
}

export const useNoteStore = create<NoteStore>()(...);
```

### Task 4: Create NoteEditor Component

**File:** `src/components/notes/NoteEditor.tsx`

```tsx
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useNoteStore } from '@/lib/notes/note-store';

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, updateNote } = useNoteStore();
  const note = notes.get(noteId);
  
  const editor = useCreateBlockNote({
    initialContent: note?.blocks || undefined,
  });
  
  const debouncedSave = useDebouncedCallback(
    async () => {
      await updateNote(noteId, {
        blocks: editor.document,
        updatedAt: Date.now(),
      });
    },
    500
  );
  
  return (
    <div className="note-editor">
      <BlockNoteView 
        editor={editor}
        onChange={debouncedSave}
        theme="dark" // Use CSS variables
      />
    </div>
  );
}
```

### Task 5: Theme Integration (CSS Variables)

**File:** `src/components/notes/note-editor-theme.css`

Override BlockNote styles to use existing CSS variables:
```css
.note-editor .bn-container {
  --bn-colors-editor-background: var(--color-surface);
  --bn-colors-editor-text: var(--color-text-primary);
  --bn-colors-menu-background: var(--color-surface-elevated);
  --bn-colors-tooltip-background: var(--color-surface-elevated);
  --bn-font-family: var(--font-family-primary);
}

/* 8-bit styling compliance */
.note-editor .bn-block-content {
  border-radius: 0; /* rounded-none */
}
```

### Task 6: Mobile Responsiveness

**File:** `src/components/notes/NoteEditor.tsx` (continued)

```tsx
import { useDeviceType } from '@/hooks/useDeviceType';

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { isMobile } = useDeviceType();
  
  return (
    <div className={cn(
      "note-editor",
      isMobile && "note-editor--mobile"
    )}>
      <BlockNoteView 
        editor={editor}
        onChange={debouncedSave}
        theme="dark"
        // Mobile: Use floating toolbar
        formattingToolbar={isMobile ? "floating" : "fixed"}
      />
    </div>
  );
}
```

### Task 7: Barrel Exports

**File:** `src/components/notes/index.ts`
```typescript
export { NoteEditor } from './NoteEditor';
```

**File:** `src/lib/notes/index.ts`
```typescript
export { useNoteStore } from './note-store';
export type { Note } from './types';
```

---

## Testing Requirements

### Unit Tests

**File:** `src/lib/notes/__tests__/note-store.test.ts`

```typescript
describe('Story 26-1: Note Store', () => {
  describe('CRUD Operations', () => {
    it('creates a new note with default content');
    it('updates note blocks on change');
    it('persists note to Dexie');
    it('loads notes from Dexie on init');
    it('deletes note and removes from Dexie');
  });
  
  describe('Auto-Save', () => {
    it('debounces save by 500ms');
    it('shows "Saved" indicator after save');
    it('handles save errors gracefully');
  });
});
```

### Integration Tests

**File:** `src/components/notes/__tests__/NoteEditor.test.tsx`

```typescript
describe('Story 26-1: NoteEditor Component', () => {
  it('renders BlockNote editor');
  it('initializes with existing note content');
  it('responds to slash commands');
  it('auto-saves on content change');
  it('adapts toolbar for mobile');
});
```

---

## Definition of Done

- [ ] BlockNote packages installed
- [ ] Dexie schema extended with `notes` table
- [ ] `useNoteStore` implemented with CRUD actions
- [ ] `NoteEditor` component renders and saves
- [ ] Slash commands work (heading, list, code, quote)
- [ ] Auto-save debounced at 500ms
- [ ] "Saved" indicator visible
- [ ] Dark theme integrated via CSS variables
- [ ] Mobile responsive (toolbar adapts)
- [ ] Touch targets ≥44px on mobile
- [ ] Unit tests passing
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
- [ ] i18n keys added for any UI strings

---

## Dependencies

- **E26-B1:** Install BlockNote packages (this story)
- **E26-D1:** Dexie schema extension (this story)

---

## Demo Checkpoint

✍️ **Create note → Slash commands → Auto-save demo**

Record a screen capture showing:
1. Create new note
2. Type `/heading` → Select H1
3. Type some text
4. Type `/list` → Add bullet points
5. Wait 500ms → "Saved" indicator appears
6. Refresh page → Content restored

---

## Related Artifacts

- Research: `_bmad-output/research/epic-26-knowledge-base-research-2025-12-30.md`
- Epic: `_bmad-output/epics.md` (Epic 26)
- Sprint Status: `_bmad-output/sprint-artifacts/sprint-status.yaml`

---

## Dev Agent Record

### Session: 2025-12-30T18:51:00+07:00

**Agent:** BMAD Master Orchestrator (Dev Mode)

#### Task Progress:
- [x] T1: Install BlockNote packages (pnpm add @blocknote/core @blocknote/react @blocknote/mantine)
- [x] T2: Extend Dexie schema (version 15 with notes table)
- [x] T3: Create Note Store (src/lib/notes/note-store.ts)
- [x] T4: Create NoteEditor component (src/components/notes/NoteEditor.tsx)
- [x] T5: Theme integration (src/components/notes/NoteEditor.css)
- [x] T7: Barrel exports (src/lib/notes/index.ts, src/components/notes/index.ts)
- [ ] T6: Mobile responsiveness (CSS complete, needs manual testing)

#### Research Executed:
- Context7: BlockNote save/load patterns
- Epic Retrospectives: Zustand + Dexie patterns from Epic 6
- Epic Retrospectives: i18n-first from Epic 1

#### Files Created:
| File | Action | Lines |
|------|--------|-------|
| src/lib/notes/types.ts | Created | 169 |
| src/lib/notes/note-store.ts | Created | 354 |
| src/lib/notes/index.ts | Created | 30 |
| src/components/notes/NoteEditor.tsx | Created | 218 |
| src/components/notes/NoteEditor.css | Created | 210 |
| src/components/notes/index.ts | Created | 7 |

#### Files Modified:
| File | Action | Changes |
|------|--------|---------|
| src/lib/state/dexie-db.ts | Schema v15 | +NoteRecord interface, +notes table |
| src/i18n/en.json | i18n | +16 notes.* translation keys |
| package.json | Dependencies | +@blocknote/core, react, mantine |

#### Decisions Made:
1. Used `unknown[]` for blocks type in NoteRecord to avoid circular type dependencies
2. Debounce hook is local to NoteEditor (not extracted to hooks/) for now
3. CSS overrides BlockNote with 8-bit squared corners and dark theme

#### Status:
- TypeScript: ✅ No errors in new files
- i18n: ✅ EN translations added (VI pending)
- Build: ⏳ Not yet verified

#### Remaining Work:
1. Add Vietnamese translations
2. Write unit tests for note-store
3. Write component tests for NoteEditor
4. Manual mobile testing
5. Integration with Knowledge Hub sidebar

