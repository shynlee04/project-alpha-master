/**
 * @fileoverview Prompt Templates Dialog - Template Library Browser
 * @module components/notes/PromptTemplatesDialog
 * @story 43-05: Prompt Templates Library
 * @created 2026-01-12
 * 
 * Provides a dialog for browsing and importing pre-built prompt templates.
 * Features category filtering, search, and one-click import to custom commands.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { ScrollArea } from '@/presentation/components/ui/scroll-area';
import {
    Search,
    Download,
    Star,
    Sparkles,
    PenTool,
    Brain,
    ListTodo,
    MessageSquare,
    Code,
    Palette,
    Check,
    X,
    ChevronRight,
    BookOpen,
    FileText,
    Users,
    Wand2,
    Zap,
    Globe,
    Target,
    Rocket,
    Lightbulb,
    FileCode,
    Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    ALL_PROMPT_TEMPLATES,
    getTemplatesByCategory,
    getFeaturedTemplates,
    searchTemplates,
    getTemplateCounts,
    templateToCommand,
    type PromptTemplate,
} from '@/lib/notes/prompt-templates-data';
import { useSlashCommandStore, COMMAND_CATEGORIES, type CommandCategory } from '@/lib/notes/slash-command-store';
import { toast } from 'sonner';

// ============================================================================
// Icon Mapping
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Sparkles,
    PenTool,
    Brain,
    ListTodo,
    MessageSquare,
    Code,
    Palette,
    BookOpen,
    FileText,
    Users,
    Wand2,
    Zap,
    Globe,
    Target,
    Rocket,
    Lightbulb,
    FileCode,
    Camera,
    Search,
    Star,
};

const CATEGORY_ICONS: Record<CommandCategory | 'all' | 'featured', React.ComponentType<{ className?: string }>> = {
    all: Sparkles,
    featured: Star,
    writing: PenTool,
    analysis: Brain,
    productivity: ListTodo,
    communication: MessageSquare,
    technical: Code,
    creative: Palette,
    custom: Wand2,
};

// ============================================================================
// Props
// ============================================================================

interface PromptTemplatesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// ============================================================================
// Component
// ============================================================================

export function PromptTemplatesDialog({ open, onOpenChange }: PromptTemplatesDialogProps) {
    const { i18n } = useTranslation();
    const isVi = i18n.language?.startsWith('vi');
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CommandCategory | 'all' | 'featured'>('featured');
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
    const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
    
    // Store
    const addCommand = useSlashCommandStore((s) => s.addCommand);
    const customCommands = useSlashCommandStore((s) => s.customCommands);
    
    // Derived data
    const templateCounts = useMemo(() => getTemplateCounts(), []);
    
    const filteredTemplates = useMemo(() => {
        if (searchQuery.trim()) {
            return searchTemplates(searchQuery);
        }
        if (selectedCategory === 'featured') {
            return getFeaturedTemplates();
        }
        return getTemplatesByCategory(selectedCategory === 'all' ? 'all' : selectedCategory as CommandCategory);
    }, [searchQuery, selectedCategory]);
    
    // Check if template already imported
    const isTemplateImported = useCallback((template: PromptTemplate): boolean => {
        return importedIds.has(template.id) || 
            customCommands.some(cmd => 
                cmd.title === template.title || 
                cmd.prompt === template.prompt
            );
    }, [importedIds, customCommands]);
    
    // Import template as custom command
    const handleImport = useCallback((template: PromptTemplate) => {
        if (isTemplateImported(template)) {
            toast.info(isVi ? 'Template đã được import trước đó' : 'Template already imported');
            return;
        }
        
        const command = templateToCommand(template);
        addCommand(command);
        setImportedIds(prev => new Set(prev).add(template.id));
        
        toast.success(
            isVi 
                ? `Đã thêm "${template.titleVi}" vào lệnh của bạn` 
                : `Added "${template.title}" to your commands`
        );
    }, [addCommand, isTemplateImported, isVi]);
    
    // Categories for sidebar
    const categories = useMemo(() => [
        { id: 'featured' as const, label: 'Featured', labelVi: 'Nổi bật', count: getFeaturedTemplates().length },
        { id: 'all' as const, label: 'All Templates', labelVi: 'Tất cả', count: ALL_PROMPT_TEMPLATES.length },
        ...Object.entries(COMMAND_CATEGORIES).map(([id, cat]) => ({
            id: id as CommandCategory,
            label: cat.label,
            labelVi: cat.labelVi,
            count: templateCounts[id as CommandCategory] || 0,
        })),
    ], [templateCounts]);
    
    // Render template card
    const renderTemplateCard = (template: PromptTemplate) => {
        const IconComponent = ICON_MAP[template.icon] || Sparkles;
        const isImported = isTemplateImported(template);
        const isSelected = selectedTemplate?.id === template.id;
        
        return (
            <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={cn(
                    'w-full text-left p-3 rounded-none border-2 transition-all',
                    'hover:border-[var(--primary)] hover:bg-[var(--muted)]',
                    isSelected 
                        ? 'border-[var(--primary)] bg-[var(--muted)]' 
                        : 'border-[var(--border)] bg-[var(--card)]',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'
                )}
            >
                <div className="flex items-start gap-3">
                    <div className={cn(
                        'p-2 rounded-none border-2 flex-shrink-0',
                        'bg-[var(--background)] border-[var(--border)]'
                    )}>
                        <IconComponent className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">
                                {isVi ? template.titleVi : template.title}
                            </h4>
                            {template.featured && (
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                            {isImported && (
                                <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-1">
                            {isVi ? template.descriptionVi : template.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {template.tags.slice(0, 3).map(tag => (
                                <span 
                                    key={tag} 
                                    className="text-[10px] px-1.5 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-none border border-[var(--border)]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0" />
                </div>
            </button>
        );
    };
    
    // Render template detail
    const renderTemplateDetail = () => {
        if (!selectedTemplate) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]">
                    <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-center">
                        {isVi 
                            ? 'Chọn một template để xem chi tiết' 
                            : 'Select a template to view details'}
                    </p>
                </div>
            );
        }
        
        const IconComponent = ICON_MAP[selectedTemplate.icon] || Sparkles;
        const isImported = isTemplateImported(selectedTemplate);
        
        return (
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={cn(
                        'p-3 rounded-none border-2',
                        'bg-[var(--primary)]/10 border-[var(--primary)]'
                    )}>
                        <IconComponent className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold">
                            {isVi ? selectedTemplate.titleVi : selectedTemplate.title}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                            {isVi ? selectedTemplate.descriptionVi : selectedTemplate.description}
                        </p>
                    </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedTemplate.tags.map(tag => (
                        <span 
                            key={tag} 
                            className="text-xs px-2 py-1 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-none border border-[var(--border)]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                
                {/* Variables */}
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">
                            {isVi ? 'Biến số cần điền:' : 'Variables to fill:'}
                        </h4>
                        <div className="space-y-2">
                            {selectedTemplate.variables.map((variable) => (
                                <div 
                                    key={variable.name}
                                    className="flex items-center gap-2 text-sm p-2 bg-[var(--muted)] rounded-none border border-[var(--border)]"
                                >
                                    <code className="text-[var(--primary)] font-mono text-xs">
                                        {`{{${variable.name}}}`}
                                    </code>
                                    <span className="text-[var(--muted-foreground)]">-</span>
                                    <span>{isVi ? variable.labelVi || variable.label : variable.label}</span>
                                    {variable.required && (
                                        <span className="text-red-500 text-xs">*</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Prompt Preview */}
                <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-medium mb-2">
                        {isVi ? 'Prompt:' : 'Prompt:'}
                    </h4>
                    <ScrollArea className="h-[200px] border-2 border-[var(--border)] rounded-none p-3 bg-[var(--background)]">
                        <pre className="text-xs whitespace-pre-wrap font-mono text-[var(--muted-foreground)]">
                            {selectedTemplate.prompt}
                        </pre>
                    </ScrollArea>
                </div>
                
                {/* Import Button */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <Button
                        onClick={() => handleImport(selectedTemplate)}
                        disabled={isImported}
                        className="w-full rounded-none"
                        variant={isImported ? 'secondary' : 'primary'}
                    >
                        {isImported ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                {isVi ? 'Đã import' : 'Already Imported'}
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                {isVi ? 'Import vào Commands' : 'Import to Commands'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] p-0 rounded-none border-2 border-[var(--border)] overflow-hidden">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <DialogHeader className="p-4 border-b-2 border-[var(--border)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--primary)]/10 rounded-none border-2 border-[var(--primary)]">
                                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                            </div>
                            <div>
                                <DialogTitle>
                                    {isVi ? 'Thư viện Prompt Templates' : 'Prompt Templates Library'}
                                </DialogTitle>
                                <DialogDescription>
                                    {isVi 
                                        ? `${ALL_PROMPT_TEMPLATES.length} templates sẵn sàng sử dụng`
                                        : `${ALL_PROMPT_TEMPLATES.length} templates ready to use`}
                                </DialogDescription>
                            </div>
                        </div>
                        
                        {/* Search */}
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                            <Input
                                placeholder={isVi ? 'Tìm kiếm templates...' : 'Search templates...'}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedCategory('all');
                                }}
                                className="pl-9 rounded-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />
                                </button>
                            )}
                        </div>
                    </DialogHeader>
                    
                    {/* Main Content */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar - Categories */}
                        <div className="w-48 border-r-2 border-[var(--border)] p-2 overflow-y-auto flex-shrink-0">
                            {categories.map((cat) => {
                                const CatIcon = CATEGORY_ICONS[cat.id] || Sparkles;
                                const isActive = selectedCategory === cat.id && !searchQuery;
                                
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat.id);
                                            setSearchQuery('');
                                            setSelectedTemplate(null);
                                        }}
                                        className={cn(
                                            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-none transition-colors',
                                            'hover:bg-[var(--muted)]',
                                            isActive && 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                                        )}
                                    >
                                        <CatIcon className="h-4 w-4 flex-shrink-0" />
                                        <span className="flex-1 text-left truncate">
                                            {isVi ? cat.labelVi : cat.label}
                                        </span>
                                        <span className={cn(
                                            'text-xs px-1.5 py-0.5 rounded-none',
                                            isActive 
                                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                                                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                                        )}>
                                            {cat.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Template List */}
                        <div className="w-72 border-r-2 border-[var(--border)] overflow-hidden flex-shrink-0">
                            <ScrollArea className="h-full p-2">
                                <div className="space-y-2">
                                    {filteredTemplates.length === 0 ? (
                                        <div className="text-center py-8 text-[var(--muted-foreground)]">
                                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">
                                                {isVi ? 'Không tìm thấy template' : 'No templates found'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredTemplates.map(renderTemplateCard)
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        
                        {/* Template Detail */}
                        <div className="flex-1 p-4 overflow-hidden">
                            {renderTemplateDetail()}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default PromptTemplatesDialog;
