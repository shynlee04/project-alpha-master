/**
 * @fileoverview Tool Permissions Configuration Component
 * @module components/agent/ToolPermissionsConfig
 *
 * UI component for configuring tool trust levels.
 * Allows users to set auto/prompt/block for each tool.
 *
 * @story 4-3 - Tool Permissions & Trust Levels
 * @epic 4 - Smart Agent Tools
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/presentation/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/presentation/components/ui/select';
import { cn } from '@/lib/utils';
import type { ToolPermissionManager, ToolTrustLevel } from '@/lib/agent/tool-permission-manager';
import { ToolPermissionManager as ToolPermissionManagerClass } from '@/lib/agent/tool-permission-manager';

/**
 * Tool display information
 */
interface ToolInfo {
    id: string;
    name: string;
    description: string;
    category: 'file' | 'terminal' | 'system';
    defaultLevel: ToolTrustLevel;
}

/**
 * ToolPermissionsConfig Component Props
 */
export interface ToolPermissionsConfigProps {
    /** Permission manager instance */
    permissionManager?: ToolPermissionManager;
    /** Callback when permissions change */
    onPermissionsChange?: (permissions: Record<string, ToolTrustLevel>) => void;
    /** Whether the component is read-only */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Trust level configuration for UI
 */
const TRUST_LEVEL_CONFIG: Record<ToolTrustLevel, {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
}> = {
    auto: {
        label: 'Auto-allow',
        icon: ShieldCheck,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/30',
        description: 'Execute immediately without approval',
    },
    prompt: {
        label: 'Prompt each time',
        icon: ShieldQuestion,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/30',
        description: 'Show approval dialog before execution',
    },
    block: {
        label: 'Block',
        icon: ShieldAlert,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        description: 'Never execute this tool',
    },
};

/**
 * Available tools with their default trust levels
 */
const AVAILABLE_TOOLS: ToolInfo[] = [
    {
        id: 'read_file',
        name: 'Read File',
        description: 'Read the contents of a file',
        category: 'file',
        defaultLevel: 'auto',
    },
    {
        id: 'list_files',
        name: 'List Files',
        description: 'List files in a directory',
        category: 'file',
        defaultLevel: 'auto',
    },
    {
        id: 'read_directory',
        name: 'Read Directory',
        description: 'Read directory contents',
        category: 'file',
        defaultLevel: 'auto',
    },
    {
        id: 'write_file',
        name: 'Write File',
        description: 'Create or modify a file',
        category: 'file',
        defaultLevel: 'prompt',
    },
    {
        id: 'create_directory',
        name: 'Create Directory',
        description: 'Create a new directory',
        category: 'file',
        defaultLevel: 'prompt',
    },
    {
        id: 'delete_file',
        name: 'Delete File',
        description: 'Delete a file or directory',
        category: 'file',
        defaultLevel: 'block',
    },
    {
        id: 'execute_command',
        name: 'Execute Command',
        description: 'Run a terminal command',
        category: 'terminal',
        defaultLevel: 'prompt',
    },
];

/**
 * ToolPermissionsConfig - Configure tool trust levels
 */
export const ToolPermissionsConfig: React.FC<ToolPermissionsConfigProps> = ({
    permissionManager: propPermissionManager,
    onPermissionsChange,
    disabled = false,
    className,
}) => {
    const { t } = useTranslation();

    // Use provided permission manager or create one
    const [localManager] = useState(() => ToolPermissionManagerClass.createInstance());
    const permissionManager = propPermissionManager ?? localManager;

    // Get current trust levels
    const currentPermissions = useMemo(() => {
        return permissionManager.getAllTrustLevels();
    }, [permissionManager]);

    // Get tools by category
    const toolsByCategory = useMemo(() => {
        const grouped: Record<string, ToolInfo[]> = {
            file: [],
            terminal: [],
            system: [],
        };
        AVAILABLE_TOOLS.forEach(tool => {
            grouped[tool.category].push(tool);
        });
        return grouped;
    }, []);

    // Handle trust level change
    const handleTrustLevelChange = useCallback((toolId: string, level: ToolTrustLevel) => {
        if (disabled) return;

        permissionManager.setTrustLevel(toolId, level);

        // Notify callback
        if (onPermissionsChange) {
            const updated = permissionManager.getAllTrustLevels();
            onPermissionsChange(updated);
        }

        // Show toast
        const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
        const toolName = tool?.name ?? toolId;
        toast.success(t('agents.permissions.updated', "Tool permission updated"), {
            description: `${toolName} → ${TRUST_LEVEL_CONFIG[level].label}`,
        });
    }, [permissionManager, disabled, onPermissionsChange, t]);

    // Handle reset to defaults
    const handleResetDefaults = useCallback(() => {
        if (disabled) return;

        permissionManager.resetToDefaults();

        if (onPermissionsChange) {
            const updated = permissionManager.getAllTrustLevels();
            onPermissionsChange(updated);
        }

        toast.success(t('agents.permissions.reset', 'Permissions reset to defaults'));
    }, [permissionManager, disabled, onPermissionsChange, t]);

    // Set up event listener for permission changes
    useEffect(() => {
        const handlePermissionChange = () => {
            if (onPermissionsChange) {
                const updated = permissionManager.getAllTrustLevels();
                onPermissionsChange(updated);
            }
        };

        permissionManager.setEventBus({
            on: () => {},
            emit: (_event: string, ..._args: unknown[]) => {
                if (_event === 'permission:changed') {
                    handlePermissionChange();
                }
            },
            off: () => {},
            removeAllListeners: () => {},
            listenerCount: () => 0,
            eventNames: () => [],
        } as any);

        return () => {
            permissionManager.clearSessionTrust();
        };
    }, [permissionManager, onPermissionsChange]);

    // Render trust level selector for a tool
    const renderTrustLevelSelector = (tool: ToolInfo) => {
        const currentLevel = currentPermissions[tool.id] ?? 'prompt';
        const config = TRUST_LEVEL_CONFIG[currentLevel];
        const Icon = config.icon;

        return (
            <div key={tool.id} className="flex items-center justify-between p-3 border border-border rounded bg-card/50">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        'p-2 rounded',
                        config.bgColor,
                        config.borderColor,
                        'border'
                    )}>
                        <Icon className={cn('w-4 h-4', config.color)} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                </div>

                <Select
                    value={currentLevel}
                    onValueChange={(value) => handleTrustLevelChange(tool.id, value as ToolTrustLevel)}
                    disabled={disabled}
                >
                    <SelectTrigger className={cn(
                        'w-36 rounded-none',
                        config.color,
                        config.bgColor,
                        config.borderColor,
                        'border'
                    )}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="auto">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-success" />
                                <span>{t('agents.permissions.auto', 'Auto-allow')}</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="prompt">
                            <div className="flex items-center gap-2">
                                <ShieldQuestion className="w-4 h-4 text-warning" />
                                <span>{t('agents.permissions.prompt', 'Prompt each time')}</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="block">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-destructive" />
                                <span>{t('agents.permissions.block', 'Block')}</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        );
    };

    // Render category section
    const renderCategory = (category: string, title: string) => {
        const tools = toolsByCategory[category] ?? [];
        if (tools.length === 0) return null;

        return (
            <div key={category} className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </h4>
                <div className="space-y-2">
                    {tools.map(renderTrustLevelSelector)}
                </div>
            </div>
        );
    };

    // Count tools by level
    const counts = useMemo(() => {
        const c = { auto: 0, prompt: 0, block: 0 };
        AVAILABLE_TOOLS.forEach(tool => {
            const level = currentPermissions[tool.id] ?? tool.defaultLevel;
            c[level]++;
        });
        return c;
    }, [currentPermissions]);

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-pixel text-foreground">
                        {t('agents.permissions.title', 'Tool Permissions')}
                    </h3>
                </div>

                {!disabled && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetDefaults}
                        className="rounded-none gap-1"
                    >
                        <RotateCcw className="w-3 h-3" />
                        {t('agents.permissions.resetDefaults', 'Reset to Defaults')}
                    </Button>
                )}
            </div>

            {/* Summary */}
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">{counts.auto}</span>
                    <span className="text-muted-foreground">{t('agents.permissions.autoCount', 'Auto')}</span>
                </div>
                <div className="flex items-center gap-1">
                    <ShieldQuestion className="w-4 h-4 text-warning" />
                    <span className="text-muted-foreground">{counts.prompt}</span>
                    <span className="text-muted-foreground">{t('agents.permissions.promptCount', 'Prompt')}</span>
                </div>
                <div className="flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-destructive" />
                    <span className="text-muted-foreground">{counts.block}</span>
                    <span className="text-muted-foreground">{t('agents.permissions.blockCount', 'Blocked')}</span>
                </div>
            </div>

            {/* Tool Categories */}
            <div className="space-y-6">
                {renderCategory('file', t('agents.permissions.category.file', 'File Operations'))}
                {renderCategory('terminal', t('agents.permissions.category.terminal', 'Terminal Commands'))}
            </div>

            {/* Info Box */}
            <div className={cn(
                'p-4 rounded border',
                'bg-info/10',
                'border-info/30'
            )}>
                <div className="flex items-start gap-3">
                    <ShieldQuestion className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                            {t('agents.permissions.info.title', 'About Tool Permissions')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('agents.permissions.info.description',
                                'Configure how the AI agent handles tool execution. Auto-allowed tools run immediately, ' +
                                'prompted tools require your approval, and blocked tools are prevented entirely. ' +
                                'Session-based trust (from approval dialogs) overrides these settings temporarily.')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolPermissionsConfig;
