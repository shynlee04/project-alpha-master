/**
 * Flashcard Preview Panel - Preview and edit generated flashcards
 *
 * UC1: Synthesis → Preview → Save to FlashcardStore
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Label } from '@/presentation/components/ui/label';
import { ArrowLeft, ArrowRight, Save, Download, Trash2, FileText } from 'lucide-react';
import { useFlashcardStore } from '@/infrastructure/persistence/stores/flashcard-store';
import type { Flashcard } from '@/lib/knowledge/types';
import type { SynthesisResult } from '@/lib/knowledge/synthesis-types';

interface FlashcardPreviewPanelProps {
  synthesisResult: SynthesisResult;
  onSave?: () => void;
  onDiscard?: () => void;
  onExportToNotes?: () => void;
}

export function FlashcardPreviewPanel({
  synthesisResult,
  onSave,
  onDiscard,
  onExportToNotes,
}: FlashcardPreviewPanelProps) {
  const { t } = useTranslation();
  const addFlashcard = useFlashcardStore((s) => s.addFlashcard);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Extract flashcards from synthesis result
  useEffect(() => {
    if (synthesisResult.frontmatter.flashcards) {
      const topic = synthesisResult.frontmatter.subject || synthesisResult.frontmatter.tags?.[0] || 'General';
      const generatedFlashcards: Flashcard[] = synthesisResult.frontmatter.flashcards.map((fc, idx) => ({
        id: `fc-${synthesisResult.id}-${idx}`,
        projectId: synthesisResult.sourceId,
        question: fc.front,
        answer: fc.back,
        difficulty: 'medium' as const,
        topic,
        sourceIds: [synthesisResult.sourceId],
        createdAt: Date.now(),
      }));
      setFlashcards(generatedFlashcards);
    }
  }, [synthesisResult]);

  const currentCard = flashcards[currentIndex];
  const hasCards = flashcards.length > 0;
  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === flashcards.length - 1;

  const handleCardChange = (field: 'question' | 'answer', value: string) => {
    if (!currentCard) return;

    const updatedCards = [...flashcards];
    updatedCards[currentIndex] = {
      ...updatedCards[currentIndex],
      [field]: value,
    };
    setFlashcards(updatedCards);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Add all flashcards to store
      for (const flashcard of flashcards) {
        await addFlashcard(flashcard);
      }

      onSave?.();
    } catch (error) {
      console.error('[FlashcardPreviewPanel] Failed to save flashcards:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Export to CSV format
    const csvContent = [
      ['Question', 'Answer', 'Topic'],
      ...flashcards.map((fc) => [
        `"${fc.question.replace(/"/g, '""')}"`,
        `"${fc.answer.replace(/"/g, '""')}"`,
        fc.topic,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDiscard = () => {
    onDiscard?.();
  };

  if (!hasCards) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">{t('knowledge.synthesis.noFlashcards')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {currentIndex + 1} / {flashcards.length}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {t('knowledge.synthesis.flashcardPreview')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
          {onExportToNotes && (
            <Button variant="ghost" size="sm" onClick={onExportToNotes}>
              <FileText className="h-4 w-4 mr-2" />
              To Notes
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDiscard}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t('common.discard')}
          </Button>
        </div>
      </div>

      {/* Flashcard Display */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            {/* Card Counter */}
            <div className="flex justify-center gap-2 mb-4">
              {flashcards.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 w-8 rounded transition-colors ${
                    idx === currentIndex
                      ? 'bg-primary'
                      : 'bg-secondary'
                  }`}
                />
              ))}
            </div>

            {/* Card */}
            {currentCard && (
              <div
                className="border rounded-lg p-6 min-h-[300px] cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-xs text-muted-foreground uppercase">
                    {isFlipped ? 'Answer' : 'Question'}
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    {t('knowledge.synthesis.clickToFlip')}
                  </Badge>
                </div>

                <Textarea
                  value={isFlipped ? currentCard.answer : currentCard.question}
                  onChange={(e) => handleCardChange(isFlipped ? 'answer' : 'question', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="min-h-[200px] resize-none"
                />
              </div>
            )}

            {/* Topic and Difficulty */}
            {currentCard && (
              <div className="flex gap-2 mt-4 flex-wrap">
                <Badge variant="outline">
                  {currentCard.topic}
                </Badge>
                <Badge variant="secondary">
                  {currentCard.difficulty}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={isFirstCard}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1))}
            disabled={isLastCard}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>{t('common.saving')}</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('common.saveAll')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
