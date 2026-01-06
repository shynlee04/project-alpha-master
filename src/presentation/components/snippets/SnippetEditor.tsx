/**
 * @fileoverview Snippet Editor Component
 * @module presentation/components/snippets/SnippetEditor
 * @governance S-031
 * @ai-observable true
 *
 * Create or edit code snippets with form validation.
 * 8-bit gaming style, mobile-responsive with 44px touch targets.
 *
 * Story S-031: Code Snippets Manager
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Textarea } from '@/presentation/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/presentation/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSnippetStore } from '@/lib/snippets/snippet-store';
import type { CodeSnippetRecord } from '@/infrastructure/persistence/dexie-db-snippet-types';

interface SnippetEditorProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when dialog open state changes */
    onOpenChange: (open: boolean) => void;
    /** Snippet to edit (null for create mode) */
    snippet: CodeSnippetRecord | null;
}

/**
 * Snippet form data
 */
interface SnippetFormData {
    name: string;
    description: string;
    language: string;
    code: string;
    tags: string;
    folder: string;
    shortcut: string;
}

/**
 * Initial form state
 */
const initialFormState: SnippetFormData = {
    name: '',
    description: '',
    language: 'typescript',
    code: '',
    tags: '',
    folder: '',
    shortcut: '',
};

/**
 * Common programming languages
 */
const COMMON_LANGUAGES = [
    'typescript',
    'javascript',
    'python',
    'java',
    'cpp',
    'csharp',
    'go',
    'rust',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'html',
    'css',
    'json',
    'yaml',
    'markdown',
    'sql',
    'bash',
    'plaintext',
];

/**
 * Common folders
 */
const COMMON_FOLDERS = [
    'react/components',
    'react/hooks',
    'typescript/types',
    'typescript/functions',
    'utilities/performance',
    'utilities/object',
    'testing/vitest',
    'api/fetch',
    'tanstack/query',
];

/**
 * Snippet Editor Dialog
 *
 * Features:
 * - Create/edit snippets
 * - Form validation
 * - Language and folder dropdowns
 * - Tag input (comma-separated)
 * - Code preview with syntax highlighting
 * - Mobile-responsive
 */
