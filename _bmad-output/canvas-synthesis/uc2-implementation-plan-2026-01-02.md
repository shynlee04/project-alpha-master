# UC2 Canvas-RAG Linkage - Implementation Plan

**Date**: 2026-01-02
**Iteration**: 464
**Status**: Phase 2 - Implementation Planning
**Estimated Effort**: 6-8 hours

---

## Executive Summary

**Current State Analysis**:
- ✅ Canvas component with ReactFlow exists (235 lines)
- ✅ LinkageAnalyzer service exists (472 lines)
- ✅ LinkageProposalsPanel already imported in Canvas.tsx
- ✅ Linkage types defined (LinkageProposal, NodeAnalysis, LinkageType)
- ❌ **GAP**: No RAG embedding integration for semantic similarity
- ❌ **GAP**: AI enhancement not implemented (TODO at line 403)
- ❌ **GAP**: Chunk-level nodes not supported

**Implementation Strategy**:
Build on existing architecture with minimal changes. Integrate RAG embeddings for semantic similarity, implement AI enhancement using Gemini API, and add chunk-level linkage support.

**Key Deliverables**:
1. RAG-aware LinkageAnalyzer extension (use embeddings for similarity)
2. AI enhancement service (Gemini API for linkage reasoning)
3. CanvasRAGLinkagePanel UI component (150 lines)
4. NodeSourcePicker component (120 lines)
5. Enhanced LinkageVisualization (180 lines)

---

## Architecture Overview

### Existing Components (Reuse ✅)

```typescript
// src/lib/canvas/linkage-analyzer.ts (472 lines) - EXISTING
export class LinkageAnalyzer {
  async analyze(nodes: Node[]): Promise<LinkageAnalysis>
  private calculateSimilarity(analysis1, analysis2): SimilarityScore
  private generateProposals(nodes, analyses): Promise<LinkageProposal[]>
  private async enhanceWithAI(proposals, analyses): Promise<LinkageProposal[]>
  // Note: enhanceWithAI is a TODO (line 403)
}

// src/presentation/components/canvas/Canvas.tsx (235 lines) - EXISTING
import { LinkageProposalsPanel } from './LinkageProposalsPanel';
// Line 206: <LinkageProposalsPanel />
```

### New Components to Build

```
UC2 Canvas-RAG Linkage Components (3 new files)
├── CanvasRAGLinkagePanel.tsx (150 lines) - Main UI
├── NodeSourcePicker.tsx (120 lines) - Node selection
└── EnhancedLinkageVisualization.tsx (180 lines) - Proposal display

Services (2 new files)
├── rag-linkage-analyzer.ts (200 lines) - Extend LinkageAnalyzer
└── linkage-ai-enhancer.ts (180 lines) - Gemini AI integration

Types (1 extended file)
└── linkage-types.ts - Add RAG-specific types
```

---

## Data Flow Design

### Current Flow (Heuristic-Based)

```
User selects 2+ nodes in Canvas
  → LinkageAnalyzer.analyze() called
  → Extract concepts/keywords from synthesis frontmatter
  → Calculate similarity:
    - Concept overlap (70% weight)
    - Keyword overlap (30% weight)
    - Subject match bonus (+0.2)
  → Generate proposals with confidence scores
  → Display in LinkageProposalsPanel
  → User accepts/dismisses proposals
  → Create edges in Canvas
```

### Enhanced Flow (RAG + AI)

```
User selects 2+ nodes in Canvas
  → RAGLinkageAnalyzer.analyze() called (NEW)
  → Fetch RAG embeddings from Orama index
  → Calculate semantic similarity using cosine similarity
  → Hybrid scoring:
    - Semantic similarity (embeddings): 50%
    - Concept overlap (synthesis): 30%
    - Keyword overlap (title): 20%
  → Generate initial proposals
  → AI Enhancement Service called (NEW)
    - Send proposals to Gemini API
    - Get detailed rationales
    - Refine confidence scores
    - Generate human-readable explanations
  → Display enhanced proposals in CanvasRAGLinkagePanel
  → User reviews with confidence badges
  → Accept/Dismiss with Tinder-style swipe
  → Create edges in Canvas with relationship types
```

---

## Component Specifications

### 1. RAGLinkageAnalyzer Service

**File**: `src/lib/canvas/rag-linkage-analyzer.ts` (NEW, 200 lines)

**Purpose**: Extend existing LinkageAnalyzer to use RAG embeddings for semantic similarity

