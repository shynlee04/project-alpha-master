/**
 * File Permission Row Component
 *
 * Single row in workspace file permission configuration.
 * Shows workspace icon, mount status, and access level selector.
 *
 * @layer Presentation
 * @component FilePermissionRow
 * @parent WorkspacePermissionEditor
 *
 * December 2025 Patterns:
 * - Single responsibility (single workspace row only)
 * - Accessible (proper ARIA labels)
 * - Composable (uses select component)
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/presentation/components/ui/select';
import { FolderOpen, FolderClosed } from 'lucide-react';
import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types';
import type {
    WorkspaceFilePermission,
    FileAccessLevel,
} from './types';

interface FilePermissionRowProps {
    /** File permission configuration for this workspace */
    permission: WorkspaceFilePermission;
    /** Workspace display metadata */
    workspaceLabel: string;
    /** Workspace description */
    workspaceDescription: string;
    /** Workspace icon/emoji */
    workspaceIcon: string;
    /** Callback when access level changes */
    onAccessLevelChange: (workspace: WorkspaceType, level: FileAccessLevel) => void;
    /** Callback when mount button clicked */
    onMount?: (workspace: WorkspaceType) => void;
    /** Callback when unmount button clicked */
    onUnmount?: (workspace: WorkspaceType) => void;
}

/**
 * File Permission Row Component
 *
 * Displays workspace file permission configuration with:
 * - Workspace icon and label
 * - Mount status badge
 * - Access level selector (none/read-only/read-write)
 * - Mount/unmount buttons (if handlers provided)
 */
export function FilePermissionRow({
    permission,
    workspaceLabel,
    workspaceDescription,
    workspaceIcon,
    onAccessLevelChange,
    onMount,
    onUnmount,
}: FilePermissionRowProps) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            {/* Workspace Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl" role="img" aria-label={workspaceLabel}>
                    {workspaceIcon}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{workspaceLabel}</div>
                    <div className="text-xs text-muted-foreground truncate">
                        {workspaceDescription}
                    </div>
                </div>
            </div>

            {/* Mount Status */}
            <div className="flex items-center gap-2">
                {permission.mounted ? (
                    <Badge variant="outline" className="bg-green-500/10 text-success border-green-500/20">
                        <FolderOpen className="w-3 h-3 mr-1" />
                        Mounted
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-muted">
                        <FolderClosed className="w-3 h-3 mr-1" />
                        Not Mounted
                    </Badge>
                )}

                {/* Mount/Unmount Buttons */}
                {permission.mounted && onUnmount ? (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUnmount(permission.workspace)}
                        aria-label={`Unmount ${workspaceLabel}`}
                    >
                        Unmount
                    </Button>
                ) : !permission.mounted && onMount ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMount(permission.workspace)}
                        aria-label={`Mount ${workspaceLabel}`}
                    >
                        Mount
                    </Button>
                ) : null}
            </div>

            {/* Access Level Selector */}
            <div className="ml-4">
                <Select
                    value={permission.accessLevel}
                    onValueChange={(value) =>
                        onAccessLevelChange(
                            permission.workspace,
                            value as FileAccessLevel
                        )
                    }
                >
                    <SelectTrigger className="w-32" aria-label={`Access level for ${workspaceLabel}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">No Access</SelectItem>
                        <SelectItem value="read-only">Read Only</SelectItem>
                        <SelectItem value="read-write">Read/Write</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
