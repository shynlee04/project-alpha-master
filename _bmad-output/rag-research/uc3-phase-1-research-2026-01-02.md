# UC3 Citation UI - Phase 1: Research Report ✅

**Date**: 2026-01-02
**Iteration**: 466
**Type**: Citation UI Research (MCP Tools + Codebase Analysis)
**Status**: Phase 1 Research COMPLETE

---

## Executive Summary

Phase 1 research for **UC3 Citation UI** successfully analyzed citation UI best practices, existing codebase components, PDF rendering capabilities, and citation formatting standards. The research confirms that **basic citation infrastructure exists** but needs enhancement for better UX and PDF source preview.

**Key Finding**: CitationSidebar and SourcePreviewPanel components already exist but are **not integrated with PDF viewing** and lack **context preview** (surrounding text) functionality.

---

## Research Methodology

**MCP Tool Usage** (10 tool turns):
1. ✅ Context7: Resolved react-pdf library documentation
2. ✅ Web Search: Citation UI best practices (Zotero, Mendeley)
3. ✅ Web Search: APA/MLA citation formatting standards 2025
4. ✅ Context7: react-pdf API (highlighting, navigation)
5. ✅ Read: CitationSidebar.tsx (131 lines)
6. ✅ Read: SourcePreviewPanel.tsx (339 lines)
7. ✅ Read: RAGChatPanel.tsx (281 lines)
8. ✅ Read: RAG types (518 lines)
9. ✅ Read: CitationFormatter service (158 lines)
10. ✅ Bash: TypeScript validation (933 errors, no new from UC2)

---

## Finding 1: Existing Citation Infrastructure

### CitationSidebar Component (`src/presentation/components/rag/CitationSidebar.tsx`)

**Current State**: 131 lines (COMPONENT EXISTS)

**Features**:
- ✅ Source attribution (title, source ID)
- ✅ Relevance score display (0-100%)
- ✅ Passage display with blockquote styling
- ✅ Position in document
- ✅ "View Source" button integration
- ✅ Close button

**Missing Features** (Need to Add):
- ❌ Context preview (surrounding text, not just the passage)
- ❌ Copy citation button (APA/MLA format)
- ❌ Page number navigation
- ❌ Highlight in source (link to PDF location)
- ❌ Citation style selector (APA, MLA, Chicago)

**Code Analysis**:
```typescript
// Current implementation (lines 56-115)
export function CitationSidebar({ citation, sourceTitle, onClose, onOpenSource }) {
  return (
    <div className="flex flex-col h-full bg-surface border-l-2 border-border">
      {/* Header */}
      {/* Source Attribution */}
      <div className="mb-4 pb-3 border-b border-border">
        <p className="text-xs text-muted-foreground">Source</p>
        <p className="font-medium text-sm">{citation.title || sourceTitle}</p>
        <Button onClick={() => onOpenSource?.(citation.sourceId)}>
          <ExternalLink size={12} />
          View Source
        </Button>
      </div>

      {/* Relevance Score */}
      {citation.score !== undefined && (
        <div className="mb-4">
          <div className="w-full bg-muted h-2">
            <div className="bg-primary h-full" style={{ width: `${citation.score * 100}%` }} />
          </div>
        </div>
      )}

      {/* Passage */}
      <blockquote className="pl-3 border-l-2 border-primary/50">
        {citation.passage}
      </blockquote>
    </div>
  );
}
```

---

### SourcePreviewPanel Component (`src/presentation/components/knowledge/SourcePreviewPanel.tsx`)

**Current State**: 339 lines (COMPONENT EXISTS)

**Features**:
- ✅ Full source content display
- ✅ Chunk boundary visualization (toggle button)
- ✅ Metadata display and editor
- ✅ Export as text file
- ✅ Reading time calculation
- ✅ Source type icons (PDF, URL, Text)

**Missing Features** (Need to Add):
- ❌ PDF rendering (currently only shows text extraction)
- ❌ Page number navigation
- ❌ Highlight cited passages
- ❌ Jump to specific location in PDF
- ❌ Copy citation with proper formatting