**Key Features**:
- Fetch embeddings from Orama index
- Calculate cosine similarity between embeddings
- Hybrid scoring: semantic + concept + keyword
- Fallback to heuristic if embeddings unavailable

**Interface**:
```typescript
interface RAGLinkageAnalyzerOptions extends LinkageAnalyzerOptions {
  projectId: string;
  useEmbeddings?: boolean; // default: true
  semanticWeight?: number; // default: 0.5
  conceptWeight?: number;  // default: 0.3
  keywordWeight?: number;  // default: 0.2
}

export class RAGLinkageAnalyzer extends LinkageAnalyzer {
  constructor(options: RAGLinkageAnalyzerOptions)

  // Override analyze method to use embeddings
  async analyze(nodes: Node[]): Promise<LinkageAnalysis>

  // New: Fetch embeddings from Orama index
  private async fetchNodeEmbeddings(nodes: Node[]): Promise<Map<string, number[]>>

  // New: Calculate cosine similarity
  private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number

  // New: Hybrid similarity calculation
  private calculateHybridSimilarity(
    analysis1: NodeAnalysis,
    analysis2: NodeAnalysis,
    embedding1?: number[],
    embedding2?: number[]
  ): SimilarityScore
}
```

**Implementation Highlights**:
```typescript
// Fetch embeddings from Orama index
private async fetchNodeEmbeddings(nodes: Node[]): Promise<Map<string, number[]>> {
  const embeddings = new Map<string, number[]>();

  for (const node of nodes) {
    if (node.type === 'source') {
      const data = node.data as SourceNodeData;

      // Query RAG search for source chunks
      const { searchIndex } = await import('@/lib/rag/orama-index');
      const results = await searchIndex(this.projectId, data.title, { limit: 5 });

      // Get embedding from first result (most relevant chunk)
      if (results.length > 0 && results[0].embedding) {
        embeddings.set(node.id, results[0].embedding);
      }
    }
  }

  return embeddings;
}

// Cosine similarity calculation
private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
  const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
  const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

// Hybrid similarity scoring
private calculateHybridSimilarity(
  analysis1: NodeAnalysis,
  analysis2: NodeAnalysis,
  embedding1?: number[],
  embedding2?: number[]
): SimilarityScore {
  let similarity = 0;
  let weights = { semantic: 0, concept: 0, keyword: 0 };

  // Semantic similarity (embeddings)
  if (embedding1 && embedding2) {
    weights.semantic = this.options.semanticWeight || 0.5;
    const semanticSim = this.calculateCosineSimilarity(embedding1, embedding2);
    similarity += semanticSim * weights.semantic;
  }

  // Concept overlap (from synthesis frontmatter)
  const sharedConcepts = analysis1.concepts.filter(c => analysis2.concepts.includes(c));
  if (analysis1.concepts.length > 0 && analysis2.concepts.length > 0) {
    weights.concept = this.options.conceptWeight || 0.3;
    const conceptOverlap = (sharedConcepts.length * 2) / (analysis1.concepts.length + analysis2.concepts.length);
    similarity += conceptOverlap * weights.concept;
  }

  // Keyword overlap (from title)
  const sharedKeywords = analysis1.keywords.filter(k => analysis2.keywords.includes(k));
  if (analysis1.keywords.length > 0 && analysis2.keywords.length > 0) {
    weights.keyword = this.options.keywordWeight || 0.2;
    const keywordOverlap = (sharedKeywords.length * 2) / (analysis1.keywords.length + analysis2.keywords.length);
    similarity += keywordOverlap * weights.keyword;
  }

  // Subject match bonus
  if (analysis1.subject && analysis1.subject === analysis2.subject) {
    similarity += 0.1;
  }

  return {
    node1Id: analysis1.nodeId,
    node2Id: analysis2.nodeId,
    similarity: Math.min(similarity, 1),
    sharedConcepts: [...sharedConcepts, ...sharedKeywords],
    weights, // Track weights for transparency
  };
}
```

**Integration Point**: Extend LinkageAnalyzer, maintain backward compatibility

---

### 2. LinkageAIEnhancer Service

**File**: `src/lib/canvas/linkage-ai-enhancer.ts` (NEW, 180 lines)

**Purpose**: Implement AI enhancement using Gemini API to provide detailed rationales and refine confidence scores

**Key Features**:
- Call Gemini API with proposal context
- Generate human-readable explanations
- Refine confidence scores based on semantic understanding
- Suggest optimal edge labels

