/**
 * @fileoverview Study Page - Main entry point for study artifacts
 * @module components/study/StudyPage
 *
 * @epic Epic-9 Study Artifacts Generation
 * @story 9-5 Study Integration (UI Wiring)
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import { BookOpen, Brain, Trophy, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { useResponsive } from '@/hooks/useResponsive';
import { useFlashcardStore } from '@/infrastructure/persistence/stores/flashcard-store';
import { useQuizStore } from '@/infrastructure/persistence/stores/study/quiz-store';
import { useStudyStore } from '@/infrastructure/persistence/stores/study-store';
import { CompactStudyStats } from './study-stats';
import { StudySession } from './study-session';
import { QuizContainer } from './QuizContainer';
import { StudyFilePicker } from './StudyFilePicker';
import { useIDEStore, useProjectStore } from '@/infrastructure/persistence/stores/ide';
// AC-02: Agent Selector Unification - Use unified selector for cross-workspace sync
import { AgentManager } from '@/presentation/components/agent';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
// P0-3: File Sync Service Initialization
import { useFileSyncService } from '@/lib/filesync/hooks';
// WB-8.3: Cross-workspace event subscriptions for state synchronization
import { useAllCrossWorkspaceEvents, useWorkspaceChangedEvents } from '@/lib/events/use-cross-workspace-events';

export function StudyPage() {
    const { t } = useTranslation();
    const { isMobile } = useResponsive();
    const projectId = useIDEStore((state) => state.projectId) || 'default';

    // Get project storage type for file sync
    const getProject = useProjectStore((state) => state.getProject);
    const project = getProject(projectId);

    // Stores
    const flashcards = useFlashcardStore((state) => state.flashcards);
    const quizzes = useQuizStore((state) => state.quizzes);
    const { totalCardsStudied, currentStreak } = useStudyStore();

    // State
    const [activeTab, setActiveTab] = useState<'flashcards' | 'quizzes' | 'stats'>('flashcards');
    const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);

    // P0-3: Initialize file sync service with storage type selection
    const {
        service: fileSyncService,
        isInitializing: isFileSyncInitializing,
        error: fileSyncError,
        initializeService,
        isReady: isFileSyncReady,
        isSupported: isFileSyncSupported,
    } = useFileSyncService({
        projectId,
        workspaceType: 'study',
        storageType: project?.storageType ?? 'indexeddb',
    });

    // WB-8.3: Cross-workspace event subscriptions for state synchronization
    // Ensures Study workspace reacts to changes from IDE, Notes, Knowledge workspaces
    useAllCrossWorkspaceEvents();
    // Also subscribe to workspace changed events for agent filtering
    useWorkspaceChangedEvents();

    // Count items
    const flashcardCount = flashcards.filter((f) => f.projectId === projectId).length;
    const quizCount = quizzes.filter((q) => q.projectId === projectId).length;

    const hasContent = flashcardCount > 0 || quizCount > 0;

    if (isMobile) {
        // Mobile Layout: Stacked tabs with bottom navigation
        return (
            <MainLayout>
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Header */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <BookOpen className="text-primary" size={20} />
                                <h1 className="font-mono font-bold text-lg">{t('study.title')}</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* CW-1.4: File Picker Button */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsFilePickerOpen(true)}
                                    aria-label="Import study materials"
                                >
                                    <FolderOpen size={16} />
                                </Button>
                                {/* AC-02: Agent Manager - comprehensive agent management UI */}
                                <AgentManager
                                    variant="compact"
                                    workspaceType="study"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{t('study.subtitle')}</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                        {hasContent ? (
                            <Tabs
                                value={activeTab}
                                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-3 mb-4">
                                    <TabsTrigger value="flashcards">
                                        <Brain size={16} className="mr-2" />
                                        {t('study.flashcards')}
                                    </TabsTrigger>
                                    <TabsTrigger value="quizzes">
                                        <Trophy size={16} className="mr-2" />
                                        {t('study.quizzes')}
                                    </TabsTrigger>
                                    <TabsTrigger value="stats">
                                        {t('study.stats')}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="flashcards" className="mt-0">
                                    {flashcardCount > 0 ? (
                                        <StudySession />
                                    ) : (
                                        <EmptyState
                                            icon={Brain}
                                            title={t('study.flashcards.empty')}
                                            description={t('study.flashcards.emptyDesc')}
                                        />
                                    )}
                                </TabsContent>

                                <TabsContent value="quizzes" className="mt-0">
                                    {quizCount > 0 ? (
                                        <QuizContainer />
                                    ) : (
                                        <EmptyState
                                            icon={Trophy}
                                            title={t('study.quizzes.empty')}
                                            description={t('study.quizzes.emptyDesc')}
                                        />
                                    )}
                                </TabsContent>

                                <TabsContent value="stats" className="mt-0">
                                    <CompactStudyStats
                                        totalCardsStudied={totalCardsStudied}
                                        currentStreak={currentStreak}
                                    />
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <EmptyState
                                icon={Sparkles}
                                title={t('study.empty')}
                                description={t('study.emptyDesc')}
                            />
                        )}
                    </div>
                </div>

                {/* CW-1.4: Study File Picker Dialog */}
                <StudyFilePicker
                    open={isFilePickerOpen}
                    onOpenChange={setIsFilePickerOpen}
                    fileSyncService={fileSyncService}
                    onInitialize={initializeService}
                    isInitializing={isFileSyncInitializing}
                    error={fileSyncError}
                    isReady={isFileSyncReady}
                    isSupported={isFileSyncSupported}
                />
            </MainLayout>
        );
    }

    // Desktop Layout: Tabbed interface
    return (
        <MainLayout>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-primary" size={24} />
                            <h1 className="font-mono font-bold text-xl">{t('study.title')}</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* CW-1.4: File Picker Button */}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsFilePickerOpen(true)}
                                aria-label="Import study materials"
                            >
                                <FolderOpen size={16} />
                            </Button>
                            {/* AC-02: Agent Manager - comprehensive agent management UI */}
                            <AgentManager
                                variant="compact"
                                workspaceType="study"
                            />
                            <CompactStudyStats
                                totalCardsStudied={totalCardsStudied}
                                currentStreak={currentStreak}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{t('study.subtitle')}</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {hasContent ? (
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                            className="w-full h-full"
                        >
                            {/* Tab Navigation */}
                            <div className="px-6 pt-4">
                                <TabsList className="grid w-full max-w-md grid-cols-3">
                                    <TabsTrigger value="flashcards">
                                        <Brain size={16} className="mr-2" />
                                        {t('study.flashcards')}
                                        {flashcardCount > 0 && (
                                            <span className="ml-auto text-xs bg-primary/20 px-2 py-0.5 rounded">
                                                {flashcardCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="quizzes">
                                        <Trophy size={16} className="mr-2" />
                                        {t('study.quizzes')}
                                        {quizCount > 0 && (
                                            <span className="ml-auto text-xs bg-primary/20 px-2 py-0.5 rounded">
                                                {quizCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="stats">
                                        {t('study.stats')}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                <TabsContent value="flashcards" className="mt-0 h-[calc(100vh-200px)]">
                                    {flashcardCount > 0 ? (
                                        <StudySession />
                                    ) : (
                                        <EmptyState
                                            icon={Brain}
                                            title={t('study.flashcards.empty')}
                                            description={t('study.flashcards.emptyDesc')}
                                        />
                                    )}
                                </TabsContent>

                                <TabsContent value="quizzes" className="mt-0 h-[calc(100vh-200px)]">
                                    {quizCount > 0 ? (
                                        <QuizContainer />
                                    ) : (
                                        <EmptyState
                                            icon={Trophy}
                                            title={t('study.quizzes.empty')}
                                            description={t('study.quizzes.emptyDesc')}
                                        />
                                    )}
                                </TabsContent>

                                <TabsContent value="stats" className="mt-0">
                                    <div className="max-w-4xl mx-auto">
                                        <CompactStudyStats
                                            totalCardsStudied={totalCardsStudied}
                                            currentStreak={currentStreak}
                                        />
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <EmptyState
                                icon={Sparkles}
                                title={t('study.empty')}
                                description={t('study.emptyDesc')}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* CW-1.4: Study File Picker Dialog */}
            <StudyFilePicker
                open={isFilePickerOpen}
                onOpenChange={setIsFilePickerOpen}
                fileSyncService={fileSyncService}
                onInitialize={initializeService}
                isInitializing={isFileSyncInitializing}
                error={fileSyncError}
                isReady={isFileSyncReady}
                isSupported={isFileSyncSupported}
            />
        </MainLayout>
    );
}

/**
 * Empty state component for when no study artifacts exist
 */
function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string; size?: number }>;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-4">
                <Icon size={32} className="text-primary/50" />
            </div>
            <h3 className="font-mono font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
    );
}

/**
 * Props for StudyPage component
 */
export interface StudyPageProps {
    /** Optional project ID override (defaults to current project from IDE store) */
    projectId?: string;
}
