/**
 * @fileoverview Project Files Panel for Notes Workspace
 * @module presentation/components/notes/ProjectFilesPanel
 * @story S-007
 */
import { useState } from 'react';
import { FileTree } from '@/presentation/components/ide/FileTree/FileTree';
import { useNoteStore } from '@/lib/notes/note-store';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Import, Loader2 } from 'lucide-react';
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import { Button } from '@/presentation/components/ui/button';

export function ProjectFilesPanel() {
    const { createNote, setActiveNote } = useNoteStore();
    const { t } = useTranslation();
    const { directoryHandle, openFolder } = useWorkspaceSync();
    const [isImporting, setIsImporting] = useState(false);

    const handleFileSelect = async (_path: string, handle: FileSystemFileHandle) => {
        // Only process if it's a file we can read
        if (handle.kind !== 'file') return;
        if (isImporting) return;

        try {
            setIsImporting(true);
            const file = await handle.getFile();
            // Basic text check - sophisticated MIME check can be added later
            // For now, assume if it opens as text it is text

            let text = '';
            try {
                text = await file.text();
            } catch (e) {
                toast.error(t('notes.import_error_binary', 'Cannot import binary file'));
                return;
            }

            // Create note from file
            const noteId = await createNote({
                title: file.name,
                emoji: '📄',
                // Todo: better block conversion - create a simple paragraph block for now
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

    const handleOpenFolder = async () => {
        try {
            await openFolder();
        } catch (err) {
            // User cancelled or error
            console.log('Folder selection cancelled or failed', err);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
                <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                    {isImporting ? <Loader2 size={12} className="animate-spin" /> : <Import size={12} />}
                    {isImporting ? 'Importing...' : 'Import from Project'}
                </p>
                {!directoryHandle && (
                    <Button variant="ghost" size="sm" onClick={handleOpenFolder} className="h-6 text-xs px-2">
                        Open Folder
                    </Button>
                )}
            </div>
            <div className={`flex-1 overflow-hidden relative ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
                <FileTree
                    onFileSelect={handleFileSelect}
                    className="h-full"
                />
            </div>
        </div>
    );
}
