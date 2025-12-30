---
title: "Epic 26: Intelligent Knowledge Base - Technical Research"
type: research
date: "2025-12-30T18:26:56+07:00"
author: "@bmad-core-bmad-master"
workflow: "deep-research"
status: "VALIDATED"
---

# Epic 26: Intelligent Knowledge Base - Technical Research

**Research Date:** 2025-12-30T18:26:56+07:00  
**Researcher:** BMAD Master Orchestrator (Team A)  
**Workflow:** `/deep-research` + `/bmad-bmm-workflows-sprint-status`

---

## 1. Executive Summary

This research validates the technical proposal for adding a **Notion-like note-taking feature** to Via-gent (Project Alpha). The feature will leverage the **existing stack** for maximum efficiency:

| Component | Status | Technology |
|-----------|--------|-----------|
| Editor UI | **NEW** | BlockNote |
| Vector Search | **EXISTING** | Orama WASM |
| Embeddings | **EXISTING** | Transformers.js |
| Storage | **EXISTING** | Dexie.js |
| AI SDK | **EXISTING** | TanStack AI |

**Key Finding:** Only BlockNote needs to be installed. All other components are already integrated.

---

## 2. Research Methodology

### Sources Consulted

| Source | Tool | Confidence |
|--------|------|------------|
| BlockNote Official Docs | Context7 MCP | High |
| BlockNote GitHub | Exa MCP | High |
| Orama Documentation | Tavily MCP | Medium |
| Existing Codebase | `grep_search` | High |
| Package.json Analysis | `view_file` | High |

---

## 3. Existing Stack Validation

### 3.1 Orama WASM (Already Installed)

**Package:** `@orama/orama` v3.1.18

**Codebase Evidence:**
- `src/lib/rag/orama-index.ts` - Full index management implementation
- `src/lib/rag/hybrid-retriever.ts` - Hybrid search (vector + BM25)
- `src/lib/rag/__tests__/orama-index.test.ts` - 27 passing tests

**Capabilities:**
- ✅ Hybrid search (vector + keyword)
- ✅ IndexedDB persistence via `@orama/plugin-data-persistence`
- ✅ 100% client-side execution
- ✅ Schema already supports document indexing

**Integration Point:**
```typescript
// src/lib/rag/orama-index.ts
export { createIndex, loadIndex, saveIndex, deleteIndex, 
         indexDocument, indexSource, removeFromIndex, 
         searchIndex, getIndexSize, getIndexMetadata };
```

### 3.2 Transformers.js (Already Installed)

**Package:** `@xenova/transformers` v2.17.2

**Codebase Evidence:**
- `src/lib/rag/transformers-loader.ts` - Model loading infrastructure
- `src/lib/rag/embedding-service.ts` - Embedding generation service

**Capabilities:**
- ✅ Local vector embeddings (MiniLM-L6-v2, 384 dimensions)
- ✅ Web Worker compatible
- ✅ No API costs, complete privacy
- ✅ ONNX model support via WebAssembly

**Integration Point:**
```typescript
// src/lib/rag/embedding-service.ts
const { pipeline } = await import('@xenova/transformers');
// Generates 384-dim vectors locally
```

### 3.3 Dexie.js (Already Installed)

**Package:** `dexie` v4.2.1 + `dexie-react-hooks` v4.2.0

**Codebase Evidence:**
- `src/lib/db/dexie-storage.ts` - Core database configuration
- Tables: `projects`, `files`, `threads`, `oramaIndexes`, etc.

**Required Extension:**
Add `notes` table to existing schema:
```typescript
interface Note {
  id: string;           // UUID
  title: string;
  emoji?: string;       // Optional icon
  blocks: Block[];      // BlockNote JSON structure
  parentId?: string;    // For nesting
  isFavorite: boolean;
  order: number;        // Sort order within parent
  createdAt: number;
  updatedAt: number;
}
```

### 3.4 TanStack AI (Already Installed)

**Package:** `@tanstack/ai` v0.2.0 + `@tanstack/ai-gemini` v0.2.0

**Codebase Evidence:**
- `src/lib/agent/` - Full agent implementation
- Tool system already supports client-side tools

**Integration Point:**
Add `search_notes` as a client-side tool definition.

---

## 4. BlockNote Research (New Dependency)

### 4.1 Overview

**Source:** Context7 MCP (`/websites/blocknotejs`)

BlockNote is a **React-first, block-based rich text editor** built on ProseMirror/TipTap. It provides:
- Notion-like editing experience
- Slash commands (`/heading`, `/list`, etc.)
- Drag-and-drop blocks
- JSON output (perfect for RAG)
- Mobile-friendly touch handling

### 4.2 Installation

```bash
npm install @blocknote/core @blocknote/react @blocknote/mantine
```

Alternative for shadcn/ui theming:
```bash
npm install @blocknote/core @blocknote/react @blocknote/shadcn
```

### 4.3 Basic Usage

```tsx
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

export default function NoteEditor() {
  const editor = useCreateBlockNote();
  return <BlockNoteView editor={editor} />;
}
```

### 4.4 Persistence Pattern