export function SnippetEditor({ open, onOpenChange, snippet }: SnippetEditorProps) {
    const { t } = useTranslation();
    const { isMobile } = useDeviceType();

    const createSnippet = useSnippetStore((s) => s.createSnippet);
    const updateSnippet = useSnippetStore((s) => s.updateSnippet);

    const [formData, setFormData] = useState<SnippetFormData>(initialFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof SnippetFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (snippet) {
            setFormData({
                name: snippet.name,
                description: snippet.description || '',
                language: snippet.language,
                code: snippet.code,
                tags: snippet.tags.join(', '),
                folder: snippet.folder,
                shortcut: snippet.shortcut || '',
            });
        } else {
            setFormData(initialFormState);
        }
        setErrors({});
    }, [snippet, open]);

    // Reset form when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setFormData(initialFormState);
            setErrors({});
        }
        onOpenChange(newOpen);
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SnippetFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('snippets.validation.nameRequired', {
                defaultValue: 'Name is required',
            });
        }

        if (!formData.code.trim()) {
            newErrors.code = t('snippets.validation.codeRequired', {
                defaultValue: 'Code is required',
            });
        }

        if (!formData.language.trim()) {
            newErrors.language = t('snippets.validation.languageRequired', {
                defaultValue: 'Language is required',
            });
        }

        if (!formData.folder.trim()) {
            newErrors.folder = t('snippets.validation.folderRequired', {
                defaultValue: 'Folder is required',
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Parse tags from comma-separated string
            const tags = formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            const snippetData = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                language: formData.language.trim(),
                code: formData.code,
                tags,
                folder: formData.folder.trim(),
                shortcut: formData.shortcut.trim() || undefined,
                isBuiltIn: false,
            };

            if (snippet) {
                // Update existing snippet
                await updateSnippet(snippet.id, snippetData);
            } else {
                // Create new snippet
                await createSnippet(snippetData);
            }

            onOpenChange(false);
        } catch (error) {
            console.error('[SnippetEditor] Failed to save snippet:', error);
            setErrors({
                name: t('snippets.validation.saveFailed', {
                    defaultValue: 'Failed to save snippet',
                }),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                size="lg"
                className={cn(
                    'max-h-[85vh] overflow-y-auto',
                    isMobile && 'w-screen h-full max-w-none max-h-none rounded-none'
                )}
            >
                <DialogHeader>
                    <DialogTitle>
                        {snippet
                            ? t('snippets.editTitle', { defaultValue: 'Edit Snippet' })
                            : t('snippets.createTitle', { defaultValue: 'New Snippet' })}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            {t('snippets.form.name', { defaultValue: 'Name' })}
                            <span className="text-destructive ml-1">*</span>
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('snippet.form.namePlaceholder', {
                                defaultValue: 'My Awesome Snippet',
                            })}
                            className={cn(
                                'rounded-none border-2',
                                errors.name && 'border-destructive'
                            )}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            {t('snippets.form.description', { defaultValue: 'Description' })}
                        </label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t('snippets.form.descriptionPlaceholder', {
                                defaultValue: 'Brief description of what this snippet does',
                            })}
                            className="rounded-none border-2"
                        />
                    </div>

                    {/* Language and Folder */}
                    <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                {t('snippets.form.language', { defaultValue: 'Language' })}
                                <span className="text-destructive ml-1">*</span>
                            </label>
                            <select
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className={cn(
                                    'w-full px-3 py-2 rounded-none border-2 border-border bg-background',
                                    errors.language && 'border-destructive'
                                )}
                            >
                                {COMMON_LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                            {errors.language && (
                                <p className="text-xs text-destructive mt-1">{errors.language}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                {t('snippets.form.folder', { defaultValue: 'Folder' })}
                                <span className="text-destructive ml-1">*</span>
                            </label>
                            <Input
                                list="folders"
                                value={formData.folder}
                                onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                                placeholder={t('snippets.form.folderPlaceholder', {
                                    defaultValue: 'react/hooks',
                                })}
                                className={cn(
                                    'rounded-none border-2',
                                    errors.folder && 'border-destructive'
                                )}
                            />
                            <datalist id="folders">
                                {COMMON_FOLDERS.map((folder) => (
                                    <option key={folder} value={folder}>
                                        {folder}
                                    </option>
                                ))}
                            </datalist>
                            {errors.folder && (
                                <p className="text-xs text-destructive mt-1">{errors.folder}</p>
                            )}
                        </div>
                    </div>

                    {/* Tags and Shortcut */}
                    <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                {t('snippets.form.tags', { defaultValue: 'Tags' })}
                            </label>
                            <Input
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder={t('snippets.form.tagsPlaceholder', {
                                    defaultValue: 'react, hook, typescript',
                                })}
                                className="rounded-none border-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('snippets.form.tagsHint', {
                                    defaultValue: 'Comma-separated tags',
                                })}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                {t('snippets.form.shortcut', { defaultValue: 'Shortcut' })}
                            </label>
                            <Input
                                value={formData.shortcut}
                                onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                                placeholder={t('snippets.form.shortcutPlaceholder', {
                                    defaultValue: 'useeffect',
                                })}
                                className="rounded-none border-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('snippets.form.shortcutHint', {
                                    defaultValue: 'Type to auto-expand',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            {t('snippets.form.code', { defaultValue: 'Code' })}
                            <span className="text-destructive ml-1">*</span>
                        </label>
                        <Textarea
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder={t('snippets.form.codePlaceholder', {
                                defaultValue: 'export function myComponent() { ... }',
                            })}
                            rows={10}
                            className={cn(
                                'font-mono text-sm rounded-none border-2 resize-none',
                                errors.code && 'border-destructive'
                            )}
                        />
                        {errors.code && (
                            <p className="text-xs text-destructive mt-1">{errors.code}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('snippets.form.placeholderHint', {
                                defaultValue: 'Use ${1:variableName} syntax for tab stops',
                            })}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <div className={cn('flex gap-2', isMobile ? 'flex-col' : 'flex-row')}>
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className={cn(
                                'rounded-none',
                                isMobile && 'min-h-[44px]'
                            )}
                        >
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={cn(
                                'rounded-none',
                                isMobile && 'min-h-[44px]'
                            )}
                        >
                            {isSubmitting
                                ? t('common.saving', { defaultValue: 'Saving...' })
                                : snippet
                                ? t('common.save', { defaultValue: 'Save' })
                                : t('common.create', { defaultValue: 'Create' })}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
