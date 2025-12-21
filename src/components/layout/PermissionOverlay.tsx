/**
 * @fileoverview Permission Overlay Component
 * @module components/layout/PermissionOverlay
 *
 * Displays an overlay prompting the user to restore file system access.
 * Shown when permission state is 'prompt'.
 * Extracted from IDELayout.tsx for code organization.
 */

import type { ProjectMetadata } from '../../lib/workspace';

interface PermissionOverlayProps {
    /** Project metadata for display */
    projectMetadata: ProjectMetadata | null;
    /** Callback to restore file system access */
    onRestoreAccess: () => void;
}

/**
 * Overlay shown when file system permission needs to be restored.
 * Story 13-5: Restore Access Overlay.
 */
export function PermissionOverlay({
    projectMetadata,
    onRestoreAccess,
}: PermissionOverlayProps): React.JSX.Element {
    return (
        <div className="absolute inset-0 bg-background/90 z-50 flex items-center justify-center">
            <div className="bg-card p-8 rounded-lg text-center max-w-md border border-border shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/15 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    Permission Required
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                    Click below to restore access to your project folder.
                    {projectMetadata?.name && (
                        <span className="block mt-1 text-foreground font-medium">
                            {projectMetadata.name}
                        </span>
                    )}
                </p>
                <button
                    onClick={onRestoreAccess}
                    className="px-6 py-2 bg-primary hover:brightness-110 text-primary-foreground rounded-lg font-medium transition-colors"
                >
                    Restore Access
                </button>
            </div>
        </div>
    );
}
