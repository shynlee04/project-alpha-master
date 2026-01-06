/**
 * @fileoverview Study File Picker Component
 * @module presentation/components/study/StudyFilePicker
 *
 * UI component for mounting directory and importing study materials.
 * Read-only access - scans for PDFs, quiz JSONs, and Markdown files.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Loader2, FolderOpen, FileText, BookOpen, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import type { ImportResult } from '@/lib/filesync/study-file-sync-service';
import type { FileSyncService } from '@/lib/filesync/file-sync-service';
import { StudyFileSyncService } from '@/lib/filesync/study-file-sync-service';

// Type for StudyFileSyncService instance
type StudyFileSyncServiceType = InstanceType<typeof StudyFileSyncService>;

interface StudyFilePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileSyncService: FileSyncService | null;
    onInitialize?: () => Promise<void>;
    isInitializing?: boolean;
    error?: string | null;
    isReady?: boolean;
    isSupported?: boolean;
}

interface StudyMaterial {
    path: string;
    type: 'pdf' | 'quiz' | 'markdown';
    name: string;
}

export function StudyFilePicker({
    open,
    onOpenChange,
    fileSyncService,
    onInitialize,
    isInitializing = false,
    error,
    isReady = false,
    isSupported = true,
}: StudyFilePickerProps) {
    const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);
    const [isMounting, setIsMounting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    // Clear state when dialog closes
    useEffect(() => {
        if (!open) {
            setMaterials([]);
            setImportResult(null);
        }
    }, [open]);

    const handleMount = async () => {
        // Check FSA support before attempting to mount
        const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
        if (!isFSASupported) {
            toast.info('Folder mounting requires a desktop browser', {
                description: 'Chrome, Edge, or Opera on desktop is required for study material import.',
            });
            return;
        }

        try {
            setIsMounting(true);
            const handle = await window.showDirectoryPicker();
            if (fileSyncService) {
                await fileSyncService.mount(handle);
                setIsMounted(true);
                toast.success('Directory mounted successfully', {
                    description: 'Study workspace is in read-only mode'
                });
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Failed to mount directory:', error);
                toast.error('Failed to mount directory');
            }
        } finally {
            setIsMounting(false);
        }
    };

    const handleScan = async () => {
        if (!fileSyncService || !isMounted) return;

        try {
            setIsScanning(true);
            const allFiles = await fileSyncService.listFiles('', true);

            const materialList: StudyMaterial[] = allFiles.map(path => {
                const name = path.split('/').pop() || path;
                const ext = name.split('.').pop()?.toLowerCase();

                let type: StudyMaterial['type'] = 'markdown';
                if (ext === 'pdf') type = 'pdf';
                else if (ext === 'json') type = 'quiz';
                else if (ext === 'md' || ext === 'markdown') type = 'markdown';

                return { path, type, name };
            }).filter(m => ['pdf', 'quiz', 'markdown'].includes(m.type));

            setMaterials(materialList);
            toast.success(`Found ${materialList.length} study materials`);
        } catch (error) {
            console.error('Scan failed:', error);
            toast.error('Failed to scan directory');
        } finally {
            setIsScanning(false);
        }
    };

    const handleImportAll = async () => {
        if (!fileSyncService || !isMounted) return;

        try {
            setIsImporting(true);
            // Type guard for StudyFileSyncService
            const studyService = fileSyncService as StudyFileSyncServiceType;
            const result = await studyService.importStudyMaterials('');
            setImportResult(result);

            if (result.success) {
                toast.success('Import completed', {
                    description: `${result.quizzesImported} quizzes, ${result.pdfsFound} PDFs found`
                });
            } else {
                toast.error('Import completed with errors', {
                    description: `${result.errors.length} files failed to import`
                });
            }
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Import failed');
        } finally {
            setIsImporting(false);
        }
    };

    const handleImportSingle = async (material: StudyMaterial) => {
        if (!fileSyncService) return;

        try {
            if (material.type === 'quiz') {
                // Type guard for StudyFileSyncService
                const studyService = fileSyncService as StudyFileSyncServiceType;
                const quiz = await studyService.importQuizJSON(material.path);
                if (quiz) {
                    toast.success(`Quiz imported: ${quiz.title}`, {
                        description: `${quiz.questions.length} questions`
                    });
                } else {
                    toast.error('Failed to import quiz', {
                        description: material.name
                    });
                }
            } else if (material.type === 'pdf') {
                toast.info('PDF found', {
                    description: 'Ready for flashcard generation'
                });
            }
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Failed to import file');
        }
    };

    const getMaterialIcon = (type: StudyMaterial['type']) => {
        switch (type) {
            case 'pdf':
                return <BookOpen className="w-4 h-4 text-red-500" />;
            case 'quiz':
                return <FileText className="w-4 h-4 text-blue-500" />;
            case 'markdown':
                return <ScrollText className="w-4 h-4 text-green-500" />;
        }
    };

    const getMaterialBadge = (type: StudyMaterial['type']) => {
        switch (type) {
            case 'pdf':
                return <Badge variant="outline" className="text-xs">PDF</Badge>;
            case 'quiz':
                return <Badge variant="outline" className="text-xs">Quiz</Badge>;
            case 'markdown':
                return <Badge variant="outline" className="text-xs">MD</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('study.filePicker.title')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Mobile/Unsupported Browser Fallback */}
                    {!isSupported && (
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                File sync requires a desktop browser (Chrome, Edge, Opera). Mobile browsers are not supported.
                            </p>
                        </div>
                    )}

                    {/* Initialization Section */}
                    {isSupported && !isReady && (
                        <div className="flex flex-col items-center justify-center p-6 border rounded-lg space-y-4">
                            <FolderOpen className="w-12 h-12 text-muted-foreground" />
                            <div className="text-center">
                                <p className="font-medium mb-1">Select Directory</p>
                                <p className="text-sm text-muted-foreground">
                                    Choose a folder containing study materials (PDFs, quizzes)
                                </p>
                            </div>
                            <Button onClick={onInitialize} disabled={isInitializing}>
                                {isInitializing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isInitializing ? 'Initializing...' : 'Select Directory'}
                            </Button>
                            {error && (
                                <p className="text-xs text-destructive text-center">{error}</p>
                            )}
                        </div>
                    )}

                    {/* Mount Section */}
                    {isReady && !isMounted ? (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Mount Directory</p>
                                    <p className="text-sm text-muted-foreground">
                                        Select folder with study materials (PDFs, quizzes)
                                    </p>
                                </div>
                            </div>
                            <Button onClick={handleMount} disabled={isMounting}>
                                {isMounting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isMounting ? 'Mounting...' : 'Select Folder'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-500/10">
                            <div className="flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="font-medium">Directory Mounted (Read-Only)</p>
                                    <p className="text-sm text-muted-foreground">
                                        Study workspace cannot modify files
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-500">
                                Read-Only
                            </Badge>
                        </div>
                    )}

                    {/* Scan and Import Actions */}
                    {isMounted && (
                        <>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleScan}
                                    disabled={isScanning || isImporting}
                                >
                                    {isScanning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {isScanning ? 'Scanning...' : 'Scan Files'}
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleImportAll}
                                    disabled={isScanning || isImporting || materials.length === 0}
                                >
                                    {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {isImporting ? 'Importing...' : 'Import All'}
                                </Button>
                            </div>

                            {/* Import Result */}
                            {importResult && (
                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <p className="font-medium mb-2">Import Result</p>
                                    <div className="space-y-1 text-sm">
                                        <p>✓ {importResult.quizzesImported} quizzes imported</p>
                                        <p>📄 {importResult.pdfsFound} PDFs found</p>
                                        <p>📁 {importResult.filesProcessed} total files</p>
                                        {importResult.errors.length > 0 && (
                                            <p className="text-destructive">⚠️ {importResult.errors.length} errors</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* File List */}
                            {materials.length > 0 && (
                                <div className="space-y-2">
                                    <p className="font-medium text-sm">
                                        Study Materials ({materials.length})
                                    </p>
                                    <div className="max-h-64 overflow-y-auto space-y-1">
                                        {materials.map((material, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    {getMaterialIcon(material.type)}
                                                    <span className="text-sm truncate">{material.name}</span>
                                                    {getMaterialBadge(material.type)}
                                                </div>
                                                {material.type === 'quiz' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="px-2"
                                                        onClick={() => handleImportSingle(material)}
                                                    >
                                                        Import
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
