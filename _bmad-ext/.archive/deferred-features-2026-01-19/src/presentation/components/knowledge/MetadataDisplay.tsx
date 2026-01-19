/**
 * @fileoverview Metadata Display Component (Story 6.4)
 * @module components/knowledge/MetadataDisplay
 * @governance EPIC-6-4
 *
 * Displays AI-generated metadata for a source:
 * - Summary
 * - Key concepts as colorful tags
 * - Suggested questions
 * - AI-analyzed badge
 */

import { SkeletonLoader } from '@/presentation/components/ui/SkeletonLoader';
import type { SourceRecord } from '@/infrastructure/persistence/dexie-db';
import { useTranslation } from 'react-i18next';

export interface MetadataDisplayProps {
    /** The source to display metadata for */
    source: SourceRecord;
}

/**
 * Generate a consistent color for a key concept based on hash
 */
function hashToColor(concept: string): string {
    const colors = [
        'bg-info/20 text-info border-info/30',
        'bg-success/20 text-success border-success/30',
        'bg-purple-500/20 text-purple-300 border-purple-500/30',
        'bg-warning/20 text-warning border-warning/30',
        'bg-pink-500/20 text-pink-300 border-pink-500/30',
        'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        'bg-warning/40 text-warning border-warning/30',
        'bg-destructive/20 text-destructive border-destructive/30',
    ];

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < concept.length; i++) {
        hash = concept.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

/**
 * MetadataDisplay Component
 *
 * Displays AI-generated metadata for a source with:
 * - 3-sentence summary
 * - 5 key concept tags with colorful styling
 * - 3 suggested questions
 * - "AI-analyzed" badge when metadata exists
 * - Loading skeleton during extraction
 * - Error state if analysis failed
 */
export function MetadataDisplay({ source }: MetadataDisplayProps) {
    const { t } = useTranslation();
    const hasMetadata = Boolean(source.summary || source.keyConcepts?.length || source.suggestedQuestions?.length);
    const isAnalyzing = source.metadataExtracted === false && !hasMetadata;

    // If no metadata and not analyzing, don't show anything
    if (!hasMetadata && !isAnalyzing) {
        return null;
    }

    return (
        <div className="border-t border-border bg-secondary" role="region" aria-label={t('knowledge.metadata.title')}>
            {/* AI-analyzed badge */}
            {source.metadataExtracted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-primary/20" role="status" aria-label={t('knowledge.metadata.aiAnalyzed')}>
                    <span className="text-sm">{t('knowledge.metadata.aiAnalyzed')}</span>
                    <span className="text-primary" aria-hidden="true">✨</span>
                </div>
            )}

            {/* Loading state */}
            {isAnalyzing && (
                <div className="p-4" role="status" aria-live="polite" aria-busy="true">
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        <span>{t('knowledge.metadata.analyzing')}</span>
                    </div>
                    <SkeletonLoader variant="paragraph" lines={3} />
                </div>
            )}

            {/* Summary */}
            {source.summary && (
                <div className="p-4 border-b border-border">
                    <h3 id="metadata-summary" className="text-sm font-medium text-foreground mb-2">{t('knowledge.metadata.summary')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" aria-labelledby="metadata-summary">
                        {source.summary}
                    </p>
                </div>
            )}

            {/* Key Concepts */}
            {source.keyConcepts && source.keyConcepts.length > 0 && (
                <div className="p-4 border-b border-border">
                    <h3 id="metadata-concepts" className="text-sm font-medium text-foreground mb-2">{t('knowledge.metadata.concepts')}</h3>
                    <div className="flex flex-wrap gap-2" role="list" aria-labelledby="metadata-concepts">
                        {source.keyConcepts.map((concept, index) => (
                            <span
                                key={index}
                                className={`px-2 py-1 text-xs rounded border ${hashToColor(concept)}`}
                                role="listitem"
                            >
                                {concept}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested Questions */}
            {source.suggestedQuestions && source.suggestedQuestions.length > 0 && (
                <div className="p-4">
                    <h3 id="metadata-questions" className="text-sm font-medium text-foreground mb-2">{t('knowledge.metadata.questions')}</h3>
                    <ul className="space-y-2" aria-labelledby="metadata-questions">
                        {source.suggestedQuestions.map((question, index) => (
                            <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                                <span className="text-primary mt-0.5" aria-hidden="true">•</span>
                                <span>{question}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
