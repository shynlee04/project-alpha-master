/**
 * Permission Legend Component
 *
 * Legend and security info for workspace permissions.
 *
 * @layer Presentation
 * @component PermissionLegend
 * @parent WorkspaceToolPermissionsConfig
 *
 * December 2025 Patterns:
 * - Single responsibility (legend + info only)
 * - Accessible (semantic structure)
 * - User education (security context)
 */

import { Check, X, Shield } from 'lucide-react'

/**
 * Permission Legend Component
 *
 * Explains permission states with icons and security notice.
 * Provides context for workspace-specific tool permissions.
 */
export function PermissionLegend() {
    return (
        <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Tool can execute in workspace</span>
                </div>
                <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-destructive" />
                    <span>Tool blocked in workspace</span>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-info/10 border border-info/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-info mt-0.5" />
                    <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-sm">Security Notice</h4>
                        <p className="text-xs text-muted-foreground">
                            Disabling tools in specific workspaces enforces security boundaries.
                            For example, you may want to disable file writing in the Knowledge
                            workspace to prevent accidental modifications during research.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
