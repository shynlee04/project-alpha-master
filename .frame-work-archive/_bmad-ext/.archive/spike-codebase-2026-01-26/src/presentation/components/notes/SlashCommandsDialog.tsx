/**
 * @fileoverview Slash Commands Dialog
 * @module components/notes/SlashCommandsDialog
 * @created 2026-01-13
 * @updated 2026-01-12 - Added History tab (43-06)
 * @story 43-01: Command management entry point in Notes UI
 * @story 43-06: Prompt history/analytics
 *
 * Dialog wrapper for SlashCommandManager and PromptHistoryPanel components
 * Provides visible access to slash command management in Notes workspace
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/presentation/components/ui/dialog';
import { Sparkles, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlashCommandManager } from './SlashCommandManager';
import { PromptHistoryPanel } from './PromptHistoryPanel';

interface SlashCommandsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type TabId = 'commands' | 'history';

export function SlashCommandsDialog({ open, onOpenChange }: SlashCommandsDialogProps) {
    const { t, i18n } = useTranslation();
    const isVi = i18n.language?.startsWith('vi');
    const [activeTab, setActiveTab] = useState<TabId>('commands');

    const tabs = [
        {
            id: 'commands' as const,
            label: isVi ? 'Lệnh AI' : 'AI Commands',
            icon: Sparkles,
        },
        {
            id: 'history' as const,
            label: isVi ? 'Lịch sử' : 'History',
            icon: History,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-none border-2 border-[var(--border)]">
                {/* Header */}
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="flex items-center gap-2">
                        <span>✨</span>
                        {t('notes.slashCommands.title', 'Custom AI Commands')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('notes.slashCommands.description', 'Create custom slash commands with your own prompts')}
                    </DialogDescription>
                </DialogHeader>
                
                {/* Tabs */}
                <div className="flex border-b-2 border-[var(--border)] px-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px]',
                                    isActive
                                        ? 'border-[var(--primary)] text-[var(--primary)]'
                                        : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'commands' && (
                        <div className="h-full overflow-y-auto">
                            <SlashCommandManager />
                        </div>
                    )}
                    {activeTab === 'history' && (
                        <PromptHistoryPanel className="h-full" showAnalytics />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
