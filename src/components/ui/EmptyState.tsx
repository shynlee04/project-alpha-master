/**
 * Empty State Component
 * @module components/ui/EmptyState
 *
 * Generic empty state display component with 8-bit design system.
 * Supports different empty states and actions.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { FileX, FolderOpen, Search, Plus, RefreshCw } from 'lucide-react'

/**
 * Empty state variant
 */
export type EmptyVariant = 'default' | 'no-files' | 'no-results' | 'no-projects'

/**
 * Empty action type
 */
export type EmptyAction = 'create' | 'refresh' | 'browse'

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
    /** Empty state message */
    message?: string
    /** Empty state title */
    title?: string
    /** Empty state variant for styling */
    variant?: EmptyVariant
    /** Action to provide */
    action?: EmptyAction
    /** Callback when action is clicked */
    onAction?: () => void
    /** Icon to display */
    icon?: React.ReactNode
    /** Additional CSS classes */
    className?: string
}

/**
 * CVA variants for empty state
 */
const emptyStateVariants = cva(
    [
        'base',
        'variant',
    ],
    {
        base: [
            'flex flex-col items-center justify-center p-8',
            'transition-all duration-200',
        ],
        variants: {
            variant: {
                default: 'bg-card border-border',
                'no-files': 'bg-card border-border',
                'no-results': 'bg-card border-border',
                'no-projects': 'bg-card border-border',
            },
        },
    }
)

/**
 * Empty State Component
 *
 * Displays empty states with optional actions.
 * Supports multiple variants for different contexts.
 *
 * @example
 * <EmptyState
 *   title="No files found"
 *   message="This directory is empty"
 *   action="create"
 *   onAction={() => createFile()}
 * />
 */
export function EmptyState({
    message,
    title,
    variant = 'default',
    action,
    onAction,
    icon,
    className,
}: EmptyStateProps) {
    const { t } = useTranslation()

    const emptyTitle = title || t('empty.title', 'Nothing here')
    const emptyMessage = message || t('empty.defaultMessage', 'No items to display')

    // Get icon based on variant
    const getDefaultIcon = () => {
        switch (variant) {
            case 'no-files':
                return <FolderOpen className="w-12 h-12 text-muted-foreground" />
            case 'no-results':
                return <Search className="w-12 h-12 text-muted-foreground" />
            case 'no-projects':
                return <FileX className="w-12 h-12 text-muted-foreground" />
            default:
                return null
        }
    }

    // Get action icon and text
    const getActionIcon = () => {
        switch (action) {
            case 'create':
                return <Plus className="w-4 h-4" />
            case 'refresh':
                return <RefreshCw className="w-4 h-4" />
            case 'browse':
                return <Search className="w-4 h-4" />
            default:
                return null
        }
    }

    const getActionText = () => {
        switch (action) {
            case 'create':
                return t('empty.create', 'Create')
            case 'refresh':
                return t('empty.refresh', 'Refresh')
            case 'browse':
                return t('empty.browse', 'Browse')
            default:
                return null
        }
    }

    const handleAction = () => {
        if (onAction) {
            onAction()
        }
    }

    return (
        <div className={cn(emptyStateVariants({ variant }), className)}>
            {/* Icon */}
            <div className="mb-4">
                {icon || getDefaultIcon()}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-2 text-center">
                {emptyTitle}
            </h2>

            {/* Message */}
            <p className="text-sm text-center max-w-md text-muted-foreground">
                {emptyMessage}
            </p>

            {/* Action Button */}
            {action && onAction && (
                <button
                    onClick={handleAction}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-md mt-4',
                        'bg-primary text-primary-foreground',
                        'hover:bg-primary/90 transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    type="button"
                >
                    {getActionIcon()}
                    <span>{getActionText()}</span>
                </button>
            )}
        </div>
    )
}

export default EmptyState
