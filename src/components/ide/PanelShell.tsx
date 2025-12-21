import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Maximize2, Minimize2, X, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * PanelShell - Wrapper for IDE panels with VIA-GENT styling
 * 
 * Features:
 * - 8-bit pixel aesthetic header
 * - Fullscreen toggle support
 * - Minimize/maximize controls
 * - Consistent border styling
 */

interface PanelShellProps {
    title: string
    icon?: React.ReactNode
    children: React.ReactNode
    className?: string
    headerClassName?: string
    actions?: React.ReactNode
    showControls?: boolean
    onClose?: () => void
    onMinimize?: () => void
    isMinimized?: boolean
    isFullscreen?: boolean
    onToggleFullscreen?: () => void
}

export function PanelShell({
    title,
    icon,
    children,
    className,
    headerClassName,
    actions,
    showControls = false,
    onClose,
    onMinimize,
    isMinimized = false,
    isFullscreen = false,
    onToggleFullscreen
}: PanelShellProps) {
    return (
        <div
            className={cn(
                "flex flex-col bg-card border border-border rounded-none overflow-hidden",
                isFullscreen && "fixed inset-0 z-50",
                className
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "flex items-center h-9 px-3 bg-secondary/50 border-b border-border shrink-0",
                    headerClassName
                )}
            >
                {/* Title section */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {icon && (
                        <span className="text-primary shrink-0">
                            {icon}
                        </span>
                    )}
                    <span className="text-xs font-pixel uppercase tracking-wider text-muted-foreground truncate">
                        {title}
                    </span>
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center gap-1 mr-2">
                        {actions}
                    </div>
                )}

                {/* Window controls */}
                {showControls && (
                    <div className="flex items-center gap-0.5">
                        {onMinimize && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onMinimize}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            >
                                <Minus className="w-3 h-3" />
                            </Button>
                        )}
                        {onToggleFullscreen && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onToggleFullscreen}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-3 h-3" />
                                ) : (
                                    <Maximize2 className="w-3 h-3" />
                                )}
                            </Button>
                        )}
                        {onClose && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onClose}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            )}
        </div>
    )
}

/**
 * SimplePanelHeader - Just a header bar without the shell
 * Use for existing panels that need consistent header styling
 */
export function SimplePanelHeader({
    title,
    icon,
    actions,
    className
}: {
    title: string
    icon?: React.ReactNode
    actions?: React.ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                "flex items-center h-9 px-3 bg-secondary/50 border-b border-border shrink-0",
                className
            )}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {icon && (
                    <span className="text-primary shrink-0">
                        {icon}
                    </span>
                )}
                <span className="text-xs font-pixel uppercase tracking-wider text-muted-foreground truncate">
                    {title}
                </span>
            </div>
            {actions && (
                <div className="flex items-center gap-1">
                    {actions}
                </div>
            )}
        </div>
    )
}
