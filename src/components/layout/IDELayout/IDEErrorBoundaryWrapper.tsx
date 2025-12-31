/**
 * IDE Error Boundary Wrapper Component
 *
 * Reusable error boundary wrapper for sidebar panels.
 *
 * @layer Presentation
 * @component IDEErrorBoundaryWrapper
 */

import { WithErrorBoundary } from '@/components/common/ErrorBoundary';

interface IDEErrorBoundaryWrapperProps {
    panelName: string;
    children: React.ReactNode;
}

/**
 * Reusable error boundary wrapper
 */
export function IDEErrorBoundaryWrapper({ panelName, children }: IDEErrorBoundaryWrapperProps) {
    const fallback = (
        <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
                <p className="text-sm font-medium">{panelName} Error</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    The {panelName.toLowerCase()} panel encountered an error. Please refresh the page.
                </p>
            </div>
        </div>
    );

    return <WithErrorBoundary fallback={fallback}>{children}</WithErrorBoundary>;
}
