/**
 * @fileoverview Custom Slash Commands Manager UI
 * @module components/notes/SlashCommandManager
 * @created 2026-01-08
 * 
 * UI for creating, editing, and managing custom AI slash commands.
 * Supports icon selection, i18n (EN/VI), and import/export.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus, Trash2, Edit2, Save, X, Upload, Download,
    RotateCcw, GripVertical, ToggleLeft, ToggleRight,
    Sparkles, Lightbulb, ListTodo, SpellCheck, Users,
    BookOpen, FileText, MessageSquare, Wand2, Zap,
    Brain, Code, FileCode, Globe, Heart,
    PenTool, Search, Star, Target, Rocket,
    Coffee, Palette, Music, Camera, Mic,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { toast } from 'sonner';
import {
    useSlashCommandStore,
    type CustomSlashCommand,
    AVAILABLE_ICONS,
    getLocalizedCommand,
} from '@/lib/notes/slash-command-store';

// ============================================================================
// Icon Map
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Sparkles, Lightbulb, ListTodo, SpellCheck, Users,
    BookOpen, FileText, MessageSquare, Wand2, Zap,
    Brain, Code, FileCode, Globe, Heart,
    PenTool, Search, Star, Target, Rocket,
    Coffee, Palette, Music, Camera, Mic,
};

function getIcon(iconName: string, className?: string) {
    const Icon = ICON_MAP[iconName] || Sparkles;
    return <Icon className={className} />;
}

// ============================================================================
// Main Component
// ============================================================================

export function SlashCommandManager() {
    const { t, i18n } = useTranslation();
    const {
        customCommands,
        addCommand,
        updateCommand,
        deleteCommand,
        toggleCommand,
        exportCommands,
        importCommands,
        resetToDefaults,
    } = useSlashCommandStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<CustomSlashCommand>>({});

    const locale = i18n.language;

    // Handle create new command
    const handleCreate = () => {
        setIsCreating(true);
        setFormData({
            title: '',
            titleVi: '',
            description: '',
            descriptionVi: '',
            prompt: '',
            icon: 'Sparkles',
            aliases: [],
            isEnabled: true,
        });
    };

    // Handle edit command
    const handleEdit = (command: CustomSlashCommand) => {
        setEditingId(command.id);
        setFormData(command);
    };

    // Handle save (create or update)
    const handleSave = () => {
        if (!formData.title || !formData.prompt) {
            toast.error(t('notes.slashCommands.error.required', 'Title and prompt are required'));
            return;
        }

        if (isCreating) {
            addCommand({
                title: formData.title || '',
                titleVi: formData.titleVi,
                description: formData.description || '',
                descriptionVi: formData.descriptionVi,
                prompt: formData.prompt || '',
                icon: formData.icon || 'Sparkles',
                aliases: formData.aliases || [],
                isEnabled: true,
            });
            toast.success(t('notes.slashCommands.created', 'Command created'));
        } else if (editingId) {
            updateCommand(editingId, formData);
            toast.success(t('notes.slashCommands.updated', 'Command updated'));
        }

        setIsCreating(false);
        setEditingId(null);
        setFormData({});
    };

    // Handle cancel
    const handleCancel = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({});
    };

    // Handle export
    const handleExport = () => {
        const commands = exportCommands();
        const blob = new Blob([JSON.stringify(commands, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'via-gent-slash-commands.json';
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('notes.slashCommands.exported', 'Commands exported'));
    };

    // Handle import
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                const commands = JSON.parse(text) as CustomSlashCommand[];
                importCommands(commands);
                toast.success(t('notes.slashCommands.imported', `${commands.length} commands imported`));
            } catch {
                toast.error(t('notes.slashCommands.error.import', 'Failed to import commands'));
            }
        };
        input.click();
    };

    // Handle reset
    const handleReset = () => {
        if (window.confirm(t('notes.slashCommands.confirmReset', 'Reset all commands to defaults?'))) {
            resetToDefaults();
            toast.success(t('notes.slashCommands.reset', 'Commands reset to defaults'));
        }
    };

    return (
        <div className="slash-command-manager p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t('notes.slashCommands.title', 'Custom AI Commands')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('notes.slashCommands.description', 'Create custom slash commands with your own prompts')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleImport}>
                        <Upload className="w-4 h-4 mr-1" />
                        {t('common.import', 'Import')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-1" />
                        {t('common.export', 'Export')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleReset}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                    </Button>
                    <Button size="sm" onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-1" />
                        {t('notes.slashCommands.add', 'Add Command')}
                    </Button>
                </div>
            </div>

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
                <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">
                                {t('notes.slashCommands.form.title', 'Title (EN)')}*
                            </label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm"
                                placeholder="Brainstorm Ideas"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                {t('notes.slashCommands.form.titleVi', 'Title (VI)')}
                            </label>
                            <input
                                type="text"
                                value={formData.titleVi || ''}
                                onChange={(e) => setFormData({ ...formData, titleVi: e.target.value })}
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm"
                                placeholder="Brainstorm Ý tưởng"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">
                                {t('notes.slashCommands.form.description', 'Description (EN)')}
                            </label>
                            <input
                                type="text"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm"
                                placeholder="Generate creative ideas"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                {t('notes.slashCommands.form.descriptionVi', 'Description (VI)')}
                            </label>
                            <input
                                type="text"
                                value={formData.descriptionVi || ''}
                                onChange={(e) => setFormData({ ...formData, descriptionVi: e.target.value })}
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm"
                                placeholder="Tạo các ý tưởng sáng tạo"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            {t('notes.slashCommands.form.prompt', 'AI Prompt')}*
                        </label>
                        <textarea
                            value={formData.prompt || ''}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm h-24"
                            placeholder="Based on the current note context, brainstorm 5-10 creative ideas..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">
                                {t('notes.slashCommands.form.icon', 'Icon')}
                            </label>
                            <div className="flex flex-wrap gap-1 mt-1 p-2 bg-background border border-border rounded-md max-h-24 overflow-y-auto">
                                {AVAILABLE_ICONS.map((iconName) => (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: iconName })}
                                        className={`p-1.5 rounded ${formData.icon === iconName
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                            }`}
                                        title={iconName}
                                    >
                                        {getIcon(iconName, 'w-4 h-4')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                {t('notes.slashCommands.form.aliases', 'Aliases (comma separated)')}
                            </label>
                            <input
                                type="text"
                                value={(formData.aliases || []).join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    aliases: e.target.value.split(',').map(a => a.trim()).filter(Boolean),
                                })}
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm"
                                placeholder="brainstorm, ideas, ytuong"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-1" />
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-1" />
                            {t('common.save', 'Save')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Commands List */}
            <div className="space-y-2">
                {customCommands.map((command) => {
                    const localized = getLocalizedCommand(command, locale);
                    return (
                        <div
                            key={command.id}
                            className={`flex items-center gap-3 p-3 border border-border rounded-lg ${command.isEnabled ? 'bg-background' : 'bg-muted/50 opacity-60'
                                }`}
                        >
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded">
                                {getIcon(command.icon, 'w-4 h-4 text-primary')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{localized.title}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {localized.description}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleCommand(command.id)}
                                    title={command.isEnabled ? 'Disable' : 'Enable'}
                                >
                                    {command.isEnabled ? (
                                        <ToggleRight className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <ToggleLeft className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(command)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm('Delete this command?')) {
                                            deleteCommand(command.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
                {customCommands.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="w-8 h-8 mx-auto opacity-20 mb-2" />
                        <p>{t('notes.slashCommands.empty', 'No custom commands yet')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SlashCommandManager;
