/**
 * @fileoverview Agent Import/Export Component
 * @module presentation/components/agent/AgentImportExport
 *
 * Provides backup/restore functionality for agent configurations.
 * Supports JSON export/import with validation and merge strategies.
 * Part of P1-1 refactoring to extract from AgentConfigDialog god class.
 *
 * @December2025Patterns
 * - Single responsibility: Import/export only
 * - Reusable across agent management contexts
 * - Accessible with ARIA labels and keyboard navigation
 * - Type-safe with proper TypeScript interfaces
 */

import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/presentation/components/ui/button';
import { downloadAgentExport, readAgentImportFile, importAgents } from '@/lib/agent/agent-io';

/**
 * Props for AgentImportExport component
 */
export interface AgentImportExportProps {
    /** CSS class name for styling */
    className?: string;
    /** Import success callback (receives count of imported agents) */
    onImportSuccess?: (count: number) => void;
    /** Export success callback */
    onExportSuccess?: () => void;
}

/**
 * Agent Import/Export Component
 *
 * Provides buttons for exporting all agents to JSON and importing agents from JSON.
 * Uses hidden file input for import to maintain clean UI.
 *
 * @example
 * ```tsx
 * function AgentManagement() {
 *   return (
 *     <div className="flex gap-2">
 *       <AgentImportExport
 *         onImportSuccess={(count) => console.log(`Imported ${count} agents`)}
 *         onExportSuccess={() => console.log('Exported agents')}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function AgentImportExport({
    className,
    onImportSuccess,
    onExportSuccess,
}: AgentImportExportProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handle export - downloads all agents as JSON
     */
    const handleExport = useCallback(() => {
        try {
            downloadAgentExport();
            onExportSuccess?.();
        } catch (error) {
            console.error('[AgentImportExport] Export failed:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to export agents');
        }
    }, [onExportSuccess]);

    /**
     * Handle import - reads selected JSON file and merges agents
     */
    const handleFileSelect = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            try {
                const content = await readAgentImportFile(file);

                // Simple merge strategy for now (can be enhanced with UI dialog)
                const count = importAgents(content, 'merge');

                toast.success(
                    t('agents.config.importSuccess', 'Successfully imported {{count}} agents', { count })
                );

                onImportSuccess?.(count);

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error('[AgentImportExport] Import failed:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to import agents');
            }
        },
        [t, onImportSuccess]
    );

    /**
     * Trigger file input click for import
     */
    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div className={className}>
            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={handleFileSelect}
            />

            {/* Export button */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="rounded-none font-pixel"
                title={t('agents.config.exportAgents', 'Export all agents to JSON')}
                aria-label={t('agents.config.exportAgents', 'Export all agents to JSON')}
            >
                <Download className="w-4 h-4 mr-1" aria-hidden="true" />
                {t('agents.config.export', 'Export')}
            </Button>

            {/* Import button */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleImportClick}
                className="rounded-none font-pixel"
                title={t('agents.config.importAgents', 'Import agents from JSON')}
                aria-label={t('agents.config.importAgents', 'Import agents from JSON')}
            >
                <Upload className="w-4 h-4 mr-1" aria-hidden="true" />
                {t('agents.config.import', 'Import')}
            </Button>
        </div>
    );
}
