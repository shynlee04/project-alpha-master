/**
 * @fileoverview Project Files Panel for Notes Workspace
 * @module presentation/components/notes/ProjectFilesPanel
 * @story S-007, P1.5-02
 *
 * Features:
 * - Import project files as notes
 * - Preview images and PDFs directly
 * - P1.5-02: Create new files/folders via toolbar buttons
 * - File tree with context menu for CRUD operations
 * - Sync status indicators
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { FileTree } from '@/presentation/components/ide/FileTree/FileTree';
import { useNoteStore } from '@/lib/notes/note-store';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Import, Loader2, FilePlus, FolderPlus, X, FileImage, FileText, Download } from 'lucide-react';
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import { Button } from '@/presentation/components/ui/button';
import { FileOperationDialog } from '@/presentation/components/ide/FileTree/FileOperationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { Badge } from '@/presentation/components/ui/badge';

// P1.5-02: Dialog state for file/folder creation
interface CreateDialogState {
    open: boolean;
    type: 'file' | 'folder' | null;
}

/**
 * File preview dialog state
 */
interface PreviewState {
    open: boolean;
    file: File | null;
    fileType: 'image' | 'pdf' | 'other' | null;
    fileName: string;
}

/**
 * File type categories
 */
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico'];
const PDF_EXTENSIONS = ['.pdf'];

/**
 * Get file category from extension
 */
function getFileCategory(fileName: string): 'image' | 'pdf' | 'text' | 'other' {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
    if (PDF_EXTENSIONS.includes(ext)) return 'pdf';
    return 'text'; // Default to text, will fail if binary
}

/**
 * 45-02: Props for ProjectFilesPanel
 */
interface ProjectFilesPanelProps {
    /** Callback when a note is successfully imported from a file */
    onNoteImported?: (noteId: string) => void;
}

/**
 * ProjectFilesPanel - File browser for Notes workspace
 *
 * P1.5-02: Enhanced with file/folder creation toolbar
 * File preview for images and PDFs
 * 45-02: Notifies parent when note is imported for auto-switch to Notes view
 */
