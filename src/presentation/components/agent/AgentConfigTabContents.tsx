/**
 * @fileoverview Agent Config Dialog Tab Contents
 * @module components/agent/AgentConfigTabContents
 *
 * Tab content components for agent configuration dialog.
 * Extracted from AgentConfigDialog for better separation of concerns.
 */

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Label } from '@/presentation/components/ui/label';
import { TabsContent } from '@/presentation/components/ui/tabs';
import { AgentBasicInfoTab } from './AgentConfigForm/AgentBasicInfoTab';
import { AgentProviderSelector } from './AgentConfigForm/AgentProviderSelector';
import { AgentModelSelector } from './AgentConfigForm/AgentModelSelector';
import { AgentAdvancedSettingsTab } from './AgentConfigForm/AgentAdvancedSettingsTab';
import { WorkspaceToolPermissionsConfig } from './WorkspaceToolPermissionsConfig';
import { ToolTrustLevelManager } from './ToolTrustLevelManager';
import type { AgentToolBinding } from '@/core/entities/Agent';
import type { Agent } from '@/core/entities/Agent';

interface BasicTabContentProps {
    name: string;
    description: string;
    providerId: string;
    providers: any[];
    modelId: string;
    models: any[];
    isLoadingModels: boolean;
    fetchModels: (providerId: string) => Promise<void>;
    errors: any;
    onFieldUpdate: (field: string, value: any) => void;
}

interface WorkspaceTabContentProps {
    agent: Agent | null;
    onPermissionsChange: (toolId: string, workspaceType: string, isEnabled: boolean) => void;
}

interface AdvancedTabContentProps {
    providerId: string;
    customBaseURL: string;
    customModelId: string;
    customHeaders: string;
    enableNativeTools: boolean;
    modelId: string;
    errors: any;
    onFieldUpdate: (field: string, value: any) => void;
}

export function BasicTabContent({
    name,
    description,
    providerId,
    providers,
    modelId,
    models,
    isLoadingModels,
    fetchModels,
    errors,
    onFieldUpdate,
}: BasicTabContentProps) {
    const { t } = useTranslation();

    return (
        <TabsContent value="basic" className="mt-4 space-y-4">
            <div className="space-y-4">
                {/* Agent Name and Description */}
                <AgentBasicInfoTab
                    name={name}
                    role={description}
                    onNameChange={(value) => onFieldUpdate('name', value)}
                    onRoleChange={(value) => onFieldUpdate('description', value)}
                    errors={errors}
                />

                {/* Provider Selection */}
                <AgentProviderSelector
                    providers={providers}
                    selectedProviderId={providerId}
                    onProviderChange={(value) => onFieldUpdate('providerId', value)}
                    error={errors.provider}
                />

                {/* Model Selection */}
                <AgentModelSelector
                    models={models}
                    selectedModel={modelId}
                    onModelChange={(value) => onFieldUpdate('modelId', value)}
                    onRefresh={async () => {
                        try {
                            await fetchModels(providerId);
                            toast.success(t('agents.config.modelsRefreshed', 'Models refreshed'));
                        } catch (err: any) {
                            toast.error(
                                t('agents.config.fetchFailed', 'Failed to fetch models: {{error}}', {
                                    error: err.message || 'Unknown error',
                                })
                            );
                        }
                    }}
                    isLoading={isLoadingModels}
                    disabled={!providerId}
                    error={errors.modelId}
                />
            </div>

            {/* API Key Section - Placeholder until proper hook integration */}
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                    {t('agents.config.apiKeyNote', 'API keys are managed in Provider Settings')}
                </p>
            </div>
        </TabsContent>
    );
}

export function WorkspaceTabContent({ agent, onPermissionsChange }: WorkspaceTabContentProps) {
    const { t } = useTranslation();

    return (
        <TabsContent value="workspace" className="mt-4 space-y-4">
            {agent ? (
                <WorkspaceToolPermissionsConfig
                    agent={agent}
                    onPermissionsChange={onPermissionsChange}
                />
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>{t('agents.config.saveFirstForWorkspace', 'Save the agent first to configure workspace permissions')}</p>
                </div>
            )}
        </TabsContent>
    );
}

export function AdvancedTabContent({
    providerId,
    customBaseURL,
    customModelId,
    customHeaders,
    enableNativeTools,
    modelId,
    errors,
    onFieldUpdate,
}: AdvancedTabContentProps) {
    const { t } = useTranslation();

    return (
        <TabsContent value="advanced" className="mt-4 space-y-4">
            <AgentAdvancedSettingsTab
                providerId={providerId}
                customBaseURL={customBaseURL}
                customModelId={customModelId}
                customHeaders={customHeaders}
                enableNativeTools={enableNativeTools}
                onCustomBaseURLChange={(val) => onFieldUpdate('customBaseURL', val)}
                onCustomModelIdChange={(val) => onFieldUpdate('customModelId', val)}
                onCustomHeadersChange={(val) => onFieldUpdate('customHeaders', val)}
                onEnableNativeToolsChange={(val) => onFieldUpdate('enableNativeTools', val)}
                onModelChange={(val) => onFieldUpdate('modelId', val)}
                errors={errors}
            />

            <div className="space-y-4 border-t pt-4">
                <Label>{t('agents.config.trustSettings', 'Tool Trust Settings')}</Label>
                <ToolTrustLevelManager />
            </div>
        </TabsContent>
    );
}
