/**
 * AutoApproveSettings - Toggle-based auto-approve UI component
 * 
 * Displays a collapsible section with toggles for each tool category,
 * similar to Roo Code's auto-approve settings.
 * 
 * @story MVP-3 - Tool Execution File Operations
 * @story MVP-4 - Tool Execution Terminal Commands
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Eye, Edit, Trash2, Terminal, Globe, Zap, Layers, ListTodo } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAutoApproveStore, type ToolCategory } from '@/stores/auto-approve-store';

interface CategoryConfig {
    key: ToolCategory;
    icon: React.ElementType;
    labelKey: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
    { key: 'read', icon: Eye, labelKey: 'autoApprove.read' },
    { key: 'write', icon: Edit, labelKey: 'autoApprove.write' },
    { key: 'delete', icon: Trash2, labelKey: 'autoApprove.delete' },
    { key: 'execute', icon: Terminal, labelKey: 'autoApprove.execute' },
    { key: 'browser', icon: Globe, labelKey: 'autoApprove.browser' },
    { key: 'mcp', icon: Zap, labelKey: 'autoApprove.mcp' },
    { key: 'mode', icon: Layers, labelKey: 'autoApprove.mode' },
    { key: 'subtasks', icon: ListTodo, labelKey: 'autoApprove.subtasks' },
];

export interface AutoApproveSettingsProps {
    /** Additional CSS classes */
    className?: string;
    /** Whether to show all categories or just the enabled ones */
    compact?: boolean;
}

export const AutoApproveSettings: React.FC<AutoApproveSettingsProps> = ({
    className,
    compact = false,
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        enabled,
        categories,
        toggleEnabled,
        toggleCategory,
    } = useAutoApproveStore();

    const handleToggleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    // Get enabled categories for summary display
    const enabledCategories = CATEGORY_CONFIGS.filter(
        (config) => categories[config.key]
    );

    const summaryText = enabled && enabledCategories.length > 0
        ? enabledCategories.map((c) => t(c.labelKey)).join(', ')
        : t('autoApprove.none');

    return (
        <div className={cn('border border-border-dark bg-surface-darker', className)}>
            {/* Header - Always visible */}
            <button
                type="button"
                onClick={handleToggleExpand}
                className={cn(
                    'w-full px-3 py-2 flex items-center justify-between',
                    'text-left text-sm hover:bg-accent/50 transition-colors',
                    'focus:outline-none focus:ring-1 focus:ring-primary/50'
                )}
                aria-expanded={isExpanded}
                aria-controls="auto-approve-content"
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Switch
                        checked={enabled}
                        onCheckedChange={() => {
                            // Prevent event bubbling to toggle expand
                            toggleEnabled();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        size="sm"
                        aria-label={t('autoApprove.toggle')}
                    />
                    <span className="text-xs text-foreground font-medium truncate">
                        {t('autoApprove.title')}
                    </span>
                    {enabled && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {summaryText}
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
            </button>

            {/* Content - Expandable */}
            {isExpanded && (
                <div
                    id="auto-approve-content"
                    className="px-3 pb-3 pt-1 border-t border-border-dark space-y-2"
                >
                    {/* Description */}
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {t('autoApprove.description')}
                    </p>

                    {/* Category toggles */}
                    <div className="space-y-1">
                        {CATEGORY_CONFIGS.map((config) => {
                            const Icon = config.icon;
                            const isEnabled = categories[config.key];
                            const isDisabled = !enabled;

                            // In compact mode, only show enabled categories plus core ones
                            if (compact && !isEnabled && !['read', 'write', 'execute'].includes(config.key)) {
                                return null;
                            }

                            return (
                                <div
                                    key={config.key}
                                    className={cn(
                                        'flex items-center justify-between py-1 px-2 rounded',
                                        isDisabled && 'opacity-50'
                                    )}
                                >
                                    <Label
                                        htmlFor={`auto-approve-${config.key}`}
                                        className={cn(
                                            'flex items-center gap-2 text-xs cursor-pointer',
                                            isDisabled && 'cursor-not-allowed'
                                        )}
                                    >
                                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>{t(config.labelKey)}</span>
                                    </Label>
                                    <Switch
                                        id={`auto-approve-${config.key}`}
                                        checked={isEnabled}
                                        onCheckedChange={() => toggleCategory(config.key)}
                                        disabled={isDisabled}
                                        size="sm"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border-dark/50">
                        <button
                            type="button"
                            onClick={() => {
                                CATEGORY_CONFIGS.forEach((config) => {
                                    if (!categories[config.key]) {
                                        toggleCategory(config.key);
                                    }
                                });
                            }}
                            disabled={!enabled}
                            className={cn(
                                'text-[10px] px-2 py-0.5 text-primary hover:underline',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            {t('autoApprove.enableAll')}
                        </button>
                        <span className="text-muted-foreground">|</span>
                        <button
                            type="button"
                            onClick={() => {
                                CATEGORY_CONFIGS.forEach((config) => {
                                    if (categories[config.key]) {
                                        toggleCategory(config.key);
                                    }
                                });
                            }}
                            disabled={!enabled}
                            className={cn(
                                'text-[10px] px-2 py-0.5 text-muted-foreground hover:text-foreground',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            {t('autoApprove.disableAll')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoApproveSettings;
