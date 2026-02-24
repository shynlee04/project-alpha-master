/**
 * Tool Trust Level Manager - Global Tool Permission Configuration
 *
 * UI for managing global tool trust levels across all agents.
 * Allows users to configure which tools require approval.
 *
 * Trust Levels:
 * - 'auto': Execute immediately without user approval (safe operations)
 * - 'prompt': Require user approval before execution (risky operations)
 * - 'block': Never execute (dangerous operations)
 *
 * @module presentation/components/agent
 * @governance Ralph Loop Cycle 17, Phase 3
 *
 * Ralph Loop Cycle 17 Phase 3:
 * - Refactored from 246 lines to ~100 lines (59% reduction)
 * - Split into 3 focused components + 1 custom hook
 * - December 2025 React patterns applied
 */

import { RotateCcw } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { useTranslation } from 'react-i18next'
import { TrustLevelLegend, ToolTrustRow, useToolTrustLevels } from './ToolTrustLevels'

/**
 * ToolTrustLevelManager Component
 *
 * Orchestrator component that provides UI for managing global tool trust levels
 * with persistence. Uses component composition and custom hooks.
 */
export function ToolTrustLevelManager() {
    const { t } = useTranslation()

    // Business logic extracted to custom hook
    const { tools, hasChanges, handleTrustLevelChange, handleSave, handleReset } =
        useToolTrustLevels()

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-pixel font-bold">
                        {t('agents.config.trustLevels.title', 'Tool Trust Levels')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('agents.config.trustLevels.description', 'Configure global tool execution permissions')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} className="font-pixel">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {t('common.reset', 'Reset')}
                    </Button>
                    {hasChanges && (
                        <Button size="sm" onClick={handleSave} className="font-pixel">
                            {t('common.save', 'Save')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Trust Level Legend */}
            <TrustLevelLegend />

            {/* Tools Grid */}
            <div className="grid gap-3">
                {tools.map((tool) => (
                    <ToolTrustRow key={tool.toolId} tool={tool} onTrustLevelChange={handleTrustLevelChange} />
                ))}
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> These settings apply globally to all agents. Individual agents may have
                    additional workspace-specific tool restrictions configured in the Workspace tab.
                </p>
            </div>
        </div>
    )
}
