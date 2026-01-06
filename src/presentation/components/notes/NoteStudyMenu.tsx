
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Brain, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { Button } from '@/presentation/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Label } from '@/presentation/components/ui/label';
import { Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';

import { useNoteStore } from '@/lib/notes';
import { extractTextFromBlocks } from '@/lib/notes/types-embedding';
import { generateFlashcards } from '@/lib/knowledge/flashcard-generator';
import { generateQuiz } from '@/lib/study/quiz-generator';
import { useFlashcardOperations } from '@/infrastructure/persistence/stores/flashcard-store';
import { useQuizStore } from '@/infrastructure/persistence/stores/study/quiz-store';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import type { QuizQuestion } from '@/lib/study/quiz-types';

interface NoteStudyMenuProps {
    noteId: string;
}

type GenerationType = 'flashcards' | 'quiz' | null;

export function NoteStudyMenu({ noteId }: NoteStudyMenuProps) {
    const { t } = useTranslation();
    const note = useNoteStore(state => state.notes.get(noteId));
    const projectId = useIDEStore(state => state.projectId) || 'default';

    // Actions
    const { saveGeneratedFlashcards } = useFlashcardOperations();
    const createQuiz = useQuizStore(state => state.createQuiz);

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [generationType, setGenerationType] = useState<GenerationType>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Options
    const [count, setCount] = useState('5');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');

    // Reset options when dialog closes
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setGenerationType(null);
            setIsGenerating(false);
            setCount('5');
            setDifficulty('mixed');
        }
    };

    const handleGenerate = async () => {
        if (!note || !generationType) return;

        try {
            setIsGenerating(true);
            const text = extractTextFromBlocks(note.blocks as unknown[]);

            if (!text || text.length < 50) {
                toast.error(t('study.error.notEnoughContent', 'Not enough content to generate study materials'));
                setIsGenerating(false);
                return;
            }

            const numCount = parseInt(count, 10) || 5;

            if (generationType === 'flashcards') {
                await handleGenerateFlashcards(text, numCount);
            } else {
                await handleGenerateQuiz(text, numCount);
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Generation failed:', error);
            toast.error(t('study.error.generationFailed', 'Failed to generate content'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateFlashcards = async (text: string, numCount: number) => {
        const result = await generateFlashcards(text, noteId, projectId, {
            minCards: numCount,
            maxCards: numCount,
        });

        if (result.cards.length === 0) {
            throw new Error('No flashcards generated');
        }

        await saveGeneratedFlashcards(result.cards, [noteId]);
        toast.success(t('study.flashcardsGenerated', 'Flashcards generated successfully!'), {
            action: {
                label: t('common.view', 'View'),
                onClick: () => {
                    // Navigate to study page - Todo: Implement navigation
                    // For now just toast
                }
            }
        });
    };

    const handleGenerateQuiz = async (text: string, numCount: number) => {
        const result = await generateQuiz(text, noteId, {
            questionCount: numCount,
            difficulty: difficulty as any,
        });

        if (result.questions.length === 0) {
            throw new Error('No questions generated');
        }

        // Save quiz
        await createQuiz({
            projectId,
            title: result.title || `Quiz: ${note?.title}`,
            description: result.description || `Generated from note: ${note?.title}`,
            questions: result.questions.map(q => ({
                ...q,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                sourceIds: [noteId]
            })) as QuizQuestion[],
            sourceIds: [noteId],
            sourcesUsed: [noteId],
            settings: {
                questionCount: numCount,
                includeExplanation: true,
                difficulty: difficulty as any,
                questionTypes: ['multiple-choice']
            }
        });

        toast.success(t('study.quizGenerated', 'Quiz generated successfully!'));
    };

    if (!note) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('study.aiTools', 'AI Study Tools')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setGenerationType('flashcards'); setIsOpen(true); }}>
                        <Brain className="mr-2 h-4 w-4" />
                        {t('study.generateFlashcards', 'Generate Flashcards')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setGenerationType('quiz'); setIsOpen(true); }}>
                        <Trophy className="mr-2 h-4 w-4" />
                        {t('study.generateQuiz', 'Generate Quiz')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {generationType === 'flashcards'
                                ? t('study.generateFlashcards', 'Generate Flashcards')
                                : t('study.generateQuiz', 'Generate Quiz')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('study.generateDescription', 'Create study materials from this note using AI.')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="count" className="text-right">
                                {t('study.count', 'Count')}
                            </Label>
                            <Input
                                id="count"
                                type="number"
                                value={count}
                                onChange={(e) => setCount(e.target.value)}
                                min={1}
                                max={20}
                                className="col-span-3"
                            />
                        </div>
                        {generationType === 'quiz' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="difficulty" className="text-right">
                                    {t('study.difficulty', 'Difficulty')}
                                </Label>
                                <Select
                                    value={difficulty}
                                    onValueChange={(v: any) => setDifficulty(v)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mixed">{t('difficulty.mixed', 'Mixed')}</SelectItem>
                                        <SelectItem value="easy">{t('difficulty.easy', 'Easy')}</SelectItem>
                                        <SelectItem value="medium">{t('difficulty.medium', 'Medium')}</SelectItem>
                                        <SelectItem value="hard">{t('difficulty.hard', 'Hard')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.generate', 'Generate')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
