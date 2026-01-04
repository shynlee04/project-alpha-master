# Story E1-1: Integrate UnifiedChatPanel into NotesPage - Context

**Document ID**: `story-context-E1-1-2026-01-05`
**Story**: E1-1 - Integrate UnifiedChatPanel into NotesPage
**Points**: 8
**Status**: IN_PROGRESS
**Created**: 2026-01-05

---

## Story Summary

Add `UnifiedChatPanel` component to the Notes workspace layout with configurable dimensions, collapse functionality, and state persistence.

---

## Acceptance Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| AC-1 | UnifiedChatPanel renders in NotesPage layout | ❌ TODO |
| AC-2 | Chat panel has proper dimensions (configurable, default 30% width) | ❌ TODO |
| AC-3 | Chat panel is collapsible via UI toggle | ❌ TODO |
| AC-4 | Chat state persists when navigating away from Notes | ❌ TODO |
| AC-5 | No console errors or warnings | ❌ TODO |
| AC-6 | TypeScript compiles without errors | ❌ TODO |

---

## Current State Analysis

### Files to Modify

| File | Lines | Current State |
|------|-------|---------------|
| `NotesPage.tsx` | 466 | 2-panel layout (Sidebar 20% \| Editor 80%) |
| `UnifiedChatPanel.tsx` | 183 | ✅ Exists, supports 3 modes |
| `ide-store.ts` | - | Need to add `notes-chat` panel state |

### Component Dependencies

```
NotesPage.tsx
├── UnifiedChatPanel (NEW)
│   ├── ChatPanel (threaded mode)
│   ├── RAGChatPanel (simple mode)
│   └── AgentChatPanel (agent mode)
├── ResizablePanelGroup (extend to 3 panels)
├── NoteSidebar (existing)
└── NoteEditor (existing)
```

---

## Technical Implementation Plan

### Step 1: Extend ResizablePanelGroup to 3 Panels

**Current Layout:**
```tsx
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel id="notes-sidebar" defaultSize={20}>
    <NoteSidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={80}>
    <NoteEditor />
  </ResizablePanel>
</ResizablePanelGroup>
```

**Target Layout:**
```tsx
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel id="notes-sidebar" defaultSize={20}>
    <NoteSidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel id="notes-editor" defaultSize={50}>
    <NoteEditor />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel id="notes-chat" defaultSize={30} collapsible={true}>
    <UnifiedChatPanel mode="agent" projectId={projectId} />
  </ResizablePanel>
</ResizablePanelGroup>
```

### Step 2: Add Chat Panel Collapse State

Add to `useIDEStore`:
```typescript
panelCollapsed: {
  'notes-sidebar': boolean,
  'notes-chat': boolean,  // NEW
  // ...
}
```

### Step 3: Mobile Layout Considerations

- Mobile should hide chat panel by default
- Add toggle button in mobile header to show chat
- Chat takes full screen on mobile when shown

### Step 4: State Persistence

Chat state automatically persists via:
- `useConversationStore` (already persists to IndexedDB)
- Agent state via `useAgentsStore` (localStorage)
- Panel collapse state via `useIDEStore` (localStorage)

---

## File Changes

### Primary Files

| File | Change Type | Lines Added | Lines Modified |
|------|------------|-------------|----------------|
| `NotesPage.tsx` | MODIFY | ~50 | ~20 |
| `ide-store.ts` | MODIFY | ~2 | ~1 |

### New Files

None (reusing existing components)

---

## Testing Strategy

### Unit Tests
- [ ] Render test: UnifiedChatPanel appears in NotesPage
- [ ] Collapse test: Chat panel collapses/expands correctly
- [ ] Persistence test: Panel state survives navigation

### Manual Tests
- [ ] Open Notes workspace, verify chat panel visible
- [ ] Collapse chat panel, verify it stays collapsed on reload
- [ ] Send message, verify it appears in chat
- [ ] Navigate away and back, verify conversation persists
- [ ] Check console for errors/warnings

---

## Integration Points

| Component | Integration Method |
|-----------|-------------------|
| `UnifiedChatPanel` | Direct import and render |
| `useIDEStore` | Add `notes-chat` to panelCollapsed state |
| `useConversationStore` | Automatic (no changes needed) |
| `AgentChatPanel` | Automatic via UnifiedChatPanel agent mode |

---

## Edge Cases & Risks

| Risk | Mitigation |
|------|------------|
| Mobile layout break | Hide chat panel on mobile by default |
| Panel resize conflicts | Use existing `ResizablePanel` pattern |
| State not persisting | Verify IDE store persistence configuration |

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `UnifiedChatPanel` | Internal | ✅ Exists |
| `ResizablePanel` | shadcn/ui | ✅ Exists |
| `useIDEStore` | Zustand store | ✅ Exists |
| `useConversationStore` | Zustand store | ✅ Exists |

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| AC Completion | 6/6 | 0/6 |
| TypeScript Errors | 0 | TBD |
| Console Warnings | 0 | TBD |
| Test Coverage | ≥80% | TBD |

---

## Notes

- Use existing `ResizablePanel` pattern from IDE layout
- Chat panel defaults to 'agent' mode for Notes workspace
- Future: E1-2 will add Notes-specific chat context

---

*Last Updated: 2026-01-05*
*Owner: @bmad-bmm-dev*
