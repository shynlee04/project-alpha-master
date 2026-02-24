/**
 * @fileoverview Linkage Proposals Panel Component
 * @module components/canvas/LinkageProposalsPanel
 * @governance EPIC-38, STORY-38-4
 *
 * Displays AI-generated linkage proposals for canvas nodes.
 * Allows users to accept or dismiss proposed connections.
 * Enhanced UC2: RAG-aware analysis with semantic similarity.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Panel } from '@xyflow/react';
import { Button } from '../ui/button';
import { PixelBadge } from '../ui/pixel-badge';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';
import { useCanvasStore } from '@/infrastructure/persistence/stores';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { createRAGLinkageAnalyzer } from '@/lib/canvas/rag-linkage-analyzer';
import { createLinkageAIEnhancer } from '@/lib/canvas/linkage-ai-enhancer';
import { Sparkles, Loader2 } from 'lucide-react';

interface LinkageProposalsPanelProps {
  className?: string;
}

/**
 * Map linkage type to badge color
 */
function getLinkageTypeColor(type: LinkageProposal['linkageType']): string {
  switch (type) {
    case 'conceptual':
      return 'bg-info/20 text-info border-info';
    case 'sequential':
      return 'bg-success/20 text-success border-success';
    case 'contrastive':
      return 'bg-purple-500/20 text-purple-300 border-purple-500';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

/**
 * Map confidence score to label
 */
function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

/**
 * Single proposal card component
 */
interface ProposalCardProps {
  proposal: LinkageProposal;
  onAccept: () => void;
  onDismiss: () => void;
}

function ProposalCard({ proposal, onAccept, onDismiss }: ProposalCardProps) {
  const { t } = useTranslation();

  // Check if this is an enhanced proposal
  const isEnhanced = (proposal as any).aiRationale !== undefined;
  const confidenceRefined = (proposal as any).confidenceRefined;
  const aiRationale = (proposal as any).aiRationale;
  const entities = (proposal as any).entities as string[] | undefined;
  const keywords = (proposal as any).keywords as string[] | undefined;

  // Use refined confidence if available, otherwise use base confidence
  const displayConfidence = confidenceRefined ?? proposal.confidence;
  const displayRationale = aiRationale ?? proposal.rationale;

  return (
    <div className="bg-card/90 border border-border rounded p-3 mb-2 hover:border-border transition-colors">
      {/* Header: Type + Confidence */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PixelBadge
            size="sm"
            className={getLinkageTypeColor(proposal.linkageType)}
          >
            {t(`canvas.linkage.type.${proposal.linkageType}`)}
          </PixelBadge>
          {isEnhanced && (
            <PixelBadge size="sm" variant="default" className="bg-purple-500/20 text-purple-300 border-purple-500">
              <Sparkles size={10} className="inline mr-1" />
              AI
            </PixelBadge>
          )}
        </div>
        <PixelBadge size="sm" variant="muted">
          {t(`canvas.linkage.confidence.${getConfidenceLabel(displayConfidence)}`)}
          ({Math.round(displayConfidence * 100)}%)
        </PixelBadge>
      </div>

      {/* Label */}
      <div className="text-foreground font-medium mb-2 text-sm">
        {proposal.suggestedLabel}
      </div>

      {/* Rationale (AI or heuristic) */}
      <div className="text-muted-foreground text-xs mb-3">
        {displayRationale}
      </div>

      {/* Enhanced data: Entities/Keywords */}
      {isEnhanced && (entities || keywords) && (
        <div className="text-xs text-muted-foreground mb-3 space-y-1">
          {entities && entities.length > 0 && (
            <div>
              <span className="font-semibold">{t('canvas.linkage.entities')}: </span>
              {entities.slice(0, 3).join(', ')}
              {entities.length > 3 && '...'}
            </div>
          )}
          {keywords && keywords.length > 0 && (
            <div>
              <span className="font-semibold">{t('canvas.linkage.keywords')}: </span>
              {keywords.slice(0, 3).join(', ')}
              {keywords.length > 3 && '...'}
            </div>
          )}
        </div>
      )}

      {/* Evidence */}
      {proposal.evidence.length > 0 && !isEnhanced && (
        <div className="text-xs text-muted-foreground mb-3">
          <span className="font-semibold">{t('canvas.linkage.evidence')}: </span>
          {proposal.evidence.slice(0, 3).join(', ')}
          {proposal.evidence.length > 3 && '...'}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onAccept}
          className="flex-1 text-xs"
        >
          {t('canvas.linkage.accept')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          className="flex-1 text-xs"
        >
          {t('canvas.linkage.dismiss')}
        </Button>
      </div>
    </div>
  );
}

/**
 * Main panel component
 */
export function LinkageProposalsPanel({ className = '' }: LinkageProposalsPanelProps) {
  const { t } = useTranslation();
  const { linkageProposals, acceptProposal, dismissProposal, clearProposals, nodes, setProposals } = useCanvasStore();
  const projectId = useIDEStore((s) => s.projectId) || 'default';

  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'conceptual' | 'sequential' | 'contrastive'>('all');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Auto-generate proposals when we have 3+ nodes
  React.useEffect(() => {
    if (nodes.length >= 3 && linkageProposals.length === 0) {
      useCanvasStore.getState().generateLinkageProposals();
    }
  }, [nodes.length, linkageProposals.length]);

  // RAG + AI Enhancement handler
  const handleRAGEnhancement = React.useCallback(async () => {
    if (nodes.length < 2) return;

    setIsEnhancing(true);
    try {
      // Use RAG-aware analyzer with embeddings
      const analyzer = createRAGLinkageAnalyzer({
        projectId,
        useEmbeddings: true,
        semanticWeight: 0.5,
        conceptWeight: 0.3,
        keywordWeight: 0.2,
      });

      const analysis = await analyzer.analyze(nodes);

      if (analysis.proposals.length > 0) {
        // Enhance with Gemini AI
        const enhancer = createLinkageAIEnhancer({
          apiKey: 'AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ',
          maxProposals: 10,
          modelId: 'gemini-1.5-flash',
        });

        const enhancedProposals = await enhancer.enhanceProposals(
          analysis.proposals,
          new Map() // Node analyses (optional, not used for now)
        );

        // Set enhanced proposals to store
        setProposals(enhancedProposals);
      }
    } catch (error) {
      console.error('RAG enhancement failed:', error);
      // Fallback to heuristic if enhancement fails
      useCanvasStore.getState().generateLinkageProposals();
    } finally {
      setIsEnhancing(false);
    }
  }, [nodes, projectId, setProposals]);

  const filteredProposals = linkageProposals.filter((p) =>
    filter === 'all' || p.linkageType === filter
  );

  if (linkageProposals.length === 0) {
    return null;
  }

  const proposalCount = filteredProposals.length;
  const totalCount = linkageProposals.length;

  return (
    <Panel
      position="top-left"
      className={`z-10 ${className}`}
      style={{ top: 80, left: 16, width: 320, maxHeight: 'calc(100vh - 120px)' }}
    >
      {/* Header */}
      <div className="bg-card/95 border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground font-semibold text-sm">
              {t('canvas.linkage.title')}
            </h3>
            <PixelBadge size="sm" variant="default">
              {totalCount}
            </PixelBadge>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground text-xs px-2 py-1"
              aria-label={isExpanded ? t('common.collapse') : t('common.expand')}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <button
              onClick={handleRAGEnhancement}
              disabled={isEnhancing || nodes.length < 2}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Enhance with AI"
              title="Enhance proposals with RAG embeddings and AI"
            >
              {isEnhancing ? (
                <><Loader2 size={12} className="animate-spin" />Enhancing...</>
              ) : (
                <><Sparkles size={12} />AI</>
              )}
            </button>
            <button
              onClick={clearProposals}
              className="text-muted-foreground hover:text-foreground text-xs px-2 py-1"
              aria-label={t('common.clear')}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        {isExpanded && (
          <>
            <div className="flex gap-1 mb-3">
              <button
                onClick={() => setFilter('all')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === 'all'
                    ? 'bg-info text-info-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('canvas.linkage.filter.all')} ({totalCount})
              </button>
              <button
                onClick={() => setFilter('conceptual')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === 'conceptual'
                    ? 'bg-info text-info-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('canvas.linkage.filter.conceptual')} ({linkageProposals.filter(p => p.linkageType === 'conceptual').length})
              </button>
              <button
                onClick={() => setFilter('sequential')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === 'sequential'
                    ? 'bg-info text-info-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('canvas.linkage.filter.sequential')} ({linkageProposals.filter(p => p.linkageType === 'sequential').length})
              </button>
              <button
                onClick={() => setFilter('contrastive')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === 'contrastive'
                    ? 'bg-info text-info-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('canvas.linkage.filter.contrastive')} ({linkageProposals.filter(p => p.linkageType === 'contrastive').length})
              </button>
            </div>

            {/* Scrollable proposals list */}
            <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {proposalCount === 0 ? (
                <div className="text-muted-foreground text-xs text-center py-4">
                  {t('canvas.linkage.no_proposals')}
                </div>
              ) : (
                filteredProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onAccept={() => acceptProposal(proposal.id)}
                    onDismiss={() => dismissProposal(proposal.id)}
                  />
                ))
              )}
            </div>

            {/* Bulk actions */}
            {proposalCount > 1 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => filteredProposals.forEach(p => acceptProposal(p.id))}
                    className="flex-1 text-xs"
                  >
                    {t('canvas.linkage.accept_all')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => filteredProposals.forEach(p => dismissProposal(p.id))}
                    className="flex-1 text-xs"
                  >
                    {t('canvas.linkage.dismiss_all')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

export default LinkageProposalsPanel;
