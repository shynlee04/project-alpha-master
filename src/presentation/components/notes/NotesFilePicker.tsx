/**
 * @fileoverview Notes File Picker Component
 * @module presentation/components/notes/NotesFilePicker
 *
 * UI component for mounting directory and syncing notes with files.
 * Shows sync status and provides controls for auto-sync.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Switch } from '@/presentation/components/ui/switch';
import { Label } from '@/presentation/components/ui/label';
import { Loader2, FolderOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotesFilePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileSyncService: {
        mount: (source: FileSystemDirectoryHandle) => Promise<void>;
        getSyncStatus: () => { syncing: boolean; lastSync: Date | null };
        sync: () => Promise<void>;
    } | null;
}

export function NotesFilePicker({ open, onOpenChange, fileSyncService }: NotesFilePickerProps) {
    // Translation hook available but not currently used
    // const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);
    const [isMounting, setIsMounting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [autoSync, setAutoSync] = useState(true);
    const [syncStatus, setSyncStatus] = useState<{ syncing: boolean; lastSync: Date | null }>({
        syncing: false,
        lastSync: null
    });

    // Update sync status periodically
    useEffect(() => {
        if (!open || !fileSyncService) return;

        const updateStatus = () => {
            if (fileSyncService) {
                setSyncStatus(fileSyncService.getSyncStatus());
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 1000);
        return () => clearInterval(interval);
    }, [open, fileSyncService]);

    const handleMount = async () => {
        try {
            setIsMounting(true);
            const handle = await window.showDirectoryPicker();
            if (fileSyncService) {
                await fileSyncService.mount(handle);
                setIsMounted(true);
                toast.success('Directory mounted successfully');
            }
        } catch (error) {
            console.error('Failed to mount directory:', error);
            toast.error('Failed to mount directory');
        } finally {
            setIsMounting(false);
        }
    };

    const handleSync = async () => {
        if (!fileSyncService) return;

        try {
            setIsSyncing(true);
            await fileSyncService.sync();
            setSyncStatus(fileSyncService.getSyncStatus());
            toast.success('Notes synced successfully');
        } catch (error) {
            console.error('Sync failed:', error);
            toast.error('Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const formatLastSync = (date: Date | null) => {
        if (!date) return 'Never';
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Notes File Sync</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Mount Section */}
                    {!isMounted ? (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Mount Directory</p>
                                    <p className="text-sm text-muted-foreground">
                                        Select a folder to sync notes as Markdown files
                                    </p>
                                </div>
                            </div>
                            <Button onClick={handleMount} disabled={isMounting}>
                                {isMounting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isMounting ? 'Mounting...' : 'Select Folder'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/10">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <div>
                                    <p className="font-medium">Directory Mounted</p>
                                    <p className="text-sm text-muted-foreground">
                                        Notes will sync automatically
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-green-500/20 text-green-500">
                                Active
                            </Badge>
                        </div>
                    )}

                    {/* Sync Controls */}
                    {isMounted && (
                        <>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Label>Auto-sync</Label>
                                        <Badge variant="outline" className="text-xs">
                                            {autoSync ? 'On' : 'Off'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Automatically sync notes when changed
                                    </p>
                                </div>
                                <Switch
                                    checked={autoSync}
                                    onCheckedChange={setAutoSync}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">Last Sync</p>
                                        {syncStatus.syncing && (
                                            <Badge variant="outline" className="text-xs">
                                                Syncing...
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {formatLastSync(syncStatus.lastSync)}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSync}
                                    disabled={isSyncing || syncStatus.syncing}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                    Sync Now
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
