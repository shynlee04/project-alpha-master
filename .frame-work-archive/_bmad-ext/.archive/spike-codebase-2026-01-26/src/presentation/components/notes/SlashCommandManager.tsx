/**
 * @fileoverview Custom Slash Commands Manager UI
 * @module components/notes/SlashCommandManager
 * @created 2026-01-08
 * 
 * UI for creating, editing, and managing custom AI slash commands.
 * Supports icon selection, i18n (EN/VI), and import/export.
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus, Trash2, Edit2, Save, X, Upload, Download,
    RotateCcw, GripVertical, ToggleLeft, ToggleRight, X as XIcon, Tag,
    Sparkles, Lightbulb, ListTodo, SpellCheck, Users,
    BookOpen, FileText, MessageSquare, Wand2, Zap,
    Brain, Code, FileCode, Globe, Heart,
    PenTool, Search, Star, Target, Rocket,
    Coffee, Palette, Music, Camera, Mic,
    Library, Share2,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { toast } from 'sonner';
import {
    useSlashCommandStore,
    type CustomSlashCommand,
    AVAILABLE_ICONS,
    getLocalizedCommand,
    COMMAND_CATEGORIES,
    extractVariablesFromPrompt,
} from '@/lib/notes/slash-command-store';
// 43-05: Prompt Templates Dialog
import { PromptTemplatesDialog } from './PromptTemplatesDialog';
// 43-07: Prompt Share/Import Dialogs
import { PromptShareDialog, PromptImportDialog } from './PromptShareDialog';

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
        selectedCategory,
        selectedTags,
        addCommand,
        updateCommand,
        deleteCommand,
        toggleCommand,
        exportCommands,
        importCommands,
        resetToDefaults,
        selectCategory,
        toggleTag,
        clearTagFilters,
        getAllTags,
        getCommandsByCategory,
    } = useSlashCommandStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<CustomSlashCommand>>({});
    const [tagInput, setTagInput] = useState(''); // 43-02: Tag input state
    const [showTemplates, setShowTemplates] = useState(false); // 43-05: Templates dialog state
    // 43-07: Share/Import dialog states
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [shareCommand, setShareCommand] = useState<CustomSlashCommand | null>(null);
    const [showImportDialog, setShowImportDialog] = useState(false);

    const locale = i18n.language;

    // 43-02: Filtered commands based on category and tags
    const filteredCommands = useMemo(() => {
        let commands = getCommandsByCategory(selectedCategory);

        // Filter by selected tags
        if (selectedTags.length > 0) {
            commands = commands.filter((cmd) =>
                selectedTags.some((tag) => cmd.tags?.includes(tag))
            );
        }

        return commands;
    }, [customCommands, selectedCategory, selectedTags, getCommandsByCategory]);

    // 43-02: All tags for filter chips
    const allTags = getAllTags();

    // Handle create new command
    const handleCreate = () => {
        setIsCreating(true);
        setTagInput('');
        setFormData({
            title: '',
            titleVi: '',
            description: '',
            descriptionVi: '',
            prompt: '',
            icon: 'Sparkles',
            aliases: [],
            category: 'custom',
            tags: [],
            isEnabled: true,
        });
    };

    // Handle edit command
    const handleEdit = (command: CustomSlashCommand) => {
        setEditingId(command.id);
        setFormData(command);
        setTagInput('');
    };

    // 43-02: Add/remove tag from form data
    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        const newTags = [...(formData.tags || []), tagInput.trim()];
        setFormData({ ...formData, tags: newTags });
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: (formData.tags || []).filter((tag) => tag !== tagToRemove),
        });
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
                category: formData.category || 'custom',
                tags: formData.tags || [],
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
        setTagInput('');
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
                    {/* 43-07: Import from Share button */}
                    <Button size="sm" variant="outline" onClick={() => setShowImportDialog(true)}>
                        <Download className="w-4 h-4 mr-1" />
                        {t('notes.slashCommands.importShare', 'Import Share')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-1" />
                        {t('common.export', 'Export')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleReset}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                    </Button>
                    {/* 43-05: Browse Templates button */}
                    <Button size="sm" variant="outline" onClick={() => setShowTemplates(true)}>
                        <Library className="w-4 h-4 mr-1" />
                        {t('notes.slashCommands.templates', 'Templates')}
                    </Button>
                    <Button size="sm" onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-1" />
                        {t('notes.slashCommands.add', 'Add Command')}
                    </Button>
                </div>
            </div>

            {/* 43-02: Category Filter Tabs */}
            <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    {t('notes.slashCommands.categories', 'Categories')}
                </label>
                <div className="flex flex-wrap gap-1">
                    <button
                        onClick={() => selectCategory('all')}
                        className={`px-3 py-1.5 text-xs font-mono rounded-none border-2 border-border ${
                            selectedCategory === 'all'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-accent'
                        }`}
                    >
                        All
                    </button>
                    {Object.values(COMMAND_CATEGORIES).map((cat) => {
                        const Icon = ICON_MAP[cat.icon] || Sparkles;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => selectCategory(cat.id as any)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-none border-2 border-border ${
                                    selectedCategory === cat.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-accent'
                                }`}
                            >
                                <Icon className="w-3 h-3" />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 43-02: Tag Filter Chips */}
            {allTags.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                            {t('notes.slashCommands.tags', 'Tags')}
                        </label>
                        {selectedTags.length > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={clearTagFilters}
                            >
                                <XIcon className="w-3 h-3 mr-1" />
                                {t('common.clear', 'Clear')}
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border ${
                                    selectedTags.includes(tag)
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-muted border-border text-muted-foreground hover:bg-accent'
                                }`}
                            >
                                <Tag className="w-3 h-3" />
                                <span>{tag}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
                <div className="border border-border rounded-none p-4 bg-muted/30 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">
                                {t('notes.slashCommands.form.title', 'Title (EN)')}*
                            </label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-none text-sm"
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
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-none text-sm"
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
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-none text-sm"
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
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-none text-sm"
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
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-none text-sm"
                                placeholder="brainstorm, ideas, ytuong"
                            />
                        </div>
                    </div>

                    {/* 43-02: Category selector */}
                    <div>
                        <label className="text-sm font-medium">
                            {t('notes.slashCommands.form.category', 'Category')}
                        </label>
                        <select
                            value={formData.category || 'custom'}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-none text-sm"
                        >
                            {Object.values(COMMAND_CATEGORIES).map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 43-02: Tags input */}
                    <div>
                        <label className="text-sm font-medium">
                            {t('notes.slashCommands.form.tags', 'Tags')}
                        </label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                className="flex-1 px-3 py-2 bg-background border border-border rounded-none text-sm"
                                placeholder="Add a tag..."
                            />
                            <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {/* Selected tags */}
                        {(formData.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {(formData.tags || []).map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-md"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-destructive"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 43-03: Refinement toggle */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-none">
                        <div>
                            <label className="text-sm font-medium">
                                {t('notes.slashCommands.form.enableRefinement', 'Enable 2-Step Refinement')}
                            </label>
                            <p className="text-xs text-muted-foreground">
                                {t('notes.slashCommands.form.refinementHint', 'Show a dialog to fill in {{variables}} before generating')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ 
                                ...formData, 
                                enableRefinement: !formData.enableRefinement 
                            })}
                            className="p-1"
                        >
                            {formData.enableRefinement ? (
                                <ToggleRight className="w-6 h-6 text-success" />
                            ) : (
                                <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                            )}
                        </button>
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
                {filteredCommands.map((command) => {
                    const localized = getLocalizedCommand(command, locale);
                    const hasVariables = extractVariablesFromPrompt(command.prompt).length > 0 || command.enableRefinement;
                    return (
                        <div
                            key={command.id}
                            className={`flex items-center gap-3 p-3 border border-border rounded-none ${command.isEnabled ? 'bg-background' : 'bg-muted/50 opacity-60'
                                }`}
                        >
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-none">
                                {getIcon(command.icon, 'w-4 h-4 text-primary')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm flex items-center gap-2">
                                    {localized.title}
                                    {/* 43-03: Badge for commands with variables */}
                                    {hasVariables && (
                                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 rounded-sm">
                                            2-step
                                        </span>
                                    )}
                                </div>
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
                                        <ToggleRight className="w-4 h-4 text-success" />
                                    ) : (
                                        <ToggleLeft className="w-4 h-4" />
                                    )}
                                </Button>
                                {/* 43-07: Share button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShareCommand(command);
                                        setShowShareDialog(true);
                                    }}
                                    title="Share"
                                >
                                    <Share2 className="w-4 h-4" />
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
            
            {/* 43-05: Prompt Templates Dialog */}
            <PromptTemplatesDialog 
                open={showTemplates} 
                onOpenChange={setShowTemplates} 
            />
            
            {/* 43-07: Prompt Share Dialog */}
            <PromptShareDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                command={shareCommand}
            />
            
            {/* 43-07: Prompt Import Dialog */}
            <PromptImportDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
                onImport={importCommands}
            />
        </div>
    );
}

export default SlashCommandManager;