**Interface**:
```typescript
interface AIEnhancementOptions {
  apiKey: string;
  modelId?: string; // default: 'gemini-1.5-flash'
  maxProposals?: number; // default: 5
}

export interface EnhancedProposal extends LinkageProposal {
  aiRationale: string;
  suggestedLabel: string;
  confidenceRefined: number;
  keywords: string[];
  entities: string[];
}

export class LinkageAIEnhancer {
  constructor(options: AIEnhancementOptions)

  // Enhance proposals with AI analysis
  async enhanceProposals(
    proposals: LinkageProposal[],
    nodeAnalyses: Map<string, NodeAnalysis>
  ): Promise<EnhancedProposal[]>

  // Generate AI prompt for enhancement
  private generateEnhancementPrompt(
    proposals: LinkageProposal[],
    nodeAnalyses: Map<string, NodeAnalysis>
  ): string

  // Parse AI response
  private parseAIResponse(response: string): EnhancedProposal[]
}
```

**Implementation Highlights**:
```typescript
async enhanceProposals(
  proposals: LinkageProposal[],
  nodeAnalyses: Map<string, NodeAnalysis>
): Promise<EnhancedProposal[]> {
  // Limit to top N proposals to control token usage
  const topProposals = proposals
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, this.options.maxProposals || 5);

  // Generate prompt
  const prompt = this.generateEnhancementPrompt(topProposals, nodeAnalyses);

  // Call Gemini API
  const { generateContent } = await import('@google/genai');
  const genAI = new GoogleGenerativeAI(this.options.apiKey);
  const model = genAI.getGenerativeModel({ model: this.options.modelId || 'gemini-1.5-flash' });

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  // Parse response
  return this.parseAIResponse(response);
}

private generateEnhancementPrompt(
  proposals: LinkageProposal[],
  nodeAnalyses: Map<string, NodeAnalysis>
): string {
  const proposalsContext = proposals.map(proposal => {
    const analysis1 = nodeAnalyses.get(proposal.sourceNodeId);
    const analysis2 = nodeAnalyses.get(proposal.targetNodeId);

    return `
Proposal ID: ${proposal.id}
Source Node: ${analysis1?.keywords.join(', ')}
Target Node: ${analysis2?.keywords.join(', ')}
Current Confidence: ${proposal.confidence.toFixed(2)}
Linkage Type: ${proposal.linkageType}
Shared Concepts: ${proposal.evidence.slice(0, 3).join(', ')}
`;
  }).join('\n');

  return `
You are an expert knowledge graph analyst. Analyze the following linkage proposals between knowledge nodes and provide:

1. Refined confidence score (0-1)
2. Detailed rationale explaining the connection
3. Suggested edge label (max 5 words)
4. Key entities involved (max 5)
5. Relevant keywords (max 5)

For each proposal, respond in this JSON format:
{
  "id": "proposal-id",
  "confidenceRefined": 0.85,
  "aiRationale": "These sources discuss X and Y from complementary perspectives...",
  "suggestedLabel": "Complementary views on X",
  "entities": ["entity1", "entity2"],
  "keywords": ["keyword1", "keyword2"]
}

Proposals to analyze:
${proposalsContext}

Respond only with valid JSON array, no additional text.
`;
}

private parseAIResponse(response: string): EnhancedProposal[] {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const enhanced = JSON.parse(jsonMatch[0]);
    return enhanced.map((e: any) => ({
      ...e,
      confidence: e.confidenceRefined,
    }));
  } catch (error) {
    console.error('[LinkageAIEnhancer] Failed to parse AI response:', error);
    return [];
  }
}
```

**Integration Point**: Replace TODO at LinkageAnalyzer.enhanceWithAI() (line 403)

**API Key**: Use provided Gemini API key: `AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ`

---

### 3. CanvasRAGLinkagePanel Component

**File**: `src/presentation/components/canvas/CanvasRAGLinkagePanel.tsx` (NEW, 150 lines)

**Purpose**: Main UI for linkage discovery and proposal management

**Key Features**:
- Trigger linkage analysis on selected nodes
- Display progress during analysis
- Show proposal count by confidence tier
- Auto-accept high-confidence proposals (optional)
- Integration with RAGLinkageAnalyzer + AIEnhancer

**Interface**:
```typescript
interface CanvasRAGLinkagePanelProps {
  projectId: string;
  onProposalsGenerated?: (proposals: LinkageProposal[]) => void;
  onProposalAccepted?: (proposal: LinkageProposal) => void;
  onProposalDismissed?: (proposalId: string) => void;
}

export function CanvasRAGLinkagePanel({
  projectId,
  onProposalsGenerated,
  onProposalAccepted,
  onProposalDismissed,
}: CanvasRAGLinkagePanelProps) {
  // Component implementation
}
```

