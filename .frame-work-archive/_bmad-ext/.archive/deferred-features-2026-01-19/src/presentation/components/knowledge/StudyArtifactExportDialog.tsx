/**
 * Study Artifact Export Dialog - Export flashcards/quizzes to various formats
 *
 * UC1: Synthesis → Export to CSV/JSON/Anki
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
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Download } from 'lucide-react';
import type { Flashcard } from '@/lib/knowledge/types';
import type { Quiz } from '@/lib/study/quiz-types';

type ExportFormat = 'csv' | 'json' | 'anki';
type ArtifactType = 'flashcards' | 'quizzes';

interface StudyArtifactExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artifacts: Flashcard[] | Quiz[];
  artifactType: ArtifactType;
}

export function StudyArtifactExportDialog({
  open,
  onOpenChange,
  artifacts,
  artifactType,
}: StudyArtifactExportDialogProps) {
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let filename = '';
      let content: string = '';
      let mimeType: string = 'text/plain';

      if (artifactType === 'flashcards') {
        filename = `flashcards-${new Date().toISOString().split('T')[0]}`;
        const flashcards = artifacts as Flashcard[];

        if (exportFormat === 'csv') {
          // CSV format
          content = [
            ['Question', 'Answer', 'Topic'],
            ...flashcards.map((fc) => [
              `"${fc.question.replace(/"/g, '""')}"`,
              `"${fc.answer.replace(/"/g, '""')}"`,
              fc.topic,
            ]),
          ]
            .map((row) => row.join(','))
            .join('\n');
          mimeType = 'text/csv';
          filename += '.csv';
        } else if (exportFormat === 'json') {
          // JSON format
          content = JSON.stringify(flashcards, null, 2);
          mimeType = 'application/json';
          filename += '.json';
        } else if (exportFormat === 'anki') {
          // Anki format (simple TSV)
          content = flashcards
            .map((fc) =>
              `${fc.question.replace(/\t/g, ' ')}\t${fc.answer.replace(/\t/g, ' ')}\t${fc.topic}`
            )
            .join('\n');
          mimeType = 'text/tab-separated-values';
          filename += '.txt';
        }
      } else {
        filename = `quiz-${new Date().toISOString().split('T')[0]}`;
        const quiz = artifacts as Quiz[];
        const quizQuestions = quiz.flatMap((q) => q.questions);

        if (exportFormat === 'csv') {
          // CSV format
          content = [
            ['Question', 'Options', 'Correct Answer', 'Explanation'],
            ...quizQuestions.map((q) => [
              `"${q.question.replace(/"/g, '""')}"`,
              `"${q.options.join(' | ')}"`,
              q.options[q.correctIndex],
              `"${q.explanation.replace(/"/g, '""')}"`,
            ]),
          ]
            .map((row) => row.join(','))
            .join('\n');
          mimeType = 'text/csv';
          filename += '.csv';
        } else if (exportFormat === 'json') {
          // JSON format
          content = JSON.stringify(quiz, null, 2);
          mimeType = 'application/json';
          filename += '.json';
        } else if (exportFormat === 'anki') {
          // Anki doesn't support quizzes natively, export as cloze
          content = quizQuestions
            .map((q) =>
              `${q.question.replace(/\t/g, ' ')}\t{{c1::${q.options[q.correctIndex].replace(/\t/g, ' ')}}}\t${q.explanation.replace(/\t/g, ' ')}`
            )
            .join('\n');
          mimeType = 'text/tab-separated-values';
          filename += '.txt';
        }
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('[StudyArtifactExportDialog] Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getArtifactCount = () => {
    if (artifactType === 'flashcards') {
      return (artifacts as Flashcard[]).length;
    } else {
      return (artifacts as Quiz[]).reduce((acc, quiz) => acc + quiz.questions.length, 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('knowledge.export.title')}</DialogTitle>
          <DialogDescription>
            {t('knowledge.export.description', { count: getArtifactCount() })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Format Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block" htmlFor="format-select">
              {t('knowledge.export.format')}
            </Label>
            <select
              id="format-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="csv">{t('knowledge.export.csv')} - {t('knowledge.export.csvDescription')}</option>
              <option value="json">{t('knowledge.export.json')} - {t('knowledge.export.jsonDescription')}</option>
              <option value="anki">{t('knowledge.export.anki')} - {t('knowledge.export.ankiDescription')}</option>
            </select>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t('knowledge.export.preview')}
            </Label>
            <div className="h-32 overflow-y-auto border rounded p-3">
              <pre className="text-xs text-muted-foreground">
                {artifactType === 'flashcards' ? (
                  <>{`"Front","Back","Tags"
"Question 1","Answer 1","tag1, tag2"`}</>
                ) : (
                  <>{`"Question","Options","Correct Answer","Explanation"
"Question 1","A | B | C | D","B","Explanation"`}</>
                )}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>{t('knowledge.export.exporting')}</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('knowledge.export.download')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