```tsx
import { useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@blocknote/core";

export default function NoteEditor({ 
  initialContent, 
  onSave 
}: { 
  initialContent?: Block[];
  onSave: (blocks: Block[]) => void;
}) {
  const editor = useCreateBlockNote({ initialContent });
  
  return (
    <BlockNoteView 
      editor={editor} 
      onChange={() => onSave(editor.document)} 
    />
  );
}
```

### 4.5 Custom Slash Commands

```tsx
const editor = useCreateBlockNote({
  slashMenuItems: [
    ...getDefaultSlashMenuItems(),
    {
      name: "AI Magic",
      execute: (editor) => {
        // Custom AI generation logic
      },
      aliases: ["ai", "magic"],
      group: "AI",
    },
  ],
});
```

### 4.6 Mobile Considerations

- ✅ Built-in touch handling for block handles
- ✅ Adaptive formatting toolbar
- ⚠️ May need CSS overrides for 44px tap targets
- ⚠️ Test virtual keyboard interaction

---

## 5. Architecture Decision

### 5.1 Data Flow

```
┌─────────────────┐
│   User Types    │
└────────┬────────┘
         ↓
┌─────────────────┐
│   BlockNote     │ ← JSON Blocks
└────────┬────────┘
         ↓ (500ms debounce)
┌─────────────────┐
│   Dexie.js      │ ← Persist to IndexedDB
└────────┬────────┘
         ↓ (async)
┌─────────────────┐
│   Web Worker    │ ← Embedding generation
└────────┬────────┘
         ↓
┌─────────────────┐
│ Transformers.js │ ← MiniLM-L6-v2 (384-dim)
└────────┬────────┘
         ↓
┌─────────────────┐
│     Orama       │ ← Hybrid index (vector + BM25)
└─────────────────┘
```

### 5.2 RAG Tool Integration

```typescript
// src/lib/agent/tools/note-search-tool.ts
const searchNotesTool = {
  name: 'search_notes',
  description: 'Search the user\'s personal notes and knowledge base.',
  inputSchema: z.object({ 
    query: z.string().describe('Search query'),
    limit: z.number().optional().default(5)
  }),
  // Client-side execution (not server)
  execute: async ({ query, limit }) => {
    const results = await searchNoteIndex(query, { limit });
    return JSON.stringify(results);
  }
};
```

### 5.3 File Structure

```
src/
├── components/
│   └── notes/
│       ├── NoteEditor.tsx
│       ├── NoteTree.tsx
│       ├── NoteTreeItem.tsx
│       ├── AISlashCommand.tsx
│       └── NoteCitationChip.tsx
├── lib/
│   └── notes/
│       ├── note-store.ts
│       ├── note-indexer.ts
│       ├── note-ai-service.ts
│       └── note-retriever.ts
├── workers/
│   └── embedding.worker.ts
└── stores/
    └── note-navigation-store.ts
```

---

## 6. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| BlockNote bundle size | Medium | Low | Tree-shaking, lazy loading |
| Web Worker embedding slow | Medium | Low | Background processing, progress indicator |
| Mobile keyboard overlap | Low | Medium | `scrollIntoView` on focus |
| Theme integration | Low | Medium | CSS variable overrides |

---

## 7. Recommendations

### Priority Order

1. **Story 26.1** - BlockNote Editor (foundation, 1-2 days)
2. **Story 26.2** - Embedding Pipeline (RAG integration, 1 day)
3. **Story 26.3** - RAG Tool (AI search, 1 day)
4. **Story 26.4** - AI Magic (polish, 1 day)
5. **Story 26.5** - Sidebar Navigation (UX, 1 day)

### First Steps

```bash
# Step 1: Install dependencies
npm install @blocknote/core @blocknote/react @blocknote/mantine

# Step 2: Extend Dexie schema
# Add 'notes' table to src/lib/db/dexie-storage.ts

# Step 3: Create basic NoteEditor component
# Follow Story 26.1 acceptance criteria
```

---

## 8. References

| Source | URL | Type |
|--------|-----|------|
| BlockNote Docs | https://blocknotejs.org | Official |
| BlockNote GitHub | https://github.com/TypeCellOS/BlockNote | Source |
| Orama Docs | https://docs.orama.com | Official |
| Transformers.js | https://huggingface.co/docs/transformers.js | Official |

---

## 9. Appendix: Package.json Validation

**Current Dependencies (Relevant):**
```json
{
  "@orama/orama": "^3.1.18",
  "@orama/plugin-data-persistence": "^3.1.18",
  "@xenova/transformers": "^2.17.2",
  "@tanstack/ai": "^0.2.0",
  "@tanstack/ai-gemini": "^0.2.0",
  "dexie": "^4.2.1",
  "dexie-react-hooks": "^4.2.0"
}
```

**Required Additions:**
```json
{
  "@blocknote/core": "latest",
  "@blocknote/react": "latest",
  "@blocknote/mantine": "latest"
}
```

---

**Document Status:** VALIDATED  
**Ready for Development:** YES  
**Next Step:** Run `/bmad-bmm-workflows-create-story` for Story 26.1
