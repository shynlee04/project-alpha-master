/**
 * Quiz Preview Panel - Preview and edit generated quiz questions
 *
 * UC1: Synthesis → Preview → Save to QuizStore
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Label } from '@/presentation/components/ui/label';
import { ArrowLeft, ArrowRight, Save, Download, Trash2 } from 'lucide-react';
import { useQuizStore } from '@/lib/state/quiz-store';
import type { QuizQuestion, Quiz } from '@/lib/study/quiz-types';
import type { SynthesisResult } from '@/lib/knowledge/synthesis-types';

interface QuizPreviewPanelProps {
  synthesisResult: SynthesisResult;
  onSave?: () => void;
  onDiscard?: () => void;
}

export function QuizPreviewPanel({
  synthesisResult,
  onSave,
  onDiscard,
}: QuizPreviewPanelProps) {
  const { t } = useTranslation();
  const createQuiz = useQuizStore((s) => s.createQuiz);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Extract quiz questions from synthesis result
  useEffect(() => {
    if (synthesisResult.frontmatter.quiz) {
      const topic = synthesisResult.frontmatter.subject || synthesisResult.frontmatter.tags?.[0] || 'General';
      const generatedQuestions: QuizQuestion[] = synthesisResult.frontmatter.quiz.map((q, idx) => ({
        id: `q-${synthesisResult.id}-${idx}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        topic,
        sourceIds: [synthesisResult.sourceId],
        createdAt: Date.now(),
      }));
      setQuestions(generatedQuestions);
    }
  }, [synthesisResult]);

  const currentQuestion = questions[currentIndex];
  const hasQuestions = questions.length > 0;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleQuestionChange = (field: keyof QuizQuestion, value: any) => {
    if (!currentQuestion) return;

    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...updatedQuestions[currentIndex],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    if (!currentQuestion) return;

    const updatedOptions = [...currentQuestion.options];
    updatedOptions[optionIndex] = value;

    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...updatedQuestions[currentIndex],
      options: updatedOptions,
    };
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Create quiz from questions
      const quizInput: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId: synthesisResult.sourceId,
        title: synthesisResult.frontmatter.title || 'Generated Quiz',
        description: synthesisResult.frontmatter.summary,
        questions,
        sourceIds: [synthesisResult.sourceId],
        sourcesUsed: [synthesisResult.sourceId],
        settings: {
          questionCount: questions.length,
          includeExplanation: true,
          difficulty: 'mixed',
          questionTypes: ['multiple-choice'],
        },
      };

      await createQuiz(quizInput);
      onSave?.();
    } catch (error) {
      console.error('[QuizPreviewPanel] Failed to save quiz:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    // Export to JSON format
    const exportData = {
      title: synthesisResult.frontmatter.title || 'Generated Quiz',
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDiscard = () => {
    onDiscard?.();
  };

  if (!hasQuestions) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">{t('knowledge.synthesis.noQuiz')}</p>
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
            {currentIndex + 1} / {questions.length}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {t('knowledge.synthesis.quizPreview')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            {showExplanation ? t('common.hideExplanation') : t('common.showExplanation')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDiscard}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t('common.discard')}
          </Button>
        </div>
      </div>

      {/* Quiz Question Display */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            {/* Question Counter */}
            <div className="flex justify-center gap-2 mb-4">
              {questions.map((_, idx) => (
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

            {/* Question */}
            {currentQuestion && (
              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">
                    {t('knowledge.synthesis.question')}
                  </Label>
                  <Textarea
                    value={currentQuestion.question}
                    onChange={(e) => handleQuestionChange('question', e.target.value)}
                    className="min-h-[80px] mt-2"
                  />
                </div>

                {/* Options */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">
                    {t('knowledge.synthesis.options')}
                  </Label>
                  <div className="space-y-2 mt-2">
                    {currentQuestion.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 p-3 border rounded ${
                          currentQuestion.correctIndex === optIdx
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : ''
                        }`}
                      >
                        <span className="text-sm font-medium w-6">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <Textarea
                          value={option}
                          onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                          className="flex-1 min-h-[40px] resize-none"
                        />
                        {currentQuestion.correctIndex === optIdx && (
                          <Badge variant="default" className="text-xs">
                            {t('knowledge.synthesis.correct')}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                {showExplanation && currentQuestion.explanation && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">
                      {t('knowledge.synthesis.explanation')}
                    </Label>
                    <Textarea
                      value={currentQuestion.explanation}
                      onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                      className="min-h-[60px] mt-2"
                    />
                  </div>
                )}

                {/* Topic and Difficulty */}
                {currentQuestion && (
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">
                      {currentQuestion.topic}
                    </Badge>
                    <Badge variant="secondary">
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                )}
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
            disabled={isFirstQuestion}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
            disabled={isLastQuestion}
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
