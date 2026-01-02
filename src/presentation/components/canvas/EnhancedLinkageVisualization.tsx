/**
 * @fileoverview Enhanced Linkage Visualization Component
 * @module presentation/components/canvas/EnhancedLinkageVisualization
 * @governance EPIC-7-1, UC2
 *
 * Tinder-style interface for reviewing AI-enhanced linkage proposals.
 * Displays confidence badges, AI rationales, and accept/dismiss controls.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { EnhancedProposal } from '@/lib/canvas/linkage-ai-enhancer';

/**
 * Props for EnhancedLinkageVisualization
 */
export interface EnhancedLinkageVisualizationProps {
  /** Proposals to display */
  proposals: EnhancedProposal[];
  /** Callback when proposal is accepted */
  onAccept: (proposal: EnhancedProposal) => void;
  /** Callback when proposal is dismissed */
  onDismiss: (proposalId: string) => void;
}

/**
 * Get confidence badge configuration
 */
function getConfidenceBadge(confidence: number) {
  if (confidence >= 0.85) {
    return {
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      icon: <CheckCircle size={16} />,
      label: 'High',
      pattern: 'solid',
    };
  } else if (confidence >= 0.70) {
    return {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      icon: <CheckCircle size={16} />,
      label: 'Medium',
      pattern: 'dashed',
    };
  } else {
    return {
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      icon: <XCircle size={16} />,
      label: 'Low',
      pattern: 'dotted',
    };
  }
}

/**
 * EnhancedLinkageVisualization Component
 *
 * Tinder-style interface with:
 * - Confidence badge with multi-dimensional encoding
 * - Suggested edge label
 * - AI rationale display
 * - Expandable details (entities, keywords, evidence)
 * - Accept/Dismiss buttons
 */
export function EnhancedLinkageVisualization({
  proposals,
  onAccept,
  onDismiss,
}: EnhancedLinkageVisualizationProps) {
  const { t } = useTranslation();

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Get current proposal
  const currentProposal = proposals[currentIndex];
  if (!currentProposal) return null;

  // Get confidence badge
  const badge = getConfidenceBadge(currentProposal.confidenceRefined);

  // Navigation handlers
  const handleAccept = () => {
    onAccept(currentProposal);
    if (currentIndex < proposals.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDismiss = () => {
    onDismiss(currentProposal.id);
    if (currentIndex < proposals.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Check if has details to show
  const hasDetails =
    (currentProposal.entities && currentProposal.entities.length > 0) ||
    (currentProposal.keywords && currentProposal.keywords.length > 0) ||
    (currentProposal.evidence && currentProposal.evidence.length > 0);

  return (
    <div className="flex flex-col gap-3 p-4 bg-background border border-border rounded-lg max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${badge.bgColor} ${badge.borderColor} border`}>
            {badge.icon}
            <span className={`text-xs font-medium ${badge.color}`}>
              {badge.label} {t('canvas.linkage.confidence', 'Confidence')}
            </span>
            <span className="text-xs text-muted-foreground">
              {(currentProposal.confidenceRefined * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {proposals.length}
        </span>
      </div>

      {/* Suggested label */}
      <div className={`p-2.5 rounded-md border ${badge.bgColor} ${badge.borderColor}`}>
        <p className="text-sm font-medium text-foreground">{currentProposal.suggestedLabel}</p>
      </div>

      {/* AI rationale */}
      <div className="text-sm">
        <p className="text-muted-foreground leading-relaxed">{currentProposal.aiRationale}</p>
      </div>

      {/* Expandable details */}
      {hasDetails && (
        <div className="border-t border-border pt-2">
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {t('canvas.linkage.details', 'Details')}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2 text-xs">
              {/* Entities */}
              {currentProposal.entities && currentProposal.entities.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">
                    {t('canvas.linkage.entities', 'Entities')}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentProposal.entities.map((entity, index) => (
                      <span
                        key={index}
                        className="px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {currentProposal.keywords && currentProposal.keywords.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">
                    {t('canvas.linkage.keywords', 'Keywords')}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentProposal.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence (shared concepts) */}
              {currentProposal.evidence && currentProposal.evidence.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">
                    {t('canvas.linkage.sharedConcepts', 'Shared Concepts')}:
                  </span>
                  <span className="text-muted-foreground">
                    {currentProposal.evidence.slice(0, 5).join(', ')}
                    {currentProposal.evidence.length > 5 && '...'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleDismiss}
        >
          <XCircle size={14} className="mr-1.5" />
          {t('canvas.linkage.dismiss', 'Dismiss')}
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleAccept}
        >
          <CheckCircle size={14} className="mr-1.5" />
          {t('canvas.linkage.accept', 'Accept')}
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-1">
        {proposals.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-primary'
                : index < currentIndex
                ? 'bg-primary/30'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default EnhancedLinkageVisualization;
