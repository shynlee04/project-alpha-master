/**
 * Synthesis Dialog - Generate study materials from knowledge sources
 *
 * UC1: Vault Population → Synthesis → Study Artifacts
 *
 * Features:
 * - Select collections/sources
 * - Choose artifact type (flashcards/quiz)
 * - Configure synthesis parameters
 * - Show progress indicator
 * - Handle synthesis completion
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Wand2, Loader2 } from 'lucide-react';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import { useSynthesisStore } from '@/infrastructure/persistence/stores/synthesis-store';
import type { ArtifactType } from '@/lib/knowledge/synthesis-types';

interface SynthesisDialogProps {
  sourceIds?: string[];
  onComplete?: (artifactId: string) => void;
}

export function SynthesisDialog({ sourceIds, onComplete }: SynthesisDialogProps) {
  const { t } = useTranslation();
  const { sources } = useKnowledgeStore();
  const { synthesize, isSynthesizing, progress } = useSynthesisStore();

  const [open, setOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set(sourceIds || []));
  const [artifactType, setArtifactType] = useState<ArtifactType>('flashcards');
  const [synthesisId, setSynthesisId] = useState<string | null>(null);

  // Filter available sources (sources with content)
  const availableSources = sources.filter((s) => (s.wordCount || 0) > 0 || (s.charCount || 0) > 0);
  const hasSelection = selectedSources.size > 0;

  const handleSourceToggle = (sourceId: string) => {
    const newSelection = new Set(selectedSources);
    if (newSelection.has(sourceId)) {
      newSelection.delete(sourceId);
    } else {
      newSelection.add(sourceId);
    }
    setSelectedSources(newSelection);
  };

  const handleSynthesize = async () => {
    if (!hasSelection) return;

    const sourcesToSynthesize = sources.filter((s) => selectedSources.has(s.id));

    try {
      const result = await synthesize({
        sources: sourcesToSynthesize,
        artifactType,
      });

      setSynthesisId(result.id);
    } catch (error) {
      console.error('[SynthesisDialog] Synthesis failed:', error);
    }
  };

  const handleComplete = () => {
    if (synthesisId) {
      onComplete?.(synthesisId);
    }
    setOpen(false);
    setSynthesisId(null);
    setSelectedSources(new Set());
  };

  const isProcessing = isSynthesizing || synthesisId !== null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Wand2 className="h-4 w-4 mr-2" />
          {t('knowledge.synthesize')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('knowledge.synthesis.title')}</DialogTitle>
          <DialogDescription>
            {t('knowledge.synthesis.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artifact Type Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {t('knowledge.synthesis.artifactType')}
            </label>
            <div className="flex gap-2">
              <Button
                variant={artifactType === 'flashcards' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setArtifactType('flashcards')}
                disabled={isProcessing}
              >
                {t('knowledge.synthesis.flashcards')}
              </Button>
              <Button
                variant={artifactType === 'quiz' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setArtifactType('quiz')}
                disabled={isProcessing}
              >
                {t('knowledge.synthesis.quiz')}
              </Button>
            </div>
          </div>

          {/* Source Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {t('knowledge.synthesis.selectSources')}
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableSources.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  {t('knowledge.synthesis.noSources')}
                </div>
              ) : (
                availableSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-accent/50 cursor-pointer"
                    onClick={() => handleSourceToggle(source.id)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{source.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {source.type} • {source.wordCount || 0} words
                      </div>
                    </div>
                    <Badge variant={selectedSources.has(source.id) ? 'default' : 'outline'}>
                      {selectedSources.has(source.id) ? t('common.selected') : t('common.select')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t('knowledge.synthesis.processing')}</span>
                <span className="text-muted-foreground">{progress?.progress || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress?.progress || 0}%` }}
                />
              </div>
              {progress?.stage && (
                <div className="text-xs text-muted-foreground text-center">
                  {progress.stage}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isProcessing}
          >
            {t('common.cancel')}
          </Button>
          {!synthesisId ? (
            <Button
              onClick={handleSynthesize}
              disabled={!hasSelection || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('knowledge.synthesis.generating')}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  {t('knowledge.synthesis.generate')}
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              {t('knowledge.synthesis.viewResults')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
