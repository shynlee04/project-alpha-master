/**
 * @fileoverview Quiz preview and take quiz UI component
 * @module components/study/quiz-preview
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { QuizQuestion, QuizGenerationResult } from '@/lib/study/quiz-types';

const questionCardVariants = cva(
  'rounded-none border p-4 transition-all',
  {
    variants: {
      variant: {
        default: 'border-border bg-card',
        selected: 'border-primary bg-primary/5',
        correct: 'border-green-500 bg-green-500/10',
        incorrect: 'border-red-500 bg-red-500/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const optionVariants = cva(
  'w-full rounded-none border p-3 text-left transition-all',
  {
    variants: {
      variant: {
        default: 'border-border hover:border-primary hover:bg-accent',
        selected: 'border-primary bg-primary text-primary-foreground',
        correct: 'border-green-500 bg-green-500 text-white',
        incorrect: 'border-red-500 bg-red-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface QuestionCardProps {
  question: Omit<QuizQuestion, 'id' | 'createdAt'> & { id?: string; createdAt?: number };
  index: number;
  showAnswer: boolean;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  onRevealAnswer: () => void;
  className?: string;
}

export function QuestionCard({
  question,
  index,
  showAnswer,
  selectedAnswer,
  onSelectAnswer,
  onRevealAnswer,
  className,
}: QuestionCardProps) {
  const { t } = useTranslation();
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const getOptionVariant = (optionIndex: number): VariantProps<typeof optionVariants>['variant'] => {
    if (showAnswer) {
      if (optionIndex === question.correctIndex) return 'correct';
      if (optionIndex === selectedAnswer && optionIndex !== question.correctIndex) return 'incorrect';
    }
    if (optionIndex === selectedAnswer) return 'selected';
    return 'default';
  };

  return (
    <div className={cn(questionCardVariants({ variant: showAnswer ? (selectedAnswer === question.correctIndex ? 'correct' : 'incorrect') : 'default' }), className)}>
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-lg font-medium">{question.question}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn(
              'rounded px-2 py-0.5 text-xs font-medium',
              question.difficulty === 'easy' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              question.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
              question.difficulty === 'hard' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            )}>
              {question.difficulty}
            </span>
            <span className="text-xs text-muted-foreground">{question.topic}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {question.options.map((option, optionIndex) => (
          <button
            key={optionIndex}
            onClick={() => !showAnswer && onSelectAnswer(optionIndex)}
            disabled={showAnswer}
            onMouseEnter={() => setHoveredOption(optionIndex)}
            onMouseLeave={() => setHoveredOption(null)}
            className={cn(
              optionVariants({ variant: getOptionVariant(optionIndex) }),
              'flex items-center gap-3',
              showAnswer && 'cursor-default'
            )}
          >
            <span className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-medium',
              getOptionVariant(optionIndex) === 'selected' && 'border-primary bg-primary text-primary-foreground',
              getOptionVariant(optionIndex) === 'correct' && 'border-green-500 bg-green-500 text-white',
              getOptionVariant(optionIndex) === 'incorrect' && 'border-red-500 bg-red-500 text-white',
              !getOptionVariant(optionIndex) && 'border-muted-foreground/30'
            )}>
              {String.fromCharCode(65 + optionIndex)}
            </span>
            <span className="flex-1 text-sm">{option}</span>
          </button>
        ))}
      </div>

      {showAnswer && (
        <div className="mt-4 rounded-none bg-muted p-3">
          <p className="text-sm font-medium">{t('quizzes.preview.explanation')}</p>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      )}

      {!showAnswer && (
        <button
          onClick={onRevealAnswer}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {t('quizzes.preview.revealAnswer')}
        </button>
      )}
    </div>
  );
}

interface QuizPreviewProps {
  quiz: QuizGenerationResult;
  onSave?: () => void;
  onRegenerate?: () => void;
  onEditQuestion?: (index: number, question: QuizQuestion) => void;
  className?: string;
}

export function QuizPreview({
  quiz,
  onSave,
  onRegenerate,
  onEditQuestion: _onEditQuestion,
  className,
}: QuizPreviewProps) {
  const { t } = useTranslation();
  const [showAnswers, setShowAnswers] = useState<boolean[]>(new Array(quiz.questions.length).fill(false));
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleRevealAnswer = (questionIndex: number) => {
    const newShowAnswers = [...showAnswers];
    newShowAnswers[questionIndex] = true;
    setShowAnswers(newShowAnswers);
  };

  const score = selectedAnswers.reduce<number>((acc, answer, index) => {
    if (answer === quiz.questions[index].correctIndex) return acc + 1;
    return acc;
  }, 0);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          {quiz.description && (
            <p className="mt-1 text-muted-foreground">{quiz.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {t('quizzes.preview.questionCount', { count: quiz.totalQuestions })}
          </span>
          {selectedAnswers.some((a) => a !== null) && (
            <span className="font-medium">
              {t('quizzes.preview.score', { score, total: quiz.totalQuestions })}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quiz.topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
          >
            {topic}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            showAnswer={showAnswers[index]}
            selectedAnswer={selectedAnswers[index]}
            onSelectAnswer={(answerIndex) => handleSelectAnswer(index, answerIndex)}
            onRevealAnswer={() => handleRevealAnswer(index)}
          />
        ))}
      </div>

      <div className="flex justify-end gap-3">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="rounded-none border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            {t('quizzes.preview.regenerate')}
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            className="rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t('quizzes.preview.saveQuiz')}
          </button>
        )}
      </div>
    </div>
  );
}

interface QuizSettingsPanelProps {
  settings: {
    questionCount: number;
    includeExplanation: boolean;
    difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
  };
  onSettingsChange: (settings: QuizSettingsPanelProps['settings']) => void;
  className?: string;
}

export function QuizSettingsPanel({
  settings,
  onSettingsChange,
  className,
}: QuizSettingsPanelProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('space-y-4 rounded-none border p-4', className)}>
      <h3 className="font-medium">{t('quizzes.settings.title')}</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('quizzes.settings.questionCount')}</label>
        <input
          type="range"
          min="3"
          max="20"
          value={settings.questionCount}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              questionCount: parseInt(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>3</span>
          <span className="font-medium">{settings.questionCount}</span>
          <span>20</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('quizzes.settings.difficulty')}</label>
        <select
          value={settings.difficulty}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              difficulty: e.target.value as 'mixed' | 'easy' | 'medium' | 'hard',
            })
          }
          className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="mixed">{t('quizzes.settings.difficultyMixed')}</option>
          <option value="easy">{t('quizzes.settings.difficultyEasy')}</option>
          <option value="medium">{t('quizzes.settings.difficultyMedium')}</option>
          <option value="hard">{t('quizzes.settings.difficultyHard')}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="includeExplanation"
          checked={settings.includeExplanation}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              includeExplanation: e.target.checked,
            })
          }
          className="h-4 w-4 rounded-none border-gray-300"
        />
        <label htmlFor="includeExplanation" className="text-sm font-medium">
          {t('quizzes.settings.includeExplanations')}
        </label>
      </div>
    </div>
  );
}