**Code Analysis**:
```typescript
// Current implementation (lines 120-339)
export function SourcePreviewPanel({ projectId }) {
  const { selectedSource, isPreviewOpen, closePreview } = useKnowledgeStore();
  const { getChunksForSource } = useRAGStore();

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[600px]">
      {/* Header with title, icon, close button */}
      {/* Chunk boundary toggle button */}
      <button onClick={() => setShowChunkBoundaries(!showChunkBoundaries)}>
        <Grid3x3 className="w-4 h-4" />
      </button>

      {/* Content area */}
      {showChunkBoundaries ? (
        // Chunked view
        chunks.map((chunk) => (
          <div key={chunk.chunkId}>
            <ChunkBoundaryBadge index={chunk.chunkIndex} tokenCount={chunk.tokenCount} />
            <pre>{chunk.content}</pre>
          </div>
        ))
      ) : (
        // Normal view (PLAIN TEXT ONLY - NO PDF RENDERING)
        <pre>{selectedSource.content}</pre>
      )}

      {/* Metadata display/editor */}
      <MetadataDisplay source={selectedSource} />
    </div>
  );
}
```

**Critical Gap**: SourcePreviewPanel shows **plain text extraction**, not the original PDF. Users cannot see the actual PDF document or navigate pages.

---

## Finding 2: RAG Chat Integration

### RAGChatPanel Component (`src/presentation/components/rag/RAGChatPanel.tsx`)

**Current State**: 281 lines (FULLY FUNCTIONAL)

**Features**:
- ✅ Citation markers in chat responses [1], [2], [3]
- ✅ Click citation marker → open CitationSidebar
- ✅ Streaming responses
- ✅ Message history
- ✅ Clear chat functionality

**Data Flow**:
```typescript
// Citation marker rendering (lines 118-143)
const renderMessageContent = (message: ChatMessage) => {
  const parts = message.content.split(/(\[\d+\])/g);

  return parts.map((part, index) => {
    const citationMatch = part.match(/^\[(\d+)\]$/);
    if (citationMatch) {
      const citationId = parseInt(citationMatch[1], 10);
      const citation = message.citations?.find((c) => c.id === citationId);
      if (citation) {
        return (
          <CitationMarker
            key={index}
            citation={citation}
            onClick={() => onCitationClick(citation)}
          />
        );
      }
    }
    return <span key={index}>{part}</span>;
  });
};
```

**Integration Status**: Chat → CitationSidebar ✅ WORKING
- User clicks citation marker [1] in chat
- CitationSidebar opens with passage details
- User can click "View Source" → opens SourcePreviewPanel

---

## Finding 3: Citation Data Structures

### Citation Type (`src/lib/rag/types.ts`)

```typescript
export interface Citation {
  id: number;              // 1-indexed for display: [1], [2], [3]
  sourceId: string;        // Reference to knowledge source
  title?: string;          // Source document title
  passage: string;         // Passage content with highlighting
  position?: number;       // Position in source document (CHARACTER OFFSET)
  score?: number;          // Relevance score (0-1)
}
```

**Issues**:
- ❌ No page number field
- ❌ No PDF page reference
- ❌ Position is character offset (not useful for PDF navigation)
- ❌ No citation style metadata (APA, MLA)

**Required Enhancement**:
```typescript
export interface EnhancedCitation extends Citation {
  // PDF-specific fields
  pageNumber?: number;
  pdfPath?: string;        // Path to PDF file
  pdfBookmark?: string;    // Named destination in PDF

  // Citation formatting
  citationStyle?: 'APA' | 'MLA' | 'Chicago' | 'Harvard';
  formattedCitation?: Map<'APA' | 'MLA' | 'Chicago', string>;

  // Context preview
  contextBefore?: string;  // 2-3 sentences before passage
  contextAfter?: string;   // 2-3 sentences after passage
}
```

---

## Finding 4: PDF Rendering Capabilities

### react-pdf Library Research

**Library**: `/wojtekmaj/react-pdf` (171 code snippets, high reputation)

**Capabilities** (from Context7 docs):

1. **PDF Page Display**:
```typescript
import { Document, Page } from 'react-pdf';

<Document file="/path/to/document.pdf">
  <Page pageNumber={1} width={800} />
</Document>
```