**Component Structure** (max 150 lines):
```typescript
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { useCanvasStore } from '@/infrastructure/persistence/stores';
import { RAGLinkageAnalyzer } from '@/lib/canvas/rag-linkage-analyzer';
import { LinkageAIEnhancer } from '@/lib/canvas/linkage-ai-enhancer';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';
import { Sparkles, Loader2 } from 'lucide-react';

export function CanvasRAGLinkagePanel({
  projectId,
  onProposalsGenerated,
  onProposalAccepted,
  onProposalDismissed,
}: CanvasRAGLinkagePanelProps) {
  const { t } = useTranslation();
  const { nodes, selectedNodeIds } = useCanvasStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proposals, setProposals] = useState<LinkageProposal[]>([]);
  const [analysisStats, setAnalysisStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  const handleGenerateLinkages = useCallback(async () => {
    if (selectedNodeIds.length < 2) {
      console.warn('[CanvasRAGLinkagePanel] Need at least 2 selected nodes');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Filter selected nodes
      const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));

      // Initialize RAG-aware analyzer
      const analyzer = new RAGLinkageAnalyzer({ projectId });

      // Run analysis
      const analysis = await analyzer.analyze(selectedNodes);

      // Enhance with AI
      const enhancer = new LinkageAIEnhancer({
        apiKey: 'AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ',
      });

      const enhancedProposals = await enhancer.enhanceProposals(
        analysis.proposals,
        new Map() // Node analyses from analyzer
      );

      // Update state
      setProposals(enhancedProposals);
      setAnalysisStats({
        total: enhancedProposals.length,
        high: enhancedProposals.filter(p => p.confidence >= 0.85).length,
        medium: enhancedProposals.filter(p => p.confidence >= 0.70 && p.confidence < 0.85).length,
        low: enhancedProposals.filter(p => p.confidence < 0.70).length,
      });

      onProposalsGenerated?.(enhancedProposals);
    } catch (error) {
      console.error('[CanvasRAGLinkagePanel] Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, selectedNodeIds, projectId, onProposalsGenerated]);

  return (
    <div className="flex flex-col gap-2 p-3 bg-background border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          {t('canvas.linkage.title', 'RAG Linkage Analysis')}
        </h3>
        <Button
          size="sm"
          onClick={handleGenerateLinkages}
          disabled={isAnalyzing || selectedNodeIds.length < 2}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={14} className="mr-1 animate-spin" />
              {t('canvas.linkage.analyzing', 'Analyzing...')}
            </>
          ) : (
            t('canvas.linkage.generate', 'Generate Linkages')
          )}
        </Button>
      </div>

      {/* Stats */}
      {proposals.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{t('canvas.linkage.total', 'Total')}: {analysisStats.total}</span>
          <span className="text-green-500">
            {t('canvas.linkage.high', 'High')}: {analysisStats.high}
          </span>
          <span className="text-yellow-500">
            {t('canvas.linkage.medium', 'Medium')}: {analysisStats.medium}
          </span>
          <span className="text-red-500">
            {t('canvas.linkage.low', 'Low')}: {analysisStats.low}
          </span>
        </div>
      )}
    </div>
  );
}
```

**Integration Point**: Add to Canvas.tsx above ReactFlow component (line 160)

---

### 4. NodeSourcePicker Component

**File**: `src/presentation/components/canvas/NodeSourcePicker.tsx` (NEW, 120 lines)

**Purpose**: Multi-select interface for choosing nodes to analyze

**Key Features**:
- Display available source/concept nodes
- Multi-select with checkboxes
- Show node count
- Select all / deselect all
- Filter by node type

**Interface**:
```typescript
interface NodeSourcePickerProps {
  nodes: Node[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  minSelection?: number; // Default: 2
}

export function NodeSourcePicker({
  nodes,
  selectedIds,
  onSelectionChange,
  minSelection = 2,
}: NodeSourcePickerProps) {
  // Component implementation
}
```

