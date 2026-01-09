/**
 * @fileoverview Project Files Panel for Notes Workspace
 * @module presentation/components/notes/ProjectFilesPanel
 * @story S-007, P1.5-02
 *
 * Features:
 * - Import project files as notes
 * - P1.5-02: Create new files/folders via toolbar buttons
 * - File tree with context menu for CRUD operations
 * - Sync status indicators
 */

import { useState, useCallback } from 'react';
import { FileTree } from '@/presentation/components/ide/FileTree/FileTree';
import { useNoteStore } from '@/lib/notes/note-store';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Import, Loader2, FilePlus, FolderPlus } from 'lucide-react';
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import { Button } from '@/presentation/components/ui/button';
import { FileOperationDialog } from '@/presentation/components/ide/FileTree/FileOperationDialog';

// P1.5-02: Dialog state for file/folder creation
interface CreateDialogState {
    open: boolean;
    type: 'file' | 'folder' | null;
}

/**
 * ProjectFilesPanel - File browser for Notes workspace
 *
 * P1.5-02: Enhanced with file/folder creation toolbar
 */
export function ProjectFilesPanel() {
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

    /**
     * Import a file as a note
     */
    const handleFileSelect = async (_path: string, handle: FileSystemFileHandle) => {
        if (handle.kind !== 'file') return;
        if (isImporting) return;

        try {
            setIsImporting(true);
            const file = await handle.getFile();

            let text = '';
            try {
                text = await file.text();
            } catch (_e) {
                toast.error(t('notes.import_error_binary', 'Cannot import binary file'));
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
        </div>
    );
}