2. **Text Highlighting** (customTextRenderer):
```typescript
const customTextRenderer = ({ str }) => {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = str.split(regex);
  return parts.map((part) =>
    regex.test(part)
      ? `<mark style="background-color: yellow;">${part}</mark>`
      : part
  ).join('');
};

<Page pageNumber={1} customTextRenderer={customTextRenderer} />
```

3. **Page Navigation**:
```typescript
const [pageNumber, setPageNumber] = useState(1);

<Page pageNumber={pageNumber} />
<button onClick={() => setPageNumber(p => p - 1)}>Previous</button>
<button onClick={() => setPageNumber(p => p + 1)}>Next</button>
```

4. **Thumbnail Sidebar**:
```typescript
<Thumbnail pageNumber={1} width={130} onClick={handleThumbnailClick} />
```

**Integration Requirements**:
- ✅ PDF.js worker configuration required
- ✅ Supports local file paths and URLs
- ✅ Text layer extraction available
- ✅ Highlighting via customTextRenderer
- ✅ Named destinations (bookmarks) supported

---

## Finding 5: Citation Formatting Standards

### APA Style (7th Edition, 2020)

**Format**: Author, A. A. (Year). *Title of work*. Publisher.

**Example**: Smith, J. (2023). *Machine learning fundamentals*. Academic Press.

**In-Text**: (Smith, 2023, p. 45)

### MLA Style (9th Edition, 2021)

**Format**: Author. *Title of Book*. Publisher, Year.

**Example**: Smith. *Machine Learning Fundamentals*. Academic Press, 2023.

**In-Text**: (Smith 45)

**Current Implementation Gap**: ❌ No citation formatting service exists

**Required Service**:
```typescript
export class CitationFormatterService {
  formatAPA(citation: Citation): string;
  formatMLA(citation: Citation): string;
  formatChicago(citation: Citation): string;
  formatInText(citation: Citation, style: 'APA' | 'MLA'): string;
}
```

---

## Finding 6: Industry Best Practices

### Zotero Citation UI (Best Practice Analysis)

**UI Patterns** (from web search research):
1. **Three-Pane Layout**:
   - Left: Source list/library
   - Center: PDF viewer with highlighted citations
   - Right: Citation details/notes

2. **Inline Citations**:
   - Color-coded citation markers in text
   - Hover to preview citation details
   - Click to open full citation sidebar

3. **PDF Integration**:
   - Highlight cited passages in PDF
   - Sidebar shows excerpt from PDF
   - "Jump to PDF" button with page number

4. **Copy Citation**:
   - One-click copy in multiple styles (APA, MLA, Chicago)
   - Clipboard paste-ready formatting

### Mendeley Citation UI

**UI Patterns**:
1. **Citation Badge**:
   - Small numbered badge [1], [2]
   - Color-coded by source
   - Click to expand citation details

2. **Source Panel**:
   - Split view (citation + source metadata)
   - Export citation button
   - Related citations suggestions

---

## Finding 7: Current Integration Status

### Data Flow Analysis

```
User asks question in RAGChatPanel
  ↓
Agent performs RAG retrieval
  ↓
CitationFormatter.formatCitations(results)
  ↓
Chat response with [1], [2] markers
  ↓
User clicks citation marker
  ↓
onCitationClick(citation) called
  ↓
CitationSidebar opens with:
  - Source title
  - Relevance score
  - Passage (blockquote)
  - "View Source" button
  ↓
User clicks "View Source"
  ↓
SourcePreviewPanel opens with:
  - Plain text content (NO PDF RENDERING)
  - Chunk boundaries (toggle)
  - Metadata display
```

**Critical Gaps**:
1. ❌ No PDF page rendering (only text extraction)
2. ❌ No context preview (surrounding text)
3. ❌ No citation copy button (APA/MLA formatted)
4. ❌ No page number navigation
5. ❌ No highlight in PDF (link citation to PDF location)

---

## Finding 8: TypeScript Errors Assessment

**Total Errors**: 933 (same as UC2, no new errors from UC2)

**UC2 Errors** (10 non-blocking):
- linkage-ai-enhancer.ts: 2 errors (dynamic import, type mismatch)
- rag-linkage-analyzer.ts: 7 errors (inheritance types)
- LinkageProposalsPanel.test.tsx: 1 error (unused import)