**Component Structure** (max 120 lines):
```typescript
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import type { Node } from '@xyflow/react';
import { FileText, Lightbulb } from 'lucide-react';

export function NodeSourcePicker({
  nodes,
  selectedIds,
  onSelectionChange,
  minSelection = 2,
}: NodeSourcePickerProps) {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<'all' | 'source' | 'concept'>('all');

  // Filter nodes by type
  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    return nodes.filter(n => n.type === filterType);
  }, [nodes, filterType]);

  const handleToggleNode = (nodeId: string) => {
    const newSelection = selectedIds.includes(nodeId)
      ? selectedIds.filter(id => id !== nodeId)
      : [...selectedIds, nodeId];
    onSelectionChange(newSelection);
  };

  const handleToggleAll = () => {
    const allSelected = filteredNodes.every(n => selectedIds.includes(n.id));
    onSelectionChange(
      allSelected
        ? selectedIds.filter(id => !filteredNodes.some(n => n.id === id))
        : [...selectedIds, ...filteredNodes.map(n => n.id)]
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          className={`px-2 py-1 rounded ${filterType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          onClick={() => setFilterType('all')}
        >
          {t('canvas.picker.all', 'All')} ({nodes.length})
        </button>
        <button
          className={`px-2 py-1 rounded ${filterType === 'source' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          onClick={() => setFilterType('source')}
        >
          {t('canvas.picker.sources', 'Sources')} ({nodes.filter(n => n.type === 'source').length})
        </button>
        <button
          className={`px-2 py-1 rounded ${filterType === 'concept' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          onClick={() => setFilterType('concept')}
        >
          {t('canvas.picker.concepts', 'Concepts')} ({nodes.filter(n => n.type === 'concept').length})
        </button>
      </div>

      {/* Select all */}
      <div className="flex items-center gap-2 text-xs">
        <Checkbox
          checked={filteredNodes.length > 0 && filteredNodes.every(n => selectedIds.includes(n.id))}
          onCheckedChange={handleToggleAll}
        />
        <span>{t('canvas.picker.selectAll', 'Select All')}</span>
      </div>

      {/* Node list */}
      <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
        {filteredNodes.map((node) => {
          const data = node.data as { title: string; contentType?: string };
          const isSelected = selectedIds.includes(node.id);

          return (
            <div
              key={node.id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                isSelected ? 'bg-primary/10' : 'bg-muted/50'
              }`}
              onClick={() => handleToggleNode(node.id)}
            >
              <Checkbox checked={isSelected} />
              {node.type === 'source' ? (
                <FileText size={14} />
              ) : (
                <Lightbulb size={14} />
              )}
              <span className="text-xs truncate flex-1">{data.title}</span>
            </div>
          );
        })}
      </div>

      {/* Selection count */}
      <div className="text-xs text-muted-foreground text-center">
        {selectedIds.length < minSelection
          ? t('canvas.picker.selectMore', 'Select at least {{min}} nodes', { min: minSelection })
          : t('canvas.picker.selected', '{{count}} selected', { count: selectedIds.length })
        }
      </div>
    </div>
  );
}
```

**Integration Point**: Use in CanvasRAGLinkagePanel or as standalone panel

---

### 5. EnhancedLinkageVisualization Component

**File**: `src/presentation/components/canvas/EnhancedLinkageVisualization.tsx` (NEW, 180 lines)

**Purpose**: Display enhanced proposals with AI rationales and confidence visualization

**Key Features**:
- Tinder-style swipe interface (accept/dismiss)
- Confidence badge with multi-dimensional encoding (color + icon + pattern)
- AI rationale display
- Suggested edge label
- Shared entities/keywords
- Collapsible details

**Interface**:
```typescript
interface EnhancedLinkageVisualizationProps {
  proposals: EnhancedProposal[];
  onAccept: (proposal: EnhancedProposal) => void;
  onDismiss: (proposalId: string) => void;
}

export function EnhancedLinkageVisualization({
  proposals,
  onAccept,
  onDismiss,
}: EnhancedLinkageVisualizationProps) {
  // Component implementation
}
```

**Component Structure** (max 180 lines):
```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { EnhancedProposal } from '@/lib/canvas/linkage-ai-enhancer';

export function EnhancedLinkageVisualization({
  proposals,
  onAccept,
  onDismiss,
}: EnhancedLinkageVisualizationProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const currentProposal = proposals[currentIndex];
  if (!currentProposal) return null;

  // Confidence badge
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) {
      return {
        color: 'text-green-500',
        icon: <CheckCircle size={16} />,
        label: 'High',
        bg: 'bg-green-500/10',
      };
    } else if (confidence >= 0.70) {
      return {
        color: 'text-yellow-500',
        icon: <CheckCircle size={16} />,
        label: 'Medium',
        bg: 'bg-yellow-500/10',
      };
    } else {
      return {
        color: 'text-red-500',
        icon: <XCircle size={16} />,
        label: 'Low',
        bg: 'bg-red-500/10',
      };
    }
  };

  const badge = getConfidenceBadge(currentProposal.confidenceRefined);

  return (
    <div className="flex flex-col gap-3 p-4 bg-background border border-border rounded-lg max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {badge.icon}
          <span className={`text-sm font-medium ${badge.color}`}>
            {badge.label} Confidence
          </span>
          <span className="text-xs text-muted-foreground">
            {(currentProposal.confidenceRefined * 100).toFixed(0)}%
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {proposals.length}
        </span>
      </div>

      {/* Suggested label */}
      <div className="p-2 bg-primary/10 rounded border border-primary/20">
        <p className="text-sm font-medium">{currentProposal.suggestedLabel}</p>
      </div>

      {/* AI rationale */}
      <div className="text-sm">
        <p className="text-muted-foreground">{currentProposal.aiRationale}</p>
      </div>

      {/* Expandable details */}
      <div>
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {t('canvas.linkage.details', 'Details')}
        </button>

        {expanded && (
          <div className="mt-2 space-y-2 text-xs">
            {/* Entities */}
            {currentProposal.entities.length > 0 && (
              <div>
                <span className="font-medium">Entities: </span>
                <span className="text-muted-foreground">
                  {currentProposal.entities.join(', ')}
                </span>
              </div>
            )}

            {/* Keywords */}
            {currentProposal.keywords.length > 0 && (
              <div>
                <span className="font-medium">Keywords: </span>
                <span className="text-muted-foreground">
                  {currentProposal.keywords.join(', ')}
                </span>
              </div>
            )}

            {/* Evidence */}
            {currentProposal.evidence.length > 0 && (
              <div>
                <span className="font-medium">Shared Concepts: </span>
                <span className="text-muted-foreground">
                  {currentProposal.evidence.slice(0, 5).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            onDismiss(currentProposal.id);
            setCurrentIndex(Math.min(currentIndex + 1, proposals.length - 1));
          }}
        >
          <XCircle size={14} className="mr-1" />
          {t('canvas.linkage.dismiss', 'Dismiss')}
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            onAccept(currentProposal);
            setCurrentIndex(Math.min(currentIndex + 1, proposals.length - 1));
          }}
        >
          <CheckCircle size={14} className="mr-1" />
          {t('canvas.linkage.accept', 'Accept')}
        </Button>
      </div>
    </div>
  );
}
```

**Integration Point**: Replace existing LinkageProposalsPanel or use as overlay

---

## Integration Points & Migration Strategy

### 1. Canvas.tsx Integration

**Current State** (line 206):
```typescript
<LinkageProposalsPanel />
```

**Enhanced State** (replace with):
```typescript
<CanvasRAGLinkagePanel
  projectId={projectId}
  onProposalsGenerated={(proposals) => {
    // Update canvas store with proposals
    useCanvasStore.getState().setProposals(proposals);
  }}
  onProposalAccepted={(proposal) => {
    // Create edge in canvas
    useCanvasStore.getState().addEdge({
      id: `edge-${proposal.id}`,
      source: proposal.sourceNodeId,
      target: proposal.targetNodeId,
      label: proposal.suggestedLabel,
      type: proposal.suggestedRelationship,
      data: {
        confidence: proposal.confidenceRefined,
        linkageType: proposal.linkageType,
      },
    });
  }}
  onProposalDismissed={(proposalId) => {
    // Remove from proposals
    useCanvasStore.getState().removeProposal(proposalId);
  }}
/>
```

**Migration Assessment**:
- ✅ NO BREAKING CHANGES - additive only
- ✅ Existing LinkageProposalsPanel remains functional
- ✅ Canvas store already has proposal management methods
- ✅ ReactFlow edges support custom data for confidence/linkageType

### 2. Store Integration

**Current Store** (`useCanvasStore`):
```typescript
interface CanvasStoreState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeIds: string[];
  proposals: LinkageProposal[];
  setProposals: (proposals: LinkageProposal[]) => void;
  removeProposal: (proposalId: string) => void;
}
```

**Required Additions** (if not already present):
```typescript
interface CanvasStoreState {
  // ... existing fields

  // Proposal management
  proposals: LinkageProposal[];
  setProposals: (proposals: LinkageProposal[]) => void;
  removeProposal: (proposalId: string) => void;
  clearProposals: () => void;

  // Edge creation from proposal
  addEdge: (edge: Edge) => void;
}
```

**Migration Assessment**:
- Check existing store implementation
- Add missing methods if needed
- NO BREAKING CHANGES - only additions

### 3. RAG Integration

**Required RAG Store Data**:
```typescript
// From useRAGStore
const { indexMetadata, searchMode } = useRAGStore(s => ({
  indexMetadata: s.indexMetadata,
  searchMode: s.searchMode,
}));

// Access embeddings via Orama search
import { searchIndex } from '@/lib/rag/orama-index';
const results = await searchIndex(projectId, query, { limit: 5 });
// results[0].embedding contains the vector
```

**Migration Assessment**:
- ✅ RAG store already has indexMetadata
- ✅ Orama search API already exists
- ✅ Embeddings already stored in index
- ⚠️ Need to verify embedding format in Orama results

---

## Risk Assessment & Mitigation

### Risk 1: Breaking Existing Canvas Functionality
**Impact**: HIGH
**Probability**: LOW
**Mitigation**:
- All changes are ADDITIVE - no modifications to existing code
- LinkageAnalyzer extended, not replaced
- New components added alongside existing ones
- Test existing Canvas features before and after
- Verify drag-and-drop still works
- Verify existing node types still render

### Risk 2: Performance Degradation with Many Nodes
**Impact**: MEDIUM
**Probability**: MEDIUM
**Mitigation**:
- Limit analysis to selected nodes only (not all nodes)
- Debounce linkage generation (500ms delay)
- Cache embeddings in memory during session
- Lazy load AI enhancement (only for top 5 proposals)
- Show loading indicators during analysis

### Risk 3: Gemini API Quota/Cost
**Impact**: LOW
**Probability**: LOW
**Mitigation**:
- Use gemini-1.5-flash (faster, cheaper)
- Limit to top 5 proposals per batch
- Implement fallback to heuristic-only mode
- Cache AI-enhanced proposals in session
- User can disable AI enhancement

### Risk 4: Incorrect Linkage Proposals
**Impact**: MEDIUM (UX)
**Probability**: MEDIUM
**Mitigation**:
- Confidence threshold: minimum 0.6 to show proposals
- User review required (no auto-accept unless explicitly enabled)
- Multi-dimensional confidence encoding (color + icon + text)
- Clear rationale displayed with each proposal
- Easy dismiss mechanism
- Undo support for accepted proposals

### Risk 5: Embedding Format Mismatch
**Impact**: MEDIUM
**Probability**: LOW
**Mitigation**:
- Verify embedding format in Orama index first
- Implement fallback to heuristic if embeddings unavailable
- Log warnings for missing embeddings
- Test with real indexed sources

---

## Testing Strategy

### Unit Tests (Vitest)

1. **RAGLinkageAnalyzer**:
   - Test embedding fetch from Orama
   - Test cosine similarity calculation
   - Test hybrid scoring with all weights
   - Test fallback to heuristic without embeddings

2. **LinkageAIEnhancer**:
   - Test prompt generation
   - Test AI response parsing
   - Test error handling for invalid JSON
   - Mock Gemini API calls

3. **Components**:
   - Test CanvasRAGLinkagePanel rendering
   - Test NodeSourcePicker selection logic
   - Test EnhancedLinkageVisualization swipe
   - Test confidence badge calculation

### Integration Tests

1. **End-to-End Flow**:
   - Select 2+ nodes → Generate linkages → Accept proposal → Edge created
   - Verify edge data contains confidence and linkageType
   - Verify edge label matches AI suggestion

2. **RAG Integration**:
   - Index a source → Create source node → Generate linkages
   - Verify embeddings are used for similarity
   - Verify semantic scores are calculated

3. **AI Enhancement**:
   - Generate proposals → Call Gemini API → Parse response
   - Verify confidence refinement
   - Verify AI rationale is displayed

### Manual Testing Checklist

- [ ] Select 2 source nodes → Generate linkages → Proposals displayed
- [ ] Accept high-confidence proposal → Edge created with correct label
- [ ] Dismiss proposal → Removed from list
- [ ] Select 5+ nodes → Analyze performance
- [ ] Toggle AI enhancement on/off → Compare results
- [ ] Test with sources that have no embeddings → Fallback to heuristic
- [ ] Test mobile layout → Panels responsive
- [ ] Test keyboard navigation → Tab/Enter/Escape work
- [ ] Test accessibility → Screen reader announces confidence badges
- [ ] Verify existing Canvas features still work (drag-drop, zoom, pan)

---

## Translation Keys (i18n)

Add to `src/i18n/en.json`:
```json
{
  "canvas": {
    "linkage": {
      "title": "RAG Linkage Analysis",
      "generate": "Generate Linkages",
      "analyzing": "Analyzing...",
      "total": "Total",
      "high": "High",
      "medium": "Medium",
      "low": "Low",
      "accept": "Accept",
      "dismiss": "Dismiss",
      "details": "Details"
    },
    "picker": {
      "all": "All",
      "sources": "Sources",
      "concepts": "Concepts",
      "selectAll": "Select All",
      "selectMore": "Select at least {{min}} nodes",
      "selected": "{{count}} selected"
    }
  }
}
```

Add to `src/i18n/vi.json` (Vietnamese translations):
```json
{
  "canvas": {
    "linkage": {
      "title": "Phân Tích Liên Kết RAG",
      "generate": "Tạo Liên Kết",
      "analyzing": "Đang phân tích...",
      "total": "Tổng",
      "high": "Cao",
      "medium": "Trung bình",
      "low": "Thấp",
      "accept": "Chấp nhận",
      "dismiss": "Từ chối",
      "details": "Chi tiết"
    },
    "picker": {
      "all": "Tất cả",
      "sources": "Nguồn",
      "concepts": "Khái niệm",
      "selectAll": "Chọn tất cả",
      "selectMore": "Chọn ít nhất {{min}} node",
      "selected": "Đã chọn {{count}}"
    }
  }
}
```

Run: `pnpm i18n:extract`

---

## Implementation Order

### Phase 3: Build Components (4-5 hours)

**Hour 1-2: RAGLinkageAnalyzer Service**
1. Create `src/lib/canvas/rag-linkage-analyzer.ts`
2. Extend LinkageAnalyzer with embedding support
3. Implement cosine similarity calculation
4. Implement hybrid similarity scoring
5. Test with real RAG embeddings

**Hour 2-3: LinkageAIEnhancer Service**
1. Create `src/lib/canvas/linkage-ai-enhancer.ts`
2. Implement prompt generation
3. Implement Gemini API integration
4. Implement response parsing
5. Test with real API calls

**Hour 3-4: CanvasRAGLinkagePanel Component**
1. Create `src/presentation/components/canvas/CanvasRAGLinkagePanel.tsx`
2. Implement analysis trigger UI
3. Implement progress indicators
4. Implement stats display
5. Wire to RAGLinkageAnalyzer + AIEnhancer

**Hour 4-5: NodeSourcePicker Component**
1. Create `src/presentation/components/canvas/NodeSourcePicker.tsx`
2. Implement node list with filters
3. Implement multi-select logic
4. Implement select all/deselect all
5. Test selection state management

**Hour 5-6: EnhancedLinkageVisualization Component**
1. Create `src/presentation/components/canvas/EnhancedLinkageVisualization.tsx`
2. Implement confidence badge system
3. Implement AI rationale display
4. Implement Tinder-style swipe interface
5. Implement expandable details

### Phase 4: Integration & Testing (2-3 hours)

**Hour 6-7: Integration**
1. Update Canvas.tsx to use CanvasRAGLinkagePanel
2. Verify store has proposal management methods
3. Add translation keys
4. Run `pnpm i18n:extract`
5. Test end-to-end flow

**Hour 7-8: Testing & Refinement**
1. Run unit tests
2. Run integration tests
3. Manual testing checklist
4. Performance testing with 10+ nodes
5. Accessibility testing
6. Bug fixes and refinements

---

## Success Metrics

1. **Functionality**: All 5 components built and integrated, end-to-end flow working
2. **Code Quality**: All files <300 lines, zero breaking changes, 80%+ test coverage
3. **Performance**: Analysis completes <3s for 10 nodes, <10s for 50 nodes
4. **UX**: Clear confidence indicators, easy accept/dismiss, informative rationales
5. **Integration**: Seamless integration with existing Canvas, RAG store, and AI providers

---

## Dependencies

### Required Packages (Already Installed ✅)
- `@xyflow/react` - React Flow for canvas
- `zustand` - State management
- `@google/genai` - Gemini API client
- `lucide-react` - Icons

### External APIs
- Google Gemini API (API key provided)
- Orama WASM (local embeddings)

---

**END OF IMPLEMENTATION PLAN**

**Next Step**: Begin Phase 3 - Build RAGLinkageAnalyzer Service (Hour 1-2)
