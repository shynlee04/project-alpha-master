/**
 * @fileoverview Cross-Workspace File Reference Button Component
 * @module presentation/components/common/CrossWorkspaceFileReference
 *
 * UI component for displaying and interacting with cross-workspace file references.
 * Shows reference status, provides content preview, and handles broken links.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */

import { useState, useEffect } from 'react';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Link, AlertCircle, FileText, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { ResolvedReference } from '@/lib/filesync/cross-workspace-file-references';
import { getCrossWorkspaceReferenceManager } from '@/lib/filesync/cross-workspace-file-references';

interface CrossWorkspaceFileReferenceButtonProps {
    /** Reference ID to display */
    referenceId: string;
    /** Optional custom styling class */
    className?: string;
}

/**
 * Cross-Workspace File Reference Button
 *
 * Displays a clickable link to a cross-workspace file reference.
 * Shows reference status badge and provides content preview dialog.
 *
 * Features:
 * - Automatic reference resolution on mount
 * - Status badge (active/broken)
 * - Content preview dialog
 * - Broken link indication
 * - Workspace type badge
 */
export function CrossWorkspaceFileReferenceButton({
    referenceId,
    className
}: CrossWorkspaceFileReferenceButtonProps) {
    const [resolved, setResolved] = useState<ResolvedReference | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);

    const referenceManager = getCrossWorkspaceReferenceManager();

    // Resolve reference on mount
    useEffect(() => {
        let isMounted = true;

        const resolve = async () => {
            try {
                setIsLoading(true);
                const result = await referenceManager.resolveReference(referenceId);

                if (isMounted) {
                    setResolved(result);
                }
            } catch (error) {
                console.error('[CrossWorkspaceFileReferenceButton] Failed to resolve reference:', error);
                if (isMounted) {
                    setResolved({
                        reference: referenceManager.getReference(referenceId)!,
                        exists: false,
                        brokenReason: 'not_found'
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        resolve();

        return () => {
            isMounted = false;
        };
    }, [referenceId, referenceManager]);

    const handlePreview = () => {
        if (!resolved?.exists) return;

        setShowPreview(true);
    };

    if (isLoading) {
        return (
            <div className={`flex items-center gap-2 ${className || ''}`}>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading reference...</span>
            </div>
        );
    }

    if (!resolved) {
        return (
            <div className={`flex items-center gap-2 ${className || ''}`}>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">Reference not found</span>
            </div>
        );
    }

    const reference = resolved.reference;
    const workspaceBadges: Record<string, string> = {
        ide: 'IDE',
        knowledge: 'Knowledge',
        notes: 'Notes',
        study: 'Study'
    };

    if (!resolved.exists) {
        // Broken reference
        return (
            <div className={`flex items-center gap-2 ${className || ''}`}>
                <Badge variant="destructive" className="text-xs">
                    {resolved.brokenReason === 'not_found' && 'File Not Found'}
                    {resolved.brokenReason === 'permission_denied' && 'Permission Denied'}
                    {resolved.brokenReason === 'workspace_not_mounted' && 'Workspace Not Mounted'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                    {reference.metadata?.title || reference.targetFilePath}
                </span>
            </div>
        );
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={handlePreview}
                className={`h-auto px-2 py-1 justify-start gap-2 ${className || ''}`}
            >
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm">
                    {reference.metadata?.title || reference.targetFilePath}
                </span>
                <Badge variant="outline" className="text-xs">
                    {workspaceBadges[reference.targetWorkspace]}
                </Badge>
                <Eye className="w-3 h-3 text-muted-foreground" />
            </Button>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {reference.metadata?.title || 'File Preview'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Source Workspace:</span>
                                <span className="ml-2 font-medium">
                                    {workspaceBadges[reference.sourceWorkspace]}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Target Workspace:</span>
                                <span className="ml-2 font-medium">
                                    {workspaceBadges[reference.targetWorkspace]}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Reference Type:</span>
                                <span className="ml-2 font-medium capitalize">
                                    {reference.referenceType}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">File Path:</span>
                                <span className="ml-2 font-mono text-xs truncate">
                                    {reference.targetFilePath}
                                </span>
                            </div>
                        </div>

                        {reference.metadata?.description && (
                            <div>
                                <span className="text-sm text-muted-foreground">Description:</span>
                                <p className="text-sm mt-1">{reference.metadata.description}</p>
                            </div>
                        )}

                        {/* File Content Preview */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Content Preview</span>
                                {resolved.fileMetadata && (
                                    <span className="text-xs text-muted-foreground">
                                        {resolved.fileMetadata.size} bytes
                                    </span>
                                )}
                            </div>
                            <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-64 overflow-y-auto">
                                {resolved.fileContent || 'No content available'}
                            </pre>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(resolved.fileContent || '');
                                    toast.success('Content copied to clipboard');
                                }}
                            >
                                Copy Content
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const ref = referenceManager.getReference(referenceId);
                                    toast.info(`Reference ID: ${ref?.id}`);
                                }}
                            >
                                Copy Reference ID
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

/**
 * Broken Reference Badge Component
 *
 * Displays a non-interactive badge for broken references.
 */
export function BrokenReferenceBadge({
    reason,
    className
}: {
    reason: BrokenReferenceReason;
    className?: string;
    }) {
    const reasonLabels: Record<BrokenReferenceReason, string> = {
        not_found: 'File Not Found',
        permission_denied: 'Permission Denied',
        workspace_not_mounted: 'Workspace Unavailable'
    };

    return (
        <Badge variant="destructive" className={`text-xs ${className || ''}`}>
            <AlertCircle className="w-3 h-3 mr-1 inline" />
            {reasonLabels[reason]}
        </Badge>
    );
}

/**
 * Reference Link Component
 *
 * Simplified component for displaying inline reference links.
 */
export function ReferenceLink({
    referenceId
}: {
    referenceId: string;
}) {
    const referenceManager = getCrossWorkspaceReferenceManager();
    const reference = referenceManager.getReference(referenceId);

    if (!reference) {
        return <span className="text-destructive">[Broken Reference]</span>;
    }

    return (
        <CrossWorkspaceFileReferenceButton
            referenceId={referenceId}
            className="inline-flex"
        />
    );
}