**UC3 Impact**:
- ✅ No new errors expected from UC3 enhancements
- ✅ react-pdf is well-typed (TypeScript-first)
- ✅ Existing RAG types are solid

---

## Recommendations

### Priority 1: Enhance CitationSidebar (+80 lines)

**Current**: 131 lines
**Target**: ~210 lines (+79 lines)

**Additions**:
1. **Context Preview** (20 lines):
   ```typescript
   // Show 2-3 sentences before and after passage
   <div className="text-xs text-gray-500">
     {citation.contextBefore}
     <mark>{citation.passage}</mark>
     {citation.contextAfter}
   </div>
   ```

2. **Copy Citation Button** (15 lines):
   ```typescript
   <Button onClick={() => copyCitation(citation, 'APA')}>
     Copy APA
   </Button>
   <Button onClick={() => copyCitation(citation, 'MLA')}>
     Copy MLA
   </Button>
   ```

3. **Page Number Display** (5 lines):
   ```typescript
   {citation.pageNumber && (
     <p>Page {citation.pageNumber}</p>
   )}
   ```

4. **Jump to PDF Button** (10 lines):
   ```typescript
   <Button onClick={() => openPDFAtLocation(citation)}>
     <BookOpen size={14} />
     View in PDF
   </Button>
   ```

### Priority 2: Enhance SourcePreviewPanel (+100 lines)

**Current**: 339 lines
**Target**: ~440 lines (+101 lines)

**Additions**:
1. **PDF Viewer Integration** (60 lines):
   ```typescript
   import { Document, Page } from 'react-pdf';

   {source.type === 'pdf' ? (
     <Document file={source.filePath}>
       <Page
         pageNumber={currentPage || 1}
         width={600}
         customTextRenderer={highlightCitedPassage}
       />
     </Document>
   ) : (
     <pre>{source.content}</pre>
   )}
   ```

2. **Page Navigation** (15 lines):
   ```typescript
   <button onClick={() => setPage(p => Math.max(1, p - 1))}>
     Previous
   </button>
   <span>Page {currentPage} of {numPages}</span>
   <button onClick={() => setPage(p => Math.min(numPages, p + 1))}>
     Next
   </button>
   ```

3. **Highlight Cited Passage** (15 lines):
   ```typescript
   const customTextRenderer = ({ str }) => {
     if (str.includes(citation.passage)) {
       return str.replace(citation.passage,
         `<mark className="bg-yellow-200">${citation.passage}</mark>`
       );
     }
     return str;
   };
   ```

4. **Citation Info Bar** (10 lines):
   ```typescript
   <div className="p-2 bg-surface-darker">
     <p>Cited from: {citation.title}</p>
     <p>Page {citation.pageNumber}</p>
   </div>
   ```

### Priority 3: Create SynthesisFromChat Service (120 lines, NEW)

**File**: `src/lib/rag/synthesis-from-chat.ts`

**Purpose**: Enable "Synthesize this" command from chat context

**Implementation**:
```typescript
export class SynthesisFromChat {
  async synthesizeFromCitation(
    citation: Citation,
    artifactType: 'flashcards' | 'quiz' | 'summary'
  ): Promise<SynthesisResult> {
    // 1. Get full source content
    const source = await getSourceById(citation.sourceId);

    // 2. Extract relevant section (±2 chunks around citation)
    const context = extractContext(source, citation.position);

    // 3. Call existing synthesis service
    const synthesis = await synthesisService.synthesize({
      content: context,
      type: artifactType,
    });

    return synthesis;
  }
}
```

**Integration**: Add "Synthesize this" button to CitationSidebar

---

## Technical Considerations

### PDF.js Worker Configuration

**Required Setup**:
```typescript
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();
```

**Performance**: Worker file is ~700KB, loads on first PDF view

### Memory Management

**PDF Documents**: Large PDFs can consume 50-100MB memory
**Recommendation**: Load PDFs lazily, unload when panel closes

### File Path Resolution

**Current Gap**: Knowledge sources have `content` (text extraction) but no `filePath` to original PDF

**Required Enhancement**:
```typescript
export interface SourceMetadata {
  // Existing fields
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'url' | 'text';

  // NEW: Path to original file
  filePath?: string;  // Local path to PDF
  fileHandle?: FileSystemFileHandle;  // File System Access API handle
}
```

