/**
 * @fileoverview Linkage Proposals Panel Component
 * @module components/canvas/LinkageProposalsPanel
 * @governance EPIC-38, STORY-38-4
 *
 * Displays AI-generated linkage proposals for canvas nodes.
 * Allows users to accept or dismiss proposed connections.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Panel } from '@xyflow/react';
import { Button } from '../ui/button';
import { PixelBadge } from '../ui/pixel-badge';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';
import { useCanvasStore } from '@/infrastructure/persistence/stores';

interface LinkageProposalsPanelProps {
  className?: string;
}

/**
 * Map linkage type to badge color
 */
function getLinkageTypeColor(type: LinkageProposal['linkageType']): string {
  switch (type) {
    case 'conceptual':
      return 'bg-blue-500/20 text-blue-300 border-blue-500';
    case 'sequential':
      return 'bg-green-500/20 text-green-300 border-green-500';
    case 'contrastive':
      return 'bg-purple-500/20 text-purple-300 border-purple-500';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500';
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

  return (
    <div className="bg-gray-900/90 border border-gray-700 rounded p-3 mb-2 hover:border-gray-600 transition-colors">
      {/* Header: Type + Confidence */}
      <div className="flex items-center justify-between mb-2">
        <PixelBadge
          size="sm"
          className={getLinkageTypeColor(proposal.linkageType)}
        >
          {t(`canvas.linkage.type.${proposal.linkageType}`)}
        </PixelBadge>
        <PixelBadge size="sm" variant="outline">
          {t(`canvas.linkage.confidence.${getConfidenceLabel(proposal.confidence)}`)}
          ({Math.round(proposal.confidence * 100)}%)
        </PixelBadge>
      </div>

      {/* Label */}
      <div className="text-white font-medium mb-2 text-sm">
        {proposal.suggestedLabel}
      </div>

      {/* Rationale */}
      <div className="text-gray-400 text-xs mb-3">
        {proposal.rationale}
      </div>

      {/* Evidence */}
      {proposal.evidence.length > 0 && (
        <div className="text-xs text-gray-500 mb-3">
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
  const { linkageProposals, acceptProposal, dismissProposal, clearProposals, nodes } = useCanvasStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'conceptual' | 'sequential' | 'contrastive'>('all');

  // Auto-generate proposals when we have 3+ nodes
  React.useEffect(() => {
    if (nodes.length >= 3 && linkageProposals.length === 0) {
      useCanvasStore.getState().generateLinkageProposals();
    }
  }, [nodes.length, linkageProposals.length]);

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
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm">
              {t('canvas.linkage.title')}
            </h3>
            <PixelBadge size="sm" variant="default">
              {totalCount}
            </PixelBadge>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white text-xs px-2 py-1"
              aria-label={isExpanded ? t('common.collapse') : t('common.expand')}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <button
              onClick={clearProposals}
              className="text-gray-400 hover:text-white text-xs px-2 py-1"
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {t('canvas.linkage.filter.all')} ({totalCount})
              </button>
              <button
                onClick={() => setFilter('conceptual')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === 'conceptual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {t('canvas.linkage.filter.conceptual')} ({linkageProposals.filter(p => p.linkageType === 'conceptual').length})
              </button>
              <button
                onClick={() => setFilter('sequential')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === 'sequential'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {t('canvas.linkage.filter.sequential')} ({linkageProposals.filter(p => p.linkageType === 'sequential').length})
              </button>
              <button
                onClick={() => setFilter('contrastive')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === 'contrastive'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {t('canvas.linkage.filter.contrastive')} ({linkageProposals.filter(p => p.linkageType === 'contrastive').length})
              </button>
            </div>

            {/* Scrollable proposals list */}
            <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {proposalCount === 0 ? (
                <div className="text-gray-500 text-xs text-center py-4">
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
              <div className="mt-3 pt-3 border-t border-gray-700">
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