export function ProjectFilesPanel({ onNoteImported }: ProjectFilesPanelProps = {}) {
    const { createNote, setActiveNote } = useNoteStore();
    const { t } = useTranslation();
    const { directoryHandle, openFolder, localAdapterRef } = useWorkspaceSync();
    const [isImporting, setIsImporting] = useState(false);

    // P1.5-02: File/folder creation state
    const [createDialog, setCreateDialog] = useState<CreateDialogState>({
        open: false,
        type: null,
    });
    const [refreshKey, setRefreshKey] = useState(0);

    // File preview state
    const [preview, setPreview] = useState<PreviewState>({
        open: false,
        file: null,
        fileType: null,
        fileName: '',
    });

    /**
     * 45-01: Reload FileTree when file system context changes
     *
     * When user switches views (Files ↔ Notes ↔ AI), the directoryHandle
     * and localAdapterRef may become stale. This effect ensures the FileTree
     * reloads when the file system context is restored.
     */
    useEffect(() => {
        // Reload FileTree when directoryHandle or adapter becomes available
        if (directoryHandle || localAdapterRef.current) {
            setRefreshKey(prev => prev + 1);
        }
    }, [directoryHandle, localAdapterRef?.current]);

    /**
     * Import a file as a note (for text files)
     */
    const handleFileSelect = async (_path: string, handle: FileSystemFileHandle) => {
        if (handle.kind !== 'file') return;
        if (isImporting) return;

        try {
            setIsImporting(true);
            const file = await handle.getFile();
            const fileCategory = getFileCategory(file.name);

            // Handle image files - show preview
            if (fileCategory === 'image') {
                setPreview({
                    open: true,
                    file,
                    fileType: 'image',
                    fileName: file.name,
                });
                return;
            }

            // Handle PDF files - show preview
            if (fileCategory === 'pdf') {
                setPreview({
                    open: true,
                    file,
                    fileType: 'pdf',
                    fileName: file.name,
                });
                return;
            }

            // Handle text files - import as note
            let text = '';
            try {
                text = await file.text();
            } catch (_e) {
                // Binary file that's not image/PDF
                toast.error(`Cannot import "${file.name}" as note. Only text files can be imported.`, {
                    description: 'Images and PDFs can be previewed but not imported.',
                    action: {
                        label: 'Preview',
                        onClick: () => {
                            setPreview({
                                open: true,
                                file,
                                fileType: 'other',
                                fileName: file.name,
                            });
                        },
                    },
                });
                return;
            }

            const noteId = await createNote({
                title: file.name,
                emoji: '📄',
                blocks: [
                    {
                        id: crypto.randomUUID(),
                        type: 'paragraph',
                        content: [{ type: 'text', text, styles: {} }],
                        props: {
                            textColor: 'default',
                            backgroundColor: 'default',
                            textAlignment: 'left'
                        },
                        children: []
                    }
                ]
            });

            // 45-02: Notify parent that note was imported (triggers view switch)
            onNoteImported?.(noteId);

            setActiveNote(noteId);
            toast.success(t('notes.import_success', { name: file.name }));
        } catch (error) {
            console.error('Failed to import file:', error);
            toast.error(t('notes.import_error', 'Failed to import file'));
        } finally {
            setIsImporting(false);
        }
    };

    /**
     * Open folder picker
     */
    const handleOpenFolder = async () => {
        try {
            await openFolder();
        } catch (err) {
            console.log('Folder selection cancelled or failed', err);
        }
    };

    // P1.5-02: Open create file dialog
    const handleOpenCreateDialog = useCallback(() => {
        if (!directoryHandle) {
            toast.error(t('notes.error_no_folder', 'Please open a folder first'));
            return;
        }
        setCreateDialog({ open: true, type: 'file' });
    }, [directoryHandle, t]);

    // P1.5-02: Open create folder dialog
    const handleOpenCreateFolderDialog = useCallback(() => {
        if (!directoryHandle) {
            toast.error(t('notes.error_no_folder', 'Please open a folder first'));
            return;
        }
        setCreateDialog({ open: true, type: 'folder' });
    }, [directoryHandle, t]);

    // P1.5-02: Close create dialog
    const handleCloseCreateDialog = useCallback(() => {
        setCreateDialog({ open: false, type: null });
    }, []);

    // P1.5-02: Handle create confirm
    const handleCreateConfirm = useCallback(async (name: string) => {
        if (!directoryHandle || !createDialog.type) return;
        if (!name.trim()) return;

        const adapter = localAdapterRef?.current;
        if (!adapter) {
            toast.error('File system adapter not available');
            return;
        }

        try {
            const path = name.trim();

            if (createDialog.type === 'file') {
                await adapter.createFile(path, '');
                toast.success(t('notes.file_created', { name }));
            } else {
                await adapter.createDirectory(path);
                toast.success(t('notes.folder_created', { name }));
            }

            setRefreshKey(prev => prev + 1);
            handleCloseCreateDialog();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(t('notes.create_error', { error: errorMessage }));
        }
    }, [directoryHandle, localAdapterRef, createDialog.type, t, handleCloseCreateDialog]);

    /**
     * Close preview dialog
     */
    const handleClosePreview = useCallback(() => {
        setPreview({ open: false, file: null, fileType: null, fileName: '' });
    }, []);

    /**
     * Download file
     */
    const handleDownload = useCallback(() => {
        if (!preview.file) return;
        const url = URL.createObjectURL(preview.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = preview.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${preview.fileName}`);
    }, [preview]);

    /**
     * Get preview URL
     */
    const previewUrl = useMemo(() => {
        if (!preview.file) return '';
        return URL.createObjectURL(preview.file);
    }, [preview.file]);

    return (
        <div className="h-full flex flex-col bg-background">
            {/* P1.5-02: Enhanced header with create buttons */}
            <div className="p-2 border-b border-border bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                        {isImporting ? <Loader2 size={12} className="animate-spin" /> : <Import size={12} />}
                        {isImporting ? 'Importing...' : 'Project Files'}
                    </p>
                    {!directoryHandle && (
                        <Button variant="ghost" size="sm" onClick={handleOpenFolder} className="h-6 text-xs px-2">
                            Open Folder
                        </Button>
                    )}
                </div>

                {/* P1.5-02: Create buttons toolbar */}
                {directoryHandle && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenCreateDialog}
                            disabled={isImporting}
                            className="h-7 text-xs px-2 flex-1"
                            title={t('notes.create_file', 'Create new file')}
                        >
                            <FilePlus size={12} className="mr-1" />
                            New File
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenCreateFolderDialog}
                            disabled={isImporting}
                            className="h-7 text-xs px-2 flex-1"
                            title={t('notes.create_folder', 'Create new folder')}
                        >
                            <FolderPlus size={12} className="mr-1" />
                            New Folder
                        </Button>
                    </div>
                )}
            </div>

            {/* File tree with context menu for rename/delete */}
            <div className={`flex-1 overflow-hidden relative ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
                <FileTree
                    onFileSelect={handleFileSelect}
                    refreshKey={refreshKey}
                    className="h-full"
                />
            </div>

            {/* P1.5-02: Create file/folder dialog */}
            <FileOperationDialog
                open={createDialog.open}
                operation={createDialog.type === 'file' ? 'rename' : 'duplicate'}
                currentName=""
                onConfirm={handleCreateConfirm}
                onClose={handleCloseCreateDialog}
                existingNames={[]}
            />

            {/* File Preview Dialog */}
            <Dialog open={preview.open} onOpenChange={(open) => !open && handleClosePreview()}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-2">
                            {preview.fileType === 'image' && <FileImage className="w-5 h-5 text-blue-500" />}
                            {preview.fileType === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                            {preview.fileType === 'other' && <FileText className="w-5 h-5 text-muted-foreground" />}
                            <DialogTitle className="text-base font-medium">
                                {preview.fileName}
                            </DialogTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            {preview.fileType === 'image' && (
                                <Badge variant="outline" className="text-xs">Image Preview</Badge>
                            )}
                            {preview.fileType === 'pdf' && (
                                <Badge variant="outline" className="text-xs">PDF Preview</Badge>
                            )}
                            {preview.fileType === 'other' && (
                                <Badge variant="outline" className="text-xs">Binary File</Badge>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="h-8"
                            >
                                <Download size={14} className="mr-1" />
                                Download
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClosePreview}
                                className="h-8 w-8 p-0"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto bg-muted/30 rounded-lg min-h-[300px] flex items-center justify-center">
                        {preview.fileType === 'image' && previewUrl && (
                            <img
                                src={previewUrl}
                                alt={preview.fileName}
                                className="max-w-full max-h-[60vh] object-contain rounded"
                            />
                        )}
                        {preview.fileType === 'pdf' && previewUrl && (
                            <iframe
                                src={previewUrl}
                                title={preview.fileName}
                                className="w-full h-[60vh] rounded border-0"
                            />
                        )}
                        {preview.fileType === 'other' && (
                            <div className="text-center p-8">
                                <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-2">
                                    This is a binary file that cannot be imported as a note.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    You can download it using the button above.
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