---

## Risk Assessment

### Low Risk ✅

1. **React-PDF Integration**: Well-documented, TypeScript-first
2. **Citation Enhancement**: Additive changes, no breaking changes
3. **Existing Components**: Solid foundation, only need enhancement

### Medium Risk ⚠️

1. **PDF File Access**: Need to store original PDF paths in source metadata
2. **Performance**: Large PDFs may slow rendering
3. **Memory**: Concurrent PDF viewing may increase memory usage

### High Risk ❌

**NONE IDENTIFIED**

---

## Success Criteria

### Phase 1: Research ✅ COMPLETE

**Deliverables**:
- ✅ Citation UI best practices analyzed (Zotero, Mendeley)
- ✅ Existing components analyzed (CitationSidebar, SourcePreviewPanel)
- ✅ react-pdf capabilities documented
- ✅ APA/MLA standards researched
- ✅ Data flow documented
- ✅ Gaps identified (PDF rendering, context preview, citation formatting)

**Next Phase**: **Phase 2: Planning** (1 hour)

---

## File Manifest (Phase 1)

### Files Analyzed (6 files)

1. `src/presentation/components/rag/CitationSidebar.tsx` (131 lines)
2. `src/presentation/components/knowledge/SourcePreviewPanel.tsx` (339 lines)
3. `src/presentation/components/rag/RAGChatPanel.tsx` (281 lines)
4. `src/lib/rag/types.ts` (518 lines)
5. `src/lib/rag/citation-formatter.ts` (158 lines)
6. `src/infrastructure/persistence/stores/rag/rag-store.ts` (referenced)

### Documentation Created (1 file)

1. `_bmad-output/rag-research/uc3-phase-1-research-2026-01-02.md` (this file)

### References Consulted (5 MCP tool turns)

1. Context7: react-pdf library documentation
2. Web Search: Citation UI best practices (Zotero, Mendeley)
3. Web Search: APA/MLA citation standards 2025
4. Context7: react-pdf API (highlighting, navigation)
5. Bash: TypeScript validation (933 errors)

---

## Key Insights

### Insight 1: Three-Tier Citation Display

**Industry Standard** (Zotero/Mendeley):
1. **Inline Citation Markers**: [1], [2] in chat text ✅ EXISTS
2. **Citation Sidebar**: Full citation details ✅ EXISTS
3. **PDF Preview**: Source document with highlighted passage ❌ MISSING

**Gap**: We have tiers 1 and 2, but not tier 3

### Insight 2: Context vs Passage

**Current Implementation**: Shows only the cited passage (isolated snippet)

**Best Practice** (Zotero): Show **context preview** (surrounding text)

**Example**:
```
❌ Current: "Machine learning is a subset of AI."

✅ Better: "Data science encompasses various fields.
Machine learning is a subset of AI that focuses on algorithms.
Deep learning is a specialized form of machine learning."
```

**User Value**: Context helps users understand the citation's relevance

### Insight 3: Citation Formatting is Expected

**Academic Standard**: One-click copy citation in APA/MLA format

**Current Gap**: No citation formatting service exists

**User Impact**: Users must manually format citations (friction)

**Solution**: Add CitationFormatterService with APA/MLA/Chicago support

---

## Phase 2: Planning Preview

**Next Steps** (1 hour estimated):
1. Create component specifications (3 components)
2. Map citation → preview data flows
3. Document integration points with RAG
4. Define enhancement strategy (additive vs new components)

**Decision Point**: Should we enhance existing components or build new ones?

**Preliminary Recommendation**: **ENHANCE existing components**
- CitationSidebar: +80 lines (210 total)
- SourcePreviewPanel: +100 lines (440 total)
- SynthesisFromChat: NEW service (120 lines)

**Rationale**:
- ✅ Zero breaking changes
- ✅ Maintain existing functionality
- ✅ Less code than creating new components
- ✅ Follows UC2 success pattern

---

**END OF PHASE 1 RESEARCH REPORT**

**Status**: ✅ COMPLETE
**Next**: Phase 2: Planning (Create component specs, data flows, integration points)
