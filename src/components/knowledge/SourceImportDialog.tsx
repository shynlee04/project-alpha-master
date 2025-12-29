/**
 * @fileoverview Source Import Dialog (Story 6.1)
 * @module components/knowledge/SourceImportDialog
 * @governance EPIC-6-1
 *
 * Dialog for importing new sources (PDF, URL, Text).
 * Uses SourceImportPipeline for processing and persistence.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon, FileText, Loader2, AlertCircle } from 'lucide-react';
import { sourceImportPipeline } from '@/lib/knowledge/source-import';
import { toast } from 'sonner';

interface SourceImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
}

export function SourceImportDialog({ open, onOpenChange, projectId }: SourceImportDialogProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [textTitle, setTextTitle] = useState('');
    const [textContent, setTextContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setFile(null);
        setUrl('');
        setTextTitle('');
        setTextContent('');
        setError(null);
        setIsLoading(false);
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) resetForm();
        onOpenChange(val);
    };

    const handleImportPDF = async () => {
        if (!file) return;

        try {
            setIsLoading(true);
            setError(null);

            await sourceImportPipeline.importPDF(file, {
                projectId,
                onProgress: (msg) => toast.info(msg),
            });

            toast.success(t('knowledge.import.success', 'PDF imported successfully'));
            handleOpenChange(false);
        } catch (err) {
            console.error(err);
            setError((err as Error).message);
            toast.error(t('knowledge.import.error', 'Import failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportURL = async () => {
        if (!url) return;

        try {
            setIsLoading(true);
            setError(null);

            await sourceImportPipeline.importURL(url, {
                projectId,
                onProgress: (msg) => toast.info(msg),
            });

            toast.success(t('knowledge.import.success', 'URL imported successfully'));
            handleOpenChange(false);
        } catch (err) {
            console.error(err);
            setError((err as Error).message);
            toast.error(t('knowledge.import.error', 'Import failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportText = async () => {
        if (!textTitle || !textContent) return;

        try {
            setIsLoading(true);
            setError(null);

            await sourceImportPipeline.importText(textTitle, textContent, {
                projectId,
            });

            toast.success(t('knowledge.import.success', 'Text imported successfully'));
            handleOpenChange(false);
        } catch (err) {
            console.error(err);
            setError((err as Error).message);
            toast.error(t('knowledge.import.error', 'Import failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={!isLoading ? handleOpenChange : undefined}>
            <DialogContent className="sm:max-w-md bg-surface-dark border-border-dark text-foreground">
                <DialogHeader>
                    <DialogTitle>{t('knowledge.import.title', 'Import Source')}</DialogTitle>
                    <DialogDescription>
                        {t('knowledge.import.description', 'Add knowledge to your project from PDF, URL, or text.')}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="pdf" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pdf" className="flex items-center gap-2">
                            <Upload size={14} /> PDF
                        </TabsTrigger>
                        <TabsTrigger value="url" className="flex items-center gap-2">
                            <LinkIcon size={14} /> URL
                        </TabsTrigger>
                        <TabsTrigger value="text" className="flex items-center gap-2">
                            <FileText size={14} /> Text
                        </TabsTrigger>
                    </TabsList>

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 mt-4 flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* PDF IMPORT */}
                    <TabsContent value="pdf" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="pdf-file">{t('knowledge.import.pdfLabel', 'PDF File')}</Label>
                            <Input
                                id="pdf-file"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                disabled={isLoading}
                                className="cursor-pointer file:cursor-pointer file:text-primary"
                            />
                            {file && (
                                <p className="text-xs text-muted-foreground">
                                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleImportPDF}
                            disabled={!file || isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('knowledge.import.button', 'Import Source')}
                        </Button>
                    </TabsContent>

                    {/* URL IMPORT */}
                    <TabsContent value="url" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="url-input">{t('knowledge.import.urlLabel', 'Article URL')}</Label>
                            <Input
                                id="url-input"
                                type="url"
                                placeholder="https://example.com/article"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleImportURL}
                            disabled={!url || isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('knowledge.import.button', 'Start Extraction')}
                        </Button>
                    </TabsContent>

                    {/* TEXT IMPORT */}
                    <TabsContent value="text" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="text-title">{t('knowledge.import.textTitle', 'Title')}</Label>
                            <Input
                                id="text-title"
                                value={textTitle}
                                onChange={(e) => setTextTitle(e.target.value)}
                                placeholder="My Note"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="text-content">{t('knowledge.import.textContent', 'Content')}</Label>
                            <Textarea
                                id="text-content"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                placeholder="Paste or type content here..."
                                rows={6}
                                disabled={isLoading}
                                className="resize-none"
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleImportText}
                            disabled={!textTitle || !textContent || isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('knowledge.import.button', 'Save Note')}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
