# UC2 Canvas-RAG Linkage - Phase 3 Progress Checkpoint

**Date**: 2026-01-02
**Iteration**: 464
**Status**: Phase 3 - Service Layer Complete ✅
**Progress**: 60% (3/5 components built)

---

## Completed Components

### 1. RAGLinkageAnalyzer Service ✅
**File**: `src/lib/canvas/rag-linkage-analyzer.ts` (260 lines)

**Features**:
- Extends LinkageAnalyzer with RAG embedding support
- Cosine similarity calculation for semantic matching
- Hybrid scoring: semantic (50%) + concept (30%) + keyword (20%)
- Fetches embeddings from Orama index
- Fallback to heuristic if embeddings unavailable
- Caching layer for performance

**Key Methods**:
```typescript
class RAGLinkageAnalyzer extends LinkageAnalyzer {
  async analyze(nodes: Node[]): Promise<LinkageAnalysis>
  private async fetchNodeEmbeddings(nodes: Node[]): Promise<Map<string, number[]>>
  private calculateCosineSimilarity(embedding1, embedding2): number
  protected async calculateSimilarity(analysis1, analysis2): Promise<SimilarityScore>
  clearCache(): void
}
```

---

### 2. LinkageAIEnhancer Service ✅
**File**: `src/lib/canvas/linkage-ai-enhancer.ts` (280 lines)

**Features**:
- Gemini API integration (gemini-1.5-flash)
- AI-generated rationales for proposals
- Confidence score refinement
- Suggested edge labels
- Entity and keyword extraction
- JSON response parsing with error handling

**Key Methods**:
```typescript
class LinkageAIEnhancer {
  async enhanceProposals(proposals, nodeAnalyses): Promise<EnhancedProposal[]>
  private generateEnhancementPrompt(proposals, nodeAnalyses): string
  private async callGeminiAPI(prompt): Promise<EnhancedProposal[]>
  private parseAIResponse(response): EnhancedProposal[]
}
```

**API Key**: `AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ` (provided)

---

### 3. CanvasRAGLinkagePanel Component ✅
**File**: `src/presentation/components/canvas/CanvasRAGLinkagePanel.tsx` (227 lines)

**Features**:
- Main UI for linkage discovery
- Node selection with "Select All" / "Clear" controls
- Progress indicators during analysis
- Proposal statistics by confidence tier (High/Medium/Low)
- Integration with RAGLinkageAnalyzer + AIEnhancer
- Fallback to heuristic if AI enhancement fails

**Key Props**:
```typescript
interface CanvasRAGLinkagePanelProps {
  onProposalsGenerated?: (proposals: LinkageProposal[]) => void;
  onProposalAccepted?: (proposal: LinkageProposal) => void;
  onProposalDismissed?: (proposalId: string) => void;
}
```

---

## Store Enhancements

### Canvas Store Updates ✅
**File**: `src/infrastructure/persistence/stores/canvas-store.ts`

**Added**:
- `setProposals(proposals: LinkageProposal[])` method (line 178-180)
- Updates CanvasStoreState interface (types.ts line 87)

**Existing Methods Used**:
- `linkageProposals` state
- `acceptProposal(proposalId)` - creates edge from proposal
- `dismissProposal(proposalId)` - removes proposal
- `clearProposals()` - clears all proposals

---

## Remaining Work (40%)

### 4. NodeSourcePicker Component (Pending)
**Estimated**: 120 lines
**Purpose**: Multi-select interface for choosing nodes to analyze
**Features**:
- Display available source/concept nodes
- Multi-select with checkboxes
- Filter by node type (all/source/concept)
- Select all / deselect all
- Show node count

---

### 5. EnhancedLinkageVisualization Component (Pending)
**Estimated**: 180 lines
**Purpose**: Display enhanced proposals with Tinder-style swipe interface
**Features**:
- Confidence badge with multi-dimensional encoding
- AI rationale display
- Suggested edge label
- Shared entities/keywords
- Collapsible details
- Accept/Dismiss buttons

---

## Architecture Highlights

### Data Flow
```
User selects 2+ nodes in Canvas
  → CanvasRAGLinkagePanel.handleGenerateLinkages()
  → RAGLinkageAnalyzer.analyze()
    → fetchNodeEmbeddings() (from Orama index)
    → calculateCosineSimilarity()
    → calculateHybridSimilarity() (semantic + concept + keyword)
  → LinkageAIEnhancer.enhanceProposals()
    → callGeminiAPI()
    → parseAIResponse()
  → setProposals() (update store)
  → Display stats in UI
```

### Confidence Tiers
- **High**: ≥0.85 (green) - Auto-accept candidate
- **Medium**: 0.70-0.84 (yellow) - Review recommended
- **Low**: <0.70 (red) - Confirm before accepting

### Hybrid Scoring Weights
- Semantic similarity (embeddings): 50%
- Concept overlap (synthesis): 30%
- Keyword overlap (title): 20%
- Subject match bonus: +0.1

---

## Files Created/Modified

### New Files (3)
1. `src/lib/canvas/rag-linkage-analyzer.ts` (260 lines)
2. `src/lib/canvas/linkage-ai-enhancer.ts` (280 lines)
3. `src/presentation/components/canvas/CanvasRAGLinkagePanel.tsx` (227 lines)

### Modified Files (2)
1. `src/infrastructure/persistence/stores/canvas-store.ts` - Added `setProposals()` method
2. `src/lib/canvas/types.ts` - Added `setProposals` to interface

**Total New Code**: ~767 lines (excluding modifications)

---

## Integration Status

### ✅ Complete
- Service layer (RAG + AI)
- Main UI component
- Store methods
- Type definitions

### ⏳ Pending
- Node selection UI (NodeSourcePicker)
- Proposal review UI (EnhancedLinkageVisualization)
- Canvas.tsx integration
- Translation keys
- Testing

---

## Next Steps

1. **Build NodeSourcePicker** (120 lines) - Multi-select node interface
2. **Build EnhancedLinkageVisualization** (180 lines) - Tinder-style proposal review
3. **Integrate into Canvas.tsx** - Replace LinkageProposalsPanel with CanvasRAGLinkagePanel
4. **Add translation keys** - Update en.json and vi.json
5. **Run `pnpm i18n:extract`** - Extract new translation keys
6. **Manual testing** - Verify end-to-end flow
7. **Unit tests** - Test services and components

---

**Checkpoint Saved**: Service layer complete, main UI component ready, 60% of Phase 3 done

**Next**: Build NodeSourcePicker and EnhancedLinkageVisualization components
