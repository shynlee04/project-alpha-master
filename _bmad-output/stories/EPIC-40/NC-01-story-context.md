# NC-01: Note Code Block Renderer

**Epic**: EPIC-40 - Multimodal Chat Unification
**Story**: NC-01
**Title**: Note Code Block Renderer
**Effort**: 3 hours
**Priority**: P1
**Status**: IN_PROGRESS
**Track**: C
**Created**: 2026-01-10T03:30:00+07:00

## Overview

Implement enhanced code block rendering for notes messages. Integrates with the code chunking system (MM-10) to provide syntax highlighting, copy functionality, and code block metadata display.

## Dependencies

- MM-10: Code-Aware Chunking (DONE) - provides code chunk entities and detection

## Acceptance Criteria

1. **Syntax Highlighting**
   - Detect language from fence info or file extension
   - Apply appropriate syntax highlighting theme
   - Support 15+ languages (JavaScript, TypeScript, Python, etc.)

2. **Code Block Metadata**
   - Display language label
   - Show line numbers (toggleable)
   - Show file path if present

3. **Interactive Features**
   - Copy code button
   - Expand/collapse long blocks
   - Code chunk link to source

4. **Integration with Notes**
   - Render code blocks in note content
   - Link code chunks to note context
   - Support inline code highlighting

## Implementation Tasks

1. Create NoteCodeBlock component
2. Add syntax highlighting (Shiki or similar)
3. Create useCodeChunks hook for notes
4. Integrate with note message rendering
5. Add copy-to-clipboard functionality

## Files to Create

- `src/presentation/components/notes/NoteCodeBlock.tsx`
- `src/presentation/components/notes/useNoteCodeChunks.ts`

## Files to Modify

- `src/presentation/components/notes/NoteMessage.tsx` - Use code block renderer

## Quality Gates

- TypeScript: Zero new errors
- Accessibility: Keyboard navigation for code blocks
- Performance: No render lag for large blocks (>500 lines)

## Notes

- Code blocks use existing 8-bit design tokens
- Copy button uses standard sonner toast
- Line numbers optional (default off for performance)
