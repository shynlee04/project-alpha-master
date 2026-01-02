/**
 * @fileoverview Canvas RAG Linkage Panel
 * @module presentation/components/canvas/CanvasRAGLinkagePanel
 * @governance EPIC-7-1, UC2
 *
 * Main UI for RAG-aware linkage discovery and proposal management.
 * Integrates RAGLinkageAnalyzer and LinkageAIEnhancer services.
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '@/infrastructure/persistence/stores/canvas-store';
import { createRAGLinkageAnalyzer } from '@/lib/canvas/rag-linkage-analyzer';
import { createLinkageAIEnhancer } from '@/lib/canvas/linkage-ai-enhancer';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';
import { useIDEStore } from '@/lib/state/ide-store';
import { Button } from '@/presentation/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * Props for CanvasRAGLinkagePanel
 */
export interface CanvasRAGLinkagePanelProps {
  /** Callback when proposals are generated */
  onProposalsGenerated?: (proposals: LinkageProposal[]) => void;
  /** Callback when a proposal is accepted */
  onProposalAccepted?: (proposal: LinkageProposal) => void;
  /** Callback when a proposal is dismissed */
  onProposalDismissed?: (proposalId: string) => void;
}

/**
 * CanvasRAGLinkagePanel Component
 *
 * Provides UI for RAG-aware linkage analysis with:
 * - Generate linkages button
 * - Progress indicators
 * - Proposal statistics by confidence tier
 */
export function CanvasRAGLinkagePanel({
  onProposalsGenerated,
  onProposalAccepted,
  onProposalDismissed,
}: CanvasRAGLinkagePanelProps) {
  const { t } = useTranslation();

  // Get canvas state
  const nodes = useCanvasStore((s) => s.nodes);
  const linkageProposals = useCanvasStore((s) => s.linkageProposals);
  const setProposals = useCanvasStore((s) => s.setProposals);
  const acceptProposal = useCanvasStore((s) => s.acceptProposal);
  const dismissProposal = useCanvasStore((s) => s.dismissProposal);

  // Get project ID from IDE store
  const projectId = useIDEStore((s) => s.projectId) || 'default';

  // Local state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  // Calculate stats
  const stats = {
    total: linkageProposals.length,
    high: linkageProposals.filter((p) => p.confidence >= 0.85).length,
    medium: linkageProposals.filter((p) => p.confidence >= 0.7 && p.confidence < 0.85).length,
    low: linkageProposals.filter((p) => p.confidence < 0.7).length,
  };

  // Handle node selection (toggle)
  const handleToggleNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    },
    []
  );

  // Select all source/concept nodes
  const handleSelectAllNodes = useCallback(() => {
    const allNodeIds = new Set(nodes.filter((n) => n.type === 'source' || n.type === 'concept').map((n) => n.id));
    setSelectedNodeIds(allNodeIds);
  }, [nodes]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedNodeIds(new Set());
  }, []);

  // Generate RAG-aware linkages
  const handleGenerateLinkages = useCallback(async () => {
    // Use selected nodes or all nodes if none selected
    const nodesToAnalyze =
      selectedNodeIds.size > 0
        ? nodes.filter((n) => selectedNodeIds.has(n.id))
        : nodes.filter((n) => n.type === 'source' || n.type === 'concept');

    if (nodesToAnalyze.length < 2) {
      console.warn('[CanvasRAGLinkagePanel] Need at least 2 nodes to analyze');
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log(`[CanvasRAGLinkagePanel] Analyzing ${nodesToAnalyze.length} nodes...`);

      // Initialize RAG-aware analyzer
      const analyzer = createRAGLinkageAnalyzer({
        projectId,
        useEmbeddings: true,
      });

      // Run analysis
      const analysis = await analyzer.analyze(nodesToAnalyze);

      console.log(`[CanvasRAGLinkagePanel] Generated ${analysis.proposals.length} proposals`);

      // Enhance with AI (if proposals exist)
      let enhancedProposals = analysis.proposals;

      if (analysis.proposals.length > 0) {
        try {
          const enhancer = createLinkageAIEnhancer({
            apiKey: 'AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ',
            maxProposals: 5,
          });

          enhancedProposals = await enhancer.enhanceProposals(
            analysis.proposals,
            new Map() // Node analyses (optional, not used for now)
          );

          console.log(`[CanvasRAGLinkagePanel] AI-enhanced ${enhancedProposals.length} proposals`);
        } catch (error) {
          console.warn('[CanvasRAGLinkagePanel] AI enhancement failed, using heuristic proposals:', error);
          // Fall back to heuristic proposals
          enhancedProposals = analysis.proposals;
        }
      }

      // Update store
      setProposals(enhancedProposals);

      // Notify parent
      onProposalsGenerated?.(enhancedProposals);
    } catch (error) {
      console.error('[CanvasRAGLinkagePanel] Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, selectedNodeIds, projectId, setProposals, onProposalsGenerated]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-background border-b border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          {t('canvas.linkage.title', 'RAG Linkage Analysis')}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {selectedNodeIds.size > 0 ? (
            <span>
              {selectedNodeIds.size} {t('canvas.linkage.selected', 'selected')}
            </span>
          ) : (
            <span>
              {nodes.filter((n) => n.type === 'source' || n.type === 'concept').length}{' '}
              {t('canvas.linkage.available', 'available')}
            </span>
          )}
        </div>
      </div>

      {/* Selection controls */}
      {selectedNodeIds.size > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleClearSelection}>
            {t('canvas.linkage.clearSelection', 'Clear')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSelectAllNodes}>
            {t('canvas.linkage.selectAll', 'Select All')}
          </Button>
        </div>
      )}

      {/* Generate button */}
      <Button
        size="sm"
        onClick={handleGenerateLinkages}
        disabled={isAnalyzing || nodes.length < 2}
        className="w-full"
      >
        {isAnalyzing ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" />
            {t('canvas.linkage.analyzing', 'Analyzing...')}
          </>
        ) : (
          <>
            <Sparkles size={14} className="mr-2" />
            {t('canvas.linkage.generate', 'Generate Linkages')}
          </>
        )}
      </Button>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="flex items-center justify-around text-xs py-2 px-3 bg-muted rounded-md">
          <div className="flex flex-col items-center">
            <span className="font-medium">{stats.total}</span>
            <span className="text-muted-foreground">{t('canvas.linkage.total', 'Total')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium text-green-500">{stats.high}</span>
            <span className="text-muted-foreground">{t('canvas.linkage.high', 'High')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium text-yellow-500">{stats.medium}</span>
            <span className="text-muted-foreground">{t('canvas.linkage.medium', 'Medium')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-medium text-red-500">{stats.low}</span>
            <span className="text-muted-foreground">{t('canvas.linkage.low', 'Low')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Default export
 */
export default CanvasRAGLinkagePanel;
