/**
 * @fileoverview Permission Overlay Component
 * @module components/layout/PermissionOverlay
 *
 * Displays an overlay prompting the user to restore file system access.
 * Shown when permission state is 'prompt'.
 * Extracted from IDELayout.tsx for code organization.
 *
 * ARCH-04-03: Updated to integrate with ProjectContextProvider
 * - Changed from projectMetadata prop to projectId/projectName
 * - New onPermissionGranted callback for FSA handle
 * - New onCancel callback for navigation
 * - Fixed 8-bit design compliance violations
 * - Backward compatible with legacy usage (IDELayoutMain, MobileIDELayout)
 */

// Legacy interface for backward compatibility (used by IDELayoutMain, MobileIDELayout)
interface PermissionOverlayLegacyProps {
    /** Project metadata (legacy - use projectId instead) */
    projectMetadata: {
        id?: string;
        name?: string;
    } | null;
    /** Callback to restore file system access (legacy) */
    onRestoreAccess: () => void;
    /** Callback to open a new folder (legacy) */
    onOpenFolder?: () => void;
}

// New interface for ProjectContextProvider integration
interface PermissionOverlayNewProps {
    /** Project ID for reference */
    projectId?: string;
    /** Project name for display */
    projectName?: string;
    /** Callback when permission is granted with FSA handle */
    onPermissionGranted: (handle: FileSystemDirectoryHandle) => void | Promise<void>;
    /** Callback when user cancels permission prompt */
    onCancel: () => void;
}

type PermissionOverlayProps = PermissionOverlayLegacyProps | PermissionOverlayNewProps;

/**
 * Overlay shown when file system permission needs to be granted.
 *
 * ARCH-04-03: Updated for ProjectContextProvider integration
 * - Backward compatible with legacy (onRestoreAccess/onOpenFolder)
 * - New interface for ProjectContextProvider (onPermissionGranted/onCancel)
 * - Uses projectId and projectName when available
 * - Calls showDirectoryPicker() to get FSA handle
 * - Passes handle to onPermissionGranted callback
 */
export function PermissionOverlay(props: PermissionOverlayProps): React.JSX.Element {
    // Determine if using legacy or new props
    const isLegacy = 'projectMetadata' in props;
    const isNew = 'onPermissionGranted' in props;

    // Extract values from either interface
    const projectName = isLegacy
        ? (props as PermissionOverlayLegacyProps).projectMetadata?.name
        : (props as PermissionOverlayNewProps).projectName;

    const handleClick = async () => {
        try {
            // Show directory picker to get FSA handle
            const handle = await window.showDirectoryPicker();

            // Call appropriate callback
            if (isNew) {
                await (props as PermissionOverlayNewProps).onPermissionGranted(handle);
            } else if (isLegacy) {
                (props as PermissionOverlayLegacyProps).onRestoreAccess();
            }
        } catch (error) {
            console.error('Permission denied or cancelled:', error);

            // For new interface, call onCancel on user cancel
            if (isNew && 'onCancel' in props) {
                (props as PermissionOverlayNewProps).onCancel();
            }
        }
    };

    return (
        <div className="absolute inset-0 bg-background z-50 flex items-center justify-center">
            <div className="bg-card p-8 rounded-none text-center max-w-md border border-border shadow-pixel">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {/* Lock icon for permission prompt */}
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    {isLegacy ? 'Permission Required' : 'Permission Required'}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                    {isLegacy
                        ? 'Click below to restore access to your project folder.'
                        : 'Click below to grant access to your project folder.'}
                    {projectName && (
                        <span className="block mt-1 text-foreground font-medium">
                            {projectName}
                        </span>
                    )}
                </p>
                <button
                    onClick={handleClick}
                    className="min-h-[44px] px-6 py-3 bg-primary hover:brightness-110 text-primary-foreground rounded-none font-medium transition-colors"
                >
                    {isLegacy ? 'Restore Access' : 'Grant Permission'}
                </button>
            </div>
        </div>
    );
}